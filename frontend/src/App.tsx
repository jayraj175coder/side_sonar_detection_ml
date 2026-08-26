import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { DetectionMapPage } from './pages/DetectionMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { useApp } from './context/AppContext';

export const App: React.FC = () => {
  const { activeTab } = useApp();

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
          title: 'Inspection Reports',
          subtitle: 'Formal naval inspection reports and data export',
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

  return (
    <div className="flex h-screen bg-[#070B14] text-slate-100 overflow-hidden font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'scan' && <NewScanPage />}
          {activeTab === 'history' && <ScanHistoryPage />}
          {activeTab === 'map' && <DetectionMapPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'model' && <ModelInfoPage />}
        </main>
      </div>
    </div>
  );
};
