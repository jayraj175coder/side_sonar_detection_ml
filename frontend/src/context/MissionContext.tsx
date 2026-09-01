import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { MissionStatus, PlaybackSpeed } from '../types';
import { MISSION_TARGETS } from '../data/targets';
import { MISSION_DURATION_SECONDS } from '../data/mission';
import { PIPELINE_STAGES } from '../data/pipeline';

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

  // Active pipeline stage (-1 = none, 0-9 = stage index)
  activePipelineStage: number;
  completedPipelineStages: Set<number>;

  // Display toggles
  showTargets: boolean;
  setShowTargets: (v: boolean) => void;
  showTrack: boolean;
  setShowTrack: (v: boolean) => void;
  showBathymetry: boolean;
  setShowBathymetry: (v: boolean) => void;
  showSwath: boolean;
  setShowSwath: (v: boolean) => void;

  // Demo sequence
  isDemoRunning: boolean;
  demoStep: number;
  demoMessage: string;
  launchDemo: () => void;
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
  const [activePipelineStage, setActivePipelineStage] = useState(-1);
  const [completedPipelineStages, setCompletedPipelineStages] = useState<Set<number>>(new Set());
  const [showTargets, setShowTargets] = useState(true);
  const [showTrack, setShowTrack] = useState(true);
  const [showBathymetry, setShowBathymetry] = useState(true);
  const [showSwath, setShowSwath] = useState(true);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoMessage, setDemoMessage] = useState('');

  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetMission = useCallback(() => {
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    setSelectedTargetId(null);
    setMissionStatus('idle');
    setPlaybackTime(0);
    setIsPlaying(false);
    setActivePipelineStage(-1);
    setCompletedPipelineStages(new Set());
    setIsDemoRunning(false);
    setDemoStep(0);
    setDemoMessage('');
  }, []);

  const launchDemo = useCallback(() => {
    resetMission();
    setIsDemoRunning(true);
    setMissionStatus('initializing');

    const STEPS: { delay: number; message: string; action: () => void }[] = [
      {
        delay: 0,
        message: 'MISSION INITIALIZING — SX-014',
        action: () => { setDemoStep(0); setMissionStatus('initializing'); },
      },
      {
        delay: 900,
        message: 'SONAR DATA INGESTED — 2,048 PINGS',
        action: () => {
          setDemoStep(1);
          setActivePipelineStage(0);
          setCompletedPipelineStages(new Set([0]));
        },
      },
      {
        delay: 1800,
        message: 'PREPROCESSING — NOISE REDUCTION COMPLETE',
        action: () => {
          setDemoStep(2);
          setActivePipelineStage(2);
          setCompletedPipelineStages(new Set([0, 1, 2]));
          setMissionStatus('running');
        },
      },
      {
        delay: 2800,
        message: 'AI DETECTION — YOLOV8N INFERENCE RUNNING',
        action: () => {
          setDemoStep(3);
          setActivePipelineStage(4);
          setCompletedPipelineStages(new Set([0, 1, 2, 3, 4]));
          setPlaybackTime(1200);
        },
      },
      {
        delay: 3800,
        message: '17 TARGETS FOUND — CLASSIFYING',
        action: () => {
          setDemoStep(4);
          setActivePipelineStage(7);
          setCompletedPipelineStages(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
          setPlaybackTime(3000);
        },
      },
      {
        delay: 4600,
        message: '4 PRIORITY TARGETS — GEOREFERENCING',
        action: () => {
          setDemoStep(5);
          setActivePipelineStage(8);
          setCompletedPipelineStages(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));
          setPlaybackTime(5000);
        },
      },
      {
        delay: 5400,
        message: 'TARGET SX-T07 SELECTED — HIGHEST CONFIDENCE',
        action: () => {
          setDemoStep(6);
          setSelectedTargetId('SX-T07');
          setPlaybackTime(620);
        },
      },
      {
        delay: 6400,
        message: 'EVIDENCE ANALYSIS — SHADOW GEOMETRY MATCH',
        action: () => {
          setDemoStep(7);
          setActivePipelineStage(9);
          setCompletedPipelineStages(new Set([0,1,2,3,4,5,6,7,8,9]));
        },
      },
      {
        delay: 7400,
        message: '3D TARGET LOCATION — RENDERING SEAFLOOR',
        action: () => { setDemoStep(8); },
      },
      {
        delay: 8400,
        message: 'MISSION COMPLETE — REPORT READY',
        action: () => {
          setDemoStep(9);
          setMissionStatus('complete');
          setIsDemoRunning(false);
          setIsPlaying(true);
        },
      },
    ];

    STEPS.forEach(({ delay, message, action }) => {
      const t = setTimeout(() => {
        setDemoMessage(message);
        action();
      }, delay);
      demoTimeoutRef.current = t;
    });
  }, [resetMission]);

  // Targets visible at current playback time
  const visibleTargetIds = MISSION_TARGETS
    .filter((t) => t.pingTime <= playbackTime)
    .map((t) => t.id);

  const missionProgress = Math.round((playbackTime / MISSION_DURATION_SECONDS) * 100);

  return (
    <MissionContext.Provider value={{
      selectedTargetId, setSelectedTargetId,
      missionStatus, setMissionStatus,
      playbackTime, setPlaybackTime,
      isPlaying, setIsPlaying,
      playbackSpeed, setPlaybackSpeed,
      activePipelineStage, completedPipelineStages,
      showTargets, setShowTargets,
      showTrack, setShowTrack,
      showBathymetry, setShowBathymetry,
      showSwath, setShowSwath,
      isDemoRunning, demoStep, demoMessage,
      launchDemo, resetMission,
      visibleTargetIds,
      missionProgress,
    }}>
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = (): MissionContextType => {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used inside MissionProvider');
  return ctx;
};
