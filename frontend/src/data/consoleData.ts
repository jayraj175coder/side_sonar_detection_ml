export type StageId = '01' | '02' | '03' | '04' | '05' | '06';

export interface SurveySite {
  id: string;
  name: string;
  code: string;
  sourceFile: string;
  timestamp: string;
  swathWidthM: number;
  frequency: string;
  towDepthM: number;
  latRange: [number, number];
  lonRange: [number, number];
}

export interface CandidateItem {
  id: string;
  class: string;
  confidence: number;
  aspectRatio: number;
  shadowLengthM: number;
  depthM: number;
  dimensions: string;
  status: 'CONFIRMED' | 'REJECTED';
  rejectReason?: string;
  lat: number;
  lon: number;
  rawX: number; // percentage on sonar canvas
  rawY: number; // percentage on sonar canvas
}

export interface StageDetail {
  id: StageId;
  name: string;
  shortDesc: string;
  countBadge: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  metric3: { label: string; value: string };
  explanation: string;
  cautionCallout?: string;
  eventState: string;
}

export const SURVEY_SITES: SurveySite[] = [
  {
    id: 'kutch-dark',
    name: 'KUTCH-DARK SECTOR',
    code: 'SITE-01',
    sourceFile: 'SONAR_LOG_MX026_SWATH02.XTF',
    timestamp: '2026-08-31 04:18:22 UTC',
    swathWidthM: 75,
    frequency: '900 kHz DUAL SSS',
    towDepthM: 8.4,
    latRange: [18.907, 18.935],
    lonRange: [72.808, 72.832],
  },
  {
    id: 'mumbai-shelf',
    name: 'MUMBAI-SHELF CORRIDOR',
    code: 'SITE-02',
    sourceFile: 'SONAR_LOG_MX028_TRAWL01.XTF',
    timestamp: '2026-08-31 06:45:10 UTC',
    swathWidthM: 75,
    frequency: '900 kHz DUAL SSS',
    towDepthM: 9.1,
    latRange: [18.914, 18.942],
    lonRange: [72.812, 72.838],
  },
  {
    id: 'vizag-deep',
    name: 'VIZAG-DEEP TRENCH',
    code: 'SITE-03',
    sourceFile: 'SONAR_LOG_MX031_DEEP04.XTF',
    timestamp: '2026-08-31 09:12:00 UTC',
    swathWidthM: 100,
    frequency: '450 kHz HIGH SSS',
    towDepthM: 14.2,
    latRange: [17.65, 17.72],
    lonRange: [83.25, 83.35],
  },
];

export const PIPELINE_STAGES: { id: StageId; name: string; desc: string }[] = [
  { id: '01', name: 'INGEST',   desc: 'raw sonar image/ping loaded' },
  { id: '02', name: 'DENOISE',  desc: 'noise filtering / contrast preprocessing' },
  { id: '03', name: 'DETECT',   desc: 'model inference — raw candidate objects' },
  { id: '04', name: 'FILTER',   desc: 'confidence scoring + false-positive gating' },
  { id: '05', name: 'CLASSIFY', desc: 'debris type + confidence attribution' },
  { id: '06', name: 'REPORT',   desc: 'geotag + structured anomaly report' },
];

