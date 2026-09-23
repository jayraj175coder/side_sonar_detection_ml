import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Anchor,
  Ship,
  RotateCcw,
  Download,
  Check,
  MapPin,
  Play,
  Sliders,
  TrendingDown,
  Clock,
  Compass,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wind,
  Waves,
  Eye,
  ChevronDown,
  Target,
  Pause,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sonarAudio } from '../utils/sonarAudio';
import {
  BASE_PORTS,
  CLEANUP_FLEET,
  NavPoint,
  VesselProfile,
  solveTspRoute,
  downloadGpxFile,
} from '../utils/tspSolver';

/* ─── Sector Targets Database ────────────────────────────────────────────── */
const SECTOR_TARGETS: Record<string, NavPoint[]> = {
  'base-chennai': [
    {
      id: 'CHN-01',
      name: '#01 Ennore Shoal Abandoned Gillnet',
      lat: 13.214,
      lon: 80.342,
      type: 'ghost_net',
      depthM: 18.5,
      estimatedMassKg: 420,
      notes: 'Submerged monofilament gillnet cluster draped across shoal ridge',
    },
    {
      id: 'CHN-02',
      name: '#02 Marina Pipeline Derelict Trawl Webbing',
      lat: 13.102,
      lon: 80.298,
      type: 'ghost_net',
      depthM: 24.3,
      estimatedMassKg: 310,
      notes: 'High acoustic shadow void opposite pipeline crossing fairway',
    },
    {
      id: 'CHN-03',
      name: '#03 Pulicat Lagoon Debris Field',
      lat: 13.432,
      lon: 80.32,
      type: 'debris',
      depthM: 12.1,
      estimatedMassKg: 180,
      notes: 'Metal cargo fragments and polymer aggregate container spill',
    },
    {
      id: 'CHN-04',
      name: '#04 Kattupalli Rope & Net Cluster',
      lat: 13.26,
      lon: 80.41,
      type: 'debris',
      depthM: 28.4,
      estimatedMassKg: 265,
      notes: 'Entangled hawser rope and submerged synthetic packing crates',
    },
    {
      id: 'CHN-05',
      name: '#05 Coromandel Lost Fishing Gear',
      lat: 13.34,
      lon: 80.52,
      type: 'debris',
      depthM: 34.2,
      estimatedMassKg: 510,
      notes: 'Submerged commercial longline gear anchor and steel floats',
    },
  ],
  'base-vizag': [
    {
      id: 'VZG-01',
      name: '#01 Dolphin Nose Wreck Cluster',
      lat: 17.672,
      lon: 83.335,
      type: 'debris',
      depthM: 31.0,
      estimatedMassKg: 620,
      notes: 'Colossal iron plating and structural hull scrap',
    },
    {
      id: 'VZG-02',
      name: '#02 Gangavaram Scour Hazard',
      lat: 17.625,
      lon: 83.255,
      type: 'pipeline',
      depthM: 19.5,
      estimatedMassKg: 150,
      notes: 'Unburied crude fuel conduit section',
    },
    {
      id: 'VZG-03',
      name: '#03 Rushikonda Drifting Net',
      lat: 17.785,
      lon: 83.41,
      type: 'ghost_net',
      depthM: 22.0,
      estimatedMassKg: 380,
      notes: 'Buoyant nylon mesh entangled with reef heads',
    },
    {
      id: 'VZG-04',
      name: '#04 Bheemunipatnam Sediment Anomaly',
      lat: 17.892,
      lon: 83.48,
      type: 'debris',
      depthM: 42.0,
      estimatedMassKg: 290,
      notes: 'Dense acoustic reflector on continental slope',
    },
  ],
  'base-kochi': [
    {
      id: 'KCH-01',
      name: '#01 Vypin Deep Drift Net (Hero ALDFG)',
      lat: 9.992,
      lon: 76.195,
      type: 'ghost_net',
      depthM: 38.5,
      estimatedMassKg: 490,
      notes: 'Major benthic drift net tracking across Southwest current',
    },
    {
      id: 'KCH-02',
      name: '#02 Fort Kochi Ballast Container',
      lat: 9.955,
      lon: 76.22,
      type: 'debris',
      depthM: 15.2,
      estimatedMassKg: 850,
      notes: 'Submerged steel ISO container shell',
    },
    {
      id: 'KCH-03',
      name: '#03 Chellanam Reef Entanglement',
      lat: 9.812,
      lon: 76.245,
      type: 'ghost_net',
      depthM: 26.8,
      estimatedMassKg: 340,
      notes: 'Monofilament gillnet smothering biogenic reef',
    },
    {
      id: 'KCH-04',
      name: '#04 Alappuzha Offshore Conduit Span',
      lat: 9.51,
      lon: 76.28,
      type: 'pipeline',
      depthM: 21.0,
      estimatedMassKg: 200,
      notes: 'Exposed subsea pipeline spanning acoustic scour trench',
    },
  ],
  'base-mumbai': [
    {
      id: 'MUM-01',
      name: '#01 ONGC Fairway Drill Scrap',
      lat: 19.385,
      lon: 71.355,
      type: 'debris',
      depthM: 65.0,
      estimatedMassKg: 1400,
      notes: 'Discarded drill casing section near offshore platform',
    },
    {
      id: 'MUM-02',
      name: '#02 Bandra Shoal Trawl Webbing',
      lat: 19.045,
      lon: 72.78,
      type: 'ghost_net',
      depthM: 18.0,
      estimatedMassKg: 310,
      notes: 'Derelict bottom trawl netting snagged on rock pinnacle',
    },
    {
      id: 'MUM-03',
      name: '#03 Uran Gas Pipeline Scour Hazard',
      lat: 18.88,
      lon: 72.88,
      type: 'pipeline',
      depthM: 14.5,
      estimatedMassKg: 180,
      notes: 'Unanchored conduit free-spanning over 12m',
    },
  ],
  'base-portblair': [
    {
      id: 'PBL-01',
      name: '#01 Ross Island Structural Hull Fragment',
      lat: 11.675,
      lon: 92.775,
      type: 'debris',
      depthM: 25.0,
      estimatedMassKg: 780,
      notes: 'Historical wreck fragment shedding acoustic shadow',
    },
    {
      id: 'PBL-02',
      name: '#02 Havelock Coral Reef Ghost Net',
      lat: 11.98,
      lon: 93.01,
      type: 'ghost_net',
      depthM: 19.2,
      estimatedMassKg: 420,
      notes: 'Coral sanctuary protective clearance target',
    },
  ],
};

