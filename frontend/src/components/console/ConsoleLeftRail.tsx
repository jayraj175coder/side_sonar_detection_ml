import React from 'react';
import { PIPELINE_STAGES, StageId } from '../../data/consoleData';
import { Zap, RotateCcw } from 'lucide-react';

export interface LayerState {
  rawSonar: boolean;
  denoisedSonar: boolean;
  droneTrack: boolean;
  rawDetections: boolean;
  noiseRejected: boolean;
  confirmedDebris: boolean;
  classLabels: boolean;
  geotagMarkers: boolean;
}

type DemoPhase = 'idle' | 'running' | 'done';

interface ConsoleLeftRailProps {
  currentStageId: StageId;
  onSelectStage: (id: StageId) => void;
  layers: LayerState;
  onToggleLayer: (layerKey: keyof LayerState) => void;
  totalCandidatesCount: number;
  confirmedDebrisCount: number;
  hazardsCount: number;
  demoPhase: DemoPhase;
  onRunDemo: () => void;
  onReset: () => void;
}

const LAYER_DEFS: { key: keyof LayerState; label: string; stageMin: number }[] = [
  { key: 'rawSonar',       label: 'RAW SONAR',          stageMin: 1 },
  { key: 'denoisedSonar',  label: 'DENOISED SONAR',     stageMin: 2 },
  { key: 'droneTrack',     label: 'DRONE SURVEY TRACK', stageMin: 2 },
  { key: 'rawDetections',  label: 'RAW DETECTIONS',     stageMin: 3 },
  { key: 'noiseRejected',  label: 'NOISE-REJECTED',     stageMin: 4 },
  { key: 'confirmedDebris',label: 'CONFIRMED DEBRIS',   stageMin: 4 },
  { key: 'classLabels',    label: 'CLASS LABELS',       stageMin: 5 },
  { key: 'geotagMarkers',  label: 'GEOTAG MARKERS',     stageMin: 6 },
];

