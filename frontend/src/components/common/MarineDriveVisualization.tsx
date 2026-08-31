import React, { useEffect, useRef, useState } from 'react';
import { Radio, Cpu, Crosshair, ArrowRight, Zap, Activity, Eye } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Animated Sonar-Ping Canvas
   Draws expanding arcs to simulate side-scan sonar sweeping
───────────────────────────────────────────────────────────── */
const SonarPingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height * 0.72; // AUV sits near bottom

    const rings: { r: number; alpha: number; speed: number; delay: number }[] = [];
    const MAX_RINGS = 5;
    let t = 0;

    for (let i = 0; i < MAX_RINGS; i++) {
      rings.push({ r: 0, alpha: 0, speed: 1.4, delay: i * 36 });
    }

    // Debris blobs (static positions relative to canvas)
    const blobs = [
      { x: cx - 80, y: cy - 60, label: 'Ghost Net', color: '#A855F7' },
      { x: cx + 70, y: cy - 45, label: 'Debris',    color: '#F59E0B' },
      { x: cx - 20, y: cy - 90, label: 'Pipeline',  color: '#3B82F6' },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Seafloor gradient ──────────────────────────────────
      const floor = ctx.createLinearGradient(0, cy, 0, canvas.height);
      floor.addColorStop(0, 'rgba(6,182,212,0.06)');
      floor.addColorStop(1, 'rgba(6,182,212,0.01)');
      ctx.fillStyle = floor;
      ctx.fillRect(0, cy, canvas.width, canvas.height - cy);

      // ── Seafloor line ──────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.strokeStyle = 'rgba(6,182,212,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Ping arcs (upper half) ─────────────────────────────
      for (let i = 0; i < MAX_RINGS; i++) {
        const ring = rings[i];
        const age = (t - ring.delay + 1000) % 220;
        ring.r = age * ring.speed;
        ring.alpha = Math.max(0, 1 - ring.r / (Math.min(cx, cy) * 1.35));

        if (ring.alpha <= 0) continue;

        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, Math.PI, 0); // upper semicircle
        ctx.strokeStyle = `rgba(6,182,212,${(ring.alpha * 0.55).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ── AUV body ───────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy + 12);
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;
      // hull
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // nose
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(30, -2);
      ctx.lineTo(30, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── AUV label ─────────────────────────────────────────
      ctx.fillStyle = 'rgba(6,182,212,0.8)';
      ctx.font = '500 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AUV · SSS DRONE', cx, cy + 28);

      // ── Transducer beam lines ──────────────────────────────
      const beamAlpha = 0.08 + 0.04 * Math.sin(t * 0.06);
      ctx.save();
      ctx.translate(cx, cy + 12);
      const beamGrad = ctx.createLinearGradient(0, 0, -canvas.width / 2, -90);
      beamGrad.addColorStop(0, `rgba(6,182,212,${beamAlpha})`);
      beamGrad.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-canvas.width / 2, -90);
      ctx.lineTo(-canvas.width / 2, -60);
      ctx.closePath();
      ctx.fill();

      const beamGradR = ctx.createLinearGradient(0, 0, canvas.width / 2, -90);
      beamGradR.addColorStop(0, `rgba(6,182,212,${beamAlpha})`);
      beamGradR.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.fillStyle = beamGradR;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width / 2, -90);
      ctx.lineTo(canvas.width / 2, -60);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── Detected blobs ─────────────────────────────────────
      blobs.forEach((b) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.07 + b.x);
        const blobR = 7 + 3 * pulse;

        // glow ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, blobR + 6, 0, Math.PI * 2);
        ctx.strokeStyle = b.color + '55';
        ctx.lineWidth = 1;
        ctx.stroke();

        // fill
        ctx.beginPath();
        ctx.arc(b.x, b.y, blobR, 0, Math.PI * 2);
        ctx.fillStyle = b.color + '88';
        ctx.fill();

        // crosshair
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b.x - blobR - 4, b.y);
        ctx.lineTo(b.x + blobR + 4, b.y);
        ctx.moveTo(b.x, b.y - blobR - 4);
        ctx.lineTo(b.x, b.y + blobR + 4);
        ctx.stroke();

        // label
        ctx.fillStyle = b.color;
        ctx.font = '600 8.5px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, b.x, b.y - blobR - 8);
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   Waterfall Sonar Strip Simulation
───────────────────────────────────────────────────────────── */
const WaterfallStrip: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rowsRef = useRef<number[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Pre-fill rows
    rowsRef.current = Array.from({ length: H }, () => generateRow(W));

    let t = 0;
    const ANOMALY_POSITIONS = [Math.floor(W * 0.25), Math.floor(W * 0.6), Math.floor(W * 0.78)];

    function generateRow(width: number): number[] {
      return Array.from({ length: width }, (_, x) => {
        // baseline seafloor noise
        let val = 20 + Math.random() * 35;

        // strong nadir (center bright band)
        const cx = width / 2;
        const dist = Math.abs(x - cx);
        if (dist < 8) val = 200 + Math.random() * 50;
        else if (dist < 20) val = 120 + Math.random() * 60;

        // echo returns from detected objects
        ANOMALY_POSITIONS.forEach((ax) => {
          const d2 = Math.abs(x - ax);
          if (d2 < 12) val = 160 + Math.random() * 80;
        });

        return Math.min(255, val);
      });
    }

    const draw = () => {
      // Shift image down by 1 pixel
      const imageData = ctx.getImageData(0, 0, W, H);
      const newData = new Uint8ClampedArray(imageData.data.length);
      // copy rows downward
      newData.set(imageData.data.subarray(0, (H - 1) * W * 4), W * 4);

      // generate new top row
      const newRow = generateRow(W);
      for (let x = 0; x < W; x++) {
        const v = newRow[x];
        // Map value to a green/teal hue (sonar style)
        const r = Math.floor(v * 0.05);
        const g = Math.floor(v * 0.72);
        const b = Math.floor(v * 0.85);
        const idx = x * 4;
        newData[idx] = r;
        newData[idx + 1] = g;
        newData[idx + 2] = b;
        newData[idx + 3] = 255;
      }

      ctx.putImageData(new ImageData(newData, W, H), 0, 0);

      // Overlay bounding boxes at fixed x columns
      const boxDefs = [
        { x: ANOMALY_POSITIONS[0] - 14, w: 28, label: 'GN', color: '#A855F7' },
        { x: ANOMALY_POSITIONS[1] - 10, w: 22, label: 'DB', color: '#F59E0B' },
        { x: ANOMALY_POSITIONS[2] - 8,  w: 18, label: 'PP', color: '#3B82F6' },
      ];

      boxDefs.forEach((b) => {
        const pulseAlpha = 0.6 + 0.4 * Math.sin(t * 0.09);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = pulseAlpha;
        ctx.strokeRect(b.x, 30, b.w, 40);
        ctx.font = '700 7px JetBrains Mono, monospace';
        ctx.fillStyle = b.color;
        ctx.fillText(b.label, b.x + 2, 28);
        ctx.globalAlpha = 1;
      });

      // Sweep line
      ctx.fillStyle = 'rgba(6,182,212,0.25)';
      ctx.fillRect(0, 0, W, 2);

      t++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   Pipeline Step Card
───────────────────────────────────────────────────────────── */
interface StepProps {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  color: string;
  active?: boolean;
}

const PipelineStep: React.FC<StepProps> = ({ step, icon: Icon, title, detail, color, active }) => (
  <div className={`relative flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all
    ${active
      ? `border-${color}-500/50 bg-${color}-500/10 shadow-lg shadow-${color}-500/10`
      : 'border-slate-800/60 bg-slate-950/40'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
      ${active ? `bg-${color}-500/20` : 'bg-slate-900/60'} border border-slate-700/40`}
    >
      <Icon className={`w-5 h-5 ${active ? `text-${color}-400` : 'text-slate-500'}`} />
    </div>
    <span className={`text-[9px] font-mono font-black tracking-widest uppercase
      ${active ? `text-${color}-400` : 'text-slate-600'}`}>
      STEP {step}
    </span>
    <p className={`text-xs font-bold leading-tight ${active ? 'text-slate-100' : 'text-slate-500'}`}>
      {title}
    </p>
    <p className={`text-[10px] leading-snug ${active ? 'text-slate-300' : 'text-slate-600'}`}>
      {detail}
    </p>
    {active && (
      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-950 animate-pulse" />
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export const MarineDriveVisualization: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through pipeline steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps: Omit<StepProps, 'active'>[] = [
    {
      step: 1,
      icon: Radio,
      title: 'AUV Acoustic Emission',
      detail: '120–410 kHz side-scan transducer fires port & starboard pings',
      color: 'cyan',
    },
    {
      step: 2,
      icon: Activity,
      title: 'Echo Return Capture',
      detail: 'Time-of-flight backscatter recorded as waterfall swath columns',
      color: 'teal',
    },
    {
      step: 3,
      icon: Eye,
      title: 'Waterfall Image Formation',
      detail: 'Raw amplitude data rendered into 16-bit grayscale SSS tiles',
      color: 'blue',
    },
    {
      step: 4,
      icon: Cpu,
      title: 'YOLOv8n ONNX Inference',
      detail: 'Edge model detects Ghost Nets, Debris & Pipeline anomalies',
      color: 'purple',
    },
    {
      step: 5,
      icon: Crosshair,
      title: 'Target Geo-Tagging',
      detail: 'Detections projected to GPS coords & logged to MoES dashboard',
      color: 'amber',
    },
  ];

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h4 className="text-sm font-extrabold text-slate-100 font-mono uppercase tracking-wider">
              Marine Drive — Side-Scan Sonar Pipeline
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
              SIH DEMO
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            How our AUV captures seabed imagery, forms sonar waterfall scans, and runs real-time
            AI detection — end-to-end in under 15 ms on the edge.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          PIPELINE LIVE
        </div>
      </div>

      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Left: Animated Sonar View (3/5 width) */}
        <div className="xl:col-span-3 grid grid-rows-[1fr_auto] gap-4">
          {/* Sonar Ping Animation */}
          <div className="relative rounded-2xl bg-slate-950/70 border border-cyan-500/20 overflow-hidden"
            style={{ minHeight: 240 }}>
            <div className="absolute inset-0 bg-acoustic-dots opacity-30" />
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-slate-950/80 border border-cyan-500/25 text-[10px] font-mono text-cyan-300">
              <Radio className="w-3 h-3 animate-pulse" />
              ACOUSTIC BEAM · Visakhapatnam Bay
            </div>
            <SonarPingCanvas />
          </div>

          {/* Waterfall Sonar Strip */}
          <div className="relative rounded-2xl bg-slate-950/80 border border-blue-500/20 overflow-hidden"
            style={{ height: 120 }}>
            <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-slate-950/80 border border-blue-500/25 text-[10px] font-mono text-blue-300">
              <Eye className="w-3 h-3" />
              WATERFALL SWATH · Real-time SSS Output
            </div>
            <div className="absolute bottom-2 right-3 z-10 flex gap-3 text-[9px] font-mono">
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2 h-2 rounded-sm bg-purple-500" /> GN
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-sm bg-amber-500" /> DB
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-sm bg-blue-500" /> PP
              </span>
            </div>
            <WaterfallStrip />
          </div>
        </div>

        {/* Right: Pipeline Steps (2/5 width) */}
        <div className="xl:col-span-2 flex flex-col gap-3">
          {steps.map((s, i) => (
            <PipelineStep
              key={i}
              {...s}
              active={activeStep === i}
            />
          ))}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
        {[
          { label: 'Ping Frequency',   value: '410 kHz',      color: 'text-cyan-400' },
          { label: 'Swath Width',      value: '200 m',         color: 'text-teal-400' },
          { label: 'Inference Speed',  value: '< 15 ms',       color: 'text-purple-400' },
          { label: 'Detection Classes', value: '4 Classes',    color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <span className={`text-lg font-extrabold font-mono ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
