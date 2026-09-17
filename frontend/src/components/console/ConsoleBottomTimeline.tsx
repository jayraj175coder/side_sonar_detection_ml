import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, Copy, Check, Terminal } from 'lucide-react';

export interface EventLogEntry {
  time: string;
  tag: string;
  text: string;
  level: 'info' | 'success' | 'warn' | 'reject';
}

interface ConsoleBottomTimelineProps {
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeekFrame: (frame: number) => void;
  onRewind: () => void;
  speedMultiplier: number;
  onSelectSpeed: (speed: number) => void;
  logs: EventLogEntry[];
}

export const ConsoleBottomTimeline: React.FC<ConsoleBottomTimelineProps> = ({
  currentFrame,
  totalFrames,
  isPlaying,
  onTogglePlay,
  onSeekFrame,
  onRewind,
  speedMultiplier,
  onSelectSpeed,
  logs,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-scroll logs to bottom whenever new lines appear
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `${l.time} ${l.tag.padEnd(4)} ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Acoustic backscatter density sparkline data
  const sparklineData = [2, 4, 1, 6, 8, 12, 14, 9, 5, 8, 17, 12, 6, 3, 1, 4, 7, 10, 5, 2];

  return (
    <div className="h-38 bg-[#080D17] border-t border-[#162136] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#162136] select-none font-mono text-[10px] shrink-0 z-20">
      {/* 1. LEFT HALF: TIMELINE SCRUBBER & CONTROLS */}
      <div className="p-3 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">
              SURVEY TIMELINE
            </span>
            <span className="text-[8.5px] text-[#FFB703] font-bold">
              FRAME {String(currentFrame).padStart(3, '0')} / {totalFrames}
            </span>
          </div>

          {/* Speed Toggles */}
          <div className="flex items-center gap-1 text-[8px]">
            <span className="text-[#94A3B8]">SPEED:</span>
            {[1, 4, 12].map((sp) => (
              <button
                key={sp}
                onClick={() => onSelectSpeed(sp)}
                className={`px-1.5 py-0.2 border transition-all cursor-pointer font-bold ${
                  speedMultiplier === sp
                    ? 'bg-[#FFB703] text-[#05070B] border-[#FFB703]'
                    : 'bg-[#05070B] text-[#94A3B8] border-[#162136] hover:text-[#F8FAFC]'
                }`}
              >
                {sp}X
              </button>
            ))}
          </div>
        </div>

        {/* Rolling Density Sparkline */}
        <div className="h-5 w-full flex items-end gap-1 px-1 opacity-70">
          {sparklineData.map((val, idx) => {
            const isCurrent = Math.floor((idx / sparklineData.length) * totalFrames) <= currentFrame;
            return (
              <div
                key={idx}
                style={{ height: `${val * 5}%` }}
                className={`flex-1 transition-all ${
                  isCurrent ? 'bg-[#FFB703]' : 'bg-[#162136]'
                }`}
              />
            );
          })}
        </div>

        {/* Real Interactive Range Scrubber */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-[#94A3B8] font-mono">T0</span>
          <input
            type="range"
            min={1}
            max={totalFrames}
            value={currentFrame}
            onChange={(e) => onSeekFrame(Number(e.target.value))}
            className="flex-1 h-1 bg-[#162136] appearance-none cursor-pointer accent-[#FFB703]"
          />
          <span className="text-[8px] text-[#94A3B8] font-mono">T+{totalFrames}</span>
        </div>

        {/* Playback Transport Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-[#162136]/60">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRewind}
              className="panel-btn px-2"
              title="Rewind to frame 001"
            >
              <SkipBack className="w-3 h-3" />
              <span className="ml-1">START</span>
            </button>

            <button
              onClick={onTogglePlay}
              className={`panel-btn px-3 flex items-center gap-1 ${
                isPlaying ? 'bg-[#FFB703] text-[#05070B] border-[#FFB703]' : ''
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
          </div>

          <span className="text-[8px] text-[#94A3B8]">
            TOW SPEED: 4.1 KNOTS · 10 HZ PING STREAM
          </span>
        </div>
      </div>

      {/* 2. RIGHT HALF: LIVE EVENT LOG (TERMINAL HUD) */}
      <div className="p-3 flex flex-col justify-between space-y-1 overflow-hidden">
        <div className="flex items-center justify-between pb-1 border-b border-[#162136] shrink-0">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[#FFB703]" />
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">
              LIVE EVENT LOG
            </span>
          </div>

          <button
            onClick={handleCopyLogs}
            className="panel-btn py-0 px-1 text-[8px]"
            title="Copy log buffer"
          >
            {copied ? <Check className="w-2.5 h-2.5 text-[#FFB703]" /> : <Copy className="w-2.5 h-2.5" />}
            <span className="ml-1">COPY</span>
          </button>
        </div>

        {/* Scrollable Terminal Stream with Fade-in and Typewriter Animation for Newest Line */}
        <div
          ref={logContainerRef}
          className="flex-1 bg-[#05070B] border border-[#162136] p-2 overflow-y-auto space-y-1 font-mono text-[9px] shadow-inner"
        >
          {logs.map((item, idx) => {
            const isLatest = idx === logs.length - 1;
            let color = 'text-[#F8FAFC]';
            if (item.level === 'success') color = 'text-[#FFB703] font-bold';
            if (item.level === 'reject') color = 'text-[#ef4444]';
            if (item.level === 'warn') color = 'text-amber-400';

            return (
              <div
                key={idx}
                className={`flex items-start gap-2 leading-tight transition-all duration-200 ${
                  isLatest ? 'animate-fade-in text-[#86efac]' : ''
                }`}
              >
                <span className="text-[#64748B] shrink-0">{item.time}</span>
                <span className="text-[#94A3B8] font-bold shrink-0">{item.tag.padEnd(4)}</span>
                <span className={`flex-1 break-words ${color}`}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
