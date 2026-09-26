import React, { useState } from 'react';
import {
  Play, Square, Moon, Settings, Bell,
  Radio, Map, Box, BarChart2, FileText,
  UploadCloud, Navigation, Download, Globe,
  FileSpreadsheet, Award, Film, MoreVertical,
  ShieldCheck, ChevronDown,
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
  // extra stats for reference bar
  verifiedCount?: number;
  pipelineCount?: number;
  coveragePercent?: number;
  surveyAreaKm2?: number;
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
  verifiedCount = 8,
  pipelineCount = 2,
  coveragePercent = 87,
  surveyAreaKm2 = 12.84,
}) => {
  const [showExports, setShowExports] = useState(false);

  const VIEW_TABS = [
    { key: 'sonar', label: 'SONAR',     icon: Radio },
    { key: 'map',   label: 'MAP',       icon: Map },
    { key: '3d',    label: '3D',        icon: Box },
  ] as const;

  return (
    <header className="shrink-0 bg-[#05080F] border-b border-[#0F1E2E] font-mono select-none z-30 sticky top-0">

      {/* ── ROW 1: 48px Main bar ── */}
      <div className="h-12 px-4 flex items-center justify-between gap-3">

        {/* LEFT: Logo + live status chips */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded bg-[#00F5D4]/10 border border-[#00F5D4]/40 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#00F5D4]">SX</span>
            </div>
            <span className="text-[13px] font-black tracking-wider text-[#E2E8F0] uppercase">
              SONAR<span className="text-[#FFB703]">X</span>
            </span>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-[#1E293B]" />

          {/* Status pills */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00C853]/10 border border-[#00C853]/30 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
              <span className="text-[8px] font-black text-[#00C853]">LIVE SURVEY</span>
            </div>
            <span className="text-[8px] font-black text-[#64748B] px-1.5 py-0.5 bg-[#0A1520] border border-[#1E293B] rounded">
              AUV-07
            </span>
            <span className="text-[8px] font-black text-[#64748B] px-1.5 py-0.5 bg-[#0A1520] border border-[#1E293B] rounded hidden lg:block">
              MHZ-300
            </span>
            <span className="text-[8px] font-black text-[#64748B] px-1.5 py-0.5 bg-[#0A1520] border border-[#1E293B] rounded hidden lg:block">
              12 Hz
            </span>
            <span className="text-[8px] font-black text-[#38BDF8] px-1.5 py-0.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded hidden xl:block">
              SIDE-SCAN SONAR
            </span>
          </div>
        </div>

        {/* CENTER: View switcher tabs */}
        <div className="flex items-center gap-0.5 bg-[#030810] border border-[#1E293B] p-0.5 rounded-lg">
          {VIEW_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onSelectCenterViewMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                centerViewMode === key
                  ? 'bg-[#FFB703] text-[#030810] shadow-[0_0_10px_rgba(255,183,3,0.4)]'
                  : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#0A1520]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
          <div className="h-4 w-px bg-[#1E293B] mx-0.5" />
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-black text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#0A1520] cursor-pointer transition-all"
          >
            <BarChart2 className="w-3 h-3" />
            <span className="hidden sm:inline">ANALYTICS</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-black text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#0A1520] cursor-pointer transition-all"
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">REPORTS</span>
          </button>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark mode icon */}
          <button className="p-1.5 rounded border border-[#1E293B] bg-[#0A1520] text-[#64748B] hover:text-[#E2E8F0] cursor-pointer transition-colors">
            <Moon className="w-3.5 h-3.5" />
          </button>

          {/* Settings */}
          <button className="p-1.5 rounded border border-[#1E293B] bg-[#0A1520] text-[#64748B] hover:text-[#E2E8F0] cursor-pointer transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Alert Bell */}
          {onToggleAlertDrawer && (
            <button
              onClick={onToggleAlertDrawer}
              className="relative p-1.5 rounded border border-[#1E293B] bg-[#0A1520] text-[#EF4444] hover:border-[#EF4444]/50 cursor-pointer transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-[#EF4444] text-[7px] font-black text-white">
                  {alertCount}
                </span>
              )}
            </button>
          )}

          {/* Exports dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExports(v => !v)}
              className="p-1.5 rounded border border-[#1E293B] bg-[#0A1520] text-[#64748B] hover:text-[#E2E8F0] cursor-pointer transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {showExports && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#05080F] border border-[#1E293B] rounded-xl shadow-2xl py-1.5 z-50 text-[11px]">
                {[
                  { label: 'Upload Sonar Swath',      icon: UploadCloud,     onClick: onOpenUpload,      color: '#FFB703' },
                  { label: 'ROV Salvage Planner',      icon: Navigation,      onClick: onOpenRovPlanner,  color: '#FFB703' },
                  { label: 'Export GeoJSON',           icon: Download,        onClick: onExportGeoJson,   color: '#38BDF8' },
                  { label: 'Export KML',               icon: Globe,           onClick: onExportKml,       color: '#38BDF8' },
                  { label: 'Export IHO S-44 CSV',      icon: FileSpreadsheet, onClick: onExportIhoCsv,    color: '#00F5D4' },
                  { label: 'Export MoES Dossier',      icon: FileText,        onClick: onExportReport,    color: '#F59E0B' },
                  { label: 'MoES Certificate',         icon: Award,           onClick: onOpenCertificate, color: '#FFB703' },
                  { label: 'Cinematic Walkthrough',    icon: Film,            onClick: onOpenCinematicDemo, color: '#A855F7' },
                ].map(({ label, icon: Icon, onClick, color }) => onClick && (
                  <button
                    key={label}
                    onClick={() => { onClick(); setShowExports(false); }}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#0A1520] text-[#94A3B8] hover:text-[#E2E8F0] text-left cursor-pointer transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* START LIVE DEMO CTA */}
          {isDemoRunning ? (
            <button
              onClick={onStopDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EF4444] text-white text-[10px] font-black rounded cursor-pointer hover:brightness-110 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
            >
              <Square className="w-3 h-3 fill-current" />
              STOP DEMO
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFB703] text-[#030810] text-[10px] font-black rounded cursor-pointer hover:brightness-110 shadow-[0_0_12px_rgba(255,183,3,0.4)] transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              START LIVE DEMO
            </button>
          )}
        </div>
      </div>

      {/* ── ROW 2: Stats bar (32px) — matches reference exactly ── */}
      <div className="h-8 px-4 bg-[#030810] border-t border-[#0F1E2E] flex items-center gap-0 overflow-x-auto">

        {/* Target count chips */}
        {[
          { count: 17,               label: 'TARGETS',   color: '#00F5D4', bg: '#00F5D4' },
          { count: verifiedCount,    label: 'VERIFIED',  color: '#00C853', bg: '#00C853' },
          { count: highPriorityCount,label: 'HIGH RISK', color: '#EF4444', bg: '#EF4444' },
          { count: pipelineCount,    label: 'PIPELINES', color: '#38BDF8', bg: '#38BDF8' },
          { count: totalAnomaliesCount, label: 'ANOMALIES', color: '#F59E0B', bg: '#F59E0B' },
        ].map(({ count, label, color, bg }) => (
          <div key={label} className="flex items-center gap-1.5 px-3 border-r border-[#1E293B] shrink-0 h-full">
            <span className="text-[10px] font-black" style={{ color }}>
              {count}
            </span>
            <span className="text-[8.5px] text-[#64748B] font-bold">{label}</span>
          </div>
        ))}

        {/* Coverage bar */}
        <div className="flex items-center gap-2 px-3 border-r border-[#1E293B] shrink-0 h-full">
          <span className="text-[8.5px] text-[#64748B]">COVERAGE</span>
          <div className="w-24 h-1.5 bg-[#0A1520] rounded overflow-hidden">
            <div
              className="h-full bg-[#00F5D4] rounded transition-all"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-[#00F5D4]">{coveragePercent}%</span>
        </div>

        {/* Survey area */}
        <div className="flex items-center gap-1.5 px-3 border-r border-[#1E293B] shrink-0 h-full">
          <span className="text-[8.5px] text-[#64748B]">SURVEY AREA</span>
          <span className="text-[9px] font-black text-[#E2E8F0]">{surveyAreaKm2} km²</span>
        </div>

        {/* Shadow gate */}
        <button
          onClick={onToggleShadowGate}
          className={`flex items-center gap-1.5 px-3 border-r border-[#1E293B] h-full cursor-pointer transition-colors shrink-0 ${
            isShadowGateActive ? 'text-[#FFB703]' : 'text-[#475569]'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[8.5px] font-black uppercase">
            SHADOW GATE {isShadowGateActive ? 'ACTIVE' : 'BYPASS'}
          </span>
        </button>

        {/* Confidence slider */}
        <div className="flex items-center gap-2 px-3 border-r border-[#1E293B] h-full shrink-0">
          <span className="text-[8px] text-[#64748B]">CONF:</span>
          <input
            type="range" min="10" max="90" value={confidenceThreshold}
            onChange={e => onChangeConfidenceThreshold(Number(e.target.value))}
            className="w-16 h-1 accent-[#FFB703] cursor-pointer"
          />
          <span className="text-[9px] font-black text-[#FFB703] w-6">{confidenceThreshold}%</span>
        </div>

        {/* AI engine tag */}
        <div className="flex items-center gap-1.5 px-3 ml-auto shrink-0">
          <span className="text-[8px] text-[#64748B]">AI:</span>
          <span className="text-[8.5px] font-black text-[#E2E8F0]">YOLOv8s + ONNX</span>
        </div>
      </div>
    </header>
  );
};
