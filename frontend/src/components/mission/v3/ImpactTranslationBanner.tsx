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
    <div className="bg-[#030B14] border-b border-[#0D2E4A] px-4 py-2 select-none font-mono">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Card 1: Debris Sites & Tonnage */}
        <div className="px-3 py-1.5 bg-[#05121F] border border-[#0D2E4A] rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[12px] font-black text-[#E0F7F4] leading-tight">
                <span className="text-[#EF4444]">{debrisCount}</span> SITES FLAGGED
              </div>
              <div className="text-[8.5px] text-[#4A8090]">est. 2.3 tons of ghost gear</div>
            </div>
          </div>
          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#EF4444]/20 text-[#EF4444] rounded-xs">
            HIGH THREAT
          </span>
        </div>

        {/* Card 2: Human Time Saved (Speed Triage) */}
        <div className="px-3 py-1.5 bg-[#05121F] border border-[#0D2E4A] rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center text-[#00D4AA] shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[12px] font-black text-[#E0F7F4] leading-tight">
                <span className="text-[#00D4AA]">4 MIN</span> <span className="text-[#4A8090] text-[10px] font-normal">vs ~6 hrs dive</span>
              </div>
              <div className="text-[8.5px] text-[#4A8090]">Manual dive: ~6 hrs → SonarX: 4 min</div>
            </div>
          </div>
          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs">
            90× FASTER
          </span>
        </div>

        {/* Card 3: Seafloor Coverage */}
        <div className="px-3 py-1.5 bg-[#05121F] border border-[#0D2E4A] rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[12px] font-black text-[#E0F7F4] leading-tight">
                <span className="text-[#38BDF8]">{coveragePct}%</span> COVERAGE
              </div>
              <div className="text-[8.5px] text-[#4A8090]">12.84 km² shelf swath surveyed this pass</div>
            </div>
          </div>
          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#38BDF8]/20 text-[#38BDF8] rounded-xs">
            COMPLETED
          </span>
        </div>
      </div>
    </div>
  );
};
