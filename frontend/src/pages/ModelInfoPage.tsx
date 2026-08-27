import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  BarChart2,
  CheckCircle2,
  FileCode,
  Sparkles,
  ExternalLink,
  Info,
  Radio,
  BookOpen,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DatasetCatalogResponse } from '../types';
import { HolographicGlobe } from '../components/common/HolographicGlobe';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'baseline' | 'v2' | 'datasets'>('baseline');
  const [datasetCatalog, setDatasetCatalog] = useState<DatasetCatalogResponse | null>(null);

  useEffect(() => {
    api.getDatasets()
      .then((data) => setDatasetCatalog(data))
      .catch((err) => console.warn('Could not fetch datasets catalog:', err));
  }, []);

  const baselineMetrics = modelInfo?.metrics || {
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
    notes: 'Measured validation metrics — YOLOv8n MILCO/NOMBO baseline',
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/25 bg-gradient-to-r from-[#070D1B]/95 via-[#0A1329]/90 to-[#070D1B]/95 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Neural Architecture & Model Specifications</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Side-Scan Sonar Deep Learning Models
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            Active YOLOv8n baseline model specs, OpenSonarDatasets research catalog, and the planned Marine Sonar V2 training track.
          </p>
        </div>

        <HolographicGlobe size={140} className="shrink-0" />
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab('baseline')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'baseline'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Active Baseline (YOLOv8n MILCO/NOMBO)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('v2')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'v2'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Marine Sonar V2 Track (In Development)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('datasets')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'datasets'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>OpenSonarDatasets SSS Catalog</span>
        </button>
      </div>

      {/* TAB 1: Active Baseline Model */}
      {activeSubTab === 'baseline' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Mean AP @ 0.50</p>
              <p className="text-2xl font-extrabold text-cyan-300 font-mono">
                {(baselineMetrics.map50 * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">mAP50 Validation</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Precision (Macro)</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {(baselineMetrics.precision * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Measured Precision</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Recall (Macro)</p>
              <p className="text-2xl font-extrabold text-purple-400 font-mono">
                {(baselineMetrics.recall * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Measured Recall</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Inference Latency</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                {baselineMetrics.benchmark_latency_ms} ms
              </p>
              <p className="text-[10px] text-slate-400">NVIDIA T4 Tensor Core</p>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                Per-Class Validation Breakdown
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-red-500/30 space-y-1">
                  <p className="text-red-400 font-bold">MILCO (Mine-Like Contacts)</p>
                  <p className="text-slate-300">Precision: {(baselineMetrics.milco_precision! * 100).toFixed(1)}% | Recall: {(baselineMetrics.milco_recall! * 100).toFixed(1)}% | mAP50: {(baselineMetrics.milco_map50! * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                  <p className="text-cyan-400 font-bold">NOMBO (Non-Mine Bottom Obstacles)</p>
                  <p className="text-slate-300">Precision: {(baselineMetrics.nombo_precision! * 100).toFixed(1)}% | Recall: {(baselineMetrics.nombo_recall! * 100).toFixed(1)}% | mAP50: {(baselineMetrics.nombo_map50! * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                ONNX Deployment Specifications
              </h3>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Model File:</span>
                  <span className="text-cyan-300">backend/models/best.onnx</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">File Size:</span>
                  <span>11.2 MB</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Input Tensor:</span>
                  <span>[1, 3, 640, 640] float32</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Output Tensor:</span>
                  <span>[1, 7, 8400] float32</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Marine Sonar V2 Track */}
      {activeSubTab === 'v2' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                Marine Sonar V2 Track (In Development)
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-bold text-amber-300 font-mono">
                Status Notice:
              </p>
              <p>
                The active serving model is the verified <strong>YOLOv8n MILCO/NOMBO baseline</strong>. Marine Sonar V2 is being trained on expanded Side-Scan Sonar benchmarks to incorporate dedicated <strong>PIPELINE</strong>, <strong>DERELICT FISHING GEAR</strong>, and <strong>SHIPWRECK</strong> classes.
              </p>
              <p>
                The training pipeline script (<code className="text-cyan-300">scripts/train_marine_sonar_v2.py</code>) and Google Colab notebook (<code className="text-cyan-300">notebooks/Marine_Sonar_V2_Training_Pipeline.ipynb</code>) are ready for training. Once <code className="text-cyan-300">marine_sonar_v2.onnx</code> is placed in <code className="text-cyan-300">backend/models/</code>, it will be automatically recognized by the engine.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                Planned V2 Target Classes & Data Sources
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-cyan-400 font-bold">Class 0: PIPELINE</p>
                  <p className="text-slate-400 text-[11px]">Source: SubPipe SSS Dataset (1,420 images, bounding box annotations)</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-red-400 font-bold">Class 1: DERELICT FISHING GEAR</p>
                  <p className="text-slate-400 text-[11px]">Source: GhostVision SSS crab pot dataset (2,840 images, ALDFG)</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-amber-400 font-bold">Class 2: SHIPWRECK</p>
                  <p className="text-slate-400 text-[11px]">Source: AI4Shipwrecks (760 images, polygon envelope to bbox conversion)</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-purple-400 font-bold">Class 3: ANTHROPOGENIC ANOMALY</p>
                  <p className="text-slate-400 text-[11px]">Source: SeabedObjects-KLSG man-made subset</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OpenSonarDatasets Catalog */}
      {activeSubTab === 'datasets' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                  Curated OpenSonarDatasets Side-Scan Sonar (SSS) Catalog
                </h3>
                <p className="text-xs text-slate-400">
                  Open-source SSS datasets for underwater robotics, pipelines, ALDFG, and seabed objects
                </p>
              </div>
              <a
                href="https://github.com/remaro-network/OpenSonarDatasets"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>REMARO Network</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#080E1C]/90 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Dataset</th>
                    <th className="py-2.5 px-3">Modality</th>
                    <th className="py-2.5 px-3">Images</th>
                    <th className="py-2.5 px-3">Original Classes</th>
                    <th className="py-2.5 px-3">Target Mapping</th>
                    <th className="py-2.5 px-3">License</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {datasetCatalog && Object.values(datasetCatalog.datasets).map((ds) => (
                    <tr key={ds.id} className="text-slate-300 hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        <a href={ds.source_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          {ds.name}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </td>
                      <td className="py-3 px-3">{ds.sonar_modality}</td>
                      <td className="py-3 px-3 font-bold text-slate-100">{ds.num_images}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        {ds.original_classes.join(', ')}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-cyan-300">
                        {Object.values(ds.target_mapping).join(', ')}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-400">{ds.license}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
