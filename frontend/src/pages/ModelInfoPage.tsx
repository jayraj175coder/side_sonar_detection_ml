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
      .then((data: any) => setDatasetCatalog(data))
      .catch((err: any) => console.warn('Could not fetch datasets catalog:', err));
  }, []);

  return (
    <div className="space-y-8 font-mono select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl glass-panel border border-[#152438] bg-gradient-to-r from-[#0C1A2E]/95 via-[#0A1629]/90 to-[#060D17]/95 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CD9E8]/10 border border-[#4CD9E8]/30 text-[#4CD9E8] text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#4CD9E8]" />
            <span>Ministry of Earth Sciences (MoES) — SIH AI Pipeline</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#EAEFF5] tracking-tight font-sans">
            Side-Scan Sonar Deep Learning Models
          </h2>
          <p className="text-xs md:text-sm text-[#7C8AA0] font-sans leading-relaxed">
            Active YOLOv8n ONNX perception models trained on genuine acoustic backscatter for ghost net detection, underwater debris, and subsea pipelines.
          </p>
        </div>

        <HolographicGlobe size={140} className="shrink-0" />
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#152438] pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab('v2')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'v2'
              ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/40 shadow-sm'
              : 'text-[#7C8AA0] hover:text-[#EAEFF5] bg-[#060D17] border border-[#152438]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#4CD9E8]" />
          <span>Active: SIH Marine Debris V2 (Trained)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('baseline')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'baseline'
              ? 'bg-[#F04438]/20 text-[#F04438] border border-[#F04438]/40 shadow-sm'
              : 'text-[#7C8AA0] hover:text-[#EAEFF5] bg-[#060D17] border border-[#152438]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#F04438]" />
          <span>Baseline Model (MILCO/NOMBO)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('datasets')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'datasets'
              ? 'bg-[#3FD98A]/20 text-[#3FD98A] border border-[#3FD98A]/40 shadow-sm'
              : 'text-[#7C8AA0] hover:text-[#EAEFF5] bg-[#060D17] border border-[#152438]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#3FD98A]" />
          <span>OpenSonarDatasets SSS Catalog</span>
        </button>
      </div>

      {/* TAB 1: SIH Marine Debris V2 Model */}
      {activeSubTab === 'v2' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel space-y-1 border border-[#152438]">
              <p className="text-[10px] font-mono uppercase text-[#7C8AA0]">Mean AP @ 0.50</p>
              <p className="text-2xl font-black text-[#4CD9E8] font-mono">
                78.2%
              </p>
              <p className="text-[10px] text-[#7C8AA0]">mAP50 Validation</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1 border border-[#152438]">
              <p className="text-[10px] font-mono uppercase text-[#7C8AA0]">Ghost Net Precision</p>
              <p className="text-2xl font-black text-[#A855F7] font-mono">
                82.5%
              </p>
              <p className="text-[10px] text-[#7C8AA0]">ALDFG Net Detection</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1 border border-[#152438]">
              <p className="text-[10px] font-mono uppercase text-[#7C8AA0]">Recall (Macro)</p>
              <p className="text-2xl font-black text-[#3FD98A] font-mono">
                83.3%
              </p>
              <p className="text-[10px] text-[#7C8AA0]">Swath Coverage</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1 border border-[#152438]">
              <p className="text-[10px] font-mono uppercase text-[#7C8AA0]">Inference Latency</p>
              <p className="text-2xl font-black text-[#F5A623] font-mono">
                10.2 ms
              </p>
              <p className="text-[10px] text-[#7C8AA0]">Edge Drone Inference</p>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl glass-panel space-y-3 border border-[#152438]">
              <h3 className="text-xs font-black font-mono text-[#EAEFF5] uppercase">
                Per-Class Performance
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#060D17] border border-[#A855F7]/30 space-y-1">
                  <p className="text-[#A855F7] font-bold">Class 0: ghost_net_aldfg (Ghost Nets)</p>
                  <p className="text-[#7C8AA0]">Precision: 82.5% | Recall: 89.0% | mAP50: 84.2%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060D17] border border-[#F5A623]/30 space-y-1">
                  <p className="text-[#F5A623] font-bold">Class 1: anthropogenic_debris (Containers/Drums)</p>
                  <p className="text-[#7C8AA0]">Precision: 74.8% | Recall: 81.2% | mAP50: 77.1%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060D17] border border-[#29B6F6]/30 space-y-1">
                  <p className="text-[#29B6F6] font-bold">Class 2: pipeline_hazard (Subsea Infrastructure)</p>
                  <p className="text-[#7C8AA0]">Precision: 79.5% | Recall: 85.4% | mAP50: 81.0%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060D17] border border-[#4CD9E8]/30 space-y-1">
                  <p className="text-[#4CD9E8] font-bold">Class 3: seafloor_anomaly (Acoustic Shadows)</p>
                  <p className="text-[#7C8AA0]">Precision: 68.9% | Recall: 77.5% | mAP50: 70.4%</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3 border border-[#152438]">
              <h3 className="text-xs font-black font-mono text-[#EAEFF5] uppercase">
                ONNX Deployment Specifications
              </h3>
              <div className="space-y-2 text-xs font-mono text-[#EAEFF5]">
                <div className="flex justify-between p-2 rounded-lg bg-[#060D17]">
                  <span className="text-[#7C8AA0]">Model File:</span>
                  <span className="text-[#4CD9E8] font-bold">backend/models/marine_sonar_v2.onnx</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#060D17]">
                  <span className="text-[#7C8AA0]">File Size:</span>
                  <span>11.7 MB (Slimmed)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#060D17]">
                  <span className="text-[#7C8AA0]">Input Tensor:</span>
                  <span>[1, 3, 640, 640] float32</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#060D17]">
                  <span className="text-[#7C8AA0]">Output Tensor:</span>
                  <span>[1, 8, 8400] float32</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#060D17]">
                  <span className="text-[#7C8AA0]">Execution Provider:</span>
                  <span className="text-[#3FD98A]">CPUExecutionProvider / CUDA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Baseline */}
      {activeSubTab === 'baseline' && (
        <div className="p-6 rounded-2xl glass-panel space-y-4 border border-[#152438]">
          <h3 className="text-sm font-bold font-mono text-[#EAEFF5] uppercase">
            Legacy Baseline Reference (MILCO / NOMBO)
          </h3>
          <p className="text-xs text-[#7C8AA0]">
            Dual-class naval classification architecture for Mine-Like Contacts (MILCO) and Non-Mine Bottom Obstacles (NOMBO).
          </p>
        </div>
      )}

      {/* TAB 3: Datasets */}
      {activeSubTab === 'datasets' && (
        <div className="p-6 rounded-2xl glass-panel space-y-4 border border-[#152438]">
          <h3 className="text-sm font-bold font-mono text-[#EAEFF5] uppercase">
            OpenSonarDatasets SSS Catalog
          </h3>
          <p className="text-xs text-[#7C8AA0]">
            Curated high-resolution 900 kHz side-scan sonar datasets with synthetic and verified seafloor acoustic returns.
          </p>
        </div>
      )}
    </div>
  );
};
