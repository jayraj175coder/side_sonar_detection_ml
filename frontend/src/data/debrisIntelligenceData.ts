export interface AttributionScoreDecomposition {
  sDrift: number;     // Backward drift trajectory alignment (0.0 - 1.0)
  sSpatial: number;   // Closest point of approach proximity score (0.0 - 1.0)
  sTemporal: number;  // Time window intersection score (0.0 - 1.0)
  sManeuver: number;  // Anomaly in course / speed indicative of discard (0.0 - 1.0)
  totalScore: number; // Weighted combination
  weights: { drift: number; spatial: number; temporal: number; maneuver: number };
}

export interface DebrisCandidate {
  id: string;
  code: string;
  name: string;
  kind: 'Unlit Trawler ALDFG Discard' | 'Container Vessel Loss' | 'Offshore Industrial Rig' | 'Legacy Wreck Dispersal' | 'Moored Mine Tether Breach';
  score: number; // 0.0 - 1.0 (Attribution Likelihood)
  scoreDecomposition: AttributionScoreDecomposition;
  originWindow: string; // e.g. "T-28h .. T0"
  speedKts: number;
  headingDeg: number;
  callSign: string;
  flag: string;
  vesselType: string;
  aisStatus: 'UNLIT / AIS TRANSPONDER OFF' | 'AIS ACTIVE' | 'INFERRED TRACK';
  closestPointOfApproachM: number;
  timeOfClosestApproach: string;
  radarEchoCrossSection: string;
  spatialIntersectionConfidence: number; // 0 - 100%
  operatorNotes: string;
  alternativeHypothesis: string;
  trackCoordinates: [number, number][];
}

export interface DebrisScenarioIntel {
  id: string;
  scenarioCode: string;
  name: string;
  region: string;
  acquisitionTime: string;
  swathFile: string;
  debrisType: 'Ghost Fishing Gear (ALDFG)' | 'Subsea Hydrocarbon Pipeline' | 'Moored Naval Ordnance' | 'Sunken ISO Container' | 'Timber Keel Shipwreck';
  debrisAreaKm2: number;
  alongTrackKm: number;
  dispersionAngleDeg: number;
  currentVelocityMs: number;
  windSpeedMs: number;
  lat: number;
  lon: number;
  depthM: number;
  sensorFrequencyKhz: number;
  calculatedOrigin: { lat: number; lon: number; timeWindow: string; uncertaintyRadiusKm: number };
  candidates: DebrisCandidate[];
  eventLogs: { time: string; tag: string; message: string; type: 'sys' | 'sar' | 'det' | 'geom' | 'drift' }[];
}

