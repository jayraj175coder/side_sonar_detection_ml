import React, { useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { getTargetById, MISSION_TARGETS } from '../../data/targets';
import type { MissionTarget } from '../../types';

export const ContactInspector: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const { selectedTargetId, setSelectedTargetId, focusedPanel, setFocusedPanel } = useMission();
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);

  const target = selectedTargetId ? getTargetById(selectedTargetId) : null;

  // Render authentic high-resolution acoustic snippet thumbnail
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
    ctx.fillStyle = '#080B11';
    ctx.fillRect(0, 0, W, H);

    // Render sediment texture
    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const v = Math.floor(Math.abs(noise) * 35);
        ctx.fillStyle = `rgb(${v}, ${v + 18}, ${v + 30})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    const cx = W / 2;
    const cy = H / 2;
    const targetW = target.length * 9;
    const targetH = target.width * 9;

    // Acoustic specular highlight
    ctx.save();
    ctx.fillStyle = '#4CD9E8';
    ctx.shadowColor = '#4CD9E8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(
      cx - 10,
      cy,
      Math.max(6, targetW),
      Math.max(4, targetH),
      (target.orientation * Math.PI) / 180,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Acoustic shadow stretching horizontally away from nadir
    const shadowLen = target.shadowLength * 12;
    ctx.save();
    ctx.fillStyle = 'rgba(4, 7, 12, 0.95)';
    ctx.beginPath();
    ctx.moveTo(cx - 10 + targetW, cy - targetH);
    ctx.lineTo(cx - 10 + targetW + shadowLen, cy - targetH * 1.4);
    ctx.lineTo(cx - 10 + targetW + shadowLen, cy + targetH * 1.4);
    ctx.lineTo(cx - 10 + targetW, cy + targetH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Reticle & scale overlay
    ctx.strokeStyle = 'rgba(76, 217, 232, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // Scale tick (1 meter bar)
    ctx.fillStyle = '#4CD9E8';
    ctx.fillRect(14, H - 16, 25, 2);
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText('1.0m SCALE', 44, H - 12);
  }, [target]);

  if (!target) {
    return (
      <div className="flex flex-col h-full bg-[#10151D] border-l border-[#1B2330] overflow-y-auto select-none font-mono">
        <div className="px-3.5 py-2.5 border-b border-[#1B2330] bg-[#080B11] flex items-center justify-between shrink-0">
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
              className="p-1 rounded bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#161C26] border border-[#1B2330] flex items-center justify-center">
            <Crosshair className="w-6 h-6 text-[#1B2330]" />
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
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-left transition-all"
                >
                  <span className="text-[9px] font-bold text-[#EAEFF5]">
                    {t.id} · {t.class}
                  </span>
                  <span className="text-[9px] font-bold text-[#4CD9E8]">
                    {t.uncertaintyRating.split(' ')[0]}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  const [minConf, maxConf] = target.confidenceInterval;

  return (
    <div className="flex flex-col h-full bg-[#10151D] border-l border-[#1B2330] overflow-y-auto select-none font-mono">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#1B2330] bg-[#080B11] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Crosshair className="w-3.5 h-3.5 text-[#4CD9E8] shrink-0" />
          <span className="text-[11px] font-black text-[#4CD9E8] tracking-widest truncate">
            {target.id}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] shrink-0">
            {target.classCode}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[8px] px-2 py-0.5 rounded font-bold border ${
              target.risk === 'CRITICAL'
                ? 'bg-[#F04438]/15 border-[#F04438]/40 text-[#F04438]'
                : target.risk === 'HIGH'
                ? 'bg-[#F5A623]/15 border-[#F5A623]/40 text-[#F5A623]'
                : 'bg-[#3FD98A]/15 border-[#3FD98A]/40 text-[#3FD98A]'
            }`}
          >
            {target.risk}
          </span>
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'inspector' ? null : 'inspector')}
            className={`p-1 rounded border transition-colors cursor-pointer ${
              focusedPanel === 'inspector'
                ? 'bg-[#4CD9E8]/20 border-[#4CD9E8] text-[#4CD9E8]'
                : 'bg-[#161C26] border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8]'
            }`}
            title={focusedPanel === 'inspector' ? 'Exit Focus View' : 'Expand Inspector to Full Focus'}
          >
            {focusedPanel === 'inspector' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse panel"
              className="p-1 rounded bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors ml-1 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {/* Cropped Sonar Return Snippet */}
        <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-1.5">
          <div className="flex items-center justify-between text-[8px] text-[#7C8AA0] uppercase tracking-widest">
            <span>ACOUSTIC RETURN SNIPPET</span>
            <span className="text-[#4CD9E8]">900 kHz SWATH</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#1B2330] relative">
            <canvas
              ref={thumbnailCanvasRef}
              width={220}
              height={100}
              className="w-full h-[100px] block"
            />
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#080B11]/90 border border-[#1B2330] text-[8px] text-[#4CD9E8]">
              TS {target.targetStrengthDb} dB
            </div>
          </div>
        </div>

        {/* Spatial Coordinates & Telemetry */}
        <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
          <div className="flex items-center justify-between text-[8px] text-[#7C8AA0] uppercase tracking-widest">
            <span>HYDROGRAPHIC FIX</span>
            <span className="text-[#29B6F6]">{target.tracklineId}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330]">
              <span className="text-[7px] text-[#7C8AA0] uppercase block">
                ACROSS-TRACK RANGE
              </span>
              <strong className="text-[#4CD9E8] font-bold">
                {target.acrossTrackMeters < 0
                  ? `${Math.abs(target.acrossTrackMeters)} m (PORT)`
                  : `${target.acrossTrackMeters} m (STBD)`}
              </strong>
            </div>

            <div className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330]">
              <span className="text-[7px] text-[#7C8AA0] uppercase block">
                SLANT RANGE
              </span>
              <strong className="text-[#EAEFF5] font-bold">
                {target.slantRange} m
              </strong>
            </div>

            <div className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330]">
              <span className="text-[7px] text-[#7C8AA0] uppercase block">
                BEARING
              </span>
              <strong className="text-[#EAEFF5] font-bold">
                {target.bearingDeg.toString().padStart(3, '0')}° REL
              </strong>
            </div>

            <div className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330]">
              <span className="text-[7px] text-[#7C8AA0] uppercase block">
                SEAFLOOR DEPTH
              </span>
              <strong className="text-[#29B6F6] font-bold">
                {target.depth} m
              </strong>
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330] text-[8px] space-y-1">
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

        {/* Classification & Uncertainty Range */}
        <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
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
            {/* Visual Interval Slider */}
            <div className="h-1.5 bg-[#1B2330] rounded-full overflow-hidden relative">
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
          <div className="p-2 rounded-lg bg-[#161C26] border border-[#1B2330] space-y-1 text-[8px]">
            <div className="flex items-center gap-1 text-[#4CD9E8] font-bold">
              <Info className="w-3 h-3" />
              <span>OPERATOR ASSESSMENT</span>
            </div>
            <p className="text-[#EAEFF5] leading-relaxed">
              {target.operatorCaveat}
            </p>
          </div>
        </div>

        {/* Evidence Breakdown Bars */}
        <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2">
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
                <div className="h-1 bg-[#1B2330] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CD9E8] rounded-full transition-all duration-500"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
