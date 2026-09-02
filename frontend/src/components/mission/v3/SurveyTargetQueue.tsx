import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface SurveyTargetQueueProps {
  targets: MissionV3Target[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  hoveredTargetId?: string | null;
  onHoverTarget?: (id: string | null) => void;
}

export const SurveyTargetQueue: React.FC<SurveyTargetQueueProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  hoveredTargetId,
  onHoverTarget,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const CATEGORIES = ['ALL', 'DEBRIS', 'GHOST NET', 'FISHING GEAR', 'ANOMALY', 'FILTERED'];

  const filteredTargets = useMemo(() => {
    return targets.filter((t) => {
      const matchesCat =
        selectedCategory === 'ALL'
          ? true
          : selectedCategory === 'FILTERED'
          ? t.status === 'FILTERED'
          : t.category === selectedCategory;

      const matchesSearch =
        searchTerm.trim() === ''
          ? true
          : t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.priority.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [targets, selectedCategory, searchTerm]);

  return (
    <aside className="w-72 lg:w-80 bg-[#05121F] border-r border-[#0D2E4A] flex flex-col font-mono select-none overflow-hidden shrink-0 z-20">
      {/* ── HEADER ── */}
      <div className="p-3.5 border-b border-[#0D2E4A] bg-[#030B14] space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black tracking-wider text-[#E0F7F4] uppercase">
              SURVEY TARGETS
            </h2>
            <div className="text-[10px] text-[#4A8090]">
              {targets.length} DETECTIONS LOGGED
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] rounded-sm shadow-[0_0_8px_rgba(0,212,170,0.15)]">
            QUEUE ACTIVE
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4A8090]" />
          <input
            type="text"
            placeholder="Search targets (e.g. Ghost Net, SX-T07)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-[#0A1E30] border border-[#0D2E4A] text-[10.5px] text-[#E0F7F4] placeholder-[#4A8090] focus:outline-none focus:border-[#00D4AA]/70 rounded-sm"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 text-[8.5px] font-bold border transition-all cursor-pointer rounded-xs ${
                  isActive
                    ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] shadow-[0_0_8px_rgba(0,212,170,0.3)]'
                    : 'bg-[#0A1E30] text-[#4A8090] border-[#0D2E4A] hover:text-[#E0F7F4] hover:border-[#00D4AA]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TARGET LIST ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#0D2E4A]/60 p-2 space-y-1.5">
        {filteredTargets.length === 0 ? (
          <div className="p-6 text-center text-[#4A8090] text-xs">
            No targets match filter.
          </div>
        ) : (
          filteredTargets.map((target) => {
            const isSelected = selectedTargetId === target.id;
            const isHovered = hoveredTargetId === target.id;
            const isFiltered = target.status === 'FILTERED';

            let priorityBadgeClass = 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
            if (target.priority === 'MEDIUM') {
              priorityBadgeClass = 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
            } else if (target.priority === 'LOW') {
              priorityBadgeClass = 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40';
            } else if (target.priority === 'FILTERED') {
              priorityBadgeClass = 'bg-[#4A8090]/20 text-[#4A8090] border-[#4A8090]/40';
            }

            return (
              <div
                key={target.id}
                onClick={() => onSelectTarget(target.id)}
                onMouseEnter={() => onHoverTarget && onHoverTarget(target.id)}
                onMouseLeave={() => onHoverTarget && onHoverTarget(null)}
                className={`p-2.5 border transition-all cursor-pointer rounded-sm relative ${
                  isSelected
                    ? 'bg-[#082830] border-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.2)] text-[#E0F7F4]'
                    : isHovered
                    ? 'bg-[#0A1E30] border-[#1A4E6A] text-[#E0F7F4]'
                    : 'bg-[#030B14] border-[#0D2E4A] text-[#E0F7F4]/90 hover:border-[#00D4AA]/40'
                }`}
              >
                {/* Active selection indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00D4AA]" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#00D4AA]">{target.id}</span>
                    <span className="text-xs font-semibold text-[#E0F7F4]">{target.label}</span>
                  </div>

                  <span className={`text-[8px] font-bold px-1.5 py-0.2 border uppercase rounded-xs ${priorityBadgeClass}`}>
                    {target.priority}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <div className="font-mono">
                    <span className="text-[#4A8090]">CONF: </span>
                    <strong className={isFiltered ? 'text-[#4A8090]' : target.confidence > 0.9 ? 'text-[#00D4AA]' : 'text-[#F59E0B]'}>
                      {(target.confidence * 100).toFixed(1)}%
                    </strong>
                  </div>

                  <div className="text-[#4A8090] font-mono text-[9px]">
                    DEPTH: <span className="text-[#E0F7F4]">{target.depth.toFixed(1)}m</span>
                  </div>
                </div>

                {/* Sub-details: coordinates */}
                <div className="mt-1 text-[8.5px] text-[#4A8090] flex items-center justify-between font-mono">
                  <span>{target.latitude.toFixed(4)}° N, {target.longitude.toFixed(4)}° E</span>
                  {isSelected && (
                    <span className="text-[#00D4AA] flex items-center gap-0.5 font-bold">
                      FOCUSED <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── FOOTER STATUS ── */}
      <div className="p-2 border-t border-[#0D2E4A] bg-[#030B14] text-[9px] text-[#4A8090] flex items-center justify-between">
        <span>SHOWING {filteredTargets.length} TARGETS</span>
        <span className="text-[#00D4AA]">SYNC ACTIVE</span>
      </div>
    </aside>
  );
};
