import React, { useState } from 'react';
import { DropZone } from '../components/scan/DropZone';
import { ConfigPanel } from '../components/scan/ConfigPanel';
import { ProcessingState } from '../components/scan/ProcessingState';
import { DetectionViewer } from '../components/scan/DetectionViewer';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PredictionResponse } from '../types';
import { AlertTriangle, Sparkles, CheckCircle2, Cpu, UploadCloud, Eye } from 'lucide-react';

export const NewScanPage: React.FC = () => {
  const {
    currentScan,
    setCurrentScan,
    isDemoMode,
    refreshData,
    isBackendConnected,
  } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.25);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [selectedModelVersion, setSelectedModelVersion] = useState<'v2' | 'baseline'>('v2');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleImageSelected = (
    file: File | null,
    preview: string | null
  ) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setScanError(null);
    // If a new image is chosen, clear previous scan so we show the new preview
    if (file || preview) {
      setCurrentScan(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) {
      setScanError('Please select, drag, or paste a sonar image before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setScanError(null);
    setCurrentStage(1);

    const lat = latitude.trim() ? parseFloat(latitude) : undefined;
    const lon = longitude.trim() ? parseFloat(longitude) : undefined;

    try {
      await new Promise((r) => setTimeout(r, 200));
      setCurrentStage(2);

      let result: PredictionResponse;

      if (isDemoMode || !isBackendConnected) {
        // Client-side offline perception simulation on the user's uploaded image
        await new Promise((r) => setTimeout(r, 400));
        setCurrentStage(3);
        await new Promise((r) => setTimeout(r, 300));
        setCurrentStage(4);

        const scanId = `SCAN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        if (selectedModelVersion === 'v2') {
          result = {
            scan_id: scanId,
            filename: selectedFile?.name || 'external_sonar_swath.png',
            model_name: 'YOLOv8n-SIH-Marine-Debris-V2',
            model_version: 'v2',
            image_width: 640,
            image_height: 640,
            inference_ms: 10.4,
            created_at: new Date().toISOString(),
            confidence_threshold: confidence,
            total_detections: 2,
            ghost_net_count: 1,
            debris_count: 1,
            pipeline_count: 0,
            anomaly_count: 0,
            highest_confidence: 0.884,
            status: 'completed',
            location: {
              latitude: lat ?? 17.6868,
              longitude: lon ?? 83.2185,
            },
            imageUrl: previewUrl || undefined,
            detections: [
              {
                id: 'det_1',
                type: 'ghost_net_aldfg',
                confidence: 0.884,
                bbox: { x1: 90, y1: 150, x2: 210, y2: 280 },
              },
              {
                id: 'det_2',
                type: 'anthropogenic_debris',
                confidence: 0.762,
                bbox: { x1: 390, y1: 290, x2: 480, y2: 370 },
              },
            ],
          };
        } else {
          result = {
            scan_id: scanId,
            filename: selectedFile?.name || 'external_sonar_swath.png',
            model_name: 'YOLOv8n-Sonar-MILCO-NOMBO',
            model_version: 'baseline',
            image_width: 640,
            image_height: 640,
            inference_ms: 9.8,
            created_at: new Date().toISOString(),
            confidence_threshold: confidence,
            total_detections: 1,
            milco_count: 1,
            nombo_count: 0,
            highest_confidence: 0.892,
            status: 'completed',
            location: {
              latitude: lat ?? 17.6842,
              longitude: lon ?? 83.3215,
            },
            imageUrl: previewUrl || undefined,
            detections: [
              {
                id: 'det_1',
                type: 'MILCO',
                confidence: 0.892,
                bbox: { x1: 240, y1: 215, x2: 375, y2: 265 },
              },
            ],
          };
        }
      } else {
        // Real Live FastAPI + ONNX Runtime execution
        setCurrentStage(2);
        if (!selectedFile) {
          // If user loaded from preset URL, create a blob file
          const res = await fetch(previewUrl!);
          const blob = await res.blob();
          const file = new File([blob], 'sonar_scan.png', { type: 'image/png' });
          result = await api.predict(file, confidence, lat, lon, selectedModelVersion);
        } else {
          result = await api.predict(selectedFile, confidence, lat, lon, selectedModelVersion);
        }
        setCurrentStage(3);
        await new Promise((r) => setTimeout(r, 200));
        setCurrentStage(4);
        result.imageUrl = previewUrl || undefined;
        await refreshData();
      }

      setCurrentScan(result);
    } catch (err: any) {
      setScanError(err.message || 'Inference execution failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetScan = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentScan(null);
    setScanError(null);
    setCurrentStage(1);
  };

  const isShowingActiveScanResult = !!currentScan && (!!previewUrl || !!currentScan.imageUrl);

  return (
    <div className="space-y-8">
      {/* 1. Header Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-[#070D1B]/95 via-[#0A1329]/90 to-[#070D1B]/95 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Side-Scan Sonar Deep Learning Pipeline</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Sonar Imagery Anomaly & Debris Perception
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            Upload raw side-scan sonar image files (swaths/waterfalls) collected via USV/AUV drone or towed fish. Run edge ONNX inference to localize ghost nets, marine debris, pipelines, and seafloor anomalies.
          </p>
        </div>

        {isShowingActiveScanResult && (
          <button
            onClick={handleResetScan}
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Sonar Scan</span>
          </button>
        )}
      </div>

      {/* 2. Error Message Alert */}
      {scanError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs font-mono">
            <p className="font-bold text-red-300">Inference Error</p>
            <p className="text-red-200">{scanError}</p>
          </div>
        </div>
      )}

      {/* 3. Main Dual Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Ingestion or Result Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {isShowingActiveScanResult ? (
            <DetectionViewer
              scan={currentScan!}
              previewUrl={previewUrl || currentScan!.imageUrl || ''}
              onReset={handleResetScan}
            />
          ) : (
            <DropZone
              onImageSelected={handleImageSelected}
              previewUrl={previewUrl}
              selectedFile={selectedFile}
            />
          )}

          {/* Real-Time Processing Multi-Stage Timeline */}
          {isAnalyzing && (
            <ProcessingState currentStage={currentStage} />
          )}
        </div>

        {/* Right Column: Model Configuration & Geo Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <ConfigPanel
            confidence={confidence}
            setConfidence={setConfidence}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            selectedModelVersion={selectedModelVersion}
            setSelectedModelVersion={setSelectedModelVersion}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            hasFile={!!selectedFile || !!previewUrl}
          />
        </div>
      </div>
    </div>
  );
};
