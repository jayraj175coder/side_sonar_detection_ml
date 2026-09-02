import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConsoleTopBar } from '../components/console/ConsoleTopBar';
import { ConsoleLeftRail, LayerState } from '../components/console/ConsoleLeftRail';
import { ConsoleSonarCanvas } from '../components/console/ConsoleSonarCanvas';
import { ConsoleStageDetail } from '../components/console/ConsoleStageDetail';
import { ConsoleBottomTimeline, EventLogEntry } from '../components/console/ConsoleBottomTimeline';
import {
  SURVEY_SITES,
  SurveySite,
  CANDIDATE_ITEMS,
  CandidateItem,
  STAGE_DETAILS,
  StageId,
  INITIAL_EVENT_LOGS,
  PIPELINE_STAGES,
} from '../data/consoleData';
import { sonarAudio } from '../utils/sonarAudio';

type DemoPhase = 'idle' | 'running' | 'done';

// Stage-specific event log lines that stream in during the live demo
const STAGE_LOG_EVENTS: Record<StageId, { tag: string; text: string; level: EventLogEntry['level'] }[]> = {
  '01': [
    { tag: 'ING', text: 'sonar_log_kutch_dark_042.xtf opened · 80,829 pings · 75m swath', level: 'info' },
    { tag: 'ING', text: 'navigation telemetry sync · 10 Hz ping interval locked', level: 'info' },
    { tag: 'ING', text: 'slant-range correction applied · letterbox 640×640 normalization', level: 'success' },
  ],
  '02': [
    { tag: 'DEN', text: 'bilateral spatial filter 5×5 · speckle attenuated −18.4 dB', level: 'info' },
    { tag: 'DEN', text: 'CLAHE contrast normalization · dynamic range +14.2 dB', level: 'success' },
    { tag: 'DEN', text: 'TVG altitude correction applied · drone track overlay rendered', level: 'info' },
  ],
  '03': [
    { tag: 'DET', text: 'YOLOv8n ONNX forward pass · inference 10.4 ms', level: 'info' },
    { tag: 'DET', text: '37 raw candidates extracted · NMS IoU 0.45 applied', level: 'success' },
    { tag: 'DET', text: 'bounding boxes rendered on acoustic mosaic', level: 'info' },
  ],
  '04': [
    { tag: 'GATE', text: 'confidence gate applied · threshold 0.25', level: 'info' },
    { tag: 'GATE', text: 'rejected SX-T04 — aspect ratio 1.11 → rock shadow', level: 'reject' },
    { tag: 'GATE', text: 'rejected SX-T06 — zero vertical relief → sand ripple', level: 'reject' },
    { tag: 'GATE', text: 'rejected SX-T08 — surface reverberation echo', level: 'reject' },
    { tag: 'GATE', text: '20 natural formations rejected · 17 debris confirmed', level: 'success' },
  ],
  '05': [
    { tag: 'CLS', text: 'debris taxonomy attribution · MoES ALDFG classification', level: 'info' },
    { tag: 'CLS', text: '6× ghost nets (ALDFG) · 4× trawl gear · 3× pipeline spans', level: 'success' },
    { tag: 'CLS', text: '4 critical hazard targets flagged for ROV verification', level: 'warn' },
  ],
  '06': [
    { tag: 'GEO', text: 'WGS84 geotag attached · USBL interpolated coordinates', level: 'info' },
    { tag: 'GEO', text: 'SX-T07 ghost net · 18.9217°N, 72.8214°E · 43.1m depth', level: 'info' },
    { tag: 'REP', text: 'anomaly_report_MX026.json compiled · 17 targets geotagged', level: 'success' },
    { tag: 'REP', text: 'pipeline COMPLETE · dossier ready for download', level: 'success' },
  ],
};

const STAGE_DURATION_MS = 2800; // Auto-advance per stage

