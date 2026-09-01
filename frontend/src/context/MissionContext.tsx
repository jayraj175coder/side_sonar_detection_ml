import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MissionStatus, PlaybackSpeed, MissionTarget } from '../types';
import { MISSION_TARGETS, getTargetById } from '../data/targets';
import { MISSION_DURATION_SECONDS, MISSION_DATA } from '../data/mission';
import { JUDGE_SCENARIOS, JudgeScenario } from '../data/judgeScenarios';
import { sonarAudio } from '../utils/sonarAudio';

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
    caption: 'Survey line active — Swath width 75m · Speed 4.1 kts · Ping rate 10 Hz · Acoustic mosaic streaming live',
    durationMs: 4500,
  },
  {
    index: 2,
    title: 'CONTACT DETECTED',
    caption: 'Acoustic anomaly acquired on Trackline 2 — Range 18.4m Port · Bearing 284° · Specular echo confirmed',
    durationMs: 4500,
  },
  {
    index: 3,
    title: 'CONTACT CLASSIFIED',
    caption: 'Contact analysis: 1.84m × 0.71m · Shadow 2.31m confirms 0.82m elevation · TS -12.8 dB · System classification locked',
    durationMs: 4500,
  },
  {
    index: 4,
    title: 'MISSION COMPLETE',
    caption: 'Survey complete: Tracklines verified · 38.7 km surveyed · 12.84 km² mapped · Contacts logged to hydrographic register',
    durationMs: 4000,
  },
];

export type FocusedPanelType = 'waterfall' | 'inspector' | 'map' | 'seabed' | 'signals' | 'tree' | null;

interface MissionContextType {
  // Target selection
  selectedTargetId: string | null;
  setSelectedTargetId: (id: string | null) => void;

  // Mission status & playback
  missionStatus: MissionStatus;
  setMissionStatus: (s: MissionStatus) => void;
  playbackTime: number;
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

  // Judge Mode & Scenario Selection (Feature 1)
  isJudgeMode: boolean;
  setIsJudgeMode: (v: boolean) => void;
  activeScenarioId: string;
  currentScenario: JudgeScenario;
  selectScenario: (scenarioId: string) => void;
  isAutoAdvance: boolean;
  setIsAutoAdvance: (v: boolean) => void;

  // Manual Step Controls (Feature 1)
  manualNextStage: () => void;
  manualPrevStage: () => void;
  setStageDirectly: (stageIndex: number) => void;

  // Walkthrough state
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

  // Expandable Panels / Focus Mode (Feature 3)
  focusedPanel: FocusedPanelType;
  setFocusedPanel: (panel: FocusedPanelType) => void;

  // Custom Upload & Classify Contacts (Feature 2)
  customTargets: MissionTarget[];
  addCustomTarget: (target: MissionTarget) => void;

  // Computed & Active Targets
  activeTargets: MissionTarget[];
  visibleTargetIds: string[];
  missionProgress: number;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>('SX-T07');
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('idle');
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const [showTargets, setShowTargets] = useState(true);
  const [showTrack, setShowTrack] = useState(true);
  const [showBathymetry, setShowBathymetry] = useState(true);
  const [showSwath, setShowSwath] = useState(true);

  // Judge Mode & Preset Scenarios
  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('mixed');
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(false); // Manual step by default in Judge Mode

  // Panel Focus State
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanelType>(null);

  // Custom Classified Targets
  const [customTargets, setCustomTargets] = useState<MissionTarget[]>([]);

  // Guided Walkthrough State
  const [isDemoRunning, setIsDemoRunning] = useState(true);
  const [demoStage, setDemoStage] = useState(3); // Start in classified state so judges immediately see data
  const [isDemoPaused, setIsDemoPaused] = useState(true);
  const [demoLog, setDemoLog] = useState<DemoLogEntry[]>([]);

  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentScenario = JUDGE_SCENARIOS.find((s) => s.id === activeScenarioId) || JUDGE_SCENARIOS[3];

  // Active targets list combining default, scenario-seeded, and custom-uploaded targets
  const activeTargets = React.useMemo(() => {
    const base = currentScenario.targets.length > 0 ? currentScenario.targets : MISSION_TARGETS;
    return [...base, ...customTargets];
  }, [currentScenario, customTargets]);

  const addCustomTarget = useCallback((target: MissionTarget) => {
    setCustomTargets((prev) => [target, ...prev.filter((t) => t.id !== target.id)]);
    setSelectedTargetId(target.id);
  }, []);

  const selectScenario = useCallback((scenarioId: string) => {
    sonarAudio.playLockBeep();
    setActiveScenarioId(scenarioId);
    const scen = JUDGE_SCENARIOS.find((s) => s.id === scenarioId) || JUDGE_SCENARIOS[0];
    setSelectedTargetId(scen.primaryContactId);
    setDemoStage(3);
    setPlaybackTime(580);
    setMissionStatus('surveying');
  }, []);

