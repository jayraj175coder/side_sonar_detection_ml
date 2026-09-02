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
      title: 'SONARX MARINE DEBRIS ANOMALY DOSSIER',
      mission_id: 'MX-026',
      organization: 'Ministry of Earth Sciences (MoES)',
      survey_area: 'Mumbai Continental Shelf Corridor',
      survey_date: '2026-08-31',
      sonar_frequency: '900 kHz CHIRP',
      swath_width_m: 75,
      model: 'YOLOv8n (ONNX Runtime · marine_sonar_v2.onnx)',
      processing_time: '119 ms',
      generated_at: new Date().toISOString(),
      summary: {
        total_candidates: 17,
        natural_noise_rejected: 7,
        confirmed_debris: 10,
        high_priority_targets: 4,
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
      },
      target_register: MISSION_TARGETS.map((t) => ({
        id: t.id,
        class: t.class,
        confidence: t.confidence,
        latitude: t.lat,
        longitude: t.lon,
        depth_m: t.depth,
        size_m: `${t.length}m × ${t.width}m`,
        priority: t.risk,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MX-026_marine_debris_dossier.json`);
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
    <div className="space-y-6 animate-slide-up font-mono select-none text-[11px] text-[#E0F7F4]">
      {/* 1. Action Toolbar */}
      <div className="print:hidden p-4 bg-[#05121F] border border-[#0D2E4A] rounded-xs flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#00D4AA]" />
          <span className="text-xs font-black text-[#E0F7F4] uppercase tracking-wider">
            MISSION MX-026 // MARINE DEBRIS ANOMALY DOSSIER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-[#082830] hover:bg-[#0D2E4A] border border-[#0D2E4A] text-xs font-bold text-[#E0F7F4] flex items-center gap-1.5 transition-all cursor-pointer rounded-xs"
          >
            {downloadCsvSuccess ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-[#00D4AA]" />}
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 bg-[#082830] hover:bg-[#0D2E4A] border border-[#0D2E4A] text-xs font-bold text-[#E0F7F4] flex items-center gap-1.5 transition-all cursor-pointer rounded-xs"
          >
            {downloadJsonSuccess ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <Download className="w-3.5 h-3.5 text-[#00D4AA]" />}
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#00D4AA] text-[#030B14] font-black text-xs flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer rounded-xs shadow-[0_0_15px_rgba(0,212,170,0.3)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF REPORT</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Report Document Container */}
      <div className="bg-[#05121F] border border-[#0D2E4A] rounded-xs p-6 md:p-8 space-y-6 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-[#0D2E4A] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#E0F7F4] tracking-wider uppercase print:text-black">
                SONAR<span className="text-[#00D4AA]">X</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#082830] text-[#00D4AA] font-bold border border-[#00D4AA]/40 print:border-black print:text-black">
                MoES SIH 2026 SPEC
              </span>
            </div>
            <h2 className="text-base font-black text-[#00D4AA] uppercase print:text-black">
              MARINE DEBRIS ANOMALY DOSSIER
            </h2>
            <p className="text-[10px] text-[#7C98A6] print:text-gray-600">
              Ministry of Earth Sciences · Automated Side-Scan Sonar Perception Pipeline
            </p>
          </div>

          {/* Mission & Sensor Specifications */}
          <div className="text-right text-[10px] space-y-1 text-[#7C98A6] print:text-gray-600">
            <p>Mission ID: <strong className="text-[#E0F7F4] print:text-black">MX-026</strong></p>
            <p>Survey Area: <span className="text-[#E0F7F4] print:text-black">Mumbai Shelf Corridor (12.84 km²)</span></p>
            <p>Survey Date: <span className="text-[#E0F7F4] print:text-black">2026-08-31</span></p>
            <p>Sonar: <span className="text-[#E0F7F4] print:text-black">900 kHz CHIRP · 75m Swath</span></p>
            <p>Model: <strong className="text-[#00D4AA] print:text-black">YOLOv8n / ONNX Runtime</strong></p>
            <p>Pipeline Latency: <span className="text-[#E0F7F4] print:text-black">119 ms Total</span></p>
          </div>
        </div>

        {/* Executive Summary Funnel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-xs print:border-gray-300">
            <span className="text-[8.5px] text-[#7C98A6] uppercase block font-bold">TOTAL CANDIDATES</span>
            <strong className="text-2xl font-black text-[#E0F7F4] print:text-black">17</strong>
            <span className="text-[7.5px] text-[#4A8090] block">Raw YOLO proposals</span>
          </div>

          <div className="p-3 bg-[#030B14] border border-[#EF4444]/40 rounded-xs print:border-gray-300">
            <span className="text-[8.5px] text-[#EF4444] uppercase block font-bold">NATURAL / NOISE REJECTED</span>
            <strong className="text-2xl font-black text-[#EF4444] print:text-black">7</strong>
            <span className="text-[7.5px] text-[#7C98A6] block">Basalt rocks & sand ripples</span>
          </div>

          <div className="p-3 bg-[#030B14] border border-[#00D4AA]/40 rounded-xs print:border-gray-300">
            <span className="text-[8.5px] text-[#00D4AA] uppercase block font-bold">CONFIRMED DEBRIS</span>
            <strong className="text-2xl font-black text-[#00D4AA] print:text-black">10</strong>
            <span className="text-[7.5px] text-[#7C98A6] block">Acoustic shadow verified</span>
          </div>

          <div className="p-3 bg-[#030B14] border border-[#F59E0B]/40 rounded-xs print:border-gray-300">
            <span className="text-[8.5px] text-[#F59E0B] uppercase block font-bold">HIGH PRIORITY HAZARDS</span>
            <strong className="text-2xl font-black text-[#F59E0B] print:text-black">4</strong>
            <span className="text-[7.5px] text-[#7C98A6] block">Ghost nets & pipelines</span>
          </div>
        </div>

        {/* Hero Target Spotlight (SX-T07 Ghost Net) */}
        <div className="p-4 bg-[#030B14] border border-[#00D4AA]/50 rounded-xs space-y-3 print:border-gray-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-black px-2 py-0.5 rounded-xs bg-[#00D4AA] text-[#030B14]">
                FLAGSHIP HAZARD: {heroTarget.id}
              </span>
              <h3 className="text-sm font-black text-[#E0F7F4] uppercase print:text-black">
                {heroTarget.class}
              </h3>
            </div>
            <span className="text-sm font-black text-[#00D4AA] print:text-black">
              {(heroTarget.confidence * 100).toFixed(1)}% AI CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9.5px]">
            <div className="space-y-1 bg-[#05121F] p-3 rounded-xs border border-[#0D2E4A] print:border-gray-300">
              <span className="text-[8px] text-[#7C98A6] uppercase block font-bold">GEOLOCATION & DIMENSIONS</span>
              <p>Coordinates: <strong className="text-[#E0F7F4] print:text-black">{heroTarget.lat.toFixed(4)}° N, {heroTarget.lon.toFixed(4)}° E (WGS-84)</strong></p>
              <p>Seabed Depth: <strong className="text-[#E0F7F4] print:text-black">{heroTarget.depth} m (USBL Fix)</strong></p>
              <p>Measured Size: <strong className="text-[#E0F7F4] print:text-black">{heroTarget.length}m (L) × {heroTarget.width}m (W)</strong></p>
              <p>Acoustic Shadow: <strong className="text-[#00D4AA] print:text-black">{heroTarget.shadowLength} m (0.82m vertical relief)</strong></p>
            </div>

            <div className="space-y-1 bg-[#05121F] p-3 rounded-xs border border-[#0D2E4A] print:border-gray-300">
              <span className="text-[8px] text-[#7C98A6] uppercase block font-bold">EVIDENCE SCORES (Model / heuristic evidence)</span>
              <p>Shape Compatibility: <strong className="text-[#00D4AA] print:text-black">92%</strong></p>
              <p>Acoustic Shadow Relief: <strong className="text-[#00D4AA] print:text-black">96%</strong></p>
              <p>Seabed Backscatter Contrast: <strong className="text-[#00D4AA] print:text-black">89%</strong></p>
              <p>Texture Signature: <strong className="text-[#00D4AA] print:text-black">94%</strong></p>
            </div>
          </div>
        </div>

        {/* Complete Survey Target Register Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-[#E0F7F4] uppercase tracking-wider print:text-black">
            TARGET REGISTER ({MISSION_TARGETS.length} DETECTIONS)
          </h4>

          <div className="overflow-x-auto rounded-xs border border-[#0D2E4A] bg-[#030B14] print:border-gray-300">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#05121F] text-[#7C98A6] border-b border-[#0D2E4A] print:bg-gray-100 print:text-black">
                <tr>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">CLASS</th>
                  <th className="py-2 px-3 text-right">CONFIDENCE</th>
                  <th className="py-2 px-3">LATITUDE</th>
                  <th className="py-2 px-3">LONGITUDE</th>
                  <th className="py-2 px-3 text-right">DEPTH</th>
                  <th className="py-2 px-3">SIZE</th>
                  <th className="py-2 px-3">PRIORITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0D2E4A] print:divide-gray-200">
                {MISSION_TARGETS.map((t) => (
                  <tr key={t.id} className="hover:bg-[#05121F]">
                    <td className="py-2 px-3 font-bold text-[#00D4AA] print:text-black">{t.id}</td>
                    <td className="py-2 px-3 text-[#E0F7F4] print:text-black">{t.class}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#E0F7F4] print:text-black">
                      {(t.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-[#7C98A6] print:text-black">{t.lat.toFixed(4)}° N</td>
                    <td className="py-2 px-3 text-[#7C98A6] print:text-black">{t.lon.toFixed(4)}° E</td>
                    <td className="py-2 px-3 text-right text-[#7C98A6] print:text-black">{t.depth.toFixed(1)}m</td>
                    <td className="py-2 px-3 text-[#7C98A6] print:text-black">{t.length}m × {t.width}m</td>
                    <td className="py-2 px-3 font-bold">
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded-xs ${
                          t.risk === 'CRITICAL' || t.risk === 'HIGH'
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                            : 'bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/40'
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
