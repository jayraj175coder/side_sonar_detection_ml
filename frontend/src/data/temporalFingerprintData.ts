export type DebrisLifecycleStatus = 'NEW' | 'STILL_THERE' | 'MOVED' | 'GONE';

export interface TemporalSurveyPass {
  passNumber: number;
  surveyDate: string;
  surveyVesselOrDrone: string;
  sonarFrequencyKhz: number;
  towfishAltitudeM: number;
  coordinates: { lat: number; lng: number };
  backscatterDb: number;
  shadowLengthM: number;
  calculatedHeightM: number;
  imageThumbnail: string;
}

export interface AcousticFingerprintRecord {
  id: string;
  fingerprintHash: string;
  targetName: string;
  targetClass: 'GHOST_NET' | 'DEBRIS' | 'PIPELINE_HAZARD' | 'SEABED_ANOMALY';
  targetClassLabel: string;
  status: DebrisLifecycleStatus;
  statusDescription: string;
  sector: string;
  depthM: number;
  firstDetectedDate: string;
  lastSurveyedDate: string;
  surveyPassCount: number;
  
  // Drift analytics
  driftDistanceM: number;
  driftBearingDeg: number;
  driftVelocityKt: number;
  benthicCurrentVector: string;
  
  // Baseline vs Current Pass
  baselinePass: TemporalSurveyPass;
  latestPass: TemporalSurveyPass;
  
  // Physical Acoustic Dimensions
  estimatedLengthM: number;
  estimatedWidthM: number;
  estimatedHeightM: number;
  acousticConfidence: number; // 0..1
  
  // MoES Recovery / Action Status
  actionRecommendation: string;
  salvageTicketId?: string;
  verifiedBy?: string;
  environmentalRiskScore: number; // 0..100
}

