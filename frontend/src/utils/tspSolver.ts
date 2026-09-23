/**
 * SONARX TSP Route Optimizer & Marine Navigation Utility
 *
 * Implements:
 * 1. Great-circle spherical Haversine distance matrix (Nautical Miles)
 * 2. Nearest Neighbor tour construction heuristic
 * 3. 2-Opt local search refinement algorithm for crossing elimination
 * 4. Navigational bearing calculation
 * 5. TopoGrafix GPX 1.1 XML generation
 */

export interface NavPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'base' | 'ghost_net' | 'debris' | 'pipeline' | 'anomaly';
  depthM?: number;
  estimatedMassKg?: number;
  notes?: string;
}

export interface RouteLeg {
  from: NavPoint;
  to: NavPoint;
  distanceNM: number;
  cumulativeNM: number;
  bearingDeg: number;
  estMinutes: number;
  actionNote: string;
}

export interface TspSolution {
  orderedPoints: NavPoint[];
  legs: RouteLeg[];
  totalDistanceNM: number;
  unoptimizedDistanceNM: number;
  distanceSavedNM: number;
  percentSaved: number;
  estTransitHours: number;
  estOpsHours: number;
  totalMissionHours: number;
  totalMassRecoveredKg: number;
  energyConsumedKWh: number;
  co2SavedKg: number;
}

export interface VesselProfile {
  id: string;
  name: string;
  category: 'electric_rov' | 'hybrid_survey' | 'heavy_salvage';
  speedKnots: number;
  consumptionPerNM: number; // kWh/NM or Liters/NM
  consumptionUnit: 'kWh' | 'L';
  co2PerUnitKg: number; // 0 for green electric, 2.68 for marine diesel
  salvageTimePerTargetMin: number;
  maxPayloadKg: number;
}

export const BASE_PORTS: NavPoint[] = [
  {
    id: 'base-chennai',
    name: 'Chennai Base Terminal & Port Trust',
    lat: 13.0850,
    lon: 80.2980,
    type: 'base',
    notes: 'Primary Tamil Nadu Coast recovery station & ROV tender slipway',
  },
  {
    id: 'base-mumbai',
    name: 'Mumbai Naval Dockyard & Offshore Terminal',
    lat: 18.9260,
    lon: 72.8420,
    type: 'base',
    notes: 'Arabian Sea Continental Shelf salvage operations center',
  },
  {
    id: 'base-kochi',
    name: 'Kochi Naval Base / Cochin Port',
    lat: 9.9650,
    lon: 76.2620,
    type: 'base',
    notes: 'South-Western fisheries zone & coral ridge deployment station',
  },
  {
    id: 'base-vizag',
    name: 'Visakhapatnam Deepwater Harbor',
    lat: 17.6980,
    lon: 83.2980,
    type: 'base',
    notes: 'Bay of Bengal shelf slope rapid response berth',
  },
  {
    id: 'base-portblair',
    name: 'Port Blair Marine Station (Andaman)',
    lat: 11.6670,
    lon: 92.7480,
    type: 'base',
    notes: 'Island biosphere protection fleet berth',
  },
  {
    id: 'base-goa',
    name: 'Mormugao Port Trust (Goa)',
    lat: 15.4120,
    lon: 73.8050,
    type: 'base',
    notes: 'Central West Coast environmental survey base',
  },
];

export const CLEANUP_FLEET: VesselProfile[] = [
  {
    id: 'eco-rov-skimmer',
    name: 'Autonomous Eco-ROV Skimmer (Electric)',
    category: 'electric_rov',
    speedKnots: 6.5,
    consumptionPerNM: 1.4, // kWh/NM
    consumptionUnit: 'kWh',
    co2PerUnitKg: 0.0, // Zero direct emissions
    salvageTimePerTargetMin: 35,
    maxPayloadKg: 1200,
  },
  {
    id: 'niot-sagar-nidhi',
    name: 'NIOT Sagar Nidhi DP-2 Recovery Vessel (Hybrid)',
    category: 'hybrid_survey',
    speedKnots: 11.5,
    consumptionPerNM: 4.8, // L/NM
    consumptionUnit: 'L',
    co2PerUnitKg: 2.68,
    salvageTimePerTargetMin: 45,
    maxPayloadKg: 25000,
  },
  {
    id: 'swachh-sagar-tender',
    name: 'MoES Swachh Sagar Coastal Tender (Diesel-Electric)',
    category: 'heavy_salvage',
    speedKnots: 8.5,
    consumptionPerNM: 2.6, // L/NM
    consumptionUnit: 'L',
    co2PerUnitKg: 2.68,
    salvageTimePerTargetMin: 40,
    maxPayloadKg: 6500,
  },
];

