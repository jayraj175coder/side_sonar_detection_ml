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
} from '../data/consoleData';
import { sonarAudio } from '../utils/sonarAudio';

export const MissionPage: React.FC = () => {
  const [activeSite, setActiveSite] = useState<SurveySite>(SURVEY_SITES[0]);
  const [currentStageId, setCurrentStageId] = useState<StageId>('04'); // Default to FILTER stage for hero impact
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>('SX-T07');
  const [candidatesList, setCandidatesList] = useState<CandidateItem[]>(CANDIDATE_ITEMS);

  // Layers state
  const [layers, setLayers] = useState<LayerState>({
    rawSonar: true,
    denoisedSonar: true,
    rawDetections: true,
    confidenceHeatmap: false,
    rejectedCandidates: true,
    acceptedDebris: true,
    geotagMarkers: true,
    surveyTrack: true,
  });

  // Timeline & Playback state
  const [currentFrame, setCurrentFrame] = useState<number>(42);
  const [totalFrames, setTotalFrames] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>(INITIAL_EVENT_LOGS);

  const timerRef = useRef<any>(null);

  // Keyboard Shortcuts: [1-6], [Space], [←/→], [R]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when typing in inputs/selects
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key >= '1' && e.key <= '6') {
        const stageNum = String(e.key).padStart(2, '0') as StageId;
        handleSelectStage(stageNum);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'ArrowRight') {
        setCurrentFrame((f) => Math.min(f + 1, totalFrames));
      } else if (e.key === 'ArrowLeft') {
        setCurrentFrame((f) => Math.max(f - 1, 1));
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalFrames]);

  // Handle stage selection (The core interaction)
  const handleSelectStage = useCallback((id: StageId) => {
    setCurrentStageId(id);
    sonarAudio.playTargetBeep();

    // Append stage change event log
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const stageInfo = STAGE_DETAILS[id];

    setEventLogs((prev) => [
      ...prev.slice(-49),
      {
        time: timeStr,
        tag: id === '01' ? 'ING' : id === '02' ? 'DEN' : id === '03' ? 'DET' : id === '04' ? 'GATE' : id === '05' ? 'CLS' : 'REP',
        text: `switched to stage ${id} ${stageInfo.name} · ${stageInfo.shortDesc}`,
        level: id === '04' || id === '05' ? 'success' : 'info',
      },
    ]);
  }, []);

  // Toggle Layer Checkbox
  const handleToggleLayer = useCallback((layerKey: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
    sonarAudio.playLockBeep();
  }, []);

  // Automatic Timeline Playback Progression
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(100, Math.floor(1000 / speedMultiplier));
    timerRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames) {
          setIsPlaying(false);
          return totalFrames;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, totalFrames]);

  // Export structured inspection report
  const handleExportDossier = () => {
    sonarAudio.playLockBeep();
    const payload = {
      product: 'SONARLINE ANALYSIS NODE 04',
      site: activeSite.name,
      source_file: activeSite.sourceFile,
      timestamp: activeSite.timestamp,
      swath_width_m: activeSite.swathWidthM,
      frequency: activeSite.frequency,
      active_stage: currentStageId,
      funnel: {
        raw_candidates: 37,
        natural_noise_rejected: 20,
        confirmed_debris: 17,
      },
      candidates: candidatesList,
      event_logs: eventLogs,
      exported_at: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SONARLINE_${activeSite.id}_analysis_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    setCurrentStageId('01');
    setCurrentFrame(1);
    setIsPlaying(false);
    setSelectedCandidateId('SX-T07');
    setEventLogs(INITIAL_EVENT_LOGS);
    sonarAudio.playDepthPulse();
  };

  const totalCandidatesCount = 37;
  const confirmedDebrisCount = candidatesList.filter((c) => c.status === 'CONFIRMED').length;
  const hazardsCount = 4;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b07] text-[#dcfce7] font-mono select-none overflow-hidden scanlines-overlay">
      {/* 1. TOP STATUS BAR */}
      <ConsoleTopBar
        activeSite={activeSite}
        onSelectSite={setActiveSite}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onExportDossier={handleExportDossier}
        onReset={handleReset}
      />

      {/* 2. THREE-COLUMN MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Pipeline Rail + Layers + Keys + Summary Tile */}
        <ConsoleLeftRail
          currentStageId={currentStageId}
          onSelectStage={handleSelectStage}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          totalCandidatesCount={totalCandidatesCount}
          confirmedDebrisCount={confirmedDebrisCount}
          hazardsCount={hazardsCount}
        />

        {/* Center Column: Sonar Viewer Canvas with Coordinate Labels & Overlays */}
        <ConsoleSonarCanvas
          currentStageId={currentStageId}
          activeSite={activeSite}
          layers={layers}
          candidates={candidatesList}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
        />

        {/* Right Column: Stage Detail (Funnel, Plain Explanation, Table, Epistemic Caution) */}
        <ConsoleStageDetail
          currentStageId={currentStageId}
          candidates={candidatesList}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
        />
      </div>

      {/* 3. BOTTOM TIMELINE SCRUBBER + LIVE EVENT LOG HUD */}
      <ConsoleBottomTimeline
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSeekFrame={setCurrentFrame}
        onRewind={() => setCurrentFrame(1)}
        speedMultiplier={speedMultiplier}
        onSelectSpeed={setSpeedMultiplier}
        logs={eventLogs}
      />
    </div>
  );
};
