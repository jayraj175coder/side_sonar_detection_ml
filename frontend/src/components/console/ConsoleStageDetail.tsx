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
    <div className="w-80 lg:w-96 bg-[#090e09] border-l border-[#193019] flex flex-col justify-between select-none font-mono text-[11px] shrink-0 overflow-y-auto">
      <div className="p-3 space-y-3 flex-1">
        {/* 1. Header: 0X [STAGE NAME] + Count Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-[#193019]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#dcfce7] tracking-wider uppercase">
              {stage.id} {stage.name}
            </span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 border border-[#4ade80]/60 bg-[#122415] text-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.15)]">
            {stage.countBadge}
          </span>
        </div>

        {/* 2. Metric Row: 3 Stat Tiles — animated count-up on FILTER stage */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* RAW / M1 */}
          <div className={`p-2 border space-y-0.5 transition-all duration-300 ${
            isFilter ? 'border-[#64876b]/60 bg-[#0e130e]' : 'border-[#193019] bg-[#070b07]'
          }`}>
            <span className="text-[7.5px] text-[#64876b] uppercase block truncate font-bold">
              {isFilter ? 'RAW DETECTIONS' : stage.metric1.label}
            </span>
            <strong className="text-xs font-black text-[#dcfce7] block font-mono">
              {isFilter ? animM1 : stage.metric1.value}
            </strong>
          </div>

          {/* REJECTED / M2 */}
          <div className={`p-2 border space-y-0.5 transition-all duration-300 ${
            isFilter ? 'border-[#f59e0b]/50 bg-[#130f05]' : 'border-[#193019] bg-[#070b07]'
          }`}>
            <span className={`text-[7.5px] uppercase block truncate font-bold ${
              isFilter ? 'text-[#f59e0b]' : 'text-[#64876b]'
            }`}>
              {isFilter ? 'REJECTED (NOISE)' : stage.metric2.label}
            </span>
            <strong className={`text-xs font-black block font-mono ${
              isFilter ? 'text-[#f59e0b]' : 'text-[#dcfce7]'
            }`}>
              {isFilter ? animM2 : stage.metric2.value}
            </strong>
          </div>

          {/* CONFIRMED / M3 */}
          <div className={`p-2 border space-y-0.5 transition-all duration-300 ${
            isFilter ? 'border-[#4ade80]/60 bg-[#0e1a0e] shadow-[0_0_10px_rgba(74,222,128,0.12)]' : 'border-[#4ade80]/40 bg-[#0e160e]'
          }`}>
            <span className="text-[7.5px] text-[#4ade80] uppercase block truncate font-bold">
              {isFilter ? 'CONFIRMED DEBRIS' : stage.metric3.label}
            </span>
            <strong className="text-xs font-black text-[#4ade80] block font-mono">
              {isFilter ? animM3 : stage.metric3.value}
            </strong>
          </div>
        </div>

        {/* FILTER STAGE: visual funnel arrow row */}
        {isFilter && (
          <div className="flex items-center justify-center gap-1 text-[8px] text-[#64876b] font-mono py-1">
            <span className="text-[#dcfce7]">{animM1} raw</span>
            <span className="text-[#3d5843]">&gt;</span>
            <span className="text-[#f59e0b]">{animM2} rejected</span>
            <span className="text-[#3d5843]">&gt;</span>
            <span className="text-[#4ade80] font-bold">{animM3} confirmed</span>
          </div>
        )}

        {/* 3. Explanation Paragraph (Plain language stating what filter/rule does the work) */}
        <div className="p-2.5 bg-[#0e160e] border border-[#193019] text-[10px] text-[#64876b] leading-relaxed">
          <p className="text-[#dcfce7]/90">{stage.explanation}</p>
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
          <div className="flex items-center justify-between text-[8.5px] text-[#64876b] font-bold uppercase tracking-wider">
            <span>CANDIDATE REGISTER</span>
            <span>{candidates.length} CANDIDATES</span>
          </div>

          <div className="border border-[#193019] bg-[#070b07] overflow-hidden">
            <table className="w-full text-[9px] text-left">
              <thead className="bg-[#0e160e] text-[#64876b] border-b border-[#193019]">
                <tr>
                  <th className="py-1 px-1.5 font-normal">ID</th>
                  <th className="py-1 px-1.5 font-normal text-right">CONF</th>
                  <th className="py-1 px-1.5 font-normal text-right">ASPECT</th>
                  <th className="py-1 px-1.5 font-normal text-right">SHADOW</th>
                  <th className="py-1 px-1.5 font-normal text-right">VERDICT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#193019]">
                {candidates.map((item) => {
                  const isSelected = selectedCandidateId === item.id;
                  const isHovered = hoveredCandidateId === item.id;
                  const isConfirmed = item.status === 'CONFIRMED';

                  // 3-Stop Confidence Scale
                  let confBadgeClass = 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/40';
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
                          ? 'bg-[#122415] text-[#4ade80] font-bold'
                          : isHovered
                          ? 'bg-[#0e160e] text-[#dcfce7]'
                          : 'text-[#dcfce7] hover:bg-[#0e160e]'
                      }`}
                    >
                      <td className="py-1 px-1.5 font-bold flex items-center gap-1">
                        {isSelected && <span className="text-[#4ade80]">▶</span>}
                        <span>{item.id}</span>
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono">
                        <span className={`px-1 py-0.2 border text-[8px] font-bold ${confBadgeClass}`}>
                          {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono text-[#64876b]">
                        {item.aspectRatio.toFixed(1)}
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono text-[#64876b]">
                        {item.shadowLengthM}m
                      </td>
                      <td className="py-1 px-1.5 text-right">
                        <span
                          className={`text-[7.5px] px-1 py-0.2 font-bold ${
                            isConfirmed
                              ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40'
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
          <div className="p-2.5 bg-[#0e160e] border border-[#193019] text-[8.5px] space-y-1">
            <div className="flex items-center justify-between text-[#4ade80] font-bold">
              <span>TARGET DOSSIER: {selectedCandidate.id}</span>
              <span>{selectedCandidate.dimensions}</span>
            </div>
            <p className="text-[#dcfce7]">
              Class: <strong className="text-[#4ade80]">{selectedCandidate.class}</strong>
            </p>
            {selectedCandidate.rejectReason && (
              <p className="text-[#ef4444]">
                Filter Reason: {selectedCandidate.rejectReason}
              </p>
            )}
            <p className="text-[#64876b]">
              Geotag: {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E (Depth: {selectedCandidate.depthM}m)
            </p>
          </div>
        )}
      </div>

      {/* 6. Event State Strip at Bottom */}
      <div className="p-2 border-t border-[#193019] bg-[#070b07] text-[8.5px] text-[#64876b] flex items-center justify-between">
        <span className="truncate">{stage.eventState}</span>
        <span className="text-[#4ade80] font-bold shrink-0 ml-2">NODE-04 OK</span>
      </div>
    </div>
  );
};
