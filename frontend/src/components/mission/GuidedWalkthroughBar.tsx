import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  X,
  Compass,
  Radio,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useMission, GUIDED_DEMO_STAGES } from '../../context/MissionContext';

export const GuidedWalkthroughBar: React.FC = () => {
  const {
    isDemoRunning,
    demoStage,
    demoStageInfo,
    isDemoPaused,
    pauseDemo,
    resumeDemo,
    skipDemo,
    launchDemo,
    resetMission,
    missionStatus,
  } = useMission();

  if (!isDemoRunning && missionStatus !== 'complete') return null;

  return (
    <div className="bg-[#10151D] border-b border-[#1B2330] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 select-none font-mono text-[10px] z-30 shadow-xl">
      {/* Left: Active Stage Stepper & Log Caption */}
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161C26] border border-[#1B2330]">
          <Radio className="w-3.5 h-3.5 text-[#4CD9E8] animate-pulse" />
          <span className="font-bold text-[#4CD9E8] uppercase tracking-wider">
            MISSION WALKTHROUGH
          </span>
        </div>

        {/* 5-Stage Stepper Pills */}
        <div className="flex items-center gap-1">
          {GUIDED_DEMO_STAGES.map((s, idx) => {
            const isCurrent = demoStage === idx;
            const isCompleted = demoStage > idx || missionStatus === 'complete';

            return (
              <div
                key={s.index}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
                  isCurrent
                    ? 'bg-[#4CD9E8]/20 border-[#4CD9E8] text-[#4CD9E8] font-bold shadow-[0_0_10px_rgba(76,217,232,0.2)]'
                    : isCompleted
                    ? 'bg-[#3FD98A]/10 border-[#3FD98A]/30 text-[#3FD98A]'
                    : 'bg-[#161C26]/60 border-[#1B2330] text-[#7C8AA0]'
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#3FD98A]" />
                ) : (
                  <span className="text-[8px] font-bold">{idx + 1}</span>
                )}
                <span className="text-[9px] hidden sm:inline">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Real Mission Stage Caption */}
        <div className="hidden lg:flex items-center gap-1.5 text-[#EAEFF5] bg-[#080B11] px-3 py-1 rounded border border-[#1B2330]">
          <Info className="w-3 h-3 text-[#4CD9E8] shrink-0" />
          <span className="truncate max-w-md">{demoStageInfo.caption}</span>
        </div>
      </div>

      {/* Right: Controls (Pause/Resume, Skip, Replay, Dismiss) */}
      <div className="flex items-center gap-2 shrink-0">
        {isDemoRunning && (
          <>
            <button
              onClick={isDemoPaused ? resumeDemo : pauseDemo}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/50 text-[#EAEFF5] hover:text-[#4CD9E8] transition-colors"
              title={isDemoPaused ? 'Resume Walkthrough' : 'Pause Walkthrough'}
            >
              {isDemoPaused ? (
                <>
                  <Play className="w-3 h-3 text-[#3FD98A]" />
                  <span>RESUME</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-[#F5A623]" />
                  <span>PAUSE</span>
                </>
              )}
            </button>

            <button
              onClick={skipDemo}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/50 text-[#7C8AA0] hover:text-[#EAEFF5] transition-colors"
              title="Skip to final summary"
            >
              <FastForward className="w-3 h-3" />
              <span>SKIP TO END</span>
            </button>
          </>
        )}

        {missionStatus === 'complete' && !isDemoRunning && (
          <button
            onClick={launchDemo}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#4CD9E8]/15 border border-[#4CD9E8]/40 text-[#4CD9E8] font-bold hover:bg-[#4CD9E8]/25 transition-all shadow-sm"
          >
            <RotateCcw className="w-3 h-3" />
            <span>REPLAY DEMO</span>
          </button>
        )}

        <button
          onClick={resetMission}
          className="p-1 rounded bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] hover:text-[#F04438] hover:border-[#F04438]/40 transition-colors"
          title="Exit Walkthrough"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
