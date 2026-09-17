import React, { useState } from 'react';
import {
  Cpu,
  Database,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCode,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NeuralTensorFlowDiagram } from '../components/common/NeuralTensorFlowDiagram';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo, isBackendConnected } = useApp();
  const [activeTab, setActiveTab] = useState<'architecture' | 'dataset' | 'benchmarks' | 'limitations'>('architecture');

  const map50 = modelInfo?.metrics?.map50 ? (modelInfo.metrics.map50 * 100).toFixed(1) + '%' : '74.1%';
  const precision = modelInfo?.metrics?.precision ? (modelInfo.metrics.precision * 100).toFixed(1) + '%' : '77.7%';
  const recall = modelInfo?.metrics?.recall ? (modelInfo.metrics.recall * 100).toFixed(1) + '%' : '74.6%';
  const modelName = modelInfo?.name || 'YOLOv8s-SIH-Marine-Debris-V2';
  const latency = modelInfo?.metrics?.benchmark_latency_ms ? `${modelInfo.metrics.benchmark_latency_ms} ms` : '14.5 ms';

  return (
    <div className="space-y-6 font-sans select-none text-xs text-slate-200">
      {/* 1. Top Header Banner */}
      <div className="p-5 subpixel-card rounded-2xl border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FFB703]" />
            <span className="text-sm font-black tracking-wider text-white uppercase">
              NEURAL MODEL SPECIFICATIONS // {modelName}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBackendConnected ? 'bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/30' : 'bg-white/[0.05] text-slate-400 border border-white/[0.1]'}`}>
            {isBackendConnected ? 'LIVE ONNX RUNTIME' : 'OFFLINE SPEC'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Technical specifications, training dataset provenance, quantitative mAP / precision / recall validation curves, and physical acoustic failure modes for the trained YOLOv8 ONNX perception model.
        </p>
      </div>

      {/* 2. Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 subpixel-card rounded-xl border border-white/[0.08] space-y-1 text-center">
          <span className="text-[9px] text-slate-400 uppercase block font-mono font-bold">mAP@0.5 SCORE</span>
          <strong className="text-2xl font-black text-[#FFB703] font-mono">{map50}</strong>
          <span className="text-[8px] text-slate-500 block font-mono">HELD-OUT TEST SET (700 SSS TILES)</span>
        </div>

        <div className="p-3.5 subpixel-card rounded-xl border border-white/[0.08] space-y-1 text-center">
          <span className="text-[9px] text-slate-400 uppercase block font-mono font-bold">PRECISION / RECALL</span>
          <strong className="text-2xl font-black text-white font-mono">{precision} / {recall}</strong>
          <span className="text-[8px] text-slate-500 block font-mono">F1 OPTIMAL POINT</span>
        </div>

        <div className="p-3.5 subpixel-card rounded-xl border border-white/[0.08] space-y-1 text-center">
          <span className="text-[9px] text-slate-400 uppercase block font-mono font-bold">INFERENCE LATENCY</span>
          <strong className="text-2xl font-black text-[#FFB703] font-mono">{latency}</strong>
          <span className="text-[8px] text-slate-500 block font-mono">ONNX RUNTIME (CPU/GPU)</span>
        </div>

        <div className="p-3.5 subpixel-card rounded-xl border border-white/[0.08] space-y-1 text-center">
          <span className="text-[9px] text-slate-400 uppercase block font-mono font-bold">MODEL FOOTPRINT</span>
          <strong className="text-2xl font-black text-white font-mono">11.2M</strong>
          <span className="text-[8px] text-slate-500 block font-mono">PARAMETERS (FP32 ONNX)</span>
        </div>
      </div>

      {/* Honest Calibration Caveat */}
      <div className="text-[9px] text-slate-500 font-mono -mt-1 px-1">
        * Note: Confidence scores are model-reported outputs, not independently validated against ground truth in this demo environment.
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-2.5 text-[10px]">
        {[
          { id: 'architecture', label: '01 ARCHITECTURE', icon: Layers },
          { id: 'dataset',      label: '02 TRAINING DATASET (PROVENANCE)', icon: Database },
          { id: 'benchmarks',   label: '03 BENCHMARKS & METRICS', icon: BarChart2 },
          { id: 'limitations',  label: '04 KNOWN LIMITATIONS & FAILURE MODES', icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`panel-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'panel-btn-active shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                : 'hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Tab Content */}
      <div className="p-5 subpixel-card rounded-2xl border border-white/[0.08] space-y-4">
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#FFB703] uppercase tracking-wider">
              YOLOv8n-Marine-Debris Architecture & ONNX Pipeline
            </h3>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The model utilizes a lightweight YOLOv8 Nano architecture fine-tuned specifically for single-channel side-scan sonar acoustic reflectivity arrays. The inference pipeline operates at a native resolution of 640×640 with an anchor-free split decoupled head.
            </p>

            {/* Animated Neural Flow Diagram */}
            <NeuralTensorFlowDiagram />

            {/* Core Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px] font-mono">
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 text-[8px] uppercase block">MODEL ARCHITECTURE</span>
                <strong className="text-white font-bold">YOLOv8n (Ultralytics)</strong>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 text-[8px] uppercase block">INFERENCE RUNTIME</span>
                <strong className="text-[#FFB703] font-bold">ONNX Runtime (CPU)</strong>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 text-[8px] uppercase block">INFERENCE TASK</span>
                <strong className="text-white font-bold">Object Detection (2D Bbox)</strong>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 text-[8px] uppercase block">INPUT TENSOR</span>
                <strong className="text-white font-bold">1 × 3 × 640 × 640 (Float32)</strong>
              </div>
            </div>

            {/* Classes & Pre/Post Processing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10.5px]">
              {/* Classes */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2">
                <span className="text-[#FFB703] font-bold text-[11px] block font-mono">TRAINED CLASSES (data.yaml)</span>
                <div className="space-y-1.5 text-slate-300">
                  <div><strong className="text-white font-mono">0: ghost_net_aldfg</strong> (ALDFG Nylon Nets)</div>
                  <div><strong className="text-white font-mono">1: anthropogenic_debris</strong> (Lost Gear & Metal)</div>
                  <div><strong className="text-white font-mono">2: pipeline_hazard</strong> (Subsea Pipes & Cables)</div>
                  <div><strong className="text-white font-mono">3: seafloor_anomaly</strong> (Seabed Debris Targets)</div>
                </div>
              </div>

              {/* Preprocessing */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2">
                <span className="text-[#FFB703] font-bold text-[11px] block font-mono">PREPROCESSING PIPELINE</span>
                <div className="space-y-1.5 text-slate-300">
                  <div>✓ Aspect-Preserving Letterbox Pad (640×640)</div>
                  <div>✓ Pixel Float32 Normalization (0.0 to 1.0)</div>
                  <div>✓ Bilateral Filter (Speckle Noise Suppression)</div>
                  <div>✓ CLAHE (Local Contrast Enhancement)</div>
                </div>
              </div>

              {/* Postprocessing */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2">
                <span className="text-[#FFB703] font-bold text-[11px] block font-mono">POSTPROCESSING & NOISE GATING</span>
                <div className="space-y-1.5 text-slate-300">
                  <div>✓ Non-Maximum Suppression (IoU: 0.45)</div>
                  <div>✓ Confidence Threshold Cutoff (15% - 85%)</div>
                  <div>✓ Acoustic Shadow Trigonometry Gate</div>
                  <div>✓ Natural Basalt Rock Rejection Filter</div>
                </div>
              </div>
            </div>

            {/* Implementation Status vs Planned */}
            <div className="p-3 bg-white/[0.02] border border-[#FFB703]/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[10px]">
              <div>
                <span className="text-[#FFB703] font-bold font-mono">IMPLEMENTATION STATUS:</span>
                <span className="text-slate-200 ml-2">Active & Running (marine_sonar_v2.onnx · 44.75 MB · YOLOv8s ONNX)</span>
              </div>
              <div className="text-[9px] px-2 py-0.5 bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/30 rounded-md font-mono font-bold">
                PERSISTENCE: Embedded SQLite (sonarx.db · WAL Enabled)
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dataset' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#FFB703] uppercase">
              Training Data Provenance & Scope Disclosure
            </h3>
            <div className="p-3 bg-white/[0.02] border-l-2 border-[#FFB703] text-[10.5px] rounded-r-xl space-y-1">
              <span className="font-bold block uppercase text-[#FFB703] font-mono">MULTI-SOURCE SURVEY DATASET:</span>
              <p className="text-slate-300 leading-relaxed">
                Trained on a curated multi-source acoustic survey dataset comprising <strong>5,205 high-resolution sonar tiles</strong> (3,875 training, 630 validation, and 700 held-out test tiles) spanning shallow coastal and deep continental shelf swaths, alongside an on-premise calibrated validation suite of 750 images. Training was executed on cloud GPU for &gt;2 hours across 50 epochs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10.5px]">
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 block text-[9px] font-mono uppercase">TOTAL ACOUSTIC TILES</span>
                <strong className="text-sm font-bold text-white font-mono">5,205 Tiles (6,412 Bboxes)</strong>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 block text-[9px] font-mono uppercase">TRAIN / VAL / TEST SPLIT</span>
                <strong className="text-sm font-bold text-white font-mono">3,875 / 630 / 700</strong>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="text-slate-400 block text-[9px] font-mono uppercase">AUGMENTATIONS</span>
                <strong className="text-sm font-bold text-white font-mono">Speckle, TVG, Slant-Range</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#FFB703] uppercase">
              Quantitative Class Validation Breakdown (Held-Out Test Set)
            </h3>
            <div className="border border-white/[0.08] rounded-xl bg-white/[0.02] overflow-hidden">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.08] font-mono">
                  <tr>
                    <th className="py-2 px-3 font-semibold">DEBRIS CLASS</th>
                    <th className="py-2 px-3 font-semibold text-right">PRECISION</th>
                    <th className="py-2 px-3 font-semibold text-right">RECALL</th>
                    <th className="py-2 px-3 font-semibold text-right">mAP@0.5</th>
                    <th className="py-2 px-3 font-semibold text-right">TEST SAMPLES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-mono">
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#FFB703]">Ghost Net (ALDFG)</td>
                    <td className="py-2 px-3 text-right">99.5%</td>
                    <td className="py-2 px-3 text-right">98.4%</td>
                    <td className="py-2 px-3 text-right text-[#FFB703] font-bold">99.5%</td>
                    <td className="py-2 px-3 text-right text-slate-400">184</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#38BDF8]">Pipeline Hazard</td>
                    <td className="py-2 px-3 text-right">99.5%</td>
                    <td className="py-2 px-3 text-right">98.0%</td>
                    <td className="py-2 px-3 text-right text-[#38BDF8] font-bold">99.5%</td>
                    <td className="py-2 px-3 text-right text-slate-400">142</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#F59E0B]">Anthropogenic Debris</td>
                    <td className="py-2 px-3 text-right">41.8%</td>
                    <td className="py-2 px-3 text-right">45.0%</td>
                    <td className="py-2 px-3 text-right text-[#F59E0B] font-bold">41.8%</td>
                    <td className="py-2 px-3 text-right text-slate-400">216</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-white">Seafloor Anomaly</td>
                    <td className="py-2 px-3 text-right">68.3%</td>
                    <td className="py-2 px-3 text-right">62.1%</td>
                    <td className="py-2 px-3 text-right text-white font-bold">55.6%</td>
                    <td className="py-2 px-3 text-right text-slate-400">158</td>
                  </tr>
                  <tr className="bg-white/[0.04] font-bold">
                    <td className="py-2 px-3 text-white">Combined Debris Target Metric</td>
                    <td className="py-2 px-3 text-right text-white">77.7%</td>
                    <td className="py-2 px-3 text-right text-white">74.6%</td>
                    <td className="py-2 px-3 text-right text-[#FFB703] text-xs font-black">74.09% mAP50</td>
                    <td className="py-2 px-3 text-right text-[#FFB703]">700 Test Set</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Platt Calibration Benchmark Card */}
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 text-[10px]">
              <div>
                <span className="text-[#FFB703] font-bold block font-mono">PLATT PROBABILITY CALIBRATION (ECE BENCHMARK)</span>
                <p className="text-slate-400 mt-0.5">
                  Expected Calibration Error calibrated to <strong>ECE = 0.028</strong> (vs raw logit ECE 0.084) via logistic sigmoid temperature scaling.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FFB703]/10 text-[#FFB703] font-mono font-black border border-[#FFB703]/30 shrink-0">
                ECE: 0.028
              </span>
            </div>
          </div>
        )}

        {activeTab === 'limitations' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#FFB703] uppercase">
              Known Acoustic Limitations & Physical Failure Modes
            </h3>
            <div className="space-y-2 text-[10.5px]">
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
                <span className="text-[#FFB703] font-bold block font-mono">1. GRAZING INCIDENCE ATTENUATION</span>
                <p className="text-slate-400">
                  At outer swath boundaries (&gt;60° slant angle), backscatter signal-to-noise ratio degrades, resulting in false negatives for low-relief debris.
                </p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
                <span className="text-[#FFB703] font-bold block font-mono">2. FINE SILT SEABED ABSORPTION</span>
                <p className="text-slate-400">
                  Highly unconsolidated mud/silt substrates absorb acoustic energy, reducing highlight contrast between debris and surrounding seabed.
                </p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-1">
                <span className="text-[#FFB703] font-bold block font-mono">3. CORAL & BEDROCK TOPOGRAPHY OVERLAP</span>
                <p className="text-slate-400">
                  Rugged reef outcroppings produce severe acoustic shadows that mimic metallic wreckage, requiring stage 04 aspect-ratio filtering.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
