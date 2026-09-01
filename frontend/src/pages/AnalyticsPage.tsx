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
      <h3 className="text-xs font-mono font-black text-[#E4F2F5] uppercase tracking-wider">{title}</h3>
      {sub && <p className="text-[9px] font-mono text-[#66848D]">{sub}</p>}
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({
  label, value, sub, color = '#32E6D1',
}) => (
  <div className="p-4 rounded-xl bg-[#081118] border border-[#16303B]">
    <p className="text-[9px] font-mono text-[#66848D] uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-mono font-black mt-1" style={{ color }}>{value}</p>
    {sub && <p className="text-[9px] font-mono text-[#66848D] mt-0.5">{sub}</p>}
  </div>
);

const CHART_TOOLTIP = {
  contentStyle: { background: '#081118', border: '1px solid #16303B', borderRadius: 8, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle: { color: '#E4F2F5' },
  itemStyle: { color: '#32E6D1' },
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-black text-[#E4F2F5] tracking-tight">Mission Analytics</h1>
          <p className="text-sm font-mono text-[#66848D] mt-1">{MISSION_DATA.id} — {MISSION_DATA.name} · {MISSION_DATA.region}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C171E] border border-[#16303B] text-[#66848D] hover:text-[#E4F2F5] hover:border-[#32E6D1]/30 text-xs font-mono transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export JSON
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="col-span-2"><StatCard label="Surveyed Area" value={`${a.surveyedArea} km²`} sub="Coverage polygon" color="#32E6D1" /></div>
        <div className="col-span-2"><StatCard label="Mission Duration" value={a.duration} sub="Start → Completion" color="#29B6F6" /></div>
        <div className="col-span-2"><StatCard label="Track Length" value={`${a.trackLength} km`} sub="AUV path distance" color="#FFB547" /></div>
        <StatCard label="Targets" value={String(a.totalTargets)} sub="All contacts" color="#E4F2F5" />
        <StatCard label="Priority" value={String(a.priorityTargets)} sub="HIGH+ risk" color="#FF5D5D" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Avg Depth" value={`${a.avgDepth} m`} sub="Mean seafloor depth" color="#29B6F6" />
        <StatCard label="Coverage" value={`${a.coverage}%`} sub="Survey completeness" color="#65D391" />
        <StatCard label="Ping Rate" value="10 Hz" sub={`${MISSION_DATA.totalPings.toLocaleString()} total pings`} color="#E4F2F5" />
        <StatCard label="Sonar Freq" value={MISSION_DATA.frequency} sub={MISSION_DATA.sonarModel} color="#32E6D1" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Detections over time */}
        <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
          <SectionHeader icon={<Activity className="w-4 h-4 text-[#32E6D1]" />} title="Detections Over Time" sub="Cumulative contacts per mission interval" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={a.detectionsOverTime}>
              <defs>
                <linearGradient id="detGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#32E6D1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#32E6D1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="cumulative" stroke="#32E6D1" fill="url(#detGrad)" strokeWidth={2} dot={false} name="Cumulative" />
              <Bar dataKey="detections" fill="#29B6F6" name="New" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence distribution */}
        <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
          <SectionHeader icon={<BarChart2 className="w-4 h-4 text-[#29B6F6]" />} title="Confidence Distribution" sub="Target count by confidence range" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={a.confidenceDistribution}>
              <XAxis dataKey="range" tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Targets" radius={[3, 3, 0, 0]}>
                {a.confidenceDistribution.map((_, i) => (
                  <Cell key={i} fill={i < 2 ? '#FFB547' : i < 3 ? '#29B6F6' : '#32E6D1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class distribution */}
        <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
          <SectionHeader icon={<PieIcon className="w-4 h-4 text-[#FFB547]" />} title="Target Class Breakdown" sub="Object classification distribution" />
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
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[#E4F2F5] truncate max-w-[120px]">{name}</span>
                  </div>
                  <span className="font-bold" style={{ color }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depth distribution */}
        <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
          <SectionHeader icon={<Layers className="w-4 h-4 text-[#29B6F6]" />} title="Depth Distribution" sub="Target count by seafloor depth band" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={a.depthDistribution} layout="vertical">
              <XAxis type="number" tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis dataKey="range" type="category" tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} width={65} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" fill="#29B6F6" radius={[0, 3, 3, 0]} name="Targets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Coverage over time */}
        <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
          <SectionHeader icon={<Activity className="w-4 h-4 text-[#65D391]" />} title="Survey Coverage Over Time" sub="Area covered as percentage of survey polygon" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={a.coverageOverTime}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#65D391" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#65D391" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} domain={[0, 100]} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="coverage" stroke="#65D391" fill="url(#covGrad)" strokeWidth={2} dot={false} name="Coverage %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sonar intensity */}
        <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
          <SectionHeader icon={<Activity className="w-4 h-4 text-[#FFB547]" />} title="Sonar Backscatter Intensity" sub="Average acoustic intensity along track" />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={a.sonarIntensity}>
              <XAxis dataKey="segment" tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#66848D', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Line type="monotone" dataKey="intensity" stroke="#FFB547" strokeWidth={2} dot={{ fill: '#FFB547', r: 2 }} name="Intensity dB" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target register table */}
      <div className="p-5 rounded-2xl bg-[#081118] border border-[#16303B]">
        <SectionHeader icon={<Layers className="w-4 h-4 text-[#32E6D1]" />} title="Complete Target Register" sub={`${MISSION_TARGETS.length} contacts — Mission SX-014`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] font-mono">
            <thead className="border-b border-[#16303B] text-[#66848D] uppercase tracking-widest text-[9px]">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Class</th>
                <th className="py-2 px-3">Confidence</th>
                <th className="py-2 px-3">Depth</th>
                <th className="py-2 px-3">Dimensions</th>
                <th className="py-2 px-3">Risk</th>
                <th className="py-2 px-3">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16303B]/60">
              {MISSION_TARGETS.map(t => (
                <tr key={t.id} className="hover:bg-[#0C171E] transition-colors">
                  <td className="py-2 px-3 font-bold text-[#E4F2F5]">{t.id}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded border border-[#16303B] text-[#E4F2F5]" style={{ borderColor: t.color + '40', color: t.color }}>
                      {t.class}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-[#16303B] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.confidence * 100}%`, background: t.color }} />
                      </div>
                      <span style={{ color: t.color }}>{(t.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-[#29B6F6]">{t.depth} m</td>
                  <td className="py-2 px-3 text-[#66848D]">{t.length} × {t.width} m</td>
                  <td className="py-2 px-3">
                    <span className={`font-bold ${
                      t.risk === 'CRITICAL' ? 'text-[#FF5D5D]' :
                      t.risk === 'HIGH' ? 'text-[#FFB547]' :
                      t.risk === 'MEDIUM' ? 'text-[#29B6F6]' : 'text-[#65D391]'
                    }`}>{t.risk}</span>
                  </td>
                  <td className="py-2 px-3 text-[#32E6D1]">{t.lat.toFixed(4)}°N  {t.lon.toFixed(4)}°E</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
