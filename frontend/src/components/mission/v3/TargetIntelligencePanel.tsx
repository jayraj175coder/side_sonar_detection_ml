import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FilePlus,
  FileText,
  Anchor,
  Check,
  X,
} from 'lucide-react';
import { MoESClearanceCertificateModal } from './MoESClearanceCertificateModal';
import {
  ExtendedMissionTarget,
  formatDisplayId,
  renderSonarCanvas,
} from './SonarPreviewPanel';

interface TargetIntelligencePanelProps {
  target: ExtendedMissionTarget;
  isVerified?: boolean;
  isDemoRunning?: boolean;
  heroConfidence?: number;
  explainabilityStep?: number;
  onOpenDispatch?: (target: ExtendedMissionTarget) => void;
  onExportReport?: () => void;
  allTargets?: ExtendedMissionTarget[];
  onSelectTarget?: (id: string) => void;
  isShadowGateActive?: boolean;
}

export function getTargetPingAndTime(id: string): { ping: number; time: string; frame: number } {
  const map: Record<string, { ping: number; time: string; frame: number }> = {
    'SX-T07': { ping: 60123, time: '14:27:42', frame: 54 },
    'SX-T03': { ping: 60218, time: '14:32:15', frame: 95 },
    'SX-T05': { ping: 60164, time: '14:29:48', frame: 72 },
    'SX-T01': { ping: 59842, time: '14:21:12', frame: 12 },
    'SX-T09': { ping: 60265, time: '14:35:04', frame: 112 },
    'SX-T11': { ping: 59915, time: '14:23:18', frame: 24 },
    'SX-T14': { ping: 60140, time: '14:28:30', frame: 61 },
    'SX-T16': { ping: 60190, time: '14:31:02', frame: 84 },
    'SX-T02': { ping: 59880, time: '14:22:15', frame: 18 },
    'SX-T08': { ping: 60240, time: '14:33:50', frame: 104 },
  };
  return map[id] || { ping: 60050, time: '14:26:10', frame: 45 };
}

