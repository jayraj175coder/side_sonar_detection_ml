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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { PredictionResponse } from '../types';

export const ScanHistoryPage: React.FC = () => {
  const { scans, setCurrentScan, setActiveTab, deleteScan } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<'ALL' | 'MILCO' | 'NOMBO'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'detections' | 'confidence'>('date');

  const filteredScans = useMemo(() => {
    return scans
      .filter((scan) => {
        const matchesSearch =
          scan.scan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.filename.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterClass === 'MILCO' && scan.milco_count === 0) return false;
        if (filterClass === 'NOMBO' && scan.nombo_count === 0) return false;

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
    <div className="space-y-6">
      {/* 1. Top Search & Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Scan ID or image filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-950/80 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilterClass('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterClass === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterClass('MILCO')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterClass === 'MILCO'
                  ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MILCO Only
            </button>
            <button
              onClick={() => setFilterClass('NOMBO')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterClass === 'NOMBO'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NOMBO Only
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="date">Sort: Newest</option>
            <option value="detections">Sort: Detections</option>
            <option value="confidence">Sort: Peak Conf</option>
          </select>
        </div>
      </div>

      {/* 2. Main Scans Table */}
      <div className="rounded-3xl glass-panel overflow-hidden shadow-2xl">
        {filteredScans.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <History className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <p className="text-base font-extrabold text-slate-200 font-mono">
                No Scan Records Found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria or launch a new sonar inspection.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('scan')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs font-mono inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <ScanLine className="w-4 h-4" />
              <span>Launch New Scan</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080E1C]/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Scan ID</th>
                  <th className="py-3.5 px-4">Source Track</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Targets</th>
                  <th className="py-3.5 px-4">MILCO / NOMBO</th>
                  <th className="py-3.5 px-4">Peak Confidence</th>
                  <th className="py-3.5 px-4">Geolocation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScans.map((scan) => {
                  const hasGeo =
                    scan.location.latitude !== null &&
                    scan.location.longitude !== null;

                  return (
                    <tr
                      key={scan.scan_id}
                      className="hover:bg-cyan-950/20 transition-colors text-slate-300"
                    >
                      <td className="py-3.5 px-4 font-bold text-cyan-300">
                        {scan.scan_id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200 max-w-[200px] truncate">
                        {scan.filename}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(scan.created_at).toLocaleDateString()}{' '}
                        {new Date(scan.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-100">
                        {scan.total_detections}
                      </td>
                      <td className="py-3.5 px-4 space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
                          {scan.milco_count} MILCO
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                          {scan.nombo_count} NOMBO
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        {(scan.highest_confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {hasGeo ? (
                          <span className="flex items-center gap-1 text-cyan-300">
                            <MapPin className="w-3 h-3" />
                            {scan.location.latitude?.toFixed(2)}°,{' '}
                            {scan.location.longitude?.toFixed(2)}°
                          </span>
                        ) : (
                          <span className="text-slate-400">Unavailable</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          type="STATUS"
                          label={scan.status}
                          variant="success"
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleInspect(scan)}
                          className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all font-semibold inline-flex items-center gap-1"
                          title="Inspect Detection Overlay"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleViewReport(scan)}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors inline-flex items-center gap-1 font-semibold"
                          title="Generate Inspection Report"
                        >
                          <FileText className="w-3 h-3 text-cyan-400" />
                          <span>Report</span>
                        </button>
                        <button
                          onClick={() => deleteScan(scan.scan_id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
