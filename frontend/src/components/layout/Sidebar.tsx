import React from 'react';
import {
  Crosshair,
  UploadCloud,
  History,
  MapPin,
  Box,
  BarChart2,
  FileText,
  Cpu,
  Layers,
  X,
  Sparkles,
  CheckCircle2,
  Server,
  Eye,
  LayoutDashboard,
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
    isDemoMode,
  } = useApp();

  const primaryNavItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[] = [
    { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
    { id: 'scan',      label: 'Upload & Analyze', icon: UploadCloud, badge: 'ONNX' },
    { id: 'mission',   label: 'Mission Control', icon: Crosshair, badge: 'HERO' },
    { id: 'map',       label: 'Subsea Map',      icon: MapPin },
    { id: 'analytics', label: 'Analytics',       icon: BarChart2 },
    { id: 'reports',   label: 'Reports',         icon: FileText },
    { id: 'model',     label: 'Model Intel',     icon: Cpu, badge: 'YOLOv8' },
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

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-[#081118] border-r border-[#16303B] transition-all duration-300 ease-in-out font-mono select-none ${
          isSidebarCollapsed ? 'w-16' : 'w-60'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Primary Navigation */}
          <div>
            {!isSidebarCollapsed && (
              <p className="px-3 text-[9px] font-bold text-[#6F8992] uppercase tracking-widest mb-2">
                Marine Debris Pipeline
              </p>
            )}
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#32E6D1]/20 to-[#29B6F6]/10 border border-[#32E6D1]/40 text-[#32E6D1] shadow-[0_0_15px_rgba(50,230,209,0.15)] font-bold'
                        : 'text-[#6F8992] hover:text-[#E4F2F5] hover:bg-[#0C171E]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#32E6D1]' : 'text-[#6F8992]'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-[#32E6D1] text-[#03070B]'
                            : 'bg-[#0C171E] border border-[#16303B] text-[#6F8992]'
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

        {/* Footer Diagnostics Strip */}
        <div className="p-3 border-t border-[#16303B] bg-[#081118] shrink-0 space-y-2">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#0C171E] border border-[#16303B] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#65D391] animate-pulse" />
                <span className="text-[#E4F2F5] font-mono text-[10px]">AI Perception Engine</span>
              </div>
              <span className="text-[9px] text-[#32E6D1] font-bold">Online</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#65D391] animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
