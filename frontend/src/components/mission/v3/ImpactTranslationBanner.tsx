import React, { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Target, TrendingUp, Sparkles } from 'lucide-react';

interface ImpactTranslationBannerProps {
  isDemoRunning?: boolean;
}

export const ImpactTranslationBanner: React.FC<ImpactTranslationBannerProps> = ({ isDemoRunning = false }) => {
  const [debrisCount, setDebrisCount] = useState(17);
  const [coveragePct, setCoveragePct] = useState(87);

  // Animated count-up when demo is triggered
  useEffect(() => {
    if (!isDemoRunning) return;

    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      setDebrisCount(Math.min(17, start));
      setCoveragePct(Math.min(87, Math.floor(start * 5.2)));
      if (start >= 17) clearInterval(interval);
    }, 90);

    return () => clearInterval(interval);
  }, [isDemoRunning]);

  return (
    <div className="bg-[#05080E] border-b border-[#162136] px-3 sm:px-4 py-1 select-none font-mono text-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Metric 1: Debris Sites */}
        <div className="px-2.5 py-1 bg-[#080D17] border border-[#162136] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            <span className="text-[11px] font-black text-[#F8FAFC]">
              <strong className="text-[#EF4444] font-mono">{debrisCount}</strong> SITES FLAGGED
            </span>
          </div>
          <span className="text-[8px] font-bold text-[#94A3B8] uppercase">
            4 HIGH HAZARDS
          </span>
        </div>

        {/* Metric 2: Detection Recency */}
        <div className="px-2.5 py-1 bg-[#080D17] border border-[#162136] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
            <span className="text-[11px] font-black text-[#F8FAFC]">
              <strong className="text-[#FFB703] font-mono">4 MIN</strong> <span className="text-[#94A3B8] font-normal text-[9.5px]">SINCE LAST DETECTION</span>
            </span>
          </div>
          <span className="text-[8px] font-bold px-1 py-0.2 bg-[#131B2A] text-[#FFB703] border border-[#FFB703]/30 rounded">
            LIVE TRIAGE
          </span>
        </div>

        {/* Metric 3: Seafloor Coverage */}
        <div className="px-2.5 py-1 bg-[#080D17] border border-[#162136] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            <span className="text-[11px] font-black text-[#F8FAFC]">
              <strong className="text-[#38BDF8] font-mono">{coveragePct}%</strong> COVERAGE
            </span>
          </div>
          <span className="text-[8px] font-bold text-[#94A3B8]">
            12.84 km²
          </span>
        </div>

        {/* Metric 4: Shadow Gate Nominal */}
        <div className="px-2.5 py-1 bg-[#080D17] border border-[#162136] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black text-[#F8FAFC]">
              SHADOW GATE: <strong className="text-emerald-400 font-mono">NOMINAL</strong>
            </span>
          </div>
          <span className="text-[8px] font-bold px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded">
            v2.1 PHYSICS
          </span>
        </div>
      </div>
    </div>
  );
};
