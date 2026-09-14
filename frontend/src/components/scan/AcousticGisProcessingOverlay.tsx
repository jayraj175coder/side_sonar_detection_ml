import React, { useEffect, useState } from 'react';
import {
  Activity,
  Radio,
  Waves,
  Compass,
} from 'lucide-react';
import { sonarAudio } from '../../utils/sonarAudio';

interface AcousticGisProcessingOverlayProps {
  currentStage: number; // 1 to 4
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
    subtitle: 'Dual-channel port/starboard calibration & letterbox normalization',
    sublabel: 'Acoustic Calibration',
    progress: 25,
  },
  2: {
    title: 'YOLOV8s ONNX INFERENCE',
    subtitle: 'marine_sonar_v2.onnx forward pass • Proposal candidate heatmaps',
    sublabel: 'Tensor RT Forward Pass',
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
    subtitle: 'WGS84 projection • IHO S-44 bathymetric sounding log generation',
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
    // Authentic acoustic ping
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
    /* Non-intrusive backdrop: dim background with compact centered HUD modal */
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-cyan-400 animate-in fade-in duration-200">
      {/* ── COMPACT FLOATING RADAR SYNTHESIZER CARD (Focused size, no full-screen takeover) ── */}
      <div className="relative w-full max-w-md bg-[#040E1B]/95 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-xl flex flex-col items-center text-center space-y-3.5">
        
        {/* Card Header: Mini Title & Status Badge */}
        <div className="w-full flex items-center justify-between border-b border-[#0D2E4A] pb-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-extrabold text-cyan-300 uppercase tracking-wider text-[11px]">
              GIS Sonar Synthesizer
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#051828] border border-cyan-500/30 text-[8px] text-cyan-300">
            <Radio className="w-2.5 h-2.5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-bold">Georeferencing...</span>
          </div>
        </div>

        {/* ── COMPACT ACOUSTIC RADAR SWEEP (112px diameter) ── */}
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center pointer-events-none my-1">
          {/* Outer Border */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]" />
          
          {/* 250m Middle Range Ring */}
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20 flex items-start justify-center pt-0.5">
            <span className="text-[6px] font-bold text-cyan-500/70 bg-[#020813] px-1 rounded">
              250m
            </span>
          </div>

          {/* Inner Range Ring */}
          <div className="absolute w-12 h-12 rounded-full border border-cyan-500/20" />

          {/* Crosshair Axes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/20 -translate-x-1/2" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-500/20 -translate-y-1/2" />

          {/* Rotating 360° Conic Sweep Beam */}
          <div
            className="absolute inset-0 rounded-full origin-center animate-spin"
            style={{
              animationDuration: '3.5s',
              animationTimingFunction: 'linear',
              background:
                'conic-gradient(from 0deg, rgba(6,182,212,0.3) 0deg, rgba(6,182,212,0.08) 45deg, transparent 90deg, transparent 360deg)',
            }}
          />

          {/* Target Blip 1: Gold Pipeline */}
          <div className="absolute left-[20%] bottom-[28%] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-amber-400/40 animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-200 shadow-[0_0_6px_#F59E0B]" />
          </div>

          {/* Target Blip 2: Cyan Ghost Net */}
          <div className="absolute right-[22%] top-[30%] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400/40 animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_6px_#06B6D4]" />
          </div>

          {/* Center Sonar Transducer Hub */}
          <div className="relative z-10 w-6 h-6 rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_#06B6D4]">
            <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
        </div>

        {/* Stage Titles & Subtitle */}
        <div className="space-y-1 w-full">
          <h3 className="text-xs font-black tracking-wide text-cyan-200 uppercase truncate">
            {currentInfo.title}
          </h3>
          <p className="text-[10px] text-cyan-400/80 font-sans leading-relaxed line-clamp-2 px-2">
            {currentInfo.subtitle}
          </p>
        </div>

        {/* Glowing Progress Bar with Laser Tip */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="relative w-full h-1.5 rounded-full bg-[#020A14] border border-cyan-500/30 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 transition-all duration-300 relative shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${smoothProgress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full blur-[0.5px]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-cyan-400 font-mono">
            <span className="text-cyan-300 font-bold truncate max-w-[220px] text-left">
              {currentInfo.sublabel}
            </span>
            <span className="text-cyan-300 font-extrabold shrink-0 ml-1">
              {smoothProgress}%
            </span>
          </div>
        </div>

        {/* Bottom Metadata Pill: Coords & Filename */}
        <div className="w-full pt-2 border-t border-[#092B42] flex items-center justify-between text-[8px] text-cyan-500">
          <span className="truncate max-w-[180px] font-mono text-cyan-400">
            {fileName || 'sonar_swath.png'}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-cyan-300">
            <span>{Number(latitude).toFixed(3)}°N</span>
            <span>·</span>
            <span>{Number(longitude).toFixed(3)}°E</span>
          </div>
        </div>
      </div>
    </div>
  );
};
