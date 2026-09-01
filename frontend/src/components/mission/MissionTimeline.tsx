import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, ChevronRight } from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DURATION_SECONDS, interpolateVesselPosition } from '../../data/mission';
import type { PlaybackSpeed } from '../../types';

const fmtTime = (s: number) => {
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

export const MissionTimeline: React.FC = () => {
  const {
    playbackTime, setPlaybackTime,
    isPlaying, setIsPlaying,
    playbackSpeed, setPlaybackSpeed,
    missionStatus, missionProgress,
  } = useMission();
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(rafRef.current); return; }
    const tick = (ts: number) => {
      if (lastRef.current === 0) lastRef.current = ts;
      const delta = (ts - lastRef.current) / 1000; // seconds
      lastRef.current = ts;
      setPlaybackTime(prev => {
        const next = prev + delta * playbackSpeed;
        if (next >= MISSION_DURATION_SECONDS) { setIsPlaying(false); return MISSION_DURATION_SECONDS; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed, setPlaybackTime, setIsPlaying]);

  const vessel = interpolateVesselPosition(playbackTime);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaybackTime(Number(e.target.value));
    lastRef.current = 0;
  };

  const togglePlay = () => {
    if (playbackTime >= MISSION_DURATION_SECONDS) setPlaybackTime(0);
    lastRef.current = 0;
    setIsPlaying(!isPlaying);
  };

  const speeds: PlaybackSpeed[] = [1, 2, 4];

  return (
    <div className="flex flex-col bg-[#03070B] border-t border-[#16303B] shrink-0">
      {/* Scrubber row */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#16303B]/50">
        <span className="text-[10px] font-mono text-[#66848D] shrink-0">
          T+{fmtTime(playbackTime)}
        </span>
        <input
          type="range"
          min={0}
          max={MISSION_DURATION_SECONDS}
          step={1}
          value={Math.floor(playbackTime)}
          onChange={handleScrub}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#32E6D1' }}
        />
        <span className="text-[10px] font-mono text-[#66848D] shrink-0">
          {MISSION_DATA_DURATION}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Transport controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPlaybackTime(0); lastRef.current = 0; setIsPlaying(false); }}
            className="p-1.5 rounded-lg bg-[#0C171E] border border-[#16303B] text-[#66848D] hover:text-[#E4F2F5] transition-colors"
            title="Rewind"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className={`p-1.5 rounded-lg border transition-all ${
              isPlaying
                ? 'bg-[#FF5D5D]/10 border-[#FF5D5D]/40 text-[#FF5D5D] hover:bg-[#FF5D5D]/20'
                : 'bg-[#32E6D1]/10 border-[#32E6D1]/40 text-[#32E6D1] hover:bg-[#32E6D1]/20'
            }`}
            disabled={missionStatus === 'idle' || missionStatus === 'initializing'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Speed */}
          <div className="flex items-center rounded-lg overflow-hidden border border-[#16303B]">
            {speeds.map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 text-[9px] font-mono font-bold transition-colors border-r border-[#16303B] last:border-0 ${
                  playbackSpeed === s
                    ? 'bg-[#32E6D1]/15 text-[#32E6D1]'
                    : 'bg-[#0C171E] text-[#66848D] hover:text-[#E4F2F5]'
                }`}
              >{s}×</button>
            ))}
          </div>
        </div>

        {/* Live telemetry readout */}
        <div className="flex items-center gap-4 text-[9px] font-mono">
          <TelItem label="PING" value={`${Math.floor(playbackTime * 10).toString().padStart(6, '0')}`} />
          <TelItem label="DEPTH" value={`${vessel.depth.toFixed(1)} M`} accent />
          <TelItem label="HEADING" value={`${vessel.heading.toFixed(0)}°`} />
          <TelItem label="SPEED" value={`${vessel.speed.toFixed(1)} KT`} />
          <TelItem label="PROGRESS" value={`${missionProgress}%`} accent />
        </div>
      </div>
    </div>
  );
};

const TelItem: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex flex-col items-center">
    <span className="text-[#66848D] uppercase tracking-widest text-[8px]">{label}</span>
    <span className={`font-bold ${accent ? 'text-[#32E6D1]' : 'text-[#E4F2F5]'}`}>{value}</span>
  </div>
);

const MISSION_DATA_DURATION = '1:49:32';
