import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  AlertOctagon,
  Shield,
  Search,
  Filter,
  Plus,
  Minus,
  Maximize2,
  Navigation,
  X,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PredictionResponse } from '../../types';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

// Custom Tactical Pin Icons
const createPinIcon = (scan: PredictionResponse, isSelected: boolean) => {
  const isMilco = scan.milco_count > 0;
  const primaryColor = isMilco ? '#EF4444' : '#06B6D4';
  const glowColor = isMilco ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)';
  const pulseClass = isMilco ? 'animate-ping' : '';
  const scale = isSelected ? 1.25 : 1.0;

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transform: scale(${scale}); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Outer Sonar Pulse Wave -->
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${primaryColor}; opacity: 0.25;" class="${pulseClass}"></div>
      
      <!-- Middle Tactical Ring -->
      <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #0A1224; border: 2px solid ${primaryColor}; box-shadow: 0 0 12px ${glowColor};"></div>
      
      <!-- Inner Core & Class Dot -->
      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${primaryColor};"></div>

      <!-- Tactical Badge Pill -->
      <div style="position: absolute; bottom: -8px; padding: 1px 4px; border-radius: 4px; background: #060913; border: 1px solid ${primaryColor}; font-size: 8px; font-family: monospace; font-weight: bold; color: ${primaryColor}; white-space: nowrap;">
        ${isMilco ? `${scan.milco_count}M` : `${scan.nombo_count}N`}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-pin-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Cluster Icon for nearby markers
const createClusterIcon = (count: number, hasMilco: boolean) => {
  const color = hasMilco ? '#EF4444' : '#06B6D4';
  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: ${color}; opacity: 0.2; animation: pulse 2s infinite;"></div>
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #090E1D; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px ${color}40;">
        <span style="color: #F8FAFC; font-family: monospace; font-size: 11px; font-weight: bold;">${count}</span>
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-cluster-marker',
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

// Helper Map Controller for Pan/Zoom & Custom Controls
const MapController: React.FC<{
  scans: PredictionResponse[];
  selectedScan: PredictionResponse | null;
}> = ({ scans, selectedScan }) => {
  const map = useMap();

  React.useEffect(() => {
    if (selectedScan?.location.latitude && selectedScan?.location.longitude) {
      map.flyTo(
        [selectedScan.location.latitude, selectedScan.location.longitude],
        11,
        { duration: 1.2 }
      );
    }
  }, [selectedScan, map]);

  return null;
};

// Map click detector to dismiss bottom card when clicking empty space
const MapClickDetector: React.FC<{ onMapClick: () => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: () => onMapClick(),
  });
  return null;
};

