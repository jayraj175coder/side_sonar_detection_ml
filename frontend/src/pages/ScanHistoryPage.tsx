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
    <div className="space-y-6 animate-slide-up font-mono select-none">
      {/* 1. Top Search & Filter Bar */}
      <div className="p-4 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-4 border border-[#152438]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#4CD9E8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Scan ID or image filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xl bg-[#060D17] border border-[#152438] text-[#EAEFF5] placeholder-[#7C8AA0]/50 focus:outline-none focus:border-[#4CD9E8]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl bg-[#060D17] border border-[#152438] p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilterClass('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterClass === 'ALL'
                  ? 'bg-[#4CD9E8]/20 text-[#4CD9E8] font-bold border border-[#4CD9E8]/30'
                  : 'text-[#7C8AA0] hover:text-[#EAEFF5]'
              }`}
            >
              All ({scans.length})
            </button>
            <button
              onClick={() => setFilterClass('GHOST_NET')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterClass === 'GHOST_NET'
                  ? 'bg-[#A855F7]/20 text-[#A855F7] font-bold border border-[#A855F7]/40'
                  : 'text-[#7C8AA0] hover:text-[#A855F7]'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-[#A855F7]" />
              <span>Ghost Nets</span>
            </button>
            <button
              onClick={() => setFilterClass('DEBRIS')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterClass === 'DEBRIS'
                  ? 'bg-[#F5A623]/20 text-[#F5A623] font-bold border border-[#F5A623]/40'
                  : 'text-[#7C8AA0] hover:text-[#F5A623]'
              }`}
            >
              <Boxes className="w-3 h-3 text-[#F5A623]" />
              <span>Debris</span>
            </button>
            <button
              onClick={() => setFilterClass('PIPELINE')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterClass === 'PIPELINE'
                  ? 'bg-[#29B6F6]/20 text-[#29B6F6] font-bold border border-[#29B6F6]/40'
                  : 'text-[#7C8AA0] hover:text-[#29B6F6]'
              }`}
            >
              <Layers className="w-3 h-3 text-[#29B6F6]" />
              <span>Pipelines</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl bg-[#060D17] border border-[#152438] text-[#EAEFF5] focus:outline-none focus:border-[#4CD9E8] cursor-pointer"
          >
            <option value="date">Sort: Newest First</option>
            <option value="detections">Sort: Highest Targets</option>
            <option value="confidence">Sort: Peak Confidence</option>
          </select>
        </div>
      </div>

      {/* 2. Main Scans Table */}
      <div className="rounded-3xl glass-panel overflow-hidden shadow-2xl border border-[#152438]">
        {filteredScans.length === 0 ? (
          <div className="p-14 text-center space-y-4">
            <History className="w-12 h-12 text-[#7C8AA0] mx-auto animate-pulse" />
            <div>
              <p className="text-base font-black text-[#EAEFF5] font-mono">
                No Scan Records Found
              </p>
              <p className="text-xs text-[#7C8AA0] mt-1">
                Try adjusting your search criteria or launch a new sonar inspection.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('scan')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4CD9E8] to-[#3FD98A] text-[#03070E] font-black text-xs font-mono inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Launch New Scan</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#060D17] text-[#7C8AA0] border-b border-[#152438] uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-[#152438]/60">
                {filteredScans.map((scan) => {
                  const hasGeo =
                    scan.location.latitude !== null &&
                    scan.location.longitude !== null;

                  return (
                    <tr
                      key={scan.scan_id}
                      className="hover:bg-[#0A1A2E]/50 transition-colors text-[#EAEFF5]"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#4CD9E8]">
                        {scan.scan_id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#EAEFF5] max-w-[180px] truncate">
                        {scan.filename}
                      </td>
                      <td className="py-3.5 px-4 text-[#7C8AA0] text-[10px]">
                        {new Date(scan.created_at).toLocaleDateString()}{' '}
                        {new Date(scan.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#EAEFF5]">
                        {scan.total_detections}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(scan.ghost_net_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] font-bold text-[9px]">
                              {scan.ghost_net_count} Net
                            </span>
                          )}
                          {(scan.debris_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] font-bold text-[9px]">
                              {scan.debris_count} Debris
                            </span>
                          )}
                          {(scan.pipeline_count || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#29B6F6]/20 border border-[#29B6F6]/40 text-[#29B6F6] font-bold text-[9px]">
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
                      <td className="py-3.5 px-4 font-black text-[#EAEFF5]">
                        {(scan.highest_confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-[10px] text-[#7C8AA0]">
                        {hasGeo ? (
                          <span className="flex items-center gap-1 text-[#4CD9E8]">
                            <MapPin className="w-3 h-3" />
                            {scan.location.latitude?.toFixed(2)}°,{' '}
                            {scan.location.longitude?.toFixed(2)}°
                            {scan.geotag_source === 'ping_log' && (
                              <span className="text-[8px] px-1 rounded bg-[#4CD9E8]/10 text-[#4CD9E8] border border-[#4CD9E8]/30">
                                LOG
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[#7C8AA0]">Unavailable</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#3FD98A]/20 border border-[#3FD98A]/40 text-[#3FD98A] text-[9px] font-bold">
                          COMPLETED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleInspect(scan)}
                          className="px-3 py-1 rounded-lg bg-[#4CD9E8]/10 hover:bg-[#4CD9E8]/20 border border-[#4CD9E8]/30 text-[#4CD9E8] transition-all font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Inspect Detection Overlay"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleViewReport(scan)}
                          className="px-3 py-1 rounded-lg bg-[#0A1322] hover:bg-[#101D31] border border-[#152438] text-[#7C8AA0] hover:text-[#EAEFF5] transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                          title="Generate Inspection Report"
                        >
                          <FileText className="w-3 h-3 text-[#4CD9E8]" />
                          <span>Report</span>
                        </button>
                        <button
                          onClick={() => deleteScan(scan.scan_id)}
                          className="p-1.5 rounded-lg text-[#7C8AA0] hover:text-[#F04438] hover:bg-[#F04438]/10 transition-colors cursor-pointer"
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
