export interface DetectionBox {
  id: string;
  label: string;
  classCode: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  status: 'ACCEPTED' | 'FILTERED_OUT' | 'REVIEW';
  filterReason?: string;
  depthM: number;
  lengthM: number;
  widthM: number;
  shadowLengthM: number;
  lat: number;
  lon: number;
}

export interface DemoScenario {
  id: string;
  filename: string;
  title: string;
  swathWidthM: number;
  frequency: string;
  rawNoiseDescription: string;
  filteredNoiseDescription: string;
  contrastImprovementDb: number;
  detections: DetectionBox[];
  logs: {
    stage: 'INGEST' | 'PREPROCESS' | 'DETECT' | 'FILTER' | 'REPORT';
    delayMs: number;
    text: string;
    level: 'info' | 'success' | 'warn' | 'reject';
  }[];
}

export const DEMO_PIPELINE_SCENARIOS: DemoScenario[] = [
  // --- SCENARIO 1: HERO GHOST NET ---
  {
    id: 'sample-01-ghost-net',
    filename: 'sonar_042_ghost_net.png',
    title: 'Swath Line 02 · Central Trench Corridor',
    swathWidthM: 75,
    frequency: '900 kHz SSS',
    rawNoiseDescription: 'High surface reverberation & seabed acoustic speckle (+18.4 dB ambient clutter)',
    filteredNoiseDescription: 'Bilateral spatial filter + CLAHE contrast normalization (contrast ratio +14.2 dB)',
    contrastImprovementDb: 14.2,
    detections: [
      {
        id: 'SX-T07',
        label: 'Ghost Net (ALDFG)',
        classCode: 'NET',
        confidence: 0.947,
        x: 32,
        y: 38,
        width: 24,
        height: 18,
        status: 'ACCEPTED',
        depthM: 43.1,
        lengthM: 12.4,
        widthM: 3.2,
        shadowLengthM: 2.31,
        lat: 18.9217,
        lon: 72.8214,
      },
      {
        id: 'SX-T04',
        label: 'Natural Basalt Rock',
        classCode: 'ROCK',
        confidence: 0.324,
        x: 68,
        y: 62,
        width: 14,
        height: 12,
        status: 'FILTERED_OUT',
        filterReason: 'Diffuse shadow relief & aspect ratio 1.1 matches native geological basalt',
        depthM: 44.3,
        lengthM: 3.1,
        widthM: 2.8,
        shadowLengthM: 0.4,
        lat: 18.9198,
        lon: 72.8172,
      },
      {
        id: 'SX-T06',
        label: 'Sand Ripple Bedform',
        classCode: 'SAND',
        confidence: 0.281,
        x: 78,
        y: 22,
        width: 16,
        height: 8,
        status: 'FILTERED_OUT',
        filterReason: 'Zero vertical relief shadow; classified as hydrodynamic sediment wave',
        depthM: 42.6,
        lengthM: 7.4,
        widthM: 0.9,
        shadowLengthM: 0.0,
        lat: 18.9234,
        lon: 72.8258,
      },
    ],
    logs: [
      { stage: 'INGEST', delayMs: 120, text: 'Ingested raw sonar acoustic stream: sonar_042_ghost_net.png (1024x768, 900 kHz Dual SSS)', level: 'info' },
      { stage: 'INGEST', delayMs: 220, text: 'Swath metadata locked: 75m swath width · 8.4m AGL altitude · 10 pings/sec', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 420, text: 'Applied 5x5 Bilateral Filter: acoustic speckle noise suppressed (-18.4 dB clutter attenuation)', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 640, text: 'Applied CLAHE (Contrast Limited Adaptive Histogram Equalization): Seabed dynamic range +14.2 dB', level: 'success' },
      { stage: 'PREPROCESS', delayMs: 820, text: 'Time-Varied Gain (TVG) normalization applied; water column nadir boundary isolated', level: 'info' },
      { stage: 'DETECT', delayMs: 1100, text: 'Detector: YOLOv8n-Marine-Debris ONNX inference initialized (Latency: 10.4 ms)', level: 'info' },
      { stage: 'DETECT', delayMs: 1350, text: 'Extracted 3 candidate acoustic regions from normalized backscatter highlights', level: 'info' },
      { stage: 'FILTER', delayMs: 1650, text: 'Filter evaluation: running False-Positive Natural Formation Suppression Module...', level: 'warn' },
      { stage: 'FILTER', delayMs: 1900, text: 'Filter REJECTED Candidate #2: "Natural Basalt Rock" (Confidence 0.324 < 0.50 threshold, Diffuse Shadow)', level: 'reject' },
      { stage: 'FILTER', delayMs: 2150, text: 'Filter REJECTED Candidate #3: "Sand Ripple Bedform" (Confidence 0.281, Zero vertical relief shadow)', level: 'reject' },
      { stage: 'FILTER', delayMs: 2450, text: 'Filter ACCEPTED Target SX-T07: "Ghost Net (ALDFG)" — Confidence 94.7% [HIGH PRIORITY HAZARD]', level: 'success' },
      { stage: 'REPORT', delayMs: 2800, text: 'Geotagging: Lat 18.9217° N, Lon 72.8214° E (Seabed Depth: 43.1m) synchronized to trackline LINE-02', level: 'info' },
      { stage: 'REPORT', delayMs: 3100, text: 'Report generated: anomaly_record_SX-T07.json + MoES target register updated', level: 'success' },
    ],
  },

  // --- SCENARIO 2: LOST TRAWL GEAR ---
  {
    id: 'sample-02-trawl-gear',
    filename: 'sonar_089_trawl_gear.png',
    title: 'Swath Line 02 · Southern Approach',
    swathWidthM: 75,
    frequency: '900 kHz SSS',
    rawNoiseDescription: 'Multipath reverberation ghosting + slant-range distortion',
    filteredNoiseDescription: 'Slant-range geometric correction + speckle median filtering',
    contrastImprovementDb: 12.8,
    detections: [
      {
        id: 'SX-T02',
        label: 'Fishing Gear & Trawl Net',
        classCode: 'GEAR',
        confidence: 0.912,
        x: 42,
        y: 48,
        width: 22,
        height: 16,
        status: 'ACCEPTED',
        depthM: 41.8,
        lengthM: 8.6,
        widthM: 2.4,
        shadowLengthM: 1.94,
        lat: 18.9184,
        lon: 72.8241,
      },
      {
        id: 'SX-T08',
        label: 'Multipath Acoustic Artifact',
        classCode: 'ARTIFACT',
        confidence: 0.215,
        x: 74,
        y: 70,
        width: 12,
        height: 10,
        status: 'FILTERED_OUT',
        filterReason: 'Surface bounce reverberation ghost; rejected by TVG altitude correlation check',
        depthM: 46.1,
        lengthM: 2.2,
        widthM: 1.8,
        shadowLengthM: 0.0,
        lat: 18.9092,
        lon: 72.8291,
      },
    ],
    logs: [
      { stage: 'INGEST', delayMs: 120, text: 'Ingested raw sonar log: sonar_089_trawl_gear.png (1024x768, 900 kHz)', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 400, text: 'Denoise: median filter + slant-range geometric correction applied', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 650, text: 'Histogram dynamic adjustment: SNR improved by +12.8 dB', level: 'success' },
      { stage: 'DETECT', delayMs: 1050, text: 'Detector: YOLOv8 ONNX found 2 candidate acoustic structures', level: 'info' },
      { stage: 'FILTER', delayMs: 1450, text: 'Filter REJECTED Candidate #2: Multipath ghost echo (Confidence 0.215, Zero bottom contact)', level: 'reject' },
      { stage: 'FILTER', delayMs: 1750, text: 'Filter ACCEPTED Target SX-T02: "Fishing Gear & Trawl Net" (Confidence: 91.2%, Shadow: 1.94m)', level: 'success' },
      { stage: 'REPORT', delayMs: 2150, text: 'Geotagging: Lat 18.9184° N, Lon 72.8241° E attached (Depth: 41.8m)', level: 'info' },
      { stage: 'REPORT', delayMs: 2400, text: 'Report generated: anomaly_record_SX-T02.json registered', level: 'success' },
    ],
  },

  // --- SCENARIO 3: SUBSEA PIPELINE HAZARD ---
  {
    id: 'sample-03-pipeline-span',
    filename: 'sonar_115_pipeline_hazard.png',
    title: 'Swath Line 03 · Industrial Offshore Sector',
    swathWidthM: 75,
    frequency: '450 kHz SSS',
    rawNoiseDescription: 'Low-frequency acoustic backscatter decay & seabed attenuation',
    filteredNoiseDescription: 'Linear feature enhancement + Time-Varied Gain (TVG) normalization',
    contrastImprovementDb: 15.6,
    detections: [
      {
        id: 'SX-T05',
        label: 'Subsea Pipeline Hazard',
        classCode: 'PIPE',
        confidence: 0.864,
        x: 25,
        y: 40,
        width: 50,
        height: 14,
        status: 'ACCEPTED',
        depthM: 47.2,
        lengthM: 24.0,
        widthM: 1.2,
        shadowLengthM: 2.6,
        lat: 18.9115,
        lon: 72.8268,
      },
    ],
    logs: [
      { stage: 'INGEST', delayMs: 120, text: 'Ingested raw sonar log: sonar_115_pipeline_hazard.png (1024x768, 450 kHz)', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 420, text: 'Denoise: anisotropic diffusion filter applied; continuous linear edges preserved', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 680, text: 'Contrast dynamic range increased by +15.6 dB', level: 'success' },
      { stage: 'DETECT', delayMs: 1100, text: 'Detector: 1 extended linear anomaly detected across 24 meters', level: 'info' },
      { stage: 'FILTER', delayMs: 1500, text: 'Filter: Shadow relief verified (2.6m parallel acoustic shadow confirms unburied free span)', level: 'success' },
      { stage: 'FILTER', delayMs: 1800, text: 'Filter ACCEPTED Target SX-T05: "Subsea Pipeline Hazard" (Confidence: 86.4%)', level: 'success' },
      { stage: 'REPORT', delayMs: 2200, text: 'Geotagging: Lat 18.9115° N, Lon 72.8268° E attached (Depth: 47.2m)', level: 'info' },
      { stage: 'REPORT', delayMs: 2450, text: 'Report generated: anomaly_record_SX-T05.json registered', level: 'success' },
    ],
  },

  // --- SCENARIO 4: ANTHROPOGENIC DEBRIS CLUSTER ---
  {
    id: 'sample-04-debris-bundle',
    filename: 'sonar_142_debris_bundle.png',
    title: 'Swath Line 03 · Coastal Inshore Reef Boundary',
    swathWidthM: 75,
    frequency: '900 kHz SSS',
    rawNoiseDescription: 'Seabed sediment clutter & organic macroalgae scatter',
    filteredNoiseDescription: 'High-pass impedance contrast enhancement + speckle suppression',
    contrastImprovementDb: 13.5,
    detections: [
      {
        id: 'SX-T03',
        label: 'Anthropogenic Marine Debris',
        classCode: 'DEBRIS',
        confidence: 0.889,
        x: 38,
        y: 45,
        width: 18,
        height: 16,
        status: 'ACCEPTED',
        depthM: 45.7,
        lengthM: 4.8,
        widthM: 2.1,
        shadowLengthM: 2.85,
        lat: 18.9142,
        lon: 72.8189,
      },
      {
        id: 'SX-T09',
        label: 'Industrial Metal Barrel',
        classCode: 'BARREL',
        confidence: 0.812,
        x: 65,
        y: 35,
        width: 14,
        height: 12,
        status: 'ACCEPTED',
        depthM: 48.4,
        lengthM: 2.1,
        widthM: 1.2,
        shadowLengthM: 2.4,
        lat: 18.9168,
        lon: 72.8125,
      },
    ],
    logs: [
      { stage: 'INGEST', delayMs: 120, text: 'Ingested raw sonar log: sonar_142_debris_bundle.png (1024x768, 900 kHz)', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 400, text: 'Denoise: High-frequency acoustic speckle filter applied', level: 'info' },
      { stage: 'PREPROCESS', delayMs: 650, text: 'Impedance mismatch enhancement (+13.5 dB contrast)', level: 'success' },
      { stage: 'DETECT', delayMs: 1050, text: 'Detector: 2 man-made geometric structures isolated', level: 'info' },
      { stage: 'FILTER', delayMs: 1450, text: 'Filter ACCEPTED Target SX-T03: "Anthropogenic Debris" (Confidence: 88.9%)', level: 'success' },
      { stage: 'FILTER', delayMs: 1750, text: 'Filter ACCEPTED Target SX-T09: "Industrial Metal Barrel" (Confidence: 81.2%)', level: 'success' },
      { stage: 'REPORT', delayMs: 2150, text: 'Geotagging: Lat 18.9142° N, Lon 72.8189° E & Lat 18.9168° N, Lon 72.8125° E attached', level: 'info' },
      { stage: 'REPORT', delayMs: 2450, text: 'Report generated: 2 anomaly records registered to MoES dossier', level: 'success' },
    ],
  },
];
