import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Marker,
  Circle,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import {
  Map,
  Compass,
  Radio,
  Crosshair,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Layers,
  Ship,
  Activity,
  Zap,
  Globe2,
  Waves,
  Shield,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DATA, interpolateVesselPosition } from '../../data/mission';
import { MISSION_TARGETS, computeUncertaintyRadiusM } from '../../data/targets';
import type { MissionTarget } from '../../types';
import { MapLayerTogglePanel, type MapLayers } from '../map/MapLayerTogglePanel';
import { HydrographicTelemetryPanel } from '../map/HydrographicTelemetryPanel';
import { SurveyAcquisitionTimeline } from '../map/SurveyAcquisitionTimeline';

// Fix Leaflet default icon path
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

// Create Sexy Neon Contact Reticle
const createTargetPin = (target: MissionTarget, isSelected: boolean) => {
  const isCritical = target.risk === 'CRITICAL' || target.classCode === 'MLO';
  const color = isSelected ? '#4CD9E8' : isCritical ? '#F04438' : target.color || '#4CD9E8';
  const scale = isSelected ? 1.3 : 1.0;
  const shadowGlow = isSelected ? '0 0 16px rgba(76, 217, 232, 0.8)' : `0 0 8px ${color}`;

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: scale(${scale}); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Radar Ping Halo -->
      <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${color}; opacity: 0.25;" class="${isSelected ? 'animate-ping' : ''}"></div>
      
      <!-- Core Reticle Ring -->
      <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #080B11; border: 2px solid ${color}; box-shadow: ${shadowGlow}; display: flex; align-items: center; justify-content: center;">
        <div style="width: 4px; height: 4px; border-radius: 50%; background: ${color};"></div>
      </div>

      <!-- Tag Label Pill -->
      <div style="position: absolute; bottom: -8px; padding: 1px 4px; border-radius: 4px; background: #080B11; border: 1px solid ${color}; font-size: 7px; font-family: 'JetBrains Mono', monospace; font-weight: bold; color: ${color}; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.9);">
        ${target.id}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-mission-target-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Create Sexy Naval Vessel & Towfish Icon with Rotating Radar Beam
const createVesselMarker = (headingDeg: number) => {
  const html = `
    <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
      <!-- Sonar Ping Expanding Wave Ripple -->
      <div class="animate-sonar-ripple" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #4CD9E8; background: rgba(76, 217, 232, 0.1);"></div>

      <!-- Rotating Conic Radar Sweep Beam -->
      <div class="animate-radar-beam" style="position: absolute; width: 52px; height: 52px; border-radius: 50%;"></div>

      <!-- Naval Vessel Core with Heading Direction Indicator -->
      <div style="width: 22px; height: 22px; border-radius: 50%; background: #080B11; border: 2px solid #4CD9E8; box-shadow: 0 0 16px rgba(76, 217, 232, 0.9); display: flex; align-items: center; justify-content: center; z-index: 10; transform: rotate(${headingDeg}deg);">
        <!-- Heading Arrow -->
        <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid #4CD9E8;"></div>
      </div>

      <!-- Vessel Label Pill -->
      <div style="position: absolute; bottom: -6px; padding: 1px 4px; border-radius: 4px; background: #080B11; border: 1px solid #4CD9E8; font-size: 7px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #4CD9E8; white-space: nowrap; z-index: 20;">
        INS SANDHAYAK
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-mission-vessel-marker',
    html,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
};

// Map Pan Controller
const MapFlyTo: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
};

// Custom Zoom Controls
const CustomZoomControl: React.FC = () => {
  const map = useMap();
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="w-6 h-6 rounded bg-[#10151D]/90 border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] flex items-center justify-center transition-all shadow-md cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-3 h-3" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-6 h-6 rounded bg-[#10151D]/90 border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] flex items-center justify-center transition-all shadow-md cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-3 h-3" />
      </button>
    </div>
  );
};

export const MissionMapPanel: React.FC = () => {
  const {
    selectedTargetId,
    setSelectedTargetId,
    playbackTime,
    showTargets,
    showTrack,
    visibleTargetIds,
    focusedPanel,
    setFocusedPanel,
    activeTargets,
  } = useMission();

  const [mapMode, setMapMode] = useState<'satellite' | 'bathymetry' | 'dark_hud'>('dark_hud');
  const [showUncertainty, setShowUncertainty] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.921, 72.821]);

  // Layer toggle state (SLICKTRACE-style control panel)
  const [layers, setLayers] = useState<MapLayers>({
    ghostNets:          true,
    pipelines:          true,
    marineDebris:       true,
    seafloorAnomalies:  true,
    surveyTrack:        true,
    swathEnvelope:      true,
    uncertaintyRadius:  true,
    sonarRange:         true,
    graticule:          true,
    highPriorityOnly:   false,
  });

  const toggleLayer = (key: keyof MapLayers) =>
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // Sync uncertainty with layer toggle
  const effectiveShowUncertainty = showUncertainty && layers.uncertaintyRadius;

  const vessel = interpolateVesselPosition(playbackTime);
  const track = MISSION_DATA.track.map((p) => [p.lat, p.lon] as [number, number]);

  // Completed track up to current playback timestamp
  const trackSoFar = MISSION_DATA.track
    .filter((p) => p.timeSeconds <= playbackTime)
    .map((p) => [p.lat, p.lon] as [number, number]);

  const handleCenterOnVessel = () => {
    setMapCenter([vessel.lat, vessel.lon]);
  };

  return (
    <div className="relative flex flex-col h-full bg-[#080B11] overflow-hidden select-none font-mono text-[9px]">
      {/* 1. Header Bar with Indian Maritime Identity & 3-Way Mode Switcher */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#10151D] border-b border-[#1B2330] shrink-0 z-10 shadow-md gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#4CD9E8] animate-pulse" />
          <span className="font-black text-[#EAEFF5] uppercase tracking-wider">
            🇮🇳 ARABIAN SEA · MUMBAI OFFSHORE
          </span>
          <span className="text-[8px] text-[#7C8AA0] hidden sm:inline">
            · {vessel.lat.toFixed(3)}°N, {vessel.lon.toFixed(3)}°E
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Position Uncertainty Radius (±r meters) Toggle */}
          <button
            onClick={() => setShowUncertainty(!showUncertainty)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold transition-all border cursor-pointer ${
              showUncertainty
                ? 'bg-[#00D4AA]/15 text-[#00D4AA] border-[#00D4AA]/50 shadow-[0_0_10px_rgba(0,212,170,0.25)]'
                : 'bg-[#080B11] text-[#7C8AA0] border-[#1B2330] hover:text-[#EAEFF5]'
            }`}
            title="Toggle Position Uncertainty Radius Overlay (±r meters: Acoustic Ray Bending & Towfish Layback Error per IHO S-44 Order 1a)"
          >
            <span className="font-mono text-[#4CD9E8]">±r</span>
            <span className="hidden sm:inline">TPU BUFFER</span>
            <span className={`w-1.5 h-1.5 rounded-full ${showUncertainty ? 'bg-[#00D4AA] animate-pulse' : 'bg-[#7C8AA0]'}`} />
          </button>

          {/* 3-Way Mode Switcher */}
          <div className="flex items-center bg-[#080B11] p-0.5 rounded-lg border border-[#1B2330]">
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-[#4CD9E8] text-[#080B11]'
                  : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
              }`}
              title="High-Resolution Satellite Imagery"
            >
              <Globe2 className="w-2.5 h-2.5" />
              <span>SAT</span>
            </button>
            <button
              onClick={() => setMapMode('bathymetry')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                mapMode === 'bathymetry'
                  ? 'bg-[#38BDF8] text-[#080B11]'
                  : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
              }`}
              title="GEBCO Ocean Bathymetry & Seabed Contours"
            >
              <Waves className="w-2.5 h-2.5" />
              <span>BATHY</span>
            </button>
            <button
              onClick={() => setMapMode('dark_hud')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                mapMode === 'dark_hud'
                  ? 'bg-[#10B981] text-[#080B11]'
                  : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
              }`}
              title="Tactical Dark Subsea HUD"
            >
              <Shield className="w-2.5 h-2.5" />
              <span>DARK</span>
            </button>
          </div>

          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4CD9E8]/10 text-[#4CD9E8] border border-[#4CD9E8]/30 font-bold">
            {visibleTargetIds.length} TARGETS
          </span>
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'map' ? null : 'map')}
            className={`p-1 rounded border transition-colors cursor-pointer ${
              focusedPanel === 'map'
                ? 'bg-[#4CD9E8]/20 border-[#4CD9E8] text-[#4CD9E8]'
                : 'bg-[#161C26] border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8]'
            }`}
            title={focusedPanel === 'map' ? 'Exit Focus View' : 'Expand Map to Full Focus'}
          >
            {focusedPanel === 'map' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 2. Map Container with Hand-Drag & Smooth Wheel Zoom */}
      <div className="flex-1 relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ background: '#080B11' }}
        >
          {/* Tile Layer by Selected Mode */}
          {mapMode === 'satellite' && (
            <>
              <TileLayer
                key="mission-sat-base"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                key="mission-sat-labels"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.8}
              />
            </>
          )}

          {mapMode === 'bathymetry' && (
            <>
              <TileLayer
                key="mission-ocean-base"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                key="mission-ocean-reference"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
                opacity={0.7}
              />
            </>
          )}

          {mapMode === 'dark_hud' && (
            <>
              <TileLayer
                key="mission-dark-base"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                className="sonar-dark-tiles"
              />
              <TileLayer
                key="mission-dark-labels"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                opacity={0.7}
              />
            </>
          )}

          <MapFlyTo center={mapCenter} />

          {/* Survey Swath Polygon Box */}
          {layers.swathEnvelope && (
            <Polygon
              positions={MISSION_DATA.polygon.map((p) => p as LatLngExpression)}
              pathOptions={{
                color: '#4CD9E8',
                fillColor: '#4CD9E8',
                fillOpacity: 0.05,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
          )}

          {/* Full Planned Lawnmower Track */}
          {showTrack && layers.surveyTrack && (
            <Polyline
              positions={track as LatLngExpression[]}
              pathOptions={{
                color: '#29B6F6',
                weight: 1.5,
                opacity: 0.35,
                dashArray: '4, 6',
              }}
            />
          )}

          {/* Completed Swath Trackline with Glowing Cyan Line */}
          {showTrack && layers.surveyTrack && trackSoFar.length >= 2 && (
            <Polyline
              positions={trackSoFar as LatLngExpression[]}
              pathOptions={{
                color: '#4CD9E8',
                weight: 2.5,
                opacity: 0.9,
              }}
            />
          )}

          {/* Concentric Sonar Range Rings centered on vessel */}
          {layers.sonarRange && (
            <>
              <Circle
                center={[vessel.lat, vessel.lon]}
                radius={400}
                pathOptions={{
                  color: 'rgba(76, 217, 232, 0.25)',
                  weight: 1,
                  dashArray: '2, 4',
                  fill: false,
                }}
              />
              <Circle
                center={[vessel.lat, vessel.lon]}
                radius={800}
                pathOptions={{
                  color: 'rgba(76, 217, 232, 0.15)',
                  weight: 1,
                  dashArray: '3, 6',
                  fill: false,
                }}
              />
            </>
          )}

          {/* ── Position Uncertainty Radius Buffer (±r meters) ── */}
          {/* Models acoustic ray bending through the thermocline and USBL / towfish layback offset */}
          {showTargets &&
            effectiveShowUncertainty &&
            activeTargets
              .filter((t) => visibleTargetIds.includes(t.id))
              .filter((t) => !layers.highPriorityOnly || t.risk === 'CRITICAL')
              .map((target) => {
                const radiusM = computeUncertaintyRadiusM(target);
                const isSelected = selectedTargetId === target.id;
                const isCritical = target.risk === 'CRITICAL' || target.classCode === 'MLO';
                const color = isSelected ? '#4CD9E8' : isCritical ? '#F04438' : target.color || '#4CD9E8';

                return (
                  <Circle
                    key={`unc-${target.id}`}
                    center={[target.lat, target.lon]}
                    radius={radiusM}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.22 : 0.08,
                      weight: isSelected ? 2.0 : 1.2,
                      dashArray: isSelected ? '4, 4' : '2, 3',
                    }}
                    eventHandlers={{
                      click: () =>
                        setSelectedTargetId(selectedTargetId === target.id ? null : target.id),
                    }}
                  >
                    {isSelected && (
                      <Tooltip permanent direction="top" offset={[0, -18]} opacity={0.95}>
                        <div className="bg-[#050C16]/95 border border-[#4CD9E8] rounded px-2 py-1.5 text-[8.5px] font-mono text-[#EAEFF5] shadow-2xl space-y-0.5 pointer-events-none">
                          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-0.5">
                            <span className="text-[#4CD9E8] font-bold">{target.id} TPU BUFFER</span>
                            <span className="text-[#FFB703] font-bold">±{radiusM.toFixed(1)} m</span>
                          </div>
                          <div className="text-[7.5px] text-[#7C8AA0]">
                            • Acoustic Ray Bending: ±{(target.depth * 0.058).toFixed(1)} m
                          </div>
                          <div className="text-[7.5px] text-[#7C8AA0]">
                            • Towfish Layback Offset: ±{(target.slantRange * 0.075).toFixed(1)} m
                          </div>
                          <div className="text-[7px] text-[#00D4AA] font-semibold pt-0.5">
                            IHO S-44 Order 1a Standard
                          </div>
                        </div>
                      </Tooltip>
                    )}
                  </Circle>
                );
              })}

          {/* Classified Contact Markers — filtered by layer toggles */}
          {showTargets &&
            activeTargets
              .filter((t) => visibleTargetIds.includes(t.id))
              .filter((t) => !layers.highPriorityOnly || t.risk === 'CRITICAL')
              .filter((t) => {
                const cls = t.classCode;
                if (!layers.ghostNets && (cls === 'ALDFG' || cls === 'MLO')) return false;
                if (!layers.pipelines && cls === 'PIP') return false;
                if (!layers.marineDebris && cls === 'DEBRIS') return false;
                if (!layers.seafloorAnomalies && cls === 'ANOM') return false;
                return true;
              })
              .map((target) => (
                <Marker
                  key={target.id}
                  position={[target.lat, target.lon]}
                  icon={createTargetPin(target, selectedTargetId === target.id)}
                  eventHandlers={{
                    click: () =>
                      setSelectedTargetId(selectedTargetId === target.id ? null : target.id),
                  }}
                />
              ))}

          {/* Active Survey Vessel Marker with Radar Beam & Ripples */}
          <Marker
            position={[vessel.lat, vessel.lon]}
            icon={createVesselMarker(vessel.heading)}
          />

          {/* Custom Zoom Controls inside MapContainer context */}
          <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, margin: '8px' }}>
            <div className="leaflet-control flex flex-col gap-1">
              <CustomZoomControl />
            </div>
          </div>
        </MapContainer>

        {/* ── SLICKTRACE-style Layer Toggle Panel (top-left overlay) ── */}
        <MapLayerTogglePanel layers={layers} onToggle={toggleLayer} />

        {/* ── Hydrographic Telemetry Widgets (top-right overlay) ── */}
        <HydrographicTelemetryPanel />

        {/* Floating Re-center Button */}
        <div className="absolute top-2 right-2 z-[500] flex flex-col items-end gap-2" style={{ marginTop: '220px' }}>
          <button
            onClick={handleCenterOnVessel}
            className="px-2 py-1 rounded bg-[#10151D]/90 border border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] text-[8px] font-bold shadow-lg backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer"
            title="Center View on Survey Vessel"
          >
            <Crosshair className="w-2.5 h-2.5" />
            <span>RE-CENTER AUV</span>
          </button>
        </div>

        {/* Floating AUV Telemetry Badge (Bottom Left) */}
        <div className="absolute bottom-2 left-2 z-[500] px-2.5 py-1.5 rounded-lg bg-[#080B11]/90 border border-[#1B2330] text-[8px] text-[#7C8AA0] flex items-center gap-3 backdrop-blur-md shadow-xl">
          <div>
            <span>HDG: </span>
            <strong className="text-[#4CD9E8]">{vessel.heading.toFixed(0)}°</strong>
          </div>
          <div>
            <span>DEPTH: </span>
            <strong className="text-[#29B6F6]">{vessel.depth.toFixed(1)}m</strong>
          </div>
          <div>
            <span>SPEED: </span>
            <strong className="text-[#EAEFF5]">{vessel.speed.toFixed(1)} kts</strong>
          </div>
          <div className="hidden sm:flex items-center gap-1 border-l border-[#1B2330] pl-3">
            <span className="text-[#7C8AA0]">TPU: </span>
            <strong className={effectiveShowUncertainty ? 'text-[#00D4AA]' : 'text-[#7C8AA0]'}>
              {effectiveShowUncertainty ? '±r ON (IHO S-44)' : 'OFF'}
            </strong>
          </div>
        </div>

        {/* Target Lock Notification */}
        {selectedTargetId && (
          <div className="absolute bottom-2 right-2 z-[500] px-2.5 py-1 rounded-lg bg-[#080B11]/95 border border-[#4CD9E8]/50 text-[8px] flex items-center gap-1.5 shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CD9E8] animate-ping" />
            <span className="text-[#7C8AA0]">LOCK:</span>
            <strong className="text-[#4CD9E8] font-bold">{selectedTargetId}</strong>
          </div>
        )}
      </div>

      {/* ── Survey Acoustic Ping Acquisition Timeline (SLICKTRACE-style bottom strip) ── */}
      <SurveyAcquisitionTimeline />
    </div>
  );
};
