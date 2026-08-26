import React from 'react';
import { SonarMap } from '../components/map/SonarMap';
import { Compass, Radio } from 'lucide-react';

export const DetectionMapPage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Geospatial Operations Theatre
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-track acoustic survey visualization with interactive target markers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Real-Time Geospatial Layer Active</span>
        </div>
      </div>

      {/* Main Interactive Map Component */}
      <SonarMap />
    </div>
  );
};
