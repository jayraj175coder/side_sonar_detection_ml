import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HealthResponse,
  ModelInfo,
  PredictionResponse,
  StatsResponse,
  TabType,
} from '../types';
import { api } from '../services/api';
import { DEMO_SCANS, DEMO_STATS } from '../services/demoData';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  currentScan: PredictionResponse | null;
  setCurrentScan: (scan: PredictionResponse | null) => void;
  scans: PredictionResponse[];
  stats: StatsResponse | null;
  modelInfo: ModelInfo | null;
  apiHealth: HealthResponse | null;
  isBackendConnected: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  refreshData: () => Promise<void>;
  deleteScan: (scanId: string) => Promise<void>;
  loadDemoScan: (scanId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentScan, setCurrentScan] = useState<PredictionResponse | null>(null);
  const [scans, setScans] = useState<PredictionResponse[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionAndLoad = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      setScans(DEMO_SCANS);
      setStats(DEMO_STATS);
      if (!currentScan) {
        setCurrentScan(DEMO_SCANS[0]);
      }
      setIsLoading(false);
      return;
    }

    try {
      const health = await api.checkHealth();
      setApiHealth(health);
      setIsBackendConnected(true);

      const [model, statsData, scansList] = await Promise.all([
        api.getModelInfo().catch(() => null),
        api.getStats().catch(() => null),
        api.listScans().catch(() => []),
      ]);

      if (model) setModelInfo(model);
      if (statsData) setStats(statsData);
      if (scansList) setScans(scansList);
    } catch (err: any) {
      console.warn('Backend connection check failed:', err.message);
      setIsBackendConnected(false);
      // Auto-fallback suggestion without silently obscuring live status
      if (scans.length === 0) {
        setScans([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    checkConnectionAndLoad();
    const interval = setInterval(() => {
      if (!isDemoMode) {
        api
          .checkHealth()
          .then((h) => {
            setApiHealth(h);
            setIsBackendConnected(true);
          })
          .catch(() => {
            setIsBackendConnected(false);
          });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [checkConnectionAndLoad, isDemoMode]);

  const refreshData = async () => {
    await checkConnectionAndLoad();
  };

  const deleteScan = async (scanId: string) => {
    if (isDemoMode) {
      setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
      if (currentScan?.scan_id === scanId) {
        setCurrentScan(null);
      }
      return;
    }

    try {
      await api.deleteScan(scanId);
      setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
      if (currentScan?.scan_id === scanId) {
        setCurrentScan(null);
      }
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      setError(`Failed to delete scan: ${err.message}`);
    }
  };

  const loadDemoScan = (scanId: string) => {
    const demo = DEMO_SCANS.find((s) => s.scan_id === scanId);
    if (demo) {
      setCurrentScan(demo);
      setActiveTab('scan');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDemoMode,
        setIsDemoMode,
        currentScan,
        setCurrentScan,
        scans,
        stats,
        modelInfo,
        apiHealth,
        isBackendConnected,
        isLoading,
        error,
        setError,
        refreshData,
        deleteScan,
        loadDemoScan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
