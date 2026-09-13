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
    <div className="bg-[#030B14] border-b border-[#0D2E4A] px-3 sm:px-4 py-1 select-none font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Card 1: Debris Sites & Tonnage */}
        <div className="px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
              <Target className="w-3 h-3" />
            </div>
            <div>
              <div className="text-[11px] font-black text-[#E0F7F4] leading-none">
                <span className="text-[#EF4444]">{debrisCount}</span> SITES FLAGGED
              </div>
              <div className="text-[8px] text-[#4A8090] mt-0.5">est. 2.3 tons ghost gear</div>
            </div>
          </div>
          <span className="text-[7.5px] font-bold px-1.5 py-0.5 bg-[#EF4444]/20 text-[#EF4444] rounded">
            HIGH THREAT
          </span>
        </div>

        {/* Card 2: Human Time Saved (Speed Triage) */}
        <div className="px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center text-[#00D4AA] shrink-0">
              <Clock className="w-3 h-3" />
            </div>
            <div>
              <div className="text-[11px] font-black text-[#E0F7F4] leading-none">
                <span className="text-[#00D4AA]">4 MIN</span> <span className="text-[#4A8090] text-[9px] font-normal">vs ~6 hrs dive</span>
              </div>
              <div className="text-[8px] text-[#4A8090] mt-0.5">Automated side-scan triage</div>
            </div>
          </div>
          <span className="text-[7.5px] font-bold px-1.5 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded">
            90× FASTER
          </span>
        </div>

        {/* Card 3: Seafloor Coverage */}
        <div className="px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div>
              <div className="text-[11px] font-black text-[#E0F7F4] leading-none">
                <span className="text-[#38BDF8]">{coveragePct}%</span> COVERAGE
              </div>
              <div className="text-[8px] text-[#4A8090] mt-0.5">12.84 km² shelf swath surveyed</div>
            </div>
          </div>
          <span className="text-[7.5px] font-bold px-1.5 py-0.5 bg-[#38BDF8]/20 text-[#38BDF8] rounded">
            SURVEY PASS
          </span>
        </div>
      </div>
    </div>
  );
};
