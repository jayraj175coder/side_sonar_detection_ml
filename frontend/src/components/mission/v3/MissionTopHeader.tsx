import React from 'react';
import { Play, Square, UploadCloud, FileText, CheckCircle2, ShieldAlert, Cpu, Sliders, ShieldCheck, Filter } from 'lucide-react';

interface MissionTopHeaderProps {
  isDemoRunning: boolean;
  onStartDemo: () => void;
  onStopDemo: () => void;
  onOpenUpload: () => void;
  onExportReport: () => void;
  activePhaseName?: string;
  totalAnomaliesCount: number;
  highPriorityCount: number;
  filteredCount: number;
  confidenceThreshold: number;
  onChangeConfidenceThreshold: (val: number) => void;
  isShadowGateActive: boolean;
  onToggleShadowGate: () => void;
}

export const MissionTopHeader: React.FC<MissionTopHeaderProps> = ({
  isDemoRunning,
  onStartDemo,
  onStopDemo,
  onOpenUpload,
  onExportReport,
  activePhaseName,
  totalAnomaliesCount,
  highPriorityCount,
  filteredCount,
  confidenceThreshold,
  onChangeConfidenceThreshold,
  isShadowGateActive,
  onToggleShadowGate,
}) => {
  return (
    <header className="shrink-0 bg-[#030B14] border-b border-[#0D2E4A] font-mono select-none z-30">
      {/* ── TOP PRIMARY BAR (60–64px) ── */}
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        {/* Left: Product branding & mission */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#082830] border border-[#00D4AA]/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,170,0.25)]">
            <span className="text-[#00D4AA] font-black text-xs tracking-wider">SX</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-[0.16em] text-[#E0F7F4] uppercase">
                SONAR<span className="text-[#00D4AA]">X</span>
              </span>
              <span className="text-[8.5px] font-bold px-1.5 py-0.2 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] rounded-xs">
                MX-026
              </span>
            </div>
            <div className="text-[9.5px] text-[#4A8090] tracking-wide">
              AI MARINE DEBRIS & ANOMALY DETECTION
            </div>
          </div>
        </div>

        {/* Center: Real survey parameters & status */}
        <div className="hidden lg:flex items-center gap-5 px-3 py-1 bg-[#05121F] border border-[#0D2E4A] rounded-xs text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]"></span>
            </span>
            <span className="font-bold text-[#00D4AA] tracking-wider uppercase text-[9.5px]">
              {isDemoRunning ? `DEMO: ${activePhaseName || 'RUNNING'}` : 'SYSTEM ONLINE'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-[#0D2E4A]" />

          <div className="text-left">
            <span className="text-[#4A8090] text-[8px] uppercase">SECTOR: </span>
            <strong className="text-[#E0F7F4] text-[9.5px]">MUMBAI SHELF CORRIDOR</strong>
          </div>

          <div className="h-3.5 w-px bg-[#0D2E4A]" />

          <div className="flex items-center gap-2 text-[#4A8090] text-[9.5px]">
            <span><strong className="text-[#E0F7F4]">900</strong> kHz</span>
            <span>·</span>
            <span><strong className="text-[#E0F7F4]">75</strong> m SWATH</span>
            <span>·</span>
            <span><strong className="text-[#00D4AA]">4.1</strong> KTS</span>
          </div>
        </div>

        {/* Right: Streamlined Action Buttons */}
        <div className="flex items-center gap-2">
          {/* START / STOP LIVE DEMO */}
          {isDemoRunning ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444] text-[#030B14] border border-[#EF4444] text-[10.5px] font-black cursor-pointer hover:brightness-110 shadow-[0_0_15px_rgba(239,68,68,0.4)] rounded-xs transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00D4AA] text-[#030B14] border border-[#00D4AA] text-[10.5px] font-black cursor-pointer hover:brightness-110 shadow-[0_0_15px_rgba(0,212,170,0.4)] rounded-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START LIVE DEMO</span>
            </button>
          )}

          {/* UPLOAD & ANALYZE */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] text-[10px] font-bold cursor-pointer rounded-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">UPLOAD & ANALYZE</span>
          </button>

          {/* EXPORT REPORT */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] text-[10px] font-bold cursor-pointer rounded-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* ── SECONDARY STATUS & INTERACTIVE FILTRATION BAR ── */}
      <div className="h-8 px-4 bg-[#05121F] border-t border-[#0D2E4A] flex items-center justify-between text-[9px] text-[#4A8090]">
        {/* Left: Interactive Filtration Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[#00D4AA] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
            <span>MISSION ACTIVE</span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          {/* Live Confidence Threshold Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[#E0F7F4] font-bold">CONF CUTOFF:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidenceThreshold(Number(e.target.value))}
              className="w-20 h-1 bg-[#0A1E30] accent-[#00D4AA] cursor-pointer"
            />
            <span className="text-[#00D4AA] font-bold w-7">{confidenceThreshold}%</span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          {/* Acoustic Shadow Verification Toggle */}
          <button
            onClick={onToggleShadowGate}
            className={`flex items-center gap-1 px-1.5 py-0.5 border text-[8px] font-bold cursor-pointer rounded-xs transition-colors ${
              isShadowGateActive
                ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]'
                : 'bg-[#030B14] border-[#0D2E4A] text-[#4A8090]'
            }`}
          >
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>SHADOW GATE: {isShadowGateActive ? 'ON' : 'BYPASS'}</span>
          </button>
        </div>

        {/* Right: Live Filter Counters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-[#00D4AA]">{totalAnomaliesCount}</strong> ANOMALIES
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#EF4444]">{highPriorityCount}</strong> HIGH PRIORITY
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#F59E0B]">{filteredCount}</strong> FILTERED
            </span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          <div className="flex items-center gap-2 text-[#4A8090]">
            <span>MODEL: <strong className="text-[#E0F7F4]">YOLOv8 / ONNX</strong></span>
            <span>·</span>
            <span>INFERENCE: <strong className="text-[#00D4AA]">42 ms</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
