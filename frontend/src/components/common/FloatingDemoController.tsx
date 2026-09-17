import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle2,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useMission, GUIDED_DEMO_STEPS } from '../../context/MissionContext';

export const FloatingDemoController: React.FC = () => {
  const {
    isDemoRunning,
    isDemoPaused,
    guidedStepIndex,
    guidedStepInfo,
    pauseGuidedDemo,
    resumeGuidedDemo,
    nextGuidedStep,
    prevGuidedStep,
    goToGuidedStep,
    resetGuidedDemo,
  } = useMission();

  if (!isDemoRunning) return null;

  const isLastStep = guidedStepIndex === GUIDED_DEMO_STEPS.length - 1;

  return (
    <aside
      aria-label="Guided live demo walkthrough controller"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-4xl bg-[#080D17]/95 backdrop-blur-2xl border border-[#FFB703]/50 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_24px_rgba(255, 183, 3, )] font-mono text-xs overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 select-none"
    >
      {/* Top Animated Progress Rail */}
      <div className="w-full h-1 bg-[#0D2640] relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FFB703] to-[#38BDF8] transition-all duration-500 ease-out"
          style={{ width: `${((guidedStepIndex + 1) / GUIDED_DEMO_STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-3 md:p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Live Indicator + Step Navigation Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFB703]/15 border border-[#FFB703]/40 text-[#FFB703] font-black text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(255, 183, 3, )]">
            <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-ping" />
            <span>LIVE DEMO</span>
          </div>

          {/* 4 Interactive Step Pills */}
          <div className="flex items-center gap-1 bg-[#05070B] p-1 rounded-xl border border-[#162136]">
            {GUIDED_DEMO_STEPS.map((step, idx) => {
              const isCurrent = guidedStepIndex === idx;
              const isCompleted = guidedStepIndex > idx;

              return (
                <button
                  key={step.step}
                  onClick={() => goToGuidedStep(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_12px_rgba(255, 183, 3, )]'
                      : isCompleted
                      ? 'text-[#FFB703] hover:bg-[#0A1E30]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title={step.title}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <span>{idx + 1}.</span>
                  )}
                  <span className="hidden sm:inline">{step.stepCode}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Current Step Title & Descriptive Caption */}
        <div className="flex-1 min-w-0 md:px-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#FFB703]">
              {guidedStepInfo.badge}
            </span>
            <span className="text-white/20">·</span>
            <h4 className="text-xs font-black text-[#F8FAFC] tracking-wide truncate">
              {guidedStepInfo.title}
            </h4>
          </div>
          <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
            {guidedStepInfo.caption}
          </p>
        </div>

        {/* Right: Controls (Prev, Pause/Play, Next, Skip/Exit) */}
        <div className="flex items-center gap-1.5 shrink-0 justify-end">
          {/* Previous Step */}
          <button
            onClick={prevGuidedStep}
            disabled={guidedStepIndex === 0}
            className="p-1.5 rounded-lg bg-[#0A1E30] border border-[#162136] hover:border-[#FFB703]/50 text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-30 disabled:hover:border-[#162136] transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Pause / Resume */}
          <button
            onClick={isDemoPaused ? resumeGuidedDemo : pauseGuidedDemo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0A1E30] border border-[#162136] hover:border-[#FFB703]/50 text-[#F8FAFC] text-[10px] font-bold transition-all cursor-pointer"
            title={isDemoPaused ? 'Resume auto-play' : 'Pause walkthrough'}
          >
            {isDemoPaused ? (
              <>
                <Play className="w-3 h-3 text-[#FFB703] fill-current" />
                <span className="hidden sm:inline">RESUME</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-[#F59E0B]" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            )}
          </button>

          {/* Next Step */}
          <button
            onClick={nextGuidedStep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFB703] text-[#05070B] hover:bg-[#5EFFD8] text-[10px] font-black transition-all shadow-[0_0_12px_rgba(255, 183, 3, )] cursor-pointer"
            title="Advance to next stage"
          >
            <span>{isLastStep ? 'FINISH' : 'NEXT'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Skip / Exit */}
          <button
            onClick={resetGuidedDemo}
            className="p-1.5 rounded-lg bg-[#0A1E30] border border-[#162136] hover:border-[#EF4444]/60 text-[#94A3B8] hover:text-[#EF4444] transition-all cursor-pointer"
            title="Exit Guided Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
