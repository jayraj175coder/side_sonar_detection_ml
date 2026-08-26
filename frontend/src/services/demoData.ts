import { PredictionResponse, StatsResponse } from '../types';

// Procedural SVG-based side-scan sonar image generator for standalone demo mode
export function generateSampleSonarImageDataUrl(seed: number, label: string): string {
  const width = 800;
  const height = 600;

  // Create an authentic side-scan sonar gradient & acoustic texture
  let noisePats = '';
  for (let i = 0; i < 40; i++) {
    const y = (i * 15 + seed * 7) % height;
    const opacity = ((i % 5) * 0.08 + 0.05).toFixed(2);
    noisePats += `<line x1="0" y1="${y}" x2="${width}" y2="${y + 2}" stroke="#38BDF8" stroke-width="1" stroke-opacity="${opacity}" stroke-dasharray="4 8 12 4" />`;
  }

  // Draw acoustic center nadir track (water column)
  const nadirWidth = 60;
  const nadirX = width / 2 - nadirWidth / 2;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="sonarBg_${seed}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#050C1A" />
        <stop offset="42%" stop-color="#0E2342" />
        <stop offset="50%" stop-color="#030712" />
        <stop offset="58%" stop-color="#0E2342" />
        <stop offset="100%" stop-color="#050C1A" />
      </linearGradient>
      <radialGradient id="targetGlow_${seed}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#F97316" stop-opacity="0.8" />
        <stop offset="60%" stop-color="#F97316" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#0E2342" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="obstacleGlow_${seed}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.8" />
        <stop offset="70%" stop-color="#06B6D4" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#0E2342" stop-opacity="0" />
      </radialGradient>
    </defs>
    
    <!-- Background acoustic field -->
    <rect width="${width}" height="${height}" fill="url(#sonarBg_${seed})" />
    
    <!-- Acoustic scanlines & seabed textures -->
    ${noisePats}
    
    <!-- Water column / nadir gap -->
    <rect x="${nadirX}" y="0" width="${nadirWidth}" height="${height}" fill="#020617" opacity="0.95" />
    <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#06B6D4" stroke-width="1" stroke-dasharray="6 6" opacity="0.4" />
    
    <!-- Seabed acoustic reflections & acoustic shadows -->
    ${
      seed === 1
        ? `
      <!-- MILCO target high-backscatter & acoustic shadow -->
      <ellipse cx="280" cy="240" rx="35" ry="18" fill="url(#targetGlow_${seed})" />
      <polygon points="265,232 295,232 290,248 260,248" fill="#FEF08A" opacity="0.9" />
      <polygon points="295,232 370,225 365,255 290,248" fill="#020617" opacity="0.9" />
      <!-- NOMBO boulder -->
      <circle cx="560" cy="380" r="22" fill="url(#obstacleGlow_${seed})" />
      <polygon points="560,370 620,365 615,395 560,390" fill="#020617" opacity="0.85" />
    `
        : seed === 2
        ? `
      <!-- Multiple NOMBO obstacles -->
      <ellipse cx="230" cy="320" rx="28" ry="16" fill="url(#obstacleGlow_${seed})" />
      <polygon points="230,312 290,308 285,328 230,328" fill="#020617" opacity="0.85" />
      <ellipse cx="580" cy="180" rx="32" ry="20" fill="url(#obstacleGlow_${seed})" />
      <polygon points="580,170 650,165 645,190 580,190" fill="#020617" opacity="0.85" />
    `
        : `
      <!-- Clear survey seabed with subtle ripple patterns -->
      <path d="M 50,150 Q 200,160 350,150 T 750,150" stroke="#0E7490" stroke-width="1.5" fill="none" opacity="0.3" />
      <path d="M 50,320 Q 200,330 350,320 T 750,320" stroke="#0E7490" stroke-width="1.5" fill="none" opacity="0.3" />
      <path d="M 50,480 Q 200,490 350,480 T 750,480" stroke="#0E7490" stroke-width="1.5" fill="none" opacity="0.3" />
    `
    }
    
    <!-- Telemetry overlay in image -->
    <text x="20" y="30" fill="#38BDF8" font-family="monospace" font-size="12" opacity="0.7">SONARX SSS-900 kHz | RANGE: 50m | ${label}</text>
    <text x="20" y="${height - 20}" fill="#94A3B8" font-family="monospace" font-size="11" opacity="0.6">ALT: 8.4m | SPEED: 3.2 kts | LAT: 17.686° N | LON: 83.218° E | REGION: ENC VIZAG</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_SCANS: PredictionResponse[] = [
  {
    scan_id: 'DEMO-SCAN-8841',
    filename: 'sonar_track_vizag_harbor_milco_01.png',
    image_width: 800,
    image_height: 600,
    inference_ms: 9.6,
    created_at: '2026-08-26T14:32:00Z',
    confidence_threshold: 0.25,
    total_detections: 2,
    milco_count: 1,
    nombo_count: 1,
    highest_confidence: 0.912,
    status: 'completed',
    location: {
      latitude: 17.6842,
      longitude: 83.3215,
    },
    imageUrl: generateSampleSonarImageDataUrl(1, 'TRACK-ALPHA-VIZAG'),
    detections: [
      {
        id: 'det_demo_1',
        type: 'MILCO',
        confidence: 0.912,
        bbox: {
          x1: 240,
          y1: 215,
          x2: 375,
          y2: 265,
        },
      },
      {
        id: 'det_demo_2',
        type: 'NOMBO',
        confidence: 0.748,
        bbox: {
          x1: 540,
          y1: 355,
          x2: 630,
          y2: 405,
        },
      },
    ],
  },
  {
    scan_id: 'DEMO-SCAN-4920',
    filename: 'sonar_track_kochi_channel_nombo_02.png',
    image_width: 800,
    image_height: 600,
    inference_ms: 10.1,
    created_at: '2026-08-26T12:15:00Z',
    confidence_threshold: 0.25,
    total_detections: 2,
    milco_count: 0,
    nombo_count: 2,
    highest_confidence: 0.835,
    status: 'completed',
    location: {
      latitude: 9.9312,
      longitude: 76.2673,
    },
    imageUrl: generateSampleSonarImageDataUrl(2, 'TRACK-BRAVO-KOCHI'),
    detections: [
      {
        id: 'det_demo_3',
        type: 'NOMBO',
        confidence: 0.835,
        bbox: {
          x1: 210,
          y1: 295,
          x2: 300,
          y2: 345,
        },
      },
      {
        id: 'det_demo_4',
        type: 'NOMBO',
        confidence: 0.692,
        bbox: {
          x1: 560,
          y1: 150,
          x2: 660,
          y2: 205,
        },
      },
    ],
  },
  {
    scan_id: 'DEMO-SCAN-1193',
    filename: 'sonar_track_mumbai_high_trench_03.png',
    image_width: 800,
    image_height: 600,
    inference_ms: 9.4,
    created_at: '2026-08-26T09:48:00Z',
    confidence_threshold: 0.25,
    total_detections: 0,
    milco_count: 0,
    nombo_count: 0,
    highest_confidence: 0.0,
    status: 'completed',
    location: {
      latitude: 18.9220,
      longitude: 72.8347,
    },
    imageUrl: generateSampleSonarImageDataUrl(3, 'TRACK-CHARLIE-MUMBAI'),
    detections: [],
  },
];

export const DEMO_STATS: StatsResponse = {
  total_scans: 3,
  objects_detected: 4,
  milco_detections: 1,
  nombo_detections: 3,
  avg_confidence: 0.797,
  avg_inference_ms: 9.7,
  class_distribution: {
    MILCO: 1,
    NOMBO: 3,
  },
  recent_scans: DEMO_SCANS.map((s) => ({
    scan_id: s.scan_id,
    filename: s.filename,
    created_at: s.created_at,
    detection_count: s.total_detections,
    milco_count: s.milco_count,
    nombo_count: s.nombo_count,
    highest_confidence: s.highest_confidence,
    avg_confidence:
      s.detections.length > 0
        ? Number(
            (
              s.detections.reduce((acc, d) => acc + d.confidence, 0) /
              s.detections.length
            ).toFixed(3)
          )
        : 0,
    inference_ms: s.inference_ms,
    location: s.location,
    status: s.status,
  })),
};
