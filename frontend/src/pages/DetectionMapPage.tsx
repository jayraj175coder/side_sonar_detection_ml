import React from 'react';
import { SonarMap } from '../components/map/SonarMap';
import {
  Compass,
  Radio,
  Globe2,
  Activity,
  Layers,
  Ship,
  AlertTriangle,
  Waves,
  ShieldCheck,
} from 'lucide-react';
import { useGeospatialConfig } from '../context/GeospatialConfigContext';

export const DetectionMapPage: React.FC = () => {
  const { status, openModal } = useGeospatialConfig();

  return (
    <div className="space-y-4 font-sans select-none text-xs">
      {/* 1. MoES Govt. of India GIS Control & Geotag Status Bar */}
      <div className="p-3.5 subpixel-card rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#FFB703] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB703] animate-pulse shadow-[0_0_8px_#FFB703]" />
            <span>MINISTRY OF EARTH SCIENCES (MoES) // WGS84 SUBSEA GEOSPATIAL INTELLIGENCE</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs hidden md:inline font-mono">
            DATUM: <strong className="text-slate-200">WGS84 GEODETIC</strong>
          </span>
          <span className="text-slate-700 hidden lg:inline">|</span>
          <span className="text-slate-400 text-xs hidden lg:inline font-mono">
            SURVEY: <strong className="text-[#FFB703]">NIOT/INCOIS MULTI-BEAM EEZ TRACK</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {status === 'KEY_MISSING' ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold flex items-center gap-1 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>OFFLINE ESRI SUBSEA MAP ACTIVE</span>
              </span>
              <button
                onClick={openModal}
                className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                MAP SETTINGS
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[#FFB703] font-bold text-xs">✓ BASEMAP ACTIVE (Esri Marine)</span>
              <button
                onClick={openModal}
                className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                MAP SETTINGS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. DEBRIS-WISE COLOR LEGEND BAR */}
      <div className="p-3 subpixel-card rounded-2xl border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 shrink-0">
          <Layers className="w-4 h-4 text-[#FFB703]" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            DEBRIS CLASSIFICATION COLOR CODES:
          </span>
        </div>

        {/* 4 Distinct Debris Colors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-[#FFB703]/20 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-[#FFB703] shadow-[0_0_8px_#FFB703]" />
            <div>
              <div className="text-xs font-bold text-[#FFB703]">Ghost Nets (ALDFG)</div>
              <div className="text-[10px] text-slate-400 font-mono">Sonar Amber • #FFB703</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-amber-500/20 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <div>
              <div className="text-xs font-bold text-amber-300">Anthropogenic Debris</div>
              <div className="text-[10px] text-slate-400 font-mono">Electric Orange • #F59E0B</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-sky-500/20 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <div>
              <div className="text-xs font-bold text-sky-300">Pipeline Hazards</div>
              <div className="text-[10px] text-slate-400 font-mono">Subsea Blue • #38BDF8</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/20 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            <div>
              <div className="text-xs font-bold text-white">Seafloor Anomalies</div>
              <div className="text-[10px] text-slate-400 font-mono">Titanium White • #FFFFFF</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MARITIME METRIC STRIP (Linear Style Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 subpixel-card rounded-2xl border border-white/[0.08] flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center text-[#FFB703] shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SURVEY EXTENT</span>
            <strong className="text-sm font-extrabold text-white font-mono">48.2 NM CORRIDOR</strong>
            <span className="text-xs text-[#FFB703] block font-semibold">Mumbai Continental Shelf</span>
          </div>
        </div>

        <div className="p-3.5 subpixel-card rounded-2xl border border-white/[0.08] flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center text-white shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SONAR FREQUENCY</span>
            <strong className="text-sm font-extrabold text-white font-mono">900 kHz CHIRP</strong>
            <span className="text-xs text-slate-300 block font-semibold">75m Swath Width</span>
          </div>
        </div>

        <div className="p-3.5 subpixel-card rounded-2xl border border-white/[0.08] flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center text-[#FFB703] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">VERIFIED TARGETS</span>
            <strong className="text-sm font-extrabold text-[#FFB703] font-mono">10 VERIFIED</strong>
            <span className="text-xs text-slate-400 block font-semibold">7 Natural Rocks Filtered</span>
          </div>
        </div>

        <div className="p-3.5 subpixel-card rounded-2xl border border-white/[0.08] flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center text-[#FFB703] shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HERO TARGET</span>
            <strong className="text-sm font-extrabold text-[#FFB703] font-mono">SX-T07 GHOST NET</strong>
            <span className="text-xs text-amber-300 block font-mono font-semibold">18.9217° N, 72.8214° E</span>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE INDIA MARITIME MAP */}
      <SonarMap />
    </div>
  );
};
