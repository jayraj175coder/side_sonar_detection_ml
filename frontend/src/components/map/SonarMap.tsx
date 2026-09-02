import React, { useState, useMemo } from 'react';
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
  Activity,
  Zap,
} from 'lucide-react';
import {
  INDIA_MARITIME_SECTORS,
  HYDROGRAPHIC_VESSELS,
  INDIA_EEZ_POLYGON,
  IndiaMaritimeSector,
  HydrographicVessel,
} from '../../data/indiaMapData';
import { useApp } from '../../context/AppContext';
import { useGeospatialConfig } from '../../context/GeospatialConfigContext';

// Custom Tactical Pin for Indian Maritime Sectors
const createSectorPin = (sector: IndiaMaritimeSector, isSelected: boolean) => {
  const isCritical = sector.status === 'HIGH ALERT' || sector.criticalThreats >= 4;
  const isSelectedStyle = isSelected ? 'transform: scale(1.25); z-index: 99;' : '';

  const pinColor = isCritical ? '#F04438' : sector.status === 'ACTIVE SURVEY' ? '#4CD9E8' : '#3FD98A';
  const glowColor = isCritical ? 'rgba(240, 68, 56, 0.45)' : 'rgba(76, 217, 232, 0.45)';

  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; ${isSelectedStyle} transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Radar Pulse Wave -->
      <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: ${pinColor}; opacity: 0.25;" class="animate-ping"></div>
      
      <!-- Middle Tactical Ring -->
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #080B11; border: 2px solid ${pinColor}; box-shadow: 0 0 16px ${glowColor};"></div>
      
      <!-- Inner Core Dot -->
      <div style="width: 10px; height: 10px; border-radius: 50%; background: ${pinColor};"></div>

      <!-- Sector Code Pill -->
      <div style="position: absolute; bottom: -10px; padding: 2px 6px; border-radius: 6px; background: #080B11; border: 1px solid ${pinColor}; font-size: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: ${pinColor}; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.9);">
        ${sector.id.replace('SEC-', '')} · ${sector.contactsLogged}C
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-sector-marker',
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
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
  React.useEffect(() => {
    map.flyTo(coords, zoom, { duration: 1.5 });
  }, [coords, zoom, map]);
  return null;
};

