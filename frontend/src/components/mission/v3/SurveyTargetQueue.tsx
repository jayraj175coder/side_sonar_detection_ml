import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Target,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { MissionV3Target, PIPELINE_STAGES_V3 } from '../../../data/missionV3Data';

interface SurveyTargetQueueProps {
  targets: MissionV3Target[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  hoveredTargetId?: string | null;
  onHoverTarget?: (id: string | null) => void;
  onFocusHeroTarget?: (id: string) => void;
  currentStageIndex?: number;
  confidenceThreshold?: number;
  onChangeConfidenceThreshold?: (val: number) => void;
}

export const SurveyTargetQueue: React.FC<SurveyTargetQueueProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  hoveredTargetId,
  onHoverTarget,
  onFocusHeroTarget,
  currentStageIndex = 6,
  confidenceThreshold = 40,
  onChangeConfidenceThreshold,
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
      {/* ── 1. PIPELINE STAGES PROGRESSION (SECTION 5 REQUIREMENT) ── */}
      <div className="p-3 border-b border-[#0D2E4A] bg-[#030B14] space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-bold text-[#7C98A6] uppercase tracking-wider">
          <span>AI PIPELINE PROGRESSION</span>
          <span className="text-[#00D4AA] font-bold">
            STAGE 0{currentStageIndex + 1} / 08
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[8.5px]">
          {PIPELINE_STAGES_V3.slice(0, 7).map((stg, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={stg.number}
                className={`px-1.5 py-0.5 rounded-xs flex items-center gap-1 border transition-all ${
                  isCurrent
                    ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA] font-bold shadow-[0_0_8px_rgba(0,212,170,0.2)]'
                    : isDone
                    ? 'bg-[#05121F] border-[#0D2E4A] text-[#E0F7F4]'
                    : 'bg-[#02070D] border-transparent text-[#4A8090]'
                }`}
              >
                <span className={isCurrent ? 'text-[#00D4AA] animate-pulse' : isDone ? 'text-[#00D4AA]' : 'text-[#4A8090]'}>
                  {isDone ? '✓' : isCurrent ? '●' : '○'}
                </span>
                <span className="truncate">{stg.number} {stg.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. DEDICATED ACOUSTIC NOISE FILTER PANEL (SECTION 6 REQUIREMENT) ── */}
      <div className="p-3 border-b border-[#0D2E4A] bg-[#05121F] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-black text-[#E0F7F4] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span>ACOUSTIC NOISE FILTER</span>
          </span>
          <span className="text-[8px] px-1 py-0.2 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs font-bold">
            SHADOW GATE ACTIVE
          </span>
        </div>

        {/* Triage Counts */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="p-1.5 bg-[#030B14] border border-[#0D2E4A] rounded-xs">
            <div className="text-[7.5px] text-[#7C98A6] uppercase">CANDIDATES</div>
            <div className="text-sm font-black text-[#E0F7F4]">8</div>
          </div>
          <div className="p-1.5 bg-[#030B14] border border-[#EF4444]/40 rounded-xs">
            <div className="text-[7.5px] text-[#EF4444] uppercase">REJECTED</div>
            <div className="text-sm font-black text-[#EF4444]">4</div>
          </div>
          <div className="p-1.5 bg-[#030B14] border border-[#00D4AA]/40 rounded-xs">
            <div className="text-[7.5px] text-[#00D4AA] uppercase">CONFIRMED</div>
            <div className="text-sm font-black text-[#00D4AA]">4</div>
          </div>
        </div>

        {/* Filter Reasons & Confirmed Breakdown */}
        <div className="space-y-1 text-[8px] text-[#7C98A6] pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[#EF4444]">✕ Filter Reasons:</span>
            <span>2× low conf · 1× rock · 1× sediment</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#00D4AA]">✓ Confirmed Debris:</span>
            <span>2× Ghost Net · 1× Gear · 1× Debris</span>
          </div>
        </div>

        {/* Interactive Confidence Cutoff Slider */}
        {onChangeConfidenceThreshold && (
          <div className="pt-1 border-t border-[#0D2E4A]/80">
            <div className="flex items-center justify-between text-[8px] mb-1">
              <span className="text-[#7C98A6] font-bold">Confidence Threshold:</span>
              <span className="text-[#00D4AA] font-bold">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="85"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidenceThreshold(Number(e.target.value))}
              className="w-full h-1 bg-[#0A1E30] accent-[#00D4AA] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* ── 3. SEARCH & CATEGORY FILTER ── */}
      <div className="p-2.5 border-b border-[#0D2E4A] bg-[#030B14] space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#4A8090]" />
          <input
            type="text"
            placeholder="Search targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-[#0A1E30] border border-[#0D2E4A] text-[9.5px] text-[#E0F7F4] placeholder-[#4A8090] focus:outline-none focus:border-[#00D4AA]/70 rounded-xs"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-1.5 py-0.5 text-[8px] font-bold border transition-all cursor-pointer rounded-xs ${
                  isActive
                    ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] shadow-[0_0_8px_rgba(0,212,170,0.3)]'
                    : 'bg-[#0A1E30] text-[#7C98A6] border-[#0D2E4A] hover:text-[#E0F7F4]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. TARGET REGISTER CARDS ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#0D2E4A]/60 p-2 space-y-1">
        {filteredTargets.length === 0 ? (
          <div className="p-6 text-center text-[#7C98A6] text-xs">
            No targets match filter.
          </div>
        ) : (
          filteredTargets.map((target) => {
            const isSelected = selectedTargetId === target.id;
            const isHovered = hoveredTargetId === target.id;
            const isFiltered = target.status === 'FILTERED';
            const isGhostNet = target.id === 'SX-T07';

            return (
              <div
                key={target.id}
                onClick={() => onSelectTarget(target.id)}
                onMouseEnter={() => onHoverTarget?.(target.id)}
                onMouseLeave={() => onHoverTarget?.(null)}
                className={`p-2.5 rounded-xs transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#082830] border-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.2)]'
                    : isHovered
                    ? 'bg-[#0A1E30] border-[#00D4AA]/40'
                    : 'bg-[#05121F] border-[#0D2E4A] hover:border-[#0D2E4A]/80'
                } ${isFiltered ? 'opacity-55' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10.5px] font-bold ${isGhostNet ? 'text-[#00D4AA]' : 'text-[#E0F7F4]'}`}>
                        {target.id}
                      </span>
                      <span className="text-[8px] text-[#4A8090]">·</span>
                      <span className="text-[9.5px] text-[#7C98A6] font-semibold">
                        {target.label}
                      </span>
                    </div>
                    <div className="text-[8.5px] text-[#4A8090] mt-0.5">
                      DEPTH: -{target.depth.toFixed(1)}m · SHADOW: {target.shadowLength.toFixed(2)}m
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[8.5px] font-black px-1.5 py-0.2 rounded-xs border uppercase ${
                        isFiltered
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                          : target.priority === 'HIGH'
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50'
                          : target.priority === 'MEDIUM'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                          : 'bg-[#4A8090]/20 text-[#7C98A6] border-[#4A8090]/50'
                      }`}
                    >
                      {isFiltered ? 'FILTERED' : `${(target.confidence * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                {isGhostNet && (
                  <div className="mt-2 pt-2 border-t border-[#00D4AA]/30 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-[#00D4AA] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      FLAGSHIP HAZARD
                    </span>
                    {onFocusHeroTarget && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusHeroTarget('SX-T07');
                        }}
                        className="px-2 py-0.5 bg-[#00D4AA] text-[#030B14] font-black text-[8px] rounded-xs hover:brightness-110 cursor-pointer"
                      >
                        FOCUS HERO
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
