import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { MissionTopBar } from '../components/mission/MissionTopBar';
import { GuidedWalkthroughBar } from '../components/mission/GuidedWalkthroughBar';
import { MissionHierarchyTree } from '../components/mission/MissionHierarchyTree';
import { HeroSonarWaterfall } from '../components/mission/HeroSonarWaterfall';
import { ContactInspector } from '../components/mission/ContactInspector';
import { AcousticTelemetryPanel } from '../components/mission/AcousticTelemetryPanel';
import { MissionMapPanel } from '../components/mission/MissionMapPanel';
import { SeabedPanel } from '../components/mission/SeabedPanel';
import { MissionTimeline } from '../components/mission/MissionTimeline';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Map as MapIcon,
  Box,
  Radio,
  Activity,
  Zap,
} from 'lucide-react';

export const MissionPage: React.FC = () => {
  const { missionStatus, isDemoRunning, launchDemo } = useMission();
  const [isLeftTreeOpen, setIsLeftTreeOpen] = useState<boolean>(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState<boolean>(true);
  const [bottomWorkspaceTab, setBottomWorkspaceTab] = useState<'split' | 'signals' | 'map' | 'seabed'>('split');

  return (
    <div
      className="flex flex-col h-screen bg-[#080B11] overflow-hidden relative select-none font-mono"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* 1. Glanceable Control Room Top Bar (Open MCT Convention) */}
      <MissionTopBar
        isLeftOpen={isLeftTreeOpen}
        onToggleLeft={() => setIsLeftTreeOpen(!isLeftTreeOpen)}
        isRightOpen={isRightInspectorOpen}
        onToggleRight={() => setIsRightInspectorOpen(!isRightInspectorOpen)}
      />

      {/* 2. Guided Walkthrough Stepper Bar (When Walkthrough is Active or Complete) */}
      <GuidedWalkthroughBar />

      {/* Floating Left Tree Expander Tab (When Collapsed) */}
      {!isLeftTreeOpen && (
        <button
          onClick={() => setIsLeftTreeOpen(true)}
          title="Show Survey & Tracklines Tree"
          className="absolute top-1/2 left-0 -translate-y-1/2 z-40 bg-[#10151D] border border-l-0 border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] py-4 px-1.5 rounded-r-xl shadow-2xl flex flex-col items-center gap-2 group transition-all"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[8px] font-bold tracking-widest uppercase text-[#7C8AA0] group-hover:text-[#4CD9E8]">
            SURVEY TREE
          </span>
        </button>
      )}

      {/* Floating Right Inspector Expander Tab (When Collapsed) */}
      {!isRightInspectorOpen && (
        <button
          onClick={() => setIsRightInspectorOpen(true)}
          title="Show Contact Inspector & Evidence"
          className="absolute top-1/2 right-0 -translate-y-1/2 z-40 bg-[#10151D] border border-r-0 border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] py-4 px-1.5 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 group transition-all"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[8px] font-bold tracking-widest uppercase text-[#7C8AA0] group-hover:text-[#4CD9E8]">
            INSPECTOR
          </span>
        </button>
      )}

      {/* 3. Main Instrument Grid */}
      <div
        className="flex-1 grid overflow-hidden transition-all duration-300 relative"
        style={{
          gridTemplateColumns: `${isLeftTreeOpen ? '250px' : '0px'} 1fr ${
            isRightInspectorOpen ? '280px' : '0px'
          }`,
          gridTemplateRows: '1fr 1fr',
        }}
      >
        {/* Left Rail: Navigable Survey Tree (Missions → Tracklines → Contacts) */}
        <div
          className={`row-span-2 overflow-hidden transition-all duration-300 ${
            !isLeftTreeOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <MissionHierarchyTree onCollapse={() => setIsLeftTreeOpen(false)} />
        </div>

        {/* Center Top: The Hero Scrolling Side-Scan Waterfall & Mosaic Display */}
        <div className="border-b border-[#1B2330] overflow-hidden relative">
          <HeroSonarWaterfall />
        </div>

        {/* Right Rail: Contact Inspector (Cropped Snippet, Range, Qualitative Uncertainty) */}
        <div
          className={`row-span-2 overflow-hidden transition-all duration-300 ${
            !isRightInspectorOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ContactInspector onCollapse={() => setIsRightInspectorOpen(false)} />
        </div>

        {/* Center Bottom: Composable Hydrographic Workspace */}
        <div className="flex flex-col overflow-hidden bg-[#080B11]">
          {/* Workspace Tabs Header */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#10151D] border-b border-[#1B2330] shrink-0 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="text-[#7C8AA0] uppercase tracking-widest mr-1">
                INSTRUMENTS:
              </span>

              <button
                onClick={() => setBottomWorkspaceTab('split')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomWorkspaceTab === 'split'
                    ? 'bg-[#4CD9E8]/15 text-[#4CD9E8] border-[#4CD9E8]/40'
                    : 'bg-[#161C26] text-[#7C8AA0] border-[#1B2330]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>3-WAY CONSOLE</span>
              </button>

              <button
                onClick={() => setBottomWorkspaceTab('signals')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomWorkspaceTab === 'signals'
                    ? 'bg-[#4CD9E8]/15 text-[#4CD9E8] border-[#4CD9E8]/40'
                    : 'bg-[#161C26] text-[#7C8AA0] border-[#1B2330]'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>SIGNAL CHANNELS</span>
              </button>

              <button
                onClick={() => setBottomWorkspaceTab('map')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomWorkspaceTab === 'map'
                    ? 'bg-[#4CD9E8]/15 text-[#4CD9E8] border-[#4CD9E8]/40'
                    : 'bg-[#161C26] text-[#7C8AA0] border-[#1B2330]'
                }`}
              >
                <MapIcon className="w-3 h-3" />
                <span>USBL GEO MAP</span>
              </button>

              <button
                onClick={() => setBottomWorkspaceTab('seabed')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomWorkspaceTab === 'seabed'
                    ? 'bg-[#4CD9E8]/15 text-[#4CD9E8] border-[#4CD9E8]/40'
                    : 'bg-[#161C26] text-[#7C8AA0] border-[#1B2330]'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>3D BATHYMETRY</span>
              </button>
            </div>

            <span className="text-[#7C8AA0] hidden md:inline text-[8px]">
              HYDROGRAPHIC PING BUFFER · SX-014
            </span>
          </div>

          {/* Sub-Panel Viewports */}
          <div className="flex-1 overflow-hidden">
            {bottomWorkspaceTab === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-3 h-full overflow-hidden divide-x divide-[#1B2330]">
                <div className="h-full overflow-hidden">
                  <AcousticTelemetryPanel />
                </div>
                <div className="h-full overflow-hidden">
                  <MissionMapPanel />
                </div>
                <div className="h-full overflow-hidden">
                  <SeabedPanel />
                </div>
              </div>
            )}
            {bottomWorkspaceTab === 'signals' && (
              <div className="h-full overflow-hidden">
                <AcousticTelemetryPanel />
              </div>
            )}
            {bottomWorkspaceTab === 'map' && (
              <div className="h-full overflow-hidden">
                <MissionMapPanel />
              </div>
            )}
            {bottomWorkspaceTab === 'seabed' && (
              <div className="h-full overflow-hidden">
                <SeabedPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Timeline Scrubber */}
      <MissionTimeline />

      {/* Idle Overlay */}
      {missionStatus === 'idle' && (
        <div
          className="absolute inset-0 bg-[#080B11]/85 backdrop-blur-xs flex flex-col items-center justify-center z-40 pointer-events-none"
          style={{ top: '48px' }}
        >
          <div className="pointer-events-auto flex flex-col items-center gap-5 text-center px-8 max-w-lg">
            <div className="w-16 h-16 rounded-full bg-[#4CD9E8]/10 border border-[#4CD9E8]/30 flex items-center justify-center shadow-2xl">
              <Radio className="w-8 h-8 text-[#4CD9E8] animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-[#EAEFF5] tracking-tight">
                Sonar Console Ready
              </h2>
              <p className="text-xs text-[#7C8AA0] leading-relaxed">
                Mission SX-014 survey stream loaded. Start the guided walkthrough to watch a self-running simulation across 4 survey lines and 17 cataloged contacts.
              </p>
            </div>
            <button
              onClick={launchDemo}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4CD9E8] text-[#080B11] font-black text-xs hover:bg-[#29B6F6] transition-all shadow-lg shadow-[#4CD9E8]/25 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              START GUIDED DEMO WALKTHROUGH
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
