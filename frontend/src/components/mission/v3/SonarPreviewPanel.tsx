import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Plus, Minus, Scan, ArrowUpRight, Box } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface SonarPreviewPanelProps {
  target: MissionV3Target;
  onExpandToFullSonar?: () => void;
}

export type SonarPreviewMode = 'raw' | 'detection' | 'shadow' | '3d';

export function formatDisplayId(id: string): string {
  if (id.startsWith('SX-T0')) return id.replace('SX-T0', 'SX-10');
  if (id.startsWith('SX-T')) return id.replace('SX-T', 'SX-1');
  return id;
}

// Deterministic pseudo-random generator for consistent sonar speckle texture per target
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function renderSonarCanvas(
  canvas: HTMLCanvasElement | null,
  target: MissionV3Target,
  mode: SonarPreviewMode,
  showBbox: boolean,
  zoom: number = 1,
  isThumb: boolean = false
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const seed = hashString(target.id);
  const rand = mulberry32(seed);

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (zoom !== 1 && !isThumb) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
  }

  if (mode === '3d') {
    // 3D Isometric Terrain & Target Relief View
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#050A12');
    bgGrad.addColorStop(1, '#0A1320');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const rows = isThumb ? 14 : 28;
    const cols = isThumb ? 14 : 28;
    const cellW = (W * 0.78) / cols;
    const cellH = (H * 0.55) / rows;
    const startX = W * 0.12;
    const startY = H * 0.22;

    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const nx = (c / cols) * 2 - 1;
        const ny = (r / rows) * 2 - 1;
        const dist = Math.hypot(nx + 0.05, ny - 0.05);
        let elev = Math.sin(c * 0.45) * 2.5 + Math.cos(r * 0.35) * 2.5;
        // Target mound
        if (dist < 0.38) {
          elev += Math.cos((dist / 0.38) * (Math.PI / 2)) * (isThumb ? 14 : 34);
        }
        // Shadow depression to the right
        if (nx > 0.05 && nx < 0.65 && Math.abs(ny - 0.1) < 0.28) {
          elev -= isThumb ? 5 : 12;
        }
        const isoX = startX + c * cellW + (r - rows / 2) * (isThumb ? 1.2 : 2.8);
        const isoY = startY + r * cellH - elev;
        if (c === 0) ctx.moveTo(isoX, isoY);
        else ctx.lineTo(isoX, isoY);
      }
      const isPeakRow = Math.abs(r - rows * 0.52) < rows * 0.18;
      ctx.strokeStyle = isPeakRow
        ? 'rgba(245, 158, 11, 0.75)'
        : 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = isPeakRow ? 1.3 : 0.8;
      ctx.stroke();
    }

    if (!isThumb) {
      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(W * 0.32, H * 0.28, W * 0.34, H * 0.38);
      ctx.setLineDash([]);
      ctx.fillStyle = '#00F5D4';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`3D RELIEF: +${target.shadowLength.toFixed(2)}m`, W * 0.32, H * 0.25);
    }
    ctx.restore();
    return;
  }

  if (mode === 'shadow') {
    // High-contrast grayscale acoustic shadow isolation
    ctx.fillStyle = '#04060A';
    ctx.fillRect(0, 0, W, H);

    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const nadirX = W * 0.48;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        const distFromNadir = Math.abs(x - nadirX) / (W * 0.52);
        const spineGlow = Math.exp(-Math.pow(distFromNadir * 4.5, 2));
        const noise = rand() * 0.45 + 0.55;
        let val = spineGlow * 215 * noise + (1 - distFromNadir * 0.7) * 38 * rand();

        // Target specular + shadow zone
        const tx = W * 0.46;
        const ty = H * 0.52;
        const dx = x - tx;
        const dy = y - ty;
        const tDist = Math.hypot(dx, dy);
        if (tDist < W * 0.08) {
          val = Math.min(255, val + 160 * rand());
        } else if (dx > W * 0.04 && dx < W * 0.38 && Math.abs(dy - dx * 0.22) < H * 0.09) {
          val *= 0.08; // Deep acoustic shadow
        }

        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = Math.min(255, val * 1.05);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    if (!isThumb) {
      // Shadow vector annotation
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(W * 0.5, H * 0.52);
      ctx.lineTo(W * 0.82, H * 0.6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`SHADOW VOID Ls = ${target.shadowLength.toFixed(2)}m`, W * 0.48, H * 0.44);
    }
    ctx.restore();
    return;
  }

  // 'raw' or 'detection' — Golden-Amber Side-Scan Sonar Backscatter
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  // Center-left nadir/ridge scatter spine like the reference image
  const spineCenterX = W * 0.43;
  const targetCX = W * 0.42;
  const targetCY = H * 0.52;

  for (let y = 0; y < H; y++) {
    const ny = y / H;
    // Slight wave in the nadir scatter spine
    const spineX = spineCenterX + Math.sin(ny * 7.5) * (W * 0.025);

    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const distSpine = Math.abs(x - spineX) / W;

      // Base acoustic intensity across range
      const spineEnergy = Math.exp(-Math.pow(distSpine * 3.8, 1.45));
      const rangeFalloff = Math.max(0.08, 1 - Math.pow(distSpine * 1.65, 1.2));

      // Granular Rayleigh/speckle noise
      const r1 = rand();
      const r2 = rand();
      const speckle = Math.pow(r1, 0.65) * 0.75 + (r2 > 0.92 ? 0.45 : 0);

      let intensity = (spineEnergy * 0.68 + rangeFalloff * 0.32) * speckle;

      // Darken upper-left and far edges like real side-scan beam pattern
      const cornerFade =
        Math.hypot((x - W * 0.48) / W, (y - H * 0.52) / H);
      if (cornerFade > 0.48) {
        intensity *= Math.max(0.08, 1 - (cornerFade - 0.48) * 1.9);
      }

      // Acoustic Shadow Cast to the Right-Down of the Target
      const dx = x - targetCX;
      const dy = y - targetCY;
      // Shadow wedge extending rightwards and slightly downwards
      const shadowSlopeY = dx * 0.26;
      const shadowHalfWidth = H * 0.065 + Math.max(0, dx) * 0.14;
      if (
        dx > W * 0.045 &&
        dx < W * 0.54 &&
        Math.abs(dy - shadowSlopeY) < shadowHalfWidth
      ) {
        const edgeDist =
          1 - Math.abs(dy - shadowSlopeY) / shadowHalfWidth;
        const shadowDarkening = Math.max(0.03, 1 - edgeDist * 0.94);
        intensity *= shadowDarkening;
      }

      // Target High-Backscatter Object Geometry (Ghost Net / Debris)
      const objDist = Math.hypot(dx / (W * 0.085), dy / (H * 0.125));
      if (objDist < 1.15) {
        // Create intricate tangled ring + mesh structure like SX-107 in reference
        const angle = Math.atan2(dy, dx);
        const ringRadius = 0.68 + 0.18 * Math.sin(angle * 3 + ny * 12) + 0.12 * Math.cos(angle * 5);
        const distToRing = Math.abs(objDist - ringRadius);
        if (distToRing < 0.24) {
          intensity = Math.min(1.0, intensity + (1 - distToRing / 0.24) * (0.65 + r1 * 0.35));
        }
        // Internal tangled knots / filaments
        const knot1 = Math.hypot((dx - W * 0.015) / (W * 0.03), (dy + H * 0.02) / (H * 0.04));
        const knot2 = Math.hypot((dx + W * 0.02) / (W * 0.025), (dy - H * 0.03) / (H * 0.035));
        if (knot1 < 1 || knot2 < 1) {
          intensity = Math.min(1.0, intensity + 0.55 * r1);
        }
      }

      // Map intensity [0..1] to rich Golden-Amber Side-Scan Color Palette
      const clamped = Math.max(0, Math.min(1, intensity));
      let R = 0, G = 0, B = 0;
      if (clamped < 0.22) {
        const t = clamped / 0.22;
        R = Math.round(t * 58);
        G = Math.round(t * 24);
        B = Math.round(t * 4);
      } else if (clamped < 0.58) {
        const t = (clamped - 0.22) / 0.36;
        R = Math.round(58 + t * 142);
        G = Math.round(24 + t * 78);
        B = Math.round(4 + t * 6);
      } else if (clamped < 0.86) {
        const t = (clamped - 0.58) / 0.28;
        R = Math.round(200 + t * 50);
        G = Math.round(102 + t * 88);
        B = Math.round(10 + t * 18);
      } else {
        const t = (clamped - 0.86) / 0.14;
        R = Math.round(250 + t * 5);
        G = Math.round(190 + t * 55);
        B = Math.round(28 + t * 95);
      }

      data[idx] = R;
      data[idx + 1] = G;
      data[idx + 2] = B;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Draw Detection Bounding Box if mode === 'detection' and showBbox is true
  if (mode === 'detection' && showBbox) {
    const bx = W * 0.31;
    const by = H * 0.36;
    const bw = W * 0.21;
    const bh = H * 0.31;

    // Outer subtle amber glow
    ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = isThumb ? 4 : 10;
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = isThumb ? 1.2 : 1.8;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur = 0;

    // Corner tick accents
    if (!isThumb) {
      const cLen = 8;
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 2.2;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(bx, by + cLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cLen, by);
      // Top-right
      ctx.moveTo(bx + bw - cLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cLen);
      // Bottom-left
      ctx.moveTo(bx, by + bh - cLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cLen, by + bh);
      // Bottom-right
      ctx.moveTo(bx + bw - cLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cLen);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function renderCrossSectionProfile(
  canvas: HTMLCanvasElement | null,
  target: MissionV3Target
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const rand = mulberry32(hashString(target.id + '_profile'));

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#060B14';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
  ctx.lineWidth = 0.7;
  for (let y = 18; y < H; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let x = 40; x < W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  const baseLineY = H - 14;
  const peakX = W * 0.52;
  const peakY = 26;

  // Build profile points
  const points: { x: number; y: number }[] = [];
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * W;
    const distFromPeak = (t - 0.52) / 0.095;
    // Main target relief peak + secondary shoulder bumps
    const mainBump = Math.exp(-distFromPeak * distFromPeak) * (baseLineY - peakY);
    const leftShoulder = Math.exp(-Math.pow((t - 0.43) / 0.04, 2)) * 14;
    const rightShoulder = Math.exp(-Math.pow((t - 0.61) / 0.045, 2)) * 12;
    // Shadow trough on right side
    const shadowDip =
      t > 0.64 && t < 0.82
        ? -Math.sin(((t - 0.64) / 0.18) * Math.PI) * 5
        : 0;
    const roughness = (rand() - 0.5) * 3.2;

    const y = Math.min(
      H - 4,
      Math.max(18, baseLineY - mainBump - leftShoulder - rightShoulder - shadowDip + roughness)
    );
    points.push({ x, y });
  }

  // Gradient fill under curve
  const grad = ctx.createLinearGradient(0, peakY, 0, H);
  grad.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
  grad.addColorStop(0.65, 'rgba(217, 119, 6, 0.15)');
  grad.addColorStop(1, 'rgba(217, 119, 6, 0.02)');

  ctx.beginPath();
  ctx.moveTo(0, H);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Secondary subtle background echo curve
  ctx.beginPath();
  points.forEach((p, idx) => {
    const y2 = Math.min(H - 3, p.y + 6 + Math.sin(idx * 0.3) * 2);
    if (idx === 0) ctx.moveTo(p.x, y2);
    else ctx.lineTo(p.x, y2);
  });
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Primary glowing amber profile stroke
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Vertical dashed height measurement line at peak
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(peakX, baseLineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Small horizontal ticks at top and bottom of measurement line
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(peakX - 4, peakY);
  ctx.lineTo(peakX + 4, peakY);
  ctx.moveTo(peakX - 4, baseLineY);
  ctx.lineTo(peakX + 4, baseLineY);
  ctx.stroke();
}

export const SonarPreviewPanel: React.FC<SonarPreviewPanelProps> = ({
  target,
  onExpandToFullSonar,
}) => {
  const [activeMode, setActiveMode] = useState<SonarPreviewMode>('detection');
  const [showBbox, setShowBbox] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const rawThumbRef = useRef<HTMLCanvasElement>(null);
  const detThumbRef = useRef<HTMLCanvasElement>(null);
  const shdThumbRef = useRef<HTMLCanvasElement>(null);
  const v3dThumbRef = useRef<HTMLCanvasElement>(null);

  const displayId = formatDisplayId(target.id);

  useEffect(() => {
    renderSonarCanvas(mainCanvasRef.current, target, activeMode, showBbox, zoom, false);
  }, [target, activeMode, showBbox, zoom]);

  useEffect(() => {
    renderCrossSectionProfile(profileCanvasRef.current, target);
    renderSonarCanvas(rawThumbRef.current, target, 'raw', false, 1, true);
    renderSonarCanvas(detThumbRef.current, target, 'detection', true, 1, true);
    renderSonarCanvas(shdThumbRef.current, target, 'shadow', false, 1, true);
    renderSonarCanvas(v3dThumbRef.current, target, '3d', false, 1, true);
  }, [target]);

  const THUMB_MODES: {
    key: SonarPreviewMode;
    label: string;
    ref: React.RefObject<HTMLCanvasElement | null>;
  }[] = [
    { key: 'raw', label: 'RAW SONAR', ref: rawThumbRef },
    { key: 'detection', label: 'DETECTION', ref: detThumbRef },
    { key: 'shadow', label: 'SHADOW', ref: shdThumbRef },
    { key: '3d', label: '3D VIEW', ref: v3dThumbRef },
  ];

  return (
    <div className="w-full h-full bg-[#070C16] border-r border-[#142238] flex flex-col font-sans select-none overflow-hidden">
      {/* ── 1. HEADER: SONAR PREVIEW (SX-107) ── */}
      <div className="h-9 px-3 bg-[#080E1A] border-b border-[#142238] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          <span className="text-[11px] font-bold tracking-wider text-[#E2E8F0] uppercase font-mono">
            SONAR PREVIEW ({displayId})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onExpandToFullSonar && (
            <button
              onClick={onExpandToFullSonar}
              title="Open in Full Sonar Viewport"
              className="p-1 rounded bg-[#0D1726] border border-[#1E2E48] text-[#94A3B8] hover:text-white hover:border-[#38BDF8] cursor-pointer transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setShowBbox((v) => !v)}
            title="Toggle Detection Bounding Box"
            className={`p-1 rounded border cursor-pointer transition-colors ${
              showBbox
                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                : 'bg-[#0D1726] border-[#1E2E48] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. LARGE SQUARE SONAR BACKSCATTER CANVAS ── */}
      <div className="p-2.5 flex-1 min-h-[190px] flex flex-col">
        <div className="relative flex-1 rounded-lg overflow-hidden border border-[#1A2B44] bg-[#040810] shadow-inner">
          <canvas
            ref={mainCanvasRef}
            width={340}
            height={310}
            className="w-full h-full object-cover block"
          />

          {/* Floating Zoom Controls (Top Right) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            <button
              onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.25).toFixed(2)))}
              title="Zoom In"
              className="w-6 h-6 rounded bg-[#091220]/90 border border-[#1E3250] hover:border-[#38BDF8] text-[#CBD5E1] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(1.0, +(z - 0.25).toFixed(2)))}
              title="Zoom Out"
              className="w-6 h-6 rounded bg-[#091220]/90 border border-[#1E3250] hover:border-[#38BDF8] text-[#CBD5E1] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              title="Reset Zoom"
              className="w-6 h-6 rounded bg-[#091220]/90 border border-[#1E3250] hover:border-[#38BDF8] text-[#CBD5E1] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow"
            >
              <Scan className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. ACOUSTIC PROFILE (CROSS-SECTION) ── */}
      <div className="px-2.5 pb-2 shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[#38BDF8] text-[10px]">▸</span>
          <span className="text-[10.5px] font-bold tracking-wider text-[#CBD5E1] uppercase font-mono">
            ACOUSTIC PROFILE (CROSS-SECTION)
          </span>
        </div>

        <div className="relative h-[88px] rounded-lg overflow-hidden border border-[#16263D] bg-[#060B14]">
          <canvas
            ref={profileCanvasRef}
            width={340}
            height={88}
            className="w-full h-full block"
          />
          {/* Peak Relief Callout Pill */}
          <div
            className="absolute top-1.5 left-[52%] -translate-x-1/2 px-2 py-0.5 rounded bg-[#0D1829]/95 border border-[#334155] text-[10px] font-mono font-bold text-[#F8FAFC] flex items-center gap-1 shadow-md pointer-events-none"
          >
            <span className="text-[#38BDF8]">↕</span>
            <span>{target.shadowLength.toFixed(2)} m</span>
          </div>
        </div>
      </div>

      {/* ── 4. FOUR VIEW MODE THUMBNAIL SELECTOR CARDS ── */}
      <div className="px-2.5 pb-2.5 pt-0.5 shrink-0">
        <div className="grid grid-cols-4 gap-1.5">
          {THUMB_MODES.map(({ key, label, ref }) => {
            const isActive = activeMode === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMode(key)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-full aspect-square rounded-md overflow-hidden border transition-all ${
                    isActive
                      ? 'border-2 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                      : 'border-[#1A2B44] opacity-80 group-hover:opacity-100 group-hover:border-[#334155]'
                  }`}
                >
                  <canvas
                    ref={ref}
                    width={84}
                    height={84}
                    className="w-full h-full object-cover block pointer-events-none"
                  />
                </div>
                <span
                  className={`mt-1 text-[9px] font-mono font-bold tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-[#00E5FF]'
                      : 'text-[#64748B] group-hover:text-[#CBD5E1]'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
