import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Volume2,
  VolumeX,
  UploadCloud,
  FileText,
  MoreVertical,
  Cpu,
  Compass,
  Maximize2,
  Activity,
  ShieldCheck,
  ChevronDown,
  Ruler,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sonarAudio } from '../../utils/sonarAudio';
import { SonarxLogo } from '../common/SonarxLogo';
import { INDIAN_SURVEY_SECTORS, SurveySector, DEFAULT_SURVEY_SECTOR } from '../../data/surveySectors';
import { MoESBriefingModal } from '../common/MoESBriefingModal';
import { AcousticShadowCalculatorModal } from '../common/AcousticShadowCalculatorModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    isBackendConnected,
  } = useApp();

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(sonarAudio.isMuted);
  const [isOverflowOpen, setIsOverflowOpen] = useState<boolean>(false);
  const [isMoESModalOpen, setIsMoESModalOpen] = useState<boolean>(false);
  const [isShadowCalcOpen, setIsShadowCalcOpen] = useState<boolean>(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<SurveySector>(DEFAULT_SURVEY_SECTOR);
  const overflowRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLDivElement>(null);

  const handleToggleAudio = () => {
    const muted = sonarAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(event.target as Node)) {
        setIsOverflowOpen(false);
      }
      if (sectorRef.current && !sectorRef.current.contains(event.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-13 bg-[#05070B]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between sticky top-0 z-30 font-sans select-none transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* 1. Left: Sidebar Toggle + Logo + Survey ID Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-slate-400 hover:text-white rounded-md transition-all cursor-pointer"
          title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#FFB703]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white rounded-md cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <SonarxLogo
            size="sm"
            subtitle=""
            badge="v2.6"
            animated={true}
            onClick={() => setActiveTab('overview')}
          />

          {/* Mission Telemetry & MoES Briefing Pill */}
          <button
            onClick={() => setIsMoESModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/15 hover:bg-[#FFB703]/25 border border-[#FFB703]/40 text-[10px] font-mono font-bold text-[#FFB703] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,183,3,0.2)] hover:scale-105 active:scale-95"
            title="Open MoES Deep Ocean Mission Evaluation Dossier"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] animate-ping" />
            <span>🏛️ MoES PROTOCOL // EVAL BRIEF</span>
          </button>
        </div>
      </div>

      {/* 2. Center: Linear-style Live Telemetry Ticker (Quiet Chrome) */}
      <div className="hidden xl:flex items-center gap-4 text-[11px] font-mono text-slate-400 bg-white/[0.02] border border-white/[0.06] px-3 py-1 rounded-full shadow-inner">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#FFB703] animate-pulse" />
          <span className="text-slate-300 font-semibold">ACOUSTIC CHIRP:</span>
          <span className="text-[#FFB703]">{selectedSector.acousticChirpKhz} kHz</span>
        </div>

        <span className="w-1 h-1 rounded-full bg-slate-700" />

        {/* Interactive Indian EEZ Survey Sector Selector */}
        <div className="relative" ref={sectorRef}>
          <button
            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-white/[0.06]"
            title="Switch Indian Continental Shelf Survey Sector"
          >
            <Compass className="w-3 h-3 text-[#FFB703]" />
            <span className="text-slate-400">SECTOR:</span>
            <span className="text-white font-bold">{selectedSector.shortName}</span>
            <span className="text-slate-400 text-[10px]">({selectedSector.coordString})</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSectorDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-[#0A0F18]/98 backdrop-blur-2xl border border-white/[0.15] rounded-xl shadow-2xl py-2 text-xs text-slate-200 z-50 divide-y divide-white/[0.06] animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-1 text-[10px] font-mono text-[#FFB703] font-bold tracking-wider uppercase flex items-center justify-between">
                <span>Indian EEZ Survey Sectors</span>
                <span className="text-slate-400">MoES / NIOT</span>
              </div>
              <div className="py-1">
                {INDIAN_SURVEY_SECTORS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSelectedSector(sec);
                      setIsSectorDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 flex flex-col text-left hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      selectedSector.id === sec.id ? 'bg-[#FFB703]/10 border-l-2 border-[#FFB703]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{sec.shortName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">{sec.code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                      <span className="text-[#FFB703]">{sec.coordString}</span>
                      <span>·</span>
                      <span>{sec.depthRange}</span>
                      <span>·</span>
                      <span className="text-slate-300">{sec.acousticChirpKhz} kHz</span>
                    </div>
                    <span className="text-[9px] text-slate-500 truncate mt-0.5">{sec.surveyVessel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="w-1 h-1 rounded-full bg-slate-700" />

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          <span className="text-slate-300">STANDARDS:</span>
          <span className="text-slate-200">IHO S-44 ORDER 1A</span>
        </div>
      </div>

      {/* 3. Right: Fast Action Buttons, Audio Toggle & Overflow Menu */}
      <div className="flex items-center gap-2">
        {/* Acoustic Shadow Calculator Button */}
        <button
          onClick={() => setIsShadowCalcOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-[#FFB703]/10 border border-white/[0.08] hover:border-[#FFB703]/40 text-xs text-slate-300 hover:text-[#FFB703] transition-all cursor-pointer"
          title="Open Hydrographic Acoustic Shadow Calculator (IHO S-44)"
        >
          <Ruler className="w-3.5 h-3.5 text-[#FFB703]" />
          <span className="text-[11px] font-medium hidden md:inline">Shadow Calc</span>
        </button>

        {/* Fullscreen Button with F11 Keycap */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Toggle Fullscreen Mode"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium hidden md:inline">Full HUD</span>
          <span className="keycap">F11</span>
        </button>

        {/* Sonar Audio Feedback Button */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
            !isAudioMuted
              ? 'bg-[#FFB703]/10 border-[#FFB703]/40 text-[#FFB703] shadow-[0_0_10px_rgba(255,183,3,0.15)]'
              : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title={!isAudioMuted ? 'Mute Sonar Audio' : 'Unmute Sonar Audio'}
        >
          {!isAudioMuted ? (
            <Volume2 className="w-3.5 h-3.5 text-[#FFB703]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="text-[11px] font-mono font-medium hidden md:inline">
            {!isAudioMuted ? 'AUDIO LIVE' : 'MUTED'}
          </span>
        </button>

        {/* KEBAB OVERFLOW MENU (...) */}
        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => setIsOverflowOpen(!isOverflowOpen)}
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
              isOverflowOpen
                ? 'bg-white/[0.1] border-white/[0.2] text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.16]'
            }`}
            title="Secondary Actions & Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu Panel (Raycast Style) */}
          {isOverflowOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#0A0F18]/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 z-50 divide-y divide-white/[0.06]">
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
                Quick Navigation
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('scan');
                    setIsOverflowOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.06] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="w-3.5 h-3.5 text-[#00F5D4]" />
                    <span>Upload & Analyze Swath</span>
                  </div>
                  <span className="keycap">2</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setIsOverflowOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.06] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Export Reports Dossier</span>
                  </div>
                  <span className="keycap">6</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('model');
                    setIsOverflowOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.06] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-3.5 h-3.5 text-[#FFB703]" />
                    <span>Model Intel (YOLOv8s)</span>
                  </div>
                  <span className="keycap">7</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MoES Deep Ocean Mission Briefing Modal */}
      <MoESBriefingModal
        isOpen={isMoESModalOpen}
        onClose={() => setIsMoESModalOpen(false)}
        onOpenShadowCalc={() => setIsShadowCalcOpen(true)}
      />

      {/* Interactive Hydrographic Acoustic Shadow Calculator */}
      <AcousticShadowCalculatorModal
        isOpen={isShadowCalcOpen}
        onClose={() => setIsShadowCalcOpen(false)}
      />
    </header>
  );
};
