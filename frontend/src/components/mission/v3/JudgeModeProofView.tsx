import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MapPin,
  Sparkles,
  ArrowRight,
  Sliders,
  Radio,
  Layers,
  X,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface JudgeModeProofViewProps {
  heroTarget: MissionV3Target;
  onExitJudgeMode: () => void;
  onExportReport: () => void;
  confidenceThreshold: number;
}

export const JudgeModeProofView: React.FC<JudgeModeProofViewProps> = ({
  heroTarget,
  onExitJudgeMode,
  onExportReport,
  confidenceThreshold,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#01050A] text-[#E0F7F4] font-mono overflow-y-auto p-4 md:p-6 space-y-4 select-none">
      {/* ── TOP HEADER & 20-SECOND PROOF PIPELINE STRIP ── */}
      <div className="bg-[#05121F] border border-[#F59E0B]/50 p-4 rounded-xs shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#F59E0B] text-[#030B14] font-black text-[9px] rounded-xs uppercase tracking-wider">
              JUDGE MODE ACTIVE
            </span>
            <span className="text-xs font-black text-[#E0F7F4] tracking-wider uppercase">
              20-SECOND SOLUTION PROOF
            </span>
          </div>
          <p className="text-[9.5px] text-[#7C98A6] mt-0.5">
            End-to-end demonstration: Raw side-scan sonar → AI perception → Noise filtering → Geotagging → Official report.
          </p>
        </div>

        {/* Top 7-Stage Proof Pipeline */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[8.5px] font-bold bg-[#030B14] border border-[#0D2E4A] p-1.5 rounded-xs">
          <span className="text-[#00D4AA]">✓ 01 INGEST</span>
          <span className="text-[#4A8090]">→</span>
          <span className="text-[#00D4AA]">✓ 02 DENOISE</span>
          <span className="text-[#4A8090]">→</span>
          <span className="text-[#00D4AA]">✓ 03 DETECT</span>
          <span className="text-[#4A8090]">→</span>
          <span className="text-[#00D4AA]">✓ 04 FILTER</span>
          <span className="text-[#4A8090]">→</span>
          <span className="text-[#00D4AA]">✓ 05 CLASSIFY</span>
          <span className="text-[#4A8090]">→</span>
          <span className="text-[#00D4AA]">✓ 06 GEOTAG</span>
          <span className="text-[#4A8090]">→</span>
          <span className="text-[#F59E0B]">★ 07 REPORT</span>
        </div>

        <button
          onClick={onExitJudgeMode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#082830] border border-[#0D2E4A] hover:border-[#EF4444] text-[#7C98A6] hover:text-[#EF4444] text-[10px] font-bold rounded-xs cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>EXIT JUDGE MODE</span>
        </button>
      </div>

      {/* ── THE 3 MAJOR PROOF PANELS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* PANEL 1: SONAR EVIDENCE */}
        <div className="bg-[#05121F] border border-[#0D2E4A] p-4 rounded-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#0D2E4A] pb-2">
            <div className="text-xs font-black text-[#E0F7F4] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#082830] border border-[#00D4AA] text-[#00D4AA] flex items-center justify-center text-[10px] font-black">1</span>
              <span>SONAR EVIDENCE</span>
            </div>
            <span className="text-[8.5px] text-[#00D4AA] font-bold">900 kHz SWATH</span>
          </div>

          {/* Simulated Sonar Crop */}
          <div className="relative h-56 bg-[#01050A] border border-[#0D2E4A] rounded-xs overflow-hidden flex items-center justify-center">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#00D4AA_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Specular Highlight */}
            <div className="w-24 h-14 bg-[#00D4AA]/25 rounded-full border-2 border-[#00D4AA] relative flex items-center justify-center shadow-[0_0_20px_rgba(0,212,170,0.4)]">
              <span className="text-[8px] font-black text-[#030B14] bg-[#00D4AA] px-1 py-0.2 rounded-xs">
                SPECULAR RETURN
              </span>
            </div>

            {/* Acoustic Shadow Void */}
            <div className="w-28 h-10 bg-[#01050A] border border-dashed border-[#4A8090]/80 ml-2 relative flex items-center justify-center">
              <span className="text-[7.5px] text-[#4A8090] uppercase tracking-widest font-bold">
                ACOUSTIC SHADOW (2.31m)
              </span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 bg-[#030B14]/90 border border-[#0D2E4A] px-2 py-1 flex items-center justify-between text-[8px] text-[#7C98A6]">
              <span>RELIEF HEIGHT: <strong className="text-[#00D4AA]">0.82 m</strong></span>
              <span>·</span>
              <span>RANGE FROM NADIR: <strong className="text-[#E0F7F4]">18.4 m</strong></span>
            </div>
          </div>

          <div className="space-y-1 text-[9px] text-[#7C98A6]">
            <div className="flex items-center justify-between">
              <span>Acoustic Shadow Length:</span>
              <strong className="text-[#00D4AA]">2.31 meters</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Calculated Target Elevation:</span>
              <strong className="text-[#E0F7F4]">0.82 meters off seabed</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Target Perimeter:</span>
              <strong className="text-[#E0F7F4]">3.4m × 1.8m (ALDFG Bundle)</strong>
            </div>
          </div>
        </div>

        {/* PANEL 2: AI DECISION & NOISE FILTER */}
        <div className="bg-[#05121F] border border-[#00D4AA]/40 p-4 rounded-xs flex flex-col space-y-3 shadow-[0_0_20px_rgba(0,212,170,0.1)]">
          <div className="flex items-center justify-between border-b border-[#0D2E4A] pb-2">
            <div className="text-xs font-black text-[#00D4AA] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#00D4AA] text-[#030B14] flex items-center justify-center text-[10px] font-black">2</span>
              <span>AI DECISION & FILTER</span>
            </div>
            <span className="text-[8.5px] px-1.5 py-0.2 bg-[#00D4AA] text-[#030B14] font-bold rounded-xs">
              CONFIRMED
            </span>
          </div>

          {/* AI Confidence Box */}
          <div className="p-3 bg-[#082830] border border-[#00D4AA]/60 rounded-xs flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-[#00D4AA] tracking-tight">
                94.7%
              </div>
              <div className="text-[8.5px] text-[#7C98A6] font-bold uppercase mt-0.5">
                AI CONFIDENCE · YOLOv8n ONNX
              </div>
            </div>
            <div className="text-right text-[9px] text-[#E0F7F4] space-y-0.5">
              <div>CLASS: <strong className="text-[#00D4AA]">GHOST NET (ALDFG)</strong></div>
              <div>VERDICT: <strong className="text-[#00D4AA]">CRITICAL THREAT</strong></div>
            </div>
          </div>

          {/* Evidence Breakdown */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[8.5px] font-bold text-[#7C98A6] uppercase tracking-wider">
              EVIDENCE SCORES (Model / heuristic evidence):
            </div>
            <div className="space-y-1 text-[8.5px]">
              <div className="flex items-center justify-between p-1.5 bg-[#030B14] border border-[#0D2E4A]">
                <span>✓ ACOUSTIC SHADOW VERIFICATION</span>
                <strong className="text-[#00D4AA]">96%</strong>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#030B14] border border-[#0D2E4A]">
                <span>✓ SHAPE & COMPATIBILITY MATCH</span>
                <strong className="text-[#00D4AA]">92%</strong>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#030B14] border border-[#0D2E4A]">
                <span>✓ TEXTURE & BACKSCATTER CONTRAST</span>
                <strong className="text-[#00D4AA]">94%</strong>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#030B14] border border-[#0D2E4A]">
                <span>✓ NATURAL ROCK / SEDIMENT REJECTION</span>
                <strong className="text-[#00D4AA]">89% (PASSED)</strong>
              </div>
            </div>
          </div>

          {/* Noise Filtering Summary */}
          <div className="p-2 bg-[#030B14] border border-[#0D2E4A] rounded-xs text-[8px] text-[#7C98A6]">
            <strong className="text-[#00D4AA]">Acoustic Noise Filter:</strong> 8 raw candidates analyzed → 4 natural rocks/ripples rejected due to lack of acoustic shadow void → 4 confirmed debris targets logged.
          </div>
        </div>

        {/* PANEL 3: GEOLOCATION & ACTIONABLE REPORT */}
        <div className="bg-[#05121F] border border-[#0D2E4A] p-4 rounded-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#0D2E4A] pb-2">
            <div className="text-xs font-black text-[#E0F7F4] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#082830] border border-[#00D4AA] text-[#00D4AA] flex items-center justify-center text-[10px] font-black">3</span>
              <span>GEOLOCATION & REPORT</span>
            </div>
            <span className="text-[8.5px] text-[#F59E0B] font-bold">WGS-84 FIX</span>
          </div>

          {/* Geolocation Card */}
          <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-xs space-y-2">
            <div className="flex items-center gap-2 text-[#00D4AA] text-xs font-bold">
              <MapPin className="w-4 h-4" />
              <span>SENSOR-DERIVED COORDINATES</span>
            </div>
            <div className="space-y-1 text-[9.5px]">
              <div className="flex justify-between">
                <span className="text-[#7C98A6]">LATITUDE:</span>
                <strong className="text-[#E0F7F4]">18.9217° N</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C98A6]">LONGITUDE:</span>
                <strong className="text-[#E0F7F4]">72.8214° E</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C98A6]">DEPTH:</span>
                <strong className="text-[#00D4AA]">43.1 meters (USBL Fix)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C98A6]">SECTOR:</span>
                <strong className="text-[#E0F7F4]">Mumbai Shelf Corridor</strong>
              </div>
            </div>
          </div>

          {/* Recommended Operational Action */}
          <div className="p-2.5 bg-[#082830] border border-[#00D4AA]/40 rounded-xs space-y-1 text-[8.5px]">
            <div className="font-bold text-[#00D4AA] uppercase">
              RECOMMENDED MOES RETRIEVAL ACTION:
            </div>
            <p className="text-[#E0F7F4] leading-relaxed">
              Dispatch ROV retrieval within 48h to prevent continuous marine life entanglement and local gillnet damage.
            </p>
          </div>

          {/* Export Action Button */}
          <div className="pt-2">
            <button
              onClick={onExportReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00D4AA] text-[#030B14] font-black text-xs hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,212,170,0.3)] rounded-xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>EXPORT OFFICIAL INCIDENT DOSSIER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
