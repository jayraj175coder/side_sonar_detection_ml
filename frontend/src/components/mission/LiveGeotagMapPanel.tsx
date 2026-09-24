import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Layers } from 'lucide-react';
import type { DetectionBox } from '../../data/demoPipelineData';

interface LiveGeotagMapPanelProps {
  detections: DetectionBox[];
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
}

export const LiveGeotagMapPanel: React.FC<LiveGeotagMapPanelProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let L: any = (window as any).L;
    if (!L) {
      // Dynamic load Leaflet if not present on window
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    } else {
      initMap();
    }

    function initMap() {
      L = (window as any).L;
      if (!L || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [18.9217, 72.8214],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Esri Dark Marine Canvas — Free, zero watermarks, zero API keys required
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
      }).addTo(map);

      // Survey Corridor Polygon
      const polygonCoords = [
        [18.935, 72.808],
        [18.907, 72.808],
        [18.907, 72.832],
        [18.935, 72.832],
      ];
      L.polygon(polygonCoords, {
        color: '#FFB703',
        weight: 1,
        dashArray: '4, 4',
        fillColor: '#FFB703',
        fillOpacity: 0.04,
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMarkers();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarkers = () => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    detections.forEach((box) => {
      const isSelected = selectedDetectionId === box.id;
      const isFiltered = box.status === 'FILTERED_OUT';

      let markerColor = '#65D391';
      if (isFiltered) markerColor = '#FF5D5D';
      else if (box.classCode === 'NET') markerColor = '#FFB703';
      else if (box.classCode === 'GEAR') markerColor = '#FFB547';
      else if (box.classCode === 'PIPE') markerColor = '#29B6F6';

      const customIcon = L.divIcon({
        className: 'custom-sonar-marker',
        html: `
          <div style="
            width: ${isSelected ? '24px' : '18px'};
            height: ${isSelected ? '24px' : '18px'};
            background-color: ${markerColor};
            border: 2px solid #081118;
            border-radius: 50%;
            box-shadow: 0 0 12px ${markerColor};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <div style="width: 6px; height: 6px; background-color: #081118; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // Position Uncertainty Radius (±r meters) - Acoustic ray bending & towfish layback
      const rayBending = (box.depthM || 40) * 0.058;
      const layback = 25 * 0.075;
      const ambiguity = (1 - (box.confidence || 0.85)) * 6.5;
      const uncertaintyM = Math.min(22.0, Math.max(3.8, Math.round((Math.sqrt(1.2 * 1.2 + rayBending * rayBending + layback * layback) + ambiguity) * 10) / 10));

      const circle = L.circle([box.lat, box.lon], {
        radius: uncertaintyM,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: isSelected ? 0.22 : 0.08,
        weight: isSelected ? 2 : 1.2,
        dashArray: isSelected ? '4, 4' : '2, 3',
      }).addTo(map);
      markersRef.current.push(circle);

      const marker = L.marker([box.lat, box.lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #E4F2F5; background: #081118; padding: 7px; border-radius: 8px; border: 1px solid #16303B; min-width: 170px;">
            <strong style="color: ${markerColor};">${box.id} // ${box.label}</strong><br/>
            <span>Confidence: ${(box.confidence * 100).toFixed(1)}%</span><br/>
            <span>Depth: ${box.depthM.toFixed(1)}m</span><br/>
            <span>Coords: ${box.lat.toFixed(4)}°N, ${box.lon.toFixed(4)}°E</span><br/>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #16303B; color: #00F5D4; font-size: 10px; font-weight: bold;">
              TPU Buffer: ±${uncertaintyM.toFixed(1)} m (IHO S-44)
            </div>
          </div>
        `,
          { className: 'sonar-dark-popup' }
        );

      marker.on('click', () => {
        onSelectDetection(box.id);
      });

      markersRef.current.push(marker);

      if (isSelected) {
        map.panTo([box.lat, box.lon], { animate: true });
        marker.openPopup();
      }
    });
  };

  useEffect(() => {
    updateMarkers();
  }, [detections, selectedDetectionId]);

  return (
    <div className="w-full bg-[#081118] border border-[#16303B] rounded-2xl p-3.5 shadow-xl font-mono select-none flex flex-col space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#FFB703]" />
          <h3 className="text-xs font-black text-[#E4F2F5] tracking-wider uppercase font-sans">
            LIVE GEOTAGGED SUBSEA MAP
          </h3>
        </div>
        <span className="text-[9px] text-[#6F8992] font-mono">
          SURVEY SECTOR: ARABIAN SEA
        </span>
      </div>

      {/* Embedded Map Container */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#16303B] bg-[#03070B]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-[#081118]/90 border border-[#16303B] backdrop-blur-md flex items-center gap-3 text-[8px] text-[#E4F2F5] z-[1000]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFB703]" />
            <span>Ghost Net</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
            <span>Trawl Gear</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#29B6F6]" />
            <span>Pipeline</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF5D5D]" />
            <span>Filtered Noise</span>
          </span>
          <span className="flex items-center gap-1 border-l border-[#16303B] pl-2 text-[#00F5D4]">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#00F5D4] bg-[#00F5D4]/20" />
            <span>±r TPU Buffer</span>
          </span>
        </div>
      </div>
    </div>
  );
};
