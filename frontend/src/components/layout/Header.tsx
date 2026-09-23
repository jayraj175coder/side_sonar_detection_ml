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
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sonarAudio } from '../../utils/sonarAudio';
import { SonarxLogo } from '../common/SonarxLogo';

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
  const overflowRef = useRef<HTMLDivElement>(null);

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

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(event.target as Node)) {
        setIsOverflowOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-15 sm:h-16 bg-[#05070B]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 font-sans select-none transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* 1. Left: Sidebar Toggle + Logo + Survey ID Badge */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
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
            className="md:hidden p-2 bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white rounded-xl cursor-pointer"
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

          {/* Mission Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB703]/10 border border-[#FFB703]/30 text-xs font-mono font-bold text-[#FFB703]">
            <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-ping" />
            <span>SIH26057 // MoES</span>
          </div>
        </div>
      </div>

      {/* 2. Center: Linear-style Live Telemetry Ticker (Clear & Legible) */}
      <div className="hidden xl:flex items-center gap-4 text-xs font-sans text-slate-300 bg-white/[0.04] border border-white/[0.08] px-4 py-1.5 rounded-full shadow-inner">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#FFB703] animate-pulse" />
          <span className="text-slate-400 font-semibold">ACOUSTIC CHIRP:</span>
          <span className="text-[#FFB703] font-mono font-bold">900 kHz</span>
        </div>

        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />

        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="text-slate-400 font-semibold">POSITION:</span>
          <span className="text-slate-100 font-mono">18.9217° N, 72.8214° E</span>
        </div>

        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 font-semibold">STANDARDS:</span>
          <span className="text-emerald-400 font-bold">IHO S-44 ORDER 1A</span>
        </div>
      </div>

      {/* 3. Right: Fast Action Buttons, Audio Toggle & Overflow Menu */}
      <div className="flex items-center gap-2.5">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        {/* Fullscreen Button with F11 Keycap */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Toggle Fullscreen Mode"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium hidden lg:inline">Full HUD</span>
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

        {/* Notifications Bell */}
        <button
          className="p-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-slate-300 hover:text-white transition-all cursor-pointer relative"
          title="Tactical Alerts (3 New)"
        >
          <Bell className="w-3.5 h-3.5 text-slate-300" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FFB703] animate-pulse" />
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
    </header>
  );
};