export const SonarMap: React.FC = () => {
  const { setActiveTab } = useApp();

  const { activeTileUrl, activeTileAttribution } = useGeospatialConfig();

  const [selectedSector, setSelectedSector] = useState<IndiaMaritimeSector | null>(INDIA_MARITIME_SECTORS[0]);
  const [selectedVessel, setSelectedVessel] = useState<HydrographicVessel | null>(null);
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Layer Toggles
  const [showEEZ, setShowEEZ] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showSectors, setShowSectors] = useState<boolean>(true);

  // Map View Coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.8, 79.5]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  // Region filtering
  const filteredSectors = useMemo(() => {
    return INDIA_MARITIME_SECTORS.filter((sector) => {
      const matchRegion = activeRegionFilter === 'ALL' || sector.region === activeRegionFilter;
      const matchQuery =
        sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.primaryClass.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchQuery;
    });
  }, [activeRegionFilter, searchQuery]);

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

  const handleResetIndiaView = () => {
    setSelectedSector(null);
    setSelectedVessel(null);
    setMapCenter([14.8, 79.5]);
    setMapZoom(5);
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#080B11] border border-[#1B2330] rounded-2xl overflow-hidden select-none font-mono text-xs shadow-2xl relative">
      {/* 1. Sexy Cyber-Naval Header Banner */}
      <div className="px-4 py-3 bg-[#10151D] border-b border-[#1B2330] flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4CD9E8]/15 border border-[#4CD9E8]/30 flex items-center justify-center text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.25)]">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#EAEFF5] tracking-widest uppercase">
                INDIA MARITIME OPERATIONS & EEZ THEATRE
              </h2>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#3FD98A]/10 text-[#3FD98A] border border-[#3FD98A]/30">
                2.37M KM² EEZ MONITORED
              </span>
            </div>
            <p className="text-[9px] text-[#7C8AA0]">
              National Hydrographic Office (NHO) & MoES Multi-Beam Side-Scan Sonar Telemetry
            </p>
          </div>
        </div>

        {/* Quick Region Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#080B11] p-1 rounded-xl border border-[#1B2330]">
          {[
            { id: 'ALL', label: '🇮🇳 ALL EEZ' },
            { id: 'Arabian Sea', label: '🌊 ARABIAN SEA' },
            { id: 'Bay of Bengal', label: '⚓ BAY OF BENGAL' },
            { id: 'Indian Ocean', label: '🐠 GULF OF MANNAR' },
            { id: 'Andaman Sea', label: '🏝️ ANDAMAN' },
            { id: 'Lakshadweep Sea', label: '🌴 LAKSHADWEEP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRegionFilter(tab.id);
                if (tab.id === 'ALL') handleResetIndiaView();
              }}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-black transition-all ${
                activeRegionFilter === tab.id
                  ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/50 shadow-[0_0_10px_rgba(76,217,232,0.2)]'
                  : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Viewport: Left Map (with HUD overlays) + Right Sector Telemetry Drawer */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Leaflet Dark Map */}
        <div className="flex-1 h-full relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <MapFlyTo coords={mapCenter} zoom={mapZoom} />

            {/* High-Contrast Dark Subsea Marine Tile Layer (Zero Watermarks, No Key Required) */}
            <TileLayer
              key={activeTileUrl}
              attribution={activeTileAttribution}
              url={activeTileUrl}
            />

            {/* India Exclusive Economic Zone (EEZ) Boundary Polygon */}
            {showEEZ && (
              <Polygon
                positions={INDIA_EEZ_POLYGON}
                pathOptions={{
                  color: '#4CD9E8',
                  weight: 1.5,
                  dashArray: '6, 6',
                  fillColor: '#4CD9E8',
                  fillOpacity: 0.04,
                }}
              />
            )}

            {/* Hydrographic Survey Sectors */}
            {showSectors &&
              filteredSectors.map((sector) => (
                <Marker
                  key={sector.id}
                  position={[sector.lat, sector.lon]}
                  icon={createSectorPin(sector, selectedSector?.id === sector.id)}
                  eventHandlers={{
                    click: () => handleJumpToSector(sector),
                  }}
                />
              ))}

            {/* Active Research Vessels */}
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

          {/* Floating Sexy Map Control HUD */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {/* Search Input */}
            <div className="relative flex items-center w-64">
              <Search className="w-3.5 h-3.5 text-[#7C8AA0] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sector, port, or vessel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080B11]/90 border border-[#1B2330] rounded-xl pl-8 pr-3 py-1.5 text-[9px] text-[#EAEFF5] placeholder-[#7C8AA0] focus:outline-none focus:border-[#4CD9E8]/60 backdrop-blur-md shadow-xl"
              />
            </div>

            {/* Layer Filter Toggles */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080B11]/90 border border-[#1B2330] backdrop-blur-md shadow-xl text-[8px]">
              <button
                onClick={() => setShowEEZ(!showEEZ)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  showEEZ
                    ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/40'
                    : 'text-[#7C8AA0]'
                }`}
              >
                EEZ BOUNDARY
              </button>
              <button
                onClick={() => setShowSectors(!showSectors)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  showSectors
                    ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/40'
                    : 'text-[#7C8AA0]'
                }`}
              >
                8 SECTORS
              </button>
              <button
                onClick={() => setShowVessels(!showVessels)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  showVessels
                    ? 'bg-[#29B6F6]/20 text-[#29B6F6] border border-[#29B6F6]/40'
                    : 'text-[#7C8AA0]'
                }`}
              >
                4 VESSELS
              </button>
            </div>
          </div>

          {/* Floating Map Reset Button */}
          <div className="absolute bottom-3 left-3 z-10">
            <button
              onClick={handleResetIndiaView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080B11]/90 border border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] text-[9px] font-bold backdrop-blur-md shadow-xl transition-all"
            >
              <Maximize2 className="w-3 h-3" />
              <span>RESET INDIA OVERVIEW</span>
            </button>
          </div>
        </div>

        {/* Right Side: Tactical Sector & Vessel Intelligence Drawer */}
        <div className="w-80 md:w-96 bg-[#10151D] border-l border-[#1B2330] flex flex-col overflow-y-auto z-10 shadow-2xl p-3.5 space-y-3 shrink-0">
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
                <p className="text-[9px] text-[#7C8AA0]">
                  {selectedSector.subName} · {selectedSector.fleetCommand}
                </p>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1B2330] text-[9px]">
                  <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">BATHYMETRY DEPTH</span>
                    <strong className="text-[#29B6F6] font-bold">{selectedSector.depthRangeM}</strong>
                  </div>
                  <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">TOTAL CONTACTS</span>
                    <strong className="text-[#4CD9E8] font-bold">{selectedSector.contactsLogged} Cataloged</strong>
                  </div>
                  <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">HIGH-RISK THREATS</span>
                    <strong className="text-[#F04438] font-bold">{selectedSector.criticalThreats} Critical</strong>
                  </div>
                  <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">ASSIGNED VESSEL</span>
                    <strong className="text-[#EAEFF5] font-bold">{selectedSector.assignedVessel}</strong>
                  </div>
                </div>
              </div>

              {/* Sector Environmental & Hydrographic Findings */}
              <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-1.5 text-[9px]">
                <span className="text-[8px] font-bold text-[#7C8AA0] uppercase tracking-wider block">
                  SURVEY INTELLIGENCE & THREAT SUMMARY
                </span>
                <p className="text-[#EAEFF5] leading-relaxed">
                  {selectedSector.description}
                </p>
                <div className="pt-2 text-[8px] text-[#4CD9E8]">
                  PRIMARY TARGET CLASS: <strong className="text-[#EAEFF5]">{selectedSector.primaryClass}</strong>
                </div>
              </div>

              {/* Action: Jump to Flagship Mission Control / Sonar Viewer */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setActiveTab('sonar')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#4CD9E8] text-[#080B11] font-black text-xs hover:bg-[#29B6F6] transition-all shadow-[0_0_20px_rgba(76,217,232,0.3)] cursor-pointer active:scale-98"
                >
                  <Eye className="w-4 h-4" />
                  <span>INSPECT IN SONAR STUDIO</span>
                </button>

                <button
                  onClick={() => setActiveTab('mission')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/50 text-[#EAEFF5] font-bold text-xs transition-all cursor-pointer"
                >
                  <Crosshair className="w-4 h-4 text-[#4CD9E8]" />
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
                <p className="text-[9px] text-[#7C8AA0]">{selectedVessel.type} · {selectedVessel.operator}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                  <span className="text-[7px] text-[#7C8AA0] block uppercase">HEADING</span>
                  <strong className="text-[#4CD9E8] font-bold">{selectedVessel.headingDeg}° TRUE</strong>
                </div>
                <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                  <span className="text-[7px] text-[#7C8AA0] block uppercase">SPEED</span>
                  <strong className="text-[#EAEFF5] font-bold">{selectedVessel.speedKts} KTS</strong>
                </div>
                <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                  <span className="text-[7px] text-[#7C8AA0] block uppercase">SWATH WIDTH</span>
                  <strong className="text-[#29B6F6] font-bold">{selectedVessel.swathWidthM} Meters</strong>
                </div>
                <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                  <span className="text-[7px] text-[#7C8AA0] block uppercase">SECTOR</span>
                  <strong className="text-[#EAEFF5] font-bold">{selectedVessel.currentSector}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Quick List of All 8 Indian Sectors */}
          <div className="pt-2 border-t border-[#1B2330] space-y-2">
            <span className="text-[8px] font-bold text-[#7C8AA0] uppercase tracking-wider block">
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
                      : 'bg-[#080B11] border-[#1B2330] text-[#7C8AA0] hover:border-[#4CD9E8]/30 hover:text-[#EAEFF5]'
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
