import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Maximize2, Download,
  ChevronLeft, ChevronRight, Crosshair, Ruler, Radio, BarChart2,
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { MISSION_TARGETS } from '../data/targets';

const SONAR_WIDTH  = 800;
const SONAR_HEIGHT = 560;

export const SonarViewerPage: React.FC = () => {
  const { selectedTargetId, setSelectedTargetId } = useMission();
  const [zoom, setZoom]               = useState(1);
  const [showBoxes, setShowBoxes]     = useState(true);
  const [showLabels, setShowLabels]   = useState(true);
  const [gain, setGain]               = useState(1.0);
  const [contrast, setContrast]       = useState(1.0);
  const [mode, setMode]               = useState<'waterfall' | 'sidescan'>('sidescan');
  const [targetIdx, setTargetIdx]     = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw synthetic sonar image to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = SONAR_WIDTH;
    canvas.height = SONAR_HEIGHT;

    // Background
    ctx.fillStyle = '#01060D';
    ctx.fillRect(0, 0, SONAR_WIDTH, SONAR_HEIGHT);

    const cx = SONAR_WIDTH / 2;
    const nadirW = 28;

    // Sonar waterfall rows
    for (let y = 0; y < SONAR_HEIGHT; y++) {
      for (let x = 0; x < SONAR_WIDTH; x++) {
        const distFromCenter = Math.abs(x - cx);
        if (distFromCenter < nadirW / 2) {
          ctx.fillStyle = 'rgb(1,3,8)';
          ctx.fillRect(x, y, 1, 1);
          continue;
        }
        // Base seafloor noise with some texture
        const seed = (x * 127 + y * 311) % 997;
        let intensity = 0.06 + (seed % 100) / 1000 + Math.sin(y * 0.18 + x * 0.05) * 0.04;
        // Stronger near nadir
        if (distFromCenter < nadirW * 2) intensity += 0.4 * (1 - distFromCenter / (nadirW * 2));

        const r = Math.floor(Math.min(255, intensity * 50  * gain));
        const g = Math.floor(Math.min(255, intensity * 220 * gain));
        const b = Math.floor(Math.min(255, intensity * 255 * gain));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Centre nadir
    ctx.fillStyle = 'rgba(50,230,209,0.08)';
    ctx.fillRect(cx - nadirW / 2, 0, nadirW, SONAR_HEIGHT);

    // Draw all 17 targets
    MISSION_TARGETS.forEach((target, idx) => {
      const tx = cx + (idx % 9 - 4) * 72 + (idx % 3) * 14;
      const ty = 60 + Math.floor(idx / 9) * 220 + (idx % 4) * 50;

      // Target echo
      ctx.save();
      ctx.shadowColor = target.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = target.color;
      ctx.beginPath();
      if (target.classCode === 'MLO') {
        ctx.ellipse(tx, ty, target.length * 12, target.width * 12, target.orientation * Math.PI / 180, 0, Math.PI * 2);
      } else if (target.classCode === 'PIP') {
        ctx.rect(tx - target.length * 10, ty - 3, target.length * 20, 6);
      } else {
        ctx.ellipse(tx, ty, target.length * 8, target.width * 8, 0, 0, Math.PI * 2);
      }
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.restore();

      // Acoustic shadow
      const shadowLen = target.shadowLength * 18;
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#000810';
      ctx.beginPath();
      ctx.moveTo(tx + target.length * 10, ty - 6);
      ctx.lineTo(tx + target.length * 10 + shadowLen, ty - 2);
      ctx.lineTo(tx + target.length * 10 + shadowLen, ty + 2);
      ctx.lineTo(tx + target.length * 10, ty + 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // HUD text
    ctx.fillStyle = 'rgba(50,230,209,0.7)';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText('SONARX SX-014 · 900 kHz · RANGE 75m · PORT / STARBOARD', 12, 22);
    ctx.fillStyle = 'rgba(102,132,141,0.6)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('PORT', 12, SONAR_HEIGHT - 10);
    ctx.fillText('STARBOARD', SONAR_WIDTH - 90, SONAR_HEIGHT - 10);
    // Range lines
    for (let i = 1; i <= 4; i++) {
      const rx = cx + (SONAR_WIDTH / 2 - 40) * i / 4;
      ctx.fillStyle = 'rgba(102,132,141,0.3)';
      ctx.fillRect(rx, SONAR_HEIGHT - 18, 1, 10);
      ctx.fillText(`${i * 20}m`, rx - 8, SONAR_HEIGHT - 20);
      const lx = cx - (SONAR_WIDTH / 2 - 40) * i / 4;
      ctx.fillRect(lx, SONAR_HEIGHT - 18, 1, 10);
      ctx.fillText(`${i * 20}m`, lx - 8, SONAR_HEIGHT - 20);
    }
  }, [gain, contrast]);

  const getTargetPosition = (idx: number) => {
    const target = MISSION_TARGETS[idx];
    const cx = SONAR_WIDTH / 2;
    const tx = cx + (idx % 9 - 4) * 72 + (idx % 3) * 14;
    const ty = 60 + Math.floor(idx / 9) * 220 + (idx % 4) * 50;
    return { tx, ty, target };
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'SX-014_sonar_scan.png';
    a.href = canvas.toDataURL();
    a.click();
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-black text-[#E4F2F5]">Sonar Viewer</h1>
          <p className="text-[10px] font-mono text-[#66848D] mt-0.5">Mission SX-014 · Side-Scan Sonar · 900 kHz</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0C171E] border border-[#16303B] text-[#66848D] hover:text-[#32E6D1] text-xs font-mono transition-all">
          <Download className="w-3.5 h-3.5" />
          Export PNG
        </button>
      </div>

      <div className="rounded-2xl bg-[#081118] border border-[#16303B] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#16303B] bg-[#03070B]/80">
          <div className="flex items-center gap-1.5">
            {/* Zoom */}
            <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} className="toolbar-btn"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="toolbar-btn"><ZoomOut className="w-3.5 h-3.5" /></button>
            <button onClick={() => setZoom(1)} className="toolbar-btn"><RotateCcw className="w-3.5 h-3.5" /></button>
            <span className="text-[9px] font-mono text-[#66848D] px-1">{(zoom * 100).toFixed(0)}%</span>
            <div className="w-px h-4 bg-[#16303B] mx-1" />
            {/* Toggles */}
            <button onClick={() => setShowBoxes(!showBoxes)} className={`toolbar-btn ${showBoxes ? 'text-[#32E6D1]' : ''}`} title="Toggle bounding boxes">
              {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowLabels(!showLabels)} className={`toolbar-btn ${showLabels ? 'text-[#32E6D1]' : ''}`} title="Toggle labels">
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-[#16303B] mx-1" />
            {/* Mode */}
            {(['sidescan', 'waterfall'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-colors ${mode === m ? 'bg-[#32E6D1]/10 border-[#32E6D1]/40 text-[#32E6D1]' : 'bg-transparent border-[#16303B] text-[#66848D]'}`}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Gain / Contrast */}
          <div className="flex items-center gap-3 text-[9px] font-mono text-[#66848D]">
            <label className="flex items-center gap-1.5">
              GAIN
              <input type="range" min={0.3} max={2.5} step={0.1} value={gain}
                onChange={e => setGain(Number(e.target.value))}
                className="w-20 h-1 accent-[#32E6D1]" />
              <span className="text-[#32E6D1] w-8">{gain.toFixed(1)}×</span>
            </label>
            <label className="flex items-center gap-1.5">
              CONTRAST
              <input type="range" min={0.5} max={3} step={0.1} value={contrast}
                onChange={e => setContrast(Number(e.target.value))}
                className="w-20 h-1 accent-[#32E6D1]" />
              <span className="text-[#32E6D1] w-8">{contrast.toFixed(1)}×</span>
            </label>
          </div>
        </div>

        {/* Canvas viewport */}
        <div className="overflow-auto bg-[#01060D] flex items-center justify-center" style={{ maxHeight: 580 }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.15s', position: 'relative', display: 'inline-block' }}>
            <canvas ref={canvasRef} style={{ display: 'block', filter: `contrast(${contrast})` }} />

            {/* SVG bounding box overlay */}
            {showBoxes && (
              <svg
                viewBox={`0 0 ${SONAR_WIDTH} ${SONAR_HEIGHT}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
                preserveAspectRatio="none"
              >
                {MISSION_TARGETS.map((target, idx) => {
                  const { tx, ty } = getTargetPosition(idx);
                  const bw = target.length * 24 + 12;
                  const bh = target.width * 24 + 12;
                  const x1 = tx - bw / 2;
                  const y1 = ty - bh / 2;
                  const isSelected = selectedTargetId === target.id;

                  return (
                    <g key={target.id} onClick={() => setSelectedTargetId(isSelected ? null : target.id)} className="cursor-pointer">
                      <rect x={x1} y={y1} width={bw} height={bh}
                        fill={target.color} fillOpacity={isSelected ? 0.25 : 0.08}
                        stroke={target.color} strokeWidth={isSelected ? 2.5 : 1.5}
                        strokeDasharray={isSelected ? '5 2' : undefined}
                      />
                      {showLabels && (
                        <g>
                          <rect x={x1} y={y1 - 16} width={Math.max(50, target.id.length * 7 + 30)} height={14}
                            fill="#03070B" fillOpacity={0.9} stroke={target.color} strokeWidth={0.8} rx={2} />
                          <text x={x1 + 4} y={y1 - 5} fill={target.color} fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                            {target.id} {(target.confidence * 100).toFixed(0)}%
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Status strip */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#16303B] bg-[#03070B]/60 text-[9px] font-mono text-[#66848D]">
          <div className="flex items-center gap-4">
            <span>{SONAR_WIDTH} × {SONAR_HEIGHT} px</span>
            <span className="text-[#32E6D1]">{MISSION_TARGETS.length} targets overlaid</span>
            {selectedTargetId && <span className="text-[#FFB547]">Selected: {selectedTargetId}</span>}
          </div>
          <span>900 kHz · AUV Altitude 8.4 m · Swath 75 m</span>
        </div>
      </div>

      {/* Target selector below */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2">
        {MISSION_TARGETS.map(target => (
          <button
            key={target.id}
            onClick={() => setSelectedTargetId(selectedTargetId === target.id ? null : target.id)}
            className={`p-2 rounded-xl border text-left transition-all text-[10px] font-mono ${
              selectedTargetId === target.id
                ? 'border-[#32E6D1]/50 bg-[#32E6D1]/10 text-[#32E6D1]'
                : 'border-[#16303B] bg-[#081118] text-[#66848D] hover:border-[#32E6D1]/30'
            }`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: target.color }} />
              <span className="font-bold text-[#E4F2F5]">{target.id}</span>
            </div>
            <div className="text-[8px] text-[#66848D] truncate">{target.class}</div>
            <div className="text-[9px] font-bold mt-0.5" style={{ color: target.color }}>{(target.confidence * 100).toFixed(0)}%</div>
          </button>
        ))}
      </div>
    </div>
  );
};