  const executeStageActions = useCallback((stageIndex: number, scenario: JudgeScenario) => {
    const stageCaption = scenario.stageNotes[stageIndex] || GUIDED_DEMO_STAGES[stageIndex]?.caption || '';
    const now = new Date().toLocaleTimeString('en-GB');

    if (stageIndex === 0) {
      setMissionStatus('launching');
      setPlaybackTime(0);
      setSelectedTargetId(null);
      setIsPlaying(false);
      sonarAudio.playDepthPulse();
    } else if (stageIndex === 1) {
      setMissionStatus('surveying');
      setPlaybackTime(320);
      setSelectedTargetId(null);
      setIsPlaying(true);
      sonarAudio.playSonarPing(0.9);
    } else if (stageIndex === 2) {
      setMissionStatus('contact_detected');
      setPlaybackTime(580);
      setSelectedTargetId(scenario.primaryContactId);
      setIsPlaying(false);
      sonarAudio.playLockBeep();
    } else if (stageIndex === 3) {
      setMissionStatus('contact_classified');
      setPlaybackTime(620);
      setSelectedTargetId(scenario.primaryContactId);
      setIsPlaying(false);
      sonarAudio.playSonarPing(1.2);
    } else if (stageIndex === 4) {
      setMissionStatus('completed');
      setPlaybackTime(MISSION_DURATION_SECONDS);
      setSelectedTargetId(scenario.primaryContactId);
      setIsPlaying(false);
      sonarAudio.playLockBeep();
    }

    setDemoLog((prev) => [
      {
        timestamp: now,
        stage: GUIDED_DEMO_STAGES[stageIndex]?.title || `STAGE ${stageIndex + 1}`,
        message: stageCaption,
        type: stageIndex === 2 ? 'contact' : stageIndex === 4 ? 'complete' : 'info',
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const setStageDirectly = useCallback((stageIndex: number) => {
    if (stageIndex < 0 || stageIndex >= GUIDED_DEMO_STAGES.length) return;
    setDemoStage(stageIndex);
    executeStageActions(stageIndex, currentScenario);
  }, [currentScenario, executeStageActions]);

  const manualNextStage = useCallback(() => {
    const next = Math.min(GUIDED_DEMO_STAGES.length - 1, demoStage + 1);
    setStageDirectly(next);
  }, [demoStage, setStageDirectly]);

  const manualPrevStage = useCallback(() => {
    const prev = Math.max(0, demoStage - 1);
    setStageDirectly(prev);
  }, [demoStage, setStageDirectly]);

  // Auto-advance timer (only active when isAutoAdvance is true)
  useEffect(() => {
    if (!isDemoRunning || isDemoPaused || !isAutoAdvance) {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
      return;
    }

    const currentStageInfo = GUIDED_DEMO_STAGES[demoStage];
    if (!currentStageInfo) return;

    demoTimerRef.current = setTimeout(() => {
      if (demoStage < GUIDED_DEMO_STAGES.length - 1) {
        setDemoStage((prev) => {
          const next = prev + 1;
          executeStageActions(next, currentScenario);
          return next;
        });
      } else {
        setIsDemoPaused(true);
      }
    }, currentStageInfo.durationMs);

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [isDemoRunning, isDemoPaused, isAutoAdvance, demoStage, currentScenario, executeStageActions]);

  const launchDemo = useCallback(() => {
    sonarAudio.playSonarPing();
    setIsDemoRunning(true);
    setDemoStage(0);
    setIsDemoPaused(!isAutoAdvance);
    setDemoLog([]);
    executeStageActions(0, currentScenario);
  }, [isAutoAdvance, currentScenario, executeStageActions]);

  const pauseDemo = useCallback(() => {
    setIsDemoPaused(true);
  }, []);

  const resumeDemo = useCallback(() => {
    setIsDemoPaused(false);
  }, []);

  const skipDemo = useCallback(() => {
    setStageDirectly(4);
  }, [setStageDirectly]);

  const resetMission = useCallback(() => {
    setPlaybackTime(0);
    setIsPlaying(false);
    setSelectedTargetId(null);
    setMissionStatus('idle');
    setIsDemoRunning(false);
    setDemoStage(0);
  }, []);

  // Compute visible target IDs
  const visibleTargetIds = React.useMemo(() => {
    if (demoStage >= 2) {
      return activeTargets.map((t) => t.id);
    }
    return activeTargets
      .filter((t) => (t.pingTime || 0) <= playbackTime || playbackTime === 0)
      .map((t) => t.id);
  }, [activeTargets, demoStage, playbackTime]);

  const missionProgress = Math.min(100, Math.round((playbackTime / MISSION_DURATION_SECONDS) * 100));

  const demoStageInfo = GUIDED_DEMO_STAGES[demoStage] || GUIDED_DEMO_STAGES[0];

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
        isJudgeMode,
        setIsJudgeMode,
        activeScenarioId,
        currentScenario,
        selectScenario,
        isAutoAdvance,
        setIsAutoAdvance,
        manualNextStage,
        manualPrevStage,
        setStageDirectly,
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
        focusedPanel,
        setFocusedPanel,
        customTargets,
        addCustomTarget,
        activeTargets,
        visibleTargetIds,
        missionProgress,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = (): MissionContextType => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
