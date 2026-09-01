import React from 'react';
import { CheckCircle2, Loader, Circle, Cpu } from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { PIPELINE_STAGES } from '../../data/pipeline';

export const AIPipelinePanel: React.FC = () => {
  const { activePipelineStage, completedPipelineStages, missionStatus } = useMission();

  return (
    <div className="flex flex-col h-full bg-[#081118] border-r border-[#16303B] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#16303B] bg-[#03070B]/60 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#29B6F6]" />
          <span className="text-[11px] font-mono font-black text-[#66848D] uppercase tracking-widest">AI Processing Pipeline</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] font-mono text-[#66848D]">YOLOv8n-ONNX · SONARX-V2</span>
          {missionStatus === 'running' && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-[#32E6D1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32E6D1] animate-ping" />
              PROCESSING
            </span>
          )}
          {missionStatus === 'complete' && (
            <span className="text-[9px] font-mono text-[#65D391] font-bold">COMPLETE</span>
          )}
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isDone    = completedPipelineStages.has(idx);
          const isActive  = activePipelineStage === idx && !isDone;
          const isPending = !isDone && !isActive;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
                isDone    ? 'bg-[#65D391]/5 border-[#65D391]/20'
                : isActive ? 'bg-[#32E6D1]/5 border-[#32E6D1]/30 shadow-[0_0_12px_rgba(50,230,209,0.1)]'
                : 'bg-[#03070B]/40 border-[#16303B]/40'
              }`}
            >
              {/* Status icon */}
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#65D391]" />
                ) : isActive ? (
                  <Loader className="w-3.5 h-3.5 text-[#32E6D1] animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#16303B]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-[10px] font-mono font-bold truncate ${
                    isDone ? 'text-[#65D391]' : isActive ? 'text-[#32E6D1]' : 'text-[#16303B]'
                  }`}>
                    {String(stage.id).padStart(2, '0')} {stage.name}
                  </p>
                  <span className={`text-[8px] font-mono shrink-0 ${
                    isDone ? 'text-[#65D391]' : isActive ? 'text-[#32E6D1]/60' : 'text-[#16303B]'
                  }`}>
                    {stage.duration_ms < 1 ? `${(stage.duration_ms * 1000).toFixed(0)}μs` : `${stage.duration_ms}ms`}
                  </span>
                </div>

                {/* Code tag + description */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${
                    isDone ? 'border-[#65D391]/30 text-[#65D391]/60 bg-[#65D391]/5'
                    : isActive ? 'border-[#32E6D1]/30 text-[#32E6D1]/60 bg-[#32E6D1]/5'
                    : 'border-[#16303B] text-[#16303B]'
                  }`}>{stage.code}</span>
                </div>

                {isDone && (
                  <p className="text-[9px] font-mono text-[#65D391]/70 mt-0.5 leading-snug">✓ {stage.output}</p>
                )}
                {isActive && (
                  <p className="text-[9px] font-mono text-[#32E6D1]/70 mt-0.5 leading-snug animate-pulse">{stage.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      {missionStatus === 'complete' && (
        <div className="shrink-0 px-3 py-2 border-t border-[#16303B] bg-[#03070B]/60 space-y-0.5">
          <p className="text-[9px] font-mono text-[#65D391]">✓ XTF decoded — 2,048 pings extracted</p>
          <p className="text-[9px] font-mono text-[#65D391]">✓ AI inference complete — 10.2 ms/frame</p>
          <p className="text-[9px] font-mono text-[#65D391]">✓ 17 anomalies detected · 4 priority</p>
          <p className="text-[9px] font-mono text-[#65D391]">✓ All targets georeferenced ±0.8 m</p>
        </div>
      )}
    </div>
  );
};
