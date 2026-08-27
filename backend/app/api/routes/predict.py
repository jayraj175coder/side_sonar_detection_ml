from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.schemas.detection import PredictionResponse
from app.services.inference import inference_service
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
        None, ge=0.01, le=1.0, description="Model confidence cutoff threshold (0.01 - 1.0)"
    ),
    latitude: Optional[float] = Form(
        None, ge=-90.0, le=90.0, description="Geographic latitude coordinate (WGS84)"
    ),
    longitude: Optional[float] = Form(
        None, ge=-180.0, le=180.0, description="Geographic longitude coordinate (WGS84)"
    ),
    model_version: Optional[str] = Form(
        "v2", description="Model track to use for inference ('v2' or 'baseline')"
    ),
) -> PredictionResponse:
    """
    Executes real deep learning inference using trained YOLOv8n ONNX model.
    Passes user confidence threshold and selected model track.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No sonar image file provided.",
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        prediction = inference_service.predict(
            image_bytes=contents,
            filename=file.filename,
            confidence_threshold=confidence,
            latitude=latitude,
            longitude=longitude,
            model_version=model_version,
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

    scan_repository.save(prediction)
    return prediction
