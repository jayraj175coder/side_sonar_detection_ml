import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Radio,
  Sparkles,
  Waves,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Maximize2,
  Play,
  Pause,
  Sliders,
  Compass,
  Cpu,
  RefreshCw,
  Anchor,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MarineSurveyHero: React.FC = () => {
  const { setActiveTab } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [sonarActive, setSonarActive] = useState(true);
  const [vesselSpeed, setVesselSpeed] = useState<number>(3.5); // knots
  const [activeModeHover, setActiveModeHover] = useState<'none' | 'manual' | 'live'>('none');
  const [animationTick, setAnimationTick] = useState(0);

  // Animation frame loop for continuous subsea motion
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        setAnimationTick((prev) => (prev + delta * (vesselSpeed / 3.5)) % 10000);
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vesselSpeed]);

  // Derived positions for ship, towfish, and marine fauna
  const time = animationTick;
  // Ship slow gentle bobbing and forward progress illusion
  const shipPitch = Math.sin(time * 1.8) * 1.5;
  const shipY = 48 + Math.sin(time * 2.2) * 2.5;

  // Towfish trailing behind on cable
  const towfishY = 175 + Math.sin(time * 1.4) * 3;
  const towfishPitch = Math.sin(time * 1.4) * 2;

  // Sea turtle graceful glide
  const turtleX = 640 - ((time * 22) % 900);
  const turtleY = 150 + Math.sin(time * 1.2) * 12;
  const turtleFlipperAngle = Math.sin(time * 3.5) * 18;

  // Manta ray gliding deep near seabed
  const mantaX = 850 - ((time * 16) % 1100);
  const mantaY = 240 + Math.sin(time * 0.9) * 8;
  const mantaWing = Math.sin(time * 2.5) * 8;

  // Sonar beam pulse phase (0 to 1)
  const beamPulse = (time * 1.5) % 1;
  const isBeamOverTarget = Math.sin(time * 1.2) > 0.3;

  return (
    <div className="space-y-10 font-sans">
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — CINEMATIC "SEE BENEATH THE SURFACE" HEADER
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="text-center max-w-4xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono font-medium rounded-full shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#00F0FF]" />
          <span>AUTONOMOUS ACOUSTIC RECONNAISSANCE // DUAL-ENGINE INGESTION</span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
          See Beneath the Surface
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mx-auto">
          AI-powered Side-Scan Sonar analysis for detecting <span className="text-[#00F0FF] font-semibold">ghost nets (ALDFG)</span>,{' '}
          <span className="text-[#38BDF8] font-semibold">underwater marine debris</span>,{' '}
          <span className="text-[#F59E0B] font-semibold">subsea pipelines</span>, and seabed anomalies.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#00F0FF]/40" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#38BDF8] font-semibold">
            Choose Your Analysis Mode
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#00F0FF]/40" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — THE TWO ELEVATED ANALYSIS MODE CARDS (MOD-01 & MOD-02)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* ── CARD 1: MANUAL ANALYSIS (MOD-01) ── */}
        <div
          onMouseEnter={() => setActiveModeHover('manual')}
          onMouseLeave={() => setActiveModeHover('none')}
          className={`relative rounded-xl bg-[#051124]/85 backdrop-blur-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl ${
            activeModeHover === 'manual'
              ? 'border-[#00F0FF] shadow-[0_0_35px_rgba(0,240,255,0.25)] scale-[1.01]'
              : 'border-[#1E3A5F]/60 hover:border-[#00F0FF]/50'
          }`}
        >
          {/* Subtle glowing ambient gradient */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#00F0FF]/10 to-transparent pointer-events-none" />

          <div className="p-7 sm:p-9 space-y-6 relative z-10">
            {/* Card Header & Badges */}
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0284C7]/30 to-[#00F0FF]/10 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <UploadCloud className="w-7 h-7 text-[#00F0FF]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#0284C7]/20 border border-[#0284C7]/50 text-[#38BDF8]">
                  MOD-01
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#032030] text-[#94A3B8] border border-[#0E4466]">
                  FILE INGESTION
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
                Manual Analysis
              </h2>
              <p className="text-[14.5px] text-[#94A3B8] leading-relaxed">
                Upload raw Side-Scan Sonar imagery and companion ping logs to localize, classify, and inspect potential underwater anomalies with AI.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3.5 pt-2 border-t border-[#1E3A5F]/50">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white flex items-center gap-2">
                    <span>SSS Image Upload</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0A2640] text-[#38BDF8] border border-[#00F0FF]/30 rounded">
                      .XTF · .JSF · .TIFF · .PNG
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#64748B]">Multi-swath waterfall tiles with automatic channel separation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">YOLOv8s Deep Marine Perception</div>
                  <p className="text-[12.5px] text-[#64748B]">11.2M parameter anchor-free neural detector optimized for acoustic backscatter</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Platt-Calibrated Confidence Scoring</div>
                  <p className="text-[12.5px] text-[#64748B]">Multi-class bounding box, ECE 0.028 benchmark & acoustic evidence breakdown</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Automated WGS84 Geotagged Coordinates</div>
                  <p className="text-[12.5px] text-[#64748B]">Slant-to-ground range conversion ($G = \sqrt{'{'}R^2 - H^2{'}'}$) & companion ping navigation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Enterprise Standardized Export</div>
                  <p className="text-[12.5px] text-[#64748B]">1-Click Google Earth KML, QGIS GeoJSON, IHO S-44 CSV & formal PDF dossiers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Footer */}
          <div className="p-7 sm:p-9 pt-0 relative z-10">
            <button
              onClick={() => setActiveTab('scan')}
              className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#00F0FF] hover:from-[#0369A1] hover:to-[#00D4AA] text-[#030914] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all cursor-pointer group"
            >
              <span>LAUNCH MANUAL UPLOAD & ANALYZE</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* ── CARD 2: LIVE ANALYSIS (MOD-02) ── */}
        <div
          onMouseEnter={() => setActiveModeHover('live')}
          onMouseLeave={() => setActiveModeHover('none')}
          className={`relative rounded-xl bg-[#051124]/85 backdrop-blur-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl ${
            activeModeHover === 'live'
              ? 'border-[#10B981] shadow-[0_0_35px_rgba(16,185,129,0.25)] scale-[1.01]'
              : 'border-[#1E3A5F]/60 hover:border-[#10B981]/50'
          }`}
        >
          {/* Subtle glowing ambient gradient */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#10B981]/10 to-transparent pointer-events-none" />

          <div className="p-7 sm:p-9 space-y-6 relative z-10">
            {/* Card Header & Badges */}
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#059669]/30 to-[#10B981]/10 border border-[#10B981]/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Radio className="w-7 h-7 text-[#10B981] animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#059669]/20 border border-[#10B981]/50 text-[#34D399]">
                  MOD-02
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#062419] text-[#10B981] border border-[#065F46] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  LIVE STREAM
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
                Live Analysis
              </h2>
              <p className="text-[14.5px] text-[#94A3B8] leading-relaxed">
                Continuously analyze live real-time sonar waterfall streams from underwater Autonomous Underwater Vehicles (AUVs) & towfish surveys.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3.5 pt-2 border-t border-[#1E3A5F]/50">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white flex items-center gap-2">
                    <span>Continuous Sonar Stream Ingestion</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#062419] text-[#34D399] border border-[#10B981]/30 rounded">
                      UDP / RTSP / SIM
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#64748B]">Real-time high-throughput acoustic packet streaming parser</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Real-Time Acoustic Waterfall Detection</div>
                  <p className="text-[12.5px] text-[#64748B]">On-the-fly sliding segmentation window with ~35.2 ms CPU edge latency</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Active Mission Monitoring & Telemetry Lock</div>
                  <p className="text-[12.5px] text-[#64748B]">Vessel track sync, heading vector, towfish layback & USBL ping-log lock</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Tactical Stream Pause & Ring Buffer</div>
                  <p className="text-[12.5px] text-[#64748B]">Low-latency 120s tactical ring-buffer inspect, rewind & frame-by-frame scrub</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-white">Real-Time Acoustic Operator Alerts</div>
                  <p className="text-[12.5px] text-[#64748B]">Immediate high-priority hazard warning, audio cues & active learning triage queue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Footer */}
          <div className="p-7 sm:p-9 pt-0 relative z-10">
            <button
              onClick={() => setActiveTab('mission')}
              className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#34D399] text-[#030914] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer group"
            >
              <span>ENTER MISSION CONTROL STREAM</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — INTERACTIVE ANIMATED MARINE RECONNAISSANCE SCENE
          SURVEY SHIP SAILING + TOW CABLE + TRAILING TOWFISH + ACOUSTIC BEAM + MARINE WILDLIFE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-xl border border-[#1E3A5F]/80 bg-[#030B17] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] max-w-6xl mx-auto">
        {/* Top Control & Telemetry Bar */}
        <div className="px-5 py-2.5 bg-[#051424]/90 backdrop-blur-md border-b border-[#1E3A5F] flex items-center justify-between flex-wrap gap-3 font-mono text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-white">
              <Anchor className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="font-bold tracking-wider">R/V SAGARIKA</span>
              <span className="text-[9.5px] text-[#38BDF8] px-1.5 py-0.2 bg-[#0284C7]/20 border border-[#00F0FF]/30 rounded">
                SURVEY SHIP
              </span>
            </div>
            <span className="text-[#334155]">|</span>
            <span>VESSEL SPEED: <strong className="text-white">{vesselSpeed.toFixed(1)} KTS</strong></span>
            <span className="text-[#334155]">|</span>
            <span>TOW CABLE: <strong className="text-white">48.2 M</strong></span>
            <span className="text-[#334155]">|</span>
            <span>TOWFISH DEPTH: <strong className="text-[#00F0FF]">24.0 M</strong> (ALTITUDE: 8.4M)</span>
            <span className="text-[#334155]">|</span>
            <span>SWATH FREQ: <strong className="text-[#10B981]">900 kHz DUAL-CHIRP</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSonarActive(!sonarActive)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                sonarActive
                  ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              BEAM: {sonarActive ? 'ACTIVE' : 'MUTED'}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded bg-[#0B2138] hover:bg-[#123150] border border-[#1E3A5F] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── THE ANIMATED OCEAN & SUBSEA CANVAS / SVG ── */}
        <div className="relative w-full h-[320px] sm:h-[380px] bg-gradient-to-b from-[#06182B] via-[#031526] to-[#010811] overflow-hidden select-none">
          <svg
            viewBox="0 0 1000 380"
            preserveAspectRatio="none"
            className="w-full h-full block"
          >
            <defs>
              {/* Sky to deep ocean water gradient */}
              <linearGradient id="ocean-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B263E" stopOpacity="0.9" />
                <stop offset="18%" stopColor="#061F33" stopOpacity="1" />
                <stop offset="45%" stopColor="#031422" stopOpacity="1" />
                <stop offset="85%" stopColor="#020B14" stopOpacity="1" />
                <stop offset="100%" stopColor="#01060B" stopOpacity="1" />
              </linearGradient>

              {/* Dynamic Sonar Fan Beam gradient */}
              <linearGradient id="sonar-beam-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#00D4AA" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.05" />
              </linearGradient>

              {/* Target Highlight Glow */}
              <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#00F0FF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </radialGradient>

              {/* Acoustic Wave Ripple Filter */}
              <filter id="water-turbulence" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="2" result="turb" />
                <feDisplacementMap in2="turb" in="SourceGraphic" scale="4" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* Ocean Water Background */}
            <rect width="1000" height="380" fill="url(#ocean-gradient)" />

            {/* Deep Bathymetric Grid & Sounding Lines */}
            <g opacity="0.12">
              <line x1="0" y1="90" x2="1000" y2="90" stroke="#00F0FF" strokeWidth="0.8" strokeDasharray="6 4" />
              <line x1="0" y1="160" x2="1000" y2="160" stroke="#00F0FF" strokeWidth="0.8" strokeDasharray="6 4" />
              <line x1="0" y1="230" x2="1000" y2="230" stroke="#00F0FF" strokeWidth="0.8" strokeDasharray="6 4" />
              <line x1="0" y1="300" x2="1000" y2="300" stroke="#00F0FF" strokeWidth="0.8" strokeDasharray="6 4" />
            </g>

            {/* Depth Watermark Labels */}
            <text x="20" y="86" fill="#38BDF8" opacity="0.4" fontSize="9" fontFamily="monospace">DEPTH: 10M</text>
            <text x="20" y="156" fill="#38BDF8" opacity="0.4" fontSize="9" fontFamily="monospace">DEPTH: 20M</text>
            <text x="20" y="226" fill="#38BDF8" opacity="0.4" fontSize="9" fontFamily="monospace">DEPTH: 30M</text>
            <text x="20" y="296" fill="#38BDF8" opacity="0.4" fontSize="9" fontFamily="monospace">DEPTH: 40M</text>

            {/* ── 1. SEABED BATHYMETRY & TERRAIN ── */}
            {/* Rocky Seafloor Bottom */}
            <path
              d="M0 320 Q 120 315, 240 330 T 480 322 T 720 335 T 1000 318 L 1000 380 L 0 380 Z"
              fill="#06121D"
              stroke="#133857"
              strokeWidth="1.5"
            />
            {/* Sediment Sand Wave Texture */}
            <path
              d="M0 335 Q 80 330, 160 340 T 320 335 T 480 342 T 640 336 T 800 345 T 1000 332 L 1000 380 L 0 380 Z"
              fill="#030A12"
              opacity="0.85"
            />

            {/* Coral reef outcrops & marine flora */}
            <g transform="translate(180, 312)" opacity="0.7">
              <path d="M0 15 Q 5 -10, 10 5 Q 15 -18, 22 2 Q 28 -8, 32 15 Z" fill="#0E4466" />
              <circle cx="12" cy="-6" r="3" fill="#10B981" opacity="0.6" />
              <circle cx="22" cy="-2" r="2.5" fill="#00F0FF" opacity="0.5" />
            </g>
            <g transform="translate(820, 310)" opacity="0.6">
              <path d="M0 18 Q 8 -12, 16 4 Q 24 -15, 30 18 Z" fill="#0E4466" />
              <circle cx="16" cy="-8" r="2.5" fill="#F59E0B" opacity="0.5" />
            </g>

            {/* ── 2. SEABED TARGET HAZARD: GHOST NET (ALDFG-01) ── */}
            <g transform="translate(480, 308)">
              {/* Entangled net mesh body on seabed */}
              <path
                d="M -35 22 Q -20 -8, 0 10 Q 25 -15, 45 15 Q 20 28, -35 22 Z"
                fill="#0F2D3C"
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="3 2"
                opacity="0.85"
              />
              {/* Trailing floating gillnet floats / buoys */}
              <circle cx="-18" cy="-2" r="3" fill="#F59E0B" stroke="#FBBF24" strokeWidth="1" />
              <line x1="-18" y1="-2" x2="-20" y2="15" stroke="#F59E0B" strokeWidth="0.8" opacity="0.7" />
              <circle cx="8" cy="-12" r="3.5" fill="#EF4444" stroke="#F87171" strokeWidth="1" />
              <line x1="8" y1="-12" x2="6" y2="10" stroke="#EF4444" strokeWidth="0.8" opacity="0.7" />
              <circle cx="32" cy="-6" r="3" fill="#F59E0B" stroke="#FBBF24" strokeWidth="1" />
              <line x1="32" y1="-6" x2="30" y2="14" stroke="#F59E0B" strokeWidth="0.8" opacity="0.7" />

              {/* Acoustic Shadow cast behind target on seabed */}
              <polygon points="45,15 140,28 120,38 -10,32" fill="#010408" opacity="0.9" />

              {/* Tactical Contact Lock Indicator */}
              <g opacity={isBeamOverTarget && sonarActive ? 1 : 0.45} className="transition-opacity duration-300">
                <rect x="-45" y="-32" width="100" height="62" fill="none" stroke="#00F0FF" strokeWidth="1.2" strokeDasharray="5 3" />
                {/* Corner reticles */}
                <path d="M -45 -22 L -45 -32 L -35 -32" stroke="#00F0FF" strokeWidth="2" fill="none" />
                <path d="M 45 -32 L 55 -32 L 55 -22" stroke="#00F0FF" strokeWidth="2" fill="none" />
                <path d="M 55 20 L 55 30 L 45 30" stroke="#00F0FF" strokeWidth="2" fill="none" />
                <path d="M -35 30 L -45 30 L -45 20" stroke="#00F0FF" strokeWidth="2" fill="none" />
                {/* Target Label */}
                <rect x="-42" y="-46" width="94" height="12" fill="#031422" stroke="#00F0FF" strokeWidth="0.8" />
                <text x="-38" y="-37" fill="#00F0FF" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  SX-T01 · GHOST NET (95.6%)
                </text>
              </g>
            </g>

            {/* ── 3. MARINE-FRIENDLY WILDLIFE (TURTLE & MANTA RAY) ── */}
            {/* Graceful Sea Turtle paddling peacefully through midwater */}
            <g transform={`translate(${turtleX}, ${turtleY})`}>
              <g transform="scale(0.85)">
                {/* Turtle Shell (Carapace) */}
                <ellipse cx="0" cy="0" rx="20" ry="14" fill="#0E4438" stroke="#10B981" strokeWidth="1.2" />
                {/* Carapace Scutes Texture */}
                <ellipse cx="-2" cy="0" rx="12" ry="8" fill="#093126" stroke="#34D399" strokeWidth="0.8" strokeDasharray="3 2" />
                {/* Head */}
                <ellipse cx="23" cy="-1" rx="6" ry="4.5" fill="#134E3F" stroke="#10B981" strokeWidth="1" />
                <circle cx="25" cy="-2.5" r="1" fill="#34D399" />
                {/* Front Flippers (with swimming rotation) */}
                <path
                  d="M 6 -8 C 12 -22, 28 -24, 30 -16 C 24 -10, 10 -4, 6 -8 Z"
                  fill="#0E4438"
                  stroke="#10B981"
                  strokeWidth="1"
                  transform={`rotate(${turtleFlipperAngle}, 6, -8)`}
                />
                <path
                  d="M 6 8 C 12 22, 28 24, 30 16 C 24 10, 10 4, 6 8 Z"
                  fill="#093126"
                  stroke="#10B981"
                  strokeWidth="1"
                  transform={`rotate(${-turtleFlipperAngle}, 6, 8)`}
                />
                {/* Rear Flippers */}
                <path d="M -16 -6 C -24 -12, -28 -8, -22 -3 Z" fill="#0E4438" />
                <path d="M -16 6 C -24 12, -28 8, -22 3 Z" fill="#093126" />
              </g>
            </g>

            {/* Deep Manta Ray gliding smoothly */}
            <g transform={`translate(${mantaX}, ${mantaY})`}>
              <g transform="scale(0.9)">
                {/* Manta Body & Wings */}
                <path
                  d={`M 0 -2 C 20 ${-22 + mantaWing}, 40 ${-28 + mantaWing}, 35 ${-18 + mantaWing} C 25 -6, 12 0, 5 8 C -5 8, -18 0, -28 ${-18 + mantaWing} C -32 ${-28 + mantaWing}, -12 ${-22 + mantaWing}, 0 -2 Z`}
                  fill="#0A2238"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  opacity="0.85"
                />
                {/* Cephalic Fins (horns) */}
                <path d="M 3 8 Q 6 14, 4 16 Q 1 12, 1 8 Z" fill="#0A2238" stroke="#38BDF8" strokeWidth="0.8" />
                <path d="M -3 8 Q -6 14, -4 16 Q -1 12, -1 8 Z" fill="#0A2238" stroke="#38BDF8" strokeWidth="0.8" />
                {/* Long Whip Tail */}
                <path d="M 0 -2 Q 2 -18, -4 -38 Q -2 -52, 2 -68" fill="none" stroke="#38BDF8" strokeWidth="0.9" opacity="0.6" />
              </g>
            </g>

            {/* Luminescent School of Tiny Fish */}
            <g opacity="0.75">
              {[
                { x: 260, y: 190 },
                { x: 275, y: 184 },
                { x: 290, y: 195 },
                { x: 305, y: 188 },
                { x: 268, y: 200 },
                { x: 285, y: 205 },
              ].map((f, i) => {
                const fishOffset = Math.sin(time * 2 + i) * 6;
                return (
                  <ellipse
                    key={i}
                    cx={f.x + fishOffset}
                    cy={f.y + Math.cos(time * 2 + i) * 3}
                    rx="4.5"
                    ry="1.8"
                    fill="#00F0FF"
                    opacity="0.6"
                  />
                );
              })}
            </g>

            {/* ── 4. TOW CABLE (EXTENDING BACKWARD FROM SHIP TO TOWFISH) ── */}
            {/* High-tensile armored tow cable catenary curve */}
            <path
              d={`M 155 ${shipY + 12} Q 280 ${(shipY + towfishY) / 2 + 18}, 420 ${towfishY + 4}`}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.8"
              opacity="0.9"
            />
            {/* Cable vibration tension markers */}
            <circle cx="280" cy={(shipY + towfishY) / 2 + 18} r="2" fill="#F59E0B" opacity="0.6" />

            {/* ── 5. TOWED SIDE-SCAN SONAR TOWFISH (AUV GLIDER) ── */}
            <g transform={`translate(420, ${towfishY}) rotate(${towfishPitch})`}>
              {/* Towfish Hull */}
              <ellipse cx="0" cy="0" rx="22" ry="7" fill="#FACC15" stroke="#EAB308" strokeWidth="1.5" />
              {/* Black tactical bands */}
              <rect x="-8" y="-6.5" width="4" height="13" fill="#1E293B" />
              <rect x="5" y="-6.5" width="4" height="13" fill="#1E293B" />
              {/* Nose acoustic dome */}
              <ellipse cx="20" cy="0" rx="4" ry="6" fill="#0369A1" stroke="#38BDF8" strokeWidth="1" />
              {/* Stabilizer tail fins */}
              <polygon points="-20,-2 -28,-11 -24,-2" fill="#CA8A04" stroke="#A16207" strokeWidth="1" />
              <polygon points="-20,2 -28,11 -24,2" fill="#CA8A04" stroke="#A16207" strokeWidth="1" />
              <polygon points="-22,0 -30,0 -24,-2" fill="#CA8A04" />
              {/* Tow Cable attachment point bridle */}
              <circle cx="0" cy="-6" r="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              {/* Blinking green telemetry LED */}
              <circle cx="16" cy="-4" r="1.5" fill="#10B981" className="animate-ping" />
              <circle cx="16" cy="-4" r="1.2" fill="#10B981" />

              {/* ── DUAL-SIDED ACOUSTIC SONAR FAN BEAM ── */}
              {sonarActive && (
                <g>
                  {/* Left (Port) Acoustic Fan Beam Cone projecting down */}
                  <polygon
                    points={`0,4 ${-90 - beamPulse * 20},${330 - towfishY} ${70 + beamPulse * 20},${330 - towfishY}`}
                    fill="url(#sonar-beam-grad)"
                    opacity="0.45"
                  />
                  {/* Right (Starboard) Acoustic Fan Beam Cone projecting down */}
                  <polygon
                    points={`0,4 ${60 + beamPulse * 15},${330 - towfishY} ${210 + beamPulse * 30},${330 - towfishY}`}
                    fill="url(#sonar-beam-grad)"
                    opacity="0.38"
                  />

                  {/* Radiating Acoustic Wave Arcs */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={35 + beamPulse * 75}
                    ry={20 + beamPulse * 55}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="1.2"
                    opacity={0.8 - beamPulse * 0.8}
                  />
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={20 + beamPulse * 60}
                    ry={12 + beamPulse * 40}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1"
                    opacity={0.9 - beamPulse * 0.85}
                  />
                </g>
              )}

              {/* Towfish Status HUD Tag */}
              <g transform="translate(-30, -22)">
                <rect x="0" y="0" width="76" height="12" fill="#030B17" stroke="#00F0FF" strokeWidth="0.8" rx="2" />
                <text x="4" y="9" fill="#00F0FF" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  SSS TOWFISH · 8.4M ALT
                </text>
              </g>
            </g>

            {/* ── 6. SURFACE WAVES & HYDROGRAPHIC SURVEY SHIP ── */}
            {/* Multi-layered Animated Ocean Waves */}
            <path
              d="M 0 54 Q 50 48, 100 54 T 200 54 T 300 54 T 400 54 T 500 54 T 600 54 T 700 54 T 800 54 T 900 54 T 1000 54 L 1000 70 L 0 70 Z"
              fill="#062238"
              opacity="0.75"
            />
            <path
              d="M 0 58 Q 60 52, 120 58 T 240 58 T 360 58 T 480 58 T 600 58 T 720 58 T 840 58 T 960 58 T 1000 58 L 1000 80 L 0 80 Z"
              fill="#031526"
            />

            {/* R/V SAGARIKA — Hydrographic Survey Vessel */}
            <g transform={`translate(90, ${shipY}) rotate(${shipPitch})`}>
              {/* Ship Wake Foam trailing behind stern */}
              <ellipse cx="-28" cy="10" rx="20" ry="4" fill="#E2E8F0" opacity="0.4" />
              <ellipse cx="-45" cy="11" rx="28" ry="3" fill="#E2E8F0" opacity="0.25" />

              {/* Ship Hull (Navy blue with crisp white upper) */}
              <path
                d="M -22 10 L 48 10 Q 68 10, 78 0 L 74 -6 L -20 -6 Z"
                fill="#0F2B48"
                stroke="#1E4D7B"
                strokeWidth="1.2"
              />
              {/* Red Waterline Stripe */}
              <line x1="-22" y1="7" x2="72" y2="7" stroke="#EF4444" strokeWidth="1.6" />

              {/* White Upper Deck Structure */}
              <polygon points="-16,-6 48,-6 42,-20 -10,-20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              {/* Bridge Cabin & Navigation Windows */}
              <polygon points="12,-20 38,-20 34,-30 16,-30" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              {/* Amber glowing bridge windows */}
              <rect x="20" y="-28" width="5" height="5" fill="#F59E0B" />
              <rect x="27" y="-28" width="5" height="5" fill="#F59E0B" />

              {/* Radar Mast & Communication Domes */}
              <line x1="25" y1="-30" x2="25" y2="-44" stroke="#64748B" strokeWidth="1.5" />
              <line x1="20" y1="-38" x2="30" y2="-38" stroke="#64748B" strokeWidth="1" />
              {/* Rotating Radar Scanner */}
              <ellipse cx="25" cy="-44" rx="5" ry="1.5" fill="#38BDF8" className="animate-spin" />
              {/* Satellite Dome */}
              <circle cx="2" cy="-24" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />

              {/* Stern A-Frame Crane (Towing Winch) */}
              <polygon points="-18,-6 -14,-22 -12,-22 -14,-6" fill="#F59E0B" />
              <polygon points="-24,-6 -14,-22 -12,-22 -20,-6" fill="#D97706" />
              {/* Winch Pulley Block */}
              <circle cx="-13" cy="-22" r="2.5" fill="#475569" />

              {/* Ship Name Decal */}
              <text x="0" y="2" fill="#94A3B8" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                R/V SAGARIKA
              </text>
            </g>
          </svg>

          {/* Floating High-Tech Radar Ring Badge */}
          <div className="absolute top-3 right-4 bg-[#030B17]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#00F0FF]/30 font-mono text-[10.5px] text-[#00F0FF] flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>USBL TRANSDUCER LOCK: STABLE</span>
          </div>

          {/* Bottom Ambient Legend */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#34D399]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Marine-Safe Acoustics (Passive High-Frequency Chirp)
              </span>
              <span className="hidden sm:inline text-[#334155]">|</span>
              <span className="hidden sm:inline text-[#38BDF8]">
                Protected Benthic Flora & Fauna
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#00F0FF]">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Ray-Traced Shadow Math</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
