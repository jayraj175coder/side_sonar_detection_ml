import React from 'react';
import { Shield, Crosshair, AlertTriangle, ChevronRight, TrendingUp } from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_TARGETS, getTargetById } from '../../data/targets';

const EvidenceBar: React.FC<{ label: string; value: number; color?: string }> = ({
  label, value, color = '#32E6D1',
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-mono text-[#66848D] uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>{value}%</span>
    </div>
    <div className="h-1 bg-[#16303B] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  </div>
);

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const cfg = {
    CRITICAL: { bg: 'bg-[#FF5D5D]/10', border: 'border-[#FF5D5D]/40', text: 'text-[#FF5D5D]' },
    HIGH:     { bg: 'bg-[#FFB547]/10', border: 'border-[#FFB547]/40', text: 'text-[#FFB547]' },
    MEDIUM:   { bg: 'bg-[#29B6F6]/10', border: 'border-[#29B6F6]/40', text: 'text-[#29B6F6]' },
    LOW:      { bg: 'bg-[#65D391]/10', border: 'border-[#65D391]/40', text: 'text-[#65D391]' },
  }[risk] ?? { bg: 'bg-[#16303B]', border: 'border-[#16303B]', text: 'text-[#66848D]' };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {risk}
    </span>
  );
};

export const TargetIntelPanel: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const { selectedTargetId, setSelectedTargetId, visibleTargetIds } = useMission();
  const target = selectedTargetId ? getTargetById(selectedTargetId) : null;

  if (!target) {
    return (
      <div className="flex flex-col h-full bg-[#081118] border-l border-[#16303B] overflow-y-auto">
        <div className="px-4 py-3 border-b border-[#16303B] bg-[#03070B]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-[#66848D]" />
            <span className="text-[11px] font-mono font-black text-[#66848D] tracking-widest">TARGET INTELLIGENCE</span>
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
          <div className="w-16 h-16 rounded-full bg-[#16303B]/40 border border-[#16303B] flex items-center justify-center">
            <Crosshair className="w-7 h-7 text-[#16303B]" />
          </div>
          <div>
            <p className="text-xs font-mono text-[#66848D] uppercase tracking-widest">No Target Selected</p>
            <p className="text-[10px] font-mono text-[#16303B] mt-1">Click a detection on the sonar waterfall or map</p>
          </div>

          {/* Quick target selector */}
          <div className="w-full space-y-1 mt-4">
            <p className="text-[9px] font-mono text-[#66848D] uppercase tracking-widest mb-2">Quick Select</p>
            {MISSION_TARGETS.filter(t => visibleTargetIds.includes(t.id)).slice(0, 6).map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTargetId(t.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0C171E] border border-[#16303B] hover:border-[#32E6D1]/30 transition-all"
              >
                <span className="text-[10px] font-mono text-[#E4F2F5]">{t.id} — {t.class}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: t.color }}>
                  {(t.confidence * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overallConf = (target.confidence * 100).toFixed(1);
  const evidenceEntries = [
    { label: 'Object Shape',         value: target.evidence.objectShape },
    { label: 'Acoustic Intensity',   value: target.evidence.acousticIntensity },
    { label: 'Shadow Geometry',      value: target.evidence.shadowGeometry },
    { label: 'Seabed Contrast',      value: target.evidence.seabedContrast },
    { label: 'Dimensional Match',    value: target.evidence.dimensionalSimilarity },
    { label: 'Backscatter Pattern',  value: target.evidence.backscatterPattern },
  ];

  return (
    <div className="flex flex-col h-full bg-[#081118] border-l border-[#16303B] overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#16303B] bg-[#03070B]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-[#32E6D1]" />
            <span className="text-[11px] font-mono font-black text-[#32E6D1] tracking-widest">TARGET {target.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RiskBadge risk={target.risk} />
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
        </div>
        <p className="text-[10px] font-mono text-[#66848D] mt-0.5">{target.class}</p>
      </div>

      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Classification */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <p className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest mb-2">Classification</p>

          {/* Confidence ring */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#16303B" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke={target.color} strokeWidth="4"
                  strokeDasharray={`${target.confidence * 125.7} 125.7`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-mono font-black text-[#E4F2F5]">{overallConf}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-[#E4F2F5]">CONFIDENCE</div>
              <div className="text-[10px] font-mono text-[#66848D]">{target.class}</div>
              <div className="text-[10px] font-mono font-bold" style={{ color: target.color }}>
                {target.risk} RISK
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {[
              ['DEPTH',      `${target.depth} m`],
              ['SLANT RNG',  `${target.slantRange} m`],
              ['LENGTH',     `${target.length} m`],
              ['WIDTH',      `${target.width} m`],
              ['SHADOW',     `${target.shadowLength} m`],
              ['ORIENT',     `${target.orientation}°`],
            ].map(([label, value]) => (
              <div key={label} className="p-2 rounded-lg bg-[#0C171E] border border-[#16303B]">
                <p className="text-[8px] text-[#66848D] uppercase tracking-widest">{label}</p>
                <p className="text-[#E4F2F5] font-bold mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Coordinates */}
          <div className="mt-2 p-2 rounded-lg bg-[#0C171E] border border-[#32E6D1]/20 text-[9px] font-mono">
            <span className="text-[#66848D]">WGS-84: </span>
            <span className="text-[#32E6D1]">{target.lat.toFixed(4)}°N  {target.lon.toFixed(4)}°E</span>
          </div>
        </div>

        {/* WHY SONARX FLAGGED THIS */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3 h-3 text-[#32E6D1]" />
            <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Why SonarX Flagged This</span>
          </div>
          <div className="space-y-2.5">
            {evidenceEntries.map(({ label, value }) => (
              <EvidenceBar key={label} label={label} value={value} color={target.color} />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#16303B] flex items-center justify-between">
            <span className="text-[9px] font-mono text-[#66848D] uppercase tracking-widest">Final Confidence</span>
            <span className="text-sm font-mono font-black" style={{ color: target.color }}>{overallConf}%</span>
          </div>
        </div>

        {/* Detection Evidence */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3 h-3 text-[#29B6F6]" />
            <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Detection Evidence</span>
          </div>
          <ul className="space-y-1.5">
            {target.detectionEvidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px] font-mono text-[#E4F2F5]">
                <ChevronRight className="w-3 h-3 text-[#32E6D1] shrink-0 mt-0.5" />
                <span className="leading-snug">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
