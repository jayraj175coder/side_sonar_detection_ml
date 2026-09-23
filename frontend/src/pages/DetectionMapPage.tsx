import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGeospatialConfig } from '../context/GeospatialConfigContext';
import { exportGeoJsonDossier } from '../utils/gisExporter';
import { MISSION_V3_TARGETS } from '../data/missionV3Data';

// Map Scenarios
const SCENARIOS = [
  { id: 'mumbai-high', name: 'Mumbai High Offshore Corridor', center: [19.2, 72.0] as [number, number], zoom: 8 },
  { id: 'mannar-biosphere', name: 'Gulf of Mannar Coral Biosphere', center: [9.136, 79.212] as [number, number], zoom: 9 },
  { id: 'vizag-trench', name: 'Visakhapatnam Deep Trench', center: [17.686, 83.218] as [number, number], zoom: 9 },
  { id: 'goa-ridge', name: 'Goa Shelf Basalt Ridge', center: [15.409, 73.753] as [number, number], zoom: 9 },
];

// Target marker definitions for Mumbai High
interface MapTargetItem {
  id: string;
  name: string;
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
}

const MUMBAI_TARGETS: MapTargetItem[] = [
  {
    id: 'SX-009',
    name: 'SX-009 // PIPELINE HAZARD',
    category: 'PIPELINE',
    categoryLabel: 'Pipeline Hazard',
    color: '#06B6D4', // Cyan
    lat: 19.12,
    lng: 71.75,
    depthM: 43.1,
    confidence: 94.7,
    shadowM: 2.31,
    sizeM: 12.4,
    priority: 'HIGH',
  },
  {
    id: 'SX-012',
    name: 'SX-012 // GHOST NET (ALDFG)',
    category: 'GHOST_NET',
    categoryLabel: 'Ghost Net (ALDFG)',
    color: '#EF4444', // Red
    lat: 19.82,
    lng: 71.65,
    depthM: 38.2,
    confidence: 92.4,
    shadowM: 3.12,
    sizeM: 18.0,
    priority: 'HIGH',
  },
  {
    id: 'SX-007',
    name: 'SX-007 // ANTHROPOGENIC DEBRIS',
    category: 'DEBRIS',
    categoryLabel: 'Anthropogenic Debris',
    color: '#F59E0B', // Amber
    lat: 19.45,
    lng: 71.32,
    depthM: 52.0,
    confidence: 88.1,
    shadowM: 1.85,
    sizeM: 8.5,
    priority: 'MEDIUM',
  },
  {
    id: 'SX-014',
    name: 'SX-014 // SEAFLOOR ANOMALY',
    category: 'ANOMALY',
    categoryLabel: 'Seafloor Anomaly',
    color: '#A855F7', // Purple
    lat: 19.28,
    lng: 72.25,
    depthM: 31.4,
    confidence: 76.5,
    shadowM: 2.1,
    sizeM: 6.2,
    priority: 'LOW',
  },
  {
    id: 'SX-011',
    name: 'SX-011 // GHOST NET BUNDLE',
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
  },
  {
    id: 'SX-005',
    name: 'SX-005 // METALLIC DEBRIS CASK',
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

// Map Pan Controller
const MapFlyTo: React.FC<{ coords: [number, number]; zoom: number }> = ({ coords, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(coords, zoom, { duration: 1.2 });
  }, [coords, zoom, map]);
  return null;
};

export const DetectionMapPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const { openModal } = useGeospatialConfig();

  // State
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'bathymetry' | 'sonar'>('satellite');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('SX-009');
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'evidence' | 'specs' | 'timeline' | 'geotag'>('evidence');
  const [confidenceCutoff, setConfidenceCutoff] = useState<number>(48);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1x');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const selectedTarget = useMemo(() => {
    return MUMBAI_TARGETS.find((t) => t.id === selectedTargetId) || MUMBAI_TARGETS[0];
  }, [selectedTargetId]);

  // EEZ Polyline in Arabian Sea
  const eezLine: [number, number][] = [
    [20.5, 71.2],
    [19.6, 71.4],
    [18.9, 71.7],
    [18.0, 71.9],
  ];

  // Survey Trackline
  const surveyTrack: [number, number][] = [
    [19.9, 71.7],
    [19.45, 71.45],
    [19.12, 71.75],
    [18.5, 71.35],
    [18.2, 72.1],
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[720px] bg-[#05070B] text-slate-100 font-sans select-none overflow-hidden space-y-2 pb-1">
      {/* ── 1. TOP HEADER: MOES SUBSEA GIS INTELLIGENCE ── */}
      <div className="px-4 py-2 bg-[#070D18] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 shrink-0 shadow-lg">
        {/* Left: Survey Identification */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] font-bold text-xs font-mono">
            SX
          </div>
          <div>
            <div className="font-mono font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <span>MOES SUBSEA GIS INTELLIGENCE</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Survey: <strong className="text-slate-200">NIOT / INCOIS 48.2 NM — Mumbai High Offshore Corridor</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Classification Legend Pills */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <span className="text-slate-300 font-semibold">Ghost Net (ALDFG)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span className="text-slate-300 font-semibold">Pipeline</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-slate-300 font-semibold">Debris</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
            <span className="text-slate-300 font-semibold">Anomaly</span>
          </div>
        </div>

        {/* Right: Verified Badge & Settings */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>10 VERIFIED</span>
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703]/50 text-slate-300 hover:text-white font-mono font-bold text-[10.5px] rounded-lg cursor-pointer transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>MAP SETTINGS</span>
          </button>
        </div>
      </div>

      {/* ── 2. CONTROLS STRIP: SCENARIO SELECTOR, SEARCH, LAYERS ── */}
      <div className="px-4 py-1.5 bg-[#070D18] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 shrink-0 shadow-sm text-xs font-mono">
        <div className="flex items-center gap-3 flex-1">
          {/* Active Scenario Selector */}
          <div className="relative">
            <button
              onClick={() => setIsScenarioOpen(!isScenarioOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-[#FFB703]/50 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
            >
              <span className="text-slate-400 font-medium">ACTIVE SCENARIO:</span>
              <span className="text-[#FFB703]">{activeScenario.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isScenarioOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#090F1A] border border-white/[0.1] rounded-xl shadow-2xl z-50 p-1 space-y-1">
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScenario(sc);
                      setIsScenarioOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                      sc.id === activeScenario.id
                        ? 'bg-[#FFB703]/10 text-[#FFB703] font-bold'
                        : 'text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{sc.name}</span>
                    {sc.id === activeScenario.id && <Check className="w-3 h-3 text-[#FFB703]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vessel, target ID, coordinates (lat, lon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703] transition-all"
            />
          </div>
        </div>

        {/* Right: Layer Switches */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              mapLayer === 'satellite'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            SATELLITE
          </button>

          <button
            onClick={() => setMapLayer('bathymetry')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              mapLayer === 'bathymetry'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            BATHYMETRY
          </button>

          <button
            onClick={() => setMapLayer('sonar')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              mapLayer === 'sonar'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            SONAR OVERLAY
          </button>

          <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 text-[10px] font-mono flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#38BDF8]" />
            <span>LAYERS 7/7</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
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
            <MapFlyTo coords={activeScenario.center} zoom={activeScenario.zoom} />

            {/* Satellite Base Layer */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri World Imagery"
            />

            {/* EEZ Boundary Line */}
            <Polyline
              positions={eezLine}
              pathOptions={{ color: '#00F5D4', weight: 2, dashArray: '6, 6' }}
            >
              <Tooltip sticky>INDIAN EEZ BOUNDARY</Tooltip>
            </Polyline>

            {/* Survey Trackline */}
            <Polyline
              positions={surveyTrack}
              pathOptions={{ color: '#FFB703', weight: 1.5, dashArray: '4, 4' }}
            />

            {/* Interactive Target Pins */}
            {MUMBAI_TARGETS.map((target) => (
              <Marker
                key={target.id}
                position={[target.lat, target.lng]}
                icon={createTargetIcon(target, target.id === selectedTargetId)}
                eventHandlers={{
                  click: () => setSelectedTargetId(target.id),
                }}
              >
                {target.id === selectedTargetId && (
                  <Tooltip permanent direction="top" offset={[0, -18]}>
                    <div className="bg-[#050C16] border border-cyan-400 rounded-lg p-2 text-cyan-400 font-mono text-[9.5px] shadow-2xl space-y-0.5 leading-tight">
                      <div className="font-bold text-white">{target.categoryLabel}</div>
                      <div>Depth: -{target.depthM} m</div>
                      <div>Conf: {target.confidence}%</div>
                    </div>
                  </Tooltip>
                )}
              </Marker>
            ))}
          </MapContainer>

          {/* Left Vertical Map Toolbar (+, -, Crosshair, Layers, Ruler, Path) */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-1.5 bg-[#070D18]/90 backdrop-blur-md p-1 rounded-xl border border-white/[0.1] shadow-xl text-slate-300">
            <button className="p-2 hover:bg-white/[0.08] hover:text-white rounded-lg transition-colors cursor-pointer" title="Zoom In">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 hover:bg-white/[0.08] hover:text-white rounded-lg transition-colors cursor-pointer" title="Zoom Out">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="h-px bg-white/[0.08] my-0.5" />
            <button className="p-2 hover:bg-white/[0.08] hover:text-[#FFB703] rounded-lg transition-colors cursor-pointer" title="Re-center on Active Survey">
              <Target className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 hover:bg-white/[0.08] hover:text-[#00F5D4] rounded-lg transition-colors cursor-pointer" title="Layer Stack">
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 hover:bg-white/[0.08] hover:text-[#38BDF8] rounded-lg transition-colors cursor-pointer" title="Measure Distance">
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top-Right Inset Mini Map of India */}
          <div className="absolute top-4 right-4 z-[400] w-28 h-28 rounded-xl bg-[#070D18]/90 backdrop-blur-md border border-white/[0.15] p-1.5 shadow-2xl overflow-hidden flex flex-col justify-between">
            <div className="text-[8px] font-mono font-bold text-slate-400">INDIA EEZ OVERVIEW</div>
            <div className="relative flex-1 flex items-center justify-center">
              {/* Silhouette outline of India */}
              <svg viewBox="0 0 100 120" className="w-full h-full opacity-60">
                <path
                  d="M 50,10 L 65,30 L 70,50 L 55,80 L 50,110 L 45,80 L 30,50 L 35,30 Z"
                  fill="#0E2238"
                  stroke="#38BDF8"
                  strokeWidth="1"
                />
                {/* Yellow Target Box over Mumbai sector */}
                <rect x="34" y="44" width="14" height="12" fill="none" stroke="#FFB703" strokeWidth="1.5" />
                <circle cx="41" cy="50" r="2" fill="#FFB703" />
              </svg>
            </div>
            <div className="text-[7.5px] font-mono text-center text-[#FFB703]">WESTERN SECTOR</div>
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
              <div>-- Mumbai High Corridor</div>
            </div>
          </div>

          {/* Scale Bar on Bottom-Left */}
          <div className="absolute bottom-4 left-4 z-[400] text-[9px] font-mono text-slate-300 bg-[#070D18]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/[0.08] flex items-center gap-2">
            <span>20 km</span>
            <div className="w-12 h-1 bg-white/[0.4] border-x border-white" />
          </div>

          {/* Live Coordinates HUD on Bottom-Right */}
          <div className="absolute bottom-4 left-24 z-[400] text-[9.5px] font-mono text-slate-400 bg-[#070D18]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.08] flex items-center gap-2">
            <span>18.9217° N, 72.8214° E</span>
            <Maximize2 className="w-3 h-3 text-slate-500" />
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

            {/* Target Header & Crop */}
            <div className="flex gap-3">
              <div className="w-24 h-24 rounded-lg bg-[#040810] border border-white/[0.1] overflow-hidden relative shrink-0 flex items-center justify-center">
                {/* Simulated Acoustic Sonar Patch */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:4px_4px] opacity-60" />
                <div className="w-14 h-14 border border-dashed border-[#06B6D4] bg-[#06B6D4]/10 rounded flex items-center justify-center text-[10px] font-mono text-[#06B6D4] font-bold">
                  SONAR
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-white leading-tight truncate">
                  {selectedTarget.name}
                </h4>
                <div className="inline-block text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                  HIGH PRIORITY
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono pt-1 text-slate-400">
                  <div>Conf: <strong className="text-white">{selectedTarget.confidence}%</strong></div>
                  <div>Depth: <strong className="text-white">-{selectedTarget.depthM} m</strong></div>
                  <div>Shadow: <strong className="text-white">{selectedTarget.shadowM} m</strong></div>
                  <div>Size: <strong className="text-white">~{selectedTarget.sizeM} m</strong></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setActiveTab('mission')}
                className="py-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono text-slate-200 hover:text-white transition-all cursor-pointer text-center"
              >
                View Details
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className="py-1.5 px-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-xs font-mono font-bold text-white transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1"
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

              {/* Evidence 3-Image Strip */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-1 rounded-lg bg-[#040810] border border-white/[0.08] text-center space-y-1">
                  <div className="h-10 rounded bg-slate-900 border border-white/[0.06] flex items-center justify-center text-[8px] font-mono text-slate-400">
                    2D SWATH
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-400 truncate">Side-Scan Sonar</div>
                </div>

                <div className="p-1 rounded-lg bg-[#040810] border border-white/[0.08] text-center space-y-1">
                  <div className="h-10 rounded bg-slate-900 border border-white/[0.06] flex items-center justify-center text-[8px] font-mono text-purple-400">
                    3D MESH
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-400 truncate">3D Reconstruction</div>
                </div>

                <div className="p-1 rounded-lg bg-[#040810] border border-white/[0.08] text-center space-y-1">
                  <div className="h-10 rounded bg-slate-900 border border-white/[0.06] flex items-center justify-center text-[8px] font-mono text-emerald-400">
                    DEPTH
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-400 truncate">Bathymetry Profile</div>
                </div>
              </div>
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
                High-density subsea survey for pipelines, debris and ghost nets in Mumbai High sector.
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
                <div className="font-bold text-white">17</div>
              </div>
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <div className="text-slate-500 text-[7px] uppercase">HIGH THREAT</div>
                <div className="font-bold text-red-400">4</div>
              </div>
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                <div className="text-slate-500 text-[7px] uppercase">VERIFIED</div>
                <div className="font-bold text-emerald-400">10</div>
              </div>
            </div>

            {/* Big Action Button: Open Mission Control */}
            <button
              onClick={() => setActiveTab('mission')}
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
        {/* Left: Filmstrip Swath Preview */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span className="text-[#38BDF8]">&lt;</span>
            <span>DETECTION TIMELINE (SWATH PREVIEW)</span>
          </div>

          <button className="p-1 rounded bg-white/[0.04] text-slate-400 hover:text-white shrink-0 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* 5 Swath Preview Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {[
              { id: '1', border: 'border-red-500', target: 'Ghost Net' },
              { id: '2', border: 'border-amber-400', target: 'Debris' },
              { id: '3', border: 'border-cyan-400 ring-2 ring-cyan-400/40', target: 'SX-009 Pipeline' },
              { id: '4', border: 'border-purple-400', target: 'Anomaly' },
              { id: '5', border: 'border-red-500', target: 'Ghost Net' },
            ].map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  if (f.id === '3') setSelectedTargetId('SX-009');
                }}
                className={`w-14 h-9 rounded-lg bg-[#040810] border ${f.border} shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
              >
                <div className="w-4 h-4 border border-dashed border-white/60 rounded" />
              </div>
            ))}
          </div>

          <button className="p-1 rounded bg-white/[0.04] text-slate-400 hover:text-white shrink-0 cursor-pointer">
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
            onChange={(e) => setConfidenceCutoff(Number(e.target.value))}
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
                onClick={() => setPlaybackSpeed(spd)}
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
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-white/[0.06] text-white hover:bg-white/[0.12] transition-colors cursor-pointer ml-1"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>

        {/* Right: Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-[10.5px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => exportGeoJsonDossier(MISSION_V3_TARGETS)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-[10.5px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export GeoJSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
