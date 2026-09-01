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
    { id: 'sonar',     label: 'Debris Intel',    icon: Eye,       badge: 'NODE-04' },
    { id: 'analytics', label: 'Analytics',        icon: BarChart2 },
  ];

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Upload & Classify', icon: ScanLine, badge: 'AI-SSS' },
    { id: 'history', label: 'Survey Archive', icon: History },
    { id: 'map', label: 'Subsea Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'model', label: 'Model Intel', icon: Cpu, badge: 'ONNX' },
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-[#060D17] border-r border-[#152438] transition-all duration-300 ease-in-out font-mono select-none ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 md:h-18 flex items-center justify-between px-4 border-b border-[#152438] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#4CD9E8]/15 border border-[#4CD9E8]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(76,217,232,0.3)]">
              <Radio className="w-5 h-5 text-[#4CD9E8] animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-base text-[#EAEFF5] tracking-wider uppercase flex items-center gap-1.5">
                  <span>SONARX</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/40 font-mono">
                    v2.4
                  </span>
                </span>
                <span className="text-[10px] text-[#7C8AA0] tracking-tight">
                  MoES Subsea Perception
                </span>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-[#7C8AA0] hover:text-[#EAEFF5] md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

          {/* Section 1: Tactical Operations */}
          <div>
            {!isSidebarCollapsed && (
              <p className="px-3 text-[9px] font-bold text-[#4CD9E8] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-[#4CD9E8]" />
                Tactical Operations
              </p>
            )}
            <nav className="space-y-1">
              {missionNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4CD9E8]/20 to-[#29B6F6]/10 border border-[#4CD9E8]/40 text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.15)] font-bold'
                        : 'text-[#7C8AA0] hover:text-[#EAEFF5] hover:bg-[#0A1322]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#4CD9E8]' : 'text-[#7C8AA0]'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-[#4CD9E8] text-[#03070E]'
                            : 'bg-[#0A1322] border border-[#152438] text-[#7C8AA0]'
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

          {/* Section 2: AI Tools & Records */}
          <div>
            {!isSidebarCollapsed && (
              <p className="px-3 text-[9px] font-bold text-[#7C8AA0] uppercase tracking-widest mb-2">
                Tools & Records
              </p>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4CD9E8]/20 to-[#29B6F6]/10 border border-[#4CD9E8]/40 text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.15)] font-bold'
                        : 'text-[#7C8AA0] hover:text-[#EAEFF5] hover:bg-[#0A1322]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#4CD9E8]' : 'text-[#7C8AA0]'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-[#4CD9E8] text-[#03070E]'
                            : 'bg-[#0A1322] border border-[#152438] text-[#7C8AA0]'
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

        {/* System Diagnostics Footer */}
        <div className="p-3 border-t border-[#152438] bg-[#060D17] shrink-0 space-y-2">
          {!isSidebarCollapsed ? (
            <>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#7C8AA0] flex items-center justify-between">
                <span>System Diagnostics</span>
                <span className="text-[9px] text-[#4CD9E8] font-bold">ONNX-RT</span>
              </div>

              {/* API Status */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A1322] border border-[#152438] text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#7C8AA0]" />
                  <span className="text-[#EAEFF5] font-mono text-[10px]">FastAPI Backend</span>
                </div>
                {isDemoMode ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-[#F5A623] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
                    Demo
                  </span>
                ) : isBackendConnected ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-[#3FD98A] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FD98A] animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-[#F04438] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F04438]" />
                    Offline
                  </span>
                )}
              </div>

              {/* Perception Engine Status (Click to view Model Intel) */}
              <button
                onClick={() => setActiveTab('model')}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0A1322] border border-[#152438] hover:border-[#4CD9E8]/50 text-xs transition-colors cursor-pointer group"
                title="View Neural Model Specifications & Benchmarks"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#4CD9E8] group-hover:animate-pulse" />
                  <span className="text-[#EAEFF5] font-mono text-[10px] group-hover:text-[#4CD9E8]">Classifier Engine</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-[#3FD98A] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-[#3FD98A]" />
                  Active
                </span>
              </button>

              {/* Perception System Status Badge */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A1322] border border-[#3FD98A]/30 text-[9px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3FD98A] animate-pulse" />
                  <span className="text-[#3FD98A] font-bold">Auto-Perception</span>
                </div>
                <span className="text-[9px] text-[#4CD9E8] font-bold">Ready</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={toggleSidebar}
                title="System Online · Click to expand"
                className="w-3 h-3 rounded-full bg-[#3FD98A] animate-pulse cursor-pointer"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
