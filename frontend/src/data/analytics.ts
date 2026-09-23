import type { AnalyticsData } from '../types';

export const MISSION_ANALYTICS: AnalyticsData = {
  missionId: 'SX-014',
  surveyedArea: 12.84,
  duration: '02:14:32',
  trackLength: 38.7,
  totalTargets: 17,
  priorityTargets: 4,
  avgDepth: 46.3,
  coverage: 87,

  /** Detections over time (every 10 minutes of mission) */
  detectionsOverTime: [
    { time: '04:18', detections: 0,  cumulative: 0  },
    { time: '04:28', detections: 2,  cumulative: 2  },
    { time: '04:38', detections: 1,  cumulative: 3  },
    { time: '04:48', detections: 3,  cumulative: 6  },
    { time: '04:58', detections: 2,  cumulative: 8  },
    { time: '05:08', detections: 1,  cumulative: 9  },
    { time: '05:18', detections: 4,  cumulative: 13 },
    { time: '05:28', detections: 0,  cumulative: 13 },
    { time: '05:38', detections: 2,  cumulative: 15 },
    { time: '05:48', detections: 1,  cumulative: 16 },
    { time: '05:58', detections: 0,  cumulative: 16 },
    { time: '06:08', detections: 1,  cumulative: 17 },
    { time: '06:18', detections: 0,  cumulative: 17 },
    { time: '06:28', detections: 0,  cumulative: 17 },
  ],

  /** Confidence distribution */
  confidenceDistribution: [
    { range: '50–60%', count: 2 },
    { range: '60–70%', count: 2 },
    { range: '70–80%', count: 4 },
    { range: '80–90%', count: 6 },
    { range: '90–100%', count: 3 },
  ],

  /** Target class breakdown — uses actual SONARX YOLOv8s trained class names */
  classDistribution: [
    { name: 'Ghost Net (ALDFG)',    count: 7,  color: '#FFB703' },
    { name: 'Anthropogenic Debris', count: 4,  color: '#F59E0B' },
    { name: 'Pipeline Hazard',      count: 3,  color: '#38BDF8' },
    { name: 'Seafloor Anomaly',     count: 3,  color: '#94A3B8' },
  ],

  /** Depth distribution */
  depthDistribution: [
    { range: '35–40 m', count: 3  },
    { range: '40–45 m', count: 7  },
    { range: '45–50 m', count: 5  },
    { range: '50–55 m', count: 1  },
    { range: '55–60 m', count: 1  },
  ],

  /** Coverage over time */
  coverageOverTime: [
    { time: '04:18', coverage: 0  },
    { time: '04:38', coverage: 12 },
    { time: '04:58', coverage: 26 },
    { time: '05:18', coverage: 41 },
    { time: '05:38', coverage: 58 },
    { time: '05:58', coverage: 72 },
    { time: '06:18', coverage: 84 },
    { time: '06:32', coverage: 87 },
  ],

  /** Sonar intensity over track (average backscatter per 500 m segment) */
  sonarIntensity: [
    { segment: '0 km',  intensity: 42 },
    { segment: '5 km',  intensity: 61 },
    { segment: '10 km', intensity: 78 },
    { segment: '15 km', intensity: 55 },
    { segment: '20 km', intensity: 83 },
    { segment: '25 km', intensity: 67 },
    { segment: '30 km', intensity: 49 },
    { segment: '35 km', intensity: 72 },
    { segment: '38.7 km', intensity: 58 },
  ],
};
