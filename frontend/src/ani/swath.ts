// Procedural side-scan sonar swath. One seeded generator feeds every scene, so boxes,
// shadows, crops, the filter numbers and the geotags all come from the same object list.
import { HERO, ALT_M, GROUND_M, EXPECTED_SHADOW_M, type ClassKey } from './story';

export const SW = 1024; // across-track px (port | nadir | starboard)
export const SH = 3072; // along-track rows (pings)
export const CENTER = 512;
export const NADIR = 32; // half-width of the water-column strip
export const PX_PER_M = 8;
export const WIN = 1100; // rows visible in the standard view (canvas aspect 1024:1100)
export const FILTER_OFF = 1650; // view offset for the "filter window" (hero + look-alikes)

export type Kind = 'net' | 'debris' | 'pipe' | 'anomaly' | 'rock' | 'ripple';
export interface Cand {
  id: number;
  kind: Kind;
  real: boolean;
  cls: ClassKey; // true class for real targets, the model's (wrong) guess for clutter
  conf: number;
  x: number; y: number; w: number; h: number; // bbox, swath px
  side: -1 | 1;
  heightM: number;
  groundM: number;
  expectedShadowM: number;
  shadowM: number; // rendered ("measured") shadow length
  shadowRatio: number; // measured darkness of the expected-shadow region vs seabed
  lat: number; lon: number;
}
export interface Swath { raw: HTMLCanvasElement; clean: HTMLCanvasElement; cands: Cand[]; hero: Cand; rock: Cand; ripples: { x: number; y: number } }

// ── deterministic noise ──────────────────────────────────────────────
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x: number, y: number) =>
  vnoise(x, y) * 0.5 + vnoise(x * 2.03 + 17, y * 2.03 + 5) * 0.3 + vnoise(x * 4.1 + 3, y * 4.1 + 11) * 0.2;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ── geotagging: survey line heading 315°, solved so SX-T07 lands on the repo's coordinates ──
const HEADING = (315 * Math.PI) / 180;
const M_PER_DEG = 111320;
function offsetsM(x: number, y: number) {
  // newest ping on top (waterfall convention): row index grows toward older pings
  const along = -y / PX_PER_M, across = (x - CENTER) / PX_PER_M; // +across = starboard
  const n = along * Math.cos(HEADING) + across * Math.cos(HEADING + Math.PI / 2);
  const e = along * Math.sin(HEADING) + across * Math.sin(HEADING + Math.PI / 2);
  return { n, e };
}
const HERO_XY = { x: CENTER - GROUND_M * PX_PER_M, y: 2130 };
const heroOff = offsetsM(HERO_XY.x, HERO_XY.y);
const ORIGIN_LAT = HERO.lat - heroOff.n / M_PER_DEG;
const ORIGIN_LON = HERO.lon - heroOff.e / (M_PER_DEG * Math.cos((HERO.lat * Math.PI) / 180));
export function pixelToLatLon(x: number, y: number) {
  const { n, e } = offsetsM(x, y);
  return {
    lat: ORIGIN_LAT + n / M_PER_DEG,
    lon: ORIGIN_LON + e / (M_PER_DEG * Math.cos((ORIGIN_LAT * Math.PI) / 180)),
  };
}

// ── palette: black → copper → amber → white (the app's sonar look) ──
const LUT = (() => {
  const stops: [number, number, number, number][] = [
    [0, 0, 0, 0], [0.22, 34, 15, 4], [0.45, 110, 55, 12], [0.68, 214, 128, 26], [0.86, 255, 196, 84], [1, 255, 246, 220],
  ];
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [t0, r0, g0, b0] = stops[k], [t1, r1, g1, b1] = stops[k + 1];
    const f = (t - t0) / (t1 - t0);
    lut[i * 3] = r0 + (r1 - r0) * f; lut[i * 3 + 1] = g0 + (g1 - g0) * f; lut[i * 3 + 2] = b0 + (b1 - b0) * f;
  }
  return lut;
})();

