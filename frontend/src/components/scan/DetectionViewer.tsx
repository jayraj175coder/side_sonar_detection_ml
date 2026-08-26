import React, { useState } from 'react';
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
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { PredictionResponse, Detection } from '../../types';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [activeThreshold, setActiveThreshold] = useState<number>(
    scan.confidence_threshold || 0.25
  );
  const [selectedDetId, setSelectedDetId] = useState<string | null>(null);

  const visibleDetections = scan.detections.filter(
    (d) => d.confidence >= activeThreshold
  );

  const milcoCount = visibleDetections.filter((d) => d.type === 'MILCO').length;
  const nomboCount = visibleDetections.filter((d) => d.type === 'NOMBO').length;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleAutoTune = () => {
    // If highest confidence is > 0, set threshold to slightly below it or 0.05
    const target = Math.max(0.01, Math.min(0.25, scan.highest_confidence > 0 ? scan.highest_confidence - 0.005 : 0.05));
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

  return (
    <div className="space-y-6">
      {/* 1. Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-slate-400">
              Targets Identified
            </p>
            <p className="text-2xl font-extrabold text-slate-100 font-mono">
              {visibleDetections.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-red-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-red-400">
              MILCO Mine Contacts
            </p>
            <p className="text-2xl font-extrabold text-red-400 font-mono">
              {milcoCount}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-cyan-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-cyan-400">
              NOMBO Obstacles
            </p>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">
              {nomboCount}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase text-slate-400">
              Inference Latency
            </p>
            <p className="text-2xl font-extrabold text-slate-100 font-mono">
              {scan.inference_ms.toFixed(1)}{' '}
              <span className="text-xs text-slate-400 font-normal">ms</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Inspection Canvas */}
      <div className="rounded-3xl glass-panel overflow-hidden shadow-2xl border border-cyan-500/20">
        {/* Canvas Toolbar */}
        <div className="p-3.5 bg-[#080F22]/90 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Dynamic Confidence Slider & Presets */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400">Confidence Cutoff:</span>
            <input
              type="range"
              min="0.01"
              max="0.95"
              step="0.01"
              value={activeThreshold}
              onChange={(e) => setActiveThreshold(parseFloat(e.target.value))}
              className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-xs font-mono text-cyan-400 font-extrabold bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
              {(activeThreshold * 100).toFixed(0)}%
            </span>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setActiveThreshold(0.25)}
                className={`px-2 py-0.5 rounded-md border transition-all ${
                  activeThreshold === 0.25
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                25%
              </button>
              <button
                onClick={() => setActiveThreshold(0.05)}
                className={`px-2 py-0.5 rounded-md border transition-all ${
                  activeThreshold === 0.05
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                5%
              </button>
              <button
                onClick={() => setActiveThreshold(0.01)}
                className={`px-2 py-0.5 rounded-md border transition-all ${
                  activeThreshold === 0.01
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                1%
              </button>
              {scan.highest_confidence > 0 && scan.highest_confidence < 0.25 && (
                <button
                  onClick={handleAutoTune}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition-all"
                  title="Auto-tune cutoff to reveal peak candidate"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Tune ({(scan.highest_confidence * 100).toFixed(0)}%)
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Bounding Boxes */}
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all ${
                showBoxes
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Boxes</span>
            </button>

            {/* Toggle Labels */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all ${
                showLabels
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Labels</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-400 hover:text-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-2 text-slate-300 font-bold">
                {(zoomLevel * 100).toFixed(0)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-400 hover:text-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-slate-400 hover:text-slate-200 border-l border-slate-800"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scalable Image & SVG Box Overlay Viewport */}
        <div className="relative min-h-[440px] max-h-[640px] bg-[#050811] overflow-auto flex items-center justify-center p-6">
          <div
            className="relative inline-block transition-transform duration-150 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* The Real Sonar Image */}
            <img
              src={previewUrl}
              alt="Sonar inspection canvas"
              className="max-w-full h-auto block select-none rounded-2xl border border-slate-800 shadow-2xl"
              style={{ maxHeight: '560px' }}
            />

            {/* Accurate SVG Bounding Box Layer */}
            {showBoxes && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${scan.image_width} ${scan.image_height}`}
                preserveAspectRatio="none"
              >
                {visibleDetections.map((det) => {
                  const isSelected = selectedDetId === det.id;
                  const isMilco = det.type === 'MILCO';
                  const strokeColor = isMilco ? '#EF4444' : '#06B6D4';
                  const fillColor = isMilco
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(6, 182, 212, 0.2)';
                  const { x1, y1, x2, y2 } = det.bbox;
                  const boxWidth = x2 - x1;
                  const boxHeight = y2 - y1;

                  return (
                    <g
                      key={det.id}
                      className="cursor-pointer pointer-events-auto"
                      onClick={() => setSelectedDetId(det.id)}
                    >
                      {/* Bounding Box Rectangle */}
                      <rect
                        x={x1}
                        y={y1}
                        width={boxWidth}
                        height={boxHeight}
                        fill={isSelected ? (isMilco ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)') : fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 3.5 : 2}
                        strokeDasharray={isSelected ? '4 2' : 'none'}
                        rx={3}
                      />

                      {/* Corner Tactical Reticles */}
                      <circle cx={x1} cy={y1} r={3.5} fill={strokeColor} />
                      <circle cx={x2} cy={y1} r={3.5} fill={strokeColor} />
                      <circle cx={x1} cy={y2} r={3.5} fill={strokeColor} />
                      <circle cx={x2} cy={y2} r={3.5} fill={strokeColor} />

                      {/* Tag / Label */}
                      {showLabels && (
                        <g transform={`translate(${x1}, ${Math.max(16, y1 - 6)})`}>
                          <rect
                            x={0}
                            y={-14}
                            width={isMilco ? 100 : 108}
                            height={16}
                            fill={strokeColor}
                            rx={3}
                          />
                          <text
                            x={5}
                            y={-2}
                            fill="#FFFFFF"
                            fontSize="10"
                            fontFamily="JetBrains Mono, monospace"
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
      </div>

      {/* 3. Detection Inventory Table or Low-Confidence Diagnostic Guidance */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              Identified Target Register
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any target row to isolate bounding box coordinates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Full Report</span>
            </button>
          </div>
        </div>

        {visibleDetections.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-xs font-mono font-bold text-slate-200">
                  0 Contacts Exceeded Current Cutoff ({(activeThreshold * 100).toFixed(0)}%)
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The model did not find any contacts above the <strong className="text-cyan-300">{(activeThreshold * 100).toFixed(0)}%</strong> threshold.
                  {scan.highest_confidence > 0 ? (
                    <> Peak acoustic confidence detected in this scan is <strong className="text-amber-400 font-mono">{(scan.highest_confidence * 100).toFixed(1)}%</strong>.</>
                  ) : null}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleAutoTune}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-Tune Threshold to {(scan.highest_confidence > 0 ? Math.min(25, scan.highest_confidence * 100) : 5).toFixed(0)}%</span>
                  </button>

                  <button
                    onClick={() => setActiveThreshold(0.01)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  >
                    Deep Scan (1% Cutoff)
                  </button>
                </div>
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
                  <th className="py-3 px-3">Pixel Bounding Box [X1, Y1, X2, Y2]</th>
                  <th className="py-3 px-3">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visibleDetections.map((det) => {
                  const isSelected = selectedDetId === det.id;
                  return (
                    <tr
                      key={det.id}
                      onClick={() => setSelectedDetId(det.id)}
                      className={`hover:bg-cyan-950/20 cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400 font-semibold">
                        {det.id}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          type={det.type as any}
                          label={det.type}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100">
                        {(det.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        [{det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)},{' '}
                        {det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)}]
                      </td>
                      <td className="py-3 px-3">
                        {det.type === 'MILCO' ? (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                            CRITICAL CONTACT
                          </span>
                        ) : (
                          <span className="text-cyan-400 font-medium">OBSTACLE HAZARD</span>
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
