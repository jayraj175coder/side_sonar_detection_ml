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
  Percent,
  CheckCircle,
  AlertOctagon,
  Shield,
  Layers,
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

  // Filter detections dynamically based on user threshold slider in viewer
  const visibleDetections = scan.detections.filter(
    (d) => d.confidence >= activeThreshold
  );

  const milcoCount = visibleDetections.filter((d) => d.type === 'MILCO').length;
  const nomboCount = visibleDetections.filter((d) => d.type === 'NOMBO').length;
  const highestConf =
    visibleDetections.length > 0
      ? Math.max(...visibleDetections.map((d) => d.confidence))
      : 0;
  const avgConf =
    visibleDetections.length > 0
      ? visibleDetections.reduce((acc, d) => acc + d.confidence, 0) /
        visibleDetections.length
      : 0;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

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
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0C1427] border border-[#1E2E4E] flex items-center gap-3">
          <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-400">
              Targets Detected
            </p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              {visibleDetections.length}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0C1427] border border-[#1E2E4E] flex items-center gap-3">
          <div className="p-2.5 rounded bg-red-950/60 border border-red-500/30 text-red-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-400">
              MILCO Mine Contacts
            </p>
            <p className="text-xl font-bold text-red-400 font-mono">{milcoCount}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0C1427] border border-[#1E2E4E] flex items-center gap-3">
          <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-400">
              NOMBO Obstacles
            </p>
            <p className="text-xl font-bold text-cyan-400 font-mono">{nomboCount}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0C1427] border border-[#1E2E4E] flex items-center gap-3">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-400">
              Inference Latency
            </p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              {scan.inference_ms.toFixed(1)} <span className="text-xs text-slate-400 font-normal">ms</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Inspection Canvas with Interactive Overlays */}
      <div className="rounded-xl bg-[#080E1C] border border-[#1E2E4E] overflow-hidden shadow-2xl">
        {/* Canvas Toolbar */}
        <div className="p-3 bg-[#0C1427] border-b border-[#1E2E4E] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Threshold:</span>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={activeThreshold}
              onChange={(e) => setActiveThreshold(parseFloat(e.target.value))}
              className="w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-xs font-mono text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {(activeThreshold * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Bounding Boxes */}
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 border transition-all ${
                showBoxes
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Boxes</span>
            </button>

            {/* Toggle Labels */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 border transition-all ${
                showLabels
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Labels</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center rounded bg-slate-900 border border-slate-800">
              <button
                onClick={handleZoomOut}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-300">
                {(zoomLevel * 100).toFixed(0)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 text-slate-400 hover:text-slate-200 border-l border-slate-800"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scalable Image & SVG Box Overlay Viewport */}
        <div className="relative min-h-[440px] max-h-[640px] bg-[#050811] overflow-auto flex items-center justify-center p-4">
          <div
            className="relative inline-block transition-transform duration-150 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* The Real Sonar Image */}
            <img
              src={previewUrl}
              alt="Sonar inspection canvas"
              className="max-w-full h-auto block select-none rounded border border-slate-800"
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
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(6, 182, 212, 0.15)';
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
                        fill={isSelected ? (isMilco ? 'rgba(239, 68, 68, 0.35)' : 'rgba(6, 182, 212, 0.35)') : fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray={isSelected ? '4 2' : 'none'}
                        rx={2}
                      />

                      {/* Corner Tactical Reticles */}
                      <circle cx={x1} cy={y1} r={3} fill={strokeColor} />
                      <circle cx={x2} cy={y1} r={3} fill={strokeColor} />
                      <circle cx={x1} cy={y2} r={3} fill={strokeColor} />
                      <circle cx={x2} cy={y2} r={3} fill={strokeColor} />

                      {/* Tag / Label */}
                      {showLabels && (
                        <g transform={`translate(${x1}, ${Math.max(16, y1 - 6)})`}>
                          <rect
                            x={0}
                            y={-14}
                            width={isMilco ? 96 : 104}
                            height={16}
                            fill={strokeColor}
                            rx={2}
                          />
                          <text
                            x={4}
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

      {/* Detection Inventory Table & Action CTAs */}
      <div className="p-6 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Detected Target Inventory
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Click a row to isolate target coordinates and verify acoustic signature
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Full Report</span>
            </button>
          </div>
        </div>

        {visibleDetections.length === 0 ? (
          <div className="p-6 text-center rounded-lg bg-[#080E1C] border border-slate-800 text-slate-400 text-xs font-mono">
            No contacts identified above threshold ({activeThreshold.toFixed(2)}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080E1C] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Target ID</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Bounding Box [X1, Y1, X2, Y2]</th>
                  <th className="py-2.5 px-3">Assessment</th>
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
                      <td className="py-2.5 px-3 text-slate-400 font-semibold">
                        {det.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          type={det.type as any}
                          label={det.type}
                          size="sm"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        {(det.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        [{det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)},{' '}
                        {det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)}]
                      </td>
                      <td className="py-2.5 px-3">
                        {det.type === 'MILCO' ? (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                            CRITICAL CONTACT
                          </span>
                        ) : (
                          <span className="text-cyan-400">OBSTACLE HAZARD</span>
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
            className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-xs"
          >
            ← Analyze Another Sonar Image
          </button>
          <span>
            Scan ID: <strong className="text-slate-200">{scan.scan_id}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
