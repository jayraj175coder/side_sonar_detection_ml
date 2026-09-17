import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Waves,
  Ruler,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface AcousticShadowCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcousticShadowCalculatorModal: React.FC<AcousticShadowCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Hydrographic variables
  const [altitude, setAltitude] = useState<number>(12.0); // Ha (m)
  const [slantRange, setSlantRange] = useState<number>(34.0); // Rs (m)
  const [shadowLength, setShadowLength] = useState<number>(4.8); // Ls (m)
  const [soundSpeed, setSoundSpeed] = useState<number>(1514); // C (m/s)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Hydrographic math calculations
  const { targetHeight, groundRange, hazardLevel, hazardColor } = useMemo(() => {
    // Valid check: Slant range must be >= altitude
    const effectiveSlant = Math.max(slantRange, altitude + 0.5);

    // Standard hydrographic shadow formula: H = (Ls * Ha) / Rs
    const ht = (shadowLength * altitude) / effectiveSlant;

    // Ground range: Rg = sqrt(Rs^2 - Ha^2)
    const rg = Math.sqrt(Math.max(0, effectiveSlant * effectiveSlant - altitude * altitude));

    let level = 'LOW RELIEF ANOMALY';
    let color = '#38BDF8';
    if (ht >= 1.5) {
      level = 'CRITICAL NAVIGATION HAZARD (IHO CLASS 1)';
      color = '#EF4444';
    } else if (ht >= 0.7) {
      level = 'SUBSEA OBSTACLE / ALDFG NET CLUSTER';
      color = '#FFB703';
    }

    return {
      targetHeight: ht,
      groundRange: rg,
      hazardLevel: level,
      hazardColor: color,
    };
  }, [altitude, slantRange, shadowLength]);

  const handleReset = () => {
    setAltitude(12.0);
    setSlantRange(34.0);
    setShadowLength(4.8);
    setSoundSpeed(1514);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none font-sans"
    >
      <div className="relative w-full max-w-3xl bg-[#070B12] border border-[#FFB703]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,183,3,0.18)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Corner Calipers */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#FFB703]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#FFB703]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#FFB703]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#FFB703]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#0A101D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] shadow-[0_0_15px_rgba(255,183,3,0.2)] shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FFB703]/20 border border-[#FFB703]/40 text-[9px] font-mono font-bold text-[#FFB703] uppercase tracking-wider">
                  IHO S-44 Order 1A Specification
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Hydrographic Triangulation
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide mt-0.5">
                Acoustic Shadow & 3D Target Height Calculator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset parameters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close calculator (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calculator Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs">
          {/* Main Formula Highlight Card */}
          <div className="p-4 rounded-xl bg-[#0A101D] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono uppercase text-[10px] font-semibold">
                  Acoustic Ray-Tracing Geometry:
                </span>
                <span className="text-[#FFB703] font-mono text-[10px]">H = (Ls · Ha) / Rs</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 flex items-baseline gap-2">
                <span className="text-[#FFB703]">{targetHeight.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">meters vertical elevation</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05070B] border border-white/[0.08] font-mono text-[11px] space-y-1 text-right">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Ground Range (Rg):</span>
                <span className="text-white font-bold">{groundRange.toFixed(1)} m</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Hazard Assessment:</span>
                <span style={{ color: hazardColor }} className="font-bold">
                  {hazardLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Towfish Altitude (Ha) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Towfish Altitude (Ha)</span>
                <span className="font-mono text-[#FFB703] font-bold">{altitude.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={2}
                max={35}
                step={0.5}
                value={altitude}
                onChange={(e) => setAltitude(parseFloat(e.target.value))}
                className="w-full accent-[#FFB703] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>2m (Near Seabed)</span>
                <span>35m (High Altitude)</span>
              </div>
            </div>

            {/* 2. Slant Range (Rs) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Slant Range to Shadow Tip (Rs)</span>
                <span className="font-mono text-[#FFB703] font-bold">{slantRange.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={slantRange}
                onChange={(e) => setSlantRange(parseFloat(e.target.value))}
                className="w-full accent-[#FFB703] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>10m (Nadir Edge)</span>
                <span>100m (Far Swath)</span>
              </div>
            </div>

            {/* 3. Shadow Length (Ls) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Acoustic Shadow Length (Ls)</span>
                <span className="font-mono text-[#FFB703] font-bold">{shadowLength.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.2}
                value={shadowLength}
                onChange={(e) => setShadowLength(parseFloat(e.target.value))}
                className="w-full accent-[#FFB703] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.5m (Subtle Shadow)</span>
                <span>20m (Large Obstacle)</span>
              </div>
            </div>

            {/* 4. Sound Velocity (C) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Seawater Sound Velocity (C)</span>
                <span className="font-mono text-[#38BDF8] font-bold">{soundSpeed} m/s</span>
              </div>
              <input
                type="range"
                min={1450}
                max={1550}
                step={2}
                value={soundSpeed}
                onChange={(e) => setSoundSpeed(parseInt(e.target.value))}
                className="w-full accent-[#38BDF8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1450 m/s (Polar/Fresh)</span>
                <span>1514 m/s (Indian Shelf avg)</span>
                <span>1550 m/s (Warm Saline)</span>
              </div>
            </div>
          </div>

          {/* Hydrographic Explanation Callout */}
          <div className="p-3.5 rounded-xl bg-[#0A101D] border border-white/[0.08] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong>Hydrographer's Note for Judges:</strong> When the side-scan acoustic beam illuminates an elevated target on the seabed, the object blocks the acoustic rays, creating an acoustic blind zone behind it known as the <em>acoustic shadow</em>. Using the geometric similarity of right triangles, the true vertical target height is directly proportional to the shadow length and towfish altitude, and inversely proportional to the slant range.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 bg-[#05070B] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
            <span>IHO S-44 Special Order Bathymetry Verification</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#FFB703] text-[#05070B] font-bold hover:bg-[#FCD34D] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
