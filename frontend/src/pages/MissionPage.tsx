import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LiveDemoSequence } from '../components/console/LiveDemoSequence';
import { ConsoleTopBar } from '../components/console/ConsoleTopBar';
import { ConsoleLeftRail, LayerState } from '../components/console/ConsoleLeftRail';
import { ConsoleSonarCanvas } from '../components/console/ConsoleSonarCanvas';
import { ConsoleStageDetail } from '../components/console/ConsoleStageDetail';
import { ConsoleBottomTimeline, EventLogEntry } from '../components/console/ConsoleBottomTimeline';
import {
  SURVEY_SITES,
  SurveySite,
  CANDIDATE_ITEMS,
  SITE_CANDIDATES,
  CandidateItem,
  STAGE_DETAILS,
  StageId,
  INITIAL_EVENT_LOGS,
  PIPELINE_STAGES,
} from '../data/consoleData';
import { sonarAudio } from '../utils/sonarAudio';
import { useMission } from '../context/MissionContext';
import { exportOfficialIncidentReport } from '../utils/incidentReportGenerator';

type DemoPhase = 'idle' | 'running' | 'done';

const STAGE_LOG_EVENTS: Record<StageId, { tag: string; text: string; level: EventLogEntry['level'] }[]> = {
  '01': [
    { tag: 'ING',  text: 'sonar_log_swath_active.xtf opened · 80,829 acoustic pings loaded', level: 'info' },
    { tag: 'ING',  text: 'USBL telemetry locked · dual-flank port/stbd waterfall active', level: 'info' },
    { tag: 'ING',  text: 'slant-range & TVG correction normalized to 640×640 frame', level: 'success' },
  ],
  '02': [
    { tag: 'DEN',  text: 'bilateral spatial filter applied · speckle attenuated −18.4 dB', level: 'info' },
    { tag: 'DEN',  text: 'CLAHE local contrast enhancement active · seabed dynamic range +14.2 dB', level: 'success' },
    { tag: 'DEN',  text: 'nadir water column isolated · altitude track line generated', level: 'info' },
  ],
  '03': [
    { tag: 'DET',  text: 'YOLOv8n ONNX perception forward pass · inference: 10.2 ms', level: 'info' },
    { tag: 'DET',  text: '37 acoustic backscatter proposals extracted across swath', level: 'success' },
  ],
  '04': [
    { tag: 'GATE', text: 'dynamic confidence gate + acoustic shadow analysis running', level: 'info' },
    { tag: 'GATE', text: 'suppressed native basalt bedrock clusters (symmetric backscatter)', level: 'reject' },
    { tag: 'GATE', text: 'suppressed periodic sand megaripples (zero acoustic shadow relief)', level: 'reject' },
    { tag: 'GATE', text: 'suppressed surface reverberation echoes via altitude check', level: 'reject' },
    { tag: 'GATE', text: 'false positives suppressed · true debris anomalies confirmed', level: 'success' },
  ],
  '05': [
    { tag: 'CLS',  text: 'MoES marine debris taxonomy attribution active', level: 'info' },
    { tag: 'CLS',  text: 'identified ghost nets (ALDFG), trawl gear, pipelines, and barrels', level: 'success' },
    { tag: 'CLS',  text: 'high-threat marine hazard tags dispatched to ROV recovery queue', level: 'warn' },
  ],
  '06': [
    { tag: 'GEO',  text: 'WGS84 USBL positioning interpolated for all confirmed anomalies', level: 'info' },
    { tag: 'GEO',  text: 'hero target SX-T07: 18.9217°N, 72.8214°E · depth 43.1m · 94.7% conf', level: 'info' },
    { tag: 'REP',  text: 'structured anomaly dossier generated · JSON and CSV registers ready', level: 'success' },
    { tag: 'REP',  text: 'MISSION MX-026 ANALYSIS COMPLETE · inspection dossier compiled', level: 'success' },
  ],
};

const STAGE_DURATION_MS = 2800;

