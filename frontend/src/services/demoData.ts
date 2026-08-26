import { PredictionResponse, StatsResponse } from '../types';

// Returns sample sonar PNG paths from public directory
export function getSampleSonarImagePath(seed: number): string {
  if (seed === 1) return '/samples/sonar_track_vizag_milco.png';
  if (seed === 2) return '/samples/sonar_track_kochi_nombo.png';
  return '/samples/sonar_track_mumbai_trench.png';
}

// Client-side HTML5 canvas generator that always yields genuine PNG raster blobs
export async function generateSampleSonarPngBlob(seed: number, label: string): Promise<Blob> {
  // Try fetching the pre-rendered high-quality PNG first
  try {
    const path = getSampleSonarImagePath(seed);
    const res = await fetch(path);
    if (res.ok) {
      return await res.blob();
    }
  } catch (e) {
    // Fall back to offscreen canvas generation
  }

  const width = 800;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Draw authentic side-scan sonar gradient & acoustic texture
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#050C1A');
  gradient.addColorStop(0.42, '#0E2342');
  gradient.addColorStop(0.5, '#030712');
  gradient.addColorStop(0.58, '#0E2342');
  gradient.addColorStop(1, '#050C1A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Acoustic speckle lines
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1;
  for (let i = 0; i < 45; i++) {
    const y = (i * 14 + seed * 7) % height;
    ctx.globalAlpha = ((i % 5) * 0.08 + 0.04);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // Center nadir water column gap
  const nadirWidth = 56;
  const nadirX = width / 2 - nadirWidth / 2;
  ctx.fillStyle = '#020617';
  ctx.fillRect(nadirX, 0, nadirWidth, height);

  // Targets
  if (seed === 1) {
    // MILCO high-backscatter target
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.ellipse(280, 240, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Acoustic shadow
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(280, 234);
    ctx.lineTo(370, 226);
    ctx.lineTo(365, 254);
    ctx.lineTo(280, 246);
    ctx.closePath();
    ctx.fill();

    // NOMBO boulder
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(560, 380, 16, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(560, 372);
    ctx.lineTo(620, 366);
    ctx.lineTo(615, 394);
    ctx.lineTo(560, 388);
    ctx.closePath();
    ctx.fill();
  } else if (seed === 2) {
    // Multiple NOMBO obstacles
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(230, 320, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(230, 314);
    ctx.lineTo(290, 310);
    ctx.lineTo(285, 330);
    ctx.lineTo(230, 326);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(580, 180, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(580, 172);
    ctx.lineTo(650, 166);
    ctx.lineTo(645, 192);
    ctx.lineTo(580, 188);
    ctx.closePath();
    ctx.fill();
  }

  // Telemetry HUD text
  ctx.font = '12px monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText(`SONARX SSS-900 kHz | RANGE: 50m | ${label}`, 20, 30);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px monospace';
  ctx.fillText('ALT: 8.4m | SPEED: 3.2 kts | LAT: 17.686° N | LON: 83.218° E | REGION: ENC VIZAG', 20, height - 20);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([], { type: 'image/png' }));
    }, 'image/png');
  });
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
    imageUrl: '/samples/sonar_track_vizag_milco.png',
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
    imageUrl: '/samples/sonar_track_kochi_nombo.png',
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
    imageUrl: '/samples/sonar_track_mumbai_trench.png',
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
