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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
    isSidebarCollapsed,
    toggleSidebar,
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
        className={`bg-[#070D1B]/95 backdrop-blur-2xl border-r border-cyan-500/10 flex flex-col justify-between shrink-0 h-screen fixed md:sticky top-0 z-50 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'}`}
      >
        {/* Top Branding & Collapse Button */}
        <div>
          <div className={`p-4 border-b border-slate-800/80 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 relative overflow-hidden shadow-lg shadow-cyan-950/40 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-base font-extrabold tracking-wider text-slate-100 truncate">
                      SONARX
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                      AI-SSS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 truncate">
                    Sonar Intelligence
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={toggleSidebar}
                title="Expand side panel"
                className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/25 transition-all shadow-lg group"
              >
                <Radio className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar to left'}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors shrink-0"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

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
          <nav className={`p-2 space-y-0.5 ${isSidebarCollapsed ? 'px-2' : 'p-3'}`}>
            {/* Mission Intel Section Header */}
            {!isSidebarCollapsed && (
              <div className="px-3 py-2">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest text-[#32E6D1]/60 flex items-center gap-1.5">
                  <Zap className="w-2.5 h-2.5" />
                  Mission Intel
                </span>
              </div>
            )}

            {missionNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#32E6D1]/20 to-[#29B6F6]/10 text-[#32E6D1] border border-[#32E6D1]/40 shadow-lg shadow-cyan-950/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 transition-transform shrink-0 ${isActive ? 'text-[#32E6D1] scale-110' : 'text-slate-500'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
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
            <div className="px-2 py-2">
              <div className="h-px bg-[#16303B]/60" />
            </div>

            {!isSidebarCollapsed && (
              <div className="px-3 pb-1">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-500/60">
                  Data Tools
                </span>
              </div>
            )}

            {/* Standard nav items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon
                      className={`w-4 h-4 transition-transform shrink-0 ${
                        isActive ? 'text-cyan-400 scale-110' : 'text-slate-500'
                      }`}
                    />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status Bar */}
        <div className={`p-3 border-t border-slate-800/80 space-y-2 bg-[#050914]/90 ${isSidebarCollapsed ? 'text-center' : ''}`}>
          {!isSidebarCollapsed ? (
            <>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>System Diagnostics</span>
                <span className="text-[10px] text-cyan-400 font-bold">ONNX-RT</span>
              </div>

              {/* API Status */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
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
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
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
              {/* Perception System Status Badge */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#080B11] border border-[#3FD98A]/30 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3FD98A] animate-pulse" />
                  <span className="text-[#3FD98A] font-bold">Auto-Perception</span>
                </div>
                <span className="text-[9px] text-[#4CD9E8]">Active</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={toggleSidebar}
                title="System Online · Click to expand"
                className="w-3 h-3 rounded-full bg-[#3FD98A] animate-pulse"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
;
