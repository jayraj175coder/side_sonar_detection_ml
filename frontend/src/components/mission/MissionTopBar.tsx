import React from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sliders,
  Compass,
  Gauge,
  Layers,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DATA, interpolateVesselPosition } from '../../data/mission';
import type { PlaybackSpeed } from '../../types';

interface MissionTopBarProps {
  isLeftOpen: boolean;
  onToggleLeft: () => void;
  isRightOpen: boolean;
  onToggleRight: () => void;
}

export const MissionTopBar: React.FC<MissionTopBarProps> = ({
  isLeftOpen,
  onToggleLeft,
  isRightOpen,
  onToggleRight,
}) => {
  const {
    missionStatus,
    playbackTime,
    setPlaybackTime,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isDemoRunning,
    demoMessage,
    launchDemo,
    resetMission,
  } = useMission();

  const vessel = interpolateVesselPosition(playbackTime);
  const currentPing = Math.floor(playbackTime * 10).toLocaleString();

  return (
    <header className="px-3.5 py-2 bg-[#03070B] border-b border-[#16303B] flex items-center justify-between shrink-0 select-none font-mono z-30">
      {/* Left: Toggles + Mission ID & High-Contrast Status */}
      <div className="flex items-center gap-3">
        {/* Left Tree Toggle */}
        <button
          onClick={onToggleLeft}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
            isLeftOpen
              ? 'bg-[#081118] border-[#16303B] text-[#66848D] hover:text-[#32E6D1] hover:border-[#32E6D1]/40'
              : 'bg-[#32E6D1]/15 border-[#32E6D1]/50 text-[#32E6D1] shadow-sm'
          }`}
          title={isLeftOpen ? 'Collapse Survey Tree' : 'Expand Survey Tree'}
        >
          {isLeftOpen ? (
            <PanelLeftClose className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftOpen className="w-3.5 h-3.5" />
          )}
          <span className="hidden xl:inline text-[9px]">
            {isLeftOpen ? 'Tree' : 'Show Tree'}
          </span>
        </button>

        {/* Mission Brand Tag */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#32E6D1] animate-ping" />
          <span className="text-xs font-black text-[#E4F2F5] tracking-widest">
            SONARX CONSOLE
          </span>
        </div>

        <span className="text-[#16303B]">|</span>

        {/* High-Contrast Glanceable Status Indicator (NASA Open MCT Standard) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081118] border border-[#16303B]">
          <span
            className={`w-2 h-2 rounded-full ${
              missionStatus === 'complete'
                ? 'bg-[#65D391]'
                : missionStatus === 'running'
                ? 'bg-[#32E6D1] animate-pulse'
                : missionStatus === 'initializing'
                ? 'bg-[#FFB547] animate-pulse'
                : 'bg-[#66848D]'
            }`}
          />
          <span
            className={`text-[9px] font-black tracking-widest ${
              missionStatus === 'complete'
                ? 'text-[#65D391]'
                : missionStatus === 'running'
                ? 'text-[#32E6D1]'
                : missionStatus === 'initializing'
                ? 'text-[#FFB547]'
                : 'text-[#66848D]'
            }`}
          >
            {missionStatus === 'idle'
              ? '● SYSTEM NOMINAL'
              : `● ${missionStatus.toUpperCase()}`}
          </span>
        </div>

        {isDemoRunning && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#32E6D1]/10 border border-[#32E6D1]/40 text-[#32E6D1] text-[9px] font-bold animate-pulse">
            <Zap className="w-3 h-3" />
            <span>{demoMessage}</span>
          </div>
        )}
      </div>

      {/* Center: Monospace Glanceable Telemetry Readouts */}
      <div className="hidden md:flex items-center gap-4 text-[9px] text-[#66848D] bg-[#081118] px-3.5 py-1 rounded-lg border border-[#16303B]">
        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">SURVEY:</span>
          <strong className="text-[#E4F2F5]">{MISSION_DATA.id}</strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">HDG:</span>
          <strong className="text-[#32E6D1]">
            {vessel.heading.toFixed(0)}°
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">SPEED:</span>
          <strong className="text-[#E4F2F5]">
            {vessel.speed.toFixed(1)} KTS
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">ALT:</span>
          <strong className="text-[#29B6F6]">
            {MISSION_DATA.altimeter.toFixed(1)} M
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">DEPTH:</span>
          <strong className="text-[#29B6F6]">
            {vessel.depth.toFixed(1)} M
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">FREQ:</span>
          <strong className="text-[#E4F2F5]">900 kHz</strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#66848D]">PING:</span>
          <strong className="text-[#32E6D1]">{currentPing}</strong>
        </div>
      </div>

      {/* Right: Actions & Right Panel Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={launchDemo}
          disabled={isDemoRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#32E6D1]/15 border border-[#32E6D1]/40 text-[#32E6D1] text-[9px] font-bold hover:bg-[#32E6D1]/25 transition-all disabled:opacity-50"
        >
          <Zap className="w-3 h-3" />
          <span>DEMO RUN</span>
        </button>

        {missionStatus !== 'idle' && (
          <button
            onClick={resetMission}
            className="px-2 py-1.5 rounded-lg bg-[#0C171E] border border-[#16303B] text-[#66848D] text-[9px] hover:text-[#E4F2F5] transition-colors"
          >
            RESET
          </button>
        )}

        {/* Right Inspector Toggle */}
        <button
          onClick={onToggleRight}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
            isRightOpen
              ? 'bg-[#081118] border-[#16303B] text-[#66848D] hover:text-[#32E6D1] hover:border-[#32E6D1]/40'
              : 'bg-[#32E6D1]/15 border-[#32E6D1]/50 text-[#32E6D1] shadow-sm'
          }`}
          title={isRightOpen ? 'Collapse Inspector' : 'Expand Inspector'}
        >
          <span className="hidden xl:inline text-[9px]">
            {isRightOpen ? 'Inspector' : 'Show Inspector'}
          </span>
          {isRightOpen ? (
            <PanelRightClose className="w-3.5 h-3.5" />
          ) : (
            <PanelRightOpen className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  );
};
