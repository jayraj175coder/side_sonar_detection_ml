import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileSearch, CheckCircle2 } from 'lucide-react';
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
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${name.toLowerCase().replace(/\s+/g, '_')}.png`, {
      type: 'image/png',
    });
    onImageSelected(file, dataUrl);
  };

  return (
    <div className="space-y-4">
      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative min-h-[380px] rounded-3xl glass-panel border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 overflow-hidden group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
            : previewUrl
            ? 'border-cyan-500/30 bg-[#091024]/90'
            : 'border-cyan-500/20 hover:border-cyan-400/60 bg-[#0A1226]/60 hover:bg-[#0E1A38]/70 hover:shadow-2xl'
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
          <div className="relative w-full h-full flex flex-col items-center justify-center space-y-3">
            <img
              src={previewUrl}
              alt="Sonar scan preview"
              className="max-h-[300px] w-auto object-contain rounded-2xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
            />
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-500/30 shadow-md">
                {selectedFile ? selectedFile.name : 'Selected Sonar Scan'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (Click to replace file)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 max-w-md">
            <div className="w-18 h-18 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400 shadow-lg shadow-cyan-950/50 transition-all duration-300">
              <UploadCloud className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-100 tracking-tight">
                Upload Side-Scan Sonar Imagery
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Drag and drop raw acoustic files, or click to browse your filesystem.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
                PNG
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
                JPG / JPEG
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
                WebP
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
                TIFF
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Presets Bar */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            Calibrated Sonar Benchmarks (1-Click Load)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Synthetic Seabed Targets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(1, 'Vizag Harbor Mine Contact');
            }}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-red-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200 group-hover:text-red-400">
                Track 1: Vizag MILCO
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Bay of Bengal mine contact</p>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(2, 'Kochi Approach Obstacles');
            }}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                Track 2: Kochi NOMBO
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Arabian Sea bottom debris</p>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(3, 'Mumbai High Clear Trench');
            }}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-emerald-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                Track 3: Mumbai Trench
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Clean survey baseline</p>
          </button>
        </div>
      </div>
    </div>
  );
};
