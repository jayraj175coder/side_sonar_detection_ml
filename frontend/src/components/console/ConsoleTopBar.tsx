import React from 'react';
import { Play, Pause, Download, RotateCcw, Zap } from 'lucide-react';
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
}) => {
  return (
    <header className="h-11 bg-[#090e09] border-b border-[#193019] px-3 flex items-center justify-between font-mono text-[11px] select-none shrink-0 z-30">
      {/* Left: Product + node + link */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black tracking-[0.22em] text-[#4ade80] uppercase">
          SONARLINE
        </span>
        <span className="text-[#3d5843]">|</span>
        <span className="text-[10px] text-[#64876b] uppercase tracking-wider">ANALYSIS NODE 04</span>

        {/* Live demo status pill */}
        {demoPhase === 'running' && (
          <span className="flex items-center gap-1 text-[9px] text-[#4ade80] font-bold border border-[#4ade80]/50 bg-[#122415] px-1.5 py-0.2 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            LIVE DEMO RUNNING
          </span>
        )}
        {demoPhase === 'idle' && (
          <span className="flex items-center gap-1 text-[9px] text-[#3d5843]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3d5843]" />
            AWAITING TRIGGER
          </span>
        )}
        {demoPhase === 'done' && (
          <span className="flex items-center gap-1 text-[9px] text-[#4ade80] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            PIPELINE COMPLETE
          </span>
        )}
      </div>

      {/* Center: Survey selector + timestamp */}
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
        <span className="text-[#64876b] hidden md:inline font-mono">{activeSite.timestamp}</span>
        <span className="text-[#3d5843] hidden md:inline">·</span>
        <span className="text-[#dcfce7] hidden lg:inline font-mono">
          SRC: <strong className="text-[#4ade80]">{activeSite.sourceFile}</strong>
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
                ? 'bg-amber-500 text-[#070b07] border-amber-500'
                : 'bg-[#0e160e] text-amber-400 border-amber-500'
              : demoPhase === 'done'
              ? 'bg-[#0e160e] border-[#4ade80]/60 text-[#4ade80] hover:bg-[#122415]'
              : 'bg-[#4ade80] text-[#070b07] border-[#4ade80] hover:brightness-110 shadow-[0_0_16px_rgba(74,222,128,0.35)]'
          }`}
          title={demoPhase === 'idle' ? 'Run automated live demo' : demoPhase === 'running' ? 'Pause / Resume' : 'Replay from beginning'}
        >
          {demoPhase === 'running' ? (
            isPlaying ? <><Pause className="w-3.5 h-3.5" /><span>PAUSE</span></> : <><Play className="w-3.5 h-3.5 fill-current" /><span>RESUME</span></>
          ) : demoPhase === 'done' ? (
            <><RotateCcw className="w-3.5 h-3.5" /><span>REPLAY</span></>
          ) : (
            <><Zap className="w-3.5 h-3.5" /><span>RUN LIVE DEMO</span></>
          )}
        </button>

        <button
          onClick={onExportDossier}
          className="panel-btn flex items-center gap-1 hover:text-[#4ade80]"
          title="Export structured JSON / CSV inspection dossier"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">EXPORT DOSSIER</span>
        </button>

        <button
          onClick={onReset}
          className="panel-btn text-[#64876b] hover:text-[#ef4444]"
          title="Reset to idle"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
