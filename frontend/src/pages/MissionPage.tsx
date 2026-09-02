import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Layers,
  Sparkles,
  Filter,
  Check,
  Zap,
  Cpu,
  Info,
} from 'lucide-react';
import { PipelineStatusRail, StageState } from '../components/mission/PipelineStatusRail';
import { BeforeAfterNoisePanel } from '../components/mission/BeforeAfterNoisePanel';
import { DetectionCanvasPanel } from '../components/mission/DetectionCanvasPanel';
import { AutomatedDecisionLog, LogLine } from '../components/mission/AutomatedDecisionLog';
import { LiveGeotagMapPanel } from '../components/mission/LiveGeotagMapPanel';
import { DEMO_PIPELINE_SCENARIOS, DemoScenario, DetectionBox } from '../data/demoPipelineData';
import { sonarAudio } from '../utils/sonarAudio';

export const MissionPage: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(4); // Default to all done
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>('SX-T07');
  const [logList, setLogList] = useState<LogLine[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [processedImagesCount, setProcessedImagesCount] = useState<number>(1);
  const [totalDetectedCount, setTotalDetectedCount] = useState<number>(17);
  const [totalFilteredCount, setTotalFilteredCount] = useState<number>(20);
  const [avgConfidence, setAvgConfidence] = useState<number>(94.7);

  const timerRefs = useRef<any[]>([]);
  const activeScenario = DEMO_PIPELINE_SCENARIOS[currentScenarioIndex] || DEMO_PIPELINE_SCENARIOS[0];

  // Pipeline stage definitions
  const [stages, setStages] = useState<StageState[]>([
    {
      key: 'INGEST',
      label: 'INGEST',
      sublabel: 'Raw Sonar Stream',
      icon: Radio,
      status: 'DONE',
      durationMs: 120,
      timestamp: '12:04:01',
    },
    {
      key: 'PREPROCESS',
      label: 'PREPROCESS',
      sublabel: 'Denoise + CLAHE',
      icon: Sliders,
      status: 'DONE',
      durationMs: 340,
      timestamp: '12:04:01',
    },
    {
      key: 'DETECT',
      label: 'DETECT',
      sublabel: 'YOLOv8 ONNX',
      icon: Sparkles,
      status: 'DONE',
      durationMs: 480,
      timestamp: '12:04:02',
    },
    {
      key: 'FILTER',
      label: 'FILTER',
      sublabel: 'Noise Suppression',
      icon: Filter,
      status: 'DONE',
      durationMs: 260,
      timestamp: '12:04:02',
    },
    {
      key: 'REPORT',
      label: 'REPORT',
      sublabel: 'Geotag & Dossier',
      icon: CheckCircle2,
      status: 'DONE',
      durationMs: 95,
      timestamp: '12:04:03',
    },
  ]);

  // Initialize initial decision logs on first render
  useEffect(() => {
    const initialLogs: LogLine[] = activeScenario.logs.map((l, i) => ({
      id: `log-${i}`,
      timestamp: `12:04:0${Math.floor(i / 4) + 1}.${String((i * 180) % 999).padStart(3, '0')}`,
      stage: l.stage,
      text: l.text,
      level: l.level,
    }));
    setLogList(initialLogs);
  }, []);

  // Clear all pending timers
  const clearAllTimers = () => {
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
  };

  // Run a single scenario through the automated 5-stage pipeline
  const runScenarioPipeline = useCallback(
    (scenarioIdx: number, onComplete?: () => void) => {
      clearAllTimers();
      const scenario = DEMO_PIPELINE_SCENARIOS[scenarioIdx] || DEMO_PIPELINE_SCENARIOS[0];
      setCurrentScenarioIndex(scenarioIdx);
      sonarAudio.playSonarPing();

      // Reset stages to queued
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setStages([
        { key: 'INGEST', label: 'INGEST', sublabel: 'Raw Sonar Stream', icon: Radio, status: 'PROCESSING', durationMs: 0, timestamp: timeStr },
        { key: 'PREPROCESS', label: 'PREPROCESS', sublabel: 'Denoise + CLAHE', icon: Sliders, status: 'QUEUED', durationMs: 0, timestamp: '' },
        { key: 'DETECT', label: 'DETECT', sublabel: 'YOLOv8 ONNX', icon: Sparkles, status: 'QUEUED', durationMs: 0, timestamp: '' },
        { key: 'FILTER', label: 'FILTER', sublabel: 'Noise Suppression', icon: Filter, status: 'QUEUED', durationMs: 0, timestamp: '' },
        { key: 'REPORT', label: 'REPORT', sublabel: 'Geotag & Dossier', icon: CheckCircle2, status: 'QUEUED', durationMs: 0, timestamp: '' },
      ]);

      setLogList([]);
      setCurrentStageIndex(0);

      // Stream logs sequentially with delays
      scenario.logs.forEach((logItem, idx) => {
        const t = setTimeout(() => {
          const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String((now.getSeconds() + Math.floor(logItem.delayMs / 1000)) % 60).padStart(2, '0')}.${String(logItem.delayMs % 999).padStart(3, '0')}`;

          setLogList((prev) => [
            ...prev,
            {
              id: `log-${Date.now()}-${idx}`,
              timestamp,
              stage: logItem.stage,
              text: logItem.text,
              level: logItem.level,
            },
          ]);

          if (logItem.stage === 'PREPROCESS') {
            setStages((prev) =>
              prev.map((s) =>
                s.key === 'INGEST'
                  ? { ...s, status: 'DONE', durationMs: 130 }
                  : s.key === 'PREPROCESS'
                  ? { ...s, status: 'PROCESSING', timestamp }
                  : s
              )
            );
            setCurrentStageIndex(1);
          } else if (logItem.stage === 'DETECT') {
            setStages((prev) =>
              prev.map((s) =>
                s.key === 'PREPROCESS'
                  ? { ...s, status: 'DONE', durationMs: 320 }
                  : s.key === 'DETECT'
                  ? { ...s, status: 'PROCESSING', timestamp }
                  : s
              )
            );
            setCurrentStageIndex(2);
            sonarAudio.playDepthPulse();
          } else if (logItem.stage === 'FILTER') {
            setStages((prev) =>
              prev.map((s) =>
                s.key === 'DETECT'
                  ? { ...s, status: 'DONE', durationMs: 460 }
                  : s.key === 'FILTER'
                  ? { ...s, status: 'PROCESSING', timestamp }
                  : s
              )
            );
            setCurrentStageIndex(3);
          } else if (logItem.stage === 'REPORT') {
            setStages((prev) =>
              prev.map((s) =>
                s.key === 'FILTER'
                  ? { ...s, status: 'DONE', durationMs: 240 }
                  : s.key === 'REPORT'
                  ? { ...s, status: 'PROCESSING', timestamp }
                  : s
              )
            );
            setCurrentStageIndex(4);
            sonarAudio.playLockBeep();
          }
        }, logItem.delayMs);
        timerRefs.current.push(t);
      });

      // Pipeline complete timer
      const completeTimer = setTimeout(() => {
        setStages((prev) =>
          prev.map((s) => (s.key === 'REPORT' ? { ...s, status: 'DONE', durationMs: 85 } : s))
        );
        setSelectedDetectionId(scenario.detections[0]?.id || null);
        setProcessedImagesCount((prev) => Math.min(4, scenarioIdx + 1));
        if (onComplete) onComplete();
      }, 3400);

      timerRefs.current.push(completeTimer);
    },
    []
  );

  // One-Click "RUN AUTOMATED DEMO" (Runs 4 sample sonar images sequentially)
  const handleRunFullDemo = () => {
    setIsDemoRunning(true);
    let idx = 0;

    const runNext = () => {
      if (idx < DEMO_PIPELINE_SCENARIOS.length) {
        runScenarioPipeline(idx, () => {
          idx++;
          if (idx < DEMO_PIPELINE_SCENARIOS.length) {
            const nextTimer = setTimeout(runNext, 1200);
            timerRefs.current.push(nextTimer);
          } else {
            setIsDemoRunning(false);
          }
        });
      }
    };

    runNext();
  };

  const handleReset = () => {
    clearAllTimers();
    setIsDemoRunning(false);
    runScenarioPipeline(0);
  };

  // Custom File Upload Trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    runScenarioPipeline(0);
  };

  // Download Report
  const handleDownloadReport = (format: 'json' | 'csv') => {
    const payload = {
      mission_id: 'MX-026',
      title: 'Automated Marine Debris Inspection Dossier',
      timestamp: new Date().toISOString(),
      summary: {
        images_processed: processedImagesCount,
        objects_detected: totalDetectedCount,
        false_positives_filtered: totalFilteredCount,
        avg_confidence: avgConfidence,
      },
      current_scenario: activeScenario.title,
      detections: activeScenario.detections,
      decision_logs: logList,
    };

    let dataStr = '';
    let filename = '';

    if (format === 'json') {
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      filename = `SONARX_Inspection_Dossier_MX026.json`;
    } else {
      const headers = ['Target_ID', 'Class', 'Confidence', 'Status', 'Depth_M', 'Length_M', 'Width_M', 'Lat', 'Lon'];
      const rows = activeScenario.detections.map((d) => [
        d.id,
        `"${d.label}"`,
        (d.confidence * 100).toFixed(1) + '%',
        d.status,
        d.depthM,
        d.lengthM,
        d.widthM,
        d.lat,
        d.lon,
      ].join(','));
      dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(`${headers.join(',')}\n${rows.join('\n')}`);
      filename = `SONARX_Target_Register_MX026.csv`;
    }

    const a = document.createElement('a');
    a.href = dataStr;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#03070B] font-mono text-xs text-[#E4F2F5] select-none p-4 md:p-6 space-y-4">
      {/* 1. TOP HEADER & PRIMARY ACTION CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081118] border border-[#16303B] rounded-2xl p-4 shadow-xl shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-black tracking-wider text-[#E4F2F5] uppercase font-sans">
              SONARX
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#32E6D1]/15 text-[#32E6D1] border border-[#32E6D1]/30">
              MISSION CONTROL // AI MARINE DEBRIS PIPELINE
            </span>
            <span className="text-[9px] text-[#6F8992]">· MoES SIH 2026</span>
          </div>
          <p className="text-[10px] text-[#6F8992] tracking-tight mt-0.5">
            Automated side-scan sonar perception: Noise suppression → YOLOv8 detection → False-positive filter → Geotag.
          </p>
        </div>

        {/* Action Buttons: Run Demo, Upload, Export, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* ONE-CLICK RUN DEMO BUTTON */}
          <button
            onClick={handleRunFullDemo}
            disabled={isDemoRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
              isDemoRunning
                ? 'bg-[#32E6D1]/30 text-[#32E6D1] border border-[#32E6D1] animate-pulse'
                : 'bg-gradient-to-r from-[#32E6D1] to-[#29B6F6] text-[#03070B] hover:brightness-110 active:scale-95 shadow-[#32E6D1]/20'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isDemoRunning ? 'DEMO RUNNING (4 SAMPLES)...' : '▶ RUN AUTOMATED DEMO'}</span>
          </button>

          {/* Sample Switcher Dropdown */}
          <select
            value={currentScenarioIndex}
            onChange={(e) => runScenarioPipeline(Number(e.target.value))}
            className="px-3 py-2 text-[10px] font-mono rounded-xl bg-[#0C171E] border border-[#16303B] text-[#E4F2F5] focus:outline-none focus:border-[#32E6D1] cursor-pointer"
          >
            {DEMO_PIPELINE_SCENARIOS.map((sc, i) => (
              <option key={sc.id} value={i}>
                Sample {i + 1}: {sc.filename}
              </option>
            ))}
          </select>

          {/* Custom Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-[#E4F2F5] text-[10px] font-bold transition-all cursor-pointer">
            <UploadCloud className="w-3.5 h-3.5 text-[#32E6D1]" />
            <span>Upload Image</span>
            <input type="file" accept="image/*,.xtf" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Download Report Button */}
          <button
            onClick={() => handleDownloadReport('json')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-[#E4F2F5] text-[10px] font-bold transition-all cursor-pointer shadow-md"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-[#65D391]" /> : <Download className="w-3.5 h-3.5 text-[#32E6D1]" />}
            <span>{downloadSuccess ? 'Exported!' : 'Download Report'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#0C171E] border border-[#16303B] text-[#6F8992] hover:text-[#FF5D5D] transition-colors cursor-pointer"
            title="Reset Pipeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. PIPELINE STATUS RAIL (REQUIREMENT 1: Top of Page, Always Visible) */}
      <PipelineStatusRail
        stages={stages}
        currentStageIndex={currentStageIndex}
        isProcessing={isDemoRunning || stages.some((s) => s.status === 'PROCESSING')}
      />

      {/* 3. SUMMARY METRICS BAR (REQUIREMENT 6: 4 Live KPI Tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-[#081118] border border-[#16303B] text-center space-y-0.5">
          <span className="text-[9px] text-[#6F8992] uppercase block">Images Processed</span>
          <strong className="text-xl font-extrabold text-[#E4F2F5]">{processedImagesCount} / 4</strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#081118] border border-[#32E6D1]/40 text-center space-y-0.5 shadow-[0_0_10px_rgba(50,230,209,0.1)]">
          <span className="text-[9px] text-[#32E6D1] uppercase block font-bold">Objects Detected</span>
          <strong className="text-xl font-extrabold text-[#32E6D1]">{totalDetectedCount} Valid Debris</strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#081118] border border-[#65D391]/40 text-center space-y-0.5">
          <span className="text-[9px] text-[#65D391] uppercase block font-bold">False Positives Filtered</span>
          <strong className="text-xl font-extrabold text-[#65D391]">{totalFilteredCount} Natural Rocks</strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#081118] border border-[#16303B] text-center space-y-0.5">
          <span className="text-[9px] text-[#6F8992] uppercase block">Avg AI Confidence</span>
          <strong className="text-xl font-extrabold text-[#29B6F6]">{avgConfidence.toFixed(1)}%</strong>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE GRID: 2 Columns / All Key Visuals Visible in One Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column (7 cols): Visual Proofing & Detection Canvas */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* BEFORE / AFTER NOISE PANEL (REQUIREMENT 2) */}
          <BeforeAfterNoisePanel
            rawNoiseDescription={activeScenario.rawNoiseDescription}
            filteredNoiseDescription={activeScenario.filteredNoiseDescription}
            contrastImprovementDb={activeScenario.contrastImprovementDb}
            scenarioSeed={currentScenarioIndex + 1}
            isDenoisedActive={currentStageIndex >= 1}
          />

          {/* DETECTION PANEL (REQUIREMENT 3) */}
          <DetectionCanvasPanel
            detections={activeScenario.detections}
            selectedDetectionId={selectedDetectionId}
            onSelectDetection={setSelectedDetectionId}
            isDetectionActive={currentStageIndex >= 2}
            swathWidthM={activeScenario.swathWidthM}
          />
        </div>

        {/* Right Column (5 cols): Automated Decision Log & Live Map */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* AUTOMATED DECISION LOG (REQUIREMENT 4 — KEY DIFFERENTIATOR) */}
          <div className="flex-1 min-h-[290px]">
            <AutomatedDecisionLog
              logs={logList}
              isLive={isDemoRunning || stages.some((s) => s.status === 'PROCESSING')}
            />
          </div>

          {/* LIVE GEOTAGGED MAP PANEL (REQUIREMENT 5) */}
          <LiveGeotagMapPanel
            detections={activeScenario.detections}
            selectedDetectionId={selectedDetectionId}
            onSelectDetection={setSelectedDetectionId}
          />
        </div>
      </div>
    </div>
  );
};
