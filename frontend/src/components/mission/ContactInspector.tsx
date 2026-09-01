import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  CheckCircle2,
  ChevronRight,
  Info,
  Ruler,
  Compass,
  Layers,
  Zap,
  Download,
  Check,
  FileSpreadsheet,
  Box,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { getTargetById, MISSION_TARGETS } from '../../data/targets';
import type { MissionTarget } from '../../types';

export const ContactInspector: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const {
    selectedTargetId,
    setSelectedTargetId,
    focusedPanel,
    setFocusedPanel,
    activeTargets,
  } = useMission();

  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const target = selectedTargetId
    ? (activeTargets.find((t) => t.id === selectedTargetId) || getTargetById(selectedTargetId))
    : MISSION_TARGETS[0];

  // Render high-resolution acoustic snippet thumbnail
  useEffect(() => {
    if (!target) return;
    const canvas = thumbnailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Deep seabed substrate background
    ctx.fillStyle = '#081118';
    ctx.fillRect(0, 0, W, H);

    // Render acoustic sediment speckle texture
    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const v = Math.floor(Math.abs(noise) * 28);
        ctx.fillStyle = `rgb(${v}, ${v + 15}, ${v + 22})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    const cx = W / 2 - 15;
    const cy = H / 2;
    const targetW = target.length * 8;
    const targetH = target.width * 8;
    const isGhostNet = target.id === 'SX-T07' || target.class.toLowerCase().includes('ghost net');

    // 1. Acoustic Return Specular Highlight
    ctx.save();
    ctx.fillStyle = '#32E6D1';
    ctx.shadowColor = '#32E6D1';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      Math.max(6, targetW * 0.38),
      Math.max(4, targetH * 0.38),
      (target.orientation * Math.PI) / 180,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // 2. Acoustic Shadow Corridor stretching horizontally away from nadir
    const shadowLen = Math.max(22, target.shadowLength * 12);
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 11, 0.96)';
    ctx.beginPath();
    ctx.moveTo(cx + targetW * 0.3, cy - targetH * 0.3);
    ctx.lineTo(cx + targetW * 0.3 + shadowLen, cy - targetH * 0.5);
    ctx.lineTo(cx + targetW * 0.3 + shadowLen, cy + targetH * 0.5);
    ctx.lineTo(cx + targetW * 0.3, cy + targetH * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Detected Bounding Box Over Acoustic Snippet
    ctx.save();
    const boxX = cx - targetW * 0.5 - 4;
    const boxY = cy - targetH * 0.5 - 4;
    const boxW = targetW + 8;
    const boxH = targetH + 8;

    ctx.strokeStyle = '#32E6D1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Detection Label Pill
    ctx.fillStyle = '#081118';
    ctx.fillRect(boxX, boxY - 14, 110, 12);
    ctx.strokeStyle = '#32E6D1';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(boxX, boxY - 14, 110, 12);

    ctx.fillStyle = '#32E6D1';
    ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
    ctx.fillText(
      `AI: ${(target.confidence * 100).toFixed(1)}% · ${target.length}m×${target.width}m`,
      boxX + 3,
      boxY - 5
    );
    ctx.restore();

    // 1m Scale bar
    ctx.fillStyle = '#32E6D1';
    ctx.fillRect(14, H - 14, 25, 2);
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('1.0m SCALE', 44, H - 10);
  }, [target]);

  // Download Structured Dossier
  const handleExportAnomaly = (format: 'json' | 'csv') => {
    if (!target) return;
    let dataStr = '';
    let filename = '';

    if (format === 'json') {
      const payload = {
        mission_id: 'MX-026',
        target_id: target.id,
        classification: target.class,
        class_code: target.classCode,
        confidence: target.confidence,
        priority: target.risk,
        geolocation: {
          latitude: target.lat,
          longitude: target.lon,
          depth_meters: target.depth,
        },
        dimensions: {
          length_m: target.length,
          width_m: target.width,
          shadow_relief_m: target.estimatedHeight,
          acoustic_shadow_m: target.shadowLength,
        },
        evidence: target.evidence,
        detection_checkpoints: target.detectionEvidence,
        operator_assessment: target.operatorCaveat,
        exported_at: new Date().toISOString(),
      };
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      filename = `${target.id}_target_intelligence.json`;
    } else {
      const headers = ['Target_ID', 'Class', 'Confidence', 'Lat', 'Lon', 'Depth_M', 'Length_M', 'Width_M', 'Shadow_M', 'Priority'];
      const values = [
        target.id,
        `"${target.class}"`,
        (target.confidence * 100).toFixed(1) + '%',
        target.lat,
        target.lon,
        target.depth,
        target.length,
        target.width,
        target.shadowLength,
        target.risk,
      ];
      dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(`${headers.join(',')}\n${values.join(',')}`);
      filename = `${target.id}_target_record.csv`;
    }

    const a = document.createElement('a');
    a.href = dataStr;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  if (!target) return null;

  return (
    <div className="flex flex-col h-full bg-[#081118] border-l border-[#16303B] overflow-y-auto select-none font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="p-3.5 border-b border-[#16303B] bg-[#0C171E] shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#32E6D1] text-[#03070B] font-mono">
              {target.id}
            </span>
            <h3 className="text-sm font-black text-[#E4F2F5] tracking-wide font-sans truncate">
              {target.class}
            </h3>
          </div>

          <span
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
              target.risk === 'CRITICAL' || target.risk === 'HIGH'
                ? 'bg-[#FF5D5D]/20 text-[#FF5D5D] border-[#FF5D5D]/40'
                : 'bg-[#32E6D1]/20 text-[#32E6D1] border-[#32E6D1]/40'
            }`}
          >
            {target.risk === 'CRITICAL' ? 'HIGH PRIORITY' : target.risk}
          </span>
        </div>

        {/* Large Bold AI Confidence Readout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#081118] border border-[#16303B]">
          <span className="text-[10px] text-[#6F8992] uppercase tracking-wider font-bold">
            AI CONFIDENCE
          </span>
          <span className="text-xl font-extrabold text-[#32E6D1] font-mono">
            {(target.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-4 flex-1 overflow-y-auto">
        {/* 2. Target Core Metric Cards (Uncluttered, High Readability) */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0C171E] border border-[#16303B] space-y-0.5">
            <span className="text-[9px] text-[#6F8992] uppercase block">Seabed Depth</span>
            <strong className="text-sm font-bold text-[#E4F2F5] font-mono">{target.depth.toFixed(1)} m</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0C171E] border border-[#16303B] space-y-0.5">
            <span className="text-[9px] text-[#6F8992] uppercase block">Est. Dimensions</span>
            <strong className="text-sm font-bold text-[#E4F2F5] font-mono">{target.length}m × {target.width}m</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0C171E] border border-[#16303B] space-y-0.5">
            <span className="text-[9px] text-[#6F8992] uppercase block">Acoustic Shadow</span>
            <strong className="text-sm font-bold text-[#32E6D1] font-mono">{target.shadowLength} m</strong>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0C171E] border border-[#16303B] space-y-0.5">
            <span className="text-[9px] text-[#6F8992] uppercase block">Geolocation</span>
            <strong className="text-[10px] font-bold text-[#E4F2F5] font-mono block truncate">
              {target.lat.toFixed(4)}°N, {target.lon.toFixed(4)}°E
            </strong>
          </div>
        </div>

        {/* 3. Acoustic Snippet Thumbnail */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-[#6F8992] uppercase tracking-wider block">
            ACOUSTIC RETURN SNIPPET
          </span>
          <div className="rounded-xl overflow-hidden border border-[#16303B] bg-[#03070B] shadow-inner">
            <canvas ref={thumbnailCanvasRef} width={280} height={120} className="w-full h-auto block" />
          </div>
        </div>

        {/* 4. WHY SONARX FLAGGED THIS (Visual Confidence Bars) */}
        <div className="p-3 rounded-2xl bg-[#0C171E] border border-[#16303B] space-y-2.5">
          <span className="text-[10px] font-black text-[#32E6D1] uppercase tracking-wider block font-sans">
            WHY SONARX FLAGGED THIS
          </span>

          <div className="space-y-2 text-[10px]">
            {[
              { label: 'OBJECT SHAPE', val: target.evidence.objectShape },
              { label: 'ACOUSTIC SHADOW', val: target.evidence.shadowGeometry },
              { label: 'SEABED CONTRAST', val: target.evidence.seabedContrast },
              { label: 'TEXTURE', val: target.evidence.backscatterPattern },
              { label: 'DIMENSIONAL MATCH', val: target.evidence.dimensionalSimilarity },
            ].map(({ label, val }) => (
              <div key={label} className="space-y-0.5">
                <div className="flex items-center justify-between text-[#6F8992]">
                  <span className="font-semibold text-[9px]">{label}</span>
                  <strong className="text-[#E4F2F5] font-mono">{val}%</strong>
                </div>
                <div className="h-1.5 bg-[#081118] rounded-full overflow-hidden border border-[#16303B]/60">
                  <div
                    className="h-full bg-gradient-to-r from-[#32E6D1] to-[#29B6F6] rounded-full transition-all duration-500"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. DETECTION EVIDENCE (Checklist) */}
        <div className="p-3 rounded-2xl bg-[#0C171E] border border-[#16303B] space-y-2">
          <span className="text-[10px] font-black text-[#E4F2F5] uppercase tracking-wider block font-sans">
            DETECTION EVIDENCE
          </span>

          <div className="space-y-1.5 text-[10px] text-[#E4F2F5]">
            {target.detectionEvidence.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#65D391] shrink-0 mt-0.5" />
                <span className="leading-tight text-[9.5px] text-[#E4F2F5]/90">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'seabed' ? null : 'seabed')}
            className="px-3 py-2 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-[10px] font-bold text-[#E4F2F5] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Box className="w-3.5 h-3.5 text-[#32E6D1]" />
            <span>View in 3D</span>
          </button>

          <button
            onClick={() => handleExportAnomaly('json')}
            className="px-3 py-2 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-[10px] font-bold text-[#E4F2F5] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-[#65D391]" /> : <Download className="w-3.5 h-3.5 text-[#32E6D1]" />}
            <span>{downloadSuccess ? 'Saved' : 'Export Dossier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