export const MissionPage: React.FC = () => {
  const { isDemoRunning, startGuidedDemo, resetGuidedDemo } = useMission();
  const [showSequence, setShowSequence] = useState(true);

  const isSequenceActive = showSequence || isDemoRunning;

  // ── Dashboard state ─────────────────────────────────────────────────────────
  const [activeSite, setActiveSite] = useState<SurveySite>(SURVEY_SITES[0]);
  const [currentStageId, setCurrentStageId] = useState<StageId>('06');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>('SX-T07');
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(null);

  // Drift projection state (INCOIS / SARAT)
  const [projectDriftCandidateId, setProjectDriftCandidateId] = useState<string | null>('SX-T07');

  const handleToggleProjectDrift = useCallback((id: string) => {
    setProjectDriftCandidateId((prev) => (prev === id ? null : id));
  }, []);

  // Dynamic filter state
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.40);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [shadowFilterEnabled, setShadowFilterEnabled] = useState<boolean>(true);

  const [demoPhase, setDemoPhase] = useState<DemoPhase>('done');
  const [isPlaying, setIsPlaying] = useState(false);
  const [stageProgress, setStageProgress] = useState(1);

  const [layers, setLayers] = useState<LayerState>({
    rawSonar:       true,
    denoisedSonar:  true,
    droneTrack:     true,
    rawDetections:  true,
    noiseRejected:  true,
    confirmedDebris:true,
    classLabels:    true,
    geotagMarkers:  true,
  });

  const [currentFrame, setCurrentFrame] = useState(1);
  const [totalFrames] = useState(120);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>(INITIAL_EVENT_LOGS);

  const demoTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const frameTimerRef = useRef<any>(null);

  // ── Dynamic candidate calculation based on site & interactive filters ────────
  const baseCandidates = useMemo(() => {
    return SITE_CANDIDATES[activeSite.id] || CANDIDATE_ITEMS;
  }, [activeSite.id]);

  const dynamicCandidates: CandidateItem[] = useMemo(() => {
    return baseCandidates.map((c) => {
      // 1. Confidence threshold filter
      if (c.confidence < confidenceThreshold) {
        return {
          ...c,
          status: 'REJECTED' as const,
          rejectReason: `REJECTED — confidence ${(c.confidence * 100).toFixed(1)}% is below operator threshold ${(confidenceThreshold * 100).toFixed(0)}%`,
        };
      }

      // 2. Acoustic shadow verification rule (when active)
      if (shadowFilterEnabled) {
        if (c.shadowLengthM <= 0.05) {
          return {
            ...c,
            status: 'REJECTED' as const,
            rejectReason: `REJECTED — shadow length ${c.shadowLengthM.toFixed(1)}m indicates zero acoustic vertical relief (likely sediment ripple or surface echo)`,
          };
        }
        if (c.aspectRatio > 6.0) {
          return {
            ...c,
            status: 'REJECTED' as const,
            rejectReason: `REJECTED — aspect ratio ${c.aspectRatio.toFixed(1)} exceeds natural-object threshold (6.0); geometric shadow rule triggered`,
          };
        }
      }

      // 3. Natural rock / geological formations filter
      if (
        c.class.includes('Rock') ||
        c.class.includes('Bedrock') ||
        c.class.includes('Basalt')
      ) {
        return {
          ...c,
          status: 'REJECTED' as const,
          rejectReason: `REJECTED — aspect ratio ${c.aspectRatio.toFixed(1)} & diffuse backscatter matches native seabed geological formation`,
        };
      }

      return {
        ...c,
        status: 'CONFIRMED' as const,
        rejectReason: undefined,
      };
    });
  }, [baseCandidates, confidenceThreshold, shadowFilterEnabled]);

  // Filtered by category chip
  const filteredCandidates = useMemo(() => {
    return dynamicCandidates.filter((c) => {
      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'NETS') return c.class.includes('Net');
      if (selectedCategory === 'TRAWL') return c.class.includes('Trawl');
      if (selectedCategory === 'PIPES') return c.class.includes('Pipeline') || c.class.includes('Cable');
      if (selectedCategory === 'BARRELS') return c.class.includes('Barrel') || c.class.includes('Cargo');
      if (selectedCategory === 'NOISE') return c.status === 'REJECTED';
      return true;
    });
  }, [dynamicCandidates, selectedCategory]);

  const rawCount = dynamicCandidates.length;
  const confirmedCount = dynamicCandidates.filter((c) => c.status === 'CONFIRMED').length;
  const rejectedCount = dynamicCandidates.filter((c) => c.status === 'REJECTED').length;

  // Survey site change handler
  const handleSelectSite = useCallback((site: SurveySite) => {
    setActiveSite(site);
    sonarAudio.playTargetBeep?.();
    const newItems = SITE_CANDIDATES[site.id] || CANDIDATE_ITEMS;
    if (newItems.length > 0) {
      setSelectedCandidateId(newItems[0].id);
    }
  }, []);

  // Called when live demo sequence finishes
  const handleSequenceComplete = useCallback(() => {
    setShowSequence(false);
    resetGuidedDemo();
    setCurrentStageId('06');
    setDemoPhase('done');
    setStageProgress(1);
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLogs: EventLogEntry[] = [
      ...INITIAL_EVENT_LOGS,
      ...(['01', '02', '03', '04', '05', '06'] as StageId[]).flatMap((sid) =>
        STAGE_LOG_EVENTS[sid].map((l) => ({ time: ts, ...l }))
      ),
    ];
    setEventLogs(newLogs);
  }, [resetGuidedDemo]);

  const pushLogs = useCallback((stageId: StageId) => {
    const lines = STAGE_LOG_EVENTS[stageId] || [];
    const ts = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    lines.forEach((ln, i) => {
      setTimeout(() => setEventLogs((prev) => [...prev.slice(-60), { time: ts, ...ln }]), i * 350);
    });
  }, []);

  const handleSelectStage = useCallback((id: StageId) => {
    setCurrentStageId(id);
    setStageProgress(0);
    sonarAudio.playTargetBeep?.();
    pushLogs(id);
  }, [pushLogs]);

  const handleToggleLayer = useCallback((layerKey: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
    sonarAudio.playLockBeep?.();
  }, []);

  const startProgressAnimation = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setStageProgress(0);
    const start = Date.now();
    progressTimerRef.current = setInterval(() => {
      const p = Math.min((Date.now() - start) / STAGE_DURATION_MS, 1);
      setStageProgress(p);
      if (p >= 1) clearInterval(progressTimerRef.current);
    }, 30);
  }, []);

  const handleRunDemo = useCallback(() => {
    setShowSequence(true);
    startGuidedDemo();
  }, [startGuidedDemo]);

  const handleTogglePlay = useCallback(() => {
    if (demoPhase !== 'running') {
      setIsPlaying((p) => !p);
      return;
    }
    if (isPlaying) {
      clearTimeout(demoTimerRef.current);
      clearInterval(progressTimerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const stages: StageId[] = ['01', '02', '03', '04', '05', '06'];
      let idx = stages.indexOf(currentStageId) + 1;
      const advance = () => {
        if (idx >= stages.length) {
          setDemoPhase('done');
          setIsPlaying(false);
          return;
        }
        handleSelectStage(stages[idx]);
        startProgressAnimation();
        idx++;
        demoTimerRef.current = setTimeout(advance, STAGE_DURATION_MS + 200);
      };
      demoTimerRef.current = setTimeout(advance, STAGE_DURATION_MS + 200);
    }
  }, [demoPhase, isPlaying, currentStageId, handleSelectStage, startProgressAnimation]);

  const handleReset = useCallback(() => {
    clearTimeout(demoTimerRef.current);
    clearInterval(progressTimerRef.current);
    clearInterval(frameTimerRef.current);
    setDemoPhase('idle');
    setIsPlaying(false);
    setCurrentStageId('01');
    setCurrentFrame(1);
    setStageProgress(0);
    if (dynamicCandidates.length > 0) {
      setSelectedCandidateId(dynamicCandidates[0].id);
    }
    setHoveredCandidateId(null);
    setEventLogs(INITIAL_EVENT_LOGS);
    sonarAudio.playDepthPulse?.();
  }, [dynamicCandidates]);

  // Frame ticker
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(frameTimerRef.current);
      return;
    }
    const ms = Math.max(60, Math.floor(600 / speedMultiplier));
    frameTimerRef.current = setInterval(() => {
      setCurrentFrame((f) => (f >= totalFrames ? 1 : f + 1));
    }, ms);
    return () => clearInterval(frameTimerRef.current);
  }, [isPlaying, speedMultiplier, totalFrames]);

  // Keyboard shortcuts
  useEffect(() => {
    if (isSequenceActive) return;
    const h = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        demoPhase === 'idle' ? handleRunDemo() : handleTogglePlay();
      } else if (e.key >= '1' && e.key <= '6') {
        handleSelectStage(String(e.key).padStart(2, '0') as StageId);
      } else if (e.key === 'ArrowRight') {
        setCurrentFrame((f) => Math.min(f + 1, totalFrames));
      } else if (e.key === 'ArrowLeft') {
        setCurrentFrame((f) => Math.max(f - 1, 1));
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isSequenceActive, demoPhase, handleRunDemo, handleTogglePlay, handleReset, handleSelectStage, totalFrames]);

  useEffect(() => () => {
    clearTimeout(demoTimerRef.current);
    clearInterval(progressTimerRef.current);
    clearInterval(frameTimerRef.current);
  }, []);

  const handleExportDossier = () => {
    sonarAudio.playLockBeep?.();
    const payload = {
      product: 'SONARLINE ANALYSIS NODE 04',
      site: activeSite.name,
      source_file: activeSite.sourceFile,
      timestamp: activeSite.timestamp,
      swath_width_m: activeSite.swathWidthM,
      frequency: activeSite.frequency,
      active_stage: currentStageId,
      confidence_threshold_applied: confidenceThreshold,
      shadow_verification_gate: shadowFilterEnabled,
      funnel: {
        raw_candidates: rawCount,
        natural_noise_rejected: rejectedCount,
        confirmed_debris: confirmedCount,
      },
      candidates: dynamicCandidates,
      event_logs: eventLogs,
      exported_at: new Date().toISOString(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `SONARLINE_${activeSite.id}_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportIncidentReport = useCallback(() => {
    sonarAudio.playLockBeep?.();
    const confirmedOnly = dynamicCandidates.filter((c) => c.status === 'CONFIRMED');
    exportOfficialIncidentReport(activeSite, confirmedOnly, confidenceThreshold, shadowFilterEnabled);
  }, [activeSite, dynamicCandidates, confidenceThreshold, shadowFilterEnabled]);

  return (
    <>
      {/* ── LIVE DEMO SEQUENCE OVERLAY ───────────────────────────────────── */}
      {isSequenceActive && <LiveDemoSequence onComplete={handleSequenceComplete} />}

      {/* ── INTERACTIVE MISSION CONTROL DASHBOARD ────────────────────────── */}
      {!isSequenceActive && (
        <div className="flex flex-col h-full w-full bg-[#030B14] text-[#E0F7F4] font-mono select-none overflow-hidden scanlines-overlay">
          <ConsoleTopBar
            activeSite={activeSite}
            onSelectSite={handleSelectSite}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onExportDossier={handleExportDossier}
            onReset={handleReset}
            demoPhase={demoPhase}
            onRunDemo={handleRunDemo}
            onExportIncidentReport={handleExportIncidentReport}
          />

          <div className="flex-1 flex overflow-hidden relative">
            <ConsoleLeftRail
              currentStageId={currentStageId}
              onSelectStage={handleSelectStage}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              totalCandidatesCount={rawCount}
              confirmedDebrisCount={confirmedCount}
              hazardsCount={dynamicCandidates.filter((c) => c.status === 'CONFIRMED' && c.confidence > 0.85).length}
              demoPhase={demoPhase}
              onRunDemo={handleRunDemo}
              onReset={handleReset}
            />

            <ConsoleSonarCanvas
              currentStageId={currentStageId}
              activeSite={activeSite}
              layers={layers}
              candidates={dynamicCandidates}
              filteredCandidates={filteredCandidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
              hoveredCandidateId={hoveredCandidateId}
              onHoverCandidate={setHoveredCandidateId}
              currentFrame={currentFrame}
              demoPhase={demoPhase}
              stageProgress={stageProgress}
              selectedCategory={selectedCategory}
              projectDriftCandidateId={projectDriftCandidateId}
            />

            <ConsoleStageDetail
              currentStageId={currentStageId}
              candidates={dynamicCandidates}
              filteredCandidates={filteredCandidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
              hoveredCandidateId={hoveredCandidateId}
              onHoverCandidate={setHoveredCandidateId}
              confidenceThreshold={confidenceThreshold}
              onChangeConfidenceThreshold={setConfidenceThreshold}
              selectedCategory={selectedCategory}
              onChangeCategory={setSelectedCategory}
              shadowFilterEnabled={shadowFilterEnabled}
              onToggleShadowFilter={() => setShadowFilterEnabled((v) => !v)}
              rawCount={rawCount}
              rejectedCount={rejectedCount}
              confirmedCount={confirmedCount}
              projectDriftCandidateId={projectDriftCandidateId}
              onToggleProjectDrift={handleToggleProjectDrift}
              onExportIncidentReport={handleExportIncidentReport}
            />
          </div>

          <ConsoleBottomTimeline
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeekFrame={setCurrentFrame}
            onRewind={handleReset}
            speedMultiplier={speedMultiplier}
            onSelectSpeed={setSpeedMultiplier}
            logs={eventLogs}
          />
        </div>
      )}
    </>
  );
};
