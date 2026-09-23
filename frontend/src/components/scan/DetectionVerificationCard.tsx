import React from 'react';
import { Detection } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Target, Cpu, Radio, MapPin } from 'lucide-react';

interface DetectionVerificationCardProps {
  detection: Detection;
  scanId?: string;
  lat?: number | null;
  lon?: number | null;
  inferenceMs?: number;
}

const CLASS_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  ghost_net_aldfg:       { label: 'Ghost Net / ALDFG',      color: '#FFB703', icon: '🕸' },
  anthropogenic_debris:  { label: 'Anthropogenic Debris',   color: '#F59E0B', icon: '♻' },
  pipeline_hazard:       { label: 'Pipeline Hazard',        color: '#38BDF8', icon: '⚡' },
  seafloor_anomaly:      { label: 'Seafloor Anomaly',       color: '#94A3B8', icon: '🔷' },
};

function getClassDisplay(type: string) {
  const key = type.toLowerCase().replace(/\s+/g, '_');
  return CLASS_DISPLAY[key] || { label: type, color: '#FFB703', icon: '◉' };
}

interface PipelineStepProps {
  step: number;
  label: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  detail: string;
}

const PipelineStep: React.FC<PipelineStepProps> = ({ step, label, status, detail }) => {
  const statusColors = {
    PASS:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    FAIL:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',    icon: <XCircle className="w-3.5 h-3.5" /> },
    PENDING: { bg: 'bg-white/[0.04]',   border: 'border-white/[0.1]',   text: 'text-slate-400',   icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  };
  const s = statusColors[status];

  return (
    <div className={`flex-1 min-w-0 p-3 rounded-xl border ${s.bg} ${s.border} space-y-1`}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] font-mono text-slate-500 font-bold">STEP {step}</span>
        <span className={`flex items-center gap-1 text-[9px] font-mono font-black ${s.text}`}>
          {s.icon}
          {status}
        </span>
      </div>
      <div className="text-[11px] font-mono font-bold text-white truncate">{label}</div>
      <div className="text-[9px] font-mono text-slate-400 leading-tight">{detail}</div>
    </div>
  );
};

export const DetectionVerificationCard: React.FC<DetectionVerificationCardProps> = ({
  detection, scanId, lat, lon, inferenceMs,
}) => {
  const cls = getClassDisplay(detection.type);
  const confPct = (detection.confidence * 100).toFixed(1);
  const tier = detection.confidence_tier || (detection.confidence >= 0.70 ? 'HIGH' : detection.confidence >= 0.35 ? 'MEDIUM' : 'LOW');
  const shadowPass = detection.noise_filter_passed !== false;
  const geoAvailable = lat != null && lon != null;

  // Derive verification status
  const aiDetectionPass = true; // If we have the detection, YOLO passed
  const physicsPass = shadowPass;
  const confidencePass = detection.confidence >= 0.35;
  const isVerified = aiDetectionPass && physicsPass && confidencePass;

  const targetId = `T-${detection.id?.slice(-4).toUpperCase() || 'XXXX'}`;

  return (
    <div className="subpixel-card rounded-2xl border border-[#FFB703]/25 overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="px-4 py-3 bg-[#FFB703]/[0.06] border-b border-[#FFB703]/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Target className="w-4 h-4 text-[#FFB703]" />
          <div>
            <div className="text-[11px] font-mono font-black text-[#FFB703] tracking-wider">
              TARGET {targetId}
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              {scanId ? `SCAN: ${scanId}` : 'AI DETECTION → VERIFICATION'}
            </div>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-black ${
          isVerified
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {isVerified ? '✓ VERIFIED' : '⚠ REVIEW'}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Class + Confidence row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <div className="text-[9px] font-mono text-slate-500 uppercase">DEBRIS CLASS</div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{cls.icon}</span>
              <span className="text-sm font-mono font-bold" style={{ color: cls.color }}>{cls.label}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1 text-center">
            <div className="text-[9px] font-mono text-slate-500 uppercase">CONFIDENCE</div>
            <div className="text-xl font-mono font-black" style={{ color: cls.color }}>{confPct}%</div>
            <div className={`text-[9px] font-mono font-bold ${
              tier === 'HIGH' ? 'text-emerald-400' : tier === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
            }`}>{tier}</div>
          </div>
        </div>

        {/* Pipeline Steps — horizontal flow */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            <Cpu className="w-3 h-3 text-[#FFB703]" />
            <span>EVIDENCE PIPELINE</span>
          </div>

          <div className="flex items-center gap-1">
            <PipelineStep
              step={1}
              label="RAW SONAR"
              status="PASS"
              detail={`${detection.bbox.x2 - detection.bbox.x1 | 0}×${detection.bbox.y2 - detection.bbox.y1 | 0}px tile ingested`}
            />
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <PipelineStep
              step={2}
              label="YOLOv8s DETECT"
              status="PASS"
              detail={`BBox [${detection.bbox.x1|0},${detection.bbox.y1|0}] → [${detection.bbox.x2|0},${detection.bbox.y2|0}]`}
            />
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <PipelineStep
              step={3}
              label="ACOUSTIC VERIFY"
              status={physicsPass ? 'PASS' : 'FAIL'}
              detail={detection.noise_filter_reason || (physicsPass ? 'Shadow geometry confirmed' : 'Shadow inconsistency')}
            />
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <PipelineStep
              step={4}
              label="FINAL STATUS"
              status={isVerified ? 'PASS' : 'FAIL'}
              detail={isVerified ? 'Target confirmed — ready for reporting' : 'Requires expert re-review'}
            />
          </div>
        </div>

        {/* Evidence grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] space-y-0.5">
            <div className="text-[8px] text-slate-500 uppercase">AI Detection</div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> PASS
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] space-y-0.5">
            <div className="text-[8px] text-slate-500 uppercase">Shadow Evidence</div>
            <div className={`flex items-center gap-1 font-bold ${physicsPass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {physicsPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {physicsPass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] space-y-0.5">
            <div className="text-[8px] text-slate-500 uppercase">Confidence Gate</div>
            <div className={`flex items-center gap-1 font-bold ${confidencePass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {confidencePass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {confidencePass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] space-y-0.5">
            <div className="text-[8px] text-slate-500 uppercase">Geolocation</div>
            <div className={`flex items-center gap-1 font-bold ${geoAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
              <MapPin className="w-3 h-3" />
              {geoAvailable ? 'TAGGED' : 'NONE'}
            </div>
          </div>
        </div>

        {/* Coordinates + Latency footer */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-white/[0.06] pt-2">
          <div className="flex items-center gap-3">
            {geoAvailable ? (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FFB703]" />
                {lat!.toFixed(4)}°N, {lon!.toFixed(4)}°E
              </span>
            ) : (
              <span className="text-slate-600">No GPS — label DEMO COORDINATES</span>
            )}
          </div>
          {inferenceMs != null && (
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#FFB703]" />
              ONNX: {inferenceMs.toFixed(1)} ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
