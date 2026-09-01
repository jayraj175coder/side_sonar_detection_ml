import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { MissionHierarchyTree } from '../components/mission/MissionHierarchyTree';
import { HeroSonarWaterfall } from '../components/mission/HeroSonarWaterfall';
import { ContactInspector } from '../components/mission/ContactInspector';
import { MissionMapPanel } from '../components/mission/MissionMapPanel';
import { SeabedPanel } from '../components/mission/SeabedPanel';
import { MissionTimeline } from '../components/mission/MissionTimeline';
import {
  Activity,
  Layers,
  MapPin,
  Box,
  Scale,
  Sparkles,
  ShieldCheck,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const MissionPage: React.FC = () => {
  const {
    isJudgeMode,
    toggleJudgeMode,
    focusedPanel,
    setFocusedPanel,
    selectedTarget,
    demoStageInfo,
    isDemoRunning,
  } = useMission();

  const [activeCenterTab, setActiveCenterTab] = useState<'sonar' | 'map' | 'seabed'>('sonar');
  const [isLeftListOpen, setIsLeftListOpen] = useState<boolean>(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState<boolean>(true);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#03070B] overflow-hidden select-none font-mono text-xs">
      {/* 1. JUDGE MODE PROMINENT BANNER (When Active) */}
      {isJudgeMode && (
        <div className="bg-gradient-to-r from-[#0C171E] via-[#081118] to-[#0C171E] border-b border-[#FFB547]/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg animate-slide-up">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FFB547]/20 border border-[#FFB547]/40 flex items-center justify-center text-[#FFB547]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#FFB547] uppercase tracking-wider font-sans">
                  JUDGE EVALUATION MODE
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/40">
                  MoES SIH 2026
                </span>
              </div>
              <p className="text-[9px] text-[#6F8992]">
                Automated 900 kHz Sonar Marine Debris & Ghost Net Detection Pipeline
              </p>
            </div>
          </div>

          {/* 6 Large High-Impact SIH Evaluation Metrics */}
          <div className="flex items-center gap-6 text-center">
            <div>
              <span className="text-lg font-extrabold text-[#E4F2F5] font-mono leading-none">17</span>
              <span className="text-[8px] text-[#6F8992] uppercase tracking-wider block mt-0.5">Anomalies</span>
            </div>

            <div className="h-6 w-px bg-[#16303B]" />

            <div>
              <span className="text-lg font-extrabold text-[#FF5D5D] font-mono leading-none">4</span>
              <span className="text-[8px] text-[#FF5D5D] uppercase tracking-wider block mt-0.5 font-bold">High Priority</span>
            </div>

            <div className="h-6 w-px bg-[#16303B]" />

            <div>
              <span className="text-lg font-extrabold text-[#32E6D1] font-mono leading-none">94.7%</span>
              <span className="text-[8px] text-[#32E6D1] uppercase tracking-wider block mt-0.5 font-bold">Top Conf (Net)</span>
            </div>

            <div className="h-6 w-px bg-[#16303B]" />

            <div>
              <span className="text-lg font-extrabold text-[#65D391] font-mono leading-none">20</span>
              <span className="text-[8px] text-[#65D391] uppercase tracking-wider block mt-0.5">Rocks Filtered</span>
            </div>

            <div className="h-6 w-px bg-[#16303B]" />

            <div>
              <span className="text-lg font-extrabold text-[#E4F2F5] font-mono leading-none">12.84</span>
              <span className="text-[8px] text-[#6F8992] uppercase tracking-wider block mt-0.5">km² Mapped</span>
            </div>

            <div className="h-6 w-px bg-[#16303B]" />

            <div>
              <span className="text-lg font-extrabold text-[#29B6F6] font-mono leading-none">10.4</span>
              <span className="text-[8px] text-[#6F8992] uppercase tracking-wider block mt-0.5">ms Latency</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEMO WALKTHROUGH LIVE BANNER (When Running) */}
      {isDemoRunning && (
        <div className="bg-[#0C171E] border-b border-[#32E6D1]/40 px-4 py-1.5 flex items-center justify-between text-xs shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#32E6D1] animate-ping" />
            <span className="text-[10px] font-black text-[#32E6D1] uppercase tracking-wider">
              DEMO STAGE: {demoStageInfo.title}
            </span>
            <span className="text-[9px] text-[#E4F2F5]">
              — {demoStageInfo.caption}
            </span>
          </div>
        </div>
      )}

      {/* 3. MAIN 3-COLUMN LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: Survey Target List (20-25% width) */}
        {isLeftListOpen && (
          <div className="w-64 lg:w-72 h-full shrink-0 border-r border-[#16303B] overflow-hidden">
            <MissionHierarchyTree onCollapse={() => setIsLeftListOpen(false)} />
          </div>
        )}

        {/* CENTER COLUMN: Side-Scan Sonar Viewer / Map / 3D (50-60% width — THE HERO) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#03070B]">
          {/* Sub-Header Instruments Switcher (Clean, minimal) */}
          <div className="h-9 px-4 bg-[#081118] border-b border-[#16303B] flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveCenterTab('sonar')}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCenterTab === 'sonar'
                    ? 'bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/40'
                    : 'text-[#6F8992] hover:text-[#E4F2F5]'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>SIDE-SCAN SONAR MOSAIC</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('map')}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCenterTab === 'map'
                    ? 'bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/40'
                    : 'text-[#6F8992] hover:text-[#E4F2F5]'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>GEOTAGGED MAP</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('seabed')}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCenterTab === 'seabed'
                    ? 'bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/40'
                    : 'text-[#6F8992] hover:text-[#E4F2F5]'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>3D SEAFLOOR</span>
              </button>
            </div>

            {/* Target Geotag Pill */}
            {selectedTarget && (
              <div className="hidden sm:flex items-center gap-2 text-[9px] text-[#6F8992]">
                <span>Target: <strong className="text-[#32E6D1]">{selectedTarget.id}</strong></span>
                <span>·</span>
                <span>{selectedTarget.lat.toFixed(4)}°N, {selectedTarget.lon.toFixed(4)}°E</span>
              </div>
            )}
          </div>

          {/* Main Hero Viewport */}
          <div className="flex-1 overflow-hidden relative">
            {activeCenterTab === 'sonar' && <HeroSonarWaterfall />}
            {activeCenterTab === 'map' && <MissionMapPanel />}
            {activeCenterTab === 'seabed' && <SeabedPanel />}
          </div>
        </div>

        {/* RIGHT COLUMN: Target Intelligence & Evidence (25-30% width) */}
        {isRightInspectorOpen && (
          <div className="w-72 lg:w-84 h-full shrink-0 border-l border-[#16303B] overflow-hidden">
            <ContactInspector onCollapse={() => setIsRightInspectorOpen(false)} />
          </div>
        )}
      </div>

      {/* 4. BOTTOM BAR: SONARX AI PIPELINE + TIMELINE SCRUBBER */}
      <MissionTimeline />
    </div>
  );
};
