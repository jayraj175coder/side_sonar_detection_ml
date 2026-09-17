import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Radio,
  Layers,
  Search,
  Filter,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Anchor,
  Ship,
  Eye,
  Crosshair,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Activity,
  Zap,
  Globe2,
  Waves,
  Shield,
  Plus,
  Minus,
  Info,
  Check,
} from 'lucide-react';
import {
  INDIA_MARITIME_SECTORS,
  HYDROGRAPHIC_VESSELS,
  INDIA_EEZ_POLYGON,
  ACTIVE_SURVEY_TRACKLINES,
  IndiaMaritimeSector,
  HydrographicVessel,
} from '../../data/indiaMapData';
import { useApp } from '../../context/AppContext';

export type MapMode = 'satellite' | 'bathymetry' | 'dark_hud';

// Tactical Map Scenarios
interface MapScenario {
  id: string;
  name: string;
  subLabel: string;
  center: [number, number];
  zoom: number;
  sectorId?: string;
  vesselPennant?: string;
}

const SCENARIOS: MapScenario[] = [
  {
    id: 'arabian-flagship',
    name: 'Arabian Sea - Flagship',
    subLabel: 'INS Sandhayak (J18) · Primary Hydrographic Sweep',
    center: [18.921, 72.821],
    zoom: 7,
    sectorId: 'SEC-MUM',
    vesselPennant: 'J18',
  },
  {
    id: 'mumbai-high',
    name: 'Mumbai High - Subsea Pipeline Trench',
    subLabel: 'Western Offshore Oil & Gas Corridor',
    center: [19.3792, 71.355],
    zoom: 8,
    sectorId: 'SEC-MUM',
    vesselPennant: 'J18',
  },
  {
    id: 'mannar-biosphere',
    name: 'Gulf of Mannar - Coral Biosphere',
    subLabel: 'Marine National Park & ALDFG Ghost Net Sweep',
    center: [9.1362, 79.2124],
    zoom: 8,
    sectorId: 'SEC-MAN',
    vesselPennant: 'SAGAR-SAMPADA',
  },
  {
    id: 'vizag-mcm',
    name: 'Visakhapatnam - MCM Deep Trench',
    subLabel: 'Eastern Naval Command Multi-Beam Corridor',
    center: [17.6868, 83.2185],
    zoom: 8,
    sectorId: 'SEC-VIZ',
    vesselPennant: 'J20',
  },
  {
    id: 'goa-shelf',
    name: 'Goa Shelf - Natural Basalt Ridge',
    subLabel: 'Mormugao Outer Channel & Marine Fairway',
    center: [15.4092, 73.7533],
    zoom: 8,
    sectorId: 'SEC-GOA',
    vesselPennant: 'J22',
  },
  {
    id: 'andaman-ocean',
    name: 'Andaman Sea - Deep Ocean Bathymetry',
    subLabel: 'Sunda Plate Margin Subduction Zone',
    center: [11.667, 92.733],
    zoom: 7,
    sectorId: 'SEC-AND',
    vesselPennant: 'SAGAR-NIDHI',
  },
  {
    id: 'lakshadweep-atoll',
    name: 'Lakshadweep - Atoll Lagoon Transect',
    subLabel: 'Coral Reef Seamount & Shallow Bathymetry',
    center: [10.5667, 72.6417],
    zoom: 8,
    sectorId: 'SEC-LAK',
    vesselPennant: 'J22',
  },
  {
    id: 'all-eez',
    name: 'All India EEZ Maritime Theatre',
    subLabel: '2.37M km² Complete NHO Hydrographic Register',
    center: [14.8, 79.5],
    zoom: 5,
  },
];

