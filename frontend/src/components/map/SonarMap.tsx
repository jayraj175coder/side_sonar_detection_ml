import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  AlertTriangle,
  Boxes,
  Layers,
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
  ArrowRight,
  Globe2,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { PredictionResponse } from '../../types';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

// Custom Tactical Pin Icons for MoES Targets
const createPinIcon = (scan: PredictionResponse, isSelected: boolean) => {
  const isGhostNet = (scan.ghost_net_count || 0) > 0;
  const isDebris = (scan.debris_count || 0) > 0;
  const isPipeline = (scan.pipeline_count || 0) > 0;
  const isMilco = (scan.milco_count || 0) > 0;

  let primaryColor = '#06B6D4'; // Cyan default
  let glowColor = 'rgba(6, 182, 212, 0.4)';
  let pillText = `${scan.total_detections}T`;
  let pulse = false;

  if (isGhostNet) {
    primaryColor = '#A855F7';
    glowColor = 'rgba(168, 85, 247, 0.5)';
    pillText = `${scan.ghost_net_count} Net`;
    pulse = true;
  } else if (isDebris) {
    primaryColor = '#F59E0B';
    glowColor = 'rgba(245, 158, 11, 0.5)';
    pillText = `${scan.debris_count} Deb`;
    pulse = true;
  } else if (isPipeline) {
    primaryColor = '#3B82F6';
    glowColor = 'rgba(59, 130, 246, 0.5)';
    pillText = `${scan.pipeline_count} Pipe`;
  } else if (isMilco) {
    primaryColor = '#EF4444';
    glowColor = 'rgba(239, 68, 68, 0.5)';
    pillText = `${scan.milco_count} Mil`;
    pulse = true;
  }

  const scale = isSelected ? 1.3 : 1.0;
  const pulseClass = pulse ? 'animate-ping' : '';

  const html = `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transform: scale(${scale}); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Outer Sonar Pulse Wave -->
      <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background-color: ${primaryColor}; opacity: 0.25;" class="${pulseClass}"></div>
      
      <!-- Middle Tactical Ring -->
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #050B1A; border: 2px solid ${primaryColor}; box-shadow: 0 0 14px ${glowColor};"></div>
      
      <!-- Inner Core Dot -->
      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${primaryColor};"></div>

      <!-- Badge Pill -->
      <div style="position: absolute; bottom: -8px; padding: 1px 5px; border-radius: 6px; background: #030712; border: 1px solid ${primaryColor}; font-size: 8px; font-family: monospace; font-weight: bold; color: ${primaryColor}; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.8);">
        ${pillText}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-pin-marker',
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
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
  const [classFilter, setClassFilter] = useState<'ALL' | 'GHOST_NET' | 'DEBRIS' | 'PIPELINE'>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0.0);
  const [selectedScan, setSelectedScan] = useState<PredictionResponse | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const defaultCenter: [number, number] = [17.6868, 83.2185]; // Visakhapatnam Coastal Survey Range

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
    return geolocatedScans.filter((scan) => {
      // 1. Search Query Match
      const matchesSearch =
        scan.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.scan_id.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Class Type Match
      let matchesClass = true;
      if (classFilter === 'GHOST_NET') {
        matchesClass = (scan.ghost_net_count || 0) > 0;
      } else if (classFilter === 'DEBRIS') {
        matchesClass = (scan.debris_count || 0) > 0;
      } else if (classFilter === 'PIPELINE') {
        matchesClass = (scan.pipeline_count || 0) > 0;
      }

      // 3. Confidence Match
      const matchesConfidence = scan.highest_confidence >= minConfidence;

      return matchesSearch && matchesClass && matchesConfidence;
    });
  }, [geolocatedScans, searchTerm, classFilter, minConfidence]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, 9, { duration: 1.0 });
      setSelectedScan(null);
    }
  };

  const handleRecenterDemoArea = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, 10, { duration: 1.2 });
    }
  };

  const handleSelectMarker = (scan: PredictionResponse) => {
    setSelectedScan(scan);
  };

  const handleInspectInStudio = (scan: PredictionResponse) => {
    setCurrentScan(scan);
    setActiveTab('scan');
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[600px] rounded-3xl overflow-hidden glass-panel border border-cyan-500/25 shadow-2xl flex flex-col">
      {/* 1. Floating Top Glassmorphism Filter Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pointer-events-auto bg-[#070D1F]/90 backdrop-blur-xl p-2.5 rounded-2xl border border-cyan-500/25 shadow-2xl">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search scan ID or track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Classification Filters */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setClassFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                classFilter === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({geolocatedScans.length})
            </button>
            <button
              onClick={() => setClassFilter('GHOST_NET')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                classFilter === 'GHOST_NET'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 font-bold'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-purple-400" />
              <span>Ghost Nets</span>
            </button>
            <button
              onClick={() => setClassFilter('DEBRIS')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                classFilter === 'DEBRIS'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 font-bold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Boxes className="w-3 h-3 text-amber-400" />
              <span>Debris</span>
            </button>
            <button
              onClick={() => setClassFilter('PIPELINE')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                classFilter === 'PIPELINE'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-500/50 font-bold'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <Layers className="w-3 h-3 text-blue-400" />
              <span>Pipelines</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Confidence Slider */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Min:</span>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-cyan-300 font-bold">
              {(minConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="pointer-events-auto bg-[#070D1F]/90 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-cyan-500/25 shadow-2xl flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-bold">MoES Indian Waters Grid</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {filteredScans.length} Swaths
          </span>
        </div>
      </div>

      {/* 2. Floating Custom Navigation Controls */}
      <div className="absolute right-4 top-20 z-[1000] flex flex-col gap-1.5">
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
          onClick={handleResetView}
          className="w-9 h-9 rounded-lg bg-[#080F20]/85 backdrop-blur-xl border border-cyan-500/25 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Reset Map Bounds"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenterDemoArea}
          className="w-9 h-9 rounded-lg bg-[#080F20]/85 backdrop-blur-xl border border-cyan-500/25 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Center Visakhapatnam Range"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Interactive Map Legend Overlay */}
      <div className="absolute left-4 bottom-4 z-[1000] bg-[#070D1F]/90 backdrop-blur-xl p-3 rounded-2xl border border-cyan-500/25 text-[11px] font-mono shadow-2xl space-y-1.5 pointer-events-auto">
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Acoustic Contact Legend</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-purple-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" /> Ghost Net (ALDFG)
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" /> Marine Debris
          </span>
          <span className="flex items-center gap-1 text-blue-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" /> Pipeline
          </span>
        </div>
      </div>

      {/* 4. Leaflet Map Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={9}
          ref={mapRef}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController scans={filteredScans} selectedScan={selectedScan} />
          <MapClickDetector onMapClick={() => setSelectedScan(null)} />

          {/* Interactive Custom Markers */}
          {filteredScans.map((scan) => {
            const isSelected = selectedScan?.scan_id === scan.scan_id;
            return (
              <Marker
                key={scan.scan_id}
                position={[scan.location.latitude!, scan.location.longitude!]}
                icon={createPinIcon(scan, isSelected)}
                eventHandlers={{
                  click: () => handleSelectMarker(scan),
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* 5. Floating Slide-Up Detail Bottom Sheet */}
      {selectedScan && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000] p-5 rounded-2xl glass-panel border border-cyan-400/50 shadow-2xl bg-[#091124]/95 animate-slide-up">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-mono text-cyan-300">
                  {selectedScan.scan_id}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {selectedScan.model_name?.includes('Marine-Debris') ? 'SIH V2' : 'Legacy Baseline'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[240px]">
                {selectedScan.filename}
              </p>
            </div>
            <button
              onClick={() => setSelectedScan(null)}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">GPS Coordinates:</span>
              <span className="text-slate-100 font-bold">
                {selectedScan.location.latitude?.toFixed(4)}°N,{' '}
                {selectedScan.location.longitude?.toFixed(4)}°E
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Total Targets:</span>
              <span className="text-cyan-300 font-bold text-sm">
                {selectedScan.total_detections}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Peak Confidence:</span>
              <span className="text-emerald-400 font-bold">
                {(selectedScan.highest_confidence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Target Breakdown Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(selectedScan.ghost_net_count || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px]">
                  {selectedScan.ghost_net_count} Ghost Nets
                </span>
              )}
              {(selectedScan.debris_count || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px]">
                  {selectedScan.debris_count} Marine Debris
                </span>
              )}
              {(selectedScan.pipeline_count || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[10px]">
                  {selectedScan.pipeline_count} Pipelines
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleInspectInStudio(selectedScan)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect Swath in Studio</span>
          </button>
        </div>
      )}
    </div>
  );
};
