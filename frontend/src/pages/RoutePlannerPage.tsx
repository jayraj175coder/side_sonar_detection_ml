import React, { useState, useMemo, useEffect } from 'react';
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
  TrendingDown,
  Check,
  Globe,
  Waves,
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
      name: '#03 JNPT Approach Channel Heavy Steel Scrap',
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
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
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
        padding: 5px 10px;
        border-radius: 9999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 700;
        border: 2px solid #ffffff;
        box-shadow: 0 0 16px rgba(2, 132, 199, 0.9);
        white-space: nowrap;
      ">
        <span>⚓</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [130, 30],
    iconAnchor: [65, 15],
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
        gap: 6px;
        background: rgba(5, 7, 11, 0.96);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 9999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 700;
        border: 1.5px solid ${borderColor};
        box-shadow: 0 0 14px ${borderColor}66;
        white-space: nowrap;
      ">
        <span style="
          background: ${badgeColor};
          color: #05070B;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
        ">#${wpNumber}</span>
        <span style="color: ${badgeColor};">${label}</span>
      </div>
    `,
    iconSize: [120, 26],
    iconAnchor: [60, 13],
  });
};

/* ─── Main Route Planner Page Component ─────────────────────────────────── */
export const RoutePlannerPage: React.FC = () => {
  const { currentScan } = useApp();

  // Map Basemap Mode (100% Free Esri layers - zero API key required, zero watermarks)
  const [mapMode, setMapMode] = useState<'dark_hud' | 'bathymetry' | 'satellite'>('dark_hud');

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

    // If current scan has real GPS detections, inject them as dynamic targets
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
    }, 100);
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
      <div className="p-5 sm:p-6 subpixel-card rounded-2xl border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8] shadow-md">
              <Navigation className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Smart Multi-Vessel TSP Route Optimizer
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 shadow-xs">
              ALGORITHM: 2-OPT TSP SOLVER
            </span>
          </div>
          <p className="text-sm font-sans text-slate-300">
            Solve Traveling Salesperson algorithm for cleanup fleet, fuel optimization, and bathymetric profile charts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setIsSolving(true);
              setTimeout(() => {
                setTspSolution(solveTspRoute(selectedBase, activeTargets, selectedVessel));
                setIsSolving(false);
              }, 150);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.12] hover:border-[#FFB703]/50 text-slate-200 hover:text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
            title="Recalculate 2-Opt local search refinement"
          >
            <RotateCcw className={`w-4 h-4 text-[#FFB703] ${isSolving ? 'animate-spin' : ''}`} />
            <span>Re-optimize</span>
          </button>

          <button
            onClick={handleExportGpx}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-bold transition-all cursor-pointer shadow-[0_0_24px_rgba(2,132,199,0.4)] active:scale-95"
            title="Export standard TopoGrafix GPX 1.1 file for marine ECDIS, Garmin & Raymarine chartplotters"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
            <span>Export GPX Navigation File</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TOP TELEMETRY KPI CARDS STRIP
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Distance (NM) */}
        <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1.5">
          <span className="text-xs font-sans text-slate-300 uppercase tracking-wider block font-semibold">
            Total Distance (NM)
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-[#38bdf8]">
            {tspSolution.totalDistanceNM} <span className="text-sm font-medium text-slate-400">NM</span>
          </div>
          {tspSolution.percentSaved > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/25">
              <TrendingDown className="w-3.5 h-3.5" />
              {tspSolution.percentSaved}% shorter vs naive order
            </span>
          ) : (
            <span className="text-xs font-sans text-slate-400">Optimal single leg</span>
          )}
        </div>

        {/* Est. Mission Hours */}
        <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1.5">
          <span className="text-xs font-sans text-slate-300 uppercase tracking-wider block font-semibold">
            Est. Mission Hours
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-white">
            {tspSolution.totalMissionHours} <span className="text-sm font-medium text-slate-400">hrs</span>
          </div>
          <span className="text-xs font-sans text-slate-400">
            {tspSolution.estTransitHours}h transit + {tspSolution.estOpsHours}h salvage ops
          </span>
        </div>

        {/* Energy Consumed */}
        <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1.5">
          <span className="text-xs font-sans text-slate-300 uppercase tracking-wider block font-semibold">
            Energy Consumed
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
            {tspSolution.energyConsumedKWh}{' '}
            <span className="text-sm font-medium text-slate-400">
              {selectedVessel.consumptionUnit === 'kWh' ? 'kWh' : 'L'}
            </span>
          </div>
          <span className="text-xs font-sans text-slate-400">
            {selectedVessel.consumptionPerNM} {selectedVessel.consumptionUnit}/NM fleet rate
          </span>
        </div>

        {/* CO2 Emissions Saved */}
        <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg text-center space-y-1.5">
          <span className="text-xs font-sans text-slate-300 uppercase tracking-wider block font-semibold">
            CO₂ Emissions Saved
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
            {tspSolution.co2SavedKg} <span className="text-sm font-medium text-slate-400">kg</span>
          </div>
          <span className="text-xs font-sans text-slate-400">
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
          <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#38bdf8] uppercase tracking-wider">
              <Anchor className="w-4 h-4" />
              <span>DEPARTURE BASE PORT</span>
            </div>
            <select
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
              className="w-full bg-[#0A0F18] border border-white/[0.15] rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#38bdf8] transition-colors cursor-pointer"
            >
              {BASE_PORTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="text-xs font-sans text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
              <span className="text-white font-bold block mb-1">{selectedBase.name}</span>
              <span className="font-mono text-slate-400">Coordinates: {selectedBase.lat.toFixed(4)}° N, {selectedBase.lon.toFixed(4)}° E</span>
              <p className="text-slate-400 mt-1">{selectedBase.notes}</p>
            </div>
          </div>

          {/* 2. Assigned Cleanup Fleet Card */}
          <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#38bdf8] uppercase tracking-wider">
              <Ship className="w-4 h-4" />
              <span>ASSIGNED CLEANUP FLEET</span>
            </div>
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="w-full bg-[#0A0F18] border border-white/[0.15] rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#38bdf8] transition-colors cursor-pointer"
            >
              {CLEANUP_FLEET.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-400 block text-[11px]">Cruising Speed</span>
                <strong className="text-white font-mono text-sm">{selectedVessel.speedKnots} knots</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-400 block text-[11px]">Consumption</span>
                <strong className="text-emerald-400 font-mono text-sm">
                  {selectedVessel.consumptionPerNM} {selectedVessel.consumptionUnit}/NM
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-400 block text-[11px]">Max Payload</span>
                <strong className="text-white font-mono text-sm">{selectedVessel.maxPayloadKg} kg</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-slate-400 block text-[11px]">Salvage Rate</span>
                <strong className="text-white font-mono text-sm">{selectedVessel.salvageTimePerTargetMin}m / target</strong>
              </div>
            </div>
          </div>

          {/* 3. Subsea Target Selector Checklist */}
          <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#FFB703]" />
                <span>RETRIEVAL TARGETS ({activeTargets.length}/{availableTargets.length})</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-sans">
                <button
                  onClick={handleSelectAll}
                  className="text-[#38bdf8] font-semibold hover:underline cursor-pointer"
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

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {availableTargets.map((t) => {
                const isSelected = selectedTargetIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTarget(t.id)}
                    className={`p-3 rounded-xl border text-sm font-sans cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white/[0.07] border-[#38bdf8]/50 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 accent-[#0284c7] cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-white truncate text-xs sm:text-sm">{t.name}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                            t.type === 'ghost_net'
                              ? 'bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/30'
                              : t.type === 'debris'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {t.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Depth: <strong className="text-white">{t.depthM}m</strong> · Est. Mass: <strong className="text-white">{t.estimatedMassKg} kg</strong>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
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
            {/* Map Top Status Bar with Basemap Switcher */}
            <div className="px-4 sm:px-5 py-3 bg-[#080d16]/95 border-b border-white/[0.08] flex items-center justify-between text-xs font-sans flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
                  TACTICAL MARITIME NAVIGATION MAP
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-300 text-xs hidden sm:inline font-mono">
                  {selectedBase.name.split(' ')[0]} Sector
                </span>
              </div>

              {/* Free Esri Basemap Layer Switcher (Zero API Key, Zero Watermarks) */}
              <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setMapMode('dark_hud')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mapMode === 'dark_hud'
                      ? 'bg-[#0284c7] text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Dark Marine Canvas"
                >
                  Dark Marine
                </button>
                <button
                  onClick={() => setMapMode('bathymetry')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mapMode === 'bathymetry'
                      ? 'bg-[#0284c7] text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Esri Ocean Bathymetry"
                >
                  Ocean Depth
                </button>
                <button
                  onClick={() => setMapMode('satellite')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mapMode === 'satellite'
                      ? 'bg-[#0284c7] text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Esri World Satellite"
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Leaflet Map with 100% Free Public Esri Layers (NO API KEY REQUIRED) */}
            <div className="h-[480px] w-full relative bg-[#05070B]">
              <MapContainer
                center={[selectedBase.lat, selectedBase.lon]}
                zoom={9}
                style={{ height: '100%', width: '100%', background: '#05070B' }}
                zoomControl={true}
              >
                {/* 1. Dark Marine Canvas Mode */}
                {mapMode === 'dark_hud' && (
                  <>
                    <TileLayer
                      key="esri-dark-canvas"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                      attribution="Esri Dark Marine Canvas, OpenStreetMap"
                      maxZoom={16}
                    />
                    <TileLayer
                      key="esri-dark-ref"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                      attribution="Esri Reference"
                      opacity={0.8}
                    />
                  </>
                )}

                {/* 2. Ocean Bathymetry Mode */}
                {mapMode === 'bathymetry' && (
                  <>
                    <TileLayer
                      key="esri-ocean-base"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                      attribution="Esri Ocean Basemap, GEBCO, NOAA"
                      maxZoom={13}
                    />
                    <TileLayer
                      key="esri-ocean-ref"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
                      attribution="GEBCO Oceanic Contours"
                      opacity={0.7}
                    />
                  </>
                )}

                {/* 3. Satellite Mode */}
                {mapMode === 'satellite' && (
                  <>
                    <TileLayer
                      key="esri-sat-base"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="Esri World Imagery, Maxar"
                      maxZoom={18}
                    />
                    <TileLayer
                      key="esri-sat-ref"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                      attribution="Esri Boundaries"
                      opacity={0.8}
                    />
                  </>
                )}

                <MapAutoFitter points={tspSolution.orderedPoints} />

                {/* Base Port Marker */}
                <Marker
                  position={[selectedBase.lat, selectedBase.lon]}
                  icon={createBasePortPin(selectedBase.name.split(' ')[0])}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="font-sans text-xs text-slate-900 p-1">
                      <strong className="block text-sm">{selectedBase.name}</strong>
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
                        <div className="font-sans text-xs text-slate-900 p-1">
                          <strong className="block text-sm">Waypoint #{displayNum}: {t.name}</strong>
                          <div>Depth: <strong>{t.depthM} m</strong> · Mass: <strong>{t.estimatedMassKg} kg</strong></div>
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
                      opacity={0.35}
                    />
                    {/* Foreground dashed line */}
                    <Polyline
                      positions={polylineCoords}
                      color="#38bdf8"
                      weight={3}
                      dashArray="6, 6"
                      opacity={0.95}
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Turn-by-Turn Navigational Legs & Waypoint Table */}
          <div className="subpixel-card rounded-2xl border border-white/[0.08] shadow-lg overflow-hidden">
            <div
              className="px-5 py-4 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between cursor-pointer"
              onClick={() => setIsLegsExpanded((v) => !v)}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#FFB703]" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  TURN-BY-TURN WAYPOINT NAVIGATION SEQUENCE ({tspSolution.legs.length} LEGS)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#38bdf8] font-bold">
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
                <table className="w-full text-left text-sm font-sans">
                  <thead className="bg-white/[0.03] text-slate-300 border-b border-white/[0.08] text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">LEG #</th>
                      <th className="py-3 px-4">WAYPOINT</th>
                      <th className="py-3 px-4">COORDINATES</th>
                      <th className="py-3 px-4 text-right">HEADING</th>
                      <th className="py-3 px-4 text-right">LEG (NM)</th>
                      <th className="py-3 px-4 text-right">TOTAL (NM)</th>
                      <th className="py-3 px-4 text-right">TRANSIT</th>
                      <th className="py-3 px-4">OPERATIONAL ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {tspSolution.legs.map((leg, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] font-mono text-xs">
                            WP-{String(idx + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {leg.to.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                          {leg.to.lat.toFixed(4)}°N, {leg.to.lon.toFixed(4)}°E
                        </td>
                        <td className="py-3 px-4 text-right text-[#FFB703] font-mono font-bold">
                          {leg.bearingDeg}°
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200 font-mono">
                          {leg.distanceNM} NM
                        </td>
                        <td className="py-3 px-4 text-right text-[#38bdf8] font-mono font-bold">
                          {leg.cumulativeNM} NM
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300 font-mono">
                          ~{leg.estMinutes}m
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
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
