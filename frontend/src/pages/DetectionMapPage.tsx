import React from 'react';
import { SonarMap } from '../components/map/SonarMap';
import {
  CheckCircle2,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { useGeospatialConfig } from '../context/GeospatialConfigContext';

export const DetectionMapPage: React.FC = () => {
  const { status, openModal } = useGeospatialConfig();

  return (
    <div className="space-y-2.5 font-sans select-none text-xs flex flex-col h-[calc(100vh-90px)] min-h-[640px]">
      {/* ── UNIFIED TACTICAL GIS HUD STRIP (High Density, Zero Clutter) ── */}
      <div className="px-4 py-2.5 subpixel-card rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
        {/* Left: MoES Geotag & Survey Extent */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 text-[#FFB703] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-pulse shadow-[0_0_8px_#FFB703]" />
            <span className="font-black uppercase tracking-wide text-xs text-white font-mono">
              MoES SUBSEA GIS INTELLIGENCE
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            SURVEY: <strong className="text-[#FFB703]">NIOT/INCOIS 48.2 NM EEZ CORRIDOR</strong>
          </span>
        </div>

        {/* Center: Debris Classification Taxonomy Indicators */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono">
          <span className="text-slate-500 uppercase font-semibold">TAXONOMY:</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-[#FFB703] shadow-[0_0_6px_#FFB703]" />
            <span className="text-slate-300 font-semibold">Ghost Net (ALDFG)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-slate-300 font-semibold">Anthropogenic Debris</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
            <span className="text-slate-300 font-semibold">Pipeline</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            <span className="text-slate-300 font-semibold">Anomaly</span>
          </div>
        </div>

        {/* Right: Telemetry Counts & Map Settings Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>10 VERIFIED</span>
            </span>
            <span className="text-slate-600 font-normal">·</span>
            <span className="text-[#FFB703] font-semibold">SX-T07 HERO</span>
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFB703]/50 text-slate-300 hover:text-white font-mono font-bold text-[10px] rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>MAP SETTINGS</span>
          </button>
        </div>
      </div>

      {/* ── EXPANSIVE LEAFLET MARITIME MAP (Maximizes screen real estate) ── */}
      <div className="flex-1 min-h-0 w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]">
        <SonarMap />
      </div>
    </div>
  );
};
