import React, { useState, useEffect, useRef } from 'react';
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
  Crosshair,
  Printer,
  Download,
  Share2,
  ChevronRight,
  ScanLine,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SonarCanvasField } from '../components/animation/SonarCanvasField';
import { DetectionPulse } from '../components/animation/DetectionPulse';

export const OverviewPage: React.FC = () => {
  const { setActiveTab } = useApp();

  // Section 2: Problem Raw vs Denoised Enhancement state
  const [denoiseLevel, setDenoiseLevel] = useState<number>(65); // 0-100%
  const [isDenoiseAnimating, setIsDenoiseAnimating] = useState<boolean>(false);

  // Section 3: AI Scan Line Animation state
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // Section 4: Pipeline Active Stage state
  const [activePipelineStage, setActivePipelineStage] = useState<number>(2); // Default to YOLOv8n

  // Section 5: Selected Map Target
  const [selectedGeoTarget, setSelectedGeoTarget] = useState<string>('SX-T07');

  // Sonar Scan Loop
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 1.25));
    }, 40);
    return () => clearInterval(interval);
  }, [isScanning]);

  const pipelineStages = [
    {
      id: 0,
      code: '01 INGEST',
      name: 'SONAR INPUT',
      sub: '900 kHz Telemetry Stream',
      desc: 'Raw dual-channel port and starboard hydrophone array data acquisition.',
      tech: 'Slant-Range Normalization',
      latency: '12 ms',
    },
    {
      id: 1,
      code: '02 PREPROCESS',
      name: 'PREPROCESSING',
      sub: 'Bilateral Speckle Denoising',
      desc: 'Removes acoustic reverberation and applies CLAHE local contrast adaptation.',
      tech: 'Adaptive Histogram Equalization',
      latency: '18 ms',
    },
    {
      id: 2,
      code: '03 INFERENCE',
      name: 'YOLOv8n PERCEPTION',
      sub: 'Marine Target Detection',
      desc: 'Executes anchor-free tensor forward pass on single-channel acoustic backscatter.',
      tech: 'ONNX Runtime (CPU/Edge)',
      latency: '42 ms',
    },
    {
      id: 3,
      code: '04 FILTER',
      name: 'ACOUSTIC FILTER',
      sub: 'False-Positive Suppression',
      desc: 'Validates 3D acoustic shadow relief to filter flat basalt rocks and sand bedforms.',
      tech: 'Shadow Trigonometry Gate',
      latency: '8 ms',
    },
    {
      id: 4,
      code: '05 CLASSIFY',
      name: 'CLASSIFICATION',
      sub: 'MoES Debris Taxonomy',
      desc: 'Categorizes Ghost Nets (ALDFG), lost fishing gear, pipelines, and seabed clutter.',
      tech: 'Multi-Class Confidence Matrix',
      latency: '14 ms',
    },
    {
      id: 5,
      code: '06 GEOTAG',
      name: 'GEOTAGGING',
      sub: 'Survey Coordinate Sync',
      desc: 'Triangulates target contact coordinates with towfish USBL navigation fixes.',
      tech: 'WGS-84 Sensor Reference',
      latency: '20 ms',
    },
    {
      id: 6,
      code: '07 REPORT',
      name: 'INTELLIGENCE DOSSIER',
      sub: 'Actionable Incident Advisory',
      desc: 'Compiles environmental hazard rankings and ROV recovery profiles for MoES.',
      tech: 'Structured JSON/PDF Export',
      latency: '25 ms',
    },
  ];

  const geoDetections = [
    {
      id: 'SX-T07',
      label: 'Ghost Net (ALDFG)',
      confidence: 94.7,
      lat: '18.5204° N',
      lon: '73.8567° E',
      depth: '43.1 m',
      priority: 'CRITICAL',
      status: 'VERIFIED',
      color: '#00D4AA',
      shadow: '2.31m (0.82m relief)',
      hazard: 'High risk of continuous marine life and gillnet entanglement.',
    },
    {
      id: 'SX-T14',
      label: 'Lost Trawl Gear',
      confidence: 91.2,
      lat: '18.5188° N',
      lon: '73.8612° E',
      depth: '38.5 m',
      priority: 'MEDIUM',
      status: 'REQUIRES REVIEW',
      color: '#F59E0B',
      shadow: '1.85m (0.64m relief)',
      hazard: 'Metallic obstruction on trawl navigation corridor.',
    },
    {
      id: 'SX-T03',
      label: 'Pipeline Free-Span',
      confidence: 88.9,
      lat: '18.5240° N',
      lon: '73.8510° E',
      depth: '51.2 m',
      priority: 'HIGH',
      status: 'INFRASTRUCTURE',
      color: '#38BDF8',
      shadow: '3.10m (1.15m relief)',
      hazard: 'Exposed unsupported subsea pipeline spanning acoustic void.',
    },
  ];

  const activeGeoTarget = geoDetections.find((d) => d.id === selectedGeoTarget) || geoDetections[0];

  return (
    <div className="space-y-12 font-mono select-none text-[11px] text-[#E0F7F4] pb-16">
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO EXPERIENCE WITH CIRCULAR SONAR FIELD
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[520px] md:min-h-[580px] w-full rounded-xs bg-[#01050A] border border-[#0D2E4A] overflow-hidden flex items-center justify-center p-6 md:p-10 shadow-2xl">
        {/* Subtle Living Background Sonar Sweep & Floating Particles Field */}
        <div className="absolute inset-0 z-0">
          <SonarCanvasField
            showOpeningSequence={false}
            onTargetClick={(id) => {
              setSelectedGeoTarget(id);
            }}
          />
        </div>

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10 opacity-70" />

        {/* Center Hero Information Card */}
        <div className="relative z-20 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#05121F]/90 border border-[#00D4AA]/50 text-[#00D4AA] text-[9.5px] font-bold rounded-xs shadow-[0_0_15px_rgba(0,212,170,0.2)] backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-[#00D4AA] animate-pulse" />
            <span>FROM ACOUSTIC ECHO → DETECTION → VERIFIED INTELLIGENCE</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#E0F7F4] tracking-tight uppercase">
              SONAR<span className="text-[#00D4AA] drop-shadow-[0_0_15px_rgba(0,212,170,0.6)]">X</span>
            </h1>
            <p className="text-sm md:text-base font-bold text-[#00D4AA] tracking-widest uppercase">
              AI-POWERED SIDE-SCAN SONAR INTELLIGENCE
            </p>
          </div>

          <p className="text-xs md:text-[12.5px] text-[#7C98A6] max-w-xl mx-auto leading-relaxed">
            Transform complex acoustic imagery into detected, verified, and geotagged marine intelligence.
            Engineered for the Ministry of Earth Sciences (MoES) and Indian hydrographic survey teams.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('scan')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00D4AA] text-[#030B14] font-black text-xs hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(0,212,170,0.4)] rounded-xs transition-all cursor-pointer group"
            >
              <UploadCloud className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>ANALYZE SONAR</span>
            </button>

            <button
              onClick={() => setActiveTab('mission')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#05121F]/90 border border-[#00D4AA]/60 hover:border-[#00D4AA] text-[#E0F7F4] hover:text-[#00D4AA] font-bold text-xs rounded-xs transition-all cursor-pointer backdrop-blur-md shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#00D4AA]" />
              <span>EXPLORE PLATFORM</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#030B14]/80 border border-[#0D2E4A] hover:border-[#00D4AA]/40 text-[#7C98A6] hover:text-[#E0F7F4] font-bold text-xs rounded-xs transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>SUBSEA MAP</span>
            </button>
          </div>

          {/* Interactive Hint */}
          <div className="pt-2 text-[8.5px] text-[#4A8090] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            <span>Interactive Sonar Field: Move cursor to illuminate acoustic data points & lock target coordinates</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — THE PROBLEM: RAW SONAR TO ENHANCED CLARITY
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#05121F] border border-[#0D2E4A] p-6 md:p-8 rounded-xs space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#0D2E4A] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[9.5px] font-bold text-[#F59E0B] uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>THE UNDERWATER ACOUSTIC CHALLENGE</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-[#E0F7F4] uppercase tracking-wide">
              Complex acoustic environments make manual interpretation difficult.
            </h2>
            <p className="text-[10px] text-[#7C98A6] mt-0.5">
              Side-scan sonar backscatter suffers from Rayleigh speckle noise, transmission loss, and seabed sediment ripples that obscure faint ghost nets.
            </p>
          </div>

          {/* Enhancement Interactive Slider */}
          <div className="flex items-center gap-3 bg-[#030B14] border border-[#0D2E4A] p-2 rounded-xs shrink-0 text-[9px]">
            <span className="text-[#EF4444] font-bold">RAW NOISE</span>
            <input
              type="range"
              min="0"
              max="100"
              value={denoiseLevel}
              onChange={(e) => setDenoiseLevel(Number(e.target.value))}
              className="w-28 md:w-36 h-1.5 bg-[#0A1E30] accent-[#00D4AA] cursor-pointer"
            />
            <span className="text-[#00D4AA] font-bold">ENHANCED (CLAHE)</span>
          </div>
        </div>

        {/* Realistic Sonar Viewport with Dynamic Denoise Shader Simulation */}
        <div className="relative h-60 md:h-72 w-full bg-[#01050A] border border-[#0D2E4A] rounded-xs overflow-hidden flex items-center justify-center">
          {/* Authentic Sonar Texture Backscatter Background */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(0, 212, 170, 0.15) 0%, rgba(5, 18, 31, 0.95) 75%)`,
            }}
          />

          {/* Grainy Noise Overlay (Fades as denoiseLevel increases) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60 transition-opacity duration-300"
            style={{
              opacity: Math.max(0.08, (100 - denoiseLevel) / 100 * 0.75),
              backgroundImage: `radial-gradient(#7C98A6 1px, transparent 1px)`,
              backgroundSize: '4px 4px',
            }}
          />

          {/* Central Nadir Acoustic Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-10 -translate-x-1/2 bg-[#01050A] border-x border-[#0D2E4A]/80 flex flex-col items-center justify-center text-[7.5px] text-[#4A8090]">
            <span className="-rotate-90 tracking-widest uppercase">NADIR TRACK</span>
          </div>

          {/* Sonar Swath Highlights & Embedded Ghost Net */}
          <div className="relative z-10 flex items-center justify-around w-full px-8">
            {/* Left Port Channel: Sediment Clutter vs Target */}
            <div className="space-y-1">
              <div
                className="p-3 border rounded-xs transition-all duration-300"
                style={{
                  borderColor: denoiseLevel > 50 ? '#00D4AA' : 'rgba(239, 68, 68, 0.4)',
                  backgroundColor: denoiseLevel > 50 ? 'rgba(0, 212, 170, 0.12)' : 'rgba(239, 68, 68, 0.05)',
                }}
              >
                <div className="flex items-center justify-between gap-3 text-[9px] font-bold">
                  <span className={denoiseLevel > 50 ? 'text-[#00D4AA]' : 'text-[#EF4444]'}>
                    {denoiseLevel > 50 ? '✓ RECOVERED TARGET: GHOST NET (ALDFG)' : '✕ OBSCURED IN ACOUSTIC NOISE'}
                  </span>
                  <span className="text-[8px] text-[#7C98A6]">RANGE: 18.4m</span>
                </div>
                <div className="text-[8px] text-[#7C98A6] mt-1">
                  {denoiseLevel > 50
                    ? 'Bilateral filtering separated specular nylon highlight from 2.31m acoustic shadow void.'
                    : 'High seabed speckle reverberation impedes visual human confirmation.'}
                </div>
              </div>
            </div>

            {/* Right Starboard Channel: Natural Rock Rejection */}
            <div className="p-3 border border-dashed border-[#7C98A6]/40 bg-[#030B14]/70 rounded-xs text-[9px] space-y-0.5">
              <div className="text-[#F59E0B] font-bold">NATURAL BEDROCK RIDGE</div>
              <div className="text-[8px] text-[#7C98A6]">Flat morphology · Filtered by shadow geometry gate</div>
            </div>
          </div>

          {/* Visual Status Indicator */}
          <div className="absolute bottom-2 left-3 bg-[#030B14]/90 border border-[#0D2E4A] px-2 py-0.5 text-[8.5px] text-[#7C98A6] flex items-center gap-2">
            <span>FILTER LEVEL: <strong className="text-[#00D4AA]">{denoiseLevel}%</strong></span>
            <span>·</span>
            <span>SPECKLE ATTENUATION: <strong className="text-[#E0F7F4]">-18.4 dB</strong></span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — AI OBJECT DETECTION (REAL DETECTION SCAN)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#05121F] border border-[#0D2E4A] p-6 md:p-8 rounded-xs space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#0D2E4A] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[9.5px] font-bold text-[#00D4AA] uppercase">
              <Cpu className="w-3.5 h-3.5" />
              <span>YOLOv8n DEEP LEARNING COMPUTER VISION</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-[#E0F7F4] uppercase tracking-wide">
              Real-time neural detection across side-scan sonar swaths.
            </h2>
            <p className="text-[10px] text-[#7C98A6] mt-0.5">
              Trained specifically on marine debris classes with anchor-free spatial bounding boxes and empirical confidence estimation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setScanProgress(0);
                setIsScanning(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#082830] border border-[#00D4AA]/50 hover:border-[#00D4AA] text-[#00D4AA] text-[9.5px] font-bold rounded-xs transition-colors cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>RE-RUN AI SCAN</span>
            </button>
          </div>
        </div>

        {/* Interactive Sonar Scan Canvas Simulation */}
        <div className="relative h-64 md:h-80 w-full bg-[#01050A] border border-[#0D2E4A] rounded-xs overflow-hidden">
          {/* Subtle Sonar Waterfall Background Grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00D4AA_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Central Nadir Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 bg-[#02070D] border-x border-[#0D2E4A]" />

          {/* 1. Detection Target Box: Ghost Net (Appears after scan line passes 30%) */}
          {scanProgress >= 28 && (
            <div
              className="absolute left-[18%] top-[35%] w-36 h-24 border-2 border-[#00D4AA] bg-[#00D4AA]/10 p-1.5 transition-all duration-300 animate-in fade-in zoom-in-95 rounded-xs shadow-[0_0_15px_rgba(0,212,170,0.3)]"
            >
              <div className="bg-[#030B14] border border-[#00D4AA] px-1.5 py-0.5 text-[8.5px] text-[#00D4AA] font-bold inline-block">
                GHOST NET · 94.7%
              </div>
              <div className="text-[7.5px] text-[#E0F7F4] mt-1 space-y-0.5">
                <div>DIM: 12.4m × 3.2m</div>
                <div>SHADOW: 2.31m RELIEF</div>
              </div>
            </div>
          )}

          {/* 2. Detection Target Box: Anthropogenic Debris (Appears after scan line passes 55%) */}
          {scanProgress >= 50 && (
            <div
              className="absolute right-[22%] top-[25%] w-32 h-20 border-2 border-[#38BDF8] bg-[#38BDF8]/10 p-1.5 transition-all duration-300 animate-in fade-in zoom-in-95 rounded-xs shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              <div className="bg-[#030B14] border border-[#38BDF8] px-1.5 py-0.5 text-[8.5px] text-[#38BDF8] font-bold inline-block">
                DEBRIS · 91.2%
              </div>
              <div className="text-[7.5px] text-[#E0F7F4] mt-1 space-y-0.5">
                <div>METALLIC CONTAINER</div>
                <div>DEPTH: -38.5m</div>
              </div>
            </div>
          )}

          {/* 3. Detection Target Box: Pipeline Hazard (Appears after scan line passes 75%) */}
          {scanProgress >= 70 && (
            <div
              className="absolute left-[28%] bottom-[18%] w-40 h-16 border-2 border-[#F59E0B] bg-[#F59E0B]/10 p-1.5 transition-all duration-300 animate-in fade-in zoom-in-95 rounded-xs shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <div className="bg-[#030B14] border border-[#F59E0B] px-1.5 py-0.5 text-[8.5px] text-[#F59E0B] font-bold inline-block">
                PIPELINE · 88.9%
              </div>
              <div className="text-[7.5px] text-[#E0F7F4] mt-1">FREE-SPAN EXPOSURE</div>
            </div>
          )}

          {/* The Animated Acoustic Scan Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#00D4AA]/20 via-[#00D4AA] to-[#00D4AA]/20 shadow-[0_0_20px_#00D4AA] pointer-events-none transition-all duration-75"
            style={{ left: `${scanProgress}%` }}
          >
            <div className="absolute top-2 -left-10 bg-[#00D4AA] text-[#030B14] px-1.5 py-0.2 text-[7.5px] font-black tracking-wider rounded-xs">
              AI SCANNER
            </div>
          </div>

          {/* Bottom Telemetry Overlay */}
          <div className="absolute bottom-2 left-3 right-3 bg-[#030B14]/90 border border-[#0D2E4A] px-3 py-1.5 flex items-center justify-between text-[8.5px] text-[#7C98A6]">
            <div>
              SWATH FRAME: <strong className="text-[#00D4AA]">LINE-088</strong> · FREQ: <strong className="text-[#E0F7F4]">900 kHz</strong>
            </div>
            <div className="flex items-center gap-3">
              <span>SCAN PROGRESS: <strong className="text-[#00D4AA]">{Math.floor(scanProgress)}%</strong></span>
              <span>·</span>
              <span>INFERENCE: <strong className="text-[#00D4AA]">42 ms</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — THE SONARX PIPELINE (ANIMATED STAGE ACTIVATION)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#05121F] border border-[#0D2E4A] p-6 md:p-8 rounded-xs space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#0D2E4A] pb-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[9.5px] font-bold text-[#00D4AA] uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>THE COMPLETE 7-STAGE INTELLIGENCE PIPELINE</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-[#E0F7F4] uppercase tracking-wide">
              From raw transducer echo to verifiable incident dossiers.
            </h2>
          </div>
          <span className="text-[8.5px] px-2 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs font-bold">
            TOTAL LATENCY: 119 ms
          </span>
        </div>

        {/* Horizontal Interactive Pipeline Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {pipelineStages.map((stage) => {
            const isActive = activePipelineStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActivePipelineStage(stage.id)}
                className={`p-3 rounded-xs border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 ${
                  isActive
                    ? 'bg-[#082830] border-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.25)] scale-[1.02]'
                    : 'bg-[#030B14] border-[#0D2E4A] hover:border-[#00D4AA]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[8px] mb-1">
                    <span className="font-black text-[#00D4AA]">{stage.code}</span>
                    <span className="text-[#4A8090] font-mono">{stage.latency}</span>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-wide ${isActive ? 'text-[#E0F7F4]' : 'text-[#7C98A6]'}`}>
                    {stage.name}
                  </div>
                  <div className="text-[8.5px] text-[#00D4AA] font-bold mt-0.5">
                    {stage.sub}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#0D2E4A]/80 text-[7.5px] text-[#4A8090] flex items-center justify-between">
                  <span className="truncate">{stage.tech}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-ping shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Detailed Spotlight Box */}
        <div className="p-4 bg-[#030B14] border border-[#00D4AA]/40 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00D4AA] text-[#030B14] font-black text-[9px] rounded-xs uppercase">
                ACTIVE STAGE: {pipelineStages[activePipelineStage].code}
              </span>
              <h3 className="text-sm font-black text-[#E0F7F4] uppercase">
                {pipelineStages[activePipelineStage].name} · {pipelineStages[activePipelineStage].sub}
              </h3>
            </div>
            <p className="text-[10px] text-[#7C98A6] leading-relaxed">
              {pipelineStages[activePipelineStage].desc}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setActivePipelineStage((prev) => (prev + 1) % pipelineStages.length)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#082830] border border-[#0D2E4A] hover:border-[#00D4AA] text-[#00D4AA] text-[9.5px] font-bold rounded-xs cursor-pointer transition-colors"
            >
              <span>NEXT PIPELINE STEP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 & 6 — GEOSPATIAL MAP & INTELLIGENCE REPORT
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 5: GEOSPATIAL INTELLIGENCE */}
        <section className="bg-[#05121F] border border-[#0D2E4A] p-6 rounded-xs space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1 border-b border-[#0D2E4A] pb-3">
            <div className="inline-flex items-center gap-2 text-[9.5px] font-bold text-[#00D4AA] uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>GEOSPATIAL INTELLIGENCE & SENSOR FIX</span>
            </div>
            <h2 className="text-sm font-black text-[#E0F7F4] uppercase tracking-wide">
              Triangulating acoustic anomalies with WGS-84 coordinates.
            </h2>
          </div>

          {/* Interactive Target Map Selection Pills */}
          <div className="flex flex-wrap gap-1.5">
            {geoDetections.map((d) => {
              const isSelected = selectedGeoTarget === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedGeoTarget(d.id)}
                  className={`px-2.5 py-1 text-[9px] font-bold border transition-all cursor-pointer rounded-xs ${
                    isSelected
                      ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA] shadow-[0_0_10px_rgba(0,212,170,0.3)]'
                      : 'bg-[#030B14] text-[#7C98A6] border-[#0D2E4A] hover:text-[#E0F7F4]'
                  }`}
                >
                  {d.id} · {d.label}
                </button>
              );
            })}
          </div>

          {/* Target Geolocation Dossier Card */}
          <div className="p-4 bg-[#030B14] border border-[#00D4AA]/40 rounded-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DetectionPulse color={activeGeoTarget.color} size={14} />
                <span className="text-xs font-black text-[#E0F7F4]">{activeGeoTarget.id} · {activeGeoTarget.label}</span>
              </div>
              <span className="text-[8.5px] font-bold px-2 py-0.5 bg-[#082830] text-[#00D4AA] border border-[#00D4AA]/40 rounded-xs">
                {activeGeoTarget.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
                <span className="text-[#4A8090] text-[8px] uppercase block">WGS-84 COORDINATES</span>
                <strong className="text-[#E0F7F4]">{activeGeoTarget.lat}, {activeGeoTarget.lon}</strong>
              </div>
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
                <span className="text-[#4A8090] text-[8px] uppercase block">BATHYMETRIC DEPTH</span>
                <strong className="text-[#00D4AA]">{activeGeoTarget.depth} (USBL Fix)</strong>
              </div>
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
                <span className="text-[#4A8090] text-[8px] uppercase block">ACOUSTIC SHADOW</span>
                <strong className="text-[#E0F7F4]">{activeGeoTarget.shadow}</strong>
              </div>
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A]">
                <span className="text-[#4A8090] text-[8px] uppercase block">AI CONFIDENCE</span>
                <strong className="text-[#00D4AA]">{activeGeoTarget.confidence}% (YOLOv8n)</strong>
              </div>
            </div>

            <div className="text-[8.5px] text-[#7C98A6] p-2 bg-[#082830] border border-[#0D2E4A] rounded-xs">
              <strong className="text-[#00D4AA]">HAZARD ASSESSMENT: </strong> {activeGeoTarget.hazard}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="w-full py-2 bg-[#082830] border border-[#0D2E4A] hover:border-[#00D4AA] text-[#00D4AA] text-[10px] font-bold rounded-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>OPEN INTERACTIVE SUBSEA MAP VIEW</span>
          </button>
        </section>

        {/* SECTION 6: INTELLIGENCE REPORT CAROUSEL / DOSSIER */}
        <section className="bg-[#05121F] border border-[#0D2E4A] p-6 rounded-xs space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1 border-b border-[#0D2E4A] pb-3">
            <div className="inline-flex items-center gap-2 text-[9.5px] font-bold text-[#00D4AA] uppercase">
              <FileText className="w-3.5 h-3.5" />
              <span>FORMAL ANOMALY REPORT & DOSSIER</span>
            </div>
            <h2 className="text-sm font-black text-[#E0F7F4] uppercase tracking-wide">
              Ministry of Earth Sciences (MoES) Compliance Summary.
            </h2>
          </div>

          {/* Formatted Intelligence Report Card */}
          <div className="p-4 bg-[#030B14] border border-[#0D2E4A] rounded-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#0D2E4A] pb-2">
              <div>
                <div className="text-xs font-black text-[#E0F7F4]">MX-026 // INCIDENT ADVISORY</div>
                <div className="text-[8px] text-[#4A8090]">MUMBAI CONTINENTAL SHELF SURVEY</div>
              </div>
              <span className="text-[8.5px] px-2 py-0.5 bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold rounded-xs">
                PRIORITY 1 · CRITICAL
              </span>
            </div>

            <div className="space-y-1.5 text-[9px] text-[#7C98A6]">
              <div className="flex justify-between">
                <span>Total Candidates Detected:</span>
                <strong className="text-[#E0F7F4]">17 targets</strong>
              </div>
              <div className="flex justify-between">
                <span>Natural Clutter / Rocks Filtered:</span>
                <strong className="text-[#EF4444]">7 formations rejected</strong>
              </div>
              <div className="flex justify-between">
                <span>Confirmed Marine Debris:</span>
                <strong className="text-[#00D4AA]">10 targets verified</strong>
              </div>
              <div className="flex justify-between">
                <span>Flagship Entanglement Threat:</span>
                <strong className="text-[#00D4AA]">SX-T07 Ghost Net (94.7%)</strong>
              </div>
            </div>

            <div className="p-2 bg-[#05121F] border border-[#0D2E4A] text-[8px] text-[#7C98A6]">
              <span className="text-[#00D4AA] font-bold">RECOVERY RECOMMENDATION: </span>
              Deploy autonomous ROV retrieval unit equipped with acoustic transponder beacon within 48-hour operational window.
            </div>
          </div>

          {/* Report Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('reports')}
              className="flex-1 py-2 bg-[#00D4AA] text-[#030B14] font-black text-[10px] rounded-xs flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 shadow-[0_0_12px_rgba(0,212,170,0.3)] cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>VIEW FULL DOSSIER & EXPORT PDF</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
