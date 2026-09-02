import React, { useState } from 'react';
import { Play, Pause, RotateCcw, List, ChevronUp, ChevronDown, Check, Circle } from 'lucide-react';
import { PIPELINE_STAGES_V3 } from '../../../data/missionV3Data';

interface BottomPipelineTimelineProps {
  currentStageIndex: number; // 0 to 7
  onSelectStageIndex: (idx: number) => void;
  currentFrame: number;
  totalFrames?: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  onSelectSpeed: (s: number) => void;
  isDemoRunning?: boolean;
}

export const BottomPipelineTimeline: React.FC<BottomPipelineTimelineProps> = ({
  currentStageIndex,
  onSelectStageIndex,
  currentFrame,
  totalFrames = 128,
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onSelectSpeed,
  isDemoRunning = false,
}) => {
  const [showEventLog, setShowEventLog] = useState(false);

  const RECENT_EVENTS = [
    { time: '04:18:22', tag: 'ING', text: 'Dual-channel 900 kHz acoustic stream ingested (75m swath)', level: 'info' },
    { time: '04:18:23', tag: 'DEN', text: 'Bilateral spatial filter + CLAHE contrast boost applied', level: 'success' },
    { time: '04:18:24', tag: 'DET', text: 'YOLOv8n ONNX detected 37 acoustic candidate proposals', level: 'info' },
    { time: '04:18:25', tag: 'FIL', text: 'Acoustic shadow gate suppressed 20 natural rocks and sand megaripples', level: 'reject' },
    { time: '04:18:26', tag: 'CLS', text: '17 confirmed anomalies attributed to MoES marine debris taxonomy', level: 'success' },
    { time: '04:18:27', tag: 'GEO', text: 'Hero target SX-T07 Ghost Net geotagged at 18.9217° N, 72.8214° E (43.1m depth)', level: 'info' },
    { time: '04:18:28', tag: 'VER', text: 'Target verified (94.7% confidence) · Ready for salvage ROV dispatch', level: 'success' },
  ];

  return (
    <div className="shrink-0 bg-[#030B14] border-t border-[#0D2E4A] font-mono select-none z-30">
      {/* ── EXPANDABLE EVENT LOG DRAWER ── */}
      {showEventLog && (
        <div className="bg-[#05121F] border-b border-[#0D2E4A] p-3 max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#0D2E4A] text-[9px] text-[#4A8090] uppercase font-bold">
            <span>AUTOMATED PIPELINE AUDIT LOG</span>
            <button onClick={() => setShowEventLog(false)} className="hover:text-[#EF4444] cursor-pointer">
              ✕ CLOSE
            </button>
          </div>
          <div className="space-y-1 text-[9px]">
            {RECENT_EVENTS.map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#4A8090] font-mono">{ev.time}</span>
                <span className={`px-1 py-0.2 text-[7.5px] font-bold border rounded-xs ${
                  ev.level === 'success' ? 'bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/40' :
                  ev.level === 'reject' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40' :
                  'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40'
                }`}>
                  {ev.tag}
                </span>
                <span className="text-[#E0F7F4]">{ev.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. HORIZONTAL AI PIPELINE (8 CLEAN STAGES) ── */}
      <div className="h-11 px-4 border-b border-[#0D2E4A] flex items-center justify-between gap-1 overflow-x-auto">
        <div className="text-[9px] font-black tracking-wider text-[#4A8090] uppercase shrink-0 mr-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
          <span>AI PIPELINE:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {PIPELINE_STAGES_V3.map((st, idx) => {
            const isCurrent = currentStageIndex === idx;
            const isCompleted = currentStageIndex > idx;

            return (
              <button
                key={st.number}
                onClick={() => onSelectStageIndex(idx)}
                className={`flex-1 py-1 px-2 border transition-all cursor-pointer rounded-xs flex items-center justify-between min-w-[92px] ${
                  isCurrent
                    ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA] font-bold shadow-[0_0_10px_rgba(0,212,170,0.25)]'
                    : isCompleted
                    ? 'bg-[#05121F] border-[#0D2E4A] text-[#E0F7F4] hover:border-[#00D4AA]/40'
                    : 'bg-[#02070D] border-[#0A1E30] text-[#2A5060] hover:text-[#4A8090]'
                }`}
              >
                <span className="text-[8.5px] font-mono">
                  {st.number} {st.name}
                </span>

                {isCurrent ? (
                  <span className="text-[7.5px] px-1 bg-[#00D4AA] text-[#030B14] font-black rounded-xs animate-pulse">
                    ●
                  </span>
                ) : isCompleted ? (
                  <Check className="w-3 h-3 text-[#00D4AA]" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-[#2A5060]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. MISSION TIMELINE SCRUBBER & CONTROLS ── */}
      <div className="h-10 px-4 flex items-center justify-between text-[10px] text-[#4A8090] gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTogglePlay}
            className="p-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 text-[#E0F7F4] hover:text-[#00D4AA] cursor-pointer rounded-xs transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={onReset}
            className="p-1.5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#EF4444]/60 text-[#4A8090] hover:text-[#EF4444] cursor-pointer rounded-xs transition-colors"
            title="Reset to Frame 001"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="text-[9.5px] font-bold text-[#E0F7F4] ml-1">
            FRAME <span className="text-[#00D4AA]">{String(currentFrame).padStart(3, '0')}</span> / {totalFrames}
          </div>
        </div>

        {/* Horizontal Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#05121F] border border-[#0D2E4A] relative rounded-xs overflow-hidden cursor-pointer">
            <div
              className="h-full bg-[#00D4AA] transition-all duration-150"
              style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
            />
          </div>
        </div>

        {/* Speed Multipliers & Event Log Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center border border-[#0D2E4A] bg-[#05121F] rounded-xs overflow-hidden text-[8.5px]">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSelectSpeed(s)}
                className={`px-2 py-1 font-bold cursor-pointer transition-colors ${
                  speed === s
                    ? 'bg-[#00D4AA] text-[#030B14]'
                    : 'text-[#4A8090] hover:text-[#E0F7F4] hover:bg-[#0A1E30]'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEventLog((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/50 text-[#4A8090] hover:text-[#00D4AA] text-[9px] font-bold cursor-pointer rounded-xs transition-all"
          >
            <List className="w-3 h-3" />
            <span>EVENT LOG</span>
            {showEventLog ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
