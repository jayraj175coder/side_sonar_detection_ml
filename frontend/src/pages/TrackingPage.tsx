import React, { useState } from 'react';
import {
  Activity, Clock, MapPin, AlertTriangle, CheckCircle2,
  ArrowRight, Target, Compass, Radio, Eye, ChevronDown, ChevronUp,
} from 'lucide-react';
import { TEMPORAL_DEBRIS_RECORDS, AcousticFingerprintRecord, DebrisLifecycleStatus } from '../data/temporalFingerprintData';

/* ─── Status Configuration ──────────────────────────────────────────────── */
const STATUS_CONFIG: Record<DebrisLifecycleStatus, {
  label: string; color: string; bgColor: string; borderColor: string; dotColor: string; description: string;
}> = {
  NEW:        { label: 'NEW',        color: 'text-amber-400',   bgColor: 'bg-amber-400/10',   borderColor: 'border-amber-400/30',   dotColor: 'bg-amber-400',   description: 'First detected in latest survey pass' },
  STILL_THERE:{ label: 'STILL THERE', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/30', dotColor: 'bg-emerald-400', description: 'Contact confirmed stationary across surveys' },
  MOVED:      { label: 'MOVED',      color: 'text-[#38BDF8]',   bgColor: 'bg-sky-400/10',     borderColor: 'border-sky-400/30',     dotColor: 'bg-sky-400',     description: 'Displacement detected via benthic drift analysis' },
  GONE:       { label: 'GONE',       color: 'text-slate-400',   bgColor: 'bg-white/[0.04]',   borderColor: 'border-white/[0.1]',   dotColor: 'bg-slate-600',   description: 'Contact verified absent — cleared or dissolved' },
};

const CLASS_COLORS: Record<string, string> = {
  GHOST_NET:      '#FFB703',
  DEBRIS:         '#F59E0B',
  PIPELINE_HAZARD:'#38BDF8',
  SEABED_ANOMALY: '#94A3B8',
};

/* ─── Lifecycle Track Dot ───────────────────────────────────────────────── */
const LifecycleDot: React.FC<{ status: DebrisLifecycleStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status];
  const dim = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const glow = status === 'NEW' ? 'shadow-[0_0_8px_rgba(251,191,36,0.8)]' : status === 'MOVED' ? 'shadow-[0_0_8px_rgba(56,189,248,0.7)]' : '';
  return <span className={`inline-block rounded-full ${dim} ${cfg.dotColor} ${glow} shrink-0`} />;
};

