import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Activity,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target,
  Compass,
  Radio,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Waves,
  Sparkles,
  Layers,
  FileCheck,
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
    label: 'STILL THERE',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/40',
    badgeBg: 'bg-emerald-400 text-slate-950',
    dotColor: 'bg-emerald-400',
    description: 'Contact verified stationary on seabed (< 0.8m shift across multi-epoch sweeps).',
  },
  MOVED: {
    label: 'MOVED / DRIFTING',
    color: 'text-[#38BDF8]',
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/40',
    badgeBg: 'bg-sky-400 text-slate-950',
    dotColor: 'bg-sky-400',
    description: 'Displacement detected via benthic tidal currents along the continental shelf.',
  },
  GONE: {
    label: 'CLEARED / GONE',
    color: 'text-slate-300',
    bgColor: 'bg-white/[0.05]',
    borderColor: 'border-white/[0.15]',
    badgeBg: 'bg-slate-400 text-slate-950',
    dotColor: 'bg-slate-400',
    description: 'Contact verified absent following MoES recovery / salvage operation.',
  },
};

const CLASS_COLORS: Record<string, string> = {
  GHOST_NET: '#FFB703',
  DEBRIS: '#F59E0B',
  PIPELINE_HAZARD: '#38BDF8',
  SEABED_ANOMALY: '#94A3B8',
};

/* ─── Map Auto-Centering ─────────────────────────────────────────────────── */
const MapAutoFitter: React.FC<{ records: AcousticFingerprintRecord[] }> = ({ records }) => {
  const map = useMap();
  React.useEffect(() => {
    if (records.length === 0) return;
    const coords: [number, number][] = [];
    records.forEach((r) => {
      coords.push([r.baselinePass.coordinates.lat, r.baselinePass.coordinates.lng]);
      coords.push([r.latestPass.coordinates.lat, r.latestPass.coordinates.lng]);
    });
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 10 });
  }, [records, map]);
  return null;
};

