import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, MapPin } from 'lucide-react';
import { CandidateItem, StageId, SurveySite } from '../../data/consoleData';
import { LayerState } from './ConsoleLeftRail';

type DemoPhase = 'idle' | 'running' | 'done';

// Debris class colors
const CLASS_COLORS: Record<string, string> = {
  'Ghost Net (ALDFG)':        '#00D4AA',
  'Lost Fishing Trawl Gear':  '#38bdf8',
  'Anthropogenic Debris Bundle': '#f59e0b',
  'Subsea Pipeline Free-Span': '#fb923c',
  'Industrial Metal Barrel Group': '#c084fc',
  'Natural Basalt Rock Cluster': '#6b7280',
  'Sediment Sand Megaripple':  '#6b7280',
  'Multipath Surface Echo':    '#6b7280',
};
const REJECT_COLOR = '#EF4444';

interface ConsoleSonarCanvasProps {
  currentStageId: StageId;
  activeSite: SurveySite;
  layers: LayerState;
  candidates: CandidateItem[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  hoveredCandidateId?: string | null;
  onHoverCandidate?: (id: string | null) => void;
  currentFrame?: number;
  demoPhase: DemoPhase;
  stageProgress: number; // 0.0 – 1.0, how far through the current stage animation
}

export const ConsoleSonarCanvas: React.FC<ConsoleSonarCanvasProps> = ({
  currentStageId,
  activeSite,
  layers,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  hoveredCandidateId,
  onHoverCandidate,
  currentFrame = 42,
  demoPhase,
  stageProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const animRef = useRef<number>(0);
  const sweepRowRef = useRef<number>(0);

  // ── Canvas render: different visual per stage ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const stageNum = parseInt(currentStageId, 10);

    // Deterministic noise helper (no Math.random in render loop — prevents flicker)
    const hash = (x: number, y: number, seed = 0) =>
      Math.abs(Math.sin(x * 127.1 + y * 311.7 + seed * 74.1) * 43758.5453) % 1;

    // ── Base sonar waterfall texture ──────────────────────────────────────────
    const drawSonarBase = (noisy: boolean, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let x = 0; x < W; x += 3) {
        for (let y = 0; y < H; y += 3) {
          const wave = Math.sin(x * 0.018 + currentFrame * 0.04) * 0.07
                     + Math.sin(y * 0.022) * 0.05 + 0.13;
          const noise = noisy ? hash(x, y, 1) * 0.35 : 0;
          const val = Math.floor((wave + noise) * 45);
          ctx.fillStyle = `rgb(${Math.floor(val * 0.25)},${val},${Math.floor(val * 0.45)})`;
          ctx.fillRect(x, y, 3, 3);
        }
      }
      ctx.restore();
    };

    // ── Nadir centre line ─────────────────────────────────────────────────────
    const drawNadir = () => {
      ctx.fillStyle = '#030503';
      ctx.fillRect(W / 2 - 18, 0, 36, H);
      ctx.strokeStyle = '#1e3820';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);
    };