/* ─── Survey Pass Timeline ──────────────────────────────────────────────── */
const SurveyTimeline: React.FC<{ record: AcousticFingerprintRecord }> = ({ record }) => {
  const passes = record.surveyPassCount;
  // Build a simplified pass sequence
  const passStatuses = (): DebrisLifecycleStatus[] => {
    const arr: DebrisLifecycleStatus[] = [];
    for (let i = 0; i < passes; i++) {
      if (i === 0) arr.push('NEW');
      else if (record.status === 'GONE' && i === passes - 1) arr.push('GONE');
      else if (record.status === 'MOVED' && i === passes - 1) arr.push('MOVED');
      else arr.push('STILL_THERE');
    }
    return arr;
  };
  const statuses = passStatuses();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {statuses.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        return (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-mono font-bold ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`}>
              <LifecycleDot status={s} size="sm" />
              <span>SV-{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[8px] font-normal text-slate-400">{cfg.label}</span>
            </div>
            {i < statuses.length - 1 && (
              <ArrowRight className="w-3 h-3 text-slate-700 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Target Record Card ────────────────────────────────────────────────── */
const TargetCard: React.FC<{ record: AcousticFingerprintRecord }> = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[record.status];
  const classColor = CLASS_COLORS[record.targetClass] || '#FFB703';

  return (
    <div className={`subpixel-card rounded-xl border ${cfg.borderColor} overflow-hidden transition-all`}>
      {/* Card Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer ${cfg.bgColor} hover:opacity-90 transition-opacity`}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <LifecycleDot status={record.status} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-black text-white">{record.fingerprintHash}</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]" style={{ color: classColor }}>
                {record.targetClassLabel}
              </span>
            </div>
            <div className="text-[11px] text-white font-medium mt-0.5 truncate">{record.targetName}</div>
            <div className="text-[9px] text-slate-400 font-mono truncate">{record.sector}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Risk score */}
          <div className="text-center hidden sm:block">
            <div className="text-[8px] text-slate-500 font-mono uppercase">ENV RISK</div>
            <div className={`text-base font-mono font-black ${record.environmentalRiskScore >= 80 ? 'text-rose-400' : record.environmentalRiskScore >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {record.environmentalRiskScore}
            </div>
          </div>
          {/* Passes */}
          <div className="text-center hidden sm:block">
            <div className="text-[8px] text-slate-500 font-mono uppercase">PASSES</div>
            <div className="text-base font-mono font-black text-white">{record.surveyPassCount}</div>
          </div>
          {/* Confidence */}
          <div className="text-center hidden md:block">
            <div className="text-[8px] text-slate-500 font-mono uppercase">ACOUSTIC CONF</div>
            <div className="text-base font-mono font-black text-[#FFB703]">{(record.acousticConfidence * 100).toFixed(0)}%</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-4 border-t border-white/[0.06]">
          {/* Survey Lifecycle Timeline */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#FFB703]" />
              MULTI-SURVEY LIFECYCLE TRACK
            </div>
            <SurveyTimeline record={record} />
          </div>

          {/* Status description */}
          <div className={`p-3 rounded-lg border ${cfg.borderColor} ${cfg.bgColor}`}>
            <div className="text-[9px] font-mono text-slate-400 uppercase mb-1">STATUS DETAIL</div>
            <div className={`text-[11px] font-medium ${cfg.color}`}>{record.statusDescription}</div>
          </div>

          {/* Acoustic Fingerprint Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px] font-mono">
            <div className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-0.5">
              <div className="text-[8px] text-slate-500 uppercase">Depth</div>
              <div className="text-white font-bold">{record.depthM} m</div>
            </div>
            <div className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-0.5">
              <div className="text-[8px] text-slate-500 uppercase">Est. Length</div>
              <div className="text-white font-bold">{record.estimatedLengthM} m</div>
            </div>
            <div className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-0.5">
              <div className="text-[8px] text-slate-500 uppercase">Drift Distance</div>
              <div className={`font-bold ${record.driftDistanceM > 10 ? 'text-[#38BDF8]' : 'text-white'}`}>
                {record.driftDistanceM} m
              </div>
            </div>
            <div className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-0.5">
              <div className="text-[8px] text-slate-500 uppercase">Drift Bearing</div>
              <div className="text-white font-bold">{record.driftBearingDeg}°</div>
            </div>
          </div>

          {/* Baseline vs Latest Pass */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2">
              <div className="text-[9px] font-mono text-slate-400 uppercase font-bold">📡 BASELINE PASS (SV-01)</div>
              <div className="space-y-1 text-[10px] font-mono text-slate-300">
                <div className="text-[9px] text-slate-500">{record.baselinePass.surveyDate}</div>
                <div>Frequency: <span className="text-white font-bold">{record.baselinePass.sonarFrequencyKhz} kHz</span></div>
                <div>Backscatter: <span className="text-white font-bold">{record.baselinePass.backscatterDb} dB</span></div>
                <div>Shadow: <span className="text-white font-bold">{record.baselinePass.shadowLengthM} m</span></div>
                <div>Calc. Height: <span className="text-[#FFB703] font-bold">{record.baselinePass.calculatedHeightM} m</span></div>
                <div className="text-[9px] text-slate-400">Lat: {record.baselinePass.coordinates.lat.toFixed(4)}° N, {record.baselinePass.coordinates.lng.toFixed(4)}° E</div>
              </div>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2">
              <div className="text-[9px] font-mono text-slate-400 uppercase font-bold">📡 LATEST PASS (SV-{String(record.surveyPassCount).padStart(2, '0')})</div>
              <div className="space-y-1 text-[10px] font-mono text-slate-300">
                <div className="text-[9px] text-slate-500">{record.latestPass.surveyDate}</div>
                <div>Frequency: <span className="text-white font-bold">{record.latestPass.sonarFrequencyKhz} kHz</span></div>
                <div>Backscatter: <span className="text-white font-bold">{record.latestPass.backscatterDb} dB</span></div>
                <div>Shadow: <span className="text-white font-bold">{record.latestPass.shadowLengthM} m</span></div>
                <div>Calc. Height: <span className="text-[#FFB703] font-bold">{record.latestPass.calculatedHeightM} m</span></div>
                <div className="text-[9px] text-slate-400">Lat: {record.latestPass.coordinates.lat.toFixed(4)}° N, {record.latestPass.coordinates.lng.toFixed(4)}° E</div>
              </div>
            </div>
          </div>

          {/* Benthic Current */}
          <div className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-center gap-2 text-[10px] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <div>
              <span className="text-slate-400 text-[9px] block uppercase">Benthic Current Vector</span>
              <span className="text-slate-200">{record.benthicCurrentVector}</span>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-3 bg-[#FFB703]/[0.06] border border-[#FFB703]/25 rounded-xl space-y-1">
            <div className="text-[9px] font-mono text-[#FFB703] uppercase font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              MoES ACTION RECOMMENDATION
            </div>
            <div className="text-[11px] text-slate-200 leading-relaxed">{record.actionRecommendation}</div>
            {record.salvageTicketId && (
              <div className="text-[9px] font-mono text-slate-400">Ticket: <span className="text-slate-200">{record.salvageTicketId}</span></div>
            )}
            {record.verifiedBy && (
              <div className="text-[9px] font-mono text-slate-400">Verified by: <span className="text-slate-200">{record.verifiedBy}</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Tracking Page ──────────────────────────────────────────────────────── */
export const TrackingPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<DebrisLifecycleStatus | 'ALL'>('ALL');

  const statusCounts = {
    NEW:         TEMPORAL_DEBRIS_RECORDS.filter(r => r.status === 'NEW').length,
    STILL_THERE: TEMPORAL_DEBRIS_RECORDS.filter(r => r.status === 'STILL_THERE').length,
    MOVED:       TEMPORAL_DEBRIS_RECORDS.filter(r => r.status === 'MOVED').length,
    GONE:        TEMPORAL_DEBRIS_RECORDS.filter(r => r.status === 'GONE').length,
  };

  const filtered = filterStatus === 'ALL'
    ? TEMPORAL_DEBRIS_RECORDS
    : TEMPORAL_DEBRIS_RECORDS.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6 font-sans select-none text-slate-100">
      {/* Header Banner */}
      <div className="p-5 subpixel-card rounded-2xl border border-white/[0.08] space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FFB703]" />
              <h1 className="text-xl font-mono font-black text-white tracking-tight">
                TEMPORAL TARGET TRACKING
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                DEMO TELEMETRY
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 max-w-2xl">
              Acoustic Fingerprint (AFP) lifecycle tracking across multi-epoch side-scan sonar surveys. Each contact is
              assigned a unique hash and re-evaluated per survey pass to detect movement, persistence, or clearance.
              All records shown are demonstration data. Real tracking requires multi-survey ONNX inference runs.
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(statusCounts) as [DebrisLifecycleStatus, number][]).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${cfg.bgColor} ${cfg.borderColor} hover:opacity-80 ${filterStatus === status ? 'ring-2 ring-offset-1 ring-offset-[#05070B] ring-current' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <LifecycleDot status={status} />
                  <span className={`text-[9px] font-mono font-black uppercase ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className={`text-2xl font-mono font-black ${cfg.color}`}>{count}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{cfg.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className="text-slate-400 uppercase">Filter:</span>
        {(['ALL', 'NEW', 'STILL_THERE', 'MOVED', 'GONE'] as (DebrisLifecycleStatus | 'ALL')[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              filterStatus === s
                ? 'bg-[#FFB703]/10 border-[#FFB703]/30 text-[#FFB703] font-bold'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            {s === 'STILL_THERE' ? 'STILL THERE' : s}
            {s !== 'ALL' && ` (${statusCounts[s as DebrisLifecycleStatus]})`}
          </button>
        ))}
        <span className="ml-auto text-slate-500">{filtered.length} of {TEMPORAL_DEBRIS_RECORDS.length} records shown</span>
      </div>

      {/* How Tracking Works Banner */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
        <div className="text-[9px] font-mono text-[#FFB703] font-bold uppercase mb-2 flex items-center gap-1">
          <Eye className="w-3 h-3" /> HOW ACOUSTIC FINGERPRINTING WORKS
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: '1. SURVEY PASS', desc: 'AUV/SSS waterfall acquired' },
            { label: '2. ONNX DETECT', desc: 'YOLOv8s bounding box' },
            { label: '3. HASH MATCH', desc: 'AFP-XXXX fingerprint assigned' },
            { label: '4. COMPARE', desc: 'Coordinate delta vs prior pass' },
            { label: '5. LIFECYCLE', desc: 'NEW / STILL THERE / MOVED / GONE' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className="text-center">
                <div className="text-[9px] font-mono font-bold text-[#FFB703]">{step.label}</div>
                <div className="text-[8px] text-slate-400 font-mono">{step.desc}</div>
              </div>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-sm">
            No records match the selected filter.
          </div>
        ) : (
          filtered.map(record => <TargetCard key={record.id} record={record} />)
        )}
      </div>
    </div>
  );
};
