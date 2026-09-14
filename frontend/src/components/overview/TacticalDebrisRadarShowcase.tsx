import React, { useState, useEffect } from 'react';
import {
  Waves,
  Radio,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Target,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DebrisTargetSpec {
  id: string;
  name: string;
  category: 'GHOST_NET' | 'PIPELINE' | 'DEBRIS' | 'ANOMALY';
  color: string;
  accentBg: string;
  confidence: number;
  depthM: number;
  dimensions: string;
  shadowLength: string;
  angleDeg: number;
  radiusPercent: number;
  description: string;
}

const DEBRIS_TARGETS: DebrisTargetSpec[] = [
  {
    id: 'TRG-01',
    name: 'Ghost Fishing Net (ALDFG)',
    category: 'GHOST_NET',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.15)',
    confidence: 0.995,
    depthM: 38.4,
    dimensions: '14.2m × 6.8m',
    shadowLength: '12.4m Acoustic Shadow',
    angleDeg: 45,
    radiusPercent: 36,
    description: 'Entangled monofilament trawl net snagged on coral outcrop with distinct trailing acoustic backscatter plumes.',
  },
  {
    id: 'TRG-02',
    name: 'Exposed Subsea Pipeline Hazard',
    category: 'PIPELINE',
    color: '#06B6D4',
    accentBg: 'rgba(6, 182, 212, 0.15)',
    confidence: 0.995,
    depthM: 64.2,
    dimensions: '42.0m × 1.2m',
    shadowLength: '8.6m Trench Relief',
    angleDeg: 140,
    radiusPercent: 32,
    description: 'Crude transmission transmission pipe segment unburied by scouring currents; free-spanning structural vulnerability.',
  },
  {
    id: 'TRG-03',
    name: 'Anthropogenic Industrial Debris',
    category: 'DEBRIS',
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    confidence: 0.884,
    depthM: 42.1,
    dimensions: '6.1m × 2.4m (ISO 20ft)',
    shadowLength: '7.8m Box Shadow',
    angleDeg: 230,
    radiusPercent: 40,
    description: 'Sunken steel intermodal container with right-angle corner specular echoes and abrupt sediment depression.',
  },
  {
    id: 'TRG-04',
    name: 'Seafloor Geological Anomaly',
    category: 'ANOMALY',
    color: '#A855F7',
    accentBg: 'rgba(168, 85, 247, 0.15)',
    confidence: 0.912,
    depthM: 112.5,
    dimensions: '18.4m × 11.0m',
    shadowLength: '16.2m Basalt Vent',
    angleDeg: 310,
    radiusPercent: 44,
    description: 'Hydrothermal chimney basalt formation distinguished from anthropogenic structures via natural edge gradient analysis.',
  },
];

