import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';
import { MISSION_ANALYTICS } from '../data/analytics';
import { MISSION_DATA } from '../data/mission';
import { useApp } from '../context/AppContext';
import { PredictionResponse, Detection } from '../types';
import { Activity, BarChart2, PieChart as PieIcon, Layers, Download, Radio, ShieldCheck } from 'lucide-react';

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div className="flex items-center gap-2 mb-3">
    {icon}
    <div>
      <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">{title}</h3>
      {sub && <p className="text-[10px] font-mono text-slate-400">{sub}</p>}
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({
  label, value, sub, color = '#FFB703',
}) => (
  <div className="p-3.5 sm:p-4 rounded-xl subpixel-card border border-white/[0.08] transition-all hover:border-[#FFB703]/40">
    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest truncate">{label}</p>
    <p className="text-xl sm:text-2xl font-mono font-black mt-1 truncate" style={{ color }}>{value}</p>
    {sub && <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">{sub}</p>}
  </div>
);

const CHART_TOOLTIP = {
  contentStyle: { background: '#070B12', border: '1px solid rgba(255, 183, 3, 0.3)', borderRadius: 8, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle: { color: '#FFFFFF' },
  itemStyle: { color: '#FFB703' },
};

export const AnalyticsPage: React.FC = () => {
  const { scans, stats, isBackendConnected } = useApp();
  const staticA = MISSION_ANALYTICS;

  // 1. Dynamic Analytics Calculation across all ingested scans + fallback
  const dynamicMetrics = useMemo(() => {
    const totalScansCount = scans.length > 0 ? scans.length : (stats?.total_scans || 1);
    
    // Accumulate target detections
    let ghostNetCount = 0;
    let debrisCount = 0;
    let pipelineCount = 0;
    let anomalyCount = 0;
    let totalDetectionsCount = 0;
    let totalConfidenceSum = 0;
    let confCounts = { '90-100%': 0, '75-89%': 0, '50-74%': 0, '25-49%': 0, '<25%': 0 };

    if (scans.length > 0) {
      scans.forEach((s: PredictionResponse) => {
        const dets = s.detections || [];
        totalDetectionsCount += dets.length;
        dets.forEach((d: Detection) => {
          totalConfidenceSum += d.confidence;
          const conf = d.confidence;
          if (conf >= 0.90) confCounts['90-100%']++;
          else if (conf >= 0.75) confCounts['75-89%']++;
          else if (conf >= 0.50) confCounts['50-74%']++;
          else if (conf >= 0.25) confCounts['25-49%']++;
          else confCounts['<25%']++;

          const t = d.type.toLowerCase();
          if (t.includes('net') || t.includes('aldfg')) ghostNetCount++;
          else if (t.includes('pipe') || t.includes('cable')) pipelineCount++;
          else if (t.includes('debris') || t.includes('gear') || t.includes('drum')) debrisCount++;
          else anomalyCount++;
        });
      });
    } else {
      ghostNetCount = 4;
      debrisCount = 3;
      pipelineCount = 2;
      anomalyCount = 2;
      totalDetectionsCount = 11;
      totalConfidenceSum = 11 * 0.884;
      confCounts = { '90-100%': 5, '75-89%': 4, '50-74%': 2, '25-49%': 0, '<25%': 0 };
    }

    const avgConfidence = totalDetectionsCount > 0 ? (totalConfidenceSum / totalDetectionsCount) * 100 : 88.4;

    const classDist = [
      { name: 'Ghost Net (ALDFG)', count: ghostNetCount, color: '#FFB703' },
      { name: 'Anthropogenic Debris', count: debrisCount, color: '#F59E0B' },
      { name: 'Subsea Pipeline Hazard', count: pipelineCount, color: '#38BDF8' },
      { name: 'Seafloor Anomaly', count: anomalyCount, color: '#FFFFFF' },
    ];

    const confDist = [
      { range: '90-100%', count: confCounts['90-100%'] },
      { range: '75-89%',  count: confCounts['75-89%'] },
      { range: '50-74%',  count: confCounts['50-74%'] },
      { range: '25-49%',  count: confCounts['25-49%'] },
      { range: '<25%',    count: confCounts['<25%'] },
    ];

    return {
      totalScansCount,
      totalDetectionsCount,
      ghostNetCount,
      debrisCount,
      pipelineCount,
      anomalyCount,
      avgConfidence,
      classDist,
      confDist,
    };
  }, [scans, stats]);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      mission: MISSION_DATA.id,
      metrics: dynamicMetrics,
      analytics: staticA,
      generated_at: new Date().toISOString()
    }, null, 2));
    const a2 = document.createElement('a');
    a2.setAttribute('href', dataStr);
    a2.setAttribute('download', `SONARX_TelemetryAnalytics_${Date.now()}.json`);
    document.body.appendChild(a2);
    a2.click();
    a2.remove();
  };

  return (
    <div className="space-y-6 w-full font-sans select-none text-slate-100">
      {/* Page header banner */}
      <div className="p-4 sm:p-5 rounded-2xl subpixel-card border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">Mission Analytics & Telemetry</h1>
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${isBackendConnected ? 'bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/30' : 'bg-white/[0.05] text-slate-300 border border-white/[0.1]'}`}>
              {isBackendConnected ? 'LIVE ONNX DATA' : 'SURVEY ACTIVE'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {MISSION_DATA.id} — {MISSION_DATA.name} · {MISSION_DATA.region}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-[#FFB703]/50 text-white hover:text-[#FFB703] text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics JSON</span>
        </button>
      </div>

      {/* KPI row: 1-col on mobile, 2-col on small tablet, 4-col on tablet, 8-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        <div className="col-span-2"><StatCard label="Surveyed Area" value={`${staticA.surveyedArea} km²`} sub="EEZ Hydrographic Grid" color="#FFB703" /></div>
        <div className="col-span-2"><StatCard label="Live Ingested Scans" value={String(dynamicMetrics.totalScansCount)} sub="Active Waterfall Swaths" color="#FFFFFF" /></div>
        <div className="col-span-2"><StatCard label="Total Detections" value={String(dynamicMetrics.totalDetectionsCount)} sub="Confirmed Underwater Targets" color="#FFB703" /></div>
        <StatCard label="Avg Conf" value={`${dynamicMetrics.avgConfidence.toFixed(1)}%`} sub="Acoustic Fit" color="#FCD34D" />
        <StatCard label="Ghost Nets" value={String(dynamicMetrics.ghostNetCount)} sub="Priority 1 ALDFG" color="#FFB703" />
      </div>

      {/* Second KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard label="Seafloor Depth" value={`${staticA.avgDepth} m`} sub="Continental Shelf Mean" color="#FFFFFF" />
        <StatCard label="Track Length" value={`${staticA.trackLength} km`} sub="AUV Survey Distance" color="#FFB703" />
        <StatCard label="False Positives Cut" value="92%" sub="Acoustic Shadow Verification" color="#10B981" />
        <StatCard label="ONNX Transducer" value={MISSION_DATA.frequency} sub="900 kHz CHIRP Side-Scan" color="#FFB703" />
      </div>

      {/* Charts grid: 1-col on mobile, 2-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* 1. Detections over time */}
        <div className="p-4 sm:p-5 rounded-2xl subpixel-card border border-white/[0.08] shadow-lg">
          <SectionHeader icon={<Activity className="w-4 h-4 text-[#FFB703]" />} title="Detections Over Survey Track" sub="Cumulative contacts per hydrographic transect interval" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={staticA.detectionsOverTime}>
              <defs>
                <linearGradient id="detGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB703" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFB703" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="cumulative" stroke="#FFB703" fill="url(#detGrad)" strokeWidth={2} dot={false} name="Cumulative" />
              <Bar dataKey="detections" fill="#F59E0B" name="New" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Confidence distribution */}
        <div className="p-4 sm:p-5 rounded-2xl subpixel-card border border-white/[0.08] shadow-lg">
          <SectionHeader icon={<BarChart2 className="w-4 h-4 text-[#FFB703]" />} title="Confidence Score Distribution" sub="Target count across neural probability tiers" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dynamicMetrics.confDist}>
              <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Targets" radius={[4, 4, 0, 0]}>
                {dynamicMetrics.confDist.map((_: { range: string; count: number }, i: number) => (
                  <Cell key={i} fill={i === 0 ? '#FFB703' : i === 1 ? '#F59E0B' : i === 2 ? '#D97706' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Class distribution */}
        <div className="p-4 sm:p-5 rounded-2xl subpixel-card border border-white/[0.08] shadow-lg">
          <SectionHeader icon={<PieIcon className="w-4 h-4 text-[#FFB703]" />} title="Target Taxonomy Breakdown" sub="Classification distribution of verified contacts" />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={dynamicMetrics.classDist} cx="50%" cy="50%" innerRadius={42} outerRadius={70} dataKey="count" strokeWidth={0}>
                  {dynamicMetrics.classDist.map((entry: { name: string; count: number; color: string }, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full space-y-1.5">
              {dynamicMetrics.classDist.map(({ name, count, color }: { name: string; count: number; color: string }) => (
                <div key={name} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded hover:bg-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: color }} />
                    <span className="text-slate-200 font-medium">{name}</span>
                  </div>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Depth breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl subpixel-card border border-white/[0.08] shadow-lg">
          <SectionHeader icon={<Layers className="w-4 h-4 text-[#FFB703]" />} title="Seafloor Depth Strata" sub="Target contacts by bathymetric depth band" />
          <div className="space-y-3">
            {staticA.depthDistribution.map(({ range, count }) => (
              <div key={range} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="font-bold text-[#FFB703]">{range}</span>
                  <span className="text-slate-400">{count} targets ({Math.round((count / staticA.totalTargets) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-[#06090F] rounded-full overflow-hidden border border-white/[0.08]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#FFB703] to-[#F59E0B]" style={{ width: `${(count / staticA.totalTargets) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