// ── candidate layout: 17 real + 20 clutter = 37 ──
interface Spec { id: number; kind: Kind; x: number; y: number; rot: number; size: number; conf: number; cls: ClassKey; heightM: number }
const REAL_CLASS: Record<Kind, ClassKey> = {
  net: 'ghost_net_aldfg', debris: 'anthropogenic_debris', pipe: 'pipeline_hazard', anomaly: 'seafloor_anomaly',
  rock: 'anthropogenic_debris', ripple: 'pipeline_hazard',
};
const HEIGHT_M: Record<Kind, number> = { net: 0.82, debris: 1.1, pipe: 0.7, anomaly: 2.4, rock: 0, ripple: 0 };

function layout(rnd: () => number): Spec[] {
  const specs: Spec[] = [
    { id: 7, kind: 'net', x: HERO_XY.x, y: HERO_XY.y, rot: (HERO.orientation * Math.PI) / 180, size: 1, conf: HERO.confidence, cls: 'ghost_net_aldfg', heightM: HERO.estimatedHeight },
    { id: 12, kind: 'rock', x: 706, y: 2075, rot: 0.4, size: 1.15, conf: 0.58, cls: 'anthropogenic_debris', heightM: 0 },
    { id: 21, kind: 'ripple', x: 800, y: 2470, rot: 0.35, size: 1, conf: 0.44, cls: 'pipeline_hazard', heightM: 0 },
    { id: 29, kind: 'debris', x: 170, y: 2560, rot: 1.1, size: 1, conf: 0.81, cls: 'anthropogenic_debris', heightM: 1.1 },
    { id: 3, kind: 'rock', x: 380, y: 1830, rot: 2.2, size: 0.9, conf: 0.47, cls: 'seafloor_anomaly', heightM: 0 },
  ];
  // one pipeline crossing the starboard swath, detected as three tiles
  const pipeY = [520, 820, 1120];
  pipeY.forEach((y, i) => specs.push({ id: 0, kind: 'pipe', x: pipeX(y), y, rot: 0, size: 1, conf: [0.91, 0.88, 0.93][i], cls: 'pipeline_hazard', heightM: 0.7 }));
  const want: [Kind, number][] = [['net', 4], ['debris', 5], ['anomaly', 3], ['rock', 10], ['ripple', 7]];
  for (const [kind, n] of want) {
    for (let i = 0; i < n; i++) {
      let x = 0, y = 0, ok = false;
      for (let tries = 0; tries < 400 && !ok; tries++) {
        const side = rnd() < 0.5 ? -1 : 1;
        x = CENTER + side * (NADIR + 70 + rnd() * 330);
        y = 90 + rnd() * (SH - 180);
        ok = specs.every((s) => Math.hypot(s.x - x, s.y - y) > 150) && Math.abs(x - pipeX(y)) > 110;
      }
      const real = kind !== 'rock' && kind !== 'ripple';
      const conf = real
        ? kind === 'debris' ? 0.48 + rnd() * 0.3 : 0.62 + rnd() * 0.3
        : 0.31 + rnd() * 0.3;
      const cls: ClassKey = real ? REAL_CLASS[kind] : rnd() < 0.5 ? 'anthropogenic_debris' : kind === 'rock' ? 'seafloor_anomaly' : 'pipeline_hazard';
      specs.push({ id: 0, kind, x, y, rot: rnd() * Math.PI, size: 0.85 + rnd() * 0.35, conf, cls, heightM: HEIGHT_M[kind] });
    }
  }
  // number the rest 1..37 around the fixed ids, in along-track order
  const used = new Set(specs.map((s) => s.id).filter(Boolean));
  let next = 1;
  [...specs].sort((a, b) => a.y - b.y).forEach((s) => {
    if (s.id) return;
    while (used.has(next)) next++;
    s.id = next++;
  });
  return specs;
}
function pipeX(y: number) { return 640 + (y - 300) * 0.22; }

