import React from 'react';
import {
  Sliders,
  MapPin,
  Cpu,
  Play,
  CheckCircle2,
  Filter,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ConfigPanelProps {
  confidence: number;
  setConfidence: (val: number) => void;
  latitude: string;
  setLatitude: (val: string) => void;
  longitude: string;
  setLongitude: (val: string) => void;
  selectedModelVersion?: 'v2' | 'baseline';
  setSelectedModelVersion?: (v: 'v2' | 'baseline') => void;
  noiseFilteringEnabled?: boolean;
  setNoiseFilteringEnabled?: (val: boolean) => void;
  hasPingLog?: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasFile: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  confidence,
  setConfidence,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  selectedModelVersion = 'v2',
  setSelectedModelVersion,
  noiseFilteringEnabled = true,
  setNoiseFilteringEnabled,
  hasPingLog = false,
  onAnalyze,
  isAnalyzing,
  hasFile,
}) => {
  const { modelInfo } = useApp();

  const handleApplyPresetCoords = (lat: number, lon: number) => {
    setLatitude(lat.toString());
    setLongitude(lon.toString());
  };

  const isV2 = selectedModelVersion === 'v2';

  return (
    <div className="space-y-5 p-6 rounded-3xl subpixel-card border border-white/[0.08] font-mono select-none shadow-2xl">
      {/* Title & Architecture Tag */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5 text-xs font-black text-white uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-[#FFB703]" />
          <span>Inference Parameters</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/30">
          ONNX Runtime
        </span>
      </div>

      {/* Model Selection Track Cards */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400 flex items-center justify-between">
          <span>AI Model Track</span>
          <span className="text-[10px] text-[#FFB703]">MoES / SIH 2026</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedModelVersion && setSelectedModelVersion('v2')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              isV2
                ? 'bg-[#FFB703]/10 border-[#FFB703]/60 text-[#FFB703] shadow-md ring-1 ring-[#FFB703]/30'
                : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-[#FFB703]">SIH Marine Debris V2</span>
              {isV2 && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB703]" />}
            </div>
            <p className="text-[9px] text-slate-400 font-mono leading-tight">
              Ghost Nets, ALDFG, Debris, Pipelines
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModelVersion && setSelectedModelVersion('baseline')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              !isV2
                ? 'bg-red-950/40 border-red-500/60 text-red-400 shadow-md ring-1 ring-red-500/30'
                : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-red-400">Legacy Baseline</span>
              {!isV2 && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <p className="text-[9px] text-slate-400 font-mono leading-tight">
              Reference MILCO / NOMBO Track
            </p>
          </button>
        </div>
      </div>

      {/* Model Spec Box */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#FFB703]" />
            Active Architecture
          </span>
          <span className="text-[#FFB703] font-bold text-[11px]">
            {isV2 ? 'YOLOv8n-SIH-Marine-Debris-V2' : 'YOLOv8n-Sonar-MILCO-NOMBO (Legacy)'}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>Target Classes</span>
          <span className="text-slate-200 font-semibold truncate max-w-[200px]">
            {isV2 ? 'ghost_net, debris, pipeline, anomaly' : 'MILCO, NOMBO'}
          </span>
        </div>
      </div>

      {/* Noise Filtering & False-Positive Suppression Toggle */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-mono font-bold text-slate-100">
                Acoustic Noise Filter
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Post-NMS shadow & aspect ratio verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNoiseFilteringEnabled && setNoiseFilteringEnabled(!noiseFilteringEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              noiseFilteringEnabled ? 'bg-[#FFB703]' : 'bg-white/[0.1]'
            }`}
          >
            <div
              className={`bg-[#05070B] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                noiseFilteringEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Confidence Threshold Slider & Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-medium">Model Confidence Cutoff</span>
          <span className="text-[#FFB703] font-black bg-[#FFB703]/10 px-2.5 py-0.5 rounded-md border border-[#FFB703]/30">
            {(confidence * 100).toFixed(0)}% ({confidence.toFixed(2)})
          </span>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.95"
          step="0.01"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#FFB703]"
        />
        <div className="flex justify-between text-[9px] font-mono text-slate-400">
          <span>0.01 (High Recall)</span>
          <span>0.25 (Default)</span>
          <span>0.95 (High Precision)</span>
        </div>

        {/* Quick Sensitivity Mode Chips */}
        <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono flex-wrap">
          <span className="text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => setConfidence(0.25)}
            className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              confidence === 0.25
                ? 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40 font-bold'
                : 'bg-white/[0.02] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Standard (25%)
          </button>
          <button
            type="button"
            onClick={() => setConfidence(0.08)}
            className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              confidence === 0.08
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                : 'bg-white/[0.02] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
            title="Inspect diffuse acoustic candidates"
          >
            Ghost Net (8%)
          </button>
          <button
            type="button"
            onClick={() => setConfidence(0.01)}
            className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              confidence === 0.01
                ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                : 'bg-white/[0.02] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
            title="Deep Swath Scan"
          >
            Deep Scan (1%)
          </button>
        </div>
      </div>

      {/* Geolocation Coordinates */}
      <div className="space-y-3 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Geotag Coordinates</span>
          </span>
          {hasPingLog ? (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3" />
              Auto (Ping Log)
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-400">
              Manual / Fallback
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
              Latitude (°N)
            </label>
            <input
              type="number"
              step="any"
              placeholder="17.6868"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white/[0.02] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
              Longitude (°E)
            </label>
            <input
              type="number"
              step="any"
              placeholder="83.2185"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white/[0.02] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703]"
            />
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono flex-wrap">
          <span className="text-slate-400">Coastal Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(17.6868, 83.2185)}
            className="px-2 py-0.5 rounded-md bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-[#FFB703] transition-colors cursor-pointer"
          >
            Visakhapatnam (ENC)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(9.9312, 76.2673)}
            className="px-2 py-0.5 rounded-md bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-[#FFB703] transition-colors cursor-pointer"
          >
            Kochi (SNC)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(18.9220, 72.8347)}
            className="px-2 py-0.5 rounded-md bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-[#FFB703] transition-colors cursor-pointer"
          >
            Mumbai (WNC)
          </button>
        </div>
      </div>

      {/* Primary CTA Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!hasFile || isAnalyzing}
          className={`w-full py-4 px-6 rounded-2xl font-mono text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
            !hasFile
              ? 'bg-white/[0.02] text-slate-500 border border-white/[0.08] cursor-not-allowed'
              : isAnalyzing
              ? 'bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/50 cursor-wait animate-pulse'
              : 'bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] shadow-[#FFB703]/20 shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-[#FFB703] border-t-transparent animate-spin" />
              <span>Analyzing Sonar Track...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze Sonar Imagery</span>
            </>
          )}
        </button>
        {!hasFile && (
          <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
            * Select or drag a sonar scan above to enable inference
          </p>
        )}
      </div>
    </div>
  );
};
