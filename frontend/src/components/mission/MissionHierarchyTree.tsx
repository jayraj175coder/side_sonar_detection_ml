import React, { useState } from 'react';
import {
  Crosshair,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Layers,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_TARGETS } from '../../data/targets';
import type { MissionTarget } from '../../types';

export const MissionHierarchyTree: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const {
    selectedTargetId,
    setSelectedTargetId,
    setPlaybackTime,
    focusedPanel,
    setFocusedPanel,
    activeTargets,
  } = useMission();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH' | 'FILTERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const targetList = activeTargets && activeTargets.length > 0 ? activeTargets : MISSION_TARGETS;

  const totalDetections = targetList.length;
  const highPriorityCount = targetList.filter((t) => t.risk === 'CRITICAL' || t.risk === 'HIGH').length;
  const filteredCount = targetList.filter((t) => t.uncertaintyRating.includes('FILTERED') || t.confidence < 0.4).length;

  const filteredTargets = targetList.filter((t) => {
    const isFilteredOut = t.uncertaintyRating.includes('FILTERED') || t.confidence < 0.4;
    const isHigh = t.risk === 'CRITICAL' || t.risk === 'HIGH';

    if (activeFilter === 'HIGH' && !isHigh) return false;
    if (activeFilter === 'FILTERED' && !isFilteredOut) return false;
    if (activeFilter === 'ALL' && isFilteredOut) return true; // Show all in ALL

    const query = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(query) ||
      t.class.toLowerCase().includes(query) ||
      t.classCode.toLowerCase().includes(query)
    );
  });

  const handleSelectTarget = (target: MissionTarget) => {
    setSelectedTargetId(target.id);
    setPlaybackTime(target.pingTime);
  };

  return (
    <div className="flex flex-col h-full bg-[#081118] border-r border-[#16303B] overflow-hidden select-none font-mono">
      {/* 1. Header with Clean Survey Counts */}
      <div className="p-3.5 border-b border-[#16303B] bg-[#0C171E] shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-[#32E6D1]" />
            <h3 className="text-xs font-black text-[#E4F2F5] tracking-widest uppercase font-sans">
              SURVEY TARGETS
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[9px]">
            <span className="px-1.5 py-0.5 rounded bg-[#32E6D1]/15 text-[#32E6D1] font-bold border border-[#32E6D1]/30">
              {totalDetections} DETECTIONS
            </span>
          </div>
        </div>

        {/* Sub-Header KPI Metric Badges */}
        <div className="flex items-center justify-between text-[10px] text-[#6F8992]">
          <span>4 High Priority</span>
          <span className="text-[#65D391]">20 Filtered Natural</span>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1 pt-1">
          {[
            { id: 'ALL', label: `ALL (${totalDetections})` },
            { id: 'HIGH', label: `HIGH PRIORITY (${highPriorityCount})` },
            { id: 'FILTERED', label: `FILTERED (${filteredCount})` },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id as any)}
              className={`flex-1 py-1 rounded-lg text-[8px] font-bold transition-all cursor-pointer text-center ${
                activeFilter === chip.id
                  ? 'bg-[#32E6D1] text-[#03070B] shadow-[0_0_10px_rgba(50,230,209,0.3)]'
                  : 'bg-[#081118] text-[#6F8992] hover:text-[#E4F2F5] border border-[#16303B]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search Input */}
      <div className="p-2 border-b border-[#16303B]/60 bg-[#081118] shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-[#6F8992] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search debris class, ID, net..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0C171E] border border-[#16303B] rounded-lg pl-7 pr-2.5 py-1.5 text-[10px] text-[#E4F2F5] placeholder-[#6F8992]/60 focus:outline-none focus:border-[#32E6D1]/60 font-mono shadow-inner"
          />
        </div>
      </div>

      {/* 3. Clean Target Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredTargets.map((target) => {
          const isSelected = selectedTargetId === target.id;
          const isFilteredOut = target.uncertaintyRating.includes('FILTERED') || target.confidence < 0.4;
          const isHero = target.id === 'SX-T07';

          return (
            <div
              key={target.id}
              onClick={() => handleSelectTarget(target)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-gradient-to-r from-[#32E6D1]/20 to-[#29B6F6]/10 border-[#32E6D1] shadow-[0_0_15px_rgba(50,230,209,0.2)]'
                  : isFilteredOut
                  ? 'bg-[#0C171E]/40 border-[#16303B]/60 opacity-60 hover:opacity-100'
                  : 'bg-[#0C171E] border-[#16303B] hover:border-[#32E6D1]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#32E6D1] text-[#03070B]'
                        : 'bg-[#081118] text-[#6F8992] border border-[#16303B]'
                    }`}
                  >
                    {target.id}
                  </span>
                  <span className="text-xs font-bold text-[#E4F2F5] truncate max-w-[130px] font-sans">
                    {target.class}
                  </span>
                </div>

                {/* Confidence or Filtered Badge */}
                {isFilteredOut ? (
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#FF5D5D]/15 text-[#FF5D5D] border border-[#FF5D5D]/30">
                    FILTERED
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-extrabold ${
                      target.confidence >= 0.9
                        ? 'text-[#32E6D1]'
                        : target.confidence >= 0.8
                        ? 'text-[#FFB547]'
                        : 'text-[#6F8992]'
                    }`}
                  >
                    {(target.confidence * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Card Meta Subtitle */}
              <div className="flex items-center justify-between text-[9px] text-[#6F8992] mt-1 pt-1 border-t border-[#16303B]/40">
                <span>
                  {target.length}m × {target.width}m · Shadow {target.shadowLength}m
                </span>
                <span className="font-mono">
                  {target.depth.toFixed(1)}m Depth
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
