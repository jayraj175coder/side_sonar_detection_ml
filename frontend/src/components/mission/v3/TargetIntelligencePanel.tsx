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
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface TargetIntelligencePanelProps {
  target: MissionV3Target;
  isVerified?: boolean;
}

export const TargetIntelligencePanel: React.FC<TargetIntelligencePanelProps> = ({
  target,
  isVerified = true,
}) => {
  const [activeGeoTab, setActiveGeoTab] = useState<'map' | '3d'>('map');
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const seabed3DCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── 1. Render Geospatial Marine Map Canvas ──
  useEffect(() => {
    if (activeGeoTab !== 'map') return;
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Dark marine bathymetry background
    ctx.fillStyle = '#030B14';
    ctx.fillRect(0, 0, W, H);

    // Bathymetric depth contours
    ctx.strokeStyle = '#0D2E4A';
    ctx.lineWidth = 1;
    for (let r = 30; r < W; r += 35) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Latitude / Longitude grid lines
    ctx.strokeStyle = 'rgba(13, 46, 74, 0.4)';
    ctx.setLineDash([3, 3]);
    for (let x = 40; x < W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 30; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Survey track corridor (vessel line)
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, H * 0.85);
    ctx.lineTo(W * 0.8, H * 0.15);
    ctx.stroke();

    // Towfish swath envelope (translucent cyan corridor)
    ctx.fillStyle = 'rgba(0, 212, 170, 0.05)';
    ctx.beginPath();
    ctx.moveTo(W * 0.15, H * 0.85);
    ctx.lineTo(W * 0.75, H * 0.15);
    ctx.lineTo(W * 0.85, H * 0.15);
    ctx.lineTo(W * 0.25, H * 0.85);
    ctx.closePath();
    ctx.fill();

    // Target Geotag Marker (Center of map)
    const tx = W / 2;
    const ty = H / 2;

    // Radar pulse ring
    ctx.strokeStyle = '#00D4AA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00D4AA';
    ctx.beginPath();
    ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Callout box on map
    ctx.fillStyle = '#05121F';
    ctx.strokeStyle = '#00D4AA';
    ctx.lineWidth = 1;
    ctx.fillRect(tx + 12, ty - 22, 110, 28);
    ctx.strokeRect(tx + 12, ty - 22, 110, 28);

    ctx.fillStyle = '#E0F7F4';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(`${target.id} · ${target.label}`, tx + 16, ty - 12);
    ctx.fillStyle = '#00D4AA';
    ctx.font = '7.5px monospace';
    ctx.fillText(`${target.latitude.toFixed(4)}°N, ${target.longitude.toFixed(4)}°E`, tx + 16, ty - 2);
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

    // Isometric 3D grid with target relief peak
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

        // Elevation bump for the target
        let elevation = Math.sin(c * 0.5) * 4 + Math.cos(r * 0.6) * 3;
        if (distToCenter < 3.5) {
          elevation -= (3.5 - distToCenter) * 7.5; // Upward protrusion
        }

        const isoY = originY + (c + r) * cellH + elevation;

        // Draw mesh edges
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

    // 3D Target Marker Pin
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
      <div className="p-4 border-b border-[#0D2E4A] bg-[#030B14] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold text-[#4A8090] uppercase tracking-widest">
            TARGET INTELLIGENCE
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] rounded-sm">
            {isVerified ? '✓ VERIFIED' : 'PENDING'}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-black text-[#E0F7F4] tracking-tight">
              {target.id} // {target.label.toUpperCase()}
            </div>
            <div className="text-[10px] text-[#4A8090]">
              CATEGORY: <strong className="text-[#00D4AA]">{target.category}</strong>
            </div>
          </div>

          <span
            className={`text-[9px] font-black px-2.5 py-1 border uppercase rounded-xs ${
              target.priority === 'HIGH'
                ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : target.priority === 'MEDIUM'
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                : 'bg-[#4A8090]/20 text-[#4A8090] border-[#4A8090]/50'
            }`}
          >
            {target.priority} PRIORITY
          </span>
        </div>

        {/* DOMINANT CONFIDENCE NUMBER */}
        <div className="p-3 bg-[#082830] border border-[#00D4AA]/60 rounded-sm shadow-[0_0_18px_rgba(0,212,170,0.15)] flex items-center justify-between">
          <div>
            <div className="text-[34px] leading-none font-black text-[#00D4AA] tracking-tighter">
              {(target.confidence * 100).toFixed(1)}%
            </div>
            <div className="text-[9px] text-[#4A8090] font-bold mt-1 uppercase">
              AI CONFIDENCE · YOLOv8n ONNX
            </div>
          </div>

          <div className="text-right text-[10px] text-[#E0F7F4] font-semibold space-y-0.5">
            <div>STATUS: <span className="text-[#00D4AA]">CONFIRMED</span></div>
            <div>VERDICT: <span className="text-[#00D4AA]">HIGH CERTAINTY</span></div>
          </div>
        </div>
      </div>

      {/* ── 2. TARGET DETAILS GRID ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#05121F] space-y-2">
        <div className="text-[9.5px] font-bold text-[#4A8090] uppercase tracking-wider">
          PHYSICAL & ACOUSTIC SPECIFICATIONS
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">DEPTH</div>
            <div className="text-sm font-bold text-[#E0F7F4]">{target.depth.toFixed(1)} m</div>
          </div>
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">ESTIMATED SIZE</div>
            <div className="text-sm font-bold text-[#E0F7F4]">{target.dimensions}</div>
          </div>
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">ACOUSTIC SHADOW</div>
            <div className="text-sm font-bold text-[#00D4AA]">{target.shadowLength.toFixed(2)} m RELIEF</div>
          </div>
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A]">
            <div className="text-[#4A8090] text-[8.5px] uppercase">WGS84 COORDINATES</div>
            <div className="text-[9.5px] font-bold text-[#E0F7F4]">
              {target.latitude.toFixed(4)}° N<br />{target.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. EVIDENCE PANEL: "WHY SONARX FLAGGED THIS" ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#030B14] space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black text-[#00D4AA] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span>WHY SONARX FLAGGED THIS</span>
          </div>
          <span className="text-[8.5px] text-[#4A8090]">EXPLAINABLE AI</span>
        </div>

        {/* Quantitative Match Bars */}
        <div className="space-y-1.5 text-[9px]">
          <div>
            <div className="flex justify-between text-[#E0F7F4] mb-0.5">
              <span>OBJECT SHAPE</span>
              <strong className="text-[#00D4AA]">{target.evidence.shape}%</strong>
            </div>
            <div className="w-full h-1.5 bg-[#0A1E30] rounded-xs overflow-hidden">
              <div className="h-full bg-[#00D4AA]" style={{ width: `${target.evidence.shape}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#E0F7F4] mb-0.5">
              <span>ACOUSTIC SHADOW</span>
              <strong className="text-[#00D4AA]">{target.evidence.shadow}%</strong>
            </div>
            <div className="w-full h-1.5 bg-[#0A1E30] rounded-xs overflow-hidden">
              <div className="h-full bg-[#00D4AA]" style={{ width: `${target.evidence.shadow}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#E0F7F4] mb-0.5">
              <span>SEABED CONTRAST</span>
              <strong className="text-[#00D4AA]">{target.evidence.contrast}%</strong>
            </div>
            <div className="w-full h-1.5 bg-[#0A1E30] rounded-xs overflow-hidden">
              <div className="h-full bg-[#00D4AA]" style={{ width: `${target.evidence.contrast}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#E0F7F4] mb-0.5">
              <span>TEXTURE / SPECULARITY</span>
              <strong className="text-[#00D4AA]">{target.evidence.texture}%</strong>
            </div>
            <div className="w-full h-1.5 bg-[#0A1E30] rounded-xs overflow-hidden">
              <div className="h-full bg-[#00D4AA]" style={{ width: `${target.evidence.texture}%` }} />
            </div>
          </div>
        </div>

        {/* Plain Language Detection Evidence Checklist */}
        <div className="p-2.5 bg-[#05121F] border border-[#0D2E4A] rounded-sm space-y-1.5">
          <div className="text-[9px] font-bold text-[#4A8090] uppercase">DETECTION EVIDENCE</div>
          <div className="space-y-1 text-[8.5px] text-[#E0F7F4]">
            {target.detectionEvidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[#00D4AA] font-bold shrink-0">✓</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. FALSE-POSITIVE FILTER CARD ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#05121F] space-y-2">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-[#4A8090] uppercase">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-[#00D4AA]" />
            <span>FALSE-POSITIVE FILTER</span>
          </div>
          <span className="text-[#00D4AA]">VERIFIED</span>
        </div>

        {/* Funnel Metrics */}
        <div className="p-2 bg-[#030B14] border border-[#0D2E4A] grid grid-cols-3 gap-1 text-center font-mono">
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

        {/* Example Rejection Pills */}
        <div className="space-y-1 text-[8px]">
          <div className="flex items-center justify-between p-1 bg-[#0A1E30] border border-[#0D2E4A]">
            <span className="text-[#E0F7F4]">Natural Rock</span>
            <span className="text-[#4A8090]">32% · <strong className="text-[#EF4444]">FILTERED</strong></span>
          </div>
          <div className="flex items-center justify-between p-1 bg-[#0A1E30] border border-[#0D2E4A]">
            <span className="text-[#E0F7F4]">Acoustic Artifact</span>
            <span className="text-[#4A8090]">28% · <strong className="text-[#EF4444]">FILTERED</strong></span>
          </div>
          <div className="flex items-center justify-between p-1 bg-[#082830] border border-[#00D4AA]/40">
            <span className="text-[#00D4AA] font-bold">Ghost Net (SX-T07)</span>
            <span className="text-[#00D4AA]">94.7% · <strong>CONFIRMED</strong></span>
          </div>
        </div>
      </div>

      {/* ── 5. GEOTAGGED MAP & 3D SEAFLOOR TABS ── */}
      <div className="p-3.5 bg-[#030B14] space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-1.5">
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

            <div className="text-[8.5px] text-[#4A8090]">
              {target.latitude.toFixed(4)}°N, {target.longitude.toFixed(4)}°E
            </div>
          </div>

          {/* Interactive Visual Window */}
          <div className="h-44 w-full border border-[#0D2E4A] bg-[#01050A] relative overflow-hidden rounded-xs">
            {activeGeoTab === 'map' ? (
              <canvas ref={mapCanvasRef} width={340} height={176} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full relative">
                <canvas ref={seabed3DCanvasRef} width={340} height={176} className="w-full h-full object-cover" />
                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  <span className="px-1 py-0.2 bg-[#05121F]/80 border border-[#0D2E4A] text-[7px] text-[#4A8090]">
                    TARGET
                  </span>
                  <span className="px-1 py-0.2 bg-[#05121F]/80 border border-[#0D2E4A] text-[7px] text-[#4A8090]">
                    SWATH
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verified Target Notification Badge */}
        <div className="p-2 bg-[#082830] border border-[#00D4AA]/60 rounded-xs flex items-center justify-between text-[9px]">
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
