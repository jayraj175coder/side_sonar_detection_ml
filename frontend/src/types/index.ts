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

export type TabType = 'overview' | 'scan' | 'history' | 'map' | 'reports' | 'model' | 'mission' | 'sonar' | 'analytics';

/* ─── Mission Intelligence & Hydrographic Types ─────────────────────────── */

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type UncertaintyRating = 'LOW AMBIGUITY' | 'MODERATE UNCERTAINTY' | 'HIGH UNCERTAINTY' | 'AMBIGUOUS CONTACT — RE-SURVEY ADVISED';

export interface TargetEvidence {
  objectShape: number;
  acousticIntensity: number;
  shadowGeometry: number;
  seabedContrast: number;
  dimensionalSimilarity: number;
  backscatterPattern: number;
}

export interface Trackline {
  id: string;
  name: string;
  code: string;
  heading: number;
  pingsRange: string;
  lengthKm: number;
  status: 'nominal' | 'degraded' | 'surveying' | 'complete';
  targetIds: string[];
}

export interface MissionTarget {
  id: string;
  tracklineId: string;
  class: string;
  classCode: string;
  confidence: number;
  confidenceInterval: [number, number]; // e.g. [0.91, 0.97]
  uncertaintyRating: UncertaintyRating;
  targetStrengthDb: number;
  operatorCaveat: string;
  uncertaintyNotes: string[];
  depth: number;
  length: number;
  width: number;
  estimatedHeight: number;
  shadowLength: number;
  orientation: number;
  slantRange: number;
  acrossTrackMeters: number; // Negative = Port, Positive = Starboard
  bearingDeg: number;
  lat: number;
  lon: number;
  risk: RiskLevel;
  pingTime: number;
  pingNumber: number;
  color: string;
  evidence: TargetEvidence;
  detectionEvidence: string[];
}

export interface TrackPoint {
  lat: number;
  lon: number;
  timeSeconds: number;
  depth: number;
  heading: number;
  speed: number;
}

export interface MissionData {
  id: string;
  name: string;
  region: string;
  vessel: string;
  operator: string;
  status: string;
  startTime: string;
  endTime: string;
  duration: string;
  surveyedArea: number;
  trackLength: number;
  avgDepth: number;
  coveragePercent: number;
  frequency: string;
  swathWidth: number;
  altimeter: number;
  pingRate: number;
  totalPings: number;
  sonarModel: string;
  tracklines: Trackline[];
  track: TrackPoint[];
  polygon: [number, number][];
}

export interface PipelineStage {
  id: number;
  name: string;
  code: string;
  description: string;
  duration_ms: number;
  output: string;
}

export interface AnalyticsDataPoint {
  time: string;
  detections: number;
  cumulative: number;
}

export interface ClassDistributionItem {
  name: string;
  count: number;
  color: string;
}

export interface AnalyticsData {
  missionId: string;
  surveyedArea: number;
  duration: string;
  trackLength: number;
  totalTargets: number;
  priorityTargets: number;
  avgDepth: number;
  coverage: number;
  detectionsOverTime: AnalyticsDataPoint[];
  confidenceDistribution: { range: string; count: number }[];
  classDistribution: ClassDistributionItem[];
  depthDistribution: { range: string; count: number }[];
  coverageOverTime: { time: string; coverage: number }[];
  sonarIntensity: { segment: string; intensity: number }[];
}

export type MissionStatus = 'idle' | 'initializing' | 'running' | 'complete' | 'launching' | 'surveying' | 'contact_detected' | 'contact_classified' | 'completed';
export type PlaybackSpeed = 1 | 2 | 4;

