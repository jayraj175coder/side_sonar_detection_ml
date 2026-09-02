import React from 'react';
import { AlertTriangle, CheckCircle2, Sliders, ShieldCheck, Download, Filter } from 'lucide-react';
import { STAGE_DETAILS, StageId, CandidateItem } from '../../data/consoleData';

interface ConsoleStageDetailProps {
  currentStageId: StageId;
  candidates: CandidateItem[];
  filteredCandidates: CandidateItem[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  hoveredCandidateId?: string | null;
  onHoverCandidate?: (id: string | null) => void;
  confidenceThreshold: number;
  onChangeConfidenceThreshold: (val: number) => void;
  selectedCategory: string;
  onChangeCategory: (cat: string) => void;
  shadowFilterEnabled: boolean;
  onToggleShadowFilter: () => void;
  rawCount: number;
  rejectedCount: number;
  confirmedCount: number;
}

export const ConsoleStageDetail: React.FC<ConsoleStageDetailProps> = ({
  currentStageId,
  candidates,
  filteredCandidates,
  selectedCandidateId,
  onSelectCandidate,
  hoveredCandidateId,
  onHoverCandidate,
  confidenceThreshold,
  onChangeConfidenceThreshold,
  selectedCategory,
  onChangeCategory,
  shadowFilterEnabled,
  onToggleShadowFilter,
  rawCount,
  rejectedCount,
  confirmedCount,
}) => {
  const stage = STAGE_DETAILS[currentStageId] || STAGE_DETAILS['01'];
  const isFilter = currentStageId === '04';

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) ||
    filteredCandidates[0] ||
    candidates[0];