/* ─── Custom Numbered Tactical Pins ─────────────────────────────────────── */
const createNumberedPin = (num: number | string, isBase = false, isSelected = false) => {
  const bg = isBase ? '#00F5D4' : isSelected ? '#ffffff' : '#FFB703';
  const textColor = isBase ? '#05070B' : '#05070B';
  const borderColor = isSelected ? '#FFB703' : '#ffffff';
  const shadowGlow = isBase ? '#00F5D4' : isSelected ? '#ffffff' : '#FFB703';

  const html = `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${bg};
      color: ${textColor};
      font-family: monospace;
      font-weight: 900;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid ${borderColor};
      box-shadow: 0 0 12px ${shadowGlow}cc;
      cursor: pointer;
      transition: transform 0.2s ease;
      ${isSelected ? 'transform: scale(1.2);' : ''}
    ">
      ${num}
    </div>
  `;
  return L.divIcon({
    className: 'custom-route-pin',
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

/* ─── Map Controller for Programmatic Pan/Zoom ──────────────────────────── */
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  onMapReady: (map: L.Map) => void;
}> = ({ center, zoom, onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export const RoutePlannerPage: React.FC = () => {
  const { setActiveTab } = useApp();

  // State: Base Port & Cleanup Fleet
  const [selectedBasePortId, setSelectedBasePortId] = useState<string>('base-chennai');
  const [isBaseDropdownOpen, setIsBaseDropdownOpen] = useState<boolean>(false);
  const [selectedVesselId, setSelectedVesselId] = useState<string>('eco-rov-skimmer');
  const [isVesselDropdownOpen, setIsVesselDropdownOpen] = useState<boolean>(false);

  // State: Target Selections & Map
  const basePort = useMemo(
    () => BASE_PORTS.find((b) => b.id === selectedBasePortId) || BASE_PORTS[0],
    [selectedBasePortId]
  );
  const vessel = useMemo(
    () => CLEANUP_FLEET.find((v) => v.id === selectedVesselId) || CLEANUP_FLEET[0],
    [selectedVesselId]
  );

  const sectorTargets = useMemo(
    () => SECTOR_TARGETS[selectedBasePortId] || SECTOR_TARGETS['base-chennai'],
    [selectedBasePortId]
  );

  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(
    sectorTargets.map((t) => t.id)
  );

  // Update selected targets when base port switches
  useEffect(() => {
    setSelectedTargetIds(sectorTargets.map((t) => t.id));
  }, [sectorTargets]);

  const [mapMode, setMapMode] = useState<'dark_marine' | 'satellite'>('dark_marine');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Layer Visibility
  const [layerSettings, setLayerSettings] = useState({
    restrictedArea: true,
    offshorePlatform: true,
    territorialLine: true,
  });
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState<boolean>(false);

  const mapRef = useRef<L.Map | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active targets array
  const activeTargets = useMemo(
    () => sectorTargets.filter((t) => selectedTargetIds.includes(t.id)),
    [sectorTargets, selectedTargetIds]
  );

  // Dynamic TSP Solver Execution
  const tspSolution = useMemo(() => {
    return solveTspRoute(basePort, activeTargets, vessel);
  }, [basePort, activeTargets, vessel]);

  // Route Polyline Coordinates
  const routePolyline: [number, number][] = useMemo(() => {
    return tspSolution.orderedPoints.map((p) => [p.lat, p.lon]);
  }, [tspSolution]);

  // Restricted Areas (Chennai Sector)
  const restrictedAreaPolygon: [number, number][] = [
    [13.44, 80.62],
    [13.48, 80.78],
    [13.38, 80.82],
    [13.34, 80.66],
  ];

  const offshorePlatformPolygon: [number, number][] = [
    [13.14, 80.62],
    [13.24, 80.62],
    [13.24, 80.78],
    [13.14, 80.78],
  ];

  const territorialWatersLine: [number, number][] = [
    [13.6, 80.44],
    [13.3, 80.46],
    [13.0, 80.42],
    [12.8, 80.38],
  ];

  // Target toggle handler
  const toggleTarget = (id: string) => {
    sonarAudio.playTargetBeep?.();
    setSelectedTargetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    sonarAudio.playTargetBeep?.();
    setSelectedTargetIds(sectorTargets.map((t) => t.id));
    showToast(`Selected all ${sectorTargets.length} sector targets`);
  };

  const handleClearAll = () => {
    sonarAudio.playTargetBeep?.();
    setSelectedTargetIds([]);
    showToast('Cleared all retrieval targets');
  };

  // Re-optimize handler with dynamic TSP
  const handleReoptimize = () => {
    setIsOptimizing(true);
    sonarAudio.playSonarPing?.();
    setTimeout(() => {
      setIsOptimizing(false);
      sonarAudio.playLockBeep?.();
      showToast(
        `Route re-optimized: 2-Opt found ${tspSolution.totalDistanceNM} NM global minimum (${tspSolution.totalMissionHours} hrs)`
      );
    }, 450);
  };

  // Export GPX handler
  const handleExportGpxKml = () => {
    sonarAudio.playLockBeep?.();
    downloadGpxFile(tspSolution, vessel.name, `SONARX-${basePort.id.toUpperCase()}`);
    showToast(`Exported navigation GPX package for ${vessel.name}`);
  };

  // Map Controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      sonarAudio.playTargetBeep?.();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      sonarAudio.playTargetBeep?.();
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      if (routePolyline.length > 1) {
        const bounds = L.latLngBounds(routePolyline);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      } else {
        mapRef.current.setView([basePort.lat, basePort.lon], 9);
      }
      sonarAudio.playLockBeep?.();
      showToast(`Re-centered on ${basePort.name}`);
    }
  };

  // Waypoint Focus from Table or Map
  const handleFocusWaypoint = (pointId: string, lat: number, lon: number) => {
    setSelectedPointId(pointId);
    sonarAudio.playTargetBeep?.();
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 11, { duration: 1.2 });
    }
  };

  // Route Simulation Playback
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= routePolyline.length - 1) {
          setIsSimulating(false);
          sonarAudio.playLockBeep?.();
          showToast('Route simulation playback completed');
          return 0;
        }
        sonarAudio.playTargetBeep?.();
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isSimulating, routePolyline.length]);

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 pb-16 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600] px-4 py-2 bg-[#091524]/95 border border-[#FFB703] rounded-xl text-xs font-mono font-bold text-[#FFB703] shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <Activity className="w-4 h-4 text-[#FFB703]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER: SMART MULTI-VESSEL TSP ROUTE OPTIMIZER ── */}
      <div className="p-4 sm:p-5 bg-[#070D18] rounded-xl border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#FFB703]/15 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703]">
              <Navigation className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Smart Multi-Vessel TSP Route Optimizer
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30">
              ALGORITHM: 2-OPT TSP SOLVER
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Optimize survey and cleanup routes for marine debris retrieval using AI-detected targets, vessel constraints, and bathymetric safety.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Active Sector: <span className="text-white font-bold">{basePort.name.split(' ')[0]}</span>
          </span>
          <button
            onClick={handleReoptimize}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-[#FFB703]/10 border border-white/[0.12] hover:border-[#FFB703]/50 text-slate-200 hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#FFB703] ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>Re-optimize</span>
          </button>

          <button
            onClick={handleExportGpxKml}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-[#FFB703]/20 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GPX / KML</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRICS STRIP: 5 SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Card 1: Total Distance */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            TOTAL DISTANCE (NM)
          </span>
          <div className="text-2xl font-mono font-black text-[#00F5D4]">
            {tspSolution.totalDistanceNM}{' '}
            <span className="text-xs font-normal text-slate-400">NM</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {tspSolution.percentSaved > 0 ? (
              <span className="text-emerald-400 font-semibold">
                -{tspSolution.percentSaved}% vs unoptimized
              </span>
            ) : (
              'Optimal multi-leg route'
            )}
          </span>
        </div>

        {/* Card 2: Est. Mission Hours */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            EST. MISSION HOURS
          </span>
          <div className="text-2xl font-mono font-black text-white">
            {tspSolution.totalMissionHours}{' '}
            <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {tspSolution.estTransitHours}h transit + {tspSolution.estOpsHours}h ops
          </span>
        </div>

        {/* Card 3: Energy Consumed */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            ENERGY CONSUMED
          </span>
          <div className="text-2xl font-mono font-black text-emerald-400">
            {tspSolution.energyConsumedKWh}{' '}
            <span className="text-xs font-normal text-slate-400">
              {vessel.consumptionUnit === 'kWh' ? 'kWh' : 'L equiv'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {vessel.consumptionPerNM} {vessel.consumptionUnit}/NM (fleet rate)
          </span>
        </div>

        {/* Card 4: CO2 Emissions Saved */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            CO₂ EMISSIONS SAVED
          </span>
          <div className="text-2xl font-mono font-black text-[#FFB703]">
            {tspSolution.co2SavedKg}{' '}
            <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 block">vs. conventional diesel tender</span>
        </div>

        {/* Card 5: Targets Scheduled */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5 col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            TARGETS SCHEDULED
          </span>
          <div className="text-2xl font-mono font-black text-white">
            {activeTargets.length} / {sectorTargets.length}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {tspSolution.totalMassRecoveredKg} kg estimated mass
          </span>
        </div>
      </div>

      {/* ── 3. MAIN 3-COLUMN WORKSTATION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ── COLUMN 1: LEFT CONTROL COLUMN ── */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Panel 1: Departure Base Port (Interactive Dropdown) */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5 relative">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] uppercase">
              <Anchor className="w-3.5 h-3.5" />
              <span>DEPARTURE BASE PORT</span>
            </div>

            <button
              onClick={() => setIsBaseDropdownOpen(!isBaseDropdownOpen)}
              className="w-full bg-[#050B14] hover:bg-[#081220] border border-white/[0.12] hover:border-[#FFB703]/50 rounded-lg px-3 py-2 text-xs font-mono text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="truncate pr-2">{basePort.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isBaseDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isBaseDropdownOpen && (
              <div className="absolute top-[82px] left-3.5 right-3.5 bg-[#050B14] border border-white/[0.15] rounded-xl shadow-2xl z-[500] py-1 max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                {BASE_PORTS.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBasePortId(b.id);
                      setIsBaseDropdownOpen(false);
                      sonarAudio.playTargetBeep?.();
                      showToast(`Switched Base Port to ${b.name}`);
                    }}
                    className={`px-3 py-2.5 text-xs font-mono hover:bg-[#FFB703]/10 cursor-pointer transition-colors ${
                      b.id === selectedBasePortId
                        ? 'bg-[#FFB703]/15 text-[#FFB703] font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate">{b.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {b.lat.toFixed(4)}° N, {b.lon.toFixed(4)}° E
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[10px] font-mono text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06] space-y-0.5">
              <span className="text-white font-bold block">{basePort.name}</span>
              <div className="text-[#00F5D4]">
                {basePort.lat.toFixed(4)}° N, {basePort.lon.toFixed(4)}° E
              </div>
              <div className="text-slate-500">{basePort.notes}</div>
            </div>
          </div>

          {/* Panel 2: Assigned Cleanup Fleet (Interactive Dropdown) */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5 relative">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFB703] uppercase">
              <Ship className="w-3.5 h-3.5" />
              <span>ASSIGNED CLEANUP FLEET</span>
            </div>

            <button
              onClick={() => setIsVesselDropdownOpen(!isVesselDropdownOpen)}
              className="w-full bg-[#050B14] hover:bg-[#081220] border border-white/[0.12] hover:border-[#FFB703]/50 rounded-lg px-3 py-2 text-xs font-mono text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="truncate pr-2">{vessel.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isVesselDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Vessel Dropdown Menu */}
            {isVesselDropdownOpen && (
              <div className="absolute top-[82px] left-3.5 right-3.5 bg-[#050B14] border border-white/[0.15] rounded-xl shadow-2xl z-[500] py-1 max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                {CLEANUP_FLEET.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVesselId(v.id);
                      setIsVesselDropdownOpen(false);
                      sonarAudio.playTargetBeep?.();
                      showToast(`Assigned Fleet Vessel: ${v.name}`);
                    }}
                    className={`px-3 py-2.5 text-xs font-mono hover:bg-[#FFB703]/10 cursor-pointer transition-colors ${
                      v.id === selectedVesselId
                        ? 'bg-[#FFB703]/15 text-[#FFB703] font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate">{v.name}</div>
                    <div className="text-[10px] text-slate-500">
                      Cruise: {v.speedKnots} kts · {v.consumptionPerNM} {v.consumptionUnit}/NM · Max {v.maxPayloadKg} kg
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Cruising Speed</span>
                <strong className="text-white text-xs">{vessel.speedKnots} knots</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Consumption</span>
                <strong className="text-emerald-400 text-xs">
                  {vessel.consumptionPerNM} {vessel.consumptionUnit}/NM
                </strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Max Payload</span>
                <strong className="text-white text-xs">{vessel.maxPayloadKg} kg</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Salvage Rate</span>
                <strong className="text-white text-xs">{vessel.salvageTimePerTargetMin} m / target</strong>
              </div>
            </div>
          </div>

          {/* Panel 3: Retrieval Targets (Dynamic Selection) */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFB703] uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  RETRIEVAL TARGETS ({activeTargets.length}/{sectorTargets.length})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono">
                <button
                  onClick={handleSelectAll}
                  className="text-[#00F5D4] hover:underline cursor-pointer font-bold"
                >
                  Select All
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {sectorTargets.map((t) => {
                const isChecked = selectedTargetIds.includes(t.id);
                const isSelectedOnMap = selectedPointId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTarget(t.id)}
                    className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelectedOnMap
                        ? 'bg-[#FFB703]/15 border-[#FFB703] text-white shadow-md'
                        : isChecked
                        ? 'bg-[#0D1524] border-white/[0.12] text-white hover:border-[#FFB703]/40'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-500 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTarget(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 accent-[#FFB703] cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-[11px] truncate">{t.name}</span>
                        <span
                          className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                            t.type === 'ghost_net'
                              ? 'bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/40'
                              : t.type === 'pipeline'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {t.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Depth: -{t.depthM || 20}m | Est. Mass: {t.estimatedMassKg || 250} kg
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {t.lat.toFixed(4)}° N, {t.lon.toFixed(4)}° E
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: CENTER MARITIME MAP & WAYPOINT SEQUENCE ── */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Tactical Maritime Navigation Map */}
          <div className="bg-[#070D18] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden relative">
            {/* Map Top Bar */}
            <div className="px-4 py-2 bg-[#050A12] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="font-bold text-white uppercase">
                  TACTICAL MARITIME NAVIGATION MAP
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 text-[11px]">{basePort.name.split(' ')[0]} Sector</span>
              </div>

              {/* Map View Mode Switcher */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                <button
                  onClick={() => {
                    setMapMode('dark_marine');
                    sonarAudio.playTargetBeep?.();
                  }}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === 'dark_marine'
                      ? 'bg-[#FFB703] text-[#05070B] shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark Marine
                </button>
                <button
                  onClick={() => {
                    setMapMode('satellite');
                    sonarAudio.playTargetBeep?.();
                  }}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === 'satellite'
                      ? 'bg-[#FFB703] text-[#05070B] shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Map Viewport */}
            <div className="h-[360px] w-full relative bg-[#040810]">
              <MapContainer
                center={[basePort.lat + 0.15, basePort.lon + 0.1]}
                zoom={9}
                style={{ height: '100%', width: '100%', background: '#040810' }}
                zoomControl={false}
              >
                <MapController
                  center={[basePort.lat + 0.15, basePort.lon + 0.1]}
                  zoom={9}
                  onMapReady={(m) => {
                    mapRef.current = m;
                  }}
                />

                {mapMode === 'dark_marine' ? (
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri GEBCO"
                    maxZoom={16}
                  />
                ) : (
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri World Imagery"
                    maxZoom={18}
                  />
                )}

                {/* Indian Territorial Waters Line (12 NM) */}
                {layerSettings.territorialLine && (
                  <Polyline
                    positions={territorialWatersLine}
                    pathOptions={{ color: '#00F5D4', weight: 1.5, dashArray: '6, 6' }}
                  >
                    <Tooltip direction="top">
                      <span className="font-mono text-[10px] text-cyan-300">
                        Indian Territorial Waters (12 NM)
                      </span>
                    </Tooltip>
                  </Polyline>
                )}

                {/* Restricted Area (No Entry) */}
                {layerSettings.restrictedArea && (
                  <Polygon
                    positions={restrictedAreaPolygon}
                    pathOptions={{
                      color: '#EF4444',
                      fillColor: '#EF4444',
                      fillOpacity: 0.15,
                      weight: 1.5,
                      dashArray: '4, 4',
                    }}
                  >
                    <Tooltip direction="top">
                      <span className="font-mono text-[10px] text-red-400 font-bold">
                        Restricted Area (Naval Proving Zone)
                      </span>
                    </Tooltip>
                  </Polygon>
                )}

                {/* Offshore Platform (No Entry) */}
                {layerSettings.offshorePlatform && (
                  <Polygon
                    positions={offshorePlatformPolygon}
                    pathOptions={{
                      color: '#F59E0B',
                      fillColor: '#F59E0B',
                      fillOpacity: 0.12,
                      weight: 1.5,
                      dashArray: '3, 3',
                    }}
                  >
                    <Tooltip direction="top">
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        Offshore Gas Extraction Fairway (Safety Zone)
                      </span>
                    </Tooltip>
                  </Polygon>
                )}

                {/* Planned Route Polyline (Full Round Trip) */}
                {routePolyline.length > 1 && (
                  <Polyline
                    positions={routePolyline}
                    pathOptions={{ color: '#FFB703', weight: 2.5, opacity: 0.85 }}
                  />
                )}

                {/* Transit First Leg Highlight (Glowing Cyan) */}
                {routePolyline.length > 1 && (
                  <Polyline
                    positions={[routePolyline[0], routePolyline[1]]}
                    pathOptions={{ color: '#00F5D4', weight: 3, dashArray: '4, 4' }}
                  />
                )}

                {/* Base Port Marker 0 (Clean Dark Tooltip, NOT permanent white box) */}
                <Marker
                  position={[basePort.lat, basePort.lon]}
                  icon={createNumberedPin(0, true, selectedPointId === basePort.id)}
                  eventHandlers={{
                    click: () => handleFocusWaypoint(basePort.id, basePort.lat, basePort.lon),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -12]}>
                    <div className="font-mono text-[10px] text-slate-100 p-1">
                      <strong className="text-[#00F5D4] block">WP 0: {basePort.name}</strong>
                      <div className="text-slate-400">Home Berth & ROV Tender Slipway</div>
                    </div>
                  </Tooltip>
                </Marker>

                {/* Target Waypoint Markers */}
                {activeTargets.map((t, idx) => {
                  const isSelected = selectedPointId === t.id;
                  return (
                    <Marker
                      key={t.id}
                      position={[t.lat, t.lon]}
                      icon={createNumberedPin(idx + 1, false, isSelected)}
                      eventHandlers={{
                        click: () => handleFocusWaypoint(t.id, t.lat, t.lon),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -12]}>
                        <div className="font-mono text-[10px] p-1 space-y-0.5">
                          <strong className="text-white block">
                            WP {idx + 1}: {t.name}
                          </strong>
                          <div className="text-[#FFB703]">
                            Depth: -{t.depthM || 20}m | Mass: {t.estimatedMassKg || 250}kg
                          </div>
                          <div className="text-slate-400 text-[9px]">{t.notes}</div>
                        </div>
                      </Tooltip>
                    </Marker>
                  );
                })}

                {/* Simulated Moving Vessel Icon during Playback */}
                {isSimulating && routePolyline[simStep] && (
                  <Marker
                    position={routePolyline[simStep]}
                    icon={L.divIcon({
                      html: `
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #00F5D4; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #00F5D4; border: 2px solid #ffffff;">
                          <span style="font-size: 13px;">🚢</span>
                        </div>
                      `,
                      iconSize: [28, 28],
                      iconAnchor: [14, 14],
                    })}
                  />
                )}
              </MapContainer>

              {/* Map Left Functional Toolbar */}
              <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1 bg-[#050A12]/90 border border-white/[0.1] rounded-lg p-1 text-slate-300 backdrop-blur-md">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  -
                </button>
                <div className="h-px bg-white/[0.08] my-0.5" />
                <button
                  onClick={handleRecenter}
                  className="p-1.5 hover:text-[#FFB703] hover:bg-white/[0.08] rounded cursor-pointer transition-colors"
                  title="Re-center on Route"
                >
                  <Target className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
                  className={`p-1.5 rounded cursor-pointer transition-colors ${
                    isLayersMenuOpen
                      ? 'text-[#FFB703] bg-[#FFB703]/10'
                      : 'hover:text-cyan-400 hover:bg-white/[0.08]'
                  }`}
                  title="Toggle Layers"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Layers Toggle Popover */}
              {isLayersMenuOpen && (
                <div className="absolute top-24 left-3 z-[450] bg-[#050A12]/95 border border-white/[0.15] rounded-xl p-3 shadow-2xl text-[10px] font-mono space-y-2 backdrop-blur-md w-48">
                  <div className="font-bold text-white uppercase text-[9.5px] border-b border-white/[0.08] pb-1">
                    Map Layers
                  </div>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerSettings.restrictedArea}
                      onChange={(e) =>
                        setLayerSettings({ ...layerSettings, restrictedArea: e.target.checked })
                      }
                      className="accent-[#FFB703]"
                    />
                    <span>Restricted Proving Area</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerSettings.offshorePlatform}
                      onChange={(e) =>
                        setLayerSettings({ ...layerSettings, offshorePlatform: e.target.checked })
                      }
                      className="accent-[#FFB703]"
                    />
                    <span>Offshore Safety Fairway</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerSettings.territorialLine}
                      onChange={(e) =>
                        setLayerSettings({ ...layerSettings, territorialLine: e.target.checked })
                      }
                      className="accent-[#FFB703]"
                    />
                    <span>12 NM Territorial Line</span>
                  </label>
                </div>
              )}

              {/* Map Right Legend Box */}
              <div className="absolute top-3 right-3 z-[400] bg-[#050A12]/95 border border-white/[0.1] rounded-lg p-2.5 text-[8.5px] font-mono space-y-1 max-w-[130px] backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span className="w-3.5 h-0.5 bg-[#FFB703]" />
                  <span>Planned Route</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3.5 h-0.5 bg-[#00F5D4] border-b border-dashed border-[#00F5D4]" />
                  <span>Transit Leg</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#FFB703]" />
                  <span>Target Waypoint</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#00F5D4]" />
                  <span>Base Port</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2 bg-red-500/20 border border-red-500" />
                  <span>Restricted Area</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-px bg-cyan-400/50" />
                  <span>12 NM Boundary</span>
                </div>
              </div>

              {/* Bottom HUD: Coordinates & Depth */}
              <div className="absolute bottom-2 right-2 z-[400] px-2 py-0.5 bg-[#050A12]/90 rounded border border-white/[0.08] text-[8.5px] font-mono text-slate-400 backdrop-blur-md">
                Sector: {basePort.lat.toFixed(4)}° N · {basePort.lon.toFixed(4)}° E · Sounding: ~35 m
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Waypoint Navigation Sequence Table */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Compass className="w-4 h-4 text-[#FFB703]" />
                <span>
                  TURN-BY-TURN WAYPOINT NAVIGATION SEQUENCE ({tspSolution.legs.length} LEGS)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Click any leg to focus map
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10.5px] font-mono">
                <thead className="bg-[#050A12] text-slate-400 border-b border-white/[0.08]">
                  <tr>
                    <th className="py-1.5 px-2">LEG #</th>
                    <th className="py-1.5 px-2">FROM → TO</th>
                    <th className="py-1.5 px-2">COORDINATES (END)</th>
                    <th className="py-1.5 px-2">HEADING</th>
                    <th className="py-1.5 px-2 text-right">LEG DIST (NM)</th>
                    <th className="py-1.5 px-2 text-right">EST. TIME</th>
                    <th className="py-1.5 px-2">OPERATIONAL ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tspSolution.legs.map((leg, idx) => {
                    const isSelected = selectedPointId === leg.to.id;
                    const isSimActive = isSimulating && simStep === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleFocusWaypoint(leg.to.id, leg.to.lat, leg.to.lon)}
                        className={`hover:bg-[#FFB703]/[0.08] text-slate-200 cursor-pointer transition-colors ${
                          isSimActive
                            ? 'bg-[#00F5D4]/15 border-l-2 border-[#00F5D4]'
                            : isSelected
                            ? 'bg-[#FFB703]/15 border-l-2 border-[#FFB703]'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-2 font-bold text-white">
                          <span
                            className={`px-1.5 py-0.2 rounded border ${
                              isSimActive
                                ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4]'
                                : isSelected
                                ? 'bg-[#FFB703]/20 border-[#FFB703] text-[#FFB703]'
                                : 'bg-white/[0.05] border-white/[0.08]'
                            }`}
                          >
                            WP-{idx}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-semibold text-slate-200">
                          {leg.from.name.split(' ')[0]} → {leg.to.name.split(' ')[0]}
                        </td>
                        <td className="py-2 px-2 text-slate-400 text-[10px]">
                          {leg.to.lat.toFixed(4)}° N, {leg.to.lon.toFixed(4)}° E
                        </td>
                        <td className="py-2 px-2 text-[#FFB703] font-bold">
                          {String(leg.bearingDeg).padStart(3, '0')}°
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-[#00F5D4]">
                          {leg.distanceNM}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">
                          {Math.floor(leg.estMinutes / 60)}h {leg.estMinutes % 60}m
                        </td>
                        <td className="py-2 px-2 text-slate-300 truncate max-w-[150px]">
                          {leg.actionNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: RIGHT ROUTE ANALYSIS & BATHYMETRIC PROFILE ── */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Panel 1: Route Analysis */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFB703] uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>ROUTE ANALYSIS</span>
            </div>

            <div className="space-y-1.5 text-[10.5px] font-mono divide-y divide-white/[0.04]">
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Optimization Method</span>
                <strong className="text-white">2-Opt (TSP)</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Waypoints</span>
                <strong className="text-white">{tspSolution.orderedPoints.length}</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Distance</span>
                <strong className="text-white">{tspSolution.totalDistanceNM} NM</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Estimated Time</span>
                <strong className="text-white">{tspSolution.totalMissionHours} hrs</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Fuel / Energy</span>
                <strong className="text-emerald-400">
                  {tspSolution.energyConsumedKWh} {vessel.consumptionUnit}
                </strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">CO₂ Reduction</span>
                <strong className="text-[#FFB703]">{tspSolution.co2SavedKg} kg</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Safety Check</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  PASS
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Bathymetry Clearance</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  PASS
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Restricted Zone Check</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  PASS
                </span>
              </div>
            </div>
          </div>

          {/* Panel 2: Bathymetric Profile */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#00F5D4]" />
                BATHYMETRIC PROFILE
              </span>
            </div>

            {/* SVG Bathymetric Depth vs Distance Profile */}
            <div className="w-full h-28 bg-[#040810] rounded-lg border border-white/[0.06] p-2 relative">
              <svg viewBox="0 0 280 85" className="w-full h-full">
                {/* Y-axis gridlines */}
                <line x1="28" y1="12" x2="270" y2="12" stroke="#162136" strokeDasharray="2,2" />
                <line x1="28" y1="36" x2="270" y2="36" stroke="#162136" strokeDasharray="2,2" />
                <line x1="28" y1="60" x2="270" y2="60" stroke="#162136" strokeDasharray="2,2" />

                <text x="22" y="15" fill="#64748B" fontSize="6.5" textAnchor="end">
                  0
                </text>
                <text x="22" y="39" fill="#64748B" fontSize="6.5" textAnchor="end">
                  -50
                </text>
                <text x="22" y="63" fill="#64748B" fontSize="6.5" textAnchor="end">
                  -100
                </text>

                {/* X-axis labels */}
                <text x="32" y="78" fill="#64748B" fontSize="6.5">
                  0
                </text>
                <text x="88" y="78" fill="#64748B" fontSize="6.5">
                  20
                </text>
                <text x="144" y="78" fill="#64748B" fontSize="6.5">
                  40
                </text>
                <text x="200" y="78" fill="#64748B" fontSize="6.5">
                  60
                </text>
                <text x="256" y="78" fill="#64748B" fontSize="6.5">
                  80
                </text>
                <text x="274" y="78" fill="#64748B" fontSize="6.5">
                  NM
                </text>

                {/* Seafloor line */}
                <path
                  d="M 32,20 Q 80,45 130,35 T 220,55 T 265,22"
                  fill="none"
                  stroke="#0E364A"
                  strokeWidth="2.5"
                />

                {/* Route Depth line */}
                <path
                  d="M 32,18 L 85,25 L 132,32 L 178,22 L 222,40 L 265,18"
                  fill="none"
                  stroke="#FFB703"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />

                {/* Waypoint Nodes on Profile */}
                {tspSolution.orderedPoints.slice(0, 6).map((node, i) => {
                  const cx = 32 + i * 46;
                  const cy = 20 + ((node.depthM || 20) / 100) * 40;
                  const isSelected = selectedPointId === node.id;
                  return (
                    <g
                      key={node.id + i}
                      className="cursor-pointer"
                      onClick={() => handleFocusWaypoint(node.id, node.lat, node.lon)}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5 : 3.5}
                        fill={isSelected ? '#ffffff' : '#FFB703'}
                        stroke="#05070B"
                        strokeWidth="1"
                      />
                      <text
                        x={cx}
                        y={cy + 2.5}
                        fill="#05070B"
                        fontSize="5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {i}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-[#FFB703]" />
                <span>Route Depth</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-[#0E364A]" />
                <span>Seafloor Bed</span>
              </span>
            </div>
          </div>

          {/* Panel 3: Weather & Sea State (Forecast) */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <Wind className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span>WEATHER & SEA STATE (FORECAST)</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[8px] uppercase">Wind</span>
                <strong className="text-white text-[10.5px]">8-12 kts NE</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[8px] uppercase">Sea State</span>
                <strong className="text-white text-[10.5px]">1.2 m (Calm)</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[8px] uppercase">Visibility</span>
                <strong className="text-white text-[10.5px]">&gt; 10 NM</strong>
              </div>
            </div>

            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Favorable for autonomous ROV operations</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                sonarAudio.playSonarPing?.();
                setIsDeployModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-mono font-black text-xs transition-all cursor-pointer shadow-lg shadow-[#FFB703]/25 flex items-center justify-center gap-2 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Deploy Optimized Route</span>
            </button>

            <button
              onClick={() => {
                setIsSimulating(!isSimulating);
                sonarAudio.playTargetBeep?.();
                showToast(
                  isSimulating
                    ? 'Paused route playback simulation'
                    : 'Started autonomous route traversal playback'
                );
              }}
              className={`w-full py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
                isSimulating
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] text-slate-300 hover:text-white'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-[#00F5D4]" />
                  <span>Simulate Route (Playback)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. DEPLOY MISSION MODAL ── */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#070D18] border border-white/[0.15] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFB703]/15 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703]">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    DISPATCH AUTONOMOUS MISSION
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    VHF-AIS Telemetry Link (161.975 MHz)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Fleet</span>
                  <span className="text-white font-bold">{vessel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Port</span>
                  <span className="text-[#00F5D4] font-bold">{basePort.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Optimized Distance</span>
                  <span className="text-white font-bold">{tspSolution.totalDistanceNM} NM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Waypoints</span>
                  <span className="text-[#FFB703] font-bold">
                    {tspSolution.orderedPoints.length} Waypoints
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Mission Duration</span>
                  <span className="text-white font-bold">{tspSolution.totalMissionHours} Hours</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AUTONOMOUS SAFETY AUDIT: PASSED</span>
                </div>
                <p className="text-slate-300 text-[10px]">
                  Zero restricted-zone infringements detected. Under-keel bathymetry clearance
                  verified across all legs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsDeploying(true);
                  sonarAudio.playLockBeep?.();
                  setTimeout(() => {
                    setIsDeploying(false);
                    setIsDeployModalOpen(false);
                    showToast(
                      `Uplink established! Navigation plan successfully dispatched to ${vessel.name}.`
                    );
                  }, 1000);
                }}
                disabled={isDeploying}
                className="px-5 py-2 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] text-xs font-mono font-black transition-all cursor-pointer shadow-lg shadow-[#FFB703]/25 flex items-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Uplinking Plan...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Confirm & Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlannerPage;
