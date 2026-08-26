from app.api.routes.health import router as health_router
from app.api.routes.model import router as model_router
from app.api.routes.predict import router as predict_router
from app.api.routes.scans import router as scans_router

__all__ = ["health_router", "model_router", "predict_router", "scans_router"]
