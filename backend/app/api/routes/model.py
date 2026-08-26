from fastapi import APIRouter
from app.core.config import settings
from app.schemas.detection import ModelInfo, ValidationMetrics
from app.services.inference import inference_service

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("", response_model=ModelInfo)
def get_model_info() -> ModelInfo:
    """Returns model architecture, class definitions, and baseline validation metrics."""
    return ModelInfo(
        model_name="YOLOv8n-Sonar-MILCO-NOMBO",
        format="ONNX Runtime",
        classes=settings.CLASSES,
        image_size=settings.INPUT_SIZE,
        model_loaded=inference_service.is_model_loaded(),
        model_path=str(settings.resolved_model_path),
        validation_metrics=ValidationMetrics(),
    )
