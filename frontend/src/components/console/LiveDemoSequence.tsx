import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ChevronRight, SkipForward, X } from 'lucide-react';
import { CANDIDATE_ITEMS, SURVEY_SITES, CandidateItem } from '../../data/consoleData';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SCENES = 8;        // scenes 0–7
const AUTO_MS      = 3800;     // auto-advance delay per scene (ms)

const CLASS_COLORS: Record<string, string> = {
  'Ghost Net (ALDFG)':             '#00D4AA',
  'Lost Fishing Trawl Gear':       '#38BDF8',
  'Anthropogenic Debris Bundle':   '#F59E0B',
  'Subsea Pipeline Free-Span':     '#FB923C',
  'Industrial Metal Barrel Group': '#C084FC',
};
const REJECT_COLOR = '#EF4444';

const SCENE_CAPTIONS = [
  null, // scene 0 has its own layout
  '01 INGEST — Side-scan sonar towed along survey track. Both seafloor flanks imaged simultaneously.',
  'RAW ACQUISITION — Geotagged at capture, before any processing. Coordinates attached at the sensor, not bolted on later.',
  '02 DENOISE — Speckle noise and low-contrast seabed texture suppressed automatically before detection runs.',
  '03 DETECT — Model flags every candidate object, confident or not. Counter shows running total.',
  '04 FILTER — False positives rejected automatically by confidence score and acoustic shadow geometry — not by a human reviewing each box.',
  '05 CLASSIFY — Each confirmed object identified by debris type using trained MoES taxonomy.',
  '06 REPORT — Structured, geotagged anomaly report generated. Every confirmed target has WGS84 coordinates, class, and confidence score.',
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveDemoSequenceProps {
  onComplete: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const LiveDemoSequence: React.FC<LiveDemoSequenceProps> = ({ onComplete }) => {
  const [scene, setScene]           = useState(0);
  const [progress, setProgress]     = useState(0);      // 0–1, drives progress rail fill
  const [boxCount, setBoxCount]     = useState(0);      // scene 4: boxes appearing
  const [filterDone, setFilterDone] = useState(false);  // scene 5: filter fired
  const [classCount, setClassCount] = useState(0);      // scene 6: labels appearing
  const [wipe, setWipe]             = useState(0);      // scene 3: wipe 0→1
  const [coordStr, setCoordStr]     = useState('');     // scene 2: typewriter
  const [reportRows, setReportRows] = useState(0);      // scene 7: report building
  const [geotags, setGeotags]       = useState(0);      // scene 7: pins appearing

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const autoTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const innerTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef      = useRef<number>(0);
  const startRef    = useRef(Date.now());

  const site       = SURVEY_SITES[0];
  const confirmed  = CANDIDATE_ITEMS.filter((c: CandidateItem) => c.status === 'CONFIRMED');
  const all        = CANDIDATE_ITEMS;

  // ── Reset per-scene animation state ─────────────────────────────────────────
  const resetSceneState = () => {
    setBoxCount(0); setFilterDone(false); setClassCount(0);
    setWipe(0); setCoordStr(''); setReportRows(0); setGeotags(0);
    setProgress(0);
    startRef.current = Date.now();
    if (innerTimer.current)  clearInterval(innerTimer.current);
    cancelAnimationFrame(rafRef.current);
  };

  // ── Advance to next scene ────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setScene(prev => {
      if (prev >= TOTAL_SCENES - 1) { onComplete(); return prev; }
      return prev + 1;
    });
    resetSceneState();
  }, [onComplete]);

  // ── Auto-advance (disabled for last scene) ───────────────────────────────────
  useEffect(() => {
    if (scene >= TOTAL_SCENES - 1) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(advance, AUTO_MS);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [scene, advance]);

  // ── Progress bar fill ────────────────────────────────────────────────────────
  useEffect(() => {
    if (scene >= TOTAL_SCENES - 1) { setProgress(1); return; }
    startRef.current = Date.now();
    if (progTimer.current) clearInterval(progTimer.current);
    progTimer.current = setInterval(() => {
      const p = Math.min((Date.now() - startRef.current) / AUTO_MS, 1);
      setProgress(p);
      if (p >= 1) clearInterval(progTimer.current!);
    }, 40);
    return () => { if (progTimer.current) clearInterval(progTimer.current); };
  }, [scene]);

  // ── Keyboard: Space / → to skip ─────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['Space','ArrowRight','Enter'].includes(e.code)) {
        e.preventDefault();
        if (autoTimer.current) clearTimeout(autoTimer.current);
        advance();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [advance]);

  // ── Per-scene inner animations ───────────────────────────────────────────────
  useEffect(() => {
    if (innerTimer.current) clearInterval(innerTimer.current);

    if (scene === 2) {
      // Typewriter coordinates
      const full = `LAT ${site.latRange[0].toFixed(4)}°N  LON ${site.lonRange[0].toFixed(4)}°E  |  ${site.timestamp}  |  SRC: ${site.sourceFile}`;
      let i = 0;
      innerTimer.current = setInterval(() => {
        i++;
        setCoordStr(full.slice(0, i));
        if (i >= full.length) clearInterval(innerTimer.current!);
      }, 28);
    }

    if (scene === 3) {
      // Wipe animation
      let w = 0;
      innerTimer.current = setInterval(() => {
        w += 0.018;
        setWipe(Math.min(w, 1));
        if (w >= 1) clearInterval(innerTimer.current!);
      }, 40);
    }

    if (scene === 4) {
      // Boxes appear one by one
      let n = 0;
      innerTimer.current = setInterval(() => {
        n++;
        setBoxCount(Math.min(n, all.length));
        if (n >= all.length) clearInterval(innerTimer.current!);
      }, 160);
    }

    if (scene === 5) {
      // Show all boxes first, then trigger filter after 1.2s
      setBoxCount(all.length);
      const t = setTimeout(() => setFilterDone(true), 1200);
      return () => clearTimeout(t);
    }

    if (scene === 6) {
      // Class labels appear one at a time
      setBoxCount(all.length);
      setFilterDone(true);
      let n = 0;
      innerTimer.current = setInterval(() => {
        n++;
        setClassCount(Math.min(n, confirmed.length));
        if (n >= confirmed.length) clearInterval(innerTimer.current!);
      }, 300);
    }

    if (scene === 7) {
      // Geotag pins + report rows build in
      let g = 0, r = 0;
      innerTimer.current = setInterval(() => {
        if (g < confirmed.length) { g++; setGeotags(g); }
        if (r < confirmed.length) { r++; setReportRows(r); }
        if (g >= confirmed.length && r >= confirmed.length) clearInterval(innerTimer.current!);
      }, 320);
    }
  }, [scene]);

  // ── Canvas rendering (scenes 1–6) ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    // Shared: deterministic noise
    const dn = (x: number, y: number) =>
      Math.abs(Math.sin(x * 131.1 + y * 317.7) * 43758.5453) % 1;

    // Shared: sonar base texture
    const drawBase = (noisy: boolean, alpha = 1) => {
      ctx.save(); ctx.globalAlpha = alpha;
      for (let x = 0; x < W; x += 3) {
        for (let y = 0; y < H; y += 3) {
          const wave = Math.sin(x * 0.016) * 0.07 + Math.sin(y * 0.022) * 0.05 + 0.12;
          const n    = noisy ? dn(x, y) * 0.38 : 0;
          const v    = Math.floor((wave + n) * 44);
          ctx.fillStyle = `rgb(${Math.floor(v*0.18)},${Math.floor(v*0.55)},${v})`;
          ctx.fillRect(x, y, 3, 3);
        }
      }
      ctx.restore();
    };

    // Shared: nadir line
    const drawNadir = () => {
      ctx.fillStyle = '#010810';
      ctx.fillRect(W/2-16, 0, 32, H);
      ctx.strokeStyle = '#0D2E4A';
      ctx.setLineDash([4,4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
      ctx.setLineDash([]);
    };

    // Shared: draw a candidate box
    const drawBox = (cand: CandidateItem, style: 'raw'|'rejected'|'confirmed'|'classified', classIdx = 0) => {
      const cx = (cand.rawX/100)*W;
      const cy = (cand.rawY/100)*H;
      ctx.save();
      if (style === 'rejected') {
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = REJECT_COLOR;
        ctx.setLineDash([3,3]); ctx.lineWidth = 1;
        ctx.strokeRect(cx-20, cy-13, 40, 26);
        ctx.setLineDash([]);
        ctx.fillStyle = `${REJECT_COLOR}10`;
        ctx.fillRect(cx-20, cy-13, 40, 26);
        ctx.fillStyle = REJECT_COLOR;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center'; ctx.fillText('✕', cx, cy+4); ctx.textAlign='left';
      } else if (style === 'confirmed') {
        ctx.strokeStyle = '#00D4AA';
        ctx.shadowColor = '#00D4AA'; ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx-22, cy-14, 44, 28);
        ctx.fillStyle = 'rgba(0,212,170,0.10)';
        ctx.fillRect(cx-22, cy-14, 44, 28);
        ctx.fillStyle = '#00D4AA'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, 0.3, 0, Math.PI*2); ctx.fill();
        // acoustic shadow
        const sl = Math.max(12, cand.shadowLengthM * 8);
        ctx.shadowBlur = 0; ctx.fillStyle = '#010810';
        ctx.beginPath();
        ctx.moveTo(cx+8, cy-5); ctx.lineTo(cx+8+sl, cy-7);
        ctx.lineTo(cx+8+sl, cy+7); ctx.lineTo(cx+8, cy+5);
        ctx.closePath(); ctx.fill();
      } else if (style === 'classified') {
        const col = CLASS_COLORS[cand.class] || '#00D4AA';
        ctx.strokeStyle = col;
        ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx-22, cy-14, 44, 28);
        ctx.fillStyle = `${col}14`;
        ctx.fillRect(cx-22, cy-14, 44, 28);
        ctx.shadowBlur = 5; ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, 0.3, 0, Math.PI*2); ctx.fill();
        const sl = Math.max(12, cand.shadowLengthM * 8);
        ctx.shadowBlur = 0; ctx.fillStyle = '#010810';
        ctx.beginPath();
        ctx.moveTo(cx+8, cy-5); ctx.lineTo(cx+8+sl, cy-7);
        ctx.lineTo(cx+8+sl, cy+7); ctx.lineTo(cx+8, cy+5);
        ctx.closePath(); ctx.fill();
        // class label
        ctx.shadowBlur = 0; ctx.fillStyle = col;
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(cand.class.split(' ').slice(0,2).join(' '), cx-21, cy-17);
      } else {
        // raw
        let col = '#00D4AA';
        if (cand.confidence < 0.4) col = REJECT_COLOR;
        else if (cand.confidence < 0.7) col = '#F59E0B';
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.strokeRect(cx-22, cy-14, 44, 28);
        ctx.fillStyle = `${col}12`;
        ctx.fillRect(cx-22, cy-14, 44, 28);
        ctx.fillStyle = col;
        ctx.font = '7.5px monospace';
        ctx.fillText(`${(cand.confidence*100).toFixed(0)}%`, cx-10, cy+5);
      }
      ctx.restore();
    };

    // Clear
    ctx.fillStyle = '#030B14';
    ctx.fillRect(0, 0, W, H);

    // ── Scene 1: vessel deployment (handled by rAF below) ─────────────────
    if (scene === 1) return;

    // ── Scenes 2–6: sonar canvas ──────────────────────────────────────────
    if (scene >= 2 && scene <= 6) {
      if (scene === 3) {
        // Wipe: left=noisy, right=denoised
        drawBase(true, 1);
        const wX = Math.floor(wipe * W);
        ctx.save();
        ctx.beginPath(); ctx.rect(wX, 0, W-wX, H); ctx.clip();
        drawBase(false, 1);
        ctx.restore();
        // Wipe divider
        ctx.strokeStyle = '#00D4AA'; ctx.lineWidth = 2;
        ctx.shadowColor = '#00D4AA'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(wX, 0); ctx.lineTo(wX, H); ctx.stroke();
        ctx.shadowBlur = 0;
        // Labels
        ctx.fillStyle = 'rgba(3,11,20,0.80)'; ctx.fillRect(6,6,84,20);
        ctx.strokeStyle = '#0D2E4A'; ctx.lineWidth = 0.8; ctx.strokeRect(6,6,84,20);
        ctx.fillStyle = '#4A8090'; ctx.font = 'bold 8.5px monospace';
        ctx.fillText('RAW NOISY', 13, 20);
        if (wipe > 0.15) {
          const lx = Math.max(wX+6, W-92);
          ctx.fillStyle = 'rgba(3,11,20,0.80)'; ctx.fillRect(lx, 6, 86, 20);
          ctx.strokeStyle = '#0D2E4A'; ctx.strokeRect(lx, 6, 86, 20);
          ctx.fillStyle = '#00D4AA'; ctx.font = 'bold 8.5px monospace';
          ctx.fillText('DENOISED ✓', lx+7, 20);
        }
      } else {
        drawBase(scene === 2, 1);
      }
      drawNadir();

      // Scene 4: boxes appear
      if (scene === 4) {
        all.slice(0, boxCount).forEach((c: CandidateItem) => drawBox(c, 'raw'));
        // Running counter
        ctx.fillStyle = 'rgba(3,11,20,0.85)'; ctx.fillRect(W-110, 6, 104, 24);
        ctx.strokeStyle = '#0D2E4A'; ctx.lineWidth=1; ctx.strokeRect(W-110, 6, 104, 24);
        ctx.fillStyle = '#00D4AA'; ctx.font = 'bold 10px monospace';
        ctx.fillText(`${boxCount} CANDIDATES`, W-104, 22);
      }

      // Scene 5: filter
      if (scene === 5) {
        const confirmedIds = new Set(confirmed.map((c: CandidateItem) => c.id));
        all.forEach((c: CandidateItem) => {
          if (!filterDone) { drawBox(c, 'raw'); return; }
          drawBox(c, confirmedIds.has(c.id) ? 'confirmed' : 'rejected');
        });
        // Funnel counter
        if (filterDone) {
          ctx.fillStyle = 'rgba(3,11,20,0.90)';
          ctx.fillRect(W-160, 6, 154, 40);
          ctx.strokeStyle = '#0D2E4A'; ctx.lineWidth=1;
          ctx.strokeRect(W-160, 6, 154, 40);
          ctx.fillStyle = '#E0F7F4'; ctx.font = 'bold 9px monospace';
          ctx.fillText(`${all.length} raw  →  ${confirmed.length} confirmed`, W-154, 22);
          ctx.fillStyle = REJECT_COLOR; ctx.font = '8px monospace';
          ctx.fillText(`${all.length - confirmed.length} noise-rejected`, W-154, 37);
        }
      }

      // Scene 6: classify
      if (scene === 6) {
        const confirmedIds = new Set(confirmed.map((c: CandidateItem) => c.id));
        all.forEach((c: CandidateItem) => {
          if (!confirmedIds.has(c.id)) { drawBox(c, 'rejected'); return; }
          const idx = confirmed.findIndex((x: CandidateItem) => x.id === c.id);
          if (idx < classCount) {
            drawBox(c, 'classified', idx);
          } else {
            drawBox(c, 'confirmed');
          }
        });
      }

      // Sensor info strip
      ctx.fillStyle = '#030B14'; ctx.globalAlpha = 0.6;
      ctx.fillRect(0, H-18, W, 18); ctx.globalAlpha=1;
      ctx.fillStyle = '#2A5060'; ctx.font = '7.5px monospace';
      ctx.fillText(`${site.frequency} · ${site.swathWidthM}m SWATH · ${site.timestamp}`, 6, H-5);
    }
  }, [scene, wipe, boxCount, filterDone, classCount, site, all, confirmed]);

  // ── Scene 1: vessel rAF animation ───────────────────────────────────────────
  useEffect(() => {
    if (scene !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = '#030B14';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#0A1E30'; ctx.lineWidth = 0.8;
      for (let x=0; x<W; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y=0; y<H; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Survey track
      const trackY = H * 0.48;
      ctx.strokeStyle = '#1A3A50'; ctx.setLineDash([10,5]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W*0.05, trackY); ctx.lineTo(W*0.95, trackY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#2A5060'; ctx.font = '8px monospace';
      ctx.fillText('SURVEY TRACK ──────────', W*0.08, trackY-8);

      // Vessel position
      const prog = (Math.sin(t * 0.55) * 0.5 + 0.5);
      const vx = W*0.08 + prog*(W*0.82);
      const vy = trackY;

      // Tow cable
      const fx = vx - 55, fy = vy + 14;
      ctx.strokeStyle = '#2A5060'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(vx-14, vy); ctx.lineTo(fx, fy); ctx.stroke();

      // Sonar cones (both sides)
      const coneLen = 95 + Math.sin(t*1.8)*8;
      const sweep = Math.sin(t*2.2)*0.05;
      [[-1, 'port'], [1, 'stbd']].forEach(([dir]) => {
        const d = dir as number;
        const grad = ctx.createLinearGradient(fx, fy, fx + d*coneLen, fy + coneLen*0.4);
        grad.addColorStop(0, 'rgba(0,212,170,0.45)');
        grad.addColorStop(1, 'rgba(0,212,170,0)');
        ctx.save();
        ctx.globalAlpha = 0.22 + Math.sin(t*1.5)*0.06;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.arc(fx, fy, coneLen, d > 0 ? -0.3+sweep : Math.PI+0.3+sweep, d > 0 ? 0.45+sweep : Math.PI+0.45+sweep+sweep);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });

      // Sweep scan line
      const scanY = fy - 50 - ((t*20)%70);
      ctx.strokeStyle = `rgba(0,212,170,${0.55+Math.sin(t*3)*0.25})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(fx-coneLen, scanY); ctx.lineTo(fx+coneLen, scanY); ctx.stroke();

      // Towfish body
      ctx.fillStyle = '#4A8090';
      ctx.beginPath(); ctx.ellipse(fx, fy, 9, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#00D4AA'; ctx.font = '7.5px monospace';
      ctx.fillText('TOWFISH', fx-15, fy+14);

      // Vessel body
      ctx.save();
      ctx.shadowColor = '#00D4AA'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#E0F7F4'; ctx.strokeStyle = '#00D4AA'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vx+16, vy); ctx.lineTo(vx-14, vy-7);
      ctx.lineTo(vx-20, vy); ctx.lineTo(vx-14, vy+7); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#00D4AA'; ctx.font = '8px monospace';
      ctx.fillText('AUV / USV', vx-16, vy-14);

      // Telemetry panel
      ctx.fillStyle = 'rgba(3,11,20,0.88)'; ctx.fillRect(10,10,190,62);
      ctx.strokeStyle = '#0D2E4A'; ctx.lineWidth = 1; ctx.strokeRect(10,10,190,62);
      ctx.fillStyle = '#00D4AA'; ctx.font = 'bold 9px monospace';
      ctx.fillText('SURVEY TELEMETRY', 18, 26);
      ctx.fillStyle = '#4A8090'; ctx.font = '8px monospace';
      ctx.fillText(`SWATH  ${site.swathWidthM}m DUAL-SIDE`, 18, 40);
      ctx.fillText(`FREQ   ${site.frequency}`, 18, 52);
      ctx.fillText(`TOW    ${site.towDepthM}m ALTITUDE`, 18, 64);

      // Port / stbd labels
      ctx.fillStyle = '#2A5060'; ctx.font = '8px monospace';
      ctx.fillText('PORT ◀', fx - coneLen + 8, fy + coneLen*0.3 + 10);
      ctx.fillText('▶ STBD', fx + coneLen*0.5, fy + coneLen*0.3 + 10);

      t += 0.016;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scene, site]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => () => {
    if (autoTimer.current)  clearTimeout(autoTimer.current);
    if (progTimer.current)  clearInterval(progTimer.current);
    if (innerTimer.current) clearInterval(innerTimer.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Progress rail dots ───────────────────────────────────────────────────────
  const renderProgressRail = () => (
    <div className="flex items-center justify-center gap-0 w-full">
      {Array.from({ length: TOTAL_SCENES }).map((_, i) => {
        const done    = i < scene;
        const active  = i === scene;
        const future  = i > scene;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-black transition-all duration-300 ${
                  active
                    ? 'border-[#00D4AA] bg-[#00D4AA] text-[#030B14] dot-active'
                    : done
                    ? 'border-[#00D4AA] bg-[#082830] text-[#00D4AA]'
                    : 'border-[#0D2E4A] bg-[#030B14] text-[#2A5060]'
                }`}
              >
                {done ? '✓' : i}
              </div>
            </div>
            {i < TOTAL_SCENES - 1 && (
              <div className="h-px flex-1 mx-1 relative overflow-hidden bg-[#0D2E4A]" style={{ minWidth: 20, maxWidth: 48 }}>
                {done && <div className="absolute inset-0 bg-[#00D4AA]" />}
                {active && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[#00D4AA]"
                    style={{ width: `${progress * 100}%`, transition: 'width 40ms linear' }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── Scene 0: THE PROBLEM ─────────────────────────────────────────────────────
  const renderScene0 = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center scene-enter relative overflow-hidden">
      {/* Ocean background pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1,2,3].map(i => (
          <div
            key={i}
            className="absolute rounded-full border border-[#00D4AA]/10"
            style={{
              width: `${i*28}%`, height: `${i*28}%`,
              animation: `ping ${i*1.4}s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${i*0.6}s`,
            }}
          />
        ))}
      </div>
      {/* Marine life silhouettes (SVG) */}
      <svg className="absolute bottom-0 left-0 w-full opacity-10" height="120" viewBox="0 0 800 120">
        <ellipse cx="120" cy="80" rx="60" ry="15" fill="#00D4AA" />
        <ellipse cx="400" cy="95" rx="40" ry="10" fill="#00D4AA" />
        <ellipse cx="680" cy="75" rx="50" ry="12" fill="#00D4AA" />
        {/* ghost net shape */}
        <path d="M 280 60 Q 320 30 360 60 Q 400 90 440 60 Q 480 30 520 60" stroke="#00D4AA" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 280 75 Q 320 45 360 75 Q 400 105 440 75 Q 480 45 520 75" stroke="#00D4AA" strokeWidth="1.5" fill="none" opacity="0.4" />
      </svg>
      <div className="relative z-10 max-w-2xl space-y-6">
        <div className="text-[10px] font-bold tracking-[0.3em] text-[#00D4AA] uppercase mb-2">
          ● MoES SIH 2026 — PROBLEM STATEMENT
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#E0F7F4] leading-tight tracking-tight">
          GHOST NETS: ABANDONED FISHING GEAR<br />
          <span className="text-[#00D4AA]">KILLING MARINE LIFE,</span><br />
          INVISIBLE TO EVERY SENSOR EXCEPT SONAR.
        </h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { stat: '640,000+', label: 'tonnes of ghost gear enter oceans annually' },
            { stat: '100M+',    label: 'marine animals killed by ghost nets per year' },
            { stat: 'SONAR',    label: 'only sensor that images seafloor in dark turbid water' },
          ].map(({ stat, label }) => (
            <div key={stat} className="p-3 border border-[#0D2E4A] bg-[#05121F]/80 text-center">
              <div className="text-lg font-black text-[#00D4AA]">{stat}</div>
              <div className="text-[8.5px] text-[#4A8090] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#4A8090] max-w-xl mx-auto leading-relaxed">
          Side-scan sonar is the only acoustic sensor that produces high-resolution seafloor imagery
          through dark, turbid, and deep water — making it the uniquely correct technology for this problem.
        </p>
      </div>
    </div>
  );

  // ── Scene 2: typewriter coordinate overlay ───────────────────────────────────
  const renderScene2Overlay = () => (
    <>
      {/* Coordinate panels stamped on corners */}
      <div className="absolute top-2 left-2 bg-[#030B14]/90 border border-[#0D2E4A] px-2 py-1 text-[8px] text-[#4A8090] font-mono">
        NW: {site.latRange[1].toFixed(4)}°N, {site.lonRange[0].toFixed(4)}°E
      </div>
      <div className="absolute top-2 right-2 bg-[#030B14]/90 border border-[#0D2E4A] px-2 py-1 text-[8px] text-[#4A8090] font-mono">
        NE: {site.latRange[1].toFixed(4)}°N, {site.lonRange[1].toFixed(4)}°E
      </div>
      <div className="absolute bottom-10 left-2 bg-[#030B14]/90 border border-[#0D2E4A] px-2 py-1 text-[8px] text-[#4A8090] font-mono">
        SW: {site.latRange[0].toFixed(4)}°N, {site.lonRange[0].toFixed(4)}°E
      </div>
      <div className="absolute bottom-10 right-2 bg-[#030B14]/90 border border-[#0D2E4A] px-2 py-1 text-[8px] text-[#4A8090] font-mono">
        SE: {site.latRange[0].toFixed(4)}°N, {site.lonRange[1].toFixed(4)}°E
      </div>
      {/* Typing bar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#030B14]/95 border border-[#00D4AA]/60 px-4 py-3 max-w-lg w-full shadow-[0_0_24px_rgba(0,212,170,0.2)]">
        <div className="text-[8px] text-[#00D4AA] font-bold mb-1 uppercase tracking-wider">GEOTAG STAMP — ATTACHED AT ACQUISITION</div>
        <div className="text-[10px] text-[#E0F7F4] font-mono cursor-blink">
          {coordStr}
        </div>
      </div>
    </>
  );

  // ── Scene 7: report + handoff ────────────────────────────────────────────────
  const renderScene7 = () => (
    <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 scene-enter overflow-hidden">
      {/* Left: mini geotag list */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[9px] font-bold text-[#4A8090] uppercase tracking-widest mb-2">
          GEOTAG MARKERS — {geotags}/{confirmed.length} TARGETS
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {confirmed.slice(0, geotags).map((c: CandidateItem, i: number) => {
            const col = CLASS_COLORS[c.class] || '#00D4AA';
            return (
              <div key={c.id}
                className="flex items-center gap-2 px-2 py-1 border bg-[#05121F]/80 text-[9px] font-mono"
                style={{ borderColor: `${col}50` }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
                <span style={{ color: col }} className="font-bold">{c.id}</span>
                <span className="text-[#4A8090] truncate">{c.class}</span>
                <span className="text-[#2A5060] shrink-0">{c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: structured report rows building live */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[9px] font-bold text-[#4A8090] uppercase tracking-widest mb-2">
          ANOMALY REPORT COMPILING…
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {confirmed.slice(0, reportRows).map((c: CandidateItem) => {
            const col = CLASS_COLORS[c.class] || '#00D4AA';
            return (
              <div key={c.id} className="p-2 border border-[#0D2E4A] bg-[#05121F] text-[8.5px] font-mono">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <span className="text-[#2A5060]">TARGET_ID</span><span className="text-[#E0F7F4]">{c.id}</span>
                  <span className="text-[#2A5060]">CLASS</span><span style={{color:col}}>{c.class}</span>
                  <span className="text-[#2A5060]">CONFIDENCE</span><span className="text-[#E0F7F4]">{(c.confidence*100).toFixed(1)}%</span>
                  <span className="text-[#2A5060]">LAT</span><span className="text-[#00D4AA]">{c.lat.toFixed(4)}°N</span>
                  <span className="text-[#2A5060]">LON</span><span className="text-[#00D4AA]">{c.lon.toFixed(4)}°E</span>
                  <span className="text-[#2A5060]">DEPTH</span><span className="text-[#E0F7F4]">{c.depthM}m</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Enter Mission Control */}
        {reportRows >= confirmed.length && (
          <div className="mt-3 space-y-2">
            <div className="text-[9px] text-[#00D4AA] font-bold">
              ✓ PIPELINE COMPLETE — {confirmed.length} targets geotagged, dossier ready
            </div>
            <button
              onClick={onComplete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00D4AA] text-[#030B14] font-black text-sm border border-[#00D4AA] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_24px_rgba(0,212,170,0.35)]"
            >
              <span>ENTER MISSION CONTROL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onComplete}
              className="w-full text-center text-[8.5px] text-[#4A8090] hover:text-[#E0F7F4] cursor-pointer transition-colors"
            >
              (or press Space / → to continue)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const needsCanvas = scene >= 1 && scene <= 6;

  return (
    <div className="fixed inset-0 bg-[#030B14] z-50 flex flex-col font-mono text-[#E0F7F4] select-none">
      {/* ── TOP: Progress rail + skip ─────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-b border-[#0D2E4A] bg-[#05121F] flex items-center gap-4">
        <div className="text-[9px] font-bold text-[#4A8090] uppercase tracking-widest shrink-0">
          LIVE DEMO
        </div>
        <div className="flex-1">{renderProgressRail()}</div>
        <div className="flex items-center gap-2 shrink-0">
          {scene < TOTAL_SCENES - 1 && (
            <button
              onClick={() => { if (autoTimer.current) clearTimeout(autoTimer.current); advance(); }}
              className="flex items-center gap-1 px-2 py-1 border border-[#0D2E4A] text-[#4A8090] hover:text-[#00D4AA] hover:border-[#00D4AA]/50 text-[8.5px] font-bold cursor-pointer transition-all"
              title="Skip to next scene (→ or Space)"
            >
              <SkipForward className="w-3 h-3" />
              <span>SKIP</span>
            </button>
          )}
          <button
            onClick={onComplete}
            className="p-1 text-[#2A5060] hover:text-[#EF4444] cursor-pointer transition-colors"
            title="Exit to Mission Control"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── SCENE CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Scene 0: THE PROBLEM */}
        {scene === 0 && renderScene0()}

        {/* Scenes 1–6: canvas-based */}
        {needsCanvas && (
          <div className="flex-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={460}
              className="w-full h-full object-contain"
            />
            {/* Scene 2: coordinate overlay */}
            {scene === 2 && renderScene2Overlay()}
          </div>
        )}

        {/* Scene 7: report + handoff */}
        {scene === 7 && renderScene7()}
      </div>

      {/* ── BOTTOM: Caption bar ───────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-t border-[#0D2E4A] bg-[#05121F] flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {scene > 0 && scene < 7 && (
            <p className="text-[10.5px] text-[#E0F7F4] font-mono leading-snug scene-enter">
              {SCENE_CAPTIONS[scene]}
            </p>
          )}
          {scene === 0 && (
            <p className="text-[9.5px] text-[#4A8090] font-mono">
              The pipeline you are about to see is the automated answer to this problem.
            </p>
          )}
          {scene === 7 && (
            <p className="text-[10.5px] text-[#E0F7F4] font-mono">
              {SCENE_CAPTIONS[7]}
            </p>
          )}
        </div>
        <div className="text-[8.5px] text-[#2A5060] shrink-0">
          {scene < TOTAL_SCENES - 1
            ? 'Space / → to skip  ·  auto-advancing'
            : 'Click ENTER MISSION CONTROL above'}
        </div>
      </div>
    </div>
  );
};