// ── stamping objects into the reflectivity field ──
type Stamped = Omit<Cand, 'shadowRatio' | 'lat' | 'lon'> & { far: Int32Array; fy0: number };
function stamp(R: Float32Array, s: Spec, rnd: () => number): Stamped {
  const side: -1 | 1 = s.x < CENTER ? -1 : 1;
  const real = s.kind !== 'rock' && s.kind !== 'ripple';
  const groundM = Math.abs(s.x - CENTER) / PX_PER_M;
  const expectedShadowM = real ? (s.heightM * groundM) / (ALT_M - s.heightM) : 0;
  const shadowM = s.id === 7 ? HERO.shadowLength : expectedShadowM * (0.94 + rnd() * 0.14);
  const shadowPx = Math.round(shadowM * PX_PER_M);
  const shadowK = s.kind === 'net' ? 0.3 : 0.06; // nets are porous
  const cos = Math.cos(s.rot), sin = Math.sin(s.rot);

  // local-space mask + brightness for each kind
  let halfL = 20, halfW = 12;
  let body: (u: number, v: number, gx: number, gy: number) => number; // returns brightness, 0 = outside
  if (s.kind === 'net') {
    halfL = (HERO.length * PX_PER_M) / 2 * s.size; halfW = (HERO.width * PX_PER_M) / 2 * s.size;
    body = (u, v, gx, gy) => {
      const e = (u / halfL) ** 2 + (v / halfW) ** 2;
      if (e > 1 + 0.45 * (fbm(gx / 9, gy / 9) - 0.5)) return 0;
      const strand = Math.max(Math.abs(Math.cos(u * 0.95 + v * 0.3)), Math.abs(Math.cos(v * 0.95 - u * 0.25)));
      const lump = fbm(gx / 5 + 9, gy / 5);
      return 0.9 + (strand > 0.86 ? 1.1 : 0) + (lump > 0.68 ? 0.9 : 0);
    };
  } else if (s.kind === 'debris') {
    halfL = 11 * s.size; halfW = 7 * s.size;
    body = (u, v) => {
      const e = (u / halfL) ** 2 + (v / halfW) ** 2;
      return e > 1 ? 0 : 1.6 + 0.9 * (1 - e) + (u > 2 && u < 6 ? 0.6 : 0);
    };
  } else if (s.kind === 'pipe') {
    halfL = 150; halfW = 4;
    body = (u, v, gx) => {
      const d = Math.abs(gx - pipeX(u + s.y));
      return d > halfW ? 0 : 1.5 + 0.7 * (1 - d / halfW);
    };
  } else if (s.kind === 'anomaly') {
    halfL = 46 * s.size; halfW = 17 * s.size;
    body = (u, v) => {
      if (Math.abs(u) > halfL || Math.abs(v) > halfW * (1 - 0.35 * (u / halfL) ** 4)) return 0;
      const rib = Math.abs(Math.sin(u * 0.33)) > 0.93 || Math.abs(v) > halfW * 0.78 ? 0.8 : 0;
      return 1.25 + rib;
    };
  } else if (s.kind === 'rock') {
    halfL = 22 * s.size; halfW = 18 * s.size;
    body = (u, v, gx, gy) => {
      const r = Math.hypot(u / halfL, v / halfW);
      return r > 0.72 + 0.55 * fbm(gx / 7, gy / 7) ? 0 : 1.35 + 0.8 * fbm(gx / 3 + 4, gy / 3);
    };
  } else {
    halfL = 26 * s.size; halfW = 3.5;
    body = (u, v) => (Math.abs(u) > halfL || Math.abs(v) > halfW * (1 - (u / halfL) ** 2) ? 0 : 1.55);
  }

  // bbox in swath space (pipes are special: axis-aligned along-track)
  const ext = Math.ceil(Math.max(halfL, halfW)) + 2;
  const x0 = Math.max(0, Math.floor(s.x - ext - 20)), x1 = Math.min(SW - 1, Math.ceil(s.x + ext + 20));
  const y0 = Math.max(0, Math.floor(s.y - ext)), y1 = Math.min(SH - 1, Math.ceil(s.y + ext));
  let bx0 = SW, bx1 = 0, by0 = SH, by1 = 0;
  const farRow = new Int32Array(y1 - y0 + 1).fill(-1);
  for (let gy = y0; gy <= y1; gy++) {
    let far = -1; // outermost body pixel on this row (away from nadir)
    for (let gx = x0; gx <= x1; gx++) {
      const dx = gx - s.x, dy = gy - s.y;
      const u = s.kind === 'pipe' ? dy : dx * cos + dy * sin;
      const v = s.kind === 'pipe' ? dx : -dx * sin + dy * cos;
      const b = body(u, v, gx, gy);
      if (b <= 0) continue;
      const i = gy * SW + gx;
      R[i] = Math.max(R[i] * 0.4, b);
      if (gx < bx0) bx0 = gx; if (gx > bx1) bx1 = gx; if (gy < by0) by0 = gy; if (gy > by1) by1 = gy;
      if (far < 0 || (side > 0 ? gx > far : gx < far)) far = gx;
    }
    farRow[gy - y0] = far;
    if (real && far >= 0) for (let k = 1; k <= shadowPx; k++) {
      const gx = far + side * k;
      if (gx < 0 || gx >= SW) break;
      R[gy * SW + gx] *= shadowK;
    }
  }
  const pad = 5;
  return {
    id: s.id, kind: s.kind, real, cls: s.cls, conf: s.conf, side, heightM: s.heightM, groundM, expectedShadowM, shadowM,
    x: bx0 - pad, y: by0 - pad, w: bx1 - bx0 + pad * 2, h: by1 - by0 + pad * 2,
    far: farRow, fy0: y0,
  };
}

