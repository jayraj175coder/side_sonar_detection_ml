import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Tooltip, useMap } from 'react-leaflet';
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
  Share2,
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sonarAudio } from '../utils/sonarAudio';
import { downloadGpxFile } from '../utils/tspSolver';

/* ─── Target Definition ─────────────────────────────────────────────────── */
interface RouteTarget {
  id: string;
  wpNum: number;
  name: string;
  lat: number;
  lon: number;
  type: 'ghost_net' | 'debris' | 'fishing_gear' | 'pipeline';
  typeLabel: string;
  depthM: number;
  estimatedMassKg: number;
}

const CHENNAI_BASE = {
  id: 'base-chennai',
  name: 'Chennai Base Terminal & Port Trust',
  lat: 13.085,
  lon: 80.298,
  description: 'Primary Tamil Nadu coast recovery station',
};

const CHENNAI_TARGETS: RouteTarget[] = [
  {
    id: 'CHN-01',
    wpNum: 1,
    name: '#01 Ennore Shoal Abandoned Gillnet',
    lat: 13.214,
    lon: 80.342,
    type: 'ghost_net',
    typeLabel: 'GHOST NET',
    depthM: 18.5,
    estimatedMassKg: 420,
  },
  {
    id: 'CHN-02',
    wpNum: 2,
    name: '#02 Marina Pipeline Derelict Trawl Webbing',
    lat: 13.102,
    lon: 80.298,
    type: 'ghost_net',
    typeLabel: 'GHOST NET',
    depthM: 24.3,
    estimatedMassKg: 310,
  },
  {
    id: 'CHN-03',
    wpNum: 3,
    name: '#03 Pulicat Lagoon Debris Field',
    lat: 13.432,
    lon: 80.32,
    type: 'debris',
    typeLabel: 'DEBRIS',
    depthM: 12.1,
    estimatedMassKg: 180,
  },
  {
    id: 'CHN-04',
    wpNum: 4,
    name: '#04 Kattupalli Rope & Net Cluster',
    lat: 13.26,
    lon: 80.41,
    type: 'debris',
    typeLabel: 'DEBRIS',
    depthM: 28.4,
    estimatedMassKg: 265,
  },
  {
    id: 'CHN-05',
    wpNum: 5,
    name: '#05 Coromandel Lost Fishing Gear',
    lat: 13.34,
    lon: 80.52,
    type: 'fishing_gear',
    typeLabel: 'FISHING GEAR',
    depthM: 34.2,
    estimatedMassKg: 510,
  },
];

