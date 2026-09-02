import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LiveDemoSequence } from '../components/console/LiveDemoSequence';
import { ConsoleTopBar } from '../components/console/ConsoleTopBar';
import { ConsoleLeftRail, LayerState } from '../components/console/ConsoleLeftRail';
import { ConsoleSonarCanvas } from '../components/console/ConsoleSonarCanvas';
import { ConsoleStageDetail } from '../components/console/ConsoleStageDetail';
import { ConsoleBottomTimeline, EventLogEntry } from '../components/console/ConsoleBottomTimeline';
import {
  SURVEY_SITES, SurveySite, CANDIDATE_ITEMS, CandidateItem,
  STAGE_DETAILS, StageId, INITIAL_EVENT_LOGS, PIPELINE_STAGES,
} from '../data/consoleData';
import { sonarAudio } from '../utils/sonarAudio';
import { useMission } from '../context/MissionContext';

type DemoPhase = 'idle' | 'running' | 'done';

const STAGE_LOG_EVENTS: Record<StageId, { tag: string; text: string; level: EventLogEntry['level'] }[]> = {
  '01': [
    { tag: 'ING',  text: 'sonar_log_kutch_dark_042.xtf opened · 80,829 pings · 75m swath', level: 'info' },
    { tag: 'ING',  text: 'navigation telemetry sync · 10 Hz ping interval locked', level: 'info' },
    { tag: 'ING',  text: 'slant-range correction applied · letterbox 640×640', level: 'success' },
  ],
  '02': [
    { tag: 'DEN',  text: 'bilateral spatial filter 5×5 · speckle −18.4 dB', level: 'info' },
    { tag: 'DEN',  text: 'CLAHE contrast normalization · dynamic range +14.2 dB', level: 'success' },
    { tag: 'DEN',  text: 'TVG altitude correction applied · drone track rendered', level: 'info' },
  ],
  '03': [
    { tag: 'DET',  text: 'YOLOv8n ONNX forward pass · inference 10.4 ms', level: 'info' },
    { tag: 'DET',  text: '37 raw candidates extracted · NMS IoU 0.45 applied', level: 'success' },
  ],
  '04': [
    { tag: 'GATE', text: 'confidence gate applied · threshold 0.25', level: 'info' },
    { tag: 'GATE', text: 'rejected SX-T04 — aspect ratio 1.11 → rock shadow', level: 'reject' },
    { tag: 'GATE', text: 'rejected SX-T06 — zero vertical relief → sand ripple', level: 'reject' },
    { tag: 'GATE', text: 'rejected SX-T08 — surface reverberation echo', level: 'reject' },
    { tag: 'GATE', text: '20 natural formations rejected · 17 debris confirmed', level: 'success' },
  ],
  '05': [
    { tag: 'CLS',  text: 'debris taxonomy attribution · MoES ALDFG classification', level: 'info' },
    { tag: 'CLS',  text: '6× ghost nets · 4× trawl gear · 3× pipeline spans confirmed', level: 'success' },
    { tag: 'CLS',  text: '4 critical hazard targets flagged for ROV verification', level: 'warn' },
  ],
  '06': [
    { tag: 'GEO',  text: 'WGS84 geotag attached from USBL interpolated coordinates', level: 'info' },
    { tag: 'GEO',  text: 'SX-T07 ghost net · 18.9217°N, 72.8214°E · 43.1m', level: 'info' },
    { tag: 'REP',  text: 'anomaly_report_MX026.json compiled · 17 targets geotagged', level: 'success' },
    { tag: 'REP',  text: 'pipeline COMPLETE · dossier ready for download', level: 'success' },
  ],
};

const STAGE_DURATION_MS = 2800;

