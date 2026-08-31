import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Radio, Cpu, Crosshair, Activity, Eye,
  Play, Square, RotateCcw, ChevronDown,
  MapPin, Zap, Waves, AlertTriangle,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   LOCATION DATA — 6 Indian Sea Shores with unique sonar profiles
═══════════════════════════════════════════════════════════════ */
interface ShoreLocation {
  id: string;
  name: string;
  region: string;
  coords: string;
  depth: string;
  freq: string;
  swath: string;
  seafloorType: string;
  /** Anomaly x-positions as fraction of canvas width */
  anomalyFractions: number[];
  anomalyLabels: { label: string; color: string; class: string }[];
  pingColor: string;
  beamColor: string;
}

const LOCATIONS: ShoreLocation[] = [
  {
    id: 'vizag',
    name: 'Visakhapatnam Bay',
    region: 'Bay of Bengal · Andhra Pradesh',
    coords: '17.68°N  83.21°E',
    depth: '18–65 m',
    freq: '410 kHz',
    swath: '200 m',
    seafloorType: 'Sandy-Rock Mixed',
    anomalyFractions: [0.22, 0.58, 0.76],
    anomalyLabels: [
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Debris',    color: '#F59E0B', class: 'ANTHROPOGENIC' },
      { label: 'Pipeline',  color: '#3B82F6', class: 'SUBSEA-PP' },
    ],
    pingColor: '6,182,212',
    beamColor: '6,182,212',
  },
  {
    id: 'mumbai',
    name: 'Mumbai Harbour',
    region: 'Arabian Sea · Maharashtra',
    coords: '18.92°N  72.83°E',
    depth: '8–35 m',
    freq: '300 kHz',
    swath: '150 m',
    seafloorType: 'Silt & Clay',
    anomalyFractions: [0.18, 0.44, 0.62, 0.81],
    anomalyLabels: [
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Debris',    color: '#F59E0B', class: 'ANTHROPOGENIC' },
      { label: 'Debris',    color: '#F59E0B', class: 'ANTHROPOGENIC' },
      { label: 'Anomaly',   color: '#06B6D4', class: 'SEAFLOOR-ANM' },
    ],
    pingColor: '14,165,233',
    beamColor: '14,165,233',
  },
  {
    id: 'chennai',
    name: 'Chennai Port Waters',
    region: 'Bay of Bengal · Tamil Nadu',
    coords: '13.09°N  80.29°E',
    depth: '10–45 m',
    freq: '450 kHz',
    swath: '180 m',
    seafloorType: 'Fine Sand',
    anomalyFractions: [0.3, 0.7],
    anomalyLabels: [
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Pipeline',  color: '#3B82F6', class: 'SUBSEA-PP' },
    ],
    pingColor: '20,184,166',
    beamColor: '20,184,166',
  },
  {
    id: 'kochi',
    name: 'Kochi Backwaters',
    region: 'Lakshadweep Sea · Kerala',
    coords: '9.93°N  76.27°E',
    depth: '5–22 m',
    freq: '200 kHz',
    swath: '100 m',
    seafloorType: 'Mangrove Silt',
    anomalyFractions: [0.25, 0.5, 0.72, 0.88],
    anomalyLabels: [
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Debris',    color: '#F59E0B', class: 'ANTHROPOGENIC' },
      { label: 'Anomaly',   color: '#06B6D4', class: 'SEAFLOOR-ANM' },
    ],
    pingColor: '34,197,94',
    beamColor: '34,197,94',
  },
  {
    id: 'andaman',
    name: 'Andaman Sea',
    region: 'Andaman & Nicobar Islands',
    coords: '11.74°N  92.63°E',
    depth: '30–120 m',
    freq: '120 kHz',
    swath: '400 m',
    seafloorType: 'Coral & Basalt',
    anomalyFractions: [0.35, 0.65],
    anomalyLabels: [
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Anomaly',   color: '#06B6D4', class: 'SEAFLOOR-ANM' },
    ],
    pingColor: '168,85,247',
    beamColor: '168,85,247',
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep Atoll',
    region: 'Indian Ocean · Lakshadweep',
    coords: '10.56°N  72.64°E',
    depth: '15–80 m',
    freq: '330 kHz',
    swath: '250 m',
    seafloorType: 'Coral Lagoon',
    anomalyFractions: [0.2, 0.42, 0.58, 0.75, 0.9],
    anomalyLabels: [
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Debris',    color: '#F59E0B', class: 'ANTHROPOGENIC' },
      { label: 'Ghost Net', color: '#A855F7', class: 'ALDFG' },
      { label: 'Pipeline',  color: '#3B82F6', class: 'SUBSEA-PP' },
      { label: 'Anomaly',   color: '#06B6D4', class: 'SEAFLOOR-ANM' },
    ],
    pingColor: '245,158,11',
    beamColor: '245,158,11',
  },
];

