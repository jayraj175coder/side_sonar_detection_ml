from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.schemas.detection import PredictionResponse
from app.services.inference import inference_service
from app.services.debris_pipeline import marine_debris_pipeline
from app.storage.repository import scan_repository

router = APIRouter(prefix="/predict", tags=["Inference"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "application/octet-stream",
}


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_sonar_scan(
    file: UploadFile = File(..., description="Side-scan sonar image (JPG, PNG, WebP, TIFF)"),
    confidence: Optional[float] = Form(
        None, ge=0.01, le=1.0, description="Detection confidence threshold (0.01 - 1.0)"
    ),
    latitude: Optional[float] = Form(
        None, ge=-90.0, le=90.0, description="Geographic latitude coordinate (WGS84)"
    ),
    longitude: Optional[float] = Form(
        None, ge=-180.0, le=180.0, description="Geographic longitude coordinate (WGS84)"
    ),
    pipeline: Optional[str] = Form(
        "debris", description="Inference pipeline: 'debris' (SIH Marine Debris & Clutter Filter) or 'baseline' (MILCO/NOMBO)"
    ),
) -> PredictionResponse:
    """
    Executes AI-assisted sonar detection with modular acoustic clutter and false-positive filtering.
    Supports dual pipelines:
      - 'debris': SIH Marine Debris, Derelict Fishing Gear & Underwater Anomaly Pipeline
      - 'baseline': Baseline YOLOv8n Sonar Anomaly Pipeline (MILCO / NOMBO)
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No sonar image file provided.",
        )

    # Read binary payload
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    selected_pipeline = (pipeline or "debris").lower().strip()

    try:
        if selected_pipeline == "baseline":
            prediction = inference_service.predict(
                image_bytes=contents,
                filename=file.filename,
                confidence_threshold=confidence,
                latitude=latitude,
                longitude=longitude,
            )
        else:
            prediction = marine_debris_pipeline.predict(
                image_bytes=contents,
                filename=file.filename,
                confidence_threshold=confidence,
                latitude=latitude,
                longitude=longitude,
            )
    except FileNotFoundError as fnf_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(fnf_err),
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(exc)}",
        )

    # Persist scan to repository
    scan_repository.save(prediction)

    return prediction
