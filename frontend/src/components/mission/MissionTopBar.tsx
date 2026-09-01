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
    demoStageInfo,
    launchDemo,
    resetMission,
  } = useMission();

  const vessel = interpolateVesselPosition(playbackTime);
  const currentPing = Math.floor(playbackTime * 10).toLocaleString();

  return (
    <header className="px-3.5 py-2 bg-[#080B11] border-b border-[#1B2330] flex items-center justify-between shrink-0 select-none font-mono z-30">
      {/* Left: Toggles + Mission ID & High-Contrast Status */}
      <div className="flex items-center gap-3">
        {/* Left Tree Toggle */}
        <button
          onClick={onToggleLeft}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
            isLeftOpen
              ? 'bg-[#10151D] border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8] hover:border-[#4CD9E8]/40'
              : 'bg-[#4CD9E8]/15 border-[#4CD9E8]/50 text-[#4CD9E8] shadow-sm'
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
          <div className="w-2.5 h-2.5 rounded-full bg-[#4CD9E8] animate-ping" />
          <span className="text-xs font-black text-[#EAEFF5] tracking-widest">
            SONARX CONSOLE
          </span>
        </div>

        <span className="text-[#1B2330]">|</span>

        {/* High-Contrast Glanceable Status Indicator (NASA Open MCT Standard) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10151D] border border-[#1B2330]">
          <span
            className={`w-2 h-2 rounded-full ${
              missionStatus === 'complete'
                ? 'bg-[#3FD98A]'
                : missionStatus === 'running'
                ? 'bg-[#4CD9E8] animate-pulse'
                : missionStatus === 'initializing'
                ? 'bg-[#F5A623] animate-pulse'
                : 'bg-[#7C8AA0]'
            }`}
          />
          <span
            className={`text-[9px] font-black tracking-widest ${
              missionStatus === 'complete'
                ? 'text-[#3FD98A]'
                : missionStatus === 'running'
                ? 'text-[#4CD9E8]'
                : missionStatus === 'initializing'
                ? 'text-[#F5A623]'
                : 'text-[#7C8AA0]'
            }`}
          >
            {missionStatus === 'idle'
              ? '● SYSTEM NOMINAL'
              : `● ${missionStatus.toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Center: Monospace Glanceable Telemetry Readouts */}
      <div className="hidden md:flex items-center gap-4 text-[9px] text-[#7C8AA0] bg-[#10151D] px-3.5 py-1 rounded-lg border border-[#1B2330]">
        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">SURVEY:</span>
          <strong className="text-[#EAEFF5]">{MISSION_DATA.id}</strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">HDG:</span>
          <strong className="text-[#4CD9E8]">
            {vessel.heading.toFixed(0)}°
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">SPEED:</span>
          <strong className="text-[#EAEFF5]">
            {vessel.speed.toFixed(1)} KTS
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">ALT:</span>
          <strong className="text-[#29B6F6]">
            {MISSION_DATA.altimeter.toFixed(1)} M
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">DEPTH:</span>
          <strong className="text-[#29B6F6]">
            {vessel.depth.toFixed(1)} M
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">FREQ:</span>
          <strong className="text-[#EAEFF5]">900 kHz</strong>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#7C8AA0]">PING:</span>
          <strong className="text-[#4CD9E8]">{currentPing}</strong>
        </div>
      </div>

      {/* Right: Actions & Right Panel Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={launchDemo}
          disabled={isDemoRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4CD9E8]/15 border border-[#4CD9E8]/40 text-[#4CD9E8] text-[9px] font-bold hover:bg-[#4CD9E8]/25 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Zap className="w-3 h-3" />
          <span>START DEMO WALKTHROUGH</span>
        </button>

        {missionStatus !== 'idle' && (
          <button
            onClick={resetMission}
            className="px-2 py-1.5 rounded-lg bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] text-[9px] hover:text-[#EAEFF5] transition-colors"
          >
            RESET
          </button>
        )}

        {/* Right Inspector Toggle */}
        <button
          onClick={onToggleRight}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
            isRightOpen
              ? 'bg-[#10151D] border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8] hover:border-[#4CD9E8]/40'
              : 'bg-[#4CD9E8]/15 border-[#4CD9E8]/50 text-[#4CD9E8] shadow-sm'
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
