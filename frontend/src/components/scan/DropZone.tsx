import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileSearch } from 'lucide-react';
import { generateSampleSonarImageDataUrl } from '../../services/demoData';

interface DropZoneProps {
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string | null;
  selectedFile: File | null;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onImageSelected,
  previewUrl,
  selectedFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  const loadSampleTrack = async (seed: number, name: string) => {
    const dataUrl = generateSampleSonarImageDataUrl(seed, name);
    // Convert dataUrl to a real File object
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${name.toLowerCase().replace(/\s+/g, '_')}.png`, {
      type: 'image/png',
    });
    onImageSelected(file, dataUrl);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative min-h-[360px] rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-8 overflow-hidden group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : previewUrl
            ? 'border-[#1E2E4E] bg-[#0A1020]'
            : 'border-[#1E2E4E] hover:border-cyan-500/50 bg-[#080E1C]/60 hover:bg-[#0A1224]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/tiff"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={previewUrl}
              alt="Sonar scan preview"
              className="max-h-[320px] w-auto object-contain rounded-lg border border-[#1E2E4E] shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
                {selectedFile ? selectedFile.name : 'Selected Sonar Scan'}
              </span>
              <span className="text-xs text-slate-400">
                Click or drag to change image
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">
                Upload Side-Scan Sonar Imagery
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Drag and drop raw acoustic files, or click to browse filesystem.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                PNG
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                JPG
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                WebP
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                TIFF
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Sample Tracks for Judges / Reviewers */}
      <div className="p-4 rounded-lg bg-[#0C1427] border border-[#1E2E4E] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            Quick Benchmark Samples
          </span>
          <span className="text-[11px] text-slate-400">
            Pre-calibrated acoustic tracks
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(1, 'Biscayne Mine Contact');
            }}
            className="px-3 py-2 rounded bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
              Sample 1: MILCO Track
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">High-contrast mine contact</p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(2, 'Key Largo Obstacles');
            }}
            className="px-3 py-2 rounded bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
              Sample 2: NOMBO Field
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Seafloor debris & boulders</p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(3, 'Tortugas Clear Trench');
            }}
            className="px-3 py-2 rounded bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
              Sample 3: Clear Seabed
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Clean survey baseline</p>
          </button>
        </div>
      </div>
    </div>
  );
};