/**
 * Calculates Great-Circle distance between two coordinates in Nautical Miles (WGS-84)
 */
export function haversineNM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes navigational initial course heading (bearing) in degrees [0, 360)
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const y = Math.sin((lon2 - lon1) * toRad) * Math.cos(lat2 * toRad);
  const x =
    Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
    Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos((lon2 - lon1) * toRad);
  const brng = Math.atan2(y, x) * toDeg;
  return (brng + 360) % 360;
}

/**
 * Solves Traveling Salesperson Problem using Nearest Neighbor + 2-Opt local search
 * Returns round-trip tour: base -> target_1 -> target_2 ... -> base
 */
export function solveTspRoute(
  base: NavPoint,
  targets: NavPoint[],
  vessel: VesselProfile
): TspSolution {
  if (targets.length === 0) {
    return {
      orderedPoints: [base],
      legs: [],
      totalDistanceNM: 0,
      unoptimizedDistanceNM: 0,
      distanceSavedNM: 0,
      percentSaved: 0,
      estTransitHours: 0,
      estOpsHours: 0,
      totalMissionHours: 0,
      totalMassRecoveredKg: 0,
      energyConsumedKWh: 0,
      co2SavedKg: 0,
    };
  }

  const allPoints = [base, ...targets];
  const n = allPoints.length;

  // 1. Build Distance Matrix
  const distMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) distMatrix[i][j] = 0;
      else {
        distMatrix[i][j] = haversineNM(
          allPoints[i].lat,
          allPoints[i].lon,
          allPoints[j].lat,
          allPoints[j].lon
        );
      }
    }
  }

  // Calculate unoptimized naive sequence distance: 0 -> 1 -> 2 -> ... -> n-1 -> 0
  let unoptimizedDist = 0;
  for (let i = 0; i < n - 1; i++) {
    unoptimizedDist += distMatrix[i][i + 1];
  }
  unoptimizedDist += distMatrix[n - 1][0];

  // 2. Nearest Neighbor Initial Tour Construction
  const visited = new Set<number>([0]);
  const tour = [0];
  let current = 0;

  while (visited.size < n) {
    let nearest = -1;
    let minDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && distMatrix[current][j] < minDist) {
        minDist = distMatrix[current][j];
        nearest = j;
      }
    }
    if (nearest !== -1) {
      tour.push(nearest);
      visited.add(nearest);
      current = nearest;
    }
  }
  // Return to base
  tour.push(0);

  // 3. 2-Opt Optimization Refinement
  let improved = true;
  let iterations = 0;
  const maxIterations = 200;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 1; i < tour.length - 2; i++) {
      for (let k = i + 1; k < tour.length - 1; k++) {
        const a = tour[i - 1];
        const b = tour[i];
        const c = tour[k];
        const d = tour[k + 1];

        const currentDist = distMatrix[a][b] + distMatrix[c][d];
        const newDist = distMatrix[a][c] + distMatrix[b][d];

        if (newDist < currentDist - 1e-6) {
          // Reverse segment from i to k
          let left = i;
          let right = k;
          while (left < right) {
            const temp = tour[left];
            tour[left] = tour[right];
            tour[right] = temp;
            left++;
            right--;
          }
          improved = true;
        }
      }
    }
  }

  // 4. Assemble Ordered Points and Navigational Legs
  const orderedPoints = tour.map((idx) => allPoints[idx]);
  const legs: RouteLeg[] = [];
  let totalDistanceNM = 0;

  for (let i = 0; i < orderedPoints.length - 1; i++) {
    const from = orderedPoints[i];
    const to = orderedPoints[i + 1];
    const legDist = haversineNM(from.lat, from.lon, to.lat, to.lon);
    totalDistanceNM += legDist;

    const bearing = calculateBearing(from.lat, from.lon, to.lat, to.lon);
    const transitMin = (legDist / vessel.speedKnots) * 60;

    let actionNote = `Transit to ${to.name}`;
    if (to.type === 'base') {
      actionNote = 'Return to Base Port & Offload Salvaged Material';
    } else if (to.type === 'ghost_net') {
      actionNote = 'Deploy hydraulic line cutter & net recovery winch';
    } else if (to.type === 'debris') {
      actionNote = 'Deploy grapple arm & ballast basket';
    } else if (to.type === 'pipeline') {
      actionNote = 'Inspect unburied scour span with multibeam & drop warning pinger';
    } else {
      actionNote = 'Acoustic verification & contact recovery';
    }

    legs.push({
      from,
      to,
      distanceNM: Number(legDist.toFixed(2)),
      cumulativeNM: Number(totalDistanceNM.toFixed(2)),
      bearingDeg: Math.round(bearing),
      estMinutes: Math.round(transitMin),
      actionNote,
    });
  }

  const distanceSaved = Math.max(0, unoptimizedDist - totalDistanceNM);
  const percentSaved = unoptimizedDist > 0 ? (distanceSaved / unoptimizedDist) * 100 : 0;

  const estTransitHours = totalDistanceNM / vessel.speedKnots;
  const estOpsHours = (targets.length * vessel.salvageTimePerTargetMin) / 60;
  const totalMissionHours = estTransitHours + estOpsHours;

  const totalMassRecoveredKg = targets.reduce((sum, t) => sum + (t.estimatedMassKg || 180), 0);

  // Energy consumed
  const energyConsumedKWh =
    vessel.consumptionUnit === 'kWh'
      ? totalDistanceNM * vessel.consumptionPerNM
      : totalDistanceNM * vessel.consumptionPerNM * 10.0; // Approx 10 kWh thermal equiv per liter

  // CO2 Emissions Saved vs unoptimized diesel baseline (baseline ~4.5 L diesel / NM * 2.68 kg CO2/L)
  const baselineDieselBurnLiters = unoptimizedDist * 4.2;
  const actualEmissionsKg =
    vessel.consumptionUnit === 'kWh'
      ? 0.0
      : totalDistanceNM * vessel.consumptionPerNM * vessel.co2PerUnitKg;
  const baselineEmissionsKg = baselineDieselBurnLiters * 2.68;
  const co2SavedKg = Math.max(0, baselineEmissionsKg - actualEmissionsKg);

  return {
    orderedPoints,
    legs,
    totalDistanceNM: Number(totalDistanceNM.toFixed(2)),
    unoptimizedDistanceNM: Number(unoptimizedDist.toFixed(2)),
    distanceSavedNM: Number(distanceSaved.toFixed(2)),
    percentSaved: Number(percentSaved.toFixed(1)),
    estTransitHours: Number(estTransitHours.toFixed(1)),
    estOpsHours: Number(estOpsHours.toFixed(1)),
    totalMissionHours: Number(totalMissionHours.toFixed(1)),
    totalMassRecoveredKg: Math.round(totalMassRecoveredKg),
    energyConsumedKWh: Number(energyConsumedKWh.toFixed(1)),
    co2SavedKg: Number(co2SavedKg.toFixed(1)),
  };
}

