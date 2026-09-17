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
  const [acousticPalette, setAcousticPalette] = useState<'amber' | 'emerald' | 'cobalt' | 'grayscale'>('amber');
  const [isSrcActive, setIsSrcActive] = useState(false);
  const [sonarFrequency, setSonarFrequency] = useState<450 | 900 | 1200>(900);
  const [measureActive, setMeasureActive] = useState(false);

  const FREQUENCY_PROFILES: Record<number, { swathM: number; lambdaMm: number; alphaDbM: number; resCm: number }> = {
    450: { swathM: 150, lambdaMm: 3.33, alphaDbM: 0.08, resCm: 5.2 },
    900: { swathM: 75, lambdaMm: 1.67, alphaDbM: 0.28, resCm: 2.6 },
    1200: { swathM: 35, lambdaMm: 1.25, alphaDbM: 0.49, resCm: 1.4 },
  };
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

      const nadirW = isSrcActive ? 4 : 28;
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

          let r = 0, g = 0, b = 0;
          if (acousticPalette === 'amber') {
            r = Math.floor(intensity * 0.96);
            g = Math.floor(intensity * 0.64);
            b = Math.floor(intensity * 0.18);
          } else if (acousticPalette === 'emerald') {
            r = Math.floor(intensity * 0.12);
            g = Math.floor(intensity * 0.92);
            b = Math.floor(intensity * 0.38);
          } else if (acousticPalette === 'cobalt') {
            r = Math.floor(intensity * 0.12);
            g = Math.floor(intensity * 0.62);
            b = Math.floor(intensity * 0.78);
          } else if (acousticPalette === 'grayscale') {
            const gray = Math.floor(intensity * 0.88);
            r = gray;
            g = gray;
            b = gray;
          }

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
        
        ctx.fillStyle = 'rgba(255, 183, 3, )';
        ctx.fillRect(0, 0, W, scanY);
        
        ctx.strokeStyle = '#FFB703';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFB703';
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(W, scanY);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Centerline Nadir Track
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 183, 3, )';
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

            ctx.strokeStyle = isSelected ? 'rgba(255, 183, 3, )' : 'rgba(13, 46, 74, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (isSelected && (!isDemoRunning || demoPhaseStep >= 4)) {
              ctx.fillStyle = '#FFB703';
              ctx.font = 'bold 8px monospace';
              ctx.fillText(
                `ACOUSTIC SHADOW (${target.shadowLength}m RELIEF)`,
                cx + shadowDir * (objW / 2 + 8),
                ty + objH / 2 + 14
              );
            }
          }

          // ── B. DRAW HIGH SPECULAR BACKSCATTER OBJECT ──
          let col = '#FFB703';
          if (target.priority === 'HIGH') col = '#FFB703';
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
          const isHighPriority = target.priority === 'HIGH' || target.status === 'CONFIRMED';

          if (isFiltered) {
            // Only persistently show subtle dashed box; text label appears ON HOVER / SELECTION ONLY
            ctx.strokeStyle = (isHovered || isSelected) ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.25)';
            ctx.lineWidth = (isHovered || isSelected) ? 1.5 : 0.8;
            ctx.setLineDash([2, 3]);
            ctx.strokeRect(cx - objW / 2 - 3, ty - objH / 2 - 3, objW + 6, objH + 6);
            ctx.setLineDash([]);

            if (isHovered || isSelected) {
              ctx.fillStyle = '#080D17';
              ctx.fillRect(cx - 30, ty - objH / 2 - 16, 60, 13);
              ctx.strokeStyle = '#EF4444';
              ctx.strokeRect(cx - 30, ty - objH / 2 - 16, 60, 13);
              ctx.fillStyle = '#EF4444';
              ctx.font = 'bold 8px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(`✕ NOISE`, cx, ty - objH / 2 - 7);
              ctx.textAlign = 'left';
            }
          } else if (isSelected) {
            ctx.strokeStyle = '#FFB703';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - objW / 2 - 6, ty - objH / 2 - 6, objW + 12, objH + 12);
            ctx.fillStyle = 'rgba(255, 183, 3, )';
            ctx.fillRect(cx - objW / 2 - 6, ty - objH / 2 - 6, objW + 12, objH + 12);

            const labelW = 160;
            const labelH = 46;
            const labelX = cx - labelW / 2;
            const labelY = ty - objH / 2 - labelH - 10;

            ctx.fillStyle = '#05070B';
            ctx.fillRect(labelX, labelY, labelW, labelH);
            ctx.strokeStyle = '#FFB703';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(labelX, labelY, labelW, labelH);

            ctx.fillStyle = '#F8FAFC';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(target.label.toUpperCase(), cx, labelY + 13);

            ctx.fillStyle = '#94A3B8';
            ctx.font = 'bold 8.5px monospace';
            ctx.fillText(target.id, cx, labelY + 25);

            const displayConf = isDemoRunning ? heroConfidence.toFixed(1) : (target.confidence * 100).toFixed(1);
            ctx.fillStyle = '#FFB703';
            ctx.font = '900 10.5px monospace';
            ctx.fillText(`${displayConf}% CONFIDENCE`, cx, labelY + 39);
            ctx.textAlign = 'left';
          } else if (isHighPriority) {
            // Persistently label confirmed/high-priority targets
            ctx.strokeStyle = col;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - objW / 2 - 2, ty - objH / 2 - 2, objW + 4, objH + 4);
            ctx.fillStyle = '#080D17';
            ctx.fillRect(cx - 20, ty - objH / 2 - 15, 40, 12);
            ctx.strokeStyle = col;
            ctx.strokeRect(cx - 20, ty - objH / 2 - 15, 40, 12);
            ctx.fillStyle = col;
            ctx.font = 'bold 7.5px monospace';
            ctx.fillText(`${target.id} ${(target.confidence * 100).toFixed(0)}%`, cx - 18, ty - objH / 2 - 6);
          } else {
            // Low-confidence non-selected target: box only, label on HOVER ONLY
            ctx.strokeStyle = isHovered ? col : 'rgba(124, 152, 166, 0.4)';
            ctx.lineWidth = isHovered ? 1.5 : 0.8;
            ctx.strokeRect(cx - objW / 2 - 2, ty - objH / 2 - 2, objW + 4, objH + 4);

            if (isHovered) {
              ctx.fillStyle = '#080D17';
              ctx.fillRect(cx - 20, ty - objH / 2 - 15, 40, 12);
              ctx.strokeStyle = col;
              ctx.strokeRect(cx - 20, ty - objH / 2 - 15, 40, 12);
              ctx.fillStyle = col;
              ctx.font = 'bold 7.5px monospace';
              ctx.fillText(`${target.id} ${(target.confidence * 100).toFixed(0)}%`, cx - 18, ty - objH / 2 - 6);
            }
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
      return () => cancelAnimationFrame(animFrameId);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [targets, selectedTargetId, hoveredTargetId, showTargetsToggle, contrastEnhanced, measureActive, measurePoints, isDemoRunning, demoPhaseStep, heroConfidence, acousticPalette, isSrcActive]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onHoverTarget) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

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

    if (nearestId !== hoveredTargetId) {
      onHoverTarget(nearestId);
    }
  };

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
    <div className="flex-1 flex flex-col bg-[#01050A] relative overflow-hidden font-sans select-none">
      {/* ── VIEWER HEADER BAR ── */}
      <div className="h-10 px-4 bg-[#05070B] border-b border-[#162136] flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-[#F8FAFC] uppercase">
              DRONE SIDE-SCAN SONAR
            </span>
            <span className="px-2 py-0.5 rounded bg-[#FFB703]/15 border border-[#FFB703]/35 text-[9px] font-mono font-bold text-[#FFB703] uppercase tracking-wide">
              AUTONOMOUS DRONE USV-04
            </span>
          </div>
          <span className="text-[#64748B]">|</span>
          <div className="text-[10px] text-[#94A3B8] flex items-center gap-2">
            {/* Interactive Frequency Mode Selector */}
            <div className="flex items-center gap-0.5 bg-[#080D17] border border-[#162136] p-0.5 rounded text-[8px] font-mono">
              <span className="text-[#94A3B8] px-1 uppercase hidden md:inline">FREQ:</span>
              <button
                onClick={() => setSonarFrequency(450)}
                className={`px-1.5 py-0.5 rounded-xs font-bold transition-all cursor-pointer ${
                  sonarFrequency === 450
                    ? 'bg-[#38BDF8] text-[#05070B] shadow-sm font-black'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
                title="450 kHz (150m Swath · Deep Ocean Search · λ=3.33mm)"
              >
                450k
              </button>
              <button
                onClick={() => setSonarFrequency(900)}
                className={`px-1.5 py-0.5 rounded-xs font-bold transition-all cursor-pointer ${
                  sonarFrequency === 900
                    ? 'bg-[#FFB703] text-[#05070B] shadow-sm font-black'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
                title="900 kHz (75m Swath · Tactical Profiling · λ=1.67mm)"
              >
                900k
              </button>
              <button
                onClick={() => setSonarFrequency(1200)}
                className={`px-1.5 py-0.5 rounded-xs font-bold transition-all cursor-pointer ${
                  sonarFrequency === 1200
                    ? 'bg-[#A855F7] text-white shadow-sm font-black'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
                title="1200 kHz (35m Swath · Ultra-High Res Micro-Debris · λ=1.25mm)"
              >
                1200k
              </button>
            </div>

            <span>·</span>
            <span><strong className="text-[#F8FAFC]">{FREQUENCY_PROFILES[sonarFrequency].swathM}</strong> m SWATH</span>
            <span>·</span>
            <span title="Acoustic Wavelength λ = c/f (c=1500m/s in seawater)">
              <strong className="text-[#FFB703]">λ={FREQUENCY_PROFILES[sonarFrequency].lambdaMm}</strong> mm
            </span>
            <span>·</span>
            <span className="hidden lg:inline text-emerald-400 font-mono text-[9.5px]">
              DRONE ALT: <strong className="text-white">8.4m</strong> · BATT: <strong className="text-emerald-300">94%</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              STATUS: <strong className={isDemoRunning ? 'text-[#FFB703] animate-pulse' : 'text-[#F8FAFC]'}>
                {isDemoRunning ? 'LIVE SCAN' : 'IDLE'}
              </strong>
            </span>
          </div>
        </div>

        {/* Compact Toolbar Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setZoomLevel(1.0)} className="panel-btn hover:text-[#FFB703]" title="Fit to Screen">FIT</button>
          <button onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))} className="panel-btn hover:text-[#FFB703]" title="Zoom In"><ZoomIn className="w-3 h-3" /></button>
          <button onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))} className="panel-btn hover:text-[#FFB703]" title="Zoom Out"><ZoomOut className="w-3 h-3" /></button>
          <button onClick={() => { setZoomLevel(1.0); setMeasurePoints([]); setMeasureActive(false); }} className="panel-btn hover:text-[#EF4444]" title="Reset View"><RotateCcw className="w-3 h-3" /></button>

          <div className="h-3 w-px bg-[#162136] mx-0.5" />

          <button onClick={() => setShowTargetsToggle((v) => !v)} className={`panel-btn ${showTargetsToggle ? 'text-[#FFB703] border-[#FFB703]/60 bg-[#131B2A]' : 'text-[#94A3B8]'}`} title="Toggle Detected Targets Overlay">
            <Crosshair className="w-3 h-3 mr-1" /><span>TARGETS</span>
          </button>

          <button onClick={() => { setMeasureActive((v) => !v); setMeasurePoints([]); }} className={`panel-btn ${measureActive ? 'text-[#FBBF24] border-[#FBBF24]/60 bg-[#1A1808]' : 'text-[#94A3B8]'}`} title="Measure Distance Tool">
            MEASURE
          </button>

          <button onClick={() => setContrastEnhanced((v) => !v)} className={`panel-btn ${contrastEnhanced ? 'text-[#FFB703] border-[#FFB703]/60 bg-[#131B2A]' : 'text-[#94A3B8]'}`} title="Toggle Raw Sonar vs Bilateral CLAHE Denoised Sonar">
            <Sliders className="w-3 h-3 mr-1" /><span>{contrastEnhanced ? 'DENOISED' : 'RAW'}</span>
          </button>
        </div>
      </div>

      {/* ── SONAR VIEWER CANVAS WORKSPACE (VISUAL HERO) ── */}
      <div className="flex-1 relative overflow-hidden bg-[#01050A] flex items-center justify-center perspective-[1000px]">
        {/* Floating Acoustic HUD: Palette Switcher & SRC Ground Rectification */}
        <div className="absolute top-3 left-3 bg-[#030914]/90 backdrop-blur-md border border-[#162136] px-2 py-1 rounded-xl flex items-center gap-2 shadow-2xl z-20 pointer-events-auto">
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] font-mono font-bold text-[#94A3B8] uppercase">PALETTE:</span>
            <button
              onClick={() => setAcousticPalette('amber')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
                acousticPalette === 'amber'
                  ? 'bg-[#F59E0B] text-[#05070B] font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kongsberg Copper / Amber Palette (Hydrographic Standard)"
            >
              AMBER
            </button>
            <button
              onClick={() => setAcousticPalette('emerald')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
                acousticPalette === 'emerald'
                  ? 'bg-[#10B981] text-[#05070B] font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Naval Submarine Phosphor Green"
            >
              EMERALD
            </button>
            <button
              onClick={() => setAcousticPalette('cobalt')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
                acousticPalette === 'cobalt'
                  ? 'bg-[#38BDF8] text-[#05070B] font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="EdgeTech Deep-Sea Cyan"
            >
              COBALT
            </button>
            <button
              onClick={() => setAcousticPalette('grayscale')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
                acousticPalette === 'grayscale'
                  ? 'bg-[#E2E8F0] text-[#05070B] font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Inverted Scientific Paper Grayscale"
            >
              B&W
            </button>
          </div>

          <div className="h-3 w-px bg-[#162136]" />

          <button
            onClick={() => setIsSrcActive((v) => !v)}
            className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
              isSrcActive
                ? 'bg-[#FFB703] text-[#05070B] font-black shadow-[0_0_8px_rgba(255, 183, 3, )]'
                : 'bg-[#131B2A] text-[#94A3B8] border border-[#162136] hover:text-white'
            }`}
            title="Slant-to-Ground Range Rectification (Compensates Nadir Water Column)"
          >
            {isSrcActive ? 'SRC: GROUND' : 'SRC: SLANT'}
          </button>
        </div>

        {/* Floating Autonomous Drone Flight & Sonar Telemetry HUD */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-20 pointer-events-none font-mono text-[9px]">
          <div className="bg-[#030914]/90 backdrop-blur-md border border-white/[0.1] px-2.5 py-1 rounded-lg flex items-center gap-2 shadow-2xl text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">DRONE USV-04</span>
            <span className="text-slate-600">·</span>
            <span>ALT: <strong className="text-white">8.4m</strong></span>
            <span className="text-slate-600">·</span>
            <span>SPD: <strong className="text-white">3.5kt</strong></span>
            <span className="text-slate-600">·</span>
            <span>BATT: <strong className="text-emerald-300">94%</strong></span>
          </div>

          {/* Slant-Range Correction (SRC) Active Watermark Indicator */}
          {isSrcActive && (
            <div className="bg-[#080D17]/90 border border-[#FFB703]/50 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold text-[#FFB703] flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,183,3,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] animate-ping" />
              <span>SRC ACTIVE · NADIR RECTIFIED · Rg = √(Rs² - H²)</span>
            </div>
          )}
        </div>
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
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => onHoverTarget && onHoverTarget(null)}
            className="w-full h-full object-contain cursor-crosshair shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Dynamic HUD Pipeline Summary Ribbon */}
        {isDemoRunning && demoPhaseStep >= 2 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#05070B]/90 border border-[#FFB703]/40 px-4 py-2 text-[10px] text-[#94A3B8] flex items-center gap-4 shadow-[0_0_20px_rgba(255, 183, 3, )] rounded-xs transform transition-all duration-500 z-20">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB703] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB703]"></span>
              </span>
              AI SCANNING ACTIVE
            </span>
            {demoPhaseStep >= 2 && (
              <>
                <span className="text-[#FFB703]">→</span>
                <span>DETECTED: <strong className="text-[#F8FAFC]">8 CANDIDATES</strong></span>
              </>
            )}
            {demoPhaseStep >= 3 && (
              <>
                <span className="text-[#FFB703]">→</span>
                <span>FILTER: <strong className="text-[#EF4444]">4 REJECTED</strong></span>
              </>
            )}
            {demoPhaseStep >= 4 && (
              <>
                <span className="text-[#FFB703]">→</span>
                <span>VERIFIED: <strong className="text-[#FFB703] font-black">4 CONFIRMED</strong></span>
              </>
            )}
          </div>
        )}

        {/* Dynamic HUD Telemetry Indicator */}
        <div className="absolute bottom-3 right-3 bg-[#05070B]/85 border border-[#162136] px-2.5 py-1 text-[8.5px] text-[#94A3B8] flex items-center gap-3 rounded-xs z-20 pointer-events-none">
          <span>TOWFISH SPEED: <strong className="text-[#FFB703]">4.1 kts</strong></span>
          <span>·</span>
          <span>ALTITUDE: <strong className="text-[#F8FAFC]">8.4 m</strong></span>
          <span>·</span>
          <span>LAMBERTIAN TVG: <strong className="text-[#FFB703]">ON</strong></span>
        </div>
      </div>
    </div>
  );
};

