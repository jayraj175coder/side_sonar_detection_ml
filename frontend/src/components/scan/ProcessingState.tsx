import React from 'react';
import { Radio, Cpu, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ProcessingStateProps {
  currentStage: number; // 1: preparing, 2: detecting, 3: processing, 4: visualizing
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  currentStage,
}) => {
  const stages = [
    {
      id: 1,
      title: 'Preparing sonar image',
      desc: 'Letterboxing, 640×640 normalization, and tensor allocation',
      icon: Layers,
    },
    {
      id: 2,
      title: 'Running YOLOv8n inference',
      desc: 'ONNX Runtime forward pass on acoustic backscatter tensor',
      icon: Cpu,
    },
    {
      id: 3,
      title: 'Processing detections & NMS',
      desc: 'Extracting bounding coordinates, IoU suppression, and class mapping',
      icon: ShieldAlert,
    },
    {
      id: 4,
      title: 'Preparing geospatial visualization',
      desc: 'Generating geospatial overlays and target hazard assessment',
      icon: Radio,
    },
  ];

  return (
    <div className="rounded-xl bg-[#080E1C]/90 border border-cyan-500/30 p-8 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
      {/* Radar Pulse Graphics */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
        <div className="absolute inset-2 rounded-full border border-cyan-500/40" />
        <div className="absolute inset-5 rounded-full border border-cyan-500/60" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
        <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-300">
          <Radio className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-slate-100 font-mono tracking-wider">
          SONARX ACOUSTIC INFERENCE IN PROGRESS
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Executing YOLOv8n ONNX deep learning pipeline for MILCO/NOMBO detection
        </p>
      </div>

      {/* Pipeline Steps */}
      <div className="w-full max-w-lg space-y-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isDone = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border flex items-center gap-3.5 transition-all duration-200 ${
                isDone
                  ? 'bg-slate-900/60 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-900/30 border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold font-mono tracking-wide">
                    {stage.title}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      DONE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
