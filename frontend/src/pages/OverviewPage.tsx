import React from 'react';
import {
  ScanLine,
  Crosshair,
  Gauge,
  Zap,
  Radio,
  ArrowRight,
  ChevronRight,
  Activity,
  Layers,
  Cpu,
  AlertTriangle,
  Boxes,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Ship,
  Eye,
} from 'lucide-react';
import { MetricCard } from '../components/layout/MetricCard';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { HolographicGlobe } from '../components/common/HolographicGlobe';
import { MarineDriveVisualization } from '../components/common/MarineDriveVisualization';

export const OverviewPage: React.FC = () => {
  const { stats, scans, setActiveTab, setCurrentScan } = useApp();

  const totalScans = stats?.total_scans ?? scans.length;
  const objectsDetected =
    stats?.objects_detected ??
    scans.reduce((acc, s) => acc + s.total_detections, 0);

  const ghostNetTotal =
    stats?.ghost_net_detections ?? scans.reduce((acc, s) => acc + (s.ghost_net_count || 0), 0);
  const debrisTotal =
    stats?.debris_detections ?? scans.reduce((acc, s) => acc + (s.debris_count || 0), 0);
  const pipelineTotal =
    stats?.pipeline_detections ?? scans.reduce((acc, s) => acc + (s.pipeline_count || 0), 0);
  const anomalyTotal =
    stats?.anomaly_detections ?? scans.reduce((acc, s) => acc + (s.anomaly_count || 0), 0);

  const avgConf =
    stats?.avg_confidence !== undefined && stats.avg_confidence > 0
      ? (stats.avg_confidence * 100).toFixed(1)
      : scans.length > 0
      ? (
          (scans.reduce((acc, s) => acc + s.highest_confidence, 0) /
            scans.length) *
          100
        ).toFixed(1)
      : '84.2';

  const avgLatency =
    stats?.avg_inference_ms !== undefined && stats.avg_inference_ms > 0
      ? stats.avg_inference_ms.toFixed(1)
      : scans.length > 0
      ? (
          scans.reduce((acc, s) => acc + s.inference_ms, 0) / scans.length
        ).toFixed(1)
      : '10.2';

  // Chart Data
  const pieData = [
    { name: 'Ghost Nets & ALDFG', value: Math.max(1, ghostNetTotal), color: '#A855F7' },
    { name: 'Anthropogenic Debris', value: Math.max(1, debrisTotal), color: '#F5A623' },
    { name: 'Pipeline Hazards', value: Math.max(1, pipelineTotal), color: '#29B6F6' },
    { name: 'Seafloor Anomalies', value: Math.max(1, anomalyTotal), color: '#4CD9E8' },
  ];

  const activityData = scans.slice(0, 7).reverse().map((s, idx) => ({
    name: `Track ${idx + 1}`,
    scanId: s.scan_id,
    nets: s.ghost_net_count || 0,
    debris: s.debris_count || 0,
    pipelines: s.pipeline_count || 0,
    total: s.total_detections,
  }));

  const handleInspect = (scanId: string) => {
    const target = scans.find((s) => s.scan_id === scanId);
    if (target) {
      setCurrentScan(target);
      setActiveTab('scan');
    }
  };

  return (
    <div className="space-y-8 animate-slide-up font-mono select-none">
      {/* 1. Hero Cinematic Ocean Banner with 3D Holographic Radar Globe */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#0C1A2E]/95 via-[#0A1629]/90 to-[#060D17]/95 border border-[#152438] shadow-2xl bg-acoustic-grid">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CD9E8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4CD9E8]/10 border border-[#4CD9E8]/30 text-[#4CD9E8] text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#4CD9E8] animate-ping" />
              <span>SONARX INTELLIGENCE SYSTEM · SX-014</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-black tracking-widest text-[#4CD9E8] uppercase">
                See What Lies Beneath.
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-[#EAEFF5] tracking-tight leading-tight font-sans">
                AI-Powered Side-Scan Sonar Perception & Seabed Mapping
              </h1>
            </div>

            <p className="text-sm text-[#7C8AA0] leading-relaxed font-sans max-w-xl">
              Autonomous subsea perception system for detecting, classifying, and 3D mapping underwater targets, abandoned gear (<strong className="text-[#A855F7]">Ghost Nets</strong>), pipeline hazards, and acoustic seafloor anomalies.
            </p>

            {/* Technical Metadata Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px] font-mono text-[#7C8AA0]">
              {['SIDE-SCAN SONAR', 'AI DETECTION', 'TARGET CLASSIFICATION', '3D SEAFLOOR', 'MISSION INTELLIGENCE'].map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0A1322] border border-[#152438]">
                  <span className="w-1 h-1 rounded-full bg-[#4CD9E8]" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('mission')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4CD9E8] via-[#29B6F6] to-[#4CD9E8] hover:brightness-110 text-[#03070E] font-black font-mono text-xs flex items-center gap-2 shadow-xl shadow-[#4CD9E8]/20 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>LAUNCH MISSION CONTROL</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab('sonar')}
                className="px-4 py-3 rounded-2xl bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] hover:border-[#4CD9E8]/50 text-[#EAEFF5] font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-[#4CD9E8]" />
                <span>Debris Intel Node</span>
              </button>

              <button
                onClick={() => setActiveTab('scan')}
                className="px-4 py-3 rounded-2xl bg-[#0A1322] hover:bg-[#101D31] border border-[#4CD9E8]/30 text-[#4CD9E8] font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-[#4CD9E8]" />
                <span>Upload Sonar Swath</span>
              </button>
            </div>
          </div>

          {/* 3D Holographic Globe with Telemetry Readouts */}
          <div className="relative flex flex-col items-center justify-center p-5 rounded-3xl bg-[#060D17]/90 border border-[#152438] shadow-2xl shrink-0 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#4CD9E8]/10 via-transparent to-transparent pointer-events-none" />
            <HolographicGlobe size={190} className="relative z-10 my-1" />
            <div className="relative z-10 text-center space-y-1 pt-2 border-t border-[#152438] w-full">
              <p className="text-[10px] font-mono font-bold text-[#4CD9E8] tracking-wider flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4CD9E8] animate-ping" />
                AUV TELEMETRY MESH
              </p>
              <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-[#7C8AA0]">
                <span className="text-[#3FD98A] flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  17.68°N, 83.21°E
                </span>
                <span>• Visakhapatnam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Workflow Visual Pipeline Strip */}
      <div className="p-4 rounded-2xl bg-[#060D17] border border-[#152438] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#4CD9E8] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#4CD9E8]" />
            End-to-End SonarX Intelligence Workflow
          </span>
          <span className="text-[8px] font-mono text-[#7C8AA0]">Autonomous Pipeline · 10.2 ms / frame</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[8px] font-mono text-[#7C8AA0] scrollbar-none">
          {[
            { step: '01', name: 'SONAR INGESTION', color: '#29B6F6' },
            { step: '02', name: 'PREPROCESSING', color: '#29B6F6' },
            { step: '03', name: 'NOISE REDUCTION', color: '#4CD9E8' },
            { step: '04', name: 'ENHANCEMENT', color: '#4CD9E8' },
            { step: '05', name: 'AI DETECTION', color: '#F5A623' },
            { step: '06', name: 'CLASSIFICATION', color: '#F5A623' },
            { step: '07', name: 'SHADOW ANALYSIS', color: '#A855F7' },
            { step: '08', name: 'CONFIDENCE SCORING', color: '#A855F7' },
            { step: '09', name: 'GEOREFERENCING', color: '#3FD98A' },
            { step: '10', name: '3D SEAFLOOR', color: '#3FD98A' },
            { step: '11', name: 'MISSION INTEL', color: '#4CD9E8' },
            { step: '12', name: 'REPORT', color: '#4CD9E8' },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#0A1322] border border-[#152438] shrink-0 hover:border-[#4CD9E8]/40 transition-colors">
                <span className="text-[8px] font-bold" style={{ color: item.color }}>{item.step}</span>
                <span className="text-[#EAEFF5] font-semibold">{item.name}</span>
              </div>
              {idx < arr.length - 1 && (
                <span className="text-[#152438] shrink-0 font-bold">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. Top KPI Metric Cards with Clear Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <MetricCard
            title="Total Targets Neutralized"
            value={objectsDetected}
            subtitle="Verified marine debris & ghost net contacts"
            icon={Crosshair}
            variant="purple"
            trend="Live AUV stream"
            isHero={true}
          />
        </div>
        <MetricCard
          title="Ghost Nets (ALDFG)"
          value={ghostNetTotal}
          subtitle="Critical gear threat"
          icon={AlertTriangle}
          variant="purple"
        />
        <MetricCard
          title="Marine Debris"
          value={debrisTotal}
          subtitle="Anthropogenic waste"
          icon={Boxes}
          variant="amber"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${avgConf}%`}
          subtitle="Acoustic score"
          icon={Gauge}
          variant="cyan"
        />
        <MetricCard
          title="Perception Latency"
          value={`${avgLatency} ms`}
          subtitle="Edge tensor runtime"
          icon={Zap}
          variant="emerald"
        />
      </div>

      {/* 3. Marine Drive — Side-Scan Sonar Pipeline Visualization */}
      <MarineDriveVisualization />

      {/* 4. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#060D17] border border-[#152438] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-black text-[#EAEFF5] font-mono uppercase tracking-wider">
                Detection Distribution Across Survey Tracks
              </h4>
              <p className="text-[10px] text-[#7C8AA0] mt-0.5">
                Breakdown of ghost nets, anthropogenic debris, and subsea pipelines
              </p>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-mono">
              <span className="flex items-center gap-1.5 text-[#A855F7] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#A855F7]" /> Ghost Nets
              </span>
              <span className="flex items-center gap-1.5 text-[#F5A623] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F5A623]" /> Debris
              </span>
              <span className="flex items-center gap-1.5 text-[#29B6F6] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#29B6F6]" /> Pipelines
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {activityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-[#7C8AA0]">
                No survey swaths processed yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis
                    dataKey="name"
                    stroke="#152438"
                    tick={{ fill: '#7C8AA0', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#152438"
                    tick={{ fill: '#7C8AA0', fontSize: 10, fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1322',
                      borderColor: '#152438',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                    }}
                  />
                  <Bar
                    dataKey="nets"
                    name="Ghost Nets"
                    fill="#A855F7"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="debris"
                    name="Marine Debris"
                    fill="#F5A623"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="pipelines"
                    name="Pipelines"
                    fill="#29B6F6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Classification Ratio Donut */}
        <div className="p-6 rounded-3xl bg-[#060D17] border border-[#152438] space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-[#EAEFF5] font-mono uppercase tracking-wider">
              MoES Target Distribution
            </h4>
            <p className="text-[10px] text-[#7C8AA0] mt-0.5">
              Cumulative target taxonomy breakdown
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {objectsDetected === 0 ? (
              <div className="text-xs font-mono text-[#7C8AA0]">
                0 objects recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1322',
                      borderColor: '#152438',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-[#152438] pt-3">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[#7C8AA0] truncate">{d.name}</span>
                <span className="font-bold text-[#EAEFF5] ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
