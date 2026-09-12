import React from 'react';
import { Play, Square, UploadCloud, FileText, ShieldCheck, Film, Radio, Map, Box } from 'lucide-react';

interface MissionTopHeaderProps {
  isDemoRunning: boolean;
  onStartDemo: () => void;
  onStopDemo: () => void;
  isJudgeMode?: boolean;
  onToggleJudgeMode?: () => void;
  onOpenCinematicDemo?: () => void;
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
  centerViewMode: 'sonar' | 'map' | '3d';
  onSelectCenterViewMode: (mode: 'sonar' | 'map' | '3d') => void;
}

export const MissionTopHeader: React.FC<MissionTopHeaderProps> = ({
  isDemoRunning,
  onStartDemo,
  onStopDemo,
  onOpenCinematicDemo,
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
  centerViewMode,
  onSelectCenterViewMode,
}) => {
  return (
    <header className="shrink-0 bg-[#030B14] border-b border-[#0D2E4A] font-sans select-none z-30">
      {/* ── TOP PRIMARY BAR (56–60px) ── */}
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        {/* Left: Product branding & mission */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#082830] border border-[#00D4AA]/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,170,0.25)]">
            <span className="text-[#00D4AA] font-black text-xs tracking-wider">SX</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-[#E0F7F4] uppercase">
                SONAR<span className="text-[#00D4AA]">X</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] rounded-md">
                MoES MX-026
              </span>
            </div>
            <div className="text-[10.5px] text-[#4A8090] tracking-wide font-medium">
              AI Marine Debris & Sonar Detection Unit
            </div>
          </div>
        </div>

        {/* Center: Prominent Viewport Switcher Controls */}
        <div className="flex items-center gap-1.5 bg-[#05121F] border border-[#0D2E4A] p-1 rounded-lg">
          <button
            onClick={() => onSelectCenterViewMode('sonar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              centerViewMode === 'sonar'
                ? 'bg-[#00D4AA] text-[#030B14] shadow-[0_0_12px_rgba(0,212,170,0.35)]'
                : 'text-[#7C98A6] hover:text-[#E0F7F4] hover:bg-[#082830]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SONAR WATERFALL</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              centerViewMode === 'map'
                ? 'bg-[#00D4AA] text-[#030B14] shadow-[0_0_12px_rgba(0,212,170,0.35)]'
                : 'text-[#7C98A6] hover:text-[#E0F7F4] hover:bg-[#082830]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>SUBSEA MAP</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              centerViewMode === '3d'
                ? 'bg-[#00D4AA] text-[#030B14] shadow-[0_0_12px_rgba(0,212,170,0.35)]'
                : 'text-[#7C98A6] hover:text-[#E0F7F4] hover:bg-[#082830]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D SEAFLOOR</span>
          </button>
        </div>

        {/* Right: Streamlined Action Buttons */}
        <div className="flex items-center gap-2">
          {/* CINEMATIC STORY DEMO */}
          {onOpenCinematicDemo && (
            <button
              onClick={onOpenCinematicDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#082830] border border-[#00D4AA]/60 hover:border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA] hover:text-[#030B14] text-xs font-bold cursor-pointer rounded-md transition-all shadow-[0_0_10px_rgba(0,212,170,0.2)] active:scale-95"
              title="Open full-screen guided story demo"
            >
              <Film className="w-3.5 h-3.5" />
              <span>CINEMATIC DEMO</span>
            </button>
          )}

          {/* START / STOP LIVE DEMO */}
          {isDemoRunning ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EF4444] text-white border border-[#EF4444] text-xs font-bold cursor-pointer hover:brightness-110 shadow-[0_0_15px_rgba(239,68,68,0.4)] rounded-md transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00D4AA] text-[#030B14] border border-[#00D4AA] text-xs font-black cursor-pointer hover:brightness-110 shadow-[0_0_15px_rgba(0,212,170,0.4)] rounded-md transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START LIVE DEMO</span>
            </button>
          )}

          {/* UPLOAD & ANALYZE */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] text-xs font-semibold cursor-pointer rounded-md transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span className="hidden sm:inline">UPLOAD SWATH</span>
          </button>

          {/* EXPORT REPORT */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] text-xs font-semibold cursor-pointer rounded-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span className="hidden sm:inline">EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* ── SECONDARY STATUS & INTERACTIVE FILTRATION BAR ── */}
      <div className="h-8 px-4 bg-[#05121F] border-t border-[#0D2E4A] flex items-center justify-between text-xs text-[#7C98A6]">
        {/* Left: Interactive Filtration Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#00D4AA] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-ping" />
            <span className="text-xs">
              {isDemoRunning ? `LIVE SCAN: ${activePhaseName || 'RUNNING'}` : 'MISSION SYSTEM ONLINE'}
            </span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          {/* Live Confidence Threshold Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[#E0F7F4] font-medium text-xs">CONFIDENCE CUTOFF:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidenceThreshold(Number(e.target.value))}
              className="w-24 h-1.5 bg-[#0A1E30] accent-[#00D4AA] cursor-pointer rounded-lg"
            />
            <span className="text-[#00D4AA] font-bold text-xs w-8">{confidenceThreshold}%</span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          {/* Acoustic Shadow Verification Toggle */}
          <button
            onClick={onToggleShadowGate}
            className={`flex items-center gap-1.5 px-2 py-0.5 border text-xs font-semibold cursor-pointer rounded-md transition-colors ${
              isShadowGateActive
                ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]'
                : 'bg-[#030B14] border-[#0D2E4A] text-[#7C98A6]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>SHADOW GATE: {isShadowGateActive ? 'ACTIVE' : 'BYPASS'}</span>
          </button>
        </div>

        {/* Right: Live Filter Counters */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-[#00D4AA] font-bold">{totalAnomaliesCount}</strong> ANOMALIES
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#EF4444] font-bold">{highPriorityCount}</strong> HIGH PRIORITY
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#F59E0B] font-bold">{filteredCount}</strong> FILTERED
            </span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          <div className="flex items-center gap-2 text-[#7C98A6]">
            <span>ENGINE: <strong className="text-[#E0F7F4] font-semibold">YOLOv8 ONNX</strong></span>
            <span>·</span>
            <span>LATENCY: <strong className="text-[#00D4AA] font-semibold">42 ms</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
