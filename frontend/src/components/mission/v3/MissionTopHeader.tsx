import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  UploadCloud,
  FileText,
  ShieldCheck,
  Film,
  Radio,
  Map,
  Box,
  Bell,
  Download,
  MoreVertical,
  Award,
  Navigation,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';

interface MissionTopHeaderProps {
  isDemoRunning: boolean;
  onStartDemo: () => void;
  onStopDemo: () => void;
  isJudgeMode?: boolean;
  onToggleJudgeMode?: () => void;
  onOpenCinematicDemo?: () => void;
  onOpenUpload: () => void;
  onExportReport: () => void;
  onExportGeoJson?: () => void;
  onExportKml?: () => void;
  onExportIhoCsv?: () => void;
  onOpenCertificate?: () => void;
  onOpenRovPlanner?: () => void;
  onToggleAlertDrawer?: () => void;
  alertCount?: number;
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
  onExportGeoJson,
  onExportKml,
  onExportIhoCsv,
  onOpenCertificate,
  onOpenRovPlanner,
  onToggleAlertDrawer,
  alertCount = 4,
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
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="shrink-0 bg-[#030B14] border-b border-[#0D2E4A] font-sans select-none z-30 sticky top-0">
      {/* ── CONSOLIDATED PRIMARY CONTEXT BAR (48px) ── */}
      <div className="h-12 px-4 flex items-center justify-between gap-4">
        {/* Left: Logo + Survey ID + Live Dot */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#082830] border border-[#00D4AA]/60 flex items-center justify-center text-[#00D4AA] font-black text-xs">
              SX
            </div>
            <span className="text-sm font-black tracking-wider text-[#E0F7F4] uppercase">
              SONAR<span className="text-[#00D4AA]">X</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] rounded">
              MX-026
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-[#05121F] border border-[#0D2E4A] rounded text-[9px] font-bold text-[#00D4AA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-ping" />
              <span className="text-[#94A3B8]">LIVE</span>
            </div>
          </div>
        </div>

        {/* Center: Viewport Switcher (SONAR / MAP / 3D) */}
        <div className="flex items-center gap-1 bg-[#05121F] border border-[#0D2E4A] p-0.5 rounded-lg">
          <button
            onClick={() => onSelectCenterViewMode('sonar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              centerViewMode === 'sonar'
                ? 'bg-[#00D4AA] text-[#030B14] shadow-[0_0_10px_rgba(0,212,170,0.3)]'
                : 'text-[#94A3B8] hover:text-[#E0F7F4] hover:bg-[#082830]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SONAR</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              centerViewMode === 'map'
                ? 'bg-[#00D4AA] text-[#030B14] shadow-[0_0_10px_rgba(0,212,170,0.3)]'
                : 'text-[#94A3B8] hover:text-[#E0F7F4] hover:bg-[#082830]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MAP</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              centerViewMode === '3d'
                ? 'bg-[#00D4AA] text-[#030B14] shadow-[0_0_10px_rgba(0,212,170,0.3)]'
                : 'text-[#94A3B8] hover:text-[#E0F7F4] hover:bg-[#082830]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D</span>
          </button>
        </div>

        {/* Right: Primary CTA + Alert Bell + Kebab Overflow */}
        <div className="flex items-center gap-2">
          {/* LIVE HAZARD ALERTS BELL */}
          {onToggleAlertDrawer && (
            <button
              onClick={onToggleAlertDrawer}
              className="relative p-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#EF4444] text-[#EF4444] rounded cursor-pointer transition-colors"
              title="Hazard Alerts"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                  {alertCount}
                </span>
              )}
            </button>
          )}

          {/* PRIMARY CTA BUTTON: START / STOP DEMO */}
          {isDemoRunning ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444] text-white text-xs font-bold rounded cursor-pointer hover:brightness-110 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00D4AA] text-[#030B14] text-xs font-black rounded cursor-pointer hover:bg-[#00c098] shadow-[0_0_12px_rgba(0,212,170,0.3)] transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>START LIVE DEMO</span>
            </button>
          )}

          {/* KEBAB OVERFLOW MENU (...) */}
          <div className="relative" ref={overflowRef}>
            <button
              onClick={() => setIsOverflowOpen(!isOverflowOpen)}
              className={`p-1.5 rounded border transition-all cursor-pointer ${
                isOverflowOpen
                  ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]'
                  : 'bg-[#05121F] border-[#0D2E4A] text-[#94A3B8] hover:text-[#E0F7F4] hover:border-[#00D4AA]/40'
              }`}
              title="More Actions & Exports"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isOverflowOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#05121F] border border-[#0D2E4A] rounded-xl shadow-2xl py-1.5 text-xs text-[#E0F7F4] z-50 divide-y divide-[#0D2E4A]">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenUpload();
                      setIsOverflowOpen(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#00D4AA]" />
                    <span>Upload Sonar Swath</span>
                  </button>

                  {onOpenRovPlanner && (
                    <button
                      onClick={() => {
                        onOpenRovPlanner();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#00D4AA]" />
                      <span>ROV Salvage Flight Planner</span>
                    </button>
                  )}

                  {onExportGeoJson && (
                    <button
                      onClick={() => {
                        onExportGeoJson();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Export GIS GeoJSON</span>
                    </button>
                  )}

                  {onExportKml && (
                    <button
                      onClick={() => {
                        onExportKml();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Export Google Earth (.KML)</span>
                    </button>
                  )}

                  {onExportIhoCsv && (
                    <button
                      onClick={() => {
                        onExportIhoCsv();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#3FD98A]" />
                      <span>Export IHO S-44 Sounding Log</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onExportReport();
                      setIsOverflowOpen(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Export MoES Dossier</span>
                  </button>

                  {onOpenCertificate && (
                    <button
                      onClick={() => {
                        onOpenCertificate();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#00D4AA]" />
                      <span>MoES Clearance Certificate</span>
                    </button>
                  )}
                </div>

                {onOpenCinematicDemo && (
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenCinematicDemo();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#082830] hover:text-[#00D4AA] transition-colors text-left cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-[#A855F7]" />
                      <span>Cinematic Story Walkthrough</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECONDARY STATUS & INTERACTIVE FILTRATION BAR (32px) ── */}
      <div className="h-8 px-4 bg-[#05121F] border-t border-[#0D2E4A] flex items-center justify-between text-xs text-[#94A3B8]">
        {/* Left: Interactive Filtration Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#00D4AA] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-ping" />
            <span className="text-xs">
              {isDemoRunning ? `LIVE SCAN: ${activePhaseName || 'RUNNING'}` : 'SYSTEM ONLINE'}
            </span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          {/* Live Confidence Threshold Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[#E0F7F4] font-medium text-xs">CONFIDENCE:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidenceThreshold(Number(e.target.value))}
              className="w-20 h-1.5 bg-[#0A1E30] accent-[#00D4AA] cursor-pointer rounded-lg"
            />
            <span className="text-[#00D4AA] font-bold text-xs w-7">{confidenceThreshold}%</span>
          </div>

          <div className="h-3 w-px bg-[#0D2E4A]" />

          {/* Acoustic Shadow Verification Toggle */}
          <button
            onClick={onToggleShadowGate}
            className={`flex items-center gap-1.5 px-2 py-0.5 border text-xs font-semibold cursor-pointer rounded transition-colors ${
              isShadowGateActive
                ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]'
                : 'bg-[#030B14] border-[#0D2E4A] text-[#94A3B8]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>SHADOW GATE: {isShadowGateActive ? 'ACTIVE' : 'BYPASS'}</span>
          </button>
        </div>

        {/* Right: Live Filter Counters */}
        <div className="flex items-center gap-2.5 text-[11px] shrink-0">
          <span>
            <strong className="text-[#00D4AA] font-bold">{totalAnomaliesCount}</strong> ANOMALIES
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#EF4444] font-bold">{highPriorityCount}</strong> HIGH
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#F59E0B] font-bold">{filteredCount}</strong> FILTERED
          </span>
          <div className="h-3 w-px bg-[#0D2E4A]" />
          <span className="hidden xl:inline">
            ENGINE: <strong className="text-[#E0F7F4] font-semibold">YOLOv8s ONNX</strong>
          </span>
          <span className="xl:hidden">
            <strong className="text-[#00D4AA] font-semibold">YOLOv8s</strong>
          </span>
        </div>
      </div>
    </header>
  );
};
