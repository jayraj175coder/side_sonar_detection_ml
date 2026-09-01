import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Marker,
  Circle,
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
  Plus,
  Minus,
  Layers,
  Ship,
  Activity,
  Zap,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DATA, interpolateVesselPosition } from '../../data/mission';
import { MISSION_TARGETS } from '../../data/targets';
import type { MissionTarget } from '../../types';

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
  } = useMission();

  const [mapCenter, setMapCenter] = useState<[number, number]>([18.921, 72.821]);
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
      {/* 1. Header Bar with Indian Maritime Identity */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#10151D] border-b border-[#1B2330] shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#4CD9E8] animate-pulse" />
          <span className="font-black text-[#EAEFF5] uppercase tracking-wider">
            🇮🇳 ARABIAN SEA · MUMBAI OFFSHORE
          </span>
          <span className="text-[8px] text-[#7C8AA0] hidden sm:inline">
            · {vessel.lat.toFixed(3)}°N, {vessel.lon.toFixed(3)}°E
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4CD9E8]/10 text-[#4CD9E8] border border-[#4CD9E8]/30 font-bold">
            {visibleTargetIds.length} TARGETS
          </span>
          <span className="text-[#7C8AA0] text-[8px]">{MISSION_DATA.id}</span>
        </div>
      </div>

      {/* 2. Map Container with Native Dark Carto Subsea Tiles */}
      <div className="flex-1 relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
          style={{ background: '#080B11' }}
        >
          {/* Native Dark Carto Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            className="sonar-dark-tiles"
          />

          <MapFlyTo center={mapCenter} />

          {/* Survey Swath Polygon Box */}
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

          {/* Full Planned Lawnmower Track */}
          {showTrack && (
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
          {showTrack && trackSoFar.length >= 2 && (
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

          {/* Classified Contact Markers */}
          {showTargets &&
            MISSION_TARGETS.filter((t) => visibleTargetIds.includes(t.id)).map((target) => (
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

        {/* Floating Re-center Button */}
        <div className="absolute top-2 right-12 z-[500] flex flex-col items-end gap-2">
          <button
            onClick={handleCenterOnVessel}
            className="px-2 py-1 rounded bg-[#10151D]/90 border border-[#1B2330] hover:border-[#4CD9E8] text-[#4CD9E8] text-[8px] font-bold shadow-lg backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer"
            title="Center View on Survey Vessel"
          >
            <Crosshair className="w-2.5 h-2.5" />
            <span>RE-CENTER AUV</span>
          </button>
        </div>

        {/* Floating Telemetry Badge (Bottom Left) */}
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
    </div>
  );
};
