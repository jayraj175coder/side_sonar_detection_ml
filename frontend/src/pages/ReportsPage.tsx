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
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const { scans, currentScan, setCurrentScan } = useApp();
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
      <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-200 font-mono">
          No Scan Available for Report
        </h3>
        <p className="text-xs text-slate-400">
          Upload and analyze a side-scan sonar image or enable Demo Mode to view sample reports.
        </p>
      </div>
    );
  }

  const hasGeo =
    activeScan.location.latitude !== null && activeScan.location.longitude !== null;

  return (
    <div className="space-y-6">
      {/* Top Selector & Action Bar (Hidden during Print) */}
      <div className="print:hidden p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400 font-bold">
            Select Track:
          </label>
          <select
            value={selectedScanId}
            onChange={(e) => {
              setSelectedScanId(e.target.value);
              const found = scans.find((s) => s.scan_id === e.target.value);
              if (found) setCurrentScan(found);
            }}
            className="px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {scans.map((s) => (
              <option key={s.scan_id} value={s.scan_id}>
                {s.scan_id} — {s.filename} ({s.total_detections} targets)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadJson}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Structured Inspection Document (Printable Sheet) */}
      <div className="p-8 md:p-10 rounded-3xl glass-panel border border-cyan-500/20 text-slate-200 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 print:text-blue-600">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold font-mono tracking-wider text-slate-100 print:text-black">
                  MARINE DEBRIS & ANOMALY INSPECTION BRIEFING
                </h2>
                <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-0.5">
                  AI-Assisted Side-Scan Sonar Acoustic Backscatter Perception
                </p>
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs space-y-1">
            <p className="text-cyan-400 print:text-blue-700 font-extrabold text-base">
              {activeScan.scan_id}
            </p>
            <p className="text-slate-400 print:text-gray-600 text-[11px]">
              Generated: {new Date().toUTCString()}
            </p>
            <div className="pt-1">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                AI-DETECTED CANDIDATE • REQUIRES VERIFICATION
              </span>
            </div>
          </div>
        </div>

        {/* Survey Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono p-4 rounded-2xl bg-slate-950/80 print:bg-gray-100 border border-slate-800 print:border-gray-300">
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Source Scan
            </p>
            <p className="font-bold text-slate-100 print:text-black truncate mt-0.5">
              {activeScan.filename}
            </p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Pipeline Mode
            </p>
            <p className="font-bold text-cyan-300 print:text-blue-600 mt-0.5 uppercase">
              {activeScan.pipeline || 'DEBRIS'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Coordinates (WGS84)
            </p>
            <p className="font-bold text-slate-100 print:text-black mt-0.5">
              {hasGeo
                ? `${activeScan.location.latitude?.toFixed(4)}°N, ${activeScan.location.longitude?.toFixed(4)}°E`
                : 'Location unavailable'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600 text-[10px] uppercase">
              Inference / Filter Latency
            </p>
            <p className="font-bold text-slate-100 print:text-black mt-0.5">
              {activeScan.inference_ms.toFixed(1)} ms
            </p>
          </div>
        </div>

        {/* Executive Analyst Assessment */}
        <div className="space-y-2 p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 print:border-gray-300 print:bg-gray-50">
          <h3 className="text-xs font-bold font-mono text-cyan-300 print:text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Acoustic Analysis
          </h3>
          <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed font-sans">
            AI-assisted acoustic analysis of swath '{activeScan.filename}' identified {activeScan.total_detections} potential contact candidate(s) above confidence threshold {activeScan.confidence_threshold.toFixed(2)}.
            {activeScan.clutter_filtered_count !== undefined && activeScan.clutter_filtered_count > 0 ? (
              <> Acoustic clutter filtering rejected {activeScan.clutter_filtered_count} background sediment/speckle artifact(s).</>
            ) : null}
            {' '}Peak candidate confidence score is {(activeScan.highest_confidence * 100).toFixed(1)}%.
          </p>
        </div>

        {/* Detailed Detections Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono text-slate-300 print:text-gray-800 uppercase tracking-wider">
            Target Anomaly Register
          </h3>
          {activeScan.detections.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-gray-100 text-center text-xs font-mono text-slate-400 print:text-gray-600">
              No contacts exceeded the {activeScan.confidence_threshold.toFixed(2)} confidence threshold.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-gray-300">
                <thead className="bg-[#080E1C]/90 print:bg-gray-200 text-slate-400 print:text-gray-700 border-b border-slate-800 print:border-gray-300">
                  <tr>
                    <th className="py-2.5 px-3">Target ID</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Confidence Tier</th>
                    <th className="py-2.5 px-3">Bounding Box [X1, Y1, X2, Y2]</th>
                    <th className="py-2.5 px-3">Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                  {activeScan.detections.map((det) => (
                    <tr key={det.id} className="text-slate-300 print:text-gray-800">
                      <td className="py-2 px-3 font-semibold">{det.id}</td>
                      <td className="py-2 px-3">
                        <Badge type={det.type} label={det.type} size="sm" />
                      </td>
                      <td className="py-2 px-3 font-bold">
                        {(det.confidence * 100).toFixed(1)}% ({det.confidence_tier || 'MEDIUM'})
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-400 print:text-gray-600">
                        [{det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)},{' '}
                        {det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)}]
                      </td>
                      <td className="py-2 px-3 text-[11px] font-bold text-amber-400 print:text-amber-700">
                        AI CANDIDATE
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mandatory Scientific Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 print:text-gray-600 space-y-1 font-sans">
          <div className="flex items-center gap-2 text-slate-300 font-mono font-bold">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>CONFIDENTIALITY & SCIENTIFIC NOTICE</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Detections generated by this system represent AI-detected acoustic candidates derived from side-scan sonar backscatter. Final confirmation of marine debris, ghost nets, or navigational seabed hazards requires ground-truth validation via ROV, diver inspection, or multi-angle acoustic surveys.
          </p>
        </div>

        {/* Document Footer */}
        <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 print:text-gray-500">
          <span>SONARX Marine Debris Intelligence Platform</span>
          <span>System ID: SNX-SIH-NODE-01</span>
        </div>
      </div>
    </div>
  );
};