/* ─── Leaflet Custom Marker Pins ─────────────────────────────────────────── */
const createTrackingPin = (record: AcousticFingerprintRecord, isLatest: boolean) => {
  const cfg = STATUS_CONFIG[record.status];
  const isMoved = record.status === 'MOVED';
  const pinBg = isLatest
    ? record.status === 'MOVED'
      ? '#38bdf8'
      : record.status === 'GONE'
      ? '#94a3b8'
      : record.status === 'NEW'
      ? '#fbbf24'
      : '#34d399'
    : '#475569';

  return L.divIcon({
    className: 'custom-tracking-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: #05070B;
        color: #ffffff;
        padding: 3px 8px;
        border-radius: 9999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 700;
        border: 2px solid ${pinBg};
        box-shadow: 0 0 14px ${pinBg}66;
        white-space: nowrap;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: ${pinBg};
          display: inline-block;
        "></span>
        <span>${isLatest ? record.fingerprintHash : 'SV-01'}</span>
      </div>
    `,
    iconSize: [110, 26],
    iconAnchor: [55, 13],
  });
};

/* ─── Survey Pass Timeline Strip ─────────────────────────────────────────── */
const SurveyTimeline: React.FC<{ record: AcousticFingerprintRecord }> = ({ record }) => {
  const passes = record.surveyPassCount;
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
    <div className="flex items-center gap-2.5 flex-wrap">
      {statuses.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        return (
          <React.Fragment key={i}>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dotColor} shrink-0`} />
              <span>Survey Pass {i + 1}</span>
              <span className="text-slate-400 font-normal">({cfg.label})</span>
            </div>
            {i < statuses.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─── Detailed Target Record Card ───────────────────────────────────────── */
const TargetCard: React.FC<{
  record: AcousticFingerprintRecord;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ record, isSelected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[record.status];
  const classColor = CLASS_COLORS[record.targetClass] || '#FFB703';

  return (
    <div
      className={`subpixel-card rounded-2xl border transition-all ${
        isSelected ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/30 shadow-2xl' : cfg.borderColor
      } overflow-hidden`}
    >
      {/* Card Header Bar */}
      <div
        className={`px-5 py-4 flex items-center justify-between gap-4 cursor-pointer ${cfg.bgColor} hover:opacity-95 transition-opacity`}
        onClick={() => {
          onSelect();
          setExpanded((e) => !e);
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className={`w-3.5 h-3.5 rounded-full ${cfg.dotColor} ${
              record.status === 'MOVED' ? 'animate-ping' : ''
            } shrink-0 shadow-md`}
          />
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-mono font-extrabold text-white">
                {record.fingerprintHash}
              </span>
              <span
                className={`text-xs font-sans font-bold px-2.5 py-0.5 rounded-md border ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`}
              >
                {cfg.label}
              </span>
              <span
                className="text-xs font-sans px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] font-semibold"
                style={{ color: classColor }}
              >
                {record.targetClassLabel}
              </span>
            </div>
            <div className="text-sm text-white font-bold truncate">{record.targetName}</div>
            <div className="text-xs text-slate-300 font-sans truncate flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{record.sector}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Risk score */}
          <div className="text-center hidden sm:block">
            <div className="text-xs text-slate-400 font-sans font-semibold uppercase">ENV RISK</div>
            <div
              className={`text-lg font-mono font-black ${
                record.environmentalRiskScore >= 80
                  ? 'text-rose-400'
                  : record.environmentalRiskScore >= 50
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {record.environmentalRiskScore}/100
            </div>
          </div>

          {/* Drift Distance */}
          {record.status === 'MOVED' && (
            <div className="text-center hidden md:block">
              <div className="text-xs text-slate-400 font-sans font-semibold uppercase">
                DISPLACEMENT
              </div>
              <div className="text-lg font-mono font-black text-[#38bdf8]">
                {record.driftDistanceM} m
              </div>
            </div>
          )}

          {/* Passes */}
          <div className="text-center hidden sm:block">
            <div className="text-xs text-slate-400 font-sans font-semibold uppercase">PASSES</div>
            <div className="text-lg font-mono font-black text-white">{record.surveyPassCount}</div>
          </div>

          {/* Acoustic Confidence */}
          <div className="text-center hidden lg:block">
            <div className="text-xs text-slate-400 font-sans font-semibold uppercase">
              CONFIDENCE
            </div>
            <div className="text-lg font-mono font-black text-[#FFB703]">
              {(record.acousticConfidence * 100).toFixed(0)}%
            </div>
          </div>

          <button
            className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
            title={expanded ? 'Collapse' : 'Expand full acoustic inspection dossier'}
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Detailed Inspection Dossier */}
      {expanded && (
        <div className="p-5 sm:p-6 space-y-5 border-t border-white/[0.08] bg-[#070C15]/95">
          {/* Survey Timeline Track */}
          <div className="space-y-2">
            <div className="text-xs font-sans text-slate-300 uppercase font-bold tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FFB703]" />
              <span>MULTI-SURVEY LIFECYCLE AUDIT TRAIL</span>
            </div>
            <SurveyTimeline record={record} />
          </div>

          {/* Status Description Box */}
          <div className={`p-4 rounded-xl border ${cfg.borderColor} ${cfg.bgColor} space-y-1`}>
            <div className="text-xs font-sans text-slate-300 uppercase font-bold">
              ACOUSTIC DISPLACEMENT AUDIT
            </div>
            <div className={`text-sm font-semibold leading-relaxed ${cfg.color}`}>
              {record.statusDescription}
            </div>
          </div>

          {/* Physical Acoustic Characteristics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
              <span className="text-slate-400 block text-xs">Seafloor Depth</span>
              <strong className="text-white font-mono text-base">{record.depthM} m</strong>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
              <span className="text-slate-400 block text-xs">Acoustic Dimensions</span>
              <strong className="text-white font-mono text-base">
                {record.estimatedLengthM}m × {record.estimatedWidthM}m
              </strong>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
              <span className="text-slate-400 block text-xs">Net Drift Distance</span>
              <strong
                className={`font-mono text-base ${
                  record.driftDistanceM > 0 ? 'text-[#38bdf8]' : 'text-white'
                }`}
              >
                {record.driftDistanceM} m
              </strong>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
              <span className="text-slate-400 block text-xs">Drift Heading & Velocity</span>
              <strong className="text-white font-mono text-base">
                {record.driftBearingDeg}° ({record.driftVelocityKt} kt)
              </strong>
            </div>
          </div>

          {/* Multi-Epoch Pass Acoustic Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Pass */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-slate-300 uppercase">
                  📡 BASELINE SURVEY PASS (SV-01)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {record.baselinePass.surveyDate}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-sans text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Vessel / Drone:</span>
                  <strong className="text-white font-mono">
                    {record.baselinePass.surveyVesselOrDrone}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Frequency / Altitude:</span>
                  <strong className="text-white font-mono">
                    {record.baselinePass.sonarFrequencyKhz} kHz ·{' '}
                    {record.baselinePass.towfishAltitudeM}m alt
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Acoustic Backscatter:</span>
                  <strong className="text-[#FFB703] font-mono">
                    {record.baselinePass.backscatterDb} dB
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Shadow Length / Relief:</span>
                  <strong className="text-white font-mono">
                    {record.baselinePass.shadowLengthM}m ({record.baselinePass.calculatedHeightM}m)
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Coordinates:</span>
                  <strong className="text-slate-200 font-mono">
                    {record.baselinePass.coordinates.lat.toFixed(4)}° N,{' '}
                    {record.baselinePass.coordinates.lng.toFixed(4)}° E
                  </strong>
                </div>
              </div>
            </div>

            {/* Latest Pass */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-[#38bdf8] uppercase">
                  📡 LATEST RE-SURVEY (SV-0{record.surveyPassCount})
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {record.latestPass.surveyDate}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-sans text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Vessel / Drone:</span>
                  <strong className="text-white font-mono">
                    {record.latestPass.surveyVesselOrDrone}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Frequency / Altitude:</span>
                  <strong className="text-white font-mono">
                    {record.latestPass.sonarFrequencyKhz} kHz ·{' '}
                    {record.latestPass.towfishAltitudeM}m alt
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Acoustic Backscatter:</span>
                  <strong className="text-[#38bdf8] font-mono">
                    {record.latestPass.backscatterDb} dB
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span>Shadow Length / Relief:</span>
                  <strong className="text-white font-mono">
                    {record.latestPass.shadowLengthM}m ({record.latestPass.calculatedHeightM}m)
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Coordinates:</span>
                  <strong className="text-slate-200 font-mono">
                    {record.latestPass.coordinates.lat.toFixed(4)}° N,{' '}
                    {record.latestPass.coordinates.lng.toFixed(4)}° E
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Benthic Current & Oceanographic Vector */}
          <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-center gap-3 text-xs font-sans">
            <Compass className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <div>
              <span className="text-slate-400 text-xs block font-semibold uppercase">
                Benthic Tidal Current Vector
              </span>
              <span className="text-white font-medium">{record.benthicCurrentVector}</span>
            </div>
          </div>

          {/* Action Recommendation Box */}
          <div className="p-4 bg-[#FFB703]/[0.08] border border-[#FFB703]/30 rounded-2xl space-y-1.5">
            <div className="text-xs font-sans text-[#FFB703] uppercase font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>MoES SWACHH SAGAR REMEDIATION DIRECTIVE</span>
            </div>
            <div className="text-sm text-slate-100 font-medium leading-relaxed">
              {record.actionRecommendation}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-white/[0.06]">
              {record.salvageTicketId && <span>Dossier Ticket: {record.salvageTicketId}</span>}
              {record.verifiedBy && <span>Authorized by: {record.verifiedBy}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Tracking Page ─────────────────────────────────────────────────── */
export const TrackingPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<DebrisLifecycleStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    TEMPORAL_DEBRIS_RECORDS[0]?.id || ''
  );

  const statusCounts = {
    NEW: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'NEW').length,
    STILL_THERE: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'STILL_THERE').length,
    MOVED: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'MOVED').length,
    GONE: TEMPORAL_DEBRIS_RECORDS.filter((r) => r.status === 'GONE').length,
  };

  const filtered = useMemo(() => {
    return TEMPORAL_DEBRIS_RECORDS.filter((r) => {
      const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.fingerprintHash.toLowerCase().includes(q) ||
        r.targetName.toLowerCase().includes(q) ||
        r.sector.toLowerCase().includes(q) ||
        r.targetClassLabel.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [filterStatus, searchQuery]);

  return (
    <div className="space-y-6 font-sans select-none text-slate-100 pb-16">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER: TITLE + SPECIFICATION BADGE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 subpixel-card rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-[#FFB703]/20 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Temporal Target Tracking & Displacement
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30">
                AFP ACOUSTIC FINGERPRINT ENGINE
              </span>
            </div>
            <p className="text-sm font-sans text-slate-300 max-w-3xl leading-relaxed">
              Multi-epoch Acoustic Fingerprint (AFP) lifecycle tracking across repeat side-scan sonar
              surveys. Detects stationary contacts, displacement driven by benthic tidal currents, and
              cleared debris post-salvage.
            </p>
          </div>
        </div>

        {/* 4-State Lifecycle KPI Filter Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {(Object.entries(statusCounts) as [DebrisLifecycleStatus, number][]).map(
            ([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              const isSelected = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    cfg.bgColor
                  } ${cfg.borderColor} hover:opacity-90 ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-offset-[#05070B] ring-current shadow-lg scale-[1.01]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor} shrink-0`} />
                    <span className={`text-xs font-sans font-extrabold uppercase ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className={`text-3xl font-mono font-black ${cfg.color}`}>{count}</div>
                  <div className="text-xs text-slate-400 font-sans mt-1 leading-tight">
                    {cfg.description}
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE MULTI-EPOCH DISPLACEMENT MAP (Esri Zero API Key Required)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="subpixel-card rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden space-y-0">
        <div className="px-5 py-3.5 bg-[#080d16]/95 border-b border-white/[0.08] flex items-center justify-between text-xs font-sans flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
              MULTI-SURVEY CONTACT DISPLACEMENT MAP (WGS-84)
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300 text-xs hidden sm:inline font-mono">
              Baseline vs Re-Survey Vectors
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-sans text-slate-300">
            <span className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/[0.08]">
              {filtered.length} Tracked Targets
            </span>
          </div>
        </div>

        {/* Leaflet Map with Esri Dark Marine Canvas (Zero API Key, Zero Watermarks) */}
        <div className="h-[420px] w-full relative bg-[#05070B]">
          <MapContainer
            center={[15.0, 76.0]}
            zoom={6}
            style={{ height: '100%', width: '100%', background: '#05070B' }}
            zoomControl={true}
          >
            <TileLayer
              key="esri-tracking-dark"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri Dark Marine Canvas, OpenStreetMap"
              maxZoom={16}
            />
            <TileLayer
              key="esri-tracking-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri Reference"
              opacity={0.8}
            />

            <MapAutoFitter records={filtered} />

            {/* Target Markers: Baseline & Latest Positions */}
            {filtered.map((record) => {
              const baseCoords: [number, number] = [
                record.baselinePass.coordinates.lat,
                record.baselinePass.coordinates.lng,
              ];
              const latestCoords: [number, number] = [
                record.latestPass.coordinates.lat,
                record.latestPass.coordinates.lng,
              ];
              const isMoved = record.status === 'MOVED';

              return (
                <React.Fragment key={record.id}>
                  {/* Latest Survey Marker */}
                  <Marker
                    position={latestCoords}
                    icon={createTrackingPin(record, true)}
                    eventHandlers={{
                      click: () => setSelectedRecordId(record.id),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <div className="font-sans text-xs text-slate-900 p-1">
                        <strong className="block text-sm">{record.targetName}</strong>
                        <div>Hash: {record.fingerprintHash}</div>
                        <div>Status: {record.status}</div>
                        {isMoved && <div>Drift: {record.driftDistanceM}m @ {record.driftBearingDeg}°</div>}
                      </div>
                    </Tooltip>
                  </Marker>

                  {/* If target moved, show Baseline pin + displacement polyline */}
                  {isMoved && (
                    <>
                      <Marker position={baseCoords} icon={createTrackingPin(record, false)}>
                        <Tooltip direction="top" offset={[0, -10]}>
                          <div className="font-sans text-xs text-slate-900 p-1">
                            <strong>{record.targetName} (Baseline Pass SV-01)</strong>
                            <div>Date: {record.baselinePass.surveyDate}</div>
                          </div>
                        </Tooltip>
                      </Marker>

                      {/* Displacement Vector Polyline */}
                      <Polyline
                        positions={[baseCoords, latestCoords]}
                        color="#38bdf8"
                        weight={2.5}
                        dashArray="5, 5"
                        opacity={0.9}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SEARCH & FILTER TOOLBAR
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-sm font-sans">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hash (AFP-XXXX), target name, or sector..."
            className="w-full bg-[#0A0F18] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703] transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Status:</span>
          {(['ALL', 'NEW', 'STILL_THERE', 'MOVED', 'GONE'] as (DebrisLifecycleStatus | 'ALL')[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === s
                    ? 'bg-[#FFB703] text-[#05070B] shadow-md font-bold'
                    : 'bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {s === 'STILL_THERE' ? 'STILL THERE' : s}
                {s !== 'ALL' && ` (${statusCounts[s as DebrisLifecycleStatus]})`}
              </button>
            )
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TARGET RECORDS LIST
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-sans text-base subpixel-card rounded-2xl border border-white/[0.08]">
            No temporal contacts match the selected search or filter criteria.
          </div>
        ) : (
          filtered.map((record) => (
            <TargetCard
              key={record.id}
              record={record}
              isSelected={selectedRecordId === record.id}
              onSelect={() => setSelectedRecordId(record.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
