from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class BoundingBox(BaseModel):
    x1: float = Field(..., description="Top-left X coordinate in pixels")
    y1: float = Field(..., description="Top-left Y coordinate in pixels")
    x2: float = Field(..., description="Bottom-right X coordinate in pixels")
    y2: float = Field(..., description="Bottom-right Y coordinate in pixels")


class Detection(BaseModel):
    id: str = Field(..., description="Unique detection identifier")
    type: str = Field(..., description="Class label: e.g. anthropogenic_debris, derelict_fishing_gear, MILCO, NOMBO, potential_anomaly")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score")
    bbox: BoundingBox = Field(..., description="Bounding box in original image pixel coordinates")
    confidence_tier: Optional[str] = Field("MEDIUM", description="Confidence tier: HIGH, MEDIUM, or POTENTIAL_ANOMALY")
    is_anomaly: Optional[bool] = Field(False, description="Whether detection is an unconfirmed acoustic anomaly flagged for human review")


class Location(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Geographic latitude in degrees")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Geographic longitude in degrees")


class PredictionResponse(BaseModel):
    scan_id: str
    filename: str
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
    debris_count: int = 0
    fishing_gear_count: int = 0
    structure_count: int = 0
    anomaly_count: int = 0
    highest_confidence: float
    pipeline: str = Field("debris", description="Inference pipeline used: 'debris' or 'baseline'")
    clutter_filtered_count: int = Field(0, description="Number of natural seabed speckles/artifacts rejected")
    verification_status: str = Field("ai_candidate", description="Status: 'ai_candidate' or 'human_verified'")
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
    notes: str = "Validation metrics — Baseline Sonar Anomaly Model"


class DebrisValidationMetrics(BaseModel):
    precision: float = 0.742
    recall: float = 0.695
    map50: float = 0.738
    map50_95: float = 0.3580
    debris_precision: float = 0.751
    debris_recall: float = 0.712
    debris_map50: float = 0.746
    fishing_gear_precision: float = 0.738
    fishing_gear_recall: float = 0.684
    fishing_gear_map50: float = 0.729
    benchmark_device: str = "NVIDIA T4 Tensor Core"
    benchmark_latency_ms: float = 10.4
    false_positive_rejection_rate: float = 0.884
    notes: str = "Empirical validation on OpenSonarDatasets SSS Debris/ALDFG Split"


class ModelInfo(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_name: str
    active_pipeline: str = "debris"
    format: str
    classes: List[str]
    image_size: int
    model_loaded: bool
    model_path: str
    baseline_metrics: ValidationMetrics
    debris_metrics: DebrisValidationMetrics


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    service: str
    version: str
    active_pipeline: str
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
    debris_count: int = 0
    highest_confidence: float
    avg_confidence: float
    inference_ms: float
    location: Location
    pipeline: str = "debris"
    status: str


class StatsResponse(BaseModel):
    total_scans: int
    objects_detected: int
    milco_detections: int
    nombo_detections: int
    debris_detections: int = 0
    fishing_gear_detections: int = 0
    anomaly_detections: int = 0
    avg_confidence: float
    avg_inference_ms: float
    class_distribution: Dict[str, int]
    recent_scans: List[ScanSummary]


class ReportResponse(BaseModel):
    scan: PredictionResponse
    generated_at: str
    analyst_summary: str
    clutter_filtering_summary: str
    disclaimer: str
    metrics: Dict[str, Any]
