import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MissionStatus, PlaybackSpeed, MissionTarget } from '../types';
import { MISSION_TARGETS, getTargetById } from '../data/targets';
import { MISSION_DURATION_SECONDS, MISSION_DATA } from '../data/mission';
import { sonarAudio } from '../utils/sonarAudio';

export interface DemoLogEntry {
  timestamp: string;
  stage: string;
  message: string;
  type: 'info' | 'contact' | 'filter' | 'complete';
}

export interface DemoStageInfo {
  index: number;
  stageCode: 'INGEST' | 'PREPROCESS' | 'DETECT' | 'FILTER' | 'CLASSIFY' | 'EVIDENCE' | 'GEOTAG' | 'REPORT';
  title: string;
  caption: string;
  durationMs: number;
  funnel?: {
    raw: number;
    filtered: number;
    valid: number;
    highPriority: number;
  };
}

export const GUIDED_DEMO_STAGES: DemoStageInfo[] = [
  {
    index: 0,
    stageCode: 'INGEST',
    title: 'SONAR INGESTION',
    caption: 'Dual-frequency 900 kHz side-scan sonar acoustic stream loaded · 75m Swath · 8.4m AGL Altitude',
    durationMs: 3500,
  },
  {
    index: 1,
    stageCode: 'PREPROCESS',
    title: 'NOISE REDUCTION & TVG',
    caption: 'Time-Varied Gain (TVG) normalization applied · Speckle noise suppressed · Water column nadir isolated',
    durationMs: 3500,
  },
  {
    index: 2,
    stageCode: 'DETECT',
    title: 'AI CANDIDATE DETECTION',
    caption: 'Deep ONNX perception engine running · 37 raw acoustic return candidates extracted from backscatter',
    durationMs: 4000,
    funnel: { raw: 37, filtered: 0, valid: 37, highPriority: 0 },
  },
  {
    index: 3,
    stageCode: 'FILTER',
    title: 'NATURAL FORMATION FILTER',
    caption: 'False-Positive Suppression: 20 natural rock formations and acoustic shadow artifacts filtered out',
    durationMs: 4000,
    funnel: { raw: 37, filtered: 20, valid: 17, highPriority: 4 },
  },
  {
    index: 4,
    stageCode: 'CLASSIFY',
    title: 'AI CLASSIFICATION',
    caption: '17 valid anomalies classified · 4 High-Priority targets flagged (Ghost Nets, Trawl Gear, Debris, Pipeline)',
    durationMs: 4000,
    funnel: { raw: 37, filtered: 20, valid: 17, highPriority: 4 },
  },
  {
    index: 5,
    stageCode: 'EVIDENCE',
    title: 'HERO TARGET IDENTIFIED: GHOST NET',
    caption: 'TARGET #07 identified as Ghost Net (ALDFG) with 94.7% confidence · Acoustic shadow length 2.31m',
    durationMs: 4500,
    funnel: { raw: 37, filtered: 20, valid: 17, highPriority: 4 },
  },
  {
    index: 6,
    stageCode: 'GEOTAG',
    title: 'GEOTAGGING & 3D SEAFLOOR',
    caption: 'Target geotagged at 18.9217° N, 72.8214° E (Depth 43.1m) · 3D Bathymetric mesh aligned',
    durationMs: 4000,
  },
  {
    index: 7,
    stageCode: 'REPORT',
    title: 'MISSION ANALYSIS COMPLETE',
    caption: 'Mission MX-026 verified · 12.84 km² surveyed · Structured Marine Debris Report ready for download',
    durationMs: 4500,
  },
];

export type FocusedPanelType = 'waterfall' | 'inspector' | 'map' | 'seabed' | 'signals' | 'tree' | null;

interface MissionContextType {
  // Target selection
  selectedTargetId: string | null;
  setSelectedTargetId: (id: string | null) => void;
  selectedTarget: MissionTarget | null;

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

  // Judge Mode
  isJudgeMode: boolean;
  setIsJudgeMode: (v: boolean) => void;
  toggleJudgeMode: () => void;

  // Manual Step Controls
  manualNextStage: () => void;
  manualPrevStage: () => void;
  setStageDirectly: (stageIndex: number) => void;

  // Demo Walkthrough state
  isDemoRunning: boolean;
  demoStage: number;
  demoStageInfo: DemoStageInfo;
  demoLog: DemoLogEntry[];
  startGuidedDemo: () => void;
  pauseGuidedDemo: () => void;
  resumeGuidedDemo: () => void;
  resetGuidedDemo: () => void;

