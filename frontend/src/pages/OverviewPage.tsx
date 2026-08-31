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
} from 'lucide-react';
import { MetricCard } from '../components/layout/MetricCard';
import { Badge } from '../components/common/Badge';
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
  const { stats, scans, setActiveTab, setCurrentScan, modelInfo } = useApp();

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
    { name: 'Anthropogenic Debris', value: Math.max(1, debrisTotal), color: '#F59E0B' },
    { name: 'Pipeline Hazards', value: Math.max(1, pipelineTotal), color: '#3B82F6' },
    { name: 'Seafloor Anomalies', value: Math.max(1, anomalyTotal), color: '#06B6D4' },
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
    <div className="space-y-8 animate-slide-up">
      {/* 1. Hero Cinematic Banner with 3D Holographic Radar Globe */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-cyan-500/25 p-6 md:p-8 bg-gradient-to-r from-[#0C162E]/95 via-[#0B152B]/85 to-[#070D1B]/95 shadow-2xl bg-acoustic-grid">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Ministry of Earth Sciences (MoES) — SIH AI Pipeline Active</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Automated Marine Debris & Ghost Net Perception
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Real-time deep learning detection of abandoned fishing gear (<strong className="text-purple-400">Ghost Nets / ALDFG</strong>), anthropogenic debris, subsea pipelines, and acoustic seafloor anomalies from Side-Scan Sonar (SSS) drone swaths.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('scan')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold font-mono text-xs flex items-center gap-2 shadow-xl shadow-cyan-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                <ScanLine className="w-4 h-4" />
                <span>Upload Drone Sonar Swath</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-2 transition-all hover:border-cyan-500/40"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Geospatial Sonar Map</span>
              </button>

              <button
                onClick={() => setActiveTab('model')}
                className="px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Model Architecture Intel</span>
              </button>
            </div>
          </div>

          {/* 3D Holographic Globe with Telemetry Readouts */}
          <div className="relative flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-950/80 border border-cyan-500/30 shadow-2xl shrink-0 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
            <HolographicGlobe size={190} className="relative z-10 my-1" />
            <div className="relative z-10 text-center space-y-1 pt-2 border-t border-slate-800/80 w-full">
              <p className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                AUV TELEMETRY MESH
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  17.68°N, 83.21°E
                </span>
                <span>• Visakhapatnam</span>
              </div>
            </div>
          </div>
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
          title="ONNX Latency"
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
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
                Detection Distribution Across Survey Tracks
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of ghost nets, anthropogenic debris, and subsea pipelines
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Ghost Nets
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Debris
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Pipelines
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {activityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                No survey swaths processed yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#091024',
                      borderColor: 'rgba(56, 189, 248, 0.2)',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
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
                    fill="#F59E0B"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="pipelines"
                    name="Pipelines"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Classification Ratio Donut */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              MoES Target Distribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative target taxonomy breakdown
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {objectsDetected === 0 ? (
              <div className="text-xs font-mono text-slate-400">
                0 objects recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={6}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#091024',
                      borderColor: 'rgba(56, 189, 248, 0.2)',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-800 pt-3">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30">
              <p className="text-purple-400 font-extrabold text-lg">{ghostNetTotal}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5 font-medium">Ghost Nets</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
              <p className="text-amber-400 font-extrabold text-lg">{debrisTotal}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5 font-medium">Debris</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Drone Survey Scans Table */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              Recent Drone Survey Swaths
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry feed of processed side-scan sonar waterfall swaths
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            <span>View Full Archive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {scans.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <ScanLine className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
            <p className="text-xs font-mono text-slate-400">
              No sonar scans in history yet. Upload a drone sonar scan or enable Demo Mode.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080E1C]/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Scan ID</th>
                  <th className="py-3 px-3">Source Track</th>
                  <th className="py-3 px-3">Model</th>
                  <th className="py-3 px-3">Targets</th>
                  <th className="py-3 px-3">Peak Confidence</th>
                  <th className="py-3 px-3">Latency</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.slice(0, 6).map((scan) => (
                  <tr
                    key={scan.scan_id}
                    className="hover:bg-cyan-950/20 transition-colors text-slate-300"
                  >
                    <td className="py-3 px-3 font-bold text-cyan-300">
                      {scan.scan_id}
                    </td>
                    <td className="py-3 px-3 text-slate-200 max-w-[180px] truncate font-medium">
                      {scan.filename}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {scan.model_name?.includes('Marine-Debris') ? 'SIH V2' : 'MILCO Baseline'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100">
                      {scan.total_detections}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100">
                      {(scan.highest_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {scan.inference_ms.toFixed(1)} ms
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleInspect(scan.scan_id)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all font-semibold active:scale-95"
                      >
                        Inspect Swath
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
