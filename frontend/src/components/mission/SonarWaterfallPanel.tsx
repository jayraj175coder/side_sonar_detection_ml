import React, { useEffect, useRef } from 'react';
import { useMission } from '../../context/MissionContext';
import { MISSION_TARGETS } from '../../data/targets';
import { interpolateVesselPosition } from '../../data/mission';
import { Eye, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const SonarWaterfallPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const stateRef  = useRef({ time: 0, targets: MISSION_TARGETS, selectedId: null as string | null });
  const { playbackTime, selectedTargetId, setSelectedTargetId, visibleTargetIds, isPlaying, playbackSpeed } = useMission();

  stateRef.current = { time: playbackTime, targets: MISSION_TARGETS, selectedId: selectedTargetId };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const { time, targets, selectedId } = stateRef.current;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#02070E';
      ctx.fillRect(0, 0, W, H);

      // Sonar waterfall rows (scroll upward as time increases)
      const rowHeight = 2;
      const numRows = Math.floor(H / rowHeight);
      const cx = W / 2;
      const nadirW = 20;

      for (let row = 0; row < numRows; row++) {
        const rowAge = row; // older rows at bottom
        const rowTime = time - rowAge * 8; // each pixel = ~8 seconds

        if (rowTime < 0) continue;

        const y = H - row * rowHeight;

        // Generate sonar intensity for this row
        for (let x = 0; x < W; x++) {
          const distFromCenter = Math.abs(x - cx);

          // Nadir gap
          if (distFromCenter < nadirW / 2) {
            ctx.fillStyle = '#010508';
            ctx.fillRect(x, y, 1, rowHeight);
            continue;
          }

          // Base seafloor noise
          let intensity = 0.08 + Math.random() * 0.12;

          // Strong nadir return
          if (distFromCenter < nadirW * 1.5) {
            intensity = 0.6 + Math.random() * 0.3;
          }

          // Target echo returns
          targets.forEach(target => {
            if (Math.abs(rowTime - target.pingTime) < 15) {
              const targetX = cx + (target.lat - 18.9217) * 8000 + (target.lon - 72.8214) * 6000;
              const clampedX = Math.max(nadirW, Math.min(W - nadirW, targetX));
              if (Math.abs(x - clampedX) < 18) {
                const pingDist = Math.abs(rowTime - target.pingTime);
                const pingFade = 1 - pingDist / 15;
                intensity = Math.max(intensity, target.confidence * 0.9 * pingFade);
                // Shadow region
                if (x > clampedX + 10 && x < clampedX + 40) {
                  intensity = Math.min(intensity, 0.02 + Math.random() * 0.02);
                }
              }
            }
          });

          // Color map: dark blue → cyan → white
          const r = Math.floor(Math.min(255, intensity * 40));
          const g = Math.floor(Math.min(255, intensity * 200));
          const b = Math.floor(Math.min(255, intensity * 255));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 1, rowHeight);
        }
      }

      // Center nadir line
      const ng = ctx.createLinearGradient(cx - nadirW, 0, cx + nadirW, 0);
      ng.addColorStop(0, 'rgba(50,230,209,0)');
      ng.addColorStop(0.5, 'rgba(50,230,209,0.3)');
      ng.addColorStop(1, 'rgba(50,230,209,0)');
      ctx.fillStyle = ng;
      ctx.fillRect(cx - nadirW, 0, nadirW * 2, H);

      // Detection bounding boxes
      targets.forEach(target => {
        if (!visibleTargetIds.includes(target.id)) return;
        const isSelected = selectedId === target.id;
        const targetX = cx + (target.lat - 18.9217) * 8000 + (target.lon - 72.8214) * 6000;
        const clampedX = Math.max(nadirW + 20, Math.min(W - 80, targetX));
        const boxY = H * 0.15;
        const boxW = 55;
        const boxH = 40;

        const pulse = 0.7 + 0.3 * Math.sin(t * 0.08 + target.lat * 100);

        ctx.save();
        ctx.strokeStyle = target.color;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.globalAlpha = isSelected ? 1 : pulse * 0.8;
        if (isSelected) {
          ctx.shadowColor = target.color;
          ctx.shadowBlur = 8;
          ctx.setLineDash([4, 2]);
        }
        ctx.strokeRect(clampedX - boxW/2, boxY, boxW, boxH);
        ctx.setLineDash([]);
        ctx.restore();

        // Label
        ctx.save();
        ctx.globalAlpha = isSelected ? 1 : pulse * 0.9;
        ctx.fillStyle = '#03070B';
        ctx.fillRect(clampedX - boxW/2, boxY - 14, 40, 12);
        ctx.fillStyle = target.color;
        ctx.font = `bold 8px JetBrains Mono, monospace`;
        ctx.fillText(`${target.id}`, clampedX - boxW/2 + 2, boxY - 4);
        ctx.fillText(`${(target.confidence * 100).toFixed(0)}%`, clampedX - boxW/2 + 2, boxY + 10);
        ctx.restore();
      });

      // Scan line (top)
      const scanY = H * 0.12 + 4 * Math.sin(t * 0.05);
      const sg = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 4);
      sg.addColorStop(0, 'rgba(50,230,209,0)');
      sg.addColorStop(0.5, 'rgba(50,230,209,0.8)');
      sg.addColorStop(1, 'rgba(50,230,209,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY, W, 3);

      // Port/Starboard labels
      ctx.fillStyle = 'rgba(102,132,141,0.6)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('PORT', 8, H - 8);
      ctx.fillText('STBD', W - 32, H - 8);

      // Range tick marks
      for (let i = 1; i <= 4; i++) {
        const rx = cx + (W / 2 - nadirW) * (i / 4);
        ctx.fillStyle = 'rgba(102,132,141,0.4)';
        ctx.fillRect(rx, H - 16, 1, 8);
        ctx.fillText(`${i * 20}m`, rx - 8, H - 18);
        const lx = cx - (W / 2 - nadirW) * (i / 4);
        ctx.fillRect(lx, H - 16, 1, 8);
        ctx.fillText(`${i * 20}m`, lx - 8, H - 18);
      }

      t++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect  = canvas.getBoundingClientRect();
    const cx    = canvas.width / 2;
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);

    // Find nearest visible target to click
    let best: string | null = null;
    let bestDist = Infinity;
    MISSION_TARGETS.forEach(target => {
      if (!visibleTargetIds.includes(target.id)) return;
      const targetX = cx + (target.lat - 18.9217) * 8000 + (target.lon - 72.8214) * 6000;
      const clampedX = Math.max(30, Math.min(canvas.width - 80, targetX));
      const dist = Math.abs(clickX - clampedX);
      if (dist < 40 && dist < bestDist) { bestDist = dist; best = target.id; }
    });
    setSelectedTargetId(best);
  };

  return (
    <div className="relative flex flex-col h-full bg-[#02070E] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#081118] border-b border-[#16303B] shrink-0">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-[#32E6D1]" />
          <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Sonar Waterfall</span>
          <span className="ml-2 text-[9px] font-mono text-[#32E6D1]">900 kHz · Range 75m</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono">
          {['PORT', 'STBD', 'GAIN', 'CONTRAST', 'TARGETS'].map(label => (
            <button key={label}
              className="px-2 py-0.5 rounded bg-[#0C171E] border border-[#16303B] text-[#66848D] hover:text-[#32E6D1] hover:border-[#32E6D1]/40 transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          style={{ display: 'block' }}
        />
        {/* Ping counter overlay */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[#03070B]/80 border border-[#16303B] text-[9px] font-mono text-[#32E6D1]">
          PING {Math.floor(playbackTime * 10).toLocaleString().padStart(7, '0')}
        </div>
        {visibleTargetIds.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[11px] font-mono text-[#66848D] animate-pulse">AWAITING SONAR DATA — START MISSION</p>
          </div>
        )}
      </div>
    </div>
  );
};
