import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowLeft,
  RotateCw,
  Maximize2,
  Compass,
  Boxes,
  Eye,
  Target,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface Mission3DSeafloorViewerProps {
  targets: MissionV3Target[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  onBackToSonar: () => void;
  onViewMissionMap?: () => void;
}

export const Mission3DSeafloorViewer: React.FC<Mission3DSeafloorViewerProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  onBackToSonar,
  onViewMissionMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0.75); // radians
  const [pitchAngle, setPitchAngle] = useState<number>(0.55); // radians
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [viewPreset, setViewPreset] = useState<'iso' | 'top' | 'profile'>('iso');
  const [wireframeOnly, setWireframeOnly] = useState<boolean>(false);
  const [reliefExaggeration, setReliefExaggeration] = useState<number>(1.5);

  // Auto-rotation animation loop
  useEffect(() => {
    if (!autoRotate) return;
    let animId: number;
    const loop = () => {
      setRotationAngle((prev) => (prev + 0.0035) % (Math.PI * 2));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // View preset handlers
  const handlePresetIso = () => {
    setAutoRotate(false);
    setViewPreset('iso');
    setRotationAngle(0.78);
    setPitchAngle(0.55);
  };

  const handlePresetTop = () => {
    setAutoRotate(false);
    setViewPreset('top');
    setRotationAngle(0);
    setPitchAngle(1.48); // Near 90 degrees
  };

  const handlePresetProfile = () => {
    setAutoRotate(false);
    setViewPreset('profile');
    setRotationAngle(0);
    setPitchAngle(0.12); // Near horizontal profile
  };

  // ── Render 3D Bathymetric Mesh & Targets ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Deep abyssal oceanic background
    ctx.fillStyle = '#01050A';
    ctx.fillRect(0, 0, W, H);

    // 3D Grid Parameters
    const gridSize = 28;
    const cellSize = 18;
    const centerX = W / 2;
    const centerY = H * 0.52;

    const cosR = Math.cos(rotationAngle);
    const sinR = Math.sin(rotationAngle);
    const cosP = Math.cos(pitchAngle);
    const sinP = Math.sin(pitchAngle);

    // 3D to 2D projection function
    const project = (x: number, y: number, z: number) => {
      // Rotation around Z axis (heading)
      const rx = x * cosR - y * sinR;
      const ry = x * sinR + y * cosR;

      // Pitch tilt (elevation angle)
      const px = rx;
      const py = ry * sinP - z * cosP;
      const pz = ry * cosP + z * sinP;

      const scale = 400 / (400 + pz);
      return {
        x: centerX + px * scale,
        y: centerY + py * scale,
        z: pz,
      };
    };

    // Calculate heightmap (sand ripples + bathymetric slope + target relief)
    const getHeight = (gx: number, gy: number) => {
      // Seafloor sand ripples
      const ripple = Math.sin(gx * 0.45) * 4 + Math.cos(gy * 0.6) * 3;
      // Shelf gradient drop-off
      const slope = (gy - gridSize / 2) * 1.8;

      // Add protrusion peaks for targets
      let targetProtrusion = 0;
      targets.forEach((t) => {
        const tx = ((t.rawX / 100) - 0.5) * gridSize;
        const ty = ((t.rawY / 100) - 0.5) * gridSize;
        const dist = Math.hypot(gx - tx, gy - ty);
        if (dist < 2.5) {
          const reliefM = t.id === 'SX-T07' ? 2.31 : t.shadowLength;
          targetProtrusion += (2.5 - dist) * reliefM * 4 * reliefExaggeration;
        }
      });

      return (ripple + slope + targetProtrusion);
    };

    // Draw 3D Bathymetric Grid
    const half = gridSize / 2;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x1 = (c - half) * cellSize;
        const y1 = (r - half) * cellSize;
        const z1 = getHeight(c - half, r - half);

        const p1 = project(x1, y1, z1);

        // Depth-based bathymetric color
        const depthFactor = Math.max(0, Math.min(1, (z1 + 25) / 50));
        const gridStroke = wireframeOnly
          ? 'rgba(0, 212, 170, 0.45)'
          : `rgba(${Math.floor(10 + depthFactor * 30)}, ${Math.floor(50 + depthFactor * 160)}, ${Math.floor(90 + depthFactor * 150)}, 0.55)`;

        ctx.strokeStyle = gridStroke;
        ctx.lineWidth = 0.8;

        // Connect along columns (X)
        if (c < gridSize - 1) {
          const x2 = (c + 1 - half) * cellSize;
          const y2 = (r - half) * cellSize;
          const z2 = getHeight(c + 1 - half, r - half);
          const p2 = project(x2, y2, z2);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Connect along rows (Y)
        if (r < gridSize - 1) {
          const x2 = (c - half) * cellSize;
          const y2 = (r + 1 - half) * cellSize;
          const z2 = getHeight(c - half, r + 1 - half);
          const p2 = project(x2, y2, z2);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // ── 3D TOWFISH AUV & DOWNWARD ACOUSTIC FAN BEAM ──
    const towfishZ = 65; // Floating 65 units above seabed
    const tfPos = project(0, 0, towfishZ);
    const tfFloor = project(0, 0, getHeight(0, 0));

    // Downward acoustic fan beam polygon
    const swathLeft = project(-cellSize * 5, 0, getHeight(-5, 0));
    const swathRight = project(cellSize * 5, 0, getHeight(5, 0));

    ctx.fillStyle = 'rgba(0, 212, 170, 0.08)';
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tfPos.x, tfPos.y);
    ctx.lineTo(swathLeft.x, swathLeft.y);
    ctx.lineTo(swathRight.x, swathRight.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Towfish vessel marker
    ctx.fillStyle = '#00D4AA';
    ctx.beginPath();
    ctx.arc(tfPos.x, tfPos.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E0F7F4';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText('AUV TOWFISH (+8.4m ALT)', tfPos.x + 8, tfPos.y - 4);

    // ── PLOT 3D TARGETS WITH ACOUSTIC SHADOWS & VERTICAL POLES ──
    targets.forEach((target) => {
      const gx = ((target.rawX / 100) - 0.5) * gridSize;
      const gy = ((target.rawY / 100) - 0.5) * gridSize;
      const seabedZ = getHeight(gx, gy);
      const isSelected = target.id === selectedTargetId;
      const isGhostNet = target.id === 'SX-T07';

      const reliefHeight = (isGhostNet ? 2.31 : target.shadowLength) * 7 * reliefExaggeration;
      const basePos = project(gx * cellSize, gy * cellSize, seabedZ);
      const peakPos = project(gx * cellSize, gy * cellSize, seabedZ + reliefHeight);

      // Acoustic Shadow Void on the seafloor mesh
      const shadowDir = gx < 0 ? -1 : 1;
      const shadowLen = Math.max(16, target.shadowLength * 22);
      const shadowEnd = project((gx + shadowDir * 1.6) * cellSize, gy * cellSize, seabedZ);

      ctx.fillStyle = 'rgba(1, 5, 10, 0.85)'; // True acoustic absorption shadow
      ctx.strokeStyle = isSelected ? 'rgba(0, 212, 170, 0.6)' : 'rgba(13, 46, 74, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(basePos.x - 6, basePos.y);
      ctx.lineTo(shadowEnd.x, shadowEnd.y);
      ctx.lineTo(basePos.x + 6, basePos.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vertical 3D relief stalk
      let col = '#00D4AA';
      if (target.priority === 'HIGH') col = '#EF4444';
      else if (target.priority === 'MEDIUM') col = '#F59E0B';
      else if (target.status === 'FILTERED') col = '#64748B';

      ctx.strokeStyle = isGhostNet ? '#00D4AA' : col;
      ctx.lineWidth = isSelected || isGhostNet ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(basePos.x, basePos.y);
      ctx.lineTo(peakPos.x, peakPos.y);
      ctx.stroke();

      // Pulsating 3D Ring on Hero Target
      if (isGhostNet || isSelected) {
        ctx.strokeStyle = '#00D4AA';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(peakPos.x, peakPos.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Top Beacon Sphere
      ctx.fillStyle = isGhostNet ? '#00D4AA' : col;
      ctx.beginPath();
      ctx.arc(peakPos.x, peakPos.y, isGhostNet || isSelected ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 3D Callout Card
      if (isGhostNet || isSelected) {
        ctx.fillStyle = '#030B14';
        ctx.fillRect(peakPos.x + 8, peakPos.y - 30, 140, 28);
        ctx.strokeStyle = '#00D4AA';
        ctx.lineWidth = 1;
        ctx.strokeRect(peakPos.x + 8, peakPos.y - 30, 140, 28);

        ctx.fillStyle = '#E0F7F4';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText(`${target.id} // ${target.label.toUpperCase()}`, peakPos.x + 12, peakPos.y - 18);

        ctx.fillStyle = '#00D4AA';
        ctx.font = '7.5px monospace';
        ctx.fillText(`DEPTH: -${target.depth.toFixed(1)}m · RELIEF: ${target.shadowLength.toFixed(2)}m`, peakPos.x + 12, peakPos.y - 6);
      }
    });
  }, [targets, selectedTargetId, rotationAngle, pitchAngle, wireframeOnly, reliefExaggeration]);

  // Click on canvas to select nearest 3D target
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    onSelectTarget('SX-T07');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#01050A] relative overflow-hidden font-mono select-none">
      {/* Top 3D Header Bar & Camera Controls */}
      <div className="h-10 px-4 bg-[#030B14] border-b border-[#0D2E4A] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {/* 3-Way Viewport Switcher */}
          <div className="flex items-center gap-1 bg-[#05121F] border border-[#0D2E4A] p-0.5 rounded-xs">
            <button
              onClick={onBackToSonar}
              className="px-2 py-0.5 text-[#4A8090] hover:text-[#00D4AA] hover:bg-[#082830] text-[8.5px] font-bold rounded-xs cursor-pointer transition-colors"
              title="Return to Sonar Waterfall"
            >
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
            <button
              className="px-2 py-0.5 bg-[#00D4AA] text-[#030B14] font-bold text-[8.5px] rounded-xs cursor-default shadow-[0_0_8px_rgba(0,212,170,0.3)]"
            >
              🌐 3D VIEW
            </button>
          </div>

          <span className="text-[#2A5060]">|</span>
          <span className="text-xs font-black tracking-wider text-[#E0F7F4] uppercase flex items-center gap-2">
            <span>3D SEAFLOOR BATHYMETRY</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs">
              MUMBAI SHELF SECTOR B
            </span>
          </span>
        </div>

        {/* 3D Camera & Visual Controls */}
        <div className="flex items-center gap-1.5 text-[9px]">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 border transition-colors cursor-pointer rounded-xs ${
              autoRotate
                ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA] font-bold'
                : 'bg-[#05121F] border-[#0D2E4A] text-[#4A8090]'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'ROTATING' : 'ROTATE'}</span>
          </button>

          <div className="h-3 w-px bg-[#0D2E4A] mx-0.5" />

          <button
            onClick={handlePresetIso}
            className={`px-2 py-1 border transition-colors cursor-pointer rounded-xs ${
              viewPreset === 'iso' ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] font-bold' : 'bg-[#05121F] border-[#0D2E4A] text-[#4A8090]'
            }`}
          >
            ISOMETRIC
          </button>
          <button
            onClick={handlePresetTop}
            className={`px-2 py-1 border transition-colors cursor-pointer rounded-xs ${
              viewPreset === 'top' ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] font-bold' : 'bg-[#05121F] border-[#0D2E4A] text-[#4A8090]'
            }`}
          >
            TOP-DOWN
          </button>
          <button
            onClick={handlePresetProfile}
            className={`px-2 py-1 border transition-colors cursor-pointer rounded-xs ${
              viewPreset === 'profile' ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] font-bold' : 'bg-[#05121F] border-[#0D2E4A] text-[#4A8090]'
            }`}
          >
            PROFILE
          </button>

          <div className="h-3 w-px bg-[#0D2E4A] mx-0.5" />

          <button
            onClick={() => setWireframeOnly((v) => !v)}
            className={`px-2 py-1 border transition-colors cursor-pointer rounded-xs ${
              wireframeOnly ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]' : 'bg-[#05121F] border-[#0D2E4A] text-[#4A8090]'
            }`}
          >
            WIREFRAME
          </button>

          <button
            onClick={() => setReliefExaggeration((r) => (r >= 2.5 ? 1.0 : r + 0.75))}
            className="px-2 py-1 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/40 text-[#4A8090] hover:text-[#00D4AA] cursor-pointer rounded-xs"
          >
            {reliefExaggeration.toFixed(1)}× RELIEF
          </button>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
        />

        {/* 3D HUD Telemetry Overlay */}
        <div className="absolute bottom-4 left-4 bg-[#030B14]/90 border border-[#0D2E4A] px-3 py-1.5 text-[9px] text-[#4A8090] flex items-center gap-4">
          <span>BATHYMETRY: <strong className="text-[#00D4AA]">35.0m – 52.4m</strong></span>
          <span>·</span>
          <span>ELEVATION EXAGGERATION: <strong className="text-[#E0F7F4]">{reliefExaggeration.toFixed(1)}×</strong></span>
          <span>·</span>
          <span>HERO TARGET: <strong className="text-[#00D4AA]">SX-T07 GHOST NET (-43.1m)</strong></span>
        </div>
      </div>
    </div>
  );
};
