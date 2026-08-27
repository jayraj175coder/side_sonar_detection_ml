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
  Layers,
  Trash2,
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
    selectedPipeline,
    setSelectedPipeline,
    refreshData,
    isLoading,
    currentScan,
  } = useApp();

  return (
    <header className="h-16 md:h-20 bg-[#070D1B]/80 backdrop-blur-2xl border-b border-cyan-500/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
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
                Active: {currentScan.scan_id}
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
        {/* Pipeline Selector */}
        <div className="hidden lg:flex items-center rounded-xl bg-slate-950/80 border border-slate-800 p-1 text-[11px] font-mono">
          <button
            onClick={() => setSelectedPipeline('debris')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedPipeline === 'debris'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="SIH Marine Debris & Underwater Anomaly Pipeline with Clutter Filtering"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SIH Debris AI</span>
          </button>
          <button
            onClick={() => setSelectedPipeline('baseline')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedPipeline === 'baseline'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Baseline Sonar Anomaly Pipeline (MILCO / NOMBO)"
          >
            <span>MILCO Baseline</span>
          </button>
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