export const SonarMap: React.FC = () => {
  const { scans, setCurrentScan, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'MILCO' | 'NOMBO'>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0.0);
  const [selectedScan, setSelectedScan] = useState<PredictionResponse | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const defaultCenter: [number, number] = [25.1, -81.4]; // Florida Straits / Maritime Test Range

  // Filter geolocated scans
  const geolocatedScans = useMemo(() => {
    return scans.filter(
      (s) =>
        s.location.latitude !== null &&
        s.location.longitude !== null &&
        !isNaN(s.location.latitude) &&
        !isNaN(s.location.longitude)
    );
  }, [scans]);

  const filteredScans = useMemo(() => {
    return geolocatedScans.filter((s) => {
      const matchSearch =
        s.scan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.filename.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (classFilter === 'MILCO' && s.milco_count === 0) return false;
      if (classFilter === 'NOMBO' && s.nombo_count === 0) return false;
      if (s.highest_confidence < minConfidence) return false;

      return true;
    });
  }, [geolocatedScans, searchTerm, classFilter, minConfidence]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    if (!mapRef.current || filteredScans.length === 0) return;
    const coords = filteredScans.map(
      (s) => [s.location.latitude!, s.location.longitude!] as [number, number]
    );
    const bounds = L.latLngBounds(coords);
    mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  };

  const handleRecenterDemoArea = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, 8, { duration: 1.2 });
    }
  };

  const handleInspect = (scan: PredictionResponse) => {
    setCurrentScan(scan);
    setActiveTab('scan');
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-2xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl">
      {/* 1. Floating Top Search & Filter Bar (Glassmorphic Overlay) */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:right-20 z-[400] pointer-events-none">
        <div className="pointer-events-auto max-w-4xl mx-auto p-3 rounded-xl bg-[#080F20]/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search survey coordinates, Scan ID, or track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-950/80 border border-slate-800 p-0.5 text-xs font-mono">
              <button
                onClick={() => setClassFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  classFilter === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({geolocatedScans.length})
              </button>
              <button
                onClick={() => setClassFilter('MILCO')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  classFilter === 'MILCO'
                    ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MILCO Hazards
              </button>
              <button
                onClick={() => setClassFilter('NOMBO')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  classFilter === 'NOMBO'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                NOMBO Obstacles
              </button>
            </div>

            {/* Min Confidence Slider */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Min Conf:</span>
              <input
                type="range"
                min="0.0"
                max="0.9"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-cyan-400 font-bold">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Floating Custom Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-lg bg-[#080F20]/85 backdrop-blur-xl border border-cyan-500/25 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-lg bg-[#080F20]/85 backdrop-blur-xl border border-cyan-500/25 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetBounds}
          className="w-9 h-9 rounded-lg bg-[#080F20]/85 backdrop-blur-xl border border-cyan-500/25 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Fit All Survey Points"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenterDemoArea}
          className="w-9 h-9 rounded-lg bg-[#080F20]/85 backdrop-blur-xl border border-cyan-500/25 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Center Sonar Operations Range"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Live Dark Interactive Leaflet Map Canvas */}
      <MapContainer
        center={defaultCenter}
        zoom={8}
        className="w-full h-full"
        ref={(ref) => {
          if (ref) mapRef.current = ref;
        }}
      >
        {/* Dark Nautical Map Tiles via CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapController scans={filteredScans} selectedScan={selectedScan} />
        <MapClickDetector onMapClick={() => setSelectedScan(null)} />

        {/* Custom Interactive Tactical Markers */}
        {filteredScans.map((scan) => {
          const lat = scan.location.latitude!;
          const lon = scan.location.longitude!;
          const isSelected = selectedScan?.scan_id === scan.scan_id;

          return (
            <Marker
              key={scan.scan_id}
              position={[lat, lon]}
              icon={createPinIcon(scan, isSelected)}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setSelectedScan(scan);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* 4. Floating Slide-Up Tactical Intelligence Bottom Sheet */}
      {selectedScan && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-[400] animate-slide-up">
          <div className="p-5 rounded-2xl bg-[#091024]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)] space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-300">
                    {selectedScan.scan_id}
                  </span>
                  {selectedScan.milco_count > 0 ? (
                    <Badge type="MILCO" label="MILCO DETECTED" size="sm" />
                  ) : (
                    <Badge type="NOMBO" label="NOMBO CONTACTS" size="sm" />
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[280px]">
                  {selectedScan.filename}
                </p>
              </div>

              <button
                onClick={() => setSelectedScan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Total Targets</p>
                <p className="text-base font-bold text-slate-100 mt-0.5">
                  {selectedScan.total_detections}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/30">
                <p className="text-[10px] text-red-400">MILCO</p>
                <p className="text-base font-bold text-red-400 mt-0.5">
                  {selectedScan.milco_count}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                <p className="text-[10px] text-cyan-400">NOMBO</p>
                <p className="text-base font-bold text-cyan-400 mt-0.5">
                  {selectedScan.nombo_count}
                </p>
              </div>
            </div>

            {/* Geolocation & Telemetry Info */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Coordinates:</span>
                <span className="text-cyan-300 font-bold">
                  {selectedScan.location.latitude?.toFixed(4)}°N,{' '}
                  {selectedScan.location.longitude?.toFixed(4)}°W
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Peak Confidence:</span>
                <span className="text-slate-100 font-bold">
                  {(selectedScan.highest_confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Inference Latency:</span>
                <span className="text-slate-300">
                  {selectedScan.inference_ms.toFixed(1)} ms
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleInspect(selectedScan)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/60 active:scale-[0.99]"
            >
              <span>Inspect Acoustic Signature</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
