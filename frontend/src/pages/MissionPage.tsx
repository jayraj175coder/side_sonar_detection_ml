import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MissionTopHeader, KpiFilterCategory } from '../components/mission/v3/MissionTopHeader';
import { LargeSonarViewer } from '../components/mission/v3/LargeSonarViewer';
import { MissionSubseaMapViewer, CenterViewportMode } from '../components/mission/v3/MissionSubseaMapViewer';
import { Mission3DSeafloorViewer } from '../components/mission/v3/Mission3DSeafloorViewer';
import {
  SonarPreviewPanel,
  ExtendedMissionTarget,
} from '../components/mission/v3/SonarPreviewPanel';
import {
  TargetIntelligencePanel,
  getTargetPingAndTime,
} from '../components/mission/v3/TargetIntelligencePanel';
import { BottomPipelineTimeline } from '../components/mission/v3/BottomPipelineTimeline';
import { UploadClassifyModal } from '../components/mission/UploadClassifyModal';
import { HazardAlertDrawer } from '../components/mission/v3/HazardAlertDrawer';
import { RovDispatchModal } from '../components/mission/v3/RovDispatchModal';
import { exportGeoJsonDossier } from '../utils/gisExporter';
import {
  MISSION_V3_TARGETS,
  MissionV3Target,
  PIPELINE_STAGES_V3,
} from '../data/missionV3Data';
import { sonarAudio } from '../utils/sonarAudio';
import { exportOfficialIncidentReport } from '../utils/incidentReportGenerator';
import { SURVEY_SITES } from '../data/consoleData';
import { LiveDemoSequence } from '../components/console/LiveDemoSequence';
import { JudgeModeProofView } from '../components/mission/v3/JudgeModeProofView';
import { MoESClearanceCertificateModal } from '../components/mission/v3/MoESClearanceCertificateModal';
import { RovSalvagePlannerModal } from '../components/mission/v3/RovSalvagePlannerModal';
import { exportToKML, exportToIHOS44CSV } from '../utils/gisExport';

