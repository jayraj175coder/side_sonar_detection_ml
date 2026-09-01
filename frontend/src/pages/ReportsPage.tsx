import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
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
  FileSpreadsheet,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MISSION_DATA } from '../data/mission';
import { MISSION_TARGETS } from '../data/targets';

export const ReportsPage: React.FC = () => {
  const [downloadJsonSuccess, setDownloadJsonSuccess] = useState<boolean>(false);
  const [downloadCsvSuccess, setDownloadCsvSuccess] = useState<boolean>(false);

  const heroTarget = MISSION_TARGETS.find((t) => t.id === 'SX-T07') || MISSION_TARGETS[0];
  const highPriorityTargets = MISSION_TARGETS.filter((t) => t.risk === 'CRITICAL' || t.risk === 'HIGH');
  const filteredTargets = MISSION_TARGETS.filter((t) => t.uncertaintyRating.includes('FILTERED'));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      title: 'SONARX MARINE DEBRIS DETECTION REPORT',
      mission_id: 'MX-026',
      organization: 'Ministry of Earth Sciences (MoES)',
      vessel: MISSION_DATA.vessel,
      generated_at: new Date().toISOString(),
      summary: {
        survey_area_km2: 12.84,
        total_anomalies_detected: 17,
        high_priority_targets: 4,
        natural_formations_filtered: 20,
        swath_width_m: 75,
        frequency: '900 kHz',
      },
      hero_detection: {
        id: heroTarget.id,
        classification: heroTarget.class,
        confidence: heroTarget.confidence,
        location: {
          latitude: heroTarget.lat,
          longitude: heroTarget.lon,
          depth_m: heroTarget.depth,
        },
        dimensions: {
          length_m: heroTarget.length,
          width_m: heroTarget.width,
          shadow_m: heroTarget.shadowLength,
        },
        evidence: heroTarget.evidence,
        checkpoints: heroTarget.detectionEvidence,
      },
      target_register: MISSION_TARGETS.map((t) => ({
        id: t.id,
        class: t.class,
        confidence: t.confidence,
        latitude: t.lat,
        longitude: t.lon,
        depth: t.depth,
        risk: t.risk,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MX-026_marine_debris_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadJsonSuccess(true);
    setTimeout(() => setDownloadJsonSuccess(false), 2500);
  };

  const handleDownloadCsv = () => {
    const headers = ['Target_ID', 'Class', 'Code', 'Confidence', 'Latitude', 'Longitude', 'Depth_M', 'Length_M', 'Width_M', 'Shadow_M', 'Priority_Risk'];
    const rows = MISSION_TARGETS.map((t) => [
      t.id,
      `"${t.class}"`,
      t.classCode,
      (t.confidence * 100).toFixed(1) + '%',
      t.lat,
      t.lon,
      t.depth,
      t.length,
      t.width,
      t.shadowLength,
      t.risk,
    ].join(','));

    const csvContent = `${headers.join(',')}\n${rows.join('\n')}`;
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MX-026_targets_register.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadCsvSuccess(true);
    setTimeout(() => setDownloadCsvSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-slide-up font-mono select-none">
      {/* 1. Action Toolbar */}
      <div className="print:hidden p-4 rounded-2xl bg-[#081118] border border-[#16303B] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#32E6D1]" />
          <span className="text-xs font-bold text-[#E4F2F5] uppercase tracking-wider">
            MISSION MX-026 // MARINE DEBRIS DOSSIER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-xs font-bold text-[#E4F2F5] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            {downloadCsvSuccess ? <Check className="w-3.5 h-3.5 text-[#65D391]" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-[#65D391]" />}
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-xl bg-[#0C171E] hover:bg-[#16303B] border border-[#16303B] text-xs font-bold text-[#E4F2F5] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            {downloadJsonSuccess ? <Check className="w-3.5 h-3.5 text-[#32E6D1]" /> : <Download className="w-3.5 h-3.5 text-[#32E6D1]" />}
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#32E6D1] to-[#29B6F6] text-[#03070B] font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Report Document Container */}
      <div className="bg-[#081118] border border-[#16303B] rounded-3xl p-6 md:p-10 space-y-8 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-[#16303B] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#E4F2F5] tracking-wider uppercase font-sans print:text-black">
                SONARX
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#32E6D1]/20 text-[#32E6D1] font-bold border border-[#32E6D1]/40 print:border-black print:text-black">
                MoES SIH 2026 SPEC
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#32E6D1] font-sans print:text-black">
              MARINE DEBRIS & ANOMALY DETECTION DOSSIER
            </h2>
            <p className="text-xs text-[#6F8992] print:text-gray-600">
              Ministry of Earth Sciences · Automated Side-Scan Sonar Perception Pipeline
            </p>
          </div>

          <div className="text-right text-xs space-y-1 text-[#6F8992] font-mono print:text-gray-600">
            <p>Mission ID: <strong className="text-[#E4F2F5] print:text-black">MX-026</strong></p>
            <p>Vessel: <span className="text-[#E4F2F5] print:text-black">{MISSION_DATA.vessel}</span></p>
            <p>Survey Date: <span>2026-08-31</span></p>
          </div>
        </div>

        {/* Executive Metrics Funnel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-4 rounded-2xl bg-[#0C171E] border border-[#16303B] print:border-gray-300">
            <span className="text-[10px] text-[#6F8992] uppercase block">Survey Area</span>
            <strong className="text-2xl font-extrabold text-[#E4F2F5] print:text-black">12.84 km²</strong>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C171E] border border-[#16303B] print:border-gray-300">
            <span className="text-[10px] text-[#6F8992] uppercase block">Total Anomalies</span>
            <strong className="text-2xl font-extrabold text-[#E4F2F5] print:text-black">17</strong>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C171E] border border-[#FF5D5D]/30 print:border-gray-300">
            <span className="text-[10px] text-[#FF5D5D] uppercase block font-bold">High Priority</span>
            <strong className="text-2xl font-extrabold text-[#FF5D5D] print:text-black">4</strong>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C171E] border border-[#65D391]/30 print:border-gray-300">
            <span className="text-[10px] text-[#65D391] uppercase block font-bold">Natural Filtered</span>
            <strong className="text-2xl font-extrabold text-[#65D391] print:text-black">20 Rocks</strong>
          </div>
        </div>

        {/* Top Detection Spotlight (Hero Ghost Net #07) */}
        <div className="p-6 rounded-2xl bg-[#0C171E] border border-[#32E6D1]/40 space-y-4 print:border-gray-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-[#32E6D1] text-[#03070B] font-mono">
                TOP DETECTION: {heroTarget.id}
              </span>
              <h3 className="text-base font-bold text-[#E4F2F5] font-sans print:text-black">
                {heroTarget.class}
              </h3>
            </div>
            <span className="text-base font-extrabold text-[#32E6D1] font-mono print:text-black">
              {(heroTarget.confidence * 100).toFixed(1)}% AI CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5 bg-[#081118] p-3.5 rounded-xl border border-[#16303B] print:border-gray-300">
              <span className="text-[10px] text-[#6F8992] uppercase block font-bold">Acoustic Dimensions & Geolocation</span>
              <p>Location: <strong className="text-[#E4F2F5] print:text-black">{heroTarget.lat.toFixed(4)}° N, {heroTarget.lon.toFixed(4)}° E</strong></p>
              <p>Seabed Depth: <strong className="text-[#E4F2F5] print:text-black">{heroTarget.depth} m</strong></p>
              <p>Measured Size: <strong className="text-[#E4F2F5] print:text-black">{heroTarget.length}m (L) × {heroTarget.width}m (W)</strong></p>
              <p>Acoustic Shadow: <strong className="text-[#32E6D1] print:text-black">{heroTarget.shadowLength} m (0.82m vertical relief)</strong></p>
            </div>

            <div className="space-y-1.5 bg-[#081118] p-3.5 rounded-xl border border-[#16303B] print:border-gray-300">
              <span className="text-[10px] text-[#6F8992] uppercase block font-bold">Evidence Correlations</span>
              <p>Object Shape: <strong className="text-[#E4F2F5] print:text-black">92%</strong></p>
              <p>Acoustic Shadow: <strong className="text-[#E4F2F5] print:text-black">96%</strong></p>
              <p>Seabed Contrast: <strong className="text-[#E4F2F5] print:text-black">89%</strong></p>
              <p>Texture Analysis: <strong className="text-[#E4F2F5] print:text-black">94%</strong></p>
            </div>
          </div>
        </div>

        {/* Complete Survey Target Register Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#E4F2F5] uppercase tracking-wider font-sans print:text-black">
            SURVEY ANOMALIES REGISTER ({MISSION_TARGETS.length} TARGETS)
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-[#16303B] bg-[#0C171E] print:border-gray-300">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#081118] text-[#6F8992] border-b border-[#16303B] print:bg-gray-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Location (Lat, Lon)</th>
                  <th className="py-2.5 px-3">Depth</th>
                  <th className="py-2.5 px-3">Dimensions</th>
                  <th className="py-2.5 px-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16303B] print:divide-gray-200">
                {MISSION_TARGETS.map((t) => (
                  <tr key={t.id} className="hover:bg-[#081118]/50">
                    <td className="py-2.5 px-3 font-bold text-[#32E6D1] print:text-black">{t.id}</td>
                    <td className="py-2.5 px-3 text-[#E4F2F5] font-sans print:text-black">{t.class}</td>
                    <td className="py-2.5 px-3 font-bold text-[#E4F2F5] print:text-black">{(t.confidence * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-[#6F8992] print:text-black">{t.lat.toFixed(4)}°, {t.lon.toFixed(4)}°</td>
                    <td className="py-2.5 px-3 text-[#6F8992] print:text-black">{t.depth.toFixed(1)}m</td>
                    <td className="py-2.5 px-3 text-[#6F8992] print:text-black">{t.length}m × {t.width}m</td>
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded ${
                          t.risk === 'CRITICAL' || t.risk === 'HIGH'
                            ? 'bg-[#FF5D5D]/20 text-[#FF5D5D]'
                            : 'bg-[#32E6D1]/20 text-[#32E6D1]'
                        }`}
                      >
                        {t.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
