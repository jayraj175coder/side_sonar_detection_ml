import React from 'react';
import { Play, Square, UploadCloud, FileText, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface MissionTopHeaderProps {
  isJudgeMode: boolean;
  onToggleJudgeMode: () => void;
  isDemoRunning: boolean;
  onStartDemo: () => void;
  onStopDemo: () => void;
  onOpenUpload: () => void;
  onExportReport: () => void;
  activePhaseName?: string;
  totalAnomaliesCount: number;
  highPriorityCount: number;
  filteredCount: number;
}

export const MissionTopHeader: React.FC<MissionTopHeaderProps> = ({
  isJudgeMode,
  onToggleJudgeMode,
  isDemoRunning,
  onStartDemo,
  onStopDemo,
  onOpenUpload,
  onExportReport,
  activePhaseName,
  totalAnomaliesCount,
  highPriorityCount,
  filteredCount,
}) => {
  return (
    <header className="shrink-0 bg-[#030B14] border-b border-[#0D2E4A] font-mono select-none z-30">
      {/* ── TOP PRIMARY BAR (64–70px) ── */}
      <div className="h-16 px-4 flex items-center justify-between gap-4">
        {/* Left: Product branding & mission */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded bg-[#082830] border border-[#00D4AA]/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,170,0.25)]">
            <span className="text-[#00D4AA] font-black text-sm tracking-wider">SX</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-[0.16em] text-[#E0F7F4] uppercase">
                SONAR<span className="text-[#00D4AA]">X</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] rounded-sm">
                MX-026
              </span>
            </div>
            <div className="text-[10.5px] text-[#4A8090] tracking-wide">
              AI MARINE DEBRIS & ANOMALY DETECTION
            </div>
          </div>
        </div>

        {/* Center: Real survey parameters & status */}
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 bg-[#05121F] border border-[#0D2E4A] rounded">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]"></span>
            </span>
            <span className="text-[10px] font-bold text-[#00D4AA] tracking-wider uppercase">
              {isDemoRunning ? `DEMO: ${activePhaseName || 'RUNNING'}` : 'SYSTEM ONLINE'}
            </span>
          </div>

          <div className="h-4 w-px bg-[#0D2E4A]" />

          <div className="text-left">
            <div className="text-[8.5px] text-[#4A8090] uppercase tracking-wider font-semibold">SURVEY SECTOR</div>
            <div className="text-[10.5px] font-bold text-[#E0F7F4]">MUMBAI SHELF CORRIDOR</div>
          </div>

          <div className="h-4 w-px bg-[#0D2E4A]" />

          <div className="flex items-center gap-3 text-[10px] text-[#4A8090]">
            <span><strong className="text-[#E0F7F4]">900</strong> kHz</span>
            <span>·</span>
            <span><strong className="text-[#E0F7F4]">75</strong> m SWATH</span>
            <span>·</span>
            <span><strong className="text-[#00D4AA]">4.1</strong> KTS</span>
          </div>
        </div>

        {/* Right: Actions (Judge Mode, Live Demo, Upload, Export) */}
        <div className="flex items-center gap-2">
          {/* JUDGE MODE TOGGLE */}
          <button
            onClick={onToggleJudgeMode}
            className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold border transition-all cursor-pointer rounded-sm ${
              isJudgeMode
                ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.4)]'
                : 'bg-[#05121F] text-[#4A8090] border-[#0D2E4A] hover:text-[#00D4AA] hover:border-[#00D4AA]/50'
            }`}
            title="Toggle simplified high-impact Judge Demo Mode"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>JUDGE MODE</span>
          </button>

          {/* START LIVE DEMO / STOP */}
          {isDemoRunning ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] font-bold text-[10.5px] cursor-pointer hover:bg-[#EF4444]/30 rounded-sm transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00D4AA] text-[#030B14] border border-[#00D4AA] font-black text-[10.5px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,212,170,0.35)] rounded-sm"
              title="Run 8-stage automated perception pipeline demo"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START LIVE DEMO</span>
            </button>
          )}

          {/* UPLOAD & ANALYZE */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] text-[10.5px] font-bold cursor-pointer transition-all rounded-sm"
            title="Upload custom side-scan sonar image (.xtf / .png / .jpg)"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>UPLOAD & ANALYZE</span>
          </button>

          {/* EXPORT REPORT */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#082830] border border-[#00D4AA]/60 text-[#00D4AA] text-[10.5px] font-bold cursor-pointer hover:bg-[#00D4AA] hover:text-[#030B14] transition-all rounded-sm shadow-[0_0_10px_rgba(0,212,170,0.15)]"
            title="Export formal Ministry of Earth Sciences marine incident report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* ── SECONDARY STATUS BAR (Thin & crisp OR Judge Mode summary tiles) ── */}
      {isJudgeMode ? (
        <div className="bg-[#05121F] border-t border-[#0D2E4A] px-4 py-2 grid grid-cols-4 gap-3">
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A] flex items-center justify-between">
            <span className="text-[9px] text-[#4A8090] font-bold uppercase">TOTAL ANOMALIES</span>
            <span className="text-lg font-black text-[#E0F7F4]">{totalAnomaliesCount}</span>
          </div>
          <div className="p-2 bg-[#030B14] border border-[#EF4444]/40 flex items-center justify-between">
            <span className="text-[9px] text-[#EF4444] font-bold uppercase">HIGH PRIORITY</span>
            <span className="text-lg font-black text-[#EF4444]">{highPriorityCount}</span>
          </div>
          <div className="p-2 bg-[#030B14] border border-[#00D4AA]/50 flex items-center justify-between shadow-[0_0_10px_rgba(0,212,170,0.1)]">
            <span className="text-[9px] text-[#00D4AA] font-bold uppercase">TOP CONFIDENCE</span>
            <span className="text-lg font-black text-[#00D4AA]">94.7%</span>
          </div>
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A] flex items-center justify-between">
            <span className="text-[9px] text-[#4A8090] font-bold uppercase">SURVEYED AREA</span>
            <span className="text-lg font-black text-[#38BDF8]">12.84 km²</span>
          </div>
        </div>
      ) : (
        <div className="h-8 bg-[#040C16] border-t border-[#0D2E4A] px-4 flex items-center justify-between text-[9.5px] text-[#4A8090]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#00D4AA] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
              <span>MISSION ACTIVE</span>
            </div>
            <span>|</span>
            <div><strong className="text-[#E0F7F4]">{totalAnomaliesCount}</strong> ANOMALIES</div>
            <span>·</span>
            <div><strong className="text-[#EF4444]">{highPriorityCount}</strong> HIGH PRIORITY</div>
            <span>·</span>
            <div><strong className="text-[#F59E0B]">{filteredCount}</strong> FILTERED</div>
            <span>·</span>
            <div><strong className="text-[#E0F7F4]">87%</strong> COVERAGE</div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#00D4AA]" />
              <span>MODEL: <strong className="text-[#E0F7F4]">YOLOv8 / ONNX</strong></span>
            </div>
            <span>|</span>
            <div>INFERENCE: <strong className="text-[#00D4AA]">42 ms</strong></div>
            <span>|</span>
            <div className="text-[8.5px] text-[#2A5060]">MoES COMPLIANT</div>
          </div>
        </div>
      )}
    </header>
  );
};
