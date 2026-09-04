import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, SkipForward, X, ShieldAlert, Waves, Crosshair, Sparkles } from 'lucide-react';
import { CANDIDATE_ITEMS, SURVEY_SITES, CandidateItem } from '../../data/consoleData';
import { sonarAudio } from '../../utils/sonarAudio';

const TOTAL_SCENES = 8;
const AUTO_MS = 3800;

const CLASS_COLORS: Record<string, string> = {
  'Ghost Net (ALDFG)':             '#00D4AA',
  'Lost Fishing Trawl Gear':       '#38BDF8',
  'Anthropogenic Debris Bundle':   '#F59E0B',
  'Subsea Pipeline Free-Span':     '#FB923C',
  'Industrial Metal Barrel Group': '#C084FC',
};
const REJECT_COLOR = '#EF4444';

const SCENE_CAPTIONS = [
  null,
  '01 INGEST — Autonomous vessel sweeps acoustic side-scan sonar across seafloor, imaging both flanks simultaneously.',
  'RAW ACQUISITION — Full-swath acoustic telemetry geotagged at the sensor with sub-meter USBL positioning.',
  '02 DENOISE — Spatial bilateral filtering & CLAHE dynamically strip high-frequency speckle and enhance seabed texture.',
  '03 DETECT — YOLOv8n ONNX perception model proposes candidate bounding boxes across acoustic backscatter anomalies.',
  '04 FILTER — False positives (native basalt rock clusters & sand bedforms) rejected automatically via acoustic shadow geometry.',
  '05 CLASSIFY — Surviving targets categorized under MoES marine debris taxonomy with physical dimensions and threat tags.',
  '06 REPORT — Structured, geotagged anomaly report compiled with WGS84 coordinates, depth profiles, and verification dossier.',
];

interface LiveDemoSequenceProps {
  onComplete: () => void;
}

