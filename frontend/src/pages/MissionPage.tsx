import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { MissionPanel } from '../components/mission/MissionPanel';
import { SonarWaterfallPanel } from '../components/mission/SonarWaterfallPanel';
import { TargetIntelPanel } from '../components/mission/TargetIntelPanel';
import { AIPipelinePanel } from '../components/mission/AIPipelinePanel';
import { MissionMapPanel } from '../components/mission/MissionMapPanel';
import { SeabedPanel } from '../components/mission/SeabedPanel';
import { MissionTimeline } from '../components/mission/MissionTimeline';
import {
  Zap,
  Radio,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Layers,
  Map as MapIcon,
  Box,
  Cpu,
} from 'lucide-react';

export const MissionPage: React.FC = () => {
  const { missionStatus, isDemoRunning, demoMessage, demoStep, launchDemo, resetMission } = useMission();
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<'split' | 'pipeline' | 'map' | 'seabed'>('split');

  return (
    <div className="flex flex-col h-screen bg-[#03070B] overflow-hidden relative select-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Top Mission Bar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-[#03070B] border-b border-[#16303B] shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Left Panel Toggle (Desktop / Laptop) */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isLeftPanelOpen
                ? 'bg-[#081118] border-[#16303B] text-[#66848D] hover:text-[#32E6D1] hover:border-[#32E6D1]/40'
                : 'bg-[#32E6D1]/15 border-[#32E6D1]/50 text-[#32E6D1] shadow-sm'
            }`}
            title={isLeftPanelOpen ? 'Collapse Left Telemetry Panel' : 'Show Left Telemetry Panel'}
          >
            {isLeftPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline text-[10px]">{isLeftPanelOpen ? 'Telemetry' : 'Show Telemetry'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#32E6D1] animate-pulse" />
            <span className="text-xs font-mono font-black text-[#32E6D1] tracking-widest">SONARX</span>
          </div>
          <span className="text-[#16303B]">·</span>
          <span className="text-[10px] font-mono text-[#66848D]">MISSION SX-014</span>
          <span className="text-[#16303B] hidden sm:inline">·</span>
          <span className="text-[10px] font-mono text-[#66848D] hidden sm:inline">ANALYSIS NODE 02</span>
          {isDemoRunning && (
            <span className="flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-[#32E6D1]/10 border border-[#32E6D1]/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32E6D1] animate-ping" />
              <span className="text-[9px] font-mono text-[#32E6D1] font-bold truncate max-w-[200px]">{demoMessage}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Right Intel Panel Toggle */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isRightPanelOpen
                ? 'bg-[#081118] border-[#16303B] text-[#66848D] hover:text-[#32E6D1] hover:border-[#32E6D1]/40'
                : 'bg-[#32E6D1]/15 border-[#32E6D1]/50 text-[#32E6D1] shadow-sm'
            }`}
            title={isRightPanelOpen ? 'Collapse Right Target Intel' : 'Show Target Intelligence Panel'}
          >
            <span className="hidden xl:inline text-[10px]">{isRightPanelOpen ? 'Target Intel' : 'Show Intel'}</span>
            {isRightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>

          {/* System status */}
          <span className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono ${
            missionStatus === 'complete' ? 'border-[#65D391]/30 text-[#65D391] bg-[#65D391]/5'
            : missionStatus === 'running' ? 'border-[#32E6D1]/30 text-[#32E6D1] bg-[#32E6D1]/5'
            : 'border-[#16303B] text-[#66848D]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              missionStatus === 'complete' ? 'bg-[#65D391]'
              : missionStatus === 'running' ? 'bg-[#32E6D1] animate-pulse'
              : 'bg-[#66848D]'
            }`} />
            {missionStatus === 'idle' ? 'SYSTEM READY' : missionStatus.toUpperCase()}
          </span>

          <button
            onClick={launchDemo}
            disabled={isDemoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#32E6D1]/10 border border-[#32E6D1]/40 text-[#32E6D1] text-[10px] font-mono font-bold hover:bg-[#32E6D1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Zap className="w-3 h-3" />
            DEMO MISSION
          </button>

          {missionStatus !== 'idle' && (
            <button
              onClick={resetMission}
              className="px-2.5 py-1.5 rounded-lg bg-[#0C171E] border border-[#16303B] text-[#66848D] text-[10px] font-mono hover:text-[#E4F2F5] transition-colors"
            >
              RESET
            </button>
          )}
        </div>
      </div>

      {/* Step indicator during demo */}
      {isDemoRunning && (
        <div className="flex items-center justify-center gap-1 px-4 py-1.5 bg-[#32E6D1]/5 border-b border-[#32E6D1]/20 shrink-0 z-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${
              i < demoStep ? 'bg-[#32E6D1] w-6' : i === demoStep ? 'bg-[#32E6D1]/60 w-8 animate-pulse' : 'bg-[#16303B] w-4'
            }`} />
          ))}
        </div>
      )}

      {/* Floating Expand Tab Buttons (When panels are collapsed) */}
      {!isLeftPanelOpen && (
        <button
          onClick={() => setIsLeftPanelOpen(true)}
          title="Click to expand Left Telemetry Sidepanel"
          className="absolute top-1/2 left-0 -translate-y-1/2 z-30 bg-[#081118] border border-l-0 border-[#16303B] hover:border-[#32E6D1] text-[#32E6D1] hover:bg-[#0C171E] py-4 px-1.5 rounded-r-xl shadow-2xl flex flex-col items-center gap-2 group transition-all"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[8px] font-mono font-bold tracking-widest uppercase text-[#66848D] group-hover:text-[#32E6D1]">
            TELEMETRY
          </span>
        </button>
      )}

      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          title="Click to expand Right Target Intelligence Sidepanel"
          className="absolute top-1/2 right-0 -translate-y-1/2 z-30 bg-[#081118] border border-r-0 border-[#16303B] hover:border-[#32E6D1] text-[#32E6D1] hover:bg-[#0C171E] py-4 px-1.5 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 group transition-all"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="[writing-mode:vertical-lr] text-[8px] font-mono font-bold tracking-widest uppercase text-[#66848D] group-hover:text-[#32E6D1]">
            INTEL
          </span>
        </button>
      )}

      {/* Main Workstation Layout */}
      <div
        className="flex-1 grid overflow-hidden transition-all duration-300 relative"
        style={{
          gridTemplateColumns: `${isLeftPanelOpen ? '240px' : '0px'} 1fr ${isRightPanelOpen ? '250px' : '0px'}`,
          gridTemplateRows: '1fr 1fr',
        }}
      >
        {/* Left Sidepanel (Mission & Telemetry) */}
        <div className={`row-span-2 overflow-hidden transition-all duration-300 ${!isLeftPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <MissionPanel onCollapse={() => setIsLeftPanelOpen(false)} />
        </div>

        {/* Center Top: Sonar Waterfall Swath */}
        <div className="border-b border-[#16303B] overflow-hidden relative">
          <SonarWaterfallPanel />
        </div>

        {/* Right Sidepanel (Target Intelligence & Evidence) */}
        <div className={`row-span-2 overflow-hidden transition-all duration-300 ${!isRightPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <TargetIntelPanel onCollapse={() => setIsRightPanelOpen(false)} />
        </div>

        {/* Center Bottom: Multi-View Analytical Workspace (Pipeline, Map, 3D Seafloor) */}
        <div className="flex flex-col overflow-hidden bg-[#02070E]">
          {/* Bottom Sub-View Switcher Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#081118] border-b border-[#16303B] shrink-0 text-[9px] font-mono">
            <div className="flex items-center gap-1">
              <span className="text-[#66848D] uppercase tracking-widest mr-1">WORKSPACE:</span>
              <button
                onClick={() => setBottomTab('split')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomTab === 'split' ? 'bg-[#32E6D1]/15 text-[#32E6D1] border-[#32E6D1]/40' : 'bg-[#0C171E] text-[#66848D] border-[#16303B]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>3-PANEL SPLIT</span>
              </button>
              <button
                onClick={() => setBottomTab('pipeline')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomTab === 'pipeline' ? 'bg-[#32E6D1]/15 text-[#32E6D1] border-[#32E6D1]/40' : 'bg-[#0C171E] text-[#66848D] border-[#16303B]'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>AI PIPELINE</span>
              </button>
              <button
                onClick={() => setBottomTab('map')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomTab === 'map' ? 'bg-[#32E6D1]/15 text-[#32E6D1] border-[#32E6D1]/40' : 'bg-[#0C171E] text-[#66848D] border-[#16303B]'
                }`}
              >
                <MapIcon className="w-3 h-3" />
                <span>MISSION MAP</span>
              </button>
              <button
                onClick={() => setBottomTab('seabed')}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  bottomTab === 'seabed' ? 'bg-[#32E6D1]/15 text-[#32E6D1] border-[#32E6D1]/40' : 'bg-[#0C171E] text-[#66848D] border-[#16303B]'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>3D SEAFLOOR</span>
              </button>
            </div>
            <span className="text-[#66848D] hidden md:inline">SYNCHRONIZED TACTICAL FEEDS</span>
          </div>

          {/* Bottom Panels Content */}
          <div className="flex-1 overflow-hidden">
            {bottomTab === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-3 h-full overflow-hidden divide-x divide-[#16303B]">
                <div className="h-full overflow-hidden">
                  <AIPipelinePanel />
                </div>
                <div className="h-full overflow-hidden">
                  <MissionMapPanel />
                </div>
                <div className="h-full overflow-hidden">
                  <SeabedPanel />
                </div>
              </div>
            )}
            {bottomTab === 'pipeline' && (
              <div className="h-full overflow-hidden">
                <AIPipelinePanel />
              </div>
            )}
            {bottomTab === 'map' && (
              <div className="h-full overflow-hidden">
                <MissionMapPanel />
              </div>
            )}
            {bottomTab === 'seabed' && (
              <div className="h-full overflow-hidden">
                <SeabedPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <MissionTimeline />

      {/* Idle Overlay */}
      {missionStatus === 'idle' && (
        <div
          className="absolute inset-0 bg-[#03070B]/80 flex flex-col items-center justify-center z-40 pointer-events-none"
          style={{ top: '56px' }}
        >
          <div className="pointer-events-auto flex flex-col items-center gap-6 text-center px-8">
            <div className="w-20 h-20 rounded-full bg-[#32E6D1]/5 border border-[#32E6D1]/20 flex items-center justify-center">
              <Radio className="w-9 h-9 text-[#32E6D1]/40" />
            </div>
            <div>
              <h2 className="text-2xl font-mono font-black text-[#E4F2F5] tracking-tight">Mission Control Ready</h2>
              <p className="text-sm font-mono text-[#66848D] mt-2 max-w-md">
                Launch the demo to experience a complete sonar intelligence mission — from ingestion through 3D seafloor mapping.
              </p>
            </div>
            <button
              onClick={launchDemo}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#32E6D1] text-[#03070B] font-mono font-black text-sm hover:bg-[#29B6F6] transition-all shadow-lg shadow-[#32E6D1]/20 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              LAUNCH DEMO MISSION
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
