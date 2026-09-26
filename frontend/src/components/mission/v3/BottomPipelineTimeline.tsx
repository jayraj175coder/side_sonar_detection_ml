import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

interface BottomPipelineTimelineProps {
  currentStageIndex: number;
  onSelectStageIndex: (idx: number) => void;
  currentFrame: number;
  onChangeFrame?: (frame: number) => void;
  totalFrames?: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  onSelectSpeed: (s: number) => void;
  isDemoRunning?: boolean;
  onSelectTarget?: (targetId: string) => void;
}

interface TimelineMarker {
  pct: number; // 0 to 100
  type: 'detection' | 'verified' | 'anomaly' | 'pipeline';
  targetId?: string;
}

const TIMELINE_MARKERS: TimelineMarker[] = [
  { pct: 4.5, type: 'verified', targetId: 'SX-T01' },
  { pct: 9.2, type: 'verified' },
  { pct: 15.0, type: 'anomaly', targetId: 'SX-T11' },
  { pct: 18.8, type: 'verified' },
  { pct: 31.0, type: 'anomaly' },
  { pct: 35.5, type: 'verified', targetId: 'SX-T07' },
  { pct: 46.2, type: 'detection', targetId: 'SX-T14' },
  { pct: 55.8, type: 'detection', targetId: 'SX-T05' },
  { pct: 61.5, type: 'verified' },
  { pct: 68.0, type: 'anomaly' },
  { pct: 74.2, type: 'verified', targetId: 'SX-T03' },
  { pct: 81.0, type: 'pipeline' },
  { pct: 87.5, type: 'detection', targetId: 'SX-T09' },
  { pct: 94.0, type: 'pipeline' },
];

const PING_LABELS = ['P01', 'P50', 'P100', 'P150', 'P200', 'P250', 'P300', 'P350', 'P400'];

function drawFilmstripFrame(canvas: HTMLCanvasElement | null, index: number) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Deep dark sonar base
  ctx.fillStyle = '#070401';
  ctx.fillRect(0, 0, W, H);

  // Nadir position varies slightly across frames
  const nadirX = W * (0.32 + Math.sin(index * 0.9) * 0.14);

  // Draw golden-amber side-scan swath texture
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#140902');
  grad.addColorStop(Math.max(0.05, (nadirX - 14) / W), '#6B3408');
  grad.addColorStop(nadirX / W, '#F59E0B');
  grad.addColorStop(Math.min(0.95, (nadirX + 18) / W), '#783909');
  grad.addColorStop(1, '#0C0602');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Dark nadir gap line
  ctx.fillStyle = '#050301';
  ctx.fillRect(nadirX - 2.5, 0, 5, H);

  // Speckle grain & bright target echoes on specific frames
  for (let i = 0; i < 90; i++) {
    const sx = ((Math.sin(i * 43.12 + index * 11) * 0.5 + 0.5)) * W;
    const sy = ((Math.cos(i * 19.87 + index * 7) * 0.5 + 0.5)) * H;
    ctx.fillStyle = i % 9 === 0 ? 'rgba(253, 224, 71, 0.55)' : 'rgba(180, 83, 9, 0.35)';
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Highlight feature on key frames
  if (index % 2 === 0 || index === 6) {
    const ex = nadirX + (index % 3 === 0 ? -12 : 14);
    const ey = H * 0.5;
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(ex + 4, ey - 2, 10, 4);
  }
}

