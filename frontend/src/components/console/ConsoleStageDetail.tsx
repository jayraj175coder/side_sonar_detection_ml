import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { STAGE_DETAILS, StageId, CandidateItem } from '../../data/consoleData';

// Counts a number from 0 to `target` over `durationMs`
function useCountUp(target: number, durationMs: number, trigger: string): number {
  const [val, setVal] = useState<number>(0);
  const prevTrigger = useRef<string>('');
  useEffect(() => {
    if (prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;
    setVal(0);
    const steps = 30;
    const step = target / steps;
    const delay = durationMs / steps;
    let current = 0;
    const id = setInterval(() => {
      current += step;
      if (current >= target) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(Math.floor(current));
      }
    }, delay);
    return () => clearInterval(id);
  }, [trigger, target, durationMs]);
  return val;
}

interface ConsoleStageDetailProps {
  currentStageId: StageId;
  candidates: CandidateItem[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  hoveredCandidateId?: string | null;
  onHoverCandidate?: (id: string | null) => void;
}

export const ConsoleStageDetail: React.FC<ConsoleStageDetailProps> = ({
  currentStageId,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  hoveredCandidateId,
  onHoverCandidate,
}) => {
  const stage = STAGE_DETAILS[currentStageId] || STAGE_DETAILS['01'];

  // Animated metric counters — only count up on stage change
  const animM1 = useCountUp(
    currentStageId === '04' ? 37 : parseFloat(stage.metric1.value) || 0,
    250, currentStageId
  );
  const animM2 = useCountUp(
    currentStageId === '04' ? 20 : parseFloat(stage.metric2.value) || 0,
    350, currentStageId
  );
  const animM3 = useCountUp(
    currentStageId === '04' ? 17 : parseFloat(stage.metric3.value) || 0,
    450, currentStageId
  );

  // For FILTER stage, show animated numbers; otherwise show raw value strings
  const isFilter = currentStageId === '04';

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];


