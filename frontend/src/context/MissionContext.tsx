import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MissionStatus, PlaybackSpeed } from '../types';
import { MISSION_TARGETS } from '../data/targets';
import { MISSION_DURATION_SECONDS, MISSION_DATA } from '../data/mission';

export interface DemoLogEntry {
  timestamp: string;
  stage: string;
  message: string;
  type: 'info' | 'contact' | 'nav' | 'complete';
}

export interface DemoStageInfo {
  index: number;
  title: string;
  caption: string;
  durationMs: number;
}

export const GUIDED_DEMO_STAGES: DemoStageInfo[] = [
  {
    index: 0,
    title: 'DEPLOYING AUV',
    caption: 'AUV-3 INS Sandhayak initializing towfish — Altitude locked at 8.4m AGL · 900 kHz transducer online',
    durationMs: 3500,
  },
  {
    index: 1,
    title: 'SURVEY UNDERWAY',
    caption: 'Survey line 2 of 4 — Swath width 75m · Speed 4.1 kts · Ping rate 10 Hz · Acoustic mosaic streaming live',
    durationMs: 4500,
  },
  {
    index: 2,
    title: 'CONTACT DETECTED',
    caption: 'Contact SX-T07 acquired on Trackline 2 — Range 18.4m Port · Bearing 284° · Ping index 6,200',
    durationMs: 4500,
  },
  {
    index: 3,
    title: 'CONTACT CLASSIFIED',
    caption: 'Contact analysis: 1.84m × 0.71m · Shadow 2.31m confirms 0.82m elevation · TS -12.8 dB · Moored mine geometry',
    durationMs: 4500,
  },
  {
    index: 4,
    title: 'MISSION COMPLETE',
    caption: 'Survey complete: 4 tracklines verified · 38.7 km surveyed · 12.84 km² mapped · 17 contacts logged',
    durationMs: 4000,
  },
];

interface MissionContextType {
  // Target selection (shared across all panels)
  selectedTargetId: string | null;
  setSelectedTargetId: (id: string | null) => void;

  // Mission status
  missionStatus: MissionStatus;
  setMissionStatus: (s: MissionStatus) => void;

  // Playback
  playbackTime: number;        // 0 → MISSION_DURATION_SECONDS
  setPlaybackTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: (s: PlaybackSpeed) => void;

  // Display toggles
  showTargets: boolean;
  setShowTargets: (v: boolean) => void;
  showTrack: boolean;
  setShowTrack: (v: boolean) => void;
  showBathymetry: boolean;
  setShowBathymetry: (v: boolean) => void;
  showSwath: boolean;
  setShowSwath: (v: boolean) => void;

  // Guided Walkthrough Demo
  isDemoRunning: boolean;
  demoStage: number;
  demoStageInfo: DemoStageInfo;
  demoLog: DemoLogEntry[];
  isDemoPaused: boolean;
  launchDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  skipDemo: () => void;
  resetMission: () => void;

  // Computed: targets visible at current playback time
  visibleTargetIds: string[];

  // Mission progress (0-100)
  missionProgress: number;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('idle');
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const [showTargets, setShowTargets] = useState(true);
  const [showTrack, setShowTrack] = useState(true);
  const [showBathymetry, setShowBathymetry] = useState(true);
  const [showSwath, setShowSwath] = useState(true);

