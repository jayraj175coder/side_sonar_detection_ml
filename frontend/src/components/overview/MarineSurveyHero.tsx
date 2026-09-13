import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Eye,
  Info,
  Volume2,
  VolumeX,
  Target,
  ChevronRight,
  X,
  Fish,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type PaletteMode = 'cobalt' | 'emerald' | 'amber' | 'grayscale';
type ViewMode = 'ecosystem' | 'waterfall';

interface SelectedEntity {
  type: 'ship' | 'towfish' | 'turtle' | 'dolphins' | 'manta' | 'ghostnet' | 'pipeline';
  title: string;
  badge: string;
  specs: { label: string; value: string }[];
  description: string;
  ecoNote?: string;
}

export const MarineSurveyHero: React.FC = () => {
  const { setActiveTab } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [sonarActive, setSonarActive] = useState(true);
  const [vesselSpeed, setVesselSpeed] = useState<number>(3.5); // knots: 1.5, 3.5, 5.5
  const [palette, setPalette] = useState<PaletteMode>('cobalt');
  const [viewMode, setViewMode] = useState<ViewMode>('ecosystem');
  const [activeModeHover, setActiveModeHover] = useState<'none' | 'manual' | 'live'>('none');
  const [animationTick, setAnimationTick] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [manualPingTrigger, setManualPingTrigger] = useState<number | null>(null);

  // 60fps smooth simulation timer
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        setAnimationTick((prev) => (prev + delta * (vesselSpeed / 3.5)) % 100000);
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, vesselSpeed]);

  // Color theme mapping for the 4 acoustic palettes
  const colors = useMemo(() => {
    switch (palette) {
      case 'emerald':
        return {
          primary: '#10B981',
          accent: '#34D399',
          glow: 'rgba(16, 185, 129, 0.4)',
          beam1: 'rgba(16, 185, 129, 0.45)',
          beam2: 'rgba(52, 211, 153, 0.12)',
          water1: '#041F17',
          water2: '#02120E',
          water3: '#010A07',
          sky1: '#092B21',
          sky2: '#03140F',
          highlight: '#6EE7B7',
        };
      case 'amber':
        return {
          primary: '#F59E0B',
          accent: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.4)',
          beam1: 'rgba(245, 158, 11, 0.45)',
          beam2: 'rgba(251, 191, 36, 0.12)',
          water1: '#211504',
          water2: '#130C02',
          water3: '#090501',
          sky1: '#261805',
          sky2: '#120B02',
          highlight: '#FDE68A',
        };
      case 'grayscale':
        return {
          primary: '#E2E8F0',
          accent: '#94A3B8',
          glow: 'rgba(226, 232, 240, 0.3)',
          beam1: 'rgba(226, 232, 240, 0.35)',
          beam2: 'rgba(148, 163, 184, 0.1)',
          water1: '#14181E',
          water2: '#0C0E12',
          water3: '#050608',
          sky1: '#1C212A',
          sky2: '#0E1116',
          highlight: '#FFFFFF',
        };
      case 'cobalt':
      default:
        return {
          primary: '#00F0FF',
          accent: '#38BDF8',
          glow: 'rgba(0, 240, 255, 0.4)',
          beam1: 'rgba(0, 240, 255, 0.45)',
          beam2: 'rgba(56, 189, 248, 0.12)',
          water1: '#072038',
          water2: '#031424',
          water3: '#010912',
          sky1: '#0C2A48',
          sky2: '#041525',
          highlight: '#7DD3FC',
        };
    }
  }, [palette]);

  // Derived positions
  const time = animationTick;

  // Ship cruises smoothly across the surface (cycles 0 -> 1100px)
  // Shifted ship down to y = 68 with plenty of sky headroom (y: 10 - 68)
  const shipBaseX = (((time * 36) % 1200) + 1200) % 1200 - 150;
  const shipPitch = Math.sin(time * 2.1) * 2.2;
  const shipY = 66 + Math.sin(time * 2.3) * 2.8;

  // Armored Tow cable connects ship stern A-frame to towfish trailing behind
  const towfishX = shipBaseX - 170;
  const towfishY = 195 + Math.sin(time * 1.5) * 4;
  const towfishPitch = Math.sin(time * 1.5) * 2.5;

  // Catenary sag curve point
  const cableMidX = (shipBaseX + towfishX) / 2 + 18;
  const cableMidY = (shipY + towfishY) / 2 + 24 + Math.sin(time * 2.0) * 3;

  // 1. Mother Sea Turtle & Calf (Guaranteed positive modulo so never disappears!)
  const turtleX = (((1000 - time * 24) % 1200) + 1200) % 1200 - 60;
  const turtleY = 155 + Math.sin(time * 1.2) * 16;
  const turtleFlipperAngle = Math.sin(time * 3.8) * 24;
  const turtlePitch = Math.sin(time * 1.2) * 7;

  // 2. Playful Spinner Dolphins riding the surface wake near the ship
  const dolphinX = shipBaseX + 90 + Math.sin(time * 1.5) * 25;
  const dolphinY = 74 + Math.sin(time * 3.5) * 14;
  const dolphinJump = Math.sin(time * 3.5) > 0.4;

  // 3. Giant Manta Ray gliding deep over shelf
  const mantaX = (((1100 - time * 18) % 1300) + 1300) % 1300 - 100;
  const mantaY = 265 + Math.sin(time * 0.9) * 12;
  const mantaWingWave = Math.sin(time * 2.5) * 10;

  // 4. Bioluminescent Jellyfish
  const jelly1Y = 300 - (((time * 14) % 220) + 220) % 220;
  const jelly1Pulse = Math.sin(time * 3.2);
  const jelly2Y = 320 - ((((time + 5) * 11) % 240) + 240) % 240;
  const jelly2Pulse = Math.sin(time * 2.9 + 1.2);

  // 5. Sonar beam sweep phase
  const beamSweep = (time * 1.8) % 1;
  const beamWidth = 145 + Math.sin(time * 1.2) * 25;

  // Manual Ping pulse expansion
  const manualPingAge = manualPingTrigger ? (Date.now() - manualPingTrigger) / 1000 : 999;
  const manualPingRadius = manualPingAge < 2.5 ? manualPingAge * 350 : 0;
  const manualPingOpacity = manualPingAge < 2.5 ? 1 - manualPingAge / 2.5 : 0;

  // Seabed Targets
  const ghostNetX = 520;
  const isBeamOverNet = Math.abs(towfishX - ghostNetX) < 115 && sonarActive;

  const pipelineX = 860;
  const isBeamOverPipe = Math.abs(towfishX - pipelineX) < 115 && sonarActive;

  // Marine snow ambient particles
  const marineSnow = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      baseX: (i * 37) % 1000,
      baseY: 85 + ((i * 29) % 260),
      size: 0.8 + ((i * 13) % 15) / 10,
      speed: 0.3 + ((i * 7) % 10) / 10,
      phase: i * 1.7,
    }));
  }, []);

  const triggerAcousticPing = () => {
    setManualPingTrigger(Date.now());
  };

  return (
    <div className="space-y-10 font-sans">
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HIGH-IMPACT HEADER
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="text-center max-w-4xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono font-medium rounded-full shadow-[0_0_20px_rgba(0,240,255,0.2)]">
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
          <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#00F0FF]/50" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#38BDF8] font-bold">
            Choose Your Analysis Mode
          </span>
          <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#00F0FF]/50" />
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
          className={`relative rounded-xl bg-[#051124]/90 backdrop-blur-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl ${
            activeModeHover === 'manual'
              ? 'border-[#00F0FF] shadow-[0_0_40px_rgba(0,240,255,0.3)] scale-[1.01]'
              : 'border-[#1E3A5F]/60 hover:border-[#00F0FF]/60'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#00F0FF]/15 to-transparent pointer-events-none" />

          <div className="p-7 sm:p-9 space-y-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0284C7]/30 to-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                <UploadCloud className="w-7 h-7 text-[#00F0FF]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#0284C7]/20 border border-[#0284C7]/50 text-[#38BDF8]">
                  MOD-01
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-[#032030] text-[#94A3B8] border border-[#0E4466]">
                  BATCH INGESTION
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Manual Analysis
              </h2>
              <p className="text-[14.5px] text-[#94A3B8] leading-relaxed">
                Upload raw Side-Scan Sonar imagery and companion ping logs to localize, classify, and inspect potential underwater anomalies with AI.
              </p>
            </div>

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
                  <p className="text-[12.5px] text-[#64748B]">11.2M parameter anchor-free neural detector trained on 5,205 SSS tiles</p>
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

          <div className="p-7 sm:p-9 pt-0 relative z-10">
            <button
              onClick={() => setActiveTab('scan')}
              className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#00F0FF] hover:from-[#0369A1] hover:to-[#00D4AA] text-[#030914] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all cursor-pointer group"
            >
              <span>LAUNCH MANUAL UPLOAD & ANALYZE</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>

        {/* ── CARD 2: LIVE ANALYSIS (MOD-02) ── */}
        <div
          onMouseEnter={() => setActiveModeHover('live')}
          onMouseLeave={() => setActiveModeHover('none')}
          className={`relative rounded-xl bg-[#051124]/90 backdrop-blur-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl ${
            activeModeHover === 'live'
              ? 'border-[#10B981] shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-[1.01]'
              : 'border-[#1E3A5F]/60 hover:border-[#10B981]/60'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#10B981]/15 to-transparent pointer-events-none" />

          <div className="p-7 sm:p-9 space-y-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#059669]/30 to-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
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

            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Live Analysis
              </h2>
              <p className="text-[14.5px] text-[#94A3B8] leading-relaxed">
                Continuously analyze live real-time sonar waterfall streams from underwater Autonomous Underwater Vehicles (AUVs) & towfish surveys.
              </p>
            </div>

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

          <div className="p-7 sm:p-9 pt-0 relative z-10">
            <button
              onClick={() => setActiveTab('mission')}
              className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#34D399] text-[#030914] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer group"
            >
              <span>ENTER MISSION CONTROL STREAM</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — ULTRA-ANIMATED INTERACTIVE MARINE ECOSYSTEM HERO
          SURVEY VESSEL CRUISING + TOW CABLE + TOWFISH + ACOUSTIC BEAM + MARINE WILDLIFE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl border border-[#1E3A5F] bg-[#020914] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] max-w-6xl mx-auto">
        {/* Top Control Bar — Cleanly Organized with ZERO text obscuring the ship */}
        <div className="px-5 py-3 bg-[#041220]/95 backdrop-blur-xl border-b border-[#1E3A5F]/80 flex items-center justify-between flex-wrap gap-3 font-mono text-[11px] text-[#94A3B8]">
          {/* Left: Vessel telemetry badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-white bg-[#0A2238] px-2.5 py-1 rounded-md border border-[#1E3A5F]">
              <Anchor className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="font-bold tracking-wider">R/V SAGARIKA</span>
              <span className="text-[9px] text-[#38BDF8] px-1 py-0.2 bg-[#0284C7]/30 border border-[#00F0FF]/40 rounded">
                SURVEY SHIP
              </span>
            </div>

            <span className="text-[#334155]">|</span>
            <span>SPEED: <strong className="text-white">{vesselSpeed.toFixed(1)} KTS</strong></span>
            <span className="text-[#334155]">|</span>
            <span>TOW CABLE: <strong className="text-white">48.2 M</strong></span>
            <span className="text-[#334155]">|</span>
            <span>TOWFISH: <strong className="text-[#00F0FF]">24.0M DEPTH</strong> (8.4M ALT)</span>
            <span className="text-[#334155]">|</span>
            <span>FREQ: <strong className="text-[#10B981]">900 kHz CHIRP</strong></span>
          </div>

          {/* Right: Simulation Controls & Interactive Ping */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle: Ecosystem vs Waterfall */}
            <div className="flex items-center bg-[#07192C] border border-[#1E3A5F] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('ecosystem')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'ecosystem'
                    ? 'bg-[#00F0FF] text-[#030914] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>ECOSYSTEM</span>
              </button>
              <button
                onClick={() => setViewMode('waterfall')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'waterfall'
                    ? 'bg-[#F59E0B] text-[#030914] shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>RAW SSS WATERFALL</span>
              </button>
            </div>

            {/* Emit Sonar Ping Button */}
            <button
              onClick={triggerAcousticPing}
              className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#0284C7]/20 border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/30 transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-pulse"
              title="Transmit acoustic chirp shockwave across survey transect"
            >
              <Zap className="w-3 h-3" />
              <span>SEND ACOUSTIC PING</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-[#07192C] border border-[#1E3A5F] rounded-lg p-0.5">
              {[1.5, 3.5, 5.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setVesselSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                    vesselSpeed === spd
                      ? 'bg-[#00F0FF] text-[#030914]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {spd}K
                </button>
              ))}
            </div>

            {/* Palette Switcher */}
            <div className="flex items-center bg-[#07192C] border border-[#1E3A5F] rounded-lg p-0.5">
              {(['cobalt', 'emerald', 'amber', 'grayscale'] as PaletteMode[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    palette === p
                      ? 'bg-[#38BDF8] text-[#030914]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {p === 'grayscale' ? 'B&W' : p.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Pause/Play */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-md bg-[#0B2138] hover:bg-[#123150] border border-[#1E3A5F] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── QUICK JUMP ENTITY SELECTOR CHIPS ── */}
        <div className="px-5 py-2 bg-[#020B16] border-b border-[#1E3A5F]/50 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#64748B] text-[10px] uppercase font-bold flex items-center gap-1">
              <Info className="w-3 h-3 text-[#38BDF8]" />
              Quick Inspect:
            </span>
            <button
              onClick={() =>
                setSelectedEntity({
                  type: 'ship',
                  title: 'R/V SAGARIKA — Deep Ocean Survey Vessel',
                  badge: 'SURVEY FLAGSHIP',
                  specs: [
                    { label: 'Length Overall', value: '48.5 M' },
                    { label: 'Survey Speed', value: `${vesselSpeed} KTS` },
                    { label: 'Topside Engine', value: 'YOLOv8s ONNX (~35ms CPU)' },
                    { label: 'Positioning', value: 'DGPS + USBL Ultra-Short Baseline' },
                  ],
                  description:
                    'Equipped with heavy hydraulic A-frame stern winch and tow cable deploying high-frequency side-scan sonar across the Mumbai Shelf and coastal shipping corridors.',
                })
              }
              className="px-2 py-0.5 rounded bg-[#0A2238] hover:bg-[#00F0FF]/20 border border-[#1E3A5F] hover:border-[#00F0FF]/50 text-[#E0F7F4] text-[10px] transition-all cursor-pointer"
            >
              🚢 R/V Sagarika
            </button>

            <button
              onClick={() =>
                setSelectedEntity({
                  type: 'towfish',
                  title: 'SSS Tactical Towfish Transducer (AUV Glider)',
                  badge: 'ACOUSTIC SENSOR PLATFORM',
                  specs: [
                    { label: 'Operating Depth', value: '24.0 M' },
                    { label: 'Altitude above Seabed', value: '8.4 M' },
                    { label: 'Swath Frequency', value: '900 kHz Tactical Chirp' },
                    { label: 'Swath Width', value: '75 M Port + 75 M Starboard' },
                  ],
                  description:
                    'Hydrodynamic towfish maintaining stable trim to deliver clean acoustic waterfalls. Emits high-frequency sound pulses to generate high-contrast seabed highlight and shadow relief.',
                })
              }
              className="px-2 py-0.5 rounded bg-[#0A2238] hover:bg-[#00F0FF]/20 border border-[#1E3A5F] hover:border-[#00F0FF]/50 text-[#E0F7F4] text-[10px] transition-all cursor-pointer"
            >
              🟡 SSS Towfish
            </button>

            <button
              onClick={() =>
                setSelectedEntity({
                  type: 'turtle',
                  title: 'Olive Ridley Sea Turtle & Calf (Lepidochelys olivacea)',
                  badge: 'PROTECTED MARINE LIFE',
                  specs: [
                    { label: 'Conservation Status', value: 'Vulnerable (IUCN Red List)' },
                    { label: 'Hearing Range', value: '100 Hz – 1 kHz (Low Frequency)' },
                    { label: 'Sonar Safety', value: '100% Safe (900kHz CHIRP is outside hearing range)' },
                  ],
                  description:
                    'Indian coastal waters host vital nesting grounds for Olive Ridley turtles. Ghost nets are their #1 threat. SONARX enables rapid ALDFG net extraction to prevent drowning.',
                  ecoNote: 'Passive and high-frequency ultrasonic side-scan sonar does not interfere with marine reptile orientation or auditory systems.',
                })
              }
              className="px-2 py-0.5 rounded bg-[#0A2238] hover:bg-[#10B981]/20 border border-[#1E3A5F] hover:border-[#10B981]/50 text-[#34D399] text-[10px] transition-all cursor-pointer"
            >
              🐢 Sea Turtle & Calf
            </button>

            <button
              onClick={() =>
                setSelectedEntity({
                  type: 'dolphins',
                  title: 'Indo-Pacific Bottlenose Dolphins (Tursiops aduncus)',
                  badge: 'PELAGIC MAMMALS',
                  specs: [
                    { label: 'Behavior', value: 'Bow Riding in Vessel Surface Wake' },
                    { label: 'Acoustic Band', value: 'Echolocation at 40 – 120 kHz' },
                    { label: 'Protection', value: 'Indian Wildlife Protection Act Schedule I' },
                  ],
                  description:
                    'Dolphins frequently ride the surface bow waves of survey vessels. High-frequency side-scan sonar operates above 900 kHz, safely avoiding dolphin communications.',
                })
              }
              className="px-2 py-0.5 rounded bg-[#0A2238] hover:bg-[#38BDF8]/20 border border-[#1E3A5F] hover:border-[#38BDF8]/50 text-[#38BDF8] text-[10px] transition-all cursor-pointer"
            >
              🐬 Bow Dolphins
            </button>

            <button
              onClick={() =>
                setSelectedEntity({
                  type: 'ghostnet',
                  title: 'SX-T01 · Entangled Ghost Net (ALDFG)',
                  badge: 'HIGH HAZARD · 95.6% CONF',
                  specs: [
                    { label: 'Classification', value: 'ALDFG / Monofilament Gillnet' },
                    { label: 'Acoustic Relief', value: 'h = 1.42 M' },
                    { label: 'Calculated Shadow', value: 'L = 4.8 M' },
                    { label: 'Target Coordinates', value: '18.9217° N, 72.8214° E' },
                  ],
                  description:
                    'Abandoned gillnet tangled with leadlines and polypropylene ropes. Diffuse acoustic highlight followed by clear acoustic shadow void verified by physics filter.',
                  ecoNote: 'Severe entanglement hazard to marine megafauna (turtles & cetaceans). Marked for priority ROV retrieval.',
                })
              }
              className="px-2 py-0.5 rounded bg-[#0A2238] hover:bg-[#F59E0B]/20 border border-[#1E3A5F] hover:border-[#F59E0B]/50 text-[#F59E0B] text-[10px] transition-all cursor-pointer"
            >
              🕸️ Ghost Net Target
            </button>

            <button
              onClick={() =>
                setSelectedEntity({
                  type: 'pipeline',
                  title: 'SX-T03 · Subsea Petroleum Pipeline Free-Span',
                  badge: 'INFRASTRUCTURE · 99.4% CONF',
                  specs: [
                    { label: 'Classification', value: 'Pipeline Hazard / Trench' },
                    { label: 'Diameter', value: '0.75 M (30 inch)' },
                    { label: 'Free-Span Length', value: '18.4 M' },
                    { label: 'Target Coordinates', value: '18.9340° N, 72.8410° E' },
                  ],
                  description:
                    'Exposed subsea pipeline spanning over a bathymetric scour depression. High linear backscatter verified with aspect ratio prior (AR >= 1.30).',
                })
              }
              className="px-2 py-0.5 rounded bg-[#0A2238] hover:bg-[#38BDF8]/20 border border-[#1E3A5F] hover:border-[#38BDF8]/50 text-[#38BDF8] text-[10px] transition-all cursor-pointer"
            >
              ⚡ Subsea Pipeline
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>USBL TRANSDUCER LOCK: STABLE (99.8%)</span>
          </div>
        </div>

        {/* ── THE SUBSEA ANIMATED CANVAS / SVG VIEWPORT ── */}
        <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] overflow-hidden select-none">
          {viewMode === 'ecosystem' ? (
            /* ══════════════════════════════════════════════════════════════
               VIEW MODE 1: THE RICH MARINE ECOSYSTEM
               ══════════════════════════════════════════════════════════════ */
            <svg
              viewBox="0 0 1000 480"
              preserveAspectRatio="none"
              className="w-full h-full block"
            >
              <defs>
                {/* Sky Gradient above waterline (y: 0 to 68) */}
                <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.sky2} />
                  <stop offset="100%" stopColor={colors.sky1} />
                </linearGradient>

                {/* Deep Ocean Gradient (y: 68 to 480) */}
                <linearGradient id="deep-ocean-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.water1} stopOpacity="0.95" />
                  <stop offset="35%" stopColor={colors.water2} stopOpacity="1" />
                  <stop offset="80%" stopColor={colors.water3} stopOpacity="1" />
                  <stop offset="100%" stopColor="#010408" stopOpacity="1" />
                </linearGradient>

                {/* Dynamic Sonar Beam Cone Gradient */}
                <linearGradient id="active-sonar-beam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity="0.85" />
                  <stop offset="35%" stopColor={colors.accent} stopOpacity="0.38" />
                  <stop offset="70%" stopColor={colors.primary} stopOpacity="0.16" />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity="0.02" />
                </linearGradient>

                {/* Sunlight Caustic Pattern under surface */}
                <radialGradient id="sun-caustic" cx="50%" cy="0%" r="70%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="40%" stopColor="#0284C7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Sky Background (Completely free of any overlapping text badges!) */}
              <rect x="0" y="0" width="1000" height="68" fill="url(#sky-grad)" />

              {/* Distant Stars in twilight sky */}
              <g opacity="0.6">
                {[
                  { x: 50, y: 15, r: 1 },
                  { x: 140, y: 22, r: 0.8 },
                  { x: 230, y: 12, r: 1.2 },
                  { x: 380, y: 18, r: 0.9 },
                  { x: 520, y: 14, r: 1.1 },
                  { x: 670, y: 25, r: 0.8 },
                  { x: 790, y: 16, r: 1 },
                  { x: 910, y: 20, r: 1.2 },
                ].map((s, idx) => (
                  <circle key={idx} cx={s.x} cy={s.y} r={s.r} fill="#E2E8F0" />
                ))}
              </g>

              {/* Ocean Water Column Fill */}
              <rect x="0" y="68" width="1000" height="412" fill="url(#deep-ocean-grad)" />

              {/* Shimmering Underwater Caustic Rays */}
              <rect x="0" y="68" width="1000" height="180" fill="url(#sun-caustic)" />
              <g opacity="0.12">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const rayX = 80 + idx * 110 + Math.sin(time * 0.8 + idx) * 35;
                  return (
                    <polygon
                      key={idx}
                      points={`${rayX},68 ${rayX + 30},68 ${rayX + 95},380 ${rayX - 35},380`}
                      fill="#38BDF8"
                    />
                  );
                })}
              </g>

              {/* Bathymetric Depth Sounding Grid Lines */}
              <g opacity="0.15">
                <line x1="0" y1="120" x2="1000" y2="120" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
                <line x1="0" y1="200" x2="1000" y2="200" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
                <line x1="0" y1="280" x2="1000" y2="280" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
                <line x1="0" y1="380" x2="1000" y2="380" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
              </g>

              <text x="18" y="116" fill={colors.accent} opacity="0.45" fontSize="8.5" fontFamily="monospace">DEPTH: 10.0 M</text>
              <text x="18" y="196" fill={colors.accent} opacity="0.45" fontSize="8.5" fontFamily="monospace">DEPTH: 20.0 M</text>
              <text x="18" y="276" fill={colors.accent} opacity="0.45" fontSize="8.5" fontFamily="monospace">DEPTH: 30.0 M</text>
              <text x="18" y="376" fill={colors.accent} opacity="0.45" fontSize="8.5" fontFamily="monospace">DEPTH: 40.0 M (SEABED)</text>

              {/* Ambient Marine Snow / Plankton Particles */}
              <g>
                {marineSnow.map((p) => {
                  const px = (p.baseX + Math.sin(time * p.speed + p.phase) * 20) % 1000;
                  const py = p.baseY + ((time * p.speed * 8) % 280);
                  return (
                    <circle
                      key={p.id}
                      cx={px}
                      cy={py}
                      r={p.size}
                      fill={colors.accent}
                      opacity="0.32"
                    />
                  );
                })}
              </g>

              {/* ── 1. SEABED BATHYMETRY & REEF FORMATIONS ── */}
              {/* Deep Bed Structure */}
              <path
                d="M0 400 Q 150 392, 300 410 T 600 402 T 900 415 T 1000 396 L 1000 480 L 0 480 Z"
                fill="#020811"
                stroke="#092238"
                strokeWidth="1.5"
              />
              {/* Sand Dunes & Sediment Layer */}
              <path
                d="M0 415 Q 70 408, 140 418 T 280 414 T 420 422 T 560 416 T 700 424 T 840 415 T 1000 420 L 1000 480 L 0 480 Z"
                fill="#05121F"
                opacity="0.9"
              />

              {/* Coral Heads & Sea Flora */}
              <g transform="translate(140, 395)" opacity="0.8">
                <path d="M0 20 Q 6 -12, 14 6 Q 20 -20, 28 4 Q 35 -10, 42 20 Z" fill="#0C3652" />
                <circle cx="16" cy="-8" r="3" fill="#10B981" opacity="0.7" />
                <circle cx="30" cy="-3" r="2.5" fill={colors.primary} opacity="0.6" />
              </g>
              <g transform="translate(720, 398)" opacity="0.75">
                <path d="M0 22 Q 8 -15, 18 5 Q 28 -18, 36 22 Z" fill="#0C3652" />
                <circle cx="18" cy="-10" r="3" fill="#F59E0B" opacity="0.65" />
              </g>

              {/* ── 2. SEABED TARGET: GHOST NET (ALDFG-01) ── */}
              <g transform={`translate(${ghostNetX}, 345)`} className="cursor-pointer group">
                <path
                  d="M -40 28 Q -20 -10, 0 12 Q 30 -18, 55 18 Q 25 35, -40 28 Z"
                  fill="#0D2A3B"
                  stroke={isBeamOverNet ? '#F59E0B' : colors.primary}
                  strokeWidth={isBeamOverNet ? '1.8' : '1.2'}
                  strokeDasharray="4 2"
                />
                {/* Floating Buoys */}
                <circle cx="-22" cy="-4" r="3.5" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
                <line x1="-22" y1="-4" x2="-24" y2="18" stroke="#F59E0B" strokeWidth="0.8" opacity="0.8" />
                <circle cx="10" cy="-15" r="4" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1" className="animate-pulse" />
                <line x1="10" y1="-15" x2="8" y2="12" stroke="#EF4444" strokeWidth="0.8" opacity="0.8" />
                <circle cx="38" cy="-8" r="3.5" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
                <line x1="38" y1="-8" x2="35" y2="16" stroke="#F59E0B" strokeWidth="0.8" opacity="0.8" />

                {/* Acoustic Shadow Void */}
                <polygon points="55,18 165,32 140,44 -15,38" fill="#010307" opacity="0.95" />

                {/* Target Bounding Box & Reticle */}
                <g opacity={isBeamOverNet ? 1 : 0.65} className="transition-all duration-300">
                  <rect x="-50" y="-36" width="115" height="74" fill="none" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="1.2" strokeDasharray="5 3" />
                  <path d="M -50 -24 L -50 -36 L -38 -36" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />
                  <path d="M 53 -36 L 65 -36 L 65 -24" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />
                  <path d="M 65 26 L 65 38 L 53 38" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />
                  <path d="M -38 38 L -50 38 L -50 26" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />

                  <rect x="-46" y="-52" width="108" height="14" fill="#031424" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="0.9" rx="2" />
                  <text x="-42" y="-42" fill={isBeamOverNet ? '#F59E0B' : colors.primary} fontSize="8" fontFamily="monospace" fontWeight="bold">
                    SX-T01 · GHOST NET (95.6%)
                  </text>
                </g>
              </g>

              {/* ── 3. SEABED TARGET: SUBSEA PIPELINE INFRASTRUCTURE ── */}
              <g transform={`translate(${pipelineX}, 405)`} className="cursor-pointer group">
                <line x1="-60" y1="0" x2="70" y2="0" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
                <line x1="-60" y1="-2" x2="70" y2="-2" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <rect x="-35" y="-6" width="8" height="12" fill="#334155" />
                <rect x="25" y="-6" width="8" height="12" fill="#334155" />
                <g opacity={isBeamOverPipe ? 1 : 0.5}>
                  <rect x="-65" y="-18" width="140" height="36" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 2" />
                  <rect x="-55" y="-30" width="118" height="11" fill="#031424" stroke="#38BDF8" strokeWidth="0.8" rx="2" />
                  <text x="-52" y="-22" fill="#38BDF8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                    SX-T03 · PIPELINE FREE-SPAN
                  </text>
                </g>
              </g>

              {/* ── 4. MARINE ANIMALS (ALWAYS VISIBLE & PERFECTLY BALANCED) ── */}

              {/* (A) Mother Sea Turtle */}
              <g transform={`translate(${turtleX}, ${turtleY}) rotate(${turtlePitch})`}>
                <g transform="scale(0.95)">
                  <ellipse cx="0" cy="0" rx="22" ry="16" fill="#0E4438" stroke="#10B981" strokeWidth="1.5" />
                  <ellipse cx="-2" cy="0" rx="14" ry="9" fill="#093126" stroke="#34D399" strokeWidth="0.9" strokeDasharray="4 2" />
                  <ellipse cx="25" cy="-2" rx="7" ry="5" fill="#134E3F" stroke="#10B981" strokeWidth="1.2" />
                  <circle cx="28" cy="-3.5" r="1.2" fill="#34D399" />
                  {/* Flippers */}
                  <path
                    d="M 8 -9 C 14 -25, 32 -26, 34 -18 C 26 -12, 12 -5, 8 -9 Z"
                    fill="#0E4438"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    transform={`rotate(${turtleFlipperAngle}, 8, -9)`}
                  />
                  <path
                    d="M 8 9 C 14 25, 32 26, 34 18 C 26 12, 12 5, 8 9 Z"
                    fill="#093126"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    transform={`rotate(${-turtleFlipperAngle}, 8, 9)`}
                  />
                  <path d="M -18 -7 C -26 -14, -31 -9, -24 -4 Z" fill="#0E4438" />
                  <path d="M -18 7 C -26 14, -31 9, -24 4 Z" fill="#093126" />
                </g>
              </g>

              {/* (B) Baby Sea Turtle Swimming Alongside Mother */}
              <g transform={`translate(${turtleX - 42}, ${turtleY + 22}) rotate(${turtlePitch})`}>
                <g transform="scale(0.55)">
                  <ellipse cx="0" cy="0" rx="20" ry="14" fill="#0E4438" stroke="#10B981" strokeWidth="1.5" />
                  <ellipse cx="-2" cy="0" rx="12" ry="8" fill="#093126" stroke="#34D399" strokeWidth="0.9" />
                  <ellipse cx="23" cy="-2" rx="6" ry="4" fill="#134E3F" stroke="#10B981" />
                  <circle cx="25" cy="-3" r="1" fill="#34D399" />
                  <path
                    d="M 6 -8 C 12 -22, 28 -24, 30 -16 C 24 -10, 10 -4, 6 -8 Z"
                    fill="#0E4438"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    transform={`rotate(${turtleFlipperAngle}, 6, -8)`}
                  />
                  <path
                    d="M 6 8 C 12 22, 28 24, 30 16 C 24 10, 10 4, 6 8 Z"
                    fill="#093126"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    transform={`rotate(${-turtleFlipperAngle}, 6, 8)`}
                  />
                </g>
              </g>

              {/* (C) Playful Surface Dolphins Swimming & Jumping near Ship Bow */}
              <g transform={`translate(${dolphinX}, ${dolphinY}) rotate(${dolphinJump ? -14 : 6})`} opacity="0.9">
                <g transform="scale(0.65)">
                  {/* Dolphin Sleek Gray Body */}
                  <path
                    d="M -30 4 C -15 -12, 18 -14, 34 -4 C 40 -1, 46 2, 44 6 C 36 6, 26 2, 14 6 C -2 10, -20 12, -30 4 Z"
                    fill="#334155"
                    stroke="#64748B"
                    strokeWidth="1.2"
                  />
                  {/* White belly counter-shading */}
                  <path d="M -22 5 C -10 10, 15 8, 30 3 C 24 6, 5 9, -22 5 Z" fill="#E2E8F0" opacity="0.8" />
                  {/* Dorsal Fin */}
                  <path d="M 2 -12 C 4 -22, 14 -20, 12 -12 Z" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                  {/* Pectoral Flipper */}
                  <path d="M 12 5 C 16 14, 22 15, 20 8 Z" fill="#1E293B" />
                  {/* Tail Fluke */}
                  <polygon points="-30,4 -42,-4 -38,4 -42,12" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                  {/* Eye */}
                  <circle cx="30" cy="1" r="1.2" fill="#0F172A" />
                </g>
              </g>

              {/* (D) Giant Manta Ray Gliding Deep */}
              <g transform={`translate(${mantaX}, ${mantaY})`}>
                <g transform="scale(1.05)">
                  <path
                    d={`M 0 -3 C 22 ${-24 + mantaWingWave}, 44 ${-30 + mantaWingWave}, 38 ${-20 + mantaWingWave} C 26 -6, 14 0, 6 9 C -6 9, -20 0, -30 ${-20 + mantaWingWave} C -36 ${-30 + mantaWingWave}, -14 ${-24 + mantaWingWave}, 0 -3 Z`}
                    fill="#081E33"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    opacity="0.9"
                  />
                  <path d="M 4 9 Q 7 16, 5 18 Q 2 13, 2 9 Z" fill="#081E33" stroke="#38BDF8" strokeWidth="0.8" />
                  <path d="M -4 9 Q -7 16, -5 18 Q -2 13, -2 9 Z" fill="#081E33" stroke="#38BDF8" strokeWidth="0.8" />
                  <path d="M 0 -3 Q 3 -22, -5 -45 Q -3 -62, 2 -80" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.75" />
                </g>
              </g>

              {/* (E) Pulsing Jellyfish */}
              <g transform={`translate(280, ${jelly1Y})`} opacity="0.65">
                <path
                  d={`M -10 0 C -12 ${-14 + jelly1Pulse * 3}, 12 ${-14 + jelly1Pulse * 3}, 10 0 Z`}
                  fill={colors.accent}
                  opacity="0.3"
                  stroke={colors.primary}
                  strokeWidth="1"
                />
                <path d="M -6 0 Q -8 18, -4 28" fill="none" stroke={colors.primary} strokeWidth="0.7" opacity="0.7" />
                <path d="M -2 0 Q 0 20, -1 32" fill="none" stroke={colors.accent} strokeWidth="0.7" opacity="0.8" />
                <path d="M 2 0 Q 4 19, 3 30" fill="none" stroke={colors.accent} strokeWidth="0.7" opacity="0.8" />
                <path d="M 6 0 Q 8 18, 5 26" fill="none" stroke={colors.primary} strokeWidth="0.7" opacity="0.7" />
              </g>

              {/* (F) School of 8 Neon Tetras Darting */}
              <g opacity="0.85">
                {[
                  { dx: 0, dy: 0 },
                  { dx: 14, dy: -5 },
                  { dx: 26, dy: 4 },
                  { dx: 38, dy: -3 },
                  { dx: 12, dy: 9 },
                  { dx: 24, dy: 14 },
                  { dx: 36, dy: 7 },
                  { dx: -10, dy: 4 },
                ].map((f, i) => {
                  const schoolBaseX = 420 + ((time * 26) % 800) - 100;
                  const fx = schoolBaseX + f.dx + Math.sin(time * 2.5 + i) * 8;
                  const fy = 210 + f.dy + Math.cos(time * 2.0 + i) * 6;
                  return (
                    <ellipse
                      key={i}
                      cx={fx}
                      cy={fy}
                      rx="5"
                      ry="1.8"
                      fill={colors.accent}
                      opacity="0.75"
                    />
                  );
                })}
              </g>

              {/* ── 5. TOW CABLE (DYNAMIC CATENARY FLEX) ── */}
              <path
                d={`M ${shipBaseX - 22} ${shipY + 12} Q ${cableMidX} ${cableMidY}, ${towfishX + 4} ${towfishY + 4}`}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.2"
                opacity="0.95"
              />
              <circle cx={cableMidX} cy={cableMidY} r="2.5" fill="#FBBF24" className="animate-ping" />

              {/* ── 6. TOWED SIDE-SCAN SONAR TOWFISH (AUV GLIDER) ── */}
              <g transform={`translate(${towfishX}, ${towfishY}) rotate(${towfishPitch})`}>
                <ellipse cx="0" cy="0" rx="25" ry="8" fill="#FACC15" stroke="#EAB308" strokeWidth="1.8" />
                <rect x="-9" y="-7.5" width="4.5" height="15" fill="#0F172A" />
                <rect x="5" y="-7.5" width="4.5" height="15" fill="#0F172A" />
                <ellipse cx="23" cy="0" rx="4.5" ry="7" fill="#0284C7" stroke={colors.primary} strokeWidth="1.2" />

                {/* Fins */}
                <polygon points="-23,-2 -32,-13 -27,-2" fill="#CA8A04" stroke="#A16207" strokeWidth="1" />
                <polygon points="-23,2 -32,13 -27,2" fill="#CA8A04" stroke="#A16207" strokeWidth="1" />
                <polygon points="-25,0 -34,0 -27,-2" fill="#CA8A04" />
                <circle cx="0" cy="-7" r="2.2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                <circle cx="19" cy="-4" r="2" fill="#10B981" className="animate-ping" />
                <circle cx="19" cy="-4" r="1.5" fill="#10B981" />

                {/* DUAL ACOUSTIC SONAR FAN BEAM */}
                {sonarActive && (
                  <g>
                    <polygon
                      points={`0,4 ${-beamWidth - beamSweep * 35},${420 - towfishY} ${beamWidth + beamSweep * 35},${420 - towfishY}`}
                      fill="url(#active-sonar-beam)"
                      opacity="0.55"
                    />
                    <ellipse
                      cx="0"
                      cy="0"
                      rx={30 + beamSweep * 90}
                      ry={18 + beamSweep * 65}
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="1.4"
                      opacity={0.85 - beamSweep * 0.85}
                    />
                  </g>
                )}

                {/* Manual Ping Shockwave Ripple */}
                {manualPingRadius > 0 && (
                  <circle
                    cx="0"
                    cy="0"
                    r={manualPingRadius}
                    fill="none"
                    stroke={colors.highlight}
                    strokeWidth="2.5"
                    opacity={manualPingOpacity}
                  />
                )}

                <g transform="translate(-36, -26)">
                  <rect x="0" y="0" width="86" height="14" fill="#020914" stroke={colors.primary} strokeWidth="0.9" rx="3" />
                  <text x="6" y="10" fill={colors.primary} fontSize="8" fontFamily="monospace" fontWeight="bold">
                    TOWFISH · 8.4M ALT
                  </text>
                </g>
              </g>

              {/* ── 7. SURFACE WAVES & HYDROGRAPHIC SURVEY SHIP (UNOBSTRUCTED!) ── */}
              {/* Animated Ocean Waves */}
              <path
                d={`M 0 68 Q 50 ${62 + Math.sin(time * 3) * 3}, 100 68 T 200 68 T 300 68 T 400 68 T 500 68 T 600 68 T 700 68 T 800 68 T 900 68 T 1000 68 L 1000 86 L 0 86 Z`}
                fill="#062238"
                opacity="0.8"
              />
              <path
                d={`M 0 72 Q 60 ${66 + Math.cos(time * 2.8) * 3}, 120 72 T 240 72 T 360 72 T 480 72 T 600 72 T 720 72 T 840 72 T 960 72 T 1000 72 L 1000 96 L 0 96 Z`}
                fill="#031526"
              />

              {/* R/V SAGARIKA — 30% LARGER, PROMINENT, CRISP SHIP (y: 66) */}
              <g
                transform={`translate(${shipBaseX}, ${shipY}) rotate(${shipPitch})`}
                className="cursor-pointer group"
              >
                {/* Foaming Wake behind stern */}
                <ellipse cx="-36" cy="11" rx="28" ry="5" fill="#E2E8F0" opacity="0.45" />
                <ellipse cx="-64" cy="12" rx="40" ry="4" fill="#E2E8F0" opacity="0.3" />
                <ellipse cx="-95" cy="13" rx="50" ry="3" fill="#E2E8F0" opacity="0.18" />

                {/* Deep Navy Hull */}
                <path
                  d="M -28 11 L 62 11 Q 88 11, 98 0 L 94 -8 L -26 -8 Z"
                  fill="#0D2742"
                  stroke="#1E4D7B"
                  strokeWidth="1.6"
                />
                {/* Bright Red Waterline */}
                <line x1="-28" y1="8" x2="92" y2="8" stroke="#EF4444" strokeWidth="2.2" />

                {/* White Deck Superstructure */}
                <polygon points="-20,-8 62,-8 54,-26 -14,-26" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.4" />

                {/* Bridge Cabin & Amber Glowing Windows */}
                <polygon points="16,-26 48,-26 44,-38 20,-38" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.4" />
                <rect x="25" y="-36" width="6.5" height="6.5" fill="#F59E0B" />
                <rect x="34" y="-36" width="6.5" height="6.5" fill="#F59E0B" />

                {/* Mast & Radar Dish */}
                <line x1="32" y1="-38" x2="32" y2="-54" stroke="#64748B" strokeWidth="2" />
                <line x1="25" y1="-46" x2="39" y2="-46" stroke="#64748B" strokeWidth="1.4" />
                <ellipse cx="32" cy="-54" rx="7" ry="2.2" fill="#38BDF8" className="animate-spin" />
                <circle cx="5" cy="-30" r="5.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />

                {/* Winch A-Frame Crane */}
                <polygon points="-22,-8 -17,-28 -15,-28 -17,-8" fill="#F59E0B" />
                <polygon points="-30,-8 -17,-28 -15,-28 -25,-8" fill="#D97706" />
                <circle cx="-16" cy="-28" r="3.5" fill="#475569" />

                {/* Ship Name Decal */}
                <text x="4" y="2" fill="#CBD5E1" fontSize="7" fontFamily="monospace" fontWeight="bold">
                  R/V SAGARIKA
                </text>
              </g>
            </svg>
          ) : (
            /* ══════════════════════════════════════════════════════════════
               VIEW MODE 2: RAW SSS ACOUSTIC WATERFALL DISPLAY
               Demonstrates deep side-scan sonar domain understanding!
               ══════════════════════════════════════════════════════════════ */
            <div className="w-full h-full bg-[#02070D] p-4 flex flex-col justify-between font-mono text-[11px] select-none">
              <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-2 text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <span className="text-[#00F0FF] font-bold">RAW SSS WATERFALL STREAM</span>
                  <span>·</span>
                  <span>PORT: 75M</span>
                  <span>·</span>
                  <span>STARBOARD: 75M</span>
                  <span>·</span>
                  <span>RESOLUTION: 0.05 M/PX</span>
                </div>
                <div className="text-[#10B981] font-bold">LIVE SLIDING SEGMENTATION</div>
              </div>

              {/* Waterfall simulation canvas */}
              <div className="relative flex-1 my-2 border border-[#1E3A5F]/80 rounded bg-[#010408] overflow-hidden flex items-center justify-center">
                {/* Central Nadir Blind Zone */}
                <div className="absolute inset-y-0 w-16 bg-[#000000] border-x border-[#00F0FF]/30 flex items-center justify-center">
                  <span className="text-[9px] text-[#00F0FF]/60 rotate-90 whitespace-nowrap">
                    NADIR BLIND ZONE
                  </span>
                </div>

                {/* Acoustic scanlines animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent animate-pulse" />

                {/* Target Highlight Contacts in Waterfall */}
                <div className="absolute left-1/4 top-1/3 p-2 bg-[#0284C7]/20 border border-[#00F0FF] rounded">
                  <span className="text-[10px] text-[#00F0FF] font-bold block">SX-T01: GHOST NET</span>
                  <span className="text-[9px] text-white block">SPECULAR HIGHLIGHT + SHADOW</span>
                </div>

                <div className="absolute right-1/4 bottom-1/4 p-2 bg-[#38BDF8]/20 border border-[#38BDF8] rounded">
                  <span className="text-[10px] text-[#38BDF8] font-bold block">SX-T03: PIPELINE TRENCH</span>
                  <span className="text-[9px] text-white block">LINEAR REFLECTIVITY (AR=2.8)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[#64748B] text-[10px]">
                <span>Acoustic Backscatter: Rayleigh Speckle Filtered</span>
                <span>Time-Varied Gain (TVG): ACTIVE</span>
                <span>Slant-to-Ground: Pythagorean Corrected</span>
              </div>
            </div>
          )}

          {/* Bottom Ambient Legend with Clean Math Formula */}
          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] bg-[#020B16]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E3A5F]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#34D399]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Eco-Safe Acoustics (Passive 900kHz CHIRP Safe for Turtles & Dolphins)
              </span>
              <span className="hidden sm:inline text-[#334155]">|</span>
              <span className="hidden sm:inline text-[#38BDF8]">
                Benthic Conservation Mode
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#00F0FF]">
              <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>
                Ray-Traced Shadow Math: <strong className="text-white">L = (h · G) / (H − h)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── MODAL / POPOVER FOR CLICKED ENTITY ── */}
        {selectedEntity && (
          <div className="absolute inset-0 bg-[#020712]/80 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-[#051424] border border-[#00F0FF]/50 rounded-xl p-6 space-y-4 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284C7]/20 border border-[#00F0FF]/40 text-[#00F0FF]">
                    {selectedEntity.badge}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-1.5">
                    {selectedEntity.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="p-1 rounded-lg bg-[#0E2840] hover:bg-[#1A3D60] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#030B14] p-3 rounded-lg border border-[#1E3A5F] text-[11px] font-mono">
                {selectedEntity.specs.map((s, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-[#64748B] block text-[9.5px] uppercase">{s.label}</span>
                    <span className="text-[#E0F7F4] font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                {selectedEntity.description}
              </p>

              {selectedEntity.ecoNote && (
                <div className="p-2.5 rounded-lg bg-[#062419] border border-[#10B981]/40 text-[11.5px] text-[#34D399] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" />
                  <span>{selectedEntity.ecoNote}</span>
                </div>
              )}

              <button
                onClick={() => setSelectedEntity(null)}
                className="w-full py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                RETURN TO SIMULATION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
