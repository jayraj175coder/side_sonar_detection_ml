import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line,
} from 'recharts';
import { MISSION_ANALYTICS } from '../data/analytics';
import { MISSION_DATA } from '../data/mission';
import { MISSION_TARGETS, PRIORITY_TARGETS } from '../data/targets';
import { Activity, BarChart2, PieChart as PieIcon, Layers, Download } from 'lucide-react';

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div className="flex items-center gap-2 mb-3">
    {icon}
    <div>
      <h3 className="text-xs font-mono font-black text-[#EAEFF5] uppercase tracking-wider">{title}</h3>
      {sub && <p className="text-[9px] font-mono text-[#7C8AA0]">{sub}</p>}
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({
  label, value, sub, color = '#4CD9E8',
}) => (
  <div className="p-4 rounded-xl bg-[#060D17] border border-[#152438]">
    <p className="text-[9px] font-mono text-[#7C8AA0] uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-mono font-black mt-1" style={{ color }}>{value}</p>
    {sub && <p className="text-[9px] font-mono text-[#7C8AA0] mt-0.5">{sub}</p>}
  </div>
);

const CHART_TOOLTIP = {
  contentStyle: { background: '#0A1322', border: '1px solid #152438', borderRadius: 8, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle: { color: '#EAEFF5' },
  itemStyle: { color: '#4CD9E8' },
};

export const AnalyticsPage: React.FC = () => {
  const a = MISSION_ANALYTICS;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(a, null, 2));
    const a2 = document.createElement('a');
    a2.setAttribute('href', dataStr);
    a2.setAttribute('download', `SX-014_analytics.json`);
    document.body.appendChild(a2);
    a2.click();
    a2.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono select-none">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-black text-[#EAEFF5] tracking-tight">Mission Analytics</h1>
          <p className="text-sm font-mono text-[#7C8AA0] mt-1">{MISSION_DATA.id} — {MISSION_DATA.name} · {MISSION_DATA.region}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A1322] border border-[#152438] text-[#7C8AA0] hover:text-[#EAEFF5] hover:border-[#4CD9E8]/30 text-xs font-mono transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#4CD9E8]" />
          Export JSON
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="col-span-2"><StatCard label="Surveyed Area" value={`${a.surveyedArea} km²`} sub="Coverage polygon" color="#4CD9E8" /></div>
        <div className="col-span-2"><StatCard label="Mission Duration" value={a.duration} sub="Start → Completion" color="#29B6F6" /></div>
        <div className="col-span-2"><StatCard label="Track Length" value={`${a.trackLength} km`} sub="AUV path distance" color="#F5A623" /></div>
        <StatCard label="Targets" value={String(a.totalTargets)} sub="All contacts" color="#EAEFF5" />
        <StatCard label="Priority" value={String(a.priorityTargets)} sub="HIGH+ risk" color="#F04438" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Avg Depth" value={`${a.avgDepth} m`} sub="Mean seafloor depth" color="#29B6F6" />
        <StatCard label="Coverage" value={`${a.coverage}%`} sub="Survey completeness" color="#3FD98A" />
        <StatCard label="Ping Rate" value="10 Hz" sub={`${MISSION_DATA.totalPings.toLocaleString()} total pings`} color="#EAEFF5" />
        <StatCard label="Sonar Freq" value={MISSION_DATA.frequency} sub={MISSION_DATA.sonarModel} color="#4CD9E8" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Detections over time */}
        <div className="p-5 rounded-2xl bg-[#060D17] border border-[#152438]">
          <SectionHeader icon={<Activity className="w-4 h-4 text-[#4CD9E8]" />} title="Detections Over Time" sub="Cumulative contacts per mission interval" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={a.detectionsOverTime}>
              <defs>
                <linearGradient id="detGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CD9E8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4CD9E8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#7C8AA0', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#7C8AA0', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="cumulative" stroke="#4CD9E8" fill="url(#detGrad)" strokeWidth={2} dot={false} name="Cumulative" />
              <Bar dataKey="detections" fill="#29B6F6" name="New" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence distribution */}
        <div className="p-5 rounded-2xl bg-[#060D17] border border-[#152438]">
          <SectionHeader icon={<BarChart2 className="w-4 h-4 text-[#29B6F6]" />} title="Confidence Distribution" sub="Target count by confidence range" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={a.confidenceDistribution}>
              <XAxis dataKey="range" tick={{ fill: '#7C8AA0', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#7C8AA0', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Targets" radius={[3, 3, 0, 0]}>
                {a.confidenceDistribution.map((_, i) => (
                  <Cell key={i} fill={i < 2 ? '#F5A623' : i < 3 ? '#29B6F6' : '#4CD9E8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class distribution */}
        <div className="p-5 rounded-2xl bg-[#060D17] border border-[#152438]">
          <SectionHeader icon={<PieIcon className="w-4 h-4 text-[#F5A623]" />} title="Target Class Breakdown" sub="Object classification distribution" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={a.classDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="count" strokeWidth={0}>
                  {a.classDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {a.classDistribution.map(({ name, count, color }) => (
                <div key={name} className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                    <span className="text-[#7C8AA0]">{name}</span>
                  </div>
                  <span className="font-bold text-[#EAEFF5]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depth breakdown */}
        <div className="p-5 rounded-2xl bg-[#060D17] border border-[#152438]">
          <SectionHeader icon={<Layers className="w-4 h-4 text-[#29B6F6]" />} title="Seafloor Depth Breakdown" sub="Target contacts by bathymetric depth band" />
          <div className="space-y-2.5">
            {a.depthDistribution.map(({ range, count }) => (
              <div key={range} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="font-bold text-[#4CD9E8]">{range}</span>
                  <span className="text-[#7C8AA0]">{count} targets ({Math.round((count / a.totalTargets) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#03070E] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#4CD9E8]" style={{ width: `${(count / a.totalTargets) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
