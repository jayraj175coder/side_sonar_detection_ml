import React, { useEffect, useRef } from 'react';
import { useMission } from '../../context/MissionContext';
import { MISSION_TARGETS } from '../../data/targets';
import { interpolateVesselPosition } from '../../data/mission';

export const SeabedPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const rotRef    = useRef({ rx: 0.4, ry: 0, dragging: false, lastX: 0, lastY: 0 });
  const stateRef  = useRef({ time: 0, selectedId: null as string | null, visibleIds: [] as string[] });
  const { playbackTime, selectedTargetId, visibleTargetIds, showBathymetry } = useMission();

  stateRef.current = { time: playbackTime, selectedId: selectedTargetId, visibleIds: visibleTargetIds };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    // --- Mouse drag for rotation ---
    const onMouseDown = (e: MouseEvent) => { rotRef.current.dragging = true; rotRef.current.lastX = e.clientX; rotRef.current.lastY = e.clientY; };
    const onMouseMove = (e: MouseEvent) => {
      if (!rotRef.current.dragging) return;
      rotRef.current.ry += (e.clientX - rotRef.current.lastX) * 0.01;
      rotRef.current.rx -= (e.clientY - rotRef.current.lastY) * 0.005;
      rotRef.current.rx = Math.max(0.1, Math.min(0.9, rotRef.current.rx));
      rotRef.current.lastX = e.clientX; rotRef.current.lastY = e.clientY;
    };
    const onMouseUp = () => { rotRef.current.dragging = false; };
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // --- Build heightmap (40×40 grid) ---
    const GRID = 40;
    const heightmap: number[][] = [];
    for (let i = 0; i <= GRID; i++) {
      heightmap[i] = [];
      for (let j = 0; j <= GRID; j++) {
        const nx = i / GRID, ny = j / GRID;
        const h = (
          Math.sin(nx * 3.7 + 0.5) * 0.28 +
          Math.cos(ny * 4.1 + 1.2) * 0.22 +
          Math.sin((nx + ny) * 6.3) * 0.12 +
          Math.cos(nx * 9.1) * 0.08 +
          (Math.random() * 0.04 - 0.02)
        );
        heightmap[i][j] = Math.max(0, Math.min(1, h + 0.3));
      }
    }

    // Project 3D → 2D (isometric/perspective)
    const project = (gx: number, gy: number, gz: number, W: number, H: number, ry: number, rx: number) => {
      // Normalize to [-1, 1]
      const x = (gx / GRID - 0.5) * 2;
      const y = (gy / GRID - 0.5) * 2;
      const z = gz * 0.5;

      // Rotation Y (yaw)
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const rx1 = x * cosY - z * sinY;
      const ry1 = y;
      const rz1 = x * sinY + z * cosY;

      // Rotation X (pitch) — fixed tilt
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const rx2 = rx1;
      const ry2 = ry1 * cosX - rz1 * sinX;
      const rz2 = ry1 * sinX + rz1 * cosX;

      // Perspective
      const fov = 2.2;
      const scale = fov / (fov + rz2 + 1.5);

      return {
        sx: W * 0.5 + rx2 * scale * W * 0.38,
        sy: H * 0.48 + ry2 * scale * H * 0.4,
        depth: rz2,
      };
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const { selectedId, visibleIds, time } = stateRef.current;
      const { rx, ry } = rotRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#02070E';
      ctx.fillRect(0, 0, W, H);

      // Depth color function
      const depthColor = (h: number) => {
        if (h < 0.2) return `rgb(${Math.floor(h * 80)},${Math.floor(h * 140)},${Math.floor(140 + h * 100)})`;
        if (h < 0.5) return `rgb(${Math.floor(h * 60)},${Math.floor(60 + h * 120)},${Math.floor(100 + h * 80)})`;
        return `rgb(${Math.floor(30 + h * 80)},${Math.floor(80 + h * 60)},${Math.floor(60 + h * 40)})`;
      };

      // Draw quad grid front-to-back (painter's algorithm)
      // Sort cells by depth
      type Cell = { i: number; j: number; avgDepth: number };
      const cells: Cell[] = [];
      for (let i = 0; i < GRID; i++) {
        for (let j = 0; j < GRID; j++) {
          const p = project(i + 0.5, j + 0.5, heightmap[i][j], W, H, ry, rx);
          cells.push({ i, j, avgDepth: p.depth });
        }
      }
      cells.sort((a, b) => b.avgDepth - a.avgDepth);

      cells.forEach(({ i, j }) => {
        const corners = [
          project(i,   j,   heightmap[i][j],     W, H, ry, rx),
          project(i+1, j,   heightmap[i+1][j],   W, H, ry, rx),
          project(i+1, j+1, heightmap[i+1][j+1], W, H, ry, rx),
          project(i,   j+1, heightmap[i][j+1],   W, H, ry, rx),
        ];

        const avgH = (heightmap[i][j] + heightmap[i+1][j] + heightmap[i+1][j+1] + heightmap[i][j+1]) / 4;

        ctx.beginPath();
        ctx.moveTo(corners[0].sx, corners[0].sy);
        corners.slice(1).forEach(c => ctx.lineTo(c.sx, c.sy));
        ctx.closePath();

        ctx.fillStyle = depthColor(avgH);
        ctx.fill();

        // Sonar swath region (center strip)
        const isSwath = i >= GRID * 0.35 && i <= GRID * 0.65;
        if (isSwath) {
          ctx.fillStyle = 'rgba(50,230,209,0.06)';
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(22,48,59,0.5)';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      });

      // Draw vessel track
      const trackPoints = [
        [5, 2], [5, 8], [5, 14], [5, 20], [5, 26], [5, 32],
        [15, 32], [15, 26], [15, 20], [15, 14], [15, 8], [15, 2],
      ] as [number, number][];

      ctx.beginPath();
      trackPoints.forEach(([ti, tj], idx) => {
        const h = heightmap[Math.min(ti, GRID-1)][Math.min(tj, GRID-1)];
        const p = project(ti, tj, h + 0.05, W, H, ry, rx);
        if (idx === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      });
      ctx.strokeStyle = 'rgba(50,230,209,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw targets
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
      MISSION_TARGETS.filter(t => visibleIds.includes(t.id)).forEach((target, idx) => {
        const gi = 8 + (idx % 7) * 4;
        const gj = 5 + Math.floor(idx / 7) * 14;
        const h = heightmap[Math.min(gi, GRID-1)][Math.min(gj, GRID-1)];
        const p = project(gi, gj, h + 0.08, W, H, ry, rx);
        const isSelected = selectedId === target.id;
        const r = isSelected ? 5 : 3.5;

        // Glow
        const grd = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 3);
        grd.addColorStop(0, target.color + (isSelected ? 'cc' : '66'));
        grd.addColorStop(1, target.color + '00');
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 3 * (isSelected ? pulse : 1), 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.fill();

        // Label for selected
        if (isSelected) {
          ctx.fillStyle = '#03070B';
          ctx.fillRect(p.sx + 7, p.sy - 8, 40, 14);
          ctx.fillStyle = target.color;
          ctx.font = 'bold 8px JetBrains Mono, monospace';
          ctx.fillText(target.id, p.sx + 9, p.sy + 1);
        }
      });

      // Vessel current position
      if (time > 0) {
        const vessel = interpolateVesselPosition(time);
        const gi = Math.floor(((vessel.lat - 18.907) / 0.028) * GRID);
        const gj = Math.floor(((vessel.lon - 72.808) / 0.022) * GRID);
        const cgi = Math.max(0, Math.min(GRID - 1, gi));
        const cgj = Math.max(0, Math.min(GRID - 1, gj));
        const h = heightmap[cgi][cgj];
        const p = project(cgi, cgj, h + 0.1, W, H, ry, rx);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#32E6D1';
        ctx.shadowColor = '#32E6D1';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Auto-rotate slowly when not dragging
      if (!rotRef.current.dragging) {
        rotRef.current.ry += 0.002;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="relative flex flex-col h-full bg-[#02070E] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#081118] border-b border-[#16303B] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">3D Seafloor</span>
          <span className="text-[9px] font-mono text-[#29B6F6] ml-2">Drag to rotate</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono">
          {['BATHYMETRY', 'TARGETS', 'TRACK'].map(l => (
            <span key={l} className="px-1.5 py-0.5 rounded bg-[#0C171E] border border-[#16303B] text-[#66848D]">{l}</span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ display: 'block' }}
        />
        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#66848D]/60">
          Arabian Sea · depth 35–60 m
        </div>
      </div>
    </div>
  );
};
