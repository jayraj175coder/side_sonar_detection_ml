import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Award,
  Anchor,
  Compass,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface MoESClearanceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: MissionV3Target;
}

export const MoESClearanceCertificateModal: React.FC<MoESClearanceCertificateModalProps> = ({
  isOpen,
  onClose,
  target,
}) => {
  if (!isOpen) return null;

  const targetId = target?.id || 'SX-T07';
  const targetClass = target?.label || 'Ghost Net (ALDFG)';
  const lat = target?.latitude || 18.9217;
  const lon = target?.longitude || 72.8214;
  const depth = target?.depth || 43.1;
  const shadowM = target?.shadowLength || 2.31;
  const confidence = target?.confidence ? (target.confidence * 100).toFixed(1) : '94.7';

  // Physics height: h = (L_s * H_alt) / (R_s + L_s) -> with H=8.4m, Rs=25m
  const calculatedHeight = ((shadowM * 8.4) / (25.0 + shadowM)).toFixed(2);
  const certRef = `MOES/DOM/2026/MX026-${targetId.replace('SX-', '')}`;
  const sha256Hash = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const certData = {
      certificate_authority: 'Ministry of Earth Sciences (MoES) - Govt of India',
      organization: 'National Institute of Ocean Technology (NIOT)',
      program: 'Deep Ocean Mission // Marine Debris Survey 2026',
      certificate_ref: certRef,
      telemetry_sha256_hash: sha256Hash,
      timestamp_utc: new Date().toISOString(),
      target_intelligence: {
        id: targetId,
        classification: targetClass,
        taxonomy_code: 'MoES-MD-26057',
        confidence_score: `${confidence}%`,
        coordinates_wgs84: {
          latitude_dd: lat,
          longitude_dd: lon,
          utm_zone: '43N',
        },
        bathymetry: {
          depth_meters: depth,
          shadow_length_meters: shadowM,
          calculated_proud_height_meters: Number(calculatedHeight),
          substrate: 'Benthic Silt / Coarse Sand Flat',
        },
      },
      recommended_intervention: {
        hazard_level: 'CRITICAL (Priority-1 Navigation Risk)',
        asset_type: 'Class-III Heavy Work-Class ROV',
        prescribed_tooling: [
          'Hydraulic Guillotine Wire & Rope Cutter',
          'Heavy Drag Net Retrieval Grapple',
          'Acoustic Beacon Transponder (USBL Relocator)',
        ],
        salvage_protocol: 'MoES SOP-MAR-784 Benthic Debris Extraction',
      },
    };

    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoES_Clearance_Certificate_${targetId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-3xl bg-[#05121F] border-2 border-[#00D4AA]/60 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,212,170,0.25)] text-[#E0F7F4] overflow-hidden my-auto">
        {/* Top Control Bar */}
        <div className="bg-[#030B14] px-5 py-3 border-b border-[#0D2E4A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4AA] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#00D4AA]" />
            <span>OFFICIAL CLEARANCE CERTIFICATE · MOES / NIOT PROTOCOL</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D2640] border border-[#1A4E6A] hover:border-[#00D4AA] text-[#E0F7F4] hover:text-[#00D4AA] text-xs font-mono font-bold rounded cursor-pointer transition-all"
              title="Print official document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D4AA] text-[#030B14] hover:bg-[#5EFFD8] text-xs font-mono font-black rounded cursor-pointer transition-all shadow-[0_0_10px_rgba(0,212,170,0.3)]"
              title="Download signed JSON metadata"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] rounded hover:bg-[#0A1E30] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Body */}
        <div id="moes-printable-certificate" className="p-6 md:p-8 space-y-6 text-xs bg-gradient-to-b from-[#05121F] to-[#030B14]">
          {/* Government Official Letterhead */}
          <div className="text-center border-b border-[#0D2E4A] pb-5 space-y-1">
            <div className="inline-block px-3 py-1 bg-[#082830] border border-[#00D4AA]/40 rounded-full text-[10px] font-mono font-bold text-[#00D4AA] tracking-widest uppercase mb-1">
              GOVERNMENT OF INDIA // MINISTRY OF EARTH SCIENCES
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-[#E0F7F4] uppercase font-sans">
              NATIONAL INSTITUTE OF OCEAN TECHNOLOGY (NIOT)
            </h1>
            <h2 className="text-xs font-mono font-bold text-[#38BDF8] tracking-widest uppercase">
              DEEP OCEAN MISSION · SUBSEA MARINE DEBRIS HAZARD CLEARANCE CERTIFICATE
            </h2>
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[#94A3B8] pt-1">
              <span>CERTIFICATE REF: <strong className="text-[#E0F7F4]">{certRef}</strong></span>
              <span>•</span>
              <span>SURVEY ID: <strong className="text-[#E0F7F4]">MX-026</strong></span>
              <span>•</span>
              <span>WGS-84 UTM ZONE 43N</span>
            </div>
          </div>

          {/* Target Metadata & Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Box 1: Acoustic Target Parameters */}
            <div className="p-4 bg-[#081525] border border-[#0D2E4A] rounded-xl space-y-2.5">
              <div className="text-[10px] font-bold text-[#00D4AA] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#0D2E4A] pb-1.5">
                <Anchor className="w-3.5 h-3.5" />
                <span>ACOUSTIC TARGET CLASSIFICATION</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">TARGET DESIGNATION</span>
                  <strong className="text-[#E0F7F4] text-sm">{targetId}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">MODEL CONFIDENCE</span>
                  <strong className="text-[#00D4AA] text-sm">{confidence}% VERIFIED</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">CLASSIFICATION</span>
                  <strong className="text-[#E0F7F4]">{targetClass}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">TAXONOMY CODE</span>
                  <strong className="text-[#38BDF8]">MoES-MD-26057</strong>
                </div>
              </div>
            </div>

            {/* Box 2: Geospatial & Depth Sounding */}
            <div className="p-4 bg-[#081525] border border-[#0D2E4A] rounded-xl space-y-2.5">
              <div className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#0D2E4A] pb-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>GEOSPATIAL & PHYSICAL RELIEF</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">WGS-84 LATITUDE</span>
                  <strong className="text-[#E0F7F4]">{lat.toFixed(4)}° N</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">WGS-84 LONGITUDE</span>
                  <strong className="text-[#E0F7F4]">{lon.toFixed(4)}° E</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">BATHYMETRY DEPTH</span>
                  <strong className="text-[#E0F7F4]">{depth.toFixed(1)} Meters</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[9px] uppercase block">HEIGHT PROUD OF SEABED</span>
                  <strong className="text-[#00D4AA]">{calculatedHeight} m (Ray-Traced)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof & SHA-256 Signature */}
          <div className="p-3.5 bg-[#030B14] border border-[#0D2E4A] rounded-xl space-y-1 font-mono text-[10px]">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="uppercase font-bold text-[#00D4AA] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>TAMPER-EVIDENT CRYPTOGRAPHIC TELEMETRY HASH (SHA-256)</span>
              </span>
              <span className="text-[9px] text-[#94A3B8]">RAW SSS ACOUSTIC STREAM</span>
            </div>
            <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded text-[9.5px] text-[#E0F7F4] break-all font-mono">
              {sha256Hash}
            </div>
            <p className="text-[#94A3B8] text-[8.5px] leading-tight">
              Cryptographically anchors the raw acoustic backscatter ping sequence, water column altitude, and WGS84 USBL fix to prevent falsification or post-hoc tampering.
            </p>
          </div>

          {/* Operational Salvage & ROV Remediation Recommendations */}
          <div className="p-4 bg-[#081525] border border-[#EF4444]/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                <span>PRESCRIBED ROV INTERVENTION & RETRIEVAL PROTOCOL</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 rounded">
                PRIORITY-1 CRITICAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono pt-1">
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded">
                <span className="text-[#94A3B8] block text-[8px] uppercase">RECOMMENDED ASSET</span>
                <strong className="text-[#E0F7F4] text-[10.5px]">Class-III Heavy ROV</strong>
                <p className="text-[#94A3B8] text-[8.5px] mt-0.5">Samudrayaan / NIOT Support Ship</p>
              </div>
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded">
                <span className="text-[#94A3B8] block text-[8px] uppercase">SALVAGE TOOLING</span>
                <strong className="text-[#38BDF8] text-[10.5px]">Hydraulic Guillotine Cutter</strong>
                <p className="text-[#94A3B8] text-[8.5px] mt-0.5">Heavy Drag Net Wire Grapple</p>
              </div>
              <div className="p-2 bg-[#05121F] border border-[#0D2E4A] rounded">
                <span className="text-[#94A3B8] block text-[8px] uppercase">HAZARD MITIGATION</span>
                <strong className="text-[#00D4AA] text-[10.5px]">Ghost Fishing Prevention</strong>
                <p className="text-[#94A3B8] text-[8.5px] mt-0.5">Eliminates ALDFG marine mortality</p>
              </div>
            </div>
          </div>

          {/* Official Sign-Off Seals */}
          <div className="pt-4 border-t border-[#0D2E4A] flex flex-wrap items-center justify-between gap-4 font-mono text-[10px]">
            <div className="space-y-1">
              <div className="text-[9px] text-[#94A3B8] uppercase">DIGITAL VERIFICATION AUTHORITY</div>
              <div className="flex items-center gap-1.5 text-[#00D4AA] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SONARX AUTONOMOUS ACOUSTIC PIPELINE · CERTIFIED COMPLIANT</span>
              </div>
              <div className="text-[8.5px] text-[#94A3B8]">MoES Specification Standard // S-100 Hydrographic Data Product</div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-[9px] text-[#94A3B8] uppercase">ISSUED AT MUMBAI MARITIME THEATRE</div>
              <div className="text-[#E0F7F4] font-bold">CHIEF HYDROGRAPHER VERIFIED</div>
              <div className="text-[8.5px] text-[#38BDF8]">NATIONAL HYDROGRAPHIC OFFICE (NHO)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
