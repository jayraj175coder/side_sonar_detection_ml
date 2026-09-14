import React, { useEffect, useState } from 'react';
import {
  Activity,
  Radio,
  Waves,
} from 'lucide-react';
import { sonarAudio } from '../../utils/sonarAudio';

interface AcousticGisProcessingOverlayProps {
  currentStage: number; // 1 to 4 or 1 to 6
  fileName?: string;
  latitude?: number | string;
  longitude?: number | string;
}

const STAGE_DETAILS: Record<
  number,
  { title: string; subtitle: string; sublabel: string; progress: number }
> = {
  1: {
    title: 'INGESTING RAW SSS SWATH',
    subtitle: 'Dual-channel port/starboard backscatter calibration & letterbox normalization',
    sublabel: 'Acoustic Calibration & Normalization',
    progress: 25,
  },
  2: {
    title: 'YOLOV8s ONNX INFERENCE',
    subtitle: 'marine_sonar_v2.onnx forward pass • Evaluating candidate proposal heatmaps',
    sublabel: 'Tensor RT / CPU Forward Pass',
    progress: 55,
  },
  3: {
    title: 'SYNTHESIZING GIS SONAR OVERLAY',
    subtitle: 'Georeferencing acoustic swath • Slant-to-ground range correction',
    sublabel: 'Acoustic Shadow Verification',
    progress: 82,
  },
  4: {
    title: 'COMPILING ANOMALY DOSSIER',
    subtitle: 'WGS84 coordinate projection • IHO S-44 bathymetric sounding log generation',
    sublabel: 'Georeferencing & Export Package',
    progress: 98,
  },
};

