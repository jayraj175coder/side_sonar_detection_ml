import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Crosshair,
  Download,
  FilePlus,
  Check,
  X,
  RefreshCw,
  Activity,
  Award,
  Cpu,
  Thermometer,
  Droplets,
  Navigation,
  Zap,
  Radio,
  Ruler,
  Maximize,
  Compass,
  Waves,
  Shield,
  Sparkles,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';
import { MoESClearanceCertificateModal } from './MoESClearanceCertificateModal';

interface TargetIntelligencePanelProps {
  target: MissionV3Target;
  isVerified?: boolean;
  isDemoRunning?: boolean;
  heroConfidence?: number;
  explainabilityStep?: number;
  onOpenDispatch?: (target: MissionV3Target) => void;
  allTargets?: MissionV3Target[];
  onSelectTarget?: (id: string) => void;
}

// ── Sonar thumbnail generator (Canvas-based) ──────────────────────────────────
function drawSonarThumbnail(
  canvas: HTMLCanvasElement | null,
  mode: 'raw' | 'detection' | 'shadow' | '3d',
  target: MissionV3Target,
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  if (mode === 'raw') {
    // Grayscale speckle sonar image
    ctx.fillStyle = '#030810';
    ctx.fillRect(0, 0, W, H);
    const imgData = ctx.createImageData(W, H);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const px = Math.random();
      const bright = px < 0.04 ? 220 + Math.random() * 35 : px < 0.15 ? 90 + Math.random() * 60 : Math.random() * 28;
      imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = bright;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    // Bright target region
    const cx = W * 0.5;
    const cy = H * 0.45;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
    grad.addColorStop(0, 'rgba(255,230,100,0.85)');
    grad.addColorStop(1, 'rgba(255,230,100,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // Shadow stripe
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(cx + 10, cy - 8, 32, 16);
  }

  if (mode === 'detection') {
    // Same raw but with bounding box overlay
    ctx.fillStyle = '#030810';
    ctx.fillRect(0, 0, W, H);
    const imgData2 = ctx.createImageData(W, H);
    for (let i = 0; i < imgData2.data.length; i += 4) {
      const px = Math.random();
      const bright = px < 0.04 ? 210 + Math.random() * 35 : px < 0.15 ? 80 + Math.random() * 60 : Math.random() * 25;
      imgData2.data[i] = imgData2.data[i + 1] = imgData2.data[i + 2] = bright;
      imgData2.data[i + 3] = 255;
    }
    ctx.putImageData(imgData2, 0, 0);
    const cx = W * 0.5;
    const cy = H * 0.45;
    const grad2 = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
    grad2.addColorStop(0, 'rgba(255,230,100,0.85)');
    grad2.addColorStop(1, 'rgba(255,230,100,0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(cx + 10, cy - 8, 32, 16);
    // Detection box
    ctx.strokeStyle = '#00F5D4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 18, cy - 14, 36, 28);
    // Corner accents
    const corners = [[cx - 18, cy - 14], [cx + 18, cy - 14], [cx - 18, cy + 14], [cx + 18, cy + 14]];
    corners.forEach(([x, y]) => {
      ctx.strokeStyle = '#FFB703';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y);
      ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
      ctx.stroke();
    });
    // Label
    ctx.fillStyle = '#00F5D4';
    ctx.font = 'bold 7px monospace';
    ctx.fillText(`${target.id}  ${(target.confidence * 100).toFixed(1)}%`, cx - 16, cy - 17);
  }

  if (mode === 'shadow') {
    // High-contrast shadow mode
    ctx.fillStyle = '#020608';
    ctx.fillRect(0, 0, W, H);
    // Bright return stripe
    const cx = W * 0.42;
    const cy = H * 0.48;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Jet shadow wedge
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy - 6);
    ctx.lineTo(cx + 14, cy + 6);
    ctx.lineTo(cx + 14 + 38, cy + 4);
    ctx.lineTo(cx + 14 + 30, cy - 4);
    ctx.closePath();
    ctx.fill();
    // Red shadow border
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy);
    ctx.lineTo(cx + 14 + 38, cy + 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 6.5px monospace';
    ctx.fillText(`Ls=${target.shadowLength.toFixed(2)}m`, cx + 16, cy + 14);
    // Label
    ctx.fillStyle = '#FFB703';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('SHADOW', 4, 12);
  }

  if (mode === '3d') {
    // Simple isometric 3D sketch
    ctx.fillStyle = '#030A15';
    ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = 'rgba(13,46,74,0.6)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(W * 0.1 + i * 12, H * 0.7);
      ctx.lineTo(W * 0.1 + i * 12 + 20, H * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.7 - i * 7);
      ctx.lineTo(W * 0.1 + 72, H * 0.3 - i * 7);
      ctx.stroke();
    }
    // 3D box
    const bx = W * 0.38;
    const by = H * 0.52;
    ctx.fillStyle = '#FFB70320';
    ctx.strokeStyle = '#FFB703';
    ctx.lineWidth = 1.5;
    const pts = [[bx, by], [bx + 18, by - 8], [bx + 18, by - 22], [bx, by - 14]];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    pts.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Acoustic cone
    ctx.fillStyle = 'rgba(56,189,248,0.08)';
    ctx.strokeStyle = 'rgba(56,189,248,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.08);
    ctx.lineTo(bx, by - 7);
    ctx.lineTo(bx + 18, by - 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('3D VIEW', 4, 12);
  }
}

