// Every word and number shown on /ani lives here, so the story stays consistent with the repo.
import { MISSION_TARGETS } from '../data/targets';
import { INDIA_MARITIME_SECTORS, ACTIVE_SURVEY_TRACKLINES } from '../data/indiaMapData';

export const HERO = MISSION_TARGETS.find((t) => t.id === 'SX-T07')!;
export const SECTORS = INDIA_MARITIME_SECTORS;
export const TRACKLINES = ACTIVE_SURVEY_TRACKLINES;

export type ActId = 'dive' | 'reveal' | 'console' | 'locate' | 'system' | 'impact';
export const ACTS: { id: ActId; label: string; screens: number }[] = [
  { id: 'dive', label: 'The Dark', screens: 8 },
  { id: 'reveal', label: 'SONARX', screens: 4 },
  { id: 'console', label: 'Console', screens: 11 },
  { id: 'locate', label: 'Locate', screens: 5 },
  { id: 'system', label: 'System', screens: 6 },
  { id: 'impact', label: 'Impact', screens: 4 },
];
export const actScreens = (id: ActId) => ACTS.find((a) => a.id === id)!.screens;

export type Sfx = 'ping' | 'lock' | 'depth' | 'target' | 'alarm' | 'whoosh' | 'thud' | 'tick';
export interface Beat { at: number; text?: string; sfx?: Sfx }

// Lower-third captions (the reference video's voice-over) + beat sounds, in act "screens".
export const BEATS: Record<ActId, Beat[]> = {
  dive: [
    { at: 0, text: '' },
    { at: 1.2, text: 'Lost or abandoned fishing gear keeps trapping marine life, smothering reefs and fouling ship propellers.' },
    { at: 2.3, text: 'Finding them is the hard part. A few metres down, cameras stop seeing.' },
    { at: 3.0, text: 'So survey teams listen instead.' },
    { at: 3.6, text: 'Side-scan sonar sweeps the seabed with sound, one ping at a time.', sfx: 'ping' },
    { at: 4.2, text: 'Anything that rises off the seabed casts an acoustic shadow. Remember that.', sfx: 'lock' },
    { at: 5.0, text: '', sfx: 'ping' },
    { at: 5.6, text: 'Ping by ping, the echoes build a picture of the seafloor.' },
    { at: 6.4, text: 'Thousands of kilometres of it, checked by eye.' },
    { at: 7.0, text: '' },
    { at: 7.65, sfx: 'lock' },
    { at: 7.75, sfx: 'depth' },
  ],
  reveal: [
    { at: 0, text: '', sfx: 'depth' },
    { at: 0.1, sfx: 'ping' },
    { at: 0.9, sfx: 'tick' },
    { at: 1.8, text: 'Raw acoustic data in. Verified marine intelligence out.' },
    { at: 2.6, text: '', sfx: 'whoosh' },
    { at: 3.4, sfx: 'ping' },
  ],
  console: [
    { at: 0, text: 'Step one: ingest.', sfx: 'tick' },
    { at: 0.6, text: 'The raw swath arrives with its ping log: time, position, heading, altitude.' },
    { at: 1.5, text: 'Speckle, gain banding and motion dropouts get cleaned up before any AI sees the image.' },
    { at: 3.5, text: 'A YOLOv8s model scans every tile, about 35 ms each on a plain CPU.' },
    { at: 5.4, text: '37 candidates. Not all of them are real.' },
    { at: 6.0, text: 'Rocks and sand ripples can look like debris. Their shadows give them away.' },
    { at: 6.6, text: 'A real object casts a shadow that matches its height. Clutter doesn’t.', sfx: 'lock' },
    { at: 7.1, sfx: 'thud' },
    { at: 7.6, text: '20 look-alikes rejected. 17 verified.' },
    { at: 8.4, text: 'Every survivor gets a confidence score from 0 to 100%.' },
    { at: 9.0, text: 'Each one is classified: ghost net, debris, pipeline or seafloor anomaly.' },
    { at: 9.8, text: 'Target SX-T07: an entangled ghost net. 94.7% confidence. Critical.', sfx: 'target' },
    { at: 10.3, sfx: 'alarm' },
  ],
  locate: [
    { at: 0, text: 'Pixels become coordinates.' },
    { at: 0.8, text: 'Slant range becomes ground range, fused with the ping log’s position and heading.' },
    { at: 1.6, text: '', sfx: 'ping' },
    { at: 2.2, text: 'Every target lands on the map.' },
    { at: 3.0, text: 'Then SONARX writes the report: class, location, size, confidence and severity.' },
    { at: 4.4, text: 'JSON or CSV, ready for the response team.', sfx: 'tick' },
  ],
  system: [
    { at: 0, text: 'One dashboard: upload a sonar log, watch detections appear, download the report.', sfx: 'whoosh' },
    { at: 0.6, text: 'The AI proposes. A human confirms.' },
    { at: 2.2, text: 'Trained on 5,205 sonar tiles. Runs offline on the edge, no cloud needed.' },
    { at: 3.8, text: 'Built on open sonar data and open-source tools.' },
  ],
  impact: [
    { at: 0, text: 'From a single swath to India’s whole coastline.' },
    { at: 1.2, text: 'Built for the teams who clean up the ocean.' },
    { at: 2.0, text: 'Less time searching. More time recovering.', sfx: 'whoosh' },
    { at: 3.0, text: '' },
    { at: 3.5, sfx: 'ping' },
  ],
};

