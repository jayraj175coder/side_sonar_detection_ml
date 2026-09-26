import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FilePlus,
  FileText,
  Anchor,
  Check,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';
import { MoESClearanceCertificateModal } from './MoESClearanceCertificateModal';
import { formatDisplayId } from './SonarPreviewPanel';

interface TargetIntelligencePanelProps {
  target: MissionV3Target;
  isVerified?: boolean;
  isDemoRunning?: boolean;
  heroConfidence?: number;
  explainabilityStep?: number;
  onOpenDispatch?: (target: MissionV3Target) => void;
  onExportReport?: () => void;
  allTargets?: MissionV3Target[];
  onSelectTarget?: (id: string) => void;
}

// Draw the golden sonar crop thumbnail for Target Details header
function drawTargetCropThumb(canvas: HTMLCanvasElement | null, target: MissionV3Target) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Deep amber-brown sonar background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#2B1504');
  bg.addColorStop(0.5, '#4A2408');
  bg.addColorStop(1, '#120802');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Speckle grain
  for (let i = 0; i < 420; i++) {
    const x = (Math.sin(i * 78.233) * 0.5 + 0.5) * W;
    const y = (Math.cos(i * 45.164) * 0.5 + 0.5) * H;
    const alpha = (i % 7) * 0.04;
    ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Dark acoustic shadow band to the right
  ctx.fillStyle = 'rgba(4, 6, 10, 0.85)';
  ctx.beginPath();
  ctx.moveTo(W * 0.52, H * 0.36);
  ctx.lineTo(W, H * 0.24);
  ctx.lineTo(W, H * 0.78);
  ctx.lineTo(W * 0.52, H * 0.68);
  ctx.closePath();
  ctx.fill();

  // Tangled circular ghost-net / target ring return in center
  const cx = W * 0.46;
  const cy = H * 0.52;
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 2; a += 0.2) {
    const r = 10 + Math.sin(a * 4) * 2.2 + Math.cos(a * 3) * 1.5;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r * 0.82;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Bright specular highlight knots
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(cx - 8, cy - 5, 3, 3);
  ctx.fillRect(cx + 5, cy + 3, 2.5, 2.5);
  ctx.shadowBlur = 0;
}

