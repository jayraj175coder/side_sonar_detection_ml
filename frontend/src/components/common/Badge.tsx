import React from 'react';

interface BadgeProps {
  type?: 'anthropogenic_debris' | 'derelict_fishing_gear' | 'anthropogenic_structure' | 'potential_anomaly' | 'MILCO' | 'NOMBO' | 'STATUS' | 'CONFIDENCE' | 'CUSTOM' | string;
  label: string;
  variant?: 'danger' | 'info' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  label,
  variant,
  size = 'md',
  className = '',
}) => {
  let colorStyles = 'bg-slate-800/80 text-slate-300 border-slate-700/60 shadow-sm';
  let dotColor = 'bg-slate-400';

  if (type === 'MILCO' || type === 'derelict_fishing_gear' || variant === 'danger') {
    colorStyles = 'bg-red-500/15 text-red-400 border-red-500/40 shadow-sm shadow-red-950/40';
    dotColor = 'bg-red-400 animate-pulse';
  } else if (type === 'anthropogenic_debris' || type === 'NOMBO' || variant === 'info') {
    colorStyles = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950/40';
    dotColor = 'bg-cyan-400';
  } else if (type === 'anthropogenic_structure' || variant === 'warning') {
    colorStyles = 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/40';
    dotColor = 'bg-amber-400';
  } else if (type === 'potential_anomaly' || variant === 'neutral') {
    colorStyles = 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-950/40';
    dotColor = 'bg-purple-400';
  } else if (variant === 'success') {
    colorStyles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950/30';
    dotColor = 'bg-emerald-400';
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono uppercase tracking-wider ${sizeStyles} ${colorStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label.replace(/_/g, ' ')}
    </span>
  );
};
