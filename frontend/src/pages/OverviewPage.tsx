import React from 'react';
import {
  ScanLine,
  Crosshair,
  AlertOctagon,
  Shield,
  Gauge,
  Zap,
  TrendingUp,
  FileText,
  Eye,
  Trash2,
  Calendar,
  Sparkles,
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

export const OverviewPage: React.FC = () => {
  const { stats, scans, setActiveTab, setCurrentScan, deleteScan, isDemoMode } =
    useApp();

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

  // Chart Data: Class Distribution
  const pieData = [
    { name: 'MILCO (Mine-Like)', value: milcoTotal, color: '#EF4444' },
    { name: 'NOMBO (Obstacle)', value: nomboTotal, color: '#06B6D4' },
  ];

  // Chart Data: Scans Activity
  const activityData = scans.slice(0, 7).reverse().map((s, idx) => ({
    name: `Scan ${idx + 1}`,
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
    <div className="space-y-6">
      {/* Banner if Demo Mode */}
      {isDemoMode && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Demo Environment Active:</strong> Displaying pre-computed benchmark survey dataset.
            </span>
          </div>
          <span className="text-[11px] text-amber-400/80">Offline Autonomous Mode</span>
        </div>
      )}

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Scans"
          value={totalScans}
          subtitle="Processed tracks"
          icon={ScanLine}
          variant="cyan"
        />
        <MetricCard
          title="Objects Detected"
          value={objectsDetected}
          subtitle="Acoustic targets"
          icon={Crosshair}
          variant="blue"
        />
        <MetricCard
          title="MILCO Targets"
          value={milcoTotal}
          subtitle="Mine-like contacts"
          icon={AlertOctagon}
          variant="red"
        />
        <MetricCard
          title="NOMBO Targets"
          value={nomboTotal}
          subtitle="Bottom obstacles"
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
          title="Avg Latency"
          value={`${avgLatency} ms`}
          subtitle="ONNX Inference"
          icon={Zap}
          variant="cyan"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Timeline */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Detection Activity Over Recent Tracks
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Target breakdown across recently analyzed survey tracks
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> MILCO
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> NOMBO
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
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
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="milco" name="MILCO" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nombo" name="NOMBO" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Classification Ratio Donut */}
        <div className="p-5 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Classification Distribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative target taxonomy ratio
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
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-800/80 pt-3">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <p className="text-red-400 font-bold text-base">{milcoTotal}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">MILCO</p>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <p className="text-cyan-400 font-bold text-base">{nomboTotal}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">NOMBO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-6 rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Recent Survey Scans
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live log of side-scan sonar image inferences
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scan')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Launch New Scan</span>
          </button>
        </div>

        {scans.length === 0 ? (
          <div className="p-8 text-center rounded-lg bg-[#080E1C] border border-slate-800 space-y-3">
            <ScanLine className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-mono text-slate-400">
              No sonar scans in history yet. Upload a scan or enable Demo Mode.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080E1C] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Scan ID</th>
                  <th className="py-2.5 px-3">File</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Detections</th>
                  <th className="py-2.5 px-3">MILCO / NOMBO</th>
                  <th className="py-2.5 px-3">Peak Confidence</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.slice(0, 6).map((scan) => (
                  <tr
                    key={scan.scan_id}
                    className="hover:bg-slate-900/60 transition-colors text-slate-300"
                  >
                    <td className="py-3 px-3 font-bold text-cyan-300">
                      {scan.scan_id}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate">
                      {scan.filename}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(scan.created_at).toLocaleDateString()}{' '}
                      {new Date(scan.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-100">
                      {scan.total_detections}
                    </td>
                    <td className="py-3 px-3 space-x-1">
                      <span className="text-red-400 font-semibold">
                        {scan.milco_count}M
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-cyan-400 font-semibold">
                        {scan.nombo_count}N
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100">
                      {(scan.highest_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {scan.inference_ms.toFixed(1)} ms
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleInspect(scan.scan_id)}
                        className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-colors"
                        title="Inspect Scan"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => deleteScan(scan.scan_id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Scan"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
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
