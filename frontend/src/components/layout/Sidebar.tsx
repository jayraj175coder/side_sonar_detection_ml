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
  Navigation,
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
    { id: 'overview',      label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'scan',          label: 'Upload & Analyze', icon: UploadCloud, badge: 'ONNX', tooltip: 'ONNX Runtime: Accelerated CPU/GPU Tensor Inference Engine' },
    { id: 'mission',       label: 'Mission Control',  icon: Crosshair, badge: 'HERO', tooltip: 'Guided Subsea Survey & Hero Target Identification' },
    { id: 'map',           label: 'Subsea Map',       icon: MapPin },
    { id: 'route-planner', label: 'Route Planner',    icon: Navigation, badge: 'TSP', tooltip: 'Smart Multi-Vessel TSP Route Optimizer & Marine GPX Navigation Export' },
    { id: 'tracking',      label: 'Target Tracking',  icon: Activity, badge: 'DEMO', tooltip: 'Temporal AFP lifecycle tracking across multi-epoch surveys' },
    { id: 'analytics',     label: 'Analytics',        icon: BarChart2 },
    { id: 'reports',       label: 'Reports Dossier',  icon: FileText },
    { id: 'model',         label: 'Model Intel',      icon: Cpu, badge: 'YOLOv8s', tooltip: 'YOLOv8s Vision Backbone & Physical Validation Benchmarks' },
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
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Sidebar Header Logo */}
        <div className="h-14 border-b border-white/[0.08] px-4 flex items-center shrink-0 bg-[#070B12]/90">
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
              <SonarxLogoIcon size={32} animated={true} />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            {!isSidebarCollapsed && (
              <p className="px-3 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                PLATFORM MODULES
              </p>
            )}
            <nav className="space-y-1.5">
              {primaryNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={item.tooltip || item.label}
                    className={`w-full relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[15px] font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-[#0284c7] text-white font-semibold shadow-[0_4px_20px_rgba(2,132,199,0.4)] border border-sky-400/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                          : 'text-slate-400 group-hover:text-slate-100'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
                    )}

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        title={item.tooltip}
                        className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30 shadow-xs'
                            : 'bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!isSidebarCollapsed && !item.badge && (
                      <span className={`keycap opacity-0 group-hover:opacity-60 transition-opacity text-[10px] ${isActive ? 'text-white/60 border-white/20' : ''}`}>
                        {index + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* System Health / Status Indicators at bottom */}
        <div className="p-3 border-t border-white/[0.08] bg-[#070B12]/60 mt-auto">
          {!isSidebarCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
                <span>SYSTEM</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NOMINAL
                </span>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-400 bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                {[
                  { name: 'Perception Engine', status: 'ACTIVE' },
                  { name: 'AI Model (YOLOv8s)', status: 'ACTIVE' },
                  { name: 'ONNX Runtime', status: '14.2ms' },
                  { name: 'Geo-Localization', status: 'WGS-84' },
                  { name: 'Acoustic Filter', status: 'PHYSICS' },
                  { name: 'Tracking Module', status: 'READY' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {s.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">{s.status}</span>
                  </div>
                ))}
              </div>
              <div className="px-1 text-[9px] font-mono text-slate-500 text-center tracking-wider pt-1">
                MoES // INDIAN EEZ RECONNAISSANCE
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-1" title="System Status: All nominal">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
