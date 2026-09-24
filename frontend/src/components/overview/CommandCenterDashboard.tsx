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
  Waves,
  Droplets,
  Thermometer,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SonarxLogoIcon } from '../common/SonarxLogo';

export const CommandCenterDashboard: React.FC = () => {
  const { setActiveTab } = useApp();

  // Waterfall stream simulation state
  const [waterfallOffset, setWaterfallOffset] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaterfallOffset((prev) => (prev + 1) % 200);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 font-sans select-none text-slate-100 pb-10">
      {/* ═══════════════════════════════════════════════════════════════════
          TOP MASTER GRID: MAIN OPERATIONS (LEFT) + TACTICAL WIDGETS (RIGHT)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* ── LEFT / MAIN CONTENT AREA (col-span-12 xl:col-span-9) ───────── */}
        <div className="xl:col-span-9 space-y-4">
          
          {/* 1. HERO BANNER: 3D SUBSEA SURVEY & PRODUCT INTRODUCTION */}
          <div className="relative rounded-2xl border border-white/[0.1] bg-[#050A14] overflow-hidden shadow-2xl p-5 sm:p-6 min-h-[350px] flex flex-col justify-between">
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-35 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00F5D4]/20 via-[#071324]/80 to-[#040810]" />

            {/* Realistic Technical 3D Hydrographic Survey Visualization SVG on the right */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[62%] pointer-events-none overflow-hidden opacity-90">
              <svg viewBox="0 0 650 380" className="w-full h-full object-cover">
                <defs>
                  {/* Conical Acoustic Fan Beams */}
                  <linearGradient id="beamPortHero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#0284C7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.08" />
                  </linearGradient>
                  <linearGradient id="beamStbdHero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#0284C7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.08" />
                  </linearGradient>
                  {/* Seafloor Gradient */}
                  <linearGradient id="seabedGradHero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#081E38" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#030811" stopOpacity="1" />
                  </linearGradient>

                </defs>

                {/* Depth Strata Reference Lines & Labels (Right Side) */}
                <line x1="240" y1="45" x2="630" y2="45" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.4" />
                <text x="635" y="44" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="end">0 m</text>
                <text x="635" y="53" fill="#64748B" fontSize="7" fontFamily="monospace" textAnchor="end">SURFACE</text>

                <line x1="240" y1="120" x2="630" y2="120" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x="635" y="123" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="end">15 m</text>

                <line x1="240" y1="200" x2="630" y2="200" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x="635" y="203" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="end">30 m</text>

                <line x1="240" y1="280" x2="630" y2="280" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x="635" y="280" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="end">45 m</text>
                <text x="635" y="289" fill="#64748B" fontSize="7" fontFamily="monospace" textAnchor="end">SEABED</text>

                {/* Surface Survey Vessel: RV-SAGAR with Oceanic Swell Animation */}
                <g transform="translate(370, 24)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,0; 0,-2.5; 0,0"
                      dur="4.5s"
                      repeatCount="indefinite"
                    />
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 56 18; 0.5 56 18; -0.35 56 18; 0 56 18"
                      dur="6s"
                      additive="sum"
                      repeatCount="indefinite"
                    />

                    {/* Vessel Hull */}
                    <path d="M 0,22 L 8,12 L 24,12 L 28,6 L 46,6 L 50,12 L 95,12 L 112,22 L 126,22 L 118,29 L 12,29 Z" fill="#E2E8F0" opacity="0.9" />
                    <rect x="32" y="2" width="10" height="5" fill="#00F5D4" opacity="0.9" />
                    <line x1="37" y1="-2" x2="37" y2="2" stroke="#FFFFFF" strokeWidth="1.5" />
                    
                    {/* Rotating Radar Scanner Antenna */}
                    <g transform="translate(37, -2)">
                      <circle cx="0" cy="0" r="2.5" fill="#FFB703" />
                      <line x1="0" y1="0" x2="11" y2="-2" stroke="#FFB703" strokeWidth="1.4" strokeLinecap="round">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 0 0"
                          to="360 0 0"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </line>
                      <circle cx="0" cy="0" r="7" fill="none" stroke="#FFB703" strokeWidth="0.5" opacity="0.35" />
                    </g>

                    {/* Vessel Name Callout */}
                    <rect x="58" y="16" width="46" height="12" rx="2" fill="#050B14" stroke="#00F5D4" strokeWidth="0.6" opacity="0.8" />
                    <text x="62" y="25" fill="#00F5D4" fontSize="7.5" fontWeight="bold" fontFamily="monospace">RV-SAGAR</text>
                  </g>
                </g>

                {/* Acoustic Conical Radiating Sonar Beams projecting from Vessel Keel */}
                <polygon points="420,53 230,340 420,340" fill="url(#beamPortHero)">
                  <animate attributeName="opacity" values="0.75; 0.95; 0.75" dur="3.2s" repeatCount="indefinite" />
                </polygon>
                <polygon points="420,53 420,340 610,340" fill="url(#beamStbdHero)">
                  <animate attributeName="opacity" values="0.75; 0.95; 0.75" dur="3.2s" begin="0.4s" repeatCount="indefinite" />
                </polygon>

                {/* Downward Propagating Acoustic Ping Wavefronts (Conical Radiating Arcs) */}
                <g>
                  {/* Ping Arc 1 */}
                  <path fill="none" stroke="#00F5D4" strokeLinecap="round">
                    <animate
                      attributeName="d"
                      values="M 405,68 Q 420,80 435,68; M 368,135 Q 420,165 472,135; M 315,220 Q 420,265 525,220; M 250,310 Q 420,370 590,310"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9; 0.7; 0.4; 0"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values="2.2; 1.6; 1.1; 0.5"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Ping Arc 2 (offset) */}
                  <path fill="none" stroke="#38BDF8" strokeLinecap="round">
                    <animate
                      attributeName="d"
                      values="M 405,68 Q 420,80 435,68; M 368,135 Q 420,165 472,135; M 315,220 Q 420,265 525,220; M 250,310 Q 420,370 590,310"
                      dur="2.5s"
                      begin="0.83s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9; 0.7; 0.4; 0"
                      dur="2.5s"
                      begin="0.83s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values="2.2; 1.6; 1.1; 0.5"
                      dur="2.5s"
                      begin="0.83s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Ping Arc 3 (offset) */}
                  <path fill="none" stroke="#00F5D4" strokeLinecap="round">
                    <animate
                      attributeName="d"
                      values="M 405,68 Q 420,80 435,68; M 368,135 Q 420,165 472,135; M 315,220 Q 420,265 525,220; M 250,310 Q 420,370 590,310"
                      dur="2.5s"
                      begin="1.66s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9; 0.7; 0.4; 0"
                      dur="2.5s"
                      begin="1.66s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values="2.2; 1.6; 1.1; 0.5"
                      dur="2.5s"
                      begin="1.66s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>

                {/* Center Nadir Acoustic Line with Continuous Downward Sounding */}
                <line
                  x1="420"
                  y1="53"
                  x2="420"
                  y2="340"
                  stroke="#00F5D4"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                  opacity="0.85"
                >
                  <animate attributeName="stroke-dashoffset" values="0; -16" dur="0.8s" repeatCount="indefinite" />
                </line>

                {/* Seabed Bathymetric Strata Layer */}
                <path d="M 180,335 Q 320,325 450,335 T 650,330 L 650,380 L 180,380 Z" fill="url(#seabedGradHero)" />
                <path d="M 180,335 Q 320,325 450,335 T 650,330" fill="none" stroke="#00F5D4" strokeWidth="1.2" opacity="0.7" />

                {/* Perspective Seabed Inspection Grid */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line
                    key={`hero-grid-${i}`}
                    x1={200 - i * 15}
                    y1={290 + i * 14}
                    x2={640 + i * 10}
                    y2={290 + i * 14}
                    stroke="#00F5D4"
                    strokeWidth="0.7"
                    opacity={0.12 + i * 0.05}
                  />
                ))}

                {/* Benthic Current Micro-Drift Particles */}
                <circle cx="280" cy="330" r="1.2" fill="#00F5D4">
                  <animate attributeName="cx" values="280; 335; 280" dur="8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3; 0.85; 0.3" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle cx="390" cy="315" r="1.4" fill="#38BDF8">
                  <animate attributeName="cx" values="390; 450; 390" dur="9.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3; 0.8; 0.3" dur="9.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="510" cy="325" r="1.1" fill="#FFB703">
                  <animate attributeName="cx" values="510; 565; 510" dur="7.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3; 0.85; 0.3" dur="7.5s" repeatCount="indefinite" />
                </circle>

                {/* ── Annotated Bounding Boxes on Seabed ── */}
                {/* 1. Target: Pipeline (Red Box) with Corner Targeting Reticles */}
                <g transform="translate(480, 260)">
                  <rect x="-18" y="-12" width="36" height="24" rx="2" fill="rgba(239, 68, 68, 0.15)" stroke="#EF4444" strokeWidth="1.5">
                    <animate attributeName="stroke-opacity" values="0.65; 1; 0.65" dur="1.8s" repeatCount="indefinite" />
                  </rect>
                  {/* Corner Targeting Brackets */}
                  <path d="M -21,-8 L -21,-14 L -15,-14 M 15,-14 L 21,-14 L 21,-8 M 21,8 L 21,14 L 15,14 M -15,14 L -21,14 L -21,8" fill="none" stroke="#EF4444" strokeWidth="1.2">
                    <animate attributeName="opacity" values="0.4; 1; 0.4" dur="1.8s" repeatCount="indefinite" />
                  </path>
                  <rect x="-18" y="-23" width="36" height="11" rx="1" fill="#EF4444" />
                  <text x="0" y="-15" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Pipeline</text>
                  <text x="0" y="-7" fill="#EF4444" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">87.6%</text>
                  <line x1="-12" y1="2" x2="12" y2="2" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* 2. Target: Ghost Net (Teal/Green Box) with Marching Dashes */}
                <g transform="translate(370, 310)">
                  <rect
                    x="-20"
                    y="-16"
                    width="40"
                    height="32"
                    rx="2"
                    fill="rgba(0, 245, 212, 0.12)"
                    stroke="#00F5D4"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  >
                    <animate attributeName="stroke-dashoffset" values="0; 12" dur="1.4s" repeatCount="indefinite" />
                  </rect>
                  <rect x="-20" y="-28" width="40" height="12" rx="1" fill="#00F5D4" />
                  <text x="0" y="-20" fill="#05070B" fontSize="7" fontWeight="900" fontFamily="monospace" textAnchor="middle">Ghost Net</text>
                  <text x="0" y="-12" fill="#00F5D4" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">94.2%</text>
                  {/* Net mesh pattern inside */}
                  <path d="M -12,-8 L 12,8 M -12,8 L 12,-8" stroke="#00F5D4" strokeWidth="0.8" opacity="0.6" />
                </g>

                {/* 3. Target: Marine Debris (Amber/Yellow Box) with Expanding Sonar Ping Echo */}
                <g transform="translate(450, 335)">
                  <rect x="-18" y="-14" width="36" height="28" rx="2" fill="rgba(255, 183, 3, 0.15)" stroke="#FFB703" strokeWidth="1.5" />
                  <rect x="-18" y="-25" width="44" height="11" rx="1" fill="#FFB703" />
                  <text x="4" y="-17" fill="#05070B" fontSize="6.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">Marine Debris</text>
                  <text x="0" y="-7" fill="#FFB703" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">76.3%</text>
                  <circle cx="0" cy="2" r="3.5" fill="#FFB703" />
                  <circle cx="0" cy="2" r="4" fill="none" stroke="#FFB703" strokeWidth="1">
                    <animate attributeName="r" values="3; 14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9; 0" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>

                {/* 4. Target: Seafloor Anomaly (Cyan Dashed Box) with Acoustic Shimmer */}
                <g transform="translate(535, 305)">
                  <rect
                    x="-18"
                    y="-14"
                    width="36"
                    height="28"
                    rx="2"
                    fill="rgba(56, 189, 248, 0.1)"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                  >
                    <animate attributeName="stroke-dashoffset" values="0; 12" dur="2.2s" repeatCount="indefinite" />
                  </rect>
                  <rect x="-22" y="-25" width="48" height="11" rx="1" fill="#0284C7" />
                  <text x="2" y="-17" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Seafloor Anomaly</text>
                  <text x="0" y="-7" fill="#38BDF8" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">68.1%</text>
                  <ellipse cx="0" cy="2" rx="7" ry="4" fill="#38BDF8">
                    <animate attributeName="opacity" values="0.3; 0.7; 0.3" dur="2.5s" repeatCount="indefinite" />
                  </ellipse>
                </g>

                {/* Top-Right Mission Telemetry Box with Active Pulse Dot */}
                <g transform="translate(470, 30)">
                  <rect x="0" y="0" width="160" height="52" rx="4" fill="#050B14" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8" opacity="0.9" />
                  <circle cx="148" cy="14" r="2.5" fill="#00F5D4" />
                  <circle cx="148" cy="14" r="5" fill="none" stroke="#00F5D4" strokeWidth="0.8">
                    <animate attributeName="r" values="3; 7; 3" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9; 0.1; 0.9" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <text x="10" y="14" fill="#94A3B8" fontSize="7.5" fontFamily="monospace">MISSION: <tspan fill="#FFFFFF" fontWeight="bold">MX-026</tspan></text>
                  <text x="10" y="25" fill="#94A3B8" fontSize="7.5" fontFamily="monospace">SECTOR:  <tspan fill="#FFFFFF" fontWeight="bold">ARABIAN SEA</tspan></text>
                  <text x="10" y="36" fill="#94A3B8" fontSize="7.5" fontFamily="monospace">AUV:     <tspan fill="#00F5D4" fontWeight="bold">AUV-04</tspan></text>
                  <text x="10" y="47" fill="#FFB703" fontSize="7.5" fontWeight="bold" fontFamily="monospace">IHO S-44 ORDER 1A COMPLIANT</text>
                </g>
              </svg>
            </div>

            {/* Left Content Area: Title, Subtitle, CTAs */}
            <div className="relative z-10 max-w-lg space-y-3">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono font-bold text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="tracking-widest uppercase text-[10.5px]">AUTONOMOUS ACOUSTIC RECONNAISSANCE</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
                See Beneath <br />
                the <span className="bg-gradient-to-r from-[#00F5D4] to-[#38BDF8] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,245,212,0.4)]">Surface</span>
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-md">
                AI-powered Side-Scan Sonar analysis for detecting ghost nets (ALDFG), underwater marine debris, subsea pipelines, and seabed anomalies.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-1 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveTab('scan')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-mono font-black text-xs transition-all cursor-pointer shadow-lg shadow-[#FFB703]/25 active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-[#05070B]" />
                  <span>UPLOAD SONAR SCAN &rarr;</span>
                </button>

                <button
                  onClick={() => setActiveTab('mission')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09162A]/90 hover:bg-[#0D1F38] border border-[#38BDF8]/40 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 text-[#38BDF8] fill-[#38BDF8]" />
                  <span>WATCH DEMO</span>
                </button>
              </div>
            </div>

            {/* Bottom Process Step Strip with Circled Numbers */}
            <div className="relative z-10 pt-3 border-t border-white/[0.08] flex items-center gap-2 sm:gap-3 text-[10.5px] font-mono flex-wrap">
              {[
                { num: '01', label: 'DETECT' },
                { num: '02', label: 'VERIFY' },
                { num: '03', label: 'LOCALIZE' },
                { num: '04', label: 'TRACK' },
                { num: '05', label: 'REPORT' },
              ].map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full border border-cyan-400/60 bg-cyan-950/60 text-[#00F5D4] font-bold text-[9px] flex items-center justify-center">
                      {s.num}
                    </span>
                    <span className={idx === 0 || idx === 4 ? 'text-white font-bold' : 'text-slate-400'}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 4 && <span className="text-slate-600 text-xs">&rarr;</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 2. REAL MODEL PERFORMANCE METRICS STRIP (5 CARDS WITH SPARKLINES) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Tile 1: SSS Tiles Analyzed */}
            <div
              onClick={() => setActiveTab('scan')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-[#FFB703]/50 bg-[#070D18] flex items-center gap-3 shadow-md cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
              title="View Dataset Telemetry"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FFB703]/15 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703] shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-mono font-black text-white">5,205</div>
                <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold truncate">
                  SSS TILES ANALYZED
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB703]/50" />
            </div>

            {/* Tile 2: mAP@0.5 with Cyan Sparkline */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-[#00F5D4]/50 bg-[#070D18] flex items-center justify-between gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
              title="View mAP Benchmark"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00F5D4] shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-mono font-black text-[#00F5D4]">74.09%</div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                    mAP@0.5
                  </div>
                </div>
              </div>
              {/* Cyan Sparkline Curve */}
              <div className="w-14 h-7 shrink-0">
                <svg viewBox="0 0 60 25" className="w-full h-full">
                  <path
                    d="M 2,20 Q 15,18 28,14 T 45,8 T 58,4"
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="58" cy="4" r="2.5" fill="#00F5D4" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F5D4]/50" />
            </div>

            {/* Tile 3: Precision with Green Sparkline */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-emerald-400/50 bg-[#070D18] flex items-center justify-between gap-2 shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
              title="View Model Precision"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-mono font-black text-white">77.73%</div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                    PRECISION
                  </div>
                </div>
              </div>
              {/* Green Sparkline Curve */}
              <div className="w-14 h-7 shrink-0">
                <svg viewBox="0 0 60 25" className="w-full h-full">
                  <path
                    d="M 2,21 Q 16,14 30,16 T 46,9 T 58,3"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="58" cy="3" r="2.5" fill="#10B981" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400/60" />
            </div>

            {/* Tile 4: Recall with Yellow Sparkline */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-[#FFB703]/50 bg-[#070D18] flex items-center justify-between gap-2 shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
              title="View Model Recall"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#FFB703]/15 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703] shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-mono font-black text-white">74.61%</div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                    RECALL
                  </div>
                </div>
              </div>
              {/* Yellow Sparkline Curve */}
              <div className="w-14 h-7 shrink-0">
                <svg viewBox="0 0 60 25" className="w-full h-full">
                  <path
                    d="M 2,19 Q 18,22 32,15 T 48,11 T 58,6"
                    fill="none"
                    stroke="#FFB703"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="58" cy="6" r="2.5" fill="#FFB703" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB703]/60" />
            </div>

            {/* Tile 5: ONNX Inference */}
            <div
              onClick={() => setActiveTab('model')}
              className="p-3.5 rounded-xl border border-white/[0.08] hover:border-cyan-400/50 bg-[#070D18] flex items-center gap-3 shadow-md relative overflow-hidden col-span-2 sm:col-span-1 cursor-pointer transition-all hover:scale-[1.01]"
              title="View Edge Inference Latency"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-cyan-300">14.2 ms</div>
                <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                  ONNX INFERENCE
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400/60" />
            </div>
          </div>

          {/* 3. DUAL OPERATIONAL CARDS: SONAR ANALYSIS & MISSION OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card A: SONAR ANALYSIS (Detection -> Verification -> Classification) */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#070D18] shadow-xl space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <SonarxLogoIcon size={18} animated={false} />
                    <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                      SONAR ANALYSIS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      Detection &rarr; Verification &rarr; Classification
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="text-[11px] font-mono text-[#00F5D4] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 5-Step Visual Inspection Thumbnails */}
                <div className="grid grid-cols-5 gap-2 pt-3">
                  {/* Step 1: Original Sonar */}
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block truncate">
                      1 ORIGINAL SONAR
                    </span>
                    <div className="aspect-square rounded-lg border border-white/[0.1] bg-black overflow-hidden relative group">
                      <img
                        src="/dashboard/pipeline_orig.png"
                        alt="Original Sonar"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Step 2: Enhanced */}
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block truncate">
                      2 ENHANCED
                    </span>
                    <div className="aspect-square rounded-lg border border-white/[0.1] bg-black overflow-hidden relative group">
                      <img
                        src="/dashboard/pipeline_enhanced.png"
                        alt="Enhanced Sonar"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Step 3: AI Detection */}
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block truncate">
                      3 AI DETECTION
                    </span>
                    <div className="aspect-square rounded-lg border border-red-500/50 bg-black overflow-hidden relative group">
                      <img
                        src="/dashboard/pipeline_detect.png"
                        alt="AI Detection"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className="absolute top-1 left-1 text-[7px] font-mono font-bold bg-red-600 text-white px-1 rounded">
                        Pipeline 87.6%
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Shadow Analysis */}
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block truncate">
                      4 SHADOW ANALYSIS
                    </span>
                    <div className="aspect-square rounded-lg border border-white/[0.1] bg-black overflow-hidden relative group">
                      <img
                        src="/dashboard/pipeline_shadow.png"
                        alt="Shadow Analysis"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Step 5: Final Result */}
                  <div className="space-y-1 text-center">
                    <span className="text-[8px] font-mono text-slate-400 uppercase block truncate">
                      5 FINAL RESULT
                    </span>
                    <div className="aspect-square rounded-lg border border-red-500/30 bg-[#160D12] p-1.5 flex flex-col items-center justify-center text-center">
                      <span className="text-[8.5px] font-mono font-bold text-red-300 block leading-tight">
                        Pipeline Hazard
                      </span>
                      <span className="mt-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[7px] font-mono font-bold">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="pt-2 border-t border-white/[0.06] grid grid-cols-5 text-center text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block">Confidence</span>
                  <strong className="text-white text-[11px]">87.6%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Shadow Ratio</span>
                  <strong className="text-white text-[11px]">0.82</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Estimated Height</span>
                  <strong className="text-white text-[11px]">1.62 m</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Depth</span>
                  <strong className="text-white text-[11px]">38.1 m</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Status</span>
                  <strong className="text-emerald-400 text-[11px]">VERIFIED</strong>
                </div>
              </div>
            </div>

            {/* Card B: MISSION OVERVIEW (Tactical Nautical Map) */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#070D18] shadow-xl space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#00F5D4]" />
                  <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                    MISSION OVERVIEW
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-[11px] font-mono text-[#00F5D4] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View Map</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Tactical Nautical Map Graphic */}
              <div
                onClick={() => setActiveTab('map')}
                className="relative h-44 rounded-xl border border-white/[0.1] bg-[#040810] overflow-hidden cursor-pointer group"
              >
                {/* Coordinate grid dots */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
                  {/* Arabian Sea water label */}
                  <text x="35" y="30" fill="#475569" fontSize="9" fontFamily="monospace">Arabian Sea</text>

                  {/* Indian Coast outline & landmass */}
                  <path
                    d="M 245,0 Q 225,60 215,100 T 235,180 L 320,180 L 320,0 Z"
                    fill="#08101E"
                    stroke="#1E293B"
                    strokeWidth="1"
                  />
                  <text x="245" y="30" fill="#64748B" fontSize="8" fontFamily="monospace">INDIAN</text>
                  <text x="245" y="40" fill="#64748B" fontSize="8" fontFamily="monospace">COAST</text>

                  {/* Restricted Area Box (Red Dashed) */}
                  <rect
                    x="225"
                    y="105"
                    width="38"
                    height="32"
                    fill="rgba(239, 68, 68, 0.12)"
                    stroke="#EF4444"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />

                  {/* Survey Trackline (Yellow Dashed Curve) */}
                  <path
                    d="M 50,145 Q 90,135 125,105 T 185,75 T 215,95 T 215,140"
                    fill="none"
                    stroke="#FFB703"
                    strokeWidth="1.8"
                    strokeDasharray="4,3"
                  />

                  {/* Target 1: AUV position (Cyan) */}
                  <circle cx="215" cy="75" r="4.5" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="1.2" />
                  <circle cx="215" cy="75" r="8" fill="none" stroke="#00F5D4" strokeWidth="0.8" opacity="0.6" className="animate-ping" />

                  {/* Position Uncertainty Radius Overlays (±r meters: Ray Bending & Towfish Layback) */}
                  {/* Target 2: Verified Target (Green) with ±6.8m TPU buffer */}
                  <circle cx="125" cy="105" r="11" fill="rgba(16, 185, 129, 0.12)" stroke="#10B981" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="125" cy="105" r="3.5" fill="#10B981" />

                  {/* Target 3: High-risk Target (Red) with ±8.2m TPU buffer */}
                  <circle cx="185" cy="115" r="13" fill="rgba(239, 68, 68, 0.14)" stroke="#EF4444" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="185" cy="115" r="3.5" fill="#EF4444" />

                  {/* Target 4: Medium-risk Target (Amber) with ±8.9m TPU buffer */}
                  <circle cx="185" cy="75" r="12" fill="rgba(245, 158, 11, 0.12)" stroke="#FFB703" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="185" cy="75" r="3.5" fill="#FFB703" />

                  {/* Target 5: Cyan waypoint with ±5.4m buffer */}
                  <circle cx="215" cy="140" r="10" fill="rgba(0, 245, 212, 0.10)" stroke="#00F5D4" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="215" cy="140" r="3.5" fill="#00F5D4" />
                </svg>

                {/* Map Mini Legend */}
                <div className="absolute bottom-2 left-2 bg-[#050A14]/90 border border-white/[0.1] rounded-lg p-2 text-[8px] font-mono space-y-0.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-0.5 bg-[#FFB703]" />
                    <span>Survey Track</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
                    <span>AUV position</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Verified Targets</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>High-risk Targets</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Medium-risk Targets</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span>Restricted Zone</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 pt-0.5 border-t border-white/[0.08]">
                    <span className="w-2 h-2 rounded-full border border-dashed border-[#00F5D4] bg-[#00F5D4]/20" />
                    <span className="text-[#00F5D4] font-bold">±r TPU Buffer</span>
                  </div>
                </div>

                {/* Scale bar (0 5 10 km) */}
                <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400 bg-black/75 px-1.5 py-0.5 rounded border border-white/[0.1]">
                  0 &nbsp; 5 &nbsp; 10 km
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN: TACTICAL WIDGETS (col-span-12 xl:col-span-3) ─── */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* 1. RECENT DETECTIONS PANEL */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#070D18] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00F5D4]" />
                <h3 className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                  RECENT DETECTIONS
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('mission')}
                className="text-[11px] font-mono text-[#00F5D4] hover:underline cursor-pointer flex items-center gap-0.5"
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
                  coords: '18.9217° N, 72.8214° E',
                  depth: '42.6 m',
                  conf: '94.2%',
                  time: '2 min ago',
                  severity: 'HIGH',
                  badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                  thumb: '/dashboard/thumb_ghost_net.png',
                },
                {
                  id: '#013',
                  name: 'Pipeline Hazard',
                  coords: '18.9341° N, 72.8023° E',
                  depth: '38.1 m',
                  conf: '87.6%',
                  time: '6 min ago',
                  severity: 'HIGH',
                  badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                  thumb: '/dashboard/thumb_pipeline.png',
                },
                {
                  id: '#012',
                  name: 'Marine Debris',
                  coords: '18.9175° N, 72.8461° E',
                  depth: '51.4 m',
                  conf: '76.3%',
                  time: '12 min ago',
                  severity: 'MED',
                  badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  thumb: '/dashboard/thumb_debris.png',
                },
                {
                  id: '#011',
                  name: 'Seafloor Anomaly',
                  coords: '18.9024° N, 72.8891° E',
                  depth: '63.2 m',
                  conf: '68.1%',
                  time: '18 min ago',
                  severity: 'MED',
                  badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                  thumb: '/dashboard/thumb_anomaly.png',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('mission')}
                  className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-[#FFB703]/40 flex items-center justify-between gap-2.5 transition cursor-pointer group"
                  title="Open Target in Mission Control"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Thumbnail Image */}
                    <div className="w-10 h-10 rounded-lg bg-black border border-white/[0.1] overflow-hidden shrink-0">
                      <img
                        src={item.thumb}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">{item.id}</span>
                        <span className="text-xs font-sans font-bold text-white truncate group-hover:text-[#FFB703] transition">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400">{item.coords}</div>
                      <div className="text-[9px] text-slate-500">{item.depth}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border block ${item.badgeColor}`}>
                      {item.conf}
                    </span>
                    <span className="text-[8px] text-red-400 font-bold block text-right mt-0.5">{item.severity}</span>
                    <span className="text-[8px] text-slate-500 block text-right">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. LIVE SONAR FEED WIDGET */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#070D18] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00F5D4]" />
                <h3 className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                  LIVE SONAR FEED
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Scrolling Waterfall Viewport */}
            <div className="relative rounded-xl border border-white/[0.1] bg-[#040810] h-[175px] overflow-hidden group">
              {/* Waterfall Texture */}
              <div
                className="absolute inset-0 opacity-85"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #050B14, #050B14 2px, #0B192E 2px, #0B192E 4px)`,
                  transform: `translateY(${waterfallOffset}px)`,
                }}
              />

              {/* Central Nadir Gap */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-[#020409] border-x border-white/[0.1] flex items-center justify-center">
                <span className="w-0.5 h-full bg-[#00F5D4]/40" />
              </div>

              {/* Waterfall Bounding Box Overlay */}
              <div className="absolute top-10 left-[26%] border border-cyan-400 bg-cyan-400/15 p-1 rounded shadow-sm">
                <span className="text-[8px] font-mono font-bold text-cyan-300 block leading-none">
                  #014 NET 94.2%
                </span>
                <div className="w-12 h-8 mt-0.5 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:4px_4px]" />
              </div>

              {/* 900 kHz Frequency Tag (Top-Right) */}
              <div className="absolute top-2 right-2 text-[9px] font-mono font-bold text-slate-300 bg-black/70 px-1.5 py-0.5 rounded border border-white/[0.1]">
                900 kHz
              </div>

              {/* Sweep Line */}
              <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
            </div>

            {/* Bottom Status Telemetry */}
            <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 px-1">
              <span className="text-[#FFB703] font-bold">AUV-04</span>
              <span>Frame 081 / 128</span>
              <span className="text-emerald-400 font-bold">14.2 ms</span>
            </div>
          </div>

          {/* 3. ENVIRONMENT & MISSION METRICS */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#070D18] shadow-xl space-y-2.5">
            <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
              <Layers className="w-4 h-4 text-[#00F5D4]" />
              <h3 className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                ENVIRONMENT &amp; MISSION
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-0.5">
                <Waves className="w-3.5 h-3.5 mx-auto text-[#00F5D4]" />
                <span className="text-[8px] text-slate-500 uppercase block">Sea State</span>
                <strong className="text-[10px] text-white block">Calm (0.8 m)</strong>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-0.5">
                <Droplets className="w-3.5 h-3.5 mx-auto text-[#38BDF8]" />
                <span className="text-[8px] text-slate-500 uppercase block">Water Depth</span>
                <strong className="text-[10px] text-white block">42 - 68 m</strong>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-0.5">
                <Thermometer className="w-3.5 h-3.5 mx-auto text-[#FFB703]" />
                <span className="text-[8px] text-slate-500 uppercase block">Temperature</span>
                <strong className="text-[10px] text-white block">28.1 °C</strong>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-0.5">
                <FlaskConical className="w-3.5 h-3.5 mx-auto text-emerald-400" />
                <span className="text-[8px] text-slate-500 uppercase block">Salinity</span>
                <strong className="text-[10px] text-white block">35.1 PSU</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CommandCenterDashboard;