  // Guided Demo Walkthrough State
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStage, setDemoStage] = useState(0);
  const [isDemoPaused, setIsDemoPaused] = useState(false);
  const [demoLog, setDemoLog] = useState<DemoLogEntry[]>([]);

  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageStartTimeRef = useRef<number>(0);
  const stageRemainingRef = useRef<number>(0);

  const addLog = useCallback((stage: string, message: string, type: DemoLogEntry['type']) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
    setDemoLog((prev) => [{ timestamp: timeStr, stage, message, type }, ...prev.slice(0, 19)]);
  }, []);

  const resetMission = useCallback(() => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setSelectedTargetId(null);
    setMissionStatus('idle');
    setPlaybackTime(0);
    setIsPlaying(false);
    setIsDemoRunning(false);
    setDemoStage(0);
    setIsDemoPaused(false);
    setDemoLog([]);
  }, []);

  const executeStage = useCallback((stageIdx: number) => {
    if (stageIdx >= GUIDED_DEMO_STAGES.length) {
      // Demo completed
      setMissionStatus('complete');
      setIsDemoRunning(false);
      setIsPlaying(true);
      return;
    }

    setDemoStage(stageIdx);
    const stage = GUIDED_DEMO_STAGES[stageIdx];
    stageStartTimeRef.current = Date.now();
    stageRemainingRef.current = stage.durationMs;

    switch (stageIdx) {
      case 0: // DEPLOYING
        setMissionStatus('initializing');
        setSelectedTargetId(null);
        setPlaybackTime(0);
        setIsPlaying(true);
        addLog('NAV', 'INS Sandhayak deployed · Towfish subsea lock at 8.4m AGL', 'nav');
        break;

      case 1: // SURVEY UNDERWAY
        setMissionStatus('running');
        setPlaybackTime(1800);
        setIsPlaying(true);
        addLog('SURVEY', 'Trackline 2 active · Acoustic mosaic streaming at 10 Hz', 'info');
        break;

      case 2: // CONTACT DETECTED
        setMissionStatus('running');
        setSelectedTargetId('SX-T07');
        setPlaybackTime(620);
        setIsPlaying(false);
        addLog('CONTACT', 'Contact SX-T07 detected at range 18.4m Port · Bearing 284°', 'contact');
        break;

      case 3: // CONTACT CLASSIFIED
        setMissionStatus('running');
        setSelectedTargetId('SX-T07');
        addLog('CLASSIFY', 'Contact SX-T07 verified: 1.84m × 0.71m · TS -12.8 dB · Shadow confirms spherical body', 'contact');
        break;

      case 4: // MISSION COMPLETE
        setMissionStatus('complete');
        addLog('COMPLETE', 'Survey run complete · 38.7 km surveyed · 17 contacts logged in register', 'complete');
        break;
    }

    demoTimerRef.current = setTimeout(() => {
      executeStage(stageIdx + 1);
    }, stage.durationMs);
  }, [addLog]);

  const launchDemo = useCallback(() => {
    resetMission();
    setIsDemoRunning(true);
    setIsDemoPaused(false);
    executeStage(0);
  }, [resetMission, executeStage]);

  const pauseDemo = useCallback(() => {
    if (!isDemoRunning || isDemoPaused) return;
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    const elapsed = Date.now() - stageStartTimeRef.current;
    stageRemainingRef.current = Math.max(500, stageRemainingRef.current - elapsed);
    setIsDemoPaused(true);
    setIsPlaying(false);
  }, [isDemoRunning, isDemoPaused]);

  const resumeDemo = useCallback(() => {
    if (!isDemoRunning || !isDemoPaused) return;
    setIsDemoPaused(false);
    setIsPlaying(true);
    stageStartTimeRef.current = Date.now();
    demoTimerRef.current = setTimeout(() => {
      executeStage(demoStage + 1);
    }, stageRemainingRef.current);
  }, [isDemoRunning, isDemoPaused, demoStage, executeStage]);

  const skipDemo = useCallback(() => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setDemoStage(4);
    setSelectedTargetId('SX-T07');
    setPlaybackTime(620);
    setMissionStatus('complete');
    setIsDemoRunning(false);
    setIsDemoPaused(false);
    setIsPlaying(false);
    addLog('COMPLETE', 'Jumped to mission summary · 17 contacts cataloged', 'complete');
  }, [addLog]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, []);

  // Visible targets based on time
  const visibleTargetIds = MISSION_TARGETS.filter((t) => t.pingTime <= playbackTime + 40).map(
    (t) => t.id
  );

  const missionProgress = Math.min(100, Math.round((playbackTime / MISSION_DURATION_SECONDS) * 100));

  const demoStageInfo = GUIDED_DEMO_STAGES[Math.min(demoStage, GUIDED_DEMO_STAGES.length - 1)];

  return (
    <MissionContext.Provider
      value={{
        selectedTargetId,
        setSelectedTargetId,
        missionStatus,
        setMissionStatus,
        playbackTime,
        setPlaybackTime,
        isPlaying,
        setIsPlaying,
        playbackSpeed,
        setPlaybackSpeed,
        showTargets,
        setShowTargets,
        showTrack,
        setShowTrack,
        showBathymetry,
        setShowBathymetry,
        showSwath,
        setShowSwath,
        isDemoRunning,
        demoStage,
        demoStageInfo,
        demoLog,
        isDemoPaused,
        launchDemo,
        pauseDemo,
        resumeDemo,
        skipDemo,
        resetMission,
        visibleTargetIds,
        missionProgress,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = (): MissionContextType => {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used within MissionProvider');
  return ctx;
};
