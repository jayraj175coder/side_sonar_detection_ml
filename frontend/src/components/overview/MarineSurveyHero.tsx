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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type PaletteMode = 'cobalt' | 'emerald' | 'amber' | 'grayscale';

interface SelectedEntity {
  type: 'ship' | 'towfish' | 'turtle' | 'manta' | 'ghostnet' | 'pipeline' | 'jellyfish';
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
  const [activeModeHover, setActiveModeHover] = useState<'none' | 'manual' | 'live'>('none');
  const [animationTick, setAnimationTick] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Animation frame loop for 60fps smooth continuous subsea simulation
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

  // Color themes for the 4 acoustic palettes
  const colors = useMemo(() => {
    switch (palette) {
      case 'emerald':
        return {
          primary: '#10B981',
          accent: '#34D399',
          glow: 'rgba(16, 185, 129, 0.35)',
          beam1: 'rgba(16, 185, 129, 0.45)',
          beam2: 'rgba(52, 211, 153, 0.12)',
          water1: '#041F17',
          water2: '#02120E',
          water3: '#010A07',
          highlight: '#6EE7B7',
        };
      case 'amber':
        return {
          primary: '#F59E0B',
          accent: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.35)',
          beam1: 'rgba(245, 158, 11, 0.45)',
          beam2: 'rgba(251, 191, 36, 0.12)',
          water1: '#1F1404',
          water2: '#130C02',
          water3: '#0A0601',
          highlight: '#FDE68A',
        };
      case 'grayscale':
        return {
          primary: '#E2E8F0',
          accent: '#94A3B8',
          glow: 'rgba(226, 232, 240, 0.25)',
          beam1: 'rgba(226, 232, 240, 0.35)',
          beam2: 'rgba(148, 163, 184, 0.1)',
          water1: '#11151A',
          water2: '#0B0D11',
          water3: '#050608',
          highlight: '#FFFFFF',
        };
      case 'cobalt':
      default:
        return {
          primary: '#00F0FF',
          accent: '#38BDF8',
          glow: 'rgba(0, 240, 255, 0.35)',
          beam1: 'rgba(0, 240, 255, 0.45)',
          beam2: 'rgba(56, 189, 248, 0.12)',
          water1: '#051A2E',
          water2: '#031221',
          water3: '#010811',
          highlight: '#7DD3FC',
        };
    }
  }, [palette]);

  // Derived positions for ship, towfish, and marine fauna
  const time = animationTick;

  // Ship smooth cruising across the surface (cycles 0 -> 1000px horizontally)
  // We keep ship sailing smoothly from left to right with looping
  const shipBaseX = ((time * 32) % 1150) - 150; // starts offscreen left, cruises across
  const shipPitch = Math.sin(time * 2.1) * 2.2;
  const shipY = 48 + Math.sin(time * 2.4) * 2.8;

  // Armored Tow cable connects ship stern to towfish trailing ~180px behind & down
  const towfishX = shipBaseX - 165;
  const towfishY = 180 + Math.sin(time * 1.5) * 4;
  const towfishPitch = Math.sin(time * 1.5) * 2.5;

  // Dynamic cable catenary sag
  const cableMidX = (shipBaseX + towfishX) / 2 + 15;
  const cableMidY = (shipY + towfishY) / 2 + 22 + Math.sin(time * 2.0) * 3;

  // Sea Turtle swimming across the screen with natural flipper strokes
  const turtleX = ((1000 - time * 20) % 1200) - 100;
  const turtleY = 145 + Math.sin(time * 1.1) * 16;
  const turtleFlipperAngle = Math.sin(time * 3.8) * 22;
  const turtlePitch = Math.sin(time * 1.1) * 6;

  // Manta Ray deep glide across the bottom
  const mantaX = ((1100 - time * 15) % 1300) - 150;
  const mantaY = 245 + Math.sin(time * 0.8) * 10;
  const mantaWingWave = Math.sin(time * 2.6) * 10;

  // 3 Deep Jellyfish pulsing upwards gently
  const jelly1Y = 280 - ((time * 12) % 200);
  const jelly1Pulse = Math.sin(time * 3.0);
  const jelly2Y = 290 - (((time + 4) * 10) % 210);
  const jelly2Pulse = Math.sin(time * 2.8 + 1.2);

  // Sonar beam sweeping waves
  const beamSweep = (time * 1.6) % 1;
  const beamWidth = 140 + Math.sin(time * 1.2) * 25;

  // Target coordinates on seabed
  const ghostNetX = 520;
  const ghostNetY = 320;
  const isBeamOverNet = Math.abs(towfishX - ghostNetX) < 110 && sonarActive;

  const pipelineX = 860;
  const isBeamOverPipe = Math.abs(towfishX - pipelineX) < 110 && sonarActive;

  // Ambient floating marine snow particles (30 particles)
  const marineSnow = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      baseX: (i * 37) % 1000,
      baseY: 70 + ((i * 29) % 240),
      size: 0.8 + ((i * 13) % 15) / 10,
      speed: 0.3 + ((i * 7) % 10) / 10,
      phase: i * 1.7,
    }));
  }, []);

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
          {/* Glowing ambient top light */}
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

            {/* Feature Checklist with glowing points */}
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
          {/* Glowing ambient top light */}
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

            {/* Feature Checklist with glowing points */}
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
        {/* Top Military Glass Control & Telemetry Bar */}
        <div className="px-5 py-3 bg-[#041220]/95 backdrop-blur-xl border-b border-[#1E3A5F]/80 flex items-center justify-between flex-wrap gap-4 font-mono text-[11px] text-[#94A3B8]">
          {/* Vessel Status */}
          <div className="flex items-center gap-3 flex-wrap">
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
              className="flex items-center gap-2 text-white hover:text-[#00F0FF] transition-colors cursor-pointer bg-[#0A2238] px-2.5 py-1 rounded-md border border-[#1E3A5F]"
            >
              <Anchor className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              <span className="font-bold tracking-wider">R/V SAGARIKA</span>
              <span className="text-[9px] text-[#38BDF8] px-1 py-0.2 bg-[#0284C7]/30 border border-[#00F0FF]/40 rounded">
                SURVEY SHIP
              </span>
            </button>

            <span className="text-[#334155]">|</span>
            <span>SPEED: <strong className="text-white">{vesselSpeed.toFixed(1)} KTS</strong></span>
            <span className="text-[#334155]">|</span>
            <span>CABLE LAYBACK: <strong className="text-white">48.2 M</strong></span>
            <span className="text-[#334155]">|</span>
            <span>TOWFISH: <strong className="text-[#00F0FF]">24.0 M DEPTH</strong> (8.4M ALTITUDE)</span>
            <span className="text-[#334155]">|</span>
            <span>FREQ: <strong className="text-[#10B981]">900 kHz DUAL-CHIRP</strong></span>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Speed Selector */}
            <div className="flex items-center bg-[#07192C] border border-[#1E3A5F] rounded-lg p-0.5">
              {[1.5, 3.5, 5.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setVesselSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                    vesselSpeed === spd
                      ? 'bg-[#00F0FF] text-[#030914] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {spd}K
                </button>
              ))}
            </div>

            {/* Acoustic Palette Switcher */}
            <div className="flex items-center bg-[#07192C] border border-[#1E3A5F] rounded-lg p-0.5">
              {(['cobalt', 'emerald', 'amber', 'grayscale'] as PaletteMode[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    palette === p
                      ? 'bg-[#38BDF8] text-[#030914] shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {p === 'grayscale' ? 'B&W' : p.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Sonar Beam Toggle */}
            <button
              onClick={() => setSonarActive(!sonarActive)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                sonarActive
                  ? 'bg-[#00F0FF]/20 border-[#00F0FF]/60 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>BEAM: {sonarActive ? 'ACTIVE' : 'MUTED'}</span>
            </button>

            {/* Pause/Play */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-md bg-[#0B2138] hover:bg-[#123150] border border-[#1E3A5F] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── THE SUBSEA ANIMATED CANVAS / SVG VIEWPORT ── */}
        <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] overflow-hidden select-none">
          <svg
            viewBox="0 0 1000 460"
            preserveAspectRatio="none"
            className="w-full h-full block"
          >
            <defs>
              {/* Dynamic Ocean Gradient using active palette */}
              <linearGradient id="deep-ocean-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E2D4A" stopOpacity="0.9" />
                <stop offset="14%" stopColor={colors.water1} stopOpacity="1" />
                <stop offset="45%" stopColor={colors.water2} stopOpacity="1" />
                <stop offset="85%" stopColor={colors.water3} stopOpacity="1" />
                <stop offset="100%" stopColor="#010408" stopOpacity="1" />
              </linearGradient>

              {/* Dynamic Sonar Beam Cone Gradient */}
              <linearGradient id="active-sonar-beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.85" />
                <stop offset="35%" stopColor={colors.accent} stopOpacity="0.4" />
                <stop offset="70%" stopColor={colors.primary} stopOpacity="0.18" />
                <stop offset="100%" stopColor={colors.accent} stopOpacity="0.02" />
              </linearGradient>

              {/* Caustic light shimmer under water surface */}
              <radialGradient id="sun-caustic" cx="50%" cy="0%" r="60%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                <stop offset="40%" stopColor="#0284C7" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              {/* Target Highlight Pulsing Ring */}
              <radialGradient id="target-pulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
                <stop offset="50%" stopColor={colors.primary} stopOpacity="0.25" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ocean Water Column Fill */}
            <rect width="1000" height="460" fill="url(#deep-ocean-grad)" />

            {/* Underwater sunlight caustics shimmer from surface */}
            <rect x="0" y="55" width="1000" height="160" fill="url(#sun-caustic)" />

            {/* Shimmering Underwater Caustic Rays */}
            <g opacity="0.12">
              {Array.from({ length: 9 }).map((_, idx) => {
                const rayX = 80 + idx * 110 + Math.sin(time * 0.8 + idx) * 35;
                return (
                  <polygon
                    key={idx}
                    points={`${rayX},55 ${rayX + 30},55 ${rayX + 95},360 ${rayX - 35},360`}
                    fill="#38BDF8"
                  />
                );
              })}
            </g>

            {/* Bathymetric Grid Lines & Sounding Depth Markers */}
            <g opacity="0.15">
              <line x1="0" y1="110" x2="1000" y2="110" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
              <line x1="0" y1="190" x2="1000" y2="190" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
              <line x1="0" y1="270" x2="1000" y2="270" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
              <line x1="0" y1="360" x2="1000" y2="360" stroke={colors.primary} strokeWidth="0.8" strokeDasharray="6 4" />
            </g>

            <text x="18" y="106" fill={colors.accent} opacity="0.5" fontSize="8.5" fontFamily="monospace">DEPTH: 10.0 M</text>
            <text x="18" y="186" fill={colors.accent} opacity="0.5" fontSize="8.5" fontFamily="monospace">DEPTH: 20.0 M</text>
            <text x="18" y="266" fill={colors.accent} opacity="0.5" fontSize="8.5" fontFamily="monospace">DEPTH: 30.0 M</text>
            <text x="18" y="356" fill={colors.accent} opacity="0.5" fontSize="8.5" fontFamily="monospace">DEPTH: 40.0 M (SEABED)</text>

            {/* ── AMBIENT MARINE SNOW / PARTICLES ── */}
            <g>
              {marineSnow.map((p) => {
                const px = (p.baseX + Math.sin(time * p.speed + p.phase) * 20) % 1000;
                const py = (p.baseY + ((time * p.speed * 8) % 240));
                return (
                  <circle
                    key={p.id}
                    cx={px}
                    cy={py}
                    r={p.size}
                    fill={colors.accent}
                    opacity="0.35"
                  />
                );
              })}
            </g>

            {/* ── 1. SEABED BATHYMETRY, ROCK RIDGES & CORALS ── */}
            {/* Deep Under-Bed Layer */}
            <path
              d="M0 380 Q 150 372, 300 390 T 600 382 T 900 395 T 1000 376 L 1000 460 L 0 460 Z"
              fill="#020811"
              stroke="#092238"
              strokeWidth="1.5"
            />
            {/* Rolling Sand Ripples Bathymetry with active illumination */}
            <path
              d="M0 395 Q 70 388, 140 398 T 280 394 T 420 402 T 560 396 T 700 404 T 840 395 T 1000 400 L 1000 460 L 0 460 Z"
              fill="#05121F"
              opacity="0.9"
            />

            {/* Natural Coral Heads & Marine Flora */}
            <g transform="translate(120, 375)" opacity="0.8">
              <path d="M0 20 Q 6 -12, 14 6 Q 20 -20, 28 4 Q 35 -10, 42 20 Z" fill="#0C3652" />
              <circle cx="16" cy="-8" r="3" fill="#10B981" opacity="0.7" />
              <circle cx="30" cy="-3" r="2.5" fill={colors.primary} opacity="0.6" />
            </g>
            <g transform="translate(740, 378)" opacity="0.75">
              <path d="M0 22 Q 8 -15, 18 5 Q 28 -18, 36 22 Z" fill="#0C3652" />
              <circle cx="18" cy="-10" r="3" fill="#F59E0B" opacity="0.65" />
            </g>

            {/* ── 2. SEABED TARGET 1: GHOST NET (ALDFG-01) ── */}
            <g
              transform={`translate(${ghostNetX}, ${ghostNetY})`}
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
              className="cursor-pointer group"
            >
              {/* Entangled Net Mesh Body */}
              <path
                d="M -40 28 Q -20 -10, 0 12 Q 30 -18, 55 18 Q 25 35, -40 28 Z"
                fill="#0D2A3B"
                stroke={isBeamOverNet ? '#F59E0B' : colors.primary}
                strokeWidth={isBeamOverNet ? '1.8' : '1.2'}
                strokeDasharray="4 2"
              />
              {/* Floating Buoy Floats */}
              <circle cx="-22" cy="-4" r="3.5" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
              <line x1="-22" y1="-4" x2="-24" y2="18" stroke="#F59E0B" strokeWidth="0.8" opacity="0.8" />
              <circle cx="10" cy="-15" r="4" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1" className="animate-pulse" />
              <line x1="10" y1="-15" x2="8" y2="12" stroke="#EF4444" strokeWidth="0.8" opacity="0.8" />
              <circle cx="38" cy="-8" r="3.5" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
              <line x1="38" y1="-8" x2="35" y2="16" stroke="#F59E0B" strokeWidth="0.8" opacity="0.8" />

              {/* Cast Acoustic Shadow Void on Seafloor */}
              <polygon points="55,18 165,32 140,44 -15,38" fill="#010307" opacity="0.95" />

              {/* Tactical Contact Reticle with Pulse */}
              <g opacity={isBeamOverNet ? 1 : 0.65} className="transition-all duration-300">
                <rect x="-50" y="-36" width="115" height="74" fill="none" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="1.2" strokeDasharray="5 3" />
                {/* Corner Brackets */}
                <path d="M -50 -24 L -50 -36 L -38 -36" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />
                <path d="M 53 -36 L 65 -36 L 65 -24" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />
                <path d="M 65 26 L 65 38 L 53 38" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />
                <path d="M -38 38 L -50 38 L -50 26" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="2.2" fill="none" />

                {/* Target Information Tag */}
                <rect x="-46" y="-52" width="108" height="14" fill="#031424" stroke={isBeamOverNet ? '#F59E0B' : colors.primary} strokeWidth="0.9" rx="2" />
                <text x="-42" y="-42" fill={isBeamOverNet ? '#F59E0B' : colors.primary} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  SX-T01 · GHOST NET (95.6%)
                </text>
              </g>
            </g>

            {/* ── 3. SEABED TARGET 2: SUBSEA PIPELINE INFRASTRUCTURE ── */}
            <g
              transform={`translate(${pipelineX}, 385)`}
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
              className="cursor-pointer group"
            >
              {/* Heavy Tubular Steel Pipe */}
              <line x1="-60" y1="0" x2="70" y2="0" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
              <line x1="-60" y1="-2" x2="70" y2="-2" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              {/* Concrete Saddle Clamps */}
              <rect x="-35" y="-6" width="8" height="12" fill="#334155" />
              <rect x="25" y="-6" width="8" height="12" fill="#334155" />
              {/* Pipe Target Box */}
              <g opacity={isBeamOverPipe ? 1 : 0.5}>
                <rect x="-65" y="-18" width="140" height="36" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 2" />
                <rect x="-55" y="-30" width="118" height="11" fill="#031424" stroke="#38BDF8" strokeWidth="0.8" rx="2" />
                <text x="-52" y="-22" fill="#38BDF8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  SX-T03 · PIPELINE FREE-SPAN
                </text>
              </g>
            </g>

            {/* ── 4. MARINE-FRIENDLY WILDLIFE (TURTLE, MANTA RAY, JELLYFISH, FISH SCHOOL) ── */}

            {/* Olive Ridley Sea Turtle */}
            <g
              transform={`translate(${turtleX}, ${turtleY}) rotate(${turtlePitch})`}
              onClick={() =>
                setSelectedEntity({
                  type: 'turtle',
                  title: 'Olive Ridley Sea Turtle (Lepidochelys olivacea)',
                  badge: 'PROTECTED MARINE WILDLIFE',
                  specs: [
                    { label: 'Conservation Status', value: 'Vulnerable (IUCN Red List)' },
                    { label: 'Hearing Range', value: '100 Hz – 1 kHz (Low Frequency)' },
                    { label: 'Sonar Safety', value: '100% Safe (900kHz CHIRP is inaudible)' },
                  ],
                  description:
                    'Indian coastal waters host vital nesting grounds for Olive Ridley turtles. Ghost nets are their #1 threat. SONARX enables rapid ALDFG net extraction to prevent drowning.',
                  ecoNote: 'Passive and high-frequency ultrasonic side-scan sonar does not interfere with marine reptile orientation or auditory systems.',
                })
              }
              className="cursor-pointer group"
            >
              <g transform="scale(0.95)">
                {/* Turtle Shell Carapace */}
                <ellipse cx="0" cy="0" rx="22" ry="16" fill="#0E4438" stroke="#10B981" strokeWidth="1.5" />
                {/* Scutes Pattern */}
                <ellipse cx="-2" cy="0" rx="14" ry="9" fill="#093126" stroke="#34D399" strokeWidth="0.9" strokeDasharray="4 2" />
                {/* Head with gentle turning */}
                <ellipse cx="25" cy="-2" rx="7" ry="5" fill="#134E3F" stroke="#10B981" strokeWidth="1.2" />
                <circle cx="28" cy="-3.5" r="1.2" fill="#34D399" />
                {/* Animated Flippers (Hydrodynamic Swimming) */}
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
                {/* Rear Flippers */}
                <path d="M -18 -7 C -26 -14, -31 -9, -24 -4 Z" fill="#0E4438" />
                <path d="M -18 7 C -26 14, -31 9, -24 4 Z" fill="#093126" />
                {/* Green Eco Ring */}
                <circle cx="0" cy="0" r="30" fill="none" stroke="#10B981" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 3" />
              </g>
            </g>

            {/* Giant Oceanic Manta Ray */}
            <g
              transform={`translate(${mantaX}, ${mantaY})`}
              onClick={() =>
                setSelectedEntity({
                  type: 'manta',
                  title: 'Giant Oceanic Manta Ray (Mobula birostris)',
                  badge: 'PROTECTED MARINE MEGAFAUNA',
                  specs: [
                    { label: 'Wingspan', value: '4.5 – 7.0 M' },
                    { label: 'Acoustic Impact', value: 'Zero (Pelagic Filter Feeder)' },
                    { label: 'Threat Level', value: 'Vulnerable to Abandoned Net Entanglement' },
                  ],
                  description:
                    'Manta rays cruise deep shelf edges feeding on plankton. Abandoned ghost nets anchored to reefs frequently ensnare their wing tips.',
                })
              }
              className="cursor-pointer group"
            >
              <g transform="scale(1.05)">
                {/* Manta Body & Rippling Wingtips */}
                <path
                  d={`M 0 -3 C 22 ${-24 + mantaWingWave}, 44 ${-30 + mantaWingWave}, 38 ${-20 + mantaWingWave} C 26 -6, 14 0, 6 9 C -6 9, -20 0, -30 ${-20 + mantaWingWave} C -36 ${-30 + mantaWingWave}, -14 ${-24 + mantaWingWave}, 0 -3 Z`}
                  fill="#081E33"
                  stroke="#38BDF8"
                  strokeWidth="1.2"
                  opacity="0.9"
                />
                {/* Cephalic Horns */}
                <path d="M 4 9 Q 7 16, 5 18 Q 2 13, 2 9 Z" fill="#081E33" stroke="#38BDF8" strokeWidth="0.8" />
                <path d="M -4 9 Q -7 16, -5 18 Q -2 13, -2 9 Z" fill="#081E33" stroke="#38BDF8" strokeWidth="0.8" />
                {/* Long Whip Tail */}
                <path d="M 0 -3 Q 3 -22, -5 -45 Q -3 -62, 2 -80" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.75" />
              </g>
            </g>

            {/* Deep Bioluminescent Jellyfish 1 */}
            <g transform={`translate(320, ${jelly1Y})`} opacity="0.65">
              <path
                d={`M -10 0 C -12 ${-14 + jelly1Pulse * 3}, 12 ${-14 + jelly1Pulse * 3}, 10 0 Z`}
                fill={colors.accent}
                opacity="0.3"
                stroke={colors.primary}
                strokeWidth="1"
              />
              <path d={`M -6 0 Q -8 18, -4 28`} fill="none" stroke={colors.primary} strokeWidth="0.7" opacity="0.7" />
              <path d={`M -2 0 Q 0 20, -1 32`} fill="none" stroke={colors.accent} strokeWidth="0.7" opacity="0.8" />
              <path d={`M 2 0 Q 4 19, 3 30`} fill="none" stroke={colors.accent} strokeWidth="0.7" opacity="0.8" />
              <path d={`M 6 0 Q 8 18, 5 26`} fill="none" stroke={colors.primary} strokeWidth="0.7" opacity="0.7" />
            </g>

            {/* Deep Bioluminescent Jellyfish 2 */}
            <g transform={`translate(680, ${jelly2Y})`} opacity="0.55">
              <path
                d={`M -8 0 C -10 ${-12 + jelly2Pulse * 2.5}, 10 ${-12 + jelly2Pulse * 2.5}, 8 0 Z`}
                fill="#38BDF8"
                opacity="0.25"
                stroke="#00F0FF"
                strokeWidth="0.9"
              />
              <path d={`M -4 0 Q -6 15, -3 24`} fill="none" stroke="#00F0FF" strokeWidth="0.6" opacity="0.7" />
              <path d={`M 0 0 Q 1 18, 0 27`} fill="none" stroke="#38BDF8" strokeWidth="0.6" opacity="0.8" />
              <path d={`M 4 0 Q 6 15, 3 22`} fill="none" stroke="#00F0FF" strokeWidth="0.6" opacity="0.7" />
            </g>

            {/* School of 12 Neon Mackerel / Tetras darting in synchrony */}
            <g opacity="0.8">
              {[
                { dx: 0, dy: 0 },
                { dx: 14, dy: -6 },
                { dx: 28, dy: 3 },
                { dx: 42, dy: -4 },
                { dx: 12, dy: 10 },
                { dx: 26, dy: 15 },
                { dx: 40, dy: 8 },
                { dx: 54, dy: 12 },
                { dx: -12, dy: 5 },
                { dx: 20, dy: -12 },
                { dx: 34, dy: -16 },
                { dx: 48, dy: -9 },
              ].map((f, i) => {
                const schoolBaseX = 400 + ((time * 26) % 800) - 100;
                const fx = schoolBaseX + f.dx + Math.sin(time * 2.5 + i) * 8;
                const fy = 200 + f.dy + Math.cos(time * 2.0 + i) * 6;
                return (
                  <ellipse
                    key={i}
                    cx={fx}
                    cy={fy}
                    rx="5"
                    ry="1.8"
                    fill={colors.accent}
                    opacity="0.7"
                    className="transition-all"
                  />
                );
              })}
            </g>

            {/* ── 5. TOW CABLE (DYNAMIC CATENARY FLEX CURVE) ── */}
            {/* The armored tow cable trailing backward from ship's A-frame to towfish */}
            <path
              d={`M ${shipBaseX - 18} ${shipY + 12} Q ${cableMidX} ${cableMidY}, ${towfishX + 4} ${towfishY + 4}`}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              opacity="0.95"
            />
            {/* Cable vibration strain node */}
            <circle cx={cableMidX} cy={cableMidY} r="2.5" fill="#FBBF24" className="animate-ping" />

            {/* ── 6. TOWED SIDE-SCAN SONAR TOWFISH (AUV GLIDER) ── */}
            <g
              transform={`translate(${towfishX}, ${towfishY}) rotate(${towfishPitch})`}
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
                    { label: 'Slant Range Math', value: 'G = sqrt(R² - H²)' },
                  ],
                  description:
                    'Hydrodynamic towfish maintaining stable trim to deliver clean acoustic waterfalls. Emits high-frequency sound pulses to generate high-contrast seabed highlight and shadow relief.',
                })
              }
              className="cursor-pointer group"
            >
              {/* Towfish Hull (High-visibility oceanic yellow with black tactical rings) */}
              <ellipse cx="0" cy="0" rx="24" ry="7.5" fill="#FACC15" stroke="#EAB308" strokeWidth="1.6" />
              <rect x="-9" y="-7" width="4.5" height="14" fill="#0F172A" />
              <rect x="5" y="-7" width="4.5" height="14" fill="#0F172A" />

              {/* Nose Acoustic Dome Transducer */}
              <ellipse cx="22" cy="0" rx="4.5" ry="6.5" fill="#0284C7" stroke={colors.primary} strokeWidth="1.2" />

              {/* Stabilizer Fins */}
              <polygon points="-22,-2 -31,-12 -26,-2" fill="#CA8A04" stroke="#A16207" strokeWidth="1" />
              <polygon points="-22,2 -31,12 -26,2" fill="#CA8A04" stroke="#A16207" strokeWidth="1" />
              <polygon points="-24,0 -33,0 -26,-2" fill="#CA8A04" />

              {/* Towing Bridle Connection */}
              <circle cx="0" cy="-6.5" r="2.2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />

              {/* Blinking Live Transducer LED */}
              <circle cx="18" cy="-4" r="2" fill="#10B981" className="animate-ping" />
              <circle cx="18" cy="-4" r="1.5" fill="#10B981" />

              {/* ── DUAL ACOUSTIC SONAR FAN BEAM (EXPANDING CONE) ── */}
              {sonarActive && (
                <g>
                  {/* Left (Port) Acoustic Fan Beam Cone projecting down */}
                  <polygon
                    points={`0,4 ${-beamWidth - beamSweep * 35},${390 - towfishY} ${beamWidth + beamSweep * 35},${390 - towfishY}`}
                    fill="url(#active-sonar-beam)"
                    opacity="0.55"
                  />

                  {/* Pulsing Acoustic Sound Wavefront Arcs */}
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
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={18 + beamSweep * 70}
                    ry={10 + beamSweep * 45}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth="1.2"
                    opacity={0.9 - beamSweep * 0.9}
                  />
                </g>
              )}

              {/* Towfish Status HUD Pill */}
              <g transform="translate(-35, -24)">
                <rect x="0" y="0" width="84" height="13" fill="#020914" stroke={colors.primary} strokeWidth="0.9" rx="3" />
                <text x="5" y="9.5" fill={colors.primary} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  TOWFISH · 8.4M ALT
                </text>
              </g>
            </g>

            {/* ── 7. SURFACE WAVES & HYDROGRAPHIC SURVEY SHIP ── */}
            {/* Ambient Animated Ocean Waves */}
            <path
              d={`M 0 52 Q 50 ${46 + Math.sin(time * 3) * 3}, 100 52 T 200 52 T 300 52 T 400 52 T 500 52 T 600 52 T 700 52 T 800 52 T 900 52 T 1000 52 L 1000 70 L 0 70 Z`}
              fill="#062238"
              opacity="0.8"
            />
            <path
              d={`M 0 56 Q 60 ${50 + Math.cos(time * 2.8) * 3}, 120 56 T 240 56 T 360 56 T 480 56 T 600 56 T 720 56 T 840 56 T 960 56 T 1000 56 L 1000 80 L 0 80 Z`}
              fill="#031526"
            />

            {/* R/V SAGARIKA — Hydrographic Survey Vessel (Cruising) */}
            <g
              transform={`translate(${shipBaseX}, ${shipY}) rotate(${shipPitch})`}
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
              className="cursor-pointer group"
            >
              {/* Foaming Stern Wake & Propeller Wash */}
              <ellipse cx="-32" cy="11" rx="24" ry="4.5" fill="#E2E8F0" opacity="0.45" />
              <ellipse cx="-55" cy="12" rx="35" ry="3.5" fill="#E2E8F0" opacity="0.3" />
              <ellipse cx="-80" cy="13" rx="42" ry="2.5" fill="#E2E8F0" opacity="0.18" />

              {/* Ship Hull (Deep Navy with sharp White Upper Deck) */}
              <path
                d="M -24 11 L 52 11 Q 74 11, 84 0 L 80 -7 L -22 -7 Z"
                fill="#0D2742"
                stroke="#1E4D7B"
                strokeWidth="1.4"
              />
              {/* Red Waterline Striping */}
              <line x1="-24" y1="8" x2="78" y2="8" stroke="#EF4444" strokeWidth="1.8" />

              {/* White Upper Superstructure */}
              <polygon points="-18,-7 52,-7 46,-22 -12,-22" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />

              {/* Bridge Cabin & Navigation Windows */}
              <polygon points="14,-22 42,-22 38,-33 18,-33" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
              {/* Amber glowing bridge windows */}
              <rect x="22" y="-31" width="5.5" height="5.5" fill="#F59E0B" />
              <rect x="30" y="-31" width="5.5" height="5.5" fill="#F59E0B" />

              {/* Communication Mast & Radars */}
              <line x1="28" y1="-33" x2="28" y2="-48" stroke="#64748B" strokeWidth="1.6" />
              <line x1="22" y1="-41" x2="34" y2="-41" stroke="#64748B" strokeWidth="1.2" />
              {/* Rotating Radar Scanner */}
              <ellipse cx="28" cy="-48" rx="6" ry="1.8" fill="#38BDF8" className="animate-spin" />
              {/* Satellite Dome */}
              <circle cx="4" cy="-26" r="5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />

              {/* Heavy Hydraulic Stern A-Frame Winch Crane */}
              <polygon points="-20,-7 -15,-25 -13,-25 -15,-7" fill="#F59E0B" />
              <polygon points="-26,-7 -15,-25 -13,-25 -22,-7" fill="#D97706" />
              <circle cx="-14" cy="-25" r="3" fill="#475569" />

              {/* Ship Vessel Decal */}
              <text x="2" y="2" fill="#94A3B8" fontSize="6" fontFamily="monospace" fontWeight="bold">
                R/V SAGARIKA
              </text>
            </g>
          </svg>

          {/* Floating High-Tech USBL Telemetry Badge */}
          <div className="absolute top-3 right-4 bg-[#030B17]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#00F0FF]/40 font-mono text-[11px] text-[#00F0FF] flex items-center gap-2.5 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-bold">USBL ACOUSTIC LOCK: STABLE (99.8%)</span>
          </div>

          {/* Floating Interactive Quick Tip */}
          <div className="absolute top-3 left-4 bg-[#030B17]/85 backdrop-blur-md px-3 py-1 rounded-md border border-[#1E3A5F] text-[10.5px] font-mono text-[#94A3B8] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Interactive: Click on Ship, Towfish, Turtle, Net, or Pipe to inspect telemetry</span>
          </div>

          {/* Bottom Ambient Legend */}
          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#34D399]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Marine-Safe High-Frequency Acoustics (Ultrasonic Passive Chirp)
              </span>
              <span className="hidden sm:inline text-[#334155]">|</span>
              <span className="hidden sm:inline text-[#38BDF8]">
                Benthic Habitat Conservation Mode
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#00F0FF]">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Ray-Traced Shadow Math: $L = \frac{'{'}h \cdot G{'}'}{'{'}H - h{'}'}$</span>
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