export const MissionPage: React.FC = () => {
  const { isDemoRunning, startGuidedDemo, resetGuidedDemo } = useMission();
  // ── Live demo sequence overlay (shown on first load or when triggered) ──────
  const [showSequence, setShowSequence] = useState(true);

  // Active if showSequence or isDemoRunning is true
  const isSequenceActive = showSequence || isDemoRunning;

  // ── Dashboard state ─────────────────────────────────────────────────────────
  const [activeSite, setActiveSite]             = useState<SurveySite>(SURVEY_SITES[0]);
  const [currentStageId, setCurrentStageId]     = useState<StageId>('01');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>('SX-T07');
  const [hoveredCandidateId, setHoveredCandidateId]   = useState<string | null>(null);
  const [candidatesList]                        = useState<CandidateItem[]>(CANDIDATE_ITEMS);

  const [demoPhase, setDemoPhase]       = useState<DemoPhase>('idle');
  const [isPlaying, setIsPlaying]       = useState(false);
  const [stageProgress, setStageProgress] = useState(0);

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
  const [totalFrames]                   = useState(120);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [eventLogs, setEventLogs]       = useState<EventLogEntry[]>(INITIAL_EVENT_LOGS);

  const demoTimerRef    = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const frameTimerRef   = useRef<any>(null);

  // ── Called when live demo sequence finishes ─────────────────────────────────
  const handleSequenceComplete = useCallback(() => {
    setShowSequence(false);
    resetGuidedDemo();
    // Pre-populate dashboard as if the pipeline already ran (stage 06 done)
    setCurrentStageId('06');
    setDemoPhase('done');
    setStageProgress(1);
    const now = new Date();
    const ts  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newLogs: EventLogEntry[] = [
      ...INITIAL_EVENT_LOGS,
      ...(['01','02','03','04','05','06'] as StageId[]).flatMap((sid) =>
        STAGE_LOG_EVENTS[sid].map(l => ({ time: ts, ...l }))
      ),
    ];
    setEventLogs(newLogs);
  }, [resetGuidedDemo]);

  const pushLogs = useCallback((stageId: StageId) => {
    const lines = STAGE_LOG_EVENTS[stageId] || [];
    const ts = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`;
    lines.forEach((ln, i) => {
      setTimeout(() => setEventLogs(prev => [...prev.slice(-60), { time: ts, ...ln }]), i * 350);
    });
  }, []);

  const handleSelectStage = useCallback((id: StageId) => {
    setCurrentStageId(id);
    setStageProgress(0);
    sonarAudio.playTargetBeep?.();
    pushLogs(id);
  }, [pushLogs]);

  const handleToggleLayer = useCallback((layerKey: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
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
    if (demoPhase !== 'running') return;
    if (isPlaying) {
      clearTimeout(demoTimerRef.current);
      clearInterval(progressTimerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const stages: StageId[] = ['01','02','03','04','05','06'];
      let idx = stages.indexOf(currentStageId) + 1;
      const advance = () => {
        if (idx >= stages.length) { setDemoPhase('done'); setIsPlaying(false); return; }
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
    setSelectedCandidateId('SX-T07');
    setHoveredCandidateId(null);
    setEventLogs(INITIAL_EVENT_LOGS);
    sonarAudio.playDepthPulse?.();
  }, []);

  // Frame ticker
  useEffect(() => {
    if (!isPlaying) { clearInterval(frameTimerRef.current); return; }
    const ms = Math.max(80, Math.floor(800/speedMultiplier));
    frameTimerRef.current = setInterval(() => {
      setCurrentFrame(f => f >= totalFrames ? 1 : f + 1);
    }, ms);
    return () => clearInterval(frameTimerRef.current);
  }, [isPlaying, speedMultiplier, totalFrames]);

  // Keyboard shortcuts (only when sequence is not showing)
  useEffect(() => {
    if (showSequence) return;
    const h = (e: KeyboardEvent) => {
      if (['INPUT','SELECT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); demoPhase === 'idle' ? handleRunDemo() : handleTogglePlay(); }
      else if (e.key >= '1' && e.key <= '6') handleSelectStage(String(e.key).padStart(2,'0') as StageId);
      else if (e.key === 'ArrowRight') setCurrentFrame(f => Math.min(f+1, totalFrames));
      else if (e.key === 'ArrowLeft')  setCurrentFrame(f => Math.max(f-1, 1));
      else if (e.key === 'r' || e.key === 'R') handleReset();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [showSequence, demoPhase, handleRunDemo, handleTogglePlay, handleReset, handleSelectStage, totalFrames]);

  useEffect(() => () => {
    clearTimeout(demoTimerRef.current);
    clearInterval(progressTimerRef.current);
    clearInterval(frameTimerRef.current);
  }, []);

  const handleExportDossier = () => {
    sonarAudio.playLockBeep?.();
    const payload = {
      product: 'SONARX ANALYSIS NODE 04',
      site: activeSite.name,
      source_file: activeSite.sourceFile,
      timestamp: activeSite.timestamp,
      swath_width_m: activeSite.swathWidthM,
      frequency: activeSite.frequency,
      active_stage: currentStageId,
      funnel: { raw_candidates: 37, natural_noise_rejected: 20, confirmed_debris: 17 },
      candidates: candidatesList,
      event_logs: eventLogs,
      exported_at: new Date().toISOString(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `SONARX_${activeSite.id}_dossier.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const confirmedCount = candidatesList.filter(c => c.status === 'CONFIRMED').length;

  return (
    <>
      {/* ── LIVE DEMO SEQUENCE OVERLAY ───────────────────────────────────── */}
      {isSequenceActive && (
        <LiveDemoSequence onComplete={handleSequenceComplete} />
      )}

      {/* ── INTERACTIVE MISSION CONTROL DASHBOARD ────────────────────────── */}
      {!isSequenceActive && (
        <div className="flex flex-col h-full w-full bg-[#030B14] text-[#E0F7F4] font-mono select-none overflow-hidden scanlines-overlay">
          <ConsoleTopBar
            activeSite={activeSite}
            onSelectSite={setActiveSite}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onExportDossier={handleExportDossier}
            onReset={handleReset}
            demoPhase={demoPhase}
            onRunDemo={handleRunDemo}
          />

          <div className="flex-1 flex overflow-hidden relative">
            <ConsoleLeftRail
              currentStageId={currentStageId}
              onSelectStage={handleSelectStage}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              totalCandidatesCount={37}
              confirmedDebrisCount={confirmedCount}
              hazardsCount={4}
              demoPhase={demoPhase}
              onRunDemo={handleRunDemo}
              onReset={handleReset}
            />

            <ConsoleSonarCanvas
              currentStageId={currentStageId}
              activeSite={activeSite}
              layers={layers}
              candidates={candidatesList}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
              hoveredCandidateId={hoveredCandidateId}
              onHoverCandidate={setHoveredCandidateId}
              currentFrame={currentFrame}
              demoPhase={demoPhase}
              stageProgress={stageProgress}
            />

            <ConsoleStageDetail
              currentStageId={currentStageId}
              candidates={candidatesList}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
              hoveredCandidateId={hoveredCandidateId}
              onHoverCandidate={setHoveredCandidateId}
            />
          </div>

          <ConsoleBottomTimeline
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            isPlaying={isPlaying}
            onTogglePlay={() => demoPhase === 'idle' ? handleRunDemo() : handleTogglePlay()}
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
