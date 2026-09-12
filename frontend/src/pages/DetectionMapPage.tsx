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
      <div className="p-3.5 bg-[#050B14] border border-[#102436] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>MINISTRY OF EARTH SCIENCES (MoES) // WGS84 SUBSEA GEOSPATIAL INTELLIGENCE</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs hidden md:inline">
            DATUM: <strong className="text-cyan-300 font-mono">WGS84 GEODETIC</strong>
          </span>
          <span className="text-slate-700 hidden lg:inline">|</span>
          <span className="text-slate-400 text-xs hidden lg:inline">
            SURVEY: <strong className="text-emerald-400 font-mono">NIOT/INCOIS MULTI-BEAM EEZ TRACK</strong>
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
                className="px-3 py-1 bg-[#091522] border border-[#102436] hover:border-cyan-500/40 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                MAP SETTINGS
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-xs">✓ BASEMAP ACTIVE (Esri Marine)</span>
              <button
                onClick={openModal}
                className="px-3 py-1 bg-[#091522] border border-[#102436] hover:border-cyan-500/40 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                MAP SETTINGS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. DEBRIS-WISE BIOLUMINESCENT COLOR LEGEND BAR */}
      <div className="p-3 bg-[#050B14] border border-[#102436] rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 shrink-0">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            DEBRIS CLASSIFICATION COLOR CODES:
          </span>
        </div>

        {/* 4 Distinct Debris Colors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#091522] border border-emerald-500/30 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <div>
              <div className="text-xs font-bold text-emerald-300">Ghost Nets (ALDFG)</div>
              <div className="text-[10px] text-slate-400 font-mono">Emerald Green • #00D4AA</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#091522] border border-amber-500/30 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <div>
              <div className="text-xs font-bold text-amber-300">Anthropogenic Debris</div>
              <div className="text-[10px] text-slate-400 font-mono">Electric Orange • #F59E0B</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#091522] border border-cyan-500/30 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            <div>
              <div className="text-xs font-bold text-cyan-300">Pipeline Hazards</div>
              <div className="text-[10px] text-slate-400 font-mono">Subsea Blue • #06B6D4</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#091522] border border-purple-500/30 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            <div>
              <div className="text-xs font-bold text-purple-300">Seafloor Anomalies</div>
              <div className="text-[10px] text-slate-400 font-mono">Magenta Purple • #A855F7</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MARITIME METRIC STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#050B14] border border-[#102436] rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-cyan-950/80 border border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SURVEY EXTENT</span>
            <strong className="text-sm font-extrabold text-white font-mono">48.2 NM CORRIDOR</strong>
            <span className="text-xs text-cyan-400 block font-semibold">Mumbai Continental Shelf</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#050B14] border border-[#102436] rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-blue-950/80 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SONAR FREQUENCY</span>
            <strong className="text-sm font-extrabold text-white font-mono">900 kHz CHIRP</strong>
            <span className="text-xs text-blue-400 block font-semibold">75m Swath Width</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#050B14] border border-[#102436] rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">VERIFIED TARGETS</span>
            <strong className="text-sm font-extrabold text-emerald-400 font-mono">10 VERIFIED</strong>
            <span className="text-xs text-slate-400 block font-semibold">7 Natural Rocks Filtered</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#050B14] border border-[#102436] rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-amber-950/80 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HERO TARGET</span>
            <strong className="text-sm font-extrabold text-amber-400 font-mono">SX-T07 GHOST NET</strong>
            <span className="text-xs text-amber-300 block font-mono font-semibold">18.9217° N, 72.8214° E</span>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE INDIA MARITIME MAP */}
      <SonarMap />
    </div>
  );
};

