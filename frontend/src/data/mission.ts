import type { MissionData } from '../types';

/** Mission SX-014 — Arabian Sea Survey */
export const MISSION_DATA: MissionData = {
  id: 'SX-014',
  name: 'Arabian Sea Survey',
  region: 'Arabian Sea — Mumbai Sector',
  vessel: 'INS SANDHAYAK AUV-3',
  operator: 'NHO — National Hydrographic Office',
  status: 'complete',
  startTime: '2026-08-31T04:18:00Z',
  endTime: '2026-08-31T06:32:32Z',
  duration: '02:14:32',
  surveyedArea: 12.84,
  trackLength: 38.7,
  avgDepth: 46.3,
  coveragePercent: 87,
  frequency: '900 kHz',
  swathWidth: 75,
  altimeter: 8.4,
  pingRate: 10,
  totalPings: 80829,
  sonarModel: 'EdgeTech 4200-FS',
  /**
   * Vessel track waypoints [lat, lon, timeSeconds]
   * 12 waypoints forming a lawnmower survey pattern
   */
  track: [
    { lat: 18.9350, lon: 72.8100, timeSeconds: 0,    depth: 38.2, heading: 178, speed: 4.1 },
    { lat: 18.9280, lon: 72.8100, timeSeconds: 612,  depth: 40.4, heading: 178, speed: 4.1 },
    { lat: 18.9210, lon: 72.8100, timeSeconds: 1224, depth: 43.1, heading: 178, speed: 4.0 },
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
  const clamped = Math.max(0, Math.min(timeSeconds, MISSION_DURATION_SECONDS));

  let i = 0;
  while (i < track.length - 1 && track[i + 1].timeSeconds <= clamped) i++;

  if (i >= track.length - 1) {
    const last = track[track.length - 1];
    return { lat: last.lat, lon: last.lon, depth: last.depth, heading: last.heading, speed: last.speed };
  }

  const a = track[i];
  const b = track[i + 1];
  const t = (clamped - a.timeSeconds) / (b.timeSeconds - a.timeSeconds);

  return {
    lat:     a.lat     + (b.lat     - a.lat)     * t,
    lon:     a.lon     + (b.lon     - a.lon)     * t,
    depth:   a.depth   + (b.depth   - a.depth)   * t,
    heading: a.heading + (b.heading - a.heading) * t,
    speed:   a.speed   + (b.speed   - a.speed)   * t,
  };
}
