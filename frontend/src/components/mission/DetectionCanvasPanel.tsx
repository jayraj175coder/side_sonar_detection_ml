import React, { useState } from 'react';
import { Crosshair, Eye, CheckCircle2, AlertTriangle, ShieldCheck, Download, Layers } from 'lucide-react';
import type { DetectionBox } from '../../data/demoPipelineData';

interface DetectionCanvasPanelProps {
  detections: DetectionBox[];
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
  isDetectionActive: boolean;
  swathWidthM: number;
}

export const DetectionCanvasPanel: React.FC<DetectionCanvasPanelProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
  isDetectionActive,
  swathWidthM,
}) => {
  const [showFilteredBoxes, setShowFilteredBoxes] = useState<boolean>(true);

  return (
    <div className="w-full bg-[#081118] border border-[#16303B] rounded-2xl p-3.5 shadow-xl font-mono select-none flex flex-col space-y-2.5">
      {/* Header with KPI & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#32E6D1]" />
          <h3 className="text-xs font-black text-[#E4F2F5] tracking-wider uppercase font-sans">
            AI DETECTION & CALIBRATED RETICLES
          </h3>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#32E6D1]/15 text-[#32E6D1] border border-[#32E6D1]/30">
            {detections.filter((d) => d.status === 'ACCEPTED').length} ACCEPTED
          </span>
        </div>

        {/* Filter Toggle Chip */}
        <button
          onClick={() => setShowFilteredBoxes(!showFilteredBoxes)}
          className={`px-2 py-0.5 rounded-lg border text-[8px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
            showFilteredBoxes
              ? 'bg-[#FF5D5D]/20 border-[#FF5D5D]/50 text-[#FF5D5D]'
              : 'bg-[#0C171E] text-[#6F8992] border-[#16303B]'
          }`}
        >
          <span>{showFilteredBoxes ? 'HIDE FILTERED' : 'SHOW FILTERED'}</span>
        </button>
      </div>

      {/* Main Sonar Display with Bounding Boxes */}
      <div className="relative w-full h-64 md:h-72 rounded-xl overflow-hidden border border-[#16303B] bg-[#03070B]">
        {/* Background Synthetic Sonar Swath Mosaic */}
        <div className="absolute inset-0 bg-acoustic-grid opacity-80" />

        {/* Center Nadir Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-[#020408] border-x border-[#32E6D1]/20 flex items-center justify-center">
          <span className="[writing-mode:vertical-lr] text-[7px] text-[#32E6D1]/40 font-mono tracking-widest">
            NADIR TRACK
          </span>
        </div>

        {/* Render Detection Bounding Boxes Overlay */}
        {isDetectionActive &&
          detections.map((box) => {
            const isSelected = selectedDetectionId === box.id;
            const isFiltered = box.status === 'FILTERED_OUT';

            if (isFiltered && !showFilteredBoxes) return null;

            // Color coding based on prompt specification:
            // Green >80%, Yellow 50-80%, Red/dashed <50% flagged for review
            let boxColor = '#65D391'; // Green
            let statusLabel = 'HIGH CONFIDENCE';
            if (isFiltered || box.confidence < 0.5) {
              boxColor = '#FF5D5D'; // Red
              statusLabel = 'FILTERED / NOISE';
            } else if (box.confidence < 0.8) {
              boxColor = '#FFB547'; // Yellow
              statusLabel = 'REVIEW / MEDIUM';
            }

            return (
              <div
                key={box.id}
                onClick={() => onSelectDetection(box.id)}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`absolute transition-all cursor-pointer group ${
                  isSelected ? 'z-20 scale-105' : 'z-10'
                }`}
              >
                {/* Synthetic Sonar Echo Inside Box */}
                <div
                  className="w-full h-full rounded-md flex items-center justify-center relative transition-all"
                  style={{
                    backgroundColor: `${boxColor}15`,
                    borderColor: boxColor,
                    borderWidth: isSelected ? '2px' : '1px',
                    borderStyle: isFiltered ? 'dashed' : 'solid',
                    boxShadow: isSelected ? `0 0 15px ${boxColor}60` : 'none',
                  }}
                >
                  {/* Caliper Reticle Corners */}
                  <div
                    className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2"
                    style={{ borderColor: boxColor }}
                  />
                  <div
                    className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2"
                    style={{ borderColor: boxColor }}
                  />
                  <div
                    className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2"
                    style={{ borderColor: boxColor }}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2"
                    style={{ borderColor: boxColor }}
                  />

                  {/* Synthetic Netting Graphic Representation */}
                  <div
                    className="w-3/4 h-3/5 rounded opacity-70 animate-pulse"
                    style={{ backgroundColor: boxColor }}
                  />
                </div>

                {/* Top Label Pill */}
                <div
                  className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[8px] font-bold font-mono whitespace-nowrap shadow-md flex items-center gap-1.5"
                  style={{
                    backgroundColor: '#081118',
                    borderColor: boxColor,
                    borderWidth: '1px',
                    color: boxColor,
                  }}
                >
                  <span>{box.id}</span>
                  <span>·</span>
                  <span>{box.label}</span>
                  <span className="font-extrabold text-[#E4F2F5]">
                    {(box.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Bottom Dimension Pill on Hover / Select */}
                {(isSelected || !isFiltered) && (
                  <div className="absolute -bottom-5 left-0 px-1.5 py-0.2 rounded bg-black/80 text-[7px] text-[#6F8992] whitespace-nowrap border border-[#16303B]">
                    {box.lengthM}m × {box.widthM}m · Shadow {box.shadowLengthM}m
                  </div>
                )}
              </div>
            );
          })}

        {/* Range Ruler Ticks */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[8px] text-[#6F8992] font-mono border-t border-[#16303B] pt-1">
          <span>PORT (-37.5m)</span>
          <span className="text-[#32E6D1]">0m NADIR</span>
          <span>STARBOARD (+37.5m)</span>
        </div>
      </div>
    </div>
  );
};
