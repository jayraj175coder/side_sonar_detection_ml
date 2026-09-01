import React from 'react';
import { Radio, Compass, Gauge, Zap, MapPin, Clock, ChevronRight, Activity } from 'lucide-react';
import { MISSION_DATA, interpolateVesselPosition } from '../../data/mission';
import { MISSION_TARGETS } from '../../data/targets';
import { useMission } from '../../context/MissionContext';

const StatRow: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#16303B]/60 last:border-0">
    <span className="text-[10px] font-mono text-[#66848D] uppercase tracking-widest">{label}</span>
    <span className={`text-xs font-mono font-bold ${accent ?? 'text-[#E4F2F5]'}`}>{value}</span>
  </div>
);

export const MissionPanel: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const { playbackTime, missionStatus, missionProgress, selectedTargetId, setSelectedTargetId } = useMission();
  const vessel = interpolateVesselPosition(playbackTime);
  const m = MISSION_DATA;
  const priorityTargets = MISSION_TARGETS.filter(t => t.risk === 'CRITICAL' || t.risk === 'HIGH').slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-[#081118] border-r border-[#16303B] overflow-y-auto">
      {/* Mission ID Header */}
      <div className="px-3.5 py-3 border-b border-[#16303B] bg-[#03070B]/60">
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#32E6D1] animate-pulse shrink-0" />
              <span className="text-[11px] font-mono font-black text-[#32E6D1] tracking-widest truncate">MISSION {m.id}</span>
            </div>
            <p className="text-[10px] font-mono text-[#66848D] mt-0.5 truncate">{m.region}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
              missionStatus === 'complete' ? 'bg-[#65D391]/10 border-[#65D391]/30 text-[#65D391]' :
              missionStatus === 'running'  ? 'bg-[#32E6D1]/10 border-[#32E6D1]/30 text-[#32E6D1]' :
              missionStatus === 'initializing' ? 'bg-[#FFB547]/10 border-[#FFB547]/30 text-[#FFB547]' :
              'bg-[#16303B]/60 border-[#16303B] text-[#66848D]'
            }`}>
              {missionStatus.toUpperCase()}
            </span>
            {onCollapse && (
              <button
                onClick={onCollapse}
                title="Collapse panel to left"
                className="p-1 rounded bg-[#0C171E] border border-[#16303B] hover:border-[#32E6D1]/40 text-[#66848D] hover:text-[#32E6D1] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-0.5 bg-[#16303B] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#32E6D1] to-[#29B6F6] transition-all duration-500"
            style={{ width: `${missionProgress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 p-3 space-y-4">
        {/* Live Vessel Telemetry */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-[#32E6D1]" />
            <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Live Telemetry</span>
          </div>
          <div className="space-y-0">
            <StatRow label="Vessel" value={m.vessel.split(' ').slice(-1)[0]} />
            <StatRow label="Latitude" value={`${vessel.lat.toFixed(4)}°N`} accent="text-[#32E6D1]" />
            <StatRow label="Longitude" value={`${vessel.lon.toFixed(4)}°E`} accent="text-[#32E6D1]" />
            <StatRow label="Depth" value={`${vessel.depth.toFixed(1)} m`} accent="text-[#29B6F6]" />
            <StatRow label="Heading" value={`${vessel.heading.toFixed(0)}°`} />
            <StatRow label="Speed" value={`${vessel.speed.toFixed(1)} kt`} />
          </div>
        </div>

        {/* Survey Specs */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <div className="flex items-center gap-1.5 mb-2">
            <Gauge className="w-3 h-3 text-[#29B6F6]" />
            <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Survey Specs</span>
          </div>
          <div className="space-y-0">
            <StatRow label="Sonar" value={m.sonarModel} />
            <StatRow label="Frequency" value={m.frequency} accent="text-[#29B6F6]" />
            <StatRow label="Swath" value={`${m.swathWidth} m`} />
            <StatRow label="Ping Rate" value={`${m.pingRate} Hz`} />
            <StatRow label="Altitude" value={`${m.altimeter} m AGL`} />
            <StatRow label="Total Pings" value={m.totalPings.toLocaleString()} />
          </div>
        </div>

        {/* Priority Targets */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#FF5D5D]" />
              <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Priority Targets</span>
            </div>
            <span className="text-[9px] font-mono text-[#FF5D5D] font-bold">{priorityTargets.length} HIGH+</span>
          </div>
          <div className="space-y-1.5">
            {priorityTargets.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTargetId(t.id === selectedTargetId ? null : t.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition-all ${
                  selectedTargetId === t.id
                    ? 'bg-[#32E6D1]/10 border-[#32E6D1]/40 text-[#32E6D1]'
                    : 'bg-[#081118] border-[#16303B] text-[#E4F2F5] hover:border-[#32E6D1]/30'
                }`}
              >
                <div>
                  <p className="text-[10px] font-mono font-bold">{t.id}</p>
                  <p className="text-[9px] font-mono text-[#66848D]">{t.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono font-bold" style={{ color: t.color }}>
                    {(t.confidence * 100).toFixed(0)}%
                  </p>
                  <p className={`text-[9px] font-mono font-bold ${
                    t.risk === 'CRITICAL' ? 'text-[#FF5D5D]' : 'text-[#FFB547]'
                  }`}>{t.risk}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mission Summary */}
        <div className="p-3 rounded-xl bg-[#03070B]/70 border border-[#16303B]">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-[#FFB547]" />
            <span className="text-[9px] font-mono font-black text-[#66848D] uppercase tracking-widest">Mission Summary</span>
          </div>
          <div className="space-y-0">
            <StatRow label="Area Surveyed" value={`${m.surveyedArea} km²`} accent="text-[#FFB547]" />
            <StatRow label="Track Length" value={`${m.trackLength} km`} />
            <StatRow label="Avg Depth" value={`${m.avgDepth} m`} accent="text-[#29B6F6]" />
            <StatRow label="Coverage" value={`${m.coveragePercent}%`} accent="text-[#65D391]" />
            <StatRow label="Duration" value={m.duration} />
          </div>
        </div>
      </div>
    </div>
  );
};
