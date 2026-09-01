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
      <div className="p-12 text-center rounded-3xl glass-panel space-y-3 font-mono border border-[#152438]">
        <FileText className="w-12 h-12 text-[#7C8AA0] mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-[#EAEFF5]">
          No Scan Available for Report
        </h3>
        <p className="text-xs text-[#7C8AA0]">
          Upload and analyze a side-scan sonar image or enable Demo Mode to view sample reports.
        </p>
      </div>
    );
  }

  const hasGeo =
    activeScan.location.latitude !== null && activeScan.location.longitude !== null;
  const isV2 = activeScan.model_version === 'v2' || activeScan.model_name?.includes('Marine-Debris');

  return (
    <div className="space-y-6 animate-slide-up font-mono select-none">
      {/* Top Selector & Action Bar (Hidden during Print) */}
      <div className="print:hidden p-4 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-4 border border-[#152438]">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-[#7C8AA0] font-bold">
            Select Track:
          </label>
          <select
            value={selectedScanId}
            onChange={(e) => {
              setSelectedScanId(e.target.value);
              const found = scans.find((s) => s.scan_id === e.target.value);
              if (found) setCurrentScan(found);
            }}
            className="px-3.5 py-2 text-xs font-mono rounded-xl bg-[#060D17] border border-[#152438] text-[#EAEFF5] focus:outline-none focus:border-[#4CD9E8] cursor-pointer"
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
            className={`px-4 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              exportSuccess
                ? 'bg-[#091D17] border-[#3FD98A] text-[#3FD98A]'
                : 'bg-[#0A1322] hover:bg-[#101D31] border-[#152438] text-[#7C8AA0] hover:text-[#EAEFF5]'
            }`}
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#3FD98A]" />
                <span>Downloaded!</span>
              </>
            ) : isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#4CD9E8] border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#4CD9E8]" />
                <span>Download JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4CD9E8] to-[#3FD98A] hover:brightness-110 text-[#03070E] font-black text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-[#4CD9E8]/25 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Formal MoES Report Document Container */}
      <div className="p-8 md:p-12 rounded-3xl glass-panel space-y-8 bg-[#060D17] border border-[#152438] shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header Letterhead */}
        <div className="border-b-2 border-[#4CD9E8]/40 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#4CD9E8]/20 text-[#4CD9E8] border border-[#4CD9E8]/40 print:text-black print:border-black">
                MoES SIH-2026 INTELLIGENCE BRIEFING
              </span>
              <span className="font-mono text-xs text-[#7C8AA0] print:text-gray-600">
                DOC-REF: {activeScan.scan_id}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#EAEFF5] font-mono tracking-tight print:text-black">
              Underwater Marine Debris & Sonar Anomaly Assessment
            </h2>
            <p className="text-xs text-[#7C8AA0] font-sans print:text-gray-600">
              Autonomous Acoustic Backscatter Perception Pipeline • Ministry of Earth Sciences
            </p>
          </div>

          <div className="text-right font-mono text-xs text-[#7C8AA0] space-y-1 print:text-gray-700">
            <p>
              Generated: <strong className="text-[#EAEFF5] print:text-black">{activeScan.created_at}</strong>
            </p>
            <p>
              Platform: <strong className="text-[#4CD9E8] print:text-black">SONARX Edge AI Engine</strong>
            </p>
          </div>
        </div>

        {/* Mission Telemetry Executive Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#0A1322] border border-[#152438] print:bg-gray-100 print:border-gray-300">
          <div>
            <p className="text-[10px] font-mono text-[#7C8AA0] uppercase">Acoustic Swath</p>
            <p className="text-xs font-bold text-[#EAEFF5] font-mono mt-1 truncate print:text-black">
              {activeScan.filename}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#7C8AA0] uppercase">AI Perception Model</p>
            <p className="text-xs font-bold text-[#4CD9E8] font-mono mt-1 print:text-black">
              {activeScan.model_name || 'YOLOv8n-SIH-Marine-Debris-V2'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#7C8AA0] uppercase">GPS Geotag Location</p>
            <p className="text-xs font-bold text-[#EAEFF5] font-mono mt-1 print:text-black">
              {hasGeo ? `${activeScan.location.latitude?.toFixed(4)}°N, ${activeScan.location.longitude?.toFixed(4)}°E` : 'Ungeotagged'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#7C8AA0] uppercase">Edge Runtime</p>
            <p className="text-xs font-bold text-[#3FD98A] font-mono mt-1 print:text-black">
              {activeScan.inference_ms.toFixed(1)} ms (640×640 px)
            </p>
          </div>
        </div>

        {/* Executive Threat Assessment Narrative */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-[#4CD9E8] tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4CD9E8]" />
            <span>Executive Findings & Environmental Hazard Audit</span>
          </h3>
          <div className="p-4 rounded-xl bg-[#0A1322] border border-[#152438] text-xs text-[#EAEFF5] leading-relaxed space-y-2">
            <p>
              Autonomous side-scan sonar perception executed over swath file <code className="text-[#4CD9E8]">{activeScan.filename}</code>.
              A total of <strong className="text-[#4CD9E8]">{activeScan.total_detections} targets</strong> were localized above confidence threshold <strong className="text-[#4CD9E8]">{(activeScan.confidence_threshold * 100).toFixed(0)}%</strong>.
            </p>
            {isV2 ? (
              <p>
                Target breakdown identified <strong className="text-[#A855F7]">{activeScan.ghost_net_count || 0} Ghost Fishing Nets (ALDFG)</strong>, <strong className="text-[#F5A623]">{activeScan.debris_count || 0} Marine Debris objects</strong>, and <strong className="text-[#29B6F6]">{activeScan.pipeline_count || 0} Subsea Infrastructure hazards</strong>.
              </p>
            ) : (
              <p>
                Naval classification identified <strong className="text-[#F04438]">{activeScan.milco_count || 0} MILCO contacts</strong> and <strong className="text-[#4CD9E8]">{activeScan.nombo_count || 0} NOMBO obstacles</strong>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
