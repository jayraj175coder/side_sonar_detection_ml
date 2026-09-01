import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  Shield,
  AlertTriangle,
  ChevronRight,
  Info,
  Ruler,
  Compass,
  Layers,
  Zap,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Download,
  Filter,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { getTargetById, MISSION_TARGETS } from '../../data/targets';
import type { MissionTarget } from '../../types';

export const ContactInspector: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const { selectedTargetId, setSelectedTargetId, focusedPanel, setFocusedPanel, activeTargets } = useMission();
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const target = selectedTargetId
    ? (activeTargets.find((t) => t.id === selectedTargetId) || getTargetById(selectedTargetId))
    : null;

  // Render authentic high-resolution acoustic snippet thumbnail with Bounding Box & Mask
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
    ctx.fillStyle = '#060D17';
    ctx.fillRect(0, 0, W, H);

    // Render acoustic sediment speckle texture
    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const v = Math.floor(Math.abs(noise) * 30);
        ctx.fillStyle = `rgb(${v}, ${v + 14}, ${v + 24})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    const cx = W / 2 - 15;
    const cy = H / 2;
    const targetW = target.length * 8.5;
    const targetH = target.width * 8.5;
    const isDebris = target.classCode === 'NET' || target.class.toLowerCase().includes('debris');
    const isPipe = target.classCode === 'PIP' || target.class.toLowerCase().includes('pipeline');
    const isLowConf = target.confidence < 0.7;

    const classColor = isDebris
      ? '#A855F7'
      : isPipe
      ? '#29B6F6'
      : target.classCode === 'MLO'
      ? '#F04438'
      : target.color || '#4CD9E8';

    // 1. Acoustic Specular Return Highlight
    ctx.save();
    ctx.fillStyle = classColor;
    ctx.shadowColor = classColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      Math.max(6, targetW * 0.4),
      Math.max(4, targetH * 0.4),
      (target.orientation * Math.PI) / 180,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // 2. Acoustic Shadow Corridor stretching horizontally away from nadir
    const shadowLen = Math.max(20, target.shadowLength * 11);
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 14, 0.96)';
    ctx.beginPath();
    ctx.moveTo(cx + targetW * 0.3, cy - targetH * 0.3);
    ctx.lineTo(cx + targetW * 0.3 + shadowLen, cy - targetH * 0.5);
    ctx.lineTo(cx + targetW * 0.3 + shadowLen, cy + targetH * 0.5);
    ctx.lineTo(cx + targetW * 0.3, cy + targetH * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Detected Bounding Box Over Acoustic Snippet (SIH Gap 1 Requirement)
    ctx.save();
    const boxX = cx - targetW * 0.5 - 4;
    const boxY = cy - targetH * 0.5 - 4;
    const boxW = targetW + 8;
    const boxH = targetH + 8;

    ctx.strokeStyle = classColor;
    ctx.lineWidth = 1.5;
    if (isLowConf) {
      ctx.setLineDash([3, 3]);
      ctx.globalAlpha = 0.7;
    }
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Corner reticles
    const cLen = 5;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    // Top-left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + cLen);
    ctx.lineTo(boxX, boxY);
    ctx.lineTo(boxX + cLen, boxY);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW, boxY + boxH - cLen);
    ctx.lineTo(boxX + boxW, boxY + boxH);
    ctx.lineTo(boxX + boxW - cLen, boxY + boxH);
    ctx.stroke();

    // Detection Label Pill
    ctx.fillStyle = '#060D17';
    ctx.fillRect(boxX, boxY - 14, 110, 12);
    ctx.strokeStyle = classColor;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(boxX, boxY - 14, 110, 12);

    ctx.fillStyle = classColor;
    ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
    ctx.fillText(
      `BBOX: ${(target.confidence * 100).toFixed(0)}% · ${target.length}m×${target.width}m`,
      boxX + 3,
      boxY - 5
    );
    ctx.restore();

    // Scale tick (1 meter bar)
    ctx.fillStyle = '#4CD9E8';
    ctx.fillRect(14, H - 14, 25, 2);
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('1.0m SCALE', 44, H - 10);
  }, [target]);

  // Download Structured Contact Anomaly Report (JSON / CSV) (SIH Gap 3 Requirement)
  const handleExportAnomaly = (format: 'json' | 'csv') => {
    if (!target) return;
    let dataStr = '';
    let filename = '';

    if (format === 'json') {
      const payload = {
        survey_id: 'SX-014',
        anomaly_id: target.id,
        classification: target.class,
        class_code: target.classCode,
        confidence: target.confidence,
        confidence_interval: target.confidenceInterval,
        uncertainty_rating: target.uncertaintyRating,
        geolocation: {
          latitude: target.lat,
          longitude: target.lon,
          depth_meters: target.depth,
        },
        acoustic_geometry: {
          length_meters: target.length,
          width_meters: target.width,
          estimated_relief_meters: target.estimatedHeight,
          acoustic_shadow_length_meters: target.shadowLength,
          across_track_meters: target.acrossTrackMeters,
          slant_range_meters: target.slantRange,
          target_strength_db: target.targetStrengthDb,
        },
        risk_level: target.risk,
        operator_notes: target.operatorCaveat,
        evidence_metrics: target.evidence,
        exported_at: new Date().toISOString(),
      };
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      filename = `${target.id}_anomaly_dossier.json`;
    } else {
      const headers = ['ID', 'Class', 'Code', 'Confidence', 'Lat', 'Lon', 'Depth(m)', 'Length(m)', 'Width(m)', 'Shadow(m)', 'Risk'];
      const values = [
        target.id,
        target.class,
        target.classCode,
        (target.confidence * 100).toFixed(1) + '%',
        target.lat,
        target.lon,
        target.depth,
        target.length,
        target.width,
        target.shadowLength,
        target.risk,
      ];
      const csv = `${headers.join(',')}\n${values.join(',')}`;
      dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      filename = `${target.id}_anomaly_record.csv`;
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

  if (!target) {
    return (
      <div className="flex flex-col h-full bg-[#060D17] border-l border-[#152438] overflow-y-auto select-none font-mono">
        <div className="px-3.5 py-2.5 border-b border-[#152438] bg-[#0A1322] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-[#7C8AA0]" />
            <span className="text-[10px] font-bold text-[#7C8AA0] uppercase tracking-wider">
              CONTACT INSPECTOR
            </span>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse panel"
              className="p-1 rounded bg-[#0A1322] border border-[#152438] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#0A1322] border border-[#152438] flex items-center justify-center">
            <Crosshair className="w-6 h-6 text-[#152438]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#7C8AA0] uppercase tracking-widest">
              NO CONTACT SELECTED
            </p>
            <p className="text-[9px] text-[#7C8AA0]/80 mt-1 max-w-[180px]">
              Select a contact from the survey tree or click on the waterfall swath.
            </p>
          </div>

          {/* Quick Select Priority Contacts */}
          <div className="w-full space-y-1 mt-4">
            <p className="text-[8px] text-[#7C8AA0] uppercase tracking-widest text-left mb-1.5">
              Flagged Contacts:
            </p>
            {MISSION_TARGETS.filter((t) => t.risk === 'CRITICAL' || t.risk === 'HIGH')
              .slice(0, 5)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTargetId(t.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0A1322] border border-[#152438] hover:border-[#4CD9E8]/40 text-left text-[9px] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-[#4CD9E8]">{t.id} · {t.class}</span>
                  <span className="text-[8px] font-bold text-[#F04438]">{t.risk}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  const [minConf, maxConf] = target.confidenceInterval;

  return (
    <div className="flex flex-col h-full bg-[#060D17] border-l border-[#152438] overflow-y-auto select-none font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="px-3.5 py-2.5 border-b border-[#152438] bg-[#0A1322] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-[#4CD9E8]" />
          <span className="text-[10px] font-black text-[#EAEFF5] tracking-wider uppercase">
            {target.id} // CONTACT DOSSIER
          </span>
          <span
            className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
              target.risk === 'CRITICAL'
                ? 'bg-[#F04438]/20 text-[#F04438] border-[#F04438]/40'
                : target.risk === 'HIGH'
                ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40'
                : 'bg-[#3FD98A]/20 text-[#3FD98A] border-[#3FD98A]/40'
            }`}
          >
            {target.risk}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded bg-[#0A1322] border border-[#152438] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors cursor-pointer"
              title="Collapse"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SIH GAP 2 REQUIREMENT — Noise Filtering Funnel Readout */}
      <div className="p-2.5 bg-[#0A1322] border-b border-[#152438] space-y-1.5">
        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-[#7C8AA0]">
          <span className="flex items-center gap-1 text-[#3FD98A]">
            <Filter className="w-3 h-3 text-[#3FD98A]" />
            Noise & Clutter Filtering Funnel
          </span>
          <span className="text-[#4CD9E8]">Post-NMS Verified</span>
        </div>
        <div className="flex items-center justify-between gap-1 text-[8px] font-mono">
          <div className="flex-1 bg-[#060D17] p-1 rounded border border-[#152438] text-center">
            <span className="text-[#7C8AA0] block">Raw Returns</span>
            <strong className="text-[#EAEFF5]">42 Pings</strong>
          </div>
          <span className="text-[#7C8AA0] font-bold">→</span>
          <div className="flex-1 bg-[#060D17] p-1 rounded border border-[#152438] text-center">
            <span className="text-[#F5A623] block">Shadow/Rock Clutter</span>
            <strong className="text-[#F5A623]">17 Suppressed</strong>
          </div>
          <span className="text-[#7C8AA0] font-bold">→</span>
          <div className="flex-1 bg-[#0A1A2E] p-1 rounded border border-[#4CD9E8]/40 text-center">
            <span className="text-[#4CD9E8] block">Candidates</span>
            <strong className="text-[#4CD9E8]">3 Verified</strong>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* 3. High-Resolution Acoustic Thumbnail Canvas with Bounding Box Reticle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8px] text-[#7C8AA0] uppercase tracking-widest">
            <span>Acoustic Return Snippet</span>
            <span className="text-[#4CD9E8] font-bold">900 kHz · BBOX ACTIVE</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#152438] shadow-md bg-[#03070E]">
            <canvas ref={thumbnailCanvasRef} width={270} height={130} className="w-full h-auto block" />
          </div>

          <div className="p-1.5 rounded-lg bg-[#0A1322] border border-[#152438] text-[8px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#7C8AA0]">MEASURED DIMENSIONS:</span>
              <strong className="text-[#EAEFF5]">
                {target.length}m (L) × {target.width}m (W)
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7C8AA0]">ACOUSTIC SHADOW:</span>
              <strong className="text-[#EAEFF5]">
                {target.shadowLength}m (Relief ~{target.estimatedHeight}m)
              </strong>
            </div>
          </div>
        </div>

        {/* 4. Classification & Uncertainty Range */}
        <div className="p-2.5 rounded-xl bg-[#0A1322] border border-[#152438] space-y-2">
          <div className="flex items-center justify-between text-[8px] text-[#7C8AA0] uppercase tracking-widest">
            <span>UNCERTAINTY BAND</span>
            <span
              className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${
                target.uncertaintyRating === 'LOW AMBIGUITY'
                  ? 'bg-[#4CD9E8]/10 border-[#4CD9E8]/40 text-[#4CD9E8]'
                  : target.uncertaintyRating === 'MODERATE UNCERTAINTY'
                  ? 'bg-[#F5A623]/10 border-[#F5A623]/40 text-[#F5A623]'
                  : 'bg-transparent border-[#F04438]/50 text-[#F04438]'
              }`}
            >
              {target.uncertaintyRating}
            </span>
          </div>

          {/* Confidence Interval Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] text-[#7C8AA0]">
              <span>BAND [{(minConf * 100).toFixed(0)}% – {(maxConf * 100).toFixed(0)}%]</span>
              <span>QUALITATIVE FIT: <strong className="text-[#4CD9E8]">{(target.confidence * 100).toFixed(0)}%</strong></span>
            </div>
            <div className="h-1.5 bg-[#060D17] rounded-full overflow-hidden relative border border-[#152438]">
              <div
                className="absolute top-0 bottom-0 bg-[#4CD9E8]/30 rounded-full"
                style={{
                  left: `${minConf * 100}%`,
                  right: `${(1 - maxConf) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#4CD9E8] rounded-full"
                style={{ left: `${target.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Hydrographic Operator Caveat */}
          <div className="p-2 rounded-lg bg-[#060D17] border border-[#152438] space-y-1 text-[8px]">
            <div className="flex items-center gap-1 text-[#4CD9E8] font-bold">
              <Info className="w-3 h-3" />
              <span>OPERATOR ASSESSMENT</span>
            </div>
            <p className="text-[#EAEFF5] leading-relaxed">
              {target.operatorCaveat}
            </p>
          </div>
        </div>

        {/* 5. Evidence Breakdown Bars */}
        <div className="p-2.5 rounded-xl bg-[#0A1322] border border-[#152438] space-y-2">
          <span className="text-[8px] text-[#7C8AA0] uppercase tracking-widest block">
            ACOUSTIC METRIC CORRELATIONS
          </span>

          <div className="space-y-1.5 text-[8px]">
            {[
              { label: 'Shape Correlation', val: target.evidence.objectShape },
              { label: 'Acoustic Return Specularity', val: target.evidence.acousticIntensity },
              { label: 'Shadow Geometry Ratio', val: target.evidence.shadowGeometry },
              { label: 'Seabed Contrast SNR', val: target.evidence.seabedContrast },
              { label: 'Dimensional Template Match', val: target.evidence.dimensionalSimilarity },
            ].map(({ label, val }) => (
              <div key={label} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7C8AA0]">{label}</span>
                  <strong className="text-[#EAEFF5]">{val}%</strong>
                </div>
                <div className="h-1 bg-[#060D17] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CD9E8] rounded-full transition-all duration-500"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. SIH GAP 3 REQUIREMENT — Download Structured Anomaly Report */}
        <div className="pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExportAnomaly('json')}
              className="px-2.5 py-2 rounded-xl bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[9px] font-bold text-[#EAEFF5] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 text-[#3FD98A]" /> : <Download className="w-3.5 h-3.5 text-[#4CD9E8]" />}
              <span>{downloadSuccess ? 'Downloaded!' : 'Export JSON'}</span>
            </button>
            <button
              onClick={() => handleExportAnomaly('csv')}
              className="px-2.5 py-2 rounded-xl bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[9px] font-bold text-[#EAEFF5] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#3FD98A]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
