import React from 'react';
import { SonarMap } from '../components/map/SonarMap';
import {
  Compass,
  Radio,
  Sparkles,
  ShieldCheck,
  Globe2,
  Anchor,
  Activity,
  Layers,
  Ship,
  Key,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useGeospatialConfig } from '../context/GeospatialConfigContext';

export const DetectionMapPage: React.FC = () => {
  const { provider, status, openModal } = useGeospatialConfig();

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Geospatial Sensor Grounding & API Key Status Banner */}
      <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#00D4AA] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span>GEOTAGGING STATUS: ● SENSOR COORDINATES AVAILABLE</span>
          </div>
          <span className="text-[#2A5060]">|</span>
          <span className="text-[#7C98A6]">
            SOURCE: <strong className="text-[#E0F7F4]">Sonar Metadata / Ping CSV</strong>
          </span>
          <span className="text-[#2A5060]">|</span>
          <span className="text-[#7C98A6]">
            DATUM: <strong className="text-[#00D4AA]">WGS84</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {status === 'KEY_MISSING' ? (
            <div className="flex items-center gap-2">
              <span className="text-[#EF4444] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>MAP TILES: API KEY NOT CONFIGURED</span>
              </span>
              <button
                onClick={openModal}
                className="px-2.5 py-1 bg-[#EF4444] text-[#030B14] font-bold text-[9px] cursor-pointer hover:brightness-110 rounded-xs"
              >
                CONFIGURE API KEY
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[#00D4AA] font-bold">✓ BASEMAP ACTIVE (Esri Marine)</span>
              <button
                onClick={openModal}
                className="px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#7C98A6] hover:text-[#00D4AA] font-bold text-[9px] cursor-pointer rounded-xs"
              >
                MAP SETTINGS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning callout if external API key is missing */}
      {status === 'KEY_MISSING' && (
        <div className="p-3 bg-[#1C0D0D] border border-[#EF4444]/60 rounded-xs text-[9.5px] text-[#E0F7F4] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#EF4444] font-black uppercase">
              GEOTAGGING SERVICE NOT CONFIGURED
            </span>
            <span className="text-[#94A3B8] text-[8.5px]">OFFLINE SENSOR DATA READY</span>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            "Map/geocoding features require an API key." Target coordinates were extracted successfully from sonar/navigation metadata. Enhanced basemap visualization is unavailable because the external map service is not configured.
          </p>
        </div>
      )}

      {/* 2. Maritime Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#05121F] border border-[#0D2E4A] rounded-xs flex items-center gap-3">
          <div className="w-9 h-9 bg-[#082830] border border-[#00D4AA]/40 flex items-center justify-center text-[#00D4AA] shrink-0 rounded-xs">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">SURVEY EXTENT</span>
            <strong className="text-xs font-black text-[#E0F7F4]">48.2 NM CORRIDOR</strong>
            <span className="text-[8px] text-[#00D4AA] block font-bold">Mumbai Continental Shelf</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#05121F] border border-[#0D2E4A] rounded-xs flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0A1E30] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0 rounded-xs">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">SONAR FREQUENCY</span>
            <strong className="text-xs font-black text-[#E0F7F4]">900 kHz CHIRP</strong>
            <span className="text-[8px] text-[#38BDF8] block font-bold">75m Swath Width</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#05121F] border border-[#0D2E4A] rounded-xs flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0A1E30] border border-[#00D4AA]/40 flex items-center justify-center text-[#00D4AA] shrink-0 rounded-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">CONFIRMED DEBRIS</span>
            <strong className="text-xs font-black text-[#00D4AA]">10 VERIFIED</strong>
            <span className="text-[8px] text-[#7C98A6] block font-bold">7 Natural Rocks Filtered</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#05121F] border border-[#0D2E4A] rounded-xs flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0D1A08] border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0 rounded-xs">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">HERO TARGET</span>
            <strong className="text-xs font-black text-[#EF4444]">SX-T07 GHOST NET</strong>
            <span className="text-[8px] text-[#EF4444] block font-bold">18.9217° N, 72.8214° E</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive India Maritime Map */}
      <SonarMap />
    </div>
  );
};
