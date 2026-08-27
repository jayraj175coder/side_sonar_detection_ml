export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  id: string;
  type: string;
  confidence: number;
  bbox: BoundingBox;
  confidence_tier?: 'HIGH' | 'MEDIUM' | 'LOW';
  noise_filter_passed?: boolean;
  noise_filter_reason?: string;
}

export interface Location {
  latitude: number | null;
  longitude: number | null;
  heading?: number | null;
}

export interface PredictionResponse {
  scan_id: string;
  filename: string;
  model_name?: string;
  model_version?: string;
  image_width: number;
  image_height: number;
  inference_ms: number;
  detections: Detection[];
  location: Location;
  created_at: string;
  confidence_threshold: number;
  total_detections: number;
  false_positives_suppressed?: number;
  noise_filtering_applied?: boolean;
  geotag_source?: 'ping_log' | 'manual' | 'none' | string;
  ghost_net_count?: number;
  debris_count?: number;
  pipeline_count?: number;
  anomaly_count?: number;
  milco_count?: number;
  nombo_count?: number;
  highest_confidence: number;
  status: string;
  imageUrl?: string;
}

export interface ValidationMetrics {
  precision: number;
  recall: number;
  map50: number;
  map50_95: number;
  ghost_net_precision?: number;
  ghost_net_recall?: number;
  ghost_net_map50?: number;
  debris_precision?: number;
  debris_recall?: number;
  debris_map50?: number;
  pipeline_precision?: number;
  pipeline_recall?: number;
  pipeline_map50?: number;
  milco_precision?: number;
  milco_recall?: number;
  milco_map50?: number;
  nombo_precision?: number;
  nombo_recall?: number;
  nombo_map50?: number;
  benchmark_device: string;
  benchmark_latency_ms: number;
  notes: string;
}

export interface ModelInfo {
  name: string;
  version: string;
  task: string;
  classes: string[];
  input_size: number;
  model_loaded: boolean;
  model_path: string;
  available_models?: string[];
  metrics: ValidationMetrics;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  model_name?: string;
  model_version?: string;
  model_loaded: boolean;
  model_path: string;
  timestamp: string;
}

export interface ScanSummary {
  scan_id: string;
  filename: string;
  created_at: string;
  detection_count: number;
  highest_confidence: number;
  avg_confidence: number;
  inference_ms: number;
  location: Location;
  status: string;
}

export interface StatsResponse {
  total_scans: number;
  objects_detected: number;
  ghost_net_detections?: number;
  debris_detections?: number;
  pipeline_detections?: number;
  anomaly_detections?: number;
  milco_detections?: number;
  nombo_detections?: number;
  avg_confidence: number;
  avg_inference_ms: number;
  class_distribution: Record<string, number>;
  recent_scans: ScanSummary[];
}

export interface ReportResponse {
  scan: PredictionResponse;
  generated_at: string;
  analyst_summary: string;
  disclaimer: string;
  metrics: Record<string, any>;
}

export interface DatasetItem {
  id: string;
  name: string;
  source_url: string;
  paper_url?: string;
  sonar_modality: string;
  num_images: number;
  annotation_format: string;
  original_classes: string[];
  target_task: string;
  license: string;
  geographic_source: string;
  target_mapping: Record<string, string>;
  preprocessing: string;
  limitations: string;
  relevance_to_sih: string;
}

export interface DatasetCatalogResponse {
  catalog_source: string;
  current_baseline_classes: string[];
  v2_planned_classes: string[];
  datasets: Record<string, DatasetItem>;
}

export type TabType = 'overview' | 'scan' | 'history' | 'map' | 'reports' | 'model';
