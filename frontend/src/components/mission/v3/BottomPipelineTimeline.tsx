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
    <div className="shrink-0 bg-[#05070B] border-t border-[#162136] font-sans select-none z-30">
      {/* ── EXPANDABLE EVENT LOG DRAWER ── */}
      {showEventLog && (
        <div className="bg-[#080D17] border-b border-[#162136] p-3 max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#162136] text-[9px] text-[#94A3B8] uppercase font-bold">
            <span>AUTOMATED PIPELINE AUDIT LOG</span>
            <button onClick={() => setShowEventLog(false)} className="hover:text-[#EF4444] cursor-pointer">
              ✕ CLOSE
            </button>
          </div>
          <div className="space-y-1 text-[9px]">
            {RECENT_EVENTS.map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#94A3B8] font-mono">{ev.time}</span>
                <span className={`px-1 py-0.2 text-[7.5px] font-bold border rounded-xs ${
                  ev.level === 'success' ? 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40' :
                  ev.level === 'reject' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40' :
                  'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40'
                }`}>
                  {ev.tag}
                </span>
                <span className="text-[#F8FAFC]">{ev.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. HORIZONTAL AI PIPELINE (8 CLEAN STAGES) ── */}
      <div className="h-10 px-3 sm:px-4 border-b border-[#162136] flex items-center justify-between gap-1 overflow-x-auto">
        <div className="text-[9px] font-black tracking-wider text-[#94A3B8] uppercase shrink-0 mr-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" />
          <span className="hidden sm:inline">AI PIPELINE:</span>
        </div>

        <div className="flex items-center gap-1 flex-1 min-w-0">
          {PIPELINE_STAGES_V3.map((st, idx) => {
            const isCurrent = currentStageIndex === idx;
            const isCompleted = currentStageIndex > idx;

            return (
              <button
                key={st.number}
                onClick={() => onSelectStageIndex(idx)}
                className={`flex-1 py-0.5 px-1 sm:px-1.5 border transition-all cursor-pointer rounded-xs flex items-center justify-between min-w-[68px] xl:min-w-[82px] ${
                  isCurrent
                    ? 'bg-[#131B2A] border-[#FFB703] text-[#FFB703] font-bold shadow-[0_0_10px_rgba(255, 183, 3, )]'
                    : isCompleted
                    ? 'bg-[#080D17] border-[#162136] text-[#F8FAFC] hover:border-[#FFB703]/40'
                    : 'bg-[#02070D] border-[#0A1E30] text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                <span className="text-[8px] sm:text-[8.5px] font-mono truncate mr-0.5">
                  {st.number} {st.name}
                </span>

                {isCurrent ? (
                  <span className="text-[7px] px-0.5 bg-[#FFB703] text-[#05070B] font-black rounded-xs animate-pulse">
                    ●
                  </span>
                ) : isCompleted ? (
                  <Check className="w-2.5 h-2.5 text-[#FFB703] shrink-0" />
                ) : (
                  <Circle className="w-2 h-2 text-[#64748B] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. MISSION TIMELINE SCRUBBER & CONTROLS ── */}
      <div className="h-9 px-3 sm:px-4 flex items-center justify-between text-[10px] text-[#94A3B8] gap-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTogglePlay}
            className="p-1.5 bg-[#080D17] border border-[#162136] hover:border-[#FFB703]/60 text-[#F8FAFC] hover:text-[#FFB703] cursor-pointer rounded-xs transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={onReset}
            className="p-1.5 bg-[#080D17] border border-[#162136] hover:border-[#EF4444]/60 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer rounded-xs transition-colors"
            title="Reset to Frame 001"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="text-[9.5px] font-bold text-[#F8FAFC] ml-1">
            FRAME <span className="text-[#FFB703]">{String(currentFrame).padStart(3, '0')}</span> / {totalFrames}
          </div>
        </div>

        {/* Horizontal Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#080D17] border border-[#162136] relative rounded-xs overflow-hidden cursor-pointer">
            <div
              className="h-full bg-[#FFB703] transition-all duration-150"
              style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
            />
          </div>
        </div>

        {/* Speed Multipliers & Event Log Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center border border-[#162136] bg-[#080D17] rounded-xs overflow-hidden text-[8.5px]">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSelectSpeed(s)}
                className={`px-2 py-1 font-bold cursor-pointer transition-colors ${
                  speed === s
                    ? 'bg-[#FFB703] text-[#05070B]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0A1E30]'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEventLog((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#080D17] border border-[#162136] hover:border-[#FFB703]/50 text-[#94A3B8] hover:text-[#FFB703] text-[9px] font-bold cursor-pointer rounded-xs transition-all"
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
