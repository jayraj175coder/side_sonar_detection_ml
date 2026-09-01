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
  Check,
  ListOrdered,
  Plus,
} from 'lucide-react';
import { generateSampleSonarPngBlob, getSampleSonarImagePath } from '../../services/demoData';

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
      if (e.target.files.length === 1) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        onImageSelected(file, url);
      } else {
        const filesArray = Array.from(e.target.files);
        if (onBatchFilesSelected) onBatchFilesSelected(filesArray);
        const url = URL.createObjectURL(filesArray[0]);
        onImageSelected(filesArray[0], url);
      }
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
      if (e.dataTransfer.files.length === 1) {
        const dropped = e.dataTransfer.files[0];
        if (dropped.type.includes('image') || dropped.name.match(/\.(png|jpe?g|webp|bmp|tiff?)$/i)) {
          const url = URL.createObjectURL(dropped);
          onImageSelected(dropped, url);
        } else if (dropped.name.match(/\.(csv|json|txt|log)$/i) && onPingLogSelected) {
          onPingLogSelected(dropped);
        }
      } else {
        // Multi-file dropped
        const filesArray = Array.from(e.dataTransfer.files).filter(
          (f) => f.type.includes('image') || f.name.match(/\.(png|jpe?g|webp|bmp|tiff?)$/i)
        );
        if (filesArray.length > 0) {
          if (onBatchFilesSelected) onBatchFilesSelected(filesArray);
          const url = URL.createObjectURL(filesArray[0]);
          onImageSelected(filesArray[0], url);
        }
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
    <div className="space-y-4 font-mono select-none">
      {/* Hidden Native File Inputs (Single, Multiple Batch, and Ping Log) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={batchInputRef}
        type="file"
        multiple
        accept="image/*,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif"
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

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleOpenFilePicker}
        className={`relative min-h-[340px] rounded-3xl glass-panel border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 overflow-hidden group ${
          isDragging
            ? 'border-[#4CD9E8] bg-[#4CD9E8]/10 scale-[1.01] shadow-[0_0_30px_rgba(76,217,232,0.3)]'
            : previewUrl
            ? 'border-[#4CD9E8]/40 bg-[#060D17]'
            : 'border-[#152438] hover:border-[#4CD9E8]/50 bg-[#0A1322]/80 hover:shadow-2xl'
        }`}
      >
        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center space-y-3">
            <div className="relative group/img">
              <img
                src={previewUrl}
                alt="Sonar scan preview"
                className="max-h-[220px] w-auto object-contain rounded-2xl border border-[#152438] shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
              />
              <div className="absolute inset-0 bg-[#03070E]/60 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4CD9E8] text-[#03070E] font-mono text-xs font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  Change Image
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-mono font-bold text-[#4CD9E8] bg-[#0A1A2E] px-3 py-1 rounded-lg border border-[#4CD9E8]/40 shadow-md">
                {selectedFile ? selectedFile.name : 'Selected Sonar Image'}
              </span>

              {imageMeta && (
                <span className="font-mono text-[#7C8AA0] bg-[#060D17] px-3 py-1 rounded-lg border border-[#152438]">
                  {imageMeta.width} × {imageMeta.height} px • {imageMeta.size}
                </span>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-[#0A1322] border border-[#152438] text-[#7C8AA0] hover:text-[#F04438] transition-colors cursor-pointer"
                title="Clear selected image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-[#060D17] border border-[#152438] flex items-center justify-center text-[#4CD9E8] shadow-[0_0_20px_rgba(76,217,232,0.15)] group-hover:scale-110 group-hover:border-[#4CD9E8]/60 transition-all duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#EAEFF5] uppercase tracking-wider">
                DRAG & DROP RAW SONAR SWATH
              </h3>
              <p className="text-xs text-[#7C8AA0]">
                Drop single image swath, multi-frame log, or click to browse.
              </p>
            </div>

            {/* Ingestion Mode Badges */}
            <div className="flex items-center gap-2 text-[9px] font-mono text-[#7C8AA0] flex-wrap justify-center">
              <span className="px-2 py-0.5 rounded bg-[#060D17] border border-[#152438]">
                PNG / JPG / TIFF
              </span>
              <span className="px-2 py-0.5 rounded bg-[#060D17] border border-[#152438]">
                900 kHz / 450 kHz
              </span>
              <span className="px-2 py-0.5 rounded bg-[#060D17] border border-[#152438]">
                Clipboard (Ctrl+V)
              </span>
            </div>

            {/* SIH GAP 4 — Batch / Log Ingestion Button */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenBatchPicker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A1A2E] border border-[#4CD9E8]/40 hover:border-[#4CD9E8] text-[#4CD9E8] text-[9px] font-bold transition-all shadow-md cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Upload Sonar Image Log (Batch)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPingLogPicker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060D17] border border-[#152438] hover:border-[#3FD98A]/40 text-[#3FD98A] text-[9px] font-bold transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Attach Ping Log CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SIH GAP 4 — Batch File Queue List if Multiple Files Loaded */}
      {batchFiles.length > 1 && (
        <div className="p-3 rounded-2xl bg-[#060D17] border border-[#152438] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#7C8AA0]">
            <span className="font-bold text-[#4CD9E8] flex items-center gap-1">
              <ListOrdered className="w-3.5 h-3.5 text-[#4CD9E8]" />
              BATCH SONAR LOG QUEUE ({batchFiles.length} SWATHS)
            </span>
            <span className="text-[#3FD98A]">Batch Ready</span>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            {batchFiles.map((file, idx) => (
              <div
                key={file.name + idx}
                onClick={() => {
                  const url = URL.createObjectURL(file);
                  onImageSelected(file, url);
                }}
                className={`p-1.5 rounded-lg border text-[9px] flex items-center justify-between cursor-pointer transition-colors ${
                  selectedFile?.name === file.name
                    ? 'bg-[#0A1A2E] border-[#4CD9E8]/50 text-[#4CD9E8]'
                    : 'bg-[#0A1322] border-[#152438] text-[#7C8AA0] hover:text-[#EAEFF5]'
                }`}
              >
                <span className="truncate max-w-[220px]">
                  {idx + 1}. {file.name}
                </span>
                <span className="text-[8px] font-bold text-[#3FD98A]">
                  {(file.size / 1024).toFixed(0)} KB · READY
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attached Ping Log Badge */}
      {selectedPingLogFile && (
        <div className="p-2.5 rounded-xl bg-[#091D17] border border-[#3FD98A]/30 text-[10px] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3FD98A]">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Companion Ping Log: <strong>{selectedPingLogFile.name}</strong></span>
          </div>
          <span className="text-[8px] text-[#3FD98A] font-bold">GEO-CORRELATED</span>
        </div>
      )}
    </div>
  );
};
