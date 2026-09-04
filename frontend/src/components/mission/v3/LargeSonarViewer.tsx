import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
  onView3D?: () => void;
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
  onView3D,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showTargetsToggle, setShowTargetsToggle] = useState(true);
  const [contrastEnhanced, setContrastEnhanced] = useState(false);
  const [measureActive, setMeasureActive] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [cinematicTransform, setCinematicTransform] = useState({ scale: 1, x: 0, y: 0 });

  // ── Cinematic Camera Panning ──
  useEffect(() => {
    if (isDemoRunning && demoPhaseStep >= 4) {
      // Stage 4: Cinematic zoom into the hero target (SX-T07)
      const target = targets.find((t) => t.id === selectedTargetId);
      if (target) {
        // We calculate offsets relative to the base 960x540 canvas resolution
        const tx = (target.rawX / 100) * 960;
        const ty = (target.rawY / 100) * 540;
        const cx = 960 / 2;
        const cy = 540 / 2;
        const scale = 1.7; // Dramatic zoom
        const panX = (cx - tx) * scale;
        const panY = (cy - ty) * scale;
        setCinematicTransform({ scale, x: panX, y: panY });
      }
    } else {
      setCinematicTransform({ scale: 1, x: 0, y: 0 });
    }
  }, [isDemoRunning, demoPhaseStep, selectedTargetId, targets]);

  // ── High-Fidelity Acoustic Side-Scan Waterfall Simulation ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    let animFrameId: number;
    let startTime = performance.now();

    // Pseudo-random noise generator
    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    // Pre-allocate ImageData to avoid GC thrashing
    const imgData = ctx.createImageData(W, H);

    const render = (now: number) => {
      const t = (now - startTime) / 1000;
      const data = imgData.data;

      const nadirW = 28;
      const centerX = W / 2;
      const noiseOffset = Math.floor(t * 15); // Slower noise rolling

      // 1. Draw Dual-Flank Sonar Waterfall
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const distFromCenter = Math.abs(x - centerX);

          let intensity = 0;
          if (distFromCenter < nadirW / 2) {
            intensity = 6 + hash(x, y + noiseOffset) * 8;
          } else {
            const slantRange = (distFromCenter - nadirW / 2) / (W / 2 - nadirW / 2);
            const grazingFactor = Math.cos(slantRange * 1.35);

            const ripple1 = Math.sin(y * 0.045 + x * 0.015) * 14;
            const ripple2 = Math.sin(y * 0.09 - x * 0.02) * 8;
            const speckle = (hash(x, y + noiseOffset) - 0.5) * 22;

            intensity = (65 + ripple1 + ripple2 + speckle) * grazingFactor;
            if (contrastEnhanced || (isDemoRunning && demoPhaseStep >= 1)) {
              intensity = Math.min(255, (intensity - 30) * 1.55);
            }
          }

          intensity = Math.max(0, Math.min(255, intensity));

          const r = Math.floor(intensity * 0.12);
          const g = Math.floor(intensity * 0.62);
          const b = Math.floor(intensity * 0.78);

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

      // 2. Cinematic Scanning Line (During Detect & Filter stages)
      if (isDemoRunning && demoPhaseStep >= 2 && demoPhaseStep <= 3) {
        ctx.save();
        const scanY = (t * 220) % H; // Sweeps down at 220px/s
        
        ctx.fillStyle = 'rgba(0, 212, 170, 0.15)';
        ctx.fillRect(0, 0, W, scanY);
        
        ctx.strokeStyle = '#00D4AA';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00D4AA';
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(W, scanY);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Centerline Nadir Track
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 212, 170, 0.4)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(74, 128, 144, 0.7)';
      ctx.fillText('◀ PORT SWATH (37.5m)', 16, 20);
      ctx.fillText('STARBOARD SWATH (37.5m) ▶', W - 180, 20);
      ctx.fillText('NADIR', W / 2 - 14, 20);
      ctx.restore();

      // 4. Draw Detected Targets & Prominent Acoustic Shadows
      const shouldShowBoxes = !isDemoRunning || demoPhaseStep >= 2;

      if (showTargetsToggle && shouldShowBoxes) {
        targets.forEach((target, index) => {
          // Stagger boxes appearing in Stage 2 (Detect) based on scan line position
          const ty = (target.rawY / 100) * H;
          if (isDemoRunning && demoPhaseStep === 2) {
             const scanY = (t * 220) % H;
             // Only show if scan line has passed it, or if it's been scanned previously
             if (t < 2.5 && scanY < ty) return;
          }

          const isSelected = selectedTargetId === target.id;
          const isHovered = hoveredTargetId === target.id;
          const isFiltered = target.status === 'FILTERED';

          const cx = (target.rawX / 100) * W;
          const isPort = cx < W / 2;
          const shadowDir = isPort ? -1 : 1;
          const shadowLen = Math.max(18, target.shadowLength * 20);
          const objW = Math.max(20, target.length * 2.8);
          const objH = Math.max(14, target.width * 3.2);

          ctx.save();

          // ── A. DRAW PROMINENT ACOUSTIC SHADOW ──
          if (!isFiltered) {
            ctx.fillStyle = '#01050A';
            ctx.beginPath();
            ctx.moveTo(cx + shadowDir * (objW / 2), ty - objH / 2);
            ctx.lineTo(cx + shadowDir * (objW / 2 + shadowLen), ty - objH / 2 - 4);
            ctx.lineTo(cx + shadowDir * (objW / 2 + shadowLen), ty + objH / 2 + 4);
            ctx.lineTo(cx + shadowDir * (objW / 2), ty + objH / 2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = isSelected ? 'rgba(0, 212, 170, 0.45)' : 'rgba(13, 46, 74, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (isSelected && (!isDemoRunning || demoPhaseStep >= 4)) {
              ctx.fillStyle = '#00D4AA';
              ctx.font = 'bold 8px monospace';
              ctx.fillText(
                `ACOUSTIC SHADOW (${target.shadowLength}m RELIEF)`,
                cx + shadowDir * (objW / 2 + 8),
                ty + objH / 2 + 14
              );
            }
          }

          // ── B. DRAW HIGH SPECULAR BACKSCATTER OBJECT ──
          let col = '#00D4AA';
          if (target.priority === 'HIGH') col = '#00D4AA';
          else if (target.priority === 'MEDIUM') col = '#38BDF8';
          else if (target.priority === 'LOW') col = '#F59E0B';
          else if (isFiltered) col = '#64748B';

          ctx.fillStyle = isFiltered ? 'rgba(100, 116, 139, 0.6)' : col;
          ctx.shadowColor = col;
          ctx.shadowBlur = isSelected ? 24 : isHovered ? 14 : 6;
          ctx.beginPath();
          ctx.ellipse(cx, ty, objW / 2, objH / 2, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Cinematic Ping Ring for new detections
          if (isDemoRunning && demoPhaseStep === 2 && !isFiltered) {
            const pingAge = (t * 3) % 2; // Pulsing rings
            ctx.strokeStyle = `rgba(0, 212, 170, ${1 - pingAge})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, ty, 15 + pingAge * 20, 0, Math.PI * 2);
            ctx.stroke();
          }

          // ── C. BOUNDING BOX & HERO LABEL ──
          if (isFiltered) {
            // Only show FILTER label if Phase >= 3
            if (!isDemoRunning || demoPhaseStep >= 3) {
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
              ctx.setLineDash([3, 3]);
              ctx.strokeRect(cx - objW / 2 - 4, ty - objH / 2 - 4, objW + 8, objH + 8);
              ctx.setLineDash([]);
              ctx.fillStyle = '#EF4444';
              ctx.font = 'bold 8px monospace';
              ctx.fillText(`✕ NOISE`, cx - objW / 2, ty - objH / 2 - 6);
            } else {
              ctx.strokeStyle = col;
              ctx.lineWidth = 1;
              ctx.strokeRect(cx - objW / 2 - 2, ty - objH / 2 - 2, objW + 4, objH + 4);
            }
          } else if (isSelected) {
            ctx.strokeStyle = '#00D4AA';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - objW / 2 - 6, ty - objH / 2 - 6, objW + 12, objH + 12);
            ctx.fillStyle = 'rgba(0, 212, 170, 0.14)';
            ctx.fillRect(cx - objW / 2 - 6, ty - objH / 2 - 6, objW + 12, objH + 12);

            const labelW = 160;
            const labelH = 46;
            const labelX = cx - labelW / 2;
            const labelY = ty - objH / 2 - labelH - 10;

            ctx.fillStyle = '#030B14';
            ctx.fillRect(labelX, labelY, labelW, labelH);
            ctx.strokeStyle = '#00D4AA';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(labelX, labelY, labelW, labelH);

            ctx.fillStyle = '#E0F7F4';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(target.label.toUpperCase(), cx, labelY + 13);

            ctx.fillStyle = '#7C98A6';
            ctx.font = 'bold 8.5px monospace';
            ctx.fillText(target.id, cx, labelY + 25);

            const displayConf = isDemoRunning ? heroConfidence.toFixed(1) : (target.confidence * 100).toFixed(1);
            ctx.fillStyle = '#00D4AA';
            ctx.font = '900 10.5px monospace';
            ctx.fillText(`${displayConf}% CONFIDENCE`, cx, labelY + 39);
            ctx.textAlign = 'left';
          } else {
            ctx.strokeStyle = col;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - objW / 2 - 2, ty - objH / 2 - 2, objW + 4, objH + 4);
            ctx.fillStyle = '#05121F';
            ctx.fillRect(cx - 20, ty - objH / 2 - 15, 40, 12);
            ctx.strokeStyle = col;
            ctx.strokeRect(cx - 20, ty - objH / 2 - 15, 40, 12);
            ctx.fillStyle = col;
            ctx.font = 'bold 7.5px monospace';
            ctx.fillText(`${target.id} ${(target.confidence * 100).toFixed(0)}%`, cx - 18, ty - objH / 2 - 6);
          }

          ctx.restore();
        });
      }

      // 5. Draw Measurement Line if Active
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

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [targets, selectedTargetId, hoveredTargetId, showTargetsToggle, contrastEnhanced, measureActive, measurePoints, isDemoRunning, demoPhaseStep, heroConfidence]);

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
      <div className="h-10 px-4 bg-[#030B14] border-b border-[#0D2E4A] flex items-center justify-between z-10 relative">
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
            <span className="flex items-center gap-1">
              STATUS: <strong className={isDemoRunning ? 'text-[#00D4AA] animate-pulse' : 'text-[#E0F7F4]'}>
                {isDemoRunning ? 'LIVE SCAN' : 'IDLE'}
              </strong>
            </span>
          </div>
        </div>

        {/* Compact Toolbar & 3-Way Viewport Switcher */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#05121F] border border-[#0D2E4A] p-0.5 rounded-xs mr-2">
            <button className="px-2 py-0.5 bg-[#00D4AA] text-[#030B14] font-bold text-[8.5px] rounded-xs cursor-default shadow-[0_0_8px_rgba(0,212,170,0.3)]">
              📻 SONAR
            </button>
            {onViewMissionMap && (
              <button
                onClick={onViewMissionMap}
                className="px-2 py-0.5 text-[#4A8090] hover:text-[#00D4AA] hover:bg-[#082830] text-[8.5px] font-bold rounded-xs cursor-pointer transition-colors"
                title="View Subsea Mission Map"
              >
                🗺️ MAP
              </button>
            )}
            {onView3D && (
              <button
                onClick={onView3D}
                className="px-2 py-0.5 text-[#4A8090] hover:text-[#00D4AA] hover:bg-[#082830] text-[8.5px] font-bold rounded-xs cursor-pointer transition-colors"
                title="View 3D Seafloor Bathymetry"
              >
                🌐 3D VIEW
              </button>
            )}
          </div>

          <button onClick={() => setZoomLevel(1.0)} className="panel-btn hover:text-[#00D4AA]" title="Fit to Screen">FIT</button>
          <button onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))} className="panel-btn hover:text-[#00D4AA]" title="Zoom In"><ZoomIn className="w-3 h-3" /></button>
          <button onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))} className="panel-btn hover:text-[#00D4AA]" title="Zoom Out"><ZoomOut className="w-3 h-3" /></button>
          <button onClick={() => { setZoomLevel(1.0); setMeasurePoints([]); setMeasureActive(false); }} className="panel-btn hover:text-[#EF4444]" title="Reset View"><RotateCcw className="w-3 h-3" /></button>

          <div className="h-3 w-px bg-[#0D2E4A] mx-0.5" />

          <button onClick={() => setShowTargetsToggle((v) => !v)} className={`panel-btn ${showTargetsToggle ? 'text-[#00D4AA] border-[#00D4AA]/60 bg-[#082830]' : 'text-[#4A8090]'}`} title="Toggle Detected Targets Overlay">
            <Crosshair className="w-3 h-3 mr-1" /><span>TARGETS</span>
          </button>

          <button onClick={() => { setMeasureActive((v) => !v); setMeasurePoints([]); }} className={`panel-btn ${measureActive ? 'text-[#FBBF24] border-[#FBBF24]/60 bg-[#1A1808]' : 'text-[#4A8090]'}`} title="Measure Distance Tool">
            MEASURE
          </button>

          <button onClick={() => setContrastEnhanced((v) => !v)} className={`panel-btn ${contrastEnhanced ? 'text-[#00D4AA] border-[#00D4AA]/60 bg-[#082830]' : 'text-[#4A8090]'}`} title="Toggle Raw Sonar vs Bilateral CLAHE Denoised Sonar">
            <Sliders className="w-3 h-3 mr-1" /><span>{contrastEnhanced ? 'DENOISED (CLAHE)' : 'RAW / DENOISED'}</span>
          </button>
        </div>
      </div>

      {/* ── SONAR VIEWER CANVAS WORKSPACE (VISUAL HERO) ── */}
      <div className="flex-1 relative overflow-hidden bg-[#01050A] flex items-center justify-center perspective-[1000px]">
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: isDemoRunning && demoPhaseStep >= 4 
              ? `translate(${cinematicTransform.x}px, ${cinematicTransform.y}px) scale(${cinematicTransform.scale})` 
              : `scale(${zoomLevel})`,
            transitionDuration: isDemoRunning ? '3s' : '0.2s',
            transitionTimingFunction: isDemoRunning ? 'cubic-bezier(0.2, 0.8, 0.2, 1)' : 'ease-out',
            transformOrigin: 'center center'
          }}
        >
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onClick={handleCanvasClick}
            className="w-full h-full object-contain cursor-crosshair shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Dynamic HUD Pipeline Summary Ribbon */}
        {isDemoRunning && demoPhaseStep >= 2 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#030B14]/90 border border-[#00D4AA]/40 px-4 py-2 text-[10px] text-[#7C98A6] flex items-center gap-4 shadow-[0_0_20px_rgba(0,212,170,0.25)] rounded-xs transform transition-all duration-500 z-20">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]"></span>
              </span>
              AI SCANNING ACTIVE
            </span>
            {demoPhaseStep >= 2 && (
              <>
                <span className="text-[#00D4AA]">→</span>
                <span>DETECTED: <strong className="text-[#E0F7F4]">8 CANDIDATES</strong></span>
              </>
            )}
            {demoPhaseStep >= 3 && (
              <>
                <span className="text-[#00D4AA]">→</span>
                <span>FILTER: <strong className="text-[#EF4444]">4 REJECTED</strong></span>
              </>
            )}
            {demoPhaseStep >= 4 && (
              <>
                <span className="text-[#00D4AA]">→</span>
                <span>VERIFIED: <strong className="text-[#00D4AA] font-black">4 CONFIRMED</strong></span>
              </>
            )}
          </div>
        )}

        {/* Dynamic HUD Telemetry Indicator */}
        <div className="absolute bottom-3 right-3 bg-[#030B14]/85 border border-[#0D2E4A] px-2.5 py-1 text-[8.5px] text-[#4A8090] flex items-center gap-3 rounded-xs z-20 pointer-events-none">
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