export const TargetIntelligencePanel: React.FC<TargetIntelligencePanelProps> = ({
  target,
  isVerified = true,
  isDemoRunning = false,
  heroConfidence = 94.7,
  onOpenDispatch,
  onExportReport,
  allTargets = [],
  onSelectTarget,
}) => {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [clipExported, setClipExported] = useState(false);
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
    drawTargetCropThumb(thumbCanvasRef.current, target);
  }, [target]);

  const activeList = allTargets.length > 0 ? allTargets : [target];
  const currentIdx = Math.max(0, activeList.findIndex((t) => t.id === target.id));
  const totalCount = activeList.length || 17;
  const displayIndex = currentIdx === 0 && target.id === 'SX-T07' ? 3 : currentIdx + 1;

  const handlePrev = () => {
    if (activeList.length <= 1 || !onSelectTarget) return;
    const prevIdx = (currentIdx - 1 + activeList.length) % activeList.length;
    onSelectTarget(activeList[prevIdx].id);
  };

  const handleNext = () => {
    if (activeList.length <= 1 || !onSelectTarget) return;
    const nextIdx = (currentIdx + 1) % activeList.length;
    onSelectTarget(activeList[nextIdx].id);
  };

  const handleExportClip = () => {
    const payload = {
      clip_id: formatDisplayId(target.id),
      internal_id: target.id,
      category: target.label,
      confidence: +(target.confidence * 100).toFixed(1),
      depth_m: target.depth,
      shadow_relief_m: target.shadowLength,
      dimensions: target.dimensions,
      coordinates: { lat: 27.7881, lon: -89.8742, survey_lat: target.latitude, survey_lon: target.longitude },
      ping_number: 60123,
      timestamp_utc: '14:27:42',
      model: 'YOLOv8s + ONNX',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formatDisplayId(target.id)}_sonar_clip.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setClipExported(true);
    setTimeout(() => setClipExported(false), 2000);
  };

  const displayConf = isDemoRunning ? heroConfidence : target.confidence * 100;
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
          <div className="flex items-center bg-[#0B1424] border border-[#1E3250] rounded px-1 py-0.5 gap-1.5">
            <button
              onClick={handlePrev}
              className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              title="Previous Target"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-[#E2E8F0]">
              {displayIndex} / {totalCount}
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
          <div className="w-[88px] h-[58px] rounded-md overflow-hidden border border-[#F59E0B]/50 shrink-0 bg-[#120902]">
            <canvas ref={thumbCanvasRef} width={88} height={58} className="w-full h-full block" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[18px] font-black text-white tracking-tight leading-none font-mono">
                {displayId}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#3B2607] text-[#FBBF24] border border-[#F59E0B]/60">
                {isVerified ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>

            <div className="flex items-end justify-between gap-1 mt-1">
              <div>
                <div className="text-[8.5px] font-mono uppercase tracking-wider text-[#64748B]">
                  CATEGORY
                </div>
                <div className="text-[13px] font-bold text-[#F59E0B] leading-tight truncate">
                  {target.label}
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                  target.priority === 'HIGH'
                    ? 'bg-[#3B1219] text-[#F87171] border-[#EF4444]/50'
                    : 'bg-[#3B2607] text-[#FBBF24] border-[#F59E0B]/50'
                }`}
              >
                {target.priority === 'FILTERED' ? 'LOW' : target.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Confidence Box */}
        <div className="px-3 py-2 rounded-lg bg-[#0A1220] border border-[#182942] flex items-center gap-3">
          <span className="text-[28px] font-black text-[#F59E0B] leading-none tracking-tight font-mono">
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
              <span className="px-1 py-0.2 rounded bg-[#063324] border border-[#10B981]/50 text-[#34D399] text-[8.5px] font-mono font-bold flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Valid
              </span>
            </div>
          </div>
        </div>

        {/* 2-Col Specs: POSITION | PING # */}
        <div className="grid grid-cols-2 gap-2 border-b border-[#132035] pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">POSITION</div>
            <div className="text-[11px] font-mono font-bold text-[#38BDF8] mt-0.5 truncate">
              27.7881°N, 89.8742°W
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">PING #</div>
            <div className="text-[11px] font-mono font-bold text-[#E2E8F0] mt-0.5">
              60123 (14:27:42)
            </div>
          </div>
        </div>

        {/* 3-Col Verdict Row: THREAT LEVEL | STATUS | VERDICT */}
        <div className="grid grid-cols-3 gap-2 pb-1">
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">THREAT LEVEL</div>
            <div className="text-[12px] font-bold text-[#F59E0B] mt-0.5">
              {target.priority === 'HIGH' ? 'High' : 'Medium'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">STATUS</div>
            <div className="text-[12px] font-bold text-[#2DD4BF] mt-0.5">Confirmed</div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-[#64748B]">VERDICT</div>
            <div className="text-[12px] font-bold text-[#10B981] mt-0.5">Certain</div>
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
            <span>{clipExported ? 'CLIP SAVED' : 'EXPORT CLIP'}</span>
          </button>

          <button
            onClick={() => onExportReport?.()}
            className="py-2 px-2.5 rounded-md bg-[#0A1322] hover:bg-[#112038] border border-[#1B2E4B] hover:border-[#38BDF8] text-[#CBD5E1] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>ADD TO REPORT</span>
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
                {/* Tail fins */}
                <polygon points="6,17 16,9 18,17 16,25" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
                {/* Hull torpedo body */}
                <rect x="14" y="10" width="52" height="14" rx="7" fill="url(#auvBodyGrad)" stroke="#93C5FD" strokeWidth="1" />
                {/* Conning sensor dome */}
                <path d="M36,10 Q42,5 48,10 Z" fill="#38BDF8" />
                {/* Side acoustic array window */}
                <rect x="28" y="15" width="22" height="4" rx="2" fill="#0F172A" stroke="#38BDF8" strokeWidth="0.8" />
                {/* Nose cone glow */}
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
