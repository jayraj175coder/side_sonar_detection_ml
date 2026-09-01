export interface IndiaMaritimeSector {
  id: string;
  name: string;
  subName: string;
  fleetCommand: 'Western Naval Command' | 'Eastern Naval Command' | 'Southern Naval Command' | 'Andaman & Nicobar Command' | 'MoES / NIOT';
  region: 'Arabian Sea' | 'Bay of Bengal' | 'Indian Ocean' | 'Andaman Sea' | 'Lakshadweep Sea';
  lat: number;
  lon: number;
  depthRangeM: string;
  activeSurveys: number;
  contactsLogged: number;
  criticalThreats: number;
  primaryClass: string;
  status: 'ACTIVE SURVEY' | 'CLEARANCE VERIFIED' | 'HIGH ALERT' | 'ROUTINE PATROL';
  description: string;
  assignedVessel: string;
}

export interface HydrographicVessel {
  id: string;
  name: string;
  pennant: string;
  type: 'Survey Vessel (Large)' | 'Oceanographic Research Vessel' | 'Fisheries Research Vessel';
  operator: 'Indian Navy' | 'Ministry of Earth Sciences' | 'NIOT / CMLRE';
  lat: number;
  lon: number;
  headingDeg: number;
  speedKts: number;
  currentSector: string;
  swathWidthM: number;
  transducerFreq: string;
}

export const INDIA_MARITIME_SECTORS: IndiaMaritimeSector[] = [
  {
    id: 'SEC-MUM',
    name: 'Mumbai High Offshore Corridor',
    subName: 'Sector Alpha · Arabian Sea Basin',
    fleetCommand: 'Western Naval Command',
    region: 'Arabian Sea',
    lat: 19.3792,
    lon: 71.3550,
    depthRangeM: '35m – 78m',
    activeSurveys: 4,
    contactsLogged: 17,
    criticalThreats: 3,
    primaryClass: 'Subsea Pipeline & Industrial Steel',
    status: 'ACTIVE SURVEY',
    description: 'High-density crude transmission corridors intersecting heavy industrial anchor drag and abandoned drill-string debris.',
    assignedVessel: 'INS Sandhayak (J18)',
  },
  {
    id: 'SEC-GOA',
    name: 'Goa Coastal Shipping Fairway',
    subName: 'Sector Bravo · Mormugao Outer Channel',
    fleetCommand: 'Western Naval Command',
    region: 'Arabian Sea',
    lat: 15.4092,
    lon: 73.7533,
    depthRangeM: '22m – 45m',
    activeSurveys: 2,
    contactsLogged: 9,
    criticalThreats: 1,
    primaryClass: 'Lost Containers & Synthetic Polymers',
    status: 'ROUTINE PATROL',
    description: 'Main commercial fairway with sunken ISO 20ft container hazards and microplastic dispersion plumes.',
    assignedVessel: 'INS Sarvekshak (J22)',
  },
  {
    id: 'SEC-KOC',
    name: 'Kochi Southern Naval Anchorage',
    subName: 'Sector Charlie · Malabar Coastal Trench',
    fleetCommand: 'Southern Naval Command',
    region: 'Arabian Sea',
    lat: 9.9312,
    lon: 76.2215,
    depthRangeM: '18m – 62m',
    activeSurveys: 3,
    contactsLogged: 12,
    criticalThreats: 2,
    primaryClass: 'Harbor Channel Debris & Wrecks',
    status: 'CLEARANCE VERIFIED',
    description: 'Deep naval entrance channel with acoustic bathymetric baseline mapping and sediment scouring clearance.',
    assignedVessel: 'INS Jamuna (J16)',
  },
  {
    id: 'SEC-GOM',
    name: 'Gulf of Mannar Coral Biosphere',
    subName: 'Sector Delta · Indo-Sri Lanka Palk Strait',
    fleetCommand: 'MoES / NIOT',
    region: 'Indian Ocean',
    lat: 9.1367,
    lon: 79.2122,
    depthRangeM: '12m – 34m',
    activeSurveys: 5,
    contactsLogged: 24,
    criticalThreats: 6,
    primaryClass: 'Ghost Fishing Nets & Reef Entanglement',
    status: 'HIGH ALERT',
    description: 'Environmentally critical coral biosphere with high-density derelict monofilament gillnets trapping marine megafauna.',
    assignedVessel: 'ORV Sagar Kanya (MoES)',
  },
  {
    id: 'SEC-CHE',
    name: 'Chennai Port & Coromandel Shelf',
    subName: 'Sector Echo · Eastern Coastline',
    fleetCommand: 'Eastern Naval Command',
    region: 'Bay of Bengal',
    lat: 13.0827,
    lon: 80.3250,
    depthRangeM: '25m – 85m',
    activeSurveys: 2,
    contactsLogged: 11,
    criticalThreats: 1,
    primaryClass: 'Historical Shipwrecks & Heavy Anchors',
    status: 'ROUTINE PATROL',
    description: 'Coromandel continental shelf with multiple legacy maritime obstacles and commercial shipping lanes.',
    assignedVessel: 'INS Darshak (J21)',
  },
  {
    id: 'SEC-VZG',
    name: 'Visakhapatnam Deep Harbor Fleet Base',
    subName: 'Sector Foxtrot · Eastern Fleet Anchorage',
    fleetCommand: 'Eastern Naval Command',
    region: 'Bay of Bengal',
    lat: 17.6861,
    lon: 83.2917,
    depthRangeM: '40m – 120m',
    activeSurveys: 6,
    contactsLogged: 19,
    criticalThreats: 4,
    primaryClass: 'Unexploded Ordnance & Metallic Bodies',
    status: 'ACTIVE SURVEY',
    description: 'Deep naval anchorage and submarine transit channel with high-priority mine-like contact verification.',
    assignedVessel: 'INS Nirdeshak (J19)',
  },
  {
    id: 'SEC-PBL',
    name: 'Port Blair & Ten Degree Channel',
    subName: 'Sector Golf · Andaman Sea Subduction Zone',
    fleetCommand: 'Andaman & Nicobar Command',
    region: 'Andaman Sea',
    lat: 11.6234,
    lon: 92.7265,
    depthRangeM: '50m – 450m',
    activeSurveys: 3,
    contactsLogged: 14,
    criticalThreats: 2,
    primaryClass: 'Trench Anomaly & Subsea Volcanics',
    status: 'HIGH ALERT',
    description: 'Deep oceanic trench sector along international Malacca Strait approach with steep bathymetric gradients.',
    assignedVessel: 'INS Investigator (J15)',
  },
  {
    id: 'SEC-LAK',
    name: 'Lakshadweep Kavaratti Lagoon',
    subName: 'Sector Hotel · Atoll Coral Basin',
    fleetCommand: 'MoES / NIOT',
    region: 'Lakshadweep Sea',
    lat: 10.5667,
    lon: 72.6417,
    depthRangeM: '8m – 30m',
    activeSurveys: 2,
    contactsLogged: 8,
    criticalThreats: 1,
    primaryClass: 'Coral Siltation & Plastic Debris',
    status: 'CLEARANCE VERIFIED',
    description: 'Pristine atoll lagoon monitored for illegal fishing gear discarding and coral bleaching acoustic footprints.',
    assignedVessel: 'FORV Sagar Sampada (CMLRE)',
  },
];

