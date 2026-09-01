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
  TrendingUp,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { getTargetById, MISSION_TARGETS } from '../../data/targets';
import type { MissionTarget } from '../../types';

export const ContactInspector: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const { selectedTargetId, setSelectedTargetId, visibleTargetIds } = useMission();
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
    ctx.fillStyle = '#02060C';
    ctx.fillRect(0, 0, W, H);

    // Render sediment texture
    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const v = Math.floor(Math.abs(noise) * 35);
        ctx.fillStyle = `rgb(${v}, ${v + 15}, ${v + 25})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    const cx = W / 2;
    const cy = H / 2;
    const targetW = target.length * 9;
    const targetH = target.width * 9;

    // Acoustic specular highlight
    ctx.save();
    ctx.fillStyle = target.color;
    ctx.shadowColor = target.color;
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
    ctx.fillStyle = 'rgba(1, 4, 8, 0.95)';
    ctx.beginPath();
    ctx.moveTo(cx - 10 + targetW, cy - targetH);
    ctx.lineTo(cx - 10 + targetW + shadowLen, cy - targetH * 1.4);
    ctx.lineTo(cx - 10 + targetW + shadowLen, cy + targetH * 1.4);
    ctx.lineTo(cx - 10 + targetW, cy + targetH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Reticle & scale overlay
    ctx.strokeStyle = 'rgba(50, 230, 209, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // Scale tick (1 meter bar)
    ctx.fillStyle = '#32E6D1';
    ctx.fillRect(14, H - 16, 25, 2);
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText('1.0m SCALE', 44, H - 12);
  }, [target]);

  if (!target) {
    return (
      <div className="flex flex-col h-full bg-[#081118] border-l border-[#16303B] overflow-y-auto select-none font-mono">
        <div className="px-3.5 py-2.5 border-b border-[#16303B] bg-[#03070B]/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-[#66848D]" />
            <span className="text-[10px] font-black text-[#66848D] uppercase tracking-wider">
              CONTACT INSPECTOR
            </span>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse panel"
              className="p-1 rounded bg-[#0C171E] border border-[#16303B] hover:border-[#32E6D1]/40 text-[#66848D] hover:text-[#32E6D1] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#0C171E] border border-[#16303B] flex items-center justify-center">
            <Crosshair className="w-6 h-6 text-[#16303B]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#66848D] uppercase tracking-widest">
              NO CONTACT SELECTED
            </p>
            <p className="text-[9px] text-[#16303B] mt-1 max-w-[180px]">
              Select a contact from the survey tree or click on the waterfall swath.
            </p>
          </div>

          {/* Quick Select Priority Contacts */}
          <div className="w-full space-y-1 mt-4">
            <p className="text-[8px] text-[#66848D] uppercase tracking-widest text-left mb-1.5">
              Priority Contacts:
            </p>
            {MISSION_TARGETS.filter((t) => t.risk === 'CRITICAL' || t.risk === 'HIGH')
              .slice(0, 5)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTargetId(t.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0C171E] border border-[#16303B] hover:border-[#32E6D1]/40 text-left transition-all"
                >
                  <span className="text-[9px] font-bold text-[#E4F2F5]">
                    {t.id} · {t.class}
                  </span>
                  <span
                    className="text-[9px] font-black"
                    style={{ color: t.color }}
                  >
                    {(t.confidence * 100).toFixed(0)}%
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
    <div className="flex flex-col h-full bg-[#081118] border-l border-[#16303B] overflow-y-auto select-none font-mono">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#16303B] bg-[#03070B]/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Crosshair className="w-3.5 h-3.5 text-[#32E6D1] shrink-0" />
          <span className="text-[11px] font-black text-[#32E6D1] tracking-widest truncate">
            {target.id}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0C171E] border border-[#16303B] text-[#66848D] shrink-0">
            {target.classCode}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${
              target.risk === 'CRITICAL'
                ? 'bg-[#FF5D5D]/15 border-[#FF5D5D]/40 text-[#FF5D5D]'
                : target.risk === 'HIGH'
                ? 'bg-[#FFB547]/15 border-[#FFB547]/40 text-[#FFB547]'
                : 'bg-[#65D391]/15 border-[#65D391]/40 text-[#65D391]'
            }`}
          >
            {target.risk}
          </span>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse panel"
              className="p-1 rounded bg-[#0C171E] border border-[#16303B] hover:border-[#32E6D1]/40 text-[#66848D] hover:text-[#32E6D1] transition-colors ml-1"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {/* Cropped Sonar Return Snippet */}
        <div className="p-2.5 rounded-xl bg-[#03070B]/80 border border-[#16303B] space-y-1.5">
          <div className="flex items-center justify-between text-[8px] text-[#66848D] uppercase tracking-widest">
            <span>CROPPED ACOUSTIC RETURN</span>
            <span className="text-[#32E6D1]">900 kHz RAW SWATH</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#16303B] relative">
            <canvas
              ref={thumbnailCanvasRef}
              width={220}
              height={100}
              className="w-full h-[100px] block"
            />
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#03070B]/90 border border-[#16303B] text-[8px] text-[#32E6D1]">
              TS {target.targetStrengthDb} dB
            </div>
          </div>
        </div>

        {/* Spatial Coordinates & Telemetry */}
        <div className="p-2.5 rounded-xl bg-[#03070B]/80 border border-[#16303B] space-y-2">
          <div className="flex items-center justify-between text-[8px] text-[#66848D] uppercase tracking-widest">
            <span>HYDROGRAPHIC GEOLOCATION</span>
            <span className="text-[#29B6F6]">{target.tracklineId}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="p-1.5 rounded-lg bg-[#0C171E] border border-[#16303B]">
              <span className="text-[7px] text-[#66848D] uppercase block">
                ACROSS-TRACK RANGE
              </span>
              <strong className="text-[#32E6D1] font-bold">
                {target.acrossTrackMeters < 0
                  ? `${Math.abs(target.acrossTrackMeters)} m (PORT)`
                  : `${target.acrossTrackMeters} m (STBD)`}
              </strong>
            </div>

            <div className="p-1.5 rounded-lg bg-[#0C171E] border border-[#16303B]">
              <span className="text-[7px] text-[#66848D] uppercase block">
                SLANT RANGE
              </span>
              <strong className="text-[#E4F2F5] font-bold">
                {target.slantRange} m
              </strong>
            </div>

            <div className="p-1.5 rounded-lg bg-[#0C171E] border border-[#16303B]">
              <span className="text-[7px] text-[#66848D] uppercase block">
                BEARING
              </span>
              <strong className="text-[#E4F2F5] font-bold">
                {target.bearingDeg.toString().padStart(3, '0')}° REL
              </strong>
            </div>

            <div className="p-1.5 rounded-lg bg-[#0C171E] border border-[#16303B]">
              <span className="text-[7px] text-[#66848D] uppercase block">
                SEAFLOOR DEPTH
              </span>
              <strong className="text-[#29B6F6] font-bold">
                {target.depth} m
              </strong>
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="p-1.5 rounded-lg bg-[#0C171E] border border-[#16303B] text-[8px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#66848D]">ESTIMATED DIMENSIONS:</span>
              <strong className="text-[#E4F2F5]">
                {target.length}m (L) × {target.width}m (W)
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66848D]">SHADOW LENGTH:</span>
              <strong className="text-[#E4F2F5]">
                {target.shadowLength}m (Ht ~{target.estimatedHeight}m)
              </strong>
            </div>
          </div>
        </div>

        {/* Classification & Uncertainty Range */}
        <div className="p-2.5 rounded-xl bg-[#03070B]/80 border border-[#16303B] space-y-2">
          <div className="flex items-center justify-between text-[8px] text-[#66848D] uppercase tracking-widest">
            <span>CONFIDENCE DISTRIBUTION</span>
            <span
              className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${
                target.uncertaintyRating === 'LOW AMBIGUITY'
                  ? 'bg-[#65D391]/10 border-[#65D391]/40 text-[#65D391]'
                  : target.uncertaintyRating === 'MODERATE UNCERTAINTY'
                  ? 'bg-[#FFB547]/10 border-[#FFB547]/40 text-[#FFB547]'
                  : 'bg-[#FF5D5D]/10 border-[#FF5D5D]/40 text-[#FF5D5D]'
              }`}
            >
              {target.uncertaintyRating}
            </span>
          </div>

          {/* Confidence Interval Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[#66848D]">EXPECTED SCORE:</span>
              <strong className="text-[#32E6D1]">
                {(target.confidence * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="flex items-center justify-between text-[8px] text-[#66848D]">
              <span>MIN [{(minConf * 100).toFixed(1)}%]</span>
              <span>CONFIDENCE INTERVAL</span>
              <span>MAX [{(maxConf * 100).toFixed(1)}%]</span>
            </div>
            {/* Visual Interval Slider */}
            <div className="h-1.5 bg-[#16303B] rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 bg-[#32E6D1]/30 rounded-full"
                style={{
                  left: `${minConf * 100}%`,
                  right: `${(1 - maxConf) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#32E6D1] rounded-full"
                style={{ left: `${target.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Hydrographic Operator Caveat */}
          <div className="p-2 rounded-lg bg-[#0C171E] border border-[#16303B] space-y-1 text-[8px]">
            <div className="flex items-center gap-1 text-[#32E6D1] font-bold">
              <Info className="w-3 h-3" />
              <span>HYDROGRAPHIC ANALYST ASSESSMENT</span>
            </div>
            <p className="text-[#E4F2F5] leading-relaxed">
              {target.operatorCaveat}
            </p>
          </div>
        </div>

        {/* Evidence Breakdown Bars */}
        <div className="p-2.5 rounded-xl bg-[#03070B]/80 border border-[#16303B] space-y-2">
          <span className="text-[8px] text-[#66848D] uppercase tracking-widest block">
            EVIDENCE BREAKDOWN (ACOUSTIC METRICS)
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
                  <span className="text-[#66848D]">{label}</span>
                  <strong className="text-[#E4F2F5]">{val}%</strong>
                </div>
                <div className="h-1 bg-[#16303B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#32E6D1] rounded-full transition-all duration-500"
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
