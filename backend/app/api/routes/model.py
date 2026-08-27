from fastapi import APIRouter
from app.schemas.detection import ModelInfo
from app.services.inference import inference_service
from app.datasets.catalog import OPEN_SONAR_DATASETS, MARINE_SONAR_V2_PLANNED_CLASSES

router = APIRouter(tags=["Model & Datasets"])


@router.get("/model", response_model=ModelInfo)
def get_model_info() -> ModelInfo:
    """Returns dynamic model architecture, active classes, and baseline validation metrics."""
    return inference_service.get_model_info()


@router.get("/datasets")
def get_datasets_catalog():
    """Returns the OpenSonarDatasets SSS catalog, target taxonomy mapping, and V2 specifications."""
    return {
        "catalog_source": "OpenSonarDatasets (REMARO Network) & Verified SSS Benchmarks",
        "current_baseline_classes": list(inference_service.classes.values()),
        "v2_planned_classes": MARINE_SONAR_V2_PLANNED_CLASSES,
        "datasets": OPEN_SONAR_DATASETS,
    }
