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
  Activity,
} from 'lucide-react';
import { SonarxLogo, SonarxLogoIcon } from '../common/SonarxLogo';
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
  const { activeTab, setActiveTab, isSidebarCollapsed, isBackendConnected } = useApp();

  const primaryNavItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
    tooltip?: string;
  }[] = [
    { id: 'overview',  label: 'Overview',         icon: LayoutDashboard },
    { id: 'scan',      label: 'Upload & Analyze', icon: UploadCloud, badge: 'ONNX', tooltip: 'ONNX Runtime: Accelerated CPU/GPU Tensor Inference Engine' },
    { id: 'mission',   label: 'Mission Control',  icon: Crosshair, badge: 'HERO', tooltip: 'Guided Subsea Survey & Hero Target Identification' },
    { id: 'map',       label: 'Subsea Map',       icon: MapPin },
    { id: 'analytics', label: 'Analytics',        icon: BarChart2 },
    { id: 'tracking',  label: 'Target Tracking',  icon: Activity, badge: 'DEMO', tooltip: 'Temporal AFP lifecycle tracking across multi-epoch surveys' },
    { id: 'reports',   label: 'Reports Dossier',  icon: FileText },
    { id: 'model',     label: 'Model Intel',      icon: Cpu, badge: 'YOLOv8s', tooltip: 'YOLOv8s Vision Backbone & Physical Validation Benchmarks' },
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
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-[#05070B] border-r border-white/[0.08] transition-all duration-300 ease-in-out font-sans select-none shadow-2xl ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Sidebar Header Logo */}
        <div className="h-13 border-b border-white/[0.08] px-3.5 flex items-center shrink-0 bg-[#070B12]/90">
          {!isSidebarCollapsed ? (
            <SonarxLogo
              size="sm"
              subtitle="MoES Subsea Intelligence"
              badge="SIH 26057"
              animated={true}
              onClick={() => setActiveTab('overview')}
            />
          ) : (
            <div
              className="mx-auto cursor-pointer group"
              onClick={() => setActiveTab('overview')}
              title="SONARX // Overview"
            >
              <SonarxLogoIcon size={30} animated={true} />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                PLATFORM MODULES
              </p>
            )}
            <nav className="space-y-1">
              {primaryNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={item.tooltip || item.label}
                    className={`w-full relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12] shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#FFB703] rounded-r shadow-[0_0_8px_#FFB703]" />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-[#FFB703] drop-shadow-[0_0_6px_rgba(255,183,3,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
                    )}
                    
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        title={item.tooltip}
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#FFB703] text-[#05070B] shadow-xs'
                            : 'bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!isSidebarCollapsed && !item.badge && (
                      <span className="keycap opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Diagnostics & MoES Seal */}
        <div className="p-3 border-t border-white/[0.08] bg-[#070B12]/80 shrink-0 space-y-2">
          {!isSidebarCollapsed ? (
            <>
              {/* Subsystem Status Indicators */}
              <div className="space-y-1.5">
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest px-1">SUBSYSTEMS</div>

                {/* Perception Engine — live state */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-300 text-[10px] font-medium">Perception Engine</span>
                  <span className={`flex items-center gap-1 text-[9px] font-mono font-bold ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {isBackendConnected ? 'ONLINE' : 'DEMO'}
                  </span>
                </div>

                {/* Model */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-300 text-[10px] font-medium">AI Model</span>
                  <span className="text-[9px] font-mono font-bold text-[#FFB703]">YOLOv8s</span>
                </div>

                {/* ONNX Runtime */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-300 text-[10px] font-medium">Runtime</span>
                  <span className="text-[9px] font-mono font-bold text-[#FFB703]">ONNX 14.2ms</span>
                </div>

                {/* Noise / Physics Filter */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-300 text-[10px] font-medium">Acoustic Filter</span>
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                </div>

                {/* Tracking Module */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-300 text-[10px] font-medium">AFP Tracking</span>
                  <span className="text-[9px] font-mono font-bold text-amber-400">DEMO</span>
                </div>
              </div>

              {/* MoES Protocol Banner */}
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs space-y-0.5">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FFB703]" />
                    MoES // INDIA EEZ
                  </span>
                  <span className="text-[#FFB703] font-mono text-[9px]">ORDER 1A</span>
                </div>
                <div className="text-[9.5px] text-slate-400 leading-tight font-mono">
                  WGS84 Subsea Debris Protocol
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center py-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
