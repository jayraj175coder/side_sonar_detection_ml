import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Compass,
  Anchor,
  Ship,
  Zap,
  Leaf,
  Clock,
  ArrowRight,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sliders,
  Sparkles,
  Shield,
  Fuel,
  TrendingDown,
  Info,
  Check,
} from 'lucide-react';
import {
  BASE_PORTS,
  CLEANUP_FLEET,
  NavPoint,
  VesselProfile,
  TspSolution,
  solveTspRoute,
  downloadGpxFile,
} from '../utils/tspSolver';
import { useApp } from '../context/AppContext';

/* ─── Pre-configured Regional Target Clusters ────────────────────────────── */
const REGIONAL_TARGETS: Record<string, NavPoint[]> = {
  'base-chennai': [
    {
      id: 'CHN-T01',
      name: '#01 Ennore Shoal Abandoned Gillnet',
      lat: 13.2140,
      lon: 80.3420,
      type: 'ghost_net',
      depthM: 18.5,
      estimatedMassKg: 420,
      notes: 'Submerged synthetic monofilament net entangled in rocky seabed',
    },
    {
      id: 'CHN-T02',
      name: '#02 Pulicat Reef Derelict Trawl Webbing',
      lat: 13.4180,
      lon: 80.3750,
      type: 'ghost_net',
      depthM: 24.2,
      estimatedMassKg: 650,
      notes: 'High-density nylon rope cluster endangering coral nursery',
    },
    {
      id: 'CHN-T03',
      name: '#03 Chennai Anchorage Steel Cable Drum',
      lat: 13.1120,
      lon: 80.3680,
      type: 'debris',
      depthM: 32.0,
      estimatedMassKg: 850,
      notes: 'Heavy commercial mooring wire spool on fairway flank',
    },
    {
      id: 'CHN-T04',
      name: '#04 Coromandel Fuel Line Scour Exposure',
      lat: 13.0640,
      lon: 80.3550,
      type: 'pipeline',
      depthM: 22.8,
      estimatedMassKg: 0,
      notes: 'Unburied 14m scour span posing anchor snag hazard',
    },
    {
      id: 'CHN-T05',
      name: '#05 Covelong Outer Ridge Debris Bundle',
      lat: 12.8250,
      lon: 80.2950,
      type: 'debris',
      depthM: 28.4,
      estimatedMassKg: 380,
      notes: 'Discarded trawl doors and chained lead line',
    },
  ],
  'base-mumbai': [
    {
      id: 'MUM-T01',
      name: '#01 Mumbai High Pipeline Crossing Scour',
      lat: 19.3820,
      lon: 71.3550,
      type: 'pipeline',
      depthM: 62.0,
      estimatedMassKg: 0,
      notes: 'High-risk unburied pipeline section with acoustic shadow relief',
    },
    {
      id: 'MUM-T02',
      name: '#02 Prongs Reef Heavy Ghost Net Cluster',
      lat: 18.8850,
      lon: 72.8120,
      type: 'ghost_net',
      depthM: 19.5,
      estimatedMassKg: 580,
      notes: 'Entangled ALDFG nylon net spanning 18m across basalt outcropping',
    },
    {
      id: 'MUM-T03',
      name: '#03 Jawaharlal Nehru Port Fairway Steel Debris',
      lat: 18.9480,
      lon: 72.8950,
      type: 'debris',
      depthM: 16.2,
      estimatedMassKg: 720,
      notes: 'Submerged container frame and metallic structural members',
    },
    {
      id: 'MUM-T04',
      name: '#04 Bassein Offshore Industrial Valve Rack',
      lat: 19.1250,
      lon: 72.6850,
      type: 'debris',
      depthM: 44.0,
      estimatedMassKg: 940,
      notes: 'Offshore platform scrap dropped during monsoon maintenance',
    },
  ],
  'base-kochi': [
    {
      id: 'KCH-T01',
      name: '#01 Fort Kochi Channel Lost Trawler Gear',
      lat: 9.9820,
      lon: 76.1950,
      type: 'ghost_net',
      depthM: 17.0,
      estimatedMassKg: 390,
      notes: 'Synthetic mesh cluster threatening approach channel draft',
    },
    {
      id: 'KCH-T02',
      name: '#02 Willingdon Island Subsea Cable Hazard',
      lat: 9.9450,
      lon: 76.2420,
      type: 'pipeline',
      depthM: 14.5,
      estimatedMassKg: 0,
      notes: 'Exposed telecom conduit spanning dredge trench',
    },
    {
      id: 'KCH-T03',
      name: '#03 Vypin Coastal Basin ALDFG Polypropylene Mass',
      lat: 10.0520,
      lon: 76.1650,
      type: 'ghost_net',
      depthM: 26.0,
      estimatedMassKg: 610,
      notes: 'Active ghost fishing net with trapped marine organisms',
    },
  ],
  'base-vizag': [
    {
      id: 'VIZ-T01',
      name: '#01 Dolphin Nose Outer Roads Ghost Net',
      lat: 17.6540,
      lon: 83.3420,
      type: 'ghost_net',
      depthM: 38.0,
      estimatedMassKg: 510,
      notes: 'Large trawler net draped over continental slope drop-off',
    },
    {
      id: 'VIZ-T02',
      name: '#02 Gangavaram Deep Trench Metal Scour',
      lat: 17.6120,
      lon: 83.2750,
      type: 'debris',
      depthM: 48.0,
      estimatedMassKg: 820,
      notes: 'Sunken ore conveyor chute fragment on muddy substrate',
    },
  ],
  'base-portblair': [
    {
      id: 'AND-T01',
      name: '#01 Ross Island Sanctuary Coral Net Mass',
      lat: 11.6780,
      lon: 92.7720,
      type: 'ghost_net',
      depthM: 16.5,
      estimatedMassKg: 340,
      notes: 'Entangled gillnet smothering staghorn coral colonies',
    },
    {
      id: 'AND-T02',
      name: '#02 Port Blair Outer Harbor Anchor Spool',
      lat: 11.6420,
      lon: 92.7680,
      type: 'debris',
      depthM: 29.8,
      estimatedMassKg: 490,
      notes: 'Heavy discarded chain bundle and unclassified acoustic contact',
    },
  ],
  'base-goa': [
    {
      id: 'GOA-T01',
      name: '#01 Grande Island Coral Reef ALDFG',
      lat: 15.3520,
      lon: 73.7450,
      type: 'ghost_net',
      depthM: 19.0,
      estimatedMassKg: 410,
      notes: 'Monofilament net threatening marine sanctuary dive zone',
    },
    {
      id: 'GOA-T02',
      name: '#02 Aguada Outer Anchorage Cable Cluster',
      lat: 15.4850,
      lon: 73.7320,
      type: 'debris',
      depthM: 24.5,
      estimatedMassKg: 620,
      notes: 'Discarded mooring hawser and steel bridal wire',
    },
  ],
};

