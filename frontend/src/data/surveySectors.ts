export interface SurveySector {
  id: string;
  name: string;
  shortName: string;
  code: string;
  lat: number;
  lon: number;
  coordString: string;
  depthRange: string;
  averageDepthM: number;
  acousticChirpKhz: number;
  waterSalinityPsu: number;
  soundVelocityMps: number;
  surveyVessel: string;
  ecosystemZone: string;
  primaryThreat: string;
  description: string;
  badgeColor: string;
}

export const INDIAN_SURVEY_SECTORS: SurveySector[] = [
  {
    id: 'mumbai-high',
    name: 'Sector Alpha · Mumbai High & Konkan Shelf',
    shortName: 'Mumbai High',
    code: 'IN-MH-01',
    lat: 18.9217,
    lon: 72.8214,
    coordString: '18.9217° N, 72.8214° E',
    depthRange: '35m - 65m',
    averageDepthM: 45.0,
    acousticChirpKhz: 900,
    waterSalinityPsu: 35.8,
    soundVelocityMps: 1514,
    surveyVessel: 'ORV Sagar Nidhi (NIOT)',
    ecosystemZone: 'Arabian Sea Continental Shelf',
    primaryThreat: 'Abandoned offshore steel rigging & industrial synthetic debris',
    description: 'High commercial shipping density corridor off Maharashtra coast. Dense acoustic clutter and high seabed sedimentation.',
    badgeColor: '#FFB703',
  },
  {
    id: 'gulf-of-mannar',
    name: 'Sector Bravo · Gulf of Mannar Biosphere',
    shortName: 'Gulf of Mannar',
    code: 'IN-GM-02',
    lat: 9.1245,
    lon: 79.1823,
    coordString: '09.1245° N, 79.1823° E',
    depthRange: '18m - 38m',
    averageDepthM: 28.5,
    acousticChirpKhz: 450,
    waterSalinityPsu: 34.2,
    soundVelocityMps: 1518,
    surveyVessel: 'CRV Sagar Manjusha (MoES)',
    ecosystemZone: 'UNESCO Marine Biosphere / Coral Barrier',
    primaryThreat: 'Ghost fishing nets (ALDFG) threatening Dugongs & Olive Ridley turtles',
    description: 'Critical marine sanctuary between India and Sri Lanka. Shallow water acoustic multi-path reflections requiring adaptive speckle suppression.',
    badgeColor: '#00F5D4',
  },
  {
    id: 'vizag-trench',
    name: 'Sector Charlie · Visakhapatnam Bengal Fan',
    shortName: 'Vizag Trench',
    code: 'IN-VZ-03',
    lat: 17.6868,
    lon: 83.3541,
    coordString: '17.6868° N, 83.3541° E',
    depthRange: '90m - 180m',
    averageDepthM: 125.0,
    acousticChirpKhz: 100,
    waterSalinityPsu: 33.1,
    soundVelocityMps: 1498,
    surveyVessel: 'INS Investigator (Naval Hydrographic)',
    ecosystemZone: 'Bay of Bengal Deep Subsea Trench',
    primaryThreat: 'Sunken maritime containers & heavy deep-sea trawl cables',
    description: 'Deepwater bathymetric canyon subject to high riverine discharge sediment. Requires deep towfish deployment at 25m seabed altitude.',
    badgeColor: '#38BDF8',
  },
  {
    id: 'cochin-sea',
    name: 'Sector Delta · Cochin / Lakshadweep Sea',
    shortName: 'Cochin Passage',
    code: 'IN-CH-04',
    lat: 9.9674,
    lon: 76.2429,
    coordString: '09.9674° N, 76.2429° E',
    depthRange: '40m - 85m',
    averageDepthM: 62.0,
    acousticChirpKhz: 900,
    waterSalinityPsu: 35.1,
    soundVelocityMps: 1512,
    surveyVessel: 'ORV Sagar Kanya (MoES-NCPOR)',
    ecosystemZone: 'Malabar Coastal Eco-Corridor',
    primaryThreat: 'Ghost purse-seine nets & lost maritime cargo pallets',
    description: 'International maritime transit lane convergence. High acoustic shadow distortion from rocky seabed outcroppings.',
    badgeColor: '#A78BFA',
  },
];

export const DEFAULT_SURVEY_SECTOR = INDIAN_SURVEY_SECTORS[0];