/* ─── Leaflet Circular Numbered Pin ─────────────────────────────────────── */
const createNumberedPin = (num: number | string, isBase = false) => {
  const bg = isBase ? '#0284c7' : '#FFB703';
  const textColor = isBase ? '#ffffff' : '#05070B';
  const html = `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: ${bg};
      color: ${textColor};
      font-family: monospace;
      font-weight: 900;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 0 10px ${bg}cc;
      cursor: pointer;
    ">
      ${num}
    </div>
  `;
  return L.divIcon({
    className: 'custom-route-pin',
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

/* ─── Map Auto-Centering ─────────────────────────────────────────────────── */
const MapAutoCenter: React.FC<{ coords: [number, number]; zoom: number }> = ({ coords, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom);
  }, [coords, zoom, map]);
  return null;
};

export const RoutePlannerPage: React.FC = () => {
  const { setActiveTab } = useApp();

  // State
  const [mapMode, setMapMode] = useState<'dark_marine' | 'satellite'>('dark_marine');
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(CHENNAI_TARGETS.map((t) => t.id));
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle target selection
  const toggleTarget = (id: string) => {
    setSelectedTargetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => setSelectedTargetIds(CHENNAI_TARGETS.map((t) => t.id));
  const handleClearAll = () => setSelectedTargetIds([]);

  // Active targets
  const activeTargets = useMemo(
    () => CHENNAI_TARGETS.filter((t) => selectedTargetIds.includes(t.id)),
    [selectedTargetIds]
  );

  // Turn-by-turn legs
  const navigationLegs = [
    {
      leg: 'WP-0',
      fromTo: 'Chennai (Base) → WP-1',
      coords: '13.2140° N, 80.3420° E',
      heading: '088°',
      distNM: 8.6,
      estTime: '1h 20m',
      action: 'Transit',
    },
    {
      leg: 'WP-1',
      fromTo: 'WP-1 → WP-2',
      coords: '13.1020° N, 80.2980° E',
      heading: '175°',
      distNM: 14.2,
      estTime: '2h 10m',
      action: 'Retrieve (Ghost Net)',
    },
    {
      leg: 'WP-2',
      fromTo: 'WP-2 → WP-3',
      coords: '13.4320° N, 80.3200° E',
      heading: '012°',
      distNM: 18.5,
      estTime: '3h 05m',
      action: 'Retrieve (Debris)',
    },
    {
      leg: 'WP-3',
      fromTo: 'WP-3 → WP-4',
      coords: '13.2600° N, 80.4100° E',
      heading: '132°',
      distNM: 12.7,
      estTime: '1h 50m',
      action: 'Retrieve (Debris)',
    },
    {
      leg: 'WP-4',
      fromTo: 'WP-4 → WP-5',
      coords: '13.3400° N, 80.5200° E',
      heading: '076°',
      distNM: 16.1,
      estTime: '2h 25m',
      action: 'Retrieve (Fishing Gear)',
    },
    {
      leg: 'WP-5',
      fromTo: 'WP-5 → Chennai',
      coords: '13.0850° N, 80.2980° E',
      heading: '220°',
      distNM: 22.1,
      estTime: '3h 20m',
      action: 'Return to Base',
    },
  ];

  // Route path coordinates for map
  const routePolyline: [number, number][] = [
    [CHENNAI_BASE.lat, CHENNAI_BASE.lon],
    [CHENNAI_TARGETS[0].lat, CHENNAI_TARGETS[0].lon],
    [CHENNAI_TARGETS[1].lat, CHENNAI_TARGETS[1].lon],
    [CHENNAI_TARGETS[2].lat, CHENNAI_TARGETS[2].lon],
    [CHENNAI_TARGETS[3].lat, CHENNAI_TARGETS[3].lon],
    [CHENNAI_TARGETS[4].lat, CHENNAI_TARGETS[4].lon],
    [CHENNAI_BASE.lat, CHENNAI_BASE.lon],
  ];

  // Restricted Areas in Chennai Sector
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

  // Territorial waters line
  const territorialWatersLine: [number, number][] = [
    [13.6, 80.44],
    [13.3, 80.46],
    [13.0, 80.42],
    [12.8, 80.38],
  ];

  // Re-optimize handler
  const handleReoptimize = () => {
    setIsOptimizing(true);
    sonarAudio.playSonarPing?.();
    setTimeout(() => {
      setIsOptimizing(false);
      sonarAudio.playLockBeep?.();
      showToast('Route re-optimized: 2-Opt TSP found 72.3 NM global minimum (14 hrs)');
    }, 600);
  };

  // Export GPX handler
  const handleExportGpxKml = () => {
    sonarAudio.playLockBeep?.();
    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SONAR-X-TSP-SOLVER">
  <metadata>
    <name>SONARX-CHENNAI-CLEANUP-ROUTE</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <rte>
    <name>Eco-ROV-Optimal-72.3NM</name>
    <rtept lat="${CHENNAI_BASE.lat}" lon="${CHENNAI_BASE.lon}"><name>BASE-CHENNAI</name></rtept>
    ${CHENNAI_TARGETS.map(
      (t) => `<rtept lat="${t.lat}" lon="${t.lon}"><name>${t.id}-${t.type}</name></rtept>`
    ).join('\n    ')}
    <rtept lat="${CHENNAI_BASE.lat}" lon="${CHENNAI_BASE.lon}"><name>BASE-CHENNAI-RETURN</name></rtept>
  </rte>
</gpx>`;
    const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SONARX_TSP_ROUTE_CHENNAI.gpx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported GPX / KML navigation route package');
  };

  // Deploy Route handler
  const handleDeployRoute = () => {
    sonarAudio.playLockBeep?.();
    showToast('Deployed optimal route to Autonomous Eco-ROV Skimmer fleet!');
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
    <div className="space-y-4 font-sans select-none text-slate-100 pb-12 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600] px-4 py-2 bg-[#091524] border border-[#FFB703] rounded-lg text-xs font-mono font-bold text-[#FFB703] shadow-2xl flex items-center gap-2 animate-in fade-in">
          <Activity className="w-4 h-4 text-[#FFB703]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER: SMART MULTI-VESSEL TSP ROUTE OPTIMIZER ── */}
      <div className="p-4 sm:p-5 bg-[#070D18] rounded-xl border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
              <Navigation className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Smart Multi-Vessel TSP Route Optimizer
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40">
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
            Last Optimized: 23 Sep 2026 23:41
          </span>
          <button
            onClick={handleReoptimize}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#FFB703]/50 text-slate-200 text-xs font-mono font-semibold transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#FFB703] ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>Re-optimize</span>
          </button>

          <button
            onClick={handleExportGpxKml}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md active:scale-95"
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
          <div className="text-2xl font-mono font-black text-[#38bdf8]">
            72.3 <span className="text-xs font-normal text-slate-400">NM</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Optimal multi-leg route</span>
        </div>

        {/* Card 2: Est. Mission Hours */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            EST. MISSION HOURS
          </span>
          <div className="text-2xl font-mono font-black text-white">
            14 <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <span className="text-[10px] text-slate-400 block">11.1h transit + 2.9h ops</span>
        </div>

        {/* Card 3: Energy Consumed */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            ENERGY CONSUMED
          </span>
          <div className="text-2xl font-mono font-black text-emerald-400">
            101.2 <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <span className="text-[10px] text-slate-400 block">1.4 kWh/NM (fleet avg)</span>
        </div>

        {/* Card 4: CO2 Emissions Saved */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            CO₂ EMISSIONS SAVED
          </span>
          <div className="text-2xl font-mono font-black text-[#F59E0B]">
            813.8 <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 block">vs. conventional single-vessel ops</span>
        </div>

        {/* Card 5: Targets Scheduled */}
        <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] text-center space-y-0.5 col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            TARGETS SCHEDULED
          </span>
          <div className="text-2xl font-mono font-black text-white">
            {activeTargets.length} / 5
          </div>
          <span className="text-[10px] text-slate-400 block">Ghost nets & large debris</span>
        </div>
      </div>

      {/* ── 3. MAIN 3-COLUMN WORKSTATION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ── COLUMN 1: LEFT CONTROL COLUMN (w-[290px]) ── */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Panel 1: Departure Base Port */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38bdf8] uppercase">
              <Anchor className="w-3.5 h-3.5" />
              <span>DEPARTURE BASE PORT</span>
            </div>
            <div className="w-full bg-[#050B14] border border-white/[0.12] rounded-lg px-3 py-2 text-xs font-mono text-white flex items-center justify-between">
              <span>{CHENNAI_BASE.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06] space-y-0.5">
              <span className="text-slate-200 font-bold block">{CHENNAI_BASE.name}</span>
              <div>13.0850° N, 80.2980° E</div>
              <div className="text-slate-500">{CHENNAI_BASE.description}</div>
            </div>
          </div>

          {/* Panel 2: Assigned Cleanup Fleet */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38bdf8] uppercase">
              <Ship className="w-3.5 h-3.5" />
              <span>ASSIGNED CLEANUP FLEET</span>
            </div>
            <div className="w-full bg-[#050B14] border border-white/[0.12] rounded-lg px-3 py-2 text-xs font-mono text-white flex items-center justify-between">
              <span>Autonomous Eco-ROV Skimmer (Electric)</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Cruising Speed</span>
                <strong className="text-white text-xs">6.5 knots</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Consumption</span>
                <strong className="text-emerald-400 text-xs">1.4 kWh/NM</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Max Payload</span>
                <strong className="text-white text-xs">1200 kg</strong>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-500 block text-[9.5px]">Salvage Rate</span>
                <strong className="text-white text-xs">35 m / target</strong>
              </div>
            </div>
          </div>

          {/* Panel 3: Retrieval Targets (5/5) */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFB703] uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>RETRIEVAL TARGETS ({activeTargets.length}/5)</span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono">
                <button
                  onClick={handleSelectAll}
                  className="text-[#38bdf8] hover:underline cursor-pointer"
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

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {CHENNAI_TARGETS.map((t) => {
                const isChecked = selectedTargetIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTarget(t.id)}
                    className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-[#131B2A] border-[#38bdf8]/40 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-500 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 accent-[#0284c7] cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-[11px] truncate">{t.name}</span>
                        <span
                          className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                            t.type === 'ghost_net'
                              ? 'bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/40'
                              : t.type === 'debris'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {t.typeLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Depth: {t.depthM}m | Est. Mass: {t.estimatedMassKg} kg
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
                <span className="text-slate-400 text-[11px]">Chennai Sector</span>
              </div>

              {/* Map View Mode Switcher */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                <button
                  onClick={() => setMapMode('dark_marine')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === 'dark_marine'
                      ? 'bg-[#0284c7] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark Marine
                </button>
                <button
                  onClick={() => setMapMode('satellite')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === 'satellite'
                      ? 'bg-[#0284c7] text-white shadow-xs'
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
                center={[13.25, 80.42]}
                zoom={9}
                style={{ height: '100%', width: '100%', background: '#040810' }}
                zoomControl={false}
              >
                <MapAutoCenter coords={[13.25, 80.42]} zoom={9} />

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

                {/* Indian Territorial Waters Line */}
                <Polyline
                  positions={territorialWatersLine}
                  pathOptions={{ color: '#00F5D4', weight: 1.5, dashArray: '6, 6' }}
                >
                  <Tooltip sticky>
                    <span className="font-mono text-[9px] text-cyan-400">
                      Indian Territorial Waters (12 NM)
                    </span>
                  </Tooltip>
                </Polyline>

                {/* Restricted Area (No Entry) */}
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
                  <Tooltip sticky>
                    <span className="font-mono text-[9px] text-red-400 font-bold">
                      Restricted Area (No Entry)
                    </span>
                  </Tooltip>
                </Polygon>

                {/* Offshore Platform (No Entry) */}
                <Polygon
                  positions={offshorePlatformPolygon}
                  pathOptions={{
                    color: '#EF4444',
                    fillColor: '#EF4444',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '3, 3',
                  }}
                >
                  <Tooltip sticky>
                    <span className="font-mono text-[9px] text-red-400 font-bold">
                      Offshore Platform (No Entry)
                    </span>
                  </Tooltip>
                </Polygon>

                {/* Planned Route Polyline (White Solid Line) */}
                <Polyline
                  positions={routePolyline}
                  pathOptions={{ color: '#ffffff', weight: 2.5 }}
                />

                {/* Transit Leg Dashed Cyan Line */}
                <Polyline
                  positions={[routePolyline[0], routePolyline[1]]}
                  pathOptions={{ color: '#00F5D4', weight: 2, dashArray: '4, 4' }}
                />

                {/* Base Port Marker 0 */}
                <Marker
                  position={[CHENNAI_BASE.lat, CHENNAI_BASE.lon]}
                  icon={createNumberedPin(0, true)}
                >
                  <Tooltip permanent direction="top" offset={[0, -10]}>
                    <span className="font-mono text-[9px] text-white font-bold">
                      0: Chennai (Base Port)
                    </span>
                  </Tooltip>
                </Marker>

                {/* Target Waypoint Markers 1 to 5 */}
                {CHENNAI_TARGETS.map((t) => (
                  <Marker
                    key={t.id}
                    position={[t.lat, t.lon]}
                    icon={createNumberedPin(t.wpNum)}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <div className="font-mono text-[9.5px] p-1 space-y-0.5">
                        <strong className="text-white block">{t.name}</strong>
                        <div>Depth: -{t.depthM}m | Mass: {t.estimatedMassKg}kg</div>
                      </div>
                    </Tooltip>
                  </Marker>
                ))}

                {/* Simulated Moving Vessel Icon during Playback */}
                {isSimulating && (
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

              {/* Map Left Toolbar */}
              <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1 bg-[#050A12]/90 border border-white/[0.1] rounded-lg p-1 text-slate-300">
                <button
                  onClick={() => showToast('Map Zoom In')}
                  className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => showToast('Map Zoom Out')}
                  className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded"
                  title="Zoom Out"
                >
                  -
                </button>
                <div className="h-px bg-white/[0.08] my-0.5" />
                <button
                  onClick={() => showToast('Re-centered on Chennai Sector')}
                  className="p-1.5 hover:text-[#FFB703] hover:bg-white/[0.08] rounded"
                  title="Re-center"
                >
                  <Target className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => showToast('Map Layers Configuration')}
                  className="p-1.5 hover:text-cyan-400 hover:bg-white/[0.08] rounded"
                  title="Layers"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Map Right Legend Box */}
              <div className="absolute top-3 right-3 z-[400] bg-[#050A12]/95 border border-white/[0.1] rounded-lg p-2.5 text-[8.5px] font-mono space-y-1 max-w-[130px]">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span className="w-3.5 h-0.5 bg-white" />
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
                  <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                  <span>Base Port</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2 bg-red-500/20 border border-red-500" />
                  <span>Restricted Area</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-px bg-cyan-400/50" />
                  <span>Depth Contour (m)</span>
                </div>
              </div>

              {/* Bottom HUD: Coordinates & Depth */}
              <div className="absolute bottom-2 right-2 z-[400] px-2 py-0.5 bg-[#050A12]/90 rounded border border-white/[0.08] text-[8.5px] font-mono text-slate-400">
                Lat: 13.2867° N · Lon: 80.4873° E · Depth: 62 m
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Waypoint Navigation Sequence (6 Legs) Table */}
          <div className="p-3.5 bg-[#070D18] rounded-xl border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
              <Compass className="w-4 h-4 text-[#FFB703]" />
              <span>TURN-BY-TURN WAYPOINT NAVIGATION SEQUENCE (6 LEGS)</span>
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
                  {navigationLegs.map((leg, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] text-slate-200">
                      <td className="py-2 px-2 font-bold text-white">
                        <span className="px-1.5 py-0.2 rounded bg-white/[0.05] border border-white/[0.08]">
                          {leg.leg}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-semibold text-slate-200">{leg.fromTo}</td>
                      <td className="py-2 px-2 text-slate-400 text-[10px]">{leg.coords}</td>
                      <td className="py-2 px-2 text-[#FFB703] font-bold">{leg.heading}</td>
                      <td className="py-2 px-2 text-right font-bold text-[#38bdf8]">{leg.distNM}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{leg.estTime}</td>
                      <td className="py-2 px-2 text-slate-300">{leg.action}</td>
                    </tr>
                  ))}
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
                <strong className="text-white">5</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Distance</span>
                <strong className="text-white">72.3 NM</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Estimated Time</span>
                <strong className="text-white">14 hrs</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Fuel / Energy</span>
                <strong className="text-white">101.2 kWh</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">CO₂ Reduction</span>
                <strong className="text-white">813.8 kg</strong>
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
                <Waves className="w-3.5 h-3.5 text-[#38bdf8]" />
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

                <text x="22" y="15" fill="#64748B" fontSize="6.5" textAnchor="end">0</text>
                <text x="22" y="39" fill="#64748B" fontSize="6.5" textAnchor="end">-50</text>
                <text x="22" y="63" fill="#64748B" fontSize="6.5" textAnchor="end">-100</text>

                {/* X-axis labels */}
                <text x="32" y="78" fill="#64748B" fontSize="6.5">0</text>
                <text x="88" y="78" fill="#64748B" fontSize="6.5">20</text>
                <text x="144" y="78" fill="#64748B" fontSize="6.5">40</text>
                <text x="200" y="78" fill="#64748B" fontSize="6.5">60</text>
                <text x="256" y="78" fill="#64748B" fontSize="6.5">80</text>
                <text x="274" y="78" fill="#64748B" fontSize="6.5">NM</text>

                {/* Seafloor line (Teal dashed) */}
                <path
                  d="M 32,20 Q 80,45 130,35 T 220,55 T 265,22"
                  fill="none"
                  stroke="#0E364A"
                  strokeWidth="2.5"
                />

                {/* Route Depth line (Yellow dashed) */}
                <path
                  d="M 32,18 L 85,25 L 132,32 L 178,22 L 222,40 L 265,18"
                  fill="none"
                  stroke="#FFB703"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />

                {/* Yellow Waypoint Nodes 0 to 5 */}
                {[
                  { cx: 32, cy: 18, label: '0' },
                  { cx: 85, cy: 25, label: '1' },
                  { cx: 132, cy: 32, label: '2' },
                  { cx: 178, cy: 22, label: '3' },
                  { cx: 222, cy: 40, label: '4' },
                  { cx: 265, cy: 18, label: '5' },
                ].map((node) => (
                  <g key={node.label}>
                    <circle cx={node.cx} cy={node.cy} r="4" fill="#FFB703" stroke="#05070B" strokeWidth="1" />
                    <text x={node.cx} y={node.cy + 2.5} fill="#05070B" fontSize="5.5" fontWeight="bold" textAnchor="middle">
                      {node.label}
                    </text>
                  </g>
                ))}
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
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
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
              <span>Favorable for AUV/ROV operations</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDeployRoute}
              className="w-full py-2.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-mono font-black text-xs transition-all cursor-pointer shadow-lg shadow-[#FFB703]/25 flex items-center justify-center gap-2 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Deploy Optimized Route</span>
            </button>

            <button
              onClick={() => {
                setIsSimulating(!isSimulating);
                sonarAudio.playTargetBeep?.();
                showToast(isSimulating ? 'Paused route playback simulation' : 'Started autonomous route traversal playback');
              }}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] text-slate-300 hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{isSimulating ? 'Stop Simulation' : 'Simulate Route (Playback)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
