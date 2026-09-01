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
  Sliders,
  Palette,
  Volume2,
  Download,
  Activity,
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
    playbackSpeed,
  } = useMission();

  const [gain, setGain] = useState<number>(1.2);
  const [contrast, setContrast] = useState<number>(1.1);
  const [palette, setPalette] = useState<PaletteType>('cyan');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showRangeTicks, setShowRangeTicks] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverCoord, setHoverCoord] = useState<{ rangeM: number; ping: number } | null>(null);

  // Sync state ref for requestAnimationFrame loop
  const stateRef = useRef({
    playbackTime,
    selectedTargetId,
    gain,
    contrast,
    palette,
    showOverlays,
    showRangeTicks,
  });

  stateRef.current = {
    playbackTime,
    selectedTargetId,
    gain,
    contrast,
    palette,
    showOverlays,
    showRangeTicks,
  };

  // Convert normalized intensity (0..1) to palette RGB
  const getPaletteColor = useCallback(
    (intensity: number, pal: PaletteType, g: number, c: number): string => {
      const adjusted = Math.max(0, Math.min(1, Math.pow(intensity * g, c)));

      if (pal === 'amber') {
        // Sepia / Bronze amber phosphor
        const r = Math.floor(adjusted * 255);
        const gVal = Math.floor(adjusted * 179);
        const b = Math.floor(adjusted * 71);
        return `rgb(${r},${gVal},${b})`;
      } else if (pal === 'grayscale') {
        // High-contrast monochrome
        const v = Math.floor(adjusted * 255);
        return `rgb(${v},${v},${v})`;
      } else {
        // Cold Phosphor Marine Cyan #4CD9E8 (Default)
        const r = Math.floor(adjusted * 76);
        const gVal = Math.floor(adjusted * 217);
        const b = Math.floor(adjusted * 232);
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
        showRangeTicks: ticks,
      } = stateRef.current;

      ctx.clearRect(0, 0, W, H);

      // Deep console background (#080B11)
      ctx.fillStyle = '#080B11';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const nadirWidthPx = Math.max(16, W * 0.04);
      const halfSwathM = 37.5; // 75m total swath (-37.5m Port to +37.5m Starboard)
      const pxPerMeter = (W / 2 - nadirWidthPx / 2) / halfSwathM;

      // Draw scrolling sonar rows
      const rowHeight = 3;
      const totalRows = Math.ceil(H / rowHeight);
      const secondsPerRow = 12; // vertical time scale

      for (let r = 0; r < totalRows; r++) {
        const rowAgeSeconds = r * secondsPerRow;
        const rowPingTime = time - rowAgeSeconds;
        if (rowPingTime < 0) continue;

        const y = H - r * rowHeight;

        // Generate synthetic side-scan acoustic line
        for (let x = 0; x < W; x += 2) {
          const distFromCenter = x - cx;
          const absDist = Math.abs(distFromCenter);

          // 1. Nadir water column gap (acoustic travel time directly under towfish)
          if (absDist < nadirWidthPx / 2) {
            ctx.fillStyle = 'rgb(4, 7, 12)';
            ctx.fillRect(x, y, 2, rowHeight);
            continue;
          }

          // Across-track range in meters
          const acrossTrackM = (absDist - nadirWidthPx / 2) / pxPerMeter;
          const isStarboard = distFromCenter > 0;

          // 2. Base sediment backscatter + TVG (Time Varied Gain) curve
          const seed = (x * 7919 + r * 104729) % 1000;
          let baseNoise = (seed / 1000) * 0.12;

          // Strong seabed first return right at nadir edge (bottom track)
          if (absDist < nadirWidthPx / 2 + 12) {
            baseNoise += 0.45 * (1 - (absDist - nadirWidthPx / 2) / 12);
          }

          // Gentle grazing angle attenuation
          const grazingFactor = Math.cos((acrossTrackM / halfSwathM) * 0.6);
          let intensity = (0.15 + baseNoise) * grazingFactor;

          // 3. Render targets on this ping row
          MISSION_TARGETS.forEach((target) => {
            const timeDelta = Math.abs(rowPingTime - target.pingTime);
            if (timeDelta < 18) {
              const targetIsStarboard = target.acrossTrackMeters > 0;
              if (isStarboard === targetIsStarboard) {
                const targetDistPx =
                  nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
                const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;
                const distX = Math.abs(x - targetX);

                // Target specular highlight (illuminated side facing nadir)
                if (distX < 14) {
                  const pingFade = 1 - timeDelta / 18;
                  const specularStrength =
                    target.confidence * (1 - distX / 14) * pingFade * 0.95;
                  intensity = Math.max(intensity, specularStrength);
                }

                // Target acoustic shadow (stretches radially away from nadir)
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

      // Draw Center Nadir Water Column track line
      const nadirGrad = ctx.createLinearGradient(
        cx - nadirWidthPx / 2,
        0,
        cx + nadirWidthPx / 2,
        0
      );
      nadirGrad.addColorStop(0, 'rgba(76, 217, 232, 0.25)');
      nadirGrad.addColorStop(0.5, 'rgba(4, 7, 12, 0.95)');
      nadirGrad.addColorStop(1, 'rgba(76, 217, 232, 0.25)');
      ctx.fillStyle = nadirGrad;
      ctx.fillRect(cx - nadirWidthPx / 2, 0, nadirWidthPx, H);

      // Nadir Centerline tick
      ctx.strokeStyle = 'rgba(76, 217, 232, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Targets Overlay (Bounding Boxes, Calipers & Labels)
      if (overlays) {
        MISSION_TARGETS.forEach((target) => {
          const isSelected = selId === target.id;
          const isStarboard = target.acrossTrackMeters > 0;
          const targetDistPx =
            nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
          const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;

          // Vertical position based on ping age
          const pingAgeSeconds = time - target.pingTime;
          if (pingAgeSeconds < -20 || pingAgeSeconds > (H / rowHeight) * secondsPerRow)
            return;

          const targetY = H - (pingAgeSeconds / secondsPerRow) * rowHeight;
          const boxW = Math.max(34, target.length * pxPerMeter * 2);
          const boxH = Math.max(24, target.width * pxPerMeter * 2);

          const pulse = 0.7 + 0.3 * Math.sin(frameCount * 0.08);

          ctx.save();
          ctx.strokeStyle = isSelected ? '#4CD9E8' : 'rgba(76, 217, 232, 0.7)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.globalAlpha = isSelected ? 1 : pulse * 0.85;

          if (isSelected) {
            ctx.shadowColor = '#4CD9E8';
            ctx.shadowBlur = 10;
            // Crosshairs extending across swath
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(0, targetY);
            ctx.lineTo(W, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Target Bounding Box
          ctx.strokeRect(targetX - boxW / 2, targetY - boxH / 2, boxW, boxH);

          // Caliper tag
          ctx.fillStyle = '#080B11';
          ctx.fillRect(targetX - boxW / 2, targetY - boxH / 2 - 14, 52, 13);
          ctx.fillStyle = isSelected ? '#4CD9E8' : '#EAEFF5';
          ctx.font = 'bold 8px JetBrains Mono, monospace';
          ctx.fillText(
            `${target.id} ${(target.confidence * 100).toFixed(0)}%`,
            targetX - boxW / 2 + 3,
            targetY - boxH / 2 - 4
          );

          ctx.restore();
        });
      }

      // Draw Horizontal Across-Track Scale Range Ticks
      if (ticks) {
        ctx.fillStyle = '#080B11';
        ctx.fillRect(0, H - 24, W, 24);
        ctx.strokeStyle = '#1B2330';
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

          ctx.fillStyle = 'rgba(124, 138, 160, 0.7)';
          ctx.fillRect(rx, H - 24, 1, 6);
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            m === 0 ? 'NADIR' : `${Math.abs(m)}m ${m < 0 ? 'P' : 'S'}`,
            rx,
            H - 8
          );
        });

        // Port / Starboard labels
        ctx.textAlign = 'left';
        ctx.fillStyle = '#4CD9E8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('◀ PORT SWATH (37.5m)', 12, H - 8);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#4CD9E8';
        ctx.fillText('STARBOARD SWATH (37.5m) ▶', W - 12, H - 8);
      }

      frameCount++;
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [getPaletteColor]);

  // Click on waterfall to select nearest contact or scrub ping
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cx = canvas.width / 2;
    const nadirWidthPx = Math.max(16, canvas.width * 0.04);
    const halfSwathM = 37.5;
    const pxPerMeter = (canvas.width / 2 - nadirWidthPx / 2) / halfSwathM;
    const rowHeight = 3;
    const secondsPerRow = 12;

    let nearestTargetId: string | null = null;
    let nearestTargetTime = 0;
    let shortestDist = Infinity;

    MISSION_TARGETS.forEach((target) => {
      const isStarboard = target.acrossTrackMeters > 0;
      const targetDistPx =
        nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
      const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;

      const pingAgeSeconds = playbackTime - target.pingTime;
      const targetY = canvas.height - (pingAgeSeconds / secondsPerRow) * rowHeight;

      const dist = Math.hypot(clickX - targetX, clickY - targetY);
      if (dist < 35 && dist < shortestDist) {
        shortestDist = dist;
        nearestTargetId = target.id;
        nearestTargetTime = target.pingTime;
      }
    });

    if (nearestTargetId !== null) {
      setSelectedTargetId(nearestTargetId);
      setPlaybackTime(nearestTargetTime);
    } else {
      // Scrub timeline to clicked vertical position
      const clickedAgeSeconds =
        ((canvas.height - clickY) / rowHeight) * secondsPerRow;
      const targetTime = Math.max(0, playbackTime - clickedAgeSeconds);
      setPlaybackTime(targetTime);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2;
    const nadirWidthPx = Math.max(16, canvas.width * 0.04);
    const halfSwathM = 37.5;
    const pxPerMeter = (canvas.width / 2 - nadirWidthPx / 2) / halfSwathM;
    const isStarboard = clickX > cx;
    const distFromCenterPx = Math.abs(clickX - cx);
    const acrossM = (distFromCenterPx - nadirWidthPx / 2) / pxPerMeter;
    const rangeM = isStarboard ? Math.max(0, acrossM) : -Math.max(0, acrossM);

    const secondsPerRow = 12;
    const rowHeight = 3;
    const pingSeconds =
      playbackTime - ((canvas.height - clickY) / rowHeight) * secondsPerRow;

    setHoverCoord({
      rangeM: Math.round(rangeM * 10) / 10,
      ping: Math.max(0, Math.floor(pingSeconds * 10)),
    });
  };

  return (
    <div className="relative flex flex-col h-full bg-[#080B11] overflow-hidden select-none font-mono">
      {/* Top Sonar Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#10151D] border-b border-[#1B2330] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#4CD9E8]" />
          <span className="text-[10px] font-black text-[#EAEFF5] uppercase tracking-wider">
            SIDE-SCAN ACOUSTIC WATERFALL MOSAIC
          </span>
          <span className="text-[9px] text-[#7C8AA0]">
            · 900 kHz · 75m Swath · TVG Active
          </span>
        </div>

        {/* Sonar Control Calibrators */}
        <div className="flex items-center gap-3 text-[9px] text-[#7C8AA0]">
          {/* Gain slider */}
          <div className="flex items-center gap-1.5 bg-[#161C26] px-2 py-1 rounded-lg border border-[#1B2330]">
            <span>GAIN</span>
            <input
              type="range"
              min={0.6}
              max={2.4}
              step={0.1}
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="w-16 h-1 accent-[#4CD9E8] cursor-pointer"
            />
            <span className="text-[#4CD9E8] font-bold w-7">
              {gain.toFixed(1)}×
            </span>
          </div>

          {/* Contrast slider */}
          <div className="flex items-center gap-1.5 bg-[#161C26] px-2 py-1 rounded-lg border border-[#1B2330]">
            <span>CONTRAST</span>
            <input
              type="range"
              min={0.6}
              max={2.5}
              step={0.1}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-16 h-1 accent-[#4CD9E8] cursor-pointer"
            />
            <span className="text-[#4CD9E8] font-bold w-7">
              {contrast.toFixed(1)}×
            </span>
          </div>

          {/* Palette Switcher */}
          <div className="flex items-center rounded-lg border border-[#1B2330] overflow-hidden">
            {(['cyan', 'amber', 'grayscale'] as PaletteType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-2 py-1 text-[8px] font-bold uppercase transition-colors ${
                  palette === p
                    ? 'bg-[#4CD9E8]/20 text-[#4CD9E8]'
                    : 'bg-[#161C26] text-[#7C8AA0] hover:text-[#EAEFF5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Overlay Toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showOverlays
                ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/40 text-[#4CD9E8]'
                : 'bg-[#161C26] border-[#1B2330] text-[#7C8AA0]'
            }`}
            title="Toggle Contact Bounding Overlays"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Waterfall Canvas Viewport */}
      <div className="flex-1 relative cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ display: 'block' }}
        />

        {/* Hover Coordinate HUD */}
        {isHovering && hoverCoord && (
          <div className="absolute top-2 left-2 z-20 px-2.5 py-1.5 rounded-lg bg-[#080B11]/90 border border-[#1B2330] text-[9px] text-[#7C8AA0] flex items-center gap-3">
            <span>
              ACROSS: <strong className="text-[#4CD9E8]">{hoverCoord.rangeM > 0 ? `+${hoverCoord.rangeM}m STBD` : `${hoverCoord.rangeM}m PORT`}</strong>
            </span>
            <span>
              PING: <strong className="text-[#EAEFF5]">{hoverCoord.ping.toLocaleString()}</strong>
            </span>
            <span className="text-[#29B6F6]">TVG: ACTIVE</span>
          </div>
        )}

        {/* Selected Contact Status Tag */}
        {selectedTargetId && (
          <div className="absolute top-2 right-2 z-20 px-3 py-1.5 rounded-lg bg-[#080B11]/95 border border-[#4CD9E8]/40 text-[9px] flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#4CD9E8] animate-ping" />
            <span className="text-[#7C8AA0]">LOCKED:</span>
            <strong className="text-[#4CD9E8]">{selectedTargetId}</strong>
            <button
              onClick={() => setSelectedTargetId(null)}
              className="text-[#7C8AA0] hover:text-[#F04438] ml-1 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
