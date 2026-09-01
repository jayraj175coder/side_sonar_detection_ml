import React, { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer, Polyline, Polygon, Marker, useMap, CircleMarker
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { Map } from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DATA, interpolateVesselPosition } from '../../data/mission';
import { MISSION_TARGETS } from '../../data/targets';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

const createTargetIcon = (color: string, selected: boolean) =>
  L.divIcon({
    html: `<div style="
      width:${selected ? 14 : 10}px; height:${selected ? 14 : 10}px;
      background:${color}; border-radius:50%;
      border:${selected ? '2px solid white' : '1.5px solid rgba(255,255,255,0.4)'};
      box-shadow:0 0 ${selected ? 10 : 4}px ${color};
      transition:all 0.2s;
    "></div>`,
    iconSize: [selected ? 14 : 10, selected ? 14 : 10],
    iconAnchor: [selected ? 7 : 5, selected ? 7 : 5],
    className: '',
  });

const createVesselIcon = () =>
  L.divIcon({
    html: `<div style="
      width:14px; height:14px; background:#32E6D1; border-radius:50%;
      border:2px solid white; box-shadow:0 0 12px #32E6D1;
      animation:ping 1.2s infinite;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: '',
  });

const MapFlyTo: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.panTo(center, { animate: true, duration: 0.5 }); }, [center, map]);
  return null;
};

export const MissionMapPanel: React.FC = () => {
  const {
    selectedTargetId, setSelectedTargetId,
    playbackTime, showTargets, showTrack, showSwath, visibleTargetIds,
  } = useMission();
  const [mapReady, setMapReady] = useState(false);

  const vessel = interpolateVesselPosition(playbackTime);
  const track  = MISSION_DATA.track.map(p => [p.lat, p.lon] as [number, number]);

  // Track points up to current time
  const trackSoFar = MISSION_DATA.track
    .filter(p => p.timeSeconds <= playbackTime)
    .map(p => [p.lat, p.lon] as [number, number]);

  return (
    <div className="relative flex flex-col h-full bg-[#02070E] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#081118] border-b border-[#16303B] shrink-0 z-[1000]">
        <div className="flex items-center gap-1.5">
          <Map className="w-3 h-3 text-[#29B6F6]" />
          <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Mission Map</span>
          <span className="ml-2 text-[9px] font-mono text-[#29B6F6]">{vessel.lat.toFixed(3)}°N · {vessel.lon.toFixed(3)}°E</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-[#32E6D1]">▼ {visibleTargetIds.length} targets</span>
          <span className="text-[#66848D]">SX-014</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={[18.921, 72.821]}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full mission-map"
          whenReady={() => setMapReady(true)}
          style={{ background: '#02070E' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="sonar-map-tiles"
          />

          {/* Survey polygon */}
          <Polygon
            positions={MISSION_DATA.polygon.map(p => p as LatLngExpression)}
            pathOptions={{ color: '#32E6D1', fillColor: '#32E6D1', fillOpacity: 0.03, weight: 1, dashArray: '4 4' }}
          />

          {/* Full planned track */}
          {showTrack && (
            <Polyline
              positions={track as LatLngExpression[]}
              pathOptions={{ color: '#29B6F6', weight: 1, opacity: 0.25, dashArray: '3 5' }}
            />
          )}

          {/* Track so far */}
          {showTrack && trackSoFar.length >= 2 && (
            <Polyline
              positions={trackSoFar as LatLngExpression[]}
              pathOptions={{ color: '#32E6D1', weight: 2, opacity: 0.7 }}
            />
          )}

          {/* Target markers */}
          {showTargets && MISSION_TARGETS
            .filter(t => visibleTargetIds.includes(t.id))
            .map(t => (
              <Marker
                key={t.id}
                position={[t.lat, t.lon]}
                icon={createTargetIcon(t.color, selectedTargetId === t.id)}
                eventHandlers={{ click: () => setSelectedTargetId(t.id === selectedTargetId ? null : t.id) }}
              />
            ))
          }

          {/* Vessel */}
          {playbackTime > 0 && (
            <Marker
              position={[vessel.lat, vessel.lon]}
              icon={createVesselIcon()}
            />
          )}

          {selectedTargetId && (() => {
            const t = MISSION_TARGETS.find(x => x.id === selectedTargetId);
            if (!t) return null;
            return <MapFlyTo center={[t.lat, t.lon]} />;
          })()}
        </MapContainer>

        {/* Target count badge */}
        <div className="absolute bottom-2 left-2 z-[500] px-2 py-1 rounded bg-[#03070B]/90 border border-[#16303B] text-[9px] font-mono text-[#66848D]">
          <span className="text-[#32E6D1] font-bold">{visibleTargetIds.length}</span> / {MISSION_TARGETS.length} targets visible
        </div>
      </div>
    </div>
  );
};
