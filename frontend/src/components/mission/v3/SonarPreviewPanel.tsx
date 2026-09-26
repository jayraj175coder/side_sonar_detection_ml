import React, { useEffect, useRef, useState } from 'react';
import { Plus, Minus, Scan, ArrowUpRight, Box } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

export type ExtendedMissionTarget = MissionV3Target & {
  customImageUrl?: string;
  customBbox?: { x1: number; y1: number; x2: number; y2: number };
};

interface SonarPreviewPanelProps {
  target: ExtendedMissionTarget;
  onExpandToFullSonar?: () => void;
}

export type SonarPreviewMode = 'raw' | 'detection' | 'shadow' | '3d';

export function formatDisplayId(id: string): string {
  if (id.startsWith('SX-T0')) return id.replace('SX-T0', 'SX-10');
  if (id.startsWith('SX-T')) return id.replace('SX-T', 'SX-1');
  return id;
}

// Deterministic PRNG per target ID
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

export type TargetMorphology =
  | 'ghost_net'
  | 'fishing_gear'
  | 'pipeline_cable'
  | 'industrial_debris'
  | 'wreck_anomaly'
  | 'filtered_clutter';

export function getTargetMorphology(target: MissionV3Target): TargetMorphology {
  if (target.status === 'FILTERED' || target.shadowLength < 0.25) {
    return 'filtered_clutter';
  }
  if (target.id === 'SX-T07' || target.category === 'GHOST NET' || target.label.toLowerCase().includes('net')) {
    return 'ghost_net';
  }
  if (target.id === 'SX-T01' || target.label.toLowerCase().includes('cable') || target.label.toLowerCase().includes('pipe')) {
    return 'pipeline_cable';
  }
  if (target.category === 'FISHING GEAR' || target.label.toLowerCase().includes('gear') || target.label.toLowerCase().includes('trap') || target.label.toLowerCase().includes('pot')) {
    return 'fishing_gear';
  }
  if (target.category === 'ANOMALY' || target.label.toLowerCase().includes('wreck')) {
    return 'wreck_anomaly';
  }
  return 'industrial_debris';
}

function mapAmberColor(intensity: number): [number, number, number] {
  const c = Math.max(0, Math.min(1, intensity));
  if (c < 0.22) {
    const t = c / 0.22;
    return [Math.round(t * 58), Math.round(t * 24), Math.round(t * 4)];
  } else if (c < 0.58) {
    const t = (c - 0.22) / 0.36;
    return [Math.round(58 + t * 142), Math.round(24 + t * 78), Math.round(4 + t * 6)];
  } else if (c < 0.86) {
    const t = (c - 0.58) / 0.28;
    return [Math.round(200 + t * 50), Math.round(102 + t * 88), Math.round(10 + t * 18)];
  } else {
    const t = (c - 0.86) / 0.14;
    return [Math.round(250 + t * 5), Math.round(190 + t * 58), Math.round(28 + t * 105)];
  }
}

