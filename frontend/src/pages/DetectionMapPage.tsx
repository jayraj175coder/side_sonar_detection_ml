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
      <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#00D4AA] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#00D4AA]" />
            <span>GEOTAGGING: ✓ INTRINSIC SENSOR COORDINATES AVAILABLE</span>
          </div>
          <span className="text-[#2A5060]">|</span>
          <span className="text-[#4A8090]">
            PROVIDER: <strong className="text-[#E0F7F4] uppercase">{provider.replace('_', ' ')}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {status === 'KEY_MISSING' ? (
            <div className="flex items-center gap-2">
              <span className="text-[#EF4444] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>BASEMAP: API KEY NOT CONFIGURED</span>
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
              <span className="text-[#00D4AA] font-bold">✓ BASEMAP ACTIVE</span>
              <button
                onClick={openModal}
                className="px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#4A8090] hover:text-[#00D4AA] font-bold text-[9px] cursor-pointer rounded-xs"
              >
                CONFIGURE KEY
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning callout if external API key is missing */}
      {status === 'KEY_MISSING' && (
        <div className="p-3 bg-[#1C0D0D] border border-[#EF4444]/60 rounded-xl text-[9.5px] text-[#E0F7F4] space-y-1">
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
        <div className="p-3.5 rounded-2xl bg-[#05121F] border border-[#0D2E4A] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#082830] border border-[#00D4AA]/40 flex items-center justify-center text-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.2)] shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">INDIA EEZ COVERAGE</span>
            <strong className="text-sm font-black text-[#E0F7F4]">2,372,000 km²</strong>
            <span className="text-[8px] text-[#00D4AA] block font-bold">● WGS-84 BATHYMETRY</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#05121F] border border-[#0D2E4A] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A1E30] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.2)] shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">ACTIVE FLEET UNITS</span>
            <strong className="text-sm font-black text-[#E0F7F4]">4 RESEARCH SHIPS</strong>
            <span className="text-[8px] text-[#38BDF8] block font-bold">INS Sandhayak / NHO</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#05121F] border border-[#0D2E4A] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A1E30] border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] shadow-[0_0_12px_rgba(192,132,252,0.2)] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">SURVEY BASINS</span>
            <strong className="text-sm font-black text-[#E0F7F4]">8 COASTAL SECTORS</strong>
            <span className="text-[8px] text-[#C084FC] block font-bold">Arabian & Bengal Seas</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#05121F] border border-[#0D2E4A] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D1A08] border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.2)] shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] text-[#4A8090] uppercase block">CLASSIFIED CONTACTS</span>
            <strong className="text-sm font-black text-[#E0F7F4]">17 ANOMALIES</strong>
            <span className="text-[8px] text-[#EF4444] block font-bold">4 High Priority</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive India Maritime Map */}
      <SonarMap />
    </div>
  );
};
