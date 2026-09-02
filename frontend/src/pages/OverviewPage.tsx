import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  Play,
  Cpu,
  Eye,
  Radio,
  Filter,
  ArrowRight,
  ShieldCheck,
  Compass,
  Sliders,
  Check,
  SplitSquareVertical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MISSION_V3_TARGETS } from '../data/missionV3Data';

export const OverviewPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0-100% split

  // 6-Stage Core Pipeline Specification
  const pipelineStages = [
    {
      num: '01',
      name: 'INGEST',
      status: 'COMPLETED',
      sub: 'Raw SSS Image Loaded',
      detail: 'Dual-channel 900 kHz port/starboard acoustic backscatter telemetry.',
      latency: '12 ms',
    },
    {
      num: '02',
      name: 'DENOISE',
      status: 'COMPLETED',
      sub: 'Bilateral / CLAHE Preprocessing',
      detail: 'Suppresses acoustic speckle noise while preserving sharp shadow edges.',
      latency: '18 ms',
    },
    {
      num: '03',
      name: 'DETECT',
      status: 'COMPLETED',
      sub: 'YOLO-Based Candidate Detection',
      detail: 'Proposes candidate bounding boxes across acoustic backscatter anomalies.',
      latency: '42 ms',
    },
    {
      num: '04',
      name: 'FILTER',
      status: 'ACTIVE GATE',
      sub: 'Acoustic Shadow Verification',
      detail: 'Rejects flat natural basalt rocks and ripples lacking acoustic relief.',
      latency: '8 ms',
    },
    {
      num: '05',
      name: 'CLASSIFY',
      status: 'COMPLETED',
      sub: 'MoES Marine Debris Taxonomy',
      detail: 'Ghost Net (ALDFG), lost fishing gear, pipeline hazards & debris bundles.',
      latency: '14 ms',
    },
    {
      num: '06',
      name: 'GEOTAG & REPORT',
      status: 'READY',
      sub: 'WGS84 Coordinates + Dossier',
      detail: 'Sensor-derived USBL latitude/longitude triangulation and incident report.',
      latency: '25 ms',
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up font-mono select-none text-[11px] text-[#E0F7F4]">
      {/* ── 1. HERO SCIENTIFIC BANNER ── */}
      <div className="relative overflow-hidden bg-[#05121F] border border-[#0D2E4A] p-6 md:p-8 rounded-sm shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] text-[9.5px] font-bold rounded-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>MINISTRY OF EARTH SCIENCES (MoES) · SMART INDIA HACKATHON</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#E0F7F4] tracking-tight uppercase">
            SONAR<span className="text-[#00D4AA]">X</span> — AI-POWERED MARINE DEBRIS & ANOMALY DETECTION
          </h1>

          <p className="text-sm font-bold text-[#00D4AA] tracking-wide">
            “Turn raw side-scan sonar imagery into explainable, geotagged marine intelligence.”
          </p>

          <p className="text-[10px] text-[#7C98A6] leading-relaxed">
            Automated side-scan sonar intelligence engineered for Indian hydrographic survey teams.
            Detects man-made marine debris (ghost fishing nets, lost trawl gear, abandoned steel, and subsea pipeline hazards)
            while eliminating false alarms from natural seabed geology through acoustic shadow geometry.
          </p>

          {/* Primary Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('mission')}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#030B14] border border-[#00D4AA] font-black text-xs hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,212,170,0.35)] rounded-xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START LIVE DEMO</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#082830] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] font-bold text-xs rounded-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>UPLOAD & ANALYZE</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#7C98A6] hover:text-[#00D4AA] font-bold text-xs rounded-xs transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>SUBSEA MAP</span>
            </button>
          </div>
        </div>

        {/* Subtle Watermark Graphic */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none hidden lg:block">
          <Compass className="w-72 h-72 text-[#00D4AA]" />
        </div>
      </div>

      {/* ── 2. SIX-STAGE CENTRAL PIPELINE STORY ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#7C98A6] uppercase tracking-wider flex items-center gap-2">
            <span>THE SONARX CORE PIPELINE</span>
            <span className="text-[8.5px] px-1.5 py-0.2 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs">
              TOTAL LATENCY: 119 ms
            </span>
          </span>
          <span className="text-[9px] text-[#4A8090]">RAW SWATH → VERIFIED GEOTAGGED DOSSIER</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage) => (
            <div
              key={stage.num}
              className="bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/50 p-3 rounded-xs flex flex-col justify-between space-y-2 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-[9px] mb-1">
                  <span className="font-black text-[#00D4AA]">{stage.num}</span>
                  <span className="text-[7.5px] px-1 py-0.2 bg-[#082830] text-[#7C98A6] rounded-xs font-bold">
                    {stage.latency}
                  </span>
                </div>
                <div className="text-xs font-black text-[#E0F7F4] tracking-wide uppercase group-hover:text-[#00D4AA] transition-colors">
                  {stage.name}
                </div>
                <div className="text-[9px] text-[#00D4AA] font-bold mt-0.5">
                  {stage.sub}
                </div>
                <div className="text-[8.5px] text-[#7C98A6] leading-relaxed mt-1">
                  {stage.detail}
                </div>
              </div>

              <div className="pt-2 border-t border-[#0D2E4A]/60 flex items-center gap-1 text-[8px] text-[#4A8090]">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#00D4AA]" />
                <span>{stage.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. BEFORE / AFTER COMPUTER VISION DEMONSTRATION ── */}
      <div className="bg-[#05121F] border border-[#0D2E4A] p-4 rounded-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs font-black text-[#E0F7F4] uppercase tracking-wider flex items-center gap-2">
              <span>BEFORE / AFTER: RAW ACOUSTIC SWATH VS. AI ANALYZED INTELLIGENCE</span>
              <span className="text-[8.5px] px-1.5 py-0.2 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs">
                INTERACTIVE COMPARISON
              </span>
            </div>
            <div className="text-[9.5px] text-[#7C98A6]">
              Drag the slider below to verify how SonarX identifies debris and suppresses natural sediment clutter.
            </div>
          </div>

          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-[#EF4444] font-bold">LEFT: RAW UNPROCESSED</span>
            <span className="text-[#4A8090]">|</span>
            <span className="text-[#00D4AA] font-bold">RIGHT: AI OBJECT DETECTION</span>
          </div>
        </div>

        {/* Interactive Split Viewport */}
        <div className="relative h-64 md:h-80 w-full bg-[#01050A] border border-[#0D2E4A] rounded-xs overflow-hidden">
          {/* Base Layer: AI Analyzed Sonar */}
          <div className="absolute inset-0 flex">
            {/* Left flank */}
            <div className="flex-1 bg-[#05121F] relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#00D4AA_1px,transparent_1px)] [background-size:16px_16px]" />
              {/* Confirmed Ghost Net Target */}
              <div className="absolute left-[35%] top-[40%] w-32 h-20 border-2 border-[#00D4AA] bg-[#00D4AA]/10 p-1">
                <div className="bg-[#030B14] border border-[#00D4AA] px-1.5 py-0.5 text-[8.5px] text-[#00D4AA] font-bold inline-block">
                  SX-T07 · GHOST NET (94.7%)
                </div>
                <div className="text-[7.5px] text-[#E0F7F4] mt-1">SHADOW: 2.31m · RELIEF: 0.82m</div>
              </div>
              {/* Natural Rock (Filtered Out) */}
              <div className="absolute left-[70%] top-[25%] w-24 h-16 border border-dashed border-[#EF4444]/60 bg-[#EF4444]/5 p-1">
                <div className="text-[8px] text-[#EF4444] font-bold">✕ NOISE / SEDIMENT</div>
                <div className="text-[7px] text-[#7C98A6]">NO ACOUSTIC SHADOW</div>
              </div>
            </div>

            {/* Nadir void corridor */}
            <div className="w-12 bg-[#01050A] border-x border-[#0D2E4A] flex flex-col items-center justify-center">
              <span className="text-[7.5px] text-[#4A8090] -rotate-90 tracking-widest uppercase">NADIR VOID</span>
            </div>

            {/* Right flank */}
            <div className="flex-1 bg-[#05121F] relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#00D4AA_1px,transparent_1px)] [background-size:16px_16px]" />
              {/* Pipeline Hazard Target */}
              <div className="absolute right-[30%] bottom-[30%] w-36 h-14 border border-[#38BDF8] bg-[#38BDF8]/10 p-1">
                <div className="bg-[#030B14] border border-[#38BDF8] px-1.5 py-0.5 text-[8.5px] text-[#38BDF8] font-bold inline-block">
                  SX-T03 · PIPELINE FREE-SPAN
                </div>
                <div className="text-[7.5px] text-[#E0F7F4]">89.2% · DANGER TO TRAWLERS</div>
              </div>
            </div>
          </div>

          {/* Top Layer: Raw Sonar (Clipped via sliderPosition) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="w-[1000px] md:w-[1400px] h-full bg-[#081520] relative flex">
              <div className="flex-1 bg-[#091A26] relative">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#4A8090_1px,transparent_1px)] [background-size:8px_8px]" />
                {/* Raw unannotated blob */}
                <div className="absolute left-[35%] top-[40%] w-20 h-12 bg-white/20 rounded-full blur-xs" />
                <div className="absolute left-[70%] top-[25%] w-16 h-10 bg-white/15 rounded-full blur-xs" />
              </div>
              <div className="w-12 bg-[#02070D]" />
              <div className="flex-1 bg-[#091A26] relative">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#4A8090_1px,transparent_1px)] [background-size:8px_8px]" />
                <div className="absolute right-[30%] bottom-[30%] w-28 h-6 bg-white/25 blur-xs" />
              </div>
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#00D4AA] shadow-[0_0_10px_#00D4AA] pointer-events-none z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-[#030B14] border-2 border-[#00D4AA] rounded-full flex items-center justify-center text-[10px] text-[#00D4AA]">
              ⇄
            </div>
          </div>

          {/* Invisible Range Input for Sliding */}
          <input
            type="range"
            min="5"
            max="95"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />
        </div>
      </div>

      {/* ── 4. COMPETITIVE DIFFERENTIATION: WHY SONARX? ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traditional Manual Workflow */}
        <div className="bg-[#05121F] border border-[#0D2E4A] p-4 rounded-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-[#EF4444] uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>TRADITIONAL SONAR WORKFLOW (MANUAL INTERPRETATION)</span>
          </div>

          <div className="text-[9.5px] text-[#7C98A6] space-y-1.5 pt-1">
            <div className="flex items-start gap-2">
              <span className="text-[#EF4444] font-bold">✕</span>
              <span><strong>Slow Analysis:</strong> 4 to 6 hours required to manually inspect a single 50 km swath line.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#EF4444] font-bold">✕</span>
              <span><strong>Operator Fatigue:</strong> Human eye misses faint ghost nets amidst seabed sediment ripples.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#EF4444] font-bold">✕</span>
              <span><strong>Manual Triangulation:</strong> Operator manually calculates object height and WGS-84 coordinates.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#EF4444] font-bold">✕</span>
              <span><strong>Unindexed Logs:</strong> Static paper or PDF logs disconnected from operational ROV retrieval teams.</span>
            </div>
          </div>
        </div>

        {/* SONARX Automated AI Workflow */}
        <div className="bg-[#05121F] border border-[#00D4AA]/40 p-4 rounded-xs space-y-2 shadow-[0_0_15px_rgba(0,212,170,0.1)]">
          <div className="flex items-center gap-2 text-xs font-black text-[#00D4AA] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>SONARX AUTOMATED INTELLIGENCE PIPELINE</span>
          </div>

          <div className="text-[9.5px] text-[#E0F7F4] space-y-1.5 pt-1">
            <div className="flex items-start gap-2">
              <span className="text-[#00D4AA] font-bold">✓</span>
              <span><strong>Instant Inference:</strong> 42 ms ONNX inference accelerates whole-mission review to under 4 minutes.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#00D4AA] font-bold">✓</span>
              <span><strong>Acoustic Shadow Gate:</strong> Automatically suppresses natural basalt rock & sediment false alarms.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#00D4AA] font-bold">✓</span>
              <span><strong>Automated Geotagging:</strong> Direct USBL ping log georeferencing to sub-meter WGS-84 coordinates.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#00D4AA] font-bold">✓</span>
              <span><strong>Human-in-the-Loop AI:</strong> Assists marine experts with explainable dossiers, not replacing the scientist.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. LIVE MISSION SUMMARY METRIC STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] rounded-xs">
          <div className="text-[9px] text-[#7C98A6] uppercase font-bold">TOTAL RAW DETECTIONS</div>
          <div className="text-xl font-black text-[#E0F7F4] mt-1">17 CANDIDATES</div>
          <div className="text-[8.5px] text-[#4A8090]">From 75m swath acquisition</div>
        </div>

        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] rounded-xs">
          <div className="text-[9px] text-[#EF4444] uppercase font-bold">NATURAL NOISE REJECTED</div>
          <div className="text-xl font-black text-[#EF4444] mt-1">7 FILTERED</div>
          <div className="text-[8.5px] text-[#7C98A6]">Basalt rocks & sand ripples</div>
        </div>

        <div className="p-3 bg-[#05121F] border border-[#00D4AA]/40 rounded-xs">
          <div className="text-[9px] text-[#00D4AA] uppercase font-bold">CONFIRMED DEBRIS TARGETS</div>
          <div className="text-xl font-black text-[#00D4AA] mt-1">10 CONFIRMED</div>
          <div className="text-[8.5px] text-[#7C98A6]">4 High hazard · 6 Medium</div>
        </div>

        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] rounded-xs">
          <div className="text-[9px] text-[#F59E0B] uppercase font-bold">FLAGSHIP HERO TARGET</div>
          <div className="text-xl font-black text-[#F59E0B] mt-1">SX-T07 · 94.7%</div>
          <div className="text-[8.5px] text-[#7C98A6]">Ghost Net ALDFG (-43.1m)</div>
        </div>
      </div>
    </div>
  );
};
