import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, MapPin, Eye } from 'lucide-react';
import { CandidateItem, StageId, SurveySite } from '../../data/consoleData';
import { LayerState } from './ConsoleLeftRail';

interface ConsoleSonarCanvasProps {
  currentStageId: StageId;
  activeSite: SurveySite;
  layers: LayerState;
  candidates: CandidateItem[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  hoveredCandidateId?: string | null;
  onHoverCandidate?: (id: string | null) => void;
  currentFrame?: number;
}

export const ConsoleSonarCanvas: React.FC<ConsoleSonarCanvasProps> = ({
  currentStageId,
  activeSite,
  layers,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  hoveredCandidateId,
  onHoverCandidate,
  currentFrame = 42,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Render authentic acoustic canvas based on active layers & stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // 1. Base dark seabed
    ctx.fillStyle = '#060906';
    ctx.fillRect(0, 0, W, H);

    // 2. DENOISED / PREPROCESSED BASE LAYER (When enabled)
    if (layers.denoisedSonar || currentStageId !== '01') {
      for (let x = 0; x < W; x += 3) {
        for (let y = 0; y < H; y += 3) {
          const val = (Math.sin(x * 0.015 + currentFrame * 0.05) * 0.08 + Math.sin(y * 0.02) * 0.06 + 0.12) * 45;
          const g = Math.floor(val);
          ctx.fillStyle = `rgb(${Math.floor(g * 0.25)}, ${g}, ${Math.floor(g * 0.45)})`;
          ctx.fillRect(x, y, 3, 3);
        }
      }
    }

    // 3. RAW NOISE LAYER (When enabled)
    if (layers.rawSonar) {
      for (let x = 0; x < W; x += 4) {
        for (let y = 0; y < H; y += 4) {
          const speckle = Math.random() * 0.35;
          const wave = Math.sin(y * 0.06 + x * 0.04) * 0.2;
          const v = Math.floor((speckle + wave) * 40);
          ctx.fillStyle = `rgba(${Math.floor(v * 0.3)}, ${v + 15}, ${Math.floor(v * 0.4)}, 0.45)`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // 4. Center Nadir Water Column Gap
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

    // 5. SURVEY TOW TRACK LAYER (When enabled)
    if (layers.surveyTrack) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.15, H * 0.1);
      ctx.lineTo(W * 0.85, H * 0.9);
      ctx.stroke();

      // Current vessel position marker
      const towProgress = currentFrame / 120;
      const vx = W * 0.15 + (W * 0.85 - W * 0.15) * towProgress;
      const vy = H * 0.1 + (H * 0.9 - H * 0.1) * towProgress;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. CONFIDENCE HEATMAP LAYER (When enabled)
    if (layers.confidenceHeatmap) {
      candidates.forEach((cand) => {
        if (cand.status === 'CONFIRMED') {
          const cx = (cand.rawX / 100) * W;
          const cy = (cand.rawY / 100) * H;
          const heatGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 50);
          heatGrad.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
          heatGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.25)');
          heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, 50, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 7. Render Acoustic Highlights & Shadows for Candidates
    candidates.forEach((cand) => {
      const cx = (cand.rawX / 100) * W;
      const cy = (cand.rawY / 100) * H;
      const isConfirmed = cand.status === 'CONFIRMED';
      const isSelected = selectedCandidateId === cand.id || hoveredCandidateId === cand.id;

      // Draw acoustic backscatter highlight
      ctx.save();
      if (isConfirmed && layers.acceptedDebris) {
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (!isConfirmed && layers.rejectedCandidates) {
        ctx.fillStyle = '#2b4730';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw acoustic shadow corridor
      if (isConfirmed && layers.acceptedDebris) {
        const shadowLen = Math.max(16, cand.shadowLengthM * 10);
        ctx.fillStyle = '#020302';
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 6);
        ctx.lineTo(cx + 8 + shadowLen, cy - 8);
        ctx.lineTo(cx + 8 + shadowLen, cy + 8);
        ctx.lineTo(cx + 8, cy + 6);
        ctx.closePath();
        ctx.fill();
      }
    });
  }, [currentStageId, layers, candidates, activeSite, selectedCandidateId, hoveredCandidateId, currentFrame]);

  return (
    <div className="flex-1 bg-[#060906] flex flex-col relative select-none font-mono overflow-hidden">
      {/* Canvas Top Bar */}
      <div className="h-7 bg-[#090e09] border-b border-[#193019] px-3 flex items-center justify-between text-[9px] text-[#64876b] shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3 h-3 text-[#4ade80]" />
          <span className="text-[#dcfce7] font-bold">SONAR MOSAIC // STAGE {currentStageId}</span>
          <span>·</span>
          <span>{activeSite.swathWidthM}m SWATH</span>
          <span>·</span>
          <span>FRAME {String(currentFrame).padStart(3, '0')}</span>
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

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#060906] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={480}
          className="w-full h-full object-contain block"
        />

        {/* 4 Corner Coordinates */}
        <div className="absolute top-2 left-2 text-[8px] text-[#3d5843] bg-[#070b07]/90 px-1.5 py-0.5 border border-[#193019]">
          NW: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute top-2 right-2 text-[8px] text-[#3d5843] bg-[#070b07]/90 px-1.5 py-0.5 border border-[#193019]">
          NE: {activeSite.latRange[1].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 left-2 text-[8px] text-[#3d5843] bg-[#070b07]/90 px-1.5 py-0.5 border border-[#193019]">
          SW: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[0].toFixed(4)}°E
        </div>
        <div className="absolute bottom-6 right-2 text-[8px] text-[#3d5843] bg-[#070b07]/90 px-1.5 py-0.5 border border-[#193019]">
          SE: {activeSite.latRange[0].toFixed(4)}°N, {activeSite.lonRange[1].toFixed(4)}°E
        </div>

        {/* Dynamic Candidate Interactive Reticles Overlay */}
        {candidates.map((cand) => {
          const isSelected = selectedCandidateId === cand.id;
          const isHovered = hoveredCandidateId === cand.id;
          const isConfirmed = cand.status === 'CONFIRMED';
          const isRawDetections = layers.rawDetections || currentStageId === '03';

          if (!isRawDetections && !layers.acceptedDebris && !layers.rejectedCandidates) return null;
          if (isConfirmed && !layers.acceptedDebris && !isRawDetections) return null;
          if (!isConfirmed && !layers.rejectedCandidates && !isRawDetections) return null;

          // 3-Stop Confidence Gradient Scale
          let confColor = '#4ade80'; // Green (>70%)
          if (cand.confidence < 0.4) {
            confColor = '#ef4444'; // Red (<40%)
          } else if (cand.confidence < 0.7) {
            confColor = '#f59e0b'; // Amber (40-70%)
          }

          return (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate(cand.id)}
              onMouseEnter={() => onHoverCandidate && onHoverCandidate(cand.id)}
              onMouseLeave={() => onHoverCandidate && onHoverCandidate(null)}
              style={{
                left: `${cand.rawX}%`,
                top: `${cand.rawY}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group ${
                isSelected ? 'z-40 scale-110' : isHovered ? 'z-30 scale-105' : 'z-20'
              }`}
            >
              {/* Target Marker */}
              {isConfirmed ? (
                <div className="relative flex items-center justify-center">
                  {isSelected && (
                    <div className="w-10 h-10 rounded-full border border-[#4ade80] animate-ping absolute opacity-60" />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#4ade80] bg-[#4ade80]/30 shadow-[0_0_15px_#4ade80]'
                        : isHovered
                        ? 'border-[#4ade80] bg-[#4ade80]/20'
                        : 'border-[#4ade80] bg-[#090e09]/90'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                  </div>
                </div>
              ) : (
                // Rejected Dashed Box
                <div
                  className={`w-7 h-7 border border-dashed flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#ef4444] bg-[#ef4444]/25 shadow-[0_0_10px_#ef4444]'
                      : 'border-[#ef4444]/60 bg-[#090e09]/70'
                  }`}
                >
                  <span className="text-[7.5px] text-[#ef4444]">✕</span>
                </div>
              )}

              {/* Marker Label Pill */}
              <div
                className={`absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 whitespace-nowrap text-[8px] font-bold border transition-all ${
                  isConfirmed
                    ? 'bg-[#090e09] text-[#4ade80] border-[#4ade80]'
                    : 'bg-[#090e09] text-[#ef4444] border-[#ef4444]'
                }`}
              >
                <span>{cand.id}</span>
                <span> · </span>
                <span style={{ color: confColor }}>{(cand.confidence * 100).toFixed(0)}%</span>
              </div>

              {/* GEOTAG MARKER OVERLAY (When enabled or selected) */}
              {(layers.geotagMarkers || isSelected) && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1 py-0.2 whitespace-nowrap text-[7px] text-[#64876b] bg-[#070b07]/95 border border-[#193019]">
                  {cand.lat.toFixed(4)}°N, {cand.lon.toFixed(4)}°E · {cand.depthM}m
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom Sensor Attribution Line */}
        <div className="absolute bottom-1 left-2 text-[8px] text-[#3d5843]">
          {activeSite.frequency} · {activeSite.swathWidthM}m SWATH · TOW DEPTH {activeSite.towDepthM}m
        </div>

        {/* 10m Scale Bar */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1.5 text-[8px] text-[#4ade80]">
          <div className="w-12 h-1 bg-[#4ade80]" />
          <span>10 m SCALE</span>
        </div>
      </div>
    </div>
  );
};