/**
 * Generates official TopoGrafix GPX 1.1 XML string for maritime navigation plotters
 */
export function generateGpxString(
  solution: TspSolution,
  vesselName: string,
  missionTitle: string
): string {
  const dateStr = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SONARX Subsea Perception Engine - SIH 26057"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${missionTitle}</name>
    <desc>Optimal TSP Multi-Target Subsea Debris Retrieval Route generated by SONARX. Total Distance: ${solution.totalDistanceNM} NM.</desc>
    <author>
      <name>Ministry of Earth Sciences (MoES) - SONARX Tactical Perception Fleet</name>
    </author>
    <time>${dateStr}</time>
  </metadata>
`;

  // Waypoints
  solution.orderedPoints.forEach((p, idx) => {
    const isBase = p.type === 'base';
    const wpNum = String(idx).padStart(2, '0');
    const sym = isBase ? 'Anchor' : 'Hazard';
    xml += `  <wpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}">
    <name>${isBase ? 'BASE-' + p.name.split(' ')[0] : 'WP' + wpNum + '-' + p.id}</name>
    <desc>${p.name} | ${p.notes || ''} | Depth: ${p.depthM || 0}m</desc>
    <sym>${sym}</sym>
    <type>${p.type.toUpperCase()}</type>
  </wpt>
`;
  });

  // Route
  xml += `  <rte>
    <name>TSP_OPTIMIZED_SALVAGE_ROUTE</name>
    <desc>Assigned Fleet: ${vesselName} | Total Leg Count: ${solution.legs.length}</desc>
`;

  solution.orderedPoints.forEach((p, idx) => {
    xml += `    <rtept lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}">
      <name>RTE-PT-${String(idx).padStart(2, '0')}</name>
      <desc>${p.name}</desc>
    </rtept>
`;
  });

  xml += `  </rte>
</gpx>`;

  return xml;
}

/**
 * Triggers client-side browser file download of generated GPX file
 */
export function downloadGpxFile(
  solution: TspSolution,
  vesselName: string,
  missionId: string = 'SONARX-SX014'
): void {
  const gpxContent = generateGpxString(solution, vesselName, `SONARX Marine Salvage Route - ${missionId}`);
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${missionId}_TSP_NavigationRoute_${Date.now()}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
