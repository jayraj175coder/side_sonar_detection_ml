import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { DetectionMapPage } from './pages/DetectionMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { MissionPage } from './pages/MissionPage';
import { SonarViewerPage } from './pages/SonarViewerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TrackingPage } from './pages/TrackingPage';
import { MissionProvider } from './context/MissionContext';
import { GeospatialConfigProvider } from './context/GeospatialConfigContext';
import { GeospatialConfigModal } from './components/common/GeospatialConfigModal';
import { FloatingDemoController } from './components/common/FloatingDemoController';
import { AmbientOceanBackdrop } from './components/common/AmbientOceanBackdrop';
import { TacticalSonarCursor } from './components/common/TacticalSonarCursor';
import { useApp } from './context/AppContext';
import {
  LayoutDashboard, ScanLine, History, MapPin, FileText, Cpu, Crosshair, Eye, BarChart2,
} from 'lucide-react';
import { TabType } from './types';

export const App: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageHeaderInfo = () => {
    switch (activeTab) {
      case 'overview':  return { title: 'SONARX // Overview',             subtitle: 'Automated Side-Scan Sonar Intelligence for Marine Survey Teams' };
      case 'scan':      return { title: 'Upload & Analyze',               subtitle: 'Raw side-scan sonar image ingestion & automated YOLOv8 ONNX perception' };
      case 'mission':   return { title: 'Mission Control',                subtitle: 'Mumbai Shelf Corridor · Interactive Side-Scan Analysis Workstation' };
      case 'map':       return { title: 'Subsea Map',                     subtitle: 'Geospatial coordinate mapping & acoustic anomaly positions' };
      case 'analytics': return { title: 'Mission Analytics',              subtitle: 'Anomaly distributions, noise suppression ratios & survey efficiency metrics' };
      case 'tracking':  return { title: 'Temporal Target Tracking',       subtitle: 'Acoustic Fingerprint (AFP) lifecycle: NEW → STILL THERE → MOVED → GONE across multi-epoch surveys' };
      case 'reports':   return { title: 'Marine Debris Anomaly Dossier',  subtitle: 'MoES compliance reports, WGS84 target registers & retrieval recommendations' };
      case 'model':     return { title: 'Model Intel',                    subtitle: 'YOLOv8s ONNX perception architecture, acoustic noise filter & validation metrics' };
      default:          return { title: 'SONARX',                         subtitle: 'Automated Side-Scan Sonar Intelligence for Marine Survey Teams' };
    }
  };

  const headerInfo = getPageHeaderInfo();

  const mobileNavItems: { id: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'mission',  label: 'Mission',  icon: Crosshair },
    { id: 'map',      label: 'Map',      icon: MapPin },
    { id: 'reports',  label: 'Reports',  icon: FileText },
  ];

  // Mission pages are full-screen (no header/sidebar padding)
  const isMissionFullscreen = activeTab === 'mission';

  return (
    <GeospatialConfigProvider>
      <MissionProvider>
        <div className="flex h-screen bg-[#05070B] text-slate-100 overflow-hidden font-sans select-none relative">
          {/* Global Ambient Hydrographic Backdrop */}
          <AmbientOceanBackdrop />

          {/* Fixed Left Sidebar */}
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
            {/* Header (Hidden on dedicated Mission Control workstation) */}
            {activeTab !== 'mission' && (
              <Header
                title={headerInfo.title}
                subtitle={headerInfo.subtitle}
                onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            )}

            {/* Page content */}
            {activeTab === 'mission' ? (
              <div className="flex-1 overflow-hidden">
                <MissionPage />
              </div>
            ) : (
              <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative">
                <div className="w-full px-4 md:px-6 py-4 md:py-6 space-y-4 relative z-10">
                {activeTab === 'overview'  && <OverviewPage />}
                {activeTab === 'scan'      && <NewScanPage />}
                {activeTab === 'history'   && <ScanHistoryPage />}
                {activeTab === 'map'       && <DetectionMapPage />}
                {activeTab === 'reports'   && <ReportsPage />}
                {activeTab === 'model'     && <ModelInfoPage />}
                {activeTab === 'sonar'     && <SonarViewerPage />}
                {activeTab === 'analytics' && <AnalyticsPage />}
                {activeTab === 'tracking'  && <TrackingPage />}
              </div>
            </main>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070B12]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around z-40 px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all ${
                  isActive ? 'text-[#FFB703] font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
        <FloatingDemoController />
        <TacticalSonarCursor />
      </div>
      <GeospatialConfigModal />
    </MissionProvider>
  </GeospatialConfigProvider>
);
};
