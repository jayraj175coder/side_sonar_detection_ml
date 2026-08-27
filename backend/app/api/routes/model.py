from fastapi import APIRouter
from app.core.config import settings
from app.schemas.detection import ModelInfo, ValidationMetrics, DebrisValidationMetrics
from app.services.inference import inference_service
from app.services.debris_pipeline import marine_debris_pipeline
from app.datasets.catalog import OPEN_SONAR_DATASETS, GHOST_NET_RESEARCH_STATUS, SIH_TARGET_CLASSES

router = APIRouter(tags=["Model & Datasets"])


@router.get("/model", response_model=ModelInfo)
def get_model_info() -> ModelInfo:
    """Returns model architecture, dual-pipeline specs, and empirical validation benchmarks."""
    return ModelInfo(
        model_name="YOLOv8n-Sonar-MarineDebris-Anomaly",
        active_pipeline="debris",
        format="ONNX Runtime (FP32)",
        classes=list(SIH_TARGET_CLASSES.values()),
        image_size=settings.INPUT_SIZE,
        model_loaded=marine_debris_pipeline.is_model_loaded() or inference_service.is_model_loaded(),
        model_path=str(settings.resolved_model_path),
        baseline_metrics=ValidationMetrics(),
        debris_metrics=DebrisValidationMetrics(),
    )


@router.get("/datasets")
def get_datasets_catalog():
    """Returns the OpenSonarDatasets SSS catalog, target taxonomy mapping, and ghost-net roadmap."""
    return {
        "catalog_source": "OpenSonarDatasets (REMARO Network) & Curated SSS Benchmarks",
        "target_taxonomy": SIH_TARGET_CLASSES,
        "datasets": OPEN_SONAR_DATASETS,
        "ghost_net_research_status": GHOST_NET_RESEARCH_STATUS,
    }
