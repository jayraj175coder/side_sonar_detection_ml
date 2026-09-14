import React from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  Box,
} from 'lucide-react';

export const NeuralTensorFlowDiagram: React.FC = () => {
  const stages = [
    {
      step: '01',
      title: 'Raw Acoustic SSS',
      dim: '640 × 640 × 1',
      tech: 'Bilateral Normalization',
      color: '#06B6D4',
      desc: 'Single-channel acoustic backscatter array with slant-range correction',
    },
    {
      step: '02',
      title: 'CSPDarknet Backbone',
      dim: 'P3 / P4 / P5 Tensors',
      tech: 'Cross-Stage Partial Conv',
      color: '#00D4AA',
      desc: 'Extracts multi-scale acoustic textural features & shadow gradients',
    },
    {
      step: '03',
      title: 'SPPF & C2f Neck',
      dim: 'Multi-scale Fusion',
      tech: 'Spatial Pyramid Pooling',
      color: '#38BDF8',
      desc: 'Aggregates spatial receptive fields without resolution decay',
    },
    {
      step: '04',
      title: 'Decoupled Detect Head',
      dim: 'Anchor-Free BBox + Cls',
      tech: 'Task-Aligned Assigner',
      color: '#F59E0B',
      desc: 'Predicts class probability logits & candidate bounding proposals',
    },
    {
      step: '05',
      title: 'Acoustic Noise Filter',
      dim: '0.05m/px Verification',
      tech: 'Shadow-Length Physics',
      color: '#10B981',
      desc: 'Rejects seabed coral false-positives via acoustic shadow validation',
    },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#030914] border border-[#0D2E4A] space-y-4 relative overflow-hidden font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#0D2E4A] pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu className="w-4 h-4 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-cyan-300">
            YOLOv8s ONNX Neural Tensor Pipeline
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/40">
          END-TO-END INFERENCE: 14.5ms
        </span>
      </div>

      {/* Interactive Neural Flow Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => (
          <div
            key={stage.step}
            className="p-3 rounded-xl bg-[#061220] border border-[#102B44] hover:border-cyan-400/60 transition-all group flex flex-col justify-between space-y-2 relative shadow-lg"
          >
            {/* Pulsing indicator node */}
            <div className="flex items-center justify-between">
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded border"
                style={{
                  color: stage.color,
                  borderColor: `${stage.color}50`,
                  backgroundColor: `${stage.color}15`,
                }}
              >
                STAGE {stage.step}
              </span>
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: stage.color, animationDuration: `${2 + idx * 0.4}s` }}
              />
            </div>

            <div>
              <h4 className="text-[11px] font-black text-[#FFFFFF] group-hover:text-cyan-300 transition-colors leading-snug">
                {stage.title}
              </h4>
              <span
                className="text-[9px] font-bold font-mono block mt-0.5"
                style={{ color: stage.color }}
              >
                {stage.dim}
              </span>
            </div>

            <div className="pt-2 border-t border-[#102B44] space-y-1 text-[8.5px]">
              <span className="text-[#64748B] block uppercase font-bold">{stage.tech}</span>
              <p className="text-[#8CA6B8] font-sans leading-tight line-clamp-2">
                {stage.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pulsing Light Carrier Line */}
      <div className="relative h-1.5 w-full bg-[#061220] rounded-full overflow-hidden border border-[#0D2E4A]">
        <div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_12px_#06B6D4] animate-laser-scan"
          style={{ width: '35%' }}
        />
      </div>

      <div className="flex items-center justify-between text-[8.5px] text-[#64748B] pt-1">
        <span>RAW SSS PING INGESTION</span>
        <span className="text-emerald-400 font-bold">100% DETERMINISTIC ONNX EXECUTION</span>
        <span>VERIFIED DEBRIS DOSSIER</span>
      </div>
    </div>
  );
};
