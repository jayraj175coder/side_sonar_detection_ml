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
  X,
  Crosshair,
  Eye,
  BarChart2,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';


interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const {
    activeTab,
    setActiveTab,
    isBackendConnected,
    apiHealth,
    isDemoMode,
    modelInfo,
  } = useApp();

  const missionNavItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[] = [
    { id: 'mission',   label: 'Mission Control', icon: Crosshair, badge: 'SX-014' },
    { id: 'sonar',     label: 'Sonar Viewer',    icon: Eye },
    { id: 'analytics', label: 'Analytics',        icon: BarChart2 },
  ];

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scan', label: 'New Scan', icon: ScanLine, badge: 'Live' },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'map', label: 'Detection Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'model', label: 'Model Intel', icon: Cpu },
  ];

  const handleSelectTab = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`w-64 bg-[#070D1B]/95 backdrop-blur-2xl border-r border-cyan-500/10 flex flex-col justify-between shrink-0 h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 relative overflow-hidden shadow-lg shadow-cyan-950/40">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-extrabold tracking-wider text-slate-100">
                    SONARX
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    AI-SSS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
                  Sonar Intelligence
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-0.5">
            {/* Mission Intel Section */}
            <div className="px-3 py-2">
              <span className="text-[8px] font-mono font-black uppercase tracking-widest text-[#32E6D1]/60 flex items-center gap-1.5">
                <Zap className="w-2.5 h-2.5" />
                Mission Intel
              </span>
            </div>
            {missionNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#32E6D1]/20 to-[#29B6F6]/10 text-[#32E6D1] border border-[#32E6D1]/40 shadow-lg shadow-cyan-950/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-[#32E6D1] scale-110' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      item.badge === 'SX-014'
                        ? 'bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/30'
                        : 'bg-cyan-400 text-slate-950'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Divider */}
            <div className="px-3 py-2 mt-1">
              <div className="h-px bg-[#16303B]/60" />
            </div>
            <div className="px-3 pb-1">
              <span className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-500/60">
                Data Tools
              </span>
            </div>

            {/* Standard nav items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-cyan-400 scale-110' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status Bar */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#050914]/90">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>System Diagnostics</span>
            <span className="text-[10px] text-cyan-400 font-bold">ONNX-RT</span>
          </div>

          {/* API Status */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-300 font-mono text-[11px]">FastAPI Backend</span>
            </div>
            {isDemoMode ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Demo
              </span>
            ) : isBackendConnected ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono text-red-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Offline
              </span>
            )}
          </div>

          {/* Model Status */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-300 font-mono text-[11px]">YOLOv8n ONNX</span>
            </div>
            {isDemoMode ? (
              <span className="text-[10px] font-mono text-cyan-400 font-bold">Synthetic</span>
            ) : apiHealth?.model_loaded || modelInfo?.model_loaded ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Loaded
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Missing
              </span>
            )}
          </div>

          {/* Tag */}
          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Target: MoES Marine Debris</span>
            <span>640×640 px</span>
          </div>
        </div>
      </aside>
    </>
  );
};
