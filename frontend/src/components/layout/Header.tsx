import React from 'react';
import { Radio, RefreshCw, ToggleLeft, ToggleRight, Sparkles, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    isBackendConnected,
    isDemoMode,
    setIsDemoMode,
    refreshData,
    isLoading,
    currentScan,
  } = useApp();

  return (
    <header className="h-16 bg-[#080E1C]/90 backdrop-blur border-b border-[#15233E] px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Context */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h1>
          {currentScan && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Active: {currentScan.scan_id}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium tracking-tight mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Controls & Mode Switcher */}
      <div className="flex items-center gap-4">
        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C1427] border border-[#1E2E4E]">
          <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-400' : 'text-slate-400'}`} />
            Demo Mode
          </span>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none"
            title={isDemoMode ? "Disable Demo Mode and use Live Backend" : "Enable standalone Demo Mode with pre-loaded scans"}
          >
            {isDemoMode ? (
              <ToggleRight className="w-6 h-6 text-amber-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        {/* Backend Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C1427] border border-[#1E2E4E]">
          <div
            className={`w-2 h-2 rounded-full ${
              isDemoMode
                ? 'bg-amber-400'
                : isBackendConnected
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-red-400'
            }`}
          />
          <span className="text-xs font-mono text-slate-300">
            {isDemoMode
              ? 'Demo Environment'
              : isBackendConnected
              ? 'FastAPI Connected'
              : 'Backend Offline'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 rounded-lg bg-[#0C1427] border border-[#1E2E4E] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all focus:outline-none disabled:opacity-50"
          title="Refresh Data from Server"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