/* ═══════════════════════════════════════════════════════════════
   EVENT LOG
═══════════════════════════════════════════════════════════════ */
interface LogEntry { time: string; type: string; msg: string; color: string; }

function makeLog(loc: ShoreLocation, count: number): LogEntry[] {
  const now = new Date();
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;

  const entries: LogEntry[] = [
    { time: fmt(now), type: 'SYS', msg: `session open · ${loc.name}`, color: 'text-cyan-400' },
    { time: fmt(new Date(now.getTime()-2000)), type: 'SYS', msg: `AUV ping started · ${loc.freq}`, color: 'text-cyan-400' },
    { time: fmt(new Date(now.getTime()-4000)), type: 'SAR', msg: `swath acquired · ${loc.swath} width`, color: 'text-slate-300' },
  ];

  for (let i = 0; i < count; i++) {
    const a = loc.anomalyLabels[i % loc.anomalyLabels.length];
    const conf = (0.72 + Math.random() * 0.25).toFixed(2);
    entries.push({
      time: fmt(new Date(now.getTime() - (i + 1) * 6000)),
      type: 'DET',
      msg: `${a.class} conf ${conf} · contact ${i + 1}`,
      color: a.color === '#A855F7' ? 'text-purple-400' : a.color === '#F59E0B' ? 'text-amber-400' : a.color === '#3B82F6' ? 'text-blue-400' : 'text-cyan-400',
    });
  }
  return entries;
}

/* ═══════════════════════════════════════════════════════════════
   SONAR PING CANVAS
═══════════════════════════════════════════════════════════════ */
interface SonarPingProps { loc: ShoreLocation; running: boolean; speed: number; }

const SonarPingCanvas: React.FC<SonarPingProps> = ({ loc, running, speed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const stateRef  = useRef({ running, speed, loc });
  stateRef.current = { running, speed, loc };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const MAX_RINGS = 6;
    const rings = Array.from({ length: MAX_RINGS }, (_, i) => ({
      r: 0, delay: i * 32,
    }));
    let t = 0;

    const draw = () => {
      const { running: r, speed: sp, loc: l } = stateRef.current;
      if (!r) { animRef.current = requestAnimationFrame(draw); return; }

      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H * 0.72;
      const [pr, pg, pb] = l.pingColor.split(',').map(Number);

      ctx.clearRect(0, 0, W, H);

      // Seafloor
      const floorGrad = ctx.createLinearGradient(0, cy, 0, H);
      floorGrad.addColorStop(0, `rgba(${l.pingColor},0.07)`);
      floorGrad.addColorStop(1, `rgba(${l.pingColor},0.01)`);
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, cy, W, H - cy);

      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(W, cy);
      ctx.strokeStyle = `rgba(${l.pingColor},0.25)`;
      ctx.lineWidth = 1; ctx.setLineDash([6,8]); ctx.stroke(); ctx.setLineDash([]);

      // Ping rings
      for (let i = 0; i < MAX_RINGS; i++) {
        const age = (t - rings[i].delay + 2000) % (220 / sp);
        const rr  = age * 1.4 * sp;
        const alpha = Math.max(0, 1 - rr / (Math.min(cx, cy) * 1.35));
        if (alpha <= 0) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, Math.PI, 0);
        ctx.strokeStyle = `rgba(${l.pingColor},${(alpha * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }

      // Beam fans
      const bAlpha = 0.07 + 0.04 * Math.sin(t * 0.06);
      ctx.save(); ctx.translate(cx, cy + 12);
      [[-1, -W/2], [1, W/2]].forEach(([dir, ex]) => {
        const g = ctx.createLinearGradient(0, 0, ex as number, -90);
        g.addColorStop(0, `rgba(${l.pingColor},${bAlpha})`);
        g.addColorStop(1, `rgba(${l.pingColor},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex as number, -90);
        ctx.lineTo(ex as number, -60);
        ctx.closePath(); ctx.fill();
      });
      ctx.restore();

      // AUV body
      ctx.save(); ctx.translate(cx, cy + 12);
      ctx.fillStyle = `rgb(${l.pingColor})`;
      ctx.shadowColor = `rgb(${l.pingColor})`; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(22,0); ctx.lineTo(30,-2); ctx.lineTo(30,2); ctx.closePath(); ctx.fill();
      ctx.restore();

      // AUV label
      ctx.fillStyle = `rgba(${l.pingColor},0.9)`;
      ctx.font = '500 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AUV · SSS DRONE', cx, cy + 28);

      // Detected blobs
      l.anomalyFractions.forEach((fx, idx) => {
        const bx = fx * W;
        const by = cy - 45 - (idx % 3) * 25;
        const a = l.anomalyLabels[idx % l.anomalyLabels.length];
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.07 + bx);
        const br = 7 + 3 * pulse;
        ctx.beginPath(); ctx.arc(bx, by, br + 6, 0, Math.PI*2);
        ctx.strokeStyle = a.color + '44'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2);
        ctx.fillStyle = a.color + '77'; ctx.fill();
        ctx.strokeStyle = a.color; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - br - 4, by); ctx.lineTo(bx + br + 4, by);
        ctx.moveTo(bx, by - br - 4); ctx.lineTo(bx, by + br + 4);
        ctx.stroke();
        ctx.fillStyle = a.color;
        ctx.font = '600 8px JetBrains Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText(a.label, bx, by - br - 8);
      });

      t++; animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [loc.id]); // re-init canvas when location changes

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display:'block' }} />;
};

