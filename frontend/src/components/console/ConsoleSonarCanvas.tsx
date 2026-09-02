import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { CandidateItem, StageId, SurveySite } from '../../data/consoleData';
import { LayerState } from './ConsoleLeftRail';

interface ConsoleSonarCanvasProps {
  currentStageId: StageId;
  activeSite: SurveySite;
  layers: LayerState;
  candidates: CandidateItem[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
}

export const ConsoleSonarCanvas: React.FC<ConsoleSonarCanvasProps> = ({
  currentStageId,
  activeSite,
  layers,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // 1. Clear background
    ctx.fillStyle = '#060906';
    ctx.fillRect(0, 0, W, H);

    const isRawMode = currentStageId === '01' || layers.rawSonar;
    const isDenoised = currentStageId !== '01' && layers.denoisedSonar;

    // 2. Render Sonar Backscatter Texture
    for (let x = 0; x < W; x += 3) {
      for (let y = 0; y < H; y += 3) {
        let val = 0;
        if (isRawMode) {
          // Speckle noise + surface waves
          val = (Math.random() * 0.4 + Math.sin(y * 0.05 + x * 0.03) * 0.2 + 0.15) * 60;
        } else {
          // Clean bilateral CLAHE backscatter
          val = (Math.sin(x * 0.015) * 0.08 + Math.sin(y * 0.02) * 0.06 + 0.12) * 45;
        }
        const g = Math.floor(val);
        ctx.fillStyle = `rgb(${Math.floor(g * 0.25)}, ${g}, ${Math.floor(g * 0.45)})`;
        ctx.fillRect(x, y, 3, 3);
      }
    }

    // 3. Center Nadir Water Column Gap
    const nadirWidth = 36;
    ctx.fillStyle = '#030503';
    ctx.fillRect(W / 2 - nadirWidth / 2, 0, nadirWidth, H);
    ctx.strokeStyle = '#193019';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Survey Tow Track
    if (layers.surveyTrack) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.15, H * 0.1);
      ctx.lineTo(W * 0.85, H * 0.9);
      ctx.stroke();
    }

    // 5. Render Acoustic Highlights & Shadows for Candidates
    candidates.forEach((cand) => {
      const cx = (cand.rawX / 100) * W;
      const cy = (cand.rawY / 100) * H;
      const isConfirmed = cand.status === 'CONFIRMED';

      // Object return
      ctx.save();
      if (isConfirmed) {
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#2b4730';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Acoustic Shadow Corridor
      const shadowLen = Math.max(16, cand.shadowLengthM * 10);
      ctx.fillStyle = '#020302';
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 6);
      ctx.lineTo(cx + 8 + shadowLen, cy - 8);
      ctx.lineTo(cx + 8 + shadowLen, cy + 8);
      ctx.lineTo(cx + 8, cy + 6);
      ctx.closePath();
      ctx.fill();
    });
  }, [currentStageId, layers, candidates, activeSite]);

  return (
    <div className="flex-1 bg-[#060906] flex flex-col relative select-none font-mono overflow-hidden">
      {/* Canvas Top Status Bar */}
      <div className="h-7 bg-[#090e09] border-b border-[#193019] px-3 flex items-center justify-between text-[9px] text-[#64876b] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3 h-3 text-[#4ade80]" />
          <span className="text-[#dcfce7] font-bold">SONAR MOSAIC // STAGE {currentStageId}</span>
          <span>·</span>
          <span>{activeSite.swathWidthM}m SWATH</span>
          <span>·</span>
          <span>{activeSite.frequency}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="p-1 hover:text-[#4ade80]"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="p-1 hover:text-[#4ade80]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1 hover:text-[#4ade80]"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Interactive Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#060906] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={480}
          className="w-full h-full object-contain block"
        />

        {/* 4 Corner Coordinates */}
        <div className="absolute top-2 left-2 text-[8px] text-[#3d5843] bg-[#070b07]/80 px-1 border border-[#193019]">
          NW: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute top-2 right-2 text-[8px] text-[#3d5843] bg-[#070b07]/80 px-1 border border-[#193019]">
          NE: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 left-2 text-[8px] text-[#3d5843] bg-[#070b07]/80 px-1 border border-[#193019]">
          SW: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 right-2 text-[8px] text-[#3d5843] bg-[#070b07]/80 px-1 border border-[#193019]">
          SE: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>

        {/* Interactive Candidate Marker Overlays */}
        {(currentStageId === '03' ||
          currentStageId === '04' ||
          currentStageId === '05' ||
          currentStageId === '06') &&
          candidates.map((cand) => {
            const isSelected = selectedCandidateId === cand.id;
            const isConfirmed = cand.status === 'CONFIRMED';
            const showReject = layers.rejectedCandidates;
            const showAccept = layers.acceptedDebris;

            if (!isConfirmed && !showReject) return null;
            if (isConfirmed && !showAccept) return null;

            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand.id)}
                style={{
                  left: `${cand.rawX}%`,
                  top: `${cand.rawY}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group ${
                  isSelected ? 'z-30 scale-110' : 'z-20'
                }`}
              >
                {/* Marker Ring */}
                {isConfirmed ? (
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-[#4ade80] animate-ping absolute opacity-50" />
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#4ade80] bg-[#4ade80]/30 shadow-[0_0_12px_#4ade80]'
                          : 'border-[#4ade80] bg-[#090e09]/80'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                    </div>
                  </div>
                ) : (
                  // Rejected Dashed Red Box
                  <div
                    className={`w-6 h-6 border border-dashed flex items-center justify-center ${
                      isSelected
                        ? 'border-[#ef4444] bg-[#ef4444]/20'
                        : 'border-[#ef4444]/60 bg-transparent'
                    }`}
                  >
                    <span className="text-[7px] text-[#ef4444]">✕</span>
                  </div>
                )}

                {/* Marker Pill on Hover or Select */}
                <div
                  className={`absolute -top-5 left-1/2 -translate-x-1/2 px-1 py-0.2 whitespace-nowrap text-[8px] font-bold border ${
                    isConfirmed
                      ? 'bg-[#090e09] text-[#4ade80] border-[#4ade80]'
                      : 'bg-[#090e09] text-[#ef4444] border-[#ef4444]'
                  }`}
                >
                  {cand.id} · {(cand.confidence * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}

        {/* Bottom Sensor Attribution Line */}
        <div className="absolute bottom-1 left-2 text-[8px] text-[#3d5843]">
          {activeSite.frequency} · {activeSite.swathWidthM}m SWATH · TOW DEPTH {activeSite.towDepthM}m
        </div>

        {/* 10m Calibrated Scale Bar */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1.5 text-[8px] text-[#4ade80]">
          <div className="w-12 h-1 bg-[#4ade80]" />
          <span>10 m SCALE</span>
        </div>
      </div>
    </div>
  );
};
