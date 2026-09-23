import React, { useRef, useState, useEffect } from 'react';
import {
  FolderOpen,
  FileSpreadsheet,
  Layers,
  FileText,
  X,
  Crosshair,
  Radio,
  Sliders,
} from 'lucide-react';

interface DropZoneProps {
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string | null;
  selectedFile: File | null;
  onPingLogSelected?: (file: File | null) => void;
  selectedPingLogFile?: File | null;
  onBatchFilesSelected?: (files: File[]) => void;
  batchFiles?: File[];
}

export const DropZone: React.FC<DropZoneProps> = ({
  onImageSelected,
  previewUrl,
  selectedFile,
  onPingLogSelected,
  selectedPingLogFile,
  onBatchFilesSelected,
  batchFiles = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const pingLogInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
        : 'Sample Swath';
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: sizeStr,
      });
    };
    img.src = previewUrl;
  }, [previewUrl, selectedFile]);

  // Support Global & Local Clipboard Paste
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

  const handleOpenFilePicker = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleOpenBatchPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (batchInputRef.current) {
      batchInputRef.current.value = '';
      batchInputRef.current.click();
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
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      if (onBatchFilesSelected) onBatchFilesSelected(filesArray);
      const url = URL.createObjectURL(filesArray[0]);
      onImageSelected(filesArray[0], url);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('image') || file.name.match(/\.(png|jpe?g|webp|bmp|tiff?|xtf|jsf)$/i)) {
        const url = URL.createObjectURL(file);
        onImageSelected(file, url);
      } else if (file.name.match(/\.(csv|json|txt|log)$/i) && onPingLogSelected) {
        onPingLogSelected(file);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null, null);
    setImageMeta(null);
    if (onBatchFilesSelected) onBatchFilesSelected([]);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0B111A] border border-white/[0.08] font-sans select-none shadow-xl space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.xtf,.jsf"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={batchInputRef}
        type="file"
        multiple
        accept="image/*,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.xtf,.jsf"
        onChange={handleBatchFileChange}
        className="hidden"
      />
      <input
        ref={pingLogInputRef}
        type="file"
        accept=".csv,.json,.txt,.log,text/csv,application/json"
        onChange={handlePingLogChange}
        className="hidden"
      />

      {/* ── LEFT PANEL HEADER: SONAR SWATH INGESTION ── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00B8D9]" />
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            SONAR SWATH INGESTION
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>CHANNELS: PORT &amp; STBD DUAL</span>
        </div>
      </div>

      {/* ── DRAG & DROP WORKSPACE ── */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => handleOpenFilePicker()}
        className={`relative min-h-[220px] rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-6 text-center group ${
          isDragging
            ? 'border-[#FFB800] bg-[#FFB800]/10 scale-[1.005]'
            : previewUrl
            ? 'border-white/[0.12] bg-[#070D16]'
            : 'border-white/[0.1] hover:border-[#FFB800]/60 bg-[#070D16]/90'
        }`}
      >
        {previewUrl ? (
          /* When a File/Sample is Loaded: Show Interactive Swath Preview */
          <div className="relative w-full flex flex-col items-center space-y-3">
            <div className="relative max-h-[170px] w-full rounded-lg overflow-hidden border border-white/[0.1] bg-black/60 flex items-center justify-center group/img">
              <img
                src={previewUrl}
                alt="Sonar swath input"
                className="max-h-[170px] w-auto object-contain sepia contrast-125 brightness-95"
              />
              {/* Scanline sweep */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none" />

              {/* Clear button */}
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-white/20 transition cursor-pointer"
                title="Remove Swath"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ingestion Readout Bar */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="font-bold text-[#FFB800] px-2.5 py-1 rounded bg-[#FFB800]/10 border border-[#FFB800]/30 truncate max-w-[260px]">
                {selectedFile ? selectedFile.name : 'Selected Sonar Swath'}
              </span>
              {imageMeta && (
                <span className="text-slate-400 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[11px]">
                  {imageMeta.width} × {imageMeta.height} px • {imageMeta.size}
                </span>
              )}
              {selectedPingLogFile && (
                <span className="text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px]">
                  + GPS Log Attached
                </span>
              )}
            </div>
          </div>
        ) : (
          /* When No File: Restrained Text + Sonar Swath Strip Preview */
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="space-y-1">
              <div className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                DROP SIDE-SCAN SONAR SWATH
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Upload a single sonar image, multi-frame swath, or sonar log.
              </p>
              <p className="text-[10px] font-mono text-[#00B8D9] pt-0.5">
                Supported: PNG / JPG / TIFF / XTF / JSF
              </p>
            </div>

            {/* Operational Sonar Swath Strip Graphic (Authentic Waterline & Nadir) */}
            <div className="w-full max-w-md h-16 rounded-lg overflow-hidden border border-white/[0.08] bg-[#040810] relative flex items-center justify-between px-3">
              {/* Left Port Channel Texture */}
              <div className="flex-1 h-full opacity-60 flex items-center justify-center bg-[repeating-linear-gradient(90deg,#060D1A,#060D1A_2px,#0B1B30_2px,#0B1B30_4px)]">
                <span className="text-[8px] font-mono text-slate-500">PORT SWATH [0–60m]</span>
              </div>
              
              {/* Nadir Center Divider */}
              <div className="w-4 h-full bg-[#02050B] border-x border-white/[0.1] flex items-center justify-center">
                <div className="w-0.5 h-full bg-[#FFB800]/50" />
              </div>

              {/* Right Starboard Channel Texture */}
              <div className="flex-1 h-full opacity-60 flex items-center justify-center bg-[repeating-linear-gradient(90deg,#060D1A,#060D1A_2px,#0B1B30_2px,#0B1B30_4px)]">
                <span className="text-[8px] font-mono text-slate-500">STARBOARD SWATH [0–60m]</span>
              </div>

              {/* Scale bar at bottom */}
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500">
                0 25 50 m
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3 EXPLICIT BUTTONS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={(e) => handleOpenFilePicker(e)}
          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#FFB800]/50 text-slate-200 hover:text-[#FFB800] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Choose Files</span>
        </button>

        <button
          type="button"
          onClick={handleOpenBatchPicker}
          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#FFB800]/50 text-slate-200 hover:text-[#FFB800] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Upload Sonar Image Log</span>
        </button>

        <button
          type="button"
          onClick={handleOpenPingLogPicker}
          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#FFB800]/50 text-slate-200 hover:text-[#FFB800] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Attach Ping Log CSV</span>
        </button>
      </div>

      {/* ── TECHNICAL INFORMATION ROW ── */}
      <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center">
        <div className="p-2 rounded-lg bg-[#070D16] border border-white/[0.04]">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">FREQUENCY</span>
          <span className="text-white font-bold text-[11px]">900 kHz</span>
        </div>
        <div className="p-2 rounded-lg bg-[#070D16] border border-white/[0.04]">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">SWATH</span>
          <span className="text-[#FFB800] font-bold text-[11px]">120 m</span>
        </div>
        <div className="p-2 rounded-lg bg-[#070D16] border border-white/[0.04]">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">RESOLUTION</span>
          <span className="text-white font-bold text-[11px]">&lt; 15 cm</span>
        </div>
        <div className="p-2 rounded-lg bg-[#070D16] border border-white/[0.04]">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">PING RATE</span>
          <span className="text-emerald-400 font-bold text-[11px]">LIVE</span>
        </div>
      </div>
    </div>
  );
};
