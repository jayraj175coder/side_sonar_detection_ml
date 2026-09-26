import React, { useEffect, useRef, useState } from 'react';
import { Wind, Waves, Thermometer, Droplets, Navigation } from 'lucide-react';

/** Hydrographic telemetry data — simulates INCOIS/CMEMS real-time feed */
interface HydroTelemetry {
  depth: number;       // metres
  seabedType: string;
  currentSpeed: number; // knots
  currentDir: number;   // degrees true
  seaTemp: number;      // °C
  salinity: number;     // PSU
  visibility: number;   // metres
  windSpeed: number;    // m/s
  windDir: number;      // degrees true
  swellHeight: number;  // metres
  pingRate: number;     // Hz
  pingCount: number;
}

const INITIAL: HydroTelemetry = {
  depth: 43.1,
  seabedType: 'Sand/Silt',
  currentSpeed: 0.24,
  currentDir: 214,
  seaTemp: 28.7,
  salinity: 36.1,
  visibility: 8.2,
  windSpeed: 3.4,
  windDir: 243,
  swellHeight: 0.6,
  pingRate: 10,
  pingCount: 4812,
};

function compassRose(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export const HydrographicTelemetryPanel: React.FC = () => {
  const [data, setData] = useState<HydroTelemetry>(INITIAL);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate gentle live sensor drift
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setData(prev => ({
        ...prev,
        depth:        parseFloat((prev.depth        + (Math.random() - 0.5) * 0.3).toFixed(1)),
        currentSpeed: parseFloat(Math.max(0, prev.currentSpeed + (Math.random() - 0.5) * 0.02).toFixed(2)),
        seaTemp:      parseFloat((prev.seaTemp      + (Math.random() - 0.5) * 0.05).toFixed(1)),
        salinity:     parseFloat((prev.salinity     + (Math.random() - 0.5) * 0.02).toFixed(1)),
        pingCount:    prev.pingCount + Math.floor(Math.random() * 3 + 1),
        windSpeed:    parseFloat(Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 0.1).toFixed(1)),
        swellHeight:  parseFloat(Math.max(0.1, prev.swellHeight + (Math.random() - 0.5) * 0.03).toFixed(1)),
      }));
    }, 2000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  return (
    <div
      className="absolute top-2 right-2 z-[1000] flex flex-col gap-1.5 font-mono select-none"
      style={{ minWidth: '158px' }}
    >
      {/* WIND block */}
      <div className="bg-[#05070B]/95 border border-[#1E293B] rounded px-2.5 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Wind className="w-2.5 h-2.5 text-[#94A3B8]" />
          <span className="text-[7px] font-black text-[#94A3B8] tracking-widest">WIND</span>
        </div>
        <div className="text-[13px] font-black text-[#E2E8F0] leading-none">
          {data.windSpeed} <span className="text-[9px] text-[#64748B]">m/s</span>
        </div>
        <div className="text-[8px] text-[#64748B] mt-0.5">
          + {data.windDir}° {compassRose(data.windDir)} · swell {data.swellHeight}m
        </div>
      </div>

      {/* CURRENT block */}
      <div className="bg-[#05070B]/95 border border-[#1E293B] rounded px-2.5 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Navigation className="w-2.5 h-2.5 text-[#38BDF8]" />
          <span className="text-[7px] font-black text-[#38BDF8] tracking-widest">CURRENT</span>
        </div>
        <div className="text-[13px] font-black text-[#E2E8F0] leading-none">
          {data.currentSpeed} <span className="text-[9px] text-[#64748B]">kn</span>
        </div>
        <div className="text-[8px] text-[#64748B] mt-0.5">
          + {data.currentDir}° {compassRose(data.currentDir)}
        </div>
      </div>

      {/* DEPTH + SEABED */}
      <div className="bg-[#05070B]/95 border border-[#1E293B] rounded px-2.5 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Waves className="w-2.5 h-2.5 text-[#00F5D4]" />
          <span className="text-[7px] font-black text-[#00F5D4] tracking-widest">DEPTH</span>
        </div>
        <div className="text-[13px] font-black text-[#E2E8F0] leading-none">
          {data.depth} <span className="text-[9px] text-[#64748B]">m</span>
        </div>
        <div className="text-[8px] text-[#64748B] mt-0.5">{data.seabedType}</div>
      </div>

      {/* TEMP + SALINITY */}
      <div className="bg-[#05070B]/95 border border-[#1E293B] rounded px-2.5 py-1.5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Thermometer className="w-2.5 h-2.5 text-[#F59E0B]" />
            <span className="text-[7px] font-black text-[#F59E0B] tracking-widest">ENV</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-2.5 h-2.5 text-[#818CF8]" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-black text-[#E2E8F0]">
              {data.seaTemp}°<span className="text-[8px] text-[#64748B]">C</span>
            </div>
            <div className="text-[7px] text-[#64748B]">SEA TEMP</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-black text-[#818CF8]">
              {data.salinity}<span className="text-[8px] text-[#64748B]"> PSU</span>
            </div>
            <div className="text-[7px] text-[#64748B]">SALINITY</div>
          </div>
        </div>
      </div>

      {/* PING COUNTER */}
      <div className="bg-[#050A14]/95 border border-[#FFB703]/30 rounded px-2.5 py-1.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-black text-[#FFB703] tracking-widest">LIVE PING</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] animate-pulse" />
        </div>
        <div className="text-[12px] font-black text-[#FFB703] leading-none mt-0.5">
          # {data.pingCount.toLocaleString()}
        </div>
        <div className="text-[7px] text-[#64748B] mt-0.5">
          {data.pingRate} Hz · VIS: {data.visibility}m
        </div>
      </div>
    </div>
  );
};