export const MissionPage: React.FC = () => {
  // ── State Management ──
  const [targets, setTargets] = useState<ExtendedMissionTarget[]>(MISSION_V3_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('SX-T07');
  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilterCategory>('all');
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isRovPlannerOpen, setIsRovPlannerOpen] = useState<boolean>(false);
  const [dispatchTarget, setDispatchTarget] = useState<MissionV3Target | null>(null);

  // Judge Mode (20-Second Simplified Proof View)
  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(false);

  // Center Viewport Switcher ('map' | 'sonar' | 'split' | '3d')
  const [centerViewMode, setCenterViewMode] = useState<CenterViewportMode>('map');

  // Full-Screen Cinematic Story Demo Mode for Judges
  const [showCinematicDemo, setShowCinematicDemo] = useState<boolean>(false);

  // Interactive Filtration State (Confidence Slider & Acoustic Shadow Gate)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(40);
  const [isShadowGateActive, setIsShadowGateActive] = useState<boolean>(true);

  // AI Pipeline & Timeline State
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(6); // Default 07 VERIFY
  const [currentFrame, setCurrentFrame] = useState<number>(81);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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

  // ── Target Selection Handler (Bidirectional Sync with Timeline & Map) ──
  const handleSelectTarget = useCallback((id: string) => {
    setSelectedTargetId(id);
    const meta = getTargetPingAndTime(id);
    setCurrentFrame(meta.frame);
    sonarAudio.playTargetBeep?.();
  }, []);

  // ── Top KPI Strip Category Filter Handler ──
  const handleSelectKpiFilter = useCallback(
    (category: KpiFilterCategory) => {
      setActiveKpiFilter(category);
      const cycleIds: Record<KpiFilterCategory, string[]> = {
        all: ['SX-T07', 'SX-T03', 'SX-T05', 'SX-T01'],
        verified: ['SX-T07', 'SX-T03', 'SX-T05', 'SX-T01', 'SX-T11'],
        high_risk: ['SX-T07', 'SX-T03', 'SX-T05', 'SX-T09'],
        pipelines: ['SX-T01', 'SX-T08'],
        anomalies: ['SX-T11', 'SX-T05', 'SX-T02'],
      };
      const pool = cycleIds[category];
      const currentIdx = pool.indexOf(selectedTargetId);
      const nextId = pool[(currentIdx + 1) % pool.length];
      handleSelectTarget(nextId);
    },
    [selectedTargetId, handleSelectTarget]
  );

  // ── Handle Pinning Real Uploaded or Sample Sonar Target from UploadClassifyModal ──
  const handlePinV3Target = useCallback((newTarget: ExtendedMissionTarget) => {
    setTargets((prev) => [newTarget, ...prev]);
    setSelectedTargetId(newTarget.id);
    setCurrentFrame(81);
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
  // Clean up timers on unmount
  useEffect(() => {
    return () => clearDemoTimers();
  }, [clearDemoTimers]);

  // Continuous Ping-by-Ping timeline playback when Play is active
  useEffect(() => {
    if (!isPlaying || isDemoRunning) return;
    const intervalMs = Math.max(80, Math.round(320 / timelineSpeed));
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev >= 128 ? 1 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, isDemoRunning, timelineSpeed]);

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
    <div className="flex flex-col h-full w-full bg-[#050811] text-[#F8FAFC] font-sans overflow-hidden select-none pointer-events-auto">
      {/* ── TOP HEADER + KPI & COVERAGE STRIP ── */}
      <MissionTopHeader
        isDemoRunning={isDemoRunning}
        onStartDemo={handleStartDemo}
        onStopDemo={handleStopDemo}
        isJudgeMode={isJudgeMode}
        onToggleJudgeMode={() => setIsJudgeMode((v) => !v)}
        onOpenCinematicDemo={() => setShowCinematicDemo(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onExportReport={handleExportReport}
        onExportGeoJson={() => exportGeoJsonDossier(processedTargets)}
        onExportKml={() => exportToKML(processedTargets)}
        onExportIhoCsv={() => exportToIHOS44CSV(processedTargets)}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        onOpenRovPlanner={() => setIsRovPlannerOpen(true)}
        onToggleAlertDrawer={() => setIsAlertDrawerOpen((v) => !v)}
        alertCount={processedTargets.filter((t) => t.priority === 'HIGH' || t.status === 'CONFIRMED').length}
        activePhaseName={PIPELINE_STAGES_V3[currentStageIndex]?.name}
        totalAnomaliesCount={totalAnomaliesCount}
        highPriorityCount={highPriorityCount}
        filteredCount={filteredCount}
        confidenceThreshold={confidenceThreshold}
        onChangeConfidenceThreshold={setConfidenceThreshold}
        isShadowGateActive={isShadowGateActive}
        onToggleShadowGate={() => setIsShadowGateActive((v) => !v)}
        centerViewMode={centerViewMode}
        onSelectCenterViewMode={setCenterViewMode}
        activeKpiFilter={activeKpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* ── HAZARD ALERT DRAWER (REAL-TIME NOTIFICATION BELL) ── */}
      <HazardAlertDrawer
        targets={processedTargets}
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        onSelectTarget={handleSelectTarget}
        onOpenDispatch={(t) => setDispatchTarget(t)}
      />

      {/* ── MAIN WORKSPACE: 3-COLUMN OPS HUD MATCHING REFERENCE SCREENSHOT ── */}
      {isJudgeMode ? (
        <JudgeModeProofView
          heroTarget={selectedTarget}
          onExitJudgeMode={() => setIsJudgeMode(false)}
          onExportReport={handleExportReport}
          confidenceThreshold={confidenceThreshold}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {/* COLUMN 1 (~48%): MISSION MAP / SONAR VIEW / SPLIT VIEW / 3D TERRAIN */}
          <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden relative">
            {centerViewMode === 'map' ? (
              <MissionSubseaMapViewer
                targets={processedTargets}
                selectedTargetId={selectedTargetId}
                onSelectTarget={handleSelectTarget}
                onBackToSonar={() => setCenterViewMode('sonar')}
                onExportReport={handleExportReport}
                onView3D={() => setCenterViewMode('3d')}
                activeViewMode={centerViewMode}
                onChangeViewMode={setCenterViewMode}
                currentFrame={currentFrame}
                totalFrames={128}
              />
            ) : centerViewMode === 'sonar' ? (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <div className="h-9 px-2.5 bg-[#080E1A] border-b border-[#142238] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'map', label: 'MISSION MAP' },
                        { id: 'sonar', label: 'SONAR VIEW' },
                        { id: 'split', label: 'SPLIT VIEW' },
                        { id: '3d', label: '3D TERRAIN' },
                      ] as { id: CenterViewportMode; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCenterViewMode(tab.id)}
                        className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          centerViewMode === tab.id
                            ? 'bg-[#F59E0B] text-[#050810] font-black shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                            : 'bg-[#0D1726] text-[#94A3B8] border border-[#1B2D48] hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#CBD5E1]">
                    {selectedTarget.latitude.toFixed(3)}°N, {selectedTarget.longitude.toFixed(3)}°E
                  </span>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                </div>
              </div>
            ) : centerViewMode === 'split' ? (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 grid grid-cols-2 divide-x divide-[#142238]">
                  <MissionSubseaMapViewer
                    targets={processedTargets}
                    selectedTargetId={selectedTargetId}
                    onSelectTarget={handleSelectTarget}
                    onBackToSonar={() => setCenterViewMode('sonar')}
                    onExportReport={handleExportReport}
                    onView3D={() => setCenterViewMode('3d')}
                    activeViewMode="split"
                    onChangeViewMode={setCenterViewMode}
                    currentFrame={currentFrame}
                    totalFrames={128}
                  />
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
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <div className="h-9 px-2.5 bg-[#080E1A] border-b border-[#142238] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'map', label: 'MISSION MAP' },
                        { id: 'sonar', label: 'SONAR VIEW' },
                        { id: 'split', label: 'SPLIT VIEW' },
                        { id: '3d', label: '3D TERRAIN' },
                      ] as { id: CenterViewportMode; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCenterViewMode(tab.id)}
                        className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          centerViewMode === tab.id
                            ? 'bg-[#F59E0B] text-[#050810] font-black shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                            : 'bg-[#0D1726] text-[#94A3B8] border border-[#1B2D48] hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#CBD5E1]">
                    {selectedTarget.latitude.toFixed(3)}°N, {selectedTarget.longitude.toFixed(3)}°E
                  </span>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <Mission3DSeafloorViewer
                    targets={processedTargets}
                    selectedTargetId={selectedTargetId}
                    onSelectTarget={handleSelectTarget}
                    onBackToSonar={() => setCenterViewMode('sonar')}
                    onViewMissionMap={() => setCenterViewMode('map')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2 (~26%): SONAR PREVIEW + ACOUSTIC PROFILE + 4 MODE THUMBNAILS */}
          <div className="w-[26%] min-w-[275px] max-w-[360px] h-full flex flex-col shrink-0 z-20">
            <SonarPreviewPanel
              target={selectedTarget}
              onExpandToFullSonar={() => setCenterViewMode('sonar')}
            />
          </div>

          {/* COLUMN 3 (~26%): TARGET DETAILS + HYDROGRAPHIC TELEMETRY (AUV-07) */}
          <div className="w-[26%] min-w-[285px] max-w-[370px] h-full flex flex-col shrink-0 z-20">
            <TargetIntelligencePanel
              target={selectedTarget}
              isVerified={isVerified}
              isDemoRunning={isDemoRunning}
              heroConfidence={heroConfidence}
              explainabilityStep={explainabilityStep}
              onOpenDispatch={(t) => setDispatchTarget(t)}
              onExportReport={handleExportReport}
              allTargets={processedTargets}
              onSelectTarget={handleSelectTarget}
              isShadowGateActive={isShadowGateActive}
            />
          </div>
        </div>
      )}

      {/* ── BOTTOM: SURVEY TRACK TIMELINE & SONAR FILMSTRIP ── */}
      <BottomPipelineTimeline
        currentStageIndex={currentStageIndex}
        onSelectStageIndex={setCurrentStageIndex}
        currentFrame={currentFrame}
        onChangeFrame={setCurrentFrame}
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
        onSelectTarget={handleSelectTarget}
      />

      {/* ── UPLOAD & ANALYZE MODAL (Real ML Upload Workflow) ── */}
      <UploadClassifyModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPinV3Target={handlePinV3Target}
      />

      {/* ── ROV / DIVERS REMEDIATION DISPATCH MODAL ── */}
      {dispatchTarget && (
        <RovDispatchModal
          target={dispatchTarget}
          isOpen={!!dispatchTarget}
          onClose={() => setDispatchTarget(null)}
        />
      )}

      {/* ── FULL-SCREEN CINEMATIC STORY DEMO FOR JUDGES ── */}
      {showCinematicDemo && (
        <div className="fixed inset-0 z-50 bg-[#01050A] flex flex-col pointer-events-auto">
          <LiveDemoSequence onComplete={() => setShowCinematicDemo(false)} />
        </div>
      )}

      {/* ── MoES OFFICIAL CLEARANCE CERTIFICATE MODAL ── */}
      <MoESClearanceCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        target={selectedTarget}
      />

      {/* ── AUTONOMOUS ROV SALVAGE ROUTE PLANNER MODAL ── */}
      {isRovPlannerOpen && (
        <RovSalvagePlannerModal
          targets={processedTargets}
          onClose={() => setIsRovPlannerOpen(false)}
        />
      )}
    </div>
  );
};
