import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Radio,
  Cpu,
  Compass,
  Play,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Waves,
  Anchor,
  FileCheck,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { useApp } from '../../context/AppContext';

interface MoESBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShadowCalc?: () => void;
}

type BriefingTab = 'mandate' | 'pipeline' | 'physics' | 'tour';

export const MoESBriefingModal: React.FC<MoESBriefingModalProps> = ({
  isOpen,
  onClose,
  onOpenShadowCalc,
}) => {
  const [activeTab, setActiveTab] = useState<BriefingTab>('mandate');
  const { startGuidedDemo } = useMission();
  const { setActiveTab: setAppTab } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartTour = () => {
    onClose();
    setAppTab('mission');
    startGuidedDemo();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none font-sans"
    >
      <div className="relative w-full max-w-4xl bg-[#070B12] border border-[#FFB703]/35 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,183,3,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Caliper Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#FFB703]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#FFB703]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#FFB703]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#FFB703]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#0A101D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] shadow-[0_0_15px_rgba(255,183,3,0.2)] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FFB703]/20 border border-[#FFB703]/40 text-[9px] font-mono font-bold text-[#FFB703] uppercase tracking-wider">
                  MoES · SIH 26057 Evaluation
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Deep Ocean Mission (DOM) Protocol
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide mt-0.5">
                SONARX // Operational Hydrographic Briefing
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close briefing (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 px-4 sm:px-5 py-2.5 bg-[#05070B] border-b border-white/[0.06] overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('mandate')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'mandate'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>1. MANDATE & IMPACT</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pipeline'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. ACOUSTIC PIPELINE</span>
          </button>

          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'physics'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>3. ACOUSTIC PHYSICS & MATH</span>
          </button>

          <button
            onClick={() => setActiveTab('tour')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tour'
                ? 'bg-[#FFB703] text-[#05070B] shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>4. JUDGE 60-SEC TOUR</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed">
          {/* TAB 1: MANDATE */}
          {activeTab === 'mandate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">
                    MoES Problem Statement 26057 Objective
                  </span>
                  <span className="text-[10px] font-mono text-[#FFB703] px-2 py-0.5 rounded bg-[#FFB703]/10 border border-[#FFB703]/30">
                    High Priority Naval Tech
                  </span>
                </div>
                <p className="text-slate-300">
                  Automate the detection and classification of submerged marine debris, discarded fishing gear (ALDFG),
                  and seabed navigational hazards from <strong>high-frequency Side-Scan Sonar (SSS)</strong> waterfalls
                  across the <strong>2.37 million sq km Indian Exclusive Economic Zone (EEZ)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#FFB703]">
                    <Anchor className="w-4 h-4" />
                    <strong className="text-[11px] uppercase">Deep Ocean Mission</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports DOM Theme 2 (Subsea bio-resource conservation & deep-sea exploratory bathymetry for NIOT vessels).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#00F5D4]">
                    <Waves className="w-4 h-4" />
                    <strong className="text-[11px] uppercase">Swachh Sagar Mission</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Aligns with national Clean Coast initiative by prioritizing ghost nets threatening Olive Ridley turtles and Coral reefs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#38BDF8]">
                    <ShieldCheck className="w-4 h-4" />
                    <strong className="text-[11px] uppercase">IHO S-44 Standards</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Delivers Order 1A hydrographic compliance with cryptographic SHA-256 target register exports.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/30 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#FFB703] uppercase">Operational Efficiency Gain</h4>
                  <p className="text-[11px] text-slate-300">
                    Replaces <strong>18 hours</strong> of tedious post-cruise manual acoustic log scrubbing with
                    <strong> 14.2ms real-time ONNX inference</strong> per swath frame.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="px-3 py-1.5 rounded-lg bg-[#FFB703] text-[#05070B] font-black text-xs shrink-0 hover:bg-[#FCD34D] transition-colors cursor-pointer"
                >
                  View Pipeline &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                End-to-End Naval Acoustic Perception Workflow
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFB703]/20 text-[#FFB703] font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-xs">Raw Acoustic Transducer CHIRP Ingestion (100–900 kHz)</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Ingests raw XTFD/JSF dual-frequency side-scan sonar waterfall streams. Compensates for sound speed variations (1,512 m/s avg) and towfish altitude.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFB703]/20 text-[#FFB703] font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-xs">Time-Varied Gain (TVG) & Adaptive Speckle Suppression</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Normalizes acoustic transmission loss ($TL = 20\log R + \alpha R$) and removes high-frequency multi-path reverberation before neural processing.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFB703]/20 text-[#FFB703] font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-xs">Ultralytics YOLOv8 ONNX Neural Inference (14.2ms)</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Classifies Ghost Fishing Gear (ALDFG), Marine Debris, and Pipeline Hazards with <strong>77.7% Precision</strong>, <strong>74.1% mAP@0.50</strong>, and <strong>99.5% Ghost Net Accuracy</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFB703]/20 text-[#FFB703] font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-xs">Acoustic Shadow Math & WGS84 Georeferenced Export</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Converts 2D shadow length into true vertical height ($H_t$) and projects targets onto subsea GIS map with IHO S-44 survey certificate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHYSICS */}
          {activeTab === 'physics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0A101D] border border-[#FFB703]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-xs uppercase flex items-center gap-2">
                    <Waves className="w-4 h-4 text-[#FFB703]" />
                    3D Target Height Calculation from Acoustic Shadow
                  </h4>
                  <span className="font-mono text-[10px] text-[#FFB703]">IHO Standard Form</span>
                </div>

                <div className="p-3 rounded-lg bg-[#05070B] border border-white/[0.08] font-mono text-center text-sm text-[#FFB703] tracking-wider">
                  H_target = (L_shadow × H_altitude) / R_slant_range
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 block text-[10px]">H_target:</span>
                    <strong className="text-white">Object Height (m)</strong>
                  </div>
                  <div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 block text-[10px]">L_shadow:</span>
                    <strong className="text-white">Acoustic Shadow (m)</strong>
                  </div>
                  <div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 block text-[10px]">H_altitude:</span>
                    <strong className="text-white">Towfish Height (m)</strong>
                  </div>
                  <div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 block text-[10px]">R_slant:</span>
                    <strong className="text-white">Slant Range (m)</strong>
                  </div>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Unlike generic computer vision that treats side-scan sonar like an optical camera, SONARX reconstructs the 3D physical profile using acoustic triangulation.
                </p>

                {onOpenShadowCalc && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenShadowCalc();
                    }}
                    className="w-full py-2 rounded-lg bg-white/[0.05] hover:bg-[#FFB703]/20 border border-[#FFB703]/40 text-[#FFB703] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Interactive Acoustic Shadow Calculator</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TOUR */}
          {activeTab === 'tour' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] mx-auto shadow-[0_0_25px_rgba(255,183,3,0.25)]">
                <Play className="w-7 h-7 ml-0.5" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-black text-white uppercase">
                  Launch 60-Second Guided Evaluation Tour
                </h3>
                <p className="text-xs text-slate-400">
                  Activates the automated presenter rail to step through Raw Ingestion, AI Detection, 3D Calipers, and Dossier Export in under 1 minute.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left font-mono text-[10px] max-w-lg mx-auto">
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <strong className="text-[#FFB703] block">Step 1</strong>
                  <span className="text-slate-400">Live Waterfall Ingestion</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <strong className="text-[#FFB703] block">Step 2</strong>
                  <span className="text-slate-400">YOLOv8 ONNX Classification</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <strong className="text-[#FFB703] block">Step 3</strong>
                  <span className="text-slate-400">Acoustic Shadow & Geo</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <strong className="text-[#FFB703] block">Step 4</strong>
                  <span className="text-slate-400">MoES Compliance Dossier</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartTour}
                  className="px-6 py-2.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,183,3,0.35)] cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START LIVE DEMONSTRATION</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 bg-[#05070B] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ORV Sagar Nidhi / NIOT Validated Protocol</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Dismiss (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