// Custom Tactical Pin for Indian Maritime Sectors
const createSectorPin = (sector: IndiaMaritimeSector, isSelected: boolean) => {
  const isSelectedStyle = isSelected ? 'transform: scale(1.3); z-index: 99;' : '';

  let pinColor = '#00D4AA'; // Default Emerald
  const clsLower = sector.primaryClass.toLowerCase();

  if (clsLower.includes('ghost') || clsLower.includes('net') || clsLower.includes('reef') || clsLower.includes('aldfg')) {
    pinColor = '#10B981'; // Ghost Net / ALDFG (Emerald Green)
  } else if (clsLower.includes('debris') || clsLower.includes('steel') || clsLower.includes('container') || clsLower.includes('plastic')) {
    pinColor = '#F59E0B'; // Anthropogenic Debris (Electric Amber Orange)
  } else if (clsLower.includes('pipeline') || clsLower.includes('subsea') || clsLower.includes('anchorage')) {
    pinColor = '#06B6D4'; // Pipeline Hazard (Subsea Cyan)
  } else if (clsLower.includes('ordnance') || clsLower.includes('anomaly') || clsLower.includes('trench') || clsLower.includes('volcanic')) {
    pinColor = '#A855F7'; // Seafloor Anomaly (Electric Magenta)
  }

  const glowColor = `${pinColor}80`;

  const html = `
    <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; ${isSelectedStyle} transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Radar Pulse Wave -->
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${pinColor}; opacity: 0.3;" class="animate-ping"></div>
      
      <!-- Middle Tactical Ring -->
      <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: #050B14; border: 2.5px solid ${pinColor}; box-shadow: 0 0 18px ${glowColor};"></div>
      
      <!-- Inner Core Dot -->
      <div style="width: 12px; height: 12px; border-radius: 50%; background: ${pinColor}; shadow: 0 0 8px ${pinColor}; z-index: 2;"></div>

      <!-- Sector Code Pill -->
      <div style="position: absolute; bottom: -12px; padding: 2px 7px; border-radius: 6px; background: #050B14; border: 1px solid ${pinColor}; font-size: 9px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: ${pinColor}; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.95); z-index: 10;">
        ${sector.id.replace('SEC-', '')} · ${sector.contactsLogged}C
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-sector-marker',
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Custom Icon for Active Hydrographic Vessels
const createVesselPin = (vessel: HydrographicVessel, isSelected: boolean) => {
  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transform: rotate(${vessel.headingDeg}deg);">
      <div style="width: 24px; height: 24px; border-radius: 6px; background: #080B11; border: 2px solid #29B6F6; box-shadow: 0 0 14px rgba(41, 182, 246, 0.6); display: flex; align-items: center; justify-content: center;">
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 10px solid #29B6F6;"></div>
      </div>
      <div style="position: absolute; bottom: -14px; padding: 1px 4px; border-radius: 4px; background: #080B11; border: 1px solid #29B6F6; font-size: 7px; font-family: monospace; font-weight: bold; color: #29B6F6; white-space: nowrap;">
        ${vessel.pennant}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-vessel-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Map Pan Controller Component
const MapFlyTo: React.FC<{ coords: [number, number]; zoom: number }> = ({ coords, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, zoom, { duration: 1.2 });
  }, [coords, zoom, map]);
  return null;
};

// Mouse Coordinate Tracker inside Leaflet Map
const MapEventsTracker: React.FC<{
  onMouseMove: (lat: number, lon: number) => void;
}> = ({ onMouseMove }) => {
  const map = useMap();
  useEffect(() => {
    const handleMove = (e: L.LeafletMouseEvent) => {
      onMouseMove(e.latlng.lat, e.latlng.lng);
    };
    map.on('mousemove', handleMove);
    return () => {
      map.off('mousemove', handleMove);
    };
  }, [map, onMouseMove]);
  return null;
};

// Capture Map Instance safely for external controls
const MapInstanceCapturer: React.FC<{ onMap: (map: L.Map) => void }> = ({ onMap }) => {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
};

export const SonarMap: React.FC = () => {
  const { setActiveTab } = useApp();

  // Active Map Mode (Satellite, Bathymetry, Dark HUD)
  const [mapMode, setMapMode] = useState<MapMode>('satellite');

  // Active Scenario
  const [activeScenarioId, setActiveScenarioId] = useState<string>('arabian-flagship');
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState<boolean>(false);

  // Search query & Live telemetry state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOffline, setIsOffline] = useState<boolean>(true); // Matches "🔴 OFFLINE" in reference
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number }>({
    lat: 18.921,
    lon: 72.821,
  });

  // Layer Toggles
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [showEEZ, setShowEEZ] = useState<boolean>(true);
  const [showSectors, setShowSectors] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showBathymetry, setShowBathymetry] = useState<boolean>(true);
  const [showTracklines, setShowTracklines] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showContactMarkers, setShowContactMarkers] = useState<boolean>(true);

  // Info Modal
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Selected entities
  const [selectedSector, setSelectedSector] = useState<IndiaMaritimeSector | null>(INDIA_MARITIME_SECTORS[0]);
  const [selectedVessel, setSelectedVessel] = useState<HydrographicVessel | null>(null);

  // Map View Coordinates & Instance
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.921, 72.821]);
  const [mapZoom, setMapZoom] = useState<number>(7);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const scenarioDropdownRef = useRef<HTMLDivElement>(null);
  const layersDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scenarioDropdownRef.current && !scenarioDropdownRef.current.contains(event.target as Node)) {
        setIsScenarioDropdownOpen(false);
      }
      if (layersDropdownRef.current && !layersDropdownRef.current.contains(event.target as Node)) {
        setIsLayersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active scenario object
  const currentScenario = useMemo(() => {
    return SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];
  }, [activeScenarioId]);

  // Select scenario
  const handleSelectScenario = (scenario: MapScenario) => {
    setActiveScenarioId(scenario.id);
    setMapCenter(scenario.center);
    setMapZoom(scenario.zoom);
    setIsScenarioDropdownOpen(false);

    if (scenario.sectorId) {
      const sec = INDIA_MARITIME_SECTORS.find((s) => s.id === scenario.sectorId);
      if (sec) setSelectedSector(sec);
    }
    if (scenario.vesselPennant) {
      const ves = HYDROGRAPHIC_VESSELS.find((v) => v.pennant === scenario.vesselPennant);
      if (ves) setSelectedVessel(ves);
    }
  };

  // Re-center on active scenario
  const handleRecenter = () => {
    setMapCenter(currentScenario.center);
    setMapZoom(currentScenario.zoom);
  };

  // Quick Sector Jump
  const handleJumpToSector = (sector: IndiaMaritimeSector) => {
    setSelectedSector(sector);
    setSelectedVessel(null);
    setMapCenter([sector.lat, sector.lon]);
    setMapZoom(7);
  };

  const handleJumpToVessel = (vessel: HydrographicVessel) => {
    setSelectedVessel(vessel);
    setSelectedSector(null);
    setMapCenter([vessel.lat, vessel.lon]);
    setMapZoom(8);
  };

  // Coordinate / Keyword Search
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if query is coordinates, e.g. "18.92, 72.82"
    const coordMatch = q.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setMapCenter([lat, lon]);
        setMapZoom(9);
        return;
      }
    }

    // Search by sector name or id
    const foundSector = INDIA_MARITIME_SECTORS.find(
      (s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.id.toLowerCase().includes(q.toLowerCase()) ||
        s.primaryClass.toLowerCase().includes(q.toLowerCase())
    );
    if (foundSector) {
      handleJumpToSector(foundSector);
      return;
    }

    // Search by vessel
    const foundVessel = HYDROGRAPHIC_VESSELS.find(
      (v) =>
        v.name.toLowerCase().includes(q.toLowerCase()) ||
        v.pennant.toLowerCase().includes(q.toLowerCase())
    );
    if (foundVessel) {
      handleJumpToVessel(foundVessel);
    }
  };

  // Layer counting for badge
  const activeLayerCount = [
    showEEZ,
    showSectors,
    showVessels,
    showBathymetry,
    showTracklines,
    showLabels,
    showContactMarkers,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full w-full bg-[#001017] rounded-2xl overflow-hidden select-none font-mono text-xs shadow-2xl relative">
      {/* ─────────────────────────────────────────────────────────────────
          TOP BAR: SCENARIO SELECTOR, SEARCH, OFFLINE STATUS, 3-WAY MAP SWITCHER, LAYERS DROPDOWN
      ───────────────────────────────────────────────────────────────── */}
      <div className="px-3.5 py-2 bg-[#00141d]/90 backdrop-blur-xl border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2.5 flex-1 min-w-[320px]">
          {/* Active Scenario Selector Dropdown */}
          <div className="relative" ref={scenarioDropdownRef}>
            <button
              onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#FFB703]/50 text-white text-[10px] font-bold transition-all cursor-pointer shadow-sm"
            >
              <span className="text-slate-400 uppercase tracking-wider font-semibold">
                ACTIVE SCENARIO:
              </span>
              <span className="text-[#FFB703] font-black">{currentScenario.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isScenarioDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-[#00141d]/95 border border-white/[0.08] rounded-xl shadow-2xl z-50 p-1.5 space-y-1 backdrop-blur-2xl">
                <div className="px-2 py-1 text-[8px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/[0.06]">
                  INDIAN MARITIME THEATRE SCENARIOS
                </div>
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`w-full flex flex-col items-start px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      sc.id === activeScenarioId
                        ? 'bg-[#FFB703]/15 border border-[#FFB703]/40 text-[#FFB703]'
                        : 'hover:bg-white/[0.04] text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold text-white">{sc.name}</span>
                      {sc.id === activeScenarioId && <Check className="w-3 h-3 text-[#FFB703]" />}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5">{sc.subLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search MMSI, Vessel name, or coords */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search MMSI, vessel name, or coords (lon, lat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703] transition-all"
            />
          </form>
        </div>

        {/* Right Controls: Offline Badge, 3-Way Switcher, Layers Dropdown */}
        <div className="flex items-center gap-2">
          {/* Status Badge (Offline / Live Sync) */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] font-black transition-all cursor-pointer ${
              isOffline
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
            title="Click to toggle Live AIS / Autonomous Offline telemetry"
          >
            <span
              className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-400' : 'bg-emerald-400 animate-ping'}`}
            />
            <span>{isOffline ? '🔴 OFFLINE' : '🟢 LIVE SYNC'}</span>
          </button>

          {/* 3-WAY MAP STYLE SWITCHER: SATELLITE | BATHYMETRY | DARK HUD */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-[#FFB703] text-[#05070B] font-black shadow-[0_0_12px_rgba(255,183,3,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>SATELLITE</span>
            </button>

            <button
              onClick={() => setMapMode('bathymetry')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                mapMode === 'bathymetry'
                  ? 'bg-[#38BDF8] text-[#05070B] font-black shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>BATHYMETRY</span>
            </button>

            <button
              onClick={() => setMapMode('dark_hud')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                mapMode === 'dark_hud'
                  ? 'bg-emerald-400 text-[#05070B] font-black shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>DARK HUD</span>
            </button>
          </div>

          {/* LAYERS DROPDOWN (7/7) */}
          <div className="relative" ref={layersDropdownRef}>
            <button
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#FFB703]/50 text-white text-[9px] font-black transition-all cursor-pointer shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>LAYERS {activeLayerCount}/7</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLayersOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-[#00141d]/95 border border-white/[0.08] rounded-xl shadow-2xl z-50 p-2 space-y-1.5 backdrop-blur-2xl">
                <div className="px-2 py-1 text-[8px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/[0.06]">
                  TACTICAL GIS LAYERS
                </div>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>1. EEZ Boundary (UNCLOS)</span>
                  <input
                    type="checkbox"
                    checked={showEEZ}
                    onChange={(e) => setShowEEZ(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>2. Hydrographic Sectors (8)</span>
                  <input
                    type="checkbox"
                    checked={showSectors}
                    onChange={(e) => setShowSectors(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>3. Research Vessels (4)</span>
                  <input
                    type="checkbox"
                    checked={showVessels}
                    onChange={(e) => setShowVessels(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>4. Bathymetric Contours</span>
                  <input
                    type="checkbox"
                    checked={showBathymetry}
                    onChange={(e) => setShowBathymetry(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>5. Real-Time Tracklines</span>
                  <input
                    type="checkbox"
                    checked={showTracklines}
                    onChange={(e) => setShowTracklines(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>6. Subsea Geographic Labels</span>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.04] cursor-pointer text-[9px] text-white">
                  <span>7. Contact Ping Reticles</span>
                  <input
                    type="checkbox"
                    checked={showContactMarkers}
                    onChange={(e) => setShowContactMarkers(e.target.checked)}
                    className="accent-[#FFB703] rounded cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MAIN VIEWPORT: LEAFLET MAP CANVAS + RIGHT SECTOR TELEMETRY DRAWER
      ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Leaflet Dynamic Map */}
        <div className="flex-1 h-full relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            zoomControl={false}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ background: '#080B11' }}
          >
            <MapFlyTo coords={mapCenter} zoom={mapZoom} />
            <MapEventsTracker onMouseMove={(lat, lon) => setMouseCoords({ lat, lon })} />
            <MapInstanceCapturer onMap={setMapInstance} />

            {/* BASE LAYER 1: SATELLITE (Esri World Imagery) */}
            {mapMode === 'satellite' && (
              <>
                <TileLayer
                  key="esri-satellite"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri World Imagery, Maxar, Earthstar Geographics"
                  maxZoom={18}
                />
                {showLabels && (
                  <TileLayer
                    key="esri-satellite-labels"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri Boundaries & Places"
                    opacity={0.85}
                  />
                )}
              </>
            )}

            {/* BASE LAYER 2: BATHYMETRY (Esri World Ocean Base) */}
            {mapMode === 'bathymetry' && (
              <>
                <TileLayer
                  key="esri-ocean-base"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri Ocean Basemap, GEBCO, NOAA"
                  maxZoom={13}
                />
                {(showBathymetry || showLabels) && (
                  <TileLayer
                    key="esri-ocean-reference"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
                    attribution="GEBCO Oceanic Depth Contours"
                    opacity={0.7}
                  />
                )}
              </>
            )}

            {/* BASE LAYER 3: DARK HUD (Esri Canvas World Dark Gray Base) */}
            {mapMode === 'dark_hud' && (
              <>
                <TileLayer
                  key="esri-dark-gray"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri Dark Marine Canvas, OpenStreetMap"
                  maxZoom={16}
                />
                {showLabels && (
                  <TileLayer
                    key="esri-dark-labels"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri Dark Reference"
                    opacity={0.7}
                  />
                )}
              </>
            )}

            {/* Additional Bathymetric Depth Shading Overlay (When enabled in Satellite or Dark HUD) */}
            {showBathymetry && mapMode !== 'bathymetry' && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
                attribution="GEBCO Bathymetry Overlay"
                opacity={0.4}
              />
            )}

            {/* Layer 1: India Exclusive Economic Zone (EEZ) Boundary Polygon */}
            {showEEZ && (
              <Polygon
                positions={INDIA_EEZ_POLYGON}
                pathOptions={{
                  color: '#FFB703',
                  weight: 1.5,
                  dashArray: '6, 6',
                  fillColor: '#FFB703',
                  fillOpacity: 0.05,
                }}
              />
            )}

            {/* Layer 5: Animated High-Resolution Survey Tracklines along EEZ Corridors */}
            {showTracklines &&
              ACTIVE_SURVEY_TRACKLINES.map((track) => (
                <Polyline
                  key={track.id}
                  positions={track.path}
                  pathOptions={{
                    color: track.color,
                    weight: 3,
                    dashArray: '8, 8',
                    className: 'animated-survey-track',
                  }}
                />
              ))}

            {/* Layer 2: Maritime Sector Contact Pins */}
            {showSectors &&
              INDIA_MARITIME_SECTORS.map((sector) => {
                const isSelected = selectedSector?.id === sector.id;
                return (
                  <Marker
                    key={sector.id}
                    position={[sector.lat, sector.lon]}
                    icon={createSectorPin(sector, isSelected)}
                    eventHandlers={{
                      click: () => handleJumpToSector(sector),
                    }}
                  />
                );
              })}

            {/* Layer 3: Dynamic Survey Vessels */}
            {showVessels &&
              HYDROGRAPHIC_VESSELS.map((vessel) => (
                <Marker
                  key={vessel.id}
                  position={[vessel.lat, vessel.lon]}
                  icon={createVesselPin(vessel, selectedVessel?.id === vessel.id)}
                  eventHandlers={{
                    click: () => handleJumpToVessel(vessel),
                  }}
                />
              ))}
          </MapContainer>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING BOTTOM-RIGHT CONTROLS:
              1. Live Coordinates Pill: LON: ... | LAT: ... | MARITIME AOI
              2. Vertical Zoom Controls (+ / - / Recenter)
          ───────────────────────────────────────────────────────────── */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-auto">
            {/* Coordinate Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-[#00141d]/90 border border-white/[0.08] text-[9px] text-slate-300 flex items-center gap-2 shadow-2xl backdrop-blur-xl">
              <span className="text-slate-400 font-bold">LON:</span>
              <strong className="text-[#FFB703] font-mono">
                {Math.abs(mouseCoords.lon).toFixed(4)}° {mouseCoords.lon >= 0 ? 'E' : 'W'}
              </strong>
              <span className="text-white/[0.1]">|</span>
              <span className="text-slate-400 font-bold">LAT:</span>
              <strong className="text-[#FFB703] font-mono">
                {Math.abs(mouseCoords.lat).toFixed(4)}° {mouseCoords.lat >= 0 ? 'N' : 'S'}
              </strong>
              <span className="text-white/[0.1]">|</span>
              <span className="text-emerald-400 font-black tracking-wider">MARITIME AOI</span>
            </div>

            {/* Vertical Zoom Navigation Controls */}
            <div className="flex flex-col gap-1 bg-[#00141d]/90 p-1 rounded-xl border border-white/[0.08] shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => mapInstance?.zoomIn()}
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703] text-slate-300 hover:text-[#FFB703] flex items-center justify-center transition-all cursor-pointer"
                title="Zoom In (or use mouse wheel / pinch)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => mapInstance?.zoomOut()}
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703] text-slate-300 hover:text-[#FFB703] flex items-center justify-center transition-all cursor-pointer"
                title="Zoom Out (or use mouse wheel / pinch)"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleRecenter}
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703] text-[#FFB703] flex items-center justify-center transition-all cursor-pointer"
                title="Re-Center to Active Scenario AOI"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING BOTTOM-LEFT: INFO BUTTON
          ───────────────────────────────────────────────────────────── */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowInfoModal(!showInfoModal)}
              className="w-8 h-8 rounded-xl bg-[#00141d]/90 hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703] text-[#FFB703] flex items-center justify-center transition-all shadow-2xl backdrop-blur-xl cursor-pointer"
              title="AOI Intelligence & Map Interaction Guide"
            >
              <Info className="w-4 h-4" />
            </button>

            {showInfoModal && (
              <div className="w-80 bg-[#00141d]/95 border border-white/[0.08] rounded-xl p-3 shadow-2xl backdrop-blur-2xl space-y-2 text-[9px]">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                  <div className="flex items-center gap-1.5 text-[#FFB703] font-bold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>MARITIME GIS CONTROLS</span>
                  </div>
                  <button
                    onClick={() => setShowInfoModal(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300">
                  • <strong className="text-white">Hand Drag:</strong> Click & hold anywhere with the hand cursor to pan smoothly across maritime sectors.
                </p>
                <p className="text-slate-300">
                  • <strong className="text-white">Scroll-Wheel / Pinch:</strong> Zoom in and out smoothly down to 10m seabed resolution.
                </p>
                <p className="text-slate-300">
                  • <strong className="text-white">Modes:</strong> Switch between High-Res Satellite Imagery, GEBCO Ocean Bathymetry, or Cyber Dark HUD.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT SIDE: TACTICAL SECTOR & VESSEL INTELLIGENCE DRAWER
        ───────────────────────────────────────────────────────────── */}
        <div className="w-80 md:w-96 bg-[#00141d]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col overflow-y-auto z-10 shadow-2xl p-3.5 space-y-3 shrink-0">
          {selectedSector && (
            <>
              {/* Sector Header */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30">
                    {selectedSector.id}
                  </span>
                  <span
                    className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                      selectedSector.status === 'HIGH ALERT'
                        ? 'bg-red-500/15 text-red-400 border-red-500/40'
                        : selectedSector.status === 'ACTIVE SURVEY'
                        ? 'bg-[#FFB703]/15 text-[#FFB703] border-[#FFB703]/40'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {selectedSector.status}
                  </span>
                </div>

                <h3 className="text-sm font-black text-white leading-snug">
                  {selectedSector.name}
                </h3>
                <p className="text-[9px] text-slate-400">
                  {selectedSector.subName} · {selectedSector.fleetCommand}
                </p>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08] text-[9px]">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[7px] text-slate-400 uppercase block">BATHYMETRY DEPTH</span>
                    <strong className="text-[#38BDF8] font-bold">{selectedSector.depthRangeM}</strong>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[7px] text-slate-400 uppercase block">TOTAL CONTACTS</span>
                    <strong className="text-[#FFB703] font-bold">{selectedSector.contactsLogged} Cataloged</strong>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[7px] text-slate-400 uppercase block">HIGH-RISK THREATS</span>
                    <strong className="text-red-400 font-bold">{selectedSector.criticalThreats} Critical</strong>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[7px] text-slate-400 uppercase block">ASSIGNED VESSEL</span>
                    <strong className="text-white font-bold">{selectedSector.assignedVessel}</strong>
                  </div>
                </div>
              </div>

              {/* Sector Environmental & Hydrographic Findings */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5 text-[9px]">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                  SURVEY INTELLIGENCE & THREAT SUMMARY
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedSector.description}
                </p>
                <div className="pt-2 text-[8px] text-[#FFB703]">
                  PRIMARY TARGET CLASS: <strong className="text-white">{selectedSector.primaryClass}</strong>
                </div>
              </div>

              {/* Action: Jump to Flagship Mission Control */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setActiveTab('mission')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-black text-xs transition-all cursor-pointer shadow-lg shadow-[#FFB703]/25 active:scale-95"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>OPEN MISSION CONTROL CONSOLE</span>
                </button>
              </div>
            </>
          )}

          {selectedVessel && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {selectedVessel.pennant}
                </span>
                <span className="text-[8px] font-bold text-emerald-400">● UNDERWAY SURVEY</span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white">{selectedVessel.name}</h3>
                <p className="text-[9px] text-slate-400">{selectedVessel.type} · {selectedVessel.operator}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[7px] text-slate-400 block uppercase">HEADING</span>
                  <strong className="text-[#FFB703] font-bold">{selectedVessel.headingDeg}° TRUE</strong>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[7px] text-slate-400 block uppercase">SPEED</span>
                  <strong className="text-white font-bold">{selectedVessel.speedKts} KTS</strong>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[7px] text-slate-400 block uppercase">SWATH WIDTH</span>
                  <strong className="text-[#38BDF8] font-bold">{selectedVessel.swathWidthM} Meters</strong>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[7px] text-slate-400 block uppercase">SECTOR</span>
                  <strong className="text-white font-bold">{selectedVessel.currentSector}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Quick List of All 8 Indian Sectors */}
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
              ALL INDIAN SECTORS REGISTER
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {INDIA_MARITIME_SECTORS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToSector(s)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedSector?.id === s.id
                      ? 'bg-[#FFB703]/15 border-[#FFB703]/50 text-[#FFB703] font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-[#FFB703]/30 hover:text-white'
                  }`}
                >
                  <span className="text-[9px] font-bold truncate max-w-[170px]">{s.name}</span>
                  <span className="text-[8px] font-mono text-[#EAEFF5]">{s.contactsLogged} Contacts</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
