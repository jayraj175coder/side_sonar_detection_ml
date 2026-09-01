import React, { useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { MissionPanel } from '../components/mission/MissionPanel';
import { SonarWaterfallPanel } from '../components/mission/SonarWaterfallPanel';
import { TargetIntelPanel } from '../components/mission/TargetIntelPanel';
import { AIPipelinePanel } from '../components/mission/AIPipelinePanel';
import { MissionMapPanel } from '../components/mission/MissionMapPanel';
import { SeabedPanel } from '../components/mission/SeabedPanel';
import { MissionTimeline } from '../components/mission/MissionTimeline';
import { Zap, Radio, ChevronRight } from 'lucide-react';

export const MissionPage: React.FC = () => {
  const { missionStatus, isDemoRunning, demoMessage, demoStep, launchDemo, resetMission } = useMission();

  return (
    <div className="flex flex-col h-screen bg-[#03070B] overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Top Mission Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#03070B] border-b border-[#16303B] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#32E6D1] animate-pulse" />
            <span className="text-xs font-mono font-black text-[#32E6D1] tracking-widest">SONARX</span>
          </div>
          <span className="text-[#16303B]">·</span>
          <span className="text-[10px] font-mono text-[#66848D]">MISSION SX-014</span>
          <span className="text-[#16303B]">·</span>
          <span className="text-[10px] font-mono text-[#66848D]">ANALYSIS NODE 02</span>
          {isDemoRunning && (
            <span className="flex items-center gap-1.5 ml-3 px-2.5 py-0.5 rounded-full bg-[#32E6D1]/10 border border-[#32E6D1]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32E6D1] animate-ping" />
              <span className="text-[9px] font-mono text-[#32E6D1] font-bold">{demoMessage}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* System status */}
          <span className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#32E6D1]/10 border border-[#32E6D1]/40 text-[#32E6D1] text-[10px] font-mono font-bold hover:bg-[#32E6D1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex items-center justify-center gap-1 px-4 py-1.5 bg-[#32E6D1]/5 border-b border-[#32E6D1]/20 shrink-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${
              i < demoStep ? 'bg-[#32E6D1] w-6' : i === demoStep ? 'bg-[#32E6D1]/60 w-8 animate-pulse' : 'bg-[#16303B] w-4'
            }`} />
          ))}
        </div>
      )}

      {/* 6-panel main grid */}
      <div className="flex-1 grid grid-cols-[220px_1fr_220px] grid-rows-[1fr_1fr] overflow-hidden">
        {/* Row 1 */}
        <div className="row-span-2 overflow-hidden">
          <MissionPanel />
        </div>

        <div className="border-b border-[#16303B] overflow-hidden">
          <SonarWaterfallPanel />
        </div>

        <div className="row-span-2 overflow-hidden">
          <TargetIntelPanel />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-[1fr_1fr] overflow-hidden">
          <div className="border-r border-[#16303B] overflow-hidden">
            <AIPipelinePanel />
          </div>
          <div className="overflow-hidden">
            <MissionMapPanel />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <MissionTimeline />

      {/* Idle overlay */}
      {missionStatus === 'idle' && (
        <div className="absolute inset-0 bg-[#03070B]/80 flex flex-col items-center justify-center z-40 pointer-events-none"
          style={{ top: '72px' }}>
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
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#32E6D1] text-[#03070B] font-mono font-black text-sm hover:bg-[#29B6F6] transition-all shadow-lg shadow-[#32E6D1]/20"
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
