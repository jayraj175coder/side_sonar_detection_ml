import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Crosshair, Download, FileText, Layers, ShieldCheck } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface MissionSubseaMapViewerProps {
  targets: MissionV3Target[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  onBackToSonar: () => void;
  onExportReport: () => void;
}

export const MissionSubseaMapViewer: React.FC<MissionSubseaMapViewerProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  onBackToSonar,
  onExportReport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTarget, setHoveredTarget] = useState<MissionV3Target | null>(null);

  // Render Subsea Mission Map with all 17 pins
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Deep ocean bathymetric background
    ctx.fillStyle = '#020912';
    ctx.fillRect(0, 0, W, H);

    // Bathymetry depth contours (isometric gradient curves)
    ctx.strokeStyle = '#082035';
    ctx.lineWidth = 1;
    for (let r = 50; r < W; r += 45) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Latitude and Longitude Graticule
    ctx.strokeStyle = 'rgba(13, 46, 74, 0.45)';
    ctx.setLineDash([4, 4]);
    for (let x = 60; x < W; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();

      ctx.fillStyle = '#2A5060';
      ctx.font = '8px monospace';
      ctx.fillText(`${(72.812 + (x / W) * 0.024).toFixed(4)}° E`, x + 3, H - 6);
    }
    for (let y = 40; y < H; y += 65) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();

      ctx.fillStyle = '#2A5060';
      ctx.font = '8px monospace';
      ctx.fillText(`${(18.914 + (y / H) * 0.016).toFixed(4)}° N`, 6, y - 4);
    }
    ctx.setLineDash([]);

    // Survey Vessel Towpath Track
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.9);
    ctx.lineTo(W * 0.88, H * 0.12);
    ctx.stroke();

    // Swath boundary envelope (75m corridor)
    ctx.fillStyle = 'rgba(0, 212, 170, 0.035)';
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.15)';
    ctx.beginPath();
    ctx.moveTo(W * 0.04, H * 0.9);
    ctx.lineTo(W * 0.82, H * 0.12);
    ctx.lineTo(W * 0.94, H * 0.12);
    ctx.lineTo(W * 0.16, H * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Plot all 17 Targets
    targets.forEach((target) => {
      const isSelected = target.id === selectedTargetId;
      const isGhostNet = target.id === 'SX-T07';

      // Map coordinates to canvas space
      const px = ((target.longitude - 72.812) / 0.024) * W;
      const py = ((18.93 - target.latitude) / 0.016) * H;

      let color = '#38BDF8';
      if (target.priority === 'HIGH') color = '#EF4444';
      else if (target.priority === 'MEDIUM') color = '#F59E0B';
      else if (target.status === 'FILTERED') color = '#475569';

      // Pulse beacon for SX-T07 Ghost Net or Selected Target
      if (isGhostNet || isSelected) {
        ctx.strokeStyle = isGhostNet ? '#00D4AA' : color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 212, 170, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Pin core
      ctx.fillStyle = isGhostNet ? '#00D4AA' : color;
      ctx.beginPath();
      ctx.arc(px, py, isSelected || isGhostNet ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pin border
      ctx.strokeStyle = '#030B14';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pin Label Badge
      if (isGhostNet || isSelected || target.priority === 'HIGH') {
        ctx.fillStyle = 'rgba(5, 18, 31, 0.9)';
        ctx.strokeStyle = isGhostNet ? '#00D4AA' : color;
        ctx.lineWidth = 1;

        const badgeW = isGhostNet ? 116 : 84;
        const badgeH = 20;
        ctx.fillRect(px + 8, py - 22, badgeW, badgeH);
        ctx.strokeRect(px + 8, py - 22, badgeW, badgeH);

        ctx.fillStyle = isGhostNet ? '#00D4AA' : '#E0F7F4';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText(
          `${target.id} ${isGhostNet ? '★ GHOST NET' : target.label.slice(0, 10)}`,
          px + 12,
          py - 9
        );
      }
    });
  }, [targets, selectedTargetId]);

  // Click to select nearest target on map
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    let nearest: MissionV3Target | null = null;
    let minDist = 35;

    targets.forEach((target) => {
      const px = ((target.longitude - 72.812) / 0.024) * canvas.width;
      const py = ((18.93 - target.latitude) / 0.016) * canvas.height;
      const d = Math.hypot(px - x, py - y);
      if (d < minDist) {
        minDist = d;
        nearest = target;
      }
    });

    if (nearest) {
      onSelectTarget((nearest as MissionV3Target).id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#01050A] relative overflow-hidden font-mono select-none">
      {/* Top Map Header & Controls */}
      <div className="h-10 px-4 bg-[#030B14] border-b border-[#0D2E4A] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSonar}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#00D4AA] text-[10px] font-bold cursor-pointer rounded-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO SONAR</span>
          </button>
          <span className="text-[#2A5060]">|</span>
          <span className="text-xs font-black tracking-wider text-[#E0F7F4] uppercase flex items-center gap-1.5">
            <span>SUBSEA MISSION MAP</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs">
              17 TARGETS PLOTTED
            </span>
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-[#94A3B8]">HIGH (4)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-[#94A3B8]">MEDIUM (6)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#475569]" />
            <span className="text-[#94A3B8]">FILTERED (7)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-ping" />
            <span className="text-[#00D4AA] font-bold">HERO TARGET (SX-T07)</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Closing "Mission Accomplished" Callout Banner */}
        <div className="absolute bottom-4 left-4 right-4 bg-[#030B14]/95 border border-[#00D4AA]/60 p-3 rounded shadow-[0_0_24px_rgba(0,212,170,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#082830] border border-[#00D4AA] flex items-center justify-center text-[#00D4AA]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#E0F7F4] uppercase tracking-wider flex items-center gap-2">
                <span>MISSION ACCOMPLISHED · 17 TARGETS PINPOINTED</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#00D4AA] text-[#030B14] font-bold rounded-xs">
                  READY FOR ROV RETRIEVAL
                </span>
              </div>
              <div className="text-[9.5px] text-[#4A8090]">
                All acoustic anomalies georeferenced via USBL to WGS-84 coordinates. Top hazard: SX-T07 Ghost Net (43.1m depth).
              </div>
            </div>
          </div>

          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00D4AA] text-[#030B14] font-black text-xs cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,212,170,0.3)] rounded-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT INCIDENT DOSSIER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
