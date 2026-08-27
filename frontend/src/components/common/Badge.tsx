import React from 'react';
import {
  AlertOctagon,
  Shield,
  Layers,
  Sparkles,
  AlertTriangle,
  Radio,
  Boxes,
} from 'lucide-react';

interface BadgeProps {
  type: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, label, size = 'md' }) => {
  const isSm = size === 'sm';
  const displayLabel = label || type;

  // 1. Ghost Net / ALDFG (MoES Target 1)
  if (type === 'ghost_net_aldfg' || type.toLowerCase().includes('ghost_net') || type.toLowerCase().includes('net')) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg bg-purple-950/70 text-purple-300 border border-purple-500/40 shadow-sm ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertTriangle className={isSm ? 'w-3 h-3 text-purple-400' : 'w-3.5 h-3.5 text-purple-400'} />
        <span>GHOST NET / ALDFG</span>
      </span>
    );
  }

  // 2. Anthropogenic Debris (MoES Target 2)
  if (type === 'anthropogenic_debris' || type.toLowerCase().includes('debris')) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Boxes className={isSm ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
        <span>MAN-MADE DEBRIS</span>
      </span>
    );
  }

  // 3. Pipeline Hazard (SubPipe SSS)
  if (type === 'pipeline_hazard' || type.toLowerCase().includes('pipeline')) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg bg-blue-950/70 text-blue-300 border border-blue-500/40 shadow-sm ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Layers className={isSm ? 'w-3 h-3 text-blue-400' : 'w-3.5 h-3.5 text-blue-400'} />
        <span>PIPELINE HAZARD</span>
      </span>
    );
  }

  // 4. Seafloor Anomaly
  if (type === 'seafloor_anomaly' || type.toLowerCase().includes('anomaly')) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Radio className={isSm ? 'w-3 h-3 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />
        <span>SEAFLOOR ANOMALY</span>
      </span>
    );
  }

  // 5. Baseline MILCO
  if (type === 'MILCO') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg bg-red-950/70 text-red-300 border border-red-500/40 shadow-sm ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertOctagon className={isSm ? 'w-3 h-3 text-red-400' : 'w-3.5 h-3.5 text-red-400'} />
        <span>MILCO CONTACT</span>
      </span>
    );
  }

  // 6. Baseline NOMBO / Default
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Shield className={isSm ? 'w-3 h-3 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />
      <span>{displayLabel}</span>
    </span>
  );
};
