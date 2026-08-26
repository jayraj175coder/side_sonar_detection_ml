import React from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  BarChart2,
  FileCode,
  Shield,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo, apiHealth, isBackendConnected, isDemoMode } = useApp();

  const metrics = modelInfo?.validation_metrics || {
    precision: 0.718,
    recall: 0.669,
    map50: 0.712,
    map50_95: 0.3225,
    milco_precision: 0.721,
    milco_recall: 0.738,
    milco_map50: 0.714,
    nombo_precision: 0.659,
    nombo_recall: 0.414,
    nombo_map50: 0.542,
    benchmark_device: 'NVIDIA T4 (Google Colab)',
    benchmark_latency_ms: 9.8,
    notes: 'Validation metrics — current baseline model',
  };

  const isModelActive = isDemoMode || apiHealth?.model_loaded || modelInfo?.model_loaded;

  return (
    <div className="space-y-6">
      {/* Top Model Status Header */}
      <div className="p-6 rounded-xl bg-[#0C1427] border border-[#1E2E4E] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">
                {modelInfo?.model_name || 'YOLOv8n-Sonar-MILCO-NOMBO'}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ONNX Runtime
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Custom-trained YOLOv8n deep neural network for side-scan sonar seabed contact detection
            </p>
          </div>
        </div>

        <div>
          {isModelActive ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Model Runtime Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Weights Missing at backend/models/best.onnx</span>
            </div>
          )}
        </div>
      </div>

      {/* Model Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-1">
          <p className="text-[11px] font-mono uppercase text-slate-400">
            Architecture
          </p>
          <p className="text-lg font-bold text-slate-100 font-mono">
            YOLOv8 Nano (YOLOv8n)
          </p>
          <p className="text-[11px] text-slate-400">Exported to ONNX Opset 12</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-1">
          <p className="text-[11px] font-mono uppercase text-slate-400">
            Input Resolution
          </p>
          <p className="text-lg font-bold text-slate-100 font-mono">
            640 × 640 × 3
          </p>
          <p className="text-[11px] text-slate-400">Letterbox padded RGB</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-1">
          <p className="text-[11px] font-mono uppercase text-slate-400">
            Model Weight Size
          </p>
          <p className="text-lg font-bold text-slate-100 font-mono">
            ~11.7 MB (12.2 MB)
          </p>
          <p className="text-[11px] text-slate-400">Compressed FP32 weights</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-1">
          <p className="text-[11px] font-mono uppercase text-slate-400">
            Inference Baseline
          </p>
          <p className="text-lg font-bold text-cyan-400 font-mono">
            ~{metrics.benchmark_latency_ms} ms/image
          </p>
          <p className="text-[11px] text-slate-400">{metrics.benchmark_device}</p>
        </div>
      </div>

      {/* Validation Metrics Section */}
      <div className="p-6 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-5">
        <div className="flex items-center justify-between border-b border-[#1E2E4E] pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              {metrics.notes}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical validation scores evaluated on held-out sonar validation split
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
            Baseline Run
          </span>
        </div>

        {/* Global Overall Validation Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#080E1C] border border-[#15233E] text-center space-y-1">
            <p className="text-slate-400 text-xs font-mono uppercase">
              Precision
            </p>
            <p className="text-2xl font-bold text-slate-100 font-mono">
              {(metrics.precision * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400">Overall Precision</p>
          </div>

          <div className="p-4 rounded-lg bg-[#080E1C] border border-[#15233E] text-center space-y-1">
            <p className="text-slate-400 text-xs font-mono uppercase">
              Recall
            </p>
            <p className="text-2xl font-bold text-slate-100 font-mono">
              {(metrics.recall * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400">Overall Recall</p>
          </div>

          <div className="p-4 rounded-lg bg-[#080E1C] border border-cyan-500/30 text-center space-y-1">
            <p className="text-cyan-400 text-xs font-mono uppercase font-bold">
              mAP @ 0.50
            </p>
            <p className="text-2xl font-bold text-cyan-300 font-mono">
              {(metrics.map50 * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-cyan-400/80">Mean Average Precision</p>
          </div>

          <div className="p-4 rounded-lg bg-[#080E1C] border border-[#15233E] text-center space-y-1">
            <p className="text-slate-400 text-xs font-mono uppercase">
              mAP @ 0.50-0.95
            </p>
            <p className="text-2xl font-bold text-slate-100 font-mono">
              {(metrics.map50_95 * 100).toFixed(2)}%
            </p>
            <p className="text-[10px] text-slate-400">Multi-IoU Threshold</p>
          </div>
        </div>

        {/* Per-Class Validation Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
            Per-Class Validation Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MILCO Class Card */}
            <div className="p-4 rounded-lg bg-[#080E1C] border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold font-mono text-red-400">
                    MILCO (Mine-Like Contact)
                  </span>
                </div>
                <span className="text-xs font-mono text-red-400/80">
                  Target Class 0/1
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Precision</p>
                  <p className="font-bold text-slate-100 mt-0.5">
                    {(metrics.milco_precision * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Recall</p>
                  <p className="font-bold text-slate-100 mt-0.5">
                    {(metrics.milco_recall * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">mAP50</p>
                  <p className="font-bold text-red-400 mt-0.5">
                    {(metrics.milco_map50 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* NOMBO Class Card */}
            <div className="p-4 rounded-lg bg-[#080E1C] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold font-mono text-cyan-400">
                    NOMBO (Non-Mine Obstacle)
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400/80">
                  Target Class 1/2
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Precision</p>
                  <p className="font-bold text-slate-100 mt-0.5">
                    {(metrics.nombo_precision * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Recall</p>
                  <p className="font-bold text-slate-100 mt-0.5">
                    {(metrics.nombo_recall * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">mAP50</p>
                  <p className="font-bold text-cyan-400 mt-0.5">
                    {(metrics.nombo_map50 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
