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
  Minimize2,
  X,
} from 'lucide-react';

export const MissionPage: React.FC = () => {
  const {
    missionStatus,
    isDemoRunning,
    launchDemo,
    focusedPanel,
    setFocusedPanel,
  } = useMission();

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

      {/* 2. Guided Walkthrough Stepper Bar (With Judge Mode controls) */}
      <GuidedWalkthroughBar />

      {/* Floating Left Tree Expander Tab (When Collapsed) */}
      {!isLeftTreeOpen && !focusedPanel && (
        <button
          onClick={() => setIsLeftTreeOpen(true)}
          title="Show Survey & Tracklines Tree"
          className="absolute top-1/2 left-0 -translate-y-1/2 z-40 bg-[#10151D] border border-l-0 border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] py-4 px-1.5 rounded-r-xl shadow-2xl flex flex-col items-center gap-2 group transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[8px] font-bold tracking-widest uppercase text-[#7C8AA0] group-hover:text-[#4CD9E8]">
            SURVEY TREE
          </span>
        </button>
      )}

      {/* Floating Right Inspector Expander Tab (When Collapsed) */}
      {!isRightInspectorOpen && !focusedPanel && (
        <button
          onClick={() => setIsRightInspectorOpen(true)}
          title="Show Contact Inspector & Evidence"
          className="absolute top-1/2 right-0 -translate-y-1/2 z-40 bg-[#10151D] border border-r-0 border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] py-4 px-1.5 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 group transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[8px] font-bold tracking-widest uppercase text-[#7C8AA0] group-hover:text-[#4CD9E8]">
            INSPECTOR
          </span>
        </button>
      )}

      {/* 3. Panel Focus Mode Overlay (Feature 3: Fullscreen Panel Takeover) */}
      {focusedPanel && (
        <div className="flex-1 flex flex-col bg-[#080B11] z-30 overflow-hidden relative">
          <div className="bg-[#10151D] border-b border-[#1B2330] px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4CD9E8] animate-ping" />
              <span className="text-[10px] font-black text-[#4CD9E8] tracking-widest uppercase">
                EXPANDED PANEL FOCUS: {focusedPanel.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => setFocusedPanel(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] text-[9px] font-bold transition-all shadow-md cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>EXIT FOCUS VIEW (ESC)</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {focusedPanel === 'waterfall' && <HeroSonarWaterfall />}
            {focusedPanel === 'inspector' && <ContactInspector />}
            {focusedPanel === 'map' && <MissionMapPanel />}
            {focusedPanel === 'seabed' && <SeabedPanel />}
            {focusedPanel === 'signals' && <AcousticTelemetryPanel />}
            {focusedPanel === 'tree' && <MissionHierarchyTree />}
          </div>
        </div>
      )}

      {/* 4. Normal Multi-Panel Grid (When not in Focus Mode) */}
      {!focusedPanel && (
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
                  className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
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
                  className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
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
                  className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
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
                  className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
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
      )}

      {/* 5. Bottom Timeline / Survey Scrubber */}
      <MissionTimeline />
    </div>
  );
};
