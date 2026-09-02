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
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';
import { useGeospatialConfig } from '../../../context/GeospatialConfigContext';

interface TargetIntelligencePanelProps {
  target: MissionV3Target;
  isVerified?: boolean;
  isDemoRunning?: boolean;
  heroConfidence?: number;
  explainabilityStep?: number; // 0 to 4 rows visible
}

export const TargetIntelligencePanel: React.FC<TargetIntelligencePanelProps> = ({
  target,
  isVerified = true,
  isDemoRunning = false,
  heroConfidence = 94.7,
  explainabilityStep = 4,
}) => {
  const { provider, status, openModal } = useGeospatialConfig();
  const [activeGeoTab, setActiveGeoTab] = useState<'map' | '3d'>('map');
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const seabed3DCanvasRef = useRef<HTMLCanvasElement>(null);

  const displayConfidence = isDemoRunning ? heroConfidence : target.confidence * 100;

  // 4 Concrete Reasoning Chips specified by user
  const REASONING_CHIPS = [
    {
      icon: Ruler,
      title: 'Acoustic Shadow Relief: 2.31m',
      desc: 'Matches netting drape profile above seabed (acoustic shadow void)',
      metric: '96%',
    },
    {
      icon: Maximize,
      title: 'Shape Match: Elongated Mesh Pattern',
      desc: '84% match to Ghost Net class; irregular boundary inconsistent with rock',
      metric: '92%',
    },
    {
      icon: Compass,
      title: 'Depth / Context: 43.1m Bathymetry',
      desc: 'Consistent with heavy commercial trawling corridor (Mumbai Shelf Sector B)',
      metric: '89%',
    },
    {
      icon: Waves,
      title: 'Texture Signature: +18.4 dB Scatter',
      desc: 'High acoustic backscatter return vs. natural sediment baseline',
      metric: '94%',
    },
  ];

  // ── 1. Render Geospatial Marine Map Canvas ──
  useEffect(() => {
    if (activeGeoTab !== 'map') return;
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
      ctx.fillStyle = '#2A5060';
      ctx.font = '6.5px monospace';
      ctx.fillText(`${(target.longitude - 0.008 + (x / W) * 0.016).toFixed(3)}°E`, x + 2, H - 4);
    }
    for (let y = 30; y < H; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = '#2A5060';
      ctx.font = '6.5px monospace';
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

    // Target Geotag Marker
    const tx = W / 2;
    const ty = H / 2;

    ctx.strokeStyle = '#00D4AA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00D4AA';
    ctx.beginPath();
    ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const boxW = 120;
    const boxH = 30;
    ctx.fillStyle = 'rgba(5, 18, 31, 0.92)';
    ctx.strokeStyle = '#00D4AA';
    ctx.lineWidth = 1;
    ctx.fillRect(tx + 14, ty - 24, boxW, boxH);
    ctx.strokeRect(tx + 14, ty - 24, boxW, boxH);

    ctx.fillStyle = '#E0F7F4';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`${target.id} · ${target.label}`, tx + 18, ty - 14);

    ctx.fillStyle = '#00D4AA';
    ctx.font = '7.5px monospace';
    ctx.fillText(`${target.latitude.toFixed(4)}°N, ${target.longitude.toFixed(4)}°E`, tx + 18, ty - 4);
    ctx.fillStyle = '#4A8090';
    ctx.font = '7px monospace';
    ctx.fillText(`DEPTH: ${target.depth.toFixed(1)}m (USBL FIX)`, tx + 18, ty + 4);
  }, [activeGeoTab, target]);

  // ── 2. Render 3D Seafloor Heightmap ──
  useEffect(() => {
    if (activeGeoTab !== '3d') return;
    const canvas = seabed3DCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#01050A';
    ctx.fillRect(0, 0, W, H);

    const rows = 16;
    const cols = 20;
    const cellW = 12;
    const cellH = 6;
    const originX = W / 2;
    const originY = H * 0.28;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isoX = originX + (c - r) * cellW;
        const distToCenter = Math.hypot(c - cols / 2, r - rows / 2);

        let elevation = Math.sin(c * 0.5) * 4 + Math.cos(r * 0.6) * 3;
        if (distToCenter < 3.5) {
          elevation -= (3.5 - distToCenter) * 7.5;
        }

        const isoY = originY + (c + r) * cellH + elevation;
        ctx.strokeStyle = distToCenter < 3.5 ? '#00D4AA' : 'rgba(13, 46, 74, 0.6)';
        ctx.lineWidth = distToCenter < 3.5 ? 1.5 : 0.8;

        if (c < cols - 1) {
          const nextIsoX = originX + (c + 1 - r) * cellW;
          const nextDist = Math.hypot(c + 1 - cols / 2, r - rows / 2);
          let nextElev = Math.sin((c + 1) * 0.5) * 4 + Math.cos(r * 0.6) * 3;
          if (nextDist < 3.5) nextElev -= (3.5 - nextDist) * 7.5;
          const nextIsoY = originY + (c + 1 + r) * cellH + nextElev;

          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(nextIsoX, nextIsoY);
          ctx.stroke();
        }

        if (r < rows - 1) {
          const nextIsoX = originX + (c - (r + 1)) * cellW;
          const nextDist = Math.hypot(c - cols / 2, r + 1 - rows / 2);
          let nextElev = Math.sin(c * 0.5) * 4 + Math.cos((r + 1) * 0.6) * 3;
          if (nextDist < 3.5) nextElev -= (3.5 - nextDist) * 7.5;
          const nextIsoY = originY + (c + r + 1) * cellH + nextElev;

          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(nextIsoX, nextIsoY);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = '#00D4AA';
    ctx.beginPath();
    ctx.arc(originX, originY + (cols / 2 + rows / 2) * cellH - 24, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00D4AA';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(originX, originY + (cols / 2 + rows / 2) * cellH - 24);
    ctx.lineTo(originX, originY + (cols / 2 + rows / 2) * cellH);
    ctx.stroke();
  }, [activeGeoTab, target]);

  return (
    <aside className="w-80 lg:w-96 bg-[#05121F] border-l border-[#0D2E4A] flex flex-col font-mono select-none overflow-y-auto shrink-0 z-20">
      {/* ── 1. HEADER & HERO CONFIDENCE DISPLAY ── */}
      <div className="p-3 border-b border-[#0D2E4A] bg-[#030B14] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#4A8090] uppercase tracking-widest">
            TARGET INTELLIGENCE
          </span>
          <span
            className={`text-[8.5px] font-black px-2 py-0.5 border uppercase rounded-xs transition-all duration-300 ${
              isVerified
                ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.5)] scale-105'
                : 'bg-[#082830] text-[#4A8090] border-[#0D2E4A]'
            }`}
          >
            {isVerified ? '✓ VERIFIED' : 'PENDING'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-black text-[#E0F7F4] tracking-tight">
              {target.id} // {target.label.toUpperCase()}
            </div>
            <div className="text-[9.5px] text-[#4A8090]">
              CATEGORY: <strong className="text-[#00D4AA]">{target.category}</strong>
            </div>
          </div>

          <span
            className={`text-[8.5px] font-black px-2 py-0.5 border uppercase rounded-xs ${
              target.priority === 'HIGH'
                ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : target.priority === 'MEDIUM'
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                : 'bg-[#4A8090]/20 text-[#4A8090] border-[#4A8090]/50'
            }`}
          >
            {target.priority}
          </span>
        </div>

        {/* DOMINANT CONFIDENCE NUMBER (ANIMATED COUNT-UP) */}
        <div className="p-2.5 bg-[#082830] border border-[#00D4AA]/60 rounded-xs shadow-[0_0_18px_rgba(0,212,170,0.15)] flex items-center justify-between">
          <div>
            <div className="text-[32px] leading-none font-black text-[#00D4AA] tracking-tighter">
              {displayConfidence.toFixed(1)}%
            </div>
            <div className="text-[8.5px] text-[#4A8090] font-bold mt-1 uppercase">
              AI CONFIDENCE · YOLOv8n ONNX
            </div>
          </div>

          <div className="text-right text-[9.5px] text-[#E0F7F4] font-semibold space-y-0.5">
            <div>STATUS: <span className="text-[#00D4AA]">CONFIRMED</span></div>
            <div>VERDICT: <span className="text-[#00D4AA]">HIGH CERTAINTY</span></div>
          </div>
        </div>

        {/* Animated Confidence Bar */}
        <div className="w-full h-1 bg-[#0A1E30] rounded-xs overflow-hidden">
          <div
            className="h-full bg-[#00D4AA] transition-all duration-300 shadow-[0_0_8px_rgba(0,212,170,0.4)]"
            style={{ width: `${displayConfidence}%` }}
          />
        </div>
      </div>

      {/* ── 2. PROMINENT EXPLAINABILITY PANEL ("WHY SONARX FLAGGED THIS") ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#05121F] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[10.5px] font-black text-[#00D4AA] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span>AI EVIDENCE SCORES</span>
          </div>
          <span className="text-[7.5px] font-bold px-1.5 py-0.2 bg-[#082830] text-[#7C98A6] border border-[#00D4AA]/40 rounded-xs uppercase">
            Model / Heuristic Evidence
          </span>
        </div>
        <div className="text-[8px] text-[#7C98A6]">
          Evidence scores derived from YOLOv8n spatial activations & acoustic shadow geometry:
        </div>

        {/* 4 Reasoning Chips (Animates in during demo) */}
        <div className="space-y-1.5">
          {REASONING_CHIPS.map((chip, idx) => {
            const isVisible = !isDemoRunning || idx < explainabilityStep;
            if (!isVisible) return null;

            const IconComponent = chip.icon;

            return (
              <div
                key={idx}
                className="p-2 bg-[#030B14] border border-[#0D2E4A] hover:border-[#00D4AA]/40 rounded-xs flex items-start justify-between gap-2 transition-all duration-300 animate-in fade-in slide-in-from-top-1"
              >
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-xs bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/30 shrink-0 mt-0.5">
                    <IconComponent className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#E0F7F4] leading-tight">
                      {chip.title}
                    </div>
                    <div className="text-[8px] text-[#4A8090] mt-0.5 leading-tight">
                      {chip.desc}
                    </div>
                  </div>
                </div>

                <span className="text-[8.5px] font-black text-[#00D4AA] shrink-0 font-mono">
                  {chip.metric}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. TARGET DETAILS & SPECS ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#030B14] space-y-2">
        <div className="text-[9.5px] font-bold text-[#4A8090] uppercase tracking-wider">
          PHYSICAL & ACOUSTIC SPECIFICATIONS
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">DEPTH</div>
            <div className="text-sm font-bold text-[#E0F7F4]">{target.depth.toFixed(1)} m</div>
          </div>
          <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">ESTIMATED SIZE</div>
            <div className="text-sm font-bold text-[#E0F7F4]">{target.dimensions}</div>
          </div>
          <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">ACOUSTIC SHADOW</div>
            <div className="text-sm font-bold text-[#00D4AA]">{target.shadowLength.toFixed(2)} m RELIEF</div>
          </div>
          <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">WGS84 POSITION</div>
            <div className="text-[9.5px] font-bold text-[#E0F7F4]">
              {target.latitude.toFixed(4)}° N<br />{target.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. VISUAL SENSOR GEOTAGGING PIPELINE ── */}
      <div className="p-3 border-b border-[#0D2E4A] bg-[#05121F] space-y-1.5">
        <div className="text-[8.5px] font-bold text-[#4A8090] uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#00D4AA]">
            <Compass className="w-3 h-3 text-[#00D4AA]" />
            <span>SENSOR GEOTAGGING PIPELINE</span>
          </div>
          <span className="text-[#00D4AA] text-[7.5px] font-bold">SENSOR INTRINSIC</span>
        </div>

        <div className="flex items-center gap-1 text-[7.5px] text-[#4A8090] overflow-x-auto py-1">
          <span className="px-1.5 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 font-bold shrink-0 rounded-xs">
            SONAR DETECTION
          </span>
          <span>→</span>
          <span className="px-1 py-0.5 bg-[#0A1E30] text-[#E0F7F4] border border-[#0D2E4A] shrink-0 rounded-xs">
            PING #{target.id.replace('SX-T', '0184')}
          </span>
          <span>→</span>
          <span className="px-1 py-0.5 bg-[#0A1E30] text-[#E0F7F4] border border-[#0D2E4A] shrink-0 rounded-xs">
            USBL NAV
          </span>
          <span>→</span>
          <span className="px-1 py-0.5 bg-[#0A1E30] text-[#00D4AA] border border-[#0D2E4A] font-bold shrink-0 rounded-xs">
            WGS84
          </span>
          <span>→</span>
          <span className="px-1 py-0.5 bg-[#0A1E30] text-[#38BDF8] border border-[#0D2E4A] shrink-0 rounded-xs">
            MAP
          </span>
        </div>
      </div>

      {/* ── 5. FALSE-POSITIVE FILTER CARD ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#030B14] space-y-2">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-[#4A8090] uppercase">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-[#00D4AA]" />
            <span>FALSE-POSITIVE FILTER</span>
          </div>
          <span className="text-[#00D4AA]">VERIFIED</span>
        </div>

        <div className="p-2 bg-[#05121F] border border-[#0D2E4A] grid grid-cols-3 gap-1 text-center font-mono">
          <div>
            <div className="text-[14px] font-black text-[#E0F7F4]">37</div>
            <div className="text-[7.5px] text-[#4A8090] uppercase">RAW CANDIDATES</div>
          </div>
          <div className="border-x border-[#0D2E4A]">
            <div className="text-[14px] font-black text-[#F59E0B]">20</div>
            <div className="text-[7.5px] text-[#F59E0B] uppercase">NATURAL / NOISE</div>
          </div>
          <div>
            <div className="text-[14px] font-black text-[#00D4AA]">17</div>
            <div className="text-[7.5px] text-[#00D4AA] uppercase">VALID DEBRIS</div>
          </div>
        </div>
      </div>

      {/* ── 6. GEOTAGGED MAP & 3D SEAFLOOR WITH API KEY FALLBACK ── */}
      <div className="p-3.5 bg-[#05121F] space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveGeoTab('map')}
                className={`px-2.5 py-1 text-[9px] font-bold border transition-all cursor-pointer rounded-xs ${
                  activeGeoTab === 'map'
                    ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA]'
                    : 'bg-[#0A1E30] text-[#4A8090] border-[#0D2E4A]'
                }`}
              >
                🗺️ GEOTAGGED MAP
              </button>
              <button
                onClick={() => setActiveGeoTab('3d')}
                className={`px-2.5 py-1 text-[9px] font-bold border transition-all cursor-pointer rounded-xs ${
                  activeGeoTab === '3d'
                    ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA]'
                    : 'bg-[#0A1E30] text-[#4A8090] border-[#0D2E4A]'
                }`}
              >
                🌐 VIEW IN 3D
              </button>
            </div>

            <button
              onClick={openModal}
              className="flex items-center gap-1 text-[8px] text-[#4A8090] hover:text-[#00D4AA] cursor-pointer"
            >
              <Key className="w-2.5 h-2.5" />
              <span>CONFIG</span>
            </button>
          </div>

          {/* Coordinate Status Line */}
          <div className="flex items-center justify-between text-[8px] px-1 py-0.5 bg-[#030B14] border border-[#0D2E4A]">
            <div className="flex items-center gap-1 text-[#00D4AA] font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>GEOTAGGING: ✓ COORDINATES AVAILABLE</span>
            </div>
            <span className="text-[#E0F7F4] font-mono">
              {target.latitude.toFixed(4)}°N, {target.longitude.toFixed(4)}°E
            </span>
          </div>

          {/* Interactive Visual Window */}
          <div className="h-36 w-full border border-[#0D2E4A] bg-[#01050A] relative overflow-hidden rounded-xs">
            {activeGeoTab === 'map' ? (
              <canvas ref={mapCanvasRef} width={340} height={144} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full relative">
                <canvas ref={seabed3DCanvasRef} width={340} height={144} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Verified Target Notification Badge */}
        <div className="p-2 bg-[#082830] border border-[#00D4AA]/60 rounded-xs flex items-center justify-between text-[9px] mt-2">
          <div className="flex items-center gap-1.5 text-[#00D4AA] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TARGET VERIFIED // READY FOR SALVAGE</span>
          </div>
          <span className="text-[#E0F7F4] font-bold">MoES READY</span>
        </div>
      </div>
    </aside>
  );
};
