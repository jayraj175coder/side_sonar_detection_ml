import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Radio,
  Play,
  Compass,
  Activity,
  Maximize2,
  Clock,
  Layers,
  Database,
  BarChart2,
  ChevronRight,
  Target,
  Zap,
  MapPin,
  Crosshair,
  FileText,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandCenterDashboard: React.FC = () => {
  const { setActiveTab, currentScan } = useApp();

  // Waterfall stream simulation state
  const [streamActive, setStreamActive] = useState(true);
  const [waterfallOffset, setWaterfallOffset] = useState(0);

  useEffect(() => {
    if (!streamActive) return;
    const interval = setInterval(() => {
      setWaterfallOffset((prev) => (prev + 1) % 200);
    }, 50);
    return () => clearInterval(interval);
  }, [streamActive]);

  const activeFilename = currentScan?.filename || 'sih_subsea_pipeline_trench.png';

  return (
    <div className="space-y-5 font-sans select-none text-slate-100">
      
      {/* ═══════════════════════════════════════════════════════════════════
          TOP MASTER GRID: MAIN OPERATIONS (LEFT) + TACTICAL WIDGETS (RIGHT)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* ── LEFT / MAIN CONTENT AREA (col-span-12 xl:col-span-9) ───────── */}
        <div className="xl:col-span-9 space-y-5">
          
          {/* 1. HERO BANNER: OPERATIONAL PRODUCT INTRODUCTION */}
          <div className="relative rounded-2xl border border-white/[0.1] bg-[#060A13] overflow-hidden shadow-2xl p-6 sm:p-7 min-h-[360px] flex flex-col justify-between">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0284c7]/25 via-[#060A13]/90 to-[#04070E]" />

            {/* Realistic Technical Hydrographic Survey Workstation SVG on the right */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[58%] pointer-events-none overflow-hidden opacity-75">
              <svg viewBox="0 0 650 380" className="w-full h-full object-cover">
                <defs>
                  {/* Acoustic Port & Starboard Fan Beams */}
                  <linearGradient id="beamPort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#0284C7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FFB800" stopOpacity="0.08" />
                  </linearGradient>
                  <linearGradient id="beamStbd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#0284C7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.08" />
                  </linearGradient>
                  {/* Seafloor Gradient */}
                  <linearGradient id="seabedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E1E33" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#040811" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* Sea Surface Reference Line */}
                <line x1="0" y1="70" x2="650" y2="70" stroke="#38BDF8" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />
                <text x="20" y="65" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono, monospace">SURFACE [0 m]</text>

                {/* Depth Markings / Strata Ticks */}
                <line x1="0" y1="140" x2="650" y2="140" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x="20" y="136" fill="#475569" fontSize="8" fontFamily="JetBrains Mono, monospace">DEPTH 15 m</text>

                <line x1="0" y1="220" x2="650" y2="220" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x="20" y="216" fill="#475569" fontSize="8" fontFamily="JetBrains Mono, monospace">DEPTH 30 m</text>

                <line x1="0" y1="300" x2="650" y2="300" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x="20" y="296" fill="#475569" fontSize="8" fontFamily="JetBrains Mono, monospace">DEPTH 45 m [SEABED]</text>

                {/* Survey Vessel / AUV Platform Silhouette */}
                <g transform="translate(360, 42)">
                  {/* Vessel Hull */}
                  <path d="M 0,28 L 10,16 L 28,16 L 32,8 L 52,8 L 56,16 L 105,16 L 125,28 L 140,28 L 132,36 L 15,36 Z" fill="#E2E8F0" opacity="0.85" />
                  <rect x="36" y="2" width="10" height="6" fill="#38BDF8" opacity="0.9" />
                  <line x1="41" y1="-3" x2="41" y2="2" stroke="#E2E8F0" strokeWidth="2" />
                  <circle cx="41" cy="-3" r="3" fill="#FFB800" />
                  <line x1="41" y1="-3" x2="52" y2="-7" stroke="#FFB800" strokeWidth="1.5" />
                  {/* Vessel Label */}
                  <text x="60" y="26" fill="#0F172A" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono, monospace">RV-SAGAR</text>
                  {/* Tow Cable */}
                  <path d="M 15,36 Q 40,85 70,130" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4,2" />
                </g>

                {/* Towfish Sonar Subsea Body at 130m */}
                <g transform="translate(430, 172)">
                  <ellipse cx="0" cy="0" rx="14" ry="4" fill="#FFB800" />
                  <polygon points="12,0 18,-4 18,4" fill="#FFB800" />
                  <circle cx="-6" cy="0" r="1.5" fill="#05070B" />
                  <text x="-18" y="-7" fill="#FFB800" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">TOWFISH // 900 kHz</text>
                </g>

                {/* Dual Acoustic Swath Beams projecting downwards */}
                {/* Port Swath Beam */}
                <polygon points="430,174 190,340 430,340" fill="url(#beamPort)" opacity="0.5" />
                {/* Starboard Swath Beam */}
                <polygon points="430,174 430,340 640,340" fill="url(#beamStbd)" opacity="0.5" />

                {/* Nadir centerline track */}
                <line x1="430" y1="174" x2="430" y2="340" stroke="#FFB800" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.7" />

                {/* Seabed Bathymetric Strata Layer */}
                <path d="M 0,335 Q 160,330 300,340 T 650,335 L 650,380 L 0,380 Z" fill="url(#seabedGrad)" />
                <path d="M 0,335 Q 160,330 300,340 T 650,335" fill="none" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />

                {/* Seafloor Inspection Grid Lines */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line
                    key={`grid-h-${i}`}
                    x1={170 - i * 15}
                    y1={280 + i * 15}
                    x2={640 + i * 10}
                    y2={280 + i * 15}
                    stroke="#38BDF8"
                    strokeWidth="0.8"
                    opacity={0.12 + i * 0.04}
                  />
                ))}

                {/* Target Contacts on Seabed with Technical Callouts */}
                {/* Target #014 Ghost Net */}
                <g transform="translate(310, 318)">
                  <rect x="-14" y="-14" width="28" height="28" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,2" />
                  <circle cx="0" cy="0" r="3" fill="#10B981" />
                  <text x="-24" y="-18" fill="#10B981" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">#014 [GHOST NET] 94.2%</text>
                  <line x1="0" y1="0" x2="16" y2="10" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                </g>

                {/* Target #013 Pipeline */}
                <g transform="translate(530, 305)">
                  <rect x="-12" y="-12" width="24" height="24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3,2" />
                  <circle cx="0" cy="0" r="2.5" fill="#EF4444" />
                  <text x="-20" y="-16" fill="#EF4444" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">#013 [PIPELINE] 87.6%</text>
                </g>

                {/* Target #012 Marine Debris */}
                <g transform="translate(410, 332)">
                  <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#FFB800" strokeWidth="1.5" strokeDasharray="3,2" />
                  <circle cx="0" cy="0" r="2" fill="#FFB800" />
                  <text x="-16" y="20" fill="#FFB800" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">#012 [DEBRIS] 76.3%</text>
                </g>

                {/* Transducer Specifications Readout in corner */}
                <g transform="translate(480, 80)">
                  <rect x="0" y="0" width="150" height="38" rx="4" fill="#050C16" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                  <text x="8" y="13" fill="#94A3B8" fontSize="7.5" fontFamily="JetBrains Mono, monospace">TRANSDUCER: 900 kHz CHIRP</text>
                  <text x="8" y="23" fill="#94A3B8" fontSize="7.5" fontFamily="JetBrains Mono, monospace">SWATH WIDTH: 150 m DUAL</text>
                  <text x="8" y="33" fill="#38BDF8" fontSize="7.5" fontFamily="JetBrains Mono, monospace">BEARING: 042° // SPEED: 3.5 kt</text>
                </g>
              </svg>
            </div>

            {/* Top Row: Mission Category Badge & EEZ Sector */}
            <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono font-bold text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-widest uppercase text-[11px]">AUTONOMOUS ACOUSTIC RECONNAISSANCE</span>
              </div>

              {/* Slogan / Operational Coordinates */}
              <div className="hidden sm:block text-right font-mono text-[10px] tracking-wider text-slate-400 space-y-0.5">
                <div>MISSION: MX-026 • ARABIAN SEA</div>
                <div>SURVEY SECTOR: MUMBAI OFFSHORE</div>
                <div className="text-[#FFB800] font-bold">IHO S-44 ORDER 1A COMPLIANT</div>
              </div>
            </div>

            {/* Center Content: Title, Subtitle, CTA Buttons */}
            <div className="relative z-10 my-6 max-w-xl space-y-3">
              <h1 className="text-3xl sm:text-5xl font-sans font-black text-white tracking-tight leading-tight">
                See Beneath <br className="hidden sm:inline" />
                the Surface
              </h1>
              <p className="text-sm sm:text-base font-sans text-slate-300 leading-relaxed">
                AI-powered Side-Scan Sonar analysis for detecting{' '}
                <strong className="text-[#FFB800] font-semibold">ghost nets (ALDFG)</strong>,{' '}
                <strong className="text-[#FFB800] font-semibold">underwater marine debris</strong>,{' '}
                <strong className="text-[#FFB800] font-semibold">subsea pipelines</strong>, and{' '}
                <strong className="text-white font-semibold">seabed anomalies</strong>.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex items-center gap-3.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('scan')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#FFB800]/90 text-black font-sans font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(255,184,0,0.3)] active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-black" />
                  <span>UPLOAD SONAR SCAN &rarr;</span>
                </button>

                <button
                  onClick={() => setActiveTab('mission')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 text-[#38BDF8] fill-[#38BDF8]" />
                  <span>WATCH DEMO</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Strip: Process Stages & Coordinates */}
            <div className="relative z-10 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-4 text-xs font-mono text-slate-400 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-[11px]">
                <span className="text-[#38BDF8] font-bold">DETECT</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="text-slate-300 font-medium">VERIFY</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="text-slate-300 font-medium">LOCALIZE</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="text-slate-300 font-medium">TRACK</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="text-[#FFB800] font-bold">REPORT</span>
              </div>

              <div className="text-slate-400 font-mono text-[11px]">
                18.9217° N, 72.8214° E | <span className="text-emerald-400 font-bold">INDIAN EEZ</span>
              </div>
            </div>
          </div>

          {/* 2. REAL MODEL PERFORMANCE METRICS ONLY (5 CARDS) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Tile 1: SSS Tiles */}
            <div
              onClick={() => setActiveTab('scan')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-[#FFB800]/50 bg-[#090E17] flex items-center gap-3 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              title="View Dataset Telemetry"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800] shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-white">5,205</div>
                <div className="text-[9.5px] font-mono text-slate-400 uppercase font-semibold">SSS TILES ANALYZED</div>
              </div>
            </div>

            {/* Tile 2: mAP@0.5 */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-[#38BDF8]/50 bg-[#090E17] flex items-center gap-3 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              title="View mAP Benchmark"
            >
              <div className="w-9 h-9 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-[#38BDF8]">74.09%</div>
                <div className="text-[9.5px] font-mono text-slate-400 uppercase font-semibold">mAP@0.5</div>
              </div>
            </div>

            {/* Tile 3: Precision */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-emerald-400/50 bg-[#090E17] flex items-center gap-3 shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
              title="View Model Precision"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-white">77.73%</div>
                <div className="text-[9.5px] font-mono text-slate-400 uppercase font-semibold">PRECISION</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400/70" />
            </div>

            {/* Tile 4: Recall */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/50 bg-[#090E17] flex items-center gap-3 shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
              title="View Model Recall"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-white">74.61%</div>
                <div className="text-[9.5px] font-mono text-slate-400 uppercase font-semibold">RECALL</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/70" />
            </div>

            {/* Tile 5: ONNX Inference */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-cyan-400/50 bg-[#090E17] flex items-center gap-3 shadow-md relative overflow-hidden col-span-2 sm:col-span-1 cursor-pointer transition-all hover:scale-[1.01]"
              title="View Edge Inference Latency"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-cyan-300">14.2 ms</div>
                <div className="text-[9.5px] font-mono text-slate-400 uppercase font-semibold">ONNX INFERENCE</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500/70" />
            </div>
          </div>

          {/* 3. DUAL OPERATIONAL WORKSTATIONS (2-COLUMN CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Card 1: MANUAL ANALYSIS */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                    MANUAL ANALYSIS
                  </h3>
                </div>
                <p className="text-xs font-sans text-slate-400 leading-relaxed">
                  Upload raw Side-Scan Sonar imagery and companion ping logs.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => setActiveTab('scan')}
                className="border-2 border-dashed border-white/[0.12] hover:border-[#FFB800]/60 rounded-xl p-5 text-center bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center text-slate-400 group-hover:text-[#FFB800] transition-colors">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Drag &amp; drop sonar files here or click to browse
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Supported: .XTF, .JSF, .TIFF, .PNG
                </div>
              </div>

              {/* Two Explicit Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('scan')}
                  className="px-3 py-2 rounded-xl bg-[#FFB800] hover:bg-[#FFB800]/90 text-black text-[11px] font-mono font-bold uppercase transition cursor-pointer text-center"
                >
                  UPLOAD SONAR SCAN
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scan')}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-white text-[11px] font-mono font-semibold uppercase transition cursor-pointer text-center"
                >
                  ATTACH PING LOG
                </button>
              </div>

              {/* Ingestion Telemetry Specs */}
              <div className="space-y-1.5 pt-3 border-t border-white/[0.06] font-mono text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>Filename:</span>
                  <span className="text-slate-200 truncate max-w-[170px]" title={activeFilename}>{activeFilename}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Dimensions:</span>
                  <span className="text-white">1024 × 512 px</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frequency:</span>
                  <span className="text-[#FFB800]">900 kHz CHIRP</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Channel:</span>
                  <span className="text-slate-200">Dual (Port &amp; Starboard)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>File Size:</span>
                  <span className="text-slate-200">2.4 MB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">READY / VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Card 2: LIVE ANALYSIS */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                      <Radio className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                      LIVE ANALYSIS
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE STREAM
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-400 leading-relaxed">
                  Continuously analyze live real-time sonar waterfall streams from AUVs &amp; towfish surveys.
                </p>
              </div>

              {/* Waterfall Header Telemetry */}
              <div className="flex items-center justify-between bg-black/60 px-2.5 py-1 rounded-lg border border-white/[0.06] text-[10px] font-mono text-slate-400">
                <span className="text-white font-bold">LIVE STREAM</span>
                <span className="text-slate-500">•</span>
                <span className="text-[#FFB800] font-semibold">900 kHz</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">AUV-04</span>
                <span className="text-slate-500">•</span>
                <span className="text-[#38BDF8]">FRAME 081 / 128</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">14.2 ms</span>
              </div>

              {/* Believable Sonar Waterfall Visualization */}
              <div className="relative rounded-xl border border-white/[0.1] bg-[#040811] h-[190px] overflow-hidden group">
                {/* Acoustic Waterfall Texture with scrolling lines */}
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, #060E1A, #060E1A 2px, #0B192E 2px, #0B192E 4px)`,
                    transform: `translateY(${waterfallOffset}px)`,
                  }}
                />

                {/* Left/Right Channel Divider (Nadir dead-zone gap) */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-[#020409] border-x border-white/[0.1] flex items-center justify-center">
                  <span className="w-0.5 h-full bg-[#0284c7]/40" />
                </div>

                {/* Target Detection Bounding Box 1: Ghost Net */}
                <div className="absolute top-8 left-[22%] border-2 border-emerald-400 bg-emerald-400/10 p-1 rounded shadow-sm">
                  <span className="text-[9px] font-mono font-black text-emerald-400 block leading-none">
                    #014 GHOST NET 94.2%
                  </span>
                  <div className="w-12 h-9 mt-1 opacity-80 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:4px_4px]" />
                </div>

                {/* Target Detection Bounding Box 2: Marine Debris */}
                <div className="absolute top-20 right-[20%] border-2 border-[#FFB800] bg-[#FFB800]/10 p-1 rounded shadow-sm">
                  <span className="text-[9px] font-mono font-black text-[#FFB800] block leading-none">
                    #012 DEBRIS 76.3%
                  </span>
                  <div className="w-11 h-8 mt-1 opacity-80 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:4px_4px]" />
                </div>

                {/* Moving Sonar Acquisition Sweep Line */}
                <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
              </div>

              {/* Bottom Stream Telemetry Strip */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-[11px]">Stream Active</span>
                  <span className="text-slate-500 text-[10px] hidden sm:inline">(UDP / RTSP / SIM)</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300">
                  <span><strong>28</strong> FPS</span>
                  <span><strong>14.2</strong> ms</span>
                  <span className="text-[#FFB800]"><strong>3</strong> Detections</span>
                  <button
                    onClick={() => setActiveTab('mission')}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Open Fullscreen Sonar Waterfall Workstation"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN: TACTICAL WIDGETS (col-span-12 xl:col-span-3) ─── */}
        <div className="xl:col-span-3 space-y-5">
          
          {/* 1. RECENT DETECTIONS PANEL */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                  RECENT DETECTIONS
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('mission')}
                className="text-[11px] font-mono text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Target Detection List */}
            <div className="space-y-2 font-mono">
              {[
                {
                  id: '#014',
                  name: 'Ghost Net (ALDFG)',
                  conf: '94.2%',
                  time: '2 min ago',
                  severity: 'HIGH',
                  badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                },
                {
                  id: '#013',
                  name: 'Pipeline Hazard',
                  conf: '87.6%',
                  time: '6 min ago',
                  severity: 'HIGH',
                  badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                },
                {
                  id: '#012',
                  name: 'Marine Debris',
                  conf: '76.3%',
                  time: '12 min ago',
                  severity: 'MED',
                  badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                },
                {
                  id: '#011',
                  name: 'Seafloor Anomaly',
                  conf: '68.1%',
                  time: '18 min ago',
                  severity: 'MED',
                  badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('mission')}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-[#FFB800]/40 flex items-center justify-between gap-2.5 transition cursor-pointer group"
                  title="Open Target in Mission Control"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {item.id}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-sans font-bold text-white truncate group-hover:text-[#FFB800] transition">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.time}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border block ${item.badgeBg}`}>
                      {item.conf}
                    </span>
                    <span className="text-[8px] text-slate-500 block text-right mt-0.5">{item.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. MISSION OVERVIEW MAP WIDGET */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFB800]" />
                <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                  MISSION OVERVIEW
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-[11px] font-mono text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>View Map</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Tactical Nautical Map Visual */}
            <div
              onClick={() => setActiveTab('map')}
              className="relative h-44 rounded-xl border border-white/[0.1] bg-[#050C16] overflow-hidden cursor-pointer group"
            >
              {/* Nautical chart coordinate grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

              {/* Coastal Landmass & Bathymetric Contours */}
              <svg viewBox="0 0 300 180" className="w-full h-full object-cover opacity-70">
                {/* Arabian Sea coastline */}
                <path
                  d="M 235,0 Q 215,60 205,100 T 225,180 L 300,180 L 300,0 Z"
                  fill="#0B1526"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text x="240" y="35" fill="#64748B" fontSize="8" fontFamily="monospace">INDIAN COAST</text>
                <text x="35" y="25" fill="#475569" fontSize="9" fontFamily="monospace">Arabian Sea</text>

                {/* Depth contours */}
                <path d="M 0,110 Q 100,105 180,120" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                <path d="M 0,60 Q 90,65 170,80" fill="none" stroke="#1E293B" strokeWidth="0.8" />

                {/* Lawnmower Survey Trackline (Yellow) */}
                <path
                  d="M 40,140 L 80,140 L 80,95 L 120,95 L 120,135 L 160,135 L 160,80 L 195,50"
                  fill="none"
                  stroke="#FFB800"
                  strokeWidth="1.8"
                  strokeDasharray="4,3"
                />

                {/* AUV Current Position */}
                <g transform="translate(195, 50)">
                  <circle cx="0" cy="0" r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.6" className="animate-ping" />
                  <text x="7" y="3" fill="#38BDF8" fontSize="8" fontWeight="bold" fontFamily="monospace">AUV-04</text>
                </g>

                {/* Verified Target Marker (Green) */}
                <circle cx="80" cy="95" r="3.5" fill="#10B981" />
                
                {/* High-risk Target Marker (Red) */}
                <circle cx="120" cy="115" r="3.5" fill="#EF4444" />

                {/* Medium-risk Target Marker (Amber) */}
                <circle cx="160" cy="80" r="3.5" fill="#FFB800" />
              </svg>

              {/* Mini Map Legend */}
              <div className="absolute bottom-2 left-2 bg-[#050B14]/90 border border-white/[0.1] rounded-lg p-2 text-[8.5px] font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-0.5 bg-[#FFB800]" />
                  <span>Survey Track</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                  <span>AUV position</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Verified Targets</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>High-risk Targets</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Medium-risk Targets</span>
                </div>
              </div>

              {/* Scale bar */}
              <div className="absolute bottom-2 right-2 text-[8.5px] font-mono text-slate-400 bg-black/70 px-1.5 py-0.5 rounded border border-white/[0.1]">
                5 km ───
              </div>
            </div>
          </div>

          {/* 3. CLEANER OCEANS SUSTAINABILITY CARD */}
          <div
            onClick={() => setActiveTab('mission')}
            className="p-5 rounded-2xl border border-white/[0.08] hover:border-[#38BDF8]/40 bg-[#070D18] overflow-hidden shadow-xl space-y-3 cursor-pointer transition-all hover:scale-[1.01]"
            title="Launch Mission Control"
          >
            <div className="space-y-1">
              <div className="text-sm font-sans font-black text-white">
                Cleaner Oceans
              </div>
              <div className="text-sm font-sans font-black text-[#38BDF8]">
                Safer Coasts
              </div>
              <div className="text-sm font-sans font-black text-emerald-400">
                Sustainable Marine Ecosystems
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.08] text-[9px] font-mono font-bold tracking-widest text-[#FFB800] uppercase">
              AI ACOUSTIC PERCEPTION &bull; ALDFG RECOVERY
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
