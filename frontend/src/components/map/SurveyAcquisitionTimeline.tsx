import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio } from 'lucide-react';

const TOTAL_PINGS = 80829;
const TRACKLINES = [
  { id: 'TRK-01', label: 'LINE-01 N SWATH',   pStart: 0,     pEnd: 21000, targets: 4,  color: '#38BDF8', heading: '178°' },
  { id: 'TRK-02', label: 'LINE-02 CTR SWATH',  pStart: 21001, pEnd: 45000, targets: 4,  color: '#00F5D4', heading: '178°' },
  { id: 'TRK-03', label: 'LINE-03 S SHOAL',    pStart: 45001, pEnd: 68000, targets: 4,  color: '#38BDF8', heading: '358°' },
  { id: 'TRK-04', label: 'LINE-04 E TRENCH',   pStart: 68001, pEnd: 80829, targets: 5,  color: '#00F5D4', heading: '178°' },
];

// Ghost detections mapped to ping positions along the survey
const PING_EVENTS = [
  { ping:  8400,  label: 'SX-T04',  type: 'Ghost Net',      color: '#00F5D4', conf: 91.2 },
  { ping: 14200,  label: 'SX-T01',  type: 'Pipeline',       color: '#EF4444', conf: 88.4 },
  { ping: 26800,  label: 'SX-T07',  type: 'Ghost Net ★',    color: '#FFB703', conf: 94.7 },
  { ping: 33400,  label: 'SX-T02',  type: 'Marine Debris',  color: '#F59E0B', conf: 82.3 },
  { ping: 44100,  label: 'SX-T12',  type: 'Anomaly',        color: '#818CF8', conf: 76.1 },
  { ping: 51000,  label: 'SX-T08',  type: 'Ghost Net',      color: '#00F5D4', conf: 88.9 },
  { ping: 58600,  label: 'SX-T05',  type: 'Pipeline',       color: '#EF4444', conf: 85.0 },
  { ping: 65200,  label: 'SX-T03',  type: 'Marine Debris',  color: '#F59E0B', conf: 79.6 },
  { ping: 70400,  label: 'SX-T09',  type: 'Anomaly',        color: '#818CF8', conf: 68.3 },
  { ping: 75900,  label: 'SX-T11',  type: 'Marine Debris',  color: '#F59E0B', conf: 73.1 },
];

interface Props {
  className?: string;
}