/* ─── Map Auto-Centering Component ───────────────────────────────────────── */
const MapAutoFitter: React.FC<{ points: NavPoint[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
  }, [points, map]);
  return null;
};

/* ─── Leaflet Custom Pin Helpers ─────────────────────────────────────────── */
const createBasePortPin = (name: string) => {
  return L.divIcon({
    className: 'custom-base-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        background: #0284c7;
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 9999px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 800;
        border: 2px solid #ffffff;
        box-shadow: 0 0 16px rgba(2, 132, 199, 0.8);
        white-space: nowrap;
      ">
        <span>⚓</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [120, 28],
    iconAnchor: [60, 14],
  });
};

const createWaypointPin = (wpNumber: number, label: string, type: string) => {
  let badgeColor = '#00F5D4'; // Cyan
  let borderColor = '#00F5D4';
  if (type === 'ghost_net') {
    badgeColor = '#FFB703'; // Amber
    borderColor = '#FFB703';
  } else if (type === 'debris') {
    badgeColor = '#F59E0B'; // Orange
    borderColor = '#F59E0B';
  } else if (type === 'pipeline') {
    badgeColor = '#38BDF8'; // Sky
    borderColor = '#38BDF8';
  }

  return L.divIcon({
    className: 'custom-wp-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(5, 7, 11, 0.95);
        color: #ffffff;
        padding: 3px 8px;
        border-radius: 9999px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 800;
        border: 1.5px solid ${borderColor};
        box-shadow: 0 0 12px ${borderColor}55;
        white-space: nowrap;
      ">
        <span style="
          background: ${badgeColor};
          color: #05070B;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 900;
        ">#${wpNumber}</span>
        <span style="color: ${badgeColor};">${label}</span>
      </div>
    `,
    iconSize: [110, 24],
    iconAnchor: [55, 12],
  });
};

/* ─── Main Route Planner Page Component ─────────────────────────────────── */
export const RoutePlannerPage: React.FC = () => {
  const { currentScan } = useApp();

  // 1. Base Port Selection
  const [selectedBaseId, setSelectedBaseId] = useState<string>('base-chennai');
  const selectedBase = useMemo(
    () => BASE_PORTS.find((b) => b.id === selectedBaseId) || BASE_PORTS[0],
    [selectedBaseId]
  );

  // 2. Assigned Cleanup Fleet
  const [selectedVesselId, setSelectedVesselId] = useState<string>('eco-rov-skimmer');
  const selectedVessel = useMemo(
    () => CLEANUP_FLEET.find((v) => v.id === selectedVesselId) || CLEANUP_FLEET[0],
    [selectedVesselId]
  );

  // 3. Target Catalog & Selected Targets Set
  const availableTargets = useMemo(() => {
    const list = [...(REGIONAL_TARGETS[selectedBaseId] || REGIONAL_TARGETS['base-chennai'])];

    // If current scan has real GPS detections, inject them as dynamic targets!
    if (
      currentScan &&
      currentScan.location?.latitude &&
      currentScan.location?.longitude &&
      currentScan.detections?.length
    ) {
      currentScan.detections.slice(0, 3).forEach((d, idx) => {
        list.unshift({
          id: `SCAN-T${idx + 1}`,
          name: `Scan Contact: ${d.type.replace(/_/g, ' ')}`,
          lat: currentScan.location.latitude! + (idx - 1) * 0.008,
          lon: currentScan.location.longitude! + (idx - 1) * 0.008,
          type: d.type.includes('net')
            ? 'ghost_net'
            : d.type.includes('pipeline')
            ? 'pipeline'
            : 'debris',
          depthM: 35.0 + idx * 3.5,
          estimatedMassKg: 350,
          notes: `Fresh detection from uploaded scan ${currentScan.scan_id}`,
        });
      });
    }

    return list;
  }, [selectedBaseId, currentScan]);

  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);

  // Automatically select all regional targets when base port changes
  useEffect(() => {
    setSelectedTargetIds(availableTargets.map((t) => t.id));
  }, [availableTargets]);

  const toggleTarget = (id: string) => {
    setSelectedTargetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => setSelectedTargetIds(availableTargets.map((t) => t.id));
  const handleClearAll = () => setSelectedTargetIds([]);

  // 4. Calculate TSP Solution (Memoized)
  const activeTargets = useMemo(
    () => availableTargets.filter((t) => selectedTargetIds.includes(t.id)),
    [availableTargets, selectedTargetIds]
  );

  const [isSolving, setIsSolving] = useState(false);
  const [tspSolution, setTspSolution] = useState<TspSolution>(() =>
    solveTspRoute(selectedBase, activeTargets, selectedVessel)
  );

  // Re-run solver when base, targets, or fleet change
  useEffect(() => {
    setIsSolving(true);
    const timer = setTimeout(() => {
      const solution = solveTspRoute(selectedBase, activeTargets, selectedVessel);
      setTspSolution(solution);
      setIsSolving(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedBase, activeTargets, selectedVessel]);

  // Route Polyline LatLng points
  const polylineCoords: [number, number][] = useMemo(() => {
    return tspSolution.orderedPoints.map((p) => [p.lat, p.lon]);
  }, [tspSolution]);

  // Export GPX handler
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const handleExportGpx = () => {
    downloadGpxFile(tspSolution, selectedVessel.name, `SONARX-CLEANUP-${selectedBase.id.toUpperCase()}`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Expandable Leg Table State
  const [isLegsExpanded, setIsLegsExpanded] = useState(true);

  return (
    <div className="space-y-6 font-sans select-none text-slate-100 pb-16">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER: TITLE + EXPORT GPX NAVIGATION FILE BUTTON
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="p-5 subpixel-card rounded-2xl border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
              <Navigation className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Smart Multi-Vessel TSP Route Optimizer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#0284c7]/15 text-[#38bdf8] border border-[#0284c7]/30">
              ALGORITHM: 2-OPT TSP SOLVER
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Solve Traveling Salesperson algorithm for cleanup fleet, fuel optimization, and bathymetric profile charts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setIsSolving(true);
              setTimeout(() => {
                setTspSolution(solveTspRoute(selectedBase, activeTargets, selectedVessel));
                setIsSolving(false);
              }, 200);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-[#FFB703]/50 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
            title="Recalculate 2-Opt local search refinement"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#FFB703] ${isSolving ? 'animate-spin' : ''}`} />
            <span>Re-optimize</span>
          </button>

          <button
            onClick={handleExportGpx}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_20px_rgba(2,132,199,0.35)] active:scale-95"
            title="Export standard TopoGrafix GPX 1.1 file for marine ECDIS, Garmin & Raymarine chartplotters"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
            <span>Export GPX Navigation File</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TOP TELEMETRY KPI CARDS STRIP (Matching MarineGuard Reference + Real Values)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Distance (NM) */}
        <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Total Distance (NM)
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#38bdf8]">
            {tspSolution.totalDistanceNM} <span className="text-xs font-normal text-slate-400">NM</span>
          </div>
          {tspSolution.percentSaved > 0 ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/25">
              <TrendingDown className="w-3 h-3" />
              {tspSolution.percentSaved}% shorter vs naive order
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-500">Optimal single leg</span>
          )}
        </div>

        {/* Est. Mission Hours */}
        <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Est. Mission Hours
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white">
            {tspSolution.totalMissionHours} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {tspSolution.estTransitHours}h transit + {tspSolution.estOpsHours}h salvage ops
          </span>
        </div>

        {/* Energy Consumed */}
        <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Energy Consumed
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
            {tspSolution.energyConsumedKWh}{' '}
            <span className="text-xs font-normal text-slate-400">
              {selectedVessel.consumptionUnit === 'kWh' ? 'kWh' : 'L'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {selectedVessel.consumptionPerNM} {selectedVessel.consumptionUnit}/NM fleet rate
          </span>
        </div>

        {/* CO2 Emissions Saved */}
        <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            CO₂ Emissions Saved
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
            {tspSolution.co2SavedKg} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            Target yield: ~{tspSolution.totalMassRecoveredKg} kg debris
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN WORKBENCH: CONTROL PANEL (LEFT) + INTERACTIVE MAP (RIGHT)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Mission Parameters & Target Checklist */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Departure Base Port Card */}
          <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider">
              <Anchor className="w-3.5 h-3.5" />
              <span>DEPARTURE BASE PORT</span>
            </div>
            <select
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
              className="w-full bg-[#080d16] border border-white/[0.12] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#38bdf8] transition-colors cursor-pointer"
            >
              {BASE_PORTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="text-[10px] font-mono text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05] leading-relaxed">
              <span className="text-slate-300 font-bold block mb-0.5">{selectedBase.name}</span>
              <span>Coordinates: {selectedBase.lat.toFixed(4)}° N, {selectedBase.lon.toFixed(4)}° E</span>
              <p className="text-slate-500 mt-1">{selectedBase.notes}</p>
            </div>
          </div>

          {/* 2. Assigned Cleanup Fleet Card */}
          <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider">
              <Ship className="w-3.5 h-3.5" />
              <span>ASSIGNED CLEANUP FLEET</span>
            </div>
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="w-full bg-[#080d16] border border-white/[0.12] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#38bdf8] transition-colors cursor-pointer"
            >
              {CLEANUP_FLEET.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-500 block">Cruising Speed</span>
                <strong className="text-white">{selectedVessel.speedKnots} knots</strong>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-500 block">Consumption</span>
                <strong className="text-emerald-400">
                  {selectedVessel.consumptionPerNM} {selectedVessel.consumptionUnit}/NM
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-500 block">Max Crane Payload</span>
                <strong className="text-white">{selectedVessel.maxPayloadKg} kg</strong>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-500 block">Salvage Rate</span>
                <strong className="text-white">{selectedVessel.salvageTimePerTargetMin}m / target</strong>
              </div>
            </div>
          </div>

          {/* 3. Subsea Target Selector Checklist */}
          <div className="subpixel-card p-4 rounded-2xl border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>SELECT RETRIEVAL TARGETS ({activeTargets.length}/{availableTargets.length})</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <button
                  onClick={handleSelectAll}
                  className="text-[#38bdf8] hover:underline cursor-pointer"
                >
                  All
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

            <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
              {availableTargets.map((t) => {
                const isSelected = selectedTargetIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTarget(t.id)}
                    className={`p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-white/[0.06] border-[#38bdf8]/40 text-white'
                        : 'bg-white/[0.01] border-white/[0.05] text-slate-400 hover:bg-white/[0.03]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 accent-[#0284c7] cursor-pointer"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white truncate">{t.name}</span>
                        <span
                          className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                            t.type === 'ghost_net'
                              ? 'bg-[#FFB703]/15 text-[#FFB703]'
                              : t.type === 'debris'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-sky-500/15 text-sky-400'
                          }`}
                        >
                          {t.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Depth: {t.depthM}m · Est. Mass: {t.estimatedMassKg} kg
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

        {/* RIGHT COLUMN: Interactive Leaflet Map & Waypoint Sequence */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tactical Maritime Map Canvas */}
          <div className="subpixel-card rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden relative">
            {/* Map Top Status Bar */}
            <div className="px-4 py-2.5 bg-[#080d16]/90 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  BATHYMETRIC TACTICAL ROUTE MAP
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">
                  {selectedBase.name.split(' ')[0]} Sector
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                  {tspSolution.legs.length} LEGS
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 font-bold">
                  {tspSolution.totalDistanceNM} NM TOTAL
                </span>
              </div>
            </div>

            {/* Leaflet Map */}
            <div className="h-[460px] w-full relative bg-[#05070B]">
              <MapContainer
                center={[selectedBase.lat, selectedBase.lon]}
                zoom={9}
                style={{ height: '100%', width: '100%', background: '#05070B' }}
                zoomControl={true}
              >
                {/* Clean Dark Tiles - Zero API Key Required */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  maxZoom={18}
                />

                <MapAutoFitter points={tspSolution.orderedPoints} />

                {/* Base Port Marker */}
                <Marker
                  position={[selectedBase.lat, selectedBase.lon]}
                  icon={createBasePortPin(selectedBase.name.split(' ')[0])}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="font-mono text-xs text-slate-900">
                      <strong>{selectedBase.name}</strong>
                      <div>Base Operations Departure Berth</div>
                    </div>
                  </Tooltip>
                </Marker>

                {/* Target Waypoint Markers */}
                {activeTargets.map((t) => {
                  const wpIndex = tspSolution.orderedPoints.findIndex((p) => p.id === t.id);
                  const displayNum = wpIndex > 0 ? wpIndex : 1;
                  return (
                    <Marker
                      key={t.id}
                      position={[t.lat, t.lon]}
                      icon={createWaypointPin(displayNum, t.name.split(' ')[1] || t.id, t.type)}
                    >
                      <Tooltip direction="top" offset={[0, -10]}>
                        <div className="font-mono text-xs text-slate-900">
                          <strong>Waypoint #{displayNum}: {t.name}</strong>
                          <div>Depth: {t.depthM} m · Mass: {t.estimatedMassKg} kg</div>
                          <div>{t.notes}</div>
                        </div>
                      </Tooltip>
                    </Marker>
                  );
                })}

                {/* TSP Optimal Polyline (Glowing Cyan Transit Corridor) */}
                {polylineCoords.length > 1 && (
                  <>
                    {/* Background glow stroke */}
                    <Polyline
                      positions={polylineCoords}
                      color="#0284c7"
                      weight={8}
                      opacity={0.3}
                    />
                    {/* Foreground dashed line */}
                    <Polyline
                      positions={polylineCoords}
                      color="#38bdf8"
                      weight={2.5}
                      dashArray="6, 6"
                      opacity={0.9}
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Turn-by-Turn Navigational Legs & Waypoint Table */}
          <div className="subpixel-card rounded-2xl border border-white/[0.08] shadow-lg overflow-hidden">
            <div
              className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between cursor-pointer"
              onClick={() => setIsLegsExpanded((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FFB703]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  TURN-BY-TURN WAYPOINT NAVIGATION SEQUENCE ({tspSolution.legs.length} LEGS)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Total Tour: {tspSolution.totalDistanceNM} NM
                </span>
                {isLegsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {isLegsExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08]">
                    <tr>
                      <th className="py-2.5 px-3">LEG #</th>
                      <th className="py-2.5 px-3">WAYPOINT</th>
                      <th className="py-2.5 px-3">COORDINATES</th>
                      <th className="py-2.5 px-3 text-right">HEADING</th>
                      <th className="py-2.5 px-3 text-right">LEG (NM)</th>
                      <th className="py-2.5 px-3 text-right">TOTAL (NM)</th>
                      <th className="py-2.5 px-3 text-right">TRANSIT</th>
                      <th className="py-2.5 px-3">OPERATIONAL ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {tspSolution.legs.map((leg, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">
                            WP-{String(idx + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          {leg.to.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {leg.to.lat.toFixed(4)}°N, {leg.to.lon.toFixed(4)}°E
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#FFB703] font-bold">
                          {leg.bearingDeg}°
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-200">
                          {leg.distanceNM} NM
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#38bdf8] font-bold">
                          {leg.cumulativeNM} NM
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          ~{leg.estMinutes}m
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                          {leg.actionNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
