import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Crosshair,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Radio,
  FileImage,
  Pin,
  Ruler,
  Compass,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import type { MissionTarget } from '../../types';
import { sonarAudio } from '../../utils/sonarAudio';

interface UploadClassifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUNDLED_SONAR_SAMPLES: {
  id: string;
  name: string;
  category: 'Natural / Marine Debris / Clutter' | 'Man-Made (Moored Object)' | 'Man-Made (Pipeline / Cable)' | 'Man-Made (Shipwreck)';
  confidence: number;
  uncertaintyRating: 'LOW AMBIGUITY' | 'MODERATE UNCERTAINTY' | 'AMBIGUOUS CONTACT — RE-SURVEY ADVISED';
  dimensions: { length: number; width: number; height: number; shadow: number };
  operatorCaveat: string;
  color: string;
  targetStrengthDb: number;
}[] = [
  {
    id: 'SMP-NET-01',
    name: 'Sample A: Coral Reef Ghost Net (900 kHz)',
    category: 'Natural / Marine Debris / Clutter',
    confidence: 0.638,
    uncertaintyRating: 'AMBIGUOUS CONTACT — RE-SURVEY ADVISED',
    dimensions: { length: 3.42, width: 1.85, height: 0.38, shadow: 1.12 },
    operatorCaveat: 'Diffuse irregular acoustic reflection with ill-defined perimeter. Acoustic shadow is soft-edged and porous (1.12m), inconsistent with rigid man-made hulls. Assessed as derelict nylon net / ALDFG debris pile.',
    color: '#A855F7',
    targetStrengthDb: -22.4,
  },
  {
    id: 'SMP-MINE-02',
    name: 'Sample B: Moored Naval Ordnance (900 kHz)',
    category: 'Man-Made (Moored Object)',
    confidence: 0.948,
    uncertaintyRating: 'LOW AMBIGUITY',
    dimensions: { length: 1.84, width: 0.71, height: 0.82, shadow: 2.31 },
    operatorCaveat: 'Compact high-intensity return with sharp specular highlight. Distinct 2.31m acoustic shadow confirms elevated spherical structure (0.82m elevation). High confidence of moored naval ordnance profile.',
    color: '#F04438',
    targetStrengthDb: -12.8,
  },
  {
    id: 'SMP-PIPE-03',
    name: 'Sample C: Industrial Hydrocarbon Pipeline (900 kHz)',
    category: 'Man-Made (Pipeline / Cable)',
    confidence: 0.914,
    uncertaintyRating: 'LOW AMBIGUITY',
    dimensions: { length: 24.8, width: 0.76, height: 0.65, shadow: 1.84 },
    operatorCaveat: 'Continuous linear high-backscatter trace spanning full swath width. Uniform parallel shadow indicates 0.65m proud height above seafloor. Continuous steel transmission pipe profile.',
    color: '#29B6F6',
    targetStrengthDb: -10.5,
  },
  {
    id: 'SMP-WRK-04',
    name: 'Sample D: Historic Timber Keel Wreck (900 kHz)',
    category: 'Man-Made (Shipwreck)',
    confidence: 0.912,
    uncertaintyRating: 'LOW AMBIGUITY',
    dimensions: { length: 18.4, width: 6.2, height: 3.8, shadow: 12.1 },
    operatorCaveat: 'Elongated massive return spanning 18.4m with prominent multi-tier acoustic shadow (12.1m length). Keel profile and superstructure ribbing visible on 900 kHz waterfall.',
    color: '#F5A623',
    targetStrengthDb: -6.4,
  },
];

