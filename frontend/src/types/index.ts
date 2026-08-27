export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  id: string;
  type: 'anthropogenic_debris' | 'derelict_fishing_gear' | 'anthropogenic_structure' | 'potential_anomaly' | 'MILCO' | 'NOMBO' | string;
  confidence: number;
  bbox: BoundingBox;
  confidence_tier?: 'HIGH' | 'MEDIUM' | 'POTENTIAL_ANOMALY';
  is_anomaly?: boolean;
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
  debris_count?: number;
  fishing_gear_count?: number;
  structure_count?: number;
  anomaly_count?: number;
  highest_confidence: number;
  pipeline?: 'debris' | 'baseline' | string;
  clutter_filtered_count?: number;
  verification_status?: string;
  status: string;
  imageUrl?: string;
}

export interface ValidationMetrics {
  precision: number;
  recall: number;
  map50: number;
  map50_95: number;
  milco_precision?: number;
  milco_recall?: number;
  milco_map50?: number;
  nombo_precision?: number;
  nombo_recall?: number;
  nombo_map50?: number;
  debris_precision?: number;
  debris_recall?: number;
  debris_map50?: number;
  fishing_gear_precision?: number;
  fishing_gear_recall?: number;
  fishing_gear_map50?: number;
  false_positive_rejection_rate?: number;
  benchmark_device: string;
  benchmark_latency_ms: number;
  notes: string;
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
  target_taxonomy: Record<number, string>;
  datasets: Record<string, DatasetItem>;
  ghost_net_research_status: {
    use_case_priority: string;
    problem_description: string;
    current_dataset_reality: string;
    scientific_integrity_stance: string;
    integration_roadmap: string;
  };
}

export interface ModelInfo {
  model_name: string;
  active_pipeline?: string;
  format: string;
  classes: string[];
  image_size: number;
  model_loaded: boolean;
  model_path: string;
  baseline_metrics?: ValidationMetrics;
  debris_metrics?: ValidationMetrics;
  validation_metrics?: ValidationMetrics;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  active_pipeline?: string;
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
  debris_count?: number;
  highest_confidence: number;
  avg_confidence: number;
  inference_ms: number;
  location: Location;
  pipeline?: string;
  status: string;
}

export interface StatsResponse {
  total_scans: number;
  objects_detected: number;
  milco_detections: number;
  nombo_detections: number;
  debris_detections?: number;
  fishing_gear_detections?: number;
  anomaly_detections?: number;
  avg_confidence: number;
  avg_inference_ms: number;
  class_distribution: Record<string, number>;
  recent_scans: ScanSummary[];
}

export interface ReportResponse {
  scan: PredictionResponse;
  generated_at: string;
  analyst_summary: string;
  clutter_filtering_summary?: string;
  disclaimer?: string;
  metrics: Record<string, any>;
}

export type TabType = 'overview' | 'scan' | 'history' | 'map' | 'reports' | 'model';
