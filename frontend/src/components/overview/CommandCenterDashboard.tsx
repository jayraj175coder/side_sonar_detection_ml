import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Maximize2,
  Play,
  Compass,
  Cpu,
  Zap,
  Target,
  FileText,
  MapPin,
  Clock,
  Layers,
  Database,
  BarChart2,
  ChevronRight,
  Sliders,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandCenterDashboard: React.FC = () => {
  const { setActiveTab } = useApp();

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

  return (
    <div className="space-y-6 font-sans select-none text-slate-100">
      {/* ═══════════════════════════════════════════════════════════════════
          TOP MASTER GRID: MAIN OPERATIONS (LEFT) + TACTICAL WIDGETS (RIGHT)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ── LEFT / MAIN CONTENT AREA (col-span-12 xl:col-span-9) ───────── */}
        <div className="xl:col-span-9 space-y-5">
          {/* 1. HERO BANNER: "See Beneath the Surface" */}
          <div className="relative rounded-2xl border border-white/[0.12] bg-[#070D18] overflow-hidden shadow-2xl p-6 sm:p-8 min-h-[360px] flex flex-col justify-between">
            {/* Ambient Background Grid & Oceanic Visuals */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0284c7]/30 via-[#070D18]/80 to-[#05070B]" />

            {/* 3D Wireframe Bathymetric Mesh & Vessel Silhouette Background Graphic */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[60%] pointer-events-none overflow-hidden opacity-60">
              <svg viewBox="0 0 700 400" className="w-full h-full object-cover">
                <defs>
                  <linearGradient id="beamGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#00F5D4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFB703" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="gridGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Ocean Surface Line */}
                <line x1="0" y1="80" x2="700" y2="80" stroke="#38BDF8" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />

                {/* Survey Vessel Silhouette on the surface */}
                <g transform="translate(380, 48)">
                  <path d="M 0,28 L 8,16 L 24,16 L 28,10 L 44,10 L 48,16 L 90,16 L 105,28 L 120,28 L 115,36 L 15,36 Z" fill="#E2E8F0" opacity="0.85" />
                  <rect x="32" y="4" width="8" height="6" fill="#38BDF8" opacity="0.9" />
                  <line x1="36" y1="0" x2="36" y2="4" stroke="#E2E8F0" strokeWidth="2" />
                  {/* Radar rotating sweep */}
                  <circle cx="36" cy="0" r="3" fill="#FFB703" />
                  <line x1="36" y1="0" x2="48" y2="-4" stroke="#FFB703" strokeWidth="1.5" />
                </g>

                {/* Acoustic Projection Beam Cone */}
                <polygon points="430,80 200,380 660,380" fill="url(#beamGradient)" opacity="0.45" />

                {/* 3D Perspective Bathymetry Seafloor Grid */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={200 - i * 20}
                    y1={240 + i * 16}
                    x2={660 + i * 20}
                    y2={240 + i * 16}
                    stroke="#38BDF8"
                    strokeWidth="1"
                    opacity={0.15 + i * 0.05}
                  />
                ))}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={430}
                    y1={80}
                    x2={180 + i * 50}
                    y2={380}
                    stroke="#00F5D4"
                    strokeWidth="0.8"
                    opacity="0.3"
                  />
                ))}

                {/* Target Contacts Detected on Seabed */}
                <g transform="translate(360, 310)">
                  <rect x="-12" y="-12" width="24" height="24" fill="none" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="3,3" />
                  <circle cx="0" cy="0" r="3" fill="#FFB703" />
                </g>
                <g transform="translate(480, 280)">
                  <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#00F5D4" strokeWidth="1.5" strokeDasharray="3,3" />
                  <circle cx="0" cy="0" r="2.5" fill="#00F5D4" />
                </g>
              </svg>
            </div>

            {/* Top Row: Mission Category Badge & Slogan */}
            <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-mono font-bold text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="tracking-widest uppercase">AUTONOMOUS ACOUSTIC RECONNAISSANCE</span>
              </div>

              {/* Slogan Top-Right */}
              <div className="hidden sm:block text-right font-mono text-[10px] tracking-wider text-slate-400 space-y-0.5">
                <div>CLEANER OCEANS</div>
                <div>SAFER COASTS</div>
                <div className="text-[#38BDF8] font-bold">DATA-DRIVEN TOMORROW</div>
              </div>
            </div>

            {/* Center Content: Title, Subtitle, CTA Buttons */}
            <div className="relative z-10 my-6 max-w-xl space-y-3.5">
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
                See Beneath <br className="hidden sm:inline" />
                the Surface
              </h1>
              <p className="text-sm sm:text-base font-sans text-slate-300 leading-relaxed">
                AI-powered Side-Scan Sonar analysis for detecting{' '}
                <strong className="text-[#FFB703] font-semibold">ghost nets (ALDFG)</strong>,{' '}
                <strong className="text-[#FFB703] font-semibold">underwater marine debris</strong>,{' '}
                <strong className="text-[#FFB703] font-semibold">subsea pipelines</strong>, and{' '}
                <strong className="text-white font-semibold">seabed anomalies</strong>.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex items-center gap-3.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('scan')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-sans font-bold text-sm transition-all cursor-pointer shadow-[0_0_24px_rgba(255,183,3,0.35)] active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-[#05070B]" />
                  <span>Upload Sonar Scan &rarr;</span>
                </button>

                <button
                  onClick={() => setActiveTab('mission')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] text-white font-sans font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 text-[#38BDF8] fill-[#38BDF8]" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Strip: Steps & Coordinates */}
            <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4 text-xs font-mono text-slate-400 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-[#38BDF8] font-bold">! DETECT</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300">! VERIFY</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300">! LOCALIZE</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300">! TRACK</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300">! PLAN</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[#FFB703] font-bold">! REPORT</span>
              </div>

              <div className="text-slate-400 font-mono text-[11px]">
                18.9217&deg; N, 72.8214&deg; E | <span className="text-emerald-400 font-bold">INDIAN EEZ</span>
              </div>
            </div>
          </div>

          {/* 2. VERIFIED TECHNICAL METRICS STRIP (5 TILES) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Tile 1: SSS Tiles */}
            <div
              onClick={() => setActiveTab('scan')}
              className="subpixel-card p-4 rounded-xl border border-white/[0.08] hover:border-[#FFB703]/50 bg-[#090E17] flex items-center gap-3 shadow-md cursor-pointer transition-all hover:scale-102"
              title="View Ingestion & Dataset"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703] shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white">5,205</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">SSS TILES ANALYZED</div>
              </div>
            </div>

            {/* Tile 2: mAP@50 */}
            <div
              onClick={() => setActiveTab('model')}
              className="subpixel-card p-4 rounded-xl border border-white/[0.08] hover:border-[#38BDF8]/50 bg-[#090E17] flex items-center gap-3 shadow-md cursor-pointer transition-all hover:scale-102"
              title="View Model Benchmarks"
            >
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-black text-[#38BDF8]">74.09%</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">mAP@50</div>
              </div>
            </div>

            {/* Tile 3: Precision */}
            <div
              onClick={() => setActiveTab('model')}
              className="subpixel-card p-4 rounded-xl border border-white/[0.08] hover:border-emerald-400/50 bg-[#090E17] flex items-center gap-3 shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-102"
              title="View Model Precision"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white">77.73%</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">PRECISION</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400/80" />
            </div>

            {/* Tile 4: Recall */}
            <div
              onClick={() => setActiveTab('model')}
              className="subpixel-card p-4 rounded-xl border border-white/[0.08] hover:border-amber-400/50 bg-[#090E17] flex items-center gap-3 shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-102"
              title="View Model Recall"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white">74.61%</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">RECALL</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/80" />
            </div>

            {/* Tile 5: ONNX Inference */}
            <div
              onClick={() => setActiveTab('model')}
              className="subpixel-card p-4 rounded-xl border border-white/[0.08] hover:border-purple-400/50 bg-[#090E17] flex items-center gap-3 shadow-md relative overflow-hidden col-span-2 sm:col-span-1 cursor-pointer transition-all hover:scale-102"
              title="View Edge Latency Specs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-black text-purple-300">14.2 ms</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">ONNX INFERENCE</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/80" />
            </div>
          </div>

          {/* 3. DUAL OPERATIONAL WORKSTATIONS (2-COLUMN CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Manual Analysis */}
            <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFB703]/10 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703]">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wide">Manual Analysis</h3>
                </div>
                <p className="text-xs font-sans text-slate-400 leading-relaxed">
                  Upload raw Side-Scan Sonar imagery and companion ping logs to localize, classify, and inspect potential underwater anomalies with AI.
                </p>
              </div>

              {/* Upload Dropzone Preview Box */}
              <div
                onClick={() => setActiveTab('scan')}
                className="border-2 border-dashed border-white/[0.12] hover:border-[#FFB703]/60 rounded-xl p-6 text-center bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center text-slate-400 group-hover:text-[#FFB703] transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Drag & drop sonar files here or click to browse
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Supports .XTF, .JSF, .TIFF, .PNG
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold border border-white/[0.1] transition-all cursor-pointer"
                >
                  Choose Files
                </button>
              </div>

              {/* Supported Analysis Checklist */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Supported Analysis
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
                    <span><strong>Multi-swath processing</strong> &bull; Automatic channel separation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
                    <span><strong>YOLOv8s detection</strong> &bull; 4-class marine perception</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span><strong>Acoustic shadow verification</strong> &bull; Physics-based validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span><strong>Geo-referenced output</strong> &bull; WGS84 coordinates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span><strong>Detailed detection report</strong> &bull; Export as PDF / GeoJSON</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Live Analysis */}
            <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                      <Radio className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">Live Analysis</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    LIVE STREAM
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-400 leading-relaxed">
                  Continuously analyze live real-time sonar waterfall streams from AUVs & towfish surveys.
                </p>
              </div>

              {/* Live Waterfall Stream Simulation Display */}
              <div className="relative rounded-xl border border-white/[0.1] bg-[#040811] h-[190px] overflow-hidden group">
                {/* Acoustic Waterfall Texture with scrolling lines */}
                <div
                  className="absolute inset-0 opacity-75"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, #07101E, #07101E 2px, #0B1C33 2px, #0B1C33 4px)`,
                    transform: `translateY(${waterfallOffset}px)`,
                  }}
                />

                {/* Left/Right Channel Divider (Nadir gap) */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-[#02050B] border-x border-white/[0.1] flex items-center justify-center">
                  <span className="w-0.5 h-full bg-[#0284c7]/40" />
                </div>

                {/* Target Detection Bounding Boxes Overlay */}
                <div className="absolute top-10 left-[24%] border-2 border-emerald-400 bg-emerald-400/10 p-1 rounded">
                  <span className="text-[9px] font-mono font-black text-emerald-400 block leading-none">
                    GHOST NET 94.2%
                  </span>
                  <div className="w-12 h-10 mt-1 opacity-80 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:4px_4px]" />
                </div>

                <div className="absolute top-20 right-[22%] border-2 border-[#FFB703] bg-[#FFB703]/10 p-1 rounded">
                  <span className="text-[9px] font-mono font-black text-[#FFB703] block leading-none">
                    DEBRIS 87.6%
                  </span>
                  <div className="w-10 h-8 mt-1 opacity-80 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:4px_4px]" />
                </div>

                {/* Moving Sonar Scan Line */}
                <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-[11px]">Stream Active</span>
                  <span className="text-slate-500 text-[10px] hidden sm:inline">(UDP / RTSP / SIM)</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300">
                  <span><strong>28</strong> FPS</span>
                  <span><strong>14.2</strong> ms</span>
                  <span className="text-[#FFB703]"><strong>3</strong> Detections</span>
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
          {/* 1. RECENT DETECTIONS WIDGET */}
          <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-sm font-bold text-white tracking-wide">Recent Detections</h3>
              </div>
              <button
                onClick={() => setActiveTab('tracking')}
                className="text-xs font-mono text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Target Detection List */}
            <div className="space-y-2.5">
              {[
                {
                  id: 'T-014',
                  name: 'Ghost Net (ALDFG)',
                  conf: '94.2%',
                  time: '2 min ago',
                  color: 'text-emerald-400',
                  badgeBg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
                },
                {
                  id: 'T-013',
                  name: 'Pipeline Hazard',
                  conf: '87.6%',
                  time: '6 min ago',
                  color: 'text-rose-400',
                  badgeBg: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
                },
                {
                  id: 'T-012',
                  name: 'Marine Debris',
                  conf: '76.3%',
                  time: '12 min ago',
                  color: 'text-[#FFB703]',
                  badgeBg: 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/30',
                },
                {
                  id: 'T-011',
                  name: 'Seafloor Anomaly',
                  conf: '68.1%',
                  time: '18 min ago',
                  color: 'text-[#38BDF8]',
                  badgeBg: 'bg-sky-400/10 text-sky-400 border-sky-400/30',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('tracking')}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black border border-white/[0.1] flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0">
                      {item.id.replace('T-', '#')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:text-[#FFB703] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.time}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border shrink-0 ${item.badgeBg}`}>
                    {item.conf}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. MISSION OVERVIEW MAP WIDGET */}
          <div className="subpixel-card p-5 rounded-2xl border border-white/[0.08] bg-[#0A0F18] shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFB703]" />
                <h3 className="text-sm font-bold text-white tracking-wide">Mission Overview</h3>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-xs font-mono text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Map</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Tactical Map Visual Container */}
            <div
              onClick={() => setActiveTab('map')}
              className="relative h-44 rounded-xl border border-white/[0.1] bg-[#050C16] overflow-hidden cursor-pointer group"
            >
              {/* Map vector grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

              {/* Coastal Landmass Contour Silhouette */}
              <svg viewBox="0 0 300 180" className="w-full h-full object-cover opacity-60">
                {/* Arabian Sea coastline */}
                <path
                  d="M 240,0 Q 220,60 210,100 T 230,180 L 300,180 L 300,0 Z"
                  fill="#0B1526"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text x="250" y="40" fill="#64748B" fontSize="9" fontFamily="monospace">INDIAN COAST</text>
                <text x="40" y="30" fill="#475569" fontSize="10" fontFamily="monospace">Arabian Sea</text>

                {/* Survey Vessel Trackline (Yellow) */}
                <path
                  d="M 50,140 L 95,95 L 140,80 L 200,45"
                  fill="none"
                  stroke="#FFB703"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Vessel Position Icon */}
                <circle cx="50" cy="140" r="5" fill="#38BDF8" stroke="#ffffff" strokeWidth="1.5" />

                {/* Contact Markers */}
                <circle cx="95" cy="95" r="4" fill="#34D399" />
                <circle cx="140" cy="80" r="4" fill="#F87171" />
                <circle cx="170" cy="65" r="3.5" fill="#FBBF24" />
                <circle cx="200" cy="45" r="4" fill="#38BDF8" />
              </svg>

              {/* Mini Map Overlay Legend */}
              <div className="absolute bottom-2 left-2 bg-[#050B14]/90 border border-white/[0.1] rounded-lg p-2 text-[9px] font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-0.5 bg-[#FFB703]" />
                  <span>Survey Track</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Verified Target</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Hazard (High)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Hazard (Medium)</span>
                </div>
              </div>

              {/* Scale bar */}
              <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.1]">
                5 km &mdash;&mdash;
              </div>
            </div>
          </div>

          {/* 3. CLEANER OCEANS SUSTAINABILITY CARD */}
          <div
            onClick={() => setActiveTab('mission')}
            className="relative rounded-2xl border border-white/[0.08] hover:border-[#00F5D4]/40 bg-[#070D18] overflow-hidden p-5 shadow-xl space-y-3 cursor-pointer transition-all hover:scale-[1.01]"
            title="Launch Mission Control"
          >
            <div className="space-y-1">
              <div className="text-sm font-display font-black text-white">
                Cleaner Oceans
              </div>
              <div className="text-sm font-display font-black text-[#38BDF8]">
                Safer Coasts
              </div>
              <div className="text-sm font-display font-black text-[#00F5D4]">
                Sustainable Future
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.08] text-[9.5px] font-mono font-bold tracking-widest text-[#FFB703] uppercase">
              TECHNOLOGY FOR A HEALTHIER BLUE PLANET
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