// ── Acoustic Profile Waveform ─────────────────────────────────────────────────
function drawAcousticProfile(canvas: HTMLCanvasElement | null, target: MissionV3Target) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.fillStyle = '#030810';
  ctx.fillRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = 'rgba(13,46,74,0.5)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 4]);
  for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.setLineDash([]);

  // Waveform fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(255,183,3,0.35)');
  grad.addColorStop(1, 'rgba(255,183,3,0)');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#FFB703';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, H);
  const segs = 80;
  for (let i = 0; i <= segs; i++) {
    const x = (i / segs) * W;
    const normalized = i / segs;
    let amp = 0.08 + Math.random() * 0.12;
    // High return region at target position
    if (normalized > 0.42 && normalized < 0.54) amp = 0.55 + Math.random() * 0.35;
    // Shadow (near zero) region
    else if (normalized > 0.54 && normalized < 0.72) amp = 0.01 + Math.random() * 0.04;
    const y = H - amp * H;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Waveform stroke
  ctx.beginPath();
  for (let i = 0; i <= segs; i++) {
    const x = (i / segs) * W;
    const normalized = i / segs;
    let amp = 0.08 + Math.random() * 0.12;
    if (normalized > 0.42 && normalized < 0.54) amp = 0.55 + Math.random() * 0.35;
    else if (normalized > 0.54 && normalized < 0.72) amp = 0.01 + Math.random() * 0.04;
    const y = H - amp * H;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#FFB703';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Shadow annotation
  const shadowStart = W * 0.54;
  const shadowEnd   = W * 0.72;
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(shadowStart, H * 0.1);
  ctx.lineTo(shadowStart, H * 0.95);
  ctx.moveTo(shadowEnd, H * 0.1);
  ctx.lineTo(shadowEnd, H * 0.95);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#EF4444';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`± ${target.shadowLength.toFixed(2)}m`, (shadowStart + shadowEnd) / 2, H * 0.18);
  ctx.textAlign = 'left';

  // Axis labels
  ctx.fillStyle = '#475569';
  ctx.font = '6.5px monospace';
  ctx.fillText('RANGE →', 2, H - 2);
  ctx.fillText('dB', 2, 8);
}

// ── Live AUV Telemetry hook ───────────────────────────────────────────────────
function useAuvTelemetry() {
  const [tel, setTel] = useState({
    depth: 186.4,
    temp: 14.7,
    salinity: 35.2,
    current: 0.38,
    speed: 2.8,
    heading: 242,
    pingRate: 11,
    battery: 84,
  });
  useEffect(() => {
    const id = setInterval(() => {
      setTel(prev => ({
        ...prev,
        depth:    parseFloat((prev.depth    + (Math.random() - 0.5) * 0.4).toFixed(1)),
        temp:     parseFloat((prev.temp     + (Math.random() - 0.5) * 0.06).toFixed(1)),
        salinity: parseFloat((prev.salinity + (Math.random() - 0.5) * 0.02).toFixed(1)),
        current:  parseFloat(Math.max(0.05, prev.current + (Math.random() - 0.5) * 0.02).toFixed(2)),
        speed:    parseFloat(Math.max(0.5, prev.speed   + (Math.random() - 0.5) * 0.08).toFixed(1)),
        pingRate: Math.max(8, Math.min(15, prev.pingRate + (Math.random() > 0.7 ? 1 : 0))),
        battery:  Math.max(0, Math.min(100, prev.battery - (Math.random() > 0.95 ? 1 : 0))),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return tel;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const TargetIntelligencePanel: React.FC<TargetIntelligencePanelProps> = ({
  target,
  isVerified = true,
  isDemoRunning = false,
  heroConfidence = 94.7,
  explainabilityStep = 4,
  onOpenDispatch,
  allTargets = [],
  onSelectTarget,
}) => {
  const [sonarTab, setSonarTab] = useState<'raw' | 'detection' | 'shadow' | '3d'>('detection');
  const [triageState, setTriageState] = useState<'CONFIRMED' | 'REJECTED' | 'RECLASSIFIED'>('CONFIRMED');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const rawCanvasRef       = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef    = useRef<HTMLCanvasElement>(null);
  const view3DCanvasRef    = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef  = useRef<HTMLCanvasElement>(null);

  const tel = useAuvTelemetry();
  const displayConf = isDemoRunning ? heroConfidence : target.confidence * 100;

  // Draw all thumbnails when target changes
  useEffect(() => {
    drawSonarThumbnail(rawCanvasRef.current, 'raw', target);
    drawSonarThumbnail(detectionCanvasRef.current, 'detection', target);
    drawSonarThumbnail(shadowCanvasRef.current, 'shadow', target);
    drawSonarThumbnail(view3DCanvasRef.current, '3d', target);
    drawAcousticProfile(waveformCanvasRef.current, target);
  }, [target]);

  // Target navigation
  const filtered = allTargets.filter(t => t.status !== 'FILTERED');
  const currentIdx = filtered.findIndex(t => t.id === target.id);
  const goPrev = () => { if (currentIdx > 0) onSelectTarget?.(filtered[currentIdx - 1].id); };
  const goNext = () => { if (currentIdx < filtered.length - 1) onSelectTarget?.(filtered[currentIdx + 1].id); };

  const confColor = displayConf >= 90 ? '#00F5D4' : displayConf >= 70 ? '#FFB703' : '#EF4444';
  const prioColor = target.priority === 'HIGH' ? '#EF4444' : target.priority === 'MEDIUM' ? '#F59E0B' : '#38BDF8';
  const THUMBNAIL_TABS = [
    { key: 'raw',       label: 'RAW SONAR',  ref: rawCanvasRef },
    { key: 'detection', label: 'DETECTION',  ref: detectionCanvasRef },
    { key: 'shadow',    label: 'SHADOW',     ref: shadowCanvasRef },
    { key: '3d',        label: '3D VIEW',    ref: view3DCanvasRef },
  ] as const;

  return (
    <aside className="w-full h-full bg-[#05080F] border-l border-[#0F1E2E] flex flex-col font-mono select-none overflow-y-auto text-[9px] shrink-0 z-20">

      {/* ══════════════════════════════════════════════════
          SECTION 1 — TARGET DETAILS
      ══════════════════════════════════════════════════ */}
      <div className="bg-[#05080F] border-b border-[#0F1E2E]">

        {/* Header row: title + nav */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#0F1E2E]">
          <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">
            TARGET DETAILS
          </span>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} disabled={currentIdx <= 0}
              className="p-0.5 rounded bg-[#0A1520] border border-[#1E293B] hover:border-[#00F5D4] text-[#64748B] hover:text-[#00F5D4] disabled:opacity-30 cursor-pointer transition-colors">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[8px] text-[#475569] px-1 font-bold">
              {currentIdx + 1} / {filtered.length}
            </span>
            <button onClick={goNext} disabled={currentIdx >= filtered.length - 1}
              className="p-0.5 rounded bg-[#0A1520] border border-[#1E293B] hover:border-[#00F5D4] text-[#64748B] hover:text-[#00F5D4] disabled:opacity-30 cursor-pointer transition-colors">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Target identity row */}
        <div className="px-3 py-2 flex items-start gap-2.5">
          {/* Sonar thumbnail preview (small) */}
          <div className="relative w-16 h-12 shrink-0 rounded overflow-hidden border border-[#1E293B]">
            <canvas ref={detectionCanvasRef} width={64} height={48} className="w-full h-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[11px] font-black text-[#E2E8F0] tracking-tight leading-none">
                {target.id}
              </span>
              <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase border ${
                isVerified
                  ? 'bg-[#00F5D4]/15 text-[#00F5D4] border-[#00F5D4]/40'
                  : 'bg-[#1E293B] text-[#64748B] border-[#1E293B]'
              }`}>
                {isVerified ? '✓ VERIFIED' : 'PENDING'}
              </span>
            </div>
            <div className="text-[9px] text-[#94A3B8] font-bold truncate leading-tight">
              {target.label.toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[7.5px] font-black px-1 py-0.5 rounded border uppercase"
                style={{ color: prioColor, borderColor: `${prioColor}50`, background: `${prioColor}12` }}>
                {target.priority}
              </span>
              <span className="text-[7.5px] text-[#475569]">{target.category}</span>
            </div>
          </div>
        </div>

        {/* BIG Confidence display */}
        <div className="mx-3 mb-2 p-2 bg-[#030810] border border-[#1E293B] rounded-lg">
          <div className="flex items-end justify-between mb-1">
            <div>
              <span className="text-[30px] font-black leading-none tracking-tighter"
                style={{ color: confColor }}>
                {displayConf.toFixed(1)}%
              </span>
            </div>
            <div className="text-right text-[7.5px] text-[#475569] leading-relaxed">
              <div>AI CONFIDENCE</div>
              <div className="text-[#94A3B8] font-bold">YOLOv8s + ONNX</div>
            </div>
          </div>
          {/* Confidence bar */}
          <div className="w-full h-1 bg-[#0A1520] rounded overflow-hidden">
            <div className="h-full rounded transition-all duration-500"
              style={{ width: `${displayConf}%`, background: confColor, boxShadow: `0 0 6px ${confColor}` }} />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-px px-3 mb-2">
          {[
            { label: 'DEPTH',        value: `${target.depth.toFixed(1)} m`,    color: '#38BDF8' },
            { label: 'SIZE (L×W)',   value: `${target.length.toFixed(1)}×${target.width.toFixed(1)}m`, color: '#E2E8F0' },
            { label: 'SHADOW RELIEF',value: `${target.shadowLength.toFixed(2)} m`, color: '#FFB703' },
          ].map(m => (
            <div key={m.label} className="p-1.5 bg-[#030810] border border-[#0F1E2E] rounded">
              <div className="text-[6.5px] text-[#475569] uppercase mb-0.5">{m.label}</div>
              <div className="font-black text-[9.5px] leading-none" style={{ color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Position & Ping */}
        <div className="grid grid-cols-2 gap-px px-3 mb-2">
          <div className="p-1.5 bg-[#030810] border border-[#0F1E2E] rounded">
            <div className="text-[6.5px] text-[#475569] mb-0.5">POSITION</div>
            <div className="text-[8px] font-black text-[#94A3B8] font-mono leading-tight">
              {target.latitude.toFixed(4)}°N<br/>{target.longitude.toFixed(4)}°E
            </div>
          </div>
          <div className="p-1.5 bg-[#030810] border border-[#0F1E2E] rounded">
            <div className="text-[6.5px] text-[#475569] mb-0.5">PING #</div>
            <div className="text-[9.5px] font-black text-[#E2E8F0]">
              {(60000 + Math.abs(target.rawX * 123 | 0)).toLocaleString()}
            </div>
            <div className="text-[6.5px] text-[#475569]">13:27:42 UTC</div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-px px-3 mb-2">
          {[
            { label: 'THREAT LEVEL', value: target.priority === 'HIGH' ? 'HIGH' : 'MEDIUM', color: prioColor },
            { label: 'STATUS',       value: 'CONFIRMED',  color: '#00F5D4' },
            { label: 'VERDICT',      value: 'CERTAIN',    color: '#00F5D4' },
          ].map(s => (
            <div key={s.label} className="p-1 bg-[#030810] border border-[#0F1E2E] rounded text-center">
              <div className="text-[6px] text-[#475569] mb-0.5">{s.label}</div>
              <div className="text-[7.5px] font-black uppercase" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Action buttons row 1 */}
        <div className="grid grid-cols-2 gap-1.5 px-3 mb-1.5">
          <button className="flex items-center justify-center gap-1 py-1.5 bg-[#0A1520] border border-[#1E293B] hover:border-[#00F5D4] text-[#E2E8F0] hover:text-[#00F5D4] rounded text-[8px] font-bold cursor-pointer transition-all">
            <Eye className="w-2.5 h-2.5" />
            VIEW EVIDENCE
          </button>
          <button className="flex items-center justify-center gap-1 py-1.5 bg-[#0A1520] border border-[#1E293B] hover:border-[#FFB703] text-[#E2E8F0] hover:text-[#FFB703] rounded text-[8px] font-bold cursor-pointer transition-all">
            <Crosshair className="w-2.5 h-2.5" />
            TRACK TARGET
          </button>
        </div>

        {/* Action buttons row 2 */}
        <div className="grid grid-cols-2 gap-1.5 px-3 mb-2">
          <button className="flex items-center justify-center gap-1 py-1.5 bg-[#0A1520] border border-[#1E293B] hover:border-[#38BDF8] text-[#64748B] hover:text-[#38BDF8] rounded text-[8px] font-bold cursor-pointer transition-all">
            <Download className="w-2.5 h-2.5" />
            EXPORT CLIP
          </button>
          <button
            onClick={() => {/* add to report */}}
            className="flex items-center justify-center gap-1 py-1.5 bg-[#FFB703]/10 border border-[#FFB703]/40 hover:bg-[#FFB703]/20 text-[#FFB703] rounded text-[8px] font-bold cursor-pointer transition-all">
            <FilePlus className="w-2.5 h-2.5" />
            ADD TO REPORT
          </button>
        </div>

        {/* Human-in-the-loop triage */}
        <div className="mx-3 mb-2 p-2 bg-[#030810] border border-[#0F1E2E] rounded-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] text-[#475569] font-bold flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-[#FFB703]" />
              ANALYST TRIAGE
            </span>
            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${
              triageState === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              : triageState === 'REJECTED' ? 'bg-red-950 text-red-300 border border-red-500/30'
              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
            }`}>{triageState}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['CONFIRMED', 'REJECTED', 'RECLASSIFIED'] as const).map(s => (
              <button key={s}
                onClick={() => setTriageState(s)}
                className={`py-1 rounded text-[7.5px] font-bold border flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                  triageState === s
                    ? s === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : s === 'REJECTED' ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-[#0A1520] text-[#475569] border-[#1E293B] hover:text-[#E2E8F0]'
                }`}>
                {s === 'CONFIRMED' ? <Check className="w-2 h-2" /> : s === 'REJECTED' ? <X className="w-2 h-2" /> : <RefreshCw className="w-2 h-2" />}
                {s === 'CONFIRMED' ? 'CONFIRM' : s === 'REJECTED' ? 'REJECT' : 'RE-CLASS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — SONAR PREVIEW
      ══════════════════════════════════════════════════ */}
      <div className="border-b border-[#0F1E2E] bg-[#030810]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#0F1E2E]">
          <span className="text-[8.5px] font-black text-[#64748B] uppercase tracking-widest">
            SONAR PREVIEW ({target.id})
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
            <span className="text-[7px] text-[#00F5D4] font-bold">LIVE</span>
          </div>
        </div>

        {/* 4 Thumbnail tabs */}
        <div className="grid grid-cols-4 gap-1 p-2">
          {THUMBNAIL_TABS.map(({ key, label, ref }) => (
            <button
              key={key}
              onClick={() => setSonarTab(key)}
              className={`relative rounded overflow-hidden border cursor-pointer transition-all ${
                sonarTab === key
                  ? 'border-[#FFB703] shadow-[0_0_8px_rgba(255,183,3,0.3)]'
                  : 'border-[#1E293B] hover:border-[#334155]'
              }`}
            >
              <canvas
                ref={ref}
                width={64}
                height={48}
                className="w-full h-auto block pointer-events-none"
              />
              <div className={`absolute bottom-0 left-0 right-0 text-center text-[5.5px] font-black py-0.5 ${
                sonarTab === key ? 'bg-[#FFB703] text-[#030810]' : 'bg-black/60 text-[#64748B]'
              }`}>
                {label}
              </div>
            </button>
          ))}
        </div>

        {/* Acoustic Profile cross-section */}
        <div className="px-2 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7.5px] font-black text-[#64748B] uppercase">
              ACOUSTIC PROFILE (CROSS-SECTION)
            </span>
            <span className="text-[7px] text-[#EF4444] font-bold">
              ± {target.shadowLength.toFixed(2)} m
            </span>
          </div>
          <div className="rounded border border-[#0F1E2E] overflow-hidden">
            <canvas
              ref={waveformCanvasRef}
              width={260}
              height={52}
              className="w-full h-[52px]"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — HYDROGRAPHIC TELEMETRY (AUV)
      ══════════════════════════════════════════════════ */}
      <div className="bg-[#03080E] flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#0F1E2E]">
          <span className="text-[8.5px] font-black text-[#64748B] uppercase tracking-widest">
            HYDROGRAPHIC TELEMETRY (AUV-07)
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
            <span className="text-[7px] text-[#00F5D4] font-bold">LIVE</span>
          </div>
        </div>

        {/* Big 4 telemetry blocks */}
        <div className="grid grid-cols-4 gap-px p-2">
          {[
            { icon: Waves,       label: 'DEPTH',        value: `${tel.depth}`,    unit: 'm',   color: '#38BDF8' },
            { icon: Thermometer, label: 'TEMPERATURE',  value: `${tel.temp}`,     unit: '°C',  color: '#F59E0B' },
            { icon: Droplets,    label: 'SALINITY',     value: `${tel.salinity}`, unit: 'PSU', color: '#818CF8' },
            { icon: Navigation,  label: 'CURRENT',      value: `${tel.current}`,  unit: 'm/s', color: '#00F5D4' },
          ].map(({ icon: Icon, label, value, unit, color }) => (
            <div key={label} className="p-1.5 bg-[#030810] border border-[#0F1E2E] rounded text-center">
              <div className="flex justify-center mb-0.5">
                <Icon className="w-2.5 h-2.5" style={{ color }} />
              </div>
              <div className="font-black text-[11px] leading-none" style={{ color }}>
                {value}
              </div>
              <div className="text-[6.5px] text-[#475569]">{unit}</div>
              <div className="text-[5.5px] text-[#334155] uppercase mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* AUV Status bar */}
        <div className="mx-2 mb-1.5 px-2 py-1 bg-[#030810] border border-[#0F1E2E] rounded flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
            <span className="text-[7.5px] font-black text-[#00F5D4] uppercase">AUV STATUS</span>
          </div>
          <span className="text-[7.5px] font-black text-[#E2E8F0] uppercase">SURVEYING</span>
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-4 gap-px mx-2 mb-2">
          {[
            { label: 'SPEED',    value: `${tel.speed}`,    unit: 'kn',  color: '#E2E8F0' },
            { label: 'HEADING',  value: `${tel.heading}°`, unit: 'SW',  color: '#E2E8F0' },
            { label: 'PING RATE',value: `${tel.pingRate}`, unit: 'Hz',  color: '#FFB703' },
            { label: 'BATTERY',  value: `${tel.battery}%`, unit: '',    color: tel.battery > 50 ? '#00F5D4' : tel.battery > 20 ? '#F59E0B' : '#EF4444' },
          ].map(m => (
            <div key={m.label} className="p-1.5 bg-[#030810] border border-[#0F1E2E] rounded text-center">
              <div className="font-black text-[9.5px] leading-none" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="text-[5.5px] text-[#475569] uppercase mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Battery progress */}
        <div className="mx-2 mb-2">
          <div className="w-full h-1 bg-[#0A1520] rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-1000"
              style={{
                width: `${tel.battery}%`,
                background: tel.battery > 50 ? '#00F5D4' : tel.battery > 20 ? '#F59E0B' : '#EF4444',
              }}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FOOTER — MoES Certificate
      ══════════════════════════════════════════════════ */}
      <div className="p-2 border-t border-[#0F1E2E] bg-[#030810] shrink-0">
        <button
          onClick={() => setIsCertModalOpen(true)}
          className="w-full py-1.5 bg-[#0A1520] border border-[#FFB703]/40 hover:bg-[#FFB703]/10 text-[#FFB703] font-black text-[9px] rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,183,3,0.15)]"
        >
          <Award className="w-3 h-3" />
          MoES CLEARANCE CERTIFICATE (SHA-256)
        </button>
      </div>

      <MoESClearanceCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        target={target}
      />
    </aside>
  );
};
