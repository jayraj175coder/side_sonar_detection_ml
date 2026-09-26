import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  UploadCloud,
  FileText,
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
  BarChart2,
  AlertTriangle,
  ArrowUp,
  GitBranch,
  Compass,
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
  centerViewMode: 'sonar' | 'map' | '3d' | 'split';
  onSelectCenterViewMode: (mode: 'sonar' | 'map' | '3d' | 'split') => void;
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
  highPriorityCount,
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
    <header className="shrink-0 bg-[#050A14] border-b border-[#142238] font-sans select-none z-30">
      {/* ── ROW 1: TOP TELEMETRY & ACTION BAR (42px) ── */}
      <div className="h-10 px-3.5 flex items-center justify-between gap-3 border-b border-[#111E32]">
        {/* Left: Live Survey Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#063324] border border-[#10B981]/50 text-[#34D399] text-[10px] font-mono font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>{isDemoRunning ? 'LIVE DEMO ACTIVE' : 'LIVE SURVEY'}</span>
          </div>

          <span className="px-2 py-0.5 rounded bg-[#0B1526] border border-[#1B2E4B] text-[#38BDF8] text-[10px] font-mono font-bold shrink-0">
            AUV-07
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0B1526] border border-[#1B2E4B] text-[#CBD5E1] text-[10px] font-mono font-semibold hidden sm:inline shrink-0">
            MHZ-300
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0B1526] border border-[#1B2E4B] text-[#CBD5E1] text-[10px] font-mono font-semibold hidden md:inline shrink-0">
            12 Hz
          </span>
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider pl-1 hidden lg:inline shrink-0">
            SIDE-SCAN SONAR
          </span>
        </div>

        {/* Center: Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#08101E] border border-[#182942] p-0.5 rounded-lg shrink-0">
          <button
            onClick={() => onSelectCenterViewMode('sonar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              centerViewMode === 'sonar'
                ? 'bg-[#13233A] text-[#F59E0B] border border-[#F59E0B]/50'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 text-[#F59E0B]" />
            <span>SONAR</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('map')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              centerViewMode === 'map'
                ? 'bg-[#13233A] text-[#38BDF8] border border-[#38BDF8]/50'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Map className="w-3 h-3" />
            <span>MAP</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              centerViewMode === '3d'
                ? 'bg-[#13233A] text-[#38BDF8] border border-[#38BDF8]/50'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D</span>
          </button>

          <button
            onClick={() => onSelectCenterViewMode('split')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              centerViewMode === 'split'
                ? 'bg-[#13233A] text-[#38BDF8] border border-[#38BDF8]/50'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>SPLIT</span>
          </button>

          <button
            onClick={onExportReport}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-[#94A3B8] hover:text-white transition-all cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>REPORTS</span>
          </button>
        </div>

        {/* Right: Upload + Alert Bell + Menu + START LIVE DEMO */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenUpload}
            title="Upload Side-Scan Sonar Image"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1526] border border-[#1E3250] hover:border-[#38BDF8] text-[#CBD5E1] hover:text-white text-[10px] font-mono font-bold cursor-pointer transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>UPLOAD</span>
          </button>

          {onToggleAlertDrawer && (
            <button
              onClick={onToggleAlertDrawer}
              className="relative p-1.5 bg-[#0B1526] border border-[#1E3250] hover:border-[#EF4444] text-[#CBD5E1] hover:text-[#EF4444] rounded cursor-pointer transition-colors"
              title="Hazard Alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#EF4444] text-[8px] font-bold text-white">
                  {alertCount}
                </span>
              )}
            </button>
          )}

          {/* Overflow Menu */}
          <div className="relative" ref={overflowRef}>
            <button
              onClick={() => setIsOverflowOpen(!isOverflowOpen)}
              className="p-1.5 rounded bg-[#0B1526] border border-[#1E3250] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
              title="More Exports & Tools"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isOverflowOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-[#070E1B] border border-[#1E3250] rounded-xl shadow-2xl py-1.5 text-xs text-[#F8FAFC] z-50 divide-y divide-[#16263D]">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenUpload();
                      setIsOverflowOpen(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Upload Sonar Swath</span>
                  </button>

                  {onOpenRovPlanner && (
                    <button
                      onClick={() => {
                        onOpenRovPlanner();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>ROV Salvage Flight Planner</span>
                    </button>
                  )}

                  {onExportGeoJson && (
                    <button
                      onClick={() => {
                        onExportGeoJson();
                        setIsOverflowOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
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
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
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
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Export IHO S-44 Sounding Log</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onExportReport();
                      setIsOverflowOpen(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
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
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
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
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#112038] text-left cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-[#A855F7]" />
                      <span>Cinematic Story Walkthrough</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Orange CTA: START LIVE DEMO */}
          {isDemoRunning ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EF4444] text-white text-[11px] font-mono font-black rounded-md cursor-pointer hover:brightness-110 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F59E0B] text-[#050810] text-[11px] font-mono font-black rounded-md cursor-pointer hover:bg-[#FBBF24] shadow-[0_0_14px_rgba(245,158,11,0.35)] transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>START LIVE DEMO</span>
            </button>
          )}
        </div>
      </div>

      {/* ── ROW 2: EXACT REFERENCE KPI & COVERAGE STRIP (44px) ── */}
      <div className="h-11 px-3 bg-[#060B16] flex items-center justify-between gap-2 overflow-x-auto">
        {/* Left 5 KPI Cards Group */}
        <div className="flex items-center bg-[#091220] border border-[#182942] rounded-lg p-0.5 divide-x divide-[#16263D] shrink-0">
          {/* 17 TARGETS */}
          <div className="px-3 py-1 flex items-center gap-1.5">
            <ArrowUp className="w-3.5 h-3.5 text-[#22D3EE] stroke-[2.5]" />
            <span className="text-[14px] font-mono font-black text-white">17</span>
            <span className="text-[10px] font-mono font-bold text-[#CBD5E1] uppercase">
              TARGETS
            </span>
          </div>

          {/* 8 VERIFIED */}
          <div className="px-3 py-1 flex items-center gap-1.5 bg-[#062E22]/70">
            <span className="text-[14px] font-mono font-black text-[#10B981]">8</span>
            <span className="text-[10px] font-mono font-bold text-[#34D399] uppercase">
              VERIFIED
            </span>
          </div>

          {/* 4 HIGH RISK */}
          <div className="px-3 py-1 flex items-center gap-1.5">
            <span className="text-[14px] font-mono font-black text-[#EF4444]">
              {highPriorityCount || 4}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#F87171] uppercase">
              HIGH RISK
            </span>
          </div>

          {/* 2 PIPELINES */}
          <div className="px-3 py-1 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-[#A855F7]" />
            <span className="text-[14px] font-mono font-black text-[#C084FC]">2</span>
            <span className="text-[10px] font-mono font-bold text-[#C084FC] uppercase">
              PIPELINES
            </span>
          </div>

          {/* 3 ANOMALIES */}
          <div className="px-3 py-1 flex items-center gap-1.5 relative">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[14px] font-mono font-black text-[#F59E0B]">3</span>
            <span className="text-[10px] font-mono font-bold text-[#FBBF24] uppercase">
              ANOMALIES
            </span>
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#F59E0B] rounded-full" />
          </div>
        </div>

        {/* Middle-Left: COVERAGE 87% */}
        <div className="px-3.5 py-1.5 bg-[#091220] border border-[#182942] rounded-lg flex flex-col justify-center min-w-[160px] shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-[#94A3B8] font-bold uppercase">COVERAGE</span>
            <span className="text-white font-black">87%</span>
          </div>
          <div className="w-full h-1.5 bg-[#13233A] rounded-full overflow-hidden">
            <div className="h-full w-[87%] bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full shadow-[0_0_8px_#38BDF8]" />
          </div>
        </div>

        {/* Middle-Right: SURVEY AREA 12.84 km² */}
        <div className="px-3.5 py-1 bg-[#091220] border border-[#182942] rounded-lg flex items-center gap-2 shrink-0">
          <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
          <div>
            <div className="text-[8.5px] font-mono uppercase text-[#64748B] leading-tight">
              SURVEY AREA
            </div>
            <div className="text-[12px] font-mono font-black text-[#E2E8F0] leading-tight">
              12.84 km²
            </div>
          </div>
        </div>

        {/* Right: SHADOW GATE ACTIVE + AI: YOLOv8s + ONNX */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={onToggleShadowGate}
            className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-all ${
              isShadowGateActive
                ? 'bg-[#052E22] border-[#10B981] text-[#34D399] shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-[#091220] border-[#1E3250] text-[#64748B]'
            }`}
          >
            {isShadowGateActive ? 'SHADOW GATE ACTIVE' : 'SHADOW GATE BYPASS'}
          </button>

          <div className="px-3 py-1.5 bg-[#091220] border border-[#182942] rounded-lg text-[11px] font-mono">
            <span className="text-[#64748B]">AI: </span>
            <strong className="text-[#F1F5F9] font-bold">YOLOv8s + ONNX</strong>
          </div>
        </div>
      </div>
    </header>
  );
};
