import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Polygon, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  CheckCircle2,
  Sliders,
  Search,
  ChevronDown,
  Check,
  Target,
  Crosshair,
  Layers,
  Plus,
  Minus,
  Maximize2,
  Navigation,
  FileText,
  Download,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Compass,
  Copy,
  CheckCheck,
  Sparkles,
  X,
  Ruler,
  Info,
  Waves,
  Activity,
  Box,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGeospatialConfig } from '../context/GeospatialConfigContext';
import { exportGeoJsonDossier } from '../utils/gisExporter';
import { MISSION_V3_TARGETS } from '../data/missionV3Data';
import { sonarAudio } from '../utils/sonarAudio';
import { exportOfficialIncidentReport } from '../utils/incidentReportGenerator';
import { SURVEY_SITES } from '../data/consoleData';

// Map Scenarios Definitions with Regional Coordinates
interface MapScenario {
  id: string;
  name: string;
  region: string;
  center: [number, number];
  zoom: number;
  eezLine: [number, number][];
  surveyTrack: [number, number][];
  swathCorridor: [number, number][];
}

const SCENARIOS: MapScenario[] = [
  {
    id: 'mumbai-high',
    name: 'Mumbai High Offshore Corridor',
    region: 'WESTERN ARABIAN SEA',
    center: [19.2, 71.8],
    zoom: 8,
    eezLine: [
      [20.5, 71.2],
      [19.6, 71.4],
      [18.9, 71.7],
      [18.0, 71.9],
    ],
    surveyTrack: [
      [19.9, 71.7],
      [19.45, 71.45],
      [19.12, 71.75],
      [18.5, 71.35],
      [18.2, 72.1],
    ],
    swathCorridor: [
      [19.92, 71.68],
      [19.47, 71.43],
      [19.14, 71.73],
      [18.52, 71.33],
      [18.22, 72.08],
      [18.18, 72.12],
      [18.48, 71.37],
      [19.1, 71.77],
      [19.43, 71.47],
      [19.88, 71.72],
    ],
  },
  {
    id: 'mannar-biosphere',
    name: 'Gulf of Mannar Coral Biosphere',
    region: 'SOUTHERN CORAL SHELF',
    center: [9.136, 79.212],
    zoom: 9,
    eezLine: [
      [9.45, 79.05],
      [9.25, 79.25],
      [9.05, 79.35],
      [8.85, 79.5],
    ],
    surveyTrack: [
      [9.28, 79.12],
      [9.2, 79.18],
      [9.136, 79.212],
      [9.08, 79.28],
      [9.02, 79.35],
    ],
    swathCorridor: [
      [9.29, 79.11],
      [9.21, 79.17],
      [9.146, 79.202],
      [9.09, 79.27],
      [9.03, 79.34],
      [9.01, 79.36],
      [9.07, 79.29],
      [9.126, 79.222],
      [9.19, 79.19],
      [9.27, 79.13],
    ],
  },
  {
    id: 'vizag-trench',
    name: 'Visakhapatnam Deep Trench',
    region: 'EASTERN BAY OF BENGAL',
    center: [17.686, 83.218],
    zoom: 9,
    eezLine: [
      [18.1, 83.4],
      [17.8, 83.3],
      [17.5, 83.2],
      [17.2, 83.1],
    ],
    surveyTrack: [
      [17.82, 83.32],
      [17.75, 83.25],
      [17.686, 83.218],
      [17.62, 83.16],
      [17.55, 83.1],
    ],
    swathCorridor: [
      [17.83, 83.31],
      [17.76, 83.24],
      [17.696, 83.208],
      [17.63, 83.15],
      [17.56, 83.09],
      [17.54, 83.11],
      [17.61, 83.17],
      [17.676, 83.228],
      [17.74, 83.26],
      [17.81, 83.33],
    ],
  },
  {
    id: 'goa-ridge',
    name: 'Goa Shelf Basalt Ridge',
    region: 'CENTRAL WEST SHELF',
    center: [15.409, 73.753],
    zoom: 9,
    eezLine: [
      [15.8, 73.5],
      [15.5, 73.65],
      [15.2, 73.8],
      [14.9, 73.95],
    ],
    surveyTrack: [
      [15.55, 73.65],
      [15.48, 73.71],
      [15.409, 73.753],
      [15.34, 73.81],
      [15.26, 73.88],
    ],
    swathCorridor: [
      [15.56, 73.64],
      [15.49, 73.7],
      [15.419, 73.743],
      [15.35, 73.8],
      [15.27, 73.87],
      [15.25, 73.89],
      [15.33, 73.82],
      [15.399, 73.763],
      [15.47, 73.72],
      [15.54, 73.66],
    ],
  },
];

// Target item structure
interface MapTargetItem {
  id: string;
  name: string;
  scenarioId: string;
  category: 'GHOST_NET' | 'PIPELINE' | 'DEBRIS' | 'ANOMALY';
  categoryLabel: string;
  color: string;
  lat: number;
  lng: number;
  depthM: number;
  confidence: number;
  shadowM: number;
  sizeM: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reliefM: number;
  proudM: number;
  backscatterDb: number;
}

