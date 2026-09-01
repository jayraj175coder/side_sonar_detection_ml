import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

  const isV2 = modelInfo?.version === 'v2' || modelInfo?.name?.includes('Marine-Debris');

  return (
    <header className="h-16 md:h-20 bg-[#070D1B]/80 backdrop-blur-2xl border-b border-cyan-500/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Title & Mobile / Desktop Toggle */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all active:scale-95"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar to left'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base md:text-xl font-extrabold text-slate-100 tracking-tight">
              {title}
            </h1>
            {currentScan && (
              <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                Scan: {currentScan.scan_id}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium tracking-tight mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Action Controls & Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Active Model Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-inner">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-300 font-bold">
            {isV2 ? 'YOLOv8n — SIH Marine Debris V2 (MoES)' : 'YOLOv8n — MILCO/NOMBO Baseline'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner">
          <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Sparkles
              className={`w-3.5 h-3.5 ${
                isDemoMode ? 'text-amber-400' : 'text-slate-500'
              }`}
            />
            <span className="hidden sm:inline">Demo Mode</span>
          </span>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none"
            title={
              isDemoMode
                ? 'Disable Demo Mode and use Live Backend'
                : 'Enable standalone Demo Mode with pre-loaded scans'
            }
          >
            {isDemoMode ? (
              <ToggleRight className="w-6 h-6 text-amber-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-500" />
            )}
          </button>
        </div>

        {/* Backend Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 shadow-inner">
          <div
            className={`w-2 h-2 rounded-full ${
              isDemoMode
                ? 'bg-amber-400'
                : isBackendConnected
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-red-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isDemoMode
              ? 'Demo Env'
              : isBackendConnected
              ? 'FastAPI Live'
              : 'Backend Offline'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all focus:outline-none disabled:opacity-50 active:scale-95"
          title="Refresh Data from Server"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`}
          />
        </button>
      </div>
    </header>
  );
};