    // ── Drone survey track ────────────────────────────────────────────────────
    const drawDroneTrack = () => {
      if (!layers.droneTrack) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(74,222,128,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(W * 0.08, H * 0.05);
      ctx.lineTo(W * 0.92, H * 0.95);
      ctx.stroke();
      ctx.setLineDash([]);

      // AUV marker
      const t = Math.min(stageProgress, 1);
      const vx = W * 0.08 + (W * 0.92 - W * 0.08) * t;
      const vy = H * 0.05 + (H * 0.95 - H * 0.05) * t;
      ctx.fillStyle = '#00D4AA';
      ctx.shadowColor = '#00D4AA';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // AUV label
      ctx.fillStyle = '#00D4AA';
      ctx.font = '8px monospace';
      ctx.fillText('◈ AUV', vx + 7, vy + 3);
      ctx.restore();
    };

    // ── Marine life silhouettes (stage 01 only) ──────────────────────────────
    const drawMarineLife = () => {
      const creatures = [
        { x: 0.20, y: 0.25, w: 0.07, h: 0.03, label: '~ fish shoal' },
        { x: 0.55, y: 0.55, w: 0.05, h: 0.025, label: '~ marine life' },
        { x: 0.75, y: 0.30, w: 0.06, h: 0.028, label: '~ kelp bed' },
      ];
      ctx.save();
      ctx.globalAlpha = 0.55;
      creatures.forEach((c) => {
        const cx = c.x * W, cy = c.y * H;
        ctx.fillStyle = '#1e4a2a';
        ctx.beginPath();
        ctx.ellipse(cx, cy, c.w * W, c.h * H, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // label
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#00D4AA';
        ctx.font = '8px monospace';
        ctx.fillText(c.label, cx - 22, cy - c.h * H - 4);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    // ── Raw (unfiltered) detection boxes: 37 candidates ──────────────────────
    const drawRawDetections = (progress = 1) => {
      if (!layers.rawDetections) return;
      const count = Math.floor(candidates.length * Math.min(progress, 1));
      candidates.slice(0, count).forEach((cand) => {
        const cx = (cand.rawX / 100) * W;
        const cy = (cand.rawY / 100) * H;
        ctx.save();
        ctx.strokeStyle = 'rgba(74,222,128,0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 22, cy - 15, 44, 30);
        ctx.fillStyle = 'rgba(74,222,128,0.08)';
        ctx.fillRect(cx - 22, cy - 15, 44, 30);
        ctx.fillStyle = '#00D4AA';
        ctx.font = '7px monospace';
        ctx.fillText(`${(cand.confidence * 100).toFixed(0)}%`, cx - 10, cy + 6);
        ctx.restore();
      });
    };

    // ── Stage 04 FILTER: rejected dissolve + confirmed pulse ─────────────────
    const drawFilteredDetections = () => {
      candidates.forEach((cand) => {
        const cx = (cand.rawX / 100) * W;
        const cy = (cand.rawY / 100) * H;
        const isConfirmed = cand.status === 'CONFIRMED';

        ctx.save();
        if (isConfirmed && layers.confirmedDebris) {
          ctx.strokeStyle = '#00D4AA';
          ctx.shadowColor = '#00D4AA';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - 22, cy - 15, 44, 30);
          ctx.fillStyle = 'rgba(74,222,128,0.12)';
          ctx.fillRect(cx - 22, cy - 15, 44, 30);
          // acoustic highlight
          ctx.fillStyle = '#00D4AA';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 12, 7, 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (!isConfirmed && layers.noiseRejected) {
          // faded red dashed box
          ctx.strokeStyle = 'rgba(239,68,68,0.45)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - 20, cy - 13, 40, 26);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(239,68,68,0.06)';
          ctx.fillRect(cx - 20, cy - 13, 40, 26);
          ctx.fillStyle = 'rgba(239,68,68,0.5)';
          ctx.font = '8px monospace';
          ctx.fillText('✕', cx - 4, cy + 4);
        }
        ctx.restore();
      });
    };

    // ── Stage 05/06 CLASSIFY: colored by class + rejected layer toggle ────────
    const drawClassifiedDetections = () => {
      // Draw confirmed candidates if layer is active
      if (layers.confirmedDebris) {
        candidates.filter((c) => c.status === 'CONFIRMED').forEach((cand) => {
          const cx = (cand.rawX / 100) * W;
          const cy = (cand.rawY / 100) * H;
          const color = CLASS_COLORS[cand.class] || '#00D4AA';
          const isSelected = selectedCandidateId === cand.id || hoveredCandidateId === cand.id;

          ctx.save();
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = isSelected ? 16 : 8;
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.strokeRect(cx - 24, cy - 16, 48, 32);
          ctx.fillStyle = `${color}18`;
          ctx.fillRect(cx - 24, cy - 16, 48, 32);

          // acoustic highlight
          ctx.fillStyle = color;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 11, 6, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // acoustic shadow
          const shadowLen = Math.max(14, cand.shadowLengthM * 9);
          ctx.fillStyle = '#020302';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(cx + 8, cy - 5);
          ctx.lineTo(cx + 8 + shadowLen, cy - 7);
          ctx.lineTo(cx + 8 + shadowLen, cy + 7);
          ctx.lineTo(cx + 8, cy + 5);
          ctx.closePath();
          ctx.fill();

          // class label
          if (layers.classLabels) {
            ctx.fillStyle = color;
            ctx.font = 'bold 7.5px monospace';
            const shortLabel = cand.class.split(' ').slice(0, 2).join(' ');
            ctx.fillText(shortLabel, cx - 23, cy - 19);
          }
          ctx.restore();
        });
      }

      // Draw rejected candidates if layer is active
      if (layers.noiseRejected) {
        candidates.filter((c) => c.status === 'REJECTED').forEach((cand) => {
          const cx = (cand.rawX / 100) * W;
          const cy = (cand.rawY / 100) * H;
          ctx.save();
          ctx.strokeStyle = 'rgba(239,68,68,0.5)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - 20, cy - 13, 40, 26);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(239,68,68,0.06)';
          ctx.fillRect(cx - 20, cy - 13, 40, 26);
          ctx.fillStyle = 'rgba(239,68,68,0.6)';
          ctx.font = '8px monospace';
          ctx.fillText('✕', cx - 4, cy + 4);
          ctx.restore();
        });
      }

      // Draw raw detections if layer is active
      if (layers.rawDetections && !layers.confirmedDebris && !layers.noiseRejected) {
        drawRawDetections(1);
      }
    };

    // ── Stage 06 REPORT: geotag pins ─────────────────────────────────────────
    const drawGeotagPins = () => {
      if (!layers.geotagMarkers) return;
      candidates.filter((c) => c.status === 'CONFIRMED').forEach((cand) => {
        const cx = (cand.rawX / 100) * W;
        const cy = (cand.rawY / 100) * H;
        const color = CLASS_COLORS[cand.class] || '#00D4AA';

        ctx.save();
        // pin stem
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy - 22);
        ctx.stroke();

        // pin head
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy - 24, 5, 0, Math.PI * 2);
        ctx.fill();

        // coordinate tag
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#05121F';
        ctx.fillRect(cx - 42, cy - 50, 84, 22);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(cx - 42, cy - 50, 84, 22);
        ctx.fillStyle = color;
        ctx.font = '7px monospace';
        ctx.fillText(`${cand.lat.toFixed(4)}°N`, cx - 39, cy - 38);
        ctx.fillText(`${cand.lon.toFixed(4)}°E · ${cand.depthM}m`, cx - 39, cy - 28);
        ctx.restore();
      });
    };

    // ── MAIN RENDER DISPATCH ──────────────────────────────────────────────────
    ctx.fillStyle = '#060906';
    ctx.fillRect(0, 0, W, H);

    if (demoPhase === 'idle') {
      // Idle: dim sonar + awaiting message overlay
      drawSonarBase(true, 0.35);
      drawNadir();
      // Overlay text
      ctx.save();
      ctx.fillStyle = 'rgba(6,9,6,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00D4AA';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('● AWAITING MISSION TRIGGER', W / 2, H / 2 - 18);
      ctx.fillStyle = '#4A8090';
      ctx.font = '11px monospace';
      ctx.fillText('Press  [ ▶ RUN LIVE DEMO ]  or  [SPACE]  to begin', W / 2, H / 2 + 10);
      ctx.fillStyle = '#2A5060';
      ctx.font = '9px monospace';
      ctx.fillText('AI-Powered Side-Scan Sonar Debris Detection Pipeline', W / 2, H / 2 + 30);
      ctx.textAlign = 'left';
      ctx.restore();
      return;
    }

    // Stage 01 INGEST — raw noisy sonar + marine life
    if (stageNum >= 1) {
      if (layers.rawSonar) drawSonarBase(true, 0.9);
      if (stageNum === 1) drawMarineLife();
    }

    // Stage 02 DENOISE — clean sonar overlay fades in, split hint
    if (stageNum >= 2) {
      if (layers.denoisedSonar) drawSonarBase(false, stageNum === 2 ? stageProgress : 1);
      drawDroneTrack();
    }

    // Always draw nadir
    drawNadir();

    // Stage 03 DETECT — raw boxes appear one by one
    if (stageNum === 3) {
      drawRawDetections(stageProgress);
    }

    // Stage 04 FILTER — rejected dissolve / confirmed pulse
    if (stageNum === 4) {
      drawFilteredDetections();
    }

    // Stage 05 CLASSIFY — class-colored boxes
    if (stageNum >= 5) {
      drawClassifiedDetections();
    }

    // Stage 06 REPORT — geotag pins
    if (stageNum >= 6) {
      drawGeotagPins();
    }

    // Scanlines overlay
    ctx.save();
    ctx.globalAlpha = 0.045;
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, y, W, 1);
    }
    ctx.restore();

  }, [currentStageId, layers, candidates, activeSite, selectedCandidateId, hoveredCandidateId, currentFrame, demoPhase, stageProgress]);

  // Sweep animation (stage 01 INGEST ping sweep) via requestAnimationFrame
  useEffect(() => {
    if (parseInt(currentStageId, 10) !== 1 || demoPhase !== 'running') return;
    let row = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const animate = () => {
      if (!canvas || !ctx) return;
      // Draw horizontal sweep line
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00D4AA';
      ctx.fillRect(0, row, canvas.width, 2);
      ctx.restore();
      row = (row + 3) % canvas.height;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [currentStageId, demoPhase]);

  const stageNum = parseInt(currentStageId, 10);
  const STAGE_LABELS: Record<string, string> = {
    '1': 'RAW SONAR INGEST — Acoustic Waterfall + Marine Life',
    '2': 'DENOISE — CLAHE + Bilateral Filter · Drone Track Overlay',
    '3': 'DETECT — YOLOv8n ONNX · 37 Raw Candidate Objects',
    '4': 'FILTER — Confidence Gate · 20 Noise Rejected → 17 Confirmed',
    '5': 'CLASSIFY — Debris Taxonomy · 4 Critical Hazard Classes',
    '6': 'REPORT — WGS84 Geotag Pins · Anomaly Dossier Ready',
  };

  return (
    <div className="flex-1 bg-[#060906] flex flex-col relative select-none font-mono overflow-hidden">
      {/* Canvas Top Bar */}
      <div className="h-7 bg-[#05121F] border-b border-[#0D2E4A] px-3 flex items-center justify-between text-[9px] text-[#4A8090] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3 h-3 text-[#00D4AA]" />
          <span className="text-[#E0F7F4] font-bold">
            {demoPhase === 'idle' ? 'SONAR MOSAIC // AWAITING' : STAGE_LABELS[String(stageNum)] || `STAGE ${currentStageId}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline">{activeSite.swathWidthM}m SWATH · FRAME {String(currentFrame).padStart(3,'0')}</span>
          <button onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))} className="p-1 hover:text-[#00D4AA]" title="Zoom In"><ZoomIn className="w-3 h-3" /></button>
          <button onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))} className="p-1 hover:text-[#00D4AA]" title="Zoom Out"><ZoomOut className="w-3 h-3" /></button>
          <button onClick={() => setZoomLevel(1.0)} className="p-1 hover:text-[#00D4AA]" title="Reset Zoom"><RotateCcw className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#060906] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={480}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
          className="w-full h-full object-contain block"
        />

        {/* Coordinate corners */}
        <div className="absolute top-2 left-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          NW: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute top-2 right-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          NE: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 left-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          SW: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 right-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          SE: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>

        {/* Stage 05/06 — interactive reticle overlays */}
        {(stageNum >= 5 && demoPhase !== 'idle') && candidates.map((cand) => {
          const isConfirmed = cand.status === 'CONFIRMED';
          if (isConfirmed && !layers.confirmedDebris) return null;
          if (!isConfirmed && !layers.noiseRejected) return null;
          const isSelected = selectedCandidateId === cand.id;
          const isHovered = hoveredCandidateId === cand.id;
          const color = isConfirmed ? (CLASS_COLORS[cand.class] || '#00D4AA') : REJECT_COLOR;
          return (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate(cand.id)}
              onMouseEnter={() => onHoverCandidate && onHoverCandidate(cand.id)}
              onMouseLeave={() => onHoverCandidate && onHoverCandidate(null)}
              style={{ left: `${cand.rawX}%`, top: `${cand.rawY}%`, borderColor: color }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group z-20 ${isSelected || isHovered ? 'z-40' : ''}`}
            >
              {isConfirmed ? (
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'scale-125' : isHovered ? 'scale-110' : ''}`}
                  style={{ borderColor: color, background: `${color}20`, boxShadow: isSelected ? `0 0 14px ${color}` : undefined }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                </div>
              ) : (
                <div className={`w-6 h-6 border border-dashed flex items-center justify-center transition-all ${isSelected ? 'scale-125 border-[#EF4444] bg-[#EF4444]/20' : 'border-[#EF4444]/60 bg-[#05121F]/80'}`}>
                  <span className="text-[8px] text-[#EF4444] font-bold">✕</span>
                </div>
              )}
              {/* Hover class or reject pill */}
              {(isSelected || isHovered) && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 whitespace-nowrap text-[8px] font-bold border bg-[#05121F]"
                  style={{ color, borderColor: color }}>
                  {cand.id} · {isConfirmed ? cand.class.split(' ').slice(0,2).join(' ') : 'REJECTED NOISE'} · {(cand.confidence*100).toFixed(0)}%
                </div>
              )}
            </div>
          );
        })}

        {/* Stage 06 REPORT: dossier overlay panel */}
        {stageNum >= 6 && demoPhase !== 'idle' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#05121F]/95 border border-[#00D4AA]/70 px-6 py-3 text-center shadow-[0_0_30px_rgba(74,222,128,0.25)] z-30">
            <div className="text-[#00D4AA] font-black text-sm tracking-wider mb-1">✓ ANOMALY DOSSIER READY</div>
            <div className="text-[#4A8090] text-[9px] font-mono">
              17 confirmed debris targets · 4 critical hazards · {activeSite.swathWidthM}m swath · WGS84 geotagged
            </div>
            <div className="text-[#2A5060] text-[8.5px] mt-1">PS Component 3 of 4 — Geotagging & Reporting Engine ✓</div>
          </div>
        )}

        {/* PS component badge per stage */}
        {demoPhase !== 'idle' && (
          <div className="absolute top-10 right-2 bg-[#05121F]/90 border border-[#0D2E4A] px-2 py-1 text-[8px] font-mono text-[#4A8090] z-20 space-y-0.5">
            <div className={stageNum >= 1 ? 'text-[#00D4AA]' : ''}>① INGEST {stageNum >= 1 ? '✓' : ''}</div>
            <div className={stageNum >= 2 ? 'text-[#00D4AA]' : ''}>② DENOISE {stageNum >= 2 ? '✓' : ''}</div>
            <div className={stageNum >= 3 ? 'text-[#00D4AA]' : ''}>③ DETECT {stageNum >= 3 ? '✓' : ''}</div>
            <div className={stageNum >= 4 ? 'text-[#00D4AA]' : ''}>④ FILTER {stageNum >= 4 ? '✓' : ''}</div>
            <div className={stageNum >= 5 ? 'text-[#00D4AA]' : ''}>⑤ CLASSIFY {stageNum >= 5 ? '✓' : ''}</div>
            <div className={stageNum >= 6 ? 'text-[#00D4AA]' : ''}>⑥ REPORT {stageNum >= 6 ? '✓' : ''}</div>
          </div>
        )}

        {/* Class legend (stage 05+) */}
        {stageNum >= 5 && demoPhase !== 'idle' && layers.classLabels && (
          <div className="absolute bottom-8 left-2 bg-[#05121F]/90 border border-[#0D2E4A] px-2 py-1.5 text-[8px] font-mono space-y-0.5 z-20">
            <div className="text-[#4A8090] font-bold mb-0.5 uppercase">DEBRIS CLASS LEGEND</div>
            {Object.entries(CLASS_COLORS).filter(([,c]) => c !== '#6b7280').map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span style={{ color }}>{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
              <span className="text-[#6b7280]">Natural / Noise-Rejected</span>
            </div>
          </div>
        )}

        {/* Bottom sensor info */}
        <div className="absolute bottom-1 left-2 text-[8px] text-[#2A5060]">
          {activeSite.frequency} · {activeSite.swathWidthM}m SWATH · TOW DEPTH {activeSite.towDepthM}m
        </div>
        <div className="absolute bottom-1 right-2 flex items-center gap-1.5 text-[8px] text-[#00D4AA]">
          <div className="w-12 h-1 bg-[#00D4AA]" />
          <span>10 m SCALE</span>
        </div>
      </div>
    </div>
  );
};
