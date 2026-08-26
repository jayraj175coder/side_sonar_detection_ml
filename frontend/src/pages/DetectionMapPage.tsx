import React from 'react';
import { SonarMap } from '../components/map/SonarMap';
import { Compass, Radio, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DetectionMapPage: React.FC = () => {
  const { scans } = useApp();
  const geolocatedCount = scans.filter(
    (s) => s.location.latitude !== null && s.location.longitude !== null
  ).length;

  return (
    <div className="space-y-4">
      {/* 1. Tactical Header Banner */}
      <div className="p-4 md:p-5 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              Geospatial Operations Theatre
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Interactive acoustic survey telemetry with pulsing contact reticles and slide-up inspection drawers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/70 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 shadow-inner">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              {geolocatedCount} Geolocated Survey Track{geolocatedCount === 1 ? '' : 's'} Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map */}
      <SonarMap />
    </div>
  );
};