export const CANDIDATE_ITEMS: CandidateItem[] = [
  {
    id: 'SX-T07',
    class: 'Ghost Net (ALDFG)',
    confidence: 0.947,
    aspectRatio: 3.88,
    shadowLengthM: 2.31,
    depthM: 43.1,
    dimensions: '12.4m x 3.2m',
    status: 'CONFIRMED',
    lat: 18.9217,
    lon: 72.8214,
    rawX: 34,
    rawY: 42,
  },
  {
    id: 'SX-T02',
    class: 'Lost Fishing Trawl Gear',
    confidence: 0.912,
    aspectRatio: 3.58,
    shadowLengthM: 1.94,
    depthM: 41.8,
    dimensions: '8.6m x 2.4m',
    status: 'CONFIRMED',
    lat: 18.9184,
    lon: 72.8241,
    rawX: 62,
    rawY: 36,
  },
  {
    id: 'SX-T04',
    class: 'Natural Basalt Rock Cluster',
    confidence: 0.324,
    aspectRatio: 1.11,
    shadowLengthM: 0.42,
    depthM: 44.3,
    dimensions: '3.1m x 2.8m',
    status: 'REJECTED',
    rejectReason: 'Aspect ratio 1.11 & diffuse shadow relief matches native geological bedrock',
    lat: 18.9198,
    lon: 72.8172,
    rawX: 78,
    rawY: 65,
  },
  {
    id: 'SX-T06',
    class: 'Sediment Sand Megaripple',
    confidence: 0.281,
    aspectRatio: 8.22,
    shadowLengthM: 0.0,
    depthM: 42.6,
    dimensions: '7.4m x 0.9m',
    status: 'REJECTED',
    rejectReason: 'Zero acoustic shadow relief; hydrodynamic sediment bedform filter triggered',
    lat: 18.9234,
    lon: 72.8258,
    rawX: 22,
    rawY: 28,
  },
  {
    id: 'SX-T03',
    class: 'Anthropogenic Debris Bundle',
    confidence: 0.889,
    aspectRatio: 2.29,
    shadowLengthM: 2.85,
    depthM: 45.7,
    dimensions: '4.8m x 2.1m',
    status: 'CONFIRMED',
    lat: 18.9142,
    lon: 72.8189,
    rawX: 48,
    rawY: 74,
  },
  {
    id: 'SX-T05',
    class: 'Subsea Pipeline Free-Span',
    confidence: 0.864,
    aspectRatio: 20.0,
    shadowLengthM: 2.6,
    depthM: 47.2,
    dimensions: '24.0m x 1.2m',
    status: 'CONFIRMED',
    lat: 18.9115,
    lon: 72.8268,
    rawX: 84,
    rawY: 52,
  },
  {
    id: 'SX-T08',
    class: 'Multipath Surface Echo',
    confidence: 0.215,
    aspectRatio: 1.22,
    shadowLengthM: 0.0,
    depthM: 46.1,
    dimensions: '2.2m x 1.8m',
    status: 'REJECTED',
    rejectReason: 'Surface reverberation artifact; rejected by TVG altitude correlation check',
    lat: 18.9092,
    lon: 72.8291,
    rawX: 18,
    rawY: 82,
  },
  {
    id: 'SX-T09',
    class: 'Industrial Metal Barrel Group',
    confidence: 0.812,
    aspectRatio: 1.75,
    shadowLengthM: 2.4,
    depthM: 48.4,
    dimensions: '2.1m x 1.2m',
    status: 'CONFIRMED',
    lat: 18.9168,
    lon: 72.8125,
    rawX: 55,
    rawY: 18,
  },
];

