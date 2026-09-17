import React from 'react';
import { Play, Pause, Download, RotateCcw, Zap, FileText } from 'lucide-react';
import { SonarxLogoIcon } from '../common/SonarxLogo';
import { SURVEY_SITES, SurveySite } from '../../data/consoleData';

type DemoPhase = 'idle' | 'running' | 'done';

interface ConsoleTopBarProps {
  activeSite: SurveySite;
  onSelectSite: (site: SurveySite) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExportDossier: () => void;
  onReset: () => void;
  demoPhase: DemoPhase;
  onRunDemo: () => void;
  onExportIncidentReport?: () => void;
}

export const ConsoleTopBar: React.FC<ConsoleTopBarProps> = ({
  activeSite,
  onSelectSite,
  isPlaying,
  onTogglePlay,
  onExportDossier,
  onReset,
  demoPhase,
  onRunDemo,
  onExportIncidentReport,
}) => {
  return (
    <header className="h-11 bg-[#080D17] border-b border-[#162136] px-3 flex items-center justify-between font-mono text-[11px] select-none shrink-0 z-30">
      {/* Left: Product + node + link */}
      <div className="flex items-center gap-2.5">
        <SonarxLogoIcon size={22} animated={demoPhase === 'running'} />
        <span className="font-extrabold tracking-wider text-white">
          SONAR<span className="text-[#FFB703]">X</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">ANALYSIS NODE 04</span>

        {/* Live demo status pill */}
        {demoPhase === 'running' && (
          <span className="flex items-center gap-1 text-[9px] text-[#FFB703] font-bold border border-[#FFB703]/50 bg-[#122415] px-1.5 py-0.2 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
            LIVE DEMO RUNNING
          </span>
        )}
        {demoPhase === 'idle' && (
          <span className="flex items-center gap-1 text-[9px] text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
            AWAITING TRIGGER
          </span>
        )}
        {demoPhase === 'done' && (
          <span className="flex items-center gap-1 text-[9px] text-[#FFB703] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
            PIPELINE COMPLETE
          </span>
        )}
      </div>

      {/* Center: Survey selector + timestamp */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#94A3B8] uppercase">SURVEY:</span>
          <select
            value={activeSite.id}
            onChange={(e) => {
              const found = SURVEY_SITES.find((s) => s.id === e.target.value);
              if (found) onSelectSite(found);
            }}
            className="bg-[#0A1E30] border border-[#162136] text-[#F8FAFC] px-2 py-0.5 text-[10px] font-mono focus:outline-none focus:border-[#FFB703] cursor-pointer"
          >
            {SURVEY_SITES.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[#64748B]">·</span>
        <span className="text-[#94A3B8] hidden md:inline font-mono">{activeSite.timestamp}</span>
        <span className="text-[#64748B] hidden md:inline">·</span>
        <span className="text-[#F8FAFC] hidden lg:inline font-mono">
          SRC: <strong className="text-[#FFB703]">{activeSite.sourceFile}</strong>
        </span>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        <span className="border border-amber-500/80 text-amber-400 font-mono text-[9px] font-bold px-1.5 py-0.2 tracking-wider">
          SIM
        </span>

        {/* RUN LIVE DEMO / REPLAY primary button */}
        <button
          onClick={demoPhase === 'running' ? onTogglePlay : onRunDemo}
          className={`flex items-center gap-1.5 px-3 py-1 border font-black text-[10px] transition-all cursor-pointer ${
            demoPhase === 'running'
              ? isPlaying
                ? 'bg-amber-500 text-[#05070B] border-amber-500'
                : 'bg-[#0A1E30] text-amber-400 border-amber-500'
              : demoPhase === 'done'
              ? 'bg-[#0A1E30] border-[#FFB703]/60 text-[#FFB703] hover:bg-[#122415]'
              : 'bg-[#FFB703] text-[#05070B] border-[#FFB703] hover:brightness-110 shadow-[0_0_16px_rgba(74,222,128,0.35)]'
          }`}
          title={demoPhase === 'idle' ? 'Run automated live demo' : demoPhase === 'running' ? 'Pause / Resume' : 'Replay from beginning'}
        >
          {demoPhase === 'running' ? (
            isPlaying ? <><Pause className="w-3.5 h-3.5" /><span>PAUSE</span></> : <><Play className="w-3.5 h-3.5 fill-current" /><span>RESUME</span></>
          ) : (
            <><Play className="w-3.5 h-3.5 fill-current" /><span>START LIVE DEMO</span></>
          )}
        </button>

        <button
          onClick={onExportDossier}
          className="panel-btn flex items-center gap-1 hover:text-[#FFB703]"
          title="Export structured JSON / CSV inspection dossier"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">EXPORT DOSSIER</span>
        </button>

        {onExportIncidentReport && (
          <button
            onClick={onExportIncidentReport}
            className="panel-btn flex items-center gap-1 border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#05070B] transition-all"
            title="Generate official Ministry of Earth Sciences marine pollution incident advisory"
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">INCIDENT REPORT</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="panel-btn text-[#94A3B8] hover:text-[#ef4444]"
          title="Reset to idle"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
