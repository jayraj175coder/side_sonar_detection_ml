import React, { useRef, useEffect, useState } from 'react';
import {
  MousePointer,
  Crosshair,
  Square,
  Ruler,
  MapPin,
  Hexagon,
  Trash2,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';
import { formatDisplayId } from './SonarPreviewPanel';

export type CenterViewportMode = 'map' | 'sonar' | 'split' | '3d';

interface MissionSubseaMapViewerProps {
  targets: MissionV3Target[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  onBackToSonar: () => void;
  onExportReport: () => void;
  onView3D?: () => void;
  activeViewMode?: CenterViewportMode;
  onChangeViewMode?: (mode: CenterViewportMode) => void;
  currentFrame?: number;
  totalFrames?: number;
}

interface MapLayersConfig {
  sonarDetections: boolean;
  acousticShadows: boolean;
  verifiedTargets: boolean;
  anomalyZones: boolean;
  auvTrack: boolean;
  pingPositions: boolean;
  surveyCoverage: boolean;
  bathymetryContours: boolean;
  depthMap: boolean;
  currentVectors: boolean;
  pipelineHazard: boolean;
}

const DEFAULT_MAP_LAYERS: MapLayersConfig = {
  sonarDetections: true,
  acousticShadows: true,
  verifiedTargets: true,
  anomalyZones: true,
  auvTrack: true,
  pingPositions: true,
  surveyCoverage: true,
  bathymetryContours: true,
  depthMap: true,
  currentVectors: false,
  pipelineHazard: true,
};

// Key featured callout targets matching the reference screenshot positions
const FEATURED_CALLOUTS: Record<
  string,
  {
    displayCode: string;
    normX: number;
    normY: number;
    boxOffsetX: number;
    boxOffsetY: number;
    color: string;
    fillTint: string;
    shapeType: 'net' | 'debris' | 'hazard' | 'gear';
  }
> = {
  'SX-T07': {
    displayCode: 'SX-107',
    normX: 0.37,
    normY: 0.44,
    boxOffsetX: -28,
    boxOffsetY: -44,
    color: '#F59E0B',
    fillTint: 'rgba(245, 158, 11, 0.18)',
    shapeType: 'net',
  },
  'SX-T03': {
    displayCode: 'SX-103',
    normX: 0.65,
    normY: 0.42,
    boxOffsetX: -22,
    boxOffsetY: -38,
    color: '#A3E635',
    fillTint: 'rgba(163, 230, 53, 0.16)',
    shapeType: 'gear',
  },
  'SX-T05': {
    displayCode: 'SX-105',
    normX: 0.47,
    normY: 0.63,
    boxOffsetX: -24,
    boxOffsetY: -42,
    color: '#EF4444',
    fillTint: 'rgba(239, 68, 68, 0.18)',
    shapeType: 'hazard',
  },
  'SX-T01': {
    displayCode: 'SX-101',
    normX: 0.16,
    normY: 0.72,
    boxOffsetX: -24,
    boxOffsetY: -44,
    color: '#10B981',
    fillTint: 'rgba(16, 185, 129, 0.18)',
    shapeType: 'debris',
  },
};

export const MissionSubseaMapViewer: React.FC<MissionSubseaMapViewerProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  onBackToSonar,
  onView3D,
  activeViewMode = 'map',
  onChangeViewMode,
  currentFrame = 81,
  totalFrames = 128,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'center' | 'box' | 'ruler' | 'pin'>('select');
  const [layers, setLayers] = useState<MapLayersConfig>(DEFAULT_MAP_LAYERS);
  const [showLayerPopover, setShowLayerPopover] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<string>('18.922°N, 72.821°E');

  // Interactive GIS annotations state
  const [measurePts, setMeasurePts] = useState<{ x: number; y: number }[]>([]);
  const [customPins, setCustomPins] = useState<{ x: number; y: number; label: string }[]>([]);
  const [roiBox, setRoiBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDrawingBox, setIsDrawingBox] = useState<boolean>(false);

  const toggleLayer = (key: keyof MapLayersConfig) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Trackline curve helper (0..1 -> canvas x,y)
  const getTrackPoint = (t: number, W: number, H: number) => {
    // Smooth S-curve from bottom-left (0.04, 0.88) to top-right (0.96, 0.16)
    const x = W * (0.04 + t * 0.92);
    const baseLinearY = 0.88 - t * 0.72;
    const wave = Math.sin(t * Math.PI * 2.1) * 0.045 + Math.cos(t * Math.PI * 3.4) * 0.018;
    const y = H * (baseLinearY + wave);
    return { x, y };
  };

  // Get target position on canvas
  const getTargetCanvasPos = (target: MissionV3Target, W: number, H: number) => {
    const featured = FEATURED_CALLOUTS[target.id];
    if (featured) {
      return { x: featured.normX * W, y: featured.normY * H };
    }
    const px = ((target.longitude - 72.812) / 0.024) * (W * 0.75) + W * 0.12;
    const py = ((18.93 - target.latitude) / 0.016) * (H * 0.75) + H * 0.12;
    return {
      x: Math.max(40, Math.min(W - 40, px)),
      y: Math.max(40, Math.min(H - 40, py)),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // 1. Deep Ocean Bathymetric Background
    const bgGrad = ctx.createRadialGradient(W * 0.48, H * 0.48, 40, W * 0.5, H * 0.5, W * 0.75);
    bgGrad.addColorStop(0, '#07182E');
    bgGrad.addColorStop(0.55, '#040D1A');
    bgGrad.addColorStop(1, '#02060D');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle Seabed Acoustic Mosaic Grid & Diagonal Survey Lines
    ctx.strokeStyle = 'rgba(30, 58, 95, 0.22)';
    ctx.lineWidth = 0.7;
    for (let x = 0; x < W; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Diagonal faint survey tracklines across the ocean floor
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 0.8;
    for (let i = -3; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 150, 0);
      ctx.lineTo(i * 150 + 340, H);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * 120);
      ctx.lineTo(W, i * 120 - 260);
      ctx.stroke();
    }

    // 3. Bathymetry Contours & Depth Labels (-120m, -140m, -160m, -180m)
    if (layers.bathymetryContours || layers.depthMap) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      const contourOffsets = [-180, -110, -45, 35, 110, 185];
      contourOffsets.forEach((offset, idx) => {
        ctx.beginPath();
        for (let s = 0; s <= 50; s++) {
          const u = s / 50;
          const pt = getTrackPoint(u, W, H);
          const wave = Math.sin(u * 9 + idx) * 14;
          const cx = pt.x + offset * 0.55 + wave;
          const cy = pt.y + offset + wave * 0.6;
          if (s === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      });

      // Depth Labels matching screenshot
      ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
      ctx.font = '11px monospace';
      ctx.fillText('-120m', W * 0.31, H * 0.11);
      ctx.fillText('-140m', W * 0.29, H * 0.22);
      ctx.fillText('-160m', W * 0.14, H * 0.27);
      ctx.fillText('-180m', W * 0.11, H * 0.42);
      ctx.fillText('-160m', W * 0.44, H * 0.81);
      ctx.fillText('-180m', W * 0.42, H * 0.91);
    }

    // 4. Glowing Cyan-Blue Side-Scan Swath Corridor
    if (layers.surveyCoverage) {
      const upperSwath: { x: number; y: number }[] = [];
      const lowerSwath: { x: number; y: number }[] = [];
      const steps = 70;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const center = getTrackPoint(t, W, H);
        // Swath width modulation for realistic side-scan mosaic look
        const halfW = 68 + Math.sin(t * 15) * 8 + Math.cos(t * 7) * 6;
        // Normal vector approx (-0.58, -0.81)
        upperSwath.push({ x: center.x - halfW * 0.58, y: center.y - halfW * 0.82 });
        lowerSwath.push({ x: center.x + halfW * 0.58, y: center.y + halfW * 0.82 });
      }

      // Outer swath glow fill
      ctx.save();
      ctx.beginPath();
      upperSwath.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      for (let i = lowerSwath.length - 1; i >= 0; i--) {
        ctx.lineTo(lowerSwath[i].x, lowerSwath[i].y);
      }
      ctx.closePath();

      const swathGrad = ctx.createLinearGradient(0, H, W, 0);
      swathGrad.addColorStop(0, 'rgba(14, 116, 144, 0.28)');
      swathGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.36)');
      swathGrad.addColorStop(1, 'rgba(6, 182, 212, 0.26)');
      ctx.fillStyle = swathGrad;
      ctx.fill();

      // Internal acoustic scanline ribs along the swath
      ctx.clip();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.13)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= steps; i += 2) {
        ctx.beginPath();
        ctx.moveTo(upperSwath[i].x, upperSwath[i].y);
        ctx.lineTo(lowerSwath[i].x, lowerSwath[i].y);
        ctx.stroke();
      }

      // Stippled bathymetric backscatter dots inside swath
      ctx.fillStyle = 'rgba(125, 211, 252, 0.16)';
      for (let i = 0; i < 320; i++) {
        const u = (Math.sin(i * 12.9898) * 0.5 + 0.5);
        const v = (Math.cos(i * 78.233) * 0.5 + 0.5) * 2 - 1;
        const c = getTrackPoint(u, W, H);
        const sx = c.x + v * 38;
        const sy = c.y + v * 52;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.restore();

      // Swath glowing cyan top and bottom edge borders
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      upperSwath.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      ctx.beginPath();
      lowerSwath.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }

    // 5. Red Dashed POTENTIAL PIPELINE HAZARD Zone (Right Edge)
    if (layers.pipelineHazard) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(W * 0.99, H * 0.18);
      ctx.lineTo(W * 0.79, H * 0.44);
      ctx.lineTo(W * 0.99, H * 0.69);
      ctx.closePath();

      const hazGrad = ctx.createLinearGradient(W * 0.79, H * 0.44, W, H * 0.44);
      hazGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
      hazGrad.addColorStop(1, 'rgba(239, 68, 68, 0.06)');
      ctx.fillStyle = hazGrad;
      ctx.fill();

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(W * 0.99, H * 0.18);
      ctx.lineTo(W * 0.79, H * 0.44);
      ctx.lineTo(W * 0.99, H * 0.69);
      ctx.stroke();
      ctx.setLineDash([]);

      // Warning Icon + POTENTIAL PIPELINE HAZARD text
      const wx = W * 0.86;
      const wy = H * 0.44;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(wx, wy - 8);
      ctx.lineTo(wx - 7, wy + 5);
      ctx.lineTo(wx + 7, wy + 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#050810';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('!', wx - 1.5, wy + 4);

      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('POTENTIAL', wx + 11, wy - 2);
      ctx.fillText('PIPELINE HAZARD', wx + 11, wy + 8);
      ctx.restore();
    }

    // 6. Dashed Cyan AUV Survey Trackline & Glowing Ping Nodes
    if (layers.auvTrack) {
      ctx.save();
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const pt = getTrackPoint(i / 80, W, H);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    if (layers.pingPositions) {
      const pingNodes = [0.12, 0.22, 0.34, 0.44, 0.59, 0.68, 0.79, 0.9];
      pingNodes.forEach((u) => {
        const pt = getTrackPoint(u, W, H);
        ctx.save();
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 7. AUV-07 Vehicle + Forward Acoustic Beam Fan Cone + "82.0m" Callout
    const auvProgress = Math.max(0.18, Math.min(0.85, 0.35 + (currentFrame / totalFrames) * 0.32));
    const auvPos = getTrackPoint(auvProgress, W, H);
    const auvAhead = getTrackPoint(auvProgress + 0.05, W, H);
    const auvAngle = Math.atan2(auvAhead.y - auvPos.y, auvAhead.x - auvPos.x);

    // Acoustic fan beam cone projecting forward-up-right
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(auvPos.x, auvPos.y);
    ctx.lineTo(auvPos.x + 15, auvPos.y - 95);
    ctx.lineTo(auvPos.x + 115, auvPos.y - 32);
    ctx.closePath();
    const coneGrad = ctx.createRadialGradient(auvPos.x, auvPos.y, 4, auvPos.x + 55, auvPos.y - 55, 110);
    coneGrad.addColorStop(0, 'rgba(34, 211, 238, 0.42)');
    coneGrad.addColorStop(1, 'rgba(34, 211, 238, 0.04)');
    ctx.fillStyle = coneGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vertical reference drop line to "82.0m" pill above AUV
    const calloutX = auvPos.x + 14;
    const calloutY = auvPos.y - 95;
    ctx.fillStyle = '#E0F2FE';
    ctx.beginPath();
    ctx.arc(calloutX, calloutY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText('82.0m', calloutX - 34, calloutY + 3);

    // Draw 3D-styled AUV body at auvPos
    ctx.translate(auvPos.x, auvPos.y);
    ctx.rotate(auvAngle);
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 12;
    // Outer hull glow ring
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Torpedo body
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bright cockpit/sonar nose
    ctx.fillStyle = '#E0F2FE';
    ctx.beginPath();
    ctx.arc(5, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Plot Secondary Confirmed Targets as Glowing Dots + Tag Pill when Selected
    if (layers.sonarDetections) {
      targets.forEach((t) => {
        if (FEATURED_CALLOUTS[t.id]) return; // Drawn as rich callout boxes below
        const isSel = t.id === selectedTargetId;
        if (t.status === 'FILTERED' && !isSel) return;
        const pos = getTargetCanvasPos(t, W, H);
        const dotColor =
          t.status === 'FILTERED'
            ? '#F87171'
            : t.priority === 'HIGH'
            ? '#EF4444'
            : '#38BDF8';
        ctx.save();
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSel ? 5 : 3.2, 0, Math.PI * 2);
        ctx.fill();
        if (isSel) {
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 1.6;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          const code = formatDisplayId(t.id);
          ctx.fillStyle = '#070E1B';
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 1.2;
          ctx.fillRect(pos.x - 23, pos.y - 28, 46, 14);
          ctx.strokeRect(pos.x - 23, pos.y - 28, 46, 14);
          ctx.fillStyle = dotColor;
          ctx.font = 'bold 9.5px monospace';
          ctx.fillText(code, pos.x - 18, pos.y - 18);
        }
        ctx.restore();
      });
    }

    // 9. Draw Featured Boxed Target Callout Cards (SX-107, SX-103, SX-105, SX-101)
    if (layers.sonarDetections || layers.verifiedTargets) {
      Object.entries(FEATURED_CALLOUTS).forEach(([targetId, cfg]) => {
        const targetObj = targets.find((t) => t.id === targetId);
        if (!targetObj) return;
        const isSelected = selectedTargetId === targetId;

        const px = cfg.normX * W;
        const py = cfg.normY * H;
        const bx = px + cfg.boxOffsetX;
        const by = py + cfg.boxOffsetY;
        const boxW = 54;
        const boxH = 34;

        ctx.save();

        // Target seabed pin dot
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Selection outer pulse ring
        if (isSelected) {
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(px, py, 42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Main Callout Card Box
        ctx.fillStyle = 'rgba(6, 12, 24, 0.88)';
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = isSelected ? 2 : 1.3;
        if (isSelected) {
          ctx.shadowColor = cfg.color;
          ctx.shadowBlur = 12;
        }
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeRect(bx, by, boxW, boxH);
        ctx.shadowBlur = 0;

        // Top Header Tag Pill (e.g. [SX-107])
        const tagW = 46;
        const tagH = 14;
        ctx.fillStyle = '#070E1B';
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 1.2;
        ctx.fillRect(bx + 4, by - tagH + 2, tagW, tagH);
        ctx.strokeRect(bx + 4, by - tagH + 2, tagW, tagH);

        ctx.fillStyle = cfg.color;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(cfg.displayCode, bx + 9, by - 2);

        // Mini Target Silhouette Graphic inside the box
        const cx = bx + boxW / 2;
        const cy = by + boxH / 2 + 2;
        ctx.fillStyle = cfg.color;
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 1.2;

        if (cfg.shapeType === 'net') {
          // Ghost net mesh blob
          ctx.beginPath();
          ctx.ellipse(cx - 2, cy, 13, 6, 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#070E1B';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy - 3);
          ctx.lineTo(cx + 6, cy + 3);
          ctx.moveTo(cx - 6, cy + 4);
          ctx.lineTo(cx + 6, cy - 3);
          ctx.stroke();
        } else if (cfg.shapeType === 'gear') {
          // Irregular fishing gear / trap silhouette
          ctx.beginPath();
          ctx.moveTo(cx - 12, cy + 4);
          ctx.lineTo(cx - 4, cy - 5);
          ctx.lineTo(cx + 8, cy - 2);
          ctx.lineTo(cx + 12, cy + 5);
          ctx.closePath();
          ctx.fill();
        } else if (cfg.shapeType === 'hazard') {
          // Red anomaly / debris silhouette
          ctx.beginPath();
          ctx.ellipse(cx, cy, 11, 5.5, -0.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Green SX-101 rounded object silhouette
          ctx.beginPath();
          ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    }

    // 10. Draw Custom User GIS Annotations (Ruler, ROI Box, Custom Pins)
    if (roiBox) {
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      const rx = Math.min(roiBox.x1, roiBox.x2);
      const ry = Math.min(roiBox.y1, roiBox.y2);
      const rw = Math.abs(roiBox.x2 - roiBox.x1);
      const rh = Math.abs(roiBox.y2 - roiBox.y1);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (measurePts.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#F59E0B';
      ctx.fillStyle = '#F59E0B';
      ctx.lineWidth = 1.8;
      measurePts.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      if (measurePts.length === 2) {
        const [p1, p2] = measurePts;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        const distMeters = (Math.hypot(p2.x - p1.x, p2.y - p1.y) * 1.45).toFixed(1);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        ctx.fillStyle = '#070E1B';
        ctx.fillRect(mx - 28, my - 16, 56, 14);
        ctx.strokeRect(mx - 28, my - 16, 56, 14);
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${distMeters} m`, mx - 20, my - 6);
      }
      ctx.restore();
    }

    customPins.forEach((pin) => {
      ctx.save();
      ctx.fillStyle = '#00F5D4';
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 9px monospace';
      ctx.fillText(pin.label, pin.x + 7, pin.y + 3);
      ctx.restore();
    });
  }, [targets, selectedTargetId, layers, currentFrame, totalFrames, roiBox, measurePts, customPins]);

  // Handle Canvas Click (Select target, or use active GIS tool)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (activeTool === 'ruler') {
      setMeasurePts((prev) => (prev.length >= 2 ? [{ x, y }] : [...prev, { x, y }]));
      return;
    }

    if (activeTool === 'pin') {
      setCustomPins((prev) => [...prev, { x, y, label: `WP-0${prev.length + 1}` }]);
      return;
    }

    // Check Featured Callout Boxes first
    for (const [targetId, cfg] of Object.entries(FEATURED_CALLOUTS)) {
      const px = cfg.normX * canvas.width;
      const py = cfg.normY * canvas.height;
      const bx = px + cfg.boxOffsetX;
      const by = py + cfg.boxOffsetY;
      if (
        (x >= bx - 6 && x <= bx + 60 && y >= by - 16 && y <= by + 40) ||
        Math.hypot(x - px, y - py) < 28
      ) {
        onSelectTarget(targetId);
        return;
      }
    }

    // Check remaining targets
    let nearest: MissionV3Target | null = null;
    let minDist = 32;
    targets.forEach((target) => {
      const pos = getTargetCanvasPos(target, canvas.width, canvas.height);
      const d = Math.hypot(pos.x - x, pos.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = target;
      }
    });

    if (nearest) {
      onSelectTarget((nearest as MissionV3Target).id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const lat = (18.928 - ny * 0.012).toFixed(3);
    const lon = (72.815 + nx * 0.014).toFixed(3);
    setCursorCoords(`${lat}°N, ${lon}°E`);

    if (isDrawingBox && roiBox) {
      const x = nx * canvas.width;
      const y = ny * canvas.height;
      setRoiBox((prev) => (prev ? { ...prev, x2: x, y2: y } : null));
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'box') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    setIsDrawingBox(true);
    setRoiBox({ x1: x, y1: y, x2: x, y2: y });
  };

  const handleMouseUp = () => {
    if (isDrawingBox) setIsDrawingBox(false);
  };

  const handleModeSwitch = (mode: CenterViewportMode) => {
    if (onChangeViewMode) {
      onChangeViewMode(mode);
    } else if (mode === 'sonar') {
      onBackToSonar();
    } else if (mode === '3d' && onView3D) {
      onView3D();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#040914] border-r border-[#142238] relative overflow-hidden font-sans select-none">
      {/* ── TOP VIEWPORT HEADER BAR (MISSION MAP | SONAR VIEW | SPLIT VIEW | 3D TERRAIN) ── */}
      <div className="h-9 px-2.5 bg-[#080E1A] border-b border-[#142238] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'map', label: 'MISSION MAP' },
              { id: 'sonar', label: 'SONAR VIEW' },
              { id: 'split', label: 'SPLIT VIEW' },
              { id: '3d', label: '3D TERRAIN' },
            ] as { id: CenterViewportMode; label: string }[]
          ).map((tab) => {
            const isActive = activeViewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleModeSwitch(tab.id)}
                className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F59E0B] text-[#050810] font-black shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                    : 'bg-[#0D1726] text-[#94A3B8] border border-[#1B2D48] hover:text-white hover:border-[#334155]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-[#CBD5E1] tracking-tight">
            {cursorCoords}
          </span>
          <button
            onClick={() => setShowLayerPopover((v) => !v)}
            title="Toggle Map Layers"
            className={`p-1.5 rounded border cursor-pointer transition-colors ${
              showLayerPopover
                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                : 'bg-[#0D1726] border-[#1E3250] text-[#CBD5E1] hover:text-white hover:border-[#38BDF8]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN MAP CANVAS AREA ── */}
      <div className="flex-1 relative overflow-hidden bg-[#030812]">
        <canvas
          ref={canvasRef}
          width={860}
          height={560}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className={`w-full h-full object-cover block ${
            activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
          }`}
        />

        {/* ── LEFT FLOATING VERTICAL GIS TOOLBAR (7 TOOLS) ── */}
        <div className="absolute top-3 left-2.5 flex flex-col bg-[#08101E]/90 backdrop-blur-md border border-[#1B2E4B] rounded-lg p-1 gap-1 shadow-xl z-10">
          {[
            { id: 'select', icon: MousePointer, title: 'Select / Inspect Target' },
            { id: 'center', icon: Crosshair, title: 'Center on Hero Target SX-107' },
            { id: 'box', icon: Square, title: 'Draw ROI Bounding Box' },
            { id: 'ruler', icon: Ruler, title: 'Distance Measurement Ruler' },
            { id: 'pin', icon: MapPin, title: 'Drop Survey Waypoint Pin' },
          ].map((tool) => {
            const Icon = tool.icon;
            const isAct = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.id === 'center') {
                    onSelectTarget('SX-T07');
                    setActiveTool('select');
                  } else {
                    setActiveTool(tool.id as any);
                  }
                }}
                title={tool.title}
                className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-all ${
                  isAct
                    ? 'bg-[#132847] text-[#38BDF8] border border-[#38BDF8]/60 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0F1D33]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}

          {/* Polygon Hazard Zone Toggle */}
          <button
            onClick={() => toggleLayer('pipelineHazard')}
            title="Toggle Pipeline Hazard Zone"
            className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-all ${
              layers.pipelineHazard
                ? 'text-[#F87171] bg-[#3B1219]/60 border border-[#EF4444]/40'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#0F1D33]'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
          </button>

          {/* Trash / Clear Annotations */}
          <button
            onClick={() => {
              setMeasurePts([]);
              setCustomPins([]);
              setRoiBox(null);
              setActiveTool('select');
            }}
            title="Clear Map Annotations"
            className="w-7 h-7 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#0F1D33] cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── FLOATING MAP LAYERS DRAWER (Opens when clicking top-right Layers button) ── */}
        {showLayerPopover && (
          <div className="absolute top-2.5 right-2.5 w-56 bg-[#070E1B]/95 backdrop-blur-md border border-[#1E3250] rounded-lg shadow-2xl p-2.5 z-30 font-mono text-[10px]">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#16263D]">
              <span className="font-bold text-[#E2E8F0] uppercase tracking-wider">MAP LAYERS</span>
              <button
                onClick={() => setLayers(DEFAULT_MAP_LAYERS)}
                className="text-[8.5px] text-[#94A3B8] hover:text-white flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded border border-[#1E3250]"
              >
                <RotateCcw className="w-2.5 h-2.5" /> RESET
              </button>
            </div>
            <div className="space-y-1.5">
              {(
                [
                  { key: 'sonarDetections', label: 'Sonar Detections', color: '#F59E0B' },
                  { key: 'verifiedTargets', label: 'Verified Targets', color: '#10B981' },
                  { key: 'auvTrack', label: 'AUV Track', color: '#22D3EE' },
                  { key: 'pingPositions', label: 'Ping Positions', color: '#38BDF8' },
                  { key: 'surveyCoverage', label: 'Survey Coverage', color: '#0284C7' },
                  { key: 'bathymetryContours', label: 'Bathymetry Contours', color: '#64748B' },
                  { key: 'pipelineHazard', label: 'Restricted / Hazard Zones', color: '#EF4444' },
                ] as { key: keyof MapLayersConfig; label: string; color: string }[]
              ).map((item) => (
                <label
                  key={item.key}
                  onClick={() => toggleLayer(item.key)}
                  className="flex items-center justify-between py-0.5 cursor-pointer hover:text-white text-[#CBD5E1]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`w-6 h-3.5 rounded-full relative transition-colors ${
                      layers[item.key] ? 'bg-[#0284C7]' : 'bg-[#1E293B]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${
                        layers[item.key] ? 'left-3' : 'left-0.5'
                      }`}
                    />
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── BOTTOM-LEFT MAP SCALE BAR (0  100  200     500 m) ── */}
        <div className="absolute bottom-3 left-3 bg-[#060D1A]/85 backdrop-blur-sm border border-[#1B2E4B] rounded px-3 py-1.5 pointer-events-none z-10">
          <div className="flex items-center justify-between text-[9.5px] font-mono text-[#CBD5E1] mb-1 w-44">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span className="ml-6">500 m</span>
          </div>
          <div className="w-44 h-1.5 border-b border-l border-r border-[#94A3B8] relative flex items-end">
            <div className="w-1/5 h-1 border-r border-[#94A3B8]" />
            <div className="w-1/5 h-1 border-r border-[#94A3B8]" />
          </div>
        </div>
      </div>
    </div>
  );
};