export const MissionPage: React.FC = () => {
  const [activeSite, setActiveSite] = useState<SurveySite>(SURVEY_SITES[0]);
  const [currentStageId, setCurrentStageId] = useState<StageId>('01');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>('SX-T07');
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(null);
  const [candidatesList] = useState<CandidateItem[]>(CANDIDATE_ITEMS);

  // Demo engine state
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stageProgress, setStageProgress] = useState<number>(0); // 0–1 within current stage
  const demoTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);

  // Layers
  const [layers, setLayers] = useState<LayerState>({
    rawSonar: true,
    denoisedSonar: true,
    droneTrack: true,
    rawDetections: true,
    noiseRejected: true,
    confirmedDebris: true,
    classLabels: true,
    geotagMarkers: true,
  });

  // Timeline
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [totalFrames] = useState<number>(120);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>(INITIAL_EVENT_LOGS);

  const frameTimerRef = useRef<any>(null);

  // Push log entries for a stage
  const pushLogs = useCallback((stageId: StageId) => {
    const lines = STAGE_LOG_EVENTS[stageId] || [];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    lines.forEach((ln, i) => {
      setTimeout(() => {
        setEventLogs((prev) => [...prev.slice(-60), { time: timeStr, ...ln }]);
      }, i * 350);
    });
  }, []);

  // Advance pipeline to a stage (manual or programmatic)
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

  // ── Stage progress animation (0→1 over STAGE_DURATION_MS) ─────────────────
  const startProgressAnimation = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setStageProgress(0);
    const start = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / STAGE_DURATION_MS, 1);
      setStageProgress(p);
      if (p >= 1) clearInterval(progressTimerRef.current);
    }, 30);
  }, []);

  // ── Demo auto-play engine ──────────────────────────────────────────────────
  const handleRunDemo = useCallback(() => {
    if (demoPhase === 'running') return;
    setDemoPhase('running');
    setIsPlaying(true);
    setCurrentFrame(1);
    setEventLogs(INITIAL_EVENT_LOGS);

    const stages: StageId[] = ['01', '02', '03', '04', '05', '06'];
    let idx = 0;

    const advance = () => {
      if (idx >= stages.length) {
        setDemoPhase('done');
        setIsPlaying(false);
        return;
      }
      const sid = stages[idx];
      handleSelectStage(sid);
      startProgressAnimation();
      idx++;
      demoTimerRef.current = setTimeout(advance, STAGE_DURATION_MS + 200);
    };

    advance();
  }, [demoPhase, handleSelectStage, startProgressAnimation]);

  // Pause / resume
  const handleTogglePlay = useCallback(() => {
    if (demoPhase !== 'running') return;
    if (isPlaying) {
      clearTimeout(demoTimerRef.current);
      clearInterval(progressTimerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Resume from current stage → just re-advance to next
      const stages: StageId[] = ['01', '02', '03', '04', '05', '06'];
      const currentIdx = stages.indexOf(currentStageId);
      let idx = currentIdx + 1;

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
    setSelectedCandidateId('SX-T07');
    setHoveredCandidateId(null);
    setEventLogs(INITIAL_EVENT_LOGS);
    sonarAudio.playDepthPulse?.();
  }, []);

  // Frame ticker when playing
  useEffect(() => {
    if (!isPlaying) { clearInterval(frameTimerRef.current); return; }
    const ms = Math.max(80, Math.floor(800 / speedMultiplier));
    frameTimerRef.current = setInterval(() => {
      setCurrentFrame((f) => (f >= totalFrames ? 1 : f + 1));
    }, ms);
    return () => clearInterval(frameTimerRef.current);
  }, [isPlaying, speedMultiplier, totalFrames]);

  // Keyboard shortcuts
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (['INPUT','SELECT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); demoPhase === 'idle' ? handleRunDemo() : handleTogglePlay(); }
      else if (e.key >= '1' && e.key <= '6') handleSelectStage(String(e.key).padStart(2,'0') as StageId);
      else if (e.key === 'ArrowRight') setCurrentFrame((f) => Math.min(f + 1, totalFrames));
      else if (e.key === 'ArrowLeft') setCurrentFrame((f) => Math.max(f - 1, 1));
      else if (e.key === 'r' || e.key === 'R') handleReset();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [demoPhase, handleRunDemo, handleTogglePlay, handleReset, handleSelectStage, totalFrames]);

  // Cleanup on unmount
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
      funnel: { raw_candidates: 37, natural_noise_rejected: 20, confirmed_debris: 17 },
      candidates: candidatesList,
      event_logs: eventLogs,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SONARLINE_${activeSite.id}_analysis_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCandidatesCount = 37;
  const confirmedDebrisCount = candidatesList.filter((c) => c.status === 'CONFIRMED').length;
  const hazardsCount = 4;

  return (
    <div className="flex flex-col h-full w-full bg-[#070b07] text-[#dcfce7] font-mono select-none overflow-hidden scanlines-overlay">

      {/* 1. TOP STATUS BAR */}
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

      {/* 2. THREE-COLUMN MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left: Pipeline Rail + Layers + Demo Button */}
        <ConsoleLeftRail
          currentStageId={currentStageId}
          onSelectStage={handleSelectStage}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          totalCandidatesCount={totalCandidatesCount}
          confirmedDebrisCount={confirmedDebrisCount}
          hazardsCount={hazardsCount}
          demoPhase={demoPhase}
          onRunDemo={handleRunDemo}
          onReset={handleReset}
        />

        {/* Center: Stage-aware cinematic sonar canvas */}
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

        {/* Right: Stage detail + funnel + candidate table */}
        <ConsoleStageDetail
          currentStageId={currentStageId}
          candidates={candidatesList}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
          hoveredCandidateId={hoveredCandidateId}
          onHoverCandidate={setHoveredCandidateId}
        />
      </div>

      {/* 3. BOTTOM TIMELINE + EVENT LOG */}
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
  );
};
