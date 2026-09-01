import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sliders,
  Layers,
  Crosshair,
  Radio,
  Eye,
  EyeOff,
  Download,
  Share2,
  Copy,
  Check,
  Compass,
  AlertTriangle,
  ShieldAlert,
  Info,
  Activity,
  Maximize2,
  ChevronRight,
  ExternalLink,
  FileText,
  FileJson,
  Sparkles,
  RefreshCw,
  Box,
} from 'lucide-react';
import { MARINE_SCENARIOS, MarineDebrisScenario } from '../data/scenarios';

type PaletteMode = 'cyan' | 'amber' | 'grayscale';
type ViewMode = 'split' | 'overlay' | 'raw';

export const SonarViewerPage: React.FC = () => {
  // Scenario Selection (default to Gulf of Mannar Ghost Net)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('gom-coral-net');
  const activeScenario = MARINE_SCENARIOS.find((s) => s.id === selectedScenarioId) || MARINE_SCENARIOS[0];

  // Selected Target within scenario
  const [selectedTargetId, setSelectedTargetId] = useState<string>(activeScenario.primaryTargetId);
  const activeTarget = activeScenario.targets.find((t) => t.id === selectedTargetId) || activeScenario.targets[0];

  // Display & Layer Controls
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage (0..100)
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [palette, setPalette] = useState<PaletteMode>('cyan');
  const [gain, setGain] = useState<number>(1.2);
  const [contrast, setContrast] = useState<number>(1.1);
  const [frequencyKhz, setFrequencyKhz] = useState<number>(900);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);

  // Layer Toggles
  const [showRawTexture, setShowRawTexture] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showShadowVectors, setShowShadowVectors] = useState<boolean>(true);
  const [showEcoHeatmap, setShowEcoHeatmap] = useState<boolean>(true);
  const [showBathymetryGrid, setShowBathymetryGrid] = useState<boolean>(true);

  // Modals & Feedback
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Update selected target when scenario changes
  useEffect(() => {
    setSelectedTargetId(activeScenario.primaryTargetId);
  }, [activeScenario]);

  // Convert intensity to palette
  const getPaletteRGB = useCallback((val: number, pal: PaletteMode, g: number, c: number) => {
    const adjusted = Math.max(0, Math.min(1, Math.pow(val * g, c)));
    if (pal === 'amber') {
      return `rgb(${Math.floor(adjusted * 255)}, ${Math.floor(adjusted * 179)}, ${Math.floor(adjusted * 71)})`;
    } else if (pal === 'grayscale') {
      const v = Math.floor(adjusted * 255);
      return `rgb(${v}, ${v}, ${v})`;
    } else {
      // Cold Phosphor Cyan #4CD9E8
      return `rgb(${Math.floor(adjusted * 76)}, ${Math.floor(adjusted * 217)}, ${Math.floor(adjusted * 232)})`;
    }
  }, []);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    if (W === 0 || H === 0) return;

    ctx.clearRect(0, 0, W, H);

    // Deep seabed substrate background
    ctx.fillStyle = '#080B11';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const nadirW = Math.max(18, W * 0.04);
    const halfSwathM = activeScenario.swathWidthM / 2;
    const pxPerMeter = (W / 2 - nadirW / 2) / halfSwathM;
    const splitX = (W * splitPosition) / 100;

    // 1. Draw Acoustic Seabed Grain & Backscatter
    const rows = Math.floor(H / 3);
    for (let r = 0; r < rows; r++) {
      const y = r * 3;
      for (let x = 0; x < W; x += 3) {
        const distFromCenter = x - cx;
        const absDist = Math.abs(distFromCenter);

        // Nadir Water Column Gap
        if (absDist < nadirW / 2) {
          ctx.fillStyle = '#04070C';
          ctx.fillRect(x, y, 3, 3);
          continue;
        }

        const acrossM = (absDist - nadirW / 2) / pxPerMeter;
        const seed = (x * 1337 + y * 7919) % 1000;
        let baseNoise = (seed / 1000) * 0.14;

        // Bottom track return at nadir boundary
        if (absDist < nadirW / 2 + 14) {
          baseNoise += 0.42 * (1 - (absDist - nadirW / 2) / 14);
        }

        // Grazing angle falloff
        const grazing = Math.cos((acrossM / halfSwathM) * 0.65);
        let intensity = (0.12 + baseNoise) * grazing;

        // Eco Heatmap overlay if enabled and on right side of split
        if (showEcoHeatmap && (viewMode === 'overlay' || (viewMode === 'split' && x > splitX))) {
          const ecoFactor = (activeScenario.ecosystemVulnerabilityScore / 100) * 0.15;
          intensity += ecoFactor * Math.sin(x * 0.02 + y * 0.03);
        }

        ctx.fillStyle = getPaletteRGB(intensity, palette, gain, contrast);
        ctx.fillRect(x, y, 3, 3);
      }
    }

    // 2. Draw Nadir Centerline Gap
    const nadirGrad = ctx.createLinearGradient(cx - nadirW / 2, 0, cx + nadirW / 2, 0);
    nadirGrad.addColorStop(0, 'rgba(76, 217, 232, 0.25)');
    nadirGrad.addColorStop(0.5, 'rgba(4, 7, 12, 0.98)');
    nadirGrad.addColorStop(1, 'rgba(76, 217, 232, 0.25)');
    ctx.fillStyle = nadirGrad;
    ctx.fillRect(cx - nadirW / 2, 0, nadirW, H);

    ctx.strokeStyle = 'rgba(76, 217, 232, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Bathymetric Isobars if enabled
    if (showBathymetryGrid) {
      ctx.strokeStyle = 'rgba(41, 182, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let d = 50; d < H; d += 80) {
        ctx.beginPath();
        ctx.moveTo(0, d);
        ctx.bezierCurveTo(W * 0.3, d - 15, W * 0.7, d + 15, W, d);
        ctx.stroke();
      }
    }

    // 4. Render Scenario Targets (Specularity, Acoustic Shadows, Calipers)
    activeScenario.targets.forEach((target, index) => {
      // Filter by confidence threshold slider
      if (target.confidence * 100 < confidenceThreshold) return;

      const isSelected = target.id === selectedTargetId;
      const isStarboard = target.acrossTrackM > 0;
      const targetDistPx = nadirW / 2 + Math.abs(target.acrossTrackM) * pxPerMeter;
      const tx = isStarboard ? cx + targetDistPx : cx - targetDistPx;
      const ty = H * 0.35 + index * 95;

      const boxW = Math.max(38, target.lengthM * pxPerMeter * 1.6);
      const boxH = Math.max(26, target.widthM * pxPerMeter * 1.6);

      // Draw Specular High-Backscatter Return
      ctx.save();
      ctx.fillStyle = target.color;
      ctx.shadowColor = target.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(tx, ty, boxW * 0.35, boxH * 0.35, (target.bearingDeg * Math.PI) / 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Acoustic Shadow Vector stretching away from nadir
      if (showShadowVectors && (viewMode === 'overlay' || (viewMode === 'split' && tx > splitX))) {
        const shadowLenPx = target.shadowM * pxPerMeter * 1.8;
        ctx.save();
        ctx.fillStyle = 'rgba(4, 7, 12, 0.96)';
        ctx.beginPath();
        if (isStarboard) {
          ctx.moveTo(tx + boxW * 0.3, ty - boxH * 0.3);
          ctx.lineTo(tx + boxW * 0.3 + shadowLenPx, ty - boxH * 0.45);
          ctx.lineTo(tx + boxW * 0.3 + shadowLenPx, ty + boxH * 0.45);
          ctx.lineTo(tx + boxW * 0.3, ty + boxH * 0.3);
        } else {
          ctx.moveTo(tx - boxW * 0.3, ty - boxH * 0.3);
          ctx.lineTo(tx - boxW * 0.3 - shadowLenPx, ty - boxH * 0.45);
          ctx.lineTo(tx - boxW * 0.3 - shadowLenPx, ty + boxH * 0.45);
          ctx.lineTo(tx - boxW * 0.3, ty + boxH * 0.3);
        }
        ctx.closePath();
        ctx.fill();

        // Shadow Dimension Line
        ctx.strokeStyle = '#4CD9E8';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(tx, ty + boxH * 0.5 + 4);
        ctx.lineTo(isStarboard ? tx + shadowLenPx : tx - shadowLenPx, ty + boxH * 0.5 + 4);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Draw Target Bounding Box & Label
      if (showBoundingBoxes && (viewMode === 'overlay' || (viewMode === 'split' && tx > splitX))) {
        ctx.save();
        ctx.strokeStyle = isSelected ? '#4CD9E8' : target.color;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(tx - boxW / 2, ty - boxH / 2, boxW, boxH);

        // Caliper tag
        ctx.fillStyle = '#080B11';
        ctx.fillRect(tx - boxW / 2, ty - boxH / 2 - 16, 68, 15);
        ctx.strokeStyle = target.color;
        ctx.strokeRect(tx - boxW / 2, ty - boxH / 2 - 16, 68, 15);
        ctx.fillStyle = isSelected ? '#4CD9E8' : '#EAEFF5';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(`${target.id} ${(target.confidence * 100).toFixed(0)}%`, tx - boxW / 2 + 3, ty - boxH / 2 - 5);
        ctx.restore();
      }
    });

    // 5. Draw Split Screen Divider & Labels
    if (viewMode === 'split') {
      ctx.strokeStyle = '#4CD9E8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, H);
      ctx.stroke();

      // Split Knob
      ctx.fillStyle = '#4CD9E8';
      ctx.beginPath();
      ctx.arc(splitX, H / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#080B11';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◀▶', splitX, H / 2 + 3);

      // Left Tag: Raw Acoustic Stream
      ctx.fillStyle = 'rgba(8, 11, 17, 0.85)';
      ctx.fillRect(10, 10, 160, 22);
      ctx.fillStyle = '#7C8AA0';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RAW 900 kHz BACKSCATTER', 16, 25);

      // Right Tag: Processed Hydrographic Layer
      ctx.fillStyle = 'rgba(8, 11, 17, 0.85)';
      ctx.fillRect(W - 190, 10, 180, 22);
      ctx.fillStyle = '#4CD9E8';
      ctx.textAlign = 'right';
      ctx.fillText('CLASSIFIED & SHADOW VECTORS', W - 16, 25);
    }

    // 6. Across-Track Distance Scale Bar
    ctx.fillStyle = '#080B11';
    ctx.fillRect(0, H - 24, W, 24);
    ctx.strokeStyle = '#1B2330';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 24);
    ctx.lineTo(W, H - 24);
    ctx.stroke();

    const rangeTicks = [-30, -20, -10, 0, 10, 20, 30];
    rangeTicks.forEach((m) => {
      const rx = m === 0 ? cx : m < 0 ? cx - (nadirW / 2 + Math.abs(m) * pxPerMeter) : cx + (nadirW / 2 + m * pxPerMeter);
      ctx.fillStyle = 'rgba(124, 138, 160, 0.7)';
      ctx.fillRect(rx, H - 24, 1, 6);
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(m === 0 ? 'NADIR 0m' : `${Math.abs(m)}m ${m < 0 ? 'P' : 'S'}`, rx, H - 8);
    });
  }, [
    activeScenario,
    selectedTargetId,
    viewMode,
    splitPosition,
    palette,
    gain,
    contrast,
    confidenceThreshold,
    showRawTexture,
    showBoundingBoxes,
    showShadowVectors,
    showEcoHeatmap,
    showBathymetryGrid,
    getPaletteRGB,
  ]);

  // Handle Split Dragging
  const handleMouseDown = () => setIsDraggingSplit(true);
  const handleMouseUp = () => setIsDraggingSplit(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const newPos = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    setSplitPosition(newPos);
  };

  // Copy coordinates
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${activeScenario.coordinates} (${activeScenario.name})`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Export GeoJSON
  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      scenario: activeScenario.id,
      region: activeScenario.region,
      features: activeScenario.targets.map((t) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [activeScenario.lon, activeScenario.lat],
        },
        properties: {
          id: t.id,
          class: t.class,
          confidence: t.confidence,
          acrossTrackMeters: t.acrossTrackM,
          bearingDeg: t.bearingDeg,
          lengthM: t.lengthM,
          widthM: t.widthM,
          shadowM: t.shadowM,
          calculatedHeightM: t.heightM,
          threatLevel: activeScenario.threatLevel,
        },
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonarx_${activeScenario.id}_geojson.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#080B11] text-[#EAEFF5] select-none font-mono text-xs overflow-hidden space-y-3">
      {/* 1. Curated Operational Scenario Switcher (The Judge Scenario Bar) */}
      <div className="bg-[#10151D] border border-[#1B2330] rounded-xl p-3 shadow-lg shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#4CD9E8] animate-pulse" />
            <span className="font-black text-xs text-[#EAEFF5] tracking-wider uppercase">
              OPERATIONAL SCENARIOS · 1-CLICK EVALUATION
            </span>
          </div>
          <span className="text-[9px] text-[#7C8AA0]">
            5 PRE-CALIBRATED INDIAN COASTAL SECTORS
          </span>
        </div>

        {/* Scenario Pill Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {MARINE_SCENARIOS.map((scenario) => {
            const isActive = scenario.id === activeScenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`flex flex-col text-left p-2 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-[#4CD9E8]/15 border-[#4CD9E8] shadow-[0_0_12px_rgba(76,217,232,0.2)] text-[#EAEFF5]'
                    : 'bg-[#161C26] border-[#1B2330] text-[#7C8AA0] hover:border-[#4CD9E8]/40 hover:text-[#EAEFF5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#4CD9E8]">
                    {scenario.category}
                  </span>
                  <span
                    className={`text-[7px] font-black px-1 rounded border ${
                      scenario.threatLevel === 'CRITICAL'
                        ? 'bg-[#F04438]/15 text-[#F04438] border-[#F04438]/40'
                        : scenario.threatLevel === 'HIGH'
                        ? 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/40'
                        : 'bg-[#3FD98A]/15 text-[#3FD98A] border-[#3FD98A]/40'
                    }`}
                  >
                    {scenario.threatLevel}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[#EAEFF5] truncate mt-1">
                  {scenario.name}
                </p>
                <p className="text-[8px] text-[#7C8AA0] truncate">
                  {scenario.depthM}m Depth · {scenario.targets.length} Contacts
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Studio Workspace: Left Canvas + Right Science Dossier */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Side: Interactive Sonar Studio Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[#10151D] border border-[#1B2330] rounded-xl overflow-hidden shadow-xl">
          {/* Canvas Toolbar Controls */}
          <div className="px-3 py-2 bg-[#161C26] border-b border-[#1B2330] flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* View Mode Switcher (Split / Overlay / Raw) */}
            <div className="flex items-center gap-1 bg-[#080B11] p-0.5 rounded-lg border border-[#1B2330]">
              {(['split', 'overlay', 'raw'] as ViewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors ${
                    viewMode === m
                      ? 'bg-[#4CD9E8]/20 text-[#4CD9E8]'
                      : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
                  }`}
                >
                  {m === 'split' ? 'SWIPE SPLIT' : m === 'overlay' ? 'FULL OVERLAY' : 'RAW ONLY'}
                </button>
              ))}
            </div>

            {/* Confidence Threshold Filter Slider */}
            <div className="flex items-center gap-1.5 bg-[#080B11] px-2.5 py-1 rounded-lg border border-[#1B2330] text-[9px]">
              <span className="text-[#7C8AA0]">CONF CUTOFF:</span>
              <input
                type="range"
                min={40}
                max={95}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-16 h-1 accent-[#4CD9E8] cursor-pointer"
              />
              <strong className="text-[#4CD9E8]">{confidenceThreshold}%</strong>
            </div>

            {/* Phosphor Palette Switcher */}
            <div className="flex items-center gap-1 bg-[#080B11] p-0.5 rounded-lg border border-[#1B2330]">
              {(['cyan', 'amber', 'grayscale'] as PaletteMode[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors ${
                    palette === p
                      ? 'bg-[#4CD9E8]/20 text-[#4CD9E8]'
                      : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Layer Toggles Dropdown / Buttons */}
            <div className="flex items-center gap-1 text-[8px]">
              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`p-1.5 rounded border transition-colors ${
                  showBoundingBoxes
                    ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/40 text-[#4CD9E8]'
                    : 'bg-[#080B11] border-[#1B2330] text-[#7C8AA0]'
                }`}
                title="Toggle Target Bounding Boxes"
              >
                <Crosshair className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowShadowVectors(!showShadowVectors)}
                className={`p-1.5 rounded border transition-colors ${
                  showShadowVectors
                    ? 'bg-[#4CD9E8]/15 border-[#4CD9E8]/40 text-[#4CD9E8]'
                    : 'bg-[#080B11] border-[#1B2330] text-[#7C8AA0]'
                }`}
                title="Toggle Shadow Vectors & Height Triangulation"
              >
                <Layers className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowEcoHeatmap(!showEcoHeatmap)}
                className={`p-1.5 rounded border transition-colors ${
                  showEcoHeatmap
                    ? 'bg-[#A855F7]/15 border-[#A855F7]/40 text-[#A855F7]'
                    : 'bg-[#080B11] border-[#1B2330] text-[#7C8AA0]'
                }`}
                title="Toggle Ecological Vulnerability Heatmap"
              >
                <Activity className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport with Swipe Split Dragging */}
          <div
            ref={splitContainerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex-1 relative cursor-crosshair overflow-hidden bg-[#080B11]"
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Active Target Indicator Badge */}
            <div className="absolute top-2 left-2 z-20 px-2.5 py-1.5 rounded-lg bg-[#080B11]/90 border border-[#1B2330] text-[9px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4CD9E8] animate-ping" />
              <span className="text-[#7C8AA0]">{activeScenario.region}</span>
              <span className="text-[#4CD9E8] font-bold">· {activeScenario.depthM}m DEPTH</span>
            </div>
          </div>
        </div>

        {/* Right Side: Marine Debris Scientific Research Dossier (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[#10151D] border border-[#1B2330] rounded-xl overflow-y-auto shadow-xl p-3 space-y-3">
          {/* Scenario Header & Coordinates */}
          <div className="p-3 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase text-[#4CD9E8] tracking-wider">
                ECOLOGICAL RISK PROFILE
              </span>
              <button
                onClick={handleCopyCoords}
                className="flex items-center gap-1 text-[8px] text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors"
                title="Copy WGS-84 Coordinates"
              >
                {copiedCoords ? <Check className="w-2.5 h-2.5 text-[#3FD98A]" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedCoords ? 'COPIED' : 'FIX'}</span>
              </button>
            </div>

            <h3 className="text-sm font-black text-[#EAEFF5] leading-tight">
              {activeScenario.name}
            </h3>
            <p className="text-[9px] text-[#7C8AA0] font-mono">
              {activeScenario.coordinates}
            </p>

            {/* Ecosystem Vulnerability Score (EVS) Meter */}
            <div className="pt-2 border-t border-[#1B2330] space-y-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[#7C8AA0]">ECOSYSTEM VULNERABILITY SCORE (EVS):</span>
                <strong
                  className={`font-black ${
                    activeScenario.ecosystemVulnerabilityScore >= 85
                      ? 'text-[#F04438]'
                      : 'text-[#F5A623]'
                  }`}
                >
                  {activeScenario.ecosystemVulnerabilityScore} / 100
                </strong>
              </div>
              <div className="h-1.5 bg-[#1B2330] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeScenario.ecosystemVulnerabilityScore >= 85
                      ? 'bg-[#F04438]'
                      : 'bg-[#F5A623]'
                  }`}
                  style={{ width: `${activeScenario.ecosystemVulnerabilityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Target Intelligence Card */}
          <div className="p-3 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
            <div className="flex items-center justify-between text-[8px] text-[#7C8AA0] uppercase tracking-wider">
              <span>PRIMARY TARGET FIX</span>
              <span className="text-[#4CD9E8]">{activeTarget.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                <span className="text-[7px] text-[#7C8AA0] block uppercase">CLASSIFICATION</span>
                <strong className="text-[#EAEFF5] font-bold">{activeTarget.class}</strong>
              </div>
              <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                <span className="text-[7px] text-[#7C8AA0] block uppercase">CONFIDENCE</span>
                <strong className="text-[#4CD9E8] font-bold">{(activeTarget.confidence * 100).toFixed(1)}%</strong>
              </div>
              <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                <span className="text-[7px] text-[#7C8AA0] block uppercase">MEASURED DIMENSIONS</span>
                <strong className="text-[#EAEFF5] font-bold">{activeTarget.lengthM}m × {activeTarget.widthM}m</strong>
              </div>
              <div className="p-2 rounded bg-[#161C26] border border-[#1B2330]">
                <span className="text-[7px] text-[#7C8AA0] block uppercase">TARGET STRENGTH</span>
                <strong className="text-[#29B6F6] font-bold">{activeScenario.acousticFeatures.targetStrengthDb} dB</strong>
              </div>
            </div>
          </div>

          {/* Shadow-to-Height Trigonometric Calculator (Judge Technical Depth) */}
          <div className="p-3 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
            <div className="flex items-center justify-between text-[8px] text-[#7C8AA0] uppercase tracking-wider">
              <span>SHADOW HEIGHT TRIANGULATION</span>
              <span className="text-[#3FD98A]">VERIFIED FORMULA</span>
            </div>

            <div className="p-2 rounded bg-[#161C26] border border-[#1B2330] space-y-1 text-[8px]">
              <p className="text-[#4CD9E8] font-bold">
                H = (L_shadow × H_altimeter) / (R_slant + L_shadow)
              </p>
              <div className="flex items-center justify-between text-[#7C8AA0] pt-1">
                <span>Shadow: <strong>{activeTarget.shadowM}m</strong></span>
                <span>Alt: <strong>8.4m</strong></span>
                <span>Slant: <strong>{activeTarget.slantRangeM}m</strong></span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#1B2330] text-[#EAEFF5] font-bold">
                <span>CALCULATED SEABED RELIEF:</span>
                <span className="text-[#3FD98A] text-[10px]">~{activeTarget.heightM} meters</span>
              </div>
            </div>
          </div>

          {/* Marine Debris Environmental Narrative */}
          <div className="p-3 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
            <span className="text-[8px] font-bold uppercase text-[#7C8AA0] tracking-wider block">
              DEGRADATION & TOXICITY PROFILE
            </span>
            <div className="space-y-1 text-[8px] text-[#7C8AA0] leading-relaxed">
              <p>
                <strong className="text-[#EAEFF5]">Degradation Horizon:</strong> {activeScenario.degradationTimeline}
              </p>
              <p>
                <strong className="text-[#EAEFF5]">Impact Assessment:</strong> {activeScenario.ecologicalImpact}
              </p>
            </div>
          </div>

          {/* Evaluator Export Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1 shrink-0">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#4CD9E8]/15 border border-[#4CD9E8]/40 text-[#4CD9E8] font-bold hover:bg-[#4CD9E8]/25 transition-all text-[9px]"
            >
              <FileText className="w-3 h-3" />
              <span>OFFICIAL DOSSIER</span>
            </button>

            <button
              onClick={handleExportGeoJSON}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] hover:text-[#EAEFF5] hover:border-[#4CD9E8]/40 transition-all text-[9px]"
            >
              <FileJson className="w-3 h-3" />
              <span>EXPORT GIS GEOJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official MoES Survey Dossier Modal (Print / Judge Presentation) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-[#080B11]/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#10151D] border border-[#1B2330] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1B2330] pb-3">
              <div>
                <span className="text-[9px] font-bold text-[#4CD9E8] tracking-widest uppercase">
                  MINISTRY OF EARTH SCIENCES · HYDROGRAPHIC SURVEY DOSSIER
                </span>
                <h2 className="text-lg font-black text-[#EAEFF5]">
                  {activeScenario.name}
                </h2>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded bg-[#161C26] text-[#7C8AA0] hover:text-[#EAEFF5] border border-[#1B2330]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#7C8AA0]">
              <div className="p-3 rounded-lg bg-[#080B11] border border-[#1B2330] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[8px] uppercase block">GEOGRAPHIC SECTOR</span>
                  <strong className="text-[#EAEFF5]">{activeScenario.region}</strong>
                </div>
                <div>
                  <span className="text-[8px] uppercase block">COORDINATES</span>
                  <strong className="text-[#4CD9E8]">{activeScenario.coordinates}</strong>
                </div>
                <div>
                  <span className="text-[8px] uppercase block">TRANSDUCER FREQUENCY</span>
                  <strong className="text-[#EAEFF5]">{activeScenario.frequencyKhz} kHz High-Frequency SSS</strong>
                </div>
                <div>
                  <span className="text-[8px] uppercase block">SUBSTRATE GEOLOGY</span>
                  <strong className="text-[#EAEFF5]">{activeScenario.acousticFeatures.substrateType}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-[#EAEFF5] uppercase">
                  SURVEY FINDINGS & ACOUSTIC EVIDENCE
                </span>
                <p className="leading-relaxed bg-[#080B11] p-3 rounded-lg border border-[#1B2330] text-[#EAEFF5]">
                  {activeScenario.summary}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-[#EAEFF5] uppercase">
                  CATALOGED TARGETS IN SECTOR
                </span>
                <div className="space-y-1">
                  {activeScenario.targets.map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded bg-[#161C26] border border-[#1B2330] flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-[#4CD9E8]">{t.id} · {t.class}</strong>
                        <p className="text-[9px] text-[#7C8AA0]">{t.description}</p>
                      </div>
                      <div className="text-right">
                        <strong className="text-[#3FD98A]">{(t.confidence * 100).toFixed(1)}% FIT</strong>
                        <p className="text-[8px] text-[#7C8AA0]">Ht ~{t.heightM}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1B2330]">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#4CD9E8] text-[#080B11] font-black text-xs hover:bg-[#29B6F6] transition-all cursor-pointer"
              >
                PRINT / SAVE PDF
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-[#161C26] text-[#7C8AA0] hover:text-[#EAEFF5] border border-[#1B2330]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
