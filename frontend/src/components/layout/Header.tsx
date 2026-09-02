import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  UploadCloud,
  FileText,
  Crosshair,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMission } from '../../context/MissionContext';
import { sonarAudio } from '../../utils/sonarAudio';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
}) => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const {
    isDemoRunning,
    startGuidedDemo,
    pauseGuidedDemo,
    resumeGuidedDemo,
    resetGuidedDemo,
    demoStageInfo,
  } = useMission();

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(sonarAudio.isMuted);

  const handleToggleAudio = () => {
    const muted = sonarAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <header className="h-14 bg-[#05121F] border-b border-[#0D2E4A] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 font-mono select-none">
      {/* 1. Left: Brand + Mission MX-026 + Identity Tag */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 bg-[#0A1E30] border border-[#0D2E4A] text-[#4A8090] hover:text-[#00D4AA] hover:border-[#00D4AA]/40 transition-all cursor-pointer"
          title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#00D4AA]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 bg-[#0A1E30] border border-[#0D2E4A] text-[#E0F7F4] hover:text-[#00D4AA] cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#082830] border border-[#00D4AA]/40 flex items-center justify-center text-[#00D4AA] shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#00D4AA] tracking-[0.2em] uppercase">
                SONARX
              </span>
              <span className="hidden sm:inline-flex text-[8.5px] font-bold px-1.5 py-0.2 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40">
                AI MARINE DEBRIS PIPELINE
              </span>
              <span className="text-[9px] text-[#4A8090] hidden md:inline">
                · Mission: <strong className="text-[#E0F7F4]">MX-026</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center/Right: Prominent Actions */}
      <div className="flex items-center gap-2 text-xs">
        {/* START LIVE DEMO BUTTON */}
        <button
          onClick={() => {
            setActiveTab('mission');
            startGuidedDemo();
          }}
          className="panel-btn flex items-center gap-1.5 bg-[#00D4AA] text-[#030B14] border-[#00D4AA] font-black hover:brightness-110 shadow-[0_0_15px_rgba(0,212,170,0.3)]"
          title="Start 8-scene guided cinematic live demo sequence"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>START LIVE DEMO</span>
        </button>

        {/* UPLOAD & ANALYZE */}
        <button
          onClick={() => setActiveTab('scan')}
          className={`panel-btn flex items-center gap-1.5 ${
            activeTab === 'scan'
              ? 'bg-[#082830] text-[#00D4AA] border-[#00D4AA]'
              : 'hover:text-[#E0F7F4]'
          }`}
          title="Upload side-scan sonar image (.png, .jpg, .xtf) for real-time inference"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>UPLOAD & ANALYZE</span>
        </button>

        {/* Audio Ping Sound Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`panel-btn p-1.5 ${
            !isAudioMuted ? 'text-[#00D4AA] border-[#00D4AA]/50' : 'text-[#4A8090]'
          }`}
          title="Toggle Sonar Audio Feedback"
        >
          {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* System Online Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-[#0A1E30] border border-[#0D2E4A] text-[9px] font-bold text-[#00D4AA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          <span>NODE 04 ONLINE</span>
        </div>
      </div>
    </header>
  );
};
