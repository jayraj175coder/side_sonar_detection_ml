export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  id: string;
  type: 'MILCO' | 'NOMBO' | string;
  confidence: number;
  bbox: BoundingBox;
}

export interface Location {
  latitude: number | null;
  longitude: number | null;
}

export interface PredictionResponse {
  scan_id: string;
  filename: string;
  image_width: number;
  image_height: number;
  inference_ms: number;
  detections: Detection[];
  location: Location;
  created_at: string;
  confidence_threshold: number;
  total_detections: number;
  milco_count: number;
  nombo_count: number;
  highest_confidence: number;
  status: string;
  imageUrl?: string; // Optional client-side data URL for preview
}

export interface ValidationMetrics {
  precision: number;
  recall: number;
  map50: number;
  map50_95: number;
  milco_precision: number;
  milco_recall: number;
  milco_map50: number;
  nombo_precision: number;
  nombo_recall: number;
  nombo_map50: number;
  benchmark_device: string;
  benchmark_latency_ms: number;
  notes: string;
}

export interface ModelInfo {
  model_name: string;
  format: string;
  classes: string[];
  image_size: number;
  model_loaded: boolean;
  model_path: string;
  validation_metrics: ValidationMetrics;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  model_loaded: boolean;
  model_path: string;
  timestamp: string;
}

export interface ScanSummary {
  scan_id: string;
  filename: string;
  created_at: string;
  detection_count: number;
  milco_count: number;
  nombo_count: number;
  highest_confidence: number;
  avg_confidence: number;
  inference_ms: number;
  location: Location;
  status: string;
}

export interface StatsResponse {
  total_scans: number;
  objects_detected: number;
  milco_detections: number;
  nombo_detections: number;
  avg_confidence: number;
  avg_inference_ms: number;
  class_distribution: Record<string, number>;
  recent_scans: ScanSummary[];
}

export interface ReportResponse {
  scan: PredictionResponse;
  generated_at: string;
  analyst_summary: string;
  metrics: Record<string, any>;
}

export type TabType = 'overview' | 'scan' | 'history' | 'map' | 'reports' | 'model';
