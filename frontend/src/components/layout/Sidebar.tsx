import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  History,
  MapPin,
  FileText,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isBackendConnected,
    apiHealth,
    isDemoMode,
    modelInfo,
  } = useApp();

  const navItems: { id: TabType; label: string; icon: React.ComponentType<any>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scan', label: 'New Scan', icon: ScanLine },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'map', label: 'Detection Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'model', label: 'Model Intel', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-[#080E1C] border-r border-[#15233E] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-[#15233E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 relative overflow-hidden group">
              <Radio className="w-5 h-5 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base font-bold tracking-wider text-slate-100">
                  SONARX
                </span>
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
                Sonar Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.id === 'scan' && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status Bar */}
      <div className="p-4 border-t border-[#15233E] space-y-3 bg-[#060A14]">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>System Diagnostics</span>
          <span className="text-[10px] text-cyan-400">ONNX-RT</span>
        </div>

        {/* API Status */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono text-[11px]">FastAPI Backend</span>
          </div>
          {isDemoMode ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Demo
            </span>
          ) : isBackendConnected ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Offline
            </span>
          )}
        </div>

        {/* Model Status */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono text-[11px]">YOLOv8n ONNX</span>
          </div>
          {isDemoMode ? (
            <span className="text-[11px] font-mono text-cyan-400">Synthetic</span>
          ) : apiHealth?.model_loaded || modelInfo?.model_loaded ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Loaded
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Missing
            </span>
          )}
        </div>

        {/* Environment Indicator */}
        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Target: MILCO / NOMBO</span>
          <span>640×640 px</span>
        </div>
      </div>
    </aside>
  );
};
