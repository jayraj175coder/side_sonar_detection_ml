import React from 'react';
import {
  Radio,
  Sliders,
  Sparkles,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  Check,
} from 'lucide-react';

export type PipelineStageKey = 'INGEST' | 'PREPROCESS' | 'DETECT' | 'FILTER' | 'REPORT';

export interface StageState {
  key: PipelineStageKey;
  label: string;
  sublabel: string;
  icon: React.ComponentType<any>;
  status: 'QUEUED' | 'PROCESSING' | 'DONE';
  durationMs: number;
  timestamp: string;
}

interface PipelineStatusRailProps {
  stages: StageState[];
  currentStageIndex: number;
  isProcessing: boolean;
}

export const PipelineStatusRail: React.FC<PipelineStatusRailProps> = ({
  stages,
  currentStageIndex,
  isProcessing,
}) => {
  return (
    <div className="w-full bg-[#081118] border border-[#16303B] rounded-2xl p-3.5 shadow-xl font-mono select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#32E6D1] animate-pulse" />
          <span className="text-[11px] font-black tracking-widest text-[#E4F2F5] uppercase font-sans">
            AUTOMATED AI PERCEPTION PIPELINE
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#6F8992]">
          <span>STATUS:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-full ${
              isProcessing
                ? 'bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/40 animate-pulse'
                : 'bg-[#65D391]/20 text-[#65D391] border border-[#65D391]/40'
            }`}
          >
            {isProcessing ? 'PROCESSING LIVE STREAM...' : 'PIPELINE READY'}
          </span>
        </div>
      </div>

      {/* Connected 5-Stage Sequential Rail */}
      <div className="grid grid-cols-5 gap-2 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.status === 'DONE';
          const isCurrent = stage.status === 'PROCESSING';
          const isQueued = stage.status === 'QUEUED';

          return (
            <div key={stage.key} className="relative flex flex-col">
              {/* Card node */}
              <div
                className={`p-2.5 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[74px] ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#32E6D1]/20 to-[#0C171E] border-[#32E6D1] shadow-[0_0_15px_rgba(50,230,209,0.3)] scale-[1.02]'
                    : isDone
                    ? 'bg-[#0C171E] border-[#65D391]/50 text-[#E4F2F5]'
                    : 'bg-[#081118]/60 border-[#16303B]/60 text-[#6F8992] opacity-70'
                }`}
              >
                {/* Node Header: Stage Number + Icon + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-[#32E6D1] text-[#03070B]'
                          : isDone
                          ? 'bg-[#65D391]/20 text-[#65D391]'
                          : 'bg-[#16303B] text-[#6F8992]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 text-[#65D391]" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#03070B]" />
                      ) : (
                        <span>0{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-[#E4F2F5] tracking-wide font-sans">
                      {stage.label}
                    </span>
                  </div>

                  {/* Status Tag */}
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isCurrent
                        ? 'bg-[#32E6D1] text-[#03070B]'
                        : isDone
                        ? 'bg-[#65D391]/20 text-[#65D391]'
                        : 'bg-[#16303B] text-[#6F8992]'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p className="text-[9px] text-[#6F8992] truncate mt-1">
                  {stage.sublabel}
                </p>

                {/* Timestamp & Duration Metrics */}
                <div className="flex items-center justify-between text-[8px] text-[#6F8992] pt-1 border-t border-[#16303B]/40 mt-1">
                  <span className="font-mono">{stage.timestamp || '--:--:--'}</span>
                  <span className={`font-mono font-bold ${isDone ? 'text-[#32E6D1]' : ''}`}>
                    {isDone ? `${stage.durationMs}ms` : isCurrent ? 'running...' : 'pending'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
