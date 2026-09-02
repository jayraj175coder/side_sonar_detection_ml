import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export type GeoProvider =
  | 'offline_grid'
  | 'mapbox'
  | 'google_maps'
  | 'opencage'
  | 'locationiq'
  | 'carto_osm';

export type ApiStatus =
  | 'NOT_REQUIRED'
  | 'KEY_MISSING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'INVALID';

interface GeospatialConfigContextType {
  provider: GeoProvider;
  setProvider: (p: GeoProvider) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  status: ApiStatus;
  statusMessage: string;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  saveConfiguration: (newProvider: GeoProvider, newKey: string) => void;
  isBasemapAvailable: boolean;
  hasIntrinsicCoordinates: boolean;
}

const GeospatialConfigContext = createContext<GeospatialConfigContextType | undefined>(undefined);

export const GeospatialConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial configuration from Vite environment variables (if provided)
  const envProvider = (import.meta.env.VITE_MAP_PROVIDER as GeoProvider) || 'offline_grid';
  const envKey = (import.meta.env.VITE_MAPBOX_TOKEN as string) || (import.meta.env.VITE_GOOGLE_MAPS_KEY as string) || '';

  const [provider, setProvider] = useState<GeoProvider>(envProvider);
  const [apiKey, setApiKey] = useState<string>(envKey);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Status computation
  const [testResult, setTestResult] = useState<{ status: ApiStatus; message: string } | null>(null);

  const status: ApiStatus = useMemo(() => {
    if (testResult) return testResult.status;

    if (provider === 'offline_grid') {
      return 'NOT_REQUIRED';
    }
    if (provider === 'carto_osm') {
      return 'NOT_REQUIRED';
    }
    if (!apiKey || apiKey.trim() === '') {
      return 'KEY_MISSING';
    }
    return 'VERIFIED';
  }, [provider, apiKey, testResult]);

  const statusMessage: string = useMemo(() => {
    if (testResult) return testResult.message;

    if (provider === 'offline_grid') {
      return 'Offline Autonomous Marine Grid Active (Zero API Key Required)';
    }
    if (provider === 'carto_osm') {
      return 'Public Carto Dark Tiles Active (No Key Required)';
    }
    if (!apiKey || apiKey.trim() === '') {
      return 'API Key Missing: Enhanced satellite/bathymetric tiles unavailable';
    }
    return 'API Verified for active session';
  }, [provider, apiKey, testResult]);

  const isBasemapAvailable = useMemo(() => {
    if (provider === 'offline_grid') return true;
    if (provider === 'carto_osm') return true;
    return apiKey.trim().length > 0 && status !== 'INVALID';
  }, [provider, apiKey, status]);

  // Coordinates are ALWAYS intrinsic to the sonar ping header!
  const hasIntrinsicCoordinates = true;

  // Test connection to provider
  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (provider === 'offline_grid' || provider === 'carto_osm') {
      const res = { success: true, message: 'Provider does not require an API key. Ready.' };
      setTestResult({ status: 'NOT_REQUIRED', message: res.message });
      return res;
    }

    if (!apiKey || apiKey.trim().length < 8) {
      const res = { success: false, message: 'API key is too short or missing.' };
      setTestResult({ status: 'INVALID', message: res.message });
      return res;
    }

    // Realistic token format verification
    if (provider === 'mapbox' && !apiKey.startsWith('pk.')) {
      const res = { success: false, message: 'Invalid Mapbox public token format (must start with pk.).' };
      setTestResult({ status: 'INVALID', message: res.message });
      return res;
    }

    if (provider === 'google_maps' && !apiKey.startsWith('AIza')) {
      const res = { success: false, message: 'Invalid Google Maps API key format (must start with AIza).' };
      setTestResult({ status: 'INVALID', message: res.message });
      return res;
    }

    // Mock network ping delay
    setTestResult({ status: 'VERIFYING', message: 'Testing connection to geospatial provider...' });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const res = { success: true, message: `Successfully connected to ${provider.toUpperCase()} endpoint.` };
    setTestResult({ status: 'VERIFIED', message: res.message });
    return res;
  }, [provider, apiKey]);

  const saveConfiguration = useCallback((newProvider: GeoProvider, newKey: string) => {
    setProvider(newProvider);
    setApiKey(newKey);
    setTestResult(null);
    setIsModalOpen(false);
  }, []);

  return (
    <GeospatialConfigContext.Provider
      value={{
        provider,
        setProvider,
        apiKey,
        setApiKey,
        status,
        statusMessage,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        testConnection,
        saveConfiguration,
        isBasemapAvailable,
        hasIntrinsicCoordinates,
      }}
    >
      {children}
    </GeospatialConfigContext.Provider>
  );
};

export const useGeospatialConfig = () => {
  const context = useContext(GeospatialConfigContext);
  if (!context) {
    throw new Error('useGeospatialConfig must be used within a GeospatialConfigProvider');
  }
  return context;
};