/* ═══════════════════════════════════════════════════════════════
   WATERFALL CANVAS
═══════════════════════════════════════════════════════════════ */
interface WaterfallProps { loc: ShoreLocation; running: boolean; speed: number; }

const WaterfallStrip: React.FC<WaterfallProps> = ({ loc, running, speed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const stateRef  = useRef({ running, speed, loc });
  stateRef.current = { running, speed, loc };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let t = 0;
    let frameSkip = 0;

    const draw = () => {
      const { running: r, speed: sp, loc: l } = stateRef.current;
      animRef.current = requestAnimationFrame(draw);
      if (!r) return;

      frameSkip++;
      if (frameSkip < Math.max(1, Math.round(2 / sp))) { frameSkip = 0; return; }
      frameSkip = 0;

      const W = canvas.width, H = canvas.height;
      const APOS = l.anomalyFractions.map(f => Math.floor(f * W));

      // Shift down
      const imgData = ctx.getImageData(0, 0, W, H);
      const newData = new Uint8ClampedArray(imgData.data.length);
      newData.set(imgData.data.subarray(0, (H-1)*W*4), W*4);

      // New top row
      const [pr, pg, pb] = l.pingColor.split(',').map(Number);
      for (let x = 0; x < W; x++) {
        let v = 18 + Math.random() * 30;
        const cx = W / 2, dist = Math.abs(x - cx);
        if (dist < 8)  v = 200 + Math.random() * 50;
        else if (dist < 22) v = 110 + Math.random() * 60;
        APOS.forEach(ax => { if (Math.abs(x - ax) < 13) v = 155 + Math.random() * 90; });
        v = Math.min(255, v);
        const factor = v / 255;
        const idx = x * 4;
        newData[idx]   = Math.floor(pr * factor * 0.15);
        newData[idx+1] = Math.floor(pg * factor * 0.85);
        newData[idx+2] = Math.floor(pb * factor * 0.95);
        newData[idx+3] = 255;
      }
      ctx.putImageData(new ImageData(newData, W, H), 0, 0);

      // Bounding boxes
      l.anomalyFractions.forEach((fx, i) => {
        const ax = Math.floor(fx * W);
        const a  = l.anomalyLabels[i % l.anomalyLabels.length];
        const pa = 0.55 + 0.45 * Math.sin(t * 0.1 + i);
        ctx.globalAlpha = pa;
        ctx.strokeStyle = a.color; ctx.lineWidth = 1.2;
        ctx.strokeRect(ax - 14, 28, 28, 38);
        ctx.font = '700 7px JetBrains Mono, monospace';
        ctx.fillStyle = a.color;
        ctx.fillText(a.label.slice(0,2).toUpperCase(), ax - 10, 26);
        ctx.globalAlpha = 1;
      });

      // sweep bar
      ctx.fillStyle = `rgba(${l.pingColor},0.3)`;
      ctx.fillRect(0, 0, W, 2);

      t++;
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [loc.id]);

  return (
    <canvas ref={canvasRef} className="w-full h-full"
      style={{ display:'block', imageRendering:'pixelated' }} />
  );
};

/* ═══════════════════════════════════════════════════════════════
   LOCATION SELECTOR DROPDOWN
═══════════════════════════════════════════════════════════════ */
interface LocDropProps { value: ShoreLocation; onChange: (l: ShoreLocation) => void; }
const LocationDropdown: React.FC<LocDropProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90
          border border-cyan-500/30 hover:border-cyan-400/60 text-slate-100
          text-xs font-mono font-bold transition-all min-w-[180px] justify-between"
      >
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-cyan-400" />
          {value.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 rounded-2xl
          bg-[#07101F] border border-cyan-500/25 shadow-2xl shadow-black/60 overflow-hidden">
          {LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => { onChange(loc); setOpen(false); }}
              className={`w-full flex flex-col items-start px-4 py-2.5 text-left transition-colors
                hover:bg-cyan-950/40
                ${loc.id === value.id ? 'bg-cyan-900/30 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'}`}
            >
              <span className={`text-xs font-mono font-bold ${loc.id === value.id ? 'text-cyan-300' : 'text-slate-200'}`}>
                {loc.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{loc.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PIPELINE STEP
═══════════════════════════════════════════════════════════════ */
interface StepProps {
  step: number; icon: React.ComponentType<{ className?: string }>;
  title: string; detail: string; color: string; active?: boolean;
}
const PipelineStep: React.FC<StepProps> = ({ step, icon: Icon, title, detail, color, active }) => {
  const colorMap: Record<string, string> = {
    cyan:   'border-cyan-500/50 bg-cyan-500/10 shadow-cyan-500/10',
    teal:   'border-teal-500/50 bg-teal-500/10 shadow-teal-500/10',
    blue:   'border-blue-500/50 bg-blue-500/10 shadow-blue-500/10',
    purple: 'border-purple-500/50 bg-purple-500/10 shadow-purple-500/10',
    amber:  'border-amber-500/50 bg-amber-500/10 shadow-amber-500/10',
  };
  const iconMap: Record<string, string> = {
    cyan:'text-cyan-400', teal:'text-teal-400', blue:'text-blue-400',
    purple:'text-purple-400', amber:'text-amber-400',
  };
  const labelMap: Record<string, string> = {
    cyan:'text-cyan-400', teal:'text-teal-400', blue:'text-blue-400',
    purple:'text-purple-400', amber:'text-amber-400',
  };
  return (
    <div className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all
      ${active ? `${colorMap[color]} shadow-md` : 'border-slate-800/50 bg-slate-950/30'}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
        ${active ? '' : 'bg-slate-900/60'} border border-slate-700/30`}>
        <Icon className={`w-4.5 h-4.5 ${active ? iconMap[color] : 'text-slate-600'}`} />
      </div>
      <div className="min-w-0">
        <span className={`text-[9px] font-mono font-black tracking-widest uppercase
          ${active ? labelMap[color] : 'text-slate-700'}`}>STEP {step}</span>
        <p className={`text-[11px] font-bold leading-tight ${active ? 'text-slate-100' : 'text-slate-600'}`}>
          {title}
        </p>
        <p className={`text-[10px] leading-snug truncate ${active ? 'text-slate-400' : 'text-slate-700'}`}>
          {detail}
        </p>
      </div>
      {active && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 animate-pulse" />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export const MarineDriveVisualization: React.FC = () => {
  const [loc, setLoc]           = useState<ShoreLocation>(LOCATIONS[0]);
  const [running, setRunning]   = useState(false);
  const [speed, setSpeed]       = useState(1);
  const [activeStep, setStep]   = useState(0);
  const [logKey, setLogKey]     = useState(0);
  const [elapsed, setElapsed]   = useState(0);       // seconds since start
  const [contacts, setContacts] = useState(0);
  const [log, setLog]           = useState<LogEntry[]>([]);
  const stepRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── step auto-cycle (only while running)
  useEffect(() => {
    if (stepRef.current) clearInterval(stepRef.current);
    if (!running) return;
    stepRef.current = setInterval(() => {
      setStep(s => (s + 1) % 5);
    }, Math.max(400, 2000 / speed));
    return () => { if (stepRef.current) clearInterval(stepRef.current); };
  }, [running, speed]);

  // ── wall-clock tick
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!running) return;
    tickRef.current = setInterval(() => {
      setElapsed(e => e + 1);
      // occasionally add a new detection to the log
      if (Math.random() < 0.35) {
        const idx = Math.floor(Math.random() * loc.anomalyLabels.length);
        const a   = loc.anomalyLabels[idx];
        const conf = (0.70 + Math.random() * 0.28).toFixed(2);
        const now  = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        setContacts(c => c + 1);
        setLog(prev => [{
          time: timeStr, type: 'DET',
          msg: `${a.class} conf ${conf} · new contact`,
          color: a.color === '#A855F7' ? 'text-purple-400'
               : a.color === '#F59E0B' ? 'text-amber-400'
               : a.color === '#3B82F6' ? 'text-blue-400' : 'text-cyan-400',
        }, ...prev.slice(0, 19)]);
      }
    }, 1000 / speed);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running, speed, loc]);

  const handleStart = useCallback(() => {
    setRunning(true);
    const init = makeLog(loc, loc.anomalyLabels.length);
    setLog(init);
    setContacts(loc.anomalyLabels.length);
  }, [loc]);

  const handleStop  = useCallback(() => setRunning(false), []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setContacts(0);
    setLog([]);
    setStep(0);
    setLogKey(k => k + 1);
  }, []);

  const handleLocChange = useCallback((newLoc: ShoreLocation) => {
    handleReset();
    setLoc(newLoc);
  }, [handleReset]);

  const fmtElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    return `T+${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  };

  const steps: Omit<StepProps, 'active'>[] = [
    { step:1, icon:Radio,     title:'AUV Acoustic Emission',   detail:`${loc.freq} side-scan transducer pings`,   color:'cyan' },
    { step:2, icon:Activity,  title:'Echo Return Capture',     detail:'Time-of-flight backscatter columns',        color:'teal' },
    { step:3, icon:Eye,       title:'Waterfall Image Formation',detail:'16-bit SSS tiles rendered from amplitude', color:'blue' },
    { step:4, icon:Cpu,       title:'YOLOv8n ONNX Inference',  detail:'Edge AI: Ghost Nets, Debris, Pipeline',    color:'purple'},
    { step:5, icon:Crosshair, title:'Target Geo-Tagging',      detail:'Projected to GPS → MoES dashboard',        color:'amber' },
  ];

  return (
    <div className="rounded-3xl glass-panel overflow-hidden">

      {/* ── TOP CONTROL BAR (SLICKLINE-style) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3
        bg-[#050C1A]/90 border-b border-cyan-500/15">

        {/* Left: title + badge */}
        <div className="flex items-center gap-3">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <span className="text-xs font-mono font-extrabold text-slate-100 uppercase tracking-widest">
            MARINE DRIVE
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30
            text-cyan-300 text-[10px] font-mono font-bold">SIH DEMO</span>
          <span className="hidden sm:block text-[10px] font-mono text-slate-500">
            // ANALYSIS NODE 02 · link ok
          </span>
        </div>

        {/* Centre: location selector */}
        <LocationDropdown value={loc} onChange={handleLocChange} />

        {/* Right: status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono shrink-0
          ${running
            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
            : 'bg-slate-800/60 border border-slate-700/40 text-slate-500'}`}>
          <span className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          {running ? 'PIPELINE LIVE' : 'STANDBY'}
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-5">

        {/* ── LOCATION INFO STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label:'REGION',   value: loc.region.split('·')[0].trim() },
            { label:'COORDS',   value: loc.coords },
            { label:'DEPTH',    value: loc.depth },
            { label:'FREQ',     value: loc.freq },
            { label:'SWATH',    value: loc.swath },
            { label:'SEAFLOOR', value: loc.seafloorType },
          ].map(({ label, value }) => (
            <div key={label} className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/40">
              <p className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-600">{label}</p>
              <p className="text-[11px] font-mono font-bold text-slate-200 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* ── MAIN 3-COLUMN GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Sonar Ping (5/12) */}
          <div className="xl:col-span-5 flex flex-col gap-3">
            <div className="relative rounded-2xl bg-slate-950/80 border border-cyan-500/20 overflow-hidden"
              style={{ minHeight: 220 }}>
              <div className="absolute inset-0 bg-acoustic-dots opacity-20 pointer-events-none" />
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                bg-slate-950/80 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                <Radio className="w-3 h-3 animate-pulse" />
                ACOUSTIC BEAM · {loc.name}
              </div>
              {!running && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <Waves className="w-8 h-8 opacity-40" />
                    <span className="text-[11px] font-mono uppercase tracking-widest opacity-60">Press START</span>
                  </div>
                </div>
              )}
              <SonarPingCanvas key={loc.id} loc={loc} running={running} speed={speed} />
            </div>

            {/* Waterfall */}
            <div className="relative rounded-2xl bg-slate-950/90 border border-blue-500/20 overflow-hidden"
              style={{ height: 110 }}>
              <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full
                bg-slate-950/80 border border-blue-500/20 text-[10px] font-mono text-blue-300">
                <Eye className="w-3 h-3" />
                WATERFALL SWATH
              </div>
              <div className="absolute bottom-2 right-3 z-10 flex gap-2 text-[9px] font-mono">
                {[['GN','#A855F7','text-purple-400'],['DB','#F59E0B','text-amber-400'],['PP','#3B82F6','text-blue-400']].map(([k,c,tc]) => (
                  <span key={k} className={`flex items-center gap-1 ${tc}`}>
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: c as string }} /> {k}
                  </span>
                ))}
              </div>
              <WaterfallStrip key={`wf-${loc.id}`} loc={loc} running={running} speed={speed} />
            </div>
          </div>

          {/* Pipeline Steps (4/12) */}
          <div className="xl:col-span-4 flex flex-col gap-2">
            {steps.map((s, i) => (
              <PipelineStep key={i} {...s} active={running && activeStep === i} />
            ))}
          </div>

          {/* Event Log (3/12) */}
          <div className="xl:col-span-3 flex flex-col rounded-2xl bg-slate-950/70 border border-slate-800/50 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Event Log</span>
              <span className="text-[10px] font-mono text-cyan-400">{contacts} contacts</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ maxHeight: 310 }}>
              {log.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-700 uppercase">awaiting mission start</span>
                </div>
              ) : log.map((entry, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] font-mono leading-snug">
                  <span className="text-slate-600 shrink-0">{entry.time}</span>
                  <span className={`font-bold shrink-0 ${
                    entry.type === 'SYS' ? 'text-cyan-500'
                    : entry.type === 'DET' ? 'text-emerald-500'
                    : 'text-slate-500'}`}>{entry.type}</span>
                  <span className={`${entry.color} leading-tight`}>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TIMELINE / CONTROLS BAR (SLICKLINE-style) ── */}
        <div className="flex items-center justify-between flex-wrap gap-3
          px-4 py-3 rounded-2xl bg-[#050C1A]/80 border border-slate-800/60">

          {/* Left: play controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-1">TIMELINE</span>

            {!running ? (
              <button onClick={handleStart}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-emerald-500/15 border border-emerald-500/40 text-emerald-300
                  hover:bg-emerald-500/25 text-xs font-mono font-bold transition-all active:scale-95">
                <Play className="w-3.5 h-3.5" /> START
              </button>
            ) : (
              <button onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-red-500/15 border border-red-500/40 text-red-300
                  hover:bg-red-500/25 text-xs font-mono font-bold transition-all active:scale-95">
                <Square className="w-3.5 h-3.5" /> STOP
              </button>
            )}

            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-slate-800/60 border border-slate-700/40 text-slate-400
                hover:text-slate-200 hover:border-slate-500 text-xs font-mono font-bold transition-all active:scale-95">
              <RotateCcw className="w-3.5 h-3.5" /> RESET
            </button>
          </div>

          {/* Centre: speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 mr-1">SPEED</span>
            {[1, 4, 12].map(s => (
              <button key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all
                  ${speed === s
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900/60 border border-slate-700/40 text-slate-500 hover:text-slate-300'}`}>
                {s}×
              </button>
            ))}
          </div>

          {/* Right: telemetry readout */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-500">
              {running ? fmtElapsed(elapsed) : 'T+00:00'}
            </span>
            <span className="text-cyan-400">
              {running ? `FORECAST T+${String(Math.floor(elapsed/60 + 1)).padStart(2,'0')}h` : 'STANDBY'}
            </span>
            <span className="text-slate-400">
              surface {loc.swath} · contacts {contacts}
            </span>
          </div>
        </div>

        {/* ── BOTTOM STATS BAR ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800/50">
          {[
            { label:'Ping Frequency',    value: loc.freq,          color:'text-cyan-400' },
            { label:'Swath Width',       value: loc.swath,          color:'text-teal-400' },
            { label:'Inference Speed',   value:'< 15 ms',           color:'text-purple-400' },
            { label:'Total Contacts',    value: String(contacts),   color:'text-amber-400' },
          ].map(stat => (
            <div key={stat.label}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-950/50 border border-slate-800/40">
              <span className={`text-lg font-extrabold font-mono ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wide text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