  return (
    <div className="w-80 lg:w-96 bg-[#05121F] border-l border-[#0D2E4A] flex flex-col justify-between select-none font-mono text-[11px] shrink-0 overflow-y-auto">
      <div className="p-3 space-y-3 flex-1">
        {/* 1. Header: 0X [STAGE NAME] + Count Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-[#0D2E4A]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#E0F7F4] tracking-wider uppercase">
              {stage.id} {stage.name}
            </span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 border border-[#00D4AA]/60 bg-[#082830] text-[#00D4AA] shadow-[0_0_10px_rgba(74,222,128,0.15)]">
            {stage.countBadge}
          </span>
        </div>

        {/* 2. Metric Row: 3 Stat Tiles — animated count-up on FILTER stage */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* RAW / M1 */}
          <div className={`p-2 border space-y-0.5 transition-all duration-300 ${
            isFilter ? 'border-[#4A8090]/60 bg-[#0A1E30]' : 'border-[#0D2E4A] bg-[#030B14]'
          }`}>
            <span className="text-[7.5px] text-[#4A8090] uppercase block truncate font-bold">
              {isFilter ? 'RAW DETECTIONS' : stage.metric1.label}
            </span>
            <strong className="text-xs font-black text-[#E0F7F4] block font-mono">
              {isFilter ? animM1 : stage.metric1.value}
            </strong>
          </div>

          {/* REJECTED / M2 */}
          <div className={`p-2 border space-y-0.5 transition-all duration-300 ${
            isFilter ? 'border-[#f59e0b]/50 bg-[#0D1A08]' : 'border-[#0D2E4A] bg-[#030B14]'
          }`}>
            <span className={`text-[7.5px] uppercase block truncate font-bold ${
              isFilter ? 'text-[#f59e0b]' : 'text-[#4A8090]'
            }`}>
              {isFilter ? 'REJECTED (NOISE)' : stage.metric2.label}
            </span>
            <strong className={`text-xs font-black block font-mono ${
              isFilter ? 'text-[#f59e0b]' : 'text-[#E0F7F4]'
            }`}>
              {isFilter ? animM2 : stage.metric2.value}
            </strong>
          </div>

          {/* CONFIRMED / M3 */}
          <div className={`p-2 border space-y-0.5 transition-all duration-300 ${
            isFilter ? 'border-[#00D4AA]/60 bg-[#083040] shadow-[0_0_10px_rgba(74,222,128,0.12)]' : 'border-[#00D4AA]/40 bg-[#0A1E30]'
          }`}>
            <span className="text-[7.5px] text-[#00D4AA] uppercase block truncate font-bold">
              {isFilter ? 'CONFIRMED DEBRIS' : stage.metric3.label}
            </span>
            <strong className="text-xs font-black text-[#00D4AA] block font-mono">
              {isFilter ? animM3 : stage.metric3.value}
            </strong>
          </div>
        </div>

        {/* FILTER STAGE: visual funnel arrow row */}
        {isFilter && (
          <div className="flex items-center justify-center gap-1 text-[8px] text-[#4A8090] font-mono py-1">
            <span className="text-[#E0F7F4]">{animM1} raw</span>
            <span className="text-[#2A5060]">&gt;</span>
            <span className="text-[#f59e0b]">{animM2} rejected</span>
            <span className="text-[#2A5060]">&gt;</span>
            <span className="text-[#00D4AA] font-bold">{animM3} confirmed</span>
          </div>
        )}

        {/* 3. Explanation Paragraph (Plain language stating what filter/rule does the work) */}
        <div className="p-2.5 bg-[#0A1E30] border border-[#0D2E4A] text-[10px] text-[#4A8090] leading-relaxed">
          <p className="text-[#E0F7F4]/90">{stage.explanation}</p>
        </div>

        {/* 4. Epistemic Caution Callout (Distinct Amber Left Border Box) */}
        {stage.cautionCallout && (
          <div className="p-2.5 bg-[#141208] border-l-2 border-[#f59e0b] text-[9px] text-amber-300 leading-normal space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[#f59e0b]">
              <AlertTriangle className="w-3 h-3 text-[#f59e0b] shrink-0" />
              <span>EPISTEMIC CAUTION</span>
            </div>
            <p className="text-amber-200/90">{stage.cautionCallout}</p>
          </div>
        )}

        {/* 5. Data Table: Candidate Register with 3-Stop Confidence Colors */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8.5px] text-[#4A8090] font-bold uppercase tracking-wider">
            <span>CANDIDATE REGISTER</span>
            <span>{candidates.length} CANDIDATES</span>
          </div>

          <div className="border border-[#0D2E4A] bg-[#030B14] overflow-hidden">
            <table className="w-full text-[9px] text-left">
              <thead className="bg-[#0A1E30] text-[#4A8090] border-b border-[#0D2E4A]">
                <tr>
                  <th className="py-1 px-1.5 font-normal">ID</th>
                  <th className="py-1 px-1.5 font-normal text-right">CONF</th>
                  <th className="py-1 px-1.5 font-normal text-right">ASPECT</th>
                  <th className="py-1 px-1.5 font-normal text-right">SHADOW</th>
                  <th className="py-1 px-1.5 font-normal text-right">VERDICT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0D2E4A]">
                {candidates.map((item) => {
                  const isSelected = selectedCandidateId === item.id;
                  const isHovered = hoveredCandidateId === item.id;
                  const isConfirmed = item.status === 'CONFIRMED';

                  // 3-Stop Confidence Scale
                  let confBadgeClass = 'bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/40';
                  if (item.confidence < 0.4) {
                    confBadgeClass = 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40';
                  } else if (item.confidence < 0.7) {
                    confBadgeClass = 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40';
                  }

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectCandidate(item.id)}
                      onMouseEnter={() => onHoverCandidate && onHoverCandidate(item.id)}
                      onMouseLeave={() => onHoverCandidate && onHoverCandidate(null)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#082830] text-[#00D4AA] font-bold'
                          : isHovered
                          ? 'bg-[#0A1E30] text-[#E0F7F4]'
                          : 'text-[#E0F7F4] hover:bg-[#0A1E30]'
                      }`}
                    >
                      <td className="py-1 px-1.5 font-bold flex items-center gap-1">
                        {isSelected && <span className="text-[#00D4AA]">▶</span>}
                        <span>{item.id}</span>
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono">
                        <span className={`px-1 py-0.2 border text-[8px] font-bold ${confBadgeClass}`}>
                          {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono text-[#4A8090]">
                        {item.aspectRatio.toFixed(1)}
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono text-[#4A8090]">
                        {item.shadowLengthM}m
                      </td>
                      <td className="py-1 px-1.5 text-right">
                        <span
                          className={`text-[7.5px] px-1 py-0.2 font-bold ${
                            isConfirmed
                              ? 'bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/40'
                              : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Candidate Focused Dossier */}
        {selectedCandidate && (
          <div className="p-2.5 bg-[#0A1E30] border border-[#0D2E4A] text-[8.5px] space-y-1">
            <div className="flex items-center justify-between text-[#00D4AA] font-bold">
              <span>TARGET DOSSIER: {selectedCandidate.id}</span>
              <span>{selectedCandidate.dimensions}</span>
            </div>
            <p className="text-[#E0F7F4]">
              Class: <strong className="text-[#00D4AA]">{selectedCandidate.class}</strong>
            </p>
            {selectedCandidate.rejectReason && (
              <p className="text-[#ef4444]">
                Filter Reason: {selectedCandidate.rejectReason}
              </p>
            )}
            <p className="text-[#4A8090]">
              Geotag: {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E (Depth: {selectedCandidate.depthM}m)
            </p>
          </div>
        )}
      </div>

      {/* 6. Event State Strip at Bottom */}
      <div className="p-2 border-t border-[#0D2E4A] bg-[#030B14] text-[8.5px] text-[#4A8090] flex items-center justify-between">
        <span className="truncate">{stage.eventState}</span>
        <span className="text-[#00D4AA] font-bold shrink-0 ml-2">NODE-04 OK</span>
      </div>
    </div>
  );
};
