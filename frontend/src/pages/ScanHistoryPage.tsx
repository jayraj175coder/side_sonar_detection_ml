import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  FileText,
  Trash2,
  MapPin,
  ScanLine,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  Boxes,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { PredictionResponse } from '../types';

export const ScanHistoryPage: React.FC = () => {
  const { scans, setCurrentScan, setActiveTab, deleteScan } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<'ALL' | 'GHOST_NET' | 'DEBRIS' | 'PIPELINE'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'detections' | 'confidence'>('date');

  const filteredScans = useMemo(() => {
    return scans
      .filter((scan) => {
        const matchesSearch =
          scan.scan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.filename.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterClass === 'GHOST_NET' && (scan.ghost_net_count || 0) === 0) return false;
        if (filterClass === 'DEBRIS' && (scan.debris_count || 0) === 0) return false;
        if (filterClass === 'PIPELINE' && (scan.pipeline_count || 0) === 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'detections') {
          return b.total_detections - a.total_detections;
        }
        if (sortBy === 'confidence') {
          return b.highest_confidence - a.highest_confidence;
        }
        return 0;
      });
  }, [scans, searchTerm, filterClass, sortBy]);

  const handleInspect = (scan: PredictionResponse) => {
    setCurrentScan(scan);
    setActiveTab('scan');
  };

  const handleViewReport = (scan: PredictionResponse) => {
    setCurrentScan(scan);
    setActiveTab('reports');
  };

  return (
    <div className="space-y-6 font-mono select-none text-slate-200">
      {/* 1. Top Search & Filter Bar */}
      <div className="p-4 rounded-2xl subpixel-card flex flex-wrap items-center justify-between gap-4 border border-white/[0.08] shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#FFB703] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Scan ID or image filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB703]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.08] p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilterClass('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterClass === 'ALL'
                  ? 'bg-[#FFB703] text-[#05070B] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({scans.length})
            </button>
            <button
              onClick={() => setFilterClass('GHOST_NET')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterClass === 'GHOST_NET'
                  ? 'bg-[#FFB703]/20 text-[#FFB703] font-bold border border-[#FFB703]/40'
                  : 'text-slate-400 hover:text-[#FFB703]'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-[#FFB703]" />
              <span>Ghost Nets</span>
            </button>
            <button
              onClick={() => setFilterClass('DEBRIS')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterClass === 'DEBRIS'
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/40'
                  : 'text-slate-400 hover:text-[#F59E0B]'
              }`}
            >
              <Boxes className="w-3 h-3 text-[#F59E0B]" />
              <span>Debris</span>
            </button>
            <button
              onClick={() => setFilterClass('PIPELINE')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterClass === 'PIPELINE'
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-bold border border-[#38BDF8]/40'
                  : 'text-slate-400 hover:text-[#38BDF8]'
              }`}
            >
              <Layers className="w-3 h-3 text-[#38BDF8]" />
              <span>Pipelines</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-[#FFB703] cursor-pointer"
          >
            <option value="date" className="bg-[#0A0F18] text-white">Sort: Newest First</option>
            <option value="detections" className="bg-[#0A0F18] text-white">Sort: Highest Targets</option>
            <option value="confidence" className="bg-[#0A0F18] text-white">Sort: Peak Confidence</option>
          </select>
        </div>
      </div>

      {/* 2. Main Scans Table */}
      <div className="rounded-2xl subpixel-card overflow-hidden shadow-2xl border border-white/[0.08]">
        {filteredScans.length === 0 ? (
          <div className="p-14 text-center space-y-4">
            <History className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
            <div>
              <p className="text-base font-black text-white font-mono">
                No Scan Records Found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria or launch a new sonar inspection.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('scan')}
              className="px-5 py-2.5 rounded-xl bg-[#FFB703] hover:bg-[#FCD34D] text-[#05070B] font-black text-xs font-mono inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,183,3,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Launch New Scan</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.08] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Scan ID</th>
                  <th className="py-3.5 px-4">Source Track</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Targets</th>
                  <th className="py-3.5 px-4">Target Breakdown</th>
                  <th className="py-3.5 px-4">Peak Confidence</th>
                  <th className="py-3.5 px-4">Geolocation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredScans.map((scan) => {
                  const hasGeo =
                    scan.location.latitude !== null &&
                    scan.location.longitude !== null;

                  return (
                    <tr
                      key={scan.scan_id}
                      className="hover:bg-white/[0.03] transition-colors text-slate-200"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#FFB703]">
                        {scan.scan_id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white max-w-[180px] truncate">
                        {scan.filename}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                        {new Date(scan.created_at).toLocaleDateString()}{' '}
                        {new Date(scan.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-black text-white">
                        {scan.total_detections}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(scan.ghost_net_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FFB703]/10 border border-[#FFB703]/30 text-[#FFB703] font-bold text-[9px]">
                              {scan.ghost_net_count} Net
                            </span>
                          )}
                          {(scan.debris_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] font-bold text-[9px]">
                              {scan.debris_count} Debris
                            </span>
                          )}
                          {(scan.pipeline_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] font-bold text-[9px]">
                              {scan.pipeline_count} Pipe
                            </span>
                          )}
                          {(scan.milco_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F04438]/20 border border-[#F04438]/40 text-[#F04438] font-bold text-[9px]">
                              {scan.milco_count} MILCO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-white">
                        {(scan.highest_confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-[10px] text-slate-400">
                        {hasGeo ? (
                          <span className="flex items-center gap-1 text-[#FFB703]">
                            <MapPin className="w-3 h-3" />
                            {scan.location.latitude?.toFixed(2)}°,{' '}
                            {scan.location.longitude?.toFixed(2)}°
                            {scan.geotag_source === 'ping_log' && (
                              <span className="text-[8px] px-1 rounded bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/30">
                                LOG
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500">Unavailable</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                          COMPLETED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleInspect(scan)}
                          className="px-3 py-1 rounded-lg bg-[#FFB703]/10 hover:bg-[#FFB703]/20 border border-[#FFB703]/30 text-[#FFB703] transition-all font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Inspect Detection Overlay"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleViewReport(scan)}
                          className="px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                          title="Generate Inspection Report"
                        >
                          <FileText className="w-3 h-3 text-[#FFB703]" />
                          <span>Report</span>
                        </button>
                        <button
                          onClick={() => deleteScan(scan.scan_id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                          title="Delete Scan Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
