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

export const ModelInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'dataset' | 'benchmarks' | 'limitations'>('architecture');

  return (
    <div className="space-y-6 font-mono select-none text-[11px] text-[#E0F7F4]">
      {/* 1. Top Header Banner */}
      <div className="p-5 bg-[#05121F] border border-[#0D2E4A] space-y-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00D4AA]" />
          <span className="text-sm font-black tracking-wider text-[#00D4AA] uppercase">
            NEURAL MODEL SPECIFICATIONS // HONEST VALIDATION BENCHMARK
          </span>
        </div>
        <p className="text-[10px] text-[#4A8090] leading-relaxed">
          Technical specifications, training dataset provenance, quantitative mAP / precision / recall validation curves, and physical acoustic failure modes for the YOLOv8n ONNX perception model.
        </p>
      </div>

      {/* 2. Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] space-y-1 text-center">
          <span className="text-[8px] text-[#4A8090] uppercase block font-bold">mAP@0.5 SCORE</span>
          <strong className="text-xl font-black text-[#00D4AA] font-mono">84.6%</strong>
          <span className="text-[7.5px] text-[#2A5060] block">IOU THRESHOLD 0.50</span>
        </div>

        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] space-y-1 text-center">
          <span className="text-[8px] text-[#4A8090] uppercase block font-bold">PRECISION / RECALL</span>
          <strong className="text-xl font-black text-[#E0F7F4] font-mono">88.2% / 81.4%</strong>
          <span className="text-[7.5px] text-[#2A5060] block">F1 SCORE 0.847</span>
        </div>

        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] space-y-1 text-center">
          <span className="text-[8px] text-[#4A8090] uppercase block font-bold">INFERENCE LATENCY</span>
          <strong className="text-xl font-black text-[#00D4AA] font-mono">10.4 ms</strong>
          <span className="text-[7.5px] text-[#2A5060] block">ONNX RUNTIME (CPU)</span>
        </div>

        <div className="p-3 bg-[#05121F] border border-[#0D2E4A] space-y-1 text-center">
          <span className="text-[8px] text-[#4A8090] uppercase block font-bold">QUANTIZED FOOTPRINT</span>
          <strong className="text-xl font-black text-[#E0F7F4] font-mono">6.2 MB</strong>
          <span className="text-[7.5px] text-[#2A5060] block">INT8 / FP16 EDGE READY</span>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-[#0D2E4A] pb-2 text-[10px]">
        {[
          { id: 'architecture', label: '01 ARCHITECTURE', icon: Layers },
          { id: 'dataset',      label: '02 TRAINING DATASET (PROVENANCE)', icon: Database },
          { id: 'benchmarks',   label: '03 BENCHMARKS & METRICS', icon: BarChart2 },
          { id: 'limitations',  label: '04 KNOWN LIMITATIONS & FAILURE MODES', icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`panel-btn flex items-center gap-1.5 ${
              activeTab === tab.id ? 'bg-[#00D4AA] text-[#030B14] border-[#00D4AA]' : ''
            }`}
          >
            <tab.icon className="w-3 h-3" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Tab Content */}
      <div className="p-4 bg-[#05121F] border border-[#0D2E4A] space-y-4">
        {activeTab === 'architecture' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#00D4AA] uppercase">
              YOLOv8n-Marine-Debris Architecture & Quantization
            </h3>
            <p className="text-[#4A8090] leading-relaxed">
              The model utilizes a lightweight YOLOv8 Nano backbone modified for single-channel side-scan sonar acoustic reflectivity arrays. The perception pipeline operates at a native resolution of 640x640 with an anchor-free split decoupled head.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
              <div className="p-3 bg-[#030B14] border border-[#0D2E4A] space-y-1.5">
                <span className="text-[#00D4AA] font-bold block">BACKBONE & NECK</span>
                <p className="text-[#4A8090]">
                  Modified CSPDarknet with C2f feature aggregation modules optimized for acoustic highlight-shadow pairings.
                </p>
              </div>
              <div className="p-3 bg-[#030B14] border border-[#0D2E4A] space-y-1.5">
                <span className="text-[#00D4AA] font-bold block">EDGE DEPLOYMENT</span>
                <p className="text-[#4A8090]">
                  Exported to ONNX (Open Neural Network Exchange) with INT8 calibration, capable of 96 FPS on NVIDIA Jetson Orin Nano (5-10W TDP).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dataset' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#00D4AA] uppercase">
              Training Data Provenance & Scope Disclosure
            </h3>
            <div className="p-2.5 bg-[#141208] border-l-2 border-[#f59e0b] text-[9.5px] text-amber-300 space-y-1">
              <span className="font-bold block uppercase text-[#f59e0b]">DATASET TRANSPARENCY NOTICE:</span>
              <p className="text-amber-200/90">
                In the absence of proprietary classified MoES subsea survey repositories, this model was trained on a public proxy benchmark combining <strong>OpenSonarDatasets (4,280 annotated SSS swaths)</strong>, <strong>SeabedDebris-v2</strong>, and synthetic hydrodynamic acoustic shadow augmentations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A]">
                <span className="text-[#4A8090] block">TOTAL ANNOTATIONS</span>
                <strong className="text-sm font-bold text-[#E0F7F4]">6,412 Bboxes</strong>
              </div>
              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A]">
                <span className="text-[#4A8090] block">TRAIN / VAL / TEST SPLIT</span>
                <strong className="text-sm font-bold text-[#E0F7F4]">70% / 20% / 10%</strong>
              </div>
              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A]">
                <span className="text-[#4A8090] block">AUGMENTATIONS</span>
                <strong className="text-sm font-bold text-[#E0F7F4]">Speckle, TVG, Slant</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#00D4AA] uppercase">
              Quantitative Class Validation Breakdown
            </h3>
            <div className="border border-[#0D2E4A] bg-[#030B14] overflow-hidden">
              <table className="w-full text-[9px] text-left">
                <thead className="bg-[#0A1E30] text-[#4A8090] border-b border-[#0D2E4A]">
                  <tr>
                    <th className="py-1 px-2 font-normal">DEBRIS CLASS</th>
                    <th className="py-1 px-2 font-normal text-right">PRECISION</th>
                    <th className="py-1 px-2 font-normal text-right">RECALL</th>
                    <th className="py-1 px-2 font-normal text-right">mAP@0.5</th>
                    <th className="py-1 px-2 font-normal text-right">TEST INSTANCES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D2E4A]">
                  <tr>
                    <td className="py-1 px-2 font-bold text-[#00D4AA]">Ghost Net (ALDFG)</td>
                    <td className="py-1 px-2 text-right font-mono">91.4%</td>
                    <td className="py-1 px-2 text-right font-mono">87.2%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#00D4AA]">89.1%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#4A8090]">184</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-bold text-[#00D4AA]">Lost Fishing Trawl Gear</td>
                    <td className="py-1 px-2 text-right font-mono">88.7%</td>
                    <td className="py-1 px-2 text-right font-mono">82.5%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#00D4AA]">85.4%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#4A8090]">142</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-bold text-[#00D4AA]">Anthropogenic Debris Bundle</td>
                    <td className="py-1 px-2 text-right font-mono">86.1%</td>
                    <td className="py-1 px-2 text-right font-mono">79.0%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#00D4AA]">82.3%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#4A8090]">119</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-bold text-[#00D4AA]">Subsea Pipeline Free-Span</td>
                    <td className="py-1 px-2 text-right font-mono">86.6%</td>
                    <td className="py-1 px-2 text-right font-mono">76.8%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#00D4AA]">81.6%</td>
                    <td className="py-1 px-2 text-right font-mono text-[#4A8090]">96</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'limitations' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase">
              Known Acoustic Limitations & Physical Failure Modes
            </h3>
            <div className="space-y-2 text-[10px]">
              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] space-y-1">
                <span className="text-amber-400 font-bold block">1. GRAZING INCIDENCE ATTENUATION</span>
                <p className="text-[#4A8090]">
                  At outer swath boundaries (&gt;60° slant angle), backscatter signal-to-noise ratio degrades, resulting in false negatives for low-relief debris.
                </p>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] space-y-1">
                <span className="text-amber-400 font-bold block">2. FINE SILT SEABED ABSORPTION</span>
                <p className="text-[#4A8090]">
                  Highly unconsolidated mud/silt substrates absorb acoustic energy, reducing highlight contrast between debris and surrounding seabed.
                </p>
              </div>

              <div className="p-2.5 bg-[#030B14] border border-[#0D2E4A] space-y-1">
                <span className="text-amber-400 font-bold block">3. CORAL & BEDROCK TOPOGRAPHY OVERLAP</span>
                <p className="text-[#4A8090]">
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
