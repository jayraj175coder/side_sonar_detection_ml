import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Radio,
  Sparkles,
  Info,
  Shield,
  Layers,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { useMission, GUIDED_DEMO_STAGES } from '../../context/MissionContext';
import { JUDGE_SCENARIOS } from '../../data/judgeScenarios';
import { UploadClassifyModal } from './UploadClassifyModal';
import { sonarAudio } from '../../utils/sonarAudio';

export const GuidedWalkthroughBar: React.FC = () => {
  const {
    isDemoRunning,
    demoStage,
    demoStageInfo,
    isDemoPaused,
    launchDemo,
    pauseDemo,
    resumeDemo,
    skipDemo,
    resetMission,
    activeScenarioId,
    selectScenario,
    isAutoAdvance,
    setIsAutoAdvance,
    manualNextStage,
    manualPrevStage,
    setStageDirectly,
  } = useMission();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  return (
    <>
      <div className="bg-[#10151D] border-b border-[#1B2330] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none font-mono z-20 shadow-md">
        {/* Left: Judge Mode Badge & Scenario Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4CD9E8] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-[#4CD9E8] uppercase">
              JUDGE MODE
            </span>
          </div>

          {/* 4 Preset Scenarios */}
          <div className="flex items-center gap-1 bg-[#080B11] p-1 rounded-xl border border-[#1B2330]">
            {JUDGE_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => selectScenario(scen.id)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeScenarioId === scen.id
                    ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/50 shadow-[0_0_10px_rgba(76,217,232,0.2)]'
                    : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: scen.badgeColor }}
                />
                <span>{scen.name}</span>
              </button>
            ))}
          </div>

          {/* Upload & Classify Trigger */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8] text-[#EAEFF5] hover:text-[#4CD9E8] text-[9px] font-bold transition-all shadow-md cursor-pointer"
            title="Upload custom sonar image or test bundled samples"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#4CD9E8]" />
            <span>UPLOAD & CLASSIFY</span>
          </button>
        </div>

        {/* Center: Stage Progress Steppers (Interactive Clickable Tabs) */}
        <div className="flex items-center gap-1.5 bg-[#080B11] p-1 rounded-xl border border-[#1B2330]">
          {GUIDED_DEMO_STAGES.map((stage, idx) => {
            const isCurrent = demoStage === idx;
            const isCompleted = demoStage > idx;
            return (
              <button
                key={stage.index}
                onClick={() => setStageDirectly(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#4CD9E8] text-[#080B11] shadow-[0_0_12px_rgba(76,217,232,0.4)]'
                    : isCompleted
                    ? 'text-[#3FD98A] hover:bg-[#161C26]'
                    : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-2.5 h-2.5" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center text-[6px]">
                    {idx + 1}
                  </span>
                )}
                <span>{stage.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Manual Stepper Controls [◀ Prev] [Next ▶] + Auto/Manual Toggle */}
        <div className="flex items-center gap-2">
          {/* Manual Step Controls */}
          <div className="flex items-center gap-1 bg-[#080B11] p-1 rounded-xl border border-[#1B2330]">
            <button
              onClick={manualPrevStage}
              disabled={demoStage === 0}
              className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8] hover:border-[#4CD9E8]/40 disabled:opacity-30 cursor-pointer transition-all"
              title="Previous Stage"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[8px] text-[#7C8AA0] font-bold">
              {demoStage + 1} / {GUIDED_DEMO_STAGES.length}
            </span>
            <button
              onClick={manualNextStage}
              disabled={demoStage === GUIDED_DEMO_STAGES.length - 1}
              className="p-1.5 rounded-lg bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8] hover:border-[#4CD9E8]/40 disabled:opacity-30 cursor-pointer transition-all"
              title="Next Stage"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto Advance Toggle */}
          <button
            onClick={() => setIsAutoAdvance(!isAutoAdvance)}
            className={`px-2.5 py-1.5 rounded-xl border text-[8px] font-bold transition-all cursor-pointer ${
              isAutoAdvance
                ? 'bg-[#3FD98A]/20 text-[#3FD98A] border-[#3FD98A]/40'
                : 'bg-[#161C26] text-[#7C8AA0] border-[#1B2330]'
            }`}
            title="Toggle timer auto-advance vs manual pacing"
          >
            {isAutoAdvance ? 'AUTO: ON' : 'MANUAL STEP'}
          </button>

          {/* Reset / Replay Mission */}
          <button
            onClick={launchDemo}
            className="p-2 rounded-xl bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] transition-all cursor-pointer"
            title="Replay Survey from Beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stage Live Telemetry & Assessment Caption Banner */}
      <div className="bg-[#080B11] border-b border-[#1B2330] px-4 py-2 flex items-center justify-between gap-3 text-[9px] font-mono text-[#EAEFF5] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-3.5 h-3.5 text-[#4CD9E8] shrink-0" />
          <span className="text-[#7C8AA0] uppercase font-bold shrink-0">
            {demoStageInfo.title}:
          </span>
          <span className="truncate text-[#EAEFF5]">
            {demoStageInfo.caption}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#7C8AA0] shrink-0">
          <span>SWATH: <strong className="text-[#4CD9E8]">75m</strong></span>
          <span>FREQ: <strong className="text-[#3FD98A]">900 kHz</strong></span>
          <span>SPEED: <strong className="text-[#EAEFF5]">4.1 kts</strong></span>
        </div>
      </div>

      {/* Upload & Classify Modal */}
      <UploadClassifyModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
};
