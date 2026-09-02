import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { CandidateItem, StageId, SurveySite } from '../../data/consoleData';
import { LayerState } from './ConsoleLeftRail';
import { sonarAudio } from '../../utils/sonarAudio';
import { calculateDriftProjection } from '../../utils/driftProjection';

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
  selectedCategory?: string;
  projectDriftCandidateId?: string | null;
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
  selectedCategory = 'ALL',
  projectDriftCandidateId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // ── Realistic Acoustic Side-Scan Sonar Shader Simulation ───────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const midX = W / 2;

    const scrollOffset = (currentFrame * 1.5) % 40;

    // Dual-channel acoustic seabed generator
    const drawSonarBase = (noisy: boolean, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;

      // Base abyssal bathymetry
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, '#020C17');
      grad.addColorStop(0.44, '#051829');
      grad.addColorStop(0.49, '#01050A'); // Nadir trench
      grad.addColorStop(0.51, '#01050A');
      grad.addColorStop(0.56, '#051829');
      grad.addColorStop(1, '#020C17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Acoustic backscatter wavelets (horizontal ripples)
      for (let y = 0; y < H; y += 4) {
        const py = (y + scrollOffset) % H;
        const wave = Math.sin(py * 0.08) * 0.5 + 0.5;

        // Port channel
        ctx.fillStyle = noisy
          ? `rgba(0, 212, 170, ${0.03 + wave * 0.04 + (Math.random() - 0.5) * 0.03})`
          : `rgba(0, 212, 170, ${0.04 + wave * 0.05})`;
        ctx.fillRect(0, py, midX - 16, 3);

        // Starboard channel
        ctx.fillStyle = noisy
          ? `rgba(0, 212, 170, ${0.03 + wave * 0.04 + (Math.random() - 0.5) * 0.03})`
          : `rgba(0, 212, 170, ${0.04 + wave * 0.05})`;
        ctx.fillRect(midX + 16, py, midX - 16, 3);
      }

      // High speckle noise for raw sonar
      if (noisy) {
        ctx.fillStyle = '#00D4AA';
        for (let i = 0; i < 900; i++) {
          const rx = Math.random() * W;
          const ry = Math.random() * H;
          if (Math.abs(rx - midX) > 16) {
            ctx.globalAlpha = Math.random() * 0.15;
            ctx.fillRect(rx, ry, 1.5, 1.5);
          }
        }
      }

      ctx.restore();
    };

    // Center Nadir Blind Zone
    const drawNadir = () => {
      ctx.save();
      ctx.fillStyle = '#01050A';
      ctx.fillRect(midX - 14, 0, 28, H);

      ctx.strokeStyle = 'rgba(0,212,170,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - 14, 0);
      ctx.lineTo(midX - 14, H);
      ctx.moveTo(midX + 14, 0);
      ctx.lineTo(midX + 14, H);
      ctx.stroke();

      // Nadir track centerline
      ctx.strokeStyle = '#00D4AA';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#4A8090';
      ctx.font = '7px monospace';
      ctx.save();
      ctx.translate(midX - 3, H / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('NADIR BLIND ZONE · ALT 12.4m', -40, 0);
      ctx.restore();

      ctx.restore();
    };

    // Drone survey trajectory
    const drawDroneTrack = () => {
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
      candidates.forEach((cand) => {
        const cx = (cand.rawX / 100) * W;
        const cy = (cand.rawY / 100) * H;
        const isConfirmed = cand.status === 'CONFIRMED';
        const isSelected = selectedCandidateId === cand.id;
        const isHovered = hoveredCandidateId === cand.id;
        const color = isConfirmed ? (CLASS_COLORS[cand.class] || '#00D4AA') : REJECT_COLOR;

        // Check if candidate matches taxonomy filter
        const matchesCategory =
          !selectedCategory ||
          selectedCategory === 'ALL' ||
          (selectedCategory === 'NETS' && cand.class.includes('Net')) ||
          (selectedCategory === 'TRAWL' && cand.class.includes('Trawl')) ||
          (selectedCategory === 'PIPES' && (cand.class.includes('Pipeline') || cand.class.includes('Cable'))) ||
          (selectedCategory === 'BARRELS' && (cand.class.includes('Barrel') || cand.class.includes('Cargo'))) ||
          (selectedCategory === 'NOISE' && cand.status === 'REJECTED');

        // Directional shadow geometry (outward from center nadir)
        const isPort = cx < W / 2;
        const shadowDir = isPort ? -1 : 1;
        const shadowLen = Math.max(14, cand.shadowLengthM * 9);

        ctx.save();
        ctx.globalAlpha = matchesCategory ? 1.0 : 0.15;

        // 1. Raw proposal bounding box (controlled by layers.rawDetections)
        if (layers.rawDetections) {
          ctx.strokeStyle = isConfirmed ? 'rgba(0,212,170,0.35)' : 'rgba(239,68,68,0.35)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(cx - 26, cy - 18, 52, 36);
          ctx.setLineDash([]);
        }

        // 2. Confirmed Debris (controlled by layers.confirmedDebris)
        if (isConfirmed && layers.confirmedDebris) {
          // Acoustic shadow void
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
          ctx.shadowBlur = isSelected ? 22 : isHovered ? 14 : 8;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 12, 7, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Bounding Box
          ctx.strokeStyle = color;
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.strokeRect(cx - 24, cy - 16, 48, 32);
          ctx.fillStyle = `${color}18`;
          ctx.fillRect(cx - 24, cy - 16, 48, 32);

          // Selection Radar Halo
          if (isSelected) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, 28, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Class Label (controlled by layers.classLabels)
          if (layers.classLabels) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = color;
            ctx.font = 'bold 7.5px monospace';
            const shortLabel = cand.class.split(' ').slice(0, 2).join(' ');
            ctx.fillText(shortLabel, cx - 23, cy - 19);
          }

          // Geotag pin heads (controlled by layers.geotagMarkers)
          if (layers.geotagMarkers) {
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

          // ── FEATURE 1: DRIFT PROJECTION TRAJECTORY (SARAT / INCOIS) ──
          if (projectDriftCandidateId === cand.id && isConfirmed) {
            const drift = calculateDriftProjection(cand);
            const vecLength = 150;
            const rad = ((drift.bearingDeg - 90) * Math.PI) / 180;
            const dx = Math.cos(rad) * vecLength;
            const dy = Math.sin(rad) * vecLength;

            ctx.save();
            ctx.shadowBlur = 0;

            // 1. Animated dashed vector line
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -((currentFrame * 2) % 10);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + dx, cy + dy);
            ctx.stroke();
            ctx.setLineDash([]);

            // 2. Directional Arrowhead
            const arrowAngle = Math.atan2(dy, dx);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(cx + dx, cy + dy);
            ctx.lineTo(
              cx + dx - 10 * Math.cos(arrowAngle - Math.PI / 6),
              cy + dy - 10 * Math.sin(arrowAngle - Math.PI / 6)
            );
            ctx.lineTo(
              cx + dx - 10 * Math.cos(arrowAngle + Math.PI / 6),
              cy + dy - 10 * Math.sin(arrowAngle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();

            // 3. Three Labeled Points: T+24h, T+48h, T+72h
            drift.nodes.forEach((node, idx) => {
              const frac = (idx + 1) / 3;
              const nx = cx + dx * frac;
              const ny = cy + dy * frac;

              // Node dot
              ctx.fillStyle = '#030B14';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.arc(nx, ny, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Inner pulse
              ctx.fillStyle = node.hours === 48 ? '#00D4AA' : '#38bdf8';
              ctx.beginPath();
              ctx.arc(nx, ny, 2, 0, Math.PI * 2);
              ctx.fill();

              // Labeled node badge
              const tagText = `${node.timeLabel} (+${node.driftNm}nm)`;
              ctx.font = 'bold 7.5px monospace';
              const textW = ctx.measureText(tagText).width + 8;

              ctx.fillStyle = 'rgba(5, 18, 31, 0.95)';
              ctx.fillRect(nx + 6, ny - 8, textW, 16);
              ctx.strokeStyle = node.hours === 48 ? '#00D4AA' : '#38bdf8';
              ctx.lineWidth = 0.8;
              ctx.strokeRect(nx + 6, ny - 8, textW, 16);

              ctx.fillStyle = node.hours === 48 ? '#00D4AA' : '#38bdf8';
              ctx.fillText(tagText, nx + 10, ny + 3);
            });

            // 4. Actionable recommendation caption
            const boxW = 270;
            const boxH = 34;
            const boxX = Math.min(Math.max(cx + dx * 0.45 - boxW / 2, 10), W - boxW - 10);
            const boxY = Math.min(Math.max(cy + dy * 0.45 + 16, 20), H - boxH - 20);

            ctx.fillStyle = 'rgba(3, 11, 20, 0.95)';
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(
              `⚡ RECOM INTERCEPT: [${drift.recommendedInterceptWindow}] near ${drift.recommendedInterceptCoords}`,
              boxX + 6,
              boxY + 14
            );

            ctx.fillStyle = '#4A8090';
            ctx.font = '7px monospace';
            ctx.fillText(drift.disclaimer, boxX + 6, boxY + 26);

            ctx.restore();
          }
        } else if (!isConfirmed && layers.noiseRejected) {
          // 3. Rejected dashed wireframe (controlled by layers.noiseRejected)
          ctx.strokeStyle = 'rgba(239,68,68,0.65)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.strokeRect(cx - 20, cy - 13, 40, 26);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(239,68,68,0.08)';
          ctx.fillRect(cx - 20, cy - 13, 40, 26);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('✕ NOISE', cx - 17, cy + 3);

          if (layers.classLabels) {
            ctx.fillStyle = 'rgba(239,68,68,0.8)';
            ctx.font = '7px monospace';
            ctx.fillText(cand.class.split(' ')[0], cx - 20, cy - 16);
          }
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

    // 1. Sonar Base Layer (controlled by layers.rawSonar & layers.denoisedSonar)
    if (stageNum === 1) {
      if (layers.rawSonar) drawSonarBase(true, 1.0);
    } else if (stageNum === 2) {
      if (layers.denoisedSonar) drawSonarBase(false, 1.0);
    } else {
      if (layers.rawSonar && !layers.denoisedSonar) drawSonarBase(true, 1.0);
      else if (layers.denoisedSonar && !layers.rawSonar) drawSonarBase(false, 1.0);
      else if (layers.rawSonar && layers.denoisedSonar) {
        drawSonarBase(true, 0.35);
        drawSonarBase(false, 0.9);
      }
    }

    drawNadir();

    // 2. Drone survey track (visible stage 2+ and controlled by layers.droneTrack)
    if (stageNum >= 2 && layers.droneTrack) {
      drawDroneTrack();
    }

    // 3. Candidate Detections (visible stage 3+)
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
    selectedCategory,
    projectDriftCandidateId,
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
            {stageNum <= 2 ? 'ACQUISITION PHASE' : `${filteredCandidates.length} OF ${candidates.length} TARGETS PLOTTED`}
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

        {/* Interactive Reticle Overlays (Visible in Stage 3+) */}
        {demoPhase !== 'idle' && stageNum >= 3 &&
          candidates.map((cand) => {
            const isConfirmed = cand.status === 'CONFIRMED';
            if (isConfirmed && !layers.confirmedDebris) return null;
            if (!isConfirmed && !layers.noiseRejected) return null;

            const matchesCategory =
              !selectedCategory ||
              selectedCategory === 'ALL' ||
              (selectedCategory === 'NETS' && cand.class.includes('Net')) ||
              (selectedCategory === 'TRAWL' && cand.class.includes('Trawl')) ||
              (selectedCategory === 'PIPES' && (cand.class.includes('Pipeline') || cand.class.includes('Cable'))) ||
              (selectedCategory === 'BARRELS' && (cand.class.includes('Barrel') || cand.class.includes('Cargo'))) ||
              (selectedCategory === 'NOISE' && cand.status === 'REJECTED');

            const isSelected = selectedCandidateId === cand.id;
            const isHovered = hoveredCandidateId === cand.id;
            const color = isConfirmed ? (CLASS_COLORS[cand.class] || '#00D4AA') : REJECT_COLOR;

            return (
              <div
                key={cand.id}
                onClick={() => matchesCategory && handleReticleClick(cand.id)}
                onMouseEnter={() => matchesCategory && onHoverCandidate && onHoverCandidate(cand.id)}
                onMouseLeave={() => matchesCategory && onHoverCandidate && onHoverCandidate(null)}
                style={{ left: `${cand.rawX}%`, top: `${cand.rawY}%`, borderColor: color }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group z-20 ${
                  !matchesCategory ? 'opacity-15 pointer-events-none' : 'opacity-100'
                } ${isSelected || isHovered ? 'z-40' : ''}`}
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

                {/* Cybernetic Hover Class Pill / Tooltip */}
                {(isSelected || isHovered) && (
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 whitespace-nowrap text-[8px] font-bold border bg-[#05121F] shadow-lg flex items-center gap-1.5 pointer-events-none"
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
