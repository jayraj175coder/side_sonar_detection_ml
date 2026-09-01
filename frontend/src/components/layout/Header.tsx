import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Sparkles,
  Menu,
  Server,
  Zap,
  Cpu,
  Layers,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Scale,
  UploadCloud,
  FileText,
  MapPin,
  Box,
  BarChart2,
  Eye,
  Crosshair,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMission } from '../../context/MissionContext';
import { sonarAudio } from '../../utils/sonarAudio';
import { TabType } from '../../types';

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
    isBackendConnected,
    refreshData,
    isLoading,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const {
    isDemoRunning,
    startGuidedDemo,
    pauseGuidedDemo,
    resumeGuidedDemo,
    resetGuidedDemo,
    isJudgeMode,
    toggleJudgeMode,
    demoStageInfo,
  } = useMission();

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(sonarAudio.isMuted);

  const handleToggleAudio = () => {
    const muted = sonarAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <header className="h-16 md:h-18 bg-[#081118]/95 backdrop-blur-2xl border-b border-[#16303B] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl font-mono select-none">
      {/* 1. Left: Brand + Mission MX-026 + Identity Tag */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 rounded-xl bg-[#0C171E] border border-[#16303B] text-[#6F8992] hover:text-[#32E6D1] hover:border-[#32E6D1]/40 transition-all active:scale-95 shadow-md cursor-pointer"
          title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#32E6D1]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#0C171E] border border-[#16303B] text-[#E4F2F5] hover:text-[#32E6D1] cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#32E6D1]/15 border border-[#32E6D1]/30 flex items-center justify-center text-[#32E6D1] shadow-[0_0_15px_rgba(50,230,209,0.3)] shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-black text-[#E4F2F5] tracking-wider uppercase">
                SONARX
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#32E6D1]/15 text-[#32E6D1] border border-[#32E6D1]/30">
                AI MARINE DEBRIS DETECTION
              </span>
              <span className="text-[9px] text-[#6F8992] hidden md:inline">
                · Mission: <strong className="text-[#E4F2F5]">MX-026</strong>
              </span>
            </div>
            <p className="text-[10px] text-[#6F8992] tracking-tight hidden lg:block">
              Transforming side-scan sonar imagery into explainable, geotagged marine intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Center/Right: Prominent Demo Actions & Mode Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs">
        {/* HERO START DEMO MISSION BUTTON */}
        {!isDemoRunning ? (
          <button
            onClick={startGuidedDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#32E6D1] to-[#29B6F6] hover:brightness-110 text-[#03070B] font-black text-xs transition-all shadow-[0_0_20px_rgba(50,230,209,0.35)] active:scale-95 cursor-pointer"
            title="Start automated 30s judge evaluation walkthrough"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START DEMO MISSION</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#0C171E] p-1 rounded-xl border border-[#32E6D1]/40 shadow-[0_0_15px_rgba(50,230,209,0.2)]">
            <span className="text-[9px] font-bold text-[#32E6D1] px-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#32E6D1] animate-ping" />
              {demoStageInfo.title}
            </span>
            <button
              onClick={pauseGuidedDemo}
              className="p-1 rounded-lg bg-[#081118] border border-[#16303B] text-[#E4F2F5] hover:text-[#32E6D1] cursor-pointer"
              title="Pause walkthrough"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetGuidedDemo}
              className="p-1 rounded-lg bg-[#081118] border border-[#16303B] text-[#6F8992] hover:text-[#FF5D5D] cursor-pointer"
              title="Reset walkthrough"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* JUDGE MODE TOGGLE */}
        <button
          onClick={toggleJudgeMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
            isJudgeMode
              ? 'bg-[#FFB547]/20 border-[#FFB547] text-[#FFB547] shadow-[0_0_15px_rgba(255,181,71,0.25)]'
              : 'bg-[#0C171E] border-[#16303B] text-[#6F8992] hover:text-[#E4F2F5]'
          }`}
          title="Toggle Judge Evaluation Mode (Simplified High-Impact Metrics)"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isJudgeMode ? 'JUDGE MODE: ON' : 'JUDGE MODE'}</span>
        </button>

        {/* UPLOAD & ANALYZE QUICK BUTTON */}
        <button
          onClick={() => setActiveTab('scan')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-[#32E6D1]/20 border-[#32E6D1] text-[#32E6D1]'
              : 'bg-[#0C171E] border-[#16303B] text-[#6F8992] hover:text-[#E4F2F5]'
          }`}
          title="Upload new side-scan sonar image for AI analysis"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>UPLOAD & ANALYZE</span>
        </button>

        {/* Audio Ping Sound Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
            !isAudioMuted
              ? 'bg-[#32E6D1]/15 border-[#32E6D1]/40 text-[#32E6D1]'
              : 'bg-[#0C171E] border-[#16303B] text-[#6F8992] hover:text-[#E4F2F5]'
          }`}
          title="Toggle Acoustic Sonar Ping Audio"
        >
          {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* System Online Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0C171E] border border-[#16303B] text-[9px] font-bold text-[#65D391]">
          <span className="w-2 h-2 rounded-full bg-[#65D391] animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
};
