import { CandidateItem } from '../data/consoleData';

export interface DriftNode {
  hours: number;
  timeLabel: string;
  lat: number;
  lon: number;
  driftNm: number;
  canvasX?: number;
  canvasY?: number;
}

export interface DriftProjection {
  candidateId: string;
  candidateClass: string;
  currentSpeedKnots: number;
  bearingDeg: number;
  bearingCardinal: string;
  nodes: DriftNode[];
  recommendedInterceptWindow: string;
  recommendedInterceptCoords: string;
  disclaimer: string;
}

/**
 * Honest estimated drift calculation using a representative coastal current vector
 * (0.42 knots @ 068° ENE). Clearly labeled as demo current model.
 */
export function calculateDriftProjection(cand: CandidateItem): DriftProjection {
  const currentSpeedKnots = 0.42; // realistic coastal shelf tidal-residual current
  const bearingDeg = 68; // ENE
  const bearingRad = (bearingDeg * Math.PI) / 180;
  const bearingCardinal = '068° ENE';

  // 1 nautical mile ≈ 1 minute of latitude = 1/60 degree
  const nmToDegLat = 1 / 60;
  const avgLatRad = (cand.lat * Math.PI) / 180;
  const nmToDegLon = nmToDegLat / Math.cos(avgLatRad);

  const hoursList = [24, 48, 72];
  const nodes: DriftNode[] = hoursList.map((hrs) => {
    const driftNm = currentSpeedKnots * hrs;
    const deltaLat = driftNm * Math.cos(bearingRad) * nmToDegLat;
    const deltaLon = driftNm * Math.sin(bearingRad) * nmToDegLon;

    return {
      hours: hrs,
      timeLabel: `T+${hrs}h`,
      lat: Number((cand.lat + deltaLat).toFixed(4)),
      lon: Number((cand.lon + deltaLon).toFixed(4)),
      driftNm: Number(driftNm.toFixed(1)),
    };
  });

  const t48 = nodes[1];
  const recommendedInterceptWindow = 'Next 48h';
  const recommendedInterceptCoords = `${t48.lat.toFixed(4)}°N, ${t48.lon.toFixed(4)}°E`;

  return {
    candidateId: cand.id,
    candidateClass: cand.class,
    currentSpeedKnots,
    bearingDeg,
    bearingCardinal,
    nodes,
    recommendedInterceptWindow,
    recommendedInterceptCoords,
    disclaimer: 'Estimated drift (demo coastal current model: 0.42 kts @ 068° ENE)',
  };
}
