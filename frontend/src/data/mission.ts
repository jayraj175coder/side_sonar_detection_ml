import type { MissionData } from '../types';

/** Mission MX-026 — Marine Debris & Seabed Survey (MoES SIH 2026) */
export const MISSION_DATA: MissionData = {
  id: 'MX-026',
  name: 'Marine Debris Survey MX-026',
  region: 'Coastal Seabed Survey — Arabian Sea Sector',
  vessel: 'MoES Hydrographic Autonomous Vehicle AUV-3',
  operator: 'Ministry of Earth Sciences (MoES)',
  status: 'complete',
  startTime: '2026-08-31T04:18:00Z',
  endTime: '2026-08-31T06:32:32Z',
  duration: '02:14:32',
  surveyedArea: 12.84,
  trackLength: 38.7,
  avgDepth: 43.1,
  coveragePercent: 94,
  frequency: '900 kHz',
  swathWidth: 75,
  altimeter: 8.4,
  pingRate: 10,
  totalPings: 80829,
  sonarModel: 'High-Resolution Dual-Frequency SSS (900/450 kHz)',
  tracklines: [
    {
      id: 'LINE-01',
      name: 'North Swath · Inshore Pass',
      code: 'TRK-01',
      heading: 178,
      pingsRange: '0001–2100',
      lengthKm: 9.8,
      status: 'complete',
      targetIds: ['SX-T01', 'SX-T04', 'SX-T13', 'SX-T17'],
    },
    {
      id: 'LINE-02',
      name: 'Central Corridor · Hero Debris Swath',
      code: 'TRK-02',
      heading: 178,
      pingsRange: '2101–4500',
      lengthKm: 10.4,
      status: 'surveying',
      targetIds: ['SX-T07', 'SX-T02', 'SX-T06', 'SX-T12'],
    },
    {
      id: 'LINE-03',
      name: 'South Shoal & Marine Sanctuary Edge',
      code: 'TRK-03',
      heading: 358,
      pingsRange: '4501–6800',
      lengthKm: 9.6,
      status: 'nominal',
      targetIds: ['SX-T03', 'SX-T05', 'SX-T08', 'SX-T10'],
    },
    {
      id: 'LINE-04',
      name: 'East Deep Trench Swath',
      code: 'TRK-04',
      heading: 178,
      pingsRange: '6801–8800',
      lengthKm: 8.9,
      status: 'nominal',
      targetIds: ['SX-T09', 'SX-T11', 'SX-T14', 'SX-T15', 'SX-T16'],
    },
  ],
  /**
   * Vessel track waypoints [lat, lon, timeSeconds]
   */
  track: [
    { lat: 18.9350, lon: 72.8100, timeSeconds: 0,    depth: 38.2, heading: 178, speed: 4.1 },
    { lat: 18.9280, lon: 72.8100, timeSeconds: 612,  depth: 40.4, heading: 178, speed: 4.1 },
    { lat: 18.9217, lon: 72.8214, timeSeconds: 1224, depth: 43.1, heading: 178, speed: 4.0 },
    { lat: 18.9140, lon: 72.8100, timeSeconds: 1836, depth: 45.7, heading: 178, speed: 4.2 },
    { lat: 18.9070, lon: 72.8100, timeSeconds: 2448, depth: 48.3, heading: 178, speed: 4.1 },
    { lat: 18.9070, lon: 72.8200, timeSeconds: 2700, depth: 48.8, heading: 90, speed: 3.8 },
    { lat: 18.9140, lon: 72.8200, timeSeconds: 3312, depth: 46.2, heading: 358, speed: 4.1 },
    { lat: 18.9210, lon: 72.8200, timeSeconds: 3924, depth: 43.4, heading: 358, speed: 4.0 },
    { lat: 18.9280, lon: 72.8200, timeSeconds: 4536, depth: 41.1, heading: 358, speed: 4.2 },
    { lat: 18.9350, lon: 72.8200, timeSeconds: 5148, depth: 38.6, heading: 358, speed: 4.1 },
    { lat: 18.9350, lon: 72.8300, timeSeconds: 5400, depth: 38.1, heading: 90, speed: 3.9 },
    { lat: 18.9070, lon: 72.8300, timeSeconds: 6572, depth: 49.1, heading: 178, speed: 4.0 },
  ],
  /** Survey polygon corners */
  polygon: [
    [18.9350, 72.8080],
    [18.9070, 72.8080],
    [18.9070, 72.8320],
    [18.9350, 72.8320],
  ] as [number, number][],
};

/** Total mission duration in seconds */
export const MISSION_DURATION_SECONDS = 6572;

/** Interpolate vessel position at given time (seconds) */
export function interpolateVesselPosition(
  timeSeconds: number
): { lat: number; lon: number; depth: number; heading: number; speed: number } {
  const track = MISSION_DATA.track;
  if (!track || track.length === 0) {
    return { lat: 18.9217, lon: 72.8214, depth: 43.1, heading: 178, speed: 4.0 };
  }

  const clampedTime = Math.max(0, Math.min(timeSeconds, MISSION_DURATION_SECONDS));

  for (let i = 0; i < track.length - 1; i++) {
    const p1 = track[i];
    const p2 = track[i + 1];

    if (clampedTime >= p1.timeSeconds && clampedTime <= p2.timeSeconds) {
      const dt = p2.timeSeconds - p1.timeSeconds;
      const progress = dt > 0 ? (clampedTime - p1.timeSeconds) / dt : 0;

      return {
        lat: p1.lat + (p2.lat - p1.lat) * progress,
        lon: p1.lon + (p2.lon - p1.lon) * progress,
        depth: p1.depth + (p2.depth - p1.depth) * progress,
        heading: p1.heading,
        speed: p1.speed + (p2.speed - p1.speed) * progress,
      };
    }
  }

  const last = track[track.length - 1];
  return {
    lat: last.lat,
    lon: last.lon,
    depth: last.depth,
    heading: last.heading,
    speed: last.speed,
  };
}
