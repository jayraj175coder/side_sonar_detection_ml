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

// Vertical Navigation & Zoom Controls (Floating Bottom Right)
const MapNavigationControls: React.FC<{ onRecenter: () => void }> = ({ onRecenter }) => {
  const map = useMap();
  return (
    <div className="flex flex-col gap-1 bg-[#080B11]/95 p-1 rounded-xl border border-[#1B2330] shadow-2xl backdrop-blur-md">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-lg bg-[#10151D] hover:bg-[#1B2330] border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] flex items-center justify-center transition-all cursor-pointer"
        title="Zoom In (or use mouse wheel / pinch)"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-lg bg-[#10151D] hover:bg-[#1B2330] border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] flex items-center justify-center transition-all cursor-pointer"
        title="Zoom Out (or use mouse wheel / pinch)"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={onRecenter}
        className="w-8 h-8 rounded-lg bg-[#10151D] hover:bg-[#1B2330] border border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] flex items-center justify-center transition-all cursor-pointer"
        title="Re-Center to Active Scenario AOI"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
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

  // Map View Coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.921, 72.821]);
  const [mapZoom, setMapZoom] = useState<number>(7);

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
    <div className="flex flex-col h-[760px] bg-[#080B11] border border-[#1B2330] rounded-2xl overflow-hidden select-none font-mono text-xs shadow-2xl relative">
      {/* ─────────────────────────────────────────────────────────────────
          TOP BAR: SCENARIO SELECTOR, SEARCH, OFFLINE STATUS, 3-WAY MAP SWITCHER, LAYERS DROPDOWN
          Matches user reference screenshot UI verbatim
      ───────────────────────────────────────────────────────────────── */}
      <div className="px-3.5 py-2.5 bg-[#0C1118] border-b border-[#1B2330] flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2.5 flex-1 min-w-[320px]">
          {/* Active Scenario Selector Dropdown */}
          <div className="relative" ref={scenarioDropdownRef}>
            <button
              onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121924] border border-[#222E40] hover:border-[#4CD9E8]/60 text-[#EAEFF5] text-[10px] font-bold transition-all cursor-pointer shadow-md"
            >
              <span className="text-[#64748B] uppercase tracking-wider font-semibold">
                ACTIVE SCENARIO:
              </span>
              <span className="text-[#4CD9E8] font-black">{currentScenario.name}</span>
              <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
            </button>

            {isScenarioDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-[#0C1118] border border-[#222E40] rounded-xl shadow-2xl z-50 p-1.5 space-y-1 backdrop-blur-xl">
                <div className="px-2 py-1 text-[8px] uppercase tracking-wider text-[#64748B] font-bold">
                  INDIAN MARITIME THEATRE SCENARIOS
                </div>
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`w-full flex flex-col items-start px-2.5 py-2 rounded-lg text-left transition-all ${
                      sc.id === activeScenarioId
                        ? 'bg-[#4CD9E8]/15 border border-[#4CD9E8]/40 text-[#4CD9E8]'
                        : 'hover:bg-[#16202E] text-[#94A3B8] hover:text-[#EAEFF5]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold text-[#EAEFF5]">{sc.name}</span>
                      {sc.id === activeScenarioId && <Check className="w-3 h-3 text-[#4CD9E8]" />}
                    </div>
                    <span className="text-[8px] text-[#64748B] mt-0.5">{sc.subLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search MMSI, Vessel name, or coords */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search MMSI, vessel name, or coords (lon, lat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121924] border border-[#222E40] rounded-xl pl-8 pr-3 py-1.5 text-[9px] text-[#EAEFF5] placeholder-[#64748B] focus:outline-none focus:border-[#4CD9E8] transition-all"
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
                ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                : 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
            }`}
            title="Click to toggle Live AIS / Autonomous Offline telemetry"
          >
            <span
              className={`w-2 h-2 rounded-full ${isOffline ? 'bg-[#EF4444]' : 'bg-[#10B981] animate-ping'}`}
            />
            <span>{isOffline ? '🔴 OFFLINE' : '🟢 LIVE SYNC'}</span>
          </button>

          {/* 3-WAY MAP STYLE SWITCHER: SATELLITE | BATHYMETRY | DARK HUD */}
          <div className="flex items-center bg-[#121924] p-1 rounded-xl border border-[#222E40]">
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-[#4CD9E8] text-[#080B11] shadow-[0_0_12px_rgba(76,217,232,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#EAEFF5]'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>SATELLITE</span>
            </button>

            <button
              onClick={() => setMapMode('bathymetry')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                mapMode === 'bathymetry'
                  ? 'bg-[#38BDF8] text-[#080B11] shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#EAEFF5]'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>BATHYMETRY</span>
            </button>

            <button
              onClick={() => setMapMode('dark_hud')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                mapMode === 'dark_hud'
                  ? 'bg-[#10B981] text-[#080B11] shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-[#94A3B8] hover:text-[#EAEFF5]'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121924] border border-[#222E40] hover:border-[#4CD9E8]/60 text-[#EAEFF5] text-[9px] font-black transition-all cursor-pointer shadow-md"
            >
              <Layers className="w-3.5 h-3.5 text-[#4CD9E8]" />
              <span>LAYERS {activeLayerCount}/7</span>
              <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
            </button>

            {isLayersOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-[#0C1118] border border-[#222E40] rounded-xl shadow-2xl z-50 p-2 space-y-1.5 backdrop-blur-xl">
                <div className="px-2 py-1 text-[8px] uppercase tracking-wider text-[#64748B] font-bold border-b border-[#1B2330]">
                  TACTICAL GIS LAYERS
                </div>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>1. EEZ Boundary (UNCLOS)</span>
                  <input
                    type="checkbox"
                    checked={showEEZ}
                    onChange={(e) => setShowEEZ(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>2. Hydrographic Sectors (8)</span>
                  <input
                    type="checkbox"
                    checked={showSectors}
                    onChange={(e) => setShowSectors(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>3. Research Vessels (4)</span>
                  <input
                    type="checkbox"
                    checked={showVessels}
                    onChange={(e) => setShowVessels(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>4. Bathymetric Contours</span>
                  <input
                    type="checkbox"
                    checked={showBathymetry}
                    onChange={(e) => setShowBathymetry(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>5. Real-Time Tracklines</span>
                  <input
                    type="checkbox"
                    checked={showTracklines}
                    onChange={(e) => setShowTracklines(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>6. Subsea Geographic Labels</span>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#16202E] cursor-pointer text-[9px] text-[#EAEFF5]">
                  <span>7. Contact Ping Reticles</span>
                  <input
                    type="checkbox"
                    checked={showContactMarkers}
                    onChange={(e) => setShowContactMarkers(e.target.checked)}
                    className="accent-[#4CD9E8] rounded cursor-pointer"
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
                  color: '#4CD9E8',
                  weight: 1.5,
                  dashArray: '6, 6',
                  fillColor: '#4CD9E8',
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

            {/* Layer 2 & 7: Hydrographic Survey Sectors & Contacts */}
            {showSectors &&
              INDIA_MARITIME_SECTORS.map((sector) => (
                <Marker
                  key={sector.id}
                  position={[sector.lat, sector.lon]}
                  icon={createSectorPin(sector, selectedSector?.id === sector.id)}
                  eventHandlers={{
                    click: () => handleJumpToSector(sector),
                  }}
                />
              ))}

            {/* Layer 3: Active Research Vessels */}
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
            <div className="px-3 py-1.5 rounded-xl bg-[#0C1118]/95 border border-[#222E40] text-[9px] text-[#94A3B8] flex items-center gap-2 shadow-2xl backdrop-blur-md">
              <span className="text-[#64748B] font-bold">LON:</span>
              <strong className="text-[#4CD9E8] font-mono">
                {Math.abs(mouseCoords.lon).toFixed(4)}° {mouseCoords.lon >= 0 ? 'E' : 'W'}
              </strong>
              <span className="text-[#222E40]">|</span>
              <span className="text-[#64748B] font-bold">LAT:</span>
              <strong className="text-[#4CD9E8] font-mono">
                {Math.abs(mouseCoords.lat).toFixed(4)}° {mouseCoords.lat >= 0 ? 'N' : 'S'}
              </strong>
              <span className="text-[#222E40]">|</span>
              <span className="text-[#10B981] font-black tracking-wider">MARITIME AOI</span>
            </div>

            {/* Vertical Zoom Navigation Controls */}
            <MapNavigationControls onRecenter={handleRecenter} />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING BOTTOM-LEFT: INFO BUTTON
          ───────────────────────────────────────────────────────────── */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowInfoModal(!showInfoModal)}
              className="w-8 h-8 rounded-xl bg-[#0C1118]/95 hover:bg-[#16202E] border border-[#222E40] hover:border-[#4CD9E8] text-[#4CD9E8] flex items-center justify-center transition-all shadow-2xl backdrop-blur-md cursor-pointer"
              title="AOI Intelligence & Map Interaction Guide"
            >
              <Info className="w-4 h-4" />
            </button>

            {showInfoModal && (
              <div className="w-80 bg-[#0C1118]/95 border border-[#222E40] rounded-xl p-3 shadow-2xl backdrop-blur-xl space-y-2 text-[9px]">
                <div className="flex items-center justify-between border-b border-[#1B2330] pb-1.5">
                  <div className="flex items-center gap-1.5 text-[#4CD9E8] font-bold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>MARITIME GIS CONTROLS</span>
                  </div>
                  <button
                    onClick={() => setShowInfoModal(false)}
                    className="text-[#64748B] hover:text-[#EAEFF5]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[#94A3B8]">
                  • <strong className="text-[#EAEFF5]">Hand Drag:</strong> Click & hold anywhere with the hand cursor to pan smoothly across maritime sectors.
                </p>
                <p className="text-[#94A3B8]">
                  • <strong className="text-[#EAEFF5]">Scroll-Wheel / Pinch:</strong> Zoom in and out smoothly down to 10m seabed resolution.
                </p>
                <p className="text-[#94A3B8]">
                  • <strong className="text-[#EAEFF5]">Modes:</strong> Switch between High-Res Satellite Imagery, GEBCO Ocean Bathymetry, or Cyber Dark HUD.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT SIDE: TACTICAL SECTOR & VESSEL INTELLIGENCE DRAWER
        ───────────────────────────────────────────────────────────── */}
        <div className="w-80 md:w-96 bg-[#0C1118] border-l border-[#1B2330] flex flex-col overflow-y-auto z-10 shadow-2xl p-3.5 space-y-3 shrink-0">
          {selectedSector && (
            <>
              {/* Sector Header */}
              <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#4CD9E8]/15 text-[#4CD9E8] border border-[#4CD9E8]/30">
                    {selectedSector.id}
                  </span>
                  <span
                    className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                      selectedSector.status === 'HIGH ALERT'
                        ? 'bg-[#F04438]/15 text-[#F04438] border-[#F04438]/40'
                        : selectedSector.status === 'ACTIVE SURVEY'
                        ? 'bg-[#4CD9E8]/15 text-[#4CD9E8] border-[#4CD9E8]/40'
                        : 'bg-[#3FD98A]/15 text-[#3FD98A] border-[#3FD98A]/40'
                    }`}
                  >
                    {selectedSector.status}
                  </span>
                </div>

                <h3 className="text-sm font-black text-[#EAEFF5] leading-snug">
                  {selectedSector.name}
                </h3>
                <p className="text-[9px] text-[#94A3B8]">
                  {selectedSector.subName} · {selectedSector.fleetCommand}
                </p>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1B2330] text-[9px]">
                  <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                    <span className="text-[7px] text-[#94A3B8] uppercase block">BATHYMETRY DEPTH</span>
                    <strong className="text-[#29B6F6] font-bold">{selectedSector.depthRangeM}</strong>
                  </div>
                  <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                    <span className="text-[7px] text-[#94A3B8] uppercase block">TOTAL CONTACTS</span>
                    <strong className="text-[#4CD9E8] font-bold">{selectedSector.contactsLogged} Cataloged</strong>
                  </div>
                  <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                    <span className="text-[7px] text-[#94A3B8] uppercase block">HIGH-RISK THREATS</span>
                    <strong className="text-[#F04438] font-bold">{selectedSector.criticalThreats} Critical</strong>
                  </div>
                  <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                    <span className="text-[7px] text-[#94A3B8] uppercase block">ASSIGNED VESSEL</span>
                    <strong className="text-[#EAEFF5] font-bold">{selectedSector.assignedVessel}</strong>
                  </div>
                </div>
              </div>

              {/* Sector Environmental & Hydrographic Findings */}
              <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-1.5 text-[9px]">
                <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  SURVEY INTELLIGENCE & THREAT SUMMARY
                </span>
                <p className="text-[#EAEFF5] leading-relaxed">
                  {selectedSector.description}
                </p>
                <div className="pt-2 text-[8px] text-[#4CD9E8]">
                  PRIMARY TARGET CLASS: <strong className="text-[#EAEFF5]">{selectedSector.primaryClass}</strong>
                </div>
              </div>

              {/* Action: Jump to Flagship Mission Control */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setActiveTab('mission')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#4CD9E8] hover:bg-[#38b2c0] text-[#080B11] font-black text-xs transition-all cursor-pointer shadow-lg shadow-[rgba(76,217,232,0.25)]"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>OPEN MISSION CONTROL CONSOLE</span>
                </button>
              </div>
            </>
          )}

          {selectedVessel && (
            <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#29B6F6]/15 text-[#29B6F6] border border-[#29B6F6]/30">
                  {selectedVessel.pennant}
                </span>
                <span className="text-[8px] font-bold text-[#3FD98A]">● UNDERWAY SURVEY</span>
              </div>

              <div>
                <h3 className="text-sm font-black text-[#EAEFF5]">{selectedVessel.name}</h3>
                <p className="text-[9px] text-[#94A3B8]">{selectedVessel.type} · {selectedVessel.operator}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                  <span className="text-[7px] text-[#94A3B8] block uppercase">HEADING</span>
                  <strong className="text-[#4CD9E8] font-bold">{selectedVessel.headingDeg}° TRUE</strong>
                </div>
                <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                  <span className="text-[7px] text-[#94A3B8] block uppercase">SPEED</span>
                  <strong className="text-[#EAEFF5] font-bold">{selectedVessel.speedKts} KTS</strong>
                </div>
                <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                  <span className="text-[7px] text-[#94A3B8] block uppercase">SWATH WIDTH</span>
                  <strong className="text-[#29B6F6] font-bold">{selectedVessel.swathWidthM} Meters</strong>
                </div>
                <div className="p-2 rounded bg-[#121924] border border-[#1B2330]">
                  <span className="text-[7px] text-[#94A3B8] block uppercase">SECTOR</span>
                  <strong className="text-[#EAEFF5] font-bold">{selectedVessel.currentSector}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Quick List of All 8 Indian Sectors */}
          <div className="pt-2 border-t border-[#1B2330] space-y-2">
            <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-wider block">
              ALL INDIAN SECTORS REGISTER
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {INDIA_MARITIME_SECTORS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToSector(s)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                    selectedSector?.id === s.id
                      ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/50 text-[#4CD9E8]'
                      : 'bg-[#080B11] border-[#1B2330] text-[#94A3B8] hover:border-[#4CD9E8]/30 hover:text-[#EAEFF5]'
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
