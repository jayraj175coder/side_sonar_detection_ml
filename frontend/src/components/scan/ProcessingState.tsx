import React from 'react';
import { Radio, Cpu, Layers, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface ProcessingStateProps {
  currentStage: number;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  currentStage,
}) => {
  const stages = [
    {
      id: 1,
      title: 'Preparing sonar acoustic image',
      desc: 'Letterboxing, 640×640 normalization, and tensor allocation',
      icon: Layers,
    },
    {
      id: 2,
      title: 'Running YOLOv8n ONNX inference',
      desc: 'Executing forward pass on acoustic backscatter tensor',
      icon: Cpu,
    },
    {
      id: 3,
      title: 'Processing detections & IoU NMS',
      desc: 'Extracting bounding coordinates and suppressing redundant candidates',
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
    <div className="rounded-3xl glass-panel p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden shadow-2xl">
      {/* Sonar Radar Graphic */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
        <div className="absolute inset-3 rounded-full border border-cyan-500/30" />
        <div className="absolute inset-6 rounded-full border border-cyan-500/40" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/60">
          <Radio className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1.5 max-w-md">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
          <Sparkles className="w-3 h-3" />
          <span>REAL-TIME NEURAL INFERENCE</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-100 font-mono tracking-wider">
          ANALYZING ACOUSTIC BEAM
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          YOLOv8n ONNX deep learning pipeline for MILCO and NOMBO classification
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
              className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all duration-300 ${
                isDone
                  ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-xl shadow-cyan-950/60 scale-[1.01]'
                  : 'bg-slate-950/30 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                    : 'bg-slate-900 text-slate-500'
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
                  <p className="text-xs font-bold font-mono tracking-wide">
                    {stage.title}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
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
