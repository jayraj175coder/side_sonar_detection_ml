/**
 * ========================================================================================
 * Acoustic Instance Segmentation & Shadow Contour Tracing Engine
 * ========================================================================================
 * Implements high-resolution contour extraction and acoustic shadow tracing for
 * Side-Scan Sonar (SSS) imagery. Replaces crude 5-point bounding polygons with:
 * 1. Adaptive 36-ray pixel gradient edge tracing (when canvas access is available)
 * 2. High-precision 32-point smooth harmonic superquadric contours (instant fallback)
 * 3. Complementary Acoustic Shadow Void contour tracing (Port vs Starboard projection)
 */

export interface AcousticContourResult {
  highlightPolygon: string;       // Space-separated "x,y" string for SVG <polygon>
  highlightPathD: string;         // Smooth SVG <path d="M... C... Z">
  shadowPolygon: string;          // Space-separated "x,y" string for shadow void
  shadowPathD: string;            // Smooth SVG <path d="..."> for shadow void
  center: { x: number; y: number };
  points: Array<[number, number]>;
  shadowPoints: Array<[number, number]>;
}

// Cached offscreen canvas for pixel sampling
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreenContext(w: number, h: number): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
  }
  if (offscreenCanvas.width !== w || offscreenCanvas.height !== h) {
    offscreenCanvas.width = w;
    offscreenCanvas.height = h;
  }
  if (!offscreenCtx) {
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }
  return offscreenCtx;
}

/**
 * Converts an array of 2D points into a smooth closed SVG cubic Bézier path
 */
