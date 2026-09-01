import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMission } from '../../context/MissionContext';
import { MISSION_TARGETS, getTargetById } from '../../data/targets';
import type { MissionTarget } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Crosshair,
  Maximize2,
  Minimize2,
  Sliders,
  Palette,
  Volume2,
  Download,
  Activity,
  Check,
  Ruler,
  Maximize,
} from 'lucide-react';

type PaletteType = 'cyan' | 'amber' | 'grayscale';

export const HeroSonarWaterfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const {
    playbackTime,
    setPlaybackTime,
    selectedTargetId,
    setSelectedTargetId,
    isPlaying,
    focusedPanel,
    setFocusedPanel,
    activeTargets,
  } = useMission();

  const [gain, setGain] = useState<number>(1.2);
  const [contrast, setContrast] = useState<number>(1.1);
  const [palette, setPalette] = useState<PaletteType>('cyan');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showMeasure, setShowMeasure] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sync state ref for requestAnimationFrame loop
  const stateRef = useRef({
    playbackTime,
    selectedTargetId,
    gain,
    contrast,
    palette,
    showOverlays,
    zoomLevel,
    activeTargets,
  });

  stateRef.current = {
    playbackTime,
    selectedTargetId,
    gain,
    contrast,
    palette,
    showOverlays,
    zoomLevel,
    activeTargets,
  };

  // Convert normalized intensity (0..1) to palette RGB
  const getPaletteColor = useCallback(
    (intensity: number, pal: PaletteType, g: number, c: number): string => {
      const adjusted = Math.max(0, Math.min(1, Math.pow(intensity * g, c)));

      if (pal === 'amber') {
        const r = Math.floor(adjusted * 255);
        const gVal = Math.floor(adjusted * 181);
        const b = Math.floor(adjusted * 71);
        return `rgb(${r},${gVal},${b})`;
      } else if (pal === 'grayscale') {
        const v = Math.floor(adjusted * 255);
        return `rgb(${v},${v},${v})`;
      } else {
        // High-end Scientific Sonar Cyan #32E6D1
        const r = Math.floor(adjusted * 50);
        const gVal = Math.floor(adjusted * 230);
        const b = Math.floor(adjusted * 209);
        return `rgb(${r},${gVal},${b})`;
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let frameCount = 0;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const {
        playbackTime: time,
        selectedTargetId: selId,
        gain: g,
        contrast: c,
        palette: pal,
        showOverlays: overlays,
      } = stateRef.current;

      ctx.fillStyle = '#03070B';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const nadirWidthPx = Math.max(16, W * 0.04);
      const swathWidthMeters = 75;
      const pxPerMeter = (W - nadirWidthPx) / (2 * (swathWidthMeters / 2));
      const rowHeight = 2;
      const numRows = Math.ceil(H / rowHeight);
      const secondsPerRow = 0.4;

      // 1. Render High-Resolution Side-Scan Sonar Acoustic Mosaic
      for (let r = 0; r < numRows; r++) {
        const y = r * rowHeight;
        const pingTimeForRow = time - ((H - y) / rowHeight) * secondsPerRow;

        for (let x = 0; x < W; x += 2) {
          const isStarboard = x > cx;
          const distFromNadirPx = isStarboard ? x - (cx + nadirWidthPx / 2) : cx - nadirWidthPx / 2 - x;

          if (Math.abs(x - cx) < nadirWidthPx / 2) {
            ctx.fillStyle = '#020408';
            ctx.fillRect(x, y, 2, rowHeight);
            continue;
          }

          const distMeters = distFromNadirPx / pxPerMeter;
          const tvgFactor = Math.pow(Math.max(1, distMeters / 10), 0.7);

          const noiseVal =
            (Math.sin((x + pingTimeForRow * 35) * 0.08) * 0.3 +
              Math.sin(y * 0.12) * 0.2 +
              Math.sin((x * 12.9898 + y * 78.233 + pingTimeForRow) * 43758.5453 % 1) * 0.35 +
              0.45) *
            tvgFactor *
            0.38;

          let intensity = Math.max(0.02, Math.min(0.95, noiseVal));

          // Draw object echo highlights & acoustic shadows
          const targetList = stateRef.current.activeTargets && stateRef.current.activeTargets.length > 0
            ? stateRef.current.activeTargets
            : MISSION_TARGETS;

          targetList.forEach((target) => {
            const isTargetStarboard = target.acrossTrackMeters > 0;
            if (isStarboard === isTargetStarboard) {
              const targetDistPx =
                nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
              const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;
              const pingAgeSec = time - target.pingTime;
              const targetY = H - (pingAgeSec / secondsPerRow) * rowHeight;

              const distX = x - targetX;
              const distY = y - targetY;
              const objRadius = Math.max(4, target.length * pxPerMeter * 0.4);

              // Highlight return
              if (distX * distX + distY * distY < objRadius * objRadius) {
                intensity = Math.min(1.0, 0.88 + Math.sin(x * 0.5) * 0.12);
              }

              // Shadow corridor
              if (Math.abs(distY) < objRadius * 1.2) {
                const shadowStartDist = isStarboard ? x - targetX : targetX - x;
                const shadowLengthPx = target.shadowLength * pxPerMeter * 1.5;
                if (shadowStartDist > 0 && shadowStartDist < shadowLengthPx) {
                  const shadowFade = Math.abs(distX) < 16 ? 1 : 0.5;
                  intensity = Math.min(intensity, 0.012 * shadowFade);
                }
              }
            }
          });

          ctx.fillStyle = getPaletteColor(intensity, pal, g, c);
          ctx.fillRect(x, y, 2, rowHeight);
        }
      }

      // 2. Center Nadir Water Column Track
      const nadirGrad = ctx.createLinearGradient(
        cx - nadirWidthPx / 2,
        0,
        cx + nadirWidthPx / 2,
        0
      );
      nadirGrad.addColorStop(0, 'rgba(50, 230, 209, 0.25)');
      nadirGrad.addColorStop(0.5, 'rgba(3, 7, 11, 0.95)');
      nadirGrad.addColorStop(1, 'rgba(50, 230, 209, 0.25)');
      ctx.fillStyle = nadirGrad;
      ctx.fillRect(cx - nadirWidthPx / 2, 0, nadirWidthPx, H);

      ctx.strokeStyle = 'rgba(50, 230, 209, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. AI Detection Overlays (Bounding Boxes & Caliper Reticles)
      if (overlays) {
        const targetList = stateRef.current.activeTargets && stateRef.current.activeTargets.length > 0
          ? stateRef.current.activeTargets
          : MISSION_TARGETS;

        targetList.forEach((target) => {
          const isSelected = selId === target.id;
          const isFilteredOut = target.uncertaintyRating.includes('FILTERED') || target.confidence < 0.4;
          const isStarboard = target.acrossTrackMeters > 0;
          const targetDistPx =
            nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
          const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;

          const pingAgeSeconds = time - target.pingTime;
          if (pingAgeSeconds < -20 || pingAgeSeconds > (H / rowHeight) * secondsPerRow)
            return;

          const targetY = H - (pingAgeSeconds / secondsPerRow) * rowHeight;
          const boxW = Math.max(42, target.length * pxPerMeter * 1.8);
          const boxH = Math.max(28, target.width * pxPerMeter * 1.8);

          const isGhostNet = target.id === 'SX-T07' || target.class.toLowerCase().includes('ghost net');
          const isDebris = target.class.toLowerCase().includes('debris') || target.class.toLowerCase().includes('gear');

          const classColor = isFilteredOut
            ? '#6F8992'
            : isGhostNet
            ? '#32E6D1'
            : isDebris
            ? '#FFB547'
            : '#29B6F6';

          const pulse = 0.8 + 0.2 * Math.sin(frameCount * 0.08);

          ctx.save();

          // Synthetic echo render on mosaic
          if (isGhostNet) {
            // Irregular netting cluster
            ctx.fillStyle = '#32E6D1';
            ctx.shadowColor = '#32E6D1';
            ctx.shadowBlur = isSelected ? 16 : 8;
            ctx.beginPath();
            ctx.ellipse(targetX, targetY, boxW * 0.35, boxH * 0.3, 0.4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Bounding Box
          ctx.strokeStyle = isSelected ? '#32E6D1' : classColor;
          ctx.lineWidth = isSelected ? 2.5 : 1;

          if (isFilteredOut) {
            ctx.setLineDash([3, 3]);
            ctx.globalAlpha = 0.5;
          } else {
            ctx.setLineDash([]);
            ctx.globalAlpha = isSelected ? 1.0 : pulse * 0.9;
          }

          if (isSelected) {
            ctx.shadowColor = '#32E6D1';
            ctx.shadowBlur = 14;
            // Crosshair guidelines
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(0, targetY);
            ctx.lineTo(W, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.strokeRect(targetX - boxW / 2, targetY - boxH / 2, boxW, boxH);

          // Prominent Label Pill
          if (isSelected || isGhostNet) {
            const labelText = `${target.id} // ${target.class.toUpperCase()} ${(target.confidence * 100).toFixed(1)}%`;
            const labelWidth = Math.max(100, labelText.length * 6.5 + 12);

            ctx.fillStyle = '#081118';
            ctx.fillRect(targetX - boxW / 2, targetY - boxH / 2 - 18, labelWidth, 16);
            ctx.strokeStyle = classColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(targetX - boxW / 2, targetY - boxH / 2 - 18, labelWidth, 16);

            ctx.fillStyle = classColor;
            ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
            ctx.fillText(labelText, targetX - boxW / 2 + 5, targetY - boxH / 2 - 6);

            // Dimension Sub-Tag
            ctx.fillStyle = '#6F8992';
            ctx.font = '7.5px "JetBrains Mono", monospace';
            ctx.fillText(
              `${target.length}m (L) × ${target.width}m (W) · Shadow ${target.shadowLength}m`,
              targetX - boxW / 2,
              targetY + boxH / 2 + 12
            );
          }

          ctx.restore();
        });
      }

      // 4. Horizontal Range Scale Ticks
      ctx.fillStyle = '#081118';
      ctx.fillRect(0, H - 24, W, 24);
      ctx.strokeStyle = '#16303B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H - 24);
      ctx.lineTo(W, H - 24);
      ctx.stroke();

      const rangeIntervals = [-30, -20, -10, 0, 10, 20, 30];
      rangeIntervals.forEach((m) => {
        let rx = cx;
        if (m < 0) {
          rx = cx - (nadirWidthPx / 2 + Math.abs(m) * pxPerMeter);
        } else if (m > 0) {
          rx = cx + (nadirWidthPx / 2 + m * pxPerMeter);
        }

        ctx.fillStyle = 'rgba(111, 137, 146, 0.7)';
        ctx.fillRect(rx, H - 24, 1, 6);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          m === 0 ? 'NADIR' : `${Math.abs(m)}m ${m < 0 ? 'P' : 'S'}`,
          rx,
          H - 8
        );
      });

      ctx.textAlign = 'left';
      ctx.fillStyle = '#32E6D1';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('◀ PORT SWATH (37.5m)', 12, H - 8);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#32E6D1';
      ctx.fillText('STARBOARD SWATH (37.5m) ▶', W - 12, H - 8);

      frameCount++;
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [getPaletteColor]);

  // Click on waterfall to select nearest contact
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cx = canvas.width / 2;
    const nadirWidthPx = Math.max(16, canvas.width * 0.04);
    const swathWidthMeters = 75;
    const pxPerMeter = (canvas.width - nadirWidthPx) / (2 * (swathWidthMeters / 2));
    const rowHeight = 2;
    const secondsPerRow = 0.4;

    const targetList = stateRef.current.activeTargets && stateRef.current.activeTargets.length > 0
      ? stateRef.current.activeTargets
      : MISSION_TARGETS;

    let nearestTargetId: string | null = null;
    let minDist = 40;

    targetList.forEach((target) => {
      const isStarboard = target.acrossTrackMeters > 0;
      const targetDistPx = nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
      const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;
      const pingAgeSec = playbackTime - target.pingTime;
      const targetY = canvas.height - (pingAgeSec / secondsPerRow) * rowHeight;

      const dx = clickX - targetX;
      const dy = clickY - targetY;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < minDist) {
        minDist = d;
        nearestTargetId = target.id;
      }
    });

    if (nearestTargetId) {
      setSelectedTargetId(nearestTargetId);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[#03070B] overflow-hidden select-none font-mono">
      {/* 1. High-End Scientific Sonar Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#081118] border-b border-[#16303B] shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-[#32E6D1]" />
          <h2 className="text-xs font-black text-[#E4F2F5] uppercase tracking-wider font-sans">
            SIDE-SCAN SONAR
          </h2>
          <span className="text-[10px] text-[#6F8992]">
            · 900 kHz · 75m Swath · Gain {gain.toFixed(1)}× · Contrast {contrast.toFixed(1)}×
          </span>
        </div>

        {/* Sonar Control Toolbar */}
        <div className="flex items-center gap-2 text-[9px] text-[#6F8992]">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-[#16303B] bg-[#0C171E] overflow-hidden">
            <button
              onClick={() => setZoomLevel(1.0)}
              className="px-2 py-1 hover:text-[#32E6D1] text-[8px] font-bold border-r border-[#16303B] cursor-pointer"
              title="Fit to window"
            >
              FIT
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-1 hover:text-[#32E6D1] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="p-1 hover:text-[#32E6D1] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
          </div>

          {/* Gain slider */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0C171E] px-2 py-1 rounded-lg border border-[#16303B]">
            <span>GAIN</span>
            <input
              type="range"
              min={0.6}
              max={2.4}
              step={0.1}
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="w-12 h-1 accent-[#32E6D1] cursor-pointer"
            />
            <span className="text-[#32E6D1] font-bold w-6">{gain.toFixed(1)}×</span>
          </div>

          {/* Contrast slider */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0C171E] px-2 py-1 rounded-lg border border-[#16303B]">
            <span>CONTRAST</span>
            <input
              type="range"
              min={0.6}
              max={2.5}
              step={0.1}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-12 h-1 accent-[#32E6D1] cursor-pointer"
            />
            <span className="text-[#32E6D1] font-bold w-6">{contrast.toFixed(1)}×</span>
          </div>

          {/* Palette Switcher */}
          <div className="flex items-center rounded-lg border border-[#16303B] overflow-hidden bg-[#0C171E]">
            {(['cyan', 'amber', 'grayscale'] as PaletteType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-2 py-1 text-[8px] font-bold uppercase transition-colors cursor-pointer ${
                  palette === p
                    ? 'bg-[#32E6D1] text-[#03070B]'
                    : 'text-[#6F8992] hover:text-[#E4F2F5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Overlay Toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2 py-1 rounded-lg border text-[8px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              showOverlays
                ? 'bg-[#32E6D1]/20 border-[#32E6D1] text-[#32E6D1]'
                : 'bg-[#0C171E] border-[#16303B] text-[#6F8992]'
            }`}
            title="Toggle AI Detection Bounding Boxes"
          >
            <Crosshair className="w-3 h-3" />
            <span>TARGETS</span>
          </button>

          {/* Maximize / Focus Mode Button */}
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'waterfall' ? null : 'waterfall')}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              focusedPanel === 'waterfall'
                ? 'bg-[#32E6D1]/20 border-[#32E6D1] text-[#32E6D1]'
                : 'bg-[#0C171E] border-[#16303B] text-[#6F8992] hover:text-[#E4F2F5]'
            }`}
            title={focusedPanel === 'waterfall' ? 'Restore panel layout' : 'Maximize Waterfall View'}
          >
            {focusedPanel === 'waterfall' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Mosaic Area */}
      <div className="flex-1 relative cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
