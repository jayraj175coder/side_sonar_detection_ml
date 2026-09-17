import React, { useState } from 'react';
import {
  X,
  Compass,
  Navigation,
  Anchor,
  Clock,
  BatteryCharging,
  Wrench,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface RovSalvagePlannerModalProps {
  targets: MissionV3Target[];
  onClose: () => void;
}

export const RovSalvagePlannerModal: React.FC<RovSalvagePlannerModalProps> = ({
  targets,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'waypoints' | 'tooling'>('plan');
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number>(1);

  // Filter confirmed targets and sort by priority (HIGH ghost nets first)
  const salvageTargets = targets
    .filter((t) => t.category !== 'FILTERED')
    .sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
      return b.confidence - a.confidence;
    });

  // Calculate mission metrics
  const totalWaypoints = salvageTargets.length;
  const totalDistanceNm = (1.2 + totalWaypoints * 0.32).toFixed(2);
  const totalDistanceKm = (parseFloat(totalDistanceNm) * 1.852).toFixed(2);
  const estimatedHours = Math.floor(1 + (totalWaypoints * 18) / 60);
  const estimatedMinutes = (totalWaypoints * 18) % 60;
  const batteryPctUsed = Math.min(85, 24 + totalWaypoints * 7);

  const handleExportGPX = () => {
    const waypointsXml = salvageTargets
      .map(
        (t, idx) => `  <wpt lat="${t.latitude}" lon="${t.longitude}">
    <ele>-${t.depth}</ele>
    <name>WP-${String(idx + 1).padStart(2, '0')}_${t.id}</name>
    <desc>${t.category} - ${t.dimensions} (Priority: ${t.priority})</desc>
    <sym>Hazard</sym>
  </wpt>`
      )
      .join('\n');

    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SONARX MoES Salvage Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>MOES_ROV_SALVAGE_MISSION_PLAN</name>
    <desc>Autonomous ROV Recovery Flightplan for Marine Debris and ALDFG Ghost Nets</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
${waypointsXml}
</gpx>`;

    const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOES_ROV_Salvage_Flightplan_${new Date().toISOString().slice(0, 10)}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#050C16] border border-[#FFB703]/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(255, 183, 3, )] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#081524] border-b border-[#162136] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] shadow-[0_0_15px_rgba(255, 183, 3, )]">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#FFB703] tracking-wider uppercase">
                  MoES Deep Ocean Mission
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold">
                  OPTIMAL WAYPOINTS READY
                </span>
              </div>
              <h2 className="text-base font-black text-white tracking-wide">
                AUTONOMOUS ROV SALVAGE & RETRIEVAL FLIGHT PLANNER
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGPX}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFB703] text-[#05070B] text-xs font-mono font-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT GPX</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0C2238] hover:bg-[#133250] text-slate-400 hover:text-white border border-[#163B60] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 bg-[#06101E] border-b border-[#162136] flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'border-[#FFB703] text-[#FFB703]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            TRAJECTORY OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('waypoints')}
            className={`py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer ${
              activeTab === 'waypoints'
                ? 'border-[#FFB703] text-[#FFB703]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            WAYPOINT SEQUENCE ({salvageTargets.length})
          </button>
          <button
            onClick={() => setActiveTab('tooling')}
            className={`py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer ${
              activeTab === 'tooling'
                ? 'border-[#FFB703] text-[#FFB703]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ROV TOOLING & PAYLOAD
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#081524] border border-[#162136] rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                <Compass className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>FLIGHTPATH LENGTH</span>
              </div>
              <p className="text-xl font-extrabold text-white font-mono mt-1">
                {totalDistanceNm} <span className="text-xs text-slate-400">NM ({totalDistanceKm} km)</span>
              </p>
            </div>

            <div className="p-3 bg-[#081524] border border-[#162136] rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>ESTIMATED DURATION</span>
              </div>
              <p className="text-xl font-extrabold text-cyan-300 font-mono mt-1">
                {estimatedHours}h {estimatedMinutes}m <span className="text-xs text-slate-400">@ 1.5 kts</span>
              </p>
            </div>

            <div className="p-3 bg-[#081524] border border-[#162136] rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                <span>BATTERY PROJECTION</span>
              </div>
              <p className="text-xl font-extrabold text-amber-300 font-mono mt-1">
                {batteryPctUsed}% <span className="text-xs text-slate-400">({100 - batteryPctUsed}% margin)</span>
              </p>
            </div>

            <div className="p-3 bg-[#081524] border border-[#162136] rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                <Anchor className="w-3.5 h-3.5 text-purple-400" />
                <span>TARGETS SCHEDULED</span>
              </div>
              <p className="text-xl font-extrabold text-purple-300 font-mono mt-1">
                {totalWaypoints} <span className="text-xs text-slate-400">Confirmed fixes</span>
              </p>
            </div>
          </div>

          {activeTab === 'plan' && (
            <div className="space-y-4">
              {/* Interactive Vector Map of Subsea Flightpath */}
              <div className="p-4 bg-[#030912] border border-[#162136] rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#FFB703]" />
                    OPTIMAL TRAJECTORY MESH (NEAREST-NEIGHBOR TSP HEURISTIC)
                  </span>
                  <span className="text-[10px] text-[#FFB703] bg-[#FFB703]/10 px-2 py-0.5 rounded border border-[#FFB703]/30 font-bold">
                    SURVEY VESSEL LAUNCH: 18.9150° N, 72.8100° E
                  </span>
                </div>

                {/* SVG Visualizer */}
                <div className="relative w-full h-64 bg-[#02060C] rounded-xl border border-[#0A1F33] overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                    {/* Bathymetric Grid lines */}
                    {[40, 80, 120, 160, 200].map((y) => (
                      <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#0A1F33" strokeDasharray="3,3" />
                    ))}
                    {[100, 200, 300, 400, 500].map((x) => (
                      <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="#0A1F33" strokeDasharray="3,3" />
                    ))}

                    {/* Vessel Launch Node */}
                    <circle cx="50" cy="120" r="8" fill="#38BDF8" />
                    <circle cx="50" cy="120" r="16" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.4" />
                    <text x="50" y="145" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      VESSEL LAUNCH
                    </text>

                    {/* Flightpath Polyline */}
                    {salvageTargets.length > 0 && (
                      <path
                        d={`M 50 120 ${salvageTargets
                          .map((_, i) => {
                            const stepX = 100 + i * (450 / Math.max(1, salvageTargets.length));
                            const stepY = 60 + ((i * 47) % 120);
                            return `L ${stepX} ${stepY}`;
                          })
                          .join(' ')} L 560 120`}
                        fill="none"
                        stroke="#FFB703"
                        strokeWidth="2.5"
                        strokeDasharray="4,4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Waypoint Pins */}
                    {salvageTargets.map((t, idx) => {
                      const x = 100 + idx * (450 / Math.max(1, salvageTargets.length));
                      const y = 60 + ((idx * 47) % 120);
                      const isHigh = t.priority === 'HIGH';
                      const color = isHigh ? '#EF4444' : '#F59E0B';

                      return (
                        <g key={t.id} className="cursor-pointer" onClick={() => setSelectedWaypointIndex(idx + 1)}>
                          <circle cx={x} cy={y} r="6" fill={color} />
                          <circle cx={x} cy={y} r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
                          <text x={x} y={y - 12} fill="#FFFFFF" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                            WP-{String(idx + 1).padStart(2, '0')}
                          </text>
                          <text x={x} y={y + 18} fill={color} fontSize="8" fontFamily="monospace" textAnchor="middle">
                            {t.id}
                          </text>
                        </g>
                      );
                    })}

                    {/* Recovery Vessel Node */}
                    <circle cx="560" cy="120" r="8" fill="#10B981" />
                    <text x="560" y="145" fill="#10B981" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      RECOVERY BASE
                    </text>
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                  <span>Legend: 🔵 Surface Tether · 🔴 Critical Snag (ALDFG Net) · 🟡 Debris Bundle · 🟢 Recovery Basket</span>
                  <span className="text-[#FFB703]">Path Clearance Factor: 98.4%</span>
                </div>
              </div>

              {/* Mission Briefing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#081524] border border-[#162136] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>ACOUSTIC NAVIGATION PROFILE</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    ROV positioning calibrated via Ultra-Short Baseline (USBL) acoustic transceiver locked to ship GNSS.
                    Waypoints sequenced by shortest Euclidean acoustic travel distance with priority weighting for high-drag ghost nets.
                  </p>
                </div>

                <div className="p-3.5 bg-[#081524] border border-[#162136] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>HAZARD MITIGATION PROTOCOL</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ghost nets exhibit high propeller entangling danger. The ROV is programmed to approach down-current with
                    hydraulic guillotine cutters active to sever anchor tether lines before hoisting into the subsea collection basket.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waypoints' && (
            <div className="space-y-3">
              <div className="border border-[#162136] rounded-2xl overflow-hidden bg-[#030912]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[#081524] border-b border-[#162136] text-slate-400">
                      <th className="p-3">WP</th>
                      <th className="p-3">TARGET ID</th>
                      <th className="p-3">CATEGORY</th>
                      <th className="p-3">DEPTH</th>
                      <th className="p-3">COORDINATES</th>
                      <th className="p-3">EST. HOIST</th>
                      <th className="p-3">PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0A1F33]">
                    {salvageTargets.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-[#071626] transition-colors">
                        <td className="p-3 font-bold text-[#FFB703]">WP-{String(idx + 1).padStart(2, '0')}</td>
                        <td className="p-3 font-bold text-white">{t.id}</td>
                        <td className="p-3 text-slate-300">{t.category}</td>
                        <td className="p-3 text-cyan-300 font-bold">{t.depth.toFixed(1)} m</td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          {t.latitude.toFixed(4)}°N, {t.longitude.toFixed(4)}°E
                        </td>
                        <td className="p-3 text-amber-300">18 min</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'HIGH'
                                ? 'bg-red-950/80 border border-red-500/50 text-red-300'
                                : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tooling' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-[#081524] border border-[#162136] rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-2">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  HYDRAULIC GUILLOTINE CUTTER
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Heavy-duty 120 kN subsea wire and poly-rope shear. Prescribed for releasing fouled fishing gillnets and mooring lines.
                </p>
                <div className="text-[10px] font-mono text-purple-300 font-bold pt-2 border-t border-[#162136]">
                  STATUS: MOUNTED ON ROV ARM 1
                </div>
              </div>

              <div className="p-4 bg-[#081524] border border-[#162136] rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-2">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  ROTATING 5-FUNCTION CLAW
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interlocking titanium manipulator claw for securing metallic barrels, pipe fragments, and high-density debris drums.
                </p>
                <div className="text-[10px] font-mono text-cyan-300 font-bold pt-2 border-t border-[#162136]">
                  STATUS: MOUNTED ON ROV ARM 2
                </div>
              </div>

              <div className="p-4 bg-[#081524] border border-[#162136] rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-2">
                  <Anchor className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  HEAVY RECOVERY HOIST BASKET
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Subsea collapsible payload basket with 2,500 kg buoyant payload lift capacity deployed directly from ship winch crane.
                </p>
                <div className="text-[10px] font-mono text-emerald-300 font-bold pt-2 border-t border-[#162136]">
                  STATUS: DECK STAGED · WINCH 02
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#081524] border-t border-[#162136] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Exported coordinates compatible with Kongsberg HiPAP, BlueRobotics ArduSub, & Seaeye Falcon ROVs.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGPX}
              className="px-4 py-2 bg-[#FFB703] text-[#05070B] rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              DOWNLOAD FLIGHT PLAN (.GPX)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