export const HYDROGRAPHIC_VESSELS: HydrographicVessel[] = [
  {
    id: 'VESSEL-01',
    name: 'INS Sandhayak',
    pennant: 'J18',
    type: 'Survey Vessel (Large)',
    operator: 'Indian Navy',
    lat: 19.3850,
    lon: 71.3620,
    headingDeg: 178,
    speedKts: 4.2,
    currentSector: 'Mumbai High Offshore',
    swathWidthM: 150,
    transducerFreq: '900 kHz / 450 kHz Dual-Band SSS',
  },
  {
    id: 'VESSEL-02',
    name: 'INS Nirdeshak',
    pennant: 'J19',
    type: 'Survey Vessel (Large)',
    operator: 'Indian Navy',
    lat: 17.6920,
    lon: 83.2980,
    headingDeg: 82,
    speedKts: 4.8,
    currentSector: 'Visakhapatnam Deep Harbor',
    swathWidthM: 150,
    transducerFreq: '900 kHz High-Res Side-Scan',
  },
  {
    id: 'VESSEL-03',
    name: 'ORV Sagar Kanya',
    pennant: 'SK-01',
    type: 'Oceanographic Research Vessel',
    operator: 'Ministry of Earth Sciences',
    lat: 9.1420,
    lon: 79.2180,
    headingDeg: 284,
    speedKts: 3.6,
    currentSector: 'Gulf of Mannar Coral Biosphere',
    swathWidthM: 75,
    transducerFreq: '1200 kHz Ultra High-Resolution SSS',
  },
  {
    id: 'VESSEL-04',
    name: 'FORV Sagar Sampada',
    pennant: 'SS-02',
    type: 'Fisheries Research Vessel',
    operator: 'NIOT / CMLRE',
    lat: 10.5720,
    lon: 72.6480,
    headingDeg: 45,
    speedKts: 4.0,
    currentSector: 'Lakshadweep Kavaratti Lagoon',
    swathWidthM: 100,
    transducerFreq: '450 kHz Wide-Swath SSS',
  },
];

// Simplified India Maritime Exclusive Economic Zone (EEZ) perimeter polygon for Leaflet
export const INDIA_EEZ_POLYGON: [number, number][] = [
  [23.5, 68.0],
  [20.5, 66.5],
  [16.5, 69.0],
  [12.0, 71.0],
  [7.5, 74.5],
  [5.5, 78.5],
  [6.0, 83.0],
  [9.0, 85.0],
  [12.5, 87.5],
  [17.0, 89.0],
  [21.5, 89.5],
  [21.8, 88.0],
  [18.5, 84.5],
  [13.5, 80.5],
  [8.5, 78.0],
  [8.0, 76.5],
  [13.0, 74.0],
  [19.0, 72.5],
  [22.5, 69.5],
  [23.5, 68.0],
];
