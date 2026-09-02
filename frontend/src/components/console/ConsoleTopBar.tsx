import React from 'react';
import { Play, Pause, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { SURVEY_SITES, SurveySite } from '../../data/consoleData';

interface ConsoleTopBarProps {
  activeSite: SurveySite;
  onSelectSite: (site: SurveySite) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExportDossier: () => void;
  onReset: () => void;
}

export const ConsoleTopBar: React.FC<ConsoleTopBarProps> = ({
  activeSite,
  onSelectSite,
  isPlaying,
  onTogglePlay,
  onExportDossier,
  onReset,
}) => {
  return (
    <header className="h-11 bg-[#090e09] border-b border-[#193019] px-3 flex items-center justify-between font-mono text-[11px] select-none shrink-0 z-30">
      {/* 1. Left: Product Name + Analysis Node + Link OK */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black tracking-[0.22em] text-[#4ade80] uppercase">
          SONARLINE
        </span>
        <span className="text-[#3d5843]">|</span>
        <span className="text-[10px] text-[#64876b] uppercase tracking-wider">
          ANALYSIS NODE 04
        </span>
        <span className="flex items-center gap-1 text-[9px] text-[#4ade80] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          <span>link ok</span>
        </span>
      </div>

      {/* 2. Center: Active Survey Site Dropdown + Timestamp + Source File */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#64876b] uppercase">SURVEY:</span>
          <select
            value={activeSite.id}
            onChange={(e) => {
              const found = SURVEY_SITES.find((s) => s.id === e.target.value);
              if (found) onSelectSite(found);
            }}
            className="bg-[#0e160e] border border-[#193019] text-[#dcfce7] px-2 py-0.5 text-[10px] font-mono focus:outline-none focus:border-[#4ade80] cursor-pointer"
          >
            {SURVEY_SITES.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[#3d5843]">·</span>
        <span className="text-[#64876b] hidden md:inline font-mono">
          {activeSite.timestamp}
        </span>
        <span className="text-[#3d5843] hidden md:inline">·</span>
        <span className="text-[#dcfce7] hidden lg:inline font-mono">
          SRC: <strong className="text-[#4ade80]">{activeSite.sourceFile}</strong>
        </span>
      </div>

      {/* 3. Right: SIM Badge + Pass Controls + Export */}
      <div className="flex items-center gap-2">
        {/* Upfront SIM Badge */}
        <span className="border border-amber-500/80 text-amber-400 font-mono text-[9px] font-bold px-1.5 py-0.2 tracking-wider">
          SIM
        </span>

        {/* Play / Pause Walkthrough Button */}
        <button
          onClick={onTogglePlay}
          className={`panel-btn flex items-center gap-1.5 ${
            isPlaying ? 'bg-[#4ade80] text-[#070b07] border-[#4ade80]' : ''
          }`}
          title="Play / Pause survey playback"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlaying ? 'PAUSE PASS' : 'RUN PASS'}</span>
        </button>

        {/* Export Dossier */}
        <button
          onClick={onExportDossier}
          className="panel-btn flex items-center gap-1 hover:text-[#4ade80]"
          title="Export structured JSON / CSV inspection dossier"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">EXPORT DOSSIER</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="panel-btn text-[#64876b] hover:text-[#ef4444]"
          title="Reset stage to 01 INGEST"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
