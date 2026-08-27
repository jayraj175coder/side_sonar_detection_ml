from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class BoundingBox(BaseModel):
    x1: float = Field(..., description="Top-left X coordinate in pixels")
    y1: float = Field(..., description="Top-left Y coordinate in pixels")
    x2: float = Field(..., description="Bottom-right X coordinate in pixels")
    y2: float = Field(..., description="Bottom-right Y coordinate in pixels")


class Detection(BaseModel):
    id: str = Field(..., description="Unique detection identifier")
    type: str = Field(..., description="True class label from model: MILCO, NOMBO, etc.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score (0.0 - 1.0)")
    bbox: BoundingBox = Field(..., description="Bounding box in image pixel coordinates")
    confidence_tier: Optional[str] = Field("MEDIUM", description="Confidence tier: HIGH (>=0.70), MEDIUM (>=0.35), or LOW (<0.35)")


class Location(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Geographic latitude in degrees")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Geographic longitude in degrees")


class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    scan_id: str
    filename: str
    model_name: str = "YOLOv8n-Sonar-MILCO-NOMBO"
    model_version: str = "baseline"
    image_width: int
    image_height: int
    inference_ms: float
    detections: List[Detection]
    location: Location
    created_at: str
    confidence_threshold: float
    total_detections: int
    milco_count: int = 0
    nombo_count: int = 0
    highest_confidence: float
    status: str = "completed"


class ValidationMetrics(BaseModel):
    precision: float = 0.718
    recall: float = 0.669
    map50: float = 0.712
    map50_95: float = 0.3225
    milco_precision: float = 0.721
    milco_recall: float = 0.738
    milco_map50: float = 0.714
    nombo_precision: float = 0.659
    nombo_recall: float = 0.414
    nombo_map50: float = 0.542
    benchmark_device: str = "NVIDIA T4 (Google Colab)"
    benchmark_latency_ms: float = 9.8
    notes: str = "Measured validation metrics — YOLOv8n MILCO/NOMBO baseline"


class ModelInfo(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    name: str
    version: str = "baseline"
    task: str = "detect"
    classes: List[str]
    input_size: int = 640
    model_loaded: bool
    model_path: str
    is_v2_available: bool = False
    metrics: ValidationMetrics


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    service: str
    version: str
    model_name: str
    model_version: str
    model_loaded: bool
    model_path: str
    timestamp: str


class ScanSummary(BaseModel):
    scan_id: str
    filename: str
    created_at: str
    detection_count: int
    milco_count: int
    nombo_count: int
    highest_confidence: float
    avg_confidence: float
    inference_ms: float
    location: Location
    status: str


class StatsResponse(BaseModel):
    total_scans: int
    objects_detected: int
    milco_detections: int
    nombo_detections: int
    avg_confidence: float
    avg_inference_ms: float
    class_distribution: Dict[str, int]
    recent_scans: List[ScanSummary]


class ReportResponse(BaseModel):
    scan: PredictionResponse
    generated_at: str
    analyst_summary: str
    disclaimer: str
    metrics: Dict[str, Any]