const ALL_SCENARIO_TARGETS: MapTargetItem[] = [
  // Mumbai High Targets
  {
    id: 'SX-009',
    name: 'SX-009 // PIPELINE HAZARD',
    scenarioId: 'mumbai-high',
    category: 'PIPELINE',
    categoryLabel: 'Pipeline Hazard',
    color: '#06B6D4',
    lat: 19.12,
    lng: 71.75,
    depthM: 43.1,
    confidence: 94.7,
    shadowM: 2.31,
    sizeM: 12.4,
    priority: 'HIGH',
    reliefM: 2.31,
    proudM: 1.42,
    backscatterDb: 18.4,
  },
  {
    id: 'SX-012',
    name: 'SX-012 // GHOST NET (ALDFG)',
    scenarioId: 'mumbai-high',
    category: 'GHOST_NET',
    categoryLabel: 'Ghost Net (ALDFG)',
    color: '#EF4444',
    lat: 19.82,
    lng: 71.65,
    depthM: 38.2,
    confidence: 92.4,
    shadowM: 3.12,
    sizeM: 18.0,
    priority: 'HIGH',
    reliefM: 3.12,
    proudM: 1.85,
    backscatterDb: 16.2,
  },
  {
    id: 'SX-007',
    name: 'SX-007 // ANTHROPOGENIC DEBRIS',
    scenarioId: 'mumbai-high',
    category: 'DEBRIS',
    categoryLabel: 'Anthropogenic Debris',
    color: '#F59E0B',
    lat: 19.45,
    lng: 71.32,
    depthM: 52.0,
    confidence: 88.1,
    shadowM: 1.85,
    sizeM: 8.5,
    priority: 'MEDIUM',
    reliefM: 1.85,
    proudM: 0.95,
    backscatterDb: 14.8,
  },
  {
    id: 'SX-014',
    name: 'SX-014 // SEAFLOOR ANOMALY',
    scenarioId: 'mumbai-high',
    category: 'ANOMALY',
    categoryLabel: 'Seafloor Anomaly',
    color: '#A855F7',
    lat: 19.28,
    lng: 72.25,
    depthM: 31.4,
    confidence: 76.5,
    shadowM: 2.1,
    sizeM: 6.2,
    priority: 'LOW',
    reliefM: 2.1,
    proudM: 0.88,
    backscatterDb: 11.2,
  },
  {
    id: 'SX-011',
    name: 'SX-011 // GHOST NET BUNDLE',
    scenarioId: 'mumbai-high',
    category: 'GHOST_NET',
    categoryLabel: 'Ghost Net (ALDFG)',
    color: '#EF4444',
    lat: 18.42,
    lng: 71.28,
    depthM: 48.0,
    confidence: 89.6,
    shadowM: 2.9,
    sizeM: 14.1,
    priority: 'HIGH',
    reliefM: 2.9,
    proudM: 1.65,
    backscatterDb: 15.6,
  },
  {
    id: 'SX-005',
    name: 'SX-005 // METALLIC DEBRIS CASK',
    scenarioId: 'mumbai-high',
    category: 'DEBRIS',
    categoryLabel: 'Anthropogenic Debris',
    color: '#F59E0B',
    lat: 18.25,
    lng: 72.12,
    depthM: 61.5,
    confidence: 83.2,
    shadowM: 1.4,
    sizeM: 4.8,
    priority: 'MEDIUM',
    reliefM: 1.4,
    proudM: 0.72,
    backscatterDb: 13.9,
  },

  // Gulf of Mannar Targets
  {
    id: 'GM-001',
    name: 'GM-001 // GILL NET ON CORAL REEF',
    scenarioId: 'mannar-biosphere',
    category: 'GHOST_NET',
    categoryLabel: 'Ghost Net (ALDFG)',
    color: '#EF4444',
    lat: 9.18,
    lng: 79.18,
    depthM: 14.5,
    confidence: 96.1,
    shadowM: 2.75,
    sizeM: 16.5,
    priority: 'HIGH',
    reliefM: 2.75,
    proudM: 1.9,
    backscatterDb: 19.5,
  },
  {
    id: 'GM-004',
    name: 'GM-004 // MONOFILAMENT TANGLE',
    scenarioId: 'mannar-biosphere',
    category: 'DEBRIS',
    categoryLabel: 'Anthropogenic Debris',
    color: '#F59E0B',
    lat: 9.12,
    lng: 79.25,
    depthM: 18.2,
    confidence: 91.5,
    shadowM: 2.1,
    sizeM: 9.2,
    priority: 'HIGH',
    reliefM: 2.1,
    proudM: 1.15,
    backscatterDb: 15.4,
  },
  {
    id: 'GM-008',
    name: 'GM-008 // SUNKEN TRAWLER RIGGING',
    scenarioId: 'mannar-biosphere',
    category: 'PIPELINE',
    categoryLabel: 'Pipeline / Subsea Hazard',
    color: '#06B6D4',
    lat: 9.08,
    lng: 79.15,
    depthM: 22.0,
    confidence: 87.8,
    shadowM: 3.4,
    sizeM: 22.0,
    priority: 'MEDIUM',
    reliefM: 3.4,
    proudM: 2.2,
    backscatterDb: 17.8,
  },
  {
    id: 'GM-015',
    name: 'GM-015 // CALCAREOUS ANOMALY',
    scenarioId: 'mannar-biosphere',
    category: 'ANOMALY',
    categoryLabel: 'Seafloor Anomaly',
    color: '#A855F7',
    lat: 9.22,
    lng: 79.31,
    depthM: 12.0,
    confidence: 79.2,
    shadowM: 1.6,
    sizeM: 5.5,
    priority: 'LOW',
    reliefM: 1.6,
    proudM: 0.65,
    backscatterDb: 11.8,
  },

  // Visakhapatnam Deep Trench Targets
  {
    id: 'VZ-101',
    name: 'VZ-101 // SUBSEA CABLE DEBRIS',
    scenarioId: 'vizag-trench',
    category: 'PIPELINE',
    categoryLabel: 'Pipeline / Cable Hazard',
    color: '#06B6D4',
    lat: 17.72,
    lng: 83.28,
    depthM: 180.5,
    confidence: 95.3,
    shadowM: 3.6,
    sizeM: 24.5,
    priority: 'HIGH',
    reliefM: 3.6,
    proudM: 2.1,
    backscatterDb: 21.0,
  },
  {
    id: 'VZ-105',
    name: 'VZ-105 // DRIFTING LONGLINE ARRAY',
    scenarioId: 'vizag-trench',
    category: 'GHOST_NET',
    categoryLabel: 'Ghost Net (ALDFG)',
    color: '#EF4444',
    lat: 17.65,
    lng: 83.18,
    depthM: 125.0,
    confidence: 90.1,
    shadowM: 2.8,
    sizeM: 19.0,
    priority: 'HIGH',
    reliefM: 2.8,
    proudM: 1.7,
    backscatterDb: 16.4,
  },
  {
    id: 'VZ-112',
    name: 'VZ-112 // INDUSTRIAL CARGO DRUM',
    scenarioId: 'vizag-trench',
    category: 'DEBRIS',
    categoryLabel: 'Anthropogenic Debris',
    color: '#F59E0B',
    lat: 17.58,
    lng: 83.35,
    depthM: 210.0,
    confidence: 84.7,
    shadowM: 1.9,
    sizeM: 6.8,
    priority: 'MEDIUM',
    reliefM: 1.9,
    proudM: 1.2,
    backscatterDb: 14.1,
  },

  // Goa Shelf Basalt Ridge Targets
  {
    id: 'GA-021',
    name: 'GA-021 // TRAWL NET ON BASALT',
    scenarioId: 'goa-ridge',
    category: 'GHOST_NET',
    categoryLabel: 'Ghost Net (ALDFG)',
    color: '#EF4444',
    lat: 15.45,
    lng: 73.68,
    depthM: 35.0,
    confidence: 93.8,
    shadowM: 3.2,
    sizeM: 17.2,
    priority: 'HIGH',
    reliefM: 3.2,
    proudM: 1.8,
    backscatterDb: 18.0,
  },
  {
    id: 'GA-025',
    name: 'GA-025 // LOST STEEL TRAP ARRAY',
    scenarioId: 'goa-ridge',
    category: 'DEBRIS',
    categoryLabel: 'Anthropogenic Debris',
    color: '#F59E0B',
    lat: 15.38,
    lng: 73.81,
    depthM: 42.5,
    confidence: 89.2,
    shadowM: 2.4,
    sizeM: 11.5,
    priority: 'MEDIUM',
    reliefM: 2.4,
    proudM: 1.35,
    backscatterDb: 15.2,
  },
  {
    id: 'GA-030',
    name: 'GA-030 // WRECK METAL ANOMALY',
    scenarioId: 'goa-ridge',
    category: 'ANOMALY',
    categoryLabel: 'Seafloor Anomaly',
    color: '#A855F7',
    lat: 15.52,
    lng: 73.72,
    depthM: 28.0,
    confidence: 78.4,
    shadowM: 1.7,
    sizeM: 7.0,
    priority: 'LOW',
    reliefM: 1.7,
    proudM: 0.9,
    backscatterDb: 12.5,
  },
];

// Custom Circular Target Pin with Label
const createTargetIcon = (target: MapTargetItem, isSelected: boolean) => {
  const isSelectedRing = isSelected
    ? `<div style="position: absolute; width: 44px; height: 44px; border: 2px dashed #FFB703; border-radius: 8px; animation: spin 8s linear infinite;"></div>`
    : '';

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${isSelectedRing}
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${target.color}; background: #050B14; box-shadow: 0 0 12px ${target.color}80; display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${target.color};"></div>
      </div>
      <div style="position: absolute; top: -14px; padding: 1px 5px; border-radius: 4px; background: #050B14; border: 1px solid ${target.color}; font-size: 8px; font-family: monospace; font-weight: bold; color: ${target.color}; white-space: nowrap;">
        ${target.id}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-subsea-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Map Lifecycle Controller and Hook
const MapBridge: React.FC<{
  onRegisterMap: (map: L.Map) => void;
  center: [number, number];
  zoom: number;
}> = ({ onRegisterMap, center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    onRegisterMap(map);
  }, [map, onRegisterMap]);

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);

  return null;
};

