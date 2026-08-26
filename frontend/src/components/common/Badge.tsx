import React from 'react';

interface BadgeProps {
  type: 'MILCO' | 'NOMBO' | 'STATUS' | 'CONFIDENCE' | 'CUSTOM';
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
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'MILCO' || variant === 'danger') {
    colorStyles = 'bg-red-500/15 text-red-400 border-red-500/40 shadow-sm shadow-red-950/40';
  } else if (type === 'NOMBO' || variant === 'info') {
    colorStyles = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-950/40';
  } else if (variant === 'success') {
    colorStyles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
  } else if (variant === 'warning') {
    colorStyles = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono uppercase tracking-wider ${sizeStyles} ${colorStyles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          type === 'MILCO'
            ? 'bg-red-400 animate-pulse'
            : type === 'NOMBO'
            ? 'bg-cyan-400'
            : variant === 'success'
            ? 'bg-emerald-400'
            : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
};