  const handleExportSingleTarget = (cand: CandidateItem) => {
    const payload = {
      target_id: cand.id,
      classification: cand.class,
      confidence_score: cand.confidence,
      aspect_ratio: cand.aspectRatio,
      acoustic_shadow_relief_m: cand.shadowLengthM,
      depth_m: cand.depthM,
      dimensions: cand.dimensions,
      status: cand.status,
      reject_reason: cand.rejectReason || null,
      wgs84_coordinates: { latitude: cand.lat, longitude: cand.lon },
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TARGET_${cand.id}_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CATEGORY_TABS = [
    { id: 'ALL',     label: 'ALL' },
    { id: 'NETS',    label: 'NETS' },
    { id: 'TRAWL',   label: 'TRAWL' },
    { id: 'PIPES',   label: 'PIPES' },
    { id: 'BARRELS', label: 'BARRELS' },
    { id: 'NOISE',   label: 'NOISE' },
  ];

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
          <span className="text-[9px] font-bold px-2 py-0.5 border border-[#00D4AA]/60 bg-[#082830] text-[#00D4AA] shadow-[0_0_10px_rgba(0,212,170,0.2)]">
            {stage.countBadge}
          </span>
        </div>

        {/* 2. Dynamic Metric Row: 3 Stat Tiles */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* RAW / M1 */}
          <div className="p-2 border border-[#0D2E4A] bg-[#030B14] space-y-0.5 transition-all">
            <span className="text-[7.5px] text-[#4A8090] uppercase block truncate font-bold">
              RAW DETECTIONS
            </span>
            <strong className="text-xs font-black text-[#E0F7F4] block font-mono">
              {rawCount}
            </strong>
          </div>

          {/* REJECTED / M2 */}
          <div className="p-2 border border-[#f59e0b]/50 bg-[#0D1A08] space-y-0.5 transition-all">
            <span className="text-[7.5px] text-[#f59e0b] uppercase block truncate font-bold">
              REJECTED (NOISE)
            </span>
            <strong className="text-xs font-black text-[#f59e0b] block font-mono">
              {rejectedCount}
            </strong>
          </div>

          {/* CONFIRMED / M3 */}
          <div className="p-2 border border-[#00D4AA]/60 bg-[#083040] space-y-0.5 transition-all shadow-[0_0_10px_rgba(0,212,170,0.12)]">
            <span className="text-[7.5px] text-[#00D4AA] uppercase block truncate font-bold">
              CONFIRMED DEBRIS
            </span>
            <strong className="text-xs font-black text-[#00D4AA] block font-mono">
              {confirmedCount}
            </strong>
          </div>
        </div>

        {/* Funnel ratio indicator */}
        <div className="flex items-center justify-between px-1 text-[8px] text-[#4A8090] font-mono">
          <span>FUNNEL EFFICIENCY:</span>
          <span className="text-[#00D4AA] font-bold">
            {rawCount > 0 ? `${((confirmedCount / rawCount) * 100).toFixed(0)}% RECOVERY YIELD` : '0%'}
          </span>
        </div>

        {/* 3. DYNAMIC INTERACTIVE FILTER ENGINE PANEL */}
        <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-[#0D2E4A]/80">
            <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-[#00D4AA] uppercase tracking-wider">
              <Sliders className="w-3 h-3 text-[#00D4AA]" />
              <span>DYNAMIC FILTER ENGINE</span>
            </div>
            <span className="text-[7.5px] text-[#4A8090]">LIVE ADJUST</span>
          </div>

          {/* Slider: Confidence Cutoff */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] font-bold">
              <span className="text-[#4A8090]">CONFIDENCE THRESHOLD:</span>
              <span className="text-[#00D4AA] font-mono">{(confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#0A1E30] rounded-none appearance-none cursor-pointer accent-[#00D4AA]"
            />
            <div className="flex justify-between text-[7px] text-[#2A5060]">
              <span>15% (Permissive)</span>
              <span>50%</span>
              <span>95% (Strict)</span>
            </div>
          </div>

          {/* Shadow Verification Gate Toggle */}
          <div
            onClick={onToggleShadowFilter}
            className="flex items-center justify-between p-1.5 bg-[#0A1E30] border border-[#0D2E4A] cursor-pointer hover:border-[#00D4AA]/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-[8px]">
              <ShieldCheck className={`w-3 h-3 ${shadowFilterEnabled ? 'text-[#00D4AA]' : 'text-[#4A8090]'}`} />
              <span className={shadowFilterEnabled ? 'text-[#E0F7F4]' : 'text-[#4A8090]'}>
                ACOUSTIC SHADOW VERIFICATION
              </span>
            </div>
            <span className={`text-[8px] font-bold ${shadowFilterEnabled ? 'text-[#00D4AA]' : 'text-[#2A5060]'}`}>
              {shadowFilterEnabled ? 'ACTIVE' : 'BYPASSED'}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[7.5px] text-[#4A8090] font-bold uppercase">
              <Filter className="w-2.5 h-2.5" />
              <span>TAXONOMY FILTER:</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onChangeCategory(tab.id)}
                    className={`py-0.5 text-[7.5px] font-bold border transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA]'
                        : 'bg-[#0A1E30] text-[#4A8090] border-[#0D2E4A] hover:text-[#E0F7F4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Candidate Register with 3-Stop Confidence Colors */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8.5px] text-[#4A8090] font-bold uppercase tracking-wider">
            <span>CANDIDATE REGISTER</span>
            <span>{filteredCandidates.length} OF {candidates.length} SHOWING</span>
          </div>

          <div className="border border-[#0D2E4A] bg-[#030B14] overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-[9px] text-left">
              <thead className="bg-[#0A1E30] text-[#4A8090] border-b border-[#0D2E4A] sticky top-0 z-10">
                <tr>
                  <th className="py-1 px-1.5 font-normal">ID</th>
                  <th className="py-1 px-1.5 font-normal text-right">CONF</th>
                  <th className="py-1 px-1.5 font-normal text-right">ASPECT</th>
                  <th className="py-1 px-1.5 font-normal text-right">SHADOW</th>
                  <th className="py-1 px-1.5 font-normal text-right">VERDICT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0D2E4A]">
                {filteredCandidates.map((item) => {
                  const isSelected = selectedCandidateId === item.id;
                  const isHovered = hoveredCandidateId === item.id;
                  const isConfirmed = item.status === 'CONFIRMED';

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

        {/* 5. Selected Candidate Focused Dossier */}
        {selectedCandidate && (
          <div className="p-2.5 bg-[#0A1E30] border border-[#0D2E4A] text-[8.5px] space-y-1.5">
            <div className="flex items-center justify-between text-[#00D4AA] font-bold">
              <span>TARGET DOSSIER: {selectedCandidate.id}</span>
              <span className="text-[#E0F7F4]">{selectedCandidate.dimensions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#4A8090]">CLASSIFICATION:</span>
              <strong className="text-[#00D4AA]">{selectedCandidate.class}</strong>
            </div>
            {selectedCandidate.rejectReason ? (
              <div className="p-1.5 bg-[#140808] border border-[#ef4444]/40 text-[#ef4444] text-[8px]">
                <strong>FILTER RATIONALE:</strong> {selectedCandidate.rejectReason}
              </div>
            ) : (
              <div className="p-1.5 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] text-[8px] flex items-center justify-between">
                <span>VERDICT: CONFIRMED DEBRIS</span>
                <span>ASPECT {selectedCandidate.aspectRatio.toFixed(1)} · SHADOW {selectedCandidate.shadowLengthM}m</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[#4A8090] text-[8px]">
              <span>GEOTAG: {selectedCandidate.lat.toFixed(4)}°N, {selectedCandidate.lon.toFixed(4)}°E</span>
              <span>DEPTH: {selectedCandidate.depthM}m</span>
            </div>
            <button
              onClick={() => handleExportSingleTarget(selectedCandidate)}
              className="w-full flex items-center justify-center gap-1.5 py-1 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#00D4AA] text-[8px] font-bold cursor-pointer transition-colors"
            >
              <Download className="w-2.5 h-2.5" />
              <span>EXPORT SINGLE TARGET DOSSIER (JSON)</span>
            </button>
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