export const BottomPipelineTimeline: React.FC<BottomPipelineTimelineProps> = ({
  currentFrame,
  onChangeFrame,
  totalFrames = 128,
  isPlaying,
  onTogglePlay,
  speed,
  onSelectSpeed,
  onSelectTarget,
}) => {
  const filmRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const NUM_THUMBS = 12;
  const progressPct = Math.max(0, Math.min(100, (currentFrame / totalFrames) * 100));
  const activeThumbIdx = Math.min(
    NUM_THUMBS - 1,
    Math.floor((currentFrame / Math.max(1, totalFrames)) * NUM_THUMBS)
  );

  // Compute simulated survey timestamp & ping number matching 14:27:42 / PING #60123 at default frame
  const totalSecondsOffset = Math.round((currentFrame / totalFrames) * 18 * 60);
  const mins = 20 + Math.floor(totalSecondsOffset / 60);
  const secs = totalSecondsOffset % 60;
  const currentTimestamp = `14:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const currentPing = 59800 + Math.round((currentFrame / totalFrames) * 512);

  useEffect(() => {
    for (let i = 0; i < NUM_THUMBS; i++) {
      drawFilmstripFrame(filmRefs.current[i], i);
    }
  }, []);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !onChangeFrame) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChangeFrame(Math.max(1, Math.round(clickRatio * totalFrames)));
  };

  const handleStepForward = () => {
    if (!onChangeFrame) return;
    onChangeFrame(currentFrame >= totalFrames ? 1 : currentFrame + 4);
  };

  const handleCycleSpeed = () => {
    const nextSpeed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
    onSelectSpeed(nextSpeed);
  };

  return (
    <div className="shrink-0 bg-[#060B14] border-t border-[#142238] font-sans select-none z-30">
      {/* ── ROW 1: TIMELINE HEADER & LEGEND ── */}
      <div className="h-7 px-3.5 border-b border-[#111E32] flex items-center justify-between text-[10px] font-mono">
        <span className="font-bold tracking-wider text-[#CBD5E1] uppercase">
          SURVEY TRACK TIMELINE
        </span>

        <div className="hidden md:flex items-center gap-3 text-[#94A3B8]">
          <span>14:20:00 → 14:38:00 (18 min)</span>
          <span className="text-[#334155]">|</span>
          <span className="text-[#CBD5E1]">
            CURRENT: <strong className="text-white">{currentTimestamp}</strong> / PING{' '}
            <strong className="text-[#38BDF8]">#{currentPing}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-[10px]">
          <span className="flex items-center gap-1.5 text-[#CBD5E1]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            Detections
          </span>
          <span className="flex items-center gap-1.5 text-[#CBD5E1]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Verified
          </span>
          <span className="flex items-center gap-1.5 text-[#CBD5E1]">
            <span className="text-[#EF4444] text-[9px] leading-none">▲</span>
            Anomaly
          </span>
          <span className="flex items-center gap-1.5 text-[#CBD5E1]">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            Pipeline
          </span>
        </div>
      </div>

      {/* ── ROW 2: PLAYBACK CONTROLS + PING SCRUBBER TRACK ── */}
      <div className="px-3.5 pt-2 pb-1 flex items-center gap-4">
        {/* Left AUV-07 & Playback Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="pr-1">
            <div className="text-[11px] font-mono font-bold text-[#E2E8F0] leading-tight">
              AUV-07
            </div>
            <div className="text-[9px] text-[#64748B] leading-tight">Ping-by-Ping</div>
          </div>

          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-8 h-8 rounded-full bg-[#0D1829] border border-[#233B5E] hover:border-[#38BDF8] text-white flex items-center justify-center cursor-pointer transition-all shadow"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleStepForward}
            title="Step Forward"
            className="w-7 h-7 rounded bg-[#0B1424] border border-[#1B2E4B] hover:border-[#38BDF8] text-[#CBD5E1] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCycleSpeed}
            title="Cycle Playback Speed"
            className="px-2.5 h-7 rounded bg-[#0B1424] border border-[#1B2E4B] hover:border-[#38BDF8] text-[#E2E8F0] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{speed}x</span>
            <span className="text-[8px] text-[#64748B]">▾</span>
          </button>
        </div>

        {/* Right Interactive Scrubber Track */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {/* Event Dots & Progress Bar */}
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="relative h-6 flex flex-col justify-end cursor-pointer group"
          >
            {/* Event Markers Row */}
            <div className="relative w-full h-3.5 mb-0.5">
              {TIMELINE_MARKERS.map((m, idx) => {
                const color =
                  m.type === 'verified'
                    ? '#10B981'
                    : m.type === 'anomaly'
                    ? '#EF4444'
                    : m.type === 'pipeline'
                    ? '#A855F7'
                    : '#F59E0B';
                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onChangeFrame) {
                        onChangeFrame(Math.max(1, Math.round((m.pct / 100) * totalFrames)));
                      }
                      if (m.targetId && onSelectTarget) {
                        onSelectTarget(m.targetId);
                      }
                    }}
                    style={{ left: `${m.pct}%` }}
                    className="absolute top-0.5 -translate-x-1/2 hover:scale-125 transition-transform cursor-pointer"
                    title={m.targetId ? `Jump to ${m.targetId}` : m.type}
                  >
                    {m.type === 'anomaly' ? (
                      <span className="text-[#EF4444] text-[9px] leading-none block">▲</span>
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full block shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scrubber Track Line */}
            <div className="w-full h-1.5 bg-[#111E32] rounded-full relative overflow-visible">
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] via-[#00E5FF] to-[#38BDF8] rounded-full shadow-[0_0_8px_rgba(0,229,255,0.5)] transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
              {/* White Vertical Playhead Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-3.5 bg-white rounded-xs shadow-[0_0_8px_#fff] transition-all duration-150"
                style={{ left: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Ping Tick Labels (P01 .. P400) */}
          <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] px-1">
            {PING_LABELS.map((lbl) => (
              <span key={lbl}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: SONAR WATERFALL FILMSTRIP THUMBNAILS ── */}
      <div className="px-3.5 pb-2 pt-0.5 flex items-center gap-1.5">
        <button
          onClick={() => onChangeFrame?.(Math.max(1, currentFrame - Math.round(totalFrames / NUM_THUMBS)))}
          className="w-6 h-9 rounded bg-[#0A1322] border border-[#192B44] hover:border-[#38BDF8] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          title="Previous Ping Segment"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 grid grid-cols-12 gap-1">
          {Array.from({ length: NUM_THUMBS }).map((_, idx) => {
            const isSelected = idx === activeThumbIdx;
            return (
              <button
                key={idx}
                onClick={() => {
                  const targetFrame = Math.max(
                    1,
                    Math.min(totalFrames, Math.round(((idx + 0.5) / NUM_THUMBS) * totalFrames))
                  );
                  onChangeFrame?.(targetFrame);
                }}
                className={`h-9 rounded overflow-hidden border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-2 border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.45)] scale-[1.03] z-10'
                    : 'border-[#1B2C46] opacity-80 hover:opacity-100 hover:border-[#38BDF8]/60'
                }`}
              >
                <canvas
                  ref={(el) => {
                    filmRefs.current[idx] = el;
                  }}
                  width={72}
                  height={36}
                  className="w-full h-full object-cover block pointer-events-none"
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={() =>
            onChangeFrame?.(Math.min(totalFrames, currentFrame + Math.round(totalFrames / NUM_THUMBS)))
          }
          className="w-6 h-9 rounded bg-[#0A1322] border border-[#192B44] hover:border-[#38BDF8] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          title="Next Ping Segment"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