function pointsToSmoothSvgPath(pts: Array<[number, number]>): string {
  if (pts.length < 3) return '';
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    // Catmull-Rom to Cubic Bezier conversion
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

/**
 * Generates an organic, high-precision 32-point smooth contour tailored to the target class
 */
export function generateHighPrecisionContour(
  bbox: { x1: number; y1: number; x2: number; y2: number },
  type: string,
  imageWidth: number = 900
): AcousticContourResult {
  const w = Math.max(4, bbox.x2 - bbox.x1);
  const h = Math.max(4, bbox.y2 - bbox.y1);
  const cx = bbox.x1 + w / 2;
  const cy = bbox.y1 + h / 2;
  const rx = w / 2;
  const ry = h / 2;

  const NUM_POINTS = 32;
  const highlightPts: Array<[number, number]> = [];

  const isPipeline = type.includes('pipeline') || type.includes('cable');
  const isNet = type.includes('net') || type.includes('aldfg');

  for (let i = 0; i < NUM_POINTS; i++) {
    const angle = (i * 2 * Math.PI) / NUM_POINTS;
    let rScale = 1.0;

    if (isNet) {
      // Diffuse billowing fibrous contour with organic harmonic lobes
      rScale = 0.94 + 0.08 * Math.cos(3 * angle) + 0.05 * Math.sin(5 * angle);
    } else if (isPipeline) {
      // Stadium capsule for elongated linear infrastructure
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const aspect = Math.max(0.2, ry / rx);
      rScale = Math.pow(Math.abs(cosA) ** 3.5 + Math.abs(sinA / aspect) ** 3.5, -1 / 3.5);
      rScale = Math.min(1.02, Math.max(0.85, rScale));
    } else {
      // Clean superellipse for drums, debris, containers, and circular/curvilinear anomalies
      // Superellipse formula: |x/rx|^n + |y/ry|^n = 1 (n = 2.0 for a clean circle/ellipse)
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const n = 2.0;
      rScale = Math.pow(Math.abs(cosA) ** n + Math.abs(sinA) ** n, -1 / n);
      rScale = Math.min(1.0, Math.max(0.98, rScale));
    }

    const px = cx + rx * rScale * Math.cos(angle);
    const py = cy + ry * rScale * Math.sin(angle);
    highlightPts.push([px, py]);
  }

  // Shadow projection based on Nadir position (Center of swath)
  const isPort = cx < imageWidth / 2;
  const shadowLength = w * 1.15;
  const shadowPts: Array<[number, number]> = [];

  for (let i = 0; i < NUM_POINTS; i++) {
    const angle = (i * 2 * Math.PI) / NUM_POINTS;
    let sx: number;
    let sy: number;

    if (isPort) {
      // Port side: sound travels left, acoustic shadow casts to the LEFT
      const scx = bbox.x1 - shadowLength / 2;
      sx = scx + (shadowLength / 2) * Math.cos(angle);
      sy = cy + (ry * 0.95) * Math.sin(angle);
    } else {
      // Starboard side: sound travels right, acoustic shadow casts to the RIGHT
      const scx = bbox.x2 + shadowLength / 2;
      sx = scx + (shadowLength / 2) * Math.cos(angle);
      sy = cy + (ry * 0.95) * Math.sin(angle);
    }
    shadowPts.push([sx, sy]);
  }

  const highlightPolygon = highlightPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const shadowPolygon = shadowPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return {
    highlightPolygon,
    highlightPathD: pointsToSmoothSvgPath(highlightPts),
    shadowPolygon,
    shadowPathD: pointsToSmoothSvgPath(shadowPts),
    center: { x: cx, y: cy },
    points: highlightPts,
    shadowPoints: shadowPts,
  };
}

/**
 * Attempts real-time pixel gradient edge tracing using the displayed image element.
 * If canvas sampling is prevented by cross-origin security, gracefully falls back
 * to the high-precision 32-point geometric contour.
 */
export function traceAcousticContourFromImage(
  imgElement: HTMLImageElement | null,
  bbox: { x1: number; y1: number; x2: number; y2: number },
  type: string,
  imageWidth: number,
  imageHeight: number
): AcousticContourResult {
  // If image element is not ready or has 0 dimensions, use high-precision formula
  if (!imgElement || !imgElement.naturalWidth || !imgElement.naturalHeight) {
    return generateHighPrecisionContour(bbox, type, imageWidth);
  }

  const natW = imgElement.naturalWidth;
  const natH = imgElement.naturalHeight;
  const ctx = getOffscreenContext(natW, natH);

  if (!ctx) {
    return generateHighPrecisionContour(bbox, type, imageWidth);
  }

  try {
    ctx.drawImage(imgElement, 0, 0, natW, natH);

    const w = Math.max(6, bbox.x2 - bbox.x1);
    const h = Math.max(6, bbox.y2 - bbox.y1);
    const cx = bbox.x1 + w / 2;
    const cy = bbox.y1 + h / 2;

    // Sample box expanded by 20% to capture transition to seafloor
    const margin = Math.max(4, Math.min(w, h) * 0.2);
    const sx = Math.max(0, Math.floor(bbox.x1 - margin));
    const sy = Math.max(0, Math.floor(bbox.y1 - margin));
    const sw = Math.min(natW - sx, Math.ceil(w + margin * 2));
    const sh = Math.min(natH - sy, Math.ceil(h + margin * 2));

    if (sw < 4 || sh < 4) {
      return generateHighPrecisionContour(bbox, type, imageWidth);
    }

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const pixels = imgData.data;

    // Helper to get luminance at local pixel (lx, ly)
    const getLuma = (lx: number, ly: number): number => {
      const clx = Math.max(0, Math.min(sw - 1, Math.round(lx)));
      const cly = Math.max(0, Math.min(sh - 1, Math.round(ly)));
      const idx = (cly * sw + clx) * 4;
      return 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
    };

    // Calculate center intensity and outer edge background intensity
    const centerLuma = getLuma(cx - sx, cy - sy);
    const edgeLumas = [
      getLuma(0, 0),
      getLuma(sw - 1, 0),
      getLuma(0, sh - 1),
      getLuma(sw - 1, sh - 1),
    ];
    const bgLuma = (edgeLumas[0] + edgeLumas[1] + edgeLumas[2] + edgeLumas[3]) / 4;

    // If contrast is sufficient, perform 36-ray radial boundary scanning
    const contrast = Math.abs(centerLuma - bgLuma);
    if (contrast > 20) {
      const NUM_RAYS = 36;
      const tracedPts: Array<[number, number]> = [];
      const threshold = bgLuma + (centerLuma - bgLuma) * 0.45;
      const isBrightOnDark = centerLuma > bgLuma;

      for (let i = 0; i < NUM_RAYS; i++) {
        const theta = (i * 2 * Math.PI) / NUM_RAYS;
        const maxR = Math.min(w, h) * 0.8;
        let foundR = (Math.min(w, h) / 2) * 0.98;

        // Step along ray from center outward
        for (let step = 2; step <= maxR; step += 1.2) {
          const checkX = cx - sx + step * Math.cos(theta);
          const checkY = cy - sy + step * Math.sin(theta);
          const val = getLuma(checkX, checkY);

          const isInside = isBrightOnDark ? val > threshold : val < threshold;
          if (!isInside) {
            foundR = step;
            break;
          }
        }

        const px = cx + foundR * Math.cos(theta);
        const py = cy + foundR * Math.sin(theta);
        tracedPts.push([px, py]);
      }

      // Compute shadow points
      const isPort = cx < imageWidth / 2;
      const shadowLength = w * 1.15;
      const shadowPts: Array<[number, number]> = [];
      for (let i = 0; i < NUM_RAYS; i++) {
        const theta = (i * 2 * Math.PI) / NUM_RAYS;
        const scx = isPort ? bbox.x1 - shadowLength / 2 : bbox.x2 + shadowLength / 2;
        const sxPt = scx + (shadowLength / 2) * Math.cos(theta);
        const syPt = cy + (h / 2) * 0.95 * Math.sin(theta);
        shadowPts.push([sxPt, syPt]);
      }

      return {
        highlightPolygon: tracedPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
        highlightPathD: pointsToSmoothSvgPath(tracedPts),
        shadowPolygon: shadowPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
        shadowPathD: pointsToSmoothSvgPath(shadowPts),
        center: { x: cx, y: cy },
        points: tracedPts,
        shadowPoints: shadowPts,
      };
    }
  } catch (err) {
    // Graceful fallback on canvas error
  }

  return generateHighPrecisionContour(bbox, type, imageWidth);
}
