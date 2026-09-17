import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  const [isPipelineExpanded, setIsPipelineExpanded] = useState<boolean>(false);

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
    <aside className="w-64 xl:w-72 bg-[#080D17] border-r border-[#162136] flex flex-col font-sans select-none overflow-hidden shrink-0 z-20">
      {/* ── 1. PIPELINE STAGES PROGRESSION (COLLAPSIBLE) ── */}
      <div className="border-b border-[#162136] bg-[#05070B]">
        <button
          onClick={() => setIsPipelineExpanded(!isPipelineExpanded)}
          className="w-full p-2.5 flex items-center justify-between text-[9px] font-bold text-[#94A3B8] hover:text-[#F8FAFC] uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span>PIPELINE:</span>
            <span className="text-[#FFB703]">
              STAGE 0{currentStageIndex + 1} ({PIPELINE_STAGES_V3[currentStageIndex]?.name || 'COMPLETE'})
            </span>
          </div>
          <div className="flex items-center gap-1 text-[8px] text-[#94A3B8]">
            {isPipelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {isPipelineExpanded && (
          <div className="px-3 pb-2.5 space-y-1.5 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-1 text-[8.5px]">
              {PIPELINE_STAGES_V3.slice(0, 7).map((stg, idx) => {
                const isDone = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={stg.number}
                    className={`px-1.5 py-0.5 rounded flex items-center gap-1 border transition-all ${
                      isCurrent
                        ? 'bg-[#131B2A] border-[#FFB703] text-[#FFB703] font-bold shadow-[0_0_8px_rgba(255, 183, 3, )]'
                        : isDone
                        ? 'bg-[#080D17] border-[#162136] text-[#F8FAFC]'
                        : 'bg-[#02070D] border-transparent text-[#94A3B8]'
                    }`}
                  >
                    <span className={isCurrent ? 'text-[#FFB703] animate-pulse' : isDone ? 'text-[#FFB703]' : 'text-[#94A3B8]'}>
                      {isDone ? '✓' : isCurrent ? '●' : '○'}
                    </span>
                    <span className="truncate">{stg.number} {stg.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. DEDICATED ACOUSTIC NOISE FILTER PANEL (SECTION 6 REQUIREMENT) ── */}
      <div className="p-3 border-b border-[#162136] bg-[#080D17] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-black text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>ACOUSTIC NOISE FILTER</span>
          </span>
          <span className="text-[8px] px-1 py-0.2 bg-[#131B2A] text-[#FFB703] border border-[#FFB703]/40 rounded-xs font-bold">
            SHADOW GATE ACTIVE
          </span>
        </div>

        {/* Triage Counts */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="p-1.5 bg-[#05070B] border border-[#162136] rounded-xs">
            <div className="text-[7.5px] text-[#94A3B8] uppercase">CANDIDATES</div>
            <div className="text-sm font-black text-[#F8FAFC]">8</div>
          </div>
          <div className="p-1.5 bg-[#05070B] border border-[#EF4444]/40 rounded-xs">
            <div className="text-[7.5px] text-[#EF4444] uppercase">REJECTED</div>
            <div className="text-sm font-black text-[#EF4444]">4</div>
          </div>
          <div className="p-1.5 bg-[#05070B] border border-[#FFB703]/40 rounded-xs">
            <div className="text-[7.5px] text-[#FFB703] uppercase">CONFIRMED</div>
            <div className="text-sm font-black text-[#FFB703]">4</div>
          </div>
        </div>

        {/* Filter Reasons & Confirmed Breakdown */}
        <div className="space-y-1 text-[8px] text-[#94A3B8] pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[#EF4444]">✕ Filter Reasons:</span>
            <span>2× low conf · 1× rock · 1× sediment</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#FFB703]">✓ Confirmed Debris:</span>
            <span>2× Ghost Net · 1× Gear · 1× Debris</span>
          </div>
        </div>

        {/* Interactive Confidence Cutoff Slider */}
        {onChangeConfidenceThreshold && (
          <div className="pt-1 border-t border-[#162136]/80">
            <div className="flex items-center justify-between text-[8px] mb-1">
              <span className="text-[#94A3B8] font-bold">Confidence Threshold:</span>
              <span className="text-[#FFB703] font-bold">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="85"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidenceThreshold(Number(e.target.value))}
              className="w-full h-1 bg-[#0A1E30] accent-[#FFB703] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* ── 3. SEARCH & CATEGORY FILTER ── */}
      <div className="p-2.5 border-b border-[#162136] bg-[#05070B] space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-[#0A1E30] border border-[#162136] text-[9.5px] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#FFB703]/70 rounded-xs"
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
                    ? 'bg-[#FFB703] text-[#05070B] border-[#FFB703] shadow-[0_0_8px_rgba(255, 183, 3, )]'
                    : 'bg-[#0A1E30] text-[#94A3B8] border-[#162136] hover:text-[#F8FAFC]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. TARGET REGISTER CARDS ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#162136]/60 p-2 space-y-1">
        {filteredTargets.length === 0 ? (
          <div className="p-6 text-center text-[#94A3B8] text-xs">
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
                    ? 'bg-[#131B2A] border-[#FFB703] shadow-[0_0_12px_rgba(255, 183, 3, )]'
                    : isHovered
                    ? 'bg-[#0A1E30] border-[#FFB703]/40'
                    : 'bg-[#080D17] border-[#162136] hover:border-[#162136]/80'
                } ${isFiltered ? 'opacity-55' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10.5px] font-bold ${isGhostNet ? 'text-[#FFB703]' : 'text-[#F8FAFC]'}`}>
                        {target.id}
                      </span>
                      <span className="text-[8px] text-[#94A3B8]">·</span>
                      <span className="text-[9.5px] text-[#94A3B8] font-semibold">
                        {target.label}
                      </span>
                    </div>
                    <div className="text-[8.5px] text-[#94A3B8] mt-0.5">
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
                          : 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/50'
                      }`}
                    >
                      {isFiltered ? 'FILTERED' : `${(target.confidence * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                {isGhostNet && (
                  <div className="mt-2 pt-2 border-t border-[#FFB703]/30 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-[#FFB703] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      FLAGSHIP HAZARD
                    </span>
                    {onFocusHeroTarget && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusHeroTarget('SX-T07');
                        }}
                        className="px-2 py-0.5 bg-[#FFB703] text-[#05070B] font-black text-[8px] rounded-xs hover:brightness-110 cursor-pointer"
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