export function renderSonarCanvas(
  canvas: HTMLCanvasElement | null,
  target: ExtendedMissionTarget,
  mode: SonarPreviewMode,
  showBbox: boolean,
  zoom: number = 1,
  isThumb: boolean = false,
  loadedImage?: HTMLImageElement | null
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const seed = hashString(target.id);
  const rand = mulberry32(seed);
  const morph = getTargetMorphology(target);

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (zoom !== 1 && !isThumb) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
  }

  // If user uploaded/pinned a real sonar image and we are in raw or detection mode
  if (loadedImage && (mode === 'raw' || mode === 'detection')) {
    ctx.drawImage(loadedImage, 0, 0, W, H);
    if (mode === 'detection' && showBbox) {
      const bx = target.customBbox ? (target.customBbox.x1 / 640) * W : W * 0.28;
      const by = target.customBbox ? (target.customBbox.y1 / 640) * H : H * 0.3;
      const bw = target.customBbox ? ((target.customBbox.x2 - target.customBbox.x1) / 640) * W : W * 0.32;
      const bh = target.customBbox ? ((target.customBbox.y2 - target.customBbox.y1) / 640) * H : H * 0.34;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = isThumb ? 1.2 : 2;
      ctx.strokeRect(bx, by, bw, bh);
      if (!isThumb) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
        ctx.fillRect(bx, Math.max(0, by - 16), Math.min(W - bx, 155), 16);
        ctx.fillStyle = '#050810';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(
          `${formatDisplayId(target.id)} ${target.label.toUpperCase()} ${(target.confidence * 100).toFixed(1)}%`,
          bx + 4,
          Math.max(11, by - 4)
        );
      }
    }
    ctx.restore();
    return;
  }

  // ── MODE: 3D VIEW ──
  if (mode === '3d') {
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
    const startY = H * 0.24;
    const reliefFactor = morph === 'filtered_clutter' ? 0.1 : Math.min(1.5, target.shadowLength / 2.0);

    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const nx = (c / cols) * 2 - 1;
        const ny = (r / rows) * 2 - 1;
        let elev = Math.sin(c * 0.45) * 2 + Math.cos(r * 0.35) * 2;

        if (morph === 'pipeline_cable') {
          const lineDist = Math.abs(nx * 0.7 - ny * 0.5);
          if (lineDist < 0.22) {
            elev += Math.cos((lineDist / 0.22) * (Math.PI / 2)) * (isThumb ? 10 : 24);
          }
        } else if (morph !== 'filtered_clutter') {
          const dist = Math.hypot(nx + 0.08, ny - 0.04);
          if (dist < 0.42) {
            elev +=
              Math.cos((dist / 0.42) * (Math.PI / 2)) *
              (isThumb ? 14 : 34) *
              reliefFactor;
          }
          if (nx > 0.05 && nx < 0.7 && Math.abs(ny - 0.08) < 0.28) {
            elev -= (isThumb ? 4 : 10) * reliefFactor;
          }
        }

        const isoX = startX + c * cellW + (r - rows / 2) * (isThumb ? 1.2 : 2.6);
        const isoY = startY + r * cellH - elev;
        if (c === 0) ctx.moveTo(isoX, isoY);
        else ctx.lineTo(isoX, isoY);
      }
      const isPeakRow = Math.abs(r - rows * 0.52) < rows * 0.2;
      ctx.strokeStyle = isPeakRow
        ? morph === 'filtered_clutter'
          ? 'rgba(148, 163, 184, 0.45)'
          : 'rgba(245, 158, 11, 0.78)'
        : 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = isPeakRow ? 1.3 : 0.8;
      ctx.stroke();
    }

    if (!isThumb) {
      ctx.fillStyle = morph === 'filtered_clutter' ? '#94A3B8' : '#00F5D4';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        morph === 'filtered_clutter'
          ? 'FLAT SEABED (0.00m RELIEF — CLUTTER)'
          : `3D ACOUSTIC RELIEF: +${target.shadowLength.toFixed(2)}m`,
        12,
        20
      );
    }
    ctx.restore();
    return;
  }

  // ── PIXEL-LEVEL SONAR SYNTHESIS FOR 'raw', 'detection', AND 'shadow' ──
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  const spineCenterX = W * 0.43;
  const targetCX = W * 0.41;
  const targetCY = H * 0.53;

  for (let y = 0; y < H; y++) {
    const ny = y / H;
    const spineX = spineCenterX + Math.sin(ny * 7.0) * (W * 0.02);

    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const nx = x / W;
      const distSpine = Math.abs(x - spineX) / W;

      // Base acoustic seafloor backscatter
      const spineEnergy = Math.exp(-Math.pow(distSpine * 3.6, 1.4));
      const rangeFalloff = Math.max(0.08, 1 - Math.pow(distSpine * 1.6, 1.2));
      const r1 = rand();
      const r2 = rand();
      const speckle = Math.pow(r1, 0.68) * 0.74 + (r2 > 0.91 ? 0.42 : 0);

      let intensity = (spineEnergy * 0.64 + rangeFalloff * 0.36) * speckle;

      // Subtle natural sand ripple modulation
      intensity += Math.sin(nx * 28 + ny * 18) * 0.035;

      // Vignette at outer range edges
      const cornerFade = Math.hypot((x - W * 0.48) / W, (y - H * 0.52) / H);
      if (cornerFade > 0.5) {
        intensity *= Math.max(0.08, 1 - (cornerFade - 0.5) * 1.8);
      }

      const dx = x - targetCX;
      const dy = y - targetCY;

      // ── MORPHOLOGY-SPECIFIC TARGET ECHO & ACOUSTIC SHADOW ──
      if (morph === 'ghost_net') {
        // 1. Wide diagonal dark acoustic shadow trailing right-downwards
        const shadowSlopeY = dx * 0.25;
        const shadowHalfW = H * 0.085 + Math.max(0, dx) * 0.145;
        if (
          dx > W * 0.035 &&
          dx < W * 0.58 &&
          Math.abs(dy - shadowSlopeY) < shadowHalfW
        ) {
          const edgeRatio = 1 - Math.abs(dy - shadowSlopeY) / shadowHalfW;
          // Irregular shadow edge matching porous gillnet canopy
          const waveEdge = Math.sin(ny * 45) * 0.12;
          if (edgeRatio + waveEdge > 0.15) {
            intensity *= Math.max(0.02, 1 - edgeRatio * 0.95);
          }
        }

        // 2. Intricate Ghost Net (ALDFG) Mesh & Float-Line Canopy
        const normDX = dx / (W * 0.095);
        const normDY = dy / (H * 0.145);
        const objDist = Math.hypot(normDX, normDY);

        if (objDist < 1.25) {
          const angle = Math.atan2(normDY, normDX);
          // Outer deformed gillnet headline loop
          const outerLoop =
            0.78 +
            0.18 * Math.sin(angle * 3 + 0.8) +
            0.14 * Math.cos(angle * 5 - 0.4);
          const dOuter = Math.abs(objDist - outerLoop);
          if (dOuter < 0.22) {
            intensity = Math.min(
              1.0,
              intensity + (1 - dOuter / 0.22) * (0.62 + r1 * 0.38)
            );
          }

          // Secondary internal twisted net folds & bridal lines
          const innerLoop =
            0.42 + 0.15 * Math.cos(angle * 4 + normDY * 3);
          const dInner = Math.abs(objDist - innerLoop);
          if (dInner < 0.18) {
            intensity = Math.min(
              1.0,
              intensity + (1 - dInner / 0.18) * (0.55 + r1 * 0.35)
            );
          }

          // Cross-hatching monofilament mesh strands inside the net
          const meshGrid =
            Math.abs(Math.sin(dx * 0.32 + dy * 0.18)) < 0.22 ||
            Math.abs(Math.cos(dx * 0.24 - dy * 0.28)) < 0.22;
          if (objDist < outerLoop && meshGrid && r1 > 0.35) {
            intensity = Math.min(1.0, intensity + 0.42 * r1);
          }

          // Bright acoustic floats / lead-line weights (specular highlights)
          const float1 = Math.hypot(normDX + 0.35, normDY + 0.55);
          const float2 = Math.hypot(normDX - 0.25, normDY - 0.48);
          const float3 = Math.hypot(normDX + 0.52, normDY - 0.15);
          if (float1 < 0.22 || float2 < 0.24 || float3 < 0.2) {
            intensity = Math.min(1.0, 0.88 + r1 * 0.12);
          }
        }
      } else if (morph === 'fishing_gear') {
        // String of 3 rectangular fish/crab traps along a ground-line + shadow
        const pots = [
          { px: -W * 0.03, py: -H * 0.08 },
          { px: W * 0.0, py: H * 0.01 },
          { px: W * 0.03, py: H * 0.1 },
        ];
        // Ground-line connecting pots
        const lineDist = Math.abs(dx - dy * 0.33);
        if (Math.abs(dy) < H * 0.14 && lineDist < 2.2) {
          intensity = Math.min(1.0, intensity + 0.55);
        }
        pots.forEach((p) => {
          const pdx = dx - p.px;
          const pdy = dy - p.py;
          // Shadow to the right of each trap pot
          if (pdx > 8 && pdx < W * 0.36 && Math.abs(pdy - pdx * 0.18) < H * 0.038) {
            intensity *= 0.05;
          }
          // Trap frame highlight
          if (Math.abs(pdx) < 11 && Math.abs(pdy) < 9) {
            const isFrameEdge = Math.abs(pdx) > 7 || Math.abs(pdy) > 5.5;
            if (isFrameEdge) {
              intensity = Math.min(1.0, 0.82 + r1 * 0.18);
            }
          }
        });
      } else if (morph === 'pipeline_cable') {
        // Diagonal linear subsea pipeline/cable spanning across the image + parallel shadow trench
        const lineOffset = (y - H * 0.5) - (x - W * 0.45) * 0.48;
        if (Math.abs(lineOffset) < 4.5) {
          intensity = Math.min(1.0, 0.84 + r1 * 0.16);
        } else if (lineOffset >= 4.5 && lineOffset < 22) {
          intensity *= 0.06; // Parallel pipeline acoustic shadow trench
        }
        // Snagged debris mass at pipeline midpoint
        const snagDist = Math.hypot(dx, dy);
        if (snagDist < W * 0.065) {
          intensity = Math.min(1.0, intensity + 0.55 * r1);
        }
      } else if (morph === 'industrial_debris') {
        // Sharp rectangular container / drum cluster + crisp deep rectangular shadow
        const rotX = dx * 0.92 + dy * 0.38;
        const rotY = -dx * 0.38 + dy * 0.92;
        if (dx > 12 && dx < W * 0.46 && Math.abs(dy - dx * 0.2) < H * 0.08) {
          intensity *= 0.03;
        }
        if (Math.abs(rotX) < W * 0.055 && Math.abs(rotY) < H * 0.085) {
          const isEdge =
            Math.abs(rotX) > W * 0.038 ||
            Math.abs(rotY) > H * 0.065 ||
            Math.abs(rotY) < 2.5;
          intensity = isEdge
            ? Math.min(1.0, 0.9 + r1 * 0.1)
            : Math.min(1.0, intensity + 0.48 * r1);
        }
      } else if (morph === 'wreck_anomaly') {
        // Angular hull wreckage with structural ribs + long jagged shadow pocket
        const shadowLim = H * 0.11 * (1 - Math.max(0, dx) / (W * 0.55));
        if (dx > 10 && dx < W * 0.52 && Math.abs(dy - dx * 0.22) < Math.max(4, shadowLim)) {
          intensity *= 0.03;
        }
        const hullDist = Math.abs(dx * 0.8 + dy * 0.5) + Math.abs(dy * 0.7 - dx * 0.3) * 0.6;
        if (hullDist < W * 0.095) {
          const ribPattern = Math.sin((dx + dy) * 0.45) > 0.25;
          intensity = Math.min(1.0, intensity + (ribPattern ? 0.72 : 0.38) * (0.7 + r1 * 0.3));
        }
      } else {
        // 'filtered_clutter' — Wavy sand ripples / side-lobe echo with ZERO acoustic shadow
        const rippleWave = Math.sin(dx * 0.22 + dy * 0.15) * Math.exp(-Math.hypot(dx, dy) / (W * 0.16));
        if (rippleWave > 0.2) {
          intensity = Math.min(0.85, intensity + rippleWave * 0.42);
        }
      }

      if (mode === 'shadow') {
        // High-contrast grayscale shadow segmentation view
        const gray = Math.round(Math.max(0, Math.min(1, intensity)) * 255);
        data[idx] = gray;
        data[idx + 1] = gray;
        data[idx + 2] = Math.min(255, Math.round(gray * 1.06));
        data[idx + 3] = 255;
      } else {
        const [R, G, B] = mapAmberColor(intensity);
        data[idx] = R;
        data[idx + 1] = G;
        data[idx + 2] = B;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Overlays for non-thumbnail view
  if (mode === 'shadow' && !isThumb) {
    ctx.strokeStyle = morph === 'filtered_clutter' ? '#EF4444' : '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(targetCX + 10, targetCY);
    ctx.lineTo(targetCX + W * 0.38, targetCY + H * 0.09);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = morph === 'filtered_clutter' ? '#F87171' : '#38BDF8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(
      morph === 'filtered_clutter'
        ? 'NO SHADOW VOID (0.00m — REJECTED)'
        : `SHADOW VOID Ls = ${target.shadowLength.toFixed(2)}m`,
      targetCX - 20,
      targetCY - H * 0.18
    );
  }

  if (mode === 'detection' && showBbox) {
    const bx = W * 0.29;
    const by = H * 0.34;
    const bw = W * 0.24;
    const bh = H * 0.35;
    const isFiltered = morph === 'filtered_clutter';
    const boxColor = isFiltered ? '#EF4444' : '#F59E0B';

    ctx.shadowColor = isFiltered ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = isThumb ? 4 : 10;
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = isThumb ? 1.3 : 1.8;
    if (isFiltered) ctx.setLineDash([4, 3]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    if (!isThumb) {
      // Corner bracket ticks
      const cLen = 8;
      ctx.strokeStyle = isFiltered ? '#FCA5A5' : '#FDE68A';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(bx, by + cLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cLen, by);
      ctx.moveTo(bx + bw - cLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cLen);
      ctx.moveTo(bx, by + bh - cLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cLen, by + bh);
      ctx.moveTo(bx + bw - cLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cLen);
      ctx.stroke();

      // Top detection tag badge
      const labelStr = isFiltered
        ? `${formatDisplayId(target.id)} SUPPRESSED (${(target.confidence * 100).toFixed(0)}%)`
        : `${formatDisplayId(target.id)} ${target.label.toUpperCase()} ${(target.confidence * 100).toFixed(1)}%`;
      ctx.font = 'bold 9.5px monospace';
      const textW = ctx.measureText(labelStr).width + 10;
      ctx.fillStyle = isFiltered ? 'rgba(127, 29, 29, 0.92)' : 'rgba(120, 53, 15, 0.92)';
      ctx.fillRect(bx, by - 16, textW, 15);
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by - 16, textW, 15);
      ctx.fillStyle = isFiltered ? '#FECACA' : '#FEF08A';
      ctx.fillText(labelStr, bx + 5, by - 5);
    }
  }

  ctx.restore();
}