export const LiveDemoSequence: React.FC<LiveDemoSequenceProps> = ({ onComplete }) => {
  const [scene, setScene]           = useState(0);
  const [progress, setProgress]     = useState(0);
  const [boxCount, setBoxCount]     = useState(0);
  const [filterDone, setFilterDone] = useState(false);
  const [classCount, setClassCount] = useState(0);
  const [wipe, setWipe]             = useState(0);
  const [coordStr, setCoordStr]     = useState('');
  const [reportRows, setReportRows] = useState(0);
  const [geotags, setGeotags]       = useState(0);

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const autoTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const innerTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef      = useRef<number>(0);
  const startRef    = useRef(Date.now());

  const site       = SURVEY_SITES[0];
  const confirmed  = CANDIDATE_ITEMS.filter((c: CandidateItem) => c.status === 'CONFIRMED');
  const all        = CANDIDATE_ITEMS;

  const resetSceneState = () => {
    setBoxCount(0);
    setFilterDone(false);
    setClassCount(0);
    setWipe(0);
    setCoordStr('');
    setReportRows(0);
    setGeotags(0);
    setProgress(0);
    startRef.current = Date.now();
    if (innerTimer.current) clearInterval(innerTimer.current);
    cancelAnimationFrame(rafRef.current);
  };

  const advance = useCallback(() => {
    sonarAudio.playTargetBeep();
    setScene((prev) => {
      if (prev >= TOTAL_SCENES - 1) {
        onComplete();
        return prev;
      }
      return prev + 1;
    });
    resetSceneState();
  }, [onComplete]);

  // Auto-advance
  useEffect(() => {
    if (scene >= TOTAL_SCENES - 1) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(onComplete, 5000);
      return () => {
        if (autoTimer.current) clearTimeout(autoTimer.current);
      };
    }
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(advance, AUTO_MS);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [scene, advance, onComplete]);

  // Progress bar fill
  useEffect(() => {
    if (scene >= TOTAL_SCENES - 1) {
      setProgress(1);
      return;
    }
    startRef.current = Date.now();
    if (progTimer.current) clearInterval(progTimer.current);
    progTimer.current = setInterval(() => {
      const p = Math.min((Date.now() - startRef.current) / AUTO_MS, 1);
      setProgress(p);
      if (p >= 1) clearInterval(progTimer.current!);
    }, 30);
    return () => {
      if (progTimer.current) clearInterval(progTimer.current);
    };
  }, [scene]);

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['Space', 'ArrowRight', 'Enter'].includes(e.code)) {
        e.preventDefault();
        if (autoTimer.current) clearTimeout(autoTimer.current);
        advance();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [advance]);

  // Per-scene timers & typing effects
  useEffect(() => {
    if (innerTimer.current) clearInterval(innerTimer.current);

    if (scene === 2) {
      const full = `USBL_FIX: ${site.latRange[0].toFixed(4)}°N, ${site.lonRange[0].toFixed(4)}°E  |  FREQ: 900 kHz DUAL-FLANK  |  SWATH: 75m  |  ${site.timestamp}`;
      let i = 0;
      innerTimer.current = setInterval(() => {
        i++;
        setCoordStr(full.slice(0, i));
        if (i >= full.length) clearInterval(innerTimer.current!);
      }, 24);
    }

    if (scene === 3) {
      let w = 0;
      innerTimer.current = setInterval(() => {
        w += 0.022;
        setWipe(Math.min(w, 1));
        if (w >= 1) clearInterval(innerTimer.current!);
      }, 35);
    }

    if (scene === 4) {
      let n = 0;
      innerTimer.current = setInterval(() => {
        n++;
        setBoxCount(Math.min(n, all.length));
        if (n >= all.length) clearInterval(innerTimer.current!);
      }, 140);
    }

    if (scene === 5) {
      setBoxCount(all.length);
      const t = setTimeout(() => {
        setFilterDone(true);
        sonarAudio.playDepthPulse();
      }, 1000);
      return () => clearTimeout(t);
    }

    if (scene === 6) {
      setBoxCount(all.length);
      setFilterDone(true);
      let n = 0;
      innerTimer.current = setInterval(() => {
        n++;
        setClassCount(Math.min(n, confirmed.length));
        if (n >= confirmed.length) clearInterval(innerTimer.current!);
      }, 260);
    }

    if (scene === 7) {
      let g = 0;
      let r = 0;
      innerTimer.current = setInterval(() => {
        if (g < confirmed.length) {
          g++;
          setGeotags(g);
        }
        if (r < confirmed.length) {
          r++;
          setReportRows(r);
        }
        if (g >= confirmed.length && r >= confirmed.length) clearInterval(innerTimer.current!);
      }, 280);
    }
  }, [scene]);

  // ── Canvas rendering for Scenes 2–6 ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const dn = (x: number, y: number, seed = 0) =>
      Math.abs(Math.sin(x * 127.1 + y * 311.7 + seed * 74.1) * 43758.5453) % 1;

    const drawBase = (noisy: boolean, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let x = 0; x < W; x += 4) {
        for (let y = 0; y < H; y += 4) {
          const dist = Math.abs(x - W / 2) / (W / 2);
          const rangeGain = Math.pow(dist, 0.45);
          const wave = Math.sin(x * 0.018) * 0.08 + Math.sin(y * 0.024) * 0.05 + 0.12;
          const noise = noisy ? dn(x, y) * 0.42 : 0;
          const v = Math.floor((wave + noise) * rangeGain * 56);
          const r = Math.floor(v * 0.14);
          const g = Math.floor(v * 0.65);
          const b = Math.min(255, Math.floor(v * 0.96) + 16);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
      ctx.restore();
    };

    const drawNadir = () => {
      ctx.fillStyle = '#01050A';
      ctx.fillRect(W / 2 - 18, 0, 36, H);
      ctx.strokeStyle = '#00D4AA';
      ctx.globalAlpha = 0.45;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };

    const drawBox = (cand: CandidateItem, style: 'raw' | 'rejected' | 'confirmed' | 'classified', classIdx = 0) => {
      const cx = (cand.rawX / 100) * W;
      const cy = (cand.rawY / 100) * H;
      const isPort = cx < W / 2;
      const shadowDir = isPort ? -1 : 1;
      const shadowLen = Math.max(16, cand.shadowLengthM * 10);

      ctx.save();

      if (style === 'rejected') {
        ctx.strokeStyle = 'rgba(239,68,68,0.7)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx - 22, cy - 14, 44, 28);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(239,68,68,0.1)';
        ctx.fillRect(cx - 22, cy - 14, 44, 28);
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✕ NOISE', cx, cy + 3);
        ctx.textAlign = 'left';
      } else if (style === 'confirmed' || style === 'classified') {
        const col = style === 'classified' ? (CLASS_COLORS[cand.class] || '#00D4AA') : '#00D4AA';

        // Acoustic Void Shadow
        ctx.fillStyle = '#01050A';
        ctx.beginPath();
        ctx.moveTo(cx + shadowDir * 8, cy - 6);
        ctx.lineTo(cx + shadowDir * (8 + shadowLen), cy - 8);
        ctx.lineTo(cx + shadowDir * (8 + shadowLen), cy + 8);
        ctx.lineTo(cx + shadowDir * 8, cy + 6);
        ctx.closePath();
        ctx.fill();

        // High Backscatter Highlight
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Futuristic Bracket Reticle
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 24, cy - 16, 48, 32);
        ctx.fillStyle = `${col}18`;
        ctx.fillRect(cx - 24, cy - 16, 48, 32);

        // Circular lock indicator
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.strokeStyle = `${col}40`;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = col;
        ctx.font = 'bold 7.5px monospace';
        if (style === 'classified') {
          const shortLabel = cand.class.split(' ').slice(0, 2).join(' ');
          ctx.fillText(shortLabel, cx - 22, cy - 19);
        } else {
          ctx.fillText(`${(cand.confidence * 100).toFixed(0)}% CONF`, cx - 18, cy - 19);
        }
      } else {
        // Raw proposals
        let col = '#00D4AA';
        if (cand.confidence < 0.4) col = REJECT_COLOR;
        else if (cand.confidence < 0.7) col = '#F59E0B';

        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 22, cy - 14, 44, 28);
        ctx.fillStyle = `${col}15`;
        ctx.fillRect(cx - 22, cy - 14, 44, 28);
        ctx.fillStyle = col;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`PROPOSAL ${(cand.confidence * 100).toFixed(0)}%`, cx - 20, cy + 4);
      }
      ctx.restore();
    };

    ctx.fillStyle = '#01050A';
    ctx.fillRect(0, 0, W, H);

    if (scene === 1) return;

    if (scene >= 2 && scene <= 6) {
      if (scene === 3) {
        // Wipe: left=noisy, right=denoised
        drawBase(true, 1);
        const wX = Math.floor(wipe * W);

        ctx.save();
        ctx.beginPath();
        ctx.rect(wX, 0, W - wX, H);
        ctx.clip();
        drawBase(false, 1);
        ctx.restore();

        // Laser Wipe Bar with Neon Glow
        ctx.save();
        ctx.strokeStyle = '#00D4AA';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00D4AA';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(wX, 0);
        ctx.lineTo(wX, H);
        ctx.stroke();

        // Sparkle points on laser edge
        for (let s = 20; s < H; s += 45) {
          ctx.fillStyle = '#E0F7F4';
          ctx.beginPath();
          ctx.arc(wX, s + Math.sin(wX * 0.1 + s) * 8, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Telemetry tags
        ctx.fillStyle = 'rgba(1,5,10,0.85)';
        ctx.fillRect(10, 10, 110, 24);
        ctx.strokeStyle = '#0D2E4A';
        ctx.strokeRect(10, 10, 110, 24);
        ctx.fillStyle = '#4A8090';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('RAW SPECKLE (−0 dB)', 16, 25);

        if (wipe > 0.15) {
          const lx = Math.max(wX + 10, W - 140);
          ctx.fillStyle = 'rgba(1,5,10,0.85)';
          ctx.fillRect(lx, 10, 130, 24);
          ctx.strokeStyle = '#00D4AA';
          ctx.strokeRect(lx, 10, 130, 24);
          ctx.fillStyle = '#00D4AA';
          ctx.font = 'bold 8.5px monospace';
          ctx.fillText('CLAHE DENOISED (−18.4 dB)', lx + 6, 25);
        }
      } else {
        drawBase(scene === 2, 1);
      }

      drawNadir();

      if (scene === 4) {
        all.slice(0, boxCount).forEach((c: CandidateItem) => drawBox(c, 'raw'));
        // High-tech counter HUD
        ctx.fillStyle = 'rgba(1,5,10,0.92)';
        ctx.fillRect(W - 145, 10, 135, 30);
        ctx.strokeStyle = '#00D4AA';
        ctx.lineWidth = 1;
        ctx.strokeRect(W - 145, 10, 135, 30);
        ctx.fillStyle = '#00D4AA';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`⚡ ${boxCount} PROPOSALS`, W - 138, 28);
      }

      if (scene === 5) {
        const confirmedIds = new Set(confirmed.map((c: CandidateItem) => c.id));
        all.forEach((c: CandidateItem) => {
          if (!filterDone) {
            drawBox(c, 'raw');
            return;
          }
          drawBox(c, confirmedIds.has(c.id) ? 'confirmed' : 'rejected');
        });

        if (filterDone) {
          ctx.fillStyle = 'rgba(1,5,10,0.92)';
          ctx.fillRect(W - 195, 10, 185, 46);
          ctx.strokeStyle = '#0D2E4A';
          ctx.strokeRect(W - 195, 10, 185, 46);
          ctx.fillStyle = '#00D4AA';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`FILTER GATE ACTIVE`, W - 185, 26);
          ctx.fillStyle = '#E0F7F4';
          ctx.font = '8.5px monospace';
          ctx.fillText(`37 Raw  →  17 Confirmed Debris`, W - 185, 42);
        }
      }

      if (scene === 6) {
        const confirmedIds = new Set(confirmed.map((c: CandidateItem) => c.id));
        all.forEach((c: CandidateItem) => {
          if (!confirmedIds.has(c.id)) {
            drawBox(c, 'rejected');
            return;
          }
          const idx = confirmed.findIndex((x: CandidateItem) => x.id === c.id);
          if (idx < classCount) {
            drawBox(c, 'classified', idx);
          } else {
            drawBox(c, 'confirmed');
          }
        });
      }

      // Sensor telemetry ribbon
      ctx.fillStyle = 'rgba(1,5,10,0.7)';
      ctx.fillRect(0, H - 20, W, 20);
      ctx.fillStyle = '#4A8090';
      ctx.font = '8px monospace';
      ctx.fillText(`${site.frequency} · SWATH: ${site.swathWidthM}m · SPEED: 4.2 KTS · ${site.timestamp}`, 8, H - 7);
    }
  }, [scene, wipe, boxCount, filterDone, classCount, site, all, confirmed]);

  // ── Scene 1: Top-down Vessel Survey Sweeping Animation ────────────────────────
  useEffect(() => {
    if (scene !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = '#01050A';
      ctx.fillRect(0, 0, W, H);

      // Bathymetric Depth Grids
      ctx.strokeStyle = '#0A1E30';
      ctx.lineWidth = 0.8;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Seafloor contour curves
      ctx.strokeStyle = '#0D2E4A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x += 20) {
        const y = H * 0.7 + Math.sin(x * 0.015) * 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Survey track line
      const trackY = H * 0.48;
      ctx.strokeStyle = '#00D4AA';
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, trackY);
      ctx.lineTo(W * 0.95, trackY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Vessel motion
      const prog = (Math.sin(t * 0.6) * 0.5 + 0.5);
      const vx = W * 0.12 + prog * (W * 0.76);
      const vy = trackY;

      // Hydrodynamic wake particles behind vessel
      ctx.strokeStyle = 'rgba(0,212,170,0.3)';
      ctx.lineWidth = 1.2;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(vx - i * 14, vy, i * 6, -0.6, 0.6);
        ctx.stroke();
      }

      // Tow cable to towfish
      const fx = vx - 65;
      const fy = vy + 18;
      ctx.strokeStyle = '#4A8090';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vx - 14, vy);
      ctx.quadraticCurveTo(vx - 40, vy + 4, fx, fy);
      ctx.stroke();

      // Dual-Flank Sonar Cones (Port & Starboard)
      const coneLen = 110 + Math.sin(t * 2) * 10;
      const sweep = Math.sin(t * 3) * 0.08;

      [-1, 1].forEach((dir) => {
        const grad = ctx.createRadialGradient(fx, fy, 10, fx, fy, coneLen);
        grad.addColorStop(0, 'rgba(0,212,170,0.5)');
        grad.addColorStop(0.7, 'rgba(0,212,170,0.15)');
        grad.addColorStop(1, 'rgba(0,212,170,0)');

        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        const startAng = dir > 0 ? -0.4 + sweep : Math.PI - 0.4 + sweep;
        const endAng   = dir > 0 ? 0.4 + sweep : Math.PI + 0.4 + sweep;
        ctx.arc(fx, fy, coneLen, startAng, endAng);
        ctx.closePath();
        ctx.fill();

        // Sonar wavefront pulses
        ctx.strokeStyle = 'rgba(0,212,170,0.6)';
        ctx.lineWidth = 1.5;
        const pulseR = ((t * 40) % coneLen);
        ctx.beginPath();
        ctx.arc(fx, fy, pulseR, startAng, endAng);
        ctx.stroke();
        ctx.restore();
      });

      // Towfish body with glow
      ctx.fillStyle = '#00D4AA';
      ctx.shadowColor = '#00D4AA';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#E0F7F4';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('SSS TOWFISH', fx - 22, fy + 16);

      // Autonomous Vessel Body
      ctx.save();
      ctx.shadowColor = '#00D4AA';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#E0F7F4';
      ctx.strokeStyle = '#00D4AA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vx + 18, vy);
      ctx.lineTo(vx - 14, vy - 8);
      ctx.lineTo(vx - 22, vy);
      ctx.lineTo(vx - 14, vy + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#00D4AA';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('SURVEY AUV', vx - 18, vy - 14);

      // Live Telemetry Glass Panel
      ctx.fillStyle = 'rgba(5,18,31,0.92)';
      ctx.fillRect(14, 14, 210, 72);
      ctx.strokeStyle = '#00D4AA';
      ctx.lineWidth = 1;
      ctx.strokeRect(14, 14, 210, 72);

      ctx.fillStyle = '#00D4AA';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText('● REAL-TIME MISSION TELEMETRY', 22, 32);

      ctx.fillStyle = '#E0F7F4';
      ctx.font = '8.5px monospace';
      ctx.fillText(`SWATH WIDTH : ${site.swathWidthM}m DUAL-SIDE`, 22, 48);
      ctx.fillText(`FREQUENCY   : ${site.frequency}`, 22, 60);
      ctx.fillText(`TOW DEPTH   : ${site.towDepthM}m OFF SEABED`, 22, 72);

      t += 0.02;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scene, site]);

  // Cleanup
  useEffect(() => () => {
    if (autoTimer.current)  clearTimeout(autoTimer.current);
    if (progTimer.current)  clearInterval(progTimer.current);
    if (innerTimer.current) clearInterval(innerTimer.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Render Top Progress Rail ────────────────────────────────────────────────
  const renderProgressRail = () => (
    <div className="flex items-center justify-center gap-0 w-full">
      {Array.from({ length: TOTAL_SCENES }).map((_, i) => {
        const done   = i < scene;
        const active = i === scene;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[8.5px] font-black transition-all duration-300 ${
                  active
                    ? 'border-[#00D4AA] bg-[#00D4AA] text-[#030B14] dot-active shadow-[0_0_15px_#00D4AA]'
                    : done
                    ? 'border-[#00D4AA] bg-[#082830] text-[#00D4AA]'
                    : 'border-[#0D2E4A] bg-[#030B14] text-[#2A5060]'
                }`}
              >
                {done ? '✓' : i}
              </div>
            </div>
            {i < TOTAL_SCENES - 1 && (
              <div className="h-0.5 flex-1 mx-1.5 relative overflow-hidden bg-[#0D2E4A]" style={{ minWidth: 24, maxWidth: 50 }}>
                {done && <div className="absolute inset-0 bg-[#00D4AA]" />}
                {active && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[#00D4AA] shadow-[0_0_10px_#00D4AA]"
                    style={{ width: `${progress * 100}%`, transition: 'width 30ms linear' }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── Render Scene 0: THE PROBLEM (Cinematic Opener) ───────────────────────────
  const renderScene0 = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center scene-enter relative overflow-hidden bg-radial from-[#051C2C] to-[#01050A]">
      {/* Dynamic Soundwave Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-[#00D4AA]/15"
            style={{
              width: `${i * 22}%`,
              height: `${i * 22}%`,
              animation: `ping ${i * 1.6}s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#082830] border border-[#00D4AA]/50 text-[10px] font-bold tracking-[0.25em] text-[#00D4AA] uppercase shadow-[0_0_15px_rgba(0,212,170,0.25)]">
          <Waves className="w-3.5 h-3.5" />
          <span>MoES SIH 2026 // PROBLEM STATEMENT</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-[#E0F7F4] leading-tight tracking-tight drop-shadow-lg">
          GHOST NETS: ABANDONED FISHING GEAR<br />
          <span className="text-[#00D4AA] drop-shadow-[0_0_25px_rgba(0,212,170,0.8)] animate-pulse inline-block">
            KILLING MARINE LIFE,
          </span><br />
          INVISIBLE TO EVERY SENSOR EXCEPT SONAR.
        </h1>

        <div className="grid grid-cols-3 gap-3.5 mt-6">
          {[
            { stat: '640,000+', label: 'tonnes ghost gear lost in oceans annually', source: 'UN Environment Programme (UNEP)', alert: true },
            { stat: '100M+',    label: 'marine animals trapped & killed each year', source: 'FAO Global Ghost Gear Initiative', alert: true },
            { stat: 'SONAR ONLY', label: 'acoustic sensors see in turbid dark water', source: 'Kongsberg / Klein Acoustic Physics', alert: false },
          ].map(({ stat, label, source, alert }) => (
            <div
              key={stat}
              className={`p-3.5 border ${
                alert ? 'border-[#0D2E4A] bg-[#05121F]/90' : 'border-[#00D4AA]/60 bg-[#082830]'
              } shadow-lg text-center flex flex-col justify-between`}
            >
              <div>
                <div className="text-xl font-black text-[#00D4AA]">{stat}</div>
                <div className="text-[8.5px] text-[#4A8090] mt-1 leading-snug">{label}</div>
              </div>
              <div className="text-[7px] text-[#2A5060] font-mono mt-2 pt-1 border-t border-[#0D2E4A]/60">
                Source: {source}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#4A8090] max-w-xl mx-auto leading-relaxed">
          Side-scan sonar acoustic pulses penetrate dark, deep, and turbid coastal waters where cameras fail.
          Our automated perception system extracts, filters, and geotags submerged debris in real time.
        </p>
      </div>
    </div>
  );

  // ── Render Scene 2 Overlay: Typewritten Coordinates ──────────────────────────
  const renderScene2Overlay = () => (
    <>
      <div className="absolute top-3 left-3 bg-[#01050A]/95 border border-[#00D4AA]/40 px-2.5 py-1 text-[8.5px] text-[#00D4AA] font-mono shadow-md">
        NW PIN: {site.latRange[1].toFixed(4)}°N, {site.lonRange[0].toFixed(4)}°E
      </div>
      <div className="absolute top-3 right-3 bg-[#01050A]/95 border border-[#00D4AA]/40 px-2.5 py-1 text-[8.5px] text-[#00D4AA] font-mono shadow-md">
        NE PIN: {site.latRange[1].toFixed(4)}°N, {site.lonRange[1].toFixed(4)}°E
      </div>
      <div className="absolute bottom-12 left-3 bg-[#01050A]/95 border border-[#00D4AA]/40 px-2.5 py-1 text-[8.5px] text-[#00D4AA] font-mono shadow-md">
        SW PIN: {site.latRange[0].toFixed(4)}°N, {site.lonRange[0].toFixed(4)}°E
      </div>
      <div className="absolute bottom-12 right-3 bg-[#01050A]/95 border border-[#00D4AA]/40 px-2.5 py-1 text-[8.5px] text-[#00D4AA] font-mono shadow-md">
        SE PIN: {site.latRange[0].toFixed(4)}°N, {site.lonRange[1].toFixed(4)}°E
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#05121F]/95 border border-[#00D4AA] p-4 max-w-lg w-full shadow-[0_0_30px_rgba(0,212,170,0.35)]">
        <div className="flex items-center gap-2 text-[9px] text-[#00D4AA] font-bold uppercase tracking-wider mb-1.5">
          <Crosshair className="w-3.5 h-3.5 animate-spin" />
          <span>REAL-TIME SENSOR GEOTAG TELEMETRY</span>
        </div>
        <div className="text-[11px] text-[#E0F7F4] font-mono cursor-blink leading-relaxed">
          {coordStr}
        </div>
      </div>
    </>
  );

  // ── Render Scene 7: Structured Dossier & Handoff ─────────────────────────────
  const renderScene7 = () => (
    <div className="flex-1 flex flex-col md:flex-row gap-4 p-5 scene-enter overflow-hidden bg-[#01050A]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[10px] font-bold text-[#00D4AA] uppercase tracking-widest mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GEOTAGGED TARGET MAP REGISTER — {geotags}/{confirmed.length} TARGETS</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border border-[#0D2E4A] p-2 bg-[#030B14]">
          {confirmed.slice(0, geotags).map((c) => {
            const col = CLASS_COLORS[c.class] || '#00D4AA';
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 border bg-[#05121F] text-[9px] font-mono shadow-sm"
                style={{ borderColor: `${col}60` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col }} />
                  <span style={{ color: col }} className="font-bold">{c.id}</span>
                  <span className="text-[#E0F7F4] truncate">{c.class}</span>
                </div>
                <div className="text-[#4A8090] text-right">
                  {c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E (Depth {c.depthM}m)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[10px] font-bold text-[#00D4AA] uppercase tracking-widest mb-2">
          STREAMING STRUCTURED INSPECTION DOSSIER
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 border border-[#0D2E4A] p-2 bg-[#030B14]">
          {confirmed.slice(0, reportRows).map((c) => {
            const col = CLASS_COLORS[c.class] || '#00D4AA';
            return (
              <div key={c.id} className="p-2 border border-[#0D2E4A] bg-[#05121F] text-[8.5px] font-mono">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-[#4A8090]">TARGET_ID:</span><span className="text-[#E0F7F4] font-bold">{c.id}</span>
                  <span className="text-[#4A8090]">CLASS:</span><span style={{ color: col }} className="font-bold">{c.class}</span>
                  <span className="text-[#4A8090]">CONFIDENCE:</span><span className="text-[#00D4AA]">{(c.confidence * 100).toFixed(1)}%</span>
                  <span className="text-[#4A8090]">SHADOW LENGTH:</span><span className="text-[#E0F7F4]">{c.shadowLengthM}m relief</span>
                  <span className="text-[#4A8090]">COORDINATES:</span><span className="text-[#00D4AA]">{c.lat.toFixed(4)}°N, {c.lon.toFixed(4)}°E</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-2">
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-[#00D4AA] text-[#030B14] font-black text-sm border border-[#00D4AA] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,212,170,0.55)] animate-pulse"
          >
            <span>⚡ ENTER MISSION CONTROL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-center text-[8.5px] text-[#4A8090]">
            Full pipeline verified · Click to enter Mission Control or auto-advancing in 5s
          </div>
        </div>
      </div>
    </div>
  );

  const needsCanvas = scene >= 1 && scene <= 6;

  return (
    <div className="fixed inset-0 bg-[#01050A] z-50 flex flex-col font-mono text-[#E0F7F4] select-none">
      {/* Top Progress Rail */}
      <div className="shrink-0 px-6 py-2.5 border-b border-[#0D2E4A] bg-[#05121F] flex items-center gap-4">
        <div className="text-[9px] font-bold text-[#00D4AA] uppercase tracking-widest shrink-0">
          CINEMATIC DEMO
        </div>
        <div className="flex-1">{renderProgressRail()}</div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#00D4AA] text-[#030B14] font-bold text-[9px] cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,212,170,0.3)]"
            title="Jump directly to interactive Mission Control"
          >
            <span>⚡ MISSION CONTROL</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {scene < TOTAL_SCENES - 1 && (
            <button
              onClick={() => {
                if (autoTimer.current) clearTimeout(autoTimer.current);
                advance();
              }}
              className="flex items-center gap-1 px-2.5 py-1 border border-[#0D2E4A] text-[#4A8090] hover:text-[#00D4AA] hover:border-[#00D4AA]/50 text-[8.5px] font-bold cursor-pointer transition-all"
              title="Skip scene (Space or →)"
            >
              <SkipForward className="w-3 h-3" />
              <span>SKIP</span>
            </button>
          )}
          <button
            onClick={onComplete}
            className="p-1 text-[#4A8090] hover:text-[#EF4444] cursor-pointer transition-colors"
            title="Exit to Mission Control"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scene Body */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {scene === 0 && renderScene0()}

        {needsCanvas && (
          <div className="flex-1 relative overflow-hidden bg-[#01050A] flex items-center justify-center">
            <div 
              className="relative w-full max-w-[1200px] aspect-[7/4] transition-transform duration-[4000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              style={{
                transformOrigin: '34% 42%',
                transform: scene === 6 ? 'scale(2.5)' : 'scale(1)'
              }}
            >
              <canvas
                ref={canvasRef}
                width={840}
                height={480}
                className="w-full h-full object-contain"
              />
              {scene === 2 && renderScene2Overlay()}
            </div>
            
            {/* Cinematic Scan Line (Scene 4 & 5) */}
            {(scene === 4 || scene === 5) && (
              <div 
                className="absolute left-0 right-0 h-1 bg-[#00D4AA] shadow-[0_0_20px_4px_#00D4AA] opacity-80"
                style={{
                  top: '-10%',
                  animation: 'sweepDown 3.8s linear forwards'
                }}
              />
            )}
            <style>{`
              @keyframes sweepDown {
                0% { top: -10%; opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { top: 110%; opacity: 0; }
              }
            `}</style>
            {/* CRT Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
          </div>
        )}

        {scene === 7 && renderScene7()}
      </div>

      {/* Bottom Caption Bar */}
      <div className="shrink-0 px-6 py-3 border-t border-[#0D2E4A] bg-[#05121F] flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {scene > 0 && scene < 7 && (
            <p className="text-[11px] text-[#E0F7F4] font-mono leading-snug scene-enter">
              {SCENE_CAPTIONS[scene]}
            </p>
          )}
          {scene === 0 && (
            <p className="text-[10px] text-[#00D4AA] font-mono">
              The automated pipeline you are about to see is built specifically for this mission.
            </p>
          )}
          {scene === 7 && (
            <p className="text-[11px] text-[#E0F7F4] font-mono">
              {SCENE_CAPTIONS[7]}
            </p>
          )}
        </div>
        <div className="text-[8.5px] text-[#4A8090] shrink-0">
          {scene < TOTAL_SCENES - 1 ? 'Auto-advancing  ·  Space / → to skip' : 'Click ENTER MISSION CONTROL'}
        </div>
      </div>
    </div>
  );
};