// darkness of the expected-shadow region (just beyond each row's far edge) relative to the seabed further out
function shadowRatio(R: Float32Array, c: Stamped) {
  const len = Math.max(12, Math.round(c.expectedShadowM * PX_PER_M));
  const ya = Math.round(c.y + c.h * 0.3), yb = Math.round(c.y + c.h * 0.7);
  const mean = (from: number, n: number) => {
    let sum = 0, cnt = 0;
    for (let y = ya; y <= yb; y++) for (let k = 0; k < n; k++) {
      const far = c.far[y - c.fy0];
      if (far === undefined || far < 0) break;
      const x = far + c.side * (from + k);
      if (x < 0 || x >= SW) continue;
      sum += R[y * SW + x]; cnt++;
    }
    return cnt ? sum / cnt : 1;
  };
  return mean(3, Math.max(4, Math.round(len * 0.6))) / mean(len + 14, 18);
}

// setTimeout, not rAF: rAF pauses in background tabs and would stall the preloader
const frame = () => new Promise<void>((r) => setTimeout(r, 0));

let cached: Promise<Swath> | null = null;
const listeners = new Set<(p: number) => void>();
// Generated once per page load (StrictMode and re-mounts share it).
export function getSwath(onProgress: (p: number) => void = () => {}): Promise<Swath> {
  listeners.add(onProgress);
  cached ??= generateSwath((p) => listeners.forEach((l) => l(p)));
  return cached;
}