function renderCrossSectionProfile(
  canvas: HTMLCanvasElement | null,
  target: ExtendedMissionTarget
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const rand = mulberry32(hashString(target.id + '_profile'));
  const morph = getTargetMorphology(target);
  const isFlat = morph === 'filtered_clutter' || target.shadowLength < 0.25;

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
  // Scale peak height proportionally to target.shadowLength!
  const normalizedRelief = isFlat
    ? 0.04
    : Math.max(0.25, Math.min(1.0, target.shadowLength / 2.6));
  const peakY = baseLineY - normalizedRelief * (baseLineY - 24);
  const peakX = W * 0.52;

  const points: { x: number; y: number }[] = [];
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * W;
    if (isFlat) {
      // Flat seabed ripple profile for 0.00m shadow false-positives
      const ripple = Math.sin(t * 28) * 2.2 + (rand() - 0.5) * 2.0;
      points.push({ x, y: baseLineY - 3 + ripple });
    } else {
      const distFromPeak = (t - 0.52) / 0.095;
      const mainBump = Math.exp(-distFromPeak * distFromPeak) * (baseLineY - peakY);
      const leftShoulder = Math.exp(-Math.pow((t - 0.43) / 0.04, 2)) * (12 * normalizedRelief);
      const rightShoulder = Math.exp(-Math.pow((t - 0.61) / 0.045, 2)) * (10 * normalizedRelief);
      const shadowDip =
        t > 0.64 && t < 0.84
          ? -Math.sin(((t - 0.64) / 0.2) * Math.PI) * 5.5
          : 0;
      const roughness = (rand() - 0.5) * 2.8;

      const y = Math.min(
        H - 4,
        Math.max(18, baseLineY - mainBump - leftShoulder - rightShoulder - shadowDip + roughness)
      );
      points.push({ x, y });
    }
  }

  const strokeColor = isFlat ? '#64748B' : '#F59E0B';
  const grad = ctx.createLinearGradient(0, peakY, 0, H);
  if (isFlat) {
    grad.addColorStop(0, 'rgba(100, 116, 139, 0.22)');
    grad.addColorStop(1, 'rgba(100, 116, 139, 0.02)');
  } else {
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
    grad.addColorStop(0.65, 'rgba(217, 119, 6, 0.15)');
    grad.addColorStop(1, 'rgba(217, 119, 6, 0.02)');
  }

  ctx.beginPath();
  ctx.moveTo(0, H);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = isFlat ? 'transparent' : 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = isFlat ? 0 : 6;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = strokeColor;
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
}

