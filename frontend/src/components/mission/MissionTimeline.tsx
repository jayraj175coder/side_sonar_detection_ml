import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Filter,
  Eye,
  MapPin,
  FileText,
  Radio,
  Sliders,
} from 'lucide-react';
import { useMission, GUIDED_DEMO_STAGES } from '../../context/MissionContext';
import { MISSION_DURATION_SECONDS, interpolateVesselPosition } from '../../data/mission';
import type { PlaybackSpeed } from '../../types';

export const MissionTimeline: React.FC = () => {
  const {
    playbackTime,
    setPlaybackTime,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    demoStage,
    setStageDirectly,
    isDemoRunning,
    startGuidedDemo,
    pauseGuidedDemo,
    resumeGuidedDemo,
    resetGuidedDemo,
  } = useMission();

  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (ts: number) => {
      if (lastRef.current === 0) lastRef.current = ts;
      const delta = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setPlaybackTime((prev) => {
        const next = prev + delta * playbackSpeed * 20;
        if (next >= MISSION_DURATION_SECONDS) {
          setIsPlaying(false);
          return MISSION_DURATION_SECONDS;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed, setPlaybackTime, setIsPlaying]);

  const pipelineStages = [
    { code: 'INGEST', label: 'Ingest Sonar', icon: Radio },
    { code: 'PREPROCESS', label: 'Noise Reduction', icon: Sliders },
    { code: 'DETECT', label: 'Object Detection', icon: Sparkles },
    { code: 'FILTER', label: 'Natural Filter', icon: Filter },
    { code: 'CLASSIFY', label: 'AI Classify', icon: Cpu },
    { code: 'EVIDENCE', label: 'Evidence Audit', icon: Eye },
    { code: 'GEOTAG', label: 'Geotagging', icon: MapPin },
    { code: 'REPORT', label: 'Report', icon: FileText },
  ];

  return (
    <div className="flex flex-col bg-[#081118] border-t border-[#16303B] shrink-0 font-mono select-none">
      {/* 1. Horizontal SONARX AI PIPELINE Workflow Stages */}
      <div className="px-4 py-2.5 bg-[#0C171E] border-b border-[#16303B] flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-[#16303B]">
          <span className="text-[10px] font-black text-[#32E6D1] uppercase tracking-wider font-sans">
            AI PIPELINE
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-1 justify-between min-w-[650px]">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = demoStage === idx;
            const isCompleted = demoStage > idx;

            return (
              <React.Fragment key={stage.code}>
                <button
                  onClick={() => setStageDirectly(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#32E6D1] text-[#03070B] shadow-[0_0_12px_rgba(50,230,209,0.35)] scale-105'
                      : isCompleted
                      ? 'bg-[#081118] text-[#65D391] border border-[#65D391]/40'
                      : 'bg-[#081118] text-[#6F8992] border border-[#16303B] hover:text-[#E4F2F5]'
                  }`}
                  title={`Jump to stage: ${stage.label}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-[#65D391]" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  <span>{stage.label}</span>
                </button>

                {idx < pipelineStages.length - 1 && (
                  <ChevronRight
                    className={`w-3 h-3 shrink-0 ${
                      isCompleted ? 'text-[#65D391]' : 'text-[#16303B]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Timeline Controls & Scrubber */}
      <div className="px-4 py-2 flex items-center justify-between gap-4 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (isDemoRunning) {
                pauseGuidedDemo();
              } else {
                resumeGuidedDemo();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
              isDemoRunning
                ? 'bg-[#32E6D1]/20 border-[#32E6D1] text-[#32E6D1]'
                : 'bg-[#0C171E] border-[#16303B] text-[#E4F2F5] hover:text-[#32E6D1]'
            }`}
          >
            {isDemoRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isDemoRunning ? 'PAUSE DEMO' : 'RUN DEMO'}</span>
          </button>

          <button
            onClick={resetGuidedDemo}
            className="p-1 rounded-lg bg-[#0C171E] border border-[#16303B] text-[#6F8992] hover:text-[#FF5D5D] transition-colors cursor-pointer"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Live Scrubber */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[10px] text-[#6F8992] shrink-0">
            PING #{Math.floor(playbackTime * 10)}
          </span>
          <input
            type="range"
            min={0}
            max={MISSION_DURATION_SECONDS}
            step={10}
            value={Math.floor(playbackTime)}
            onChange={(e) => setPlaybackTime(Number(e.target.value))}
            className="flex-1 h-1 bg-[#16303B] rounded-full appearance-none cursor-pointer accent-[#32E6D1]"
          />
          <span className="text-[10px] text-[#6F8992] shrink-0">
            SWATH: 75m
          </span>
        </div>

        {/* Current Mission Stage Info */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#6F8992] shrink-0">
          <span>TARGETS: <strong className="text-[#32E6D1]">17 (4 HIGH)</strong></span>
          <span>·</span>
          <span>FILTERED: <strong className="text-[#65D391]">20 NATURAL</strong></span>
        </div>
      </div>
    </div>
  );
};
