import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart2,
  Clock,
  Sparkles,
  Layers,
  Search,
  ChevronRight,
  TrendingUp,
  Boxes,
  MapPin,
  Play,
  RotateCcw,
  Zap,
  Scale,
  Cpu,
  Eye,
  Radio,
  Filter,
  ArrowRight,
  Server,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMission } from '../context/MissionContext';
import { MISSION_TARGETS } from '../data/targets';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const { startGuidedDemo, setSelectedTargetId } = useMission();

  const heroTarget = MISSION_TARGETS.find((t) => t.id === 'SX-T07') || MISSION_TARGETS[0];

  const debrisDistribution = [
    { name: 'Ghost Nets (ALDFG)', value: 6, color: '#4ade80' },
    { name: 'Lost Trawl Gear', value: 4, color: '#f59e0b' },
    { name: 'Anthropogenic Debris', value: 4, color: '#38bdf8' },
    { name: 'Pipeline Hazards', value: 3, color: '#86efac' },
  ];

  const surveySwathTrend = [
    { track: 'LINE-01', candidates: 9, filtered: 5, valid: 4 },
    { track: 'LINE-02', candidates: 12, filtered: 6, valid: 6 },
    { track: 'LINE-03', candidates: 8, filtered: 4, valid: 4 },
    { track: 'LINE-04', candidates: 8, filtered: 5, valid: 3 },
  ];

  return (
    <div className="space-y-6 animate-slide-up font-mono select-none text-[11px] text-[#dcfce7]">
      {/* 1. Hero Scientific Banner */}
      <div className="relative overflow-hidden bg-[#090e09] border border-[#193019] p-6 md:p-7 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#122415] border border-[#4ade80]/40 text-[#4ade80] text-[9.5px] font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-POWERED MARINE DEBRIS & ANOMALY DETECTION PIPELINE</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-[#dcfce7] tracking-tight uppercase">
            Transforming side-scan sonar imagery into explainable, geotagged marine intelligence.
          </h1>

          <p className="text-[10px] text-[#64876b] leading-relaxed">
            Automated acoustic perception for the Ministry of Earth Sciences: Ingests raw side-scan sonar imagery, applies bilateral noise suppression and CLAHE contrast enhancement, runs YOLOv8n ONNX perception, rejects natural geological formations, attaches WGS84 coordinates, and compiles structured dossiers.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => {
                setActiveTab('mission');
                startGuidedDemo();
              }}
              className="panel-btn flex items-center gap-2 px-3.5 py-1.5 bg-[#4ade80] text-[#070b07] border-[#4ade80] font-black text-xs hover:brightness-110 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN LIVE DEMO MISSION</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className="panel-btn flex items-center gap-2 px-3.5 py-1.5 hover:text-[#4ade80]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>UPLOAD & ANALYZE IMAGE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scalability & Fleet Deployment Path (SIH Criteria Requirement) */}
      <div className="p-4 bg-[#090e09] border border-[#193019] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#193019]">
          <span className="text-[9.5px] font-bold text-[#64876b] uppercase tracking-widest">
            SCALABILITY & FLEET DEPLOYMENT ROADMAP (SIH EVALUATION PATH)
          </span>
          <span className="text-[8px] text-[#4ade80] font-bold">4-STAGE FLEET READINESS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-[9.5px]">
          {/* Stage 1 */}
          <div className="p-3 bg-[#070b07] border border-[#4ade80]/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-[#4ade80] px-1 bg-[#122415] border border-[#4ade80]/40">
                STAGE 01 · ACTIVE NOW
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
            </div>
            <strong className="text-[#dcfce7] block font-bold">ANALYST CONSOLE DEMO</strong>
            <p className="text-[#64876b]">
              Browser-based interactive verification interface for MoES hydrographic officers and survey teams.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-3 bg-[#070b07] border border-[#193019] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-[#64876b] px-1 bg-[#0e160e] border border-[#193019]">
                STAGE 02 · EDGE AUV
              </span>
              <Cpu className="w-3.5 h-3.5 text-[#64876b]" />
            </div>
            <strong className="text-[#dcfce7] block font-bold">ONBOARD JETSON INFERENCE</strong>
            <p className="text-[#64876b]">
              YOLOv8n ONNX model quantized to INT8 running real-time 10.4ms inference on submerged tow-bodies.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-3 bg-[#070b07] border border-[#193019] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-[#64876b] px-1 bg-[#0e160e] border border-[#193019]">
                STAGE 03 · FLEET SYNC
              </span>
              <Server className="w-3.5 h-3.5 text-[#64876b]" />
            </div>
            <strong className="text-[#dcfce7] block font-bold">FLEET SYNC TO MoES HUB</strong>
            <p className="text-[#64876b]">
              Acoustic modem / satellite telemetry synchronization streaming geotagged anomaly dossiers to central servers.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-3 bg-[#070b07] border border-[#193019] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-[#64876b] px-1 bg-[#0e160e] border border-[#193019]">
                STAGE 04 · NATIONAL
              </span>
              <Compass className="w-3.5 h-3.5 text-[#64876b]" />
            </div>
            <strong className="text-[#dcfce7] block font-bold">NATIONAL DEBRIS DENSITY MAP</strong>
            <p className="text-[#64876b]">
              Longitudinal GIS heatmaps and automated salvage vessel routing for Indian EEZ environmental remediation.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 text-center font-mono">
        <div className="p-3 bg-[#090e09] border border-[#193019] space-y-0.5">
          <span className="text-[8px] text-[#64876b] uppercase block">Total Anomalies</span>
          <span className="text-xl font-bold text-[#dcfce7]">17</span>
        </div>

        <div className="p-3 bg-[#090e09] border border-[#ef4444]/40 space-y-0.5">
          <span className="text-[8px] text-[#ef4444] uppercase block font-bold">High Priority</span>
          <span className="text-xl font-bold text-[#ef4444]">4</span>
        </div>

        <div className="p-3 bg-[#090e09] border border-[#4ade80]/40 space-y-0.5">
          <span className="text-[8px] text-[#4ade80] uppercase block font-bold">Top Confidence</span>
          <span className="text-xl font-bold text-[#4ade80]">94.7%</span>
        </div>

        <div className="p-3 bg-[#090e09] border border-[#4ade80]/40 space-y-0.5">
          <span className="text-[8px] text-[#4ade80] uppercase block font-bold">Rocks Filtered</span>
          <span className="text-xl font-bold text-[#4ade80]">20</span>
        </div>

        <div className="p-3 bg-[#090e09] border border-[#193019] space-y-0.5">
          <span className="text-[8px] text-[#64876b] uppercase block">Surveyed Area</span>
          <span className="text-xl font-bold text-[#dcfce7]">12.84 km²</span>
        </div>

        <div className="p-3 bg-[#090e09] border border-[#193019] space-y-0.5">
          <span className="text-[8px] text-[#64876b] uppercase block">Edge Latency</span>
          <span className="text-xl font-bold text-[#38bdf8]">10.4 ms</span>
        </div>
      </div>

      {/* 4. Target Spotlight & Debris Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Hero Target Card */}
        <div className="lg:col-span-7 p-4 bg-[#090e09] border border-[#193019] space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#193019]">
            <span className="text-[9px] font-bold text-[#64876b] uppercase tracking-widest">
              PRIMARY ANOMALY SPOTLIGHT // SX-T07
            </span>
            <span className="text-[8px] text-[#4ade80] font-bold px-1.5 py-0.2 bg-[#122415] border border-[#4ade80]/40">
              94.7% CONFIDENCE
            </span>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <strong className="text-sm text-[#4ade80]">{heroTarget.class}</strong>
              <span className="text-[#64876b]">{heroTarget.length}m x {heroTarget.width}m</span>
            </div>
            <p className="text-[#64876b]">{heroTarget.operatorCaveat}</p>
            <div className="p-2 bg-[#070b07] border border-[#193019] text-[9px] text-[#64876b] flex items-center justify-between">
              <span>LAT: {heroTarget.lat}°N</span>
              <span>LON: {heroTarget.lon}°E</span>
              <span>DEPTH: {heroTarget.depth}m</span>
            </div>
          </div>
        </div>

        {/* Debris Class Breakdown Chart */}
        <div className="lg:col-span-5 p-4 bg-[#090e09] border border-[#193019] space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#193019]">
            <span className="text-[9px] font-bold text-[#64876b] uppercase tracking-widest">
              DEBRIS TAXONOMY DISTRIBUTION
            </span>
            <span className="text-[8px] text-[#64876b]">17 TARGETS</span>
          </div>

          <div className="space-y-1.5 text-[9.5px]">
            {debrisDistribution.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 bg-[#070b07] border border-[#193019]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2" style={{ backgroundColor: d.color }} />
                  <span className="text-[#dcfce7]">{d.name}</span>
                </div>
                <strong className="font-mono" style={{ color: d.color }}>{d.value} items</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
