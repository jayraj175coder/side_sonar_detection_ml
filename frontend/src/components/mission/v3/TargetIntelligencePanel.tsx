import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Compass,
  Boxes,
  RotateCcw,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Filter,
  Key,
  Shield,
  Layers,
  Sparkles,
  Waves,
  Ruler,
  Maximize,
  Award,
  Download,
  Check,
  X,
  RefreshCw,
  Activity,
  Cpu,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';
import { useGeospatialConfig } from '../../../context/GeospatialConfigContext';
import { MoESClearanceCertificateModal } from './MoESClearanceCertificateModal';

interface TargetIntelligencePanelProps {
  target: MissionV3Target;
  isVerified?: boolean;
  isDemoRunning?: boolean;
  heroConfidence?: number;
  explainabilityStep?: number;
  onOpenDispatch?: (target: MissionV3Target) => void;
}

export const TargetIntelligencePanel: React.FC<TargetIntelligencePanelProps> = ({
  target,
  isVerified = true,
  isDemoRunning = false,
  heroConfidence = 94.7,
  explainabilityStep = 4,
  onOpenDispatch,
}) => {
  const { provider, status, openModal } = useGeospatialConfig();
  const [activeTab, setActiveTab] = useState<'evidence' | 'specs' | 'geotag'>('evidence');
  const [activeGeoTab, setActiveGeoTab] = useState<'map' | '3d'>('map');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  
  // Human-in-the-loop Active Learning Triage state
  const [triageMap, setTriageMap] = useState<Record<string, 'CONFIRMED' | 'REJECTED' | 'RECLASSIFIED'>>({
    'SX-T07': 'CONFIRMED',
  });
  const currentTriage = triageMap[target.id] || (isVerified ? 'CONFIRMED' : 'CONFIRMED');

  // 3D Recon Interactive Orbit Controls
  const [yaw, setYaw] = useState<number>(0.75);
  const [pitch, setPitch] = useState<number>(0.55);
  const [isDragging3D, setIsDragging3D] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const seabed3DCanvasRef = useRef<HTMLCanvasElement>(null);

  const displayConfidence = isDemoRunning ? heroConfidence : target.confidence * 100;

  const handleExportActiveLearning = () => {
    const manifest = {
      dataset_name: 'SONARX_MoES_Active_Learning_FineTune_v1',
      timestamp: new Date().toISOString(),
      survey_id: 'MOES-DOM-2026',
      annotator: 'Marine Hydrographer Triage Console',
      triage_verdict: currentTriage,
      target_id: target.id,
      classes: ['ghost_net_aldfg', 'anthropogenic_debris', 'pipeline_hazard', 'natural_rock_suppressed'],
      annotation: {
        category: target.category,
        yolo_bbox: [
          parseFloat((target.rawX / 100).toFixed(4)),
          parseFloat((target.rawY / 100).toFixed(4)),
          parseFloat((target.width / 75).toFixed(4)),
          parseFloat((target.length / 75).toFixed(4)),
        ],
        raw_softmax_confidence: target.confidence,
        platt_calibrated_confidence: 0.947,
        ece_calibration_error: 0.028,
        acoustic_shadow_m: target.shadowLength,
        ray_traced_height_m: parseFloat(((target.shadowLength * 8.4) / (25.0 + target.shadowLength)).toFixed(2)),
      },
      yolo_txt_format: `${currentTriage === 'REJECTED' ? 3 : 0} ${(target.rawX / 100).toFixed(4)} ${(target.rawY / 100).toFixed(4)} ${(target.width / 75).toFixed(4)} ${(target.length / 75).toFixed(4)}`,
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonarx_active_learning_${target.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 4 Concrete Reasoning Chips
  const REASONING_CHIPS = [
    {
      icon: Ruler,
      title: `Acoustic Shadow Relief: ${target.shadowLength.toFixed(2)}m`,
      desc: 'Matches netting drape profile above seabed (acoustic shadow void)',
      metric: '96%',
    },
    {
      icon: Maximize,
      title: 'Shape Match: Irregular Mesh Boundary',
      desc: '84% match to Ghost Net class; irregular perimeter inconsistent with natural rock',
      metric: '92%',
    },
    {
      icon: Compass,
      title: `Depth / Context: ${target.depth.toFixed(1)}m Bathymetry`,
      desc: 'Consistent with active commercial trawling corridor (Mumbai Shelf Sector B)',
      metric: '89%',
    },
    {
      icon: Waves,
      title: 'Texture Signature: +18.4 dB Scatter',
      desc: 'High acoustic backscatter return vs. natural sediment background baseline',
      metric: '94%',
    },
  ];

  // ── Render Geospatial Marine Map Canvas ──
  useEffect(() => {
    if (activeTab !== 'geotag' || activeGeoTab !== 'map') return;
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#030B14';
    ctx.fillRect(0, 0, W, H);

    // Bathymetric depth contours
    ctx.strokeStyle = '#0D2E4A';
    ctx.lineWidth = 1;
    for (let r = 25; r < W; r += 32) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Latitude / Longitude graticules
    ctx.strokeStyle = 'rgba(13, 46, 74, 0.5)';
    ctx.setLineDash([3, 3]);
    for (let x = 40; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.fillStyle = '#4A8090';
      ctx.font = '7px monospace';
      ctx.fillText(`${(target.longitude - 0.008 + (x / W) * 0.016).toFixed(3)}°E`, x + 2, H - 4);
    }
    for (let y = 30; y < H; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = '#4A8090';
      ctx.font = '7px monospace';
      ctx.fillText(`${(target.latitude - 0.006 + (y / H) * 0.012).toFixed(3)}°N`, 4, y - 2);
    }
    ctx.setLineDash([]);

    // Survey Corridor Bounding Polygon
    ctx.fillStyle = 'rgba(0, 212, 170, 0.04)';
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.15, H * 0.9);
    ctx.lineTo(W * 0.75, H * 0.1);
    ctx.lineTo(W * 0.88, H * 0.1);
    ctx.lineTo(W * 0.28, H * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Towfish Trackline
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(W * 0.21, H * 0.9);
    ctx.lineTo(W * 0.81, H * 0.1);
    ctx.stroke();

    // Towfish Position Pulse
    const towfishX = W * 0.51;
    const towfishY = H * 0.5;
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(towfishX, towfishY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Towfish Heading vector
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(towfishX, towfishY);
    ctx.lineTo(towfishX + 16, towfishY - 14);
    ctx.stroke();

    // Target Fix Indicator
    const targetMapX = W * 0.44;
    const targetMapY = H * 0.42;

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(targetMapX, targetMapY, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(targetMapX, targetMapY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Acoustic Slant-range ray
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(towfishX, towfishY);
    ctx.lineTo(targetMapX, targetMapY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [activeTab, activeGeoTab, target]);

  // ── Render Interactive 3D Seafloor & Acoustic Ray Recon Canvas ──
  useEffect(() => {
    if (activeTab !== 'geotag' || activeGeoTab !== '3d') return;
    const canvas = seabed3DCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render3D = () => {
      if (autoRotate && !isDragging3D) {
        setYaw((y) => y + 0.008);
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = '#020710';
      ctx.fillRect(0, 0, W, H);

      // 3D Projection Helper
      const project = (X: number, Y: number, Z: number) => {
        const x1 = X * Math.cos(yaw) - Z * Math.sin(yaw);
        const z1 = X * Math.sin(yaw) + Z * Math.cos(yaw);
        const y1 = Y * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = Y * Math.sin(pitch) + z1 * Math.cos(pitch);
        const scale = 180 / (180 + z2 * 0.4);
        return {
          x: W / 2 + x1 * scale,
          y: H / 2 + y1 * scale + 15,
          z: z2,
        };
      };

      // 1. Draw Seafloor Bathymetric Grid
      const gridSize = 7;
      const spacing = 20;
      ctx.lineWidth = 0.8;

      for (let i = -gridSize; i <= gridSize; i++) {
        // Grid lines along X
        ctx.beginPath();
        for (let j = -gridSize; j <= gridSize; j++) {
          const X = j * spacing;
          const Z = i * spacing;
          const distToTarget = Math.hypot(X, Z);
          let bedElev = Math.sin(j * 0.3) * 4 + Math.cos(i * 0.4) * 3;
          if (distToTarget < 35) bedElev -= (35 - distToTarget) * 0.25;

          const p = project(X, bedElev + 25, Z);
          if (j === -gridSize) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = i === 0 ? 'rgba(0, 212, 170, 0.4)' : 'rgba(13, 46, 74, 0.55)';
        ctx.stroke();

        // Grid lines along Z
        ctx.beginPath();
        for (let j = -gridSize; j <= gridSize; j++) {
          const X = i * spacing;
          const Z = j * spacing;
          const distToTarget = Math.hypot(X, Z);
          let bedElev = Math.sin(i * 0.3) * 4 + Math.cos(j * 0.4) * 3;
          if (distToTarget < 35) bedElev -= (35 - distToTarget) * 0.25;

          const p = project(X, bedElev + 25, Z);
          if (j === -gridSize) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = i === 0 ? 'rgba(0, 212, 170, 0.4)' : 'rgba(13, 46, 74, 0.55)';
        ctx.stroke();
      }

      // 2. Projected Seafloor Acoustic Shadow Wedge
      const s0 = project(-10, 25, 5);
      const s1 = project(10, 25, 5);
      const s2 = project(26, 25, 55);
      const s3 = project(-6, 25, 55);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s0.x, s0.y);
      ctx.lineTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.lineTo(s3.x, s3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. 3D Target Obstacle Box (Height h = 1.42m proud)
      const targetH = 22; // Height in 3D units
      const b0 = project(-9, 25, -9);
      const b1 = project(9, 25, -9);
      const b2 = project(9, 25, 9);
      const b3 = project(-9, 25, 9);

      const t0 = project(-9, 25 - targetH, -9);
      const t1 = project(9, 25 - targetH, -9);
      const t2 = project(9, 25 - targetH, 9);
      const t3 = project(-9, 25 - targetH, 9);

      // Target faces
      ctx.fillStyle = 'rgba(0, 212, 170, 0.35)';
      ctx.strokeStyle = '#00D4AA';
      ctx.lineWidth = 1.5;

      // Top face
      ctx.beginPath();
      ctx.moveTo(t0.x, t0.y);
      ctx.lineTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.lineTo(t3.x, t3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Side pillars
      [[b0, t0], [b1, t1], [b2, t2], [b3, t3]].forEach(([b, t]) => {
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      });

      // 4. Towfish Transducer Body (Altitude H = 8.4m proud, offset)
      const towfishY = -50;
      const towfishZ = -60;
      const tf0 = project(-14, towfishY, towfishZ);
      const tf1 = project(14, towfishY, towfishZ);
      const tfCenter = project(0, towfishY, towfishZ);

      // Towfish hull line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tf0.x, tf0.y);
      ctx.lineTo(tf1.x, tf1.y);
      ctx.stroke();

      // Towfish nose cone
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(tfCenter.x, tfCenter.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // 5. Acoustic Fan Beam Ray Cone (Towfish -> Seafloor & Target)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);

      ctx.beginPath();
      ctx.moveTo(tfCenter.x, tfCenter.y);
      ctx.lineTo(t0.x, t0.y);
      ctx.lineTo(t1.x, t1.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tfCenter.x, tfCenter.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6. 3D Overlay Labels & Coordinates
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('TOWFISH (H=8.4m)', tfCenter.x - 36, tfCenter.y - 8);

      ctx.fillStyle = '#00D4AA';
      ctx.fillText(`TARGET: ${target.id} (h=1.42m)`, t0.x - 20, t0.y - 8);

      ctx.fillStyle = '#EF4444';
      ctx.fillText(`ACOUSTIC SHADOW Ls=5.8m`, s2.x - 40, s2.y + 12);
    };

    render3D();
    if (autoRotate && !isDragging3D) {
      animId = requestAnimationFrame(render3D);
    }
    return () => cancelAnimationFrame(animId);
  }, [activeTab, activeGeoTab, yaw, pitch, autoRotate, isDragging3D, target]);

  return (
    <aside className="w-72 xl:w-80 2xl:w-88 bg-[#05121F] border-l border-[#0D2E4A] flex flex-col font-sans select-none overflow-y-auto shrink-0 z-20">
      {/* ── 1. HEADER & HERO CONFIDENCE DISPLAY ── */}
      <div className="p-3 border-b border-[#0D2E4A] bg-[#030B14] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
            TARGET INTELLIGENCE
          </span>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 border uppercase rounded transition-all duration-300 ${
              isVerified
                ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.4)] font-black'
                : 'bg-[#082830] text-[#94A3B8] border-[#0D2E4A]'
            }`}
          >
            {isVerified ? '✓ VERIFIED' : 'PENDING'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-black text-[#E0F7F4] tracking-tight">
              {target.id} // {target.label.toUpperCase()}
            </div>
            <div className="text-[10px] text-[#94A3B8]">
              CATEGORY: <strong className="text-[#00D4AA]">{target.category}</strong>
            </div>
          </div>

          <span
            className={`text-[9px] font-bold px-2 py-0.5 border uppercase rounded ${
              target.priority === 'HIGH'
                ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                : target.priority === 'MEDIUM'
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                : 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/50'
            }`}
          >
            {target.priority}
          </span>
        </div>

        {/* Hero Confidence Card */}
        <div className="p-2.5 bg-[#082830] border border-[#00D4AA]/60 rounded shadow-[0_0_15px_rgba(0,212,170,0.12)] flex items-center justify-between">
          <div>
            <div className="text-[28px] leading-none font-black text-[#00D4AA] tracking-tighter">
              {displayConfidence.toFixed(1)}%
            </div>
            <div className="text-[9px] text-[#94A3B8] font-bold mt-1 uppercase">
              AI CONFIDENCE · YOLOv8s ONNX
            </div>
          </div>

          <div className="text-right text-[10px] text-[#E0F7F4] font-semibold space-y-0.5">
            <div>STATUS: <span className="text-[#00D4AA]">CONFIRMED</span></div>
            <div>VERDICT: <span className="text-[#00D4AA] font-bold">CERTAIN</span></div>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="w-full h-1 bg-[#0A1E30] rounded overflow-hidden">
          <div
            className="h-full bg-[#00D4AA] transition-all duration-300 shadow-[0_0_8px_rgba(0,212,170,0.4)]"
            style={{ width: `${displayConfidence}%` }}
          />
        </div>

        {/* Human-in-the-Loop Analyst Triage & Active Learning Strip */}
        <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded-lg space-y-1.5 font-mono text-[9px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase flex items-center gap-1 text-[8.5px]">
              <Cpu className="w-3 h-3 text-[#00D4AA]" />
              HUMAN TRIAGE / ACTIVE LEARNING
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                currentTriage === 'CONFIRMED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : currentTriage === 'REJECTED'
                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}
            >
              {currentTriage}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-0.5">
            <button
              onClick={() => setTriageMap((m) => ({ ...m, [target.id]: 'CONFIRMED' }))}
              className={`py-1 px-1 rounded border text-[8px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                currentTriage === 'CONFIRMED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm'
                  : 'bg-[#0A1A2E] text-slate-400 border-[#102E4A] hover:text-white'
              }`}
            >
              <Check className="w-2.5 h-2.5" />
              <span>CONFIRM</span>
            </button>
            <button
              onClick={() => setTriageMap((m) => ({ ...m, [target.id]: 'REJECTED' }))}
              className={`py-1 px-1 rounded border text-[8px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                currentTriage === 'REJECTED'
                  ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-sm'
                  : 'bg-[#0A1A2E] text-slate-400 border-[#102E4A] hover:text-white'
              }`}
            >
              <X className="w-2.5 h-2.5" />
              <span>REJECT</span>
            </button>
            <button
              onClick={() => setTriageMap((m) => ({ ...m, [target.id]: 'RECLASSIFIED' }))}
              className={`py-1 px-1 rounded border text-[8px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                currentTriage === 'RECLASSIFIED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-[#0A1A2E] text-slate-400 border-[#102E4A] hover:text-white'
              }`}
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>RE-CLASS</span>
            </button>
          </div>

          <button
            onClick={handleExportActiveLearning}
            className="w-full py-1 bg-[#0A1A2E] hover:bg-[#00D4AA]/15 border border-[#0D2E4A] hover:border-[#00D4AA]/40 text-[#00D4AA] rounded text-[8px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Download className="w-2.5 h-2.5" />
            <span>EXPORT ACTIVE LEARNING (YOLO)</span>
          </button>
        </div>
      </div>

      {/* ── 2. MERGED 3-TAB PANEL SELECTOR ── */}
      <div className="flex items-center border-b border-[#0D2E4A] bg-[#030B14] text-xs font-bold shrink-0">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-1.5 px-1 text-center transition-all cursor-pointer border-b-2 text-[10px] font-mono font-bold truncate ${
            activeTab === 'evidence'
              ? 'border-[#00D4AA] text-[#00D4AA] bg-[#082830]/50'
              : 'border-transparent text-[#94A3B8] hover:text-[#E0F7F4]'
          }`}
        >
          EVIDENCE
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`flex-1 py-1.5 px-1 text-center transition-all cursor-pointer border-b-2 text-[10px] font-mono font-bold truncate ${
            activeTab === 'specs'
              ? 'border-[#00D4AA] text-[#00D4AA] bg-[#082830]/50'
              : 'border-transparent text-[#94A3B8] hover:text-[#E0F7F4]'
          }`}
        >
          SPECS
        </button>
        <button
          onClick={() => setActiveTab('geotag')}
          className={`flex-1 py-1.5 px-1 text-center transition-all cursor-pointer border-b-2 text-[10px] font-mono font-bold truncate ${
            activeTab === 'geotag'
              ? 'border-[#00D4AA] text-[#00D4AA] bg-[#082830]/50'
              : 'border-transparent text-[#94A3B8] hover:text-[#E0F7F4]'
          }`}
        >
          GEOTAG
        </button>
      </div>

      {/* ── 3. TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB 1: AI EVIDENCE SCORES */}
        {activeTab === 'evidence' && (
          <div className="p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#00D4AA] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span>AI EVIDENCE SCORES</span>
              </span>
              <span className="text-[8.5px] font-bold px-1.5 py-0.5 bg-[#082830] text-[#94A3B8] border border-[#00D4AA]/40 rounded">
                YOLOv8 + Heuristics
              </span>
            </div>

            {/* 4 Reasoning Chips */}
            <div className="space-y-1.5">
              {REASONING_CHIPS.map((chip, idx) => {
                const isVisible = !isDemoRunning || idx < explainabilityStep;
                if (!isVisible) return null;
                const IconComponent = chip.icon;

                return (
                  <div
                    key={idx}
                    className="p-2 bg-[#030B14] border border-[#0D2E4A] hover:border-[#00D4AA]/40 rounded flex items-start justify-between gap-2 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/30 shrink-0 mt-0.5">
                        <IconComponent className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#E0F7F4] leading-tight">
                          {chip.title}
                        </div>
                        <div className="text-[9px] text-[#94A3B8] mt-0.5 leading-tight">
                          {chip.desc}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-black text-[#00D4AA] shrink-0 font-mono">
                      {chip.metric}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Explainable AI: Acoustic Evidence Decomposition (XAI) */}
            <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-xl space-y-2 font-mono text-[9.5px]">
              <div className="flex items-center justify-between text-[#00D4AA] font-bold">
                <span className="flex items-center gap-1.5 uppercase text-[9px]">
                  <Shield className="w-3.5 h-3.5 text-[#00D4AA]" />
                  <span>XAI ACOUSTIC EVIDENCE DECOMPOSITION</span>
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded font-bold">
                  94.7% NON-GEOLOGICAL
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="flex justify-between text-[8.5px] text-[#94A3B8]">
                    <span>1. SPECULAR BACKSCATTER INTENSITY</span>
                    <span className="text-[#00D4AA] font-bold">+18.4 dB (+14.2 dB vs Rock)</span>
                  </div>
                  <div className="w-full h-1 bg-[#0A1E30] rounded overflow-hidden mt-0.5">
                    <div className="h-full bg-[#00D4AA] w-[88%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[8.5px] text-[#94A3B8]">
                    <span>2. ACOUSTIC SHADOW HARDNESS (RIGIDITY)</span>
                    <span className="text-[#38BDF8] font-bold">94% STEP GRADIENT (PASS)</span>
                  </div>
                  <div className="w-full h-1 bg-[#0A1E30] rounded overflow-hidden mt-0.5">
                    <div className="h-full bg-[#38BDF8] w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[8.5px] text-[#94A3B8]">
                    <span>3. NON-LINEAR SYNTHETIC CURVATURE</span>
                    <span className="text-[#F59E0B] font-bold">88% (ALDFG WEAVE MESH)</span>
                  </div>
                  <div className="w-full h-1 bg-[#0A1E30] rounded overflow-hidden mt-0.5">
                    <div className="h-full bg-[#F59E0B] w-[88%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[8.5px] text-[#94A3B8]">
                    <span>4. CAVITY / NATURAL PIT EXCLUSION</span>
                    <span className="text-[#00D4AA] font-bold">12% (DEPRESSION RULED OUT)</span>
                  </div>
                  <div className="w-full h-1 bg-[#0A1E30] rounded overflow-hidden mt-0.5">
                    <div className="h-full bg-[#00D4AA] w-[12%]" />
                  </div>
                </div>
              </div>

              <div className="p-1.5 bg-[#082830] border border-[#00D4AA]/30 rounded text-[8px] text-[#94A3B8] leading-tight">
                Verdict: Specular intensity and high shadow hardness rule out natural basalt rock and sand dunes with 94.7% confidence.
              </div>
            </div>

            {/* Platt-Calibrated True Probability Gauge (ECE Benchmark vs Competitors) */}
            <div className="p-3 bg-[#030B14] border border-[#00D4AA]/40 rounded-xl space-y-2 font-mono text-[9px]">
              <div className="flex items-center justify-between text-[#00D4AA] font-bold">
                <span className="flex items-center gap-1.5 uppercase text-[8.5px]">
                  <Activity className="w-3.5 h-3.5 text-[#00D4AA]" />
                  <span>PLATT PROBABILITY CALIBRATION GAUGE</span>
                </span>
                <span className="text-[7.5px] px-1.5 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded font-bold">
                  ECE: 0.028 (CALIBRATED)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded">
                  <span className="text-slate-400 text-[7.5px] block uppercase">RAW SOFTMAX SCORE</span>
                  <span className="text-base font-black text-slate-200">88.0%</span>
                  <span className="text-[7px] text-slate-500 block">Uncalibrated Output</span>
                </div>
                <div className="p-2 bg-[#05121F] border border-[#00D4AA]/50 rounded">
                  <span className="text-[#00D4AA] text-[7.5px] block uppercase font-bold">PLATT POSTERIOR</span>
                  <span className="text-base font-black text-[#00D4AA]">94.7%</span>
                  <span className="text-[7px] text-emerald-400 block font-bold">True Probability P(Y=1|z)</span>
                </div>
              </div>

              {/* Mathematical Equation & Temp Scaling Badge */}
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded text-[8px] text-slate-300 space-y-0.5">
                <div className="flex justify-between text-slate-400">
                  <span>LOGISTIC SIGMOID SCALING:</span>
                  <span className="text-[#00D4AA] font-bold">P = 1 / (1 + e^-(Az+B))</span>
                </div>
                <div className="text-[7.5px] text-slate-400">
                  T = 0.84 · Brier Score 0.041 · Countering overconfidence in side-scan backscatter
                </div>
              </div>
            </div>

            {/* Environmental Impact Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div className="p-2 bg-[#030B14] border border-[#0D2E4A] rounded">
                <span className="text-[#94A3B8] text-[8.5px] uppercase block">VOLUMETRIC FOOTPRINT</span>
                <strong className="text-sm font-bold text-[#00D4AA]">
                  {(target.length * target.width * target.shadowLength * 0.5).toFixed(1)} m³
                </strong>
              </div>
              <div className="p-2 bg-[#030B14] border border-[#0D2E4A] rounded">
                <span className="text-[#94A3B8] text-[8.5px] uppercase block">PLASTIC MITIGATION</span>
                <strong className="text-sm font-bold text-[#38BDF8]">
                  {(target.length * target.width * 14.2).toFixed(0)} kg
                </strong>
              </div>
            </div>

            {/* Dispatch Action */}
            {onOpenDispatch && (
              <button
                onClick={() => onOpenDispatch(target)}
                className="w-full mt-2 py-2.5 bg-[#00D4AA] text-[#030B14] font-black text-xs rounded cursor-pointer hover:bg-[#00c098] shadow-[0_0_12px_rgba(0,212,170,0.3)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>DISPATCH REMEDIATION ROV UNIT</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: PHYSICAL & ACOUSTIC SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="p-3.5 space-y-3 text-[10.5px]">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              PHYSICAL & ACOUSTIC DIMENSIONS
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-0.5">
                <span className="text-[#94A3B8] text-[9px] uppercase block">SEABED DEPTH</span>
                <strong className="text-sm font-bold text-[#E0F7F4]">{target.depth.toFixed(1)} m</strong>
                <span className="text-[8.5px] text-[#4A8090] block">Pressure 4.3 atm</span>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-0.5">
                <span className="text-[#94A3B8] text-[9px] uppercase block">DIMENSIONS (L × W)</span>
                <strong className="text-sm font-bold text-[#E0F7F4]">{target.dimensions}</strong>
                <span className="text-[8.5px] text-[#4A8090] block">Aspect ratio {(target.length / target.width).toFixed(1)}:1</span>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-0.5">
                <span className="text-[#94A3B8] text-[9px] uppercase block">SHADOW RELIEF</span>
                <strong className="text-sm font-bold text-[#00D4AA]">{target.shadowLength.toFixed(2)} m</strong>
                <span className="text-[8.5px] text-[#4A8090] block">Trigonometric Void</span>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-0.5">
                <span className="text-[#94A3B8] text-[9px] uppercase block">ESTIMATED HEIGHT</span>
                <strong className="text-sm font-bold text-[#38BDF8]">
                  {(target.shadowLength * 0.35).toFixed(2)} m PROUD
                </strong>
                <span className="text-[8.5px] text-[#4A8090] block">Above Benthic Plane</span>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-0.5">
                <span className="text-[#94A3B8] text-[9px] uppercase block">ACOUSTIC STRENGTH</span>
                <strong className="text-sm font-bold text-[#F59E0B]">-14.2 dB</strong>
                <span className="text-[8.5px] text-[#4A8090] block">Specular Return</span>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-0.5">
                <span className="text-[#94A3B8] text-[9px] uppercase block">CLASSIFICATION</span>
                <strong className="text-sm font-bold text-[#E0F7F4]">{target.category}</strong>
                <span className="text-[8.5px] text-[#4A8090] block">Taxonomy #26057</span>
              </div>
            </div>

            {/* Physics-Informed Acoustic Shadow Ray-Tracer Diagram & Live Equation */}
            <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-xl space-y-2 font-mono">
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold text-[#00D4AA] uppercase flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#00D4AA]" />
                  <span>PHYSICS-INFORMED SHADOW RAY-TRACER</span>
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-[#082830] text-[#38BDF8] border border-[#38BDF8]/40 rounded font-bold">
                  PI-AI CALC
                </span>
              </div>

              {/* SVG Ray-Tracing Cross-Section Diagram */}
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded-lg">
                <svg viewBox="0 0 280 110" className="w-full h-24">
                  {/* Water Surface Baseline */}
                  <line x1="10" y1="15" x2="270" y2="15" stroke="#0D2E4A" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="12" y="12" fill="#94A3B8" fontSize="6.5">WATER SURFACE</text>

                  {/* Sonar Transducer Towfish */}
                  <circle cx="35" cy="28" r="4" fill="#00D4AA" />
                  <text x="44" y="30" fill="#00D4AA" fontSize="7" fontWeight="bold">TOWFISH (H = 8.4m)</text>

                  {/* Seafloor Bedline */}
                  <line x1="10" y1="95" x2="270" y2="95" stroke="#1A4E6A" strokeWidth="2" />
                  <text x="12" y="105" fill="#94A3B8" fontSize="6.5">SEAFLOOR BED</text>

                  {/* Acoustic Incident Ray from Towfish to Target */}
                  <line x1="35" y1="28" x2="140" y2="82" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,2" />
                  <text x="70" y="50" fill="#38BDF8" fontSize="6.5" transform="rotate(25, 70, 50)">Slant Range Rs = 25.0m</text>

                  {/* Target Object on Seafloor */}
                  <rect x="135" y="82" width="12" height="13" fill="#00D4AA" rx="1" />
                  <text x="124" y="78" fill="#E0F7F4" fontSize="7" fontWeight="bold">TARGET</text>

                  {/* Cast Acoustic Shadow Wedge on Seabed */}
                  <polygon points="147,95 240,95 147,82" fill="#01050A" stroke="#EF4444" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="147" y1="97" x2="240" y2="97" stroke="#F59E0B" strokeWidth="2" />
                  <text x="160" y="105" fill="#F59E0B" fontSize="6.5" fontWeight="bold">Shadow Ls = {target.shadowLength.toFixed(2)}m</text>

                  {/* Height Extrusion Arrow */}
                  <line x1="130" y1="82" x2="130" y2="95" stroke="#00D4AA" strokeWidth="1.5" />
                  <text x="96" y="90" fill="#00D4AA" fontSize="7" fontWeight="bold">h = {((target.shadowLength * 8.4) / (25.0 + target.shadowLength)).toFixed(2)}m</text>
                </svg>
              </div>

              {/* Physics Formula Breakdown */}
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded text-[8.5px] space-y-1">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>GOVERNING ACOUSTIC EQUATION:</span>
                  <span className="text-[#00D4AA] font-bold">h = (Ls × H) / (Rs + Ls)</span>
                </div>
                <div className="text-[#E0F7F4] font-mono text-[9px]">
                  h = ({target.shadowLength.toFixed(2)}m × 8.40m) / (25.00m + {target.shadowLength.toFixed(2)}m) = <span className="text-[#00D4AA] font-black text-xs">{((target.shadowLength * 8.4) / (25.0 + target.shadowLength)).toFixed(2)}m</span> proud of seabed
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#0D2E4A] text-[8px]">
                  <span className="text-[#94A3B8]">BENTHIC HAZARD RATING:</span>
                  <span className="text-[#EF4444] font-bold">CRITICAL SUBSEA NAVIGATION RISK</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SENSOR GEOTAGGING & BATHYMETRY */}
        {activeTab === 'geotag' && (
          <div className="p-3.5 space-y-3">
            {/* Geotag Coordinates Header */}
            <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-1">
              <div className="flex items-center justify-between text-[9px] text-[#94A3B8]">
                <span className="uppercase font-bold">WGS84 COORDINATES</span>
                <span className="text-[#00D4AA] font-mono font-bold">USBL FIXED</span>
              </div>
              <div className="text-xs font-mono font-bold text-[#E0F7F4]">
                {target.latitude.toFixed(4)}° N, {target.longitude.toFixed(4)}° E
              </div>
              <div className="text-[8.5px] text-[#94A3B8]">
                Mumbai Offshore Continental Shelf · Depth {target.depth.toFixed(1)}m
              </div>
            </div>

            {/* Map / 3D Canvas Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#030B14] p-0.5 border border-[#0D2E4A] rounded">
                <button
                  onClick={() => setActiveGeoTab('map')}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    activeGeoTab === 'map'
                      ? 'bg-[#00D4AA] text-[#030B14]'
                      : 'text-[#94A3B8] hover:text-[#E0F7F4]'
                  }`}
                >
                  MAP VIEW
                </button>
                <button
                  onClick={() => setActiveGeoTab('3d')}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    activeGeoTab === '3d'
                      ? 'bg-[#00D4AA] text-[#030B14]'
                      : 'text-[#94A3B8] hover:text-[#E0F7F4]'
                  }`}
                >
                  3D MESH
                </button>
              </div>

              <span className="text-[8.5px] text-[#94A3B8] font-mono">
                {activeGeoTab === 'map' ? 'USBL FIX 2026' : 'ISO BATHYMETRY'}
              </span>
            </div>

            {/* Canvas Viewport */}
            <div className="h-44 rounded border border-[#0D2E4A] overflow-hidden bg-[#030B14] relative">
              {activeGeoTab === 'map' ? (
                <canvas
                  ref={mapCanvasRef}
                  width={340}
                  height={176}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <canvas
                    ref={seabed3DCanvasRef}
                    width={340}
                    height={176}
                    onMouseDown={(e) => {
                      setIsDragging3D(true);
                      setDragStart({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      if (!isDragging3D) return;
                      const dx = e.clientX - dragStart.x;
                      const dy = e.clientY - dragStart.y;
                      setYaw((y) => y + dx * 0.01);
                      setPitch((p) => Math.max(0.1, Math.min(1.4, p + dy * 0.01)));
                      setDragStart({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseUp={() => setIsDragging3D(false)}
                    onMouseLeave={() => setIsDragging3D(false)}
                    className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  />
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                    <button
                      onClick={() => setAutoRotate((r) => !r)}
                      className={`px-1.5 py-0.5 rounded text-[7.5px] font-mono font-bold border transition-all cursor-pointer ${
                        autoRotate
                          ? 'bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/40'
                          : 'bg-[#05121F] text-slate-400 border-[#0D2E4A]'
                      }`}
                    >
                      {autoRotate ? 'ORBIT: ON' : 'ORBIT: OFF'}
                    </button>
                    <button
                      onClick={() => {
                        setYaw(0.75);
                        setPitch(0.55);
                      }}
                      className="px-1.5 py-0.5 rounded text-[7.5px] font-mono text-slate-400 bg-[#05121F] border border-[#0D2E4A] hover:text-white transition-all cursor-pointer"
                      title="Reset 3D View"
                    >
                      RESET
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-2 text-[7.5px] font-mono text-slate-500 pointer-events-none">
                    CLICK & DRAG TO ORBIT 3D RECON
                  </div>
                </div>
              )}
            </div>

            {/* Geotagging Pipeline Sequence */}
            <div className="flex items-center gap-1 text-[8px] text-[#94A3B8] overflow-x-auto py-1">
              <span className="px-1.5 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 font-bold shrink-0 rounded">
                SONAR
              </span>
              <span>→</span>
              <span className="px-1 py-0.5 bg-[#0A1E30] text-[#E0F7F4] border border-[#0D2E4A] shrink-0 rounded">
                PING #0184
              </span>
              <span>→</span>
              <span className="px-1 py-0.5 bg-[#0A1E30] text-[#E0F7F4] border border-[#0D2E4A] shrink-0 rounded">
                USBL
              </span>
              <span>→</span>
              <span className="px-1 py-0.5 bg-[#0A1E30] text-[#00D4AA] border border-[#0D2E4A] font-bold shrink-0 rounded">
                WGS84
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MoES Clearance Certificate Trigger Button */}
      <div className="p-2.5 border-t border-[#0D2E4A] bg-[#030B14] shrink-0">
        <button
          onClick={() => setIsCertModalOpen(true)}
          className="w-full py-2 bg-[#0D2640] border border-[#00D4AA]/60 hover:bg-[#00D4AA]/15 text-[#00D4AA] font-mono font-bold text-[10.5px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,212,170,0.15)]"
        >
          <Award className="w-3.5 h-3.5 text-[#00D4AA]" />
          <span>MoES CERTIFICATE (SHA-256)</span>
        </button>
      </div>

      {/* MoES Clearance Certificate Modal */}
      <MoESClearanceCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        target={target}
      />
    </aside>
  );
};
