import React from 'react';
import { Sliders, MapPin, Cpu, Play, Navigation, Sparkles } from 'lucide-react';
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
  const { modelInfo } = useApp();

  const handleApplyPresetCoords = (lat: number, lon: number) => {
    setLatitude(lat.toString());
    setLongitude(lon.toString());
  };

  return (
    <div className="space-y-5 p-6 rounded-3xl glass-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-100 uppercase tracking-wider font-mono">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Inference Settings</span>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          YOLOv8n ONNX
        </span>
      </div>

      {/* Model Spec Badge Box */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Model Backbone
          </span>
          <span className="text-cyan-300 font-bold">
            {modelInfo?.model_name || 'YOLOv8n-Sonar-ONNX'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Input Resolution</span>
          <span className="text-slate-200">640 × 640 px (RGB)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Target Classes</span>
          <span className="text-slate-200 font-semibold">MILCO, NOMBO</span>
        </div>
      </div>

      {/* Confidence Threshold Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-medium">Confidence Threshold</span>
          <span className="text-cyan-400 font-extrabold bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-500/30">
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
          <span>0.05 (Max Recall)</span>
          <span>0.50</span>
          <span>0.95 (High Precision)</span>
        </div>
      </div>

      {/* Optional Geolocation Coordinates */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Survey Coordinates (Optional)
          </span>
          <span className="text-[10px] text-slate-400">WGS84</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Latitude (°N)
            </label>
            <input
              type="number"
              step="any"
              placeholder="17.6868"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Longitude (°E)
            </label>
            <input
              type="number"
              step="any"
              placeholder="83.2185"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap">
          <span className="text-slate-400">Naval Ranges:</span>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(17.6868, 83.2185)}
            className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            Visakhapatnam (ENC)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(9.9312, 76.2673)}
            className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            Kochi (SNC)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(18.9220, 72.8347)}
            className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
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
          className={`w-full py-4 px-6 rounded-2xl font-mono text-sm font-extrabold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl ${
            !hasFile
              ? 'bg-slate-900/80 text-slate-400 border border-slate-800 cursor-not-allowed'
              : isAnalyzing
              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-400/50 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
              <span>Analyzing Sonar Track...</span>
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
            * Select or drag a sonar scan above to enable inference
          </p>
        )}
      </div>
    </div>
  );
};
