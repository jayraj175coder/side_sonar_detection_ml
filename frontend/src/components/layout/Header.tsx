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
    <header className="h-14 bg-[#090e09] border-b border-[#193019] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 font-mono select-none">
      {/* 1. Left: Brand + Mission MX-026 + Identity Tag */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 bg-[#0e160e] border border-[#193019] text-[#64876b] hover:text-[#4ade80] hover:border-[#4ade80]/40 transition-all cursor-pointer"
          title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#4ade80]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 bg-[#0e160e] border border-[#193019] text-[#dcfce7] hover:text-[#4ade80] cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#122415] border border-[#4ade80]/40 flex items-center justify-center text-[#4ade80] shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#4ade80] tracking-[0.2em] uppercase">
                SONARLINE
              </span>
              <span className="hidden sm:inline-flex text-[8.5px] font-bold px-1.5 py-0.2 bg-[#122415] text-[#4ade80] border border-[#4ade80]/40">
                AI MARINE DEBRIS PIPELINE
              </span>
              <span className="text-[9px] text-[#64876b] hidden md:inline">
                · Mission: <strong className="text-[#dcfce7]">MX-026</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center/Right: Prominent Actions */}
      <div className="flex items-center gap-2 text-xs">
        {/* RUN LIVE DEMO BUTTON */}
        <button
          onClick={() => {
            setActiveTab('mission');
            startGuidedDemo();
          }}
          className="panel-btn flex items-center gap-1.5 bg-[#4ade80] text-[#070b07] border-[#4ade80] font-black hover:brightness-110"
          title="Run real end-to-end automated inference pipeline on live sonar stream"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>RUN LIVE DEMO</span>
        </button>

        {/* UPLOAD & ANALYZE */}
        <button
          onClick={() => setActiveTab('scan')}
          className={`panel-btn flex items-center gap-1.5 ${
            activeTab === 'scan'
              ? 'bg-[#122415] text-[#4ade80] border-[#4ade80]'
              : 'hover:text-[#dcfce7]'
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
            !isAudioMuted ? 'text-[#4ade80] border-[#4ade80]/50' : 'text-[#64876b]'
          }`}
          title="Toggle Sonar Audio Feedback"
        >
          {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* System Online Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-[#0e160e] border border-[#193019] text-[9px] font-bold text-[#4ade80]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          <span>NODE 04 ONLINE</span>
        </div>
      </div>
    </header>
  );
};
