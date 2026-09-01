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
  FileSpreadsheet,
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
    focusedPanel,
    setFocusedPanel,
    activeTargets,
  } = useMission();

  const [gain, setGain] = useState<number>(1.2);
  const [contrast, setContrast] = useState<number>(1.1);
  const [palette, setPalette] = useState<PaletteType>('cyan');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showRangeTicks, setShowRangeTicks] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverCoord, setHoverCoord] = useState<{ rangeM: number; ping: number } | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sync state ref for requestAnimationFrame loop
  const stateRef = useRef({
    playbackTime,
    selectedTargetId,
    gain,
    contrast,
    palette,
    showOverlays,
    showRangeTicks,
    activeTargets,
  });

  stateRef.current = {
    playbackTime,
    selectedTargetId,
    gain,
    contrast,
    palette,
    showOverlays,
    showRangeTicks,
    activeTargets,
  };

  // Convert normalized intensity (0..1) to palette RGB
  const getPaletteColor = useCallback(
    (intensity: number, pal: PaletteType, g: number, c: number): string => {
      const adjusted = Math.max(0, Math.min(1, Math.pow(intensity * g, c)));

      if (pal === 'amber') {
        const r = Math.floor(adjusted * 255);
        const gVal = Math.floor(adjusted * 179);
        const b = Math.floor(adjusted * 71);
        return `rgb(${r},${gVal},${b})`;
      } else if (pal === 'grayscale') {
        const v = Math.floor(adjusted * 255);
        return `rgb(${v},${v},${v})`;
      } else {
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

      ctx.fillStyle = '#03070E';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const nadirWidthPx = Math.max(16, W * 0.04);
      const swathWidthMeters = 75;
      const pxPerMeter = (W - nadirWidthPx) / (2 * (swathWidthMeters / 2));
      const rowHeight = 2;
      const numRows = Math.ceil(H / rowHeight);
      const secondsPerRow = 0.4;

      // 1. Procedural High-Fidelity Sonar Seabed Texture
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
                intensity = Math.min(1.0, 0.85 + Math.sin(x * 0.5) * 0.15);
              }

              // Shadow calculation
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

      // Center Nadir Water Column Track
      const nadirGrad = ctx.createLinearGradient(
        cx - nadirWidthPx / 2,
        0,
        cx + nadirWidthPx / 2,
        0
      );
      nadirGrad.addColorStop(0, 'rgba(76, 217, 232, 0.25)');
      nadirGrad.addColorStop(0.5, 'rgba(3, 7, 14, 0.95)');
      nadirGrad.addColorStop(1, 'rgba(76, 217, 232, 0.25)');
      ctx.fillStyle = nadirGrad;
      ctx.fillRect(cx - nadirWidthPx / 2, 0, nadirWidthPx, H);

      ctx.strokeStyle = 'rgba(76, 217, 232, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Detected Bounding Boxes with Confidence Tiers (SIH Gap 1 Requirement)
      if (overlays) {
        const targetList = stateRef.current.activeTargets && stateRef.current.activeTargets.length > 0
          ? stateRef.current.activeTargets
          : MISSION_TARGETS;

        targetList.forEach((target) => {
          const isSelected = selId === target.id;
          const isStarboard = target.acrossTrackMeters > 0;
          const targetDistPx =
            nadirWidthPx / 2 + Math.abs(target.acrossTrackMeters) * pxPerMeter;
          const targetX = isStarboard ? cx + targetDistPx : cx - targetDistPx;

          const pingAgeSeconds = time - target.pingTime;
          if (pingAgeSeconds < -20 || pingAgeSeconds > (H / rowHeight) * secondsPerRow)
            return;

          const targetY = H - (pingAgeSeconds / secondsPerRow) * rowHeight;
          const boxW = Math.max(38, target.length * pxPerMeter * 1.8);
          const boxH = Math.max(26, target.width * pxPerMeter * 1.8);

          const isDebris = target.classCode === 'NET' || target.class.toLowerCase().includes('debris');
          const isPipe = target.classCode === 'PIP' || target.class.toLowerCase().includes('pipeline');
          const isMine = target.classCode === 'MLO' || target.class.toLowerCase().includes('mine');
          const isWreck = target.classCode === 'WRK' || target.class.toLowerCase().includes('wreck');

          // Confidence-tiered color
          const isHighConf = target.confidence >= 0.85;
          const isMedConf = target.confidence >= 0.65 && target.confidence < 0.85;
          const isLowConf = target.confidence < 0.65;

          const classColor = isDebris
            ? '#A855F7'
            : isPipe
            ? '#29B6F6'
            : isMine
            ? '#F04438'
            : isWreck
            ? '#F5A623'
            : target.color || '#4CD9E8';

          const pulse = 0.75 + 0.25 * Math.sin(frameCount * 0.08);

          ctx.save();

          // Highlight and shadow synthetic returns
          if (isPipe) {
            ctx.fillStyle = classColor;
            ctx.shadowColor = classColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(targetX - boxW / 2, targetY - 2, boxW, 4);
          } else if (isDebris) {
            ctx.fillStyle = classColor;
            ctx.shadowColor = classColor;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.ellipse(targetX, targetY, boxW * 0.35, boxH * 0.3, 0.3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = classColor;
            ctx.shadowColor = classColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(targetX, targetY, Math.max(5, boxW * 0.25), Math.max(4, boxH * 0.25), (target.orientation * Math.PI) / 180, 0, Math.PI * 2);
            ctx.fill();
          }

          // Bounding Box Reticle
          ctx.strokeStyle = isSelected ? '#4CD9E8' : classColor;
          ctx.lineWidth = isSelected ? 2 : 1;

          // Dashed box for low confidence / ambiguous contacts (Honesty-about-uncertainty)
          if (isLowConf) {
            ctx.setLineDash([4, 4]);
            ctx.globalAlpha = isSelected ? 0.9 : 0.6;
          } else {
            ctx.setLineDash([]);
            ctx.globalAlpha = isSelected ? 1 : pulse * 0.9;
          }

          if (isSelected) {
            ctx.shadowColor = '#4CD9E8';
            ctx.shadowBlur = 12;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(0, targetY);
            ctx.lineTo(W, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.strokeRect(targetX - boxW / 2, targetY - boxH / 2, boxW, boxH);

          // Auto-Label Header Tag
          const labelText = `${target.classCode || 'OBJ'}: ${target.class} ${(target.confidence * 100).toFixed(0)}%`;
          const labelWidth = Math.max(80, labelText.length * 6 + 10);

          ctx.fillStyle = '#060D17';
          ctx.fillRect(targetX - boxW / 2, targetY - boxH / 2 - 16, labelWidth, 15);
          ctx.strokeStyle = classColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(targetX - boxW / 2, targetY - boxH / 2 - 16, labelWidth, 15);

          ctx.fillStyle = classColor;
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.fillText(labelText, targetX - boxW / 2 + 4, targetY - boxH / 2 - 5);

          // Dimension Sub-Tag
          ctx.fillStyle = '#7C8AA0';
          ctx.font = '7px "JetBrains Mono", monospace';
          ctx.fillText(`${target.length}m × ${target.width}m`, targetX - boxW / 2, targetY + boxH / 2 + 10);

          ctx.restore();
        });
      }

      // Horizontal Scale Range Ticks
      if (ticks) {
        ctx.fillStyle = '#060D17';
        ctx.fillRect(0, H - 24, W, 24);
        ctx.strokeStyle = '#152438';
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
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            m === 0 ? 'NADIR' : `${Math.abs(m)}m ${m < 0 ? 'P' : 'S'}`,
            rx,
            H - 8
          );
        });

        ctx.textAlign = 'left';
        ctx.fillStyle = '#4CD9E8';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
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
    let minDist = 35;

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

  // Export Complete Mission Anomaly CSV (SIH Gap 3 Requirement)
  const handleExportMissionCsv = () => {
    const targetList = activeTargets && activeTargets.length > 0 ? activeTargets : MISSION_TARGETS;
    const headers = ['Target_ID', 'Trackline', 'Class', 'Code', 'Confidence', 'Lat', 'Lon', 'Depth_M', 'Length_M', 'Width_M', 'Shadow_Length_M', 'Relief_M', 'Risk', 'Target_Strength_dB'];
    const rows = targetList.map((t) => [
      t.id,
      t.tracklineId,
      `"${t.class}"`,
      t.classCode,
      (t.confidence * 100).toFixed(1) + '%',
      t.lat,
      t.lon,
      t.depth,
      t.length,
      t.width,
      t.shadowLength,
      t.estimatedHeight,
      t.risk,
      t.targetStrengthDb,
    ].join(','));

    const csvContent = `${headers.join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SX-014_complete_mission_anomalies.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="relative flex flex-col h-full bg-[#03070E] overflow-hidden select-none font-mono">
      {/* Top Sonar Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#060D17] border-b border-[#152438] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#4CD9E8]" />
          <span className="text-[10px] font-black text-[#EAEFF5] uppercase tracking-wider">
            SIDE-SCAN ACOUSTIC WATERFALL MOSAIC
          </span>
          <span className="text-[9px] text-[#7C8AA0]">
            · 900 kHz · 75m Swath · BBOX ACTIVE
          </span>
        </div>

        {/* Sonar Control Calibrators */}
        <div className="flex items-center gap-3 text-[9px] text-[#7C8AA0]">
          {/* Gain slider */}
          <div className="flex items-center gap-1.5 bg-[#0A1322] px-2 py-1 rounded-lg border border-[#152438]">
            <span>GAIN</span>
            <input
              type="range"
              min={0.6}
              max={2.4}
              step={0.1}
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="w-14 h-1 accent-[#4CD9E8] cursor-pointer"
            />
            <span className="text-[#4CD9E8] font-bold w-6">
              {gain.toFixed(1)}×
            </span>
          </div>

          {/* Contrast slider */}
          <div className="flex items-center gap-1.5 bg-[#0A1322] px-2 py-1 rounded-lg border border-[#152438]">
            <span>CONTRAST</span>
            <input
              type="range"
              min={0.6}
              max={2.5}
              step={0.1}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-14 h-1 accent-[#4CD9E8] cursor-pointer"
            />
            <span className="text-[#4CD9E8] font-bold w-6">
              {contrast.toFixed(1)}×
            </span>
          </div>

          {/* Palette Switcher */}
          <div className="flex items-center rounded-lg border border-[#152438] overflow-hidden">
            {(['cyan', 'amber', 'grayscale'] as PaletteType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-2 py-1 text-[8px] font-bold uppercase transition-colors cursor-pointer ${
                  palette === p
                    ? 'bg-[#4CD9E8]/20 text-[#4CD9E8]'
                    : 'bg-[#0A1322] text-[#7C8AA0] hover:text-[#EAEFF5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Overlay Toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showOverlays
                ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/40 text-[#4CD9E8]'
                : 'bg-[#0A1322] border-[#152438] text-[#7C8AA0]'
            }`}
            title="Toggle Contact Bounding Boxes & Reticles"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* SIH GAP 3 — Instant Survey Anomaly CSV Export Button */}
          <button
            onClick={handleExportMissionCsv}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[#EAEFF5] hover:text-[#4CD9E8] transition-colors cursor-pointer shadow-sm"
            title="Download Complete Mission Anomaly CSV"
          >
            {isExporting ? <Check className="w-3 h-3 text-[#3FD98A]" /> : <Download className="w-3 h-3 text-[#4CD9E8]" />}
            <span className="hidden sm:inline">{isExporting ? 'CSV SAVED' : 'EXPORT CSV'}</span>
          </button>

          {/* Maximize / Focus Mode Button */}
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'waterfall' ? null : 'waterfall')}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              focusedPanel === 'waterfall'
                ? 'bg-[#4CD9E8]/20 border-[#4CD9E8] text-[#4CD9E8]'
                : 'bg-[#0A1322] border-[#152438] text-[#7C8AA0] hover:text-[#EAEFF5]'
            }`}
            title={focusedPanel === 'waterfall' ? 'Restore panel layout' : 'Maximize Waterfall view'}
          >
            {focusedPanel === 'waterfall' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Mosaic Viewer */}
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
