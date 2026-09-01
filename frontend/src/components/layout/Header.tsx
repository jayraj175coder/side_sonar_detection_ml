import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
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
  Code2,
  Key,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiExplorerModal } from '../common/ApiExplorerModal';
import { ApiKeyModal } from '../common/ApiKeyModal';
import { sonarAudio } from '../../utils/sonarAudio';
import { apiClient } from '../../services/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onToggleMobileMenu,
}) => {
  const {
    isBackendConnected,
    isDemoMode,
    setIsDemoMode,
    refreshData,
    isLoading,
    currentScan,
    modelInfo,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(sonarAudio.isMuted);
  const [hasCustomApiKey, setHasCustomApiKey] = useState<boolean>(!!apiClient.getApiKey());

  const handleToggleAudio = () => {
    const muted = sonarAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <>
      <header className="h-16 md:h-18 bg-[#080B11]/90 backdrop-blur-2xl border-b border-[#1B2330] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl font-mono select-none">
        {/* Title & Mobile / Desktop Toggle */}
        <div className="flex items-center gap-3">
          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-xl bg-[#10151D] border border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8] hover:border-[#4CD9E8]/40 transition-all active:scale-95 shadow-md"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar to left'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#4CD9E8]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl bg-[#10151D] border border-[#1B2330] text-[#EAEFF5] hover:text-[#4CD9E8]"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-sm md:text-base font-black text-[#EAEFF5] tracking-wide">
                {title}
              </h1>
              {currentScan && (
                <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#4CD9E8]/10 text-[#4CD9E8] border border-[#4CD9E8]/30">
                  Scan: {currentScan.scan_id}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[10px] text-[#7C8AA0] tracking-tight mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Sexy Telemetry Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs">
          {/* 1. MoES Drone Perception Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10151D] border border-[#3FD98A]/30 text-[#EAEFF5] text-[9px] font-bold shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#3FD98A] animate-pulse" />
            <span className="text-[#3FD98A]">MoES AUV ENGINE</span>
            <span className="text-[#7C8AA0] hidden md:inline">· AUTO-LABEL ON</span>
          </div>

          {/* 2. Interactive REST API Explorer Button */}
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10151D] border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] text-[9px] font-bold transition-all shadow-md group cursor-pointer"
            title="Open Interactive REST API Explorer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#4CD9E8] group-hover:animate-pulse" />
            <span>REST API</span>
            <span className="text-[7px] px-1 py-0.2 rounded bg-[#3FD98A]/20 text-[#3FD98A]">v2</span>
          </button>

          {/* 3. Audio Sonar Ping Feedback Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] font-bold transition-all ${
              !isAudioMuted
                ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/40 text-[#4CD9E8] shadow-[0_0_10px_rgba(76,217,232,0.2)]'
                : 'bg-[#10151D] border-[#1B2330] text-[#7C8AA0] hover:text-[#EAEFF5]'
            }`}
            title="Toggle Subsea Sonar Acoustic Feedback Sound"
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{!isAudioMuted ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* 4. Backend Connection Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10151D] border border-[#1B2330] shadow-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected
                  ? 'bg-[#3FD98A] shadow-[0_0_8px_#3FD98A]'
                  : 'bg-[#4CD9E8] animate-pulse shadow-[0_0_8px_#4CD9E8]'
              }`}
            />
            <span className="text-[9px] font-bold text-[#EAEFF5]">
              {isBackendConnected ? 'FASTAPI LIVE' : 'HYDROGRAPHIC ENGINE'}
            </span>
          </div>

          {/* 5. Refresh Action Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#10151D] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4CD9E8]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Interactive REST API Explorer Modal */}
      <ApiExplorerModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      {/* API Key & Access Credentials Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={(hasKey) => setHasCustomApiKey(hasKey)}
      />
    </>
  );
};
