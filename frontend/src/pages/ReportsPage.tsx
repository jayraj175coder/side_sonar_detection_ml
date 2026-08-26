import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  Cpu,
  Radio,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const { scans, currentScan, setCurrentScan, isDemoMode } = useApp();
  const [selectedScanId, setSelectedScanId] = useState<string>(
    currentScan?.scan_id || scans[0]?.scan_id || ''
  );

  const activeScan = scans.find((s) => s.scan_id === selectedScanId) || currentScan || scans[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!activeScan) return;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeScan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeScan.scan_id}_inspection_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!activeScan) {
    return (
      <div className="p-12 text-center rounded-xl bg-[#0C1427] border border-[#1E2E4E] space-y-3">
        <FileText className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-200 font-mono">
          No Scan Available for Report
        </h3>
        <p className="text-xs text-slate-400">
          Upload and analyze a side-scan sonar image or enable Demo Mode to view sample reports.
        </p>
      </div>
    );
  }

  const isCritical = activeScan.milco_count > 0;
  const hasGeo =
    activeScan.location.latitude !== null && activeScan.location.longitude !== null;

  return (
    <div className="space-y-6">
      {/* Top Selector & Action Bar (Hidden during Print) */}
      <div className="print:hidden p-4 rounded-xl bg-[#0C1427] border border-[#1E2E4E] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">
            Select Track:
          </label>
          <select
            value={selectedScanId}
            onChange={(e) => {
              setSelectedScanId(e.target.value);
              const found = scans.find((s) => s.scan_id === e.target.value);
              if (found) setCurrentScan(found);
            }}
            className="px-3 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {scans.map((s) => (
              <option key={s.scan_id} value={s.scan_id}>
                {s.scan_id} — {s.filename} ({s.total_detections} targets)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Structured Inspection Document (Printable Sheet) */}
      <div className="p-8 rounded-xl bg-[#0A1020] border border-[#1E2E4E] text-slate-200 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#1E2E4E] pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400 print:text-blue-600" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100 print:text-black">
                SONARX ACOUSTIC INSPECTION REPORT
              </h2>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-1">
              Autonomous YOLOv8n Maritime Sonar Target Classification Intelligence
            </p>
          </div>

          <div className="text-right font-mono text-xs space-y-1">
            <p className="text-cyan-400 print:text-blue-700 font-bold text-sm">
              {activeScan.scan_id}
            </p>
            <p className="text-slate-400 print:text-gray-600 text-[11px]">
              Generated: {new Date().toUTCString()}
            </p>
            <div>
              {isCritical ? (
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">
                  HAZARD: MILCO IDENTIFIED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  SURVEY CLEAR / ROUTINE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Survey Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono p-4 rounded-lg bg-[#060A14] print:bg-gray-100 border border-[#15233E] print:border-gray-300">
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Source Scan
            </p>
            <p className="font-bold text-slate-100 print:text-black mt-0.5 truncate">
              {activeScan.filename}
            </p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Survey Coordinates
            </p>
            <p className="font-bold text-slate-100 print:text-black mt-0.5">
              {hasGeo
                ? `${activeScan.location.latitude?.toFixed(4)}°N, ${activeScan.location.longitude?.toFixed(4)}°W`
                : 'Ungeolocated track'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Model Engine
            </p>
            <p className="font-bold text-cyan-400 print:text-blue-600 mt-0.5">
              YOLOv8n ONNX (640px)
            </p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Inference Latency
            </p>
            <p className="font-bold text-slate-100 print:text-black mt-0.5">
              {activeScan.inference_ms.toFixed(1)} ms
            </p>
          </div>
        </div>

        {/* Target Classification Breakdown Cards */}
        <div className="grid grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-[#0C1427] print:bg-gray-50 border border-[#1E2E4E] print:border-gray-300">
            <p className="text-slate-400 print:text-gray-600 text-[11px] uppercase">
              Total Target Contacts
            </p>
            <p className="text-2xl font-bold text-slate-100 print:text-black mt-1">
              {activeScan.total_detections}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-950/20 print:bg-red-50 border border-red-500/30 print:border-red-300">
            <p className="text-red-400 print:text-red-700 text-[11px] uppercase font-bold">
              MILCO Mine Contacts
            </p>
            <p className="text-2xl font-bold text-red-400 print:text-red-700 mt-1">
              {activeScan.milco_count}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-cyan-950/20 print:bg-blue-50 border border-cyan-500/30 print:border-blue-300">
            <p className="text-cyan-400 print:text-blue-700 text-[11px] uppercase font-bold">
              NOMBO Obstacles
            </p>
            <p className="text-2xl font-bold text-cyan-400 print:text-blue-700 mt-1">
              {activeScan.nombo_count}
            </p>
          </div>
        </div>

        {/* Analyst Narrative Section */}
        <div className="p-4 rounded-lg bg-[#080E1C] print:bg-gray-50 border border-[#15233E] print:border-gray-300 space-y-2">
          <h4 className="text-xs font-bold font-mono text-cyan-300 print:text-blue-700 uppercase tracking-wider">
            Automated Intelligence Summary
          </h4>
          <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed font-sans">
            {activeScan.total_detections === 0
              ? `Side-scan acoustic survey '${activeScan.filename}' was analyzed with the calibrated YOLOv8n ONNX model at confidence threshold ${activeScan.confidence_threshold.toFixed(2)}. No seabed contacts exceeding threshold were identified. The acoustic track indicates an unobstructed sea bottom.`
              : `Deep learning analysis on '${activeScan.filename}' identified ${activeScan.total_detections} acoustic seafloor targets. Detection classification: ${activeScan.milco_count} Mine-Like Contact(s) (MILCO) and ${activeScan.nombo_count} Non-Mine Bottom Obstacle(s) (NOMBO). Peak contact confidence recorded at ${(activeScan.highest_confidence * 100).toFixed(1)}%. Model inference took ${activeScan.inference_ms.toFixed(1)} ms.`}
          </p>
        </div>

        {/* Contact Coordinates Detail Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 print:text-gray-700">
            Acoustic Target Register
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-[#1E2E4E] print:border-gray-300">
              <thead className="bg-[#080E1C] print:bg-gray-100 text-slate-400 print:text-gray-700 uppercase tracking-wider border-b border-[#1E2E4E] print:border-gray-300">
                <tr>
                  <th className="py-2 px-3">Item #</th>
                  <th className="py-2 px-3">Target ID</th>
                  <th className="py-2 px-3">Classification</th>
                  <th className="py-2 px-3">Confidence Score</th>
                  <th className="py-2 px-3">Pixel Bounding Box [X1, Y1, X2, Y2]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233E] print:divide-gray-200">
                {activeScan.detections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 print:text-gray-500">
                      No contacts logged in this inspection track.
                    </td>
                  </tr>
                ) : (
                  activeScan.detections.map((d, index) => (
                    <tr key={d.id} className="text-slate-300 print:text-black">
                      <td className="py-2 px-3 text-slate-400 print:text-gray-500">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold text-cyan-300 print:text-blue-700">
                        {d.id}
                      </td>
                      <td className="py-2 px-3 font-bold">
                        <span
                          className={
                            d.type === 'MILCO'
                              ? 'text-red-400 print:text-red-700'
                              : 'text-cyan-400 print:text-blue-700'
                          }
                        >
                          {d.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold">
                        {(d.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-slate-400 print:text-gray-600 text-[11px]">
                        [{d.bbox.x1.toFixed(0)}, {d.bbox.y1.toFixed(0)}, {d.bbox.x2.toFixed(0)}, {d.bbox.y2.toFixed(0)}]
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sign-off footer */}
        <div className="pt-4 border-t border-[#1E2E4E] print:border-gray-300 flex justify-between items-center text-[10px] font-mono text-slate-400 print:text-gray-500">
          <span>SONARX System ID: SNX-NODE-01</span>
          <span>Verified Maritime Inspection Artifact</span>
        </div>
      </div>
    </div>
  );
};
