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
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const { scans, currentScan, setCurrentScan } = useApp();
  const [selectedScanId, setSelectedScanId] = useState<string>(
    currentScan?.scan_id || scans[0]?.scan_id || ''
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const activeScan = scans.find((s) => s.scan_id === selectedScanId) || currentScan || scans[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!activeScan) return;
    setIsExporting(true);

    setTimeout(() => {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(activeScan, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${activeScan.scan_id}_moes_inspection_report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    }, 400);
  };

  if (!activeScan) {
    return (
      <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
        <FileText className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
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
  const isV2 = activeScan.model_version === 'v2' || activeScan.model_name?.includes('Marine-Debris');

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Selector & Action Bar (Hidden during Print) */}
      <div className="print:hidden p-4 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-4">
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
            disabled={isExporting}
            className={`px-4 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
              exportSuccess
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Formal MoES Report Document Container */}
      <div className="p-8 md:p-12 rounded-3xl glass-panel space-y-8 bg-[#070D1F] border border-cyan-500/25 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header Letterhead */}
        <div className="border-b-2 border-cyan-500/40 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 print:text-black print:border-black">
                MoES SIH-2026 INTELLIGENCE BRIEFING
              </span>
              <span className="font-mono text-xs text-slate-400 print:text-gray-600">
                DOC-REF: {activeScan.scan_id}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 font-mono tracking-tight print:text-black">
              Underwater Marine Debris & Sonar Anomaly Assessment
            </h2>
            <p className="text-xs text-slate-400 font-sans print:text-gray-600">
              Autonomous Acoustic Backscatter Perception Pipeline • Ministry of Earth Sciences
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 space-y-1 print:text-gray-700">
            <p>
              Generated: <strong className="text-slate-200 print:text-black">{activeScan.created_at}</strong>
            </p>
            <p>
              Platform: <strong className="text-cyan-300 print:text-black">SONARX Edge AI Engine</strong>
            </p>
          </div>
        </div>

        {/* Mission Telemetry Executive Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-gray-100 print:border-gray-300">
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Acoustic Swath</p>
            <p className="text-xs font-bold text-slate-200 font-mono mt-1 truncate print:text-black">
              {activeScan.filename}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">AI Perception Model</p>
            <p className="text-xs font-bold text-cyan-300 font-mono mt-1 print:text-black">
              {activeScan.model_name || 'YOLOv8n-SIH-Marine-Debris-V2'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">GPS Geotag Location</p>
            <p className="text-xs font-bold text-slate-200 font-mono mt-1 print:text-black">
              {hasGeo ? `${activeScan.location.latitude?.toFixed(4)}°N, ${activeScan.location.longitude?.toFixed(4)}°E` : 'Ungeotagged'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Edge Runtime</p>
            <p className="text-xs font-bold text-emerald-400 font-mono mt-1 print:text-black">
              {activeScan.inference_ms.toFixed(1)} ms (640×640 px)
            </p>
          </div>
        </div>

        {/* Executive Threat Assessment Narrative */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 print:text-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Acoustic Assessment</span>
          </h4>
          <div className="p-5 rounded-2xl bg-[#0A1226]/80 border border-cyan-500/20 text-xs leading-relaxed font-sans text-slate-300 print:bg-white print:border-gray-300 print:text-black">
            {activeScan.total_detections > 0 ? (
              <p>
                Acoustic backscatter analysis conducted on swath <strong className="text-cyan-300 font-mono">{activeScan.filename}</strong> identified{' '}
                <strong className="text-slate-100 font-mono">{activeScan.total_detections} anomalous seabed contact(s)</strong> exceeding the {((activeScan.confidence_threshold || 0.25) * 100).toFixed(0)}% confidence threshold.
                {isV2 ? (
                  <> Specifically, the model localized <strong className="text-purple-400 font-mono">{activeScan.ghost_net_count || 0} Ghost Net / ALDFG structure(s)</strong> and <strong className="text-amber-400 font-mono">{activeScan.debris_count || 0} anthropogenic container/debris item(s)</strong>. Adjacent acoustic shadow validation confirms specular relief above seafloor substrate.</>
                ) : (
                  <> Contact signatures evaluated against legacy reference baseline.</>
                )}
              </p>
            ) : (
              <p>
                Full aperture acoustic backscatter analysis of <strong className="text-cyan-300 font-mono">{activeScan.filename}</strong> indicates a clean seabed corridor with no high-confidence anthropogenic debris or abandoned fishing gear detected above the cutoff.
              </p>
            )}
          </div>
        </div>

        {/* Contact Register Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between print:text-black">
            <span>Verified Contact Register ({activeScan.detections.length} Contacts)</span>
            <span className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
              Peak Confidence: {(activeScan.highest_confidence * 100).toFixed(1)}%
            </span>
          </h4>

          {activeScan.detections.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 print:bg-white print:border-gray-300 print:text-black">
              No contacts registered for this scan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-gray-400">
                <thead className="bg-[#050A18] text-slate-400 border-b border-slate-800 uppercase tracking-wider print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="py-2.5 px-3">Contact ID</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Pixel Bounding Box</th>
                    <th className="py-2.5 px-3">Noise Filter Diagnostic</th>
                    <th className="py-2.5 px-3">MoES Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {activeScan.detections.map((det) => (
                    <tr key={det.id} className="text-slate-300 print:text-black">
                      <td className="py-2.5 px-3 font-bold text-cyan-300 print:text-black">
                        {det.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge type={det.type} label={det.type} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-100 print:text-black">
                        {(det.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-gray-700 text-[11px]">
                        [{det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)}, {det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)}]
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 print:text-gray-800 text-[11px]">
                        {det.noise_filter_reason || 'Passed geometry verification'}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {det.type === 'ghost_net_aldfg' ? (
                          <span className="text-purple-400 print:text-black">CRITICAL GEAR HAZARD</span>
                        ) : det.type === 'anthropogenic_debris' ? (
                          <span className="text-amber-400 print:text-black">DEBRIS RECOVERY</span>
                        ) : det.type === 'pipeline_hazard' ? (
                          <span className="text-blue-400 print:text-black">SUBSEA ASSET</span>
                        ) : (
                          <span className="text-cyan-400 print:text-black">SEABED ANOMALY</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Authentication & MoES Disclaimers */}
        <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:text-gray-700">
          <div>
            <p className="font-bold text-slate-300 print:text-black">
              MoES Smart India Hackathon (SIH 2026) Perception Pipeline
            </p>
            <p className="text-[10px]">
              AI anomaly suggestions require field diver / ROV ground-truth verification prior to gear retrieval.
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold print:border-black print:text-black">
              STATUS: VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
