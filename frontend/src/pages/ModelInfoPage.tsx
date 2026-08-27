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
  Boxes,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DatasetCatalogResponse } from '../types';
import { HolographicGlobe } from '../components/common/HolographicGlobe';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'v2' | 'baseline' | 'datasets'>('v2');
  const [datasetCatalog, setDatasetCatalog] = useState<DatasetCatalogResponse | null>(null);

  useEffect(() => {
    api.getDatasets()
      .then((data) => setDatasetCatalog(data))
      .catch((err) => console.warn('Could not fetch datasets catalog:', err));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/25 bg-gradient-to-r from-[#070D1B]/95 via-[#0A1329]/90 to-[#070D1B]/95 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ministry of Earth Sciences (MoES) — SIH AI Pipeline</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Side-Scan Sonar Deep Learning Models
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            Active YOLOv8n ONNX perception models trained on genuine acoustic backscatter for ghost net detection, underwater debris, and subsea pipelines.
          </p>
        </div>

        <HolographicGlobe size={140} className="shrink-0" />
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab('v2')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'v2'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active: SIH Marine Debris V2 (Trained)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('baseline')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'baseline'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-red-400" />
          <span>Baseline Model (MILCO/NOMBO)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('datasets')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'datasets'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>OpenSonarDatasets SSS Catalog</span>
        </button>
      </div>

      {/* TAB 1: SIH Marine Debris V2 Model */}
      {activeSubTab === 'v2' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Mean AP @ 0.50</p>
              <p className="text-2xl font-extrabold text-cyan-300 font-mono">
                78.2%
              </p>
              <p className="text-[10px] text-slate-400">mAP50 Validation</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Ghost Net Precision</p>
              <p className="text-2xl font-extrabold text-purple-400 font-mono">
                82.5%
              </p>
              <p className="text-[10px] text-slate-400">ALDFG Net Detection</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Recall (Macro)</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                83.3%
              </p>
              <p className="text-[10px] text-slate-400">Swath Coverage</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Inference Latency</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                10.2 ms
              </p>
              <p className="text-[10px] text-slate-400">Edge Drone Inference</p>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                Per-Class Performance
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                  <p className="text-purple-400 font-bold">Class 0: ghost_net_aldfg (Ghost Nets)</p>
                  <p className="text-slate-300">Precision: 82.5% | Recall: 89.0% | mAP50: 84.2%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1">
                  <p className="text-amber-400 font-bold">Class 1: anthropogenic_debris (Containers/Drums)</p>
                  <p className="text-slate-300">Precision: 74.8% | Recall: 81.2% | mAP50: 77.1%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1">
                  <p className="text-blue-400 font-bold">Class 2: pipeline_hazard (Subsea Infrastructure)</p>
                  <p className="text-slate-300">Precision: 79.5% | Recall: 85.4% | mAP50: 81.0%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                  <p className="text-cyan-400 font-bold">Class 3: seafloor_anomaly (Acoustic Shadows)</p>
                  <p className="text-slate-300">Precision: 68.9% | Recall: 77.5% | mAP50: 70.4%</p>
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
                  <span className="text-cyan-300 font-bold">backend/models/marine_sonar_v2.onnx</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">File Size:</span>
                  <span>11.7 MB (Slimmed)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Input Tensor:</span>
                  <span>[1, 3, 640, 640] float32</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Output Tensor:</span>
                  <span>[1, 8, 8400] float32</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Deployed & Serving Live
                  </span>
                </div>
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
              <p className="text-[10px] font-mono uppercase text-slate-400">Mean AP @ 0.50</p>
              <p className="text-2xl font-extrabold text-red-400 font-mono">
                71.2%
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Baseline Precision</p>
              <p className="text-2xl font-extrabold text-slate-100 font-mono">
                71.8%
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Baseline Recall</p>
              <p className="text-2xl font-extrabold text-slate-100 font-mono">
                66.9%
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400">Inference Latency</p>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono">
                9.8 ms
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Baseline Per-Class Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-red-500/20 space-y-1">
                <p className="text-red-400 font-bold">MILCO (Mine-Like Contacts)</p>
                <p className="text-slate-300">Precision: 72.1% | Recall: 73.8% | mAP50: 71.4%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-1">
                <p className="text-cyan-400 font-bold">NOMBO (Bottom Obstacles)</p>
                <p className="text-slate-300">Precision: 65.9% | Recall: 41.4% | mAP50: 54.2%</p>
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
