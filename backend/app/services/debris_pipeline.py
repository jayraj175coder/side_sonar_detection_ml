import ast
import io
import time
import uuid
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from PIL import Image

from app.core.config import settings
from app.schemas.detection import (
    BoundingBox,
    Detection,
    PredictionResponse,
    Location,
)
from app.services.clutter_filter import clutter_filter, AcousticClutterFilter
from app.datasets.catalog import SIH_TARGET_CLASSES

try:
    import onnxruntime as ort
    ORT_AVAILABLE = True
except ImportError:
    ort = None
    ORT_AVAILABLE = False


class MarineDebrisInferencePipeline:
    """
    SIH-Aligned Marine Debris & Underwater Anomaly Detection Pipeline.
    Evaluates Side-Scan Sonar (SSS) imagery for anthropogenic debris, derelict fishing gear,
    and man-made structures with modular acoustic clutter and false-positive filtering.
    """

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or settings.resolved_model_path
        self.target_classes = SIH_TARGET_CLASSES
        self.input_size = settings.INPUT_SIZE
        self.session: Optional[Any] = None
        self.input_name: Optional[str] = None
        self.clutter_filter = clutter_filter
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
        return list(self.target_classes.values())

    def _preprocess_image(
        self, image: Image.Image
    ) -> Tuple[np.ndarray, float, float, float, int, int]:
        orig_w, orig_h = image.size
        target_size = self.input_size

        ratio = min(target_size / orig_w, target_size / orig_h)
        new_w = int(round(orig_w * ratio))
        new_h = int(round(orig_h * ratio))

        resized_img = image.resize((new_w, new_h), Image.Resampling.BILINEAR)

        pad_w = (target_size - new_w) / 2.0
        pad_h = (target_size - new_h) / 2.0

        canvas = Image.new("RGB", (target_size, target_size), (114, 114, 114))
        canvas.paste(resized_img, (int(pad_w), int(pad_h)))

        img_array = np.array(canvas, dtype=np.float32) / 255.0
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0)

        return img_array, ratio, pad_w, pad_h, orig_w, orig_h

    def _apply_nms(
        self,
        boxes: np.ndarray,
        scores: np.ndarray,
        class_ids: np.ndarray,
        iou_threshold: float,
    ) -> List[int]:
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

            xx1 = np.maximum(x1[i], x1[order[1:]])
            yy1 = np.maximum(y1[i], y1[order[1:]])
            xx2 = np.minimum(x2[i], x2[order[1:]])
            yy2 = np.minimum(y2[i], y2[order[1:]])

            w = np.maximum(0.0, xx2 - xx1)
            h = np.maximum(0.0, yy2 - yy1)
            inter = w * h

            ovr = inter / (areas[i] + areas[order[1:]] - inter + 1e-6)

            inds = np.where(ovr <= iou_threshold)[0]
            order = order[inds + 1]

        return keep

    def _postprocess_raw(
        self,
        output_tensor: np.ndarray,
        ratio: float,
        pad_w: float,
        pad_h: float,
        orig_w: int,
        orig_h: int,
        min_threshold: float = 0.01,
    ) -> Tuple[List[Detection], float]:
        output = np.squeeze(output_tensor, axis=0)
        if output.shape[0] < output.shape[1]:
            output = np.transpose(output, (1, 0))

        num_classes = output.shape[1] - 4

        candidate_boxes = []
        candidate_scores = []
        candidate_classes = []
        peak_confidence = 0.0

        for row in output:
            cx, cy, w, h = row[0:4]
            class_scores = row[4 : 4 + num_classes]

            for class_idx in range(num_classes):
                score = float(class_scores[class_idx])
                if score > peak_confidence:
                    peak_confidence = score

                if score >= min_threshold:
                    bx1 = cx - (w / 2.0)
                    by1 = cy - (h / 2.0)
                    bx2 = cx + (w / 2.0)
                    by2 = cy + (h / 2.0)

                    orig_x1 = max(0.0, min(float(orig_w), (bx1 - pad_w) / ratio))
                    orig_y1 = max(0.0, min(float(orig_h), (by1 - pad_h) / ratio))
                    orig_x2 = max(0.0, min(float(orig_w), (bx2 - pad_w) / ratio))
                    orig_y2 = max(0.0, min(float(orig_h), (by2 - pad_h) / ratio))

                    if orig_x2 > orig_x1 and orig_y2 > orig_y1:
                        candidate_boxes.append([orig_x1, orig_y1, orig_x2, orig_y2])
                        candidate_scores.append(score)
                        candidate_classes.append(class_idx)

        if not candidate_boxes:
            return [], round(peak_confidence, 3)

        boxes_np = np.array(candidate_boxes, dtype=np.float32)
        scores_np = np.array(candidate_scores, dtype=np.float32)
        classes_np = np.array(candidate_classes, dtype=np.int32)

        keep_indices = self._apply_nms(
            boxes_np, scores_np, classes_np, settings.IOU_THRESHOLD
        )

        detections = []
        for idx_num, idx in enumerate(keep_indices, start=1):
            c_idx = int(classes_np[idx])
            # Map index to SIH taxonomy
            if c_idx in self.target_classes:
                class_name = self.target_classes[c_idx]
            elif c_idx == 1:
                class_name = "anthropogenic_debris"
            elif c_idx == 2:
                class_name = "derelict_fishing_gear"
            else:
                class_name = "potential_anomaly"

            b = boxes_np[idx]
            detections.append(
                Detection(
                    id=f"debris_{idx_num}_{uuid.uuid4().hex[:6]}",
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

        return detections, round(peak_confidence, 3)

    def predict(
        self,
        image_bytes: bytes,
        filename: str,
        confidence_threshold: Optional[float] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> PredictionResponse:
        """
        Executes the SIH Marine Debris pipeline with modular acoustic clutter rejection.
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

        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Unsupported or corrupted image format: {str(e)}")

        start_time = time.perf_counter()

        # 1. Preprocess
        (
            input_tensor,
            ratio,
            pad_w,
            pad_h,
            orig_w,
            orig_h,
        ) = self._preprocess_image(pil_image)

        # 2. Forward pass
        try:
            outputs = self.session.run(None, {self.input_name: input_tensor})
        except Exception as e:
            raise RuntimeError(f"ONNX inference execution failed: {str(e)}")

        # 3. Postprocess raw bounding boxes
        raw_detections, raw_peak_conf = self._postprocess_raw(
            outputs[0],
            ratio,
            pad_w,
            pad_h,
            orig_w,
            orig_h,
            min_threshold=0.01,
        )

        # 4. Apply Modular Acoustic Clutter & False-Positive Filter Layer
        clutter_result = self.clutter_filter.filter_detections(
            raw_detections,
            orig_w,
            orig_h,
            confidence_threshold=threshold,
        )

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        debris_count = sum(1 for d in clutter_result.detections if d.type == "anthropogenic_debris")
        fishing_gear_count = sum(1 for d in clutter_result.detections if d.type == "derelict_fishing_gear")
        structure_count = sum(1 for d in clutter_result.detections if d.type == "anthropogenic_structure")
        anomaly_count = sum(1 for d in clutter_result.detections if d.type == "potential_anomaly" or getattr(d, 'is_anomaly', False))

        highest_conf = (
            max((d.confidence for d in clutter_result.detections), default=raw_peak_conf)
            if clutter_result.detections
            else raw_peak_conf
        )

        scan_id = f"SCAN-SIH-{uuid.uuid4().hex[:8].upper()}"
        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        return PredictionResponse(
            scan_id=scan_id,
            filename=filename,
            image_width=orig_w,
            image_height=orig_h,
            inference_ms=elapsed_ms,
            detections=clutter_result.detections,
            location=Location(latitude=latitude, longitude=longitude),
            created_at=created_at,
            confidence_threshold=threshold,
            total_detections=len(clutter_result.detections),
            milco_count=0,
            nombo_count=0,
            debris_count=debris_count,
            fishing_gear_count=fishing_gear_count,
            structure_count=structure_count,
            anomaly_count=anomaly_count,
            highest_confidence=highest_conf,
            pipeline="debris",
            clutter_filtered_count=clutter_result.clutter_rejected_count,
            verification_status="ai_candidate",
            status="completed",
        )


# Global marine debris pipeline instance
marine_debris_pipeline = MarineDebrisInferencePipeline()