export const UploadClassifyModal: React.FC<UploadClassifyModalProps> = ({ isOpen, onClose }) => {
  const { addCustomTarget, setSelectedTargetId } = useMission();
  const [selectedSample, setSelectedSample] = useState<typeof BUNDLED_SONAR_SAMPLES[0] | null>(BUNDLED_SONAR_SAMPLES[0]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isClassified, setIsClassified] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectSample = (sample: typeof BUNDLED_SONAR_SAMPLES[0]) => {
    sonarAudio.playLockBeep();
    setSelectedSample(sample);
    setUploadedFileName(null);
    setIsClassified(true);
    setIsPinned(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sonarAudio.playSonarPing();
    setUploadedFileName(file.name);
    // Deterministic staging based on filename or default to balanced multi-target assessment
    const isDebris = file.name.toLowerCase().includes('net') || file.name.toLowerCase().includes('debris') || file.name.toLowerCase().includes('clutter');
    const isPipe = file.name.toLowerCase().includes('pipe') || file.name.toLowerCase().includes('cable');
    const isMine = file.name.toLowerCase().includes('mine') || file.name.toLowerCase().includes('ordnance') || file.name.toLowerCase().includes('mlo');

    const matchedSample = isDebris ? BUNDLED_SONAR_SAMPLES[0] : isPipe ? BUNDLED_SONAR_SAMPLES[2] : isMine ? BUNDLED_SONAR_SAMPLES[1] : BUNDLED_SONAR_SAMPLES[1];
    setSelectedSample(matchedSample);
    setIsClassified(true);
    setIsPinned(false);
  };

  const handlePinToMission = () => {
    if (!selectedSample) return;
    sonarAudio.playSonarPing();
    const newTarget: MissionTarget = {
      id: `SX-U${Math.floor(10 + Math.random() * 89)}`,
      tracklineId: 'LINE-01',
      class: selectedSample.category.includes('Debris') ? 'Marine Debris' : selectedSample.category.includes('Pipeline') ? 'Subsea Pipeline' : selectedSample.category.includes('Wreck') ? 'Wreck' : 'Mine-like Object',
      classCode: selectedSample.category.includes('Debris') ? 'NET' : selectedSample.category.includes('Pipeline') ? 'PIP' : selectedSample.category.includes('Wreck') ? 'WRK' : 'MLO',
      confidence: selectedSample.confidence,
      confidenceInterval: [selectedSample.confidence - 0.035, selectedSample.confidence + 0.025],
      uncertaintyRating: selectedSample.uncertaintyRating,
      targetStrengthDb: selectedSample.targetStrengthDb,
      operatorCaveat: selectedSample.operatorCaveat,
      uncertaintyNotes: [
        `System Assessment: Classified under category ${selectedSample.category}`,
        `Calculated target elevation: ${selectedSample.dimensions.height}m from ${selectedSample.dimensions.shadow}m acoustic shadow`,
        `Acoustic return profile verified across 900 kHz frequency response`,
      ],
      depth: 38.4,
      length: selectedSample.dimensions.length,
      width: selectedSample.dimensions.width,
      estimatedHeight: selectedSample.dimensions.height,
      shadowLength: selectedSample.dimensions.shadow,
      orientation: 115,
      slantRange: 22.4,
      acrossTrackMeters: -14.2,
      bearingDeg: 284,
      lat: 18.9214,
      lon: 72.8217,
      risk: selectedSample.category.includes('Moored') ? 'CRITICAL' : 'LOW',
      pingTime: 620,
      pingNumber: 6200,
      color: selectedSample.color,
      evidence: { objectShape: 90, acousticIntensity: 88, shadowGeometry: 92, seabedContrast: 86, dimensionalSimilarity: 91, backscatterPattern: 89 },
      detectionEvidence: [
        'Acoustic specular highlight and shadow geometry extracted',
        `Physical footprint: ${selectedSample.dimensions.length}m × ${selectedSample.dimensions.width}m`,
      ],
    };

    addCustomTarget(newTarget);
    setSelectedTargetId(newTarget.id);
    setIsPinned(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-[#04070D]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#10151D] border border-[#1B2330] rounded-2xl max-w-4xl w-full h-[660px] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#080B11] border-b border-[#1B2330] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#4CD9E8]/15 border border-[#4CD9E8]/30 flex items-center justify-center text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.3)]">
              <UploadCloud className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#EAEFF5] tracking-widest uppercase">
                  UPLOAD & CLASSIFY SONAR SWATH
                </h2>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#4CD9E8]/15 text-[#4CD9E8] border border-[#4CD9E8]/30">
                  900 kHz / 450 kHz
                </span>
              </div>
              <p className="text-[9px] text-[#7C8AA0]">
                Evaluate side-scan sonar image returns with honest qualitative uncertainty
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] hover:text-[#EAEFF5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Upload/Selector + Right Exact Contact Inspector Presentation */}
        <div className="flex-1 flex min-h-0 divide-x divide-[#1B2330]">
          {/* Left Column: Image Ingestion & Bundled Samples */}
          <div className="w-80 bg-[#080B11] p-4 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
            {/* Drag & Drop Upload Zone */}
            <div className="space-y-2">
              <span className="text-[8px] font-bold text-[#7C8AA0] uppercase tracking-wider block">
                1. SELECT OR UPLOAD SONAR FILE
              </span>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-[#1B2330] hover:border-[#4CD9E8]/60 bg-[#10151D] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all hover:bg-[#161C26] group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".png,.jpg,.jpeg,.tif,.tiff,.xtf"
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-lg bg-[#080B11] border border-[#1B2330] flex items-center justify-center text-[#7C8AA0] group-hover:text-[#4CD9E8]">
                  <FileImage className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#EAEFF5]">
                    {uploadedFileName ? uploadedFileName : 'Click to Upload Sonar Image'}
                  </p>
                  <p className="text-[8px] text-[#7C8AA0]">Supports PNG, JPG, TIF (Side-Scan Swaths)</p>
                </div>
              </div>
            </div>

            {/* Bundled Evaluation Samples */}
            <div className="space-y-2 flex-1">
              <span className="text-[8px] font-bold text-[#7C8AA0] uppercase tracking-wider block">
                OR CHOOSE A BUNDLED SAMPLE (4 CLASSES)
              </span>

              <div className="space-y-1.5">
                {BUNDLED_SONAR_SAMPLES.map((sample) => {
                  const isSelected = selectedSample?.id === sample.id && !uploadedFileName;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#4CD9E8]/15 border-[#4CD9E8] text-[#EAEFF5] shadow-[0_0_12px_rgba(76,217,232,0.15)]'
                          : 'bg-[#10151D] border-[#1B2330] text-[#7C8AA0] hover:border-[#4CD9E8]/40 hover:text-[#EAEFF5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[8px] font-black px-1.5 py-0.5 rounded border"
                          style={{
                            background: `${sample.color}15`,
                            color: sample.color,
                            borderColor: `${sample.color}40`,
                          }}
                        >
                          {sample.category}
                        </span>
                        <span className="text-[8px] font-mono text-[#7C8AA0]">
                          {(sample.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-[#EAEFF5] truncate">
                        {sample.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Exact Contact Inspector Presentation */}
          <div className="flex-1 bg-[#10151D] p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            {selectedSample && isClassified && (
              <>
                {/* 1. Category Callout Banner */}
                <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#1B2330] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold text-[#7C8AA0] uppercase tracking-wider block">
                      SYSTEM CLASSIFICATION RESULT
                    </span>
                    <h3
                      className="text-sm font-black tracking-wide"
                      style={{ color: selectedSample.color }}
                    >
                      {selectedSample.category}
                    </h3>
                  </div>

                  <span
                    className={`text-[8px] font-black px-2.5 py-1 rounded border ${
                      selectedSample.uncertaintyRating === 'LOW AMBIGUITY'
                        ? 'bg-[#3FD98A]/15 text-[#3FD98A] border-[#3FD98A]/40'
                        : selectedSample.uncertaintyRating === 'MODERATE UNCERTAINTY'
                        ? 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/40'
                        : 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/40'
                    }`}
                  >
                    {selectedSample.uncertaintyRating}
                  </span>
                </div>

                {/* 2. Physical & Shadow Measurements Grid */}
                <div className="grid grid-cols-4 gap-2 text-[9px]">
                  <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">LENGTH</span>
                    <strong className="text-[#EAEFF5] font-bold">{selectedSample.dimensions.length}m</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">WIDTH</span>
                    <strong className="text-[#EAEFF5] font-bold">{selectedSample.dimensions.width}m</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">SHADOW LENGTH</span>
                    <strong className="text-[#4CD9E8] font-bold">{selectedSample.dimensions.shadow}m</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#080B11] border border-[#1B2330]">
                    <span className="text-[7px] text-[#7C8AA0] uppercase block">ESTIMATED HEIGHT</span>
                    <strong className="text-[#3FD98A] font-bold">{selectedSample.dimensions.height}m</strong>
                  </div>
                </div>

                {/* 3. Operator Assessment & Reasoning Copy */}
                <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#1B2330] space-y-2 text-[9px]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#4CD9E8]" />
                    <span className="font-bold text-[#EAEFF5] uppercase tracking-wider">
                      SYSTEM ASSESSMENT & EVIDENCE
                    </span>
                  </div>
                  <p className="text-[#EAEFF5] leading-relaxed">
                    {selectedSample.operatorCaveat}
                  </p>
                  <div className="pt-2 border-t border-[#1B2330] flex items-center justify-between text-[8px] text-[#7C8AA0]">
                    <span>TARGET STRENGTH: <strong className="text-[#4CD9E8]">{selectedSample.targetStrengthDb} dB</strong></span>
                    <span>CONFIDENCE BAND: <strong className="text-[#EAEFF5]">{(selectedSample.confidence * 100).toFixed(1)}% (±3.5%)</strong></span>
                  </div>
                </div>

                {/* 4. Action: Pin Directly to Live Mission Control Tree */}
                <div className="pt-2 flex items-center justify-between border-t border-[#1B2330]">
                  <span className="text-[8px] text-[#7C8AA0]">
                    Injects this classified contact into the active waterfall mosaic & hierarchy
                  </span>

                  <button
                    onClick={handlePinToMission}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer active:scale-95 ${
                      isPinned
                        ? 'bg-[#3FD98A] text-[#080B11]'
                        : 'bg-[#4CD9E8] text-[#080B11] hover:bg-[#29B6F6]'
                    }`}
                  >
                    {isPinned ? <CheckCircle2 className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    <span>{isPinned ? 'PINNED TO MISSION' : 'PIN TO MISSION TREE & MOSAIC'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
