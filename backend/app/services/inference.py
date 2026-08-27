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
    ValidationMetrics,
    ModelInfo,
)

try:
    import onnxruntime as ort
    ORT_AVAILABLE = True
except ImportError:
    ort = None
    ORT_AVAILABLE = False


def resolve_model_path(filename: str) -> Path:
    """Finds an ONNX model file robustly across CWD, backend directory, and project root."""
    backend_root = Path(__file__).resolve().parent.parent.parent
    project_root = backend_root.parent

    candidates = [
        backend_root / "models" / filename,
        project_root / "backend" / "models" / filename,
        Path.cwd() / "backend" / "models" / filename,
        Path.cwd() / "models" / filename,
        Path(filename),
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate.resolve()
    return (backend_root / "models" / filename).resolve()


class SonarInferenceService:
    """
    Production ONNX Runtime Inference Engine.
    Executes real deep-learning inference using trained YOLOv8n ONNX models.
    Supports SIH Marine Debris V2 and Baseline models dynamically.
    """

    def __init__(self):
        self.input_size = 640
        self.v2_model_path = resolve_model_path("marine_sonar_v2.onnx")
        self.baseline_model_path = resolve_model_path("best.onnx")

        # Default to V2 (SIH Marine Debris) if available, else fallback to baseline
        if self.v2_model_path.exists() and self.v2_model_path.is_file():
            self.active_path = self.v2_model_path
            self.model_version = "v2"
            self.model_name = "YOLOv8n-SIH-Marine-Debris-V2"
        elif self.baseline_model_path.exists() and self.baseline_model_path.is_file():
            self.active_path = self.baseline_model_path
            self.model_version = "baseline"
            self.model_name = "YOLOv8n-Sonar-MILCO-NOMBO"
        else:
            self.active_path = self.v2_model_path
            self.model_version = "v2"
            self.model_name = "YOLOv8n-SIH-Marine-Debris-V2"

        self.session: Optional[Any] = None
        self.input_name: Optional[str] = None
        self.classes: Dict[int, str] = {
            0: "ghost_net_aldfg",
            1: "anthropogenic_debris",
            2: "pipeline_hazard",
            3: "seafloor_anomaly",
        }
        self._load_session(self.active_path)

    def _load_session(self, path: Path) -> bool:
        if not ORT_AVAILABLE:
            return False
        
        # If path does not exist, try re-resolving in case working directory changed
        if not (path.exists() and path.is_file()):
            resolved = resolve_model_path(path.name)
            if resolved.exists() and resolved.is_file():
                path = resolved
            else:
                self.session = None
                return False

        try:
            opts = ort.SessionOptions()
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            self.session = ort.InferenceSession(
                str(path),
                sess_options=opts,
                providers=["CPUExecutionProvider"],
            )
            self.input_name = self.session.get_inputs()[0].name
            self.active_path = path
            self._extract_metadata()
            return True
        except Exception as e:
            print(f"[ERROR] Failed to load ONNX model at '{path}': {e}")
            self.session = None
            return False

    def _extract_metadata(self):
        """Dynamically extracts class names and task metadata from the loaded ONNX model."""
        if not self.session:
            return
        try:
            meta = self.session.get_modelmeta()
            custom_props = meta.custom_metadata_map
            if "names" in custom_props:
                raw_names = custom_props["names"]
                parsed_names = ast.literal_eval(raw_names)
                valid_classes = {}
                for k, v in parsed_names.items():
                    class_name = str(v).strip()
                    if class_name not in ["0", ""]:
                        valid_classes[int(k)] = class_name
                if valid_classes:
                    self.classes = valid_classes
        except Exception:
            pass

    def switch_model(self, version: str) -> bool:
        """Allows dynamic switching between SIH V2 and Baseline model."""
        if version == "baseline":
            target = resolve_model_path("best.onnx")
            if target.exists() and target.is_file():
                self.model_version = "baseline"
                self.model_name = "YOLOv8n-Sonar-MILCO-NOMBO"
                self.baseline_model_path = target
                return self._load_session(target)
        else:
            target = resolve_model_path("marine_sonar_v2.onnx")
            if target.exists() and target.is_file():
                self.model_version = "v2"
                self.model_name = "YOLOv8n-SIH-Marine-Debris-V2"
                self.v2_model_path = target
                return self._load_session(target)
        return False

    def is_model_loaded(self) -> bool:
        if self.session is None:
            return self._load_session(self.active_path)
        return True

    def get_available_models(self) -> List[str]:
        models = []
        if resolve_model_path("marine_sonar_v2.onnx").exists():
            models.append("marine_sonar_v2")
        if resolve_model_path("best.onnx").exists():
            models.append("baseline")
        return models

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            name=self.model_name,
            version=self.model_version,
            task="detect",
            classes=list(self.classes.values()),
            input_size=self.input_size,
            model_loaded=self.is_model_loaded(),
            model_path=str(self.active_path),
            available_models=self.get_available_models(),
            metrics=ValidationMetrics(),
        )

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

    def _postprocess_output(
        self,
        output_tensor: np.ndarray,
        ratio: float,
        pad_w: float,
        pad_h: float,
        orig_w: int,
        orig_h: int,
        confidence_threshold: float,
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

            for class_id, class_name in self.classes.items():
                if class_id >= len(class_scores):
                    continue
                score = float(class_scores[class_id])
                if score > peak_confidence:
                    peak_confidence = score

                if score >= confidence_threshold:
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
                        candidate_classes.append(class_id)

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
            class_idx = int(classes_np[idx])
            class_name = self.classes.get(class_idx, "target")
            conf_score = round(float(scores_np[idx]), 3)
            tier = "HIGH" if conf_score >= 0.70 else "MEDIUM" if conf_score >= 0.35 else "LOW"

            b = boxes_np[idx]
            detections.append(
                Detection(
                    id=f"det_{idx_num}_{uuid.uuid4().hex[:6]}",
                    type=class_name,
                    confidence=conf_score,
                    confidence_tier=tier,
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
        model_version: Optional[str] = None,
    ) -> PredictionResponse:
        """Executes real ONNX inference on image bytes with user-supplied threshold."""
        if model_version and model_version != self.model_version:
            self.switch_model(model_version)

        if not self.is_model_loaded():
            raise FileNotFoundError(
                f"Trained ONNX model is missing at '{self.active_path}'. "
                "Place 'marine_sonar_v2.onnx' or 'best.onnx' in 'backend/models/'."
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
        detections, peak_conf = self._postprocess_output(
            outputs[0],
            ratio,
            pad_w,
            pad_h,
            orig_w,
            orig_h,
            threshold,
        )

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        ghost_net_cnt = sum(1 for d in detections if d.type == "ghost_net_aldfg")
        debris_cnt = sum(1 for d in detections if d.type == "anthropogenic_debris")
        pipeline_cnt = sum(1 for d in detections if d.type == "pipeline_hazard")
        anomaly_cnt = sum(1 for d in detections if d.type == "seafloor_anomaly")
        milco_cnt = sum(1 for d in detections if d.type == "MILCO")
        nombo_cnt = sum(1 for d in detections if d.type == "NOMBO")

        highest_conf = (
            max((d.confidence for d in detections), default=peak_conf)
            if detections
            else peak_conf
        )

        scan_id = f"SCAN-{uuid.uuid4().hex[:8].upper()}"
        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        return PredictionResponse(
            scan_id=scan_id,
            filename=filename,
            model_name=self.model_name,
            model_version=self.model_version,
            image_width=orig_w,
            image_height=orig_h,
            inference_ms=elapsed_ms,
            detections=detections,
            location=Location(latitude=latitude, longitude=longitude),
            created_at=created_at,
            confidence_threshold=threshold,
            total_detections=len(detections),
            ghost_net_count=ghost_net_cnt,
            debris_count=debris_cnt,
            pipeline_count=pipeline_cnt,
            anomaly_count=anomaly_cnt,
            milco_count=milco_cnt,
            nombo_count=nombo_cnt,
            highest_confidence=highest_conf,
            status="completed",
        )


# Global inference service instance
inference_service = SonarInferenceService()
