import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Crosshair, Sliders, Eye, Map } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface LargeSonarViewerProps {
  targets: MissionV3Target[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  hoveredTargetId?: string | null;
  onHoverTarget?: (id: string | null) => void;
  isDemoRunning?: boolean;
  demoPhaseStep?: number; // 0 to 7
  heroConfidence?: number; // 0 to 94.7
  onViewMissionMap?: () => void;
}

export const LargeSonarViewer: React.FC<LargeSonarViewerProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  hoveredTargetId,
  onHoverTarget,
  isDemoRunning = false,
  demoPhaseStep = 7,
  heroConfidence = 94.7,
  onViewMissionMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showTargetsToggle, setShowTargetsToggle] = useState(true);
  const [contrastEnhanced, setContrastEnhanced] = useState(false);
  const [measureActive, setMeasureActive] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [currentFrame, setCurrentFrame] = useState(81);

  // Auto-tick frames for realistic acoustic streaming feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev >= 128 ? 1 : prev + 1));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // ── High-Fidelity Acoustic Side-Scan Waterfall Simulation ───────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Pseudo-random noise generator
    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    // 1. Draw Dual-Flank Sonar Waterfall
    const drawSonarField = () => {
      const imgData = ctx.createImageData(W, H);
      const data = imgData.data;

      const nadirW = 28; // Nadir width in pixels
      const centerX = W / 2;

      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const distFromCenter = Math.abs(x - centerX);

          let intensity = 0;
          if (distFromCenter < nadirW / 2) {
            // Nadir void (acoustic water column reflection - deep near-black)
            intensity = 6 + hash(x, y + currentFrame) * 8;
          } else {
            // Grazing angle acoustic backscatter decay (Lambertian model)
            const slantRange = (distFromCenter - nadirW / 2) / (W / 2 - nadirW / 2);
            const grazingFactor = Math.cos(slantRange * 1.35);

            // Seabed sand ripple waves + speckle
            const ripple1 = Math.sin(y * 0.045 + x * 0.015) * 14;
            const ripple2 = Math.sin(y * 0.09 - x * 0.02) * 8;
            const speckle = (hash(x, y) - 0.5) * 22;

            intensity = (65 + ripple1 + ripple2 + speckle) * grazingFactor;
            if (contrastEnhanced || (isDemoRunning && demoPhaseStep >= 1)) {
              intensity = Math.min(255, (intensity - 30) * 1.55);
            }
          }

          intensity = Math.max(0, Math.min(255, intensity));

          // Real Kongsberg / Klein deep sea cyan-teal phosphor palette
          const r = Math.floor(intensity * 0.12);
          const g = Math.floor(intensity * 0.62);
          const b = Math.floor(intensity * 0.78);

          // Write 2x2 block for crisp performance
          for (let dy = 0; dy < 2 && y + dy < H; dy++) {
            for (let dx = 0; dx < 2 && x + dx < W; dx++) {
              const idx = ((y + dy) * W + (x + dx)) * 4;
              data[idx]     = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    drawSonarField();

    // 2. Draw Centerline Nadir Track
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.4)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Channel labels
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = 'rgba(74, 128, 144, 0.7)';
    ctx.fillText('◀ PORT SWATH (37.5m)', 16, 20);
    ctx.fillText('STARBOARD SWATH (37.5m) ▶', W - 180, 20);
    ctx.fillText('NADIR', W / 2 - 14, 20);
    ctx.restore();

    // 3. Draw Detected Targets & Prominent Acoustic Shadows
    // In Demo: Stage 0 (Ingest) & Stage 1 (Denoise) show NO boxes, just raw acoustic ping waterfall!
    const shouldShowBoxes = !isDemoRunning || demoPhaseStep >= 2;

    if (showTargetsToggle && shouldShowBoxes) {
      targets.forEach((target, index) => {
        // Stagger boxes appearing in Stage 2 (Detect)
        if (isDemoRunning && demoPhaseStep === 2 && index > 6) return;

        const isSelected = selectedTargetId === target.id;
        const isHovered = hoveredTargetId === target.id;
        const isFiltered = target.status === 'FILTERED';

        const cx = (target.rawX / 100) * W;
        const cy = (target.rawY / 100) * H;
        const isPort = cx < W / 2;
        const shadowDir = isPort ? -1 : 1; // Shadow always casts outward away from nadir centerline!

        ctx.save();

        // ── A. DRAW PROMINENT ACOUSTIC SHADOW ──
        const shadowLen = Math.max(18, target.shadowLength * 20);
        const objW = Math.max(20, target.length * 2.8);
        const objH = Math.max(14, target.width * 3.2);

        if (!isFiltered) {
          ctx.fillStyle = '#01050A'; // True acoustic absorption void (zero return)
          ctx.beginPath();
          ctx.moveTo(cx + shadowDir * (objW / 2), cy - objH / 2);
          ctx.lineTo(cx + shadowDir * (objW / 2 + shadowLen), cy - objH / 2 - 4);
          ctx.lineTo(cx + shadowDir * (objW / 2 + shadowLen), cy + objH / 2 + 4);
          ctx.lineTo(cx + shadowDir * (objW / 2), cy + objH / 2);
          ctx.closePath();
          ctx.fill();

          // Highlight shadow edge
          ctx.strokeStyle = isSelected ? 'rgba(0, 212, 170, 0.45)' : 'rgba(13, 46, 74, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Label acoustic shadow on hero target
          if (isSelected) {
            ctx.fillStyle = '#00D4AA';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(
              `ACOUSTIC SHADOW (${target.shadowLength}m RELIEF)`,
              cx + shadowDir * (objW / 2 + 8),
              cy + objH / 2 + 14
            );
          }
        }

        // ── B. DRAW HIGH SPECULAR BACKSCATTER OBJECT ──
        let col = '#00D4AA';
        if (target.priority === 'HIGH') col = '#00D4AA';
        else if (target.priority === 'MEDIUM') col = '#38BDF8';
        else if (target.priority === 'LOW') col = '#F59E0B';
        else if (isFiltered) col = '#64748B';

        // Specular highlight ellipse
        ctx.fillStyle = isFiltered ? 'rgba(100, 116, 139, 0.6)' : col;
        ctx.shadowColor = col;
        ctx.shadowBlur = isSelected ? 24 : isHovered ? 14 : 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, objW / 2, objH / 2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ── C. BOUNDING BOX & HERO LABEL ──
        if (isFiltered) {
          // If in Demo Phase >= 3 (Filter Stage), show filtered status
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(cx - objW / 2 - 4, cy - objH / 2 - 4, objW + 8, objH + 8);
          ctx.setLineDash([]);
          ctx.fillStyle = '#EF4444';
          ctx.font = '7.5px monospace';
          ctx.fillText(`✕ NOISE`, cx - objW / 2, cy - objH / 2 - 6);
        } else if (isSelected) {
          // Selected Hero Target Box (Clean cyan box, pulse glow)
          ctx.strokeStyle = '#00D4AA';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx - objW / 2 - 6, cy - objH / 2 - 6, objW + 12, objH + 12);
          ctx.fillStyle = 'rgba(0, 212, 170, 0.14)';
          ctx.fillRect(cx - objW / 2 - 6, cy - objH / 2 - 6, objW + 12, objH + 12);

          // HERO LABEL BOX with animated confidence in demo:
          // ┌──────────────────────────┐
          // │        GHOST NET         │
          // │     94.7% CONFIDENCE     │
          // └──────────────────────────┘
          const labelW = 150;
          const labelH = 36;
          const labelX = cx - labelW / 2;
          const labelY = cy - objH / 2 - labelH - 10;

          ctx.fillStyle = '#030B14';
          ctx.fillRect(labelX, labelY, labelW, labelH);
          ctx.strokeStyle = '#00D4AA';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(labelX, labelY, labelW, labelH);

          ctx.fillStyle = '#E0F7F4';
          ctx.font = 'bold 10.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(target.label.toUpperCase(), cx, labelY + 14);

          const displayConf = isDemoRunning ? heroConfidence.toFixed(1) : (target.confidence * 100).toFixed(1);

          ctx.fillStyle = '#00D4AA';
          ctx.font = 'black 11px monospace';
          ctx.fillText(`${displayConf}% AI CONFIDENCE`, cx, labelY + 29);
          ctx.textAlign = 'left';
        } else {
          // Other targets: small clean marker
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - objW / 2 - 2, cy - objH / 2 - 2, objW + 4, objH + 4);

          ctx.fillStyle = '#05121F';
          ctx.fillRect(cx - 20, cy - objH / 2 - 15, 40, 12);
          ctx.strokeStyle = col;
          ctx.strokeRect(cx - 20, cy - objH / 2 - 15, 40, 12);

          ctx.fillStyle = col;
          ctx.font = 'bold 7.5px monospace';
          ctx.fillText(`${target.id} ${(target.confidence * 100).toFixed(0)}%`, cx - 18, cy - objH / 2 - 6);
        }

        ctx.restore();
      });
    }

    // 4. Draw Measurement Line if Active
    if (measureActive && measurePoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      if (measurePoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(measurePoints[0].x, measurePoints[0].y);
        ctx.lineTo(measurePoints[1].x, measurePoints[1].y);
        ctx.stroke();

        const dx = measurePoints[1].x - measurePoints[0].x;
        const dy = measurePoints[1].y - measurePoints[0].y;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const distM = (distPx * (75 / W)).toFixed(1);

        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`📏 ${distM} m`, (measurePoints[0].x + measurePoints[1].x) / 2 + 8, (measurePoints[0].y + measurePoints[1].y) / 2);
      }
      ctx.restore();
    }
  }, [targets, selectedTargetId, hoveredTargetId, showTargetsToggle, contrastEnhanced, measureActive, measurePoints, currentFrame, isDemoRunning, demoPhaseStep, heroConfidence]);

  // Click on canvas to select nearest target or measure
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (measureActive) {
      if (measurePoints.length >= 2) {
        setMeasurePoints([{ x, y }]);
      } else {
        setMeasurePoints((prev) => [...prev, { x, y }]);
      }
      return;
    }

    // Find nearest target within 38px radius
    let nearestId: string | null = null;
    let minDist = 38;

    targets.forEach((t) => {
      const tx = (t.rawX / 100) * canvas.width;
      const ty = (t.rawY / 100) * canvas.height;
      const d = Math.hypot(tx - x, ty - y);
      if (d < minDist) {
        minDist = d;
        nearestId = t.id;
      }
    });

    if (nearestId) {
      onSelectTarget(nearestId);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#01050A] relative overflow-hidden font-mono select-none">
      {/* ── VIEWER HEADER BAR ── */}
      <div className="h-10 px-4 bg-[#030B14] border-b border-[#0D2E4A] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black tracking-wider text-[#E0F7F4] uppercase">
            SIDE-SCAN SONAR
          </span>
          <span className="text-[#2A5060]">|</span>
          <div className="text-[10px] text-[#4A8090] flex items-center gap-2">
            <span><strong className="text-[#E0F7F4]">900</strong> kHz</span>
            <span>·</span>
            <span><strong className="text-[#E0F7F4]">75</strong> m SWATH</span>
            <span>·</span>
            <span>FRAME <strong className="text-[#00D4AA]">{String(currentFrame).padStart(3, '0')}</strong> / 128</span>
          </div>
        </div>

        {/* Compact Toolbar */}
        <div className="flex items-center gap-1.5">
          {onViewMissionMap && (
            <button
              onClick={onViewMissionMap}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#082830] border border-[#00D4AA]/60 text-[#00D4AA] hover:bg-[#00D4AA] hover:text-[#030B14] text-[9px] font-bold rounded-xs cursor-pointer transition-colors shadow-[0_0_8px_rgba(0,212,170,0.2)] mr-1"
              title="View Subsea Mission Map"
            >
              <Map className="w-3 h-3" />
              <span>VIEW MAP</span>
            </button>
          )}

          <button
            onClick={() => setZoomLevel(1.0)}
            className="panel-btn hover:text-[#00D4AA]"
            title="Fit to Screen"
          >
            FIT
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="panel-btn hover:text-[#00D4AA]"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
            className="panel-btn hover:text-[#00D4AA]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => { setZoomLevel(1.0); setMeasurePoints([]); setMeasureActive(false); }}
            className="panel-btn hover:text-[#EF4444]"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <div className="h-3 w-px bg-[#0D2E4A] mx-0.5" />

          <button
            onClick={() => setShowTargetsToggle((v) => !v)}
            className={`panel-btn ${showTargetsToggle ? 'text-[#00D4AA] border-[#00D4AA]/60 bg-[#082830]' : 'text-[#4A8090]'}`}
            title="Toggle Detected Targets Overlay"
          >
            <Crosshair className="w-3 h-3 mr-1" />
            <span>TARGETS</span>
          </button>

          <button
            onClick={() => { setMeasureActive((v) => !v); setMeasurePoints([]); }}
            className={`panel-btn ${measureActive ? 'text-[#FBBF24] border-[#FBBF24]/60 bg-[#1A1808]' : 'text-[#4A8090]'}`}
            title="Measure Distance Tool"
          >
            MEASURE
          </button>

          <button
            onClick={() => setContrastEnhanced((v) => !v)}
            className={`panel-btn ${contrastEnhanced ? 'text-[#00D4AA] border-[#00D4AA]/60 bg-[#082830]' : 'text-[#4A8090]'}`}
            title="Toggle CLAHE Contrast Boost"
          >
            <Sliders className="w-3 h-3 mr-1" />
            <span>CONTRAST</span>
          </button>
        </div>
      </div>

      {/* ── SONAR VIEWER CANVAS WORKSPACE (VISUAL HERO) ── */}
      <div className="flex-1 relative overflow-hidden bg-[#01050A] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          onClick={handleCanvasClick}
          style={{ transform: `scale(${zoomLevel})` }}
          className="w-full h-full object-contain cursor-crosshair transition-transform duration-200"
        />

        {/* Dynamic HUD Watermark Indicator */}
        <div className="absolute bottom-3 left-3 bg-[#030B14]/85 border border-[#0D2E4A] px-2.5 py-1 text-[8.5px] text-[#4A8090] flex items-center gap-3">
          <span>TOWFISH SPEED: <strong className="text-[#00D4AA]">4.1 kts</strong></span>
          <span>·</span>
          <span>ALTITUDE: <strong className="text-[#E0F7F4]">8.4 m</strong></span>
          <span>·</span>
          <span>LAMBERTIAN TVG: <strong className="text-[#00D4AA]">ON</strong></span>
        </div>
      </div>
    </div>
  );
};