// Geodesic distance measurement tool inside Leaflet
const MapMeasureTool: React.FC<{
  isMeasuring: boolean;
  onAddPoint: (pt: [number, number]) => void;
}> = ({ isMeasuring, onAddPoint }) => {
  useMapEvents({
    click(e) {
      if (!isMeasuring) return;
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Distance calculation between two lat/lng points
const calcHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dKm = R * c;
  const dNm = dKm * 0.539957;
  return { km: Number(dKm.toFixed(2)), nm: Number(dNm.toFixed(2)) };
};

export const DetectionMapPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const { openModal } = useGeospatialConfig();

  // State Management
  const [activeScenario, setActiveScenario] = useState<MapScenario>(SCENARIOS[0]);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'bathymetry' | 'sonar'>('satellite');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('SX-009');
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'evidence' | 'specs' | 'timeline' | 'geotag'>('evidence');
  const [cropViewMode, setCropViewMode] = useState<'2d' | '3d' | 'depth'>('2d');
  const [confidenceCutoff, setConfidenceCutoff] = useState<number>(40);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1x');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Measurement Tool State
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Layer Visibility State (LAYERS 8/8)
  const [layerVisibility, setLayerVisibility] = useState({
    eez: true,
    trackline: true,
    targets: true,
    uncertainty: true, // ±r meters Position Uncertainty Buffer (Acoustic Ray Bending & Towfish Layback)
    shadows: true,
    bathymetry: true,
    swath: true,
    vessel: true,
  });
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // Map instance ref
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  const scenarioMenuRef = useRef<HTMLDivElement>(null);

  // Show transient feedback toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) {
        setIsLayerMenuOpen(false);
      }
      if (scenarioMenuRef.current && !scenarioMenuRef.current.contains(e.target as Node)) {
        setIsScenarioOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter targets by scenario and confidence
  const scenarioTargets = useMemo(() => {
    return ALL_SCENARIO_TARGETS.filter((t) => t.scenarioId === activeScenario.id);
  }, [activeScenario]);

  // Confidence-filtered targets
  const visibleTargets = useMemo(() => {
    return scenarioTargets.filter((t) => t.confidence >= confidenceCutoff);
  }, [scenarioTargets, confidenceCutoff]);

  // Selected Target object
  const selectedTarget = useMemo(() => {
    const found = scenarioTargets.find((t) => t.id === selectedTargetId);
    return found || scenarioTargets[0] || ALL_SCENARIO_TARGETS[0];
  }, [scenarioTargets, selectedTargetId]);

  // Position Uncertainty Radius (±r meters) calculation based on depth, slant range & classification confidence
  const getTargetUncertaintyRadiusM = useCallback((target: { depthM?: number; confidence?: number; sizeM?: number }) => {
    const depth = target.depthM || 40;
    const conf = (target.confidence || 85) / 100;
    const rayBendingError = depth * 0.058; // Acoustic ray bending through thermocline
    const laybackError = 25 * 0.075; // Towfish layback / catenary offset
    const ambiguityError = (1 - conf) * 6.5;
    const tpu = Math.sqrt(1.2 * 1.2 + rayBendingError * rayBendingError + laybackError * laybackError) + ambiguityError;
    return Math.min(22.0, Math.max(3.8, Math.round(tpu * 10) / 10));
  }, []);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return scenarioTargets.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q)
    );
  }, [scenarioTargets, searchQuery]);

  // Handle Scenario Switch
  const handleSelectScenario = useCallback((sc: MapScenario) => {
    setActiveScenario(sc);
    setIsScenarioOpen(false);
    sonarAudio.playSonarPing?.();
    const firstTarget = ALL_SCENARIO_TARGETS.find((t) => t.scenarioId === sc.id);
    if (firstTarget) {
      setSelectedTargetId(firstTarget.id);
    }
    triggerToast(`Loaded survey scenario: ${sc.name}`);
  }, []);

  // Handle Target Selection (Bidirectional)
  const handleSelectTarget = useCallback((targetId: string) => {
    setSelectedTargetId(targetId);
    const target = scenarioTargets.find((t) => t.id === targetId);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], Math.max(9, activeScenario.zoom + 1), {
        duration: 0.8,
      });
      sonarAudio.playTargetBeep?.();
    }
  }, [scenarioTargets, activeScenario]);

  // Cycle Previous Target
  const handlePrevTarget = useCallback(() => {
    if (scenarioTargets.length === 0) return;
    const idx = scenarioTargets.findIndex((t) => t.id === selectedTargetId);
    const prevIdx = idx <= 0 ? scenarioTargets.length - 1 : idx - 1;
    handleSelectTarget(scenarioTargets[prevIdx].id);
  }, [scenarioTargets, selectedTargetId, handleSelectTarget]);

  // Cycle Next Target
  const handleNextTarget = useCallback(() => {
    if (scenarioTargets.length === 0) return;
    const idx = scenarioTargets.findIndex((t) => t.id === selectedTargetId);
    const nextIdx = (idx + 1) % scenarioTargets.length;
    handleSelectTarget(scenarioTargets[nextIdx].id);
  }, [scenarioTargets, selectedTargetId, handleSelectTarget]);

  // Autoplay Slideshow Effect
  useEffect(() => {
    if (!isPlaying) return;
    const multiplier = playbackSpeed === '0.5x' ? 0.5 : playbackSpeed === '2x' ? 2 : playbackSpeed === '4x' ? 4 : 1;
    const intervalMs = 4000 / multiplier;

    const timer = setInterval(() => {
      handleNextTarget();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, handleNextTarget]);

  // Map Navigation Functions
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
    sonarAudio.playTargetBeep?.();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
    sonarAudio.playTargetBeep?.();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(activeScenario.center, activeScenario.zoom, { duration: 1.0 });
      sonarAudio.playLockBeep?.();
      triggerToast(`Re-centered to ${activeScenario.name}`);
    }
  };

  // Toggle Measurement Tool
  const toggleMeasureTool = () => {
    setIsMeasuring((prev) => {
      const next = !prev;
      if (!next) {
        setMeasurePoints([]);
      } else {
        triggerToast('Measuring Ruler Active: Click 2 points on the seafloor to measure distance');
      }
      return next;
    });
  };

  const handleMeasurePointAdd = (pt: [number, number]) => {
    setMeasurePoints((prev) => {
      if (prev.length >= 2) {
        return [pt];
      }
      return [...prev, pt];
    });
  };

  const measuredDistance = useMemo(() => {
    if (measurePoints.length === 2) {
      return calcHaversine(measurePoints[0][0], measurePoints[0][1], measurePoints[1][0], measurePoints[1][1]);
    }
    return null;
  }, [measurePoints]);

  // Copy WGS84 Coordinates to Clipboard
  const handleCopyCoordinates = () => {
    const text = `${selectedTarget.lat.toFixed(4)}° N, ${selectedTarget.lng.toFixed(4)}° E (Depth: ${selectedTarget.depthM}m)`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    triggerToast(`WGS84 Coordinates copied to clipboard!`);
    setTimeout(() => setIsCopied(false), 2400);
  };

  // Export Official Dossier
  const handleExportIncidentReport = () => {
    sonarAudio.playLockBeep?.();
    const site = SURVEY_SITES[0];
    const candidateAdapter = visibleTargets.map((t) => ({
      id: t.id,
      class: t.categoryLabel,
      confidence: t.confidence / 100,
      aspectRatio: 2.1,
      shadowLengthM: t.shadowM,
      depthM: t.depthM,
      dimensions: `~${t.sizeM}m`,
      status: 'CONFIRMED' as const,
      lat: t.lat,
      lon: t.lng,
      rawX: 50,
      rawY: 50,
    }));

    exportOfficialIncidentReport(site, candidateAdapter, confidenceCutoff / 100, true);
    triggerToast(`Downloaded MoES Marine Debris Incident Report (PDF)`);
  };

  // Active layers counter
  const activeLayersCount = Object.values(layerVisibility).filter(Boolean).length;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[720px] bg-[#05070B] text-slate-100 font-sans select-none overflow-hidden space-y-2 pb-1 relative">
      {/* ── TOAST ALERT BANNER ── */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[600] px-4 py-2 bg-[#091524] border border-[#FFB703] rounded-lg text-xs font-mono font-bold text-[#FFB703] shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#FFB703]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ── 1. TOP HEADER: MOES SUBSEA GIS INTELLIGENCE ── */}
      <div className="px-4 py-2 bg-[#070D18] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 shrink-0 shadow-lg">
        {/* Left: Survey Identification */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sonarAudio.playSonarPing?.();
              triggerToast('MoES Hydrographic GIS Core Online · 900 kHz Slant Stream');
            }}
            className="w-6 h-6 rounded bg-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] font-bold text-xs font-mono hover:bg-[#FFB703]/20 transition-colors cursor-pointer"
            title="Sonar Ping Audio Check"
          >
            SX
          </button>
          <div>
            <div className="font-mono font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <span>MOES SUBSEA GIS INTELLIGENCE</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Survey: <strong className="text-slate-200">NIOT / INCOIS 48.2 NM — {activeScenario.name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Classification Legend Pills (Clicking filters by class) */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono">
          <button
            onClick={() => setSearchQuery('Ghost Net')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06] hover:border-red-500/50 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <span className="text-slate-300 font-semibold">Ghost Net (ALDFG)</span>
          </button>
          <button
            onClick={() => setSearchQuery('Pipeline')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06] hover:border-cyan-400/50 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span className="text-slate-300 font-semibold">Pipeline</span>
          </button>
          <button
            onClick={() => setSearchQuery('Debris')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/50 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-slate-300 font-semibold">Debris</span>
          </button>
          <button
            onClick={() => setSearchQuery('Anomaly')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06] hover:border-purple-400/50 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
            <span className="text-slate-300 font-semibold">Anomaly</span>
          </button>
        </div>

        {/* Right: Verified Badge & Settings */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => triggerToast(`${visibleTargets.length} targets currently verified by YOLOv8s + Acoustic Shadow Gate`)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold cursor-help"
            title="Verified against MoES Marine Taxonomy"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{visibleTargets.length} VERIFIED</span>
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703]/50 text-slate-300 hover:text-white font-mono font-bold text-[10.5px] rounded-lg cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>MAP SETTINGS</span>
          </button>
        </div>
      </div>

      {/* ── 2. CONTROLS STRIP: SCENARIO SELECTOR, SEARCH, LAYERS ── */}
      <div className="px-4 py-1.5 bg-[#070D18] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 shrink-0 shadow-sm text-xs font-mono relative z-30">
        <div className="flex items-center gap-3 flex-1">
          {/* Active Scenario Selector Dropdown */}
          <div className="relative" ref={scenarioMenuRef}>
            <button
              onClick={() => setIsScenarioOpen(!isScenarioOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-[#FFB703]/50 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <span className="text-slate-400 font-medium">ACTIVE SCENARIO:</span>
              <span className="text-[#FFB703]">{activeScenario.name}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isScenarioOpen ? 'rotate-180' : ''}`} />
            </button>

            {isScenarioOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#090F1A] border border-white/[0.1] rounded-xl shadow-2xl z-50 p-1 space-y-1">
                <div className="px-3 py-1 text-[8.5px] font-bold uppercase text-slate-500 border-b border-white/[0.06]">
                  Select Survey Scenario
                </div>
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                      sc.id === activeScenario.id
                        ? 'bg-[#FFB703]/10 text-[#FFB703] font-bold border border-[#FFB703]/30'
                        : 'text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div>{sc.name}</div>
                      <div className="text-[8.5px] text-slate-500">{sc.region}</div>
                    </div>
                    {sc.id === activeScenario.id && <Check className="w-3.5 h-3.5 text-[#FFB703]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Field with live clear & quick suggestions */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vessel, target ID (e.g. SX-009), category, priority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleSelectTarget(searchResults[0].id);
                  setSearchQuery('');
                }
              }}
              className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg pl-8 pr-7 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer text-xs"
              >
                ✕
              </button>
            )}

            {/* Search Autocomplete Suggestions */}
            {searchResults.length > 0 && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#090F1A] border border-white/[0.1] rounded-xl shadow-2xl z-50 p-1 divide-y divide-white/[0.06] max-h-48 overflow-y-auto">
                {searchResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      handleSelectTarget(t.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white mr-2">{t.id}</span>
                      <span className="text-slate-400">{t.categoryLabel}</span>
                    </div>
                    <span className="text-[10px] text-[#FFB703] font-bold">{t.confidence}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map Base Layer Switcher + Interactive Layer Stack Menu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setMapLayer('satellite');
              triggerToast('Switched to High-Resolution Satellite Basemap');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              mapLayer === 'satellite'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            SATELLITE
          </button>

          <button
            onClick={() => {
              setMapLayer('bathymetry');
              triggerToast('Switched to GEBCO World Ocean Bathymetry');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              mapLayer === 'bathymetry'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            BATHYMETRY
          </button>

          <button
            onClick={() => {
              setMapLayer('sonar');
              triggerToast('Switched to Tactical Sonar Backscatter Swath Overlay');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              mapLayer === 'sonar'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            SONAR OVERLAY
          </button>

          {/* Interactive Layer Stack Menu (LAYERS 7/7) */}
          <div className="relative" ref={layerMenuRef}>
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-all ${
                isLayerMenuOpen
                  ? 'bg-[#131B2A] border-[#FFB703] text-[#FFB703]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3 text-[#38BDF8]" />
              <span>LAYERS {activeLayersCount}/7</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLayerMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLayerMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#090F1A] border border-white/[0.1] rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-2 py-1 text-[8.5px] font-bold uppercase text-slate-400 border-b border-white/[0.06] flex justify-between">
                  <span>Toggle Map Layers</span>
                  <span className="text-[#FFB703]">{activeLayersCount} Active</span>
                </div>
                {[
                  { key: 'eez', label: 'Indian EEZ Boundary' },
                  { key: 'trackline', label: 'Survey Vessel Trackline' },
                  { key: 'targets', label: 'Acoustic Target Pins' },
                  { key: 'uncertainty', label: 'Position Uncertainty Buffer (±r m)' },
                  { key: 'swath', label: '900 kHz Swath Footprint' },
                  { key: 'shadows', label: 'Acoustic Shadows Geometry' },
                  { key: 'bathymetry', label: 'Depth Profile Contours' },
                  { key: 'vessel', label: 'USV-04 Live Positioning' },
                ].map((item) => {
                  const isChecked = (layerVisibility as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      onClick={() =>
                        setLayerVisibility((prev) => ({
                          ...prev,
                          [item.key]: !(prev as any)[item.key],
                        }))
                      }
                      className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.04] cursor-pointer text-[10px] text-slate-300"
                    >
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="accent-[#FFB703] cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. MAIN WORKSPACE: MAP VIEWPORT (LEFT) + TARGET INTELLIGENCE (RIGHT) ── */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* CENTER / LEFT: EXPANSIVE LEAFLET MARITIME MAP */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#040810]">
          <MapContainer
            center={activeScenario.center}
            zoom={activeScenario.zoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <MapBridge
              onRegisterMap={(map) => {
                mapInstanceRef.current = map;
              }}
              center={activeScenario.center}
              zoom={activeScenario.zoom}
            />

            {/* Distance Measuring Tool Event Listener */}
            <MapMeasureTool isMeasuring={isMeasuring} onAddPoint={handleMeasurePointAdd} />

            {/* Base Tile Layer */}
            {mapLayer === 'satellite' ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri World Imagery"
                maxZoom={18}
              />
            ) : mapLayer === 'bathymetry' ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri Ocean Basemap / GEBCO Bathymetry"
                maxZoom={18}
              />
            ) : (
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="CartoDB Dark Matter / Sonar Backscatter"
                maxZoom={18}
              />
            )}

            {/* Sonar Swath Corridor Overlay (Visible when swath layer or sonar mode is enabled) */}
            {(layerVisibility.swath || mapLayer === 'sonar') && (
              <Polygon
                positions={activeScenario.swathCorridor}
                pathOptions={{
                  color: '#FFB703',
                  fillColor: '#FFB703',
                  fillOpacity: mapLayer === 'sonar' ? 0.22 : 0.12,
                  weight: 1.5,
                  dashArray: '3, 4',
                }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-[9px] text-[#FFB703]">
                    DUAL-FLANK 900 kHz SONAR SWATH COVERAGE (75m SWATH)
                  </div>
                </Tooltip>
              </Polygon>
            )}

            {/* Indian EEZ Boundary Line */}
            {layerVisibility.eez && (
              <Polyline
                positions={activeScenario.eezLine}
                pathOptions={{ color: '#00F5D4', weight: 2, dashArray: '6, 6' }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-[9px] text-cyan-400 font-bold">
                    INDIAN EEZ RECONNAISSANCE BOUNDARY
                  </div>
                </Tooltip>
              </Polyline>
            )}

            {/* Survey Vessel Trackline */}
            {layerVisibility.trackline && (
              <Polyline
                positions={activeScenario.surveyTrack}
                pathOptions={{ color: '#FFB703', weight: 2, dashArray: '4, 4' }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-[9px] text-[#FFB703]">
                    USV-04 AUTONOMOUS TOWFISH TRANSECT
                  </div>
                </Tooltip>
              </Polyline>
            )}

            {/* Interactive Distance Measuring Polyline */}
            {isMeasuring && measurePoints.length > 0 && (
              <Polyline
                positions={measurePoints}
                pathOptions={{ color: '#FBBF24', weight: 3, dashArray: '4, 4' }}
              />
            )}

            {/* Position Uncertainty Radius (±r meters) Buffer Circles */}
            {/* Models acoustic ray bending through the thermocline and USBL / towfish layback offset */}
            {layerVisibility.targets &&
              layerVisibility.uncertainty &&
              visibleTargets.map((target) => {
                const radiusM = getTargetUncertaintyRadiusM(target);
                const isSelected = target.id === selectedTargetId;
                const strokeColor = isSelected
                  ? '#38BDF8'
                  : target.priority === 'HIGH'
                  ? '#EF4444'
                  : target.priority === 'MEDIUM'
                  ? '#F59E0B'
                  : '#00F5D4';

                return (
                  <Circle
                    key={`unc-${target.id}`}
                    center={[target.lat, target.lng]}
                    radius={radiusM}
                    pathOptions={{
                      color: strokeColor,
                      fillColor: strokeColor,
                      fillOpacity: isSelected ? 0.22 : 0.08,
                      weight: isSelected ? 2.0 : 1.2,
                      dashArray: isSelected ? '4, 4' : '2, 3',
                    }}
                    eventHandlers={{
                      click: () => handleSelectTarget(target.id),
                    }}
                  />
                );
              })}

            {/* Interactive Target Pins */}
            {layerVisibility.targets &&
              visibleTargets.map((target) => (
                <Marker
                  key={target.id}
                  position={[target.lat, target.lng]}
                  icon={createTargetIcon(target, target.id === selectedTargetId)}
                  eventHandlers={{
                    click: () => handleSelectTarget(target.id),
                  }}
                >
                  {target.id === selectedTargetId && (
                    <Tooltip permanent direction="top" offset={[0, -18]}>
                      <div className="bg-[#050C16] border border-cyan-400 rounded-lg p-2 text-cyan-400 font-mono text-[9.5px] shadow-2xl space-y-0.5 leading-tight">
                        <div className="font-bold text-white">{target.categoryLabel}</div>
                        <div>Depth: -{target.depthM} m</div>
                        <div>Conf: {target.confidence}%</div>
                        <div className="text-[#00F5D4] font-semibold">
                          TPU Buffer: ±{getTargetUncertaintyRadiusM(target).toFixed(1)} m
                        </div>
                        <div className="text-[#FFB703] font-bold pt-0.5">Click for details →</div>
                      </div>
                    </Tooltip>
                  )}
                </Marker>
              ))}
          </MapContainer>

          {/* Left Vertical Map Toolbar (+, -, Crosshair, Layers, Ruler) */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-1.5 bg-[#070D18]/90 backdrop-blur-md p-1 rounded-xl border border-white/[0.1] shadow-xl text-slate-300">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/[0.08] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/[0.08] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="h-px bg-white/[0.08] my-0.5" />
            <button
              onClick={handleRecenter}
              className="p-2 hover:bg-white/[0.08] hover:text-[#FFB703] rounded-lg transition-colors cursor-pointer"
              title="Re-center on Active Survey"
            >
              <Target className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="p-2 hover:bg-white/[0.08] hover:text-[#00F5D4] rounded-lg transition-colors cursor-pointer"
              title="Toggle Layer Stack"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleMeasureTool}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isMeasuring ? 'bg-[#FFB703] text-[#05070B] font-bold' : 'hover:bg-white/[0.08] hover:text-[#38BDF8]'
              }`}
              title="Measure Distance on Seafloor"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Measuring Ruler Banner */}
          {isMeasuring && (
            <div className="absolute top-4 left-16 z-[400] bg-[#070D18]/95 backdrop-blur-md border border-[#FFB703] rounded-xl px-3 py-1.5 text-xs font-mono text-white flex items-center gap-3 shadow-2xl">
              <Ruler className="w-4 h-4 text-[#FFB703]" />
              <div>
                <span className="font-bold text-[#FFB703]">RULER ACTIVE: </span>
                <span>
                  {measurePoints.length === 0
                    ? 'Click first point on seafloor'
                    : measurePoints.length === 1
                    ? 'Click second point to measure'
                    : `Distance: ${measuredDistance?.km} km (${measuredDistance?.nm} NM)`}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMeasuring(false);
                  setMeasurePoints([]);
                }}
                className="px-2 py-0.5 rounded bg-white/[0.1] hover:bg-white/[0.2] cursor-pointer text-[10px]"
              >
                Exit
              </button>
            </div>
          )}

          {/* Top-Right Inset Mini Map of India with Clickable Regional Sectors */}
          <div className="absolute top-4 right-4 z-[400] w-32 h-32 rounded-xl bg-[#070D18]/95 backdrop-blur-md border border-white/[0.15] p-2 shadow-2xl overflow-hidden flex flex-col justify-between">
            <div className="text-[8px] font-mono font-bold text-slate-400 flex items-center justify-between">
              <span>INDIA EEZ SECTOR</span>
              <span className="text-[#FFB703] animate-pulse">● LIVE</span>
            </div>
            <div className="relative flex-1 flex items-center justify-center my-1">
              <svg viewBox="0 0 100 120" className="w-full h-full">
                {/* Silhouette outline of India */}
                <path
                  d="M 50,10 L 65,30 L 70,50 L 55,80 L 50,110 L 45,80 L 30,50 L 35,30 Z"
                  fill="#0E2238"
                  stroke="#38BDF8"
                  strokeWidth="1.2"
                />

                {/* Clickable Sector 1: Western / Mumbai High */}
                <rect
                  x="28"
                  y="42"
                  width="18"
                  height="16"
                  fill={activeScenario.id === 'mumbai-high' ? 'rgba(255,183,3,0.35)' : 'rgba(56,189,248,0.1)'}
                  stroke={activeScenario.id === 'mumbai-high' ? '#FFB703' : '#38BDF8'}
                  strokeWidth={activeScenario.id === 'mumbai-high' ? '2' : '1'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleSelectScenario(SCENARIOS[0])}
                >
                  <title>Click to switch to Mumbai High Corridor</title>
                </rect>

                {/* Clickable Sector 2: Southern / Gulf of Mannar */}
                <rect
                  x="42"
                  y="92"
                  width="16"
                  height="16"
                  fill={activeScenario.id === 'mannar-biosphere' ? 'rgba(255,183,3,0.35)' : 'rgba(56,189,248,0.1)'}
                  stroke={activeScenario.id === 'mannar-biosphere' ? '#FFB703' : '#38BDF8'}
                  strokeWidth={activeScenario.id === 'mannar-biosphere' ? '2' : '1'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleSelectScenario(SCENARIOS[1])}
                >
                  <title>Click to switch to Gulf of Mannar Biosphere</title>
                </rect>

                {/* Clickable Sector 3: Eastern / Visakhapatnam */}
                <rect
                  x="56"
                  y="52"
                  width="16"
                  height="16"
                  fill={activeScenario.id === 'vizag-trench' ? 'rgba(255,183,3,0.35)' : 'rgba(56,189,248,0.1)'}
                  stroke={activeScenario.id === 'vizag-trench' ? '#FFB703' : '#38BDF8'}
                  strokeWidth={activeScenario.id === 'vizag-trench' ? '2' : '1'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleSelectScenario(SCENARIOS[2])}
                >
                  <title>Click to switch to Visakhapatnam Deep Trench</title>
                </rect>

                {/* Clickable Sector 4: Central West / Goa */}
                <rect
                  x="32"
                  y="62"
                  width="16"
                  height="14"
                  fill={activeScenario.id === 'goa-ridge' ? 'rgba(255,183,3,0.35)' : 'rgba(56,189,248,0.1)'}
                  stroke={activeScenario.id === 'goa-ridge' ? '#FFB703' : '#38BDF8'}
                  strokeWidth={activeScenario.id === 'goa-ridge' ? '2' : '1'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleSelectScenario(SCENARIOS[3])}
                >
                  <title>Click to switch to Goa Shelf Basalt Ridge</title>
                </rect>
              </svg>
            </div>
            <div className="text-[7.5px] font-mono text-center text-[#FFB703] font-bold">
              {activeScenario.region}
            </div>
          </div>

          {/* Bottom-Right Legend Overlay Box */}
          <div className="absolute bottom-4 right-4 z-[400] bg-[#070D18]/90 backdrop-blur-md border border-white/[0.1] rounded-xl p-2.5 text-[9px] font-mono shadow-2xl space-y-2 max-w-[190px]">
            <div className="font-bold text-slate-200">Target Classes</div>
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Ghost Net (ALDFG)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Pipeline Hazard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Anthropogenic Debris</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Seafloor Anomaly</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-white/[0.08] space-y-0.5 text-slate-400">
              <div>-- Survey Track</div>
              <div className="text-[#00F5D4]">— EEZ Boundary</div>
              <div className="text-[#FFB703]">□ 75m Sonar Swath</div>
            </div>
          </div>

          {/* Scale Bar on Bottom-Left */}
          <div className="absolute bottom-4 left-4 z-[400] text-[9px] font-mono text-slate-300 bg-[#070D18]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/[0.08] flex items-center gap-2">
            <span>20 km</span>
            <div className="w-12 h-1 bg-white/[0.4] border-x border-white" />
          </div>

          {/* Live Coordinates HUD on Bottom-Right */}
          <div
            onClick={handleCopyCoordinates}
            className="absolute bottom-4 left-24 z-[400] text-[9.5px] font-mono text-slate-300 bg-[#070D18]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.08] hover:border-[#FFB703] flex items-center gap-2 cursor-pointer transition-colors"
            title="Click to copy coordinates"
          >
            <span>
              {selectedTarget.lat.toFixed(4)}° N, {selectedTarget.lng.toFixed(4)}° E
            </span>
            {isCopied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </div>
        </div>

        {/* RIGHT TACTICAL COLUMN: TARGET INTELLIGENCE & SURVEY DETAILS */}
        <div className="w-80 xl:w-96 flex flex-col justify-between gap-2.5 overflow-y-auto shrink-0 pr-1">
          {/* Card 1: Target Intelligence */}
          <div className="p-4 rounded-xl bg-[#070D18] border border-white/[0.08] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#FFB703]" />
                TARGET INTELLIGENCE
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                VERIFIED
              </span>
            </div>

            {/* Target Header & Dynamic Crop Viewport */}
            <div className="flex gap-3">
              <div className="w-24 h-24 rounded-lg bg-[#040810] border border-white/[0.1] overflow-hidden relative shrink-0 flex items-center justify-center">
                {cropViewMode === '2d' ? (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:4px_4px] opacity-60" />
                    <div className="w-14 h-14 border border-dashed border-[#06B6D4] bg-[#06B6D4]/10 rounded flex flex-col items-center justify-center text-[9px] font-mono text-[#06B6D4] font-bold">
                      <span>2D SSS</span>
                      <span className="text-[7.5px] text-slate-400">{selectedTarget.shadowM}m relief</span>
                    </div>
                  </>
                ) : cropViewMode === '3d' ? (
                  <div className="w-full h-full bg-[#020710] flex flex-col items-center justify-center text-purple-400 font-mono text-[9px] p-1">
                    <Box className="w-6 h-6 text-purple-400 mb-1" />
                    <span>3D MESH</span>
                    <span className="text-[7px] text-slate-400">{selectedTarget.proudM}m proud</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#020710] flex flex-col items-center justify-center text-emerald-400 font-mono text-[9px] p-1">
                    <Waves className="w-6 h-6 text-emerald-400 mb-1" />
                    <span>DEPTH</span>
                    <span className="text-[7px] text-slate-400">-{selectedTarget.depthM}m</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white leading-tight truncate">
                  {selectedTarget.name}
                </h4>
                <div className="inline-block text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                  {selectedTarget.priority} PRIORITY
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono pt-1 text-slate-400">
                  <div>
                    Conf: <strong className="text-white">{selectedTarget.confidence}%</strong>
                  </div>
                  <div>
                    Depth: <strong className="text-white">-{selectedTarget.depthM} m</strong>
                  </div>
                  <div>
                    Shadow: <strong className="text-white">{selectedTarget.shadowM} m</strong>
                  </div>
                  <div>
                    Size: <strong className="text-white">~{selectedTarget.sizeM} m</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: View Details & Track Target */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsDetailsModalOpen(true)}
                className="py-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#FFB703]/50 text-xs font-mono text-slate-200 hover:text-white transition-all cursor-pointer text-center active:scale-95"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  sonarAudio.playLockBeep?.();
                  setActiveTab('tracking');
                }}
                className="py-1.5 px-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-xs font-mono font-bold text-white transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1 active:scale-95"
              >
                <Crosshair className="w-3 h-3" />
                <span>Track Target</span>
              </button>
            </div>

            {/* Evidence Tabs */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 border-b border-white/[0.06] pb-1">
                {(['evidence', 'specs', 'timeline', 'geotag'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveEvidenceTab(tab)}
                    className={`capitalize pb-0.5 transition-colors cursor-pointer ${
                      activeEvidenceTab === tab
                        ? 'text-[#FFB703] border-b-2 border-[#FFB703] font-bold'
                        : 'hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB 1: Evidence Strip & Metric Decomposition */}
              {activeEvidenceTab === 'evidence' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setCropViewMode('2d')}
                      className={`p-1 rounded-lg border text-center space-y-1 transition-all cursor-pointer ${
                        cropViewMode === '2d'
                          ? 'bg-[#131B2A] border-[#FFB703] text-[#FFB703]'
                          : 'bg-[#040810] border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="h-9 rounded bg-slate-900 border border-white/[0.06] flex items-center justify-center text-[8px] font-mono font-bold">
                        2D SWATH
                      </div>
                      <div className="text-[7.5px] font-mono truncate">Side-Scan Sonar</div>
                    </button>

                    <button
                      onClick={() => setCropViewMode('3d')}
                      className={`p-1 rounded-lg border text-center space-y-1 transition-all cursor-pointer ${
                        cropViewMode === '3d'
                          ? 'bg-[#131B2A] border-purple-400 text-purple-300'
                          : 'bg-[#040810] border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="h-9 rounded bg-slate-900 border border-white/[0.06] flex items-center justify-center text-[8px] font-mono font-bold text-purple-400">
                        3D MESH
                      </div>
                      <div className="text-[7.5px] font-mono truncate text-purple-400">3D Reconstruct</div>
                    </button>

                    <button
                      onClick={() => setCropViewMode('depth')}
                      className={`p-1 rounded-lg border text-center space-y-1 transition-all cursor-pointer ${
                        cropViewMode === 'depth'
                          ? 'bg-[#131B2A] border-emerald-400 text-emerald-300'
                          : 'bg-[#040810] border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="h-9 rounded bg-slate-900 border border-white/[0.06] flex items-center justify-center text-[8px] font-mono font-bold text-emerald-400">
                        DEPTH
                      </div>
                      <div className="text-[7.5px] font-mono truncate text-emerald-400">Bathymetry</div>
                    </button>
                  </div>

                  <div className="p-2 bg-[#040810] rounded-lg border border-white/[0.06] space-y-1 text-[9px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Acoustic Shadow Void:</span>
                      <strong className="text-[#FFB703]">{selectedTarget.shadowM} m (96%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Backscatter Intensity:</span>
                      <strong className="text-cyan-400">+{selectedTarget.backscatterDb} dB</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Non-Geological Match:</span>
                      <strong className="text-emerald-400">{selectedTarget.confidence}% Certain</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Physical Specifications */}
              {activeEvidenceTab === 'specs' && (
                <div className="p-2.5 bg-[#040810] rounded-lg border border-white/[0.06] space-y-1.5 text-[9.5px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions (L × W):</span>
                    <strong className="text-white">~{selectedTarget.sizeM}m × {(selectedTarget.sizeM * 0.35).toFixed(1)}m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proud Height (h):</span>
                    <strong className="text-[#FFB703]">{selectedTarget.proudM} m above bed</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Depth:</span>
                    <strong className="text-white">-{selectedTarget.depthM} m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hydrostatic Pressure:</span>
                    <strong className="text-cyan-400">{(selectedTarget.depthM * 0.1 + 1).toFixed(1)} atm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MoES Taxonomy:</span>
                    <strong className="text-[#FFB703]">SIH-26057</strong>
                  </div>
                </div>
              )}

              {/* TAB 3: Detection Timeline */}
              {activeEvidenceTab === 'timeline' && (
                <div className="p-2.5 bg-[#040810] rounded-lg border border-white/[0.06] space-y-1.5 text-[8.5px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">04:18:22</span>
                    <span className="px-1 py-0.2 bg-[#FFB703]/20 text-[#FFB703] rounded">ING</span>
                    <span className="text-slate-200">Ping #0184 ingested (75m swath)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">04:18:24</span>
                    <span className="px-1 py-0.2 bg-cyan-500/20 text-cyan-400 rounded">DET</span>
                    <span className="text-slate-200">YOLOv8 proposal {selectedTarget.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">04:18:25</span>
                    <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">VER</span>
                    <span className="text-slate-200">Shadow relief verified ({selectedTarget.shadowM}m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">04:18:27</span>
                    <span className="px-1 py-0.2 bg-purple-500/20 text-purple-400 rounded">GEO</span>
                    <span className="text-slate-200">WGS-84 USBL positioning fix</span>
                  </div>
                </div>
              )}

              {/* TAB 4: Geotag Coordinates & USBL */}
              {activeEvidenceTab === 'geotag' && (
                <div className="p-2.5 bg-[#040810] rounded-lg border border-white/[0.06] space-y-2 text-[9.5px] font-mono">
                  <div>
                    <span className="text-slate-400 text-[8px] uppercase block">WGS-84 LAT / LNG</span>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {selectedTarget.lat.toFixed(5)}° N, {selectedTarget.lng.toFixed(5)}° E
                    </div>
                  </div>
                  <div className="flex justify-between text-[8.5px] text-slate-400 pt-1 border-t border-white/[0.06]">
                    <span>UTM GRID: Zone 43N</span>
                    <span>USBL FIX: ±0.35m</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/[0.08] space-y-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-[#00F5D4] font-bold">Position Uncertainty (TPU):</span>
                      <span className="text-[#FFB703] font-bold">±{getTargetUncertaintyRadiusM(selectedTarget).toFixed(1)} m</span>
                    </div>
                    <div className="text-[7.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-white/[0.06]">
                      <div className="flex justify-between">
                        <span>• Acoustic Ray Bending (SVP):</span>
                        <span>±{(selectedTarget.depthM * 0.058).toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Towfish Layback / Catenary:</span>
                        <span>±1.9 m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• IHO S-44 Standard:</span>
                        <span className="text-emerald-400 font-semibold">Order 1a Compliant</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCoordinates}
                    className="w-full py-1.5 rounded bg-white/[0.04] hover:bg-[#FFB703]/20 border border-white/[0.1] hover:border-[#FFB703]/50 text-[#FFB703] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'COPIED TO CLIPBOARD' : 'COPY WGS84 COORDINATES'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Survey Intelligence & Open Mission Control Button */}
          <div className="p-4 rounded-xl bg-[#070D18] border border-white/[0.08] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                SURVEY INTELLIGENCE
              </span>
              <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30">
                ACTIVE SURVEY
              </span>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white leading-tight">
                {activeScenario.name}
              </h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Autonomous hydrographic survey corridor across the {activeScenario.region} for marine debris and hazards.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/[0.06] text-center text-[9px] font-mono">
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <div className="text-slate-500 text-[7px] uppercase">AREA</div>
                <div className="font-bold text-white">12.84 km²</div>
              </div>
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <div className="text-slate-500 text-[7px] uppercase">TARGETS</div>
                <div className="font-bold text-white">{scenarioTargets.length}</div>
              </div>
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <div className="text-slate-500 text-[7px] uppercase">HIGH THREAT</div>
                <div className="font-bold text-red-400">
                  {scenarioTargets.filter((t) => t.priority === 'HIGH').length}
                </div>
              </div>
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <div className="text-slate-500 text-[7px] uppercase">VERIFIED</div>
                <div className="font-bold text-emerald-400">{visibleTargets.length}</div>
              </div>
            </div>

            {/* Big Action Button: Open Mission Control */}
            <button
              onClick={() => {
                sonarAudio.playLockBeep?.();
                setActiveTab('mission');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-mono font-black text-xs transition-all cursor-pointer shadow-lg shadow-[#FFB703]/25 active:scale-98"
            >
              <Crosshair className="w-4 h-4 text-[#05070B]" />
              <span>OPEN MISSION CONTROL CONSOLE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM DETECTION TIMELINE (SWATH PREVIEW) BAR ── */}
      <div className="px-4 py-2 bg-[#070D18] border border-white/[0.08] rounded-xl flex items-center justify-between gap-4 shrink-0 shadow-lg text-xs font-mono">
        {/* Left: Filmstrip Swath Preview with working pagination and target clicks */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span className="text-[#38BDF8]">&lt;</span>
            <span>DETECTION TIMELINE (SWATH PREVIEW)</span>
          </div>

          <button
            onClick={handlePrevTarget}
            className="p-1.5 rounded bg-white/[0.04] text-slate-400 hover:text-white shrink-0 cursor-pointer hover:bg-white/[0.1] active:scale-95 transition-all"
            title="Previous Target in Timeline"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Dynamic Swath Preview Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {scenarioTargets.map((t) => {
              const isSelected = t.id === selectedTargetId;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTarget(t.id)}
                  className={`w-16 h-10 rounded-lg bg-[#040810] border shrink-0 relative overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FFB703] shadow-[0_0_10px_rgba(255,183,3,0.4)] scale-105 bg-[#131B2A]'
                      : 'border-white/[0.15] hover:border-white/50 hover:scale-102'
                  }`}
                  title={`${t.id} (${t.categoryLabel}) - Depth: ${t.depthM}m`}
                >
                  <span
                    className="text-[8px] font-bold font-mono leading-none truncate px-1"
                    style={{ color: t.color }}
                  >
                    {t.id}
                  </span>
                  <span className="text-[7px] text-slate-400 leading-none mt-0.5">{t.confidence}%</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNextTarget}
            className="p-1.5 rounded bg-white/[0.04] text-slate-400 hover:text-white shrink-0 cursor-pointer hover:bg-white/[0.1] active:scale-95 transition-all"
            title="Next Target in Timeline"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: AI Confidence Cutoff Slider */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 px-3 py-1 bg-white/[0.02] border border-white/[0.06] rounded-lg">
          <span className="text-[10px] text-slate-400 font-semibold">AI CONFIDENCE</span>
          <input
            type="range"
            min="20"
            max="95"
            value={confidenceCutoff}
            onChange={(e) => {
              setConfidenceCutoff(Number(e.target.value));
            }}
            className="w-24 h-1 bg-slate-800 accent-[#FFB703] cursor-pointer"
          />
          <span className="text-[10px] font-bold text-[#FFB703] w-7">{confidenceCutoff}%</span>
        </div>

        {/* Playback Speed Controls */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-[9.5px] text-slate-500 uppercase">PLAYBACK SPEED</span>
          <div className="flex items-center gap-1">
            {['0.5x', '1x', '2x', '4x'].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setPlaybackSpeed(spd);
                  triggerToast(`Playback Speed set to ${spd}`);
                }}
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-[#FFB703] text-[#05070B]'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              triggerToast(isPlaying ? 'Playback Paused' : 'Live Slideshow Tour Started');
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ml-1 ${
              isPlaying
                ? 'bg-[#FFB703] text-[#05070B]'
                : 'bg-white/[0.06] text-white hover:bg-white/[0.12]'
            }`}
            title={isPlaying ? 'Pause Slideshow' : 'Start Target Tour'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
        </div>

        {/* Right: Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportIncidentReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-[10.5px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => {
              exportGeoJsonDossier(MISSION_V3_TARGETS);
              triggerToast('Exported WGS84 GeoJSON Spatial Dossier');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-[10.5px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export GeoJSON</span>
          </button>
        </div>
      </div>

      {/* ── 5. TARGET INSPECTION MODAL (Triggered by "View Details") ── */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#080E18] border border-white/[0.15] rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-[#FFB703]" />
                <div>
                  <h3 className="text-sm font-black text-white">{selectedTarget.name}</h3>
                  <div className="text-[10px] text-slate-400">MoES Hydrographic Target Inspection Dossier</div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/[0.05] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 bg-[#040810] rounded-xl border border-white/[0.06] space-y-1.5">
                <div className="text-[9px] uppercase text-slate-500 font-bold">Acoustic Classification</div>
                <div className="text-sm font-bold text-white">{selectedTarget.categoryLabel}</div>
                <div className="text-[10px] text-[#FFB703]">AI Confidence: {selectedTarget.confidence}%</div>
                <div className="text-[9px] text-slate-400">Priority Rating: {selectedTarget.priority}</div>
              </div>

              <div className="p-3 bg-[#040810] rounded-xl border border-white/[0.06] space-y-1.5">
                <div className="text-[9px] uppercase text-slate-500 font-bold">Spatial & Bathymetric Fix</div>
                <div className="text-xs font-bold text-cyan-400">
                  {selectedTarget.lat.toFixed(5)}° N, {selectedTarget.lng.toFixed(5)}° E
                </div>
                <div className="text-[10px] text-slate-300">Seafloor Depth: -{selectedTarget.depthM} m</div>
                <div className="text-[9px] text-slate-400">Acoustic Void: {selectedTarget.shadowM} m relief</div>
              </div>
            </div>

            <div className="p-3 bg-[#040810] rounded-xl border border-white/[0.06] space-y-2">
              <div className="text-[9px] uppercase text-slate-500 font-bold">Acoustic Verification Summary</div>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                Target exhibits high backscatter contrast (+{selectedTarget.backscatterDb} dB) relative to surrounding
                soft sediment. Acoustic shadow geometry confirms proud relief of {selectedTarget.proudM} m above benthic
                plane, consistent with anthropogenic entanglement. Natural geological formation ruled out.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleCopyCoordinates();
                }}
                className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold cursor-pointer"
              >
                Copy Coordinates
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setActiveTab('mission');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-black cursor-pointer shadow-lg"
                >
                  Open in Mission Control
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
