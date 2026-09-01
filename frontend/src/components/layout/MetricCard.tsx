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
    cyan: 'border-[#4CD9E8]/30 hover:border-[#4CD9E8] text-[#4CD9E8]',
    red: 'border-[#F04438]/30 hover:border-[#F04438] text-[#F04438]',
    blue: 'border-[#29B6F6]/30 hover:border-[#29B6F6] text-[#29B6F6]',
    purple: 'border-[#A855F7]/30 hover:border-[#A855F7] text-[#A855F7]',
    amber: 'border-[#F5A623]/30 hover:border-[#F5A623] text-[#F5A623]',
    emerald: 'border-[#3FD98A]/30 hover:border-[#3FD98A] text-[#3FD98A]',
    neutral: 'border-[#152438] hover:border-[#4CD9E8]/40 text-[#7C8AA0]',
  };

  const glowVariants = {
    cyan: 'from-[#4CD9E8]/15 via-transparent to-transparent',
    red: 'from-[#F04438]/15 via-transparent to-transparent',
    blue: 'from-[#29B6F6]/15 via-transparent to-transparent',
    purple: 'from-[#A855F7]/15 via-transparent to-transparent',
    amber: 'from-[#F5A623]/15 via-transparent to-transparent',
    emerald: 'from-[#3FD98A]/15 via-transparent to-transparent',
    neutral: 'from-[#152438]/40 via-transparent to-transparent',
  };

  const iconBgVariants = {
    cyan: 'bg-[#0A1A2E] border-[#4CD9E8]/40 text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.2)] group-hover:scale-110 group-hover:rotate-6',
    red: 'bg-[#1E0E14] border-[#F04438]/40 text-[#F04438] shadow-[0_0_15px_rgba(240,68,56,0.2)] group-hover:scale-110 group-hover:rotate-6',
    blue: 'bg-[#0A162B] border-[#29B6F6]/40 text-[#29B6F6] shadow-[0_0_15px_rgba(41,182,246,0.2)] group-hover:scale-110 group-hover:rotate-6',
    purple: 'bg-[#180E2B] border-[#A855F7]/40 text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 group-hover:rotate-6',
    amber: 'bg-[#1D1408] border-[#F5A623]/40 text-[#F5A623] shadow-[0_0_15px_rgba(245,166,35,0.2)] group-hover:scale-110 group-hover:rotate-6',
    emerald: 'bg-[#091D17] border-[#3FD98A]/40 text-[#3FD98A] shadow-[0_0_15px_rgba(63,217,138,0.2)] group-hover:scale-110 group-hover:rotate-6',
    neutral: 'bg-[#0A1322] border-[#152438] text-[#7C8AA0] group-hover:scale-110',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border ${
        borderVariants[variant]
      } ${
        isHero
          ? 'bg-gradient-to-br from-[#0C1A2E] via-[#0A1424] to-[#050C18] shadow-[0_0_30px_rgba(76,217,232,0.15)] ring-1 ring-[#4CD9E8]/40'
          : 'bg-gradient-to-br from-[#0A1322]/90 to-[#060D17]/95'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowVariants[variant]} pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#7C8AA0] flex items-center gap-1.5">
            <span>{title}</span>
            {isHero && (
              <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/40 font-bold">
                PRIMARY KPI
              </span>
            )}
          </p>

          <h3
            className={`mt-2 font-black font-mono tracking-tight ${
              isHero ? 'text-3xl md:text-4xl text-[#4CD9E8]' : 'text-2xl text-[#EAEFF5]'
            }`}
          >
            {displayValue}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-[#7C8AA0] font-medium font-sans leading-relaxed">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#3FD98A] bg-[#091D17] px-2 py-0.5 rounded-md border border-[#3FD98A]/30 flex items-center gap-1">
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
