import React from 'react';
import { SonarMap } from '../components/map/SonarMap';
import {
  Compass,
  Radio,
  Sparkles,
  ShieldCheck,
  Globe2,
  Anchor,
  Activity,
  Layers,
  Ship,
} from 'lucide-react';

export const DetectionMapPage: React.FC = () => {
  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Sexy Cyber-Naval Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl sexy-glass-panel border border-[#4CD9E8]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4CD9E8]/15 border border-[#4CD9E8]/30 flex items-center justify-center text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.25)] shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[8px] text-[#7C8AA0] uppercase block">INDIA EEZ COVERAGE</span>
            <strong className="text-sm font-black text-[#EAEFF5]">2,372,000 km²</strong>
            <span className="text-[8px] text-[#3FD98A] block font-bold">● WGS-84 BATHYMETRY</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl sexy-glass-panel border border-[#29B6F6]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#29B6F6]/15 border border-[#29B6F6]/30 flex items-center justify-center text-[#29B6F6] shadow-[0_0_15px_rgba(41,182,246,0.25)] shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[8px] text-[#7C8AA0] uppercase block">ACTIVE FLEET UNITS</span>
            <strong className="text-sm font-black text-[#EAEFF5]">4 RESEARCH SHIPS</strong>
            <span className="text-[8px] text-[#29B6F6] block font-bold">INS Sandhayak / NHO</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl sexy-glass-panel border border-[#A855F7]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[8px] text-[#7C8AA0] uppercase block">SURVEY BASINS</span>
            <strong className="text-sm font-black text-[#EAEFF5]">8 COASTAL SECTORS</strong>
            <span className="text-[8px] text-[#A855F7] block font-bold">Arabian & Bengal Seas</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl sexy-glass-panel border border-[#F04438]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F04438]/15 border border-[#F04438]/30 flex items-center justify-center text-[#F04438] shadow-[0_0_15px_rgba(240,68,56,0.25)] shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] text-[#7C8AA0] uppercase block">CLASSIFIED CONTACTS</span>
            <strong className="text-sm font-black text-[#EAEFF5]">124 LOGGED</strong>
            <span className="text-[8px] text-[#F04438] block font-bold">19 Critical Threats</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive India Maritime Map */}
      <SonarMap />
    </div>
  );
};
