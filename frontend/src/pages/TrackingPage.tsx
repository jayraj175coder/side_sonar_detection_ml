import React, { useState, useMemo } from 'react';
import {
  Activity,
  Clock,
  Compass,
  Radio,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Waves,
  Sparkles,
  Layers,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Target,
  Zap,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Download,
  Share2,
  Cpu,
  Search,
} from 'lucide-react';
import {
  TEMPORAL_DEBRIS_RECORDS,
  AcousticFingerprintRecord,
  DebrisLifecycleStatus,
} from '../data/temporalFingerprintData';

/* ─── Status Configuration ──────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  DebrisLifecycleStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    dotColor: string;
    description: string;
  }
> = {
  NEW: {
    label: 'NEW CONTACT',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/40',
    badgeBg: 'bg-amber-400 text-slate-950',
    dotColor: 'bg-amber-400',
    description: 'First detected in latest survey pass. Zero prior survey records.',
  },
  STILL_THERE: {
    label: 'STATIONARY / MOORED',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/40',
    badgeBg: 'bg-emerald-400 text-slate-950',
    dotColor: 'bg-emerald-400',
    description: 'Stationary on hard seabed (< 0.8m shift across multi-epoch sweeps).',
  },
  MOVED: {
    label: 'ACTIVE DRIFT',
    color: 'text-[#FFB703]',
    bgColor: 'bg-[#FFB703]/10',
    borderColor: 'border-[#FFB703]/40',
    badgeBg: 'bg-[#FFB703] text-slate-950',
    dotColor: 'bg-[#FFB703]',
    description: 'Displacement detected via benthic tidal currents along the continental shelf.',
  },
  GONE: {
    label: 'SALVAGED / CLEARED',
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/40',
    badgeBg: 'bg-sky-400 text-slate-950',
    dotColor: 'bg-sky-400',
    description: 'Confirmed absent in follow-up sweep. Cleared by MoES recovery team.',
  },
};

export const TrackingPage: React.FC = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>('afp-01');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DebrisLifecycleStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [forecastHours, setForecastHours] = useState<number>(24);
  const [simulatedCurrentKts, setSimulatedCurrentKts] = useState<number>(0.68);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    return TEMPORAL_DEBRIS_RECORDS.filter((r) => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesQuery =
        !searchQuery ||
        r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fingerprintHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [statusFilter, searchQuery]);

  // Selected Record
  const activeRecord = useMemo(() => {
    return (
      TEMPORAL_DEBRIS_RECORDS.find((r) => r.id === selectedRecordId) ||
      TEMPORAL_DEBRIS_RECORDS[0]
    );
  }, [selectedRecordId]);

  const cfg = STATUS_CONFIG[activeRecord.status];

  // Dynamic Kinematic Drift Calculations
  // Baseline speed = driftVelocityKt or ~0.04 kts.
  const driftRateMPerHr = (simulatedCurrentKts * 1852 * 0.05); // Subsea bottom drag reduces drift
  const projectedDriftM = activeRecord.status === 'MOVED'
    ? Number((activeRecord.driftDistanceM + driftRateMPerHr * forecastHours).toFixed(1))
    : activeRecord.driftDistanceM;

  const currentBearing = activeRecord.driftBearingDeg || 50;
  // Polar offsets for radar visualization (scaled to 120px radius)
  const radarScale = 0.55; // pixels per meter
  const currentDx = Math.sin((currentBearing * Math.PI) / 180) * activeRecord.driftDistanceM * radarScale;
  const currentDy = -Math.cos((currentBearing * Math.PI) / 180) * activeRecord.driftDistanceM * radarScale;

  const futureDx = Math.sin((currentBearing * Math.PI) / 180) * projectedDriftM * radarScale;
  const futureDy = -Math.cos((currentBearing * Math.PI) / 180) * projectedDriftM * radarScale;

  // Intercept Vector for ROV
  const rovSpeedKts = 2.4;
  const timeToInterceptHrs = activeRecord.status === 'MOVED'
    ? Number((projectedDriftM / (rovSpeedKts * 1852)).toFixed(2))
    : 0.25;

  const handleActionClick = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans select-none text-slate-100 pb-16">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER: SUBSEA TARGET DRIFT & ACOUSTIC RE-IDENTIFICATION CONSOLE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#070D18] border border-white/[0.08] shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FFB703]/10 border border-[#FFB703]/30 text-[#FFB703]">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-xl font-display font-black text-white tracking-wide uppercase">
              Subsea Target Drift & Acoustic Re-ID Laboratory
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-white/[0.04] border border-white/[0.08] text-slate-400">
              MoES // TEMPORAL RECON
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-epoch acoustic sonogram correlation, benthic current kinematic modeling &amp; ghost net drift trajectory forecasting.
          </p>
        </div>

        {/* Live Operational Metric Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Tracked Targets</div>
            <div className="text-sm font-mono font-bold text-white">4 Contacts</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/30 text-center">
            <div className="text-[10px] font-mono text-[#FFB703] font-bold uppercase">Active Drifting</div>
            <div className="text-sm font-mono font-bold text-[#FFB703]">1 Ghost Net</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Re-ID Neural Match</div>
            <div className="text-sm font-mono font-bold text-emerald-400">94.2% Cosine</div>
          </div>
        </div>
      </div>

      {/* Action Notification Alert Bar */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/50 text-sky-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN TACTICAL SPLIT:
          LEFT: Target Selector Queue (30%)
          RIGHT: Acoustic Re-ID Laboratory & Hydrodynamic Drift Predictor (70%)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: FINGERPRINT DATABASE (xl:col-span-4) ──────────── */}
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#070D18] border border-white/[0.08] p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#FFB703]" />
                Temporal Acoustic Tracks
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {filteredRecords.length} / {TEMPORAL_DEBRIS_RECORDS.length} ACTIVE
              </span>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
              {(['ALL', 'MOVED', 'STILL_THERE', 'GONE', 'NEW'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white/[0.1] border-white/30 text-white font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'ALL (4)' : st === 'MOVED' ? 'DRIFTING' : st === 'STILL_THERE' ? 'STATIONARY' : st === 'GONE' ? 'CLEARED' : 'NEW'}
                </button>
              ))}
            </div>

            {/* Track Records List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredRecords.map((r) => {
                const s = STATUS_CONFIG[r.status];
                const isSelected = r.id === selectedRecordId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecordId(r.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#0A1220] border-[#FFB703] shadow-[0_0_15px_rgba(255,183,3,0.15)] ring-1 ring-[#FFB703]/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-[#FFB703] tracking-wide">
                        {r.fingerprintHash}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${s.badgeBg}`}>
                        {s.label}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white group-hover:text-[#FFB703] transition-colors leading-snug">
                      {r.targetName}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[10.5px] font-mono text-slate-400">
                      <span>{r.sector.split('·')[0]}</span>
                      {r.status === 'MOVED' ? (
                        <span className="text-[#FFB703] font-bold">+{r.driftDistanceM}m shift</span>
                      ) : r.status === 'GONE' ? (
                        <span className="text-sky-400 font-bold">Salvaged</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Stationary</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: MULTI-EPOCH ACOUSTIC LAB & DRIFT SIMULATOR (xl:col-span-8) ── */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. MULTI-EPOCH ACOUSTIC SONOGRAM COMPARISON */}
          <div className="rounded-2xl bg-[#070D18] border border-white/[0.08] p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#38BDF8] tracking-widest uppercase">
                  MULTI-EPOCH ACOUSTIC MORPHOMETRY
                </span>
                <h3 className="text-base font-display font-bold text-white">
                  {activeRecord.targetName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-mono text-slate-400">
                  Sector: <span className="text-slate-200">{activeRecord.sector}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  Depth: {activeRecord.depthM} m
                </span>
              </div>
            </div>

            {/* Side-by-Side Acoustic Sonogram Passes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Epoch 1: Baseline Pass */}
              <div className="rounded-xl border border-white/[0.1] bg-[#03070E] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    EPOCH 01 (BASELINE)
                  </span>
                  <span className="text-slate-500">{activeRecord.baselinePass.surveyDate.split(' ')[0]}</span>
                </div>

                {/* Simulated Acoustic Sonogram Display */}
                <div className="relative h-44 rounded-lg bg-[#0A0E17] border border-amber-900/40 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-amber-950/40 to-[#040810]" />
                  {/* Acoustic Scanline Noise Grid */}
                  <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,183,3,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
                  
                  {/* Acoustic Target Highlight Box */}
                  <div className="relative border-2 border-[#FFB703] bg-[#FFB703]/20 rounded p-2 text-center shadow-[0_0_15px_rgba(255,183,3,0.3)]">
                    <div className="w-16 h-10 border border-dashed border-[#FFB703]/80 rounded flex items-center justify-center text-[10px] font-mono font-bold text-[#FFB703]">
                      TARGET
                    </div>
                    <div className="text-[9px] font-mono text-slate-300 mt-1">L: {activeRecord.estimatedLengthM}m</div>
                  </div>

                  {/* Acoustic Shadow Projection */}
                  <div className="absolute bottom-6 right-16 w-20 h-6 bg-black/80 blur-xs rounded-full border border-black/40" />

                  {/* Frequency Overlay */}
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.08]">
                    {activeRecord.baselinePass.sonarFrequencyKhz} kHz · Towfish {activeRecord.baselinePass.towfishAltitudeM}m
                  </div>
                </div>

                {/* Acoustic Sounding Metrics */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    <div className="text-slate-500">Backscatter</div>
                    <div className="text-slate-200 font-bold">{activeRecord.baselinePass.backscatterDb} dB</div>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    <div className="text-slate-500">Shadow</div>
                    <div className="text-slate-200 font-bold">{activeRecord.baselinePass.shadowLengthM} m</div>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    <div className="text-slate-500">Acoustic Hgt</div>
                    <div className="text-slate-200 font-bold">{activeRecord.baselinePass.calculatedHeightM} m</div>
                  </div>
                </div>
              </div>

              {/* Epoch 3: Current Pass */}
              <div className="rounded-xl border border-[#FFB703]/40 bg-[#03070E] p-3.5 space-y-2.5 ring-1 ring-[#FFB703]/20">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#FFB703] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-pulse" />
                    EPOCH 03 (LATEST SWEEP)
                  </span>
                  <span className="text-[#FFB703]">{activeRecord.latestPass.surveyDate.split(' ')[0]}</span>
                </div>

                {/* Simulated Latest Sonogram Display */}
                <div className="relative h-44 rounded-lg bg-[#0A0E17] border border-amber-900/60 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/30 via-amber-950/50 to-[#040810]" />
                  <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,183,3,0.15)_1px,transparent_1px)] bg-[size:100%_4px]" />
                  
                  {activeRecord.status === 'GONE' ? (
                    <div className="text-center p-3 rounded bg-emerald-500/10 border border-emerald-500/40">
                      <div className="text-emerald-400 font-mono font-bold text-xs">SEABED CLEARED</div>
                      <div className="text-[9.5px] text-slate-400 font-mono mt-1">Zero Acoustic Shadow return logged</div>
                    </div>
                  ) : (
                    <>
                      {/* Target Displaced or Stationary */}
                      <div className="relative translate-x-4 border-2 border-emerald-400 bg-emerald-500/20 rounded p-2 text-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                        <div className="w-16 h-10 border border-dashed border-emerald-400/80 rounded flex items-center justify-center text-[10px] font-mono font-bold text-emerald-300">
                          VERIFIED
                        </div>
                        <div className="text-[9px] font-mono text-slate-200 mt-1">Shift: +{activeRecord.driftDistanceM}m</div>
                      </div>

                      {/* Deformed shadow */}
                      <div className="absolute bottom-5 right-12 w-16 h-5 bg-black/85 blur-xs rounded-full border border-black/40" />
                    </>
                  )}

                  <div className="absolute top-2 left-2 text-[9px] font-mono text-[#FFB703] bg-black/60 px-1.5 py-0.5 rounded border border-[#FFB703]/30">
                    {activeRecord.latestPass.sonarFrequencyKhz} kHz · Towfish {activeRecord.latestPass.towfishAltitudeM}m
                  </div>

                  <div className="absolute top-2 right-2 text-[9px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                    Re-ID: {(activeRecord.acousticConfidence * 100).toFixed(1)}% Match
                  </div>
                </div>

                {/* Acoustic Sounding Metrics */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    <div className="text-slate-500">Backscatter</div>
                    <div className="text-emerald-400 font-bold">{activeRecord.latestPass.backscatterDb} dB</div>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    <div className="text-slate-500">Shadow</div>
                    <div className="text-slate-200 font-bold">{activeRecord.latestPass.shadowLengthM} m</div>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                    <div className="text-slate-500">Acoustic Hgt</div>
                    <div className="text-slate-200 font-bold">{activeRecord.latestPass.calculatedHeightM} m</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Re-ID Cosine Metric Bar */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4 text-[#FFB703]" />
                <span>Feature Vector Re-ID Embedding:</span>
                <span className="font-bold text-white">YOLOv8s Latent Metric Space</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  Displacement: <strong className="text-white">+{activeRecord.driftDistanceM} m</strong>
                </span>
                <span className="text-slate-400">
                  Bearing: <strong className="text-white">{activeRecord.driftBearingDeg}° NE</strong>
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Status: {cfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* 2. HYDRODYNAMIC POLAR RADAR DRIFT PREDICTOR (NO MAP!) */}
          <div className="rounded-2xl bg-[#070D18] border border-white/[0.08] p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FFB703] tracking-widest uppercase">
                  KINEMATIC DRIFT &amp; TIDAL CURRENT PREDICTOR
                </span>
                <h3 className="text-base font-display font-bold text-white">
                  Hydrodynamic Dispersion &amp; Trajectory Forecast
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#FFB703] font-bold">
                  Benthic Current: {simulatedCurrentKts.toFixed(2)} kts @ {currentBearing}°
                </span>
              </div>
            </div>

            {/* Polar Radar Display Grid + Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Polar Radar Screen (7 cols) */}
              <div className="lg:col-span-7 relative h-72 rounded-2xl bg-[#040810] border border-white/[0.1] overflow-hidden flex items-center justify-center p-4">
                {/* Polar Circles */}
                <div className="absolute w-60 h-60 rounded-full border border-white/[0.05]" />
                <div className="absolute w-44 h-44 rounded-full border border-white/[0.08]" />
                <div className="absolute w-28 h-28 rounded-full border border-white/[0.12]" />
                <div className="absolute w-12 h-12 rounded-full border border-white/[0.18]" />

                {/* Crosshairs */}
                <div className="absolute inset-x-0 h-px bg-white/[0.08]" />
                <div className="absolute inset-y-0 w-px bg-white/[0.08]" />

                {/* Compass Cardinal Labels */}
                <span className="absolute top-2 font-mono text-[9px] text-slate-500 font-bold">000° N</span>
                <span className="absolute bottom-2 font-mono text-[9px] text-slate-500 font-bold">180° S</span>
                <span className="absolute right-3 font-mono text-[9px] text-slate-500 font-bold">090° E</span>
                <span className="absolute left-3 font-mono text-[9px] text-slate-500 font-bold">270° W</span>

                {/* Distance Ring Tags */}
                <span className="absolute top-[32%] right-6 font-mono text-[8px] text-slate-600">50m</span>
                <span className="absolute top-[20%] right-3 font-mono text-[8px] text-slate-600">100m</span>

                {/* Origin Marker (Epoch 01) */}
                <div className="absolute z-10 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-400 border-2 border-slate-900 shadow-md" />
                  <span className="text-[8px] font-mono text-slate-400 bg-black/60 px-1 rounded mt-0.5">T=0d (Origin)</span>
                </div>

                {/* Verified Current Position (Epoch 03) */}
                {activeRecord.status !== 'GONE' && (
                  <div
                    className="absolute z-20 flex flex-col items-center transition-all duration-500"
                    style={{
                      transform: `translate(${currentDx}px, ${currentDy}px)`,
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FFB703] border-2 border-slate-900 shadow-[0_0_12px_rgba(255,183,3,0.8)] animate-pulse" />
                    <span className="text-[8px] font-mono text-[#FFB703] bg-black/70 px-1 rounded mt-0.5 whitespace-nowrap">
                      Current (+{activeRecord.driftDistanceM}m)
                    </span>
                  </div>
                )}

                {/* Forecasted Position Cone (T + forecastHours) */}
                {activeRecord.status === 'MOVED' && (
                  <>
                    {/* Trajectory Vector Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${futureDx}px)`}
                        y2={`calc(50% + ${futureDy}px)`}
                        stroke="#00F5D4"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        className="animate-pulse"
                      />
                    </svg>

                    {/* Uncertainty Ellipse */}
                    <div
                      className="absolute z-15 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/50 pointer-events-none transition-all duration-300"
                      style={{
                        width: `${Math.max(28, forecastHours * 1.2)}px`,
                        height: `${Math.max(20, forecastHours * 0.8)}px`,
                        transform: `translate(${futureDx}px, ${futureDy}px) rotate(${currentBearing}deg)`,
                      }}
                    />

                    {/* Projected Target Pin */}
                    <div
                      className="absolute z-30 flex flex-col items-center transition-all duration-300"
                      style={{
                        transform: `translate(${futureDx}px, ${futureDy}px)`,
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#00F5D4] border-2 border-slate-900 shadow-[0_0_15px_rgba(0,245,212,0.9)]" />
                      <span className="text-[8px] font-mono text-[#00F5D4] bg-black/80 px-1 rounded mt-0.5 whitespace-nowrap font-bold">
                        +{forecastHours}h Forecast (+{projectedDriftM}m)
                      </span>
                    </div>
                  </>
                )}

                {/* Radar Sweep Animation Line */}
                <div className="absolute inset-0 rounded-full border border-[#00F5D4]/20 animate-spin origin-center pointer-events-none" style={{ animationDuration: '6s' }}>
                  <div className="w-1/2 h-px bg-gradient-to-r from-transparent to-[#00F5D4]/50" />
                </div>
              </div>

              {/* Dynamic Predictor Sliders & Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Forecast Horizon Slider */}
                  <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00F5D4]" />
                        Time Horizon:
                      </span>
                      <span className="text-[#00F5D4] font-bold text-sm">+{forecastHours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="72"
                      step="6"
                      value={forecastHours}
                      onChange={(e) => setForecastHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 accent-[#00F5D4] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>+6h</span>
                      <span>+24h</span>
                      <span>+48h</span>
                      <span>+72h</span>
                    </div>
                  </div>

                  {/* Current Velocity Adjustment */}
                  <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Waves className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Current Velocity:
                      </span>
                      <span className="text-[#38BDF8] font-bold">{simulatedCurrentKts.toFixed(2)} kts</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.05"
                      value={simulatedCurrentKts}
                      onChange={(e) => setSimulatedCurrentKts(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 accent-[#38BDF8] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Calculated Drift Statistics */}
                  <div className="p-3 rounded-xl bg-[#090E17] border border-white/[0.08] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Projected Total Drift:</span>
                      <span className="text-white font-bold">+{projectedDriftM} m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Current Vector:</span>
                      <span className="text-slate-200">{activeRecord.benthicCurrentVector.split('(')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ROV Intercept ETA:</span>
                      <span className="text-[#00F5D4] font-bold">~{timeToInterceptHrs} hrs @ 2.4 kts</span>
                    </div>
                  </div>
                </div>

                {/* Tactical Dispatch CTA Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleActionClick(`ROV Intercept Course computed: Course ${currentBearing}° at 2.4 kts. Waypoints dispatched to USV-04 navigation bus.`)}
                    className="p-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0284c7]/80 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Compute ROV Intercept</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(`NAVTEX Subsea Navigation Hazard advisory broadcast for sector: ${activeRecord.sector}.`)}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FFB703]" />
                    <span>Issue NAVTEX Alert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. PHYSICAL EVIDENCE, SALVAGE TICKET & ENVIRONMENTAL THREAT INDEX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#070D18] border border-white/[0.08] p-4 space-y-2.5 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                MoES Remediation Directive
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeRecord.actionRecommendation}
              </p>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Ticket:</span>
                <span className="text-[#FFB703] font-bold">{activeRecord.salvageTicketId || 'PENDING'}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#070D18] border border-white/[0.08] p-4 space-y-2.5 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Environmental &amp; Navigation Threat
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-mono font-bold text-lg text-red-400">
                  {activeRecord.environmentalRiskScore}
                </div>
                <div className="text-xs text-slate-400 font-sans leading-tight">
                  <div className="text-white font-semibold">Coral Reef &amp; Vessel Hazard</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">High probability of marine mammal entanglement and propeller fouling.</div>
                </div>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Verified By:</span>
                <span className="text-slate-200">{activeRecord.verifiedBy || 'MoES Taskforce'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
