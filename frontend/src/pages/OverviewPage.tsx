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
  const { startGuidedDemo, toggleJudgeMode, isJudgeMode, setSelectedTargetId } = useMission();

  const heroTarget = MISSION_TARGETS.find((t) => t.id === 'SX-T07') || MISSION_TARGETS[0];

  const debrisDistribution = [
    { name: 'Ghost Nets (ALDFG)', value: 6, color: '#32E6D1' },
    { name: 'Lost Trawl Gear', value: 4, color: '#FFB547' },
    { name: 'Anthropogenic Debris', value: 4, color: '#29B6F6' },
    { name: 'Pipeline Hazards', value: 3, color: '#65D391' },
  ];

  const surveySwathTrend = [
    { track: 'LINE-01', candidates: 9, filtered: 5, valid: 4 },
    { track: 'LINE-02', candidates: 12, filtered: 6, valid: 6 },
    { track: 'LINE-03', candidates: 8, filtered: 4, valid: 4 },
    { track: 'LINE-04', candidates: 8, filtered: 5, valid: 3 },
  ];

  return (
    <div className="space-y-6 animate-slide-up font-mono select-none">
      {/* 1. Hero Scientific Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#081118] via-[#0C171E] to-[#081118] border border-[#16303B] p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#32E6D1]/10 border border-[#32E6D1]/30 text-[#32E6D1] text-[10px] font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-POWERED MARINE DEBRIS & ANOMALY DETECTION</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#E4F2F5] tracking-tight font-sans">
            Transforming side-scan sonar imagery into explainable, geotagged marine intelligence.
          </h1>

          <p className="text-xs text-[#6F8992] font-sans leading-relaxed">
            SonarX automatically analyzes side-scan sonar imagery, detects suspicious marine debris and anomalies, filters natural acoustic formations, scores detections by confidence, geotags targets, and presents them for human verification.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveTab('mission');
                startGuidedDemo();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#32E6D1] to-[#29B6F6] text-[#03070B] font-black text-xs font-mono flex items-center gap-2 shadow-lg shadow-[#32E6D1]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START DEMO MISSION (MX-026)</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className="px-4 py-2.5 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-[#E4F2F5] font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#32E6D1]" />
              <span>Upload & Analyze</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('mission');
                toggleJudgeMode();
              }}
              className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                isJudgeMode
                  ? 'bg-[#FFB547]/20 border-[#FFB547] text-[#FFB547]'
                  : 'bg-[#0C171E] border-[#16303B] text-[#6F8992] hover:text-[#E4F2F5]'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Judge Mode</span>
            </button>
          </div>
        </div>

        {/* Acoustic Sonar Radial Wave Graphic in Background */}
        <div className="absolute top-1/2 -translate-y-1/2 right-8 w-60 h-60 hidden xl:flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-56 h-56 rounded-full border border-[#32E6D1] animate-ping" />
          <div className="w-40 h-40 rounded-full border border-[#32E6D1]/60 absolute" />
          <div className="w-24 h-24 rounded-full border border-[#32E6D1]/80 absolute" />
          <div className="w-8 h-8 rounded-full bg-[#32E6D1] absolute" />
        </div>
      </div>

      {/* 2. Executive SIH KPI Cards (Clean, Large, Uncluttered) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono">
        <div className="p-4 rounded-2xl bg-[#081118] border border-[#16303B] space-y-1 text-center">
          <span className="text-[10px] text-[#6F8992] uppercase block">Total Anomalies</span>
          <span className="text-2xl font-extrabold text-[#E4F2F5]">17</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081118] border border-[#FF5D5D]/30 space-y-1 text-center">
          <span className="text-[10px] text-[#FF5D5D] uppercase block font-bold">High Priority</span>
          <span className="text-2xl font-extrabold text-[#FF5D5D]">4</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081118] border border-[#32E6D1]/30 space-y-1 text-center">
          <span className="text-[10px] text-[#32E6D1] uppercase block font-bold">Top Confidence</span>
          <span className="text-2xl font-extrabold text-[#32E6D1]">94.7%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081118] border border-[#65D391]/30 space-y-1 text-center">
          <span className="text-[10px] text-[#65D391] uppercase block font-bold">Rocks Filtered</span>
          <span className="text-2xl font-extrabold text-[#65D391]">20</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081118] border border-[#16303B] space-y-1 text-center">
          <span className="text-[10px] text-[#6F8992] uppercase block">Surveyed Area</span>
          <span className="text-2xl font-extrabold text-[#E4F2F5]">12.84 km²</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#081118] border border-[#16303B] space-y-1 text-center">
          <span className="text-[10px] text-[#6F8992] uppercase block">Edge Latency</span>
          <span className="text-2xl font-extrabold text-[#29B6F6]">10.4 ms</span>
        </div>
      </div>

      {/* 3. Hero Target Spotlight Card */}
      <div className="p-5 md:p-6 rounded-3xl bg-[#081118] border border-[#32E6D1]/40 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black px-2 py-0.5 rounded bg-[#32E6D1] text-[#03070B] font-mono">
              FEATURED DETECTION: {heroTarget.id}
            </span>
            <h3 className="text-base font-bold text-[#E4F2F5] font-sans">
              {heroTarget.class} — High-Priority ALDFG Entanglement Hazard
            </h3>
          </div>

          <button
            onClick={() => {
              setSelectedTargetId('SX-T07');
              setActiveTab('mission');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#32E6D1]/15 hover:bg-[#32E6D1]/25 border border-[#32E6D1]/40 text-[#32E6D1] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Inspect in Mission Control</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#0C171E] border border-[#16303B]">
            <span className="text-[9px] text-[#6F8992] uppercase block">AI Confidence</span>
            <strong className="text-base font-bold text-[#32E6D1]">94.7%</strong>
          </div>

          <div className="p-3 rounded-xl bg-[#0C171E] border border-[#16303B]">
            <span className="text-[9px] text-[#6F8992] uppercase block">Dimensions</span>
            <strong className="text-sm font-bold text-[#E4F2F5]">12.4m × 3.2m</strong>
          </div>

          <div className="p-3 rounded-xl bg-[#0C171E] border border-[#16303B]">
            <span className="text-[9px] text-[#6F8992] uppercase block">Acoustic Shadow</span>
            <strong className="text-sm font-bold text-[#32E6D1]">2.31m Relief</strong>
          </div>

          <div className="p-3 rounded-xl bg-[#0C171E] border border-[#16303B]">
            <span className="text-[9px] text-[#6F8992] uppercase block">Depth</span>
            <strong className="text-sm font-bold text-[#E4F2F5]">43.1 m</strong>
          </div>

          <div className="p-3 rounded-xl bg-[#0C171E] border border-[#16303B]">
            <span className="text-[9px] text-[#6F8992] uppercase block">Coordinates</span>
            <strong className="text-xs font-bold text-[#E4F2F5] truncate block">18.9217°N, 72.8214°E</strong>
          </div>
        </div>
      </div>

      {/* 4. Scientific Charts (Debris Classification & Noise Reduction Ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Debris Class Breakdown (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-[#081118] border border-[#16303B] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#E4F2F5] uppercase tracking-wider font-sans">
              MARINE DEBRIS CLASSIFICATION
            </h4>
            <span className="text-[9px] text-[#6F8992]">17 Valid Anomalies</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={debrisDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {debrisDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0C171E',
                    borderColor: '#16303B',
                    borderRadius: '0.75rem',
                    color: '#E4F2F5',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {debrisDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[#6F8992]">{item.name}</span>
                <strong className="text-[#E4F2F5] ml-auto">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Noise Filtering & Candidate Funnel Per Trackline (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-[#081118] border border-[#16303B] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#E4F2F5] uppercase tracking-wider font-sans">
              NOISE FILTERING FUNNEL BY TRACKLINE
            </h4>
            <span className="text-[9px] text-[#65D391]">20 Rocks Suppressed</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={surveySwathTrend} barGap={4}>
                <XAxis dataKey="track" stroke="#6F8992" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F8992" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0C171E',
                    borderColor: '#16303B',
                    borderRadius: '0.75rem',
                    color: '#E4F2F5',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Bar dataKey="filtered" fill="#FF5D5D" name="Filtered Natural Noise" radius={[4, 4, 0, 0]} />
                <Bar dataKey="valid" fill="#32E6D1" name="Valid Debris Targets" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6F8992] pt-1 border-t border-[#16303B]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#FF5D5D]" />
              <span>Natural Formations Filtered</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#32E6D1]" />
              <span>Valid Debris Targets</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
