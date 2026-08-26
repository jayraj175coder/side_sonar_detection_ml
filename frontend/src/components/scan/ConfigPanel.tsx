import React from 'react';
import { Sliders, MapPin, Cpu, Play, CheckCircle2, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ConfigPanelProps {
  confidence: number;
  setConfidence: (val: number) => void;
  latitude: string;
  setLatitude: (val: string) => void;
  longitude: string;
  setLongitude: (val: string) => void;
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
  onAnalyze,
  isAnalyzing,
  hasFile,
}) => {
  const { modelInfo, isDemoMode } = useApp();

  const handleApplyPresetCoords = (lat: number, lon: number) => {
    setLatitude(lat.toString());
    setLongitude(lon.toString());
  };

  return (
    <div className="space-y-5 p-6 rounded-xl bg-[#0C1427] border border-[#1E2E4E]">
      <div className="flex items-center justify-between border-b border-[#1E2E4E] pb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Inference Parameters</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          ONNX Engine
        </span>
      </div>

      {/* Model Spec Card */}
      <div className="p-3.5 rounded-lg bg-[#080E1C] border border-[#15233E] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Model Arch
          </span>
          <span className="text-cyan-300 font-semibold">
            {modelInfo?.model_name || 'YOLOv8n-Sonar-ONNX'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Input Resolution</span>
          <span className="text-slate-200">640 × 640 px (RGB)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Target Classes</span>
          <span className="text-slate-200">MILCO, NOMBO</span>
        </div>
      </div>

      {/* Confidence Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300">Confidence Threshold</span>
          <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {(confidence * 100).toFixed(0)}% ({confidence.toFixed(2)})
          </span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.95"
          step="0.01"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0.05 (High Recall)</span>
          <span>0.50</span>
          <span>0.95 (High Precision)</span>
        </div>
      </div>

      {/* Geolocation Coordinates (Optional) */}
      <div className="space-y-3 pt-2 border-t border-[#1E2E4E]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Survey Geolocation (Optional)
          </span>
          <span className="text-[10px] text-slate-400">WGS84</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Latitude (°N)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 25.6842"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Longitude (°W)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. -80.1215"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Quick Coordinate Presets */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(25.6842, -80.1215)}
            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            Biscayne
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(25.0865, -80.4478)}
            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            Key Largo
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(24.6288, -82.8732)}
            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            Tortugas
          </button>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!hasFile || isAnalyzing}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-lg font-mono text-sm font-bold tracking-wider uppercase transition-all duration-200 shadow-lg ${
            !hasFile
              ? 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-not-allowed'
              : isAnalyzing
              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold border border-cyan-400/30 shadow-cyan-950/50 hover:shadow-cyan-500/25 active:scale-[0.99]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
              <span>Analyzing Acoustic Beam...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze Sonar</span>
            </>
          )}
        </button>
        {!hasFile && (
          <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
            * Please select or drag a sonar scan to begin analysis
          </p>
        )}
      </div>
    </div>
  );
};