export const TacticalDebrisRadarShowcase: React.FC = () => {
  const { setActiveTab } = useApp();
  const [selectedTarget, setSelectedTarget] = useState<DebrisTargetSpec>(DEBRIS_TARGETS[0]);
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 60, 30, 75, 90, 40, 65, 80, 50, 35, 70, 85, 40, 25]);

  // Rhythmically animate acoustic waveform bars
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(15 + Math.random() * 80))
      );
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative p-5 md:p-8 rounded-3xl bg-[#050D18]/90 border border-[#122A42] shadow-[0_0_60px_rgba(0,212,170,0.08)] backdrop-blur-xl overflow-hidden font-mono text-xs select-none space-y-6">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4AA]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#06B6D4]/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#122A42] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00D4AA]/15 border border-[#00D4AA]/40 flex items-center justify-center text-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.3)]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#EAEFF5] uppercase tracking-wider">
              Autonomous Marine Debris Holographic Radar
            </h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40">
              YOLOv8s LIVE INFERENCE
            </span>
          </div>
          <p className="text-[11px] text-[#8CA6B8] font-sans">
            Real-time classification of subsea threats, lost fishing gear (ALDFG), pipelines, and seafloor anomalies from high-frequency side-scan sonar.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scan')}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00D4AA] hover:bg-[#00baa0] text-[#030B14] font-black text-xs transition-all shadow-lg shadow-[rgba(0,212,170,0.25)] cursor-pointer"
        >
          <span>TEST LIVE INGESTION</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Left Rotating Radar + Right Target Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Rotating Sonar Radar (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-cyan-500/30 flex items-center justify-center bg-[#030914]/80 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            {/* Concentric Range Rings */}
            <div className="absolute w-3/4 h-3/4 rounded-full border border-cyan-500/20 flex items-start justify-center pt-1">
              <span className="text-[7px] text-cyan-500/60 font-bold bg-[#030914] px-1 rounded">200m</span>
            </div>
            <div className="absolute w-1/2 h-1/2 rounded-full border border-cyan-500/20 flex items-start justify-center pt-1">
              <span className="text-[7px] text-cyan-500/60 font-bold bg-[#030914] px-1 rounded">100m</span>
            </div>
            <div className="absolute w-1/4 h-1/4 rounded-full border border-cyan-500/25" />

            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/20 -translate-x-1/2" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-500/20 -translate-y-1/2" />

            {/* Rotating 360° Radar Conic Beam */}
            <div
              className="absolute inset-0 rounded-full origin-center animate-spin pointer-events-none"
              style={{
                animationDuration: '4s',
                animationTimingFunction: 'linear',
                background:
                  'conic-gradient(from 0deg, rgba(0,212,170,0.3) 0deg, rgba(0,212,170,0.06) 50deg, transparent 90deg, transparent 360deg)',
              }}
            />

            {/* 4 Clickable Debris Blips */}
            {DEBRIS_TARGETS.map((target) => {
              const rad = (target.angleDeg * Math.PI) / 180;
              const xPercent = 50 + target.radiusPercent * Math.cos(rad);
              const yPercent = 50 + target.radiusPercent * Math.sin(rad);
              const isSelected = selectedTarget.id === target.id;

              return (
                <button
                  key={target.id}
                  onClick={() => setSelectedTarget(target)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 z-20"
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  title={`${target.name} (${(target.confidence * 100).toFixed(1)}%)`}
                >
                  <div className="relative flex items-center justify-center">
                    {isSelected && (
                      <div
                        className="absolute w-8 h-8 rounded-full animate-ping"
                        style={{ backgroundColor: target.color, opacity: 0.35 }}
                      />
                    )}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${
                        isSelected ? 'scale-125' : ''
                      }`}
                      style={{
                        backgroundColor: '#030914',
                        borderColor: target.color,
                        boxShadow: `0 0 12px ${target.color}`,
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: target.color }} />
                    </div>

                    {/* Tag pill */}
                    <span
                      className={`absolute top-5 px-1.5 py-0.5 rounded text-[7px] font-black whitespace-nowrap shadow-md transition-all ${
                        isSelected
                          ? 'opacity-100 bg-[#030914] border'
                          : 'opacity-0 group-hover:opacity-100 bg-[#030914]/90 border border-[#122A42]'
                      }`}
                      style={{
                        borderColor: target.color,
                        color: target.color,
                      }}
                    >
                      {target.id} · {(target.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Center Core Transducer */}
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#05121F] border-2 border-[#00D4AA] flex items-center justify-center text-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.8)]">
              <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-[9px] text-[#8CA6B8]">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-ping" />
            <span>Interactive: Click blips to inspect acoustic dossier</span>
          </div>
        </div>

        {/* Right Column: Selected Target Tactical Dossier & Acoustic Spectrogram (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Title & Confidence Pill */}
          <div className="p-4 rounded-2xl bg-[#071322] border border-[#152E48] space-y-2 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
              style={{ backgroundColor: selectedTarget.accentBg }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded border"
                style={{
                  color: selectedTarget.color,
                  borderColor: `${selectedTarget.color}60`,
                  backgroundColor: `${selectedTarget.color}15`,
                }}
              >
                TARGET ID: {selectedTarget.id}
              </span>

              <span
                className="text-[9px] font-black px-2.5 py-0.5 rounded-full border shadow-md font-mono"
                style={{
                  color: selectedTarget.color,
                  borderColor: selectedTarget.color,
                  backgroundColor: '#030914',
                }}
              >
                YOLOv8 CONFIDENCE: {(selectedTarget.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <h3 className="text-base font-black text-[#FFFFFF] tracking-wide">
              {selectedTarget.name}
            </h3>

            <p className="text-[11px] text-[#8CA6B8] font-sans leading-relaxed">
              {selectedTarget.description}
            </p>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#152E48] text-[9px]">
              <div className="p-2 rounded bg-[#030914] border border-[#152E48]">
                <span className="text-[8px] text-[#64748B] block">SOUNDING DEPTH</span>
                <strong className="text-cyan-300 font-bold">{selectedTarget.depthM} Meters</strong>
              </div>
              <div className="p-2 rounded bg-[#030914] border border-[#152E48]">
                <span className="text-[8px] text-[#64748B] block">FOOTPRINT (L × W)</span>
                <strong className="text-emerald-300 font-bold">{selectedTarget.dimensions}</strong>
              </div>
              <div className="p-2 rounded bg-[#030914] border border-[#152E48]">
                <span className="text-[8px] text-[#64748B] block">ACOUSTIC SHADOW</span>
                <strong className="text-amber-300 font-bold">{selectedTarget.shadowLength}</strong>
              </div>
            </div>
          </div>

          {/* Real-time Acoustic Pulse Spectrogram Visualizer */}
          <div className="p-3.5 rounded-2xl bg-[#071322] border border-[#152E48] space-y-2">
            <div className="flex items-center justify-between text-[9px] text-[#8CA6B8]">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Waves className="w-3.5 h-3.5 animate-pulse" />
                <span>ACOUSTIC BACKSCATTER FREQUENCY RESPONSE (900 kHz CHIRP)</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">30 PINGS/SEC</span>
            </div>

            {/* Animated Audio Equalizer Bars */}
            <div className="flex items-end justify-between h-12 gap-1 px-2 pt-2 bg-[#030914] rounded-xl border border-[#152E48] overflow-hidden">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-150"
                  style={{
                    height: `${h}%`,
                    backgroundColor:
                      h > 70 ? selectedTarget.color : h > 40 ? '#00D4AA' : '#06B6D4',
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quick 4-Class Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEBRIS_TARGETS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTarget(t)}
                className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTarget.id === t.id
                    ? 'border-2 shadow-lg'
                    : 'bg-[#050D18] border-[#152E48] hover:border-cyan-500/40 text-[#8CA6B8]'
                }`}
                style={{
                  borderColor: selectedTarget.id === t.id ? t.color : undefined,
                  backgroundColor: selectedTarget.id === t.id ? `${t.color}15` : undefined,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-[9px] font-bold text-[#FFFFFF] truncate">{t.id}</span>
                </div>
                <div className="text-[8px] text-[#8CA6B8] truncate mt-0.5">{t.name.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