async function generateSwath(onProgress: (p: number) => void, seed = 26057): Promise<Swath> {
  const rnd = mulberry32(seed);
  const R = new Float32Array(SW * SH);
  const CHUNK = 256;

  // 1 · seabed reflectivity (range-independent). Low-frequency fields on an 8-px grid, bilinear per pixel.
  const G = 8, GW = SW / G + 2, GH = SH / G + 2;
  const sedG = new Float32Array(GW * GH), maskG = new Float32Array(GW * GH), phaseG = new Float32Array(GW * GH);
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    const x = gx * G, y = gy * G, i = gy * GW + gx;
    sedG[i] = 0.72 + 0.56 * fbm(x / 170, y / 170);
    maskG[i] = smooth(0.5, 0.62, fbm(x / 320 + 7, y / 320 + 3));
    phaseG[i] = 5 * fbm(x / 90, y / 90);
  }
  const bil = (A: Float32Array, i: number, fx: number, fy: number) =>
    (A[i] * (1 - fx) + A[i + 1] * fx) * (1 - fy) + (A[i + GW] * (1 - fx) + A[i + GW + 1] * fx) * fy;
  for (let y0 = 0; y0 < SH; y0 += CHUNK) {
    for (let y = y0; y < Math.min(SH, y0 + CHUNK); y++) {
      const gy = y >> 3, fy = (y & 7) / G;
      for (let x = 0; x < SW; x++) {
        const gi = gy * GW + (x >> 3), fx = (x & 7) / G;
        const rip = bil(maskG, gi, fx, fy) * 0.38 * Math.sin((x * 0.94 + y * 0.34) / 2.2 + bil(phaseG, gi, fx, fy));
        const fine = 0.22 * (vnoise(x / 20, y / 20) * 0.7 + vnoise(x / 7 + 3, y / 7) * 0.3 - 0.5);
        R[y * SW + x] = Math.max(0.05, bil(sedG, gi, fx, fy) + rip + fine);
      }
    }
    onProgress(0.35 * Math.min(1, (y0 + CHUNK) / SH));
    await frame();
  }

  // 2 · objects + shadows, then measure
  const specs = layout(rnd);
  const stamped = specs.map((s) => stamp(R, s, rnd));
  const cands: Cand[] = stamped
    .map(({ far, fy0, ...c }) => ({ ...c, shadowRatio: shadowRatio(R, { ...c, far, fy0 }), ...pixelToLatLon(c.x + c.w / 2, c.y + c.h / 2) }))
    .sort((a, b) => a.id - b.id);

  // 3 · render raw (uncorrected gain, strong speckle, motion artefacts) and clean (TVG + despeckle)
  const dropouts = new Set<number>([2298, 2299, 2300, 2301]); // one guaranteed heave dropout in the filter window
  for (let i = 0; i < 7; i++) { const y = Math.floor(rnd() * SH), n = 2 + Math.floor(rnd() * 4); for (let k = 0; k < n; k++) dropouts.add(y + k); }
  const rolls: [number, number, number][] = Array.from({ length: 6 }, () => [Math.floor(rnd() * SH), 18 + Math.floor(rnd() * 30), Math.round((rnd() - 0.5) * 14)]);
  const rollAt = (y: number) => { for (const [a, n, s] of rolls) if (y >= a && y < a + n) return s; return 0; };

  const rawImg = new ImageData(SW, SH), cleanImg = new ImageData(SW, SH);
  const C = new Float32Array(SW * SH); // clean, pre-blur
  const put = (img: ImageData, i: number, v: number) => {
    const li = Math.min(255, Math.max(0, Math.round((v / 1.9) * 255))) * 3, o = i * 4;
    img.data[o] = LUT[li]; img.data[o + 1] = LUT[li + 1]; img.data[o + 2] = LUT[li + 2]; img.data[o + 3] = 255;
  };
  const rayleigh = () => Math.sqrt(-2 * Math.log(1 - rnd() * 0.999999)) / 1.2533;
  for (let y0 = 0; y0 < SH; y0 += CHUNK) {
    for (let y = y0; y < Math.min(SH, y0 + CHUNK); y++) {
      const band = 1 + 0.17 * Math.sin(y / 19) + 0.09 * Math.sin(y / 57 + 1);
      const drop = dropouts.has(y), roll = rollAt(y);
      for (let x = 0; x < SW; x++) {
        const i = y * SW + x;
        const dn = Math.abs(x - CENTER);
        if (dn < NADIR) { // water column: dark, first bottom return at its edges
          const edge = dn > NADIR - 4 ? 0.9 : 0.05 + 0.05 * hash(x, y);
          put(rawImg, i, drop ? 0.02 : edge * rayleigh());
          C[i] = edge;
          continue;
        }
        const r = dn - NADIR; // px from nadir edge
        const xs = Math.min(SW - 1, Math.max(0, x + roll));
        const refl = R[y * SW + xs];
        const rawGain = 0.3 + 1.25 * Math.exp(-r / 230);
        const raw = refl * rawGain * band * rayleigh() * (drop ? 0.12 : 1);
        put(rawImg, i, raw);
        C[i] = R[i] * (0.64 + 0.14 * Math.exp(-r / 200)) * (1 + (rayleigh() - 1) * 0.28);
      }
    }
    onProgress(0.35 + 0.4 * Math.min(1, (y0 + CHUNK) / SH));
    await frame();
  }
  for (let y0 = 0; y0 < SH; y0 += CHUNK) { // 3×3 box blur stands in for the Lee filter
    for (let y = y0; y < Math.min(SH, y0 + CHUNK); y++) {
      const ya = Math.max(0, y - 1), yb = Math.min(SH - 1, y + 1);
      for (let x = 0; x < SW; x++) {
        const xa = Math.max(0, x - 1), xb = Math.min(SW - 1, x + 1);
        const v = (C[ya * SW + xa] + C[ya * SW + x] + C[ya * SW + xb] + C[y * SW + xa] + C[y * SW + x] + C[y * SW + xb] + C[yb * SW + xa] + C[yb * SW + x] + C[yb * SW + xb]) / 9;
        put(cleanImg, y * SW + x, v);
      }
    }
    onProgress(0.75 + 0.25 * Math.min(1, (y0 + CHUNK) / SH));
    await frame();
  }

  const toCanvas = (img: ImageData) => {
    const c = document.createElement('canvas');
    c.width = SW; c.height = SH;
    c.getContext('2d')!.putImageData(img, 0, 0);
    return c;
  };
  const hero = cands.find((c) => c.id === 7)!, rock = cands.find((c) => c.id === 12)!;

  if (import.meta.env.DEV) { // the one runnable check for this module
    const real = cands.filter((c) => c.real), clutter = cands.filter((c) => !c.real);
    console.assert(cands.length === 37 && real.length === 17 && clutter.length === 20, 'swath: expected 37 = 17 real + 20 clutter', cands.length, real.length);
    real.forEach((c) => console.assert(c.shadowRatio < 0.5, `swath: real #${c.id} ${c.kind} shadow ratio ${c.shadowRatio.toFixed(2)} should be < 0.5`));
    clutter.forEach((c) => console.assert(c.shadowRatio > 0.7, `swath: clutter #${c.id} ${c.kind} shadow ratio ${c.shadowRatio.toFixed(2)} should be > 0.7`));
    const p = pixelToLatLon(HERO_XY.x, HERO_XY.y);
    console.assert(Math.abs(p.lat - HERO.lat) < 1e-6 && Math.abs(p.lon - HERO.lon) < 1e-6, 'swath: hero geotag drifted');
    console.assert(Math.abs(EXPECTED_SHADOW_M - 2.14) < 0.02, 'swath: expected hero shadow ≈ 2.14 m', EXPECTED_SHADOW_M);
    console.info('[sonarx] swath ok', cands.map((c) => `#${c.id} ${c.kind} ${c.shadowRatio.toFixed(2)}`).join(' · '));
  }
  // strongest sand-ripple patch inside the filter window (for the Act I callout)
  let ripples = { x: 200, y: FILTER_OFF + 700 }, best = -1;
  for (let gy = (FILTER_OFF + 80) >> 3; gy < (FILTER_OFF + WIN - 80) >> 3; gy++) for (let gx = 12; gx < GW - 14; gx++) {
    const x = gx * G;
    if (x > CENTER - 140 || cands.some((c) => Math.hypot(c.x + c.w / 2 - x, c.y + c.h / 2 - gy * G) < 170) || Math.abs(gy * G - (FILTER_OFF + 150)) < 260) continue;
    if (maskG[gy * GW + gx] > best) { best = maskG[gy * GW + gx]; ripples = { x, y: gy * G }; }
  }
  return { raw: toCanvas(rawImg), clean: toCanvas(cleanImg), cands, hero, rock, ripples };
}

// Size a canvas's backing store to its CSS box (DPR capped at 2).
export function fitCanvas(c: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.max(1, Math.round(c.clientWidth * dpr));
  c.height = Math.max(1, Math.round(c.clientHeight * dpr));
}

// Draw rows [off, off+rows) of a swath canvas into ctx, filling its width. Rows past SH stay transparent.
export function drawRows(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, off: number, rows = WIN, maxRow = SH) {
  const { width: W, height: H } = ctx.canvas;
  ctx.clearRect(0, 0, W, H);
  const a = Math.max(0, off), b = Math.min(maxRow, off + rows);
  if (b <= a) return;
  const k = H / rows;
  ctx.drawImage(src, 0, a, SW, b - a, 0, (a - off) * k, W, (b - a) * k);
}
