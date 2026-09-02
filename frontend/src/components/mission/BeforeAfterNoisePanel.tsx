import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Sparkles, Eye, ShieldCheck, Activity, Split } from 'lucide-react';

interface BeforeAfterNoisePanelProps {
  rawNoiseDescription: string;
  filteredNoiseDescription: string;
  contrastImprovementDb: number;
  scenarioSeed?: number;
  isDenoisedActive: boolean;
}

export const BeforeAfterNoisePanel: React.FC<BeforeAfterNoisePanelProps> = ({
  rawNoiseDescription,
  filteredNoiseDescription,
  contrastImprovementDb,
  scenarioSeed = 1,
  isDenoisedActive = true,
}) => {
  const rawCanvasRef = useRef<HTMLCanvasElement>(null);
  const filteredCanvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('side-by-side');
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Render authentic acoustic raw and filtered textures on canvas
  useEffect(() => {
    const rawCanvas = rawCanvasRef.current;
    const filteredCanvas = filteredCanvasRef.current;
    if (!rawCanvas || !filteredCanvas) return;

    const rawCtx = rawCanvas.getContext('2d');
    const filteredCtx = filteredCanvas.getContext('2d');
    if (!rawCtx || !filteredCtx) return;

    const W = rawCanvas.width;
    const H = rawCanvas.height;

    // 1. RENDER RAW SONAR (With High Acoustic Speckle Noise & Ambient Clutter)
    rawCtx.fillStyle = '#050D14';
    rawCtx.fillRect(0, 0, W, H);

    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        // High speckle noise + surface reverberation wave
        const speckle = Math.random() * 0.45;
        const wave = Math.sin(y * 0.08 + x * 0.04) * 0.25;
        const v = Math.floor((speckle + wave + 0.2) * 90);
        rawCtx.fillStyle = `rgb(${v}, ${Math.floor(v * 1.2)}, ${Math.floor(v * 1.1)})`;
        rawCtx.fillRect(x, y, 2, 2);
      }
    }

    // Raw Ghost Net return (blurred, low contrast)
    rawCtx.fillStyle = 'rgba(180, 240, 230, 0.4)';
    rawCtx.beginPath();
    rawCtx.ellipse(W * 0.38, H * 0.45, 34, 18, 0.4, 0, Math.PI * 2);
    rawCtx.fill();

    // Raw diffuse shadow (washed out by ambient clutter)
    rawCtx.fillStyle = 'rgba(20, 35, 45, 0.7)';
    rawCtx.beginPath();
    rawCtx.moveTo(W * 0.45, H * 0.42);
    rawCtx.lineTo(W * 0.7, H * 0.38);
    rawCtx.lineTo(W * 0.68, H * 0.55);
    rawCtx.lineTo(W * 0.45, H * 0.48);
    rawCtx.closePath();
    rawCtx.fill();

    // 2. RENDER PREPROCESSED & CLAHE FILTERED SONAR (Clean, High Contrast, Sharp Shadow)
    filteredCtx.fillStyle = '#03070B';
    filteredCtx.fillRect(0, 0, W, H);

    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        // Smooth sediment backscatter without high frequency speckle
        const sediment = (Math.sin(x * 0.02) * 0.1 + Math.sin(y * 0.03) * 0.08 + 0.15) * 60;
        const v = Math.floor(sediment);
        filteredCtx.fillStyle = `rgb(${Math.floor(v * 0.2)}, ${Math.floor(v * 0.9)}, ${Math.floor(v * 0.8)})`;
        filteredCtx.fillRect(x, y, 2, 2);
      }
    }

    // High-contrast clean netting target (CLAHE enhanced)
    filteredCtx.save();
    filteredCtx.fillStyle = '#32E6D1';
    filteredCtx.shadowColor = '#32E6D1';
    filteredCtx.shadowBlur = 14;
    filteredCtx.beginPath();
    filteredCtx.ellipse(W * 0.38, H * 0.45, 32, 16, 0.4, 0, Math.PI * 2);
    filteredCtx.fill();
    filteredCtx.restore();

    // Distinct, sharp acoustic shadow corridor
    filteredCtx.fillStyle = '#010306';
    filteredCtx.beginPath();
    filteredCtx.moveTo(W * 0.44, H * 0.4);
    filteredCtx.lineTo(W * 0.75, H * 0.35);
    filteredCtx.lineTo(W * 0.73, H * 0.58);
    filteredCtx.lineTo(W * 0.44, H * 0.5);
    filteredCtx.closePath();
    filteredCtx.fill();

    // Calibrated scale line
    filteredCtx.fillStyle = '#32E6D1';
    filteredCtx.fillRect(15, H - 15, 30, 2);
    filteredCtx.font = '8px "JetBrains Mono", monospace';
    filteredCtx.fillText('1.0m SCALE', 50, H - 12);
  }, [scenarioSeed]);

  return (
    <div className="w-full bg-[#081118] border border-[#16303B] rounded-2xl p-3.5 shadow-xl font-mono select-none flex flex-col space-y-2.5">
      {/* Header with KPI and View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#32E6D1]" />
          <h3 className="text-xs font-black text-[#E4F2F5] tracking-wider uppercase font-sans">
            BEFORE / AFTER NOISE SUPPRESSION
          </h3>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#65D391]/15 text-[#65D391] border border-[#65D391]/30">
            +{contrastImprovementDb.toFixed(1)} dB SNR
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[9px]">
          <span className="text-[#6F8992] hidden sm:inline">VIEW:</span>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2 py-0.5 rounded-lg border font-bold transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-[#32E6D1] text-[#03070B] border-[#32E6D1]'
                : 'bg-[#0C171E] text-[#6F8992] border-[#16303B]'
            }`}
          >
            SIDE-BY-SIDE
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-0.5 rounded-lg border font-bold transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#32E6D1] text-[#03070B] border-[#32E6D1]'
                : 'bg-[#0C171E] text-[#6F8992] border-[#16303B]'
            }`}
          >
            SPLIT SLIDER
          </button>
        </div>
      </div>

      {/* Main Visuals Area */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Raw Sonar Box */}
          <div className="rounded-xl bg-[#03070B] border border-[#FF5D5D]/40 p-2 space-y-1.5 overflow-hidden">
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-bold text-[#FF5D5D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5D5D]" />
                RAW SONAR (UNFILTERED)
              </span>
              <span className="text-[#6F8992]">900 kHz · Raw</span>
            </div>
            <div className="rounded-lg overflow-hidden border border-[#16303B]">
              <canvas ref={rawCanvasRef} width={280} height={140} className="w-full h-auto block" />
            </div>
            <p className="text-[8px] text-[#6F8992] leading-tight truncate">
              {rawNoiseDescription}
            </p>
          </div>

          {/* Denoised Sonar Box */}
          <div className="rounded-xl bg-[#03070B] border border-[#32E6D1]/50 p-2 space-y-1.5 overflow-hidden shadow-[0_0_12px_rgba(50,230,209,0.15)]">
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-bold text-[#32E6D1] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#32E6D1] animate-pulse" />
                PREPROCESSED & CLAHE ENHANCED
              </span>
              <span className="text-[#65D391] font-bold">Filtered</span>
            </div>
            <div className="rounded-lg overflow-hidden border border-[#16303B]">
              <canvas ref={filteredCanvasRef} width={280} height={140} className="w-full h-auto block" />
            </div>
            <p className="text-[8px] text-[#32E6D1]/90 leading-tight truncate">
              {filteredNoiseDescription}
            </p>
          </div>
        </div>
      ) : (
        /* Interactive Split Slider Mode */
        <div className="space-y-2">
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#16303B] bg-[#03070B]">
            {/* Raw layer */}
            <div className="absolute inset-0">
              <canvas ref={rawCanvasRef} width={500} height={176} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[#FF5D5D] text-[9px] font-bold border border-[#FF5D5D]/40">
                RAW SONAR
              </div>
            </div>

            {/* Filtered overlay layer with clip-path */}
            <div
              className="absolute inset-0 transition-all"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <canvas ref={filteredCanvasRef} width={500} height={176} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[#32E6D1] text-[9px] font-bold border border-[#32E6D1]/40">
                DENOISED (CLAHE)
              </div>
            </div>

            {/* Split Divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#32E6D1] shadow-[0_0_10px_#32E6D1] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#32E6D1] text-[#03070B] flex items-center justify-center text-[8px] font-bold shadow-lg">
                ⬌
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[9px] text-[#6F8992]">
            <span>DRAG SLIDER:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="flex-1 h-1 bg-[#16303B] rounded-full appearance-none cursor-pointer accent-[#32E6D1]"
            />
            <span className="text-[#32E6D1] font-bold">{sliderPos}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