export const DEBRIS_INTELLIGENCE_SCENARIOS: DebrisScenarioIntel[] = [
  {
    id: 'kutch-dark',
    scenarioCode: 'KUTCH-DARK',
    name: 'Gulf of Kutch — Unlit Trawler Net Discard',
    region: 'Gujarat Coastal Fairway · Arabian Sea',
    acquisitionTime: '2026-09-01 14:30 IST',
    swathFile: 'S1A_SSS_900KHZ_INS_SANDHAYAK_KUTCH_04',
    debrisType: 'Ghost Fishing Gear (ALDFG)',
    debrisAreaKm2: 3.29,
    alongTrackKm: 9.5,
    dispersionAngleDeg: 27.9,
    currentVelocityMs: 1.15,
    windSpeedMs: 5.0,
    lat: 22.571,
    lon: 69.125,
    depthM: 28.5,
    sensorFrequencyKhz: 900,
    calculatedOrigin: {
      lat: 22.602,
      lon: 69.098,
      timeWindow: 'T-18.4h ± 2.1h',
      uncertaintyRadiusKm: 0.84,
    },
    candidates: [
      {
        id: 'CAND-01',
        code: '01',
        name: 'Unlit Trawler IND-782',
        kind: 'Unlit Trawler ALDFG Discard',
        score: 0.839,
        scoreDecomposition: {
          sDrift: 0.88,
          sSpatial: 0.94,
          sTemporal: 0.82,
          sManeuver: 0.95,
          totalScore: 0.839,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-28h .. T0',
        speedKts: 3.8,
        headingDeg: 142,
        callSign: 'IND-782-KTC',
        flag: '🇮🇳 India (Unregistered Mechanized Trawler)',
        vesselType: 'Mechanized Stern Trawler (18m)',
        aisStatus: 'UNLIT / AIS TRANSPONDER OFF',
        closestPointOfApproachM: 32.4,
        timeOfClosestApproach: 'T-18h (02:14 UTC)',
        radarEchoCrossSection: '118 m² radar bright target',
        spatialIntersectionConfidence: 94.2,
        operatorNotes: 'Vessel performed abrupt 180° zig-zag gear-reversal maneuver directly over reef bank at T-18h, consistent with severe net snagging and forced emergency monofilament cutting.',
        alternativeHypothesis: 'Secondary possibility of gear loss from passing coastal dhow 6 hours prior; however, low current alignment makes this unlikely (<12% probability).',
        trackCoordinates: [
          [22.68, 69.02],
          [22.64, 69.06],
          [22.60, 69.10],
          [22.571, 69.125],
          [22.54, 69.15],
          [22.50, 69.19],
        ],
      },
      {
        id: 'CAND-02',
        code: '02',
        name: 'MV Sagar Samrat Supply Tug',
        kind: 'Offshore Industrial Rig',
        score: 0.412,
        scoreDecomposition: {
          sDrift: 0.45,
          sSpatial: 0.38,
          sTemporal: 0.50,
          sManeuver: 0.22,
          totalScore: 0.412,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-22h .. T0',
        speedKts: 9.4,
        headingDeg: 210,
        callSign: 'VT-SAMRAT',
        flag: '🇮🇳 India',
        vesselType: 'Offshore Supply Vessel (54m)',
        aisStatus: 'AIS ACTIVE',
        closestPointOfApproachM: 480.0,
        timeOfClosestApproach: 'T-12h (08:30 UTC)',
        radarEchoCrossSection: '850 m² high metallic return',
        spatialIntersectionConfidence: 41.5,
        operatorNotes: 'Linear transit at steady 9.4 kts through fairway. Distance to debris origin exceeding 480m rules out primary discard source.',
        alternativeHypothesis: 'Hull wash turbulence may have accelerated downstream dispersal of existing debris.',
        trackCoordinates: [
          [22.72, 69.08],
          [22.62, 69.14],
          [22.52, 69.20],
          [22.42, 69.26],
        ],
      },
      {
        id: 'CAND-03',
        code: '03',
        name: 'Dhow Al-Mabroor (Foreign Transit)',
        kind: 'Unlit Trawler ALDFG Discard',
        score: 0.285,
        scoreDecomposition: {
          sDrift: 0.28,
          sSpatial: 0.24,
          sTemporal: 0.40,
          sManeuver: 0.15,
          totalScore: 0.285,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-36h .. T0',
        speedKts: 5.1,
        headingDeg: 95,
        callSign: 'DHOW-ALM',
        flag: '🇴🇲 Oman Coastal Registry',
        vesselType: 'Traditional Wooden Cargo Dhow (28m)',
        aisStatus: 'UNLIT / AIS TRANSPONDER OFF',
        closestPointOfApproachM: 1200.0,
        timeOfClosestApproach: 'T-26h (18:45 UTC)',
        radarEchoCrossSection: '42 m² low wood return',
        spatialIntersectionConfidence: 28.5,
        operatorNotes: 'Outer shelf transit outside Gulf of Kutch lagoon entrance. Temporal window mismatch.',
        alternativeHypothesis: 'Incidental non-correlated acoustic return.',
        trackCoordinates: [
          [22.45, 68.95],
          [22.48, 69.10],
          [22.51, 69.30],
        ],
      },
    ],
    eventLogs: [
      { time: '14:30:00', tag: 'T0 SYS', message: 'Session open · analysis node 04 active', type: 'sys' },
      { time: '14:30:04', tag: 'T0 SSS', message: '900 kHz Dual-Band SSS swath ingested from INS Sandhayak', type: 'sar' },
      { time: '14:30:12', tag: 'T0 DET', message: '3 acoustic debris instances localized · ghost net confirmed · conf 0.948', type: 'det' },
      { time: '14:30:18', tag: 'T0 GEOM', message: 'Debris plume extent: 3.29 km² · 9.5 km length along 27.9° current axis', type: 'geom' },
      { time: '14:30:24', tag: 'T0 DRIFT', message: 'Lagrangian ensemble 12 members · 3,840 particle trajectories simulated', type: 'drift' },
      { time: '14:30:30', tag: 'T0 ATTR', message: 'Vessel AIS cross-matching: Candidate 01 (Unlit Trawler IND-782) score 0.839', type: 'sys' },
    ],
  },
  {
    id: 'gom-coral',
    scenarioCode: 'GOM-CORAL',
    name: 'Gulf of Mannar — Coral Biosphere Ghost Net',
    region: 'Palk Bay & Gulf of Mannar Marine National Park',
    acquisitionTime: '2026-09-01 11:15 IST',
    swathFile: 'ORV_SAGAR_KANYA_GOM_900KHZ_SSS_02',
    debrisType: 'Ghost Fishing Gear (ALDFG)',
    debrisAreaKm2: 2.14,
    alongTrackKm: 6.8,
    dispersionAngleDeg: 45.2,
    currentVelocityMs: 0.85,
    windSpeedMs: 4.2,
    lat: 9.1367,
    lon: 79.2122,
    depthM: 22.4,
    sensorFrequencyKhz: 900,
    calculatedOrigin: {
      lat: 9.148,
      lon: 79.195,
      timeWindow: 'T-14.2h ± 1.5h',
      uncertaintyRadiusKm: 0.42,
    },
    candidates: [
      {
        id: 'CAND-GOM-01',
        code: '01',
        name: 'Rameswaram Gillnet Boat TN-04',
        kind: 'Unlit Trawler ALDFG Discard',
        score: 0.912,
        scoreDecomposition: {
          sDrift: 0.94,
          sSpatial: 0.96,
          sTemporal: 0.88,
          sManeuver: 0.92,
          totalScore: 0.912,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-16h .. T0',
        speedKts: 2.4,
        headingDeg: 280,
        callSign: 'TN-04-RAM',
        flag: '🇮🇳 India (Tamil Nadu Coastal Registry)',
        vesselType: 'Bottom Monofilament Net Boat (14m)',
        aisStatus: 'UNLIT / AIS TRANSPONDER OFF',
        closestPointOfApproachM: 18.2,
        timeOfClosestApproach: 'T-14h (04:30 UTC)',
        radarEchoCrossSection: '65 m² composite fiberglass hull',
        spatialIntersectionConfidence: 96.8,
        operatorNotes: 'GPS ping log confirms stationary deployment over coral pinnacle at 22m depth, followed by gear abandonment.',
        alternativeHypothesis: 'Local reef current wash could have transported net from northern channel (<5% probability).',
        trackCoordinates: [
          [9.18, 79.15],
          [9.15, 79.18],
          [9.1367, 79.2122],
          [9.11, 79.25],
        ],
      },
    ],
    eventLogs: [
      { time: '11:15:00', tag: 'T0 SYS', message: 'Gulf of Mannar biosphere monitoring initialized', type: 'sys' },
      { time: '11:15:05', tag: 'T0 SSS', message: 'High-resolution 900 kHz SSS swath active', type: 'sar' },
      { time: '11:15:10', tag: 'T0 DET', message: 'Ghost net snagged across Porites coral shelf · elevation 0.38m', type: 'det' },
    ],
  },
  {
    id: 'mumbai-pipeline',
    scenarioCode: 'MUMBAI-PIPE',
    name: 'Mumbai High — Offshore Pipeline & Industrial Steel',
    region: 'Western Offshore Oil & Gas Basin',
    acquisitionTime: '2026-09-01 09:45 IST',
    swathFile: 'INS_SANDHAYAK_MUMBAI_HIGH_900KHZ_01',
    debrisType: 'Subsea Hydrocarbon Pipeline',
    debrisAreaKm2: 4.82,
    alongTrackKm: 14.2,
    dispersionAngleDeg: 178.0,
    currentVelocityMs: 0.65,
    windSpeedMs: 6.8,
    lat: 19.3792,
    lon: 71.355,
    depthM: 39.2,
    sensorFrequencyKhz: 900,
    calculatedOrigin: {
      lat: 19.412,
      lon: 71.348,
      timeWindow: 'T-48h ± 4.0h',
      uncertaintyRadiusKm: 0.65,
    },
    candidates: [
      {
        id: 'CAND-MUM-01',
        code: '01',
        name: 'Derrick Barge DB-27 Anchor Spread',
        kind: 'Offshore Industrial Rig',
        score: 0.884,
        scoreDecomposition: {
          sDrift: 0.86,
          sSpatial: 0.92,
          sTemporal: 0.90,
          sManeuver: 0.85,
          totalScore: 0.884,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-72h .. T0',
        speedKts: 1.2,
        headingDeg: 178,
        callSign: 'DB-27-ONGC',
        flag: '🇮🇳 India',
        vesselType: 'Pipe Laying & Derrick Barge (120m)',
        aisStatus: 'AIS ACTIVE',
        closestPointOfApproachM: 12.0,
        timeOfClosestApproach: 'T-48h (12:00 UTC)',
        radarEchoCrossSection: '3,200 m² massive steel structure',
        spatialIntersectionConfidence: 91.5,
        operatorNotes: 'Anchor spread pattern crossed transmission line at KM 4.2 during monsoonal storm swell.',
        alternativeHypothesis: 'Routine offshore mooring deployment without mechanical breach.',
        trackCoordinates: [
          [19.45, 71.34],
          [19.41, 71.35],
          [19.3792, 71.355],
          [19.33, 71.36],
        ],
      },
    ],
    eventLogs: [
      { time: '09:45:00', tag: 'T0 SYS', message: 'Mumbai High transmission pipeline corridor scan active', type: 'sys' },
      { time: '09:45:08', tag: 'T0 SSS', message: 'Continuous linear return · outer diameter 0.76m verified', type: 'det' },
    ],
  },
  {
    id: 'vizag-mine',
    scenarioCode: 'VIZAG-MINE',
    name: 'Visakhapatnam — Moored Ordnance Tether Breach',
    region: 'Bay of Bengal Naval Anchorage Approaches',
    acquisitionTime: '2026-09-01 08:20 IST',
    swathFile: 'INS_SANDHAYAK_VIZAG_SSS_09',
    debrisType: 'Moored Naval Ordnance',
    debrisAreaKm2: 1.15,
    alongTrackKm: 3.4,
    dispersionAngleDeg: 112.0,
    currentVelocityMs: 0.45,
    windSpeedMs: 3.1,
    lat: 17.6861,
    lon: 83.2917,
    depthM: 43.1,
    sensorFrequencyKhz: 900,
    calculatedOrigin: {
      lat: 17.692,
      lon: 83.284,
      timeWindow: 'T-32h ± 2.5h',
      uncertaintyRadiusKm: 0.35,
    },
    candidates: [
      {
        id: 'CAND-VIZ-01',
        code: '01',
        name: 'Historical Deep Moor Sinker MK-6',
        kind: 'Moored Mine Tether Breach',
        score: 0.948,
        scoreDecomposition: {
          sDrift: 0.95,
          sSpatial: 0.98,
          sTemporal: 0.92,
          sManeuver: 0.91,
          totalScore: 0.948,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-48h .. T0',
        speedKts: 0.2,
        headingDeg: 112,
        callSign: 'NAV-OR-09',
        flag: '🇮🇳 India Naval Defense Perimeter',
        vesselType: 'Moored Contact Mine Sinker & Buoyant Shell',
        aisStatus: 'UNLIT / AIS TRANSPONDER OFF',
        closestPointOfApproachM: 5.4,
        timeOfClosestApproach: 'T-32h (00:00 UTC)',
        radarEchoCrossSection: '38 m² spherical steel casing',
        spatialIntersectionConfidence: 97.4,
        operatorNotes: 'Elevated 0.82m off bottom with 2.31m shadow. High confidence of historical practice mine casing.',
        alternativeHypothesis: 'Subsea mooring buoy anchor block.',
        trackCoordinates: [
          [17.70, 83.27],
          [17.692, 83.284],
          [17.6861, 83.2917],
        ],
      },
    ],
    eventLogs: [
      { time: '08:20:00', tag: 'T0 SYS', message: 'Visakhapatnam naval approaches acoustic survey active', type: 'sys' },
      { time: '08:20:15', tag: 'T0 DET', message: 'High-backscatter contact acquired · target strength -12.8 dB', type: 'det' },
    ],
  },
  {
    id: 'palk-container',
    scenarioCode: 'PALK-CONT',
    name: 'Palk Strait — Lost ISO Shipping Container',
    region: 'Palk Strait International Shipping Corridor',
    acquisitionTime: '2026-09-01 07:00 IST',
    swathFile: 'INS_SANDHAYAK_PALK_CONT_03',
    debrisType: 'Sunken ISO Container',
    debrisAreaKm2: 2.85,
    alongTrackKm: 8.2,
    dispersionAngleDeg: 62.0,
    currentVelocityMs: 0.92,
    windSpeedMs: 5.5,
    lat: 10.124,
    lon: 79.845,
    depthM: 18.2,
    sensorFrequencyKhz: 900,
    calculatedOrigin: {
      lat: 10.165,
      lon: 79.795,
      timeWindow: 'T-24h ± 3.0h',
      uncertaintyRadiusKm: 0.72,
    },
    candidates: [
      {
        id: 'CAND-PALK-01',
        code: '01',
        name: 'MV Colombo Express (Feeder Container)',
        kind: 'Container Vessel Loss',
        score: 0.892,
        scoreDecomposition: {
          sDrift: 0.91,
          sSpatial: 0.93,
          sTemporal: 0.85,
          sManeuver: 0.88,
          totalScore: 0.892,
          weights: { drift: 0.35, spatial: 0.25, temporal: 0.20, maneuver: 0.20 },
        },
        originWindow: 'T-30h .. T0',
        speedKts: 14.2,
        headingDeg: 62,
        callSign: '9V-COLOMBO',
        flag: '🇸🇬 Singapore Registry',
        vesselType: 'Cellular Container Vessel (160m)',
        aisStatus: 'AIS ACTIVE',
        closestPointOfApproachM: 28.0,
        timeOfClosestApproach: 'T-24h (15:00 UTC)',
        radarEchoCrossSection: '1,800 m² high steel superstructure',
        spatialIntersectionConfidence: 93.8,
        operatorNotes: 'Logbook alert indicates heavy roll and deck lash failure in squall at T-24h resulting in loss of 2x 20ft steel containers.',
        alternativeHypothesis: 'Lost fishing net reel structure from regional trawler (<8% probability).',
        trackCoordinates: [
          [10.22, 79.72],
          [10.165, 79.795],
          [10.124, 79.845],
          [10.08, 79.91],
        ],
      },
    ],
    eventLogs: [
      { time: '07:00:00', tag: 'T0 SYS', message: 'Palk Strait international corridor hydrographic sweep', type: 'sys' },
      { time: '07:00:12', tag: 'T0 DET', message: 'Rectangular 6.06m × 2.44m acoustic target locked on seafloor', type: 'det' },
    ],
  },
];
