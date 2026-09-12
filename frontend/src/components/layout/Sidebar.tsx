import React from 'react';
import {
  Crosshair,
  UploadCloud,
  MapPin,
  BarChart2,
  FileText,
  Cpu,
  LayoutDashboard,
  Radio,
  ShieldAlert,
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
  } = useApp();

  const primaryNavItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[] = [
    { id: 'overview',  label: 'Overview',         icon: LayoutDashboard },
    { id: 'scan',      label: 'Upload & Analyze',  icon: UploadCloud, badge: 'ONNX' },
    { id: 'mission',   label: 'Mission Control',  icon: Crosshair, badge: 'HERO' },
    { id: 'map',       label: 'Subsea Map',       icon: MapPin },
    { id: 'analytics', label: 'Analytics',        icon: BarChart2 },
    { id: 'reports',   label: 'Reports Dossier',  icon: FileText },
    { id: 'model',     label: 'Model Intel',      icon: Cpu, badge: 'YOLOv8s' },
  ];

  const handleNavClick = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-[#050B14] border-r border-[#102436] transition-all duration-300 ease-in-out font-sans select-none shadow-2xl ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Sidebar Header Logo */}
        <div className="h-16 border-b border-[#102436] px-4 flex items-center justify-between shrink-0 bg-[#07111D]/80">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-wider flex items-center gap-2">
                  <span>SONARX</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
                    SIH 26057
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">MoES Subsea Perception</div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest mb-3">
                PERCEPTION NAVIGATION
              </p>
            )}
            <nav className="space-y-1.5">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-transparent border border-cyan-500/40 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#0A1926]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-[0_0_10px_#06b6d4]" />
                    )}

                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-cyan-400 text-slate-950 shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Diagnostics & MoES Seal */}
        <div className="p-3.5 border-t border-[#102436] bg-[#040810] shrink-0 space-y-2.5">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#091522] border border-[#102436]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-slate-200 text-xs font-semibold">AI Perception Engine</span>
                </div>
                <span className="text-[10px] font-mono font-extrabold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">ONLINE</span>
              </div>

              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#091827] to-[#050C16] border border-cyan-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    MoES // INDIA EEZ
                  </span>
                  <span className="text-teal-400 font-mono text-[10px]">NIOT COMPLIANT</span>
                </div>
                <div className="text-[10px] text-slate-300 leading-tight">
                  WGS84 Subsea Debris & Anomaly Perception Protocol
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center py-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