  // Backwards compatibility aliases
  isDemoPaused: boolean;
  launchDemo: (scenarioId?: any) => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  skipDemo: () => void;
  resetMission: () => void;
  activeScenarioId: string;
  selectScenario: (id: string) => void;
  isAutoAdvance: boolean;
  setIsAutoAdvance: (v: boolean) => void;
  visibleTargetIds: string[];
  missionProgress: number;
  addCustomTarget: (target: Partial<MissionTarget>) => void;

  // Layout focus
  focusedPanel: FocusedPanelType;
  setFocusedPanel: (p: FocusedPanelType) => void;

  // Targets
  activeTargets: MissionTarget[];
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default selected target is the Hero: SX-T07 (Ghost Net 94.7%)
  const [selectedTargetId, setSelectedTargetIdState] = useState<string | null>('SX-T07');
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('nominal');
  const [playbackTime, setPlaybackTime] = useState<number>(620);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  // Display toggles
  const [showTargets, setShowTargets] = useState<boolean>(true);
  const [showTrack, setShowTrack] = useState<boolean>(true);
  const [showBathymetry, setShowBathymetry] = useState<boolean>(true);
  const [showSwath, setShowSwath] = useState<boolean>(true);

  // Judge Mode Toggle
  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(false);

  // Demo walkthrough state
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStage, setDemoStage] = useState<number>(0);
  const [demoLog, setDemoLog] = useState<DemoLogEntry[]>([]);
  const demoTimerRef = useRef<any>(null);

  const [targetsList, setTargetsList] = useState<MissionTarget[]>(MISSION_TARGETS);
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('hero-ghost-net');

  // Layout focus
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanelType>(null);

  const selectedTarget = selectedTargetId
    ? targetsList.find((t) => t.id === selectedTargetId) || targetsList[0]
    : targetsList[0];

  const setSelectedTargetId = useCallback((id: string | null) => {
    setSelectedTargetIdState(id);
    if (id) {
      sonarAudio.playTargetBeep();
      const target = targetsList.find((t) => t.id === id);
      if (target) {
        setPlaybackTime(target.pingTime);
      }
    }
  }, [targetsList]);

  const toggleJudgeMode = useCallback(() => {
    setIsJudgeMode((prev) => !prev);
    sonarAudio.playLockBeep();
  }, []);

  const demoStageInfo = GUIDED_DEMO_STAGES[demoStage] || GUIDED_DEMO_STAGES[0];

  // Helper to add to demo log
  const addLog = useCallback((stage: string, message: string, type: DemoLogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
    setDemoLog((prev) => [...prev.slice(-49), { timestamp, stage, message, type }]);
  }, []);

  // Set Stage Directly
  const setStageDirectly = useCallback((stageIndex: number) => {
    const clamped = Math.max(0, Math.min(stageIndex, GUIDED_DEMO_STAGES.length - 1));
    setDemoStage(clamped);

    if (clamped === 0) {
      setPlaybackTime(100);
      setMissionStatus('deploying');
      addLog('INGEST', 'Loading 900 kHz high-resolution side-scan sonar swath (75m swath)', 'info');
    } else if (clamped === 1) {
      setPlaybackTime(300);
      setMissionStatus('surveying');
      addLog('PREPROCESS', 'Time-Varied Gain (TVG) applied · Acoustic contrast normalized', 'info');
    } else if (clamped === 2) {
      setPlaybackTime(500);
      addLog('DETECT', 'AI perception detected 37 candidate acoustic returns', 'info');
    } else if (clamped === 3) {
      setPlaybackTime(580);
      addLog('FILTER', 'Suppression active: 20 natural rocks and shadow artifacts filtered', 'filter');
    } else if (clamped === 4) {
      setPlaybackTime(600);
      addLog('CLASSIFY', '17 valid marine anomalies classified · 4 High Priority', 'info');
    } else if (clamped === 5) {
      setSelectedTargetIdState('SX-T07');
      setPlaybackTime(620);
      sonarAudio.playTargetBeep();
      addLog('TARGET #07', 'Hero Target: Ghost Net (ALDFG) locked at 94.7% confidence', 'contact');
    } else if (clamped === 6) {
      setSelectedTargetIdState('SX-T07');
      setPlaybackTime(620);
      addLog('GEOTAG', 'Target geotagged at 18.9217° N, 72.8214° E (Depth 43.1m)', 'info');
    } else if (clamped === 7) {
      setMissionStatus('complete');
      sonarAudio.playLockBeep();
      addLog('COMPLETE', 'Mission MX-026 complete · Marine Debris Report ready for export', 'complete');
    }
  }, [addLog]);

  // Step next / prev
  const manualNextStage = useCallback(() => {
    if (demoStage < GUIDED_DEMO_STAGES.length - 1) {
      setStageDirectly(demoStage + 1);
    }
  }, [demoStage, setStageDirectly]);

  const manualPrevStage = useCallback(() => {
    if (demoStage > 0) {
      setStageDirectly(demoStage - 1);
    }
  }, [demoStage, setStageDirectly]);

  // Automatic Step Transition Timer
  useEffect(() => {
    if (!isDemoRunning) {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
      return;
    }

    const currentInfo = GUIDED_DEMO_STAGES[demoStage];
    if (!currentInfo) return;

    demoTimerRef.current = setTimeout(() => {
      if (demoStage < GUIDED_DEMO_STAGES.length - 1) {
        setStageDirectly(demoStage + 1);
      } else {
        setIsDemoRunning(false);
      }
    }, currentInfo.durationMs);

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [isDemoRunning, demoStage, setStageDirectly]);

  // Demo Control Handlers
  const startGuidedDemo = useCallback(() => {
    sonarAudio.playSonarPing();
    setDemoLog([]);
    setIsDemoRunning(true);
    setStageDirectly(0);
  }, [setStageDirectly]);

  const pauseGuidedDemo = useCallback(() => {
    setIsDemoRunning(false);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  const resumeGuidedDemo = useCallback(() => {
    setIsDemoRunning(true);
  }, []);

  const resetGuidedDemo = useCallback(() => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setIsDemoRunning(false);
    setDemoStage(0);
    setSelectedTargetIdState('SX-T07');
    setPlaybackTime(620);
    setMissionStatus('nominal');
    setDemoLog([]);
  }, []);

  const addCustomTarget = useCallback((targetData: Partial<MissionTarget>) => {
    const newTarget: MissionTarget = {
      id: targetData.id || `SX-T${String(targetsList.length + 1).padStart(2, '0')}`,
      tracklineId: targetData.tracklineId || 'LINE-02',
      class: targetData.class || 'Custom Marine Debris',
      classCode: targetData.classCode || 'DEBRIS',
      confidence: targetData.confidence || 0.88,
      confidenceInterval: [0.85, 0.92],
      uncertaintyRating: 'HIGH CONFIDENCE',
      targetStrengthDb: -12.4,
      operatorCaveat: targetData.operatorCaveat || 'Custom classified target.',
      uncertaintyNotes: ['Operator-uploaded custom anomaly detection'],
      depth: targetData.depth || 43.1,
      length: targetData.length || 6.5,
      width: targetData.width || 2.4,
      estimatedHeight: targetData.estimatedHeight || 0.8,
      shadowLength: targetData.shadowLength || 2.2,
      orientation: targetData.orientation || 90,
      slantRange: targetData.slantRange || 25.0,
      acrossTrackMeters: targetData.acrossTrackMeters || 12.0,
      bearingDeg: targetData.bearingDeg || 75,
      lat: targetData.lat || 18.9217,
      lon: targetData.lon || 72.8214,
      risk: targetData.risk || 'HIGH',
      pingTime: targetData.pingTime || 620,
      pingNumber: targetData.pingNumber || 6200,
      color: targetData.color || '#32E6D1',
      evidence: targetData.evidence || {
        objectShape: 90,
        acousticIntensity: 88,
        shadowGeometry: 92,
        seabedContrast: 86,
        dimensionalSimilarity: 89,
        backscatterPattern: 91,
      },
      detectionEvidence: targetData.detectionEvidence || ['Uploaded image return', 'AI classification confirmed'],
    };

    setTargetsList((prev) => [newTarget, ...prev]);
    setSelectedTargetIdState(newTarget.id);
  }, [targetsList.length]);

  const visibleTargetIds = targetsList.map((t) => t.id);
  const missionProgress = Math.min(100, Math.round((playbackTime / MISSION_DURATION_SECONDS) * 100));

  return (
    <MissionContext.Provider
      value={{
        selectedTargetId,
        setSelectedTargetId,
        selectedTarget,
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
        toggleJudgeMode,
        manualNextStage,
        manualPrevStage,
        setStageDirectly,
        isDemoRunning,
        demoStage,
        demoStageInfo,
        demoLog,
        startGuidedDemo,
        pauseGuidedDemo,
        resumeGuidedDemo,
        resetGuidedDemo,
        // Aliases
        isDemoPaused: !isDemoRunning && demoStage > 0,
        launchDemo: () => startGuidedDemo(),
        pauseDemo: pauseGuidedDemo,
        resumeDemo: resumeGuidedDemo,
        skipDemo: manualNextStage,
        resetMission: resetGuidedDemo,
        activeScenarioId,
        selectScenario: setActiveScenarioId,
        isAutoAdvance,
        setIsAutoAdvance,
        visibleTargetIds,
        missionProgress,
        addCustomTarget,
        focusedPanel,
        setFocusedPanel,
        activeTargets: targetsList,
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
