import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'red' | 'blue' | 'purple' | 'amber' | 'emerald' | 'neutral';
  trend?: string;
  isHero?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
  isHero = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  // Animated Count-Up for Numeric Values
  useEffect(() => {
    if (typeof value === 'number') {
      const start = 0;
      const end = value;
      const duration = 750; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * ease);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setDisplayValue(end);
        }
      };

      requestAnimationFrame(updateCounter);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const borderVariants = {
    cyan: 'border-cyan-500/25 hover:border-cyan-400 text-cyan-400',
    red: 'border-red-500/25 hover:border-red-400 text-red-400',
    blue: 'border-blue-500/25 hover:border-blue-400 text-blue-400',
    purple: 'border-purple-500/25 hover:border-purple-400 text-purple-400',
    amber: 'border-amber-500/25 hover:border-amber-400 text-amber-400',
    emerald: 'border-emerald-500/25 hover:border-emerald-400 text-emerald-400',
    neutral: 'border-slate-800 hover:border-slate-700 text-slate-400',
  };

  const glowVariants = {
    cyan: 'from-cyan-950/40 via-transparent to-transparent',
    red: 'from-red-950/40 via-transparent to-transparent',
    blue: 'from-blue-950/40 via-transparent to-transparent',
    purple: 'from-purple-950/40 via-transparent to-transparent',
    amber: 'from-amber-950/40 via-transparent to-transparent',
    emerald: 'from-emerald-950/40 via-transparent to-transparent',
    neutral: 'from-slate-900/40 via-transparent to-transparent',
  };

  const iconBgVariants = {
    cyan: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 shadow-cyan-950/60 group-hover:scale-110 group-hover:rotate-6',
    red: 'bg-red-950/70 border-red-500/40 text-red-300 shadow-red-950/60 group-hover:scale-110 group-hover:rotate-6',
    blue: 'bg-blue-950/70 border-blue-500/40 text-blue-300 shadow-blue-950/60 group-hover:scale-110 group-hover:rotate-6',
    purple: 'bg-purple-950/70 border-purple-500/40 text-purple-300 shadow-purple-950/60 group-hover:scale-110 group-hover:rotate-6',
    amber: 'bg-amber-950/70 border-amber-500/40 text-amber-300 shadow-amber-950/60 group-hover:scale-110 group-hover:rotate-6',
    emerald: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-emerald-950/60 group-hover:scale-110 group-hover:rotate-6',
    neutral: 'bg-slate-900 border-slate-800 text-slate-400 group-hover:scale-110',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl glass-panel p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        borderVariants[variant]
      } ${isHero ? 'ring-1 ring-cyan-500/40 bg-[#0C1736]/90' : ''}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowVariants[variant]} pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <span>{title}</span>
            {isHero && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Primary KPI
              </span>
            )}
          </p>

          <h3
            className={`mt-2 font-extrabold text-slate-100 font-mono tracking-tight ${
              isHero ? 'text-3xl md:text-4xl text-cyan-300' : 'text-2xl'
            }`}
          >
            {displayValue}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium font-sans leading-relaxed">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <span>↑</span> {trend}
              </span>
            </div>
          )}
        </div>

        <div
          className={`p-3 rounded-2xl border shadow-lg shrink-0 transition-all duration-300 ${iconBgVariants[variant]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
