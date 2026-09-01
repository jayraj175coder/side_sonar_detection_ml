import React from 'react';
import {
  Activity,
  Radio,
  Sliders,
  CheckCircle2,
  Compass,
  Gauge,
  Layers,
  Volume2,
  HardDrive,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { MISSION_DATA } from '../../data/mission';

interface HydrographicStage {
  id: string;
  name: string;
  specs: string;
  status: 'active' | 'nominal' | 'calibrated';
  frequency: string;
}

const HYDROGRAPHIC_CHANNELS: HydrographicStage[] = [
  { id: 'CH-01', name: 'Raw XTF Ingestion & Buffering', specs: '10 Hz Ping Rate · 2,048 Pings/Buffer', status: 'nominal', frequency: '900 kHz' },
  { id: 'CH-02', name: 'Time Varied Gain (TVG) Correction', specs: 'Geometric spreading α=0.08 dB/m', status: 'nominal', frequency: '900 kHz' },
  { id: 'CH-03', name: 'Acoustic Bottom Tracking & Nadir Lock', specs: 'Towfish altitude 8.4m AGL locked', status: 'nominal', frequency: 'Altimeter' },
  { id: 'CH-04', name: 'Slant Range & Grazing Angle Correction', specs: '75m Swath (-37.5m Port to +37.5m Stbd)', status: 'nominal', frequency: 'Cross-Track' },
  { id: 'CH-05', name: 'USBL Position & Heading Georeferencing', specs: 'WGS-84 coordinate fix ±0.2m error', status: 'nominal', frequency: 'GPS / INS' },
  { id: 'CH-06', name: 'Acoustic Shadow & Specular Analysis', specs: 'Target height triangulation from shadow', status: 'active', frequency: 'Hydrographic' },
  { id: 'CH-07', name: 'Tactical Contact Catalog & Registration', specs: '17 verified contacts logged in database', status: 'calibrated', frequency: 'Catalog' },
];

export const AcousticTelemetryPanel: React.FC = () => {
  const { playbackTime, missionStatus, focusedPanel, setFocusedPanel } = useMission();

  return (
    <div className="flex flex-col h-full bg-[#10151D] border-r border-[#1B2330] overflow-y-auto select-none font-mono text-[9px]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#1B2330] bg-[#080B11] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#4CD9E8]" />
          <span className="font-bold text-[#EAEFF5] uppercase tracking-wider">
            HYDROGRAPHIC SIGNAL CHANNELS
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#3FD98A]/10 text-[#3FD98A] border border-[#3FD98A]/30">
            ALL NOMINAL
          </span>
          <button
            onClick={() => setFocusedPanel(focusedPanel === 'signals' ? null : 'signals')}
            className={`p-1 rounded border transition-colors cursor-pointer ${
              focusedPanel === 'signals'
                ? 'bg-[#4CD9E8]/20 border-[#4CD9E8] text-[#4CD9E8]'
                : 'bg-[#161C26] border-[#1B2330] text-[#7C8AA0] hover:text-[#4CD9E8]'
            }`}
            title={focusedPanel === 'signals' ? 'Exit Focus View' : 'Expand Channels to Full Focus'}
          >
            {focusedPanel === 'signals' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Channels List */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
        {HYDROGRAPHIC_CHANNELS.map((ch) => (
          <div
            key={ch.id}
            className="p-2 rounded-lg bg-[#161C26] border border-[#1B2330] flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-[#4CD9E8] px-1 rounded bg-[#080B11] border border-[#1B2330]">
                  {ch.id}
                </span>
                <span className="font-bold text-[#EAEFF5] truncate">
                  {ch.name}
                </span>
              </div>
              <p className="text-[8px] text-[#7C8AA0] mt-0.5 truncate">
                {ch.specs}
              </p>
            </div>

            <div className="text-right shrink-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#3FD98A]" />
              <span className="text-[8px] text-[#7C8AA0]">{ch.frequency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Readout */}
      <div className="p-2 border-t border-[#1B2330] bg-[#080B11] text-[8px] text-[#7C8AA0] flex items-center justify-between shrink-0">
        <span>SOUND VELOCITY: <strong className="text-[#EAEFF5]">1522 m/s</strong></span>
        <span>NOISE FLOOR: <strong className="text-[#3FD98A]">-38.4 dB</strong></span>
      </div>
    </div>
  );
};
