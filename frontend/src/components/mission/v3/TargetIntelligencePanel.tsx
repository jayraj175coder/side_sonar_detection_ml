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
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const seabed3DCanvasRef = useRef<HTMLCanvasElement>(null);

  const displayConfidence = isDemoRunning ? heroConfidence : target.confidence * 100;

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

  // ── Render 3D Bathymetry Mesh Canvas ──
  useEffect(() => {
    if (activeTab !== 'geotag' || activeGeoTab !== '3d') return;
    const canvas = seabed3DCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#030B14';
    ctx.fillRect(0, 0, W, H);

    const rows = 12;
    const cols = 12;
    const originX = W / 2;
    const originY = H * 0.35;
    const cellW = 14;
    const cellH = 7;

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
  }, [activeTab, activeGeoTab, target]);

  return (
    <aside className="w-80 lg:w-96 bg-[#05121F] border-l border-[#0D2E4A] flex flex-col font-sans select-none overflow-y-auto shrink-0 z-20">
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
            <div>VERDICT: <span className="text-[#00D4AA]">HIGH CERTAINTY</span></div>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="w-full h-1 bg-[#0A1E30] rounded overflow-hidden">
          <div
            className="h-full bg-[#00D4AA] transition-all duration-300 shadow-[0_0_8px_rgba(0,212,170,0.4)]"
            style={{ width: `${displayConfidence}%` }}
          />
        </div>
      </div>

      {/* ── 2. MERGED 3-TAB PANEL SELECTOR ── */}
      <div className="flex items-center border-b border-[#0D2E4A] bg-[#030B14] text-xs font-bold shrink-0">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
            activeTab === 'evidence'
              ? 'border-[#00D4AA] text-[#00D4AA] bg-[#082830]/50'
              : 'border-transparent text-[#94A3B8] hover:text-[#E0F7F4]'
          }`}
        >
          EVIDENCE
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
            activeTab === 'specs'
              ? 'border-[#00D4AA] text-[#00D4AA] bg-[#082830]/50'
              : 'border-transparent text-[#94A3B8] hover:text-[#E0F7F4]'
          }`}
        >
          SPECS
        </button>
        <button
          onClick={() => setActiveTab('geotag')}
          className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
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

            {/* Geometry Evidence Text */}
            <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] rounded space-y-1 text-[9.5px]">
              <span className="text-[#94A3B8] font-bold block uppercase text-[8.5px]">
                ACOUSTIC SHADOW RELIEF FORMULA
              </span>
              <p className="text-[#E0F7F4] font-mono leading-relaxed">
                H = (L_shadow × H_altitude) / (R_slant + L_shadow)
              </p>
              <p className="text-[#94A3B8] leading-tight">
                Physical shadow indicates target is elevated above seafloor sediment rather than buried.
              </p>
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
            <div className="h-44 rounded border border-[#0D2E4A] overflow-hidden bg-[#030B14]">
              {activeGeoTab === 'map' ? (
                <canvas
                  ref={mapCanvasRef}
                  width={340}
                  height={176}
                  className="w-full h-full object-cover"
                />
              ) : (
                <canvas
                  ref={seabed3DCanvasRef}
                  width={340}
                  height={176}
                  className="w-full h-full object-cover"
                />
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
    </aside>
  );
};
