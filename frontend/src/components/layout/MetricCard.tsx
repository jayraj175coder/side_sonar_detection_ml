import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'red' | 'blue' | 'purple' | 'emerald' | 'neutral';
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
    cyan: 'border-cyan-500/20 hover:border-cyan-500/50 text-cyan-400',
    red: 'border-red-500/20 hover:border-red-500/50 text-red-400',
    blue: 'border-blue-500/20 hover:border-blue-500/50 text-blue-400',
    purple: 'border-purple-500/20 hover:border-purple-500/50 text-purple-400',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400',
    neutral: 'border-slate-800 hover:border-slate-700 text-slate-400',
  };

  const glowVariants = {
    cyan: 'from-cyan-950/30 via-transparent to-transparent',
    red: 'from-red-950/30 via-transparent to-transparent',
    blue: 'from-blue-950/30 via-transparent to-transparent',
    purple: 'from-purple-950/30 via-transparent to-transparent',
    emerald: 'from-emerald-950/30 via-transparent to-transparent',
    neutral: 'from-slate-900/30 via-transparent to-transparent',
  };

  const iconBgVariants = {
    cyan: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400 shadow-cyan-950/50',
    red: 'bg-red-950/60 border-red-500/30 text-red-400 shadow-red-950/50',
    blue: 'bg-blue-950/60 border-blue-500/30 text-blue-400 shadow-blue-950/50',
    purple: 'bg-purple-950/60 border-purple-500/30 text-purple-400 shadow-purple-950/50',
    emerald: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400 shadow-emerald-950/50',
    neutral: 'bg-slate-900 border-slate-800 text-slate-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl glass-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${borderVariants[variant]}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowVariants[variant]} pointer-events-none opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
          {trend && (
            <p className="mt-1.5 text-xs text-cyan-400 font-mono font-semibold flex items-center gap-1">
              <span>↗</span> {trend}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl border shadow-lg shrink-0 ${iconBgVariants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