export const TEAM = { name: 'DEAD BRAINCELLS', id: '161987', ps: '26057', event: 'SMART INDIA HACKATHON 2026' };
export const MISSION = {
  id: 'SX-014',
  area: 'MUMBAI SHELF CORRIDOR',
  file: 'line02.xtf',
  pings: 6200,
  clockStart: Date.UTC(2026, 7, 27, 9, 30, 0), // sample_ping_log.csv, mumbai trench row
  telemetry: [
    ['FREQ', '900 kHz'],
    ['ALT', '9.5 m'],
    ['SPEED', '3.2 kt'],
    ['SWATH', '120 m'],
  ] as [string, string][],
};

export const MODEL = {
  name: 'YOLOv8s',
  params: '11.2M params',
  tile: '640×640 tiles',
  runtime: 'ONNX Runtime',
  cpuMs: 35.2,
  gpuMs: 14.5,
};

export const METRICS: { value: number; decimals: number; suffix: string; label: string }[] = [
  { value: 74.09, decimals: 2, suffix: '%', label: 'mAP@50' },
  { value: 77.73, decimals: 2, suffix: '%', label: 'Precision' },
  { value: 74.61, decimals: 2, suffix: '%', label: 'Recall' },
  { value: 99.5, decimals: 1, suffix: '%', label: 'Ghost-net AP' },
  { value: 35.2, decimals: 1, suffix: ' ms', label: 'CPU inference' },
  { value: 5205, decimals: 0, suffix: '', label: 'Training tiles' },
];
export const CLASS_AP: { label: string; ap: number }[] = [
  { label: 'Ghost net (ALDFG)', ap: 99.5 },
  { label: 'Pipeline hazard', ap: 99.49 },
  { label: 'Seafloor anomaly', ap: 55.59 },
  { label: 'Anthropogenic debris', ap: 41.78 },
];

export type ClassKey = 'ghost_net_aldfg' | 'anthropogenic_debris' | 'pipeline_hazard' | 'seafloor_anomaly';
export const CLASSES: Record<ClassKey, { label: string; short: string; color: string }> = {
  ghost_net_aldfg: { label: 'Ghost net (ALDFG)', short: 'net', color: '#FFB703' },
  anthropogenic_debris: { label: 'Anthropogenic debris', short: 'debris', color: '#38BDF8' },
  pipeline_hazard: { label: 'Pipeline hazard', short: 'pipeline', color: '#A78BFA' },
  seafloor_anomaly: { label: 'Seafloor anomaly', short: 'anomaly', color: '#10B981' },
};

export const EVIDENCE: [string, number][] = [
  ['Object shape', HERO.evidence.objectShape],
  ['Acoustic intensity', HERO.evidence.acousticIntensity],
  ['Shadow geometry', HERO.evidence.shadowGeometry],
  ['Seabed contrast', HERO.evidence.seabedContrast],
  ['Dimensions', HERO.evidence.dimensionalSimilarity],
  ['Backscatter', HERO.evidence.backscatterPattern],
];

// Geometry shown in Act IV, computed (not copied) so it is self-consistent.
export const ALT_M = 9.5;
export const SLANT_M = HERO.slantRange; // 24.6
export const GROUND_M = Math.sqrt(SLANT_M ** 2 - ALT_M ** 2); // ≈ 22.7
export const EXPECTED_SHADOW_M = (HERO.estimatedHeight * GROUND_M) / (ALT_M - HERO.estimatedHeight); // ≈ 2.14

export const DATASETS = ['SubPipe', 'NOAA AI4Shipwrecks', 'Kaggle mine sonar', 'Roboflow SSS', 'Hard-negative seabed'];
export const TOOLS = ['Python', 'YOLOv8', 'OpenCV', 'ONNX Runtime', 'FastAPI', 'React', 'Leaflet', 'MongoDB', 'Google Colab', 'AWS'];

export const DASH_PANELS = [
  'Upload raw sonar log',
  'Live detection overlay',
  'Anomaly map',
  'Confidence & class',
  'JSON / CSV export',
  'Human review',
];

export const IMPACT: { title: string; body: string; color: string }[] = [
  { title: 'Environmental', body: 'Supports targeted debris retrieval and marine-impact monitoring.', color: '#10B981' },
  { title: 'Social', body: 'Safer waterways, cleaner coasts and better-informed survey operations.', color: '#38BDF8' },
  { title: 'Economic', body: 'Cuts manual screening effort and prioritises inspection resources.', color: '#FFB703' },
  { title: 'Responsible', body: 'Shows confidence, class, location and evidence. Keeps human review central.', color: '#F43F5E' },
];
export const AUDIENCES = ['Survey & marine analysts', 'Conservation & response teams', 'Port & coastal authorities'];

export const STEPS = ['Detect', 'Filter', 'Geotag', 'Report'];
