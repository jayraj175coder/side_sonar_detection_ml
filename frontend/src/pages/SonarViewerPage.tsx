import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Compass,
  Radio,
  Layers,
  Crosshair,
  Sliders,
  Maximize2,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Eye,
  AlertTriangle,
  ShieldAlert,
  Info,
  ExternalLink,
  Download,
  Ship,
  Wind,
  Waves,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileCode,
  BookOpen,
  Cpu,
} from 'lucide-react';
import {
  DEBRIS_INTELLIGENCE_SCENARIOS,
  DebrisScenarioIntel,
  DebrisCandidate,
} from '../data/debrisIntelligenceData';

type StepType = '01 DETECT' | '02 DRIFT' | '03 TRAFFIC' | '04 ATTRIBUTE' | '05 EVIDENCE' | '06 METHOD';

export const SonarViewerPage: React.FC = () => {
  // 1. Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('kutch-dark');
  const activeScenario: DebrisScenarioIntel =
    DEBRIS_INTELLIGENCE_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    DEBRIS_INTELLIGENCE_SCENARIOS[0];

  // 2. Step Navigation (Driving canvas accumulative rendering)
  const [activeStep, setActiveStep] = useState<StepType>('05 EVIDENCE');

  // 3. Layer Toggles (User can override or let activeStep drive defaults)
  const [layerDetection, setLayerDetection] = useState<boolean>(true);
  const [layerReleaseExtent, setLayerReleaseExtent] = useState<boolean>(true);
  const [layerOriginField, setLayerOriginField] = useState<boolean>(true);
  const [layerParticles, setLayerParticles] = useState<boolean>(true);
  const [layerAisTraffic, setLayerAisTraffic] = useState<boolean>(true);
  const [layerCandidates, setLayerCandidates] = useState<boolean>(true);
  const [layerRadarTargets, setLayerRadarTargets] = useState<boolean>(true);
  const [layerForecast, setLayerForecast] = useState<boolean>(true);

  // 4. Candidate Selection
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    activeScenario.candidates[0]?.id || 'CAND-01'
  );
  const activeCandidate: DebrisCandidate =
    activeScenario.candidates.find((c) => c.id === selectedCandidateId) ||
    activeScenario.candidates[0];

  // 5. Interactive Timeline State (-24h to +48h)
  const [timelineHour, setTimelineHour] = useState<number>(0); // 0 = T0 acquisition
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 4 | 12>(4);

  // Canvas Ref for Particle & Vector Map
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const eventLogEndRef = useRef<HTMLDivElement>(null);

  const particleStateRef = useRef<
    { x: number; y: number; vx: number; vy: number; age: number; life: number }[]
  >([]);

  // Initialize Lagrangian Particle Cloud
  useEffect(() => {
    const particles = [];
    const count = 380;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: 0.45 + (Math.random() - 0.5) * 0.15,
        y: 0.4 + (Math.random() - 0.5) * 0.15,
        vx: 0.0004 + (Math.random() - 0.5) * 0.0002,
        vy: -0.0003 + (Math.random() - 0.5) * 0.0002,
        age: Math.random() * 100,
        life: 80 + Math.random() * 40,
      });
    }
    particleStateRef.current = particles;
  }, [selectedScenarioId]);

  // Auto-scroll event log to bottom smoothly
  useEffect(() => {
    if (eventLogEndRef.current) {
      eventLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeScenario]);

  // Animation Loop for Timeline & Cumulative Step-Driven Canvas
  useEffect(() => {
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Advance timeline if playing
      if (isPlaying) {
        setTimelineHour((prev) => {
          const next = prev + dt * playbackSpeed * 0.5;
          return next > 48 ? -24 : next;
        });
      }

      const canvas = mapCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = (canvas.width = canvas.offsetWidth);
          const H = (canvas.height = canvas.offsetHeight);

          // Deep Phosphor Navy Backdrop
          ctx.fillStyle = '#05070B';
          ctx.fillRect(0, 0, W, H);

          // 1. Grid Coordinate Ticks
          ctx.strokeStyle = 'rgba(20, 48, 38, 0.4)';
          ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
          }
          for (let y = 0; y < H; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
          }

          // 2. Coastal Bathymetry Landmass
          ctx.fillStyle = '#071215';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, H * 0.68);
          ctx.bezierCurveTo(W * 0.25, H * 0.74, W * 0.5, H * 0.56, W * 0.75, H * 0.82);
          ctx.lineTo(W, H * 0.72);
          ctx.lineTo(W, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Step index logic for cumulative evidence building
          // 01: only detection
          // 02: + drift & particles
          // 03: + AIS traffic
          // 04: + spatial attribution CPA lines
          // 05/06: + full evidence candidate highlight
          const showStep01 = true;
          const showStep02 = activeStep !== '01 DETECT';
          const showStep03 = activeStep !== '01 DETECT' && activeStep !== '02 DRIFT';
          const showStep04 = activeStep === '04 ATTRIBUTE' || activeStep === '05 EVIDENCE' || activeStep === '06 METHOD';
          const showStep05 = activeStep === '05 EVIDENCE' || activeStep === '06 METHOD';

          // 3. AIS Traffic Fairway Lanes (Accumulates on Step 03+)
          if (layerAisTraffic && showStep03) {
            ctx.strokeStyle = 'rgba(46, 117, 89, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 14; i++) {
              ctx.beginPath();
              ctx.moveTo(W * 0.08 + i * 45, 0);
              ctx.lineTo(W * 0.28 + i * 35, H);
              ctx.stroke();
            }
          }

          // 4. Origin Field / Hindcast Backward Dispersion Cone (Accumulates on Step 02+)
          if (layerOriginField && showStep02) {
            ctx.fillStyle = 'rgba(23, 70, 55, 0.22)';
            ctx.strokeStyle = 'rgba(255, 183, 3, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(W * 0.48, H * 0.42, 140, 65, -0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Calculated Origin Point Pin
            const ox = W * 0.48;
            const oy = H * 0.42;
            ctx.fillStyle = '#FFB703';
            ctx.beginPath();
            ctx.arc(ox, oy, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 8px "JetBrains Mono", monospace';
            ctx.fillText('ORIGIN: T-18.4h (±0.84km)', ox + 8, oy - 4);
          }

          // 5. Debris Plume Release Extent (Accumulates on Step 02+)
          if (layerReleaseExtent && showStep02) {
            ctx.strokeStyle = '#FFB703';
            ctx.fillStyle = 'rgba(255, 183, 3, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.ellipse(
              W * 0.45 + timelineHour * 1.5,
              H * 0.4 - timelineHour * 1.2,
              60 + Math.abs(timelineHour) * 1.2,
              28 + Math.abs(timelineHour) * 0.6,
              -0.5,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // 6. Lagrangian Particle Cloud (Accumulates on Step 02+)
          if (layerParticles && showStep02) {
            ctx.fillStyle = '#FFB703';
            particleStateRef.current.forEach((p) => {
              p.x += p.vx * (playbackSpeed / 4);
              p.y += p.vy * (playbackSpeed / 4);
              p.age += 1;
              if (p.age > p.life) {
                p.x = 0.45 + (Math.random() - 0.5) * 0.12;
                p.y = 0.4 + (Math.random() - 0.5) * 0.12;
                p.age = 0;
              }

              const px = p.x * W + timelineHour * 1.2;
              const py = p.y * H - timelineHour * 0.8;

              ctx.globalAlpha = Math.max(0, 1 - p.age / p.life) * 0.85;
              ctx.fillRect(px, py, 2, 2);
            });
            ctx.globalAlpha = 1.0;
          }

          // 7. Candidate Vessel Tracks & CPA Lines (Accumulates on Step 03+)
          if (layerCandidates && showStep03) {
            activeScenario.candidates.forEach((cand) => {
              const isSelected = cand.id === activeCandidate.id;
              ctx.strokeStyle = isSelected
                ? '#FFB703'
                : showStep04
                ? 'rgba(255, 183, 3, 0.4)'
                : 'rgba(46, 117, 89, 0.35)';
              ctx.lineWidth = isSelected ? 2.5 : 1.2;
              ctx.setLineDash(isSelected ? [] : [3, 4]);

              // Draw vessel track
              ctx.beginPath();
              cand.trackCoordinates.forEach((coord, idx) => {
                const cx = (coord[1] - (activeScenario.lon - 0.25)) * (W / 0.5);
                const cy = (activeScenario.lat + 0.25 - coord[0]) * (H / 0.5);
                if (idx === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
              });
              ctx.stroke();
              ctx.setLineDash([]);

              // Vessel position marker
              const lastCoord = cand.trackCoordinates[cand.trackCoordinates.length - 1];
              const vx = (lastCoord[1] - (activeScenario.lon - 0.25)) * (W / 0.5);
              const vy = (activeScenario.lat + 0.25 - lastCoord[0]) * (H / 0.5);

              ctx.fillStyle = isSelected ? '#FFB703' : 'rgba(255, 183, 3, 0.35)';
              ctx.beginPath();
              ctx.arc(vx, vy, isSelected ? 5 : 3, 0, Math.PI * 2);
              ctx.fill();

              // Safe label rendering with boundary clipping prevention
              const labelText = `[${cand.code}] ${cand.name}`;
              ctx.font = 'bold 9px "JetBrains Mono", monospace';
              const textWidth = ctx.measureText(labelText).width;
              const safeX = vx + 8 + textWidth > W - 15 ? vx - textWidth - 8 : vx + 8;

              ctx.fillStyle = isSelected ? '#FFB703' : '#7C8AA0';
              ctx.fillText(labelText, safeX, vy + 3);

              // 8. Spatial CPA Attribution Line linking vessel to Debris Origin (Step 04+)
              if (showStep04 && isSelected) {
                const ox = W * 0.48;
                const oy = H * 0.42;
                ctx.strokeStyle = '#FFB703';
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 3]);
                ctx.beginPath();
                ctx.moveTo(vx, vy);
                ctx.lineTo(ox, oy);
                ctx.stroke();
                ctx.setLineDash([]);

                // CPA distance tag
                const midX = (vx + ox) / 2;
                const midY = (vy + oy) / 2;
                ctx.fillStyle = '#080C14';
                ctx.fillRect(midX - 35, midY - 7, 70, 14);
                ctx.strokeStyle = 'rgba(255, 183, 3, 0.35)';
                ctx.strokeRect(midX - 35, midY - 7, 70, 14);
                ctx.fillStyle = '#FFB703';
                ctx.font = 'bold 8px "JetBrains Mono", monospace';
                ctx.fillText(`CPA: ${cand.closestPointOfApproachM}m`, midX - 30, midY + 3);
              }
            });
          }

          // 9. Sonar Detection Swath Footprint (Step 01+)
          if (layerDetection && showStep01) {
            const sx = W * 0.45;
            const sy = H * 0.4;
            ctx.strokeStyle = '#39B589';
            ctx.lineWidth = 2;
            ctx.strokeRect(sx - 35, sy - 20, 70, 40);

            ctx.fillStyle = '#080C14';
            ctx.fillRect(sx - 35, sy - 34, 130, 14);
            ctx.strokeStyle = '#39B589';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx - 35, sy - 34, 130, 14);

            ctx.fillStyle = '#FFB703';
            ctx.font = 'bold 8px "JetBrains Mono", monospace';
            ctx.fillText(`T0 SSS: ${activeScenario.debrisType.toUpperCase().slice(0, 16)}`, sx - 30, sy - 24);
          }

          // 10. Coordinate HUD Ticks
          ctx.fillStyle = 'rgba(255, 183, 3, 0.35)';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillText(`${activeScenario.lat.toFixed(3)}° N  ${activeScenario.lon.toFixed(3)}° E`, 20, 25);
          ctx.fillText(`SW: ${(activeScenario.lat - 0.2).toFixed(3)}°N · SE: ${(activeScenario.lon + 0.2).toFixed(3)}°E`, W - 240, H - 15);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    isPlaying,
    playbackSpeed,
    timelineHour,
    activeScenario,
    activeCandidate,
    activeStep,
    layerAisTraffic,
    layerOriginField,
    layerReleaseExtent,
    layerParticles,
    layerCandidates,
    layerDetection,
  ]);

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] bg-[#05070B] text-[#E2E8F0] overflow-hidden select-none font-mono"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* 1. Tactical Header Bar */}
      <div className="bg-[#0A0F18] border-b border-[rgba(255, 255, 255, 0.08)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-black text-[#FFB703] tracking-widest uppercase">
            SONARX // DEBRIS INTEL NODE 04
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255, 183, 3, 0.1)] border border-[rgba(255, 183, 3, 0.35)] text-[#FFB703] font-bold">
            LINK OK
          </span>

          {/* Scenario Selector Dropdown */}
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              const scen = DEBRIS_INTELLIGENCE_SCENARIOS.find((s) => s.id === e.target.value);
              if (scen && scen.candidates[0]) {
                setSelectedCandidateId(scen.candidates[0].id);
              }
            }}
            className="bg-[#05070B] border border-[rgba(255, 255, 255, 0.08)] text-[#FFB703] text-[10px] font-bold px-2 py-1 rounded-md focus:outline-none focus:border-[#FFB703] cursor-pointer"
          >
            {DEBRIS_INTELLIGENCE_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scenarioCode} · {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
          <span>ACQ: {activeScenario.acquisitionTime}</span>
          <span className="text-[#FFB703] hidden md:inline">
            FILE: {activeScenario.swathFile}
          </span>

          {/* Instant Forensics Dossier CSV Export Button */}
          <button
            onClick={() => {
              const headers = ['Scenario', 'Debris_Type', 'Acquisition_Time', 'Lat', 'Lon', 'Area_Km2', 'Candidate_Name', 'Attribution_Score', 'Candidate_Kind', 'AIS_Status'];
              const row = [
                `"${activeScenario.name}"`,
                `"${activeScenario.debrisType}"`,
                `"${activeScenario.acquisitionTime}"`,
                activeScenario.lat,
                activeScenario.lon,
                activeScenario.debrisAreaKm2,
                `"${activeCandidate.name}"`,
                (activeCandidate.score * 100).toFixed(1) + '%',
                `"${activeCandidate.kind}"`,
                `"${activeCandidate.aisStatus}"`,
              ].join(',');
              const csv = `${headers.join(',')}\n${row}`;
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeScenario.id}_forensic_dossier.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(255, 183, 3, 0.1)] border border-[rgba(255, 183, 3, 0.35)] hover:border-[#FFB703] text-[#FFB703] text-[9px] font-bold transition-all cursor-pointer shadow-sm"
            title="Download Forensic Intelligence Dossier CSV"
          >
            <span>EXPORT DOSSIER CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column Layout: Left Pipeline & Layers | Center Map | Right Evidence Card */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT RAIL: 6-Step Pipeline & Layer Toggles */}
        <div className="w-56 bg-[#080C14] border-r border-[rgba(255, 255, 255, 0.08)] flex flex-col justify-between shrink-0 p-3 overflow-y-auto text-[10px]">
          <div>
            {/* Step Navigation */}
            <div className="space-y-1 mb-5">
              {(
                [
                  '01 DETECT',
                  '02 DRIFT',
                  '03 TRAFFIC',
                  '04 ATTRIBUTE',
                  '05 EVIDENCE',
                  '06 METHOD',
                ] as StepType[]
              ).map((step) => {
                const isActive = activeStep === step;
                return (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[rgba(255, 183, 3, 0.1)] text-[#FFB703] border-l-2 border-[#FFB703]'
                        : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0A1217]'
                    }`}
                  >
                    <span>{step}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Layer Toggles Section */}
            <div className="border-t border-[rgba(255, 255, 255, 0.08)] pt-3">
              <span className="text-[9px] font-black text-[rgba(255, 183, 3, 0.35)] uppercase tracking-widest block mb-2">
                LAYERS
              </span>
              <div className="space-y-1.5 text-[9px]">
                {[
                  { label: 'DETECTION', val: layerDetection, setVal: setLayerDetection },
                  { label: 'RELEASE EXTENT', val: layerReleaseExtent, setVal: setLayerReleaseExtent },
                  { label: 'ORIGIN FIELD', val: layerOriginField, setVal: setLayerOriginField },
                  { label: 'PARTICLES', val: layerParticles, setVal: setLayerParticles },
                  { label: 'AIS TRAFFIC', val: layerAisTraffic, setVal: setLayerAisTraffic },
                  { label: 'CANDIDATES', val: layerCandidates, setVal: setLayerCandidates },
                  { label: 'RADAR TARGETS', val: layerRadarTargets, setVal: setLayerRadarTargets },
                  { label: '72 H FORECAST', val: layerForecast, setVal: setLayerForecast },
                ].map((lyr) => (
                  <label
                    key={lyr.label}
                    className="flex items-center gap-2 cursor-pointer text-[#E2E8F0] hover:text-[#FFB703]"
                  >
                    <input
                      type="checkbox"
                      checked={lyr.val}
                      onChange={(e) => lyr.setVal(e.target.checked)}
                      className="accent-[#FFB703] rounded bg-[#05070B] border-[rgba(255, 255, 255, 0.08)]"
                    />
                    <span>[{lyr.val ? 'X' : ' '}] {lyr.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Keys Helper */}
          <div className="border-t border-[rgba(255, 255, 255, 0.08)] pt-2 text-[8px] text-[rgba(255, 183, 3, 0.35)]">
            <span className="font-bold text-[#94A3B8]">KEYS</span>
            <p>1-6 pane select · space play/hold</p>
            <p>← → step 1 hour · home T0</p>
          </div>
        </div>

        {/* CENTER TACTICAL CANVAS / VECTOR MAP */}
        <div className="flex-1 relative overflow-hidden bg-[#05070B]">
          <canvas ref={mapCanvasRef} className="w-full h-full block cursor-crosshair" />

          {/* In-Map Top-Right Legend */}
          <div className="absolute top-3 right-3 bg-[#080C14]/90 border border-[rgba(255, 255, 255, 0.08)] rounded p-2 text-[9px] backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[#FFB703] font-bold">
                CASE {activeScenario.scenarioCode}
              </span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-[rgba(255, 183, 3, 0.1)] text-[#FFB703] border border-[rgba(255, 183, 3, 0.35)]">
                STEP: {activeStep.slice(3)}
              </span>
            </div>
            <div className="space-y-0.5 text-[#94A3B8]">
              <div>DEBRIS: <span className="text-[#FFB703]">{activeScenario.debrisType}</span></div>
              <div>SURFACE: <span className="text-[#E2E8F0]">{activeScenario.debrisAreaKm2} km²</span></div>
              <div>ALONG TRACK: <span className="text-[#E2E8F0]">{activeScenario.alongTrackKm} km</span></div>
              <div>CURRENT: <span className="text-[#E2E8F0]">{activeScenario.currentVelocityMs} m/s @ {activeScenario.dispersionAngleDeg}°</span></div>
            </div>
          </div>

          {/* Scale Bar HUD Bottom-Left */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[8px] text-[#94A3B8]">
            <span className="px-1 py-0.5 rounded bg-[rgba(255, 183, 3, 0.1)] text-[#FFB703] font-bold">5 KM</span>
            <div className="w-24 h-1 bg-[rgba(255, 183, 3, 0.35)] relative">
              <div className="absolute top-0 left-0 w-12 h-full bg-[#FFB703]" />
            </div>
            <span>WGS-84 BATHYMETRY · {activeScenario.depthM}m DEPTH</span>
          </div>
        </div>

        {/* RIGHT RAIL: Dynamic Content Based on Active Step */}
        <div className="w-84 bg-[#080C14] border-l border-[rgba(255, 255, 255, 0.08)] flex flex-col justify-between shrink-0 p-3 overflow-y-auto text-[10px]">
          {/* STEP 01 DETECT */}
          {activeStep === '01 DETECT' && (
            <div>
              <div className="flex items-center justify-between border-b border-[rgba(255, 255, 255, 0.08)] pb-2 mb-3">
                <span className="font-black text-[#FFB703] tracking-wider uppercase">
                  01 SONAR DETECTION // TENSOR
                </span>
                <span className="text-[9px] text-[rgba(255, 183, 3, 0.35)]">{activeScenario.sensorFrequencyKhz} kHz</span>
              </div>
              <div className="space-y-3">
                {/* SIH GAP 2 REQUIREMENT — Noise & Clutter Filtering Funnel */}
                <div className="bg-[#0A0F18] p-2.5 rounded border border-[#FFB703]/30 space-y-1.5">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-[rgba(255, 183, 3, 0.35)] font-bold">
                    <span>Acoustic False-Positive Filtering</span>
                    <span className="text-[#FFB703]">Active</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-[8px] font-mono">
                    <div className="flex-1 bg-[#05070B] p-1 rounded border border-[rgba(255, 255, 255, 0.08)] text-center">
                      <span className="text-[#94A3B8] block">Raw Returns</span>
                      <strong className="text-[#E2E8F0]">42</strong>
                    </div>
                    <span className="text-[rgba(255, 183, 3, 0.35)] font-bold">→</span>
                    <div className="flex-1 bg-[#05070B] p-1 rounded border border-[rgba(255, 255, 255, 0.08)] text-center">
                      <span className="text-[#F5A623] block">Shadow/Rock Clutter</span>
                      <strong className="text-[#F5A623]">17 Filtered</strong>
                    </div>
                    <span className="text-[rgba(255, 183, 3, 0.35)] font-bold">→</span>
                    <div className="flex-1 bg-[rgba(255, 183, 3, 0.1)] p-1 rounded border border-[#FFB703]/40 text-center">
                      <span className="text-[#FFB703] block">Candidates</span>
                      <strong className="text-[#FFB703]">3 Verified</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0F18] p-2.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">CLASSIFIED RETURN</span>
                  <div className="text-sm font-black text-[#FFB703]">{activeScenario.debrisType}</div>
                  <p className="text-[9px] text-[#7C8AA0] mt-1">High-frequency side-scan acoustic footprint verified by nadir altimeter lock.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)]">
                    <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] block">SWATH WIDTH</span>
                    <span className="text-[#E2E8F0] font-bold">75m (-37.5 Port / +37.5 Stbd)</span>
                  </div>
                  <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)]">
                    <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] block">SEABED DEPTH</span>
                    <span className="text-[#E2E8F0] font-bold">{activeScenario.depthM} m AGL</span>
                  </div>
                </div>

                <div className="border-t border-[rgba(255, 255, 255, 0.08)] pt-2 text-[9px] text-[#E2E8F0]">
                  <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">ACOUSTIC EVIDENCE</span>
                  <ul className="space-y-1 list-disc pl-4 text-[#7C8AA0]">
                    <li>Specular peak SNR: +18.2 dB above background limestone</li>
                    <li>Shadow length: 2.31m detached corridor</li>
                    <li>Calculated target elevation: 0.82m proudly off seafloor</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 02 DRIFT */}
          {activeStep === '02 DRIFT' && (
            <div>
              <div className="flex items-center justify-between border-b border-[rgba(255, 255, 255, 0.08)] pb-2 mb-3">
                <span className="font-black text-[#FFB703] tracking-wider uppercase">
                  02 LAGRANGIAN DRIFT // HINDCAST
                </span>
                <span className="text-[9px] text-[#FFB703]">3,840 PARTICLES</span>
              </div>
              <div className="space-y-3">
                <div className="bg-[#0A0F18] p-2.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">CALCULATED ORIGIN COORDINATE</span>
                  <div className="text-xs font-bold text-[#FFB703]">
                    {activeScenario.calculatedOrigin.lat.toFixed(3)}°N, {activeScenario.calculatedOrigin.lon.toFixed(3)}°E
                  </div>
                  <div className="text-[9px] text-[#94A3B8] mt-0.5">
                    Release Window: {activeScenario.calculatedOrigin.timeWindow} (±{activeScenario.calculatedOrigin.uncertaintyRadiusKm}km)
                  </div>
                </div>

                <div className="space-y-1.5 text-[9px]">
                  <div className="flex justify-between bg-[#05070B] p-1.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                    <span className="text-[rgba(255, 183, 3, 0.35)]">OCEAN CURRENT:</span>
                    <span className="text-[#E2E8F0] font-bold">{activeScenario.currentVelocityMs} m/s @ {activeScenario.dispersionAngleDeg}°</span>
                  </div>
                  <div className="flex justify-between bg-[#05070B] p-1.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                    <span className="text-[rgba(255, 183, 3, 0.35)]">WIND FORCING:</span>
                    <span className="text-[#E2E8F0] font-bold">{activeScenario.windSpeedMs} m/s (α=0.03 factor)</span>
                  </div>
                  <div className="flex justify-between bg-[#05070B] p-1.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                    <span className="text-[rgba(255, 183, 3, 0.35)]">ENSEMBLE MEMBERS:</span>
                    <span className="text-[#FFB703] font-bold">12 Stochastic Runs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 03 TRAFFIC */}
          {activeStep === '03 TRAFFIC' && (
            <div>
              <div className="flex items-center justify-between border-b border-[rgba(255, 255, 255, 0.08)] pb-2 mb-3">
                <span className="font-black text-[#FFB703] tracking-wider uppercase">
                  03 AIS & RADAR TRAFFIC
                </span>
                <span className="text-[9px] text-[rgba(255, 183, 3, 0.35)]">{activeScenario.candidates.length} CANDIDATES</span>
              </div>
              <div className="space-y-2">
                {activeScenario.candidates.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      cand.id === activeCandidate.id
                        ? 'bg-[rgba(255, 183, 3, 0.1)] border-[#FFB703]'
                        : 'bg-[#0A0F18] border-[rgba(255, 255, 255, 0.08)] hover:border-[rgba(255, 183, 3, 0.35)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#FFB703]">[{cand.code}] {cand.name}</span>
                      <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)]">{cand.speedKts} kts</span>
                    </div>
                    <div className="text-[8px] text-[#7C8AA0] mt-0.5">{cand.vesselType} · {cand.aisStatus}</div>
                    <div className="text-[8px] text-[#94A3B8] mt-1">CPA: {cand.closestPointOfApproachM}m @ {cand.timeOfClosestApproach}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 04 ATTRIBUTE */}
          {activeStep === '04 ATTRIBUTE' && (
            <div>
              <div className="flex items-center justify-between border-b border-[rgba(255, 255, 255, 0.08)] pb-2 mb-3">
                <span className="font-black text-[#FFB703] tracking-wider uppercase">
                  04 ATTRIBUTION SCORE MATRIX
                </span>
                <span className="text-[9px] text-[#FFB703]">S_TOTAL: {activeCandidate.score.toFixed(3)}</span>
              </div>
              <div className="space-y-3">
                <div className="bg-[#0A0F18] p-2.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">SCORE DECOMPOSITION ({activeCandidate.name})</span>
                  <div className="space-y-1.5 mt-2 text-[9px]">
                    <div>
                      <div className="flex justify-between text-[8px] text-[#7C8AA0]">
                        <span>S_DRIFT (Drift Alignment):</span>
                        <span className="text-[#FFB703] font-bold">{activeCandidate.scoreDecomposition.sDrift.toFixed(2)} (w=35%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#05070B] rounded overflow-hidden mt-0.5">
                        <div className="h-full bg-[#FFB703]" style={{ width: `${activeCandidate.scoreDecomposition.sDrift * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] text-[#7C8AA0]">
                        <span>S_SPATIAL (CPA Proximity):</span>
                        <span className="text-[#FFB703] font-bold">{activeCandidate.scoreDecomposition.sSpatial.toFixed(2)} (w=25%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#05070B] rounded overflow-hidden mt-0.5">
                        <div className="h-full bg-[#FFB703]" style={{ width: `${activeCandidate.scoreDecomposition.sSpatial * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] text-[#7C8AA0]">
                        <span>S_TEMPORAL (Time Window):</span>
                        <span className="text-[#FFB703] font-bold">{activeCandidate.scoreDecomposition.sTemporal.toFixed(2)} (w=20%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#05070B] rounded overflow-hidden mt-0.5">
                        <div className="h-full bg-[#FFB703]" style={{ width: `${activeCandidate.scoreDecomposition.sTemporal * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] text-[#7C8AA0]">
                        <span>S_MANEUVER (Discard Pattern):</span>
                        <span className="text-[#FFB703] font-bold">{activeCandidate.scoreDecomposition.sManeuver.toFixed(2)} (w=20%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#05070B] rounded overflow-hidden mt-0.5">
                        <div className="h-full bg-[#FFB703]" style={{ width: `${activeCandidate.scoreDecomposition.sManeuver * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 05 EVIDENCE (Standard Default View) */}
          {activeStep === '05 EVIDENCE' && (
            <div>
              {/* Header: 05 EVIDENCE */}
              <div className="flex items-center justify-between border-b border-[rgba(255, 255, 255, 0.08)] pb-2 mb-3">
                <span className="font-black text-[#FFB703] tracking-wider uppercase">
                  05 EVIDENCE // CANDIDATE
                </span>
                <span className="text-[9px] text-[rgba(255, 183, 3, 0.35)]">RANK 01/03</span>
              </div>

              {/* Candidate Title & Radar Bright Target Callout */}
              <div className="mb-3">
                <h3 className="text-sm font-black text-[#FFB703] tracking-wide">
                  {activeCandidate.name}
                </h3>
                <p className="text-[9px] text-[#94A3B8]">{activeCandidate.radarEchoCrossSection}</p>
              </div>

              {/* Score & Metadata Box */}
              <div className="grid grid-cols-3 gap-2 bg-[#0A0F18] p-2 rounded-lg border border-[rgba(255, 255, 255, 0.08)] mb-3">
                <div>
                  <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block">SCORE</span>
                  <span className="text-base font-black text-[#FFB703]">
                    {activeCandidate.score.toFixed(3)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block">ATTRIBUTION KIND</span>
                  <span className="text-[10px] font-bold text-[#E2E8F0] truncate block">
                    {activeCandidate.kind}
                  </span>
                  <span className="text-[8px] text-[#94A3B8]">WIN: {activeCandidate.originWindow}</span>
                </div>
              </div>

              {/* Candidate Number Pills (01, 02, 03...) */}
              <div className="mb-4">
                <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">
                  ATTRIBUTION CANDIDATES
                </span>
                <div className="flex items-center gap-1.5">
                  {activeScenario.candidates.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCandidateId(c.id)}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                        c.id === activeCandidate.id
                          ? 'bg-[#FFB703] text-[#05070B] font-black shadow-[0_0_8px_rgba(255, 183, 3,0.3)]'
                          : 'bg-[#0A141A] text-[#94A3B8] hover:text-[#E2E8F0] border border-[rgba(255, 255, 255, 0.08)]'
                      }`}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator Notes & Spatial Intersection Evidence */}
              <div className="border-t border-[rgba(255, 255, 255, 0.08)] pt-3 mb-3">
                <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">
                  TRACK VS FIELD SPATIAL INTERSECTION
                </span>
                <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)] text-[9px] text-[#E2E8F0] leading-relaxed">
                  {activeCandidate.operatorNotes}
                </div>
              </div>

              {/* Alternative Hypothesis Honest Callout */}
              <div className="mb-3">
                <span className="text-[8px] text-[rgba(255, 183, 3, 0.35)] uppercase block mb-1">
                  ALTERNATIVE HYPOTHESIS
                </span>
                <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)] text-[8px] text-[#7C8AA0]">
                  {activeCandidate.alternativeHypothesis}
                </div>
              </div>

              {/* Vessel Metadata Breakdown */}
              <div className="space-y-1 text-[8px] text-[#94A3B8]">
                <div>TYPE: <span className="text-[#E2E8F0]">{activeCandidate.vesselType}</span></div>
                <div>CALLSIGN: <span className="text-[#E2E8F0]">{activeCandidate.callSign}</span></div>
                <div>CPA: <span className="text-[#E2E8F0]">{activeCandidate.closestPointOfApproachM}m @ {activeCandidate.timeOfClosestApproach}</span></div>
                <div>CONFIDENCE: <span className="text-[#FFB703] font-bold">{activeCandidate.spatialIntersectionConfidence}%</span></div>
              </div>
            </div>
          )}

          {/* STEP 06 METHOD (The deliberate place where technical ML + Physics detail belongs) */}
          {activeStep === '06 METHOD' && (
            <div>
              <div className="flex items-center justify-between border-b border-[rgba(255, 255, 255, 0.08)] pb-2 mb-3">
                <span className="font-black text-[#FFB703] tracking-wider uppercase">
                  06 SCIENTIFIC METHODOLOGY
                </span>
                <span className="text-[9px] text-[rgba(255, 183, 3, 0.35)]">ISO / MoES SPEC</span>
              </div>
              <div className="space-y-2.5 text-[8px] text-[#E2E8F0]">
                <div className="bg-[#0A0F18] p-2.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <div className="flex items-center gap-1.5 text-[#FFB703] font-bold mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>NEURAL PERCEPTION PIPELINE</span>
                  </div>
                  <p className="text-[#7C8AA0]">
                    YOLOv8n ONNX runtime with acoustic tensor pre-processing (900 kHz SSS dual-frequency cross-track backscatter).
                  </p>
                  <div className="mt-1 text-[7px] text-[#FFB703] font-mono">
                    mAP50: 91.4% · Inference: 14.2ms · Precision: 94.8%
                  </div>
                </div>

                <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <span className="text-[#FFB703] font-bold block mb-0.5">ACOUSTIC SHADOW TRIGONOMETRY</span>
                  <code>H = (L_shadow × H_altimeter) / (R_slant + L_shadow)</code>
                </div>

                <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <span className="text-[#FFB703] font-bold block mb-0.5">BACKWARD EULER DRIFT MODEL</span>
                  <code>x(t-Δt) = x(t) - Δt × (u_ocean + α·u_wind + u'_diffusion)</code>
                </div>

                <div className="bg-[#0A0F18] p-2 rounded border border-[rgba(255, 255, 255, 0.08)]">
                  <span className="text-[#FFB703] font-bold block mb-0.5">SCIENTIFIC INTEGRITY CONSTRAINTS</span>
                  <p className="text-[#7C8AA0]">Scores are never stored without decomposed terms. Dark vessels are ranked with radar cross-sections. Diffuse fields return honest low certainty rather than false suspects.</p>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time Terminal Event Log (Shared Footer with smooth fade & auto-scroll) */}
          <div className="border-t border-[rgba(255, 255, 255, 0.08)] pt-2.5">
            <span className="text-[8px] font-black text-[rgba(255, 183, 3, 0.35)] uppercase tracking-widest block mb-1.5">
              EVENT LOG
            </span>
            <div
              className="bg-[#05070B] border border-[rgba(255, 255, 255, 0.08)] rounded p-2 max-h-28 overflow-y-auto space-y-1 text-[8px] font-mono scrollbar-thin scrollbar-thumb-[rgba(255, 255, 255, 0.08)]"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,1) 15%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,1) 15%)',
              }}
            >
              {activeScenario.eventLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-[rgba(255, 183, 3, 0.35)] shrink-0">{log.time}</span>
                  <span className="text-[#FFB703] shrink-0 font-bold">[{log.tag}]</span>
                  <span className="text-[#E2E8F0]">{log.message}</span>
                </div>
              ))}
              <div ref={eventLogEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Interactive Timeline Scrubber (-24h .. T0 .. +48h) */}
      <div className="bg-[#0A0F18] border-t border-[rgba(255, 255, 255, 0.08)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0 z-20 select-none">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[rgba(255, 183, 3, 0.1)] border border-[rgba(255, 183, 3, 0.35)] hover:border-[#FFB703] text-[#FFB703] text-[10px] font-bold transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={() => setTimelineHour(-24)}
            className="px-2 py-1 rounded bg-[#0A141A] border border-[rgba(255, 255, 255, 0.08)] hover:text-[#FFB703] text-[9px] text-[#94A3B8] cursor-pointer"
          >
            |&lt; RELEASE (-24h)
          </button>

          <button
            onClick={() => setTimelineHour(0)}
            className="px-2 py-1 rounded bg-[#0A141A] border border-[rgba(255, 255, 255, 0.08)] hover:text-[#FFB703] text-[9px] text-[#FFB703] font-bold cursor-pointer"
          >
            T0 ACQUISITION
          </button>

          {/* Speed Pills */}
          <div className="flex items-center gap-1 bg-[#05070B] p-0.5 rounded border border-[rgba(255, 255, 255, 0.08)]">
            {([1, 4, 12] as (1 | 4 | 12)[]).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-[rgba(255, 183, 3, 0.1)] text-[#FFB703]'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                {spd}X
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Scrubbing Slider with Waveform Curve */}
        <div className="flex-1 max-w-xl flex items-center gap-3">
          <span className="text-[9px] text-[#94A3B8] font-bold">HINDCAST -24h</span>
          <div className="flex-1 relative flex items-center">
            {/* Waveform curve visual */}
            <div className="w-full h-4 bg-[#0A141A] border border-[rgba(255, 255, 255, 0.08)] rounded overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 bg-[#FFB703]/20 border-r border-[#FFB703]"
                style={{ width: `${((timelineHour + 24) / 72) * 100}%` }}
              />
              <div className="absolute top-0 left-1/3 bottom-0 w-0.5 bg-[#FFB703]/50" />
            </div>
            <input
              type="range"
              min={-24}
              max={48}
              step={0.5}
              value={timelineHour}
              onChange={(e) => setTimelineHour(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
            />
          </div>
          <span className="text-[9px] text-[#FFB703] font-black">
            {timelineHour >= 0 ? `+${timelineHour.toFixed(1)}h` : `${timelineHour.toFixed(1)}h`}
          </span>
          <span className="text-[9px] text-[#94A3B8] font-bold">FORECAST +48h</span>
        </div>

        {/* Current State Readout */}
        <div className="text-[10px] text-[#94A3B8] hidden lg:flex items-center gap-3">
          <span>SURFACE: <b className="text-[#FFB703]">{(activeScenario.debrisAreaKm2 * (1 + (timelineHour + 24) * 0.02)).toFixed(2)} km²</b></span>
          <span>ENSEMBLE: <b className="text-[#E2E8F0]">12 MEMBERS</b></span>
        </div>
      </div>
    </div>
  );
};
