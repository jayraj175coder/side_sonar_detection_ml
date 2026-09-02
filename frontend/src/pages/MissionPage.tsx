import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MissionTopHeader } from '../components/mission/v3/MissionTopHeader';
import { SurveyTargetQueue } from '../components/mission/v3/SurveyTargetQueue';
import { LargeSonarViewer } from '../components/mission/v3/LargeSonarViewer';
import { TargetIntelligencePanel } from '../components/mission/v3/TargetIntelligencePanel';
import { BottomPipelineTimeline } from '../components/mission/v3/BottomPipelineTimeline';
import { UploadClassifyModal } from '../components/mission/UploadClassifyModal';
import {
  MISSION_V3_TARGETS,
  MissionV3Target,
  PIPELINE_STAGES_V3,
} from '../data/missionV3Data';
import { sonarAudio } from '../utils/sonarAudio';
import { exportOfficialIncidentReport } from '../utils/incidentReportGenerator';
import { SURVEY_SITES } from '../data/consoleData';

export const MissionPage: React.FC = () => {
  // ── State Management ──
  const [targets] = useState<MissionV3Target[]>(MISSION_V3_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('SX-T07');
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // AI Pipeline & Timeline State
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(6); // Default on 07 VERIFY
  const [currentFrame, setCurrentFrame] = useState<number>(81);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timelineSpeed, setTimelineSpeed] = useState<number>(1);

  // Live Demo Mode State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoPhaseStep, setDemoPhaseStep] = useState<number>(8);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Selected Target object
  const selectedTarget = useMemo(() => {
    return targets.find((t) => t.id === selectedTargetId) || targets[0];
  }, [targets, selectedTargetId]);

  // Statistics
  const totalAnomaliesCount = targets.length;
  const highPriorityCount = targets.filter((t) => t.priority === 'HIGH').length;
  const filteredCount = targets.filter((t) => t.status === 'FILTERED').length;

  // ── Target Selection Handler (Bidirectional Sync) ──
  const handleSelectTarget = useCallback((id: string) => {
    setSelectedTargetId(id);
    sonarAudio.playTargetBeep?.();
  }, []);

  // ── Live Demo Engine (35–40s Guided Progression) ──
  const handleStartDemo = useCallback(() => {
    sonarAudio.playLockBeep?.();
    setIsDemoRunning(true);
    setDemoPhaseStep(1);
    setCurrentStageIndex(0); // 01 INGEST

    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

    let step = 1;
    // Advance each stage every 4 seconds
    demoIntervalRef.current = setInterval(() => {
      step++;
      if (step > 8) {
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
        setIsDemoRunning(false);
        setDemoPhaseStep(8);
        setCurrentStageIndex(7); // 08 REPORT
        return;
      }

      setDemoPhaseStep(step);
      setCurrentStageIndex(step - 1);

      // Critical moment in Stage 6 / 7: Force-focus on Hero Ghost Net SX-T07
      if (step === 6 || step === 7) {
        setSelectedTargetId('SX-T07');
        sonarAudio.playLockBeep?.();
      } else {
        sonarAudio.playTargetBeep?.();
      }
    }, 4200);
  }, []);

  const handleStopDemo = useCallback(() => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    setIsDemoRunning(false);
    setDemoPhaseStep(8);
  }, []);

  // Keyboard shortcut: Spacebar toggles Play/Pause or starts demo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Export formal MoES incident report
  const handleExportReport = useCallback(() => {
    sonarAudio.playLockBeep?.();
    const site = SURVEY_SITES[0];
    const confirmedTargets = targets.filter((t) => t.status === 'CONFIRMED');

    // Convert to format accepted by incident generator
    const candidateAdapter = confirmedTargets.map((t) => ({
      id: t.id,
      class: t.label,
      confidence: t.confidence,
      aspectRatio: Number((t.length / t.width).toFixed(2)),
      shadowLengthM: t.shadowLength,
      depthM: t.depth,
      dimensions: t.dimensions,
      status: 'CONFIRMED' as const,
      lat: t.latitude,
      lon: t.longitude,
      rawX: t.rawX,
      rawY: t.rawY,
    }));

    exportOfficialIncidentReport(site, candidateAdapter, 0.40, true);
  }, [targets]);

  return (
    <div className="flex flex-col h-full w-full bg-[#01050A] text-[#E0F7F4] font-mono overflow-hidden select-none pointer-events-auto">
      {/* ── TOP HEADER (64–72px) + SECONDARY STATUS BAR ── */}
      <MissionTopHeader
        isJudgeMode={isJudgeMode}
        onToggleJudgeMode={() => setIsJudgeMode((v) => !v)}
        isDemoRunning={isDemoRunning}
        onStartDemo={handleStartDemo}
        onStopDemo={handleStopDemo}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onExportReport={handleExportReport}
        activePhaseName={PIPELINE_STAGES_V3[currentStageIndex]?.name}
        totalAnomaliesCount={totalAnomaliesCount}
        highPriorityCount={highPriorityCount}
        filteredCount={filteredCount}
      />

      {/* ── MAIN WORKSPACE (EXACTLY 3 COLUMNS: LEFT QUEUE, CENTER SONAR HERO, RIGHT INTEL HERO) ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. LEFT — Survey + Detection Queue */}
        <SurveyTargetQueue
          targets={targets}
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleSelectTarget}
          hoveredTargetId={hoveredTargetId}
          onHoverTarget={setHoveredTargetId}
        />

        {/* 2. CENTER — Large Side-Scan Sonar Viewer (55–60% of main workspace, Visual Hero) */}
        <LargeSonarViewer
          targets={targets}
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleSelectTarget}
          hoveredTargetId={hoveredTargetId}
          onHoverTarget={setHoveredTargetId}
          isDemoRunning={isDemoRunning}
          demoPhaseStep={demoPhaseStep}
        />

        {/* 3. RIGHT — Selected Target Intelligence (Information Hero) */}
        <TargetIntelligencePanel
          target={selectedTarget}
          isVerified={currentStageIndex >= 6}
        />
      </div>

      {/* ── 4. BOTTOM — AI Pipeline & Mission Timeline ── */}
      <BottomPipelineTimeline
        currentStageIndex={currentStageIndex}
        onSelectStageIndex={setCurrentStageIndex}
        currentFrame={currentFrame}
        totalFrames={128}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((v) => !v)}
        onReset={() => setCurrentFrame(1)}
        speed={timelineSpeed}
        onSelectSpeed={setTimelineSpeed}
        isDemoRunning={isDemoRunning}
      />

      {/* ── UPLOAD & ANALYZE MODAL (Real ML Upload Workflow) ── */}
      <UploadClassifyModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
