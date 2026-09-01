import type { MissionTarget } from '../types';

export const MISSION_TARGETS: MissionTarget[] = [
  {
    id: 'SX-T01', class: 'Mine-like Object', classCode: 'MLO', confidence: 0.947,
    depth: 43.1, length: 1.84, width: 0.71, shadowLength: 2.31, orientation: 127,
    slantRange: 26.8, lat: 18.9217, lon: 72.8214,
    risk: 'CRITICAL', pingTime: 620, color: '#FF5D5D',
    evidence: { objectShape: 91, acousticIntensity: 87, shadowGeometry: 96, seabedContrast: 89, dimensionalSimilarity: 93, backscatterPattern: 88 },
    detectionEvidence: [
      'Compact high-intensity acoustic return with sharp leading edge',
      'Distinct acoustic shadow consistent with elevated object',
      'Dimensions consistent with spherical mine-like profile',
      'Strong backscatter contrast against surrounding silt seabed',
    ],
  },
  {
    id: 'SX-T02', class: 'Mine-like Object', classCode: 'MLO', confidence: 0.831,
    depth: 38.4, length: 1.62, width: 0.58, shadowLength: 1.94, orientation: 214,
    slantRange: 31.2, lat: 18.9184, lon: 72.8241,
    risk: 'HIGH', pingTime: 890, color: '#FF5D5D',
    evidence: { objectShape: 83, acousticIntensity: 80, shadowGeometry: 84, seabedContrast: 78, dimensionalSimilarity: 85, backscatterPattern: 79 },
    detectionEvidence: [
      'Elevated acoustic return with characteristic shadow profile',
      'Circular cross-section consistent with moored mine geometry',
      'Object dimensions within expected mine-class parameters',
      'Isolating seabed return with no linear structure nearby',
    ],
  },
  {
    id: 'SX-T03', class: 'Wreck', classCode: 'WRK', confidence: 0.912,
    depth: 51.7, length: 18.4, width: 6.2, shadowLength: 12.1, orientation: 47,
    slantRange: 44.6, lat: 18.9142, lon: 72.8189,
    risk: 'MEDIUM', pingTime: 1240, color: '#FFB547',
    evidence: { objectShape: 94, acousticIntensity: 91, shadowGeometry: 96, seabedContrast: 88, dimensionalSimilarity: 90, backscatterPattern: 92 },
    detectionEvidence: [
      'Large elongated high-intensity return spanning 18.4 m',
      'Complex shadow structure indicating irregular superstructure',
      'Internal acoustic voids consistent with hull penetration',
      'Orientation and geometry match historical vessel registry data',
    ],
  },
  {
    id: 'SX-T04', class: 'Rock / Boulder', classCode: 'ROCK', confidence: 0.784,
    depth: 44.3, length: 3.1, width: 2.8, shadowLength: 3.4, orientation: 0,
    slantRange: 29.1, lat: 18.9201, lon: 72.8227,
    risk: 'LOW', pingTime: 740, color: '#65D391',
    evidence: { objectShape: 72, acousticIntensity: 78, shadowGeometry: 80, seabedContrast: 74, dimensionalSimilarity: 71, backscatterPattern: 76 },
    detectionEvidence: [
      'Irregular rounded acoustic return consistent with natural rock',
      'Diffuse shadow boundaries typical of non-metallic objects',
      'Surface roughness backscatter pattern matches geological substrate',
      'No specular reflection — rules out metallic construction',
    ],
  },
  {
    id: 'SX-T05', class: 'Debris Field', classCode: 'DEB', confidence: 0.723,
    depth: 47.8, length: 8.7, width: 4.1, shadowLength: 5.2, orientation: 312,
    slantRange: 38.4, lat: 18.9163, lon: 72.8253,
    risk: 'LOW', pingTime: 1050, color: '#29B6F6',
    evidence: { objectShape: 65, acousticIntensity: 70, shadowGeometry: 68, seabedContrast: 72, dimensionalSimilarity: 66, backscatterPattern: 73 },
    detectionEvidence: [
      'Dispersed high-backscatter cluster spanning ~35 m²',
      'Irregular shadow pattern consistent with fragmented debris',
      'Multiple small returns suggesting anthropogenic material',
      'Spatial distribution consistent with historical disposal site',
    ],
  },
  {
    id: 'SX-T06', class: 'Pipeline', classCode: 'PIP', confidence: 0.891,
    depth: 39.2, length: 47.3, width: 0.4, shadowLength: 0.8, orientation: 178,
    slantRange: 22.7, lat: 18.9228, lon: 72.8199,
    risk: 'MEDIUM', pingTime: 480, color: '#29B6F6',
    evidence: { objectShape: 95, acousticIntensity: 82, shadowGeometry: 88, seabedContrast: 90, dimensionalSimilarity: 94, backscatterPattern: 86 },
    detectionEvidence: [
      'Long linear high-intensity return spanning 47+ m',
      'Consistent cross-section diameter of ~0.4 m throughout',
      'Uniform orientation at 178° matches surveyed pipeline route',
      'Narrow shadow consistent with cylindrical elevated structure',
    ],
  },
  {
    id: 'SX-T07', class: 'Mine-like Object', classCode: 'MLO', confidence: 0.968,
    depth: 43.1, length: 1.84, width: 0.71, shadowLength: 2.31, orientation: 127,
    slantRange: 26.8, lat: 18.9217, lon: 72.8214,
    risk: 'CRITICAL', pingTime: 620, color: '#FF5D5D',
    evidence: { objectShape: 95, acousticIntensity: 92, shadowGeometry: 98, seabedContrast: 94, dimensionalSimilarity: 96, backscatterPattern: 91 },
    detectionEvidence: [
      'Highest confidence detection — compact high-intensity acoustic return',
      'Perfect acoustic shadow geometry for elevated spherical object',
      'Dimensions exactly consistent with MK-6 moored mine profile',
      'Specular highlight confirms metallic surface composition',
    ],
  },
  {
    id: 'SX-T08', class: 'Unknown', classCode: 'UNK', confidence: 0.612,
    depth: 55.1, length: 2.4, width: 1.9, shadowLength: 2.8, orientation: 89,
    slantRange: 49.3, lat: 18.9131, lon: 72.8211,
    risk: 'HIGH', pingTime: 1380, color: '#FFB547',
    evidence: { objectShape: 60, acousticIntensity: 65, shadowGeometry: 62, seabedContrast: 58, dimensionalSimilarity: 55, backscatterPattern: 61 },
    detectionEvidence: [
      'Ambiguous acoustic return — requires further investigation',
      'Shadow length inconsistent with estimated object height',
      'Cannot rule out mine-like classification at current confidence',
      'Recommend re-survey with higher-frequency transducer',
    ],
  },
  {
    id: 'SX-T09', class: 'Rock / Boulder', classCode: 'ROCK', confidence: 0.801,
    depth: 41.6, length: 4.2, width: 3.7, shadowLength: 4.1, orientation: 0,
    slantRange: 27.4, lat: 18.9193, lon: 72.8238,
    risk: 'LOW', pingTime: 810, color: '#65D391',
    evidence: { objectShape: 79, acousticIntensity: 82, shadowGeometry: 81, seabedContrast: 77, dimensionalSimilarity: 74, backscatterPattern: 80 },
    detectionEvidence: [
      'Large rounded acoustic return with diffuse boundary',
      'Shadow geometry consistent with natural geological formation',
      'Surface roughness texture matches local rocky substrate',
      'No metallic specular return detected',
    ],
  },
  {
    id: 'SX-T10', class: 'Debris Field', classCode: 'DEB', confidence: 0.741,
    depth: 46.4, length: 11.2, width: 5.8, shadowLength: 6.4, orientation: 261,
    slantRange: 35.7, lat: 18.9156, lon: 72.8242,
    risk: 'LOW', pingTime: 1100, color: '#29B6F6',
    evidence: { objectShape: 68, acousticIntensity: 72, shadowGeometry: 70, seabedContrast: 74, dimensionalSimilarity: 67, backscatterPattern: 71 },
    detectionEvidence: [
      'Dispersed acoustic return cluster over 65 m² area',
      'Multiple discrete returns suggesting scattered material',
      'Intensity consistent with corroded metallic debris',
      'Orientation trending NW aligns with historical current direction',
    ],
  },
  {
    id: 'SX-T11', class: 'Wreck', classCode: 'WRK', confidence: 0.876,
    depth: 58.3, length: 24.7, width: 8.1, shadowLength: 15.9, orientation: 22,
    slantRange: 51.8, lat: 18.9122, lon: 72.8196,
    risk: 'MEDIUM', pingTime: 1520, color: '#FFB547',
    evidence: { objectShape: 89, acousticIntensity: 87, shadowGeometry: 92, seabedContrast: 85, dimensionalSimilarity: 88, backscatterPattern: 90 },
    detectionEvidence: [
      'Large elongated structure with complex shadow morphology',
      'Keel-to-deck height estimated at 4.2 m from shadow length',
      'Hull penetration voids visible in high-frequency return',
      'Historical records indicate fishing vessel lost in sector 1994',
    ],
  },
  {
    id: 'SX-T12', class: 'Mine-like Object', classCode: 'MLO', confidence: 0.789,
    depth: 40.8, length: 1.71, width: 0.68, shadowLength: 2.04, orientation: 199,
    slantRange: 28.3, lat: 18.9207, lon: 72.8231,
    risk: 'HIGH', pingTime: 720, color: '#FF5D5D',
    evidence: { objectShape: 80, acousticIntensity: 76, shadowGeometry: 82, seabedContrast: 78, dimensionalSimilarity: 81, backscatterPattern: 77 },
    detectionEvidence: [
      'Compact high-backscatter return at 40.8 m depth',
      'Shadow length ratio consistent with spherical body',
      'Object dimensions within mine-class tolerance bounds',
      'Acoustic signature matches database reference for bottom mine',
    ],
  },
  {
    id: 'SX-T13', class: 'Pipeline', classCode: 'PIP', confidence: 0.854,
    depth: 37.9, length: 31.4, width: 0.35, shadowLength: 0.6, orientation: 174,
    slantRange: 20.4, lat: 18.9234, lon: 72.8204,
    risk: 'LOW', pingTime: 390, color: '#29B6F6',
    evidence: { objectShape: 91, acousticIntensity: 79, shadowGeometry: 85, seabedContrast: 87, dimensionalSimilarity: 90, backscatterPattern: 83 },
    detectionEvidence: [
      'Linear feature parallel to SX-T06 pipeline segment',
      'Consistent 0.35 m diameter cross-section throughout',
      'Possible secondary pipe or service conduit',
      'No shadow discontinuity — structure is continuous and intact',
    ],
  },
  {
    id: 'SX-T14', class: 'Rock / Boulder', classCode: 'ROCK', confidence: 0.762,
    depth: 48.2, length: 2.6, width: 2.3, shadowLength: 2.9, orientation: 0,
    slantRange: 41.6, lat: 18.9148, lon: 72.8219,
    risk: 'LOW', pingTime: 1160, color: '#65D391',
    evidence: { objectShape: 74, acousticIntensity: 77, shadowGeometry: 75, seabedContrast: 71, dimensionalSimilarity: 70, backscatterPattern: 73 },
    detectionEvidence: [
      'Isolated acoustic return with smooth boundary profile',
      'Natural substrate texture visible in high-frequency mode',
      'No specular reflection or metallic acoustic response',
      'Shadow geometry consistent with rounded geological feature',
    ],
  },
  {
    id: 'SX-T15', class: 'Unknown', classCode: 'UNK', confidence: 0.581,
    depth: 53.7, length: 3.1, width: 2.2, shadowLength: 3.6, orientation: 145,
    slantRange: 47.2, lat: 18.9134, lon: 72.8227,
    risk: 'HIGH', pingTime: 1320, color: '#FFB547',
    evidence: { objectShape: 57, acousticIntensity: 60, shadowGeometry: 58, seabedContrast: 55, dimensionalSimilarity: 52, backscatterPattern: 59 },
    detectionEvidence: [
      'Poorly-defined acoustic return with ambiguous morphology',
      'Shadow length suggests 1.2–1.8 m elevated object',
      'Cannot exclude anthropogenic origin at this confidence level',
      'Recommend targeted re-inspection at 900 kHz frequency',
    ],
  },
  {
    id: 'SX-T16', class: 'Debris Field', classCode: 'DEB', confidence: 0.698,
    depth: 44.9, length: 6.3, width: 3.1, shadowLength: 4.2, orientation: 88,
    slantRange: 33.1, lat: 18.9171, lon: 72.8246,
    risk: 'LOW', pingTime: 970, color: '#29B6F6',
    evidence: { objectShape: 66, acousticIntensity: 68, shadowGeometry: 64, seabedContrast: 70, dimensionalSimilarity: 63, backscatterPattern: 67 },
    detectionEvidence: [
      'Scattered acoustic cluster consistent with corroded material',
      'Multiple small returns in ~20 m² area',
      'Backscatter intensity suggests metallic or dense material',
      'Spatial distribution consistent with fishing gear entanglement',
    ],
  },
  {
    id: 'SX-T17', class: 'Mine-like Object', classCode: 'MLO', confidence: 0.856,
    depth: 42.3, length: 1.79, width: 0.65, shadowLength: 2.18, orientation: 302,
    slantRange: 25.4, lat: 18.9224, lon: 72.8208,
    risk: 'CRITICAL', pingTime: 540, color: '#FF5D5D',
    evidence: { objectShape: 87, acousticIntensity: 84, shadowGeometry: 89, seabedContrast: 86, dimensionalSimilarity: 88, backscatterPattern: 83 },
    detectionEvidence: [
      'High-confidence compact return with strong acoustic shadow',
      'Orientation and shadow angle consistent with moored object',
      'Surface area and backscatter match mine-class database',
      'Located within shipping lane — elevated threat priority',
    ],
  },
];

/** Priority targets (confidence ≥ 0.85 AND risk ≠ LOW) */
export const PRIORITY_TARGETS = MISSION_TARGETS.filter(
  (t) => t.confidence >= 0.85 && t.risk !== 'LOW'
);

export const getTargetById = (id: string): MissionTarget | undefined =>
  MISSION_TARGETS.find((t) => t.id === id);
