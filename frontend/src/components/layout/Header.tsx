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
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sonarAudio } from '../../utils/sonarAudio';

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
    <header className="h-12 bg-[#050B14]/90 backdrop-blur-md border-b border-[#102436] px-4 flex items-center justify-between sticky top-0 z-30 font-sans select-none shadow-md transition-all">
      {/* 1. Left: Sidebar Toggle + Logo + Current Survey ID + Live Dot */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1 bg-[#0A1E30] border border-[#0D2E4A] text-[#94A3B8] hover:text-[#00D4AA] hover:border-[#00D4AA]/40 rounded transition-all cursor-pointer"
          title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5 text-[#00D4AA]" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>

        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1 bg-[#0A1E30] border border-[#0D2E4A] text-[#E0F7F4] hover:text-[#00D4AA] rounded cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#082830] border border-[#00D4AA]/40 rounded flex items-center justify-center text-[#00D4AA] shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>

          <span className="text-sm font-black text-[#00D4AA] tracking-[0.15em] uppercase">
            SONARX
          </span>

          {/* Survey ID Pill */}
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 tracking-wide">
            MX-026
          </span>

          {/* Live Status Dot */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#05121F] border border-[#0D2E4A] rounded text-[9px] font-bold text-[#00D4AA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-ping" />
            <span className="text-[#94A3B8] uppercase">{isBackendConnected ? 'ONLINE' : 'ACTIVE'}</span>
          </div>
        </div>
      </div>

      {/* 2. Right: Kebab Overflow Menu */}
      <div className="flex items-center gap-2">
        {/* KEBAB OVERFLOW MENU (...) */}
        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => setIsOverflowOpen(!isOverflowOpen)}
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
              isOverflowOpen
                ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]'
                : 'bg-[#0A1E30] border-[#0D2E4A] text-[#94A3B8] hover:text-[#E0F7F4] hover:border-[#00D4AA]/40'
            }`}
            title="Secondary Actions & Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu Panel */}
          {isOverflowOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#05121F] border border-[#0D2E4A] rounded-xl shadow-2xl py-1.5 text-xs text-[#E0F7F4] z-50 divide-y divide-[#0D2E4A]">
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('scan');
                    setIsOverflowOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#00D4AA]" />
                  <span>Upload & Analyze Swath</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setIsOverflowOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Export Reports Dossier</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('model');
                    setIsOverflowOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Model Intel (YOLOv8s)</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    handleToggleAudio();
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#082830] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {!isAudioMuted ? (
                      <Volume2 className="w-3.5 h-3.5 text-[#00D4AA]" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" />
                    )}
                    <span>Sonar Audio Feedback</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${!isAudioMuted ? 'text-[#00D4AA]' : 'text-[#94A3B8]'}`}>
                    {!isAudioMuted ? 'ON' : 'MUTED'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
