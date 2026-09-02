import React from 'react';
import { PIPELINE_STAGES, StageId } from '../../data/consoleData';

export interface LayerState {
  rawSonar: boolean;
  denoisedSonar: boolean;
  rawDetections: boolean;
  confidenceHeatmap: boolean;
  rejectedCandidates: boolean;
  acceptedDebris: boolean;
  geotagMarkers: boolean;
  surveyTrack: boolean;
}

interface ConsoleLeftRailProps {
  currentStageId: StageId;
  onSelectStage: (id: StageId) => void;
  layers: LayerState;
  onToggleLayer: (layerKey: keyof LayerState) => void;
  totalCandidatesCount: number;
  confirmedDebrisCount: number;
  hazardsCount: number;
}

export const ConsoleLeftRail: React.FC<ConsoleLeftRailProps> = ({
  currentStageId,
  onSelectStage,
  layers,
  onToggleLayer,
  totalCandidatesCount,
  confirmedDebrisCount,
  hazardsCount,
}) => {
  return (
    <div className="w-56 lg:w-60 bg-[#090e09] border-r border-[#193019] flex flex-col justify-between select-none font-mono text-[11px] shrink-0 overflow-y-auto">
      <div className="p-2.5 space-y-4">
        {/* 1. PIPELINE RAIL */}
        <div>
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#193019]">
            <span className="text-[9px] font-bold text-[#64876b] uppercase tracking-widest">
              PIPELINE RAIL
            </span>
            <span className="text-[8px] text-[#3d5843]">CLICK TO INSPECT</span>
          </div>

          <div className="space-y-0.5">
            {PIPELINE_STAGES.map((st) => {
              const isSelected = currentStageId === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStage(st.id)}
                  className={`w-full text-left px-2 py-1.5 transition-all cursor-pointer flex flex-col ${
                    isSelected
                      ? 'bg-[#122415] border-l-2 border-[#4ade80] text-[#4ade80] font-bold shadow-[inset_0_0_10px_rgba(74,222,128,0.1)]'
                      : 'border-l-2 border-transparent text-[#64876b] hover:text-[#dcfce7] hover:bg-[#0e160e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-wider">
                      {st.id} {st.name}
                    </span>
                    {isSelected && (
                      <span className="text-[8px] text-[#4ade80] font-bold">ACTIVE</span>
                    )}
                  </div>
                  <span className="text-[8px] text-[#3d5843] truncate font-normal">
                    {st.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. LAYERS PANEL (CHECKBOX LIST) */}
        <div>
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#193019]">
            <span className="text-[9px] font-bold text-[#64876b] uppercase tracking-widest">
              LAYERS
            </span>
            <span className="text-[8px] text-[#3d5843]">OVERLAYS</span>
          </div>

          <div className="space-y-1 text-[10px]">
            {[
              { key: 'rawSonar', label: 'RAW SONAR' },
              { key: 'denoisedSonar', label: 'DENOISED SONAR' },
              { key: 'rawDetections', label: 'RAW DETECTIONS' },
              { key: 'confidenceHeatmap', label: 'CONFIDENCE HEATMAP' },
              { key: 'rejectedCandidates', label: 'REJECTED CANDIDATES' },
              { key: 'acceptedDebris', label: 'ACCEPTED DEBRIS' },
              { key: 'geotagMarkers', label: 'GEOTAG MARKERS' },
              { key: 'surveyTrack', label: 'SURVEY TRACK' },
            ].map(({ key, label }) => {
              const isActive = layers[key as keyof LayerState];
              return (
                <label
                  key={key}
                  onClick={() => onToggleLayer(key as keyof LayerState)}
                  className="flex items-center gap-2 px-1.5 py-0.5 hover:bg-[#0e160e] cursor-pointer text-[#64876b] hover:text-[#dcfce7] transition-colors"
                >
                  <span
                    className={`font-mono text-[9px] font-bold ${
                      isActive ? 'text-[#4ade80]' : 'text-[#3d5843]'
                    }`}
                  >
                    [{isActive ? 'X' : ' '}]
                  </span>
                  <span className={`text-[9px] ${isActive ? 'text-[#dcfce7]' : 'text-[#64876b]'}`}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. KEYBOARD SHORTCUTS HINT */}
        <div className="p-2 border border-[#193019] bg-[#070b07] text-[8px] text-[#3d5843] leading-relaxed">
          <span className="text-[#64876b] font-bold block mb-0.5">KEYS</span>
          [1-6] JUMP STAGE<br />
          [SPACE] PLAY / PAUSE<br />
          [← / →] STEP FRAME<br />
          [R] RESET TO 01
        </div>
      </div>

      {/* 4. BOTTOM-LEFT PERSISTENT SUMMARY TILE */}
      <div className="p-2.5 border-t border-[#193019] bg-[#070b07] space-y-1">
        <span className="text-[8px] text-[#64876b] uppercase tracking-wider block font-bold">
          DARK OBJECTS
        </span>
        <div className="text-[10px] text-[#dcfce7] leading-tight">
          <strong className="text-[#4ade80] font-mono">{totalCandidatesCount}</strong> candidates ·{' '}
          <strong className="text-[#4ade80] font-mono">{confirmedDebrisCount}</strong> confirmed
        </div>
        <div className="text-[8px] text-amber-400 font-bold">
          {hazardsCount} CRITICAL ENCOUNTER HAZARDS
        </div>
      </div>
    </div>
  );
};