export const SurveyAcquisitionTimeline: React.FC<Props> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPing, setCurrentPing] = useState(26800);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 4 | 12>(1);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  // Tick playback
  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(rafRef.current); lastTsRef.current = 0; return; }
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setCurrentPing(prev => {
        const next = prev + (dt / 1000) * speed * 800;
        if (next >= TOTAL_PINGS) { setIsPlaying(false); return TOTAL_PINGS; }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, speed]);

  // Draw the SAR-style acquisition bar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Dark background
    ctx.fillStyle = '#030811';
    ctx.fillRect(0, 0, W, H);

    // Track line segments with completion fill
    TRACKLINES.forEach(track => {
      const x1 = (track.pStart / TOTAL_PINGS) * W;
      const x2 = (track.pEnd   / TOTAL_PINGS) * W;
      const cx  = (currentPing  / TOTAL_PINGS) * W;
      const midY = H / 2;

      // Full extent (dim)
      ctx.fillStyle = `${track.color}18`;
      ctx.fillRect(x1, midY - 6, x2 - x1, 12);

      // Completed portion (bright)
      const filledEnd = Math.min(cx, x2);
      if (filledEnd > x1) {
        const grad = ctx.createLinearGradient(x1, 0, filledEnd, 0);
        grad.addColorStop(0, `${track.color}40`);
        grad.addColorStop(1, `${track.color}B0`);
        ctx.fillStyle = grad;
        ctx.fillRect(x1, midY - 6, filledEnd - x1, 12);
      }

      // Track boundary lines
      ctx.strokeStyle = `${track.color}60`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x2, midY - 9);
      ctx.lineTo(x2, midY + 9);
      ctx.stroke();
    });

    // Trackline tick labels
    TRACKLINES.forEach(track => {
      const xMid = ((track.pStart + track.pEnd) / 2 / TOTAL_PINGS) * W;
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText(track.id, xMid, H - 3);
    });

    // Detection event markers (vertical sticks)
    PING_EVENTS.forEach(ev => {
      const ex = (ev.ping / TOTAL_PINGS) * W;
      const midY = H / 2;
      const alpha = currentPing >= ev.ping ? 1 : 0.2;

      // Vertical line
      ctx.strokeStyle = `${ev.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ex, 2);
      ctx.lineTo(ex, midY - 6);
      ctx.stroke();

      // Event dot
      ctx.fillStyle = `${ev.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(ex, 6, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Current ping cursor
    const cx = (currentPing / TOTAL_PINGS) * W;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cursor glow dot
    ctx.fillStyle = '#FFB703';
    ctx.shadowColor = '#FFB703';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, H / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [currentPing]);

  const pingProgress = (currentPing / TOTAL_PINGS) * 100;
  const activeTrk = TRACKLINES.find(t => currentPing >= t.pStart && currentPing <= t.pEnd);
  const nearestEvent = [...PING_EVENTS].sort((a, b) =>
    Math.abs(a.ping - currentPing) - Math.abs(b.ping - currentPing)
  )[0];

  return (
    <div className={`bg-[#030811] border-t border-[#0F1E2E] shrink-0 font-mono select-none ${className}`}>
      {/* Top control bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-[#0F1E2E]">
        {/* Title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Radio className="w-3 h-3 text-[#FFB703]" />
          <span className="text-[9px] font-black text-[#FFB703] tracking-widest uppercase">
            PING ACQUISITION
          </span>
        </div>

        <span className="text-[#1E293B]">·</span>

        {/* Trackline info */}
        {activeTrk && (
          <span className="text-[8px] text-[#38BDF8] font-bold">
            {activeTrk.label}  HDG {activeTrk.heading}
          </span>
        )}

        <div className="flex-1" />

        {/* Detection callout */}
        {Math.abs(nearestEvent.ping - currentPing) < 2500 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[7.5px] font-bold"
            style={{
              borderColor: `${nearestEvent.color}50`,
              background: `${nearestEvent.color}10`,
              color: nearestEvent.color,
            }}>
            ▶ {nearestEvent.label} · {nearestEvent.type} · {nearestEvent.conf}%
          </div>
        )}

        {/* Speed buttons */}
        <div className="flex items-center gap-0.5">
          {([1, 4, 12] as const).map(s => (
            <button key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 text-[8px] font-black rounded cursor-pointer transition-colors ${
                speed === s
                  ? 'bg-[#FFB703] text-[#030811]'
                  : 'text-[#475569] hover:text-[#94A3B8] bg-[#0F1E2E]'
              }`}
            >{s}X</button>
          ))}
        </div>

        {/* Play controls */}
        <button onClick={() => setCurrentPing(0)} className="text-[#475569] hover:text-[#94A3B8] cursor-pointer transition-colors">
          <SkipBack className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsPlaying(p => !p)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-bold cursor-pointer transition-all ${
            isPlaying
              ? 'bg-[#FFB703]/20 border-[#FFB703] text-[#FFB703]'
              : 'bg-[#0F1E2E] border-[#1E293B] text-[#E2E8F0] hover:text-[#FFB703]'
          }`}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>
        <button onClick={() => setCurrentPing(TOTAL_PINGS)} className="text-[#475569] hover:text-[#94A3B8] cursor-pointer transition-colors">
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Acquisition canvas */}
      <div className="relative px-3 py-1">
        <canvas
          ref={canvasRef}
          width={1200}
          height={52}
          className="w-full h-[52px] cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const frac = (e.clientX - rect.left) / rect.width;
            setCurrentPing(frac * TOTAL_PINGS);
          }}
        />
      </div>

      {/* Footer info strip */}
      <div className="flex items-center gap-4 px-3 py-0.5 text-[7.5px] text-[#334155] border-t border-[#0A1520]">
        <span>HINDCAST ORIGIN −72H</span>
        <span className="flex-1 text-center text-[#1E3A4A]">SAR ACQUISITION 6H</span>
        <span>
          PING <strong className="text-[#64748B]">{Math.floor(currentPing).toLocaleString()}</strong>
          {' '}/ {TOTAL_PINGS.toLocaleString()}
          {' '}· {pingProgress.toFixed(1)}% COMPLETE
        </span>
      </div>
    </div>
  );
};
