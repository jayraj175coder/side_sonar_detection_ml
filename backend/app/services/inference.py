import ast
import io
import time
import uuid
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from PIL import Image

from app.core.config import settings
from app.schemas.detection import BoundingBox, Detection, PredictionResponse, Location

# Import onnxruntime
try:
    import onnxruntime as ort
    ORT_AVAILABLE = True
except ImportError:
    ort = None
    ORT_AVAILABLE = False


class SonarInferenceService:
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or settings.resolved_model_path
        self.classes: Dict[int, str] = {0: "MILCO", 1: "NOMBO"}
        self.input_size = settings.INPUT_SIZE
        self.session: Optional[Any] = None
        self.input_name: Optional[str] = None
        self._load_session_if_available()

    def _load_session_if_available(self) -> bool:
        if not ORT_AVAILABLE:
            return False
        if self.model_path.exists() and self.model_path.is_file():
            try:
                opts = ort.SessionOptions()
                opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                self.session = ort.InferenceSession(
                    str(self.model_path),
                    sess_options=opts,
                    providers=["CPUExecutionProvider"],
                )
                self.input_name = self.session.get_inputs()[0].name

                # Extract model metadata if available
                meta = self.session.get_modelmeta().custom_metadata_map
                if "names" in meta:
                    try:
                        raw_names = ast.literal_eval(meta["names"])
                        if isinstance(raw_names, dict):
                            self.classes = {int(k): str(v) for k, v in raw_names.items()}
                    except Exception:
                        pass

                return True
            except Exception:
                self.session = None
                return False
        self.session = None
        return False

    def is_model_loaded(self) -> bool:
        if self.session is None:
            return self._load_session_if_available()
        return True

    def get_class_names(self) -> List[str]:
        """Returns the primary target classes (MILCO, NOMBO)."""
        target_classes = [c for c in self.classes.values() if c in ["MILCO", "NOMBO"]]
        if not target_classes:
            return ["MILCO", "NOMBO"]
        return sorted(list(set(target_classes)))

    def _preprocess_image(
        self, image: Image.Image
    ) -> Tuple[np.ndarray, float, float, float, int, int]:
        """
        Preprocesses image for YOLOv8 (RGB, letterbox 640x640, normalized [0, 1]).
        Returns (preprocessed_tensor, ratio, pad_w, pad_h, orig_w, orig_h)
        """
        orig_w, orig_h = image.size
        target_size = self.input_size

        # Scaling ratio (maintaining aspect ratio)
        ratio = min(target_size / orig_w, target_size / orig_h)
        new_w = int(round(orig_w * ratio))
        new_h = int(round(orig_h * ratio))

        # Resize image
        resized_img = image.resize((new_w, new_h), Image.Resampling.BILINEAR)

        # Create padded canvas (using 114 gray standard for YOLO)
        pad_w = (target_size - new_w) / 2.0
        pad_h = (target_size - new_h) / 2.0

        canvas = Image.new("RGB", (target_size, target_size), (114, 114, 114))
        canvas.paste(resized_img, (int(pad_w), int(pad_h)))

        # Convert to float32 numpy array, normalize, and format to (1, 3, H, W)
        img_array = np.array(canvas, dtype=np.float32) / 255.0
        img_array = np.transpose(img_array, (2, 0, 1))  # HWC to CHW
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dim

        return img_array, ratio, pad_w, pad_h, orig_w, orig_h

    def _apply_nms(
        self,
        boxes: np.ndarray,
        scores: np.ndarray,
        class_ids: np.ndarray,
        iou_threshold: float,
    ) -> List[int]:
        """Standard Non-Maximum Suppression"""
        if len(boxes) == 0:
            return []

        x1 = boxes[:, 0]
        y1 = boxes[:, 1]
        x2 = boxes[:, 2]
        y2 = boxes[:, 3]

        areas = (x2 - x1) * (y2 - y1)
        order = scores.argsort()[::-1]

        keep = []
        while order.size > 0:
            i = order[0]
            keep.append(i)

            if order.size == 1:
                break

            xx1 = np.maximum(x1[i], x1[order[1:]])
            yy1 = np.maximum(y1[i], y1[order[1:]])
            xx2 = np.minimum(x2[i], x2[order[1:]])
            yy2 = np.minimum(y2[i], y2[order[1:]])

            w = np.maximum(0.0, xx2 - xx1)
            h = np.maximum(0.0, yy2 - yy1)
            inter = w * h

            ovr = inter / (areas[i] + areas[order[1:]] - inter + 1e-6)

            # Suppress boxes of the same class with high IoU
            same_class = class_ids[order[1:]] == class_ids[i]
            inds = np.where(~same_class | (ovr <= iou_threshold))[0]
            order = order[inds + 1]

        return keep

    def _postprocess_output(
        self,
        output_tensor: np.ndarray,
        ratio: float,
        pad_w: float,
        pad_h: float,
        orig_w: int,
        orig_h: int,
        confidence_threshold: float,
    ) -> List[Detection]:
        """
        Parses YOLOv8 output tensor [1, 4 + num_classes, 8400] into validated Detections.
        """
        # Squeeze batch dimension
        output = np.squeeze(output_tensor, axis=0)

        # If shape is [C, 8400], transpose to [8400, C]
        if output.shape[0] < output.shape[1]:
            output = np.transpose(output, (1, 0))

        # Number of class channels
        num_classes = output.shape[1] - 4

        candidate_boxes = []
        candidate_scores = []
        candidate_classes = []

        for row in output:
            cx, cy, w, h = row[0:4]
            class_scores = row[4 : 4 + num_classes]
            class_id = int(np.argmax(class_scores))
            max_score = float(class_scores[class_id])

            # Resolve class name
            class_name = self.classes.get(class_id, str(class_id))

            # Filter out non-target or low confidence predictions
            if max_score >= confidence_threshold:
                # If name is '0' and dataset had 0 as background or unlabelled, map or retain if valid
                if class_name not in ["MILCO", "NOMBO"]:
                    # Check if 1: MILCO, 2: NOMBO or 0: MILCO, 1: NOMBO
                    if class_id == 1 and "MILCO" in self.classes.values():
                        class_name = "MILCO"
                    elif class_id == 2 and "NOMBO" in self.classes.values():
                        class_name = "NOMBO"
                    else:
                        continue

                # Convert center-wh to xyxy in 640x640 space
                bx1 = cx - (w / 2.0)
                by1 = cy - (h / 2.0)
                bx2 = cx + (w / 2.0)
                by2 = cy + (h / 2.0)

                # Transform back to original image space
                orig_x1 = max(0.0, min(float(orig_w), (bx1 - pad_w) / ratio))
                orig_y1 = max(0.0, min(float(orig_h), (by1 - pad_h) / ratio))
                orig_x2 = max(0.0, min(float(orig_w), (bx2 - pad_w) / ratio))
                orig_y2 = max(0.0, min(float(orig_h), (by2 - pad_h) / ratio))

                if orig_x2 > orig_x1 and orig_y2 > orig_y1:
                    candidate_boxes.append([orig_x1, orig_y1, orig_x2, orig_y2])
                    candidate_scores.append(max_score)
                    candidate_classes.append(class_id)

        if not candidate_boxes:
            return []

        boxes_np = np.array(candidate_boxes, dtype=np.float32)
        scores_np = np.array(candidate_scores, dtype=np.float32)
        classes_np = np.array(candidate_classes, dtype=np.int32)

        keep_indices = self._apply_nms(
            boxes_np, scores_np, classes_np, settings.IOU_THRESHOLD
        )

        detections = []
        for idx_num, idx in enumerate(keep_indices, start=1):
            class_idx = int(classes_np[idx])
            class_name = self.classes.get(class_idx, "MILCO")
            if class_name not in ["MILCO", "NOMBO"]:
                class_name = "MILCO" if class_idx == 1 else "NOMBO"

            b = boxes_np[idx]
            detections.append(
                Detection(
                    id=f"det_{idx_num}_{uuid.uuid4().hex[:6]}",
                    type=class_name,
                    confidence=round(float(scores_np[idx]), 3),
                    bbox=BoundingBox(
                        x1=round(float(b[0]), 1),
                        y1=round(float(b[1]), 1),
                        x2=round(float(b[2]), 1),
                        y2=round(float(b[3]), 1),
                    ),
                )
            )

        return detections

    def predict(
        self,
        image_bytes: bytes,
        filename: str,
        confidence_threshold: Optional[float] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> PredictionResponse:
        """
        Executes real ONNX inference on the supplied image bytes.
        Fails cleanly if the model file is not loaded.
        """
        if not self.is_model_loaded():
            raise FileNotFoundError(
                f"Trained ONNX model is missing at '{self.model_path}'. "
                "Place 'best.onnx' in 'backend/models/' to enable live ML inference."
            )

        threshold = (
            confidence_threshold
            if confidence_threshold is not None
            else settings.CONFIDENCE_THRESHOLD
        )

        # Open and convert image
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Unsupported or corrupted image format: {str(e)}")

        start_time = time.perf_counter()

        # Preprocess
        (
            input_tensor,
            ratio,
            pad_w,
            pad_h,
            orig_w,
            orig_h,
        ) = self._preprocess_image(pil_image)

        # Forward pass
        try:
            outputs = self.session.run(None, {self.input_name: input_tensor})
        except Exception as e:
            raise RuntimeError(f"ONNX inference execution failed: {str(e)}")

        # Postprocess detections
        detections = self._postprocess_output(
            outputs[0],
            ratio,
            pad_w,
            pad_h,
            orig_w,
            orig_h,
            threshold,
        )

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        milco_count = sum(1 for d in detections if d.type == "MILCO")
        nombo_count = sum(1 for d in detections if d.type == "NOMBO")
        highest_conf = (
            max((d.confidence for d in detections), default=0.0)
            if detections
            else 0.0
        )

        scan_id = f"SCAN-{uuid.uuid4().hex[:8].upper()}"
        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        return PredictionResponse(
            scan_id=scan_id,
            filename=filename,
            image_width=orig_w,
            image_height=orig_h,
            inference_ms=elapsed_ms,
            detections=detections,
            location=Location(latitude=latitude, longitude=longitude),
            created_at=created_at,
            confidence_threshold=threshold,
            total_detections=len(detections),
            milco_count=milco_count,
            nombo_count=nombo_count,
            highest_confidence=highest_conf,
            status="completed",
        )


# Global inference service instance
inference_service = SonarInferenceService()