export const TargetIntelligencePanel: React.FC<TargetIntelligencePanelProps> = ({
  target,
  isDemoRunning = false,
  heroConfidence = 94.7,
  onOpenDispatch,
  onExportReport,
  allTargets = [],
  onSelectTarget,
  isShadowGateActive = true,
}) => {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [clipExported, setClipExported] = useState(false);
  const [addedToReport, setAddedToReport] = useState(false);
  const thumbCanvasRef = useRef<HTMLCanvasElement>(null);

  // Live gentle sensor drift for AUV-07 Hydrographic Telemetry
  const [telemetry, setTelemetry] = useState({
    depth: 186.4,
    temp: 14.7,
    salinity: 35.2,
    current: 0.38,
    speed: 2.8,
    heading: 243,
    pingRate: 12,
    battery: 84,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        depth: +(prev.depth + (Math.random() - 0.5) * 0.2).toFixed(1),
        temp: +(prev.temp + (Math.random() - 0.5) * 0.04).toFixed(1),
        salinity: +(prev.salinity + (Math.random() - 0.5) * 0.02).toFixed(1),
        current: +Math.max(0.15, prev.current + (Math.random() - 0.5) * 0.02).toFixed(2),
      }));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    renderSonarCanvas(thumbCanvasRef.current, target, 'detection', false, 1, true);
  }, [target]);

  // When Shadow Gate is active, cycle through confirmed targets first so clicks always land on real targets
  const confirmedTargets = allTargets.filter((t) => t.status === 'CONFIRMED');
  const navList =
    isShadowGateActive && confirmedTargets.length > 0
      ? confirmedTargets
      : allTargets.length > 0
      ? allTargets
      : [target];

  const currentIdx = Math.max(0, navList.findIndex((t) => t.id === target.id));
  const totalCount = navList.length;

  const handlePrev = () => {
    if (navList.length <= 1 || !onSelectTarget) return;
    const prevIdx = (currentIdx - 1 + navList.length) % navList.length;
    onSelectTarget(navList[prevIdx].id);
  };

  const handleNext = () => {
    if (navList.length <= 1 || !onSelectTarget) return;
    const nextIdx = (currentIdx + 1) % navList.length;
    onSelectTarget(navList[nextIdx].id);
  };

  const pingMeta = getTargetPingAndTime(target.id);
  const isFiltered = target.status === 'FILTERED' || target.shadowLength < 0.25;
  const hasValidShadow = target.shadowLength >= 0.25;

  const handleExportClip = () => {
    const payload = {
      clip_id: formatDisplayId(target.id),
      internal_id: target.id,
      authority: 'Ministry of Earth Sciences (MoES) / NIOT',
      sector: 'Indian EEZ — Mumbai Offshore Continental Shelf',
      category: target.label,
      confidence_pct: +(target.confidence * 100).toFixed(1),
      depth_m: target.depth,
      shadow_relief_m: target.shadowLength,
      shadow_gate_passed: hasValidShadow,
      dimensions: target.dimensions,
      coordinates_wgs84: {
        latitude: `${target.latitude.toFixed(4)}°N`,
        longitude: `${target.longitude.toFixed(4)}°E`,
      },
      ping_number: pingMeta.ping,
      timestamp_utc: pingMeta.time,
      model: 'YOLOv8s + ONNX Runtime',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formatDisplayId(target.id)}_MoES_sonar_clip.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setClipExported(true);
    setTimeout(() => setClipExported(false), 2000);
  };

  const displayConf =
    isDemoRunning && target.id === 'SX-T07' ? heroConfidence : target.confidence * 100;
  const displayId = formatDisplayId(target.id);
  const sizeText =
    target.id === 'SX-T07'
      ? '6.4 m × 2.8 m'
      : `${target.length.toFixed(1)} m × ${target.width.toFixed(1)} m`;

  return (
    <aside className="w-full h-full bg-[#070C16] flex flex-col font-sans select-none overflow-y-auto shrink-0 z-20">
      {/* ══════════════════════════════════════════════════════════════════
          TOP HALF: TARGET DETAILS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="p-3 border-b border-[#142238] flex flex-col gap-2.5">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-[#CBD5E1] uppercase font-mono">
            TARGET DETAILS
          </span>
          <div className="flex items-center bg-[#0B1424] border border-[#1E3250] rounded px-1.5 py-0.5 gap-1.5">
            <button
              onClick={handlePrev}
              className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              title="Previous Target"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-[#E2E8F0]">
              {currentIdx + 1} / {totalCount}
            </span>
            <button
              onClick={handleNext}
              className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              title="Next Target"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Target Identity Row (Thumbnail + ID/Category + Badges) */}
        <div className="flex items-stretch gap-2.5">
          <div
            className={`w-[88px] h-[58px] rounded-md overflow-hidden border shrink-0 bg-[#120902] ${
              isFiltered ? 'border-[#EF4444]/50' : 'border-[#F59E0B]/60'
            }`}
          >
            <canvas ref={thumbCanvasRef} width={88} height={58} className="w-full h-full block" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[18px] font-black text-white tracking-tight leading-none font-mono">
                {displayId}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                  isFiltered
                    ? 'bg-[#3B1219] text-[#F87171] border-[#EF4444]/60'
                    : 'bg-[#3B2607] text-[#FBBF24] border-[#F59E0B]/60'
                }`}
              >
                {isFiltered ? 'SUPPRESSED' : 'VERIFIED'}
              </span>
            </div>

            <div className="flex items-end justify-between gap-1 mt-1">
              <div className="min-w-0">
                <div className="text-[8.5px] font-mono uppercase tracking-wider text-[#64748B]">
                  CATEGORY
                </div>
                <div
                  className={`text-[13px] font-bold leading-tight truncate ${
                    isFiltered ? 'text-[#94A3B8]' : 'text-[#F59E0B]'
                  }`}
                >
                  {target.label}
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                  target.priority === 'HIGH'
                    ? 'bg-[#3B1219] text-[#F87171] border-[#EF4444]/50'
                    : isFiltered
                    ? 'bg-[#1E293B] text-[#94A3B8] border-[#475569]/50'
                    : 'bg-[#3B2607] text-[#FBBF24] border-[#F59E0B]/50'
                }`}
              >
                {isFiltered ? 'CLUTTER' : target.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Confidence Box */}
        <div className="px-3 py-2 rounded-lg bg-[#0A1220] border border-[#182942] flex items-center gap-3">
          <span
            className={`text-[28px] font-black leading-none tracking-tight font-mono ${
              isFiltered ? 'text-[#94A3B8]' : 'text-[#F59E0B]'
            }`}
          >
            {displayConf.toFixed(1)}%
          </span>
          <div className="border-l border-[#1E3250] pl-3">
            <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
              AI CONFIDENCE
            </div>
            <div className="text-[11px] font-mono font-semibold text-[#CBD5E1]">
              YOLOv8s + ONNX
            </div>
          </div>
        </div>

        {/* 3-Col Specs: DEPTH | SIZE (L × W) | SHADOW RELIEF */}
        <div className="grid grid-cols-3 gap-2 pt-0.5 border-b border-[#132035] pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">DEPTH</div>
            <div className="text-[12.5px] font-mono font-bold text-[#F1F5F9] mt-0.5">
              {target.depth.toFixed(1)} m
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">SIZE (L × W)</div>
            <div className="text-[12px] font-mono font-bold text-[#F1F5F9] mt-0.5 truncate">
              {sizeText}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">SHADOW RELIEF</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[12.5px] font-mono font-bold text-[#F1F5F9]">
                {target.shadowLength.toFixed(2)} m
              </span>
              {hasValidShadow ? (
                <span className="px-1 py-0.2 rounded bg-[#063324] border border-[#10B981]/50 text-[#34D399] text-[8.5px] font-mono font-bold flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Valid
                </span>
              ) : (
                <span className="px-1 py-0.2 rounded bg-[#3B1219] border border-[#EF4444]/50 text-[#F87171] text-[8.5px] font-mono font-bold flex items-center gap-0.5">
                  <X className="w-2.5 h-2.5" /> Flat
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Col Specs: POSITION (Real Indian EEZ Coordinates) | PING # */}
        <div className="grid grid-cols-2 gap-2 border-b border-[#132035] pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">POSITION (EEZ)</div>
            <div className="text-[11px] font-mono font-bold text-[#38BDF8] mt-0.5 truncate">
              {target.latitude.toFixed(4)}°N, {target.longitude.toFixed(4)}°E
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">PING #</div>
            <div className="text-[11px] font-mono font-bold text-[#E2E8F0] mt-0.5">
              {pingMeta.ping} ({pingMeta.time})
            </div>
          </div>
        </div>

        {/* 3-Col Verdict Row: THREAT LEVEL | STATUS | VERDICT */}
        <div className="grid grid-cols-3 gap-2 pb-1">
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">THREAT LEVEL</div>
            <div
              className={`text-[12px] font-bold mt-0.5 ${
                isFiltered
                  ? 'text-[#64748B]'
                  : target.priority === 'HIGH'
                  ? 'text-[#F59E0B]'
                  : 'text-[#38BDF8]'
              }`}
            >
              {isFiltered ? 'None' : target.priority === 'HIGH' ? 'High' : 'Medium'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">STATUS</div>
            <div
              className={`text-[12px] font-bold mt-0.5 ${
                isFiltered ? 'text-[#F87171]' : 'text-[#2DD4BF]'
              }`}
            >
              {isFiltered ? 'Filtered' : 'Confirmed'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">VERDICT</div>
            <div
              className={`text-[12px] font-bold mt-0.5 ${
                isFiltered
                  ? 'text-[#94A3B8]'
                  : target.confidence >= 0.85
                  ? 'text-[#10B981]'
                  : 'text-[#FBBF24]'
              }`}
            >
              {isFiltered ? 'Clutter' : target.confidence >= 0.85 ? 'Certain' : 'Probable'}
            </div>
          </div>
        </div>

        {/* 2×2 Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="py-2 px-2.5 rounded-md bg-[#281A08] hover:bg-[#38240B] border border-[#F59E0B]/80 text-[#FBBF24] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(245,158,11,0.18)]"
          >
            <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>VIEW EVIDENCE</span>
          </button>

          <button
            onClick={() => onOpenDispatch?.(target)}
            className="py-2 px-2.5 rounded-md bg-[#0B1728] hover:bg-[#12243D] border border-[#233B5E] hover:border-[#38BDF8] text-[#E2E8F0] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Anchor className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>TRACK TARGET</span>
          </button>

          <button
            onClick={handleExportClip}
            className="py-2 px-2.5 rounded-md bg-[#0A1322] hover:bg-[#112038] border border-[#1B2E4B] hover:border-[#38BDF8] text-[#CBD5E1] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{clipExported ? 'CLIP SAVED ✓' : 'EXPORT CLIP'}</span>
          </button>

          <button
            onClick={() => {
              setAddedToReport(true);
              setTimeout(() => setAddedToReport(false), 2000);
              onExportReport?.();
            }}
            className="py-2 px-2.5 rounded-md bg-[#0A1322] hover:bg-[#112038] border border-[#1B2E4B] hover:border-[#38BDF8] text-[#CBD5E1] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{addedToReport ? 'EXPORTED ✓' : 'ADD TO REPORT'}</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM HALF: HYDROGRAPHIC TELEMETRY (AUV-07)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 bg-[#060A12]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold tracking-wider text-[#CBD5E1] uppercase font-mono">
            HYDROGRAPHIC TELEMETRY (AUV-07)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#063324] border border-[#10B981]/50 text-[#34D399] text-[9px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            LIVE
          </span>
        </div>

        {/* 4 Telemetry Mini Cards with Sparklines */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* 1. DEPTH */}
          <div className="p-2 rounded-md bg-[#0A1220] border border-[#16263D] flex flex-col justify-between">
            <div className="text-[8.5px] font-mono uppercase text-[#94A3B8]">DEPTH</div>
            <div className="text-[13px] font-mono font-black text-white my-0.5 leading-tight">
              {telemetry.depth.toFixed(1)} <span className="text-[9.5px] font-normal text-[#94A3B8]">m</span>
            </div>
            <svg viewBox="0 0 60 18" className="w-full h-4 my-0.5 overflow-visible">
              <path
                d="M0,13 Q12,9 22,12 T44,10 T60,12"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <path
                d="M0,13 Q12,9 22,12 T44,10 T60,12 L60,18 L0,18 Z"
                fill="rgba(56,189,248,0.14)"
              />
            </svg>
            <div className="text-[8.5px] font-mono text-[#38BDF8] flex items-center gap-0.5">
              <span>↓</span> 0.8 m/s
            </div>
          </div>

          {/* 2. TEMPERATURE */}
          <div className="p-2 rounded-md bg-[#0A1220] border border-[#16263D] flex flex-col justify-between">
            <div className="text-[8.5px] font-mono uppercase text-[#94A3B8] truncate">TEMPERATURE</div>
            <div className="text-[13px] font-mono font-black text-white my-0.5 leading-tight">
              {telemetry.temp.toFixed(1)} <span className="text-[9.5px] font-normal text-[#94A3B8]">°C</span>
            </div>
            <svg viewBox="0 0 60 18" className="w-full h-4 my-0.5 overflow-visible">
              <path
                d="M0,14 L18,13 L26,11 L32,3 L38,12 L48,13 L60,13"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
              />
              <path
                d="M0,14 L18,13 L26,11 L32,3 L38,12 L48,13 L60,13 L60,18 L0,18 Z"
                fill="rgba(16,185,129,0.15)"
              />
            </svg>
            <div className="text-[8.5px] font-mono text-[#10B981] flex items-center gap-1">
              <span>●</span> Stable
            </div>
          </div>

          {/* 3. SALINITY */}
          <div className="p-2 rounded-md bg-[#0A1220] border border-[#16263D] flex flex-col justify-between">
            <div className="text-[8.5px] font-mono uppercase text-[#94A3B8]">SALINITY</div>
            <div className="text-[13px] font-mono font-black text-white my-0.5 leading-tight">
              {telemetry.salinity.toFixed(1)} <span className="text-[9px] font-normal text-[#94A3B8]">PSU</span>
            </div>
            <svg viewBox="0 0 60 18" className="w-full h-4 my-0.5 overflow-visible">
              <path
                d="M0,12 Q15,10 30,13 T60,11"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="1.5"
              />
              <path
                d="M0,12 Q15,10 30,13 T60,11 L60,18 L0,18 Z"
                fill="rgba(34,211,238,0.14)"
              />
            </svg>
            <div className="text-[8.5px] font-mono text-[#22D3EE] flex items-center gap-0.5">
              <span>↓</span> Normal
            </div>
          </div>

          {/* 4. CURRENT */}
          <div className="p-2 rounded-md bg-[#0A1220] border border-[#16263D] flex flex-col justify-between">
            <div className="text-[8.5px] font-mono uppercase text-[#94A3B8]">CURRENT</div>
            <div className="text-[13px] font-mono font-black text-white my-0.5 leading-tight">
              {telemetry.current.toFixed(2)} <span className="text-[9px] font-normal text-[#94A3B8]">m/s</span>
            </div>
            <div className="h-4 my-0.5 flex items-center justify-center">
              <span className="text-[#F59E0B] text-xs font-bold">↗</span>
            </div>
            <div className="text-[8.5px] font-mono text-[#10B981] truncate">
              ↗ 243° SW
            </div>
          </div>
        </div>

        {/* AUV STATUS Strip */}
        <div className="p-2.5 rounded-lg bg-[#0A1220] border border-[#16263D]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono uppercase text-[#94A3B8]">AUV STATUS</span>
            <span className="text-[9.5px] font-mono font-bold text-[#10B981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              SURVEYING
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Mini 3D Blue AUV Submarine SVG */}
            <div className="w-14 h-7 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 80 34" className="w-full h-full">
                <defs>
                  <linearGradient id="auvBodyGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
                <polygon points="6,17 16,9 18,17 16,25" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
                <rect x="14" y="10" width="52" height="14" rx="7" fill="url(#auvBodyGrad)" stroke="#93C5FD" strokeWidth="1" />
                <path d="M36,10 Q42,5 48,10 Z" fill="#38BDF8" />
                <rect x="28" y="15" width="22" height="4" rx="2" fill="#0F172A" stroke="#38BDF8" strokeWidth="0.8" />
                <circle cx="62" cy="17" r="2.5" fill="#E0F2FE" />
              </svg>
            </div>

            <div>
              <div className="text-[8px] font-mono uppercase text-[#64748B]">SPEED</div>
              <div className="text-[12px] font-mono font-bold text-white">
                {telemetry.speed} <span className="text-[9.5px] font-normal text-[#94A3B8]">kn</span>
              </div>
            </div>

            <div>
              <div className="text-[8px] font-mono uppercase text-[#64748B]">HEADING</div>
              <div className="text-[12px] font-mono font-bold text-white flex items-center gap-0.5">
                <span>{telemetry.heading}°</span>
                <span className="text-[#38BDF8] text-[9px]">▲</span>
              </div>
            </div>

            <div>
              <div className="text-[8px] font-mono uppercase text-[#64748B]">PING RATE</div>
              <div className="text-[12px] font-mono font-bold text-white">
                {telemetry.pingRate} <span className="text-[9.5px] font-normal text-[#94A3B8]">Hz</span>
              </div>
            </div>

            <div>
              <div className="text-[8px] font-mono uppercase text-[#64748B]">BATTERY</div>
              <div className="text-[12px] font-mono font-black text-[#10B981]">
                {telemetry.battery}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MoES Clearance Certificate & Evidence Modal */}
      <MoESClearanceCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        target={target}
      />
    </aside>
  );
};
