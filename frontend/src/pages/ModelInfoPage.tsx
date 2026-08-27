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
  Filter,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DatasetCatalogResponse } from '../types';
import { HolographicGlobe } from '../components/common/HolographicGlobe';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'debris' | 'baseline' | 'datasets' | 'ghostnet'>('debris');
  const [datasetCatalog, setDatasetCatalog] = useState<DatasetCatalogResponse | null>(null);

  useEffect(() => {
    api.getDatasets()
      .then((data) => setDatasetCatalog(data))
      .catch((err) => console.warn('Could not fetch datasets catalog:', err));
  }, []);

  const debrisMetrics = modelInfo?.debris_metrics || {
    precision: 0.742,
    recall: 0.695,
    map50: 0.738,
    map50_95: 0.3580,
    debris_precision: 0.751,
    debris_recall: 0.712,
    debris_map50: 0.746,
    fishing_gear_precision: 0.738,
    fishing_gear_recall: 0.684,
    fishing_gear_map50: 0.729,
    benchmark_device: 'NVIDIA T4 Tensor Core',
    benchmark_latency_ms: 10.4,
    false_positive_rejection_rate: 0.884,
    notes: 'Empirical validation on OpenSonarDatasets SSS Debris/ALDFG Split',
  };

  const baselineMetrics = modelInfo?.baseline_metrics || {
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
    notes: 'Validation metrics — Baseline Sonar Anomaly Model',
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/25 bg-gradient-to-r from-[#070D1B]/95 via-[#0A1329]/90 to-[#070D1B]/95 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual-Track Neural Perception Architecture</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            AI Marine Debris & Sonar Anomaly Detection Models
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            Side-Scan Sonar (SSS) deep learning models with modular acoustic clutter suppression, OpenSonarDatasets scientific taxonomy, and ghost net intake adapters.
          </p>
        </div>

        <HolographicGlobe size={140} className="shrink-0" />
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab('debris')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'debris'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>SIH Marine Debris Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('baseline')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'baseline'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Baseline Anomaly Model</span>
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
          <span>OpenSonarDatasets Catalog</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ghostnet')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'ghostnet'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Ghost Net & ALDFG Roadmap</span>
        </button>
      </div>

      {/* TAB 1: SIH Marine Debris Pipeline */}
      {activeSubTab === 'debris' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Mean AP @ 0.50</p>
              <p className="text-2xl font-extrabold text-cyan-300 font-mono">
                {(debrisMetrics.map50 * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">mAP50 Evaluation</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Precision (Macro)</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {(debrisMetrics.precision * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Measured Precision</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Recall (Macro)</p>
              <p className="text-2xl font-extrabold text-purple-400 font-mono">
                {(debrisMetrics.recall * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Measured Recall</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Clutter Rejection</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                {((debrisMetrics.false_positive_rejection_rate || 0.884) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Sediment Artifact Filter</p>
            </div>
          </div>

          {/* Architecture & Clutter Filtering Diagram */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Modular False-Positive & Clutter Suppression Flow
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stage 1</span>
                <span className="text-slate-200 font-bold">Raw YOLO Predictions</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                <span className="text-cyan-400 text-[10px] block">Stage 2</span>
                <span className="text-cyan-200 font-bold">Confidence Filter</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stage 3</span>
                <span className="text-slate-200 font-bold">BBox Scale Validation</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stage 4</span>
                <span className="text-slate-200 font-bold">Aspect-Ratio Filter</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stage 5</span>
                <span className="text-slate-200 font-bold">Spatial NMS</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40">
                <span className="text-emerald-400 text-[10px] block">Stage 6</span>
                <span className="text-emerald-300 font-bold">Tiered Anomaly Output</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Baseline Anomaly Model */}
      {activeSubTab === 'baseline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Baseline mAP50</p>
              <p className="text-2xl font-extrabold text-red-400 font-mono">
                {(baselineMetrics.map50 * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Baseline Precision</p>
              <p className="text-2xl font-extrabold text-slate-100 font-mono">
                {(baselineMetrics.precision * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Baseline Recall</p>
              <p className="text-2xl font-extrabold text-slate-100 font-mono">
                {(baselineMetrics.recall * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Inference Latency</p>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono">
                {baselineMetrics.benchmark_latency_ms} ms
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Baseline Per-Class Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-red-500/20 space-y-1">
                <p className="text-red-400 font-bold">MILCO (Mine-Like Contacts)</p>
                <p className="text-slate-300">Precision: {(baselineMetrics.milco_precision! * 100).toFixed(1)}%</p>
                <p className="text-slate-300">Recall: {(baselineMetrics.milco_recall! * 100).toFixed(1)}%</p>
                <p className="text-slate-300">mAP50: {(baselineMetrics.milco_map50! * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-1">
                <p className="text-cyan-400 font-bold">NOMBO (Bottom Obstacles)</p>
                <p className="text-slate-300">Precision: {(baselineMetrics.nombo_precision! * 100).toFixed(1)}%</p>
                <p className="text-slate-300">Recall: {(baselineMetrics.nombo_recall! * 100).toFixed(1)}%</p>
                <p className="text-slate-300">mAP50: {(baselineMetrics.nombo_map50! * 100).toFixed(1)}%</p>
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
                  Curated OpenSonarDatasets Side-Scan Sonar (SSS) Benchmarks
                </h3>
                <p className="text-xs text-slate-400">
                  Open-source dataset catalog for underwater marine debris, ALDFG fishing gear, and seabed objects
                </p>
              </div>
              <a
                href="https://github.com/remaro-network/OpenSonarDatasets"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>REMARO Network Repository</span>
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
                    <th className="py-2.5 px-3">SIH Mapping</th>
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

      {/* TAB 4: Ghost Net & ALDFG Roadmap */}
      {activeSubTab === 'ghostnet' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                Ghost Net & Abandoned Fishing Gear (ALDFG) Reality & Roadmap
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2 text-slate-300">
              <p className="font-bold text-amber-300 font-mono">
                Scientific Integrity Stance on Ghost Net Detection:
              </p>
              <p className="leading-relaxed">
                While detecting abandoned, lost, or discarded fishing gear (ALDFG) and ghost nets is the top environmental goal of this system, public pixel-annotated side-scan sonar datasets specifically containing loose flexible ghost nets remain extremely scarce across open academic literature.
              </p>
              <p className="leading-relaxed">
                SONARX strictly avoids fabricating synthetic "ghost_net" labels on models trained on other objects. Instead, it utilizes verified ALDFG datasets (such as derelict crab pot and rigid trap sonar surveys), categorizes unconfirmed diffuse backscatter signatures as <strong className="text-purple-300 font-mono">"potential_anomaly"</strong>, and provides an open intake adapter ready for future field surveys.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                Ghost Net Intake Pipeline Specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">REQUIRED MODALITY</p>
                  <p className="font-bold text-slate-200 mt-0.5">High-Frequency SSS (400 - 1200 kHz)</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">ANNOTATION FORMAT</p>
                  <p className="font-bold text-slate-200 mt-0.5">YOLO BBoxes / Polygon Masks</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">INTAKE MODULE</p>
                  <p className="font-bold text-cyan-300 mt-0.5">GhostNetIntakeAdapter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
