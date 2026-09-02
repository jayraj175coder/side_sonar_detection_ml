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
    <div className="w-56 lg:w-60 bg-[#05121F] border-r border-[#0D2E4A] flex flex-col justify-between select-none font-mono text-[11px] shrink-0 overflow-y-auto">
      <div className="p-2.5 space-y-3">

        {/* ── RUN LIVE DEMO / REPLAY BUTTON ── */}
        <div className="pb-2 border-b border-[#0D2E4A]">
          {demoPhase === 'idle' ? (
            <button
              onClick={onRunDemo}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#00D4AA] text-[#030B14] border border-[#00D4AA] font-black text-[11px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(74,222,128,0.30)]"
            >
              <Zap className="w-4 h-4" />
              <span>▶ RUN LIVE DEMO</span>
            </button>
          ) : demoPhase === 'running' ? (
            <div className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#082830] border border-[#00D4AA]/60 text-[#00D4AA] font-bold text-[10px] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
              <span>PIPELINE RUNNING…</span>
            </div>
          ) : (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#0A1E30] border border-[#00D4AA]/50 text-[#00D4AA] font-bold text-[10px] cursor-pointer hover:bg-[#082830] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>↺ REPLAY DEMO</span>
            </button>
          )}
        </div>

        {/* ── PIPELINE RAIL ── */}
        <div>
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#0D2E4A]">
            <span className="text-[9px] font-bold text-[#4A8090] uppercase tracking-widest">PIPELINE RAIL</span>
            <span className="text-[8px] text-[#2A5060]">CLICK TO INSPECT</span>
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
                      ? 'bg-[#082830] border-l-2 border-[#00D4AA] text-[#00D4AA] font-bold shadow-[inset_0_0_10px_rgba(74,222,128,0.1)]'
                      : isCompleted
                      ? 'border-l-2 border-[#2A5060] text-[#4A8090] bg-[#030B14]'
                      : 'border-l-2 border-transparent text-[#2A5060] hover:text-[#E0F7F4] hover:bg-[#0A1E30]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-wider">
                      {isCompleted && !isActive ? '✓ ' : ''}{st.id} {st.name}
                    </span>
                    {isActive && <span className="text-[8px] text-[#00D4AA] font-bold">ACTIVE</span>}
                  </div>
                  <span className="text-[8px] truncate font-normal opacity-70">{st.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LAYERS PANEL ── */}
        <div>
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#0D2E4A]">
            <span className="text-[9px] font-bold text-[#4A8090] uppercase tracking-widest">LAYERS</span>
            <span className="text-[8px] text-[#2A5060]">TOGGLE OVERLAYS</span>
          </div>

          <div className="space-y-0.5 text-[10px]">
            {LAYER_DEFS.map(({ key, label, stageMin }) => {
              const isActive = layers[key];
              const isAvailable = currentStageNum >= stageMin || demoPhase === 'idle';
              return (
                <label
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`flex items-center gap-2 px-1.5 py-0.5 cursor-pointer transition-colors ${
                    isAvailable
                      ? 'hover:bg-[#0A1E30] text-[#4A8090] hover:text-[#E0F7F4]'
                      : 'opacity-30 pointer-events-none'
                  }`}
                >
                  <span className={`font-mono text-[9px] font-bold ${isActive ? 'text-[#00D4AA]' : 'text-[#2A5060]'}`}>
                    [{isActive ? 'X' : ' '}]
                  </span>
                  <span className={`text-[9px] ${isActive ? 'text-[#E0F7F4]' : 'text-[#4A8090]'}`}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── KEYBOARD HINTS ── */}
        <div className="p-2 border border-[#0D2E4A] bg-[#030B14] text-[8px] text-[#2A5060] leading-relaxed">
          <span className="text-[#4A8090] font-bold block mb-0.5">KEYS</span>
          [SPACE] RUN / PAUSE DEMO<br />
          [1-6] JUMP STAGE<br />
          [← / →] STEP FRAME<br />
          [R] RESET
        </div>
      </div>

      {/* ── BOTTOM SUMMARY TILE ── */}
      <div className="p-2.5 border-t border-[#0D2E4A] bg-[#030B14] space-y-1">
        <span className="text-[8px] text-[#4A8090] uppercase tracking-wider block font-bold">DARK OBJECTS</span>
        <div className="text-[10px] text-[#E0F7F4] leading-tight">
          <strong className="text-[#00D4AA] font-mono">{totalCandidatesCount}</strong> candidates ·{' '}
          <strong className="text-[#00D4AA] font-mono">{confirmedDebrisCount}</strong> confirmed
        </div>
        <div className="text-[8px] text-amber-400 font-bold">{hazardsCount} CRITICAL HAZARDS</div>
      </div>
    </div>
  );
};
