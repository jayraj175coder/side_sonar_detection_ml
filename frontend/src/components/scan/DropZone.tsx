import React, { useRef, useState, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  FileSearch,
  CheckCircle2,
  Download,
  ExternalLink,
  Trash2,
  FolderOpen,
  Clipboard,
  AlertTriangle,
  Boxes,
  Layers,
  FileSpreadsheet,
  MapPin,
} from 'lucide-react';
import { generateSampleSonarPngBlob, getSampleSonarImagePath } from '../../services/demoData';

interface DropZoneProps {
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string | null;
  selectedFile: File | null;
  onPingLogSelected?: (file: File | null) => void;
  selectedPingLogFile?: File | null;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onImageSelected,
  previewUrl,
  selectedFile,
  onPingLogSelected,
  selectedPingLogFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pingLogInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);

  // Measure image dimensions whenever previewUrl changes
  useEffect(() => {
    if (!previewUrl) {
      setImageMeta(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const sizeStr = selectedFile
        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
        : 'Sample Blob';
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: sizeStr,
      });
    };
    img.src = previewUrl;
  }, [previewUrl, selectedFile]);

  // Support Global & Local Clipboard Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              const url = URL.createObjectURL(file);
              onImageSelected(file, url);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelected]);

  const handleOpenFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleOpenPingLogPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pingLogInputRef.current) {
      pingLogInputRef.current.value = '';
      pingLogInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  const handlePingLogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onPingLogSelected) {
      onPingLogSelected(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type.includes('image') || dropped.name.match(/\.(png|jpe?g|webp|bmp|tiff?)$/i)) {
        const url = URL.createObjectURL(dropped);
        onImageSelected(dropped, url);
      } else if (dropped.name.match(/\.(csv|json|txt|log)$/i) && onPingLogSelected) {
        onPingLogSelected(dropped);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null, null);
    setImageMeta(null);
  };

  const loadSampleTrack = async (seed: number, name: string) => {
    setIsLoadingSample(true);
    try {
      const pngBlob = await generateSampleSonarPngBlob(seed, name);
      const filename = `${name.toLowerCase().replace(/\s+/g, '_')}.png`;
      const file = new File([pngBlob], filename, {
        type: 'image/png',
      });
      const objectUrl = URL.createObjectURL(pngBlob);
      onImageSelected(file, objectUrl);

      // Also automatically attach the companion ping log
      try {
        const res = await fetch('/samples/sample_ping_log.csv');
        if (res.ok && onPingLogSelected) {
          const pingBlob = await res.blob();
          const pingFile = new File([pingBlob], 'sample_ping_log.csv', { type: 'text/csv' });
          onPingLogSelected(pingFile);
        }
      } catch {
        // Fallback
      }
    } catch (err) {
      console.error('Failed to load sample image:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const downloadSampleImage = (seed: number, filename: string) => {
    const url = getSampleSonarImagePath(seed);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Hidden Native File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={pingLogInputRef}
        type="file"
        accept=".csv,.json,.txt,.log,text/csv,application/json"
        onChange={handlePingLogChange}
        className="hidden"
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleOpenFilePicker}
        className={`relative min-h-[360px] rounded-3xl glass-panel border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 overflow-hidden group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01] shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : previewUrl
            ? 'border-cyan-500/40 bg-[#080F22]/95'
            : 'border-cyan-500/25 hover:border-cyan-400/70 bg-[#0A1226]/60 hover:bg-[#0E1A38]/70 hover:shadow-2xl'
        }`}
      >
        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center space-y-4">
            <div className="relative group/img">
              <img
                src={previewUrl}
                alt="Sonar scan preview"
                className="max-h-[260px] w-auto object-contain rounded-2xl border border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  Change Image
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-500/40 shadow-md">
                {selectedFile ? selectedFile.name : 'Selected Sonar Image'}
              </span>

              {imageMeta && (
                <span className="text-xs font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                  {imageMeta.width} × {imageMeta.height} px • {imageMeta.size}
                </span>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Remove current image"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 max-w-md">
            <div className="w-18 h-18 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400 shadow-xl shadow-cyan-950/60 transition-all duration-300">
              <UploadCloud className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-slate-100 tracking-tight">
                Upload Side-Scan Sonar Imagery
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Drag and drop your raw side-scan sonar image file here, or browse your device.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenFilePicker();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse Image File</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400">
                <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>or Press Ctrl+V</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800">PNG</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800">JPG</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800">WebP</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800">TIFF</span>
            </div>
          </div>
        )}
      </div>

      {/* Companion Ping-Log Ingestion Bar (Automated Geotagging) */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200 flex items-center gap-2">
              <span>Companion Sonar Ping Log</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Auto-Geotagging
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedPingLogFile ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Loaded: {selectedPingLogFile.name} ({(selectedPingLogFile.size / 1024).toFixed(1)} KB)
                </span>
              ) : (
                'Upload optional CSV/JSON ping log to bind WGS84 coordinates & drone heading automatically'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedPingLogFile && (
            <button
              type="button"
              onClick={() => onPingLogSelected && onPingLogSelected(null)}
              className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs"
            >
              Clear Log
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenPingLogPicker}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedPingLogFile ? 'Replace Log' : 'Select Ping Log (.csv)'}</span>
          </button>
        </div>
      </div>

      {/* Preset Sonar Tracks (1-Click Load into Workspace) */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            Calibrated Sonar Benchmarks (1-Click Load)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            MoES SIH Targets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={isLoadingSample}
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(1, 'Vizag MoES Ghost Net ALDFG');
            }}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-purple-950/40 border border-slate-800/80 hover:border-purple-500/40 text-left transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200 group-hover:text-purple-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                Track 1: Ghost Net
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">ALDFG & Entangled Net</p>
          </button>

          <button
            type="button"
            disabled={isLoadingSample}
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(2, 'Kochi Marine Debris Swath');
            }}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-amber-950/40 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                Track 2: Marine Debris
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Drums & Subsea Scraps</p>
          </button>

          <button
            type="button"
            disabled={isLoadingSample}
            onClick={(e) => {
              e.stopPropagation();
              loadSampleTrack(3, 'Mumbai Pipeline & Baseline Swath');
            }}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-blue-950/40 border border-slate-800/80 hover:border-blue-500/40 text-left transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Track 3: Pipeline Trench
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">SubPipe SSS Infrastructure</p>
          </button>
        </div>
      </div>

      {/* Download Sample Files Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          Download Sonar Test Files (.PNG) to Your Device:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => downloadSampleImage(1, 'sih_ghost_net_aldfg_swath.png')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 hover:text-purple-200 transition-colors"
          >
            Ghost Net .png
          </button>
          <button
            type="button"
            onClick={() => downloadSampleImage(2, 'sih_marine_debris_drum.png')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-colors"
          >
            Marine Debris .png
          </button>
          <button
            type="button"
            onClick={() => downloadSampleImage(3, 'sih_subsea_pipeline_trench.png')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-blue-500/30 text-blue-300 hover:text-blue-200 transition-colors"
          >
            Pipeline Trench .png
          </button>
        </div>
      </div>
    </div>
  );
};
