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
  Gauge,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { HolographicGlobe } from '../components/common/HolographicGlobe';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo, apiHealth, isDemoMode } = useApp();

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
      {/* 1. Top Model Header */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-6 border border-cyan-500/20 shadow-2xl bg-gradient-to-r from-[#0C162E]/95 via-[#0A1226]/90 to-[#070D1B]/95">
        {/* Ambient 3D Rotating Globe in Background */}
        <div className="absolute -right-8 -top-8 opacity-20 pointer-events-none hidden md:block">
          <HolographicGlobe size={260} />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40 shrink-0">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-wide">
                {modelInfo?.model_name || 'YOLOv8n-Sonar-MILCO-NOMBO'}
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                ONNX Runtime
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Custom-trained YOLOv8n deep neural network for side-scan sonar seabed contact detection
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {isModelActive ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-md shadow-emerald-950/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Model Runtime Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold shadow-md">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Weights Missing at backend/models/best.onnx</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Model Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <p className="text-[11px] font-mono uppercase font-semibold text-slate-400">
            Architecture
          </p>
          <p className="text-lg font-extrabold text-slate-100 font-mono">
            YOLOv8 Nano (YOLOv8n)
          </p>
          <p className="text-[11px] text-slate-400 font-mono">Exported to ONNX Opset 12</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <p className="text-[11px] font-mono uppercase font-semibold text-slate-400">
            Input Resolution
          </p>
          <p className="text-lg font-extrabold text-slate-100 font-mono">
            640 × 640 × 3
          </p>
          <p className="text-[11px] text-slate-400 font-mono">Letterbox padded RGB</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <p className="text-[11px] font-mono uppercase font-semibold text-slate-400">
            Model Weight Size
          </p>
          <p className="text-lg font-extrabold text-slate-100 font-mono">
            ~11.7 MB (12.2 MB)
          </p>
          <p className="text-[11px] text-slate-400 font-mono">Compressed FP32 weights</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <p className="text-[11px] font-mono uppercase font-semibold text-slate-400">
            Inference Baseline
          </p>
          <p className="text-lg font-extrabold text-cyan-400 font-mono">
            ~{metrics.benchmark_latency_ms} ms/image
          </p>
          <p className="text-[11px] text-slate-400 font-mono">{metrics.benchmark_device}</p>
        </div>
      </div>

      {/* 3. Validation Metrics Section */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              {metrics.notes}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical validation scores evaluated on held-out sonar validation split
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-cyan-500/30">
            Baseline Run
          </span>
        </div>

        {/* Global Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1.5">
            <p className="text-slate-400 text-xs font-mono uppercase">
              Precision
            </p>
            <p className="text-3xl font-extrabold text-slate-100 font-mono">
              {(metrics.precision * 100).toFixed(1)}%
            </p>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${metrics.precision * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Overall Precision</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1.5">
            <p className="text-slate-400 text-xs font-mono uppercase">
              Recall
            </p>
            <p className="text-3xl font-extrabold text-slate-100 font-mono">
              {(metrics.recall * 100).toFixed(1)}%
            </p>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${metrics.recall * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Overall Recall</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 text-center space-y-1.5 shadow-lg shadow-cyan-950/40">
            <p className="text-cyan-400 text-xs font-mono uppercase font-bold">
              mAP @ 0.50
            </p>
            <p className="text-3xl font-extrabold text-cyan-300 font-mono">
              {(metrics.map50 * 100).toFixed(1)}%
            </p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 rounded-full"
                style={{ width: `${metrics.map50 * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-cyan-400 font-mono font-semibold">Mean Average Precision</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1.5">
            <p className="text-slate-400 text-xs font-mono uppercase">
              mAP @ 0.50-0.95
            </p>
            <p className="text-3xl font-extrabold text-slate-100 font-mono">
              {(metrics.map50_95 * 100).toFixed(2)}%
            </p>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${metrics.map50_95 * 100 * 2}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Multi-IoU Threshold</p>
          </div>
        </div>

        {/* Per-Class Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold font-mono text-slate-300 uppercase tracking-wider">
            Per-Class Validation Performance
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MILCO Class Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-red-500/30 space-y-3 shadow-lg shadow-red-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-extrabold font-mono text-red-400">
                    MILCO (Mine-Like Contact)
                  </span>
                </div>
                <span className="text-xs font-mono text-red-400 font-bold">
                  Class 1
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#080E1C] border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Precision</p>
                  <p className="font-extrabold text-slate-100 mt-0.5">
                    {(metrics.milco_precision * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080E1C] border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Recall</p>
                  <p className="font-extrabold text-slate-100 mt-0.5">
                    {(metrics.milco_recall * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080E1C] border border-red-500/30">
                  <p className="text-red-400 text-[10px] font-bold">mAP50</p>
                  <p className="font-extrabold text-red-400 mt-0.5">
                    {(metrics.milco_map50 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* NOMBO Class Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-3 shadow-lg shadow-cyan-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-extrabold font-mono text-cyan-400">
                    NOMBO (Non-Mine Obstacle)
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Class 2
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#080E1C] border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Precision</p>
                  <p className="font-extrabold text-slate-100 mt-0.5">
                    {(metrics.nombo_precision * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080E1C] border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Recall</p>
                  <p className="font-extrabold text-slate-100 mt-0.5">
                    {(metrics.nombo_recall * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080E1C] border border-cyan-500/30">
                  <p className="text-cyan-400 text-[10px] font-bold">mAP50</p>
                  <p className="font-extrabold text-cyan-400 mt-0.5">
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