export const TEMPORAL_DEBRIS_RECORDS: AcousticFingerprintRecord[] = [
  {
    id: 'afp-01',
    fingerprintHash: 'AFP-7F9A-KCH-ALDFG',
    targetName: 'Entangled Nylon Monofilament Ghost Net',
    targetClass: 'GHOST_NET',
    targetClassLabel: 'Ghost Net (ALDFG)',
    status: 'MOVED',
    statusDescription: 'Displaced 28.4m NE by benthic tidal currents along the continental shelf edge',
    sector: 'Kochi Offshore Basin · Arabian Sea',
    depthM: 38.5,
    firstDetectedDate: '2026-07-12',
    lastSurveyedDate: '2026-09-17',
    surveyPassCount: 3,
    driftDistanceM: 28.4,
    driftBearingDeg: 48,
    driftVelocityKt: 0.04,
    benthicCurrentVector: '0.35 m/s @ 050° NE (Southwest Monsoon Undercurrent)',
    baselinePass: {
      passNumber: 1,
      surveyDate: '2026-07-12 10:14 IST',
      surveyVesselOrDrone: 'INS Sandhayak (AUV-Alpha)',
      sonarFrequencyKhz: 455,
      towfishAltitudeM: 12.0,
      coordinates: { lat: 9.9241, lng: 76.1824 },
      backscatterDb: -14.2,
      shadowLengthM: 4.8,
      calculatedHeightM: 1.62,
      imageThumbnail: 'sonar_thumb_net_1',
    },
    latestPass: {
      passNumber: 3,
      surveyDate: '2026-09-17 14:45 IST',
      surveyVesselOrDrone: 'MoES Autonomous Drone SSS-02',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 9.5,
      coordinates: { lat: 9.9258, lng: 76.1843 },
      backscatterDb: -13.8,
      shadowLengthM: 4.2,
      calculatedHeightM: 1.58,
      imageThumbnail: 'sonar_thumb_net_2',
    },
    estimatedLengthM: 14.5,
    estimatedWidthM: 6.2,
    estimatedHeightM: 1.6,
    acousticConfidence: 0.942,
    actionRecommendation: 'Dispatch NIOT Coastal Recovery ROV with hydraulic line cutters before further reef entanglement.',
    salvageTicketId: 'SWACHH-SAGAR-REC-2026-042',
    verifiedBy: 'INCOIS Marine Acoustic Triage Desk',
    environmentalRiskScore: 89,
  },
  {
    id: 'afp-02',
    fingerprintHash: 'AFP-4B22-MUM-STLS',
    targetName: 'Sunken Industrial Structural Beam & Pipe Rack',
    targetClass: 'DEBRIS',
    targetClassLabel: 'Heavy Anthropogenic Debris',
    status: 'STILL_THERE',
    statusDescription: 'Contact stationary on hard coral substrate (< 0.8m shift across 90 days)',
    sector: 'Mumbai High Offshore Platform Sector',
    depthM: 62.0,
    firstDetectedDate: '2026-06-04',
    lastSurveyedDate: '2026-09-15',
    surveyPassCount: 4,
    driftDistanceM: 0.6,
    driftBearingDeg: 12,
    driftVelocityKt: 0.00,
    benthicCurrentVector: 'Stationary Anchor · Nil Sediment Scour Drift',
    baselinePass: {
      passNumber: 1,
      surveyDate: '2026-06-04 09:30 IST',
      surveyVesselOrDrone: 'ONGC Seismic Survey SSS-01',
      sonarFrequencyKhz: 400,
      towfishAltitudeM: 15.0,
      coordinates: { lat: 19.3822, lng: 71.3211 },
      backscatterDb: -8.4,
      shadowLengthM: 8.1,
      calculatedHeightM: 2.85,
      imageThumbnail: 'sonar_thumb_pipe_1',
    },
    latestPass: {
      passNumber: 4,
      surveyDate: '2026-09-15 11:20 IST',
      surveyVesselOrDrone: 'MoES Subsea Drone SSS-01',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 11.2,
      coordinates: { lat: 19.3822, lng: 71.3212 },
      backscatterDb: -8.1,
      shadowLengthM: 7.9,
      calculatedHeightM: 2.82,
      imageThumbnail: 'sonar_thumb_pipe_2',
    },
    estimatedLengthM: 18.2,
    estimatedWidthM: 3.4,
    estimatedHeightM: 2.8,
    acousticConfidence: 0.968,
    actionRecommendation: 'Moored offshore hazard registered. Clearance recommended during dry-season platform refit.',
    salvageTicketId: 'OFFSHORE-HAZ-2026-019',
    verifiedBy: 'Naval Hydrographic Office (NHO)',
    environmentalRiskScore: 74,
  },
  {
    id: 'afp-03',
    fingerprintHash: 'AFP-91E0-VZG-CRAT',
    targetName: 'Derelict Fish Aggregating Device (FAD) & Crate',
    targetClass: 'GHOST_NET',
    targetClassLabel: 'FAD & Abandoned Net Bundle',
    status: 'GONE',
    statusDescription: 'Contact verified absent in Pass 3 following MoES Swachh Sagar recovery operation',
    sector: 'Visakhapatnam Continental Slope · Bay of Bengal',
    depthM: 44.0,
    firstDetectedDate: '2026-08-01',
    lastSurveyedDate: '2026-09-16',
    surveyPassCount: 3,
    driftDistanceM: 0.0,
    driftBearingDeg: 0,
    driftVelocityKt: 0.00,
    benthicCurrentVector: 'Salvaged · Clean seabed confirmed via high-frequency swath',
    baselinePass: {
      passNumber: 1,
      surveyDate: '2026-08-01 16:10 IST',
      surveyVesselOrDrone: 'INS Sagardhwani SSS',
      sonarFrequencyKhz: 455,
      towfishAltitudeM: 10.0,
      coordinates: { lat: 17.6542, lng: 83.3421 },
      backscatterDb: -16.5,
      shadowLengthM: 3.9,
      calculatedHeightM: 1.45,
      imageThumbnail: 'sonar_thumb_fad_1',
    },
    latestPass: {
      passNumber: 3,
      surveyDate: '2026-09-16 08:30 IST',
      surveyVesselOrDrone: 'MoES Drone SSS-03 (Post-Salvage Verification)',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 8.5,
      coordinates: { lat: 17.6542, lng: 83.3421 },
      backscatterDb: -26.1, // Ambient seabed return only
      shadowLengthM: 0.0,
      calculatedHeightM: 0.00,
      imageThumbnail: 'sonar_thumb_clean',
    },
    estimatedLengthM: 5.4,
    estimatedWidthM: 4.8,
    estimatedHeightM: 0.0,
    acousticConfidence: 0.985,
    actionRecommendation: 'CLEARED: 1.2 metric tons of ghost webbing recovered by NIOT Sagar Nidhi tender.',
    salvageTicketId: 'SWACHH-SAGAR-REC-2026-027',
    verifiedBy: 'MoES Field Recovery Officer (Capt. R. Sharma)',
    environmentalRiskScore: 12,
  },
  {
    id: 'afp-04',
    fingerprintHash: 'AFP-12CC-AND-ANOM',
    targetName: 'Newly Discovered Unclassified Seabed Anomaly',
    targetClass: 'SEABED_ANOMALY',
    targetClassLabel: 'Unclassified Acoustic Anomaly',
    status: 'NEW',
    statusDescription: 'Fresh acoustic contact logged in latest swath survey pass. Zero prior survey records.',
    sector: 'Andaman Swell · Port Blair Outer Harbor',
    depthM: 29.8,
    firstDetectedDate: '2026-09-17',
    lastSurveyedDate: '2026-09-17',
    surveyPassCount: 1,
    driftDistanceM: 0.0,
    driftBearingDeg: 0,
    driftVelocityKt: 0.00,
    benthicCurrentVector: 'Active Baseline Logging in Progress',
    baselinePass: {
      passNumber: 1,
      surveyDate: '2026-09-17 18:20 IST',
      surveyVesselOrDrone: 'MoES Autonomous Drone SSS-04',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 10.5,
      coordinates: { lat: 11.6421, lng: 92.7682 },
      backscatterDb: -10.2,
      shadowLengthM: 6.4,
      calculatedHeightM: 2.15,
      imageThumbnail: 'sonar_thumb_new_anom',
    },
    latestPass: {
      passNumber: 1,
      surveyDate: '2026-09-17 18:20 IST',
      surveyVesselOrDrone: 'MoES Autonomous Drone SSS-04',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 10.5,
      coordinates: { lat: 11.6421, lng: 92.7682 },
      backscatterDb: -10.2,
      shadowLengthM: 6.4,
      calculatedHeightM: 2.15,
      imageThumbnail: 'sonar_thumb_new_anom',
    },
    estimatedLengthM: 8.9,
    estimatedWidthM: 4.1,
    estimatedHeightM: 2.15,
    acousticConfidence: 0.884,
    actionRecommendation: 'Execute secondary low-altitude high-frequency re-survey pass to classify acoustic signature.',
    salvageTicketId: 'TRIAGE-AND-2026-004',
    verifiedBy: 'Automated AI Perception & Confidence Gating Engine',
    environmentalRiskScore: 68,
  },
  {
    id: 'afp-05',
    fingerprintHash: 'AFP-66D3-CHN-PIPE',
    targetName: 'Subsea Fuel Bunkering Pipeline Unburied Scour',
    targetClass: 'PIPELINE_HAZARD',
    targetClassLabel: 'Pipeline Scour Hazard',
    status: 'STILL_THERE',
    statusDescription: 'Structural exposure persistent. Scour pocket expanded by 1.4m due to monsoon tide.',
    sector: 'Chennai Coromandel Fairway · Bay of Bengal',
    depthM: 22.4,
    firstDetectedDate: '2026-05-18',
    lastSurveyedDate: '2026-09-14',
    surveyPassCount: 5,
    driftDistanceM: 0.2,
    driftBearingDeg: 180,
    driftVelocityKt: 0.00,
    benthicCurrentVector: 'Stationary Pipeline · Seabed Scour Expanding',
    baselinePass: {
      passNumber: 1,
      surveyDate: '2026-05-18 14:00 IST',
      surveyVesselOrDrone: 'Chennai Port Trust Hydrographic Tug',
      sonarFrequencyKhz: 455,
      towfishAltitudeM: 8.0,
      coordinates: { lat: 13.0841, lng: 80.3129 },
      backscatterDb: -6.8,
      shadowLengthM: 5.2,
      calculatedHeightM: 1.84,
      imageThumbnail: 'sonar_thumb_pipe_scour',
    },
    latestPass: {
      passNumber: 5,
      surveyDate: '2026-09-14 16:30 IST',
      surveyVesselOrDrone: 'MoES AUV-Coromandel',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 7.2,
      coordinates: { lat: 13.0841, lng: 80.3130 },
      backscatterDb: -6.5,
      shadowLengthM: 5.8,
      calculatedHeightM: 1.95,
      imageThumbnail: 'sonar_thumb_pipe_scour_now',
    },
    estimatedLengthM: 24.0,
    estimatedWidthM: 1.2,
    estimatedHeightM: 1.95,
    acousticConfidence: 0.976,
    actionRecommendation: 'Issue immediate maritime advisory: Unburied pipeline section poses anchor snag risk to coastal craft.',
    salvageTicketId: 'NAV-WARN-CHN-2026-118',
    verifiedBy: 'Directorate General of Shipping (DGS)',
    environmentalRiskScore: 92,
  },
  {
    id: 'afp-06',
    fingerprintHash: 'AFP-33A8-KUT-TRWL',
    targetName: 'Drifting Polypropylene Trawl Net Mass',
    targetClass: 'GHOST_NET',
    targetClassLabel: 'Ghost Net (ALDFG)',
    status: 'MOVED',
    statusDescription: 'Displaced 46.2m SW by high-velocity macrotidal currents in the Gulf of Kutch',
    sector: 'Gulf of Kutch Tidal Fairway · Gujarat',
    depthM: 18.2,
    firstDetectedDate: '2026-08-20',
    lastSurveyedDate: '2026-09-16',
    surveyPassCount: 2,
    driftDistanceM: 46.2,
    driftBearingDeg: 235,
    driftVelocityKt: 0.11,
    benthicCurrentVector: '1.45 m/s @ 230° SW (Gulf of Kutch Macrotidal Ebb)',
    baselinePass: {
      passNumber: 1,
      surveyDate: '2026-08-20 09:15 IST',
      surveyVesselOrDrone: 'Gujarat Maritime Board SSS-02',
      sonarFrequencyKhz: 400,
      towfishAltitudeM: 6.5,
      coordinates: { lat: 22.5691, lng: 69.1241 },
      backscatterDb: -15.4,
      shadowLengthM: 4.1,
      calculatedHeightM: 1.35,
      imageThumbnail: 'sonar_thumb_kutch_1',
    },
    latestPass: {
      passNumber: 2,
      surveyDate: '2026-09-16 13:40 IST',
      surveyVesselOrDrone: 'MoES Drone SSS-01',
      sonarFrequencyKhz: 900,
      towfishAltitudeM: 5.8,
      coordinates: { lat: 22.5668, lng: 69.1205 },
      backscatterDb: -14.9,
      shadowLengthM: 4.6,
      calculatedHeightM: 1.48,
      imageThumbnail: 'sonar_thumb_kutch_2',
    },
    estimatedLengthM: 11.2,
    estimatedWidthM: 5.5,
    estimatedHeightM: 1.48,
    acousticConfidence: 0.918,
    actionRecommendation: 'High-drift hazard approaching marine sanctuary boundary. Immediate intercept recommended.',
    salvageTicketId: 'SWACHH-SAGAR-REC-2026-055',
    verifiedBy: 'Marine National Park Coastal Guard',
    environmentalRiskScore: 86,
  }
];
