import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, MapPin, Radio, Compass } from 'lucide-react';
import { CandidateItem, StageId, SurveySite } from '../../data/consoleData';
import { LayerState } from './ConsoleLeftRail';
import { sonarAudio } from '../../utils/sonarAudio';

type DemoPhase = 'idle' | 'running' | 'done';

const CLASS_COLORS: Record<string, string> = {
  'Ghost Net (ALDFG)':            '#00D4AA',
  'Lost Fishing Trawl Gear':      '#38bdf8',
  'Anthropogenic Debris Bundle':  '#f59e0b',
  'Subsea Pipeline Free-Span':    '#fb923c',
  'Industrial Metal Barrel Group':'#c084fc',
  'Natural Basalt Rock Cluster':  '#6b7280',
  'Sediment Sand Megaripple':     '#6b7280',
  'Multipath Surface Echo':       '#6b7280',
};
const REJECT_COLOR = '#EF4444';

interface ConsoleSonarCanvasProps {
  currentStageId: StageId;
  activeSite: SurveySite;
  layers: LayerState;
  candidates: CandidateItem[];
  filteredCandidates: CandidateItem[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  hoveredCandidateId?: string | null;
  onHoverCandidate?: (id: string | null) => void;
  currentFrame?: number;
  demoPhase: DemoPhase;
  stageProgress: number;
}

export const ConsoleSonarCanvas: React.FC<ConsoleSonarCanvasProps> = ({
  currentStageId,
  activeSite,
  layers,
  candidates,
  filteredCandidates,
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

  // Render authentic side-scan acoustic canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const stageNum = parseInt(currentStageId, 10);

    const dn = (x: number, y: number, seed = 0) =>
      Math.abs(Math.sin(x * 127.1 + y * 311.7 + seed * 74.1) * 43758.5453) % 1;

    // Base seabed texture with realistic acoustic backscatter ripples
    const drawSonarBase = (noisy: boolean, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      const scrollOffset = (currentFrame * 1.5) % 40;

      for (let x = 0; x < W; x += 3) {
        for (let y = 0; y < H; y += 3) {
          // Distance from central nadir line (transducer altitude falloff)
          const distFromCenter = Math.abs(x - W / 2) / (W / 2);
          const rangeGain = Math.pow(distFromCenter, 0.45);

          const seabedWave =
            Math.sin(x * 0.02 + (y + scrollOffset) * 0.035) * 0.08 +
            Math.sin((y + scrollOffset) * 0.02) * 0.05 +
            0.12;

          const speckle = noisy ? dn(x, y + currentFrame, 1) * 0.35 : 0;
          const val = Math.floor((seabedWave + speckle) * rangeGain * 52);

          // Deep bioluminescent ocean palette: navy-teal backscatter
          const r = Math.floor(val * 0.12);
          const g = Math.floor(val * 0.62);
          const b = Math.min(255, Math.floor(val * 0.95) + 12);

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 3, 3);
        }
      }
      ctx.restore();
    };

    // Central water column / nadir blind zone
    const drawNadir = () => {
      const nadirWidth = 32;
      ctx.fillStyle = '#01050A';
      ctx.fillRect(W / 2 - nadirWidth / 2, 0, nadirWidth, H);

      // Nadir transducer dashed centerline
      ctx.strokeStyle = '#00D4AA';
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Range markers along nadir
      ctx.fillStyle = '#4A8090';
      ctx.font = '7px monospace';
      ctx.fillText('0m', W / 2 - 6, 14);
      ctx.fillText(`${(activeSite.swathWidthM / 2).toFixed(0)}m`, W / 2 - 10, H - 8);
    };

    // Drone / AUV survey trajectory
    const drawDroneTrack = () => {
      if (!layers.droneTrack) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(0,212,170,0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(W * 0.12, H * 0.06);
      ctx.lineTo(W * 0.88, H * 0.94);
      ctx.stroke();
      ctx.setLineDash([]);

      const t = demoPhase === 'running' ? Math.min(stageProgress, 1) : Math.min(Math.max((currentFrame - 1) / 119, 0), 1);
      const vx = W * 0.12 + (W * 0.88 - W * 0.12) * t;
      const vy = H * 0.06 + (H * 0.94 - H * 0.06) * t;

      // AUV vehicle glyph with radar pulse
      ctx.fillStyle = '#00D4AA';
      ctx.shadowColor = '#00D4AA';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(vx, vy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#00D4AA';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('◈ AUV TOWFISH', vx + 8, vy + 3);
      ctx.restore();
    };

    // Candidate rendering with realistic directional acoustic shadows
    const drawDetections = () => {
      const itemsToDraw = filteredCandidates;

      itemsToDraw.forEach((cand) => {
        const cx = (cand.rawX / 100) * W;
        const cy = (cand.rawY / 100) * H;
        const isConfirmed = cand.status === 'CONFIRMED';
        const isSelected = selectedCandidateId === cand.id || hoveredCandidateId === cand.id;
        const color = isConfirmed ? (CLASS_COLORS[cand.class] || '#00D4AA') : REJECT_COLOR;

        // In side-scan sonar, shadows always project OUTWARD from center nadir!
        const isPort = cx < W / 2;
        const shadowDir = isPort ? -1 : 1;
        const shadowLen = Math.max(14, cand.shadowLengthM * 9);

        ctx.save();

        if (isConfirmed && layers.confirmedDebris) {
          // Acoustic shadow (pure black acoustic void)
          ctx.fillStyle = '#01050A';
          ctx.beginPath();
          ctx.moveTo(cx + shadowDir * 8, cy - 6);
          ctx.lineTo(cx + shadowDir * (8 + shadowLen), cy - 8);
          ctx.lineTo(cx + shadowDir * (8 + shadowLen), cy + 8);
          ctx.lineTo(cx + shadowDir * 8, cy + 6);
          ctx.closePath();
          ctx.fill();

          // High backscatter highlight echo
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = isSelected ? 18 : 8;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 12, 7, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Bounding Box
          ctx.strokeStyle = color;
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.strokeRect(cx - 24, cy - 16, 48, 32);
          ctx.fillStyle = `${color}18`;
          ctx.fillRect(cx - 24, cy - 16, 48, 32);

          // Class Label
          if (layers.classLabels) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = color;
            ctx.font = 'bold 7.5px monospace';
            const shortLabel = cand.class.split(' ').slice(0, 2).join(' ');
            ctx.fillText(shortLabel, cx - 23, cy - 19);
          }
        } else if (!isConfirmed && layers.noiseRejected) {
          // Rejected dashed wireframe
          ctx.strokeStyle = 'rgba(239,68,68,0.55)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - 20, cy - 13, 40, 26);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(239,68,68,0.08)';
          ctx.fillRect(cx - 20, cy - 13, 40, 26);
          ctx.fillStyle = 'rgba(239,68,68,0.7)';
          ctx.font = 'bold 8.5px monospace';
          ctx.fillText('✕ NOISE', cx - 16, cy + 3);
        }

        // Raw detection box overlay
        if (layers.rawDetections && !isConfirmed && !layers.noiseRejected) {
          ctx.strokeStyle = 'rgba(0,212,170,0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - 22, cy - 14, 44, 28);
        }

        // Geotag pin heads
        if (layers.geotagMarkers && isConfirmed) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 5);
          ctx.lineTo(cx, cy - 22);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(cx, cy - 24, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#05121F';
          ctx.fillRect(cx - 40, cy - 48, 80, 20);
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.8;
          ctx.strokeRect(cx - 40, cy - 48, 80, 20);
          ctx.fillStyle = color;
          ctx.font = '7px monospace';
          ctx.fillText(`${cand.lat.toFixed(4)}°N`, cx - 36, cy - 38);
          ctx.fillText(`${cand.lon.toFixed(4)}°E`, cx - 36, cy - 30);
        }

        ctx.restore();
      });
    };

    // ── CLEAR & DISPATCH RENDER PER ACTIVE STAGE ────────────────────────────
    ctx.fillStyle = '#01050A';
    ctx.fillRect(0, 0, W, H);

    if (demoPhase === 'idle') {
      drawSonarBase(true, 0.4);
      drawNadir();
      // Awaiting trigger overlay
      ctx.save();
      ctx.fillStyle = 'rgba(3,11,20,0.65)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00D4AA';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('● AWAITING MISSION TRIGGER', W / 2, H / 2 - 18);
      ctx.fillStyle = '#4A8090';
      ctx.font = '10.5px monospace';
      ctx.fillText('Press  [ ▶ START LIVE DEMO ]  or  [SPACE]  to begin', W / 2, H / 2 + 8);
      ctx.fillStyle = '#2A5060';
      ctx.font = '9px monospace';
      ctx.fillText('Interactive Autonomous Side-Scan Sonar Perception Pipeline', W / 2, H / 2 + 28);
      ctx.textAlign = 'left';
      ctx.restore();
      return;
    }

    // 1. Sonar Base Layer (changes between raw noise and denoised)
    if (stageNum === 1) {
      drawSonarBase(true, 1.0);
    } else if (stageNum === 2) {
      drawSonarBase(false, 1.0);
    } else {
      if (layers.rawSonar && !layers.denoisedSonar) drawSonarBase(true, 1.0);
      else if (layers.denoisedSonar && !layers.rawSonar) drawSonarBase(false, 1.0);
      else {
        drawSonarBase(true, 0.35);
        drawSonarBase(false, 0.9);
      }
    }

    drawNadir();

    // 2. Drone survey track (visible stage 2+)
    if (stageNum >= 2 && layers.droneTrack) {
      drawDroneTrack();
    }

    // 3. Candidate Detections (Only in stage 3+)
    if (stageNum >= 3) {
      drawDetections();
    }

    // Subtle scanline overlay
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, y, W, 1);
    }
    ctx.restore();
  }, [
    currentStageId,
    layers,
    candidates,
    filteredCandidates,
    activeSite,
    selectedCandidateId,
    hoveredCandidateId,
    currentFrame,
    demoPhase,
    stageProgress,
  ]);

  const stageNum = parseInt(currentStageId, 10);
  const STAGE_LABELS: Record<string, string> = {
    '1': 'STAGE 01 // RAW ACOUSTIC WATERFALL — 900 kHz Raw Backscatter Stream',
    '2': 'STAGE 02 // DENOISE & CONTRAST — CLAHE Normalization & TVG Correction Active',
    '3': 'STAGE 03 // DETECT — YOLOv8n ONNX Candidate Proposals (37 Detected)',
    '4': 'STAGE 04 // FILTER — Dynamic Confidence & Acoustic Shadow Relief Gating',
    '5': 'STAGE 05 // CLASSIFY — MoES ALDFG Marine Debris Taxonomy Attribution',
    '6': 'STAGE 06 // REPORT — High-Precision WGS84 USBL Geotagged Register',
  };

  const handleReticleClick = (id: string) => {
    sonarAudio.playTargetBeep();
    onSelectCandidate(id);
  };

  return (
    <div className="flex-1 bg-[#01050A] flex flex-col relative select-none font-mono overflow-hidden">
      {/* Canvas Top Bar */}
      <div className="h-7 bg-[#05121F] border-b border-[#0D2E4A] px-3 flex items-center justify-between text-[9px] text-[#4A8090] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3 h-3 text-[#00D4AA]" />
          <span className="text-[#E0F7F4] font-bold">
            {demoPhase === 'idle'
              ? 'SONAR MOSAIC // AWAITING'
              : STAGE_LABELS[String(stageNum)] || `STAGE ${currentStageId}`}
          </span>
          <span className="text-[#2A5060]">|</span>
          <span className="text-[#00D4AA] font-bold">
            {stageNum <= 2 ? 'ACQUISITION PHASE' : `${filteredCandidates.length} TARGETS PLOTTED`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline">
            {activeSite.frequency} · {activeSite.swathWidthM}m SWATH · FRAME {String(currentFrame).padStart(3, '0')}
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="p-1 hover:text-[#00D4AA] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="p-1 hover:text-[#00D4AA] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1 hover:text-[#00D4AA] cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#01050A] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={760}
          height={480}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
          className="w-full h-full object-contain block"
        />

        {/* 4 Corner Coordinates with authentic site bounds */}
        <div className="absolute top-2 left-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          PORT FLANK: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute top-2 right-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          STBD FLANK: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 left-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          PORT TOW: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 right-2 text-[8px] text-[#2A5060] bg-[#030B14]/90 px-1.5 py-0.5 border border-[#0D2E4A]">
          STBD TOW: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>

        {/* Interactive Reticle Overlays (Visible only in Stage 3 and above) */}
        {demoPhase !== 'idle' && stageNum >= 3 &&
          filteredCandidates.map((cand) => {
            const isConfirmed = cand.status === 'CONFIRMED';
            if (isConfirmed && !layers.confirmedDebris) return null;
            if (!isConfirmed && !layers.noiseRejected) return null;

            const isSelected = selectedCandidateId === cand.id;
            const isHovered = hoveredCandidateId === cand.id;
            const color = isConfirmed ? (CLASS_COLORS[cand.class] || '#00D4AA') : REJECT_COLOR;

            return (
              <div
                key={cand.id}
                onClick={() => handleReticleClick(cand.id)}
                onMouseEnter={() => onHoverCandidate && onHoverCandidate(cand.id)}
                onMouseLeave={() => onHoverCandidate && onHoverCandidate(null)}
                style={{ left: `${cand.rawX}%`, top: `${cand.rawY}%`, borderColor: color }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group z-20 ${
                  isSelected || isHovered ? 'z-40' : ''
                }`}
              >
                {isConfirmed ? (
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'scale-125' : isHovered ? 'scale-110' : ''
                    }`}
                    style={{
                      borderColor: color,
                      background: `${color}20`,
                      boxShadow: isSelected ? `0 0 16px ${color}` : undefined,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  </div>
                ) : (
                  <div
                    className={`w-6 h-6 border border-dashed flex items-center justify-center transition-all ${
                      isSelected ? 'scale-125 border-[#EF4444] bg-[#EF4444]/25' : 'border-[#EF4444]/60 bg-[#05121F]/80'
                    }`}
                  >
                    <span className="text-[8px] text-[#EF4444] font-bold">✕</span>
                  </div>
                )}

                {/* Cybernetic Hover Class Pill */}
                {(isSelected || isHovered) && (
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 whitespace-nowrap text-[8px] font-bold border bg-[#05121F] shadow-lg flex items-center gap-1.5"
                    style={{ color, borderColor: color }}
                  >
                    <span className="font-mono">{cand.id}</span>
                    <span>·</span>
                    <span>{isConfirmed ? cand.class.split(' ').slice(0, 2).join(' ') : 'REJECTED NOISE'}</span>
                    <span>·</span>
                    <span>{(cand.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            );
          })}

        {/* Dynamic Class Legend (Visible in Stage 5 & 6) */}
        {layers.classLabels && demoPhase !== 'idle' && stageNum >= 5 && (
          <div className="absolute bottom-8 left-2 bg-[#05121F]/95 border border-[#0D2E4A] px-2 py-1.5 text-[8px] font-mono space-y-0.5 z-20">
            <div className="text-[#4A8090] font-bold mb-0.5 uppercase">ACOUSTIC TAXONOMY</div>
            {Object.entries(CLASS_COLORS)
              .filter(([, c]) => c !== '#6b7280')
              .map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span style={{ color }}>{label}</span>
                </div>
              ))}
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
              <span className="text-[#6b7280]">Natural Rock / Bedrock</span>
            </div>
          </div>
        )}

        {/* Sensor Scale Bar */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1.5 text-[8px] text-[#00D4AA]">
          <div className="w-12 h-1 bg-[#00D4AA]" />
          <span>10 m SCALE</span>
        </div>
      </div>
    </div>
  );
};