export const SonarPreviewPanel: React.FC<SonarPreviewPanelProps> = ({
  target,
  onExpandToFullSonar,
}) => {
  const [activeMode, setActiveMode] = useState<SonarPreviewMode>('detection');
  const [showBbox, setShowBbox] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const rawThumbRef = useRef<HTMLCanvasElement>(null);
  const detThumbRef = useRef<HTMLCanvasElement>(null);
  const shdThumbRef = useRef<HTMLCanvasElement>(null);
  const v3dThumbRef = useRef<HTMLCanvasElement>(null);

  const displayId = formatDisplayId(target.id);

  // Load custom uploaded image if present on target
  useEffect(() => {
    if (!target.customImageUrl) {
      setLoadedImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedImg(img);
    img.onerror = () => setLoadedImg(null);
    img.src = target.customImageUrl;
  }, [target.customImageUrl]);

  useEffect(() => {
    renderSonarCanvas(mainCanvasRef.current, target, activeMode, showBbox, zoom, false, loadedImg);
  }, [target, activeMode, showBbox, zoom, loadedImg]);

  useEffect(() => {
    renderCrossSectionProfile(profileCanvasRef.current, target);
    renderSonarCanvas(rawThumbRef.current, target, 'raw', false, 1, true, loadedImg);
    renderSonarCanvas(detThumbRef.current, target, 'detection', true, 1, true, loadedImg);
    renderSonarCanvas(shdThumbRef.current, target, 'shadow', false, 1, true, loadedImg);
    renderSonarCanvas(v3dThumbRef.current, target, '3d', false, 1, true, loadedImg);
  }, [target, loadedImg]);

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
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
          <span className="text-[11px] font-bold tracking-wider text-[#E2E8F0] uppercase font-mono truncate">
            SONAR PREVIEW ({displayId})
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
            onClick={() => {
              setActiveMode('detection');
              setShowBbox((v) => !v);
            }}
            title="Toggle Detection Bounding Box"
            className={`p-1 rounded border cursor-pointer transition-colors ${
              showBbox && activeMode === 'detection'
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
          <div className="absolute top-1.5 left-[52%] -translate-x-1/2 px-2 py-0.5 rounded bg-[#0D1829]/95 border border-[#334155] text-[10px] font-mono font-bold text-[#F8FAFC] flex items-center gap-1 shadow-md pointer-events-none">
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
                onClick={() => {
                  setActiveMode(key);
                  if (key === 'detection') setShowBbox(true);
                }}
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
