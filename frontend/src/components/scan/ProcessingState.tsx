import React from 'react';
import {
  Radio,
  Cpu,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Activity,
  ScanLine,
  Compass,
} from 'lucide-react';

interface ProcessingStateProps {
  currentStage: number;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  currentStage,
}) => {
  const stages = [
    {
      id: 1,
      title: '01 INGESTING — Raw SSS Imagery',
      desc: 'Dual-channel port/starboard backscatter calibration & letterbox normalization (640×640)',
      icon: Layers,
    },
    {
      id: 2,
      title: '02 DENOISING — Preprocessing',
      desc: 'Bilateral filtering speckle suppression & CLAHE contrast boost',
      icon: Radio,
    },
    {
      id: 3,
      title: '03 DETECTING — YOLOv8n ONNX Forward Pass',
      desc: 'Computing candidate proposals via marine_sonar_v2.onnx tensor inference',
      icon: Cpu,
    },
    {
      id: 4,
      title: '04 FILTERING — Acoustic Shadow Gate',
      desc: 'Acoustic shadow trigonometry verification: rejecting flat basalt rocks and sand ripples',
      icon: ShieldCheck,
    },
    {
      id: 5,
      title: '05 CLASSIFYING — Debris Taxonomy',
      desc: 'Categorizing Ghost Net (ALDFG), lost fishing gear, pipeline hazards & anthropogenic debris',
      icon: Sparkles,
    },
    {
      id: 6,
      title: '06 GEOTAGGING — WGS-84 Fix & Dossier',
      desc: 'Sensor-derived USBL latitude/longitude georeferencing and incident dossier compilation',
      icon: Compass,
    },
  ];

  return (
    <div className="rounded-3xl glass-panel p-8 md:p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden shadow-2xl bg-acoustic-grid">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cinematic Sonar Aperture & Scan Sweep */}
      <div className="relative w-full max-w-sm h-40 rounded-2xl bg-[#030816] border border-cyan-500/30 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex items-center justify-center">
        {/* Waterfall Grid Lines */}
        <div className="absolute inset-0 bg-acoustic-dots opacity-40" />

        {/* Central Nadir Blind-Zone Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 bg-slate-950/90 border-x border-cyan-500/20 flex flex-col justify-between items-center py-2 text-[8px] font-mono text-cyan-500/50">
          <span>0m</span>
          <span className="rotate-90 text-[7px] tracking-widest uppercase">Nadir</span>
          <span>50m</span>
        </div>

        {/* Animated Sonar Sweep Laser Line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06B6D4] animate-sonar-sweep" />

        {/* Sonar Transducer Radar Rings */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-cyan-500/30 flex items-center justify-center animate-ping opacity-30" />
          <div className="absolute w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-950">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Live Acoustic Equalizer Waves */}
        <div className="absolute bottom-2 left-3 flex items-end gap-1 h-5">
          <div className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
          <div className="w-1 bg-teal-400 rounded-full animate-eq-2" />
          <div className="w-1 bg-cyan-400 rounded-full animate-eq-3" />
          <div className="w-1 bg-teal-400 rounded-full animate-eq-4" />
          <div className="w-1 bg-cyan-400 rounded-full animate-eq-5" />
        </div>

        {/* Live Frequency Readout */}
        <div className="absolute top-2 right-3 text-[10px] font-mono text-cyan-400/80 flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>CHIRP: 450 kHz</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center space-y-1.5 max-w-md">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-md">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>REAL-TIME SSS ACOUSTIC INFERENCE</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-100 font-mono tracking-wider">
          SCANNING ACOUSTIC WATERFALL
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          YOLOv8n-SIH-Marine-Debris-V2 Neural Perception & Noise Filtering
        </p>
      </div>

      {/* Pipeline Multi-Stage Progress Timeline */}
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
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : isCurrent
                  ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-xl shadow-cyan-950/60 scale-[1.01] ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/30 border-slate-800/80 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
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
                    <span className="text-[10px] font-mono font-extrabold text-cyan-400 animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      COMPLETED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
