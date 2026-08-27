import time
from fastapi import APIRouter
from app.core.config import settings
from app.schemas.detection import HealthResponse
from app.services.inference import inference_service

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Returns the backend health and ONNX model availability status."""
    is_loaded = inference_service.is_model_loaded()
    return HealthResponse(
        status="healthy" if is_loaded else "degraded",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        active_pipeline="debris",
        model_loaded=is_loaded,
        model_path=str(settings.resolved_model_path),
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    )
