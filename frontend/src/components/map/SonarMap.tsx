import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  AlertOctagon,
  Shield,
  Layers,
  Filter,
  Eye,
  Calendar,
  Compass,
} from 'lucide-react';
import { PredictionResponse } from '../../types';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

// Custom Tactical Pulsing Leaflet Markers
const createSonarIcon = (hasMilco: boolean) => {
  const color = hasMilco ? '#EF4444' : '#06B6D4';
  const pulseClass = hasMilco ? 'animate-ping' : '';
  const html = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${color}; opacity: 0.25;" class="${pulseClass}"></div>
      <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background-color: #0F172A; border: 2px solid ${color};"></div>
      <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${color};"></div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-sonar-marker',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Component to dynamically fit bounds of all active markers
const MapBoundsController: React.FC<{ scans: PredictionResponse[] }> = ({
  scans,
}) => {
  const map = useMap();
  React.useEffect(() => {
    const validCoords = scans
      .filter(
        (s) =>
          s.location.latitude !== null &&
          s.location.longitude !== null &&
          !isNaN(s.location.latitude) &&
          !isNaN(s.location.longitude)
      )
      .map((s) => [s.location.latitude!, s.location.longitude!] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [scans, map]);
  return null;
};

export const SonarMap: React.FC = () => {
  const { scans, setCurrentScan, setActiveTab } = useApp();
  const [classFilter, setClassFilter] = useState<'ALL' | 'MILCO' | 'NOMBO'>('ALL');
  const [minConfFilter, setMinConfFilter] = useState<number>(0.0);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  // Filter scans based on geolocation availability and user filters
  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      if (s.location.latitude === null || s.location.longitude === null) {
        return false;
      }
      if (classFilter === 'MILCO' && s.milco_count === 0) return false;
      if (classFilter === 'NOMBO' && s.nombo_count === 0) return false;
      if (s.highest_confidence < minConfFilter) return false;
      return true;
    });
  }, [scans, classFilter, minConfFilter]);

  const totalGeolocated = scans.filter(
    (s) => s.location.latitude !== null && s.location.longitude !== null
  ).length;

  const totalUnlocated = scans.length - totalGeolocated;

  const defaultCenter: [number, number] = [25.3, -81.0]; // Default Florida Straits / Maritime Test Range

  const handleInspectScan = (scan: PredictionResponse) => {
    setCurrentScan(scan);
    setActiveTab('scan');
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Filter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 Cols: Interactive Map */}
        <div className="lg:col-span-3 rounded-xl bg-[#080E1C] border border-[#1E2E4E] overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
          {/* Map Controls Overlay Bar */}
          <div className="p-3 bg-[#0C1427]/90 backdrop-blur border-b border-[#1E2E4E] flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Filter:
              </span>
              <div className="flex rounded bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
                <button
                  onClick={() => setClassFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${
                    classFilter === 'ALL'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setClassFilter('MILCO')}
                  className={`px-2 py-0.5 rounded ${
                    classFilter === 'MILCO'
                      ? 'bg-red-500/20 text-red-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MILCO Only
                </button>
                <button
                  onClick={() => setClassFilter('NOMBO')}
                  className={`px-2 py-0.5 rounded ${
                    classFilter === 'NOMBO'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  NOMBO Only
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Min Conf:</span>
                <input
                  type="range"
                  min="0.0"
                  max="0.9"
                  step="0.05"
                  value={minConfFilter}
                  onChange={(e) => setMinConfFilter(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-cyan-400">
                  {(minConfFilter * 100).toFixed(0)}%
                </span>
              </div>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 border-l border-slate-800 pl-3">
                <span className="flex items-center gap-1 text-[11px] text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> MILCO
                </span>
                <span className="flex items-center gap-1 text-[11px] text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" /> NOMBO
                </span>
              </div>
            </div>
          </div>

          {/* Leaflet Map Body */}
          <div className="flex-1 w-full h-full relative z-0">
            <MapContainer
              center={defaultCenter}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              {/* Dark Nautical Map Tiles via CartoDB Dark Matter */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />

              <MapBoundsController scans={filteredScans} />

              {filteredScans.map((scan) => {
                const lat = scan.location.latitude!;
                const lon = scan.location.longitude!;
                const hasMilco = scan.milco_count > 0;

                return (
                  <Marker
                    key={scan.scan_id}
                    position={[lat, lon]}
                    icon={createSonarIcon(hasMilco)}
                    eventHandlers={{
                      click: () => setSelectedScanId(scan.scan_id),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-2 font-mono text-xs text-slate-100 min-w-[220px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                          <span className="font-bold text-cyan-300">
                            {scan.scan_id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(scan.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Coordinates:</span>
                            <span>
                              {lat.toFixed(4)}°, {lon.toFixed(4)}°
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Detections:</span>
                            <span className="font-bold">{scan.total_detections}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-400">MILCO Contacts:</span>
                            <span className="text-red-400 font-bold">
                              {scan.milco_count}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cyan-400">NOMBO Obstacles:</span>
                            <span className="text-cyan-400 font-bold">
                              {scan.nombo_count}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Peak Confidence:</span>
                            <span className="text-slate-100">
                              {(scan.highest_confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInspectScan(scan)}
                          className="w-full mt-2 py-1.5 px-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-center text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Acoustic Signature</span>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right 1 Col: Geospatial Intelligence Side Panel */}
        <div className="space-y-4">
          {/* Stats Widget */}
          <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Geospatial Intelligence
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Mapped Tracks</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">
                  {filteredScans.length}
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Total Targets</p>
                <p className="text-lg font-bold text-cyan-400 mt-0.5">
                  {filteredScans.reduce((acc, s) => acc + s.total_detections, 0)}
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-red-400">MILCO Points</p>
                <p className="text-lg font-bold text-red-400 mt-0.5">
                  {filteredScans.reduce((acc, s) => acc + s.milco_count, 0)}
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Ungeolocated</p>
                <p className="text-lg font-bold text-slate-400 mt-0.5">
                  {totalUnlocated}
                </p>
              </div>
            </div>
          </div>

          {/* Mapped Scans Feed List */}
          <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-3 max-h-[460px] overflow-y-auto">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              Survey Track Markers ({filteredScans.length})
            </h4>

            {filteredScans.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-400">
                No geolocated survey tracks match the active filter criteria.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredScans.map((scan) => {
                  const isSelected = selectedScanId === scan.scan_id;
                  return (
                    <div
                      key={scan.scan_id}
                      onClick={() => setSelectedScanId(scan.scan_id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 text-slate-100'
                          : 'bg-[#080E1C] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          {scan.scan_id}
                        </span>
                        {scan.milco_count > 0 ? (
                          <Badge type="MILCO" label="MILCO" size="sm" />
                        ) : (
                          <Badge type="NOMBO" label="NOMBO" size="sm" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {scan.filename}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                        <span>
                          {scan.location.latitude?.toFixed(3)}°N,{' '}
                          {scan.location.longitude?.toFixed(3)}°W
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectScan(scan);
                          }}
                          className="text-cyan-400 hover:underline"
                        >
                          Inspect →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