export const AcousticGisProcessingOverlay: React.FC<AcousticGisProcessingOverlayProps> = ({
  currentStage,
  fileName,
  latitude = 17.6868,
  longitude = 83.2185,
}) => {
  const [smoothProgress, setSmoothProgress] = useState<number>(15);
  const currentInfo = STAGE_DETAILS[currentStage] || STAGE_DETAILS[3];

  useEffect(() => {
    // Play authentic sonar ping upon entering stage
    sonarAudio.playSonarPing();
  }, [currentStage]);

  useEffect(() => {
    const target = currentInfo.progress;
    const interval = setInterval(() => {
      setSmoothProgress((prev) => {
        if (prev < target) {
          return Math.min(prev + 2, target);
        }
        return prev;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [currentInfo.progress]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020813]/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none font-mono overflow-hidden text-cyan-400 animate-in fade-in duration-200">
      {/* ── TOP ACTION & GEOREFERENCING STATUS BAR ── */}
      <div className="flex items-center justify-between border-b border-[#092B42] pb-3 z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-sm md:text-base font-black tracking-wider text-cyan-300 uppercase">
              Real-Time GIS Sonar Map Overlay
            </h2>
          </div>
          <p className="text-[10px] text-cyan-600 font-sans tracking-wide">
            Automated acoustic geotagging • Real-time anomaly positions with slant-to-ground range correction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#051828] border border-cyan-500/40 text-[10px] text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-bold">Georeferencing Sonar Swath...</span>
          </div>
        </div>
      </div>

      {/* ── MAIN RADAR SWATH & HUD WORKSPACE ── */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {/* Ambient Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, #00D4AA 1px, transparent 1px),
              linear-gradient(to bottom, #00D4AA 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* ── FULL-CIRCULAR HYDROGRAPHIC RADAR GRID ── */}
        <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] md:w-[620px] md:h-[620px] rounded-full flex items-center justify-center pointer-events-none">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.1)]" />

          {/* Middle Range Ring (250m RANGE) */}
          <div className="absolute w-3/4 h-3/4 rounded-full border border-cyan-500/20 flex items-start justify-center pt-2">
            <span className="text-[9px] font-bold text-cyan-500/60 bg-[#020813] px-1 rounded tracking-widest">
              250m RANGE
            </span>
          </div>

          {/* Inner Range Ring */}
          <div className="absolute w-1/2 h-1/2 rounded-full border border-cyan-500/15" />
          <div className="absolute w-1/4 h-1/4 rounded-full border border-cyan-500/20" />

          {/* Crosshair Cardinal Axes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/20 -translate-x-1/2" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-500/20 -translate-y-1/2" />

          {/* Rotating Radar Sweep Beam (Continuous 360° Sweep) */}
          <div
            className="absolute inset-0 rounded-full origin-center animate-spin"
            style={{
              animationDuration: '4.5s',
              animationTimingFunction: 'linear',
              background: 'conic-gradient(from 0deg, rgba(6,182,212,0.22) 0deg, rgba(6,182,212,0.05) 45deg, transparent 90deg, transparent 360deg)',
            }}
          />

          {/* Cardinal Bearing Labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-400 bg-[#020813] px-1.5 py-0.5 border border-cyan-500/30 rounded">
            000° N
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-400 bg-[#020813] px-1.5 py-0.5 border border-cyan-500/30 rounded">
            180° S
          </span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-400 bg-[#020813] px-1.5 py-0.5 border border-cyan-500/30 rounded">
            270° W
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-400 bg-[#020813] px-1.5 py-0.5 border border-cyan-500/30 rounded">
            090° E
          </span>

          {/* Target Blip 1: SAR Dynamic Pipeline (Gold node on port side) */}
          <div className="absolute left-[22%] bottom-[32%] flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-amber-400/30 animate-ping absolute" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200 shadow-[0_0_10px_#F59E0B]" />
            </div>
            <div className="px-2 py-0.5 rounded bg-[#07131D]/90 border border-amber-500/40 text-[9px] text-amber-300 font-bold whitespace-nowrap shadow-md">
              SAR Dynamic Pipeline
            </div>
          </div>

          {/* Target Blip 2: Target #07 Ghost Net ALDFG (Cyan node on starboard side) */}
          <div className="absolute right-[18%] top-[45%] flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-cyan-400/30 animate-ping absolute" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_10px_#06B6D4]" />
            </div>
            <div className="px-2 py-0.5 rounded bg-[#07131D]/90 border border-cyan-500/40 text-[9px] text-cyan-300 font-bold whitespace-nowrap shadow-md">
              Target #07 (Ghost Net ALDFG)
            </div>
          </div>
        </div>

        {/* ── FLOATING TOP-RIGHT GIS BATHYMETRIC MATRIX ── */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 p-3 rounded-xl bg-[#040E1B]/85 border border-[#0D2E4A] backdrop-blur-md text-[9px] space-y-1.5 shadow-xl hidden sm:block">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold border-b border-[#0D2E4A] pb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>GIS BATHYMETRIC MATRIX</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-cyan-500">
            <span>LAT:</span>
            <strong className="text-cyan-200 text-right font-mono">{Number(latitude).toFixed(4)}° N</strong>
            <span>LON:</span>
            <strong className="text-cyan-200 text-right font-mono">{Number(longitude).toFixed(4)}° E</strong>
            <span>SWATH RES:</span>
            <strong className="text-cyan-200 text-right font-mono">0.08 m/px</strong>
            <span>TRANSDUCER:</span>
            <strong className="text-[#00D4AA] text-right font-mono">900 kHz CHIRP</strong>
          </div>
        </div>

        {/* ── CENTER FLOATING SYNTHESIZER HUD MODAL (Directly matching user image media_1789369770984.png) ── */}
        <div className="relative z-20 w-full max-w-lg mx-4 p-6 md:p-8 rounded-2xl bg-[#040E1B]/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] backdrop-blur-xl text-center space-y-5">
          {/* Animated Circular Radar Reticle Icon */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            {/* Outer Rotating Dashed Ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/60 animate-spin"
              style={{ animationDuration: '8s' }}
            />
            {/* Middle Reverse Rotating Ring */}
            <div
              className="absolute w-12 h-12 rounded-full border border-cyan-400/80 animate-spin"
              style={{ animationDuration: '4s', animationDirection: 'reverse' }}
            />
            {/* Center Sonar Icon */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_#06B6D4]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Modal Header Titles */}
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black tracking-wider text-cyan-200 uppercase">
              {currentInfo.title}
            </h3>
            <p className="text-xs text-cyan-400/80 font-sans leading-relaxed max-w-sm mx-auto">
              {currentInfo.subtitle}
            </p>
          </div>

          {/* Glowing Neon Progress Bar with High-Intensity Laser Tip */}
          <div className="space-y-2 pt-1">
            <div className="relative w-full h-2 rounded-full bg-[#020A14] border border-cyan-500/30 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 transition-all duration-300 relative shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                style={{ width: `${smoothProgress}%` }}
              >
                {/* Laser Glowing Head */}
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-white rounded-full blur-[1px]" />
              </div>
            </div>

            {/* Bottom Status Labels */}
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono pt-1">
              <span className="text-cyan-300 font-bold truncate max-w-[280px] text-left">
                {currentInfo.sublabel}
              </span>
              <span className="text-cyan-400 font-extrabold animate-pulse shrink-0 ml-2">
                Computing... {smoothProgress}%
              </span>
            </div>
          </div>

          {/* Active File Readout */}
          {fileName && (
            <div className="pt-2 border-t border-[#092B42] flex items-center justify-center gap-2 text-[9px] text-cyan-600">
              <span>TARGET TRANSECT:</span>
              <span className="text-cyan-300 font-bold font-mono truncate max-w-[240px]">
                {fileName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM REAL-TIME ACTIVITY FEED BAR ── */}
      <div className="flex items-center justify-between border-t border-[#092B42] pt-3 z-10 text-[10px] text-cyan-500">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 tracking-wider uppercase">
            Real-Time Activity Feed
          </span>
          <span className="hidden md:inline text-cyan-600 font-sans">
            • Hydrographic sonar telemetry streaming at 30 pings/sec
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-ping" />
          <span className="text-cyan-400 font-bold">Streaming Telemetry...</span>
        </div>
      </div>
    </div>
  );
};
