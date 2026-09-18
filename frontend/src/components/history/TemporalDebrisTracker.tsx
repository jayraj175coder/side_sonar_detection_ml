import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  Clock,
  Compass,
  Waves,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Anchor,
  ShieldAlert,
  FileText,
  Search,
  Eye,
  RotateCw,
  MapPin,
  Activity,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import {
  TEMPORAL_DEBRIS_RECORDS,
  AcousticFingerprintRecord,
  DebrisLifecycleStatus,
} from '../../data/temporalFingerprintData';

export const TemporalDebrisTracker: React.FC = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(TEMPORAL_DEBRIS_RECORDS[0].id);
  const [statusFilter, setStatusFilter] = useState<'ALL' | DebrisLifecycleStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [diverVerifiedMap, setDiverVerifiedMap] = useState<Record<string, boolean>>({});

  const filteredRecords = useMemo(() => {
    return TEMPORAL_DEBRIS_RECORDS.filter((rec) => {
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.targetName.toLowerCase().includes(q);
        const matchHash = rec.fingerprintHash.toLowerCase().includes(q);
        const matchSector = rec.sector.toLowerCase().includes(q);
        if (!matchName && !matchHash && !matchSector) return false;
      }
      return true;
    });
  }, [statusFilter, searchQuery]);

  const selectedRecord = useMemo(() => {
    return (
      TEMPORAL_DEBRIS_RECORDS.find((r) => r.id === selectedRecordId) ||
      TEMPORAL_DEBRIS_RECORDS[0]
    );
  }, [selectedRecordId]);

  // Counts for status chips
  const counts = useMemo(() => {
    return {
      all: TEMPORAL_DEBRIS_RECORDS.length,
      new: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'NEW').length,
      stillThere: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'STILL_THERE').length,
      moved: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'MOVED').length,
      gone: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'GONE').length,
    };
  }, []);

  const handleToggleVerify = (id: string) => {
    setDiverVerifiedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusBadge = (status: DebrisLifecycleStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            NEW CONTACT
          </span>
        );
      case 'STILL_THERE':
        return (
          <span className="px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/40 text-sky-400 font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
            <Anchor className="w-3 h-3 text-sky-400" />
            STILL THERE // PERSISTENT
          </span>
        );
      case 'MOVED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-[#FFB703]/20 border border-[#FFB703]/50 text-[#FFB703] font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,183,3,0.2)]">
            <Compass className="w-3 h-3 text-[#FFB703] animate-spin-slow" />
            MOVED // DRIFTED
          </span>
        );
      case 'GONE':
        return (
          <span className="px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            GONE // SALVAGED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-mono select-none text-slate-200">
      {/* ── 1. Hero Concept & Pipeline Card ── */}
      <div className="p-5 rounded-2xl subpixel-card border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-[#FFB703]/10 border border-[#FFB703]/30 text-[#FFB703] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-[#FFB703]" />
                MoES Swachh Sagar · Subsea Re-Survey Engine
              </span>
              <span className="text-[10px] text-slate-400">
                UNEP Marine Litter Temporal Tracking Standard
              </span>
            </div>
            <h2 className="text-lg font-black text-white font-sans tracking-tight">
              Acoustic Fingerprinting & Temporal Debris Lifecycle Audit
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Every detected contact is assigned a cryptographic acoustic fingerprint hash. When survey vessels or autonomous AUVs re-visit the sector, our temporal diff engine compares spatial coordinates, shadow length geometry, and backscatter signatures to track whether targets are{' '}
              <span className="text-emerald-400 font-bold">New</span>,{' '}
              <span className="text-sky-400 font-bold">Stationary</span>,{' '}
              <span className="text-[#FFB703] font-bold">Drifting</span> via underwater currents, or{' '}
              <span className="text-purple-400 font-bold">Recovered</span> by salvage teams.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-right">
              <div className="text-[10px] text-slate-400 uppercase">Active Monitored EEZ Targets</div>
              <div className="text-base font-black text-[#FFB703]">
                {counts.all} Fingerprinted Hazards
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Diagram Strip */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              1. New Contact
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Fresh anomaly discovered in latest high-res AUV survey pass.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] text-sky-400 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              2. Still There
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Multi-pass confirmed stationary hazard on rocky or hard substrate.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] text-[#FFB703] font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
              3. Moved / Drifted
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Ghost net or buoyant debris displaced by benthic tidal currents.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              4. Gone / Salvaged
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Verified removed from ocean floor under MoES recovery ops.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Interactive Status Filter Pills ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-white/[0.08] border-[#FFB703] text-white shadow-md'
              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">All Hazards</div>
          <div className="text-xl font-black text-white mt-1 font-sans">{counts.all}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Complete Indian EEZ Index</div>
        </button>

        <button
          onClick={() => setStatusFilter('NEW')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'NEW'
              ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center justify-between">
            <span>New Contacts</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1 font-sans">{counts.new}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Latest Survey Passes</div>
        </button>

        <button
          onClick={() => setStatusFilter('STILL_THERE')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'STILL_THERE'
              ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400 flex items-center justify-between">
            <span>Still There</span>
            <Anchor className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400 mt-1 font-sans">{counts.stillThere}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Stationary Hazard Baseline</div>
        </button>

        <button
          onClick={() => setStatusFilter('MOVED')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'MOVED'
              ? 'bg-[#FFB703]/20 border-[#FFB703] text-white shadow-md'
              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#FFB703] flex items-center justify-between">
            <span>Moved / Drifted</span>
            <Compass className="w-3 h-3 text-[#FFB703]" />
          </div>
          <div className="text-xl font-black text-[#FFB703] mt-1 font-sans">{counts.moved}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Benthic Current Vector</div>
        </button>

        <button
          onClick={() => setStatusFilter('GONE')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'GONE'
              ? 'bg-purple-500/20 border-purple-500 text-white shadow-md'
              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300 flex items-center justify-between">
            <span>Gone / Salvaged</span>
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 mt-1 font-sans">{counts.gone}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Swachh Sagar Recoveries</div>
        </button>
      </div>

      {/* ── 3. Split-Screen Layout: Master List + Interactive Re-Survey Comparator ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fingerprint Master List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#FFB703] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by hash, target name, or EEZ sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703]"
            />
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredRecords.map((rec) => {
              const isSelected = rec.id === selectedRecord.id;
              const isVerified = diverVerifiedMap[rec.id];

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A0F18] border-[#FFB703] shadow-[0_4px_20px_rgba(255,183,3,0.12)]'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-[#FFB703] font-bold">
                      {rec.fingerprintHash}
                    </span>
                    {getStatusBadge(rec.status)}
                  </div>

                  <h3 className="text-xs font-bold text-white font-sans leading-tight">
                    {rec.targetName}
                  </h3>

                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{rec.sector}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Passes: <strong className="text-white font-bold">{rec.surveyPassCount}</strong></span>
                      <span>Depth: <strong className="text-white font-bold">{rec.depthM}m</strong></span>
                    </div>

                    {rec.status === 'MOVED' ? (
                      <span className="text-[#FFB703] font-bold flex items-center gap-0.5">
                        <Compass className="w-2.5 h-2.5" />
                        Drift: +{rec.driftDistanceM}m
                      </span>
                    ) : rec.status === 'STILL_THERE' ? (
                      <span className="text-sky-400 font-bold">Stable (&lt;1m)</span>
                    ) : rec.status === 'GONE' ? (
                      <span className="text-purple-400 font-bold">Salvaged</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Fresh Target</span>
                    )}
                  </div>

                  {isVerified && (
                    <div className="mt-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Audited by Diver / ROV
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Re-Survey Comparator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl subpixel-card border border-white/[0.08] shadow-2xl space-y-5">
            {/* Header Strip */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#FFB703] font-bold">
                    {selectedRecord.fingerprintHash}
                  </span>
                  {getStatusBadge(selectedRecord.status)}
                </div>
                <h2 className="text-base font-black text-white font-sans mt-1">
                  {selectedRecord.targetName}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Sector: <strong className="text-slate-200">{selectedRecord.sector}</strong> · Depth: <strong className="text-[#FFB703]">{selectedRecord.depthM} m</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVerify(selectedRecord.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    diverVerifiedMap[selectedRecord.id]
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.12] text-slate-300'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {diverVerifiedMap[selectedRecord.id] ? 'Verified by ROV/Diver' : 'Log ROV Verification'}
                  </span>
                </button>
              </div>
            </div>

            {/* Description / Lifecycle Summary */}
            <div className="p-3 rounded-xl bg-[#070B12] border border-white/[0.06] text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Temporal Lifecycle Audit: </strong>
                {selectedRecord.statusDescription}
              </div>
            </div>

            {/* ── SIDE-BY-SIDE SURVEY PASS COMPARISON ── */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                <span>Multi-Pass Re-Survey Acoustic Telemetry</span>
                <span className="text-[#FFB703]">{selectedRecord.surveyPassCount} Total Passes Logged</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Baseline Pass (T0) */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-bold">
                      BASELINE PASS #1
                    </span>
                    <span className="text-slate-400">{selectedRecord.baselinePass.surveyDate}</span>
                  </div>

                  <div className="text-xs font-bold text-white">
                    {selectedRecord.baselinePass.surveyVesselOrDrone}
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400 pt-1">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="text-slate-200 font-mono">
                        {selectedRecord.baselinePass.coordinates.lat.toFixed(4)}°N, {selectedRecord.baselinePass.coordinates.lng.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sonar Frequency:</span>
                      <span className="text-slate-200 font-mono">{selectedRecord.baselinePass.sonarFrequencyKhz} kHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Towfish Altitude:</span>
                      <span className="text-slate-200 font-mono">{selectedRecord.baselinePass.towfishAltitudeM} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acoustic Backscatter:</span>
                      <span className="text-slate-200 font-mono">{selectedRecord.baselinePass.backscatterDb} dB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shadow Length (Ls):</span>
                      <span className="text-[#FFB703] font-mono">{selectedRecord.baselinePass.shadowLengthM} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculated Elevation (Ht):</span>
                      <span className="text-emerald-400 font-bold font-mono">{selectedRecord.baselinePass.calculatedHeightM} m</span>
                    </div>
                  </div>
                </div>

                {/* Latest Re-Survey Pass (T1) */}
                <div className="p-3.5 rounded-xl bg-[#FFB703]/[0.03] border border-[#FFB703]/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#FFB703]/20 text-[#FFB703] font-bold">
                      RE-SURVEY PASS #{selectedRecord.latestPass.passNumber} (LATEST)
                    </span>
                    <span className="text-slate-400">{selectedRecord.latestPass.surveyDate}</span>
                  </div>

                  <div className="text-xs font-bold text-white">
                    {selectedRecord.latestPass.surveyVesselOrDrone}
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400 pt-1">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="text-slate-200 font-mono">
                        {selectedRecord.latestPass.coordinates.lat.toFixed(4)}°N, {selectedRecord.latestPass.coordinates.lng.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sonar Frequency:</span>
                      <span className="text-slate-200 font-mono">{selectedRecord.latestPass.sonarFrequencyKhz} kHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Towfish Altitude:</span>
                      <span className="text-slate-200 font-mono">{selectedRecord.latestPass.towfishAltitudeM} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acoustic Backscatter:</span>
                      <span className="text-slate-200 font-mono">{selectedRecord.latestPass.backscatterDb} dB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shadow Length (Ls):</span>
                      <span className="text-[#FFB703] font-mono">{selectedRecord.latestPass.shadowLengthM} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculated Elevation (Ht):</span>
                      <span className="text-emerald-400 font-bold font-mono">{selectedRecord.latestPass.calculatedHeightM} m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BENTHIC DRIFT / DISPLACEMENT RADAR ── */}
            {selectedRecord.status === 'MOVED' && (
              <div className="p-3.5 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FFB703] font-bold flex items-center gap-1.5">
                    <Compass className="w-4 h-4 animate-spin-slow text-[#FFB703]" />
                    Benthic Current Drift Delta Vector
                  </span>
                  <span className="text-white font-mono font-bold">
                    +{selectedRecord.driftDistanceM} m @ {selectedRecord.driftBearingDeg}°
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400">Drift Velocity:</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedRecord.driftVelocityKt} knots
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                    <span className="text-slate-400">Subsea Current Alignment:</span>
                    <div className="text-xs font-bold text-[#FFB703] font-mono mt-0.5 truncate">
                      {selectedRecord.benthicCurrentVector}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PHYSICAL ACOUSTIC PROFILE ── */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                <span>Trigonometric Sonar Shadow Geometry</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {(selectedRecord.acousticConfidence * 100).toFixed(1)}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                  <div className="text-[9px] text-slate-400">Target Length</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">
                    {selectedRecord.estimatedLengthM} m
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                  <div className="text-[9px] text-slate-400">Target Width</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">
                    {selectedRecord.estimatedWidthM} m
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
                  <div className="text-[9px] text-slate-400">Shadow Height (Ht)</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedRecord.estimatedHeightM} m
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 text-center font-mono">
                Formula: Ht = (Ls · Ha) / (R + Ls) — Calculated from Towfish Altitude ({selectedRecord.latestPass.towfishAltitudeM}m) & Acoustic Shadow
              </div>
            </div>

            {/* ── MoES SWACHH SAGAR REMEDIATION & SALVAGE ── */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase font-bold">MoES Swachh Sagar Remediation</span>
                {selectedRecord.salvageTicketId && (
                  <span className="text-[#FFB703] font-mono font-bold">{selectedRecord.salvageTicketId}</span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedRecord.actionRecommendation}
              </p>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/[0.06]">
                <span>Triage Desk: <strong className="text-slate-200">{selectedRecord.verifiedBy || 'INCOIS'}</strong></span>
                <span className="flex items-center gap-1">
                  Risk Index:
                  <strong className={`font-mono font-bold ${
                    selectedRecord.environmentalRiskScore > 80
                      ? 'text-red-400'
                      : selectedRecord.environmentalRiskScore > 50
                      ? 'text-[#FFB703]'
                      : 'text-emerald-400'
                  }`}>
                    {selectedRecord.environmentalRiskScore}/100
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