export const ConsoleLeftRail: React.FC<ConsoleLeftRailProps> = ({
  currentStageId,
  onSelectStage,
  layers,
  onToggleLayer,
  totalCandidatesCount,
  confirmedDebrisCount,
  hazardsCount,
  demoPhase,
  onRunDemo,
  onReset,
}) => {
  const currentStageNum = parseInt(currentStageId, 10);

  return (
    <div className="w-56 lg:w-60 bg-[#080D17] border-r border-[#162136] flex flex-col justify-between select-none font-mono text-[11px] shrink-0 overflow-y-auto">
      <div className="p-2.5 space-y-3">

        {/* ── RUN LIVE DEMO / REPLAY BUTTON ── */}
        <div className="pb-2 border-b border-[#162136]">
          {demoPhase === 'idle' ? (
            <button
              onClick={onRunDemo}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FFB703] text-[#05070B] border border-[#FFB703] font-black text-[11px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(74,222,128,0.30)]"
            >
              <Zap className="w-4 h-4" />
              <span>▶ RUN LIVE DEMO</span>
            </button>
          ) : demoPhase === 'running' ? (
            <div className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#131B2A] border border-[#FFB703]/60 text-[#FFB703] font-bold text-[10px] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FFB703]" />
              <span>PIPELINE RUNNING…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onRunDemo}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#FFB703] text-[#05070B] border border-[#FFB703] font-bold text-[10px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(255, 183, 3, )]"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>START DEMO</span>
              </button>
              <button
                onClick={onReset}
                className="p-2 bg-[#0A1E30] border border-[#162136] hover:border-[#FFB703]/50 text-[#94A3B8] hover:text-[#FFB703] text-[10px] cursor-pointer transition-all"
                title="Reset pipeline to Stage 01"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── PIPELINE RAIL ── */}
        <div>
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#162136]">
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">PIPELINE RAIL</span>
            <span className="text-[8px] text-[#64748B]">CLICK TO INSPECT</span>
          </div>

          <div className="space-y-0.5">
            {PIPELINE_STAGES.map((st) => {
              const isSelected = currentStageId === st.id;
              const stNum = parseInt(st.id, 10);
              const isCompleted = demoPhase !== 'idle' && stNum < currentStageNum;
              const isActive = isSelected;

              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStage(st.id)}
                  className={`w-full text-left px-2 py-1.5 transition-all cursor-pointer flex flex-col ${
                    isActive
                      ? 'bg-[#131B2A] border-l-2 border-[#FFB703] text-[#FFB703] font-bold shadow-[inset_0_0_10px_rgba(74,222,128,0.1)]'
                      : isCompleted
                      ? 'border-l-2 border-[#64748B] text-[#94A3B8] bg-[#05070B]'
                      : 'border-l-2 border-transparent text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#0A1E30]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-wider">
                      {isCompleted && !isActive ? '✓ ' : ''}{st.id} {st.name}
                    </span>
                    {isActive && <span className="text-[8px] text-[#FFB703] font-bold">ACTIVE</span>}
                  </div>
                  <span className="text-[8px] truncate font-normal opacity-70">{st.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LAYERS PANEL ── */}
        <div>
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#162136]">
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">LAYERS</span>
            <span className="text-[8px] text-[#64748B]">TOGGLE OVERLAYS</span>
          </div>

          <div className="space-y-0.5 text-[10px]">
            {LAYER_DEFS.map(({ key, label }) => {
              const isActive = layers[key];
              return (
                <div
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className="flex items-center gap-2 px-1.5 py-1 cursor-pointer transition-colors hover:bg-[#0A1E30] text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  <span className={`font-mono text-[9px] font-bold ${isActive ? 'text-[#FFB703]' : 'text-[#64748B]'}`}>
                    [{isActive ? 'X' : ' '}]
                  </span>
                  <span className={`text-[9px] ${isActive ? 'text-[#F8FAFC] font-bold' : 'text-[#94A3B8]'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MODEL TRAINING METRICS (SIH 2026 PS 26057) ── */}
        <div className="p-2 border border-[#162136] bg-[#05070B] space-y-1.5 font-mono text-[8px]">
          <div className="flex items-center justify-between border-b border-[#162136] pb-1">
            <span className="text-[8.5px] font-bold text-[#FFB703] tracking-wider">// MODEL TRAINING METRICS</span>
            <span className="text-[7.5px] text-[#3FD98A] font-bold px-1 bg-[#3FD98A]/10 border border-[#3FD98A]/30">120 EPOCHS</span>
          </div>

          <div className="text-[#94A3B8] space-y-0.5 text-[8px]">
            <div className="flex justify-between"><span className="text-[#6F8992]">ARCH:</span><strong className="text-[#F8FAFC]">YOLOv8s (11.2M)</strong></div>
            <div className="flex justify-between"><span className="text-[#6F8992]">DATASET:</span><strong className="text-[#F8FAFC]">5,205 SSS Tiles</strong></div>
            <div className="flex justify-between"><span className="text-[#6F8992]">mAP@50:</span><strong className="text-[#FFB703] font-bold">74.09% (0.7409)</strong></div>
            <div className="flex justify-between"><span className="text-[#6F8992]">PRECISION:</span><strong className="text-[#38BDF8] font-bold">77.73% (0.7773)</strong></div>
          </div>

          {/* SVG Sparkline Training Loss Curves */}
          <div className="space-y-1 pt-1 border-t border-[#162136]/80">
            <span className="text-[7.5px] text-[#94A3B8] uppercase block font-bold">LOSS PROGRESSION (EPOCHS 1-120)</span>
            
            {/* Box Loss */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[7px] text-[#6F8992]">
                <span>box_loss</span>
                <span>1.382 &rarr; 0.785</span>
              </div>
              <div className="h-2 w-full bg-[#080D17] border border-[#162136] relative overflow-hidden">
                <svg className="w-full h-full stroke-[#FFB703]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,9 Q20,8 40,5 T80,3 T100,2" fill="none" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Class Loss */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[7px] text-[#6F8992]">
                <span>cls_loss</span>
                <span>2.092 &rarr; 0.612</span>
              </div>
              <div className="h-2 w-full bg-[#080D17] border border-[#162136] relative overflow-hidden">
                <svg className="w-full h-full stroke-[#38BDF8]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,9.5 Q15,7 35,4 T75,2 T100,1.5" fill="none" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── KEYBOARD HINTS ── */}
        <div className="p-2 border border-[#162136] bg-[#05070B] text-[8px] text-[#64748B] leading-relaxed">
          <span className="text-[#94A3B8] font-bold block mb-0.5">KEYS</span>
          [SPACE] RUN / PAUSE DEMO<br />
          [1-6] JUMP STAGE<br />
          [← / →] STEP FRAME<br />
          [R] RESET
        </div>
      </div>

      {/* ── BOTTOM SUMMARY TILE ── */}
      <div className="p-2.5 border-t border-[#162136] bg-[#05070B] space-y-1">
        <span className="text-[8px] text-[#94A3B8] uppercase tracking-wider block font-bold">DARK OBJECTS</span>
        <div className="text-[10px] text-[#F8FAFC] leading-tight">
          <strong className="text-[#FFB703] font-mono">{totalCandidatesCount}</strong> candidates ·{' '}
          <strong className="text-[#FFB703] font-mono">{confirmedDebrisCount}</strong> confirmed
        </div>
        <div className="text-[8px] text-amber-400 font-bold">{hazardsCount} CRITICAL HAZARDS</div>
      </div>
    </div>
  );
};
