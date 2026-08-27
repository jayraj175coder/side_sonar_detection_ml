import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { DetectionMapPage } from './pages/DetectionMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { useApp } from './context/AppContext';
import {
  LayoutDashboard,
  ScanLine,
  History,
  MapPin,
  FileText,
  Cpu,
} from 'lucide-react';
import { TabType } from './types';

export const App: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageHeaderInfo = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Mission Overview',
          subtitle: 'Aggregate acoustic survey metrics & live telemetry',
        };
      case 'scan':
        return {
          title: 'Acoustic Target Inspection',
          subtitle: 'Upload side-scan sonar imagery for YOLOv8n object detection',
        };
      case 'history':
        return {
          title: 'Survey Archive',
          subtitle: 'Comprehensive log of analyzed side-scan sonar tracks',
        };
      case 'map':
        return {
          title: 'Detection Map',
          subtitle: 'Geospatial overview of analyzed sonar scans',
        };
      case 'reports':
        return {
          title: 'Acoustic Inspection Reports',
          subtitle: 'Formal MoES environmental survey reports and data export',
        };
      case 'model':
        return {
          title: 'Neural Model Specifications',
          subtitle: 'YOLOv8n ONNX architecture and empirical validation benchmarks',
        };
      default:
        return {
          title: 'SONARX',
          subtitle: 'AI-Powered Side-Scan Sonar Intelligence',
        };
    }
  };

  const headerInfo = getPageHeaderInfo();

  const mobileNavItems: { id: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan', icon: ScanLine },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'history', label: 'Archive', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#060913] text-slate-100 overflow-hidden font-sans select-none">
      {/* Fixed Left Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'scan' && <NewScanPage />}
          {activeTab === 'history' && <ScanHistoryPage />}
          {activeTab === 'map' && <DetectionMapPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'model' && <ModelInfoPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070D1B]/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around z-40 px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
