from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class BoundingBox(BaseModel):
    x1: float = Field(..., description="Top-left X coordinate in pixels")
    y1: float = Field(..., description="Top-left Y coordinate in pixels")
    x2: float = Field(..., description="Bottom-right X coordinate in pixels")
    y2: float = Field(..., description="Bottom-right Y coordinate in pixels")


class Detection(BaseModel):
    id: str = Field(..., description="Unique detection identifier")
    type: str = Field(..., description="True class label from model: ghost_net_aldfg, anthropogenic_debris, pipeline_hazard, seafloor_anomaly, MILCO, NOMBO")
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
    model_name: str = "YOLOv8n-SIH-Marine-Debris-V2"
    model_version: str = "v2"
    image_width: int
    image_height: int
    inference_ms: float
    detections: List[Detection]
    location: Location
    created_at: str
    confidence_threshold: float
    total_detections: int
    ghost_net_count: int = 0
    debris_count: int = 0
    pipeline_count: int = 0
    anomaly_count: int = 0
    milco_count: int = 0
    nombo_count: int = 0
    highest_confidence: float
    status: str = "completed"


class ValidationMetrics(BaseModel):
    precision: float = 0.764
    recall: float = 0.833
    map50: float = 0.782
    map50_95: float = 0.418
    ghost_net_precision: Optional[float] = 0.825
    ghost_net_recall: Optional[float] = 0.890
    ghost_net_map50: Optional[float] = 0.842
    debris_precision: Optional[float] = 0.748
    debris_recall: Optional[float] = 0.812
    debris_map50: Optional[float] = 0.771
    pipeline_precision: Optional[float] = 0.795
    pipeline_recall: Optional[float] = 0.854
    pipeline_map50: Optional[float] = 0.810
    benchmark_device: str = "NVIDIA T4 / AMD Ryzen Tensor Runtime"
    benchmark_latency_ms: float = 10.2
    notes: str = "Evaluated on SIH Side-Scan Sonar Marine Debris & ALDFG dataset"


class ModelInfo(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    name: str
    version: str = "v2"
    task: str = "detect"
    classes: List[str]
    input_size: int = 640
    model_loaded: bool
    model_path: str
    available_models: List[str] = ["marine_sonar_v2", "baseline"]
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
    highest_confidence: float
    avg_confidence: float
    inference_ms: float
    location: Location
    status: str


class StatsResponse(BaseModel):
    total_scans: int
    objects_detected: int
    ghost_net_detections: int = 0
    debris_detections: int = 0
    pipeline_detections: int = 0
    anomaly_detections: int = 0
    milco_detections: int = 0
    nombo_detections: int = 0
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
