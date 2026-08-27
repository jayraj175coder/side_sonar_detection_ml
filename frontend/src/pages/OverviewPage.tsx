import React from 'react';
import {
  ScanLine,
  Crosshair,
  AlertOctagon,
  Shield,
  Gauge,
  Zap,
  Sparkles,
  Radio,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Cpu,
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

export const OverviewPage: React.FC = () => {
  const { stats, scans, setActiveTab, setCurrentScan, modelInfo } = useApp();

  const totalScans = stats?.total_scans ?? scans.length;
  const objectsDetected =
    stats?.objects_detected ??
    scans.reduce((acc, s) => acc + s.total_detections, 0);

  const milcoTotal =
    stats?.milco_detections ?? scans.reduce((acc, s) => acc + s.milco_count, 0);
  const nomboTotal =
    stats?.nombo_detections ?? scans.reduce((acc, s) => acc + s.nombo_count, 0);

  const avgConf =
    stats?.avg_confidence !== undefined && stats.avg_confidence > 0
      ? (stats.avg_confidence * 100).toFixed(1)
      : scans.length > 0
      ? (
          (scans.reduce((acc, s) => acc + s.highest_confidence, 0) /
            scans.length) *
          100
        ).toFixed(1)
      : '0.0';

  const avgLatency =
    stats?.avg_inference_ms !== undefined && stats.avg_inference_ms > 0
      ? stats.avg_inference_ms.toFixed(1)
      : scans.length > 0
      ? (
          scans.reduce((acc, s) => acc + s.inference_ms, 0) / scans.length
        ).toFixed(1)
      : '0.0';

  // Chart Data
  const pieData = [
    { name: 'MILCO (Mine-Like Contacts)', value: Math.max(1, milcoTotal), color: '#EF4444' },
    { name: 'NOMBO (Obstacle Hazards)', value: Math.max(1, nomboTotal), color: '#06B6D4' },
  ];

  const activityData = scans.slice(0, 7).reverse().map((s, idx) => ({
    name: `Track ${idx + 1}`,
    scanId: s.scan_id,
    milco: s.milco_count,
    nombo: s.nombo_count,
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
    <div className="space-y-8">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-cyan-500/25 p-6 md:p-8 bg-gradient-to-r from-[#0C162E]/90 via-[#0B152B]/80 to-[#070D1B]/90 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>YOLOv8n — MILCO/NOMBO Baseline Model Active</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Automated Side-Scan Sonar Target Inspection System
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Real-time deep learning detection of mine-like contacts (<strong className="text-red-400">MILCO</strong>) and non-mine bottom obstacles (<strong className="text-cyan-400">NOMBO</strong>) from side-scan sonar acoustic backscatter.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('scan')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold font-mono text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ScanLine className="w-4 h-4" />
                <span>Launch New Scan</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-2 transition-all"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Geospatial Sonar Map</span>
              </button>

              <button
                onClick={() => setActiveTab('model')}
                className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Marine Sonar V2 Specs</span>
              </button>
            </div>
          </div>

          {/* 3D Holographic Globe */}
          <div className="relative flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-950/70 border border-cyan-500/25 shadow-2xl shrink-0 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
            <HolographicGlobe size={180} className="relative z-10 my-1" />
            <div className="relative z-10 text-center space-y-0.5 pt-1 border-t border-slate-800/80 w-full">
              <p className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ACOUSTIC SENSOR MESH
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                Baseline Model Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Tracks"
          value={totalScans}
          subtitle="Processed scans"
          icon={ScanLine}
          variant="cyan"
        />
        <MetricCard
          title="Targets Logged"
          value={objectsDetected}
          subtitle="Acoustic contacts"
          icon={Crosshair}
          variant="blue"
        />
        <MetricCard
          title="MILCO Hazards"
          value={milcoTotal}
          subtitle="Mine-like contacts"
          icon={AlertOctagon}
          variant="red"
        />
        <MetricCard
          title="NOMBO Obstacles"
          value={nomboTotal}
          subtitle="Bottom debris"
          icon={Shield}
          variant="cyan"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${avgConf}%`}
          subtitle="Acoustic score"
          icon={Gauge}
          variant="neutral"
        />
        <MetricCard
          title="ONNX Latency"
          value={`${avgLatency} ms`}
          subtitle="Edge inference"
          icon={Zap}
          variant="cyan"
        />
      </div>

      {/* 3. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
                Detection Activity Over Recent Tracks
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Target breakdown across recently analyzed survey tracks
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> MILCO
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> NOMBO
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {activityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                No survey tracks processed yet.
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
                    dataKey="milco"
                    name="MILCO"
                    fill="#EF4444"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="nombo"
                    name="NOMBO"
                    fill="#06B6D4"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Classification Ratio Donut */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              Classification Ratio
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative target taxonomy distribution
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
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-red-500/20">
              <p className="text-red-400 font-extrabold text-lg">{milcoTotal}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">MILCO</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
              <p className="text-cyan-400 font-extrabold text-lg">{nomboTotal}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">NOMBO</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Scans Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              Recent Survey Scans
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live log of side-scan sonar image inferences
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
          <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <ScanLine className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-mono text-slate-400">
              No sonar scans in history yet. Upload a scan or enable Demo Mode.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080E1C]/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Scan ID</th>
                  <th className="py-3 px-3">Source Track</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Detections</th>
                  <th className="py-3 px-3">MILCO / NOMBO</th>
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
                    <td className="py-3 px-3 text-slate-200 max-w-[180px] truncate">
                      {scan.filename}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(scan.created_at).toLocaleDateString()}{' '}
                      {new Date(scan.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100">
                      {scan.total_detections}
                    </td>
                    <td className="py-3 px-3 space-x-1">
                      <span className="text-red-400 font-bold">
                        {scan.milco_count}M
                      </span>
                      <span className="text-slate-500">/</span>
                      <span className="text-cyan-400 font-bold">
                        {scan.nombo_count}N
                      </span>
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
                        className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all font-semibold"
                      >
                        Inspect
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