export const STAGE_DETAILS: Record<StageId, StageDetail> = {
  '01': {
    id: '01',
    name: 'INGEST',
    shortDesc: 'Raw sonar image/ping loaded',
    countBadge: '80,829 PINGS',
    metric1: { label: 'SWATH WIDTH', value: '75.0 m' },
    metric2: { label: 'ACQUISITION', value: '900 kHz' },
    metric3: { label: 'TOW ALTITUDE', value: '8.4 m' },
    explanation:
      'Raw side-scan acoustic packet stream ingested directly from tow-body transducer logs. Time-stamp synchronization locks ping intervals to navigation telemetry at 10 Hz.',
    eventState: 'STREAM BUFFER LOCKED · 10 HZ PING INTERVAL',
  },
  '02': {
    id: '02',
    name: 'DENOISE',
    shortDesc: 'Noise filtering / contrast preprocessing',
    countBadge: '+14.2 dB SNR',
    metric1: { label: 'SPECKLE REDUCTION', value: '-18.4 dB' },
    metric2: { label: 'DYNAMIC RANGE', value: '+14.2 dB' },
    metric3: { label: 'TVG CORRECTION', value: 'APPLIED' },
    explanation:
      'A 5x5 bilateral spatial kernel suppresses high-frequency seabed speckle while preserving sharp obstacle edges. Contrast Limited Adaptive Histogram Equalization (CLAHE) normalizes backscatter dynamic range.',
    eventState: 'PREPROCESSING COMPLETE · BILATERAL + CLAHE NORMALIZED',
  },
  '03': {
    id: '03',
    name: 'DETECT',
    shortDesc: 'Model inference — raw candidate objects',
    countBadge: '37 CANDIDATES',
    metric1: { label: 'RAW CANDIDATES', value: '37' },
    metric2: { label: 'ONNX LATENCY', value: '10.4 ms' },
    metric3: { label: 'MIN THRESHOLD', value: '0.15 CONF' },
    explanation:
      'A custom YOLOv8n ONNX perception model runs inference over the normalized acoustic mosaic. Every high-backscatter highlight with paired shadow return is proposed as an unverified candidate.',
    cautionCallout:
      'A RAW DETECTION IS NOT A CONFIRMED DEBRIS ITEM. This table shows every candidate the model flagged before filtering — being flagged is a far weaker claim than being confirmed. Confirmed items appear only in stage 04 and never include a rejected candidate from here.',
    eventState: 'INFERENCE PASS COMPLETE · 37 RAW CANDIDATES EXTRACTED',
  },
  '04': {
    id: '04',
    name: 'FILTER',
    shortDesc: 'Confidence scoring + false-positive gating',
    countBadge: '17 CONFIRMED',
    metric1: { label: 'RAW DETECTIONS', value: '37' },
    metric2: { label: 'REJECTED NOISE', value: '20' },
    metric3: { label: 'CONFIRMED DEBRIS', value: '17' },
    explanation:
      'The confidence gate is the only filter here with real signal behind it: a candidate survives only if its shape, contrast, and confidence score jointly exceed the trained threshold. This is what turns dozens of raw detections into a handful of credible debris candidates.',
    cautionCallout:
      'FALSE-POSITIVE SUPPRESSION RULE: Natural geological rock clusters (aspect ratio ~1.0) and hydrodynamic sand megaripples are suppressed using acoustic shadow relief constraints.',
    eventState: 'GATING APPLIED · 20 NATURAL FORMATIONS REJECTED · 17 CONFIRMED',
  },
  '05': {
    id: '05',
    name: 'CLASSIFY',
    shortDesc: 'Debris type + confidence attribution',
    countBadge: '4 CRITICAL HAZARDS',
    metric1: { label: 'GHOST NETS', value: '6' },
    metric2: { label: 'TRAWL GEAR', value: '4' },
    metric3: { label: 'PIPELINE SPANS', value: '3' },
    explanation:
      'Confirmed detections are classified into MoES ALDFG (Abandoned, Lost or Discarded Fishing Gear) and subsea hazard taxonomy based on high-frequency textural resonance and shadow geometry.',
    cautionCallout:
      'CLASSIFICATION CONFIDENCE IS NOT RECOVERY FEASIBILITY. Debris signatures classified as Ghost Net (ALDFG) require physical ROV verification prior to grappling operations.',
    eventState: 'TAXONOMY ATTRIBUTION COMPLETE · 17 TARGETS CLASSIFIED',
  },
  '06': {
    id: '06',
    name: 'REPORT',
    shortDesc: 'Geotag + structured anomaly report',
    countBadge: 'DOSSIER READY',
    metric1: { label: 'GEOTAGGED', value: '17 TARGETS' },
    metric2: { label: 'SURVEY AREA', value: '12.84 km²' },
    metric3: { label: 'EXPORT FORMATS', value: 'JSON / CSV' },
    explanation:
      'Every accepted anomaly is tagged with high-precision WGS84 coordinates (interpolated from tow-fish layback and USBL telemetry) and compiled into formal Ministry of Earth Sciences inspection records.',
    eventState: 'ANOMALY DOSSIER COMPILED · READY FOR HUMAN VERIFICATION',
  },
};

export const INITIAL_EVENT_LOGS: {
  time: string;
  tag: string;
  text: string;
  level: 'info' | 'success' | 'warn' | 'reject';
}[] = [
  { time: '00:41', tag: 'SYS', text: 'session open · analysis node 04 · link ok', level: 'info' },
  { time: '00:41', tag: 'SYS', text: 'survey loaded · sonar_log_kutch_dark_042.xtf (75m swath)', level: 'info' },
  { time: '00:41', tag: 'DEN', text: 'bilateral spatial filter applied · speckle attenuated -18.4 dB', level: 'info' },
  { time: '00:41', tag: 'DEN', text: 'CLAHE contrast normalization applied · dynamic range +14.2 dB', level: 'success' },
  { time: '00:41', tag: 'DET', text: 'YOLOv8n ONNX inference pass complete (10.4 ms) · 37 raw candidates', level: 'info' },
  { time: '00:41', tag: 'GEOM', text: 'SX-T07 bbox 12.4m x 3.2m · acoustic shadow relief 2.31m', level: 'info' },
  { time: '00:41', tag: 'GATE', text: 'rejected SX-T04 — aspect ratio 1.11 exceeds rock-shadow threshold', level: 'reject' },
  { time: '00:41', tag: 'GATE', text: 'rejected SX-T06 — zero vertical relief; sediment sand ripple', level: 'reject' },
  { time: '00:41', tag: 'GATE', text: 'rejected SX-T08 — multipath surface reverberation echo', level: 'reject' },
  { time: '00:41', tag: 'GATE', text: 'confirmed SX-T07 — "ghost net (ALDFG)" confidence 0.947', level: 'success' },
  { time: '00:41', tag: 'GATE', text: 'confirmed SX-T02 — "lost trawl gear" confidence 0.912', level: 'success' },
  { time: '00:41', tag: 'GEO', text: 'SX-T07 lat 18.9217 lon 72.8214 depth 43.1m attached from USBL index', level: 'info' },
  { time: '00:41', tag: 'REP', text: 'structured dossier anomaly_report_MX026.json generated', level: 'success' },
];
