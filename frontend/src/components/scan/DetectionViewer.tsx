import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Tag,
  Download,
  FileText,
  Clock,
  Crosshair,
  AlertOctagon,
  Shield,
  Sparkles,
  Info,
  Activity,
  Cpu,
  Boxes,
  AlertTriangle,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { PredictionResponse, Detection } from '../../types';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { BeforeAfterNoisePanel } from '../mission/BeforeAfterNoisePanel';

interface DetectionViewerProps {
  scan: PredictionResponse;
  previewUrl: string;
  onReset: () => void;
}

export const DetectionViewer: React.FC<DetectionViewerProps> = ({
  scan,
  previewUrl,
  onReset,
}) => {
  const { setActiveTab } = useApp();
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [activeThreshold, setActiveThreshold] = useState<number>(
    scan.confidence_threshold || 0.25
  );
  const [hoveredDetId, setHoveredDetId] = useState<string | null>(null);
  const [selectedDetId, setSelectedDetId] = useState<string | null>(null);
  const [acousticPalette, setAcousticPalette] = useState<'amber' | 'emerald' | 'cobalt' | 'grayscale'>('amber');
  const [transducerFreq, setTransducerFreq] = useState<450 | 900 | 1200>(900);

  const PALETTE_FILTERS: Record<string, string> = {
    amber: 'sepia(0.85) hue-rotate(-12deg) saturate(2.1) contrast(1.15)',
    emerald: 'hue-rotate(85deg) saturate(2.4) contrast(1.2)',
    cobalt: 'hue-rotate(185deg) saturate(2.2) contrast(1.2)',
    grayscale: 'grayscale(1) contrast(1.25) brightness(1.05)',
  };

  const visibleDetections = scan.detections.filter(
    (d) => d.confidence >= activeThreshold
  );

  const isV2 = scan.model_version === 'v2' || scan.model_name?.includes('Marine-Debris');

  const ghostNetCount = visibleDetections.filter((d) => d.type === 'ghost_net_aldfg').length;
  const debrisCount = visibleDetections.filter((d) => d.type === 'anthropogenic_debris').length;
  const pipelineCount = visibleDetections.filter((d) => d.type === 'pipeline_hazard').length;
  const anomalyCount = visibleDetections.filter((d) => d.type === 'seafloor_anomaly').length;
  const milcoCount = visibleDetections.filter((d) => d.type === 'MILCO').length;
  const nomboCount = visibleDetections.filter((d) => d.type === 'NOMBO').length;
  const suppressedCount = scan.false_positives_suppressed || 0;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleAutoTune = () => {
    const target = Math.max(
      0.01,
      Math.min(0.25, scan.highest_confidence > 0 ? scan.highest_confidence - 0.005 : 0.05)
    );
    setActiveThreshold(parseFloat(target.toFixed(2)));
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${scan.scan_id}_detections.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getColorForClass = (type: string) => {
    if (type === 'ghost_net_aldfg') return '#A855F7'; // Purple
    if (type === 'anthropogenic_debris') return '#F59E0B'; // Amber
    if (type === 'pipeline_hazard') return '#3B82F6'; // Blue
    if (type === 'seafloor_anomaly') return '#06B6D4'; // Cyan
    if (type === 'MILCO') return '#EF4444'; // Red
    if (type === 'NOMBO') return '#06B6D4'; // Cyan
    return '#38BDF8';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 1. Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl subpixel-card border border-white/[0.08] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/30 text-[#FFB703]">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-slate-400">
              Targets Identified
            </p>
            <p className="text-2xl font-extrabold text-white font-mono">
              {visibleDetections.length}
            </p>
          </div>
        </div>

        {isV2 ? (
          <>
            <div className="p-4 rounded-2xl subpixel-card border border-purple-500/30 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase text-purple-400">
                  Ghost Nets (ALDFG)
                </p>
                <p className="text-2xl font-extrabold text-purple-400 font-mono">
                  {ghostNetCount}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl subpixel-card border border-amber-500/30 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase text-amber-400">
                  Marine Debris
                </p>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  {debrisCount}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl subpixel-card border border-red-500/30 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase text-red-400">
                  MILCO Contacts
                </p>
                <p className="text-2xl font-extrabold text-red-400 font-mono">
                  {milcoCount}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl subpixel-card border border-amber-500/30 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase text-amber-400">
                  NOMBO Obstacles
                </p>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  {nomboCount}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Noise Suppressed Metric */}
        <div className="p-4 rounded-2xl subpixel-card border border-emerald-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-emerald-400">
              Noise Suppressed
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">
              {suppressedCount}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl subpixel-card border border-white/[0.08] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300">
            <Clock className="w-5 h-5 text-[#FFB703]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-slate-400">
              Latency
            </p>
            <p className="text-2xl font-extrabold text-white font-mono">
              {scan.inference_ms.toFixed(1)}{' '}
              <span className="text-xs text-slate-400 font-normal">ms</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Inspection Canvas */}
      <div className="rounded-3xl subpixel-card overflow-hidden shadow-2xl border border-white/[0.08]">
        {/* Canvas Toolbar */}
        <div className="p-3.5 bg-white/[0.02] backdrop-blur border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          {/* Dynamic Confidence Slider & Presets */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400">Model Cutoff:</span>
            <input
              type="range"
              min="0.01"
              max="0.95"
              step="0.01"
              value={activeThreshold}
              onChange={(e) => setActiveThreshold(parseFloat(e.target.value))}
              className="w-24 sm:w-32 h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#FFB703]"
            />
            <span className="text-xs font-mono text-[#FFB703] font-black bg-[#FFB703]/10 px-2.5 py-0.5 rounded-md border border-[#FFB703]/30">
              {(activeThreshold * 100).toFixed(0)}%
            </span>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setActiveThreshold(0.25)}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  activeThreshold === 0.25
                    ? 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40 font-bold'
                    : 'bg-white/[0.02] text-slate-400 border-white/[0.08]'
                }`}
              >
                25%
              </button>
              <button
                onClick={() => setActiveThreshold(0.08)}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  activeThreshold === 0.08
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                    : 'bg-white/[0.02] text-slate-400 border-white/[0.08]'
                }`}
              >
                8%
              </button>
              <button
                onClick={() => setActiveThreshold(0.01)}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  activeThreshold === 0.01
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                    : 'bg-white/[0.02] text-slate-400 border-white/[0.08]'
                }`}
              >
                1%
              </button>
            </div>
          </div>

          {/* View Toggles & Zoom */}
          <div className="flex items-center gap-1.5 flex-wrap">

            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                showBoxes
                  ? 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40 font-bold'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.08]'
              }`}
              title="Toggle target outlines"
            >
              {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Overlay</span>
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                showLabels
                  ? 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40 font-bold'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.08]'
              }`}
              title="Toggle labels"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Labels</span>
            </button>

            {/* Acoustic Frequency Selector */}
            <div className="flex items-center gap-1 bg-[#0B111D] border border-[#1A2436] rounded-xl p-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase px-1 hidden sm:inline">FREQ:</span>
              <button
                type="button"
                onClick={() => setTransducerFreq(450)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  transducerFreq === 450
                    ? 'bg-[#38BDF8] text-[#05070B] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="450 kHz (Deep Swath Search)"
              >
                450k
              </button>
              <button
                type="button"
                onClick={() => setTransducerFreq(900)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  transducerFreq === 900
                    ? 'bg-[#FFB703] text-[#05070B] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="900 kHz (Tactical Profiling)"
              >
                900k
              </button>
              <button
                type="button"
                onClick={() => setTransducerFreq(1200)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  transducerFreq === 1200
                    ? 'bg-[#A855F7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="1200 kHz (Ultra-High Resolution Micro-Debris)"
              >
                1200k
              </button>
            </div>

            {/* Palette Switcher */}
            <div className="flex items-center gap-1 bg-[#0B111D] border border-[#1A2436] rounded-xl p-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase px-1 hidden sm:inline">PALETTE:</span>
              <button
                type="button"
                onClick={() => setAcousticPalette('amber')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  acousticPalette === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Kongsberg Copper / Amber Palette"
              >
                AMBER
              </button>
              <button
                type="button"
                onClick={() => setAcousticPalette('emerald')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  acousticPalette === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Naval Phosphor Green Palette"
              >
                EMERALD
              </button>
              <button
                type="button"
                onClick={() => setAcousticPalette('cobalt')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  acousticPalette === 'cobalt'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="EdgeTech Cyan / Cobalt Palette"
              >
                COBALT
              </button>
              <button
                type="button"
                onClick={() => setAcousticPalette('grayscale')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  acousticPalette === 'grayscale'
                    ? 'bg-slate-700 text-slate-200 border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Scientific Monochromatic Grayscale"
              >
                B&W
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas with Scaled SVG Overlay */}
        <div className="relative overflow-auto max-h-[580px] bg-[#02050E] flex items-center justify-center p-4 select-none">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
            className="relative transition-transform duration-150 inline-block shadow-2xl rounded-xl overflow-hidden border border-slate-800"
          >
            <img
              ref={imgRef}
              src={previewUrl}
              crossOrigin="anonymous"
              alt="Analyzed side-scan sonar swath"
              style={{ filter: PALETTE_FILTERS[acousticPalette] }}
              className="max-h-[520px] w-auto object-contain block pointer-events-none transition-all duration-300"
            />

            {/* SVG Bounding Box Layer with Animated Staggered Draw-In */}
            {showBoxes && (
              <svg
                viewBox={`0 0 ${scan.image_width} ${scan.image_height}`}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                preserveAspectRatio="none"
              >
                {visibleDetections.map((det) => {
                  const b = det.bbox;
                  const isSelected = selectedDetId === det.id || hoveredDetId === det.id;
                  const strokeColor = getColorForClass(det.type);
                  return (
                    <g
                      key={det.id}
                      onClick={() => setSelectedDetId(det.id)}
                      onMouseEnter={() => setHoveredDetId(det.id)}
                      onMouseLeave={() => setHoveredDetId(null)}
                      className="cursor-pointer group"
                    >
                      {/* Clean Standard YOLO Bounding Box */}
                      <rect
                        x={b.x1}
                        y={b.y1}
                        width={Math.max(1, b.x2 - b.x1)}
                        height={Math.max(1, b.y2 - b.y1)}
                        fill={strokeColor}
                        fillOpacity={isSelected ? 0.35 : 0.15}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all"
                        style={{ filter: `drop-shadow(0 0 6px ${strokeColor}60)` }}
                      />

                      {/* Pill Label */}
                      {showLabels && (
                        <g>
                          <rect
                            x={b.x1}
                            y={Math.max(0, b.y1 - 22)}
                            width={Math.max(90, (det.type.length + 6) * 7.5)}
                            height={20}
                            fill="#070D1B"
                            fillOpacity={0.92}
                            stroke={strokeColor}
                            strokeWidth={1}
                            rx={4}
                          />
                          <text
                            x={b.x1 + 6}
                            y={Math.max(0, b.y1 - 8)}
                            fill={strokeColor}
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {det.type} {(det.confidence * 100).toFixed(0)}%
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Status Strip */}
        <div className="p-3 bg-[#060D17] border-t border-[#152438] flex flex-wrap items-center justify-between text-xs font-mono text-[#7C8AA0] gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span>Dimensions: {scan.image_width} × {scan.image_height} px</span>
            <span>Active Targets: <strong className="text-[#4CD9E8]">{visibleDetections.length}</strong></span>
            {scan.location && scan.location.latitude && (
              <span className="text-[#3FD98A] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Geotag: {scan.location.latitude.toFixed(4)}°N, {scan.location.longitude?.toFixed(4)}°E
                {scan.geotag_source && ` (${scan.geotag_source})`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0A1322] border border-[#152438]">
              Noise Filter: {scan.noise_filtering_applied ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* 2.5. Research-Grade Noise Removal & Shadow Verification Panel */}
      <div className="rounded-3xl overflow-hidden">
        <BeforeAfterNoisePanel
          rawNoiseDescription="Raw SSS Waterfall (High Rayleigh Speckle Noise & Ambient Sediment Scattering)"
          filteredNoiseDescription="Denoised (Lee 7x7 Filter + CLAHE Contrast Enhancement)"
          contrastImprovementDb={4.8}
          isDenoisedActive={scan.noise_filtering_applied ?? true}
          imageUrl={previewUrl}
        />
      </div>

      {/* 3. Acoustic Contact Register Table */}
      <div className="p-6 rounded-3xl subpixel-card border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                Acoustic Contact Register
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/30">
                Model: {scan.model_name || 'YOLOv8n-SIH-Marine-Debris-V2'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover or click any target row to highlight on the swath canvas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = ['Scan_ID', 'Detection_ID', 'Class', 'Confidence', 'BBox_X1', 'BBox_Y1', 'BBox_X2', 'BBox_Y2', 'Noise_Filter_Status'];
                const rows = visibleDetections.map((d) => [
                  scan.scan_id,
                  d.id,
                  `"${d.type}"`,
                  (d.confidence * 100).toFixed(1) + '%',
                  d.bbox.x1,
                  d.bbox.y1,
                  d.bbox.x2,
                  d.bbox.y2,
                  `"${d.noise_filter_reason || 'Passed acoustic verification'}"`,
                ].join(','));
                const csv = `${headers.join(',')}\n${rows.join('\n')}`;
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${scan.scan_id}_anomalies.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download structured anomaly CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-1.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-black text-xs font-mono flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspection Report</span>
            </button>
          </div>
        </div>

        {visibleDetections.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#FFB703] shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-xs font-mono font-bold text-slate-200">
                  No model detections above {(activeThreshold * 100).toFixed(0)}% confidence.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The model (<strong className="text-[#FFB703] font-mono">{scan.model_name}</strong>) evaluated this swath.
                  {scan.highest_confidence > 0 ? (
                    <> Highest model confidence detected in this scan is <strong className="text-amber-400 font-mono">{(scan.highest_confidence * 100).toFixed(1)}%</strong> (Potential low-confidence anomaly).</>
                  ) : (
                    <> No candidate anomalies detected across the swath.</>
                  )}
                </p>

                {scan.highest_confidence > 0 && scan.highest_confidence < activeThreshold && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleAutoTune}
                      className="px-3 py-1.5 rounded-xl bg-[#FFB703]/20 hover:bg-[#FFB703]/30 border border-[#FFB703]/40 text-[#FFB703] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
                      <span>Inspect Candidate (Set Cutoff to {(scan.highest_confidence * 100).toFixed(1)}%)</span>
                    </button>

                    <button
                      onClick={() => setActiveThreshold(0.01)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      Deep Scan (1% Cutoff)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080E1C]/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Target ID</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Bounding Box</th>
                  <th className="py-3 px-3">Noise Filter Diagnostic</th>
                  <th className="py-3 px-3">MoES Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visibleDetections.map((det) => {
                  const isSelected = selectedDetId === det.id || hoveredDetId === det.id;
                  const isGhostNet = det.type === 'ghost_net_aldfg';
                  const isDebris = det.type === 'anthropogenic_debris';
                  const isPipeline = det.type === 'pipeline_hazard';

                  return (
                    <tr
                      key={det.id}
                      onClick={() => setSelectedDetId(det.id)}
                      onMouseEnter={() => setHoveredDetId(det.id)}
                      onMouseLeave={() => setHoveredDetId(null)}
                      className={`hover:bg-[#FFB703]/5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#FFB703]/10 text-amber-200 ring-1 ring-[#FFB703]/30' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400 font-semibold">
                        {det.id}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          type={det.type}
                          label={det.type}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#FFB703] h-full rounded-full"
                              style={{ width: `${det.confidence * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-100">
                            {(det.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        [{det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)},{' '}
                        {det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)}]
                      </td>
                      <td className="py-3 px-3 text-emerald-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          {det.noise_filter_reason || 'Passed acoustic verification'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isGhostNet ? (
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            CRITICAL ALDFG THREAT
                          </span>
                        ) : isDebris ? (
                          <span className="text-amber-400 font-medium">ANTHROPOGENIC DEBRIS</span>
                        ) : isPipeline ? (
                          <span className="text-blue-400 font-medium">SUBSEA INFRASTRUCTURE</span>
                        ) : (
                          <span className="text-cyan-400 font-medium">SEAFLOOR ANOMALY</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
          <button
            onClick={onReset}
            className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyze Another Sonar Track</span>
          </button>
          <span>
            Scan ID: <strong className="text-slate-200">{scan.scan_id}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
