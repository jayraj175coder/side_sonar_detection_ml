from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.schemas.detection import PredictionResponse
from app.services.inference import inference_service
from app.services.metadata_parser import parse_ping_log
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
    ping_log: Optional[UploadFile] = File(
        None, description="Optional companion ping log (CSV / JSON) for automated GPS geotagging"
    ),
    confidence: Optional[float] = Form(
        None, ge=0.01, le=1.0, description="Model confidence cutoff threshold (0.01 - 1.0)"
    ),
    latitude: Optional[float] = Form(
        None, ge=-90.0, le=90.0, description="Manual fallback latitude coordinate (WGS84)"
    ),
    longitude: Optional[float] = Form(
        None, ge=-180.0, le=180.0, description="Manual fallback longitude coordinate (WGS84)"
    ),
    model_version: Optional[str] = Form(
        "v2", description="Model version: 'v2' (MoES Flagship) or 'baseline' (Legacy Reference)"
    ),
    noise_filtering_enabled: Optional[bool] = Form(
        True, description="Enable post-NMS acoustic geometry & shadow false-positive suppression"
    ),
) -> PredictionResponse:
    """
    Executes deep learning inference on side-scan sonar waterfall imagery.
    Supports automated ping-log GPS coordinate parsing and post-NMS acoustic noise filtering.
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

    # 1. Automated Geotagging via Ping Log (with fallback to manual lat/lon)
    final_lat = latitude
    final_lon = longitude
    heading: Optional[float] = None
    geotag_source = "manual" if (latitude is not None and longitude is not None) else "none"

    if ping_log is not None and ping_log.filename:
        ping_bytes = await ping_log.read()
        if len(ping_bytes) > 0:
            parsed = parse_ping_log(ping_bytes, file.filename)
            if parsed.match_found and parsed.latitude is not None and parsed.longitude is not None:
                final_lat = parsed.latitude
                final_lon = parsed.longitude
                heading = parsed.heading
                geotag_source = "ping_log"

    # 2. Run ONNX Inference with Noise Filter
    try:
        prediction = inference_service.predict(
            image_bytes=contents,
            filename=file.filename,
            confidence_threshold=confidence,
            latitude=final_lat,
            longitude=final_lon,
            heading=heading,
            geotag_source=geotag_source,
            model_version=model_version or "v2",
            noise_filtering_enabled=noise_filtering_enabled if noise_filtering_enabled is not None else True,
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
