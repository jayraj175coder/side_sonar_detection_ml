import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'red' | 'blue' | 'neutral';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
}) => {
  const borderVariants = {
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400',
    red: 'border-red-500/20 hover:border-red-500/40 text-red-400',
    blue: 'border-blue-500/20 hover:border-blue-500/40 text-blue-400',
    neutral: 'border-slate-800 hover:border-slate-700 text-slate-400',
  };

  const glowVariants = {
    cyan: 'from-cyan-950/20 to-transparent',
    red: 'from-red-950/20 to-transparent',
    blue: 'from-blue-950/20 to-transparent',
    neutral: 'from-slate-900/20 to-transparent',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-[#0C1427]/80 backdrop-blur border p-5 transition-all duration-200 ${borderVariants[variant]}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowVariants[variant]} pointer-events-none opacity-40`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-mono font-medium tracking-wider uppercase text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-100 font-mono tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p className="mt-1 text-xs text-cyan-400 font-mono flex items-center gap-1">
              <span>↗</span> {trend}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-md bg-slate-900/80 border border-slate-800 ${borderVariants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
