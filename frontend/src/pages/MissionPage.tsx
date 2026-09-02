import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MissionTopHeader } from '../components/mission/v3/MissionTopHeader';
import { SurveyTargetQueue } from '../components/mission/v3/SurveyTargetQueue';
import { LargeSonarViewer } from '../components/mission/v3/LargeSonarViewer';
import { MissionSubseaMapViewer } from '../components/mission/v3/MissionSubseaMapViewer';
import { Mission3DSeafloorViewer } from '../components/mission/v3/Mission3DSeafloorViewer';
import { TargetIntelligencePanel } from '../components/mission/v3/TargetIntelligencePanel';
import { BottomPipelineTimeline } from '../components/mission/v3/BottomPipelineTimeline';
import { ImpactTranslationBanner } from '../components/mission/v3/ImpactTranslationBanner';
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Center Viewport Switcher ('sonar' | 'map' | '3d')
  const [centerViewMode, setCenterViewMode] = useState<'sonar' | 'map' | '3d'>('sonar');

  // Interactive Filtration State (Confidence Slider & Acoustic Shadow Gate)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(40);
  const [isShadowGateActive, setIsShadowGateActive] = useState<boolean>(true);

  // AI Pipeline & Timeline State
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(6); // Default 07 VERIFY
  const [currentFrame, setCurrentFrame] = useState<number>(81);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timelineSpeed, setTimelineSpeed] = useState<number>(1);

  // Live Demo Mode & Hero Sequence State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoPhaseStep, setDemoPhaseStep] = useState<number>(7); // 0 to 7
  const [heroConfidence, setHeroConfidence] = useState<number>(94.7);
  const [explainabilityStep, setExplainabilityStep] = useState<number>(4); // 0 to 4 chips
  const [isVerified, setIsVerified] = useState<boolean>(true);

  const demoTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval>[]>([]);

  // ── Dynamic Filtration Logic ──
  const processedTargets = useMemo(() => {
    return targets.map((t) => {
      const isBelowConf = t.confidence * 100 < confidenceThreshold;
      const failsShadow = isShadowGateActive && t.shadowLength < 0.25;
      if (isBelowConf || failsShadow) {
        return { ...t, status: 'FILTERED' as const, priority: 'FILTERED' as const };
      }
      return t;
    });
  }, [targets, confidenceThreshold, isShadowGateActive]);

  // Selected Target object
  const selectedTarget = useMemo(() => {
    return processedTargets.find((t) => t.id === selectedTargetId) || processedTargets[0];
  }, [processedTargets, selectedTargetId]);

  // Statistics
  const totalAnomaliesCount = processedTargets.filter((t) => t.status === 'CONFIRMED').length;
  const highPriorityCount = processedTargets.filter((t) => t.priority === 'HIGH').length;
  const filteredCount = processedTargets.filter((t) => t.status === 'FILTERED').length;

  // Clear all demo timers
  const clearDemoTimers = useCallback(() => {
    demoTimeoutsRef.current.forEach((t) => clearTimeout(t));
    demoTimeoutsRef.current = [];
    frameIntervalRef.current.forEach((t) => clearInterval(t));
    frameIntervalRef.current = [];
  }, []);

  // ── Target Selection Handler (Bidirectional Sync) ──
  const handleSelectTarget = useCallback((id: string) => {
    setSelectedTargetId(id);
    sonarAudio.playTargetBeep?.();
  }, []);

  // ── Hero Ghost Net Sequence (Manual or Scripted) ──
  const runHeroSequence = useCallback(() => {
    setSelectedTargetId('SX-T07');
    setCenterViewMode('sonar');
    setHeroConfidence(0);
    setIsVerified(false);
    setExplainabilityStep(0);

    // Animate confidence count-up 0% -> 94.7%
    let conf = 0;
    const confInterval = setInterval(() => {
      conf += 3.2;
      if (conf >= 94.7) {
        conf = 94.7;
        clearInterval(confInterval);
        setIsVerified(true);
        sonarAudio.playLockBeep?.();
      }
      setHeroConfidence(conf);
    }, 45);
    frameIntervalRef.current.push(confInterval);

    // Stagger explainability chips appearing
    const t1 = setTimeout(() => { setExplainabilityStep(1); sonarAudio.playTargetBeep?.(); }, 1400);
    const t2 = setTimeout(() => { setExplainabilityStep(2); sonarAudio.playTargetBeep?.(); }, 2200);
    const t3 = setTimeout(() => { setExplainabilityStep(3); sonarAudio.playTargetBeep?.(); }, 3000);
    const t4 = setTimeout(() => { setExplainabilityStep(4); sonarAudio.playLockBeep?.(); }, 3800);
    demoTimeoutsRef.current.push(t1, t2, t3, t4);
  }, []);

  // ── SCRIPTED LIVE DEMO SEQUENCE (~25-28 SECONDS) ──
  const handleStartDemo = useCallback(() => {
    clearDemoTimers();
    sonarAudio.playSonarPing?.();

    setIsDemoRunning(true);
    setCenterViewMode('sonar');
    setDemoPhaseStep(0);
    setCurrentStageIndex(0); // 01 INGEST
    setCurrentFrame(1);
    setHeroConfidence(0);
    setIsVerified(false);
    setExplainabilityStep(0);

    // Smooth Scrubber Frame Increment (001 -> 128 over 25 seconds)
    let frame = 1;
    const fTimer = setInterval(() => {
      frame += 1;
      if (frame > 128) {
        clearInterval(fTimer);
      } else {
        setCurrentFrame(frame);
      }
    }, 190);
    frameIntervalRef.current.push(fTimer);

    // T+2.5s: 02 DENOISE
    const s1 = setTimeout(() => {
      setCurrentStageIndex(1);
      setDemoPhaseStep(1);
      sonarAudio.playTargetBeep?.();
    }, 2500);

    // T+5.5s: 03 DETECT (Bounding boxes start drawing on)
    const s2 = setTimeout(() => {
      setCurrentStageIndex(2);
      setDemoPhaseStep(2);
      sonarAudio.playTargetBeep?.();
    }, 5500);

    // T+8.5s: 04 FILTER (20 Noise/rock candidates suppressed)
    const s3 = setTimeout(() => {
      setCurrentStageIndex(3);
      setDemoPhaseStep(3);
      sonarAudio.playTargetBeep?.();
    }, 8500);

    // T+11.5s: 05 CLASSIFY & HERO GHOST NET SEQUENCE
    const s4 = setTimeout(() => {
      setCurrentStageIndex(4);
      setDemoPhaseStep(4);
      runHeroSequence();
    }, 11500);

    // T+16.5s: 06 GEOTAG
    const s5 = setTimeout(() => {
      setCurrentStageIndex(5);
      setDemoPhaseStep(5);
      sonarAudio.playTargetBeep?.();
    }, 16500);

    // T+19.5s: 07 VERIFY
    const s6 = setTimeout(() => {
      setCurrentStageIndex(6);
      setDemoPhaseStep(6);
      sonarAudio.playLockBeep?.();
    }, 19500);

    // T+22.0s: 08 REPORT
    const s7 = setTimeout(() => {
      setCurrentStageIndex(7);
      setDemoPhaseStep(7);
      sonarAudio.playLockBeep?.();
    }, 22000);

    // T+24.5s: CLOSING MAP MOMENT (Swaps center view to Mission Subsea Map!)
    const s8 = setTimeout(() => {
      setCenterViewMode('map');
      sonarAudio.playLockBeep?.();
      setIsDemoRunning(false);
    }, 24500);

    demoTimeoutsRef.current.push(s1, s2, s3, s4, s5, s6, s7, s8);
  }, [clearDemoTimers, runHeroSequence]);

  const handleStopDemo = useCallback(() => {
    clearDemoTimers();
    setIsDemoRunning(false);
    setDemoPhaseStep(7);
    setCurrentStageIndex(6);
    setHeroConfidence(94.7);
    setIsVerified(true);
    setExplainabilityStep(4);
  }, [clearDemoTimers]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearDemoTimers();
  }, [clearDemoTimers]);

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
    const confirmedTargets = processedTargets.filter((t) => t.status === 'CONFIRMED');

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

    exportOfficialIncidentReport(site, candidateAdapter, confidenceThreshold / 100, isShadowGateActive);
  }, [processedTargets, confidenceThreshold, isShadowGateActive]);

  return (
    <div className="flex flex-col h-full w-full bg-[#01050A] text-[#E0F7F4] font-mono overflow-hidden select-none pointer-events-auto">
      {/* ── TOP HEADER (60–64px) + INTERACTIVE FILTRATION BAR ── */}
      <MissionTopHeader
        isDemoRunning={isDemoRunning}
        onStartDemo={handleStartDemo}
        onStopDemo={handleStopDemo}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onExportReport={handleExportReport}
        activePhaseName={PIPELINE_STAGES_V3[currentStageIndex]?.name}
        totalAnomaliesCount={totalAnomaliesCount}
        highPriorityCount={highPriorityCount}
        filteredCount={filteredCount}
        confidenceThreshold={confidenceThreshold}
        onChangeConfidenceThreshold={setConfidenceThreshold}
        isShadowGateActive={isShadowGateActive}
        onToggleShadowGate={() => setIsShadowGateActive((v) => !v)}
      />

      {/* ── IMPACT TRANSLATION BANNER (Translates ML stats to human impact) ── */}
      <ImpactTranslationBanner isDemoRunning={isDemoRunning} />

      {/* ── MAIN WORKSPACE (3 COLUMNS: LEFT QUEUE, CENTER HERO VIEW, RIGHT INTEL HERO) ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. LEFT — Survey + Detection Queue */}
        <SurveyTargetQueue
          targets={processedTargets}
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleSelectTarget}
          hoveredTargetId={hoveredTargetId}
          onHoverTarget={setHoveredTargetId}
          onFocusHeroTarget={runHeroSequence}
        />

        {/* 2. CENTER — 3-Way Hero Viewport (Sonar Waterfall | Subsea Mission Map | 3D Seafloor) */}
        {centerViewMode === 'sonar' ? (
          <LargeSonarViewer
            targets={processedTargets}
            selectedTargetId={selectedTargetId}
            onSelectTarget={handleSelectTarget}
            hoveredTargetId={hoveredTargetId}
            onHoverTarget={setHoveredTargetId}
            isDemoRunning={isDemoRunning}
            demoPhaseStep={demoPhaseStep}
            heroConfidence={heroConfidence}
            onViewMissionMap={() => setCenterViewMode('map')}
            onView3D={() => setCenterViewMode('3d')}
          />
        ) : centerViewMode === 'map' ? (
          <MissionSubseaMapViewer
            targets={processedTargets}
            selectedTargetId={selectedTargetId}
            onSelectTarget={handleSelectTarget}
            onBackToSonar={() => setCenterViewMode('sonar')}
            onExportReport={handleExportReport}
            onView3D={() => setCenterViewMode('3d')}
          />
        ) : (
          <Mission3DSeafloorViewer
            targets={processedTargets}
            selectedTargetId={selectedTargetId}
            onSelectTarget={handleSelectTarget}
            onBackToSonar={() => setCenterViewMode('sonar')}
            onViewMissionMap={() => setCenterViewMode('map')}
          />
        )}

        {/* 3. RIGHT — Selected Target Intelligence (Information Hero) */}
        <TargetIntelligencePanel
          target={selectedTarget}
          isVerified={isVerified}
          isDemoRunning={isDemoRunning}
          heroConfidence={heroConfidence}
          explainabilityStep={explainabilityStep}
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
        onReset={() => {
          setCurrentFrame(1);
          setCurrentStageIndex(0);
        }}
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
