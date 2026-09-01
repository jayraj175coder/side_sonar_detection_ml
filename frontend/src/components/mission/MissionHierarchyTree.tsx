import React, { useState } from 'react';
import {
  FolderTree,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Radio,
  Search,
  Layers,
  Compass,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DATA } from '../../data/mission';
import { MISSION_TARGETS } from '../../data/targets';
import type { Trackline, MissionTarget } from '../../types';

export const MissionHierarchyTree: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const {
    selectedTargetId,
    setSelectedTargetId,
    setPlaybackTime,
    playbackTime,
    visibleTargetIds,
    focusedPanel,
    setFocusedPanel,
    activeTargets,
  } = useMission();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    mission: true,
    'LINE-01': true,
    'LINE-02': true,
    'LINE-03': true,
    'LINE-04': true,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSelectTarget = (target: MissionTarget) => {
    setSelectedTargetId(target.id === selectedTargetId ? null : target.id);
    setPlaybackTime(target.pingTime);
  };

  const filteredTargets = activeTargets.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.classCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#10151D] border-r border-[#1B2330] overflow-hidden select-none font-mono">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#1B2330] bg-[#080B11] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FolderTree className="w-3.5 h-3.5 text-[#4CD9E8]" />
          <span className="text-[10px] font-black text-[#EAEFF5] uppercase tracking-widest">
            SURVEY HIERARCHY
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'tree' ? null : 'tree')}
            className={`p-1 rounded border transition-colors cursor-pointer ${
              focusedPanel === 'tree'
                ? 'bg-[#4CD9E8]/20 border-[#4CD9E8] text-[#4CD9E8]'
                : 'bg-[#161C26] border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8]'
            }`}
            title={focusedPanel === 'tree' ? 'Exit Focus View' : 'Expand Tree to Full Focus'}
          >
            {focusedPanel === 'tree' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse tree to left"
              className="p-1 rounded bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-[#1B2330]/60 bg-[#080B11]/70 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-[#7C8AA0] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter line or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080B11] border border-[#1B2330] rounded-lg pl-7 pr-2 py-1 text-[9px] text-[#EAEFF5] placeholder-[#7C8AA0] focus:outline-none focus:border-[#4CD9E8]/50"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Mission Root Node */}
        <div className="space-y-1">
          <div
            onClick={() => toggleNode('mission')}
            className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {expandedNodes['mission'] ? (
                <ChevronDown className="w-3 h-3 text-[#4CD9E8] shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#7C8AA0] shrink-0" />
              )}
              <Radio className="w-3 h-3 text-[#4CD9E8] shrink-0 animate-pulse" />
              <span className="text-[10px] font-bold text-[#EAEFF5] truncate">
                {MISSION_DATA.id} · {MISSION_DATA.name}
              </span>
            </div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4CD9E8]/10 text-[#4CD9E8] border border-[#4CD9E8]/30 shrink-0">
              4 LINES
            </span>
          </div>

          {/* Tracklines Sub-Tree */}
          {expandedNodes['mission'] && (
            <div className="pl-3 space-y-1.5 border-l border-[#1B2330]/60 ml-2 mt-1">
              {MISSION_DATA.tracklines.map((line) => {
                const lineTargets = filteredTargets.filter((t) =>
                  line.targetIds.includes(t.id)
                );
                const isLineOpen = expandedNodes[line.id] ?? false;

                return (
                  <div key={line.id} className="space-y-1">
                    {/* Trackline Header Node */}
                    <div
                      onClick={() => toggleNode(line.id)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isLineOpen
                          ? 'bg-[#161C26] border-[#1B2330] text-[#EAEFF5]'
                          : 'bg-[#080B11] border-[#1B2330]/60 text-[#7C8AA0] hover:border-[#4CD9E8]/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isLineOpen ? (
                          <ChevronDown className="w-3 h-3 text-[#29B6F6] shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-[#7C8AA0] shrink-0" />
                        )}
                        <Compass className="w-3 h-3 text-[#29B6F6] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-[#EAEFF5] truncate">
                            {line.id}
                          </p>
                          <p className="text-[8px] text-[#7C8AA0] truncate">
                            HDG {line.heading}° · {line.lengthKm} km
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] px-1 rounded bg-[#1B2330] text-[#7C8AA0] shrink-0">
                        {lineTargets.length}
                      </span>
                    </div>

                    {/* Contacts Node List */}
                    {isLineOpen && (
                      <div className="pl-2.5 space-y-1 border-l border-[#1B2330]/50 ml-2 mt-0.5">
                        {lineTargets.length === 0 ? (
                          <p className="text-[8px] text-[#7C8AA0] py-1 italic">
                            No contacts on this pass
                          </p>
                        ) : (
                          lineTargets.map((target) => {
                            const isSelected = selectedTargetId === target.id;

                            return (
                              <button
                                key={target.id}
                                onClick={() => handleSelectTarget(target)}
                                className={`w-full flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                                  isSelected
                                    ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/50 shadow-[0_0_10px_rgba(76,217,232,0.15)] text-[#4CD9E8]'
                                    : 'bg-[#080B11]/70 border-[#1B2330]/60 text-[#EAEFF5] hover:border-[#4CD9E8]/40'
                                }`}
                              >
                                <div className="min-w-0 pr-1">
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ background: isSelected ? '#4CD9E8' : '#7C8AA0' }}
                                    />
                                    <span className="text-[9px] font-black truncate">
                                      {target.id}
                                    </span>
                                    <span className="text-[8px] px-1 rounded bg-[#161C26] border border-[#1B2330] text-[#7C8AA0]">
                                      {target.classCode}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[8px] text-[#7C8AA0] mt-0.5">
                                    <span>
                                      {target.acrossTrackMeters < 0
                                        ? `${Math.abs(target.acrossTrackMeters)}m P`
                                        : `${target.acrossTrackMeters}m S`}
                                    </span>
                                    <span>·</span>
                                    <span>{target.depth}m</span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[9px] font-bold text-[#4CD9E8]">
                                    {(target.confidence * 100).toFixed(0)}%
                                  </span>
                                  <p
                                    className={`text-[7px] uppercase font-bold ${
                                      target.uncertaintyRating === 'LOW AMBIGUITY'
                                        ? 'text-[#3FD98A]'
                                        : target.uncertaintyRating ===
                                          'MODERATE UNCERTAINTY'
                                        ? 'text-[#F5A623]'
                                        : 'text-[#F04438]'
                                    }`}
                                  >
                                    {target.uncertaintyRating.split(' ')[0]}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats summary */}
      <div className="p-2.5 border-t border-[#1B2330] bg-[#080B11] text-[8px] text-[#7C8AA0] space-y-1 shrink-0">
        <div className="flex items-center justify-between">
          <span>CONTACTS LOGGED:</span>
          <span className="font-bold text-[#EAEFF5]">
            {MISSION_TARGETS.length} TOTAL
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>AMBIGUOUS CONTACTS:</span>
          <span className="font-bold text-[#F5A623]">
            {
              MISSION_TARGETS.filter(
                (t) => t.uncertaintyRating === 'HIGH UNCERTAINTY'
              ).length
            }{' '}
            FLAGGED
          </span>
        </div>
      </div>
    </div>
  );
};
