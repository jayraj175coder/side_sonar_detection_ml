import React from 'react';
import {
  Sliders,
  MapPin,
  Cpu,
  Play,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

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
  const handleApplyPresetCoords = (lat: number, lon: number) => {
    setLatitude(lat.toString());
    setLongitude(lon.toString());
  };

  const isV2 = selectedModelVersion === 'v2';

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-[#0B111A] border border-white/[0.08] font-sans select-none shadow-xl">
      
      {/* ── HEADER: INFERENCE PARAMETERS ── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FFB800]" />
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            INFERENCE PARAMETERS
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30">
          ONNX RUNTIME
        </span>
      </div>

      {/* ── 1. MODEL TRACK ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider">MODEL TRACK</span>
          <span className="text-[#00B8D9] font-bold">Selected: SIH MARINE DEBRIS V2</span>
        </div>

        {/* Model Spec Box */}
        <div className="p-3 rounded-xl bg-[#070D16] border border-white/[0.06] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FFB800]" />
              Model:
            </span>
            <span className="text-[#FFB800] font-bold text-[11px]">
              YOLOv8s-SIH-Marine-Debris-V2
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Runtime:</span>
            <span className="text-white font-semibold">ONNX (FP32/INT8 Edge Tensor)</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Latency:</span>
            <span className="text-emerald-400 font-bold">14.2 ms</span>
          </div>

          <div className="pt-1.5 border-t border-white/[0.06]">
            <span className="text-[9.5px] text-slate-500 uppercase block mb-1 font-bold">Target Classes:</span>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
                <span>Ghost Net / ALDFG</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span>Anthropogenic Debris</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span>Pipeline Hazard</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Seafloor Anomaly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ACOUSTIC VERIFICATION ── */}
      <div className="p-3.5 rounded-xl bg-[#070D16] border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                ACOUSTIC NOISE FILTER
              </p>
              <p className="text-[9.5px] text-slate-400 font-mono">
                Post-NMS shadow &amp; aspect-ratio verification
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setNoiseFilteringEnabled && setNoiseFilteringEnabled(!noiseFilteringEnabled)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-black transition cursor-pointer flex items-center gap-1.5 ${
              noiseFilteringEnabled
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
                : 'bg-white/[0.04] border border-white/[0.1] text-slate-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${noiseFilteringEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>{noiseFilteringEnabled ? 'ACTIVE' : 'BYPASS'}</span>
          </button>
        </div>

        <p className="text-[10px] font-sans text-slate-400 leading-relaxed pt-1 border-t border-white/[0.04]">
          Reject detections inconsistent with expected acoustic-shadow geometry.
        </p>
      </div>

      {/* ── 3. CONFIDENCE CONTROL ── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase text-[10.5px]">MODEL CONFIDENCE CUTOFF</span>
          <span className="text-[#FFB800] font-black bg-[#FFB800]/10 px-2 py-0.5 rounded border border-[#FFB800]/30">
            {(confidence * 100).toFixed(0)}% ({confidence.toFixed(2)})
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0.01"
          max="0.95"
          step="0.01"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#FFB800]"
        />

        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>0.01 (High Recall)</span>
          <span>0.25 (Default)</span>
          <span>0.95 (High Precision)</span>
        </div>

        {/* Calibration Presets */}
        <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono flex-wrap">
          <span className="text-slate-500 uppercase text-[9px]">Presets:</span>
          <button
            type="button"
            onClick={() => setConfidence(0.25)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
              confidence === 0.25
                ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Standard (0.25)
          </button>
          <button
            type="button"
            onClick={() => setConfidence(0.45)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
              confidence === 0.45
                ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Ghost Net (0.45)
          </button>
          <button
            type="button"
            onClick={() => setConfidence(0.15)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
              confidence === 0.15
                ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Deep Scan (0.15)
          </button>
        </div>
      </div>

      {/* ── 4. GEOTAGGING ── */}
      <div className="space-y-2 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase text-[10.5px] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>WGS84 GEOTAG</span>
          </span>
          {hasPingLog ? (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3" />
              Auto (Ping Log)
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-400">
              Manual / Fallback
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
              Latitude (°N)
            </label>
            <input
              type="text"
              placeholder="18.9217"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#070D16] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB800]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
              Longitude (°E)
            </label>
            <input
              type="text"
              placeholder="72.8214"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#070D16] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB800]"
            />
          </div>
        </div>

        {/* Coastal Presets */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono flex-wrap pt-0.5">
          <span className="text-slate-500 uppercase">Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(18.9217, 72.8214)}
            className="px-2 py-0.5 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-[#FFB800] transition cursor-pointer"
          >
            Mumbai
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(9.9312, 76.2673)}
            className="px-2 py-0.5 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-[#FFB800] transition cursor-pointer"
          >
            Kochi
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetCoords(17.6868, 83.2185)}
            className="px-2 py-0.5 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-[#FFB800] transition cursor-pointer"
          >
            Visakhapatnam
          </button>
        </div>
      </div>

      {/* ── 5. PRIMARY ACTION ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!hasFile || isAnalyzing}
          className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            !hasFile
              ? 'bg-white/[0.03] text-slate-500 border border-white/[0.08] cursor-not-allowed opacity-60'
              : isAnalyzing
              ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/50 cursor-wait animate-pulse'
              : 'bg-[#FFB800] hover:bg-[#FFB800]/90 text-black shadow-[0_0_20px_rgba(255,184,0,0.3)] active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FFB800] border-t-transparent animate-spin" />
              <span>Analyzing Sonar Track...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ANALYZE SONAR IMAGERY</span>
            </>
          )}
        </button>

        {!hasFile && (
          <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
            * Select or drag a sonar swath above to enable inference
          </p>
        )}
      </div>

    </div>
  );
};
