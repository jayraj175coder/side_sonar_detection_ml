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
    <div className="space-y-5 p-6 rounded-3xl glass-panel font-mono select-none">
      {/* Title & Architecture Tag */}
      <div className="flex items-center justify-between border-b border-[#152438] pb-4">
        <div className="flex items-center gap-2.5 text-xs font-black text-[#EAEFF5] uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-[#4CD9E8]" />
          <span>Inference Parameters</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#4CD9E8]/10 text-[#4CD9E8] border border-[#4CD9E8]/30">
          ONNX Runtime
        </span>
      </div>

      {/* Model Selection Track Cards */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-[#7C8AA0] flex items-center justify-between">
          <span>AI Model Track</span>
          <span className="text-[10px] text-[#4CD9E8]">MoES / SIH 2026</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedModelVersion && setSelectedModelVersion('v2')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              isV2
                ? 'bg-[#0A1A2E] border-[#4CD9E8]/60 text-[#4CD9E8] shadow-md ring-1 ring-[#4CD9E8]/30'
                : 'bg-[#0A1322] border-[#152438] text-[#7C8AA0] hover:border-[#152438]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-[#4CD9E8]">SIH Marine Debris V2</span>
              {isV2 && <CheckCircle2 className="w-3.5 h-3.5 text-[#4CD9E8]" />}
            </div>
            <p className="text-[9px] text-[#7C8AA0] font-mono leading-tight">
              Ghost Nets, ALDFG, Debris, Pipelines
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModelVersion && setSelectedModelVersion('baseline')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              !isV2
                ? 'bg-[#1E0E14] border-[#F04438]/60 text-[#F04438] shadow-md ring-1 ring-[#F04438]/30'
                : 'bg-[#0A1322] border-[#152438] text-[#7C8AA0] hover:border-[#152438]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-[#F04438]">Legacy Baseline</span>
              {!isV2 && <CheckCircle2 className="w-3.5 h-3.5 text-[#F04438]" />}
            </div>
            <p className="text-[9px] text-[#7C8AA0] font-mono leading-tight">
              Reference MILCO / NOMBO Track
            </p>
          </button>
        </div>
      </div>

      {/* Model Spec Box */}
      <div className="p-3.5 rounded-2xl bg-[#060D17] border border-[#152438] space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[#7C8AA0] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#4CD9E8]" />
            Active Architecture
          </span>
          <span className="text-[#4CD9E8] font-bold text-[11px]">
            {isV2 ? 'YOLOv8n-SIH-Marine-Debris-V2' : 'YOLOv8n-Sonar-MILCO-NOMBO (Legacy)'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#7C8AA0] text-[10px]">
          <span>Target Classes</span>
          <span className="text-[#EAEFF5] font-semibold truncate max-w-[200px]">
            {isV2 ? 'ghost_net, debris, pipeline, anomaly' : 'MILCO, NOMBO'}
          </span>
        </div>
      </div>

      {/* Noise Filtering & False-Positive Suppression Toggle */}
      <div className="p-3.5 rounded-2xl bg-[#060D17] border border-[#152438] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3FD98A]" />
            <div>
              <p className="text-xs font-mono font-bold text-[#EAEFF5]">
                Acoustic Noise Filter
              </p>
              <p className="text-[10px] text-[#7C8AA0] font-mono">
                Post-NMS shadow & aspect ratio verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNoiseFilteringEnabled && setNoiseFilteringEnabled(!noiseFilteringEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              noiseFilteringEnabled ? 'bg-[#4CD9E8]' : 'bg-[#152438]'
            }`}
          >
            <div
              className={`bg-[#03070E] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                noiseFilteringEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Confidence Threshold Slider & Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#7C8AA0] font-medium">Model Confidence Cutoff</span>
          <span className="text-[#4CD9E8] font-black bg-[#0A1A2E] px-2.5 py-0.5 rounded-md border border-[#4CD9E8]/30">
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
          className="w-full h-1.5 bg-[#152438] rounded-lg appearance-none cursor-pointer accent-[#4CD9E8]"
        />
        <div className="flex justify-between text-[9px] font-mono text-[#7C8AA0]">
          <span>0.01 (High Recall)</span>
          <span>0.25 (Default)</span>
          <span>0.95 (High Precision)</span>
        </div>

        {/* Quick Sensitivity Mode Chips */}
        <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono flex-wrap">
          <span className="text-[#7C8AA0]">Presets:</span>
          <button
            type="button"
            onClick={() => setConfidence(0.25)}
            className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              confidence === 0.25
                ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] border-[#4CD9E8]/40 font-bold'
                : 'bg-[#0A1322] text-[#7C8AA0] border-[#152438] hover:text-[#EAEFF5]'
            }`}
          >
            Standard (25%)
          </button>
          <button
            type="button"
            onClick={() => setConfidence(0.08)}
            className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              confidence === 0.08
                ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 font-bold'
                : 'bg-[#0A1322] text-[#7C8AA0] border-[#152438] hover:text-[#EAEFF5]'
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
                ? 'bg-[#F04438]/20 text-[#F04438] border-[#F04438]/40 font-bold'
                : 'bg-[#0A1322] text-[#7C8AA0] border-[#152438] hover:text-[#EAEFF5]'
            }`}
            title="Deep Swath Scan"
          >
            Deep Scan (1%)
          </button>
        </div>
      </div>

      {/* Geolocation Coordinates */}
      <div className="space-y-3 pt-3 border-t border-[#152438]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#7C8AA0] font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#4CD9E8]" />
            <span>Geotag Coordinates</span>
          </span>
          {hasPingLog ? (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#3FD98A]/20 text-[#3FD98A] border border-[#3FD98A]/40 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3" />
              Auto (Ping Log)
            </span>
          ) : (
            <span className="text-[9px] font-mono text-[#7C8AA0]">
              Manual / Fallback
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-mono text-[#7C8AA0] uppercase mb-1">
              Latitude (°N)
            </label>
            <input
              type="number"
              step="any"
              placeholder="17.6868"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#060D17] border border-[#152438] text-[#EAEFF5] placeholder-[#7C8AA0]/50 focus:outline-none focus:border-[#4CD9E8]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-[#7C8AA0] uppercase mb-1">
              Longitude (°E)
            </label>
            <input
              type="number"
              step="any"
              placeholder="83.2185"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#060D17] border border-[#152438] text-[#EAEFF5] placeholder-[#7C8AA0]/50 focus:outline-none focus:border-[#4CD9E8]"
            />
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono flex-wrap">
          <span className="text-[#7C8AA0]">Coastal Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(17.6868, 83.2185)}
            className="px-2 py-0.5 rounded-md bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors cursor-pointer"
          >
            Visakhapatnam (ENC)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(9.9312, 76.2673)}
            className="px-2 py-0.5 rounded-md bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors cursor-pointer"
          >
            Kochi (SNC)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(18.9220, 72.8347)}
            className="px-2 py-0.5 rounded-md bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[#7C8AA0] hover:text-[#4CD9E8] transition-colors cursor-pointer"
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
              ? 'bg-[#0A1322] text-[#7C8AA0] border border-[#152438] cursor-not-allowed'
              : isAnalyzing
              ? 'bg-[#0A1A2E] text-[#4CD9E8] border border-[#4CD9E8]/50 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-[#4CD9E8] via-[#29B6F6] to-[#4CD9E8] hover:brightness-110 text-[#03070E] shadow-[#4CD9E8]/30 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-[#4CD9E8] border-t-transparent animate-spin" />
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
          <p className="text-[10px] text-center text-[#7C8AA0] mt-2 font-mono">
            * Select or drag a sonar scan above to enable inference
          </p>
        )}
      </div>
    </div>
  );
};
