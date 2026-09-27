import { useEffect, useMemo, useRef } from 'react';
import { Check } from 'lucide-react';
import { gsap, useAct, drive, spacer } from '../scroll';
import { playSfx } from '../Hud';
import { drawRows, fitCanvas, pixelToLatLon, FILTER_OFF, WIN, SH, SW, PX_PER_M, type Cand, type Swath } from '../swath';
import { ALT_M, CLASSES, EVIDENCE, EXPECTED_SHADOW_M, GROUND_M, HERO, MISSION, MODEL, type ClassKey } from '../story';
import ElectricBorder from '../bits/ElectricBorder';

const CYAN = '#38BDF8', ROSE = '#F43F5E', EMERALD = '#10B981', AMBER = '#FFB703';
const LOG_STEP = 64;
const pad2 = (n: number) => String(n).padStart(2, '0');

function Crop({ sw, c, title }: { sw: Swath; c: Cand; title: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const S = 128, cx = c.x + c.w / 2, cy = c.y + c.h / 2, x0 = cx - S / 2, y0 = cy - S / 2;
  useEffect(() => {
    const cv = ref.current!;
    cv.width = 512; cv.height = 512;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sw.clean, x0, y0, S, S, 0, 0, 512, 512);
  }, []);
  const far = c.side > 0 ? c.x + c.w - 5 : c.x + 5;
  const len = Math.max(12, (c.real ? c.expectedShadowM : (0.5 * c.groundM) / (ALT_M - 0.5)) * PX_PER_M);
  const sx = c.side > 0 ? far : far - len;
  const nadirX = c.side > 0 ? x0 : x0 + S; // sound arrives from the nadir side
  const voidDepth = Math.max(0, 1 - c.shadowRatio);
  const ok = c.real;
  return (
    <div className={`crop crop-${c.id} panel absolute top-[16vh] w-[31vh] overflow-hidden`} style={{ [c.side < 0 ? 'right' : 'left']: 'calc(50% + 1vh)' }}>
      <div className="panel-title"><span className="hud-label text-white/80">{title}</span><span className="hud-label text-white/40">#{pad2(c.id)}</span></div>
      <div className="relative aspect-square">
        <canvas ref={ref} className="absolute inset-0 h-full w-full" />
        <svg className="absolute inset-0 h-full w-full" viewBox={`${x0} ${y0} ${S} ${S}`}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke={CYAN} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path className="crop-ray" d={`M${nadirX} ${cy - 6} L${far} ${cy - 6} L${far + c.side * len * 1.4} ${cy + 10}`} fill="none" stroke={AMBER} strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          <rect className="crop-shadow" x={sx} y={c.y + c.h * 0.2} width={len} height={c.h * 0.6} fill={ok ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)'} stroke={ok ? EMERALD : ROSE} strokeDasharray="3 3" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="hud-label absolute left-2 top-2 text-[#FFB703]/90">{c.side < 0 ? '→ nadir' : 'nadir ←'}</span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between"><span className="hud-label text-white/50">Shadow void</span><span className="mono tnum text-xs text-white/80"><b className="crop-val font-normal">0</b>%</span></div>
        <div className="relative h-1.5 rounded bg-white/10">
          <div className="crop-bar h-full origin-left rounded" style={{ width: `${voidDepth * 100}%`, background: ok ? EMERALD : ROSE, transform: 'scaleX(0)' }} data-v={Math.round(voidDepth * 100)} />
          <span className="absolute -top-1 left-1/2 h-3.5 w-px bg-white/50" />
        </div>
        <span className="crop-verdict hud-label self-start rounded px-2 py-1" style={{ color: ok ? EMERALD : ROSE, background: ok ? 'rgba(16,185,129,.12)' : 'rgba(244,63,94,.12)' }}>
          {ok ? 'Shadow verified ✓ keep' : 'No shadow void ✕ reject'}
        </span>
      </div>
    </div>
  );
}

export default function ActConsole({ sw }: { sw: Swath }) {
  const rawC = useRef<HTMLCanvasElement>(null), cleanC = useRef<HTMLCanvasElement>(null), heroC = useRef<HTMLCanvasElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef({ off: 0 });
  const cands = sw.cands, hero = sw.hero, rock = sw.rock;
  const verified = useMemo(() => cands.filter((c) => c.real), [cands]);
  const rejected = useMemo(() => cands.filter((c) => !c.real), [cands]);
  const log = useMemo(() => Array.from({ length: Math.ceil(SH / LOG_STEP) + 1 }, (_, i) => {
    const row = i * LOG_STEP, p = pixelToLatLon(SW / 2, row);
    const t = new Date(MISSION.clockStart - row * 100);
    return { t: `${pad2(t.getUTCHours())}:${pad2(t.getUTCMinutes())}:${pad2(t.getUTCSeconds())}`, lat: p.lat.toFixed(5), lon: p.lon.toFixed(5), alt: (ALT_M + 0.3 * Math.sin(row / 300)).toFixed(1), dep: (HERO.depth + 0.6 * Math.sin(row / 500)).toFixed(1) };
  }), []);

  const paint = () => {
    const off = view.current.off;
    for (const c of [rawC.current, cleanC.current]) if (c) drawRows(c.getContext('2d')!, c === rawC.current ? sw.raw : sw.clean, off);
    svg.current?.setAttribute('viewBox', `0 ${off} 1024 ${WIN}`);
    const logEl = document.querySelector<HTMLElement>('.log-rows');
    if (logEl) logEl.style.transform = `translateY(${-(off / LOG_STEP) * 22}px)`;
  };
  useEffect(() => {
    const cv = heroC.current!;
    cv.width = 320; cv.height = 320;
    const ctx = cv.getContext('2d')!;
    ctx.drawImage(sw.clean, hero.x + hero.w / 2 - 80, hero.y + hero.h / 2 - 80, 160, 160, 0, 0, 320, 320);
    const onResize = () => { fitCanvas(rawC.current!); fitCanvas(cleanC.current!); paint(); };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const ref = useAct('console', (tl, root) => {
    const q = gsap.utils.selector(root);
    const boxes = new Map(cands.map((c) => [c.id, root.querySelector<SVGGElement>(`.bx-${c.id}`)!]));
    const inner = new Map(cands.map((c) => [c.id, root.querySelector<SVGGElement>(`.bx-${c.id} .bx-in`)!]));
    const labels = new Map(cands.map((c) => [c.id, root.querySelector<SVGTextElement>(`.bx-${c.id} text`)!]));
    const setCount = (sel: string, n: number) => { const el = root.querySelector(sel); if (el) el.textContent = pad2(Math.round(n)); };

    gsap.set(q('.cs-left, .cs-right'), { autoAlpha: 0, x: (i) => (i ? 40 : -40) });
    gsap.set(q('.cs-box'), { autoAlpha: 0, scale: 0.96 });
    gsap.set(q('.cs-card'), { autoAlpha: 0 });
    gsap.set(q('.cs-card-ingest'), { autoAlpha: 1 });
    gsap.set(q('.cs-clean'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(q('.cs-wipe, .cs-scan, .cs-grid, .cs-veil, .crop, .cs-formula, .cs-dots i, .cs-hero, .cs-pin'), { autoAlpha: 0 });
    gsap.set(q('.cs-grid line'), { drawSVG: '0%' });
    gsap.set(q('.chk'), { autoAlpha: 0.25 });
    gsap.set(q('.crop-ray'), { drawSVG: '0%' });
    gsap.set(q('.crop-shadow, .crop-verdict'), { autoAlpha: 0 });
    gsap.set(q('.ev-bar'), { scaleX: 0 });
    gsap.set(q('.cls-bar'), { scaleX: 0 });
    cands.forEach((c) => gsap.set(inner.get(c.id)!, { autoAlpha: 0, scale: 1.25, transformOrigin: '50% 50%' }));
    const setOff = (o: number) => { view.current.off = o; paint(); };
    const stageTitle = (text: string, at: number) =>
      tl.to(q('.cs-stage'), { scrambleText: { text, chars: 'upperCase', speed: 0.5 }, duration: 0.2 }, at);

    // 0 – 1.5 · INGEST
    tl.to(q('.cs-box'), { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' }, 0);
    tl.to(q('.cs-left, .cs-right'), { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.35, ease: 'power3.out' }, 0.1);
    drive(tl, 0.6, 0.9, (p) => setOff(p * 400), 'power1.inOut');
    // 1.5 – 3.5 · PREPROCESS
    stageTitle('02 · Preprocess', 1.5);
    tl.to(q('.cs-card-ingest'), { autoAlpha: 0, duration: 0.1 }, 1.5);
    tl.to(q('.cs-card-pre'), { autoAlpha: 1, duration: 0.15 }, 1.55);
    tl.to(q('.cs-scan'), { autoAlpha: 1, duration: 0.05 }, 1.85);
    tl.fromTo(q('.cs-scan'), { left: '0%' }, { left: '100%', duration: 1.2, ease: 'power1.inOut' }, 1.9);
    tl.to(q('.cs-clean'), { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power1.inOut' }, 1.9);
    q('.chk').forEach((el: Element, i: number) => { tl.to(el, { autoAlpha: 1, duration: 0.05 }, 2.05 + i * 0.28); tl.call(() => playSfx('tick'), [], 2.05 + i * 0.28); });
    const snr = { v: 0 };
    tl.to(snr, { v: 14.2, duration: 1.2, onUpdate: () => { const el = root.querySelector('.snr'); if (el) el.textContent = `+${snr.v.toFixed(1)}`; } }, 1.9);
    tl.to(q('.cs-scan'), { autoAlpha: 0, duration: 0.05 }, 3.1);
    tl.to(q('.cs-ready'), { autoAlpha: 1, duration: 0.1 }, 3.1);
    // 3.5 – 6.0 · AI DETECTION
    stageTitle('03 · AI detection', 3.5);
    tl.to(q('.cs-ready'), { autoAlpha: 0, duration: 0.1 }, 3.5);
    tl.to(q('.cs-card-pre'), { autoAlpha: 0, duration: 0.1 }, 3.5);
    tl.to(q('.cs-card-det'), { autoAlpha: 1, duration: 0.15 }, 3.55);
    tl.to(q('.cs-grid'), { autoAlpha: 1, duration: 0.05 }, 3.55);
    tl.to(q('.cs-grid line'), { drawSVG: '100%', stagger: 0.03, duration: 0.25 }, 3.55);
    drive(tl, 3.5, 0.4, (p) => setOff(400 * (1 - p)), 'power2.inOut');
    let lastT = 0;
    drive(tl, 3.9, 1.5, (p) => {
      const T = p * SH;
      const off = Math.min(SH - WIN, Math.max(0, T - 0.55 * WIN));
      setOff(off);
      const scan = root.querySelector<HTMLElement>('.cs-scanline');
      if (scan) { scan.style.top = `${((T - off) / WIN) * 100}%`; scan.style.opacity = p > 0 && p < 1 ? '1' : '0'; }
      let n = 0;
      for (const c of cands) {
        const k = Math.min(1, Math.max(0, (T - c.y) / 40));
        if (k > 0) n++;
        if (k > 0 && lastT <= c.y && T > c.y) playSfx('lock', 70);
        gsap.set(inner.get(c.id)!, { autoAlpha: k, scale: 1.25 - 0.25 * k });
      }
      lastT = T;
      setCount('.n-cand', n);
      const ms = root.querySelector('.inf-ms');
      if (ms) ms.textContent = (p * (SH / 640) * 2 * MODEL.cpuMs).toFixed(0);
    });
    drive(tl, 5.4, 0.55, (p) => setOff(SH - WIN - p * (SH - WIN - FILTER_OFF)), 'power2.inOut');
    tl.to(q('.cs-grid'), { autoAlpha: 0, duration: 0.15 }, 5.4);
    // 6.0 – 9.0 · ACOUSTIC FILTER
    stageTitle('04 · Acoustic filter', 6.0);
    tl.to(q('.cs-card-det'), { autoAlpha: 0, duration: 0.1 }, 6.0);
    tl.to(q('.cs-card-filter'), { autoAlpha: 1, duration: 0.15 }, 6.05);
    tl.to(q('.cs-veil'), { autoAlpha: 1, duration: 0.2 }, 6.0);
    tl.fromTo(q('.crop'), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.3, ease: 'power3.out' }, 6.05);
    tl.to(q('.crop-ray'), { drawSVG: '100%', duration: 0.3 }, 6.6);
    tl.to(q('.crop-shadow'), { autoAlpha: 1, duration: 0.15 }, 6.85);
    q('.crop-bar').forEach((bar: Element) => {
      const v = Number((bar as HTMLElement).dataset.v), val = bar.closest('.crop')!.querySelector('.crop-val')!;
      const o = { p: 0 };
      tl.to(bar, { scaleX: 1, duration: 0.35 }, 7.0);
      tl.to(o, { p: 1, duration: 0.35, onUpdate: () => { val.textContent = String(Math.round(o.p * v)); } }, 7.0);
    });
    tl.to(q('.cs-formula'), { autoAlpha: 1, y: 0, duration: 0.2 }, 6.9);
    tl.to(q('.crop-verdict'), { autoAlpha: 1, stagger: 0.08, duration: 0.1 }, 7.3);
    tl.to(q('.crop, .cs-formula, .cs-veil'), { autoAlpha: 0, duration: 0.2 }, 7.6);
    // verdicts applied to all 37
    rejected.forEach((c, i) => {
      tl.to(boxes.get(c.id)!.querySelector('rect'), { attr: { stroke: ROSE }, duration: 0.05 }, 7.65 + i * 0.01);
      tl.to(boxes.get(c.id)!, { autoAlpha: 0, scale: 1.35, transformOrigin: '50% 50%', duration: 0.18, ease: 'power2.in' }, 7.85 + i * 0.02);
    });
    verified.forEach((c, i) => tl.to(boxes.get(c.id)!.querySelector('rect'), { attr: { stroke: EMERALD }, duration: 0.05 }, 7.7 + i * 0.012));
    const cnt = { r: 0, v: 0 };
    tl.to(cnt, { r: 20, v: 17, duration: 0.55, onUpdate: () => { setCount('.n-rej', cnt.r); setCount('.n-ver', cnt.v); } }, 7.75);
    drive(tl, 8.4, 0.5, (p) => verified.forEach((c) => {
      const pct = Math.round(c.conf * 100 * p);
      labels.get(c.id)!.textContent = p === 0 ? `${CLASSES[c.cls].short} ${c.conf.toFixed(2)}` : `${CLASSES[c.cls].short} ${pct}% · ${c.conf >= 0.7 ? 'HIGH' : 'MED'}`;
    }));
    // 9.0 – 9.8 · CLASSIFY: survivors fly to their class
    stageTitle('05 · Classify', 9.0);
    tl.to(q('.cs-card-filter'), { autoAlpha: 0, duration: 0.1 }, 9.0);
    tl.to(q('.cs-card-cls'), { autoAlpha: 1, duration: 0.15 }, 9.05);
    const dotStart = (c: Cand, axis: 'x' | 'y') => {
      const b = root.querySelector('.cs-box')!.getBoundingClientRect(), s = root.getBoundingClientRect();
      return axis === 'x' ? b.left - s.left + ((c.x + c.w / 2) / 1024) * b.width : b.top - s.top + ((c.y + c.h / 2 - FILTER_OFF) / WIN) * b.height;
    };
    const dotEnd = (c: Cand, axis: 'x' | 'y') => {
      const r = root.querySelector(`.cls-${c.cls} .cls-dot`)!.getBoundingClientRect(), s = root.getBoundingClientRect();
      return axis === 'x' ? r.left - s.left + r.width / 2 : r.top - s.top + r.height / 2;
    };
    verified.forEach((c, i) => {
      const dot = root.querySelector(`.dot-${c.id}`)!;
      tl.fromTo(dot, { x: () => dotStart(c, 'x'), y: () => dotStart(c, 'y'), autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 9.05 + i * 0.03);
      tl.to(dot, { x: () => dotEnd(c, 'x'), y: () => dotEnd(c, 'y'), duration: 0.35, ease: 'power2.inOut' }, 9.1 + i * 0.03);
      tl.to(dot, { autoAlpha: 0, duration: 0.05 }, 9.45 + i * 0.03);
    });
    (Object.keys(CLASSES) as ClassKey[]).forEach((k, i) => {
      const n = verified.filter((c) => c.cls === k).length, o = { v: 0 };
      tl.to(o, { v: n, duration: 0.35, onUpdate: () => { const el = root.querySelector(`.cls-${k} .cls-n`); if (el) el.textContent = pad2(Math.round(o.v)); } }, 9.4 + i * 0.04);
      tl.to(q(`.cls-${k} .cls-bar`), { scaleX: n / verified.length, duration: 0.35 }, 9.4 + i * 0.04);
    });
    verified.forEach((c) => tl.to(boxes.get(c.id)!.querySelector('rect'), { attr: { stroke: CLASSES[c.cls].color }, duration: 0.1 }, 9.3));
    // 9.8 – 11 · HERO TARGET
    stageTitle('Hero target', 9.8);
    tl.to(q('.cs-left, .cs-right'), { autoAlpha: 0.25, duration: 0.2 }, 9.8);
    tl.fromTo(q('.cs-hero'), { autoAlpha: 0, scale: 0.9, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: 'expo.out' }, 9.85);
    const gauge = { v: 0 };
    tl.to(gauge, { v: HERO.confidence, duration: 0.4, onUpdate: () => {
      const arc = root.querySelector('.gauge-arc'), txt = root.querySelector('.gauge-txt');
      arc?.setAttribute('stroke-dashoffset', String(289 * (1 - gauge.v)));
      if (txt) txt.textContent = (gauge.v * 100).toFixed(1);
    } }, 10.0);
    tl.to(q('.ev-bar'), { scaleX: 1, stagger: 0.05, duration: 0.25 }, 10.05);
    tl.fromTo(q('.hero-risk'), { autoAlpha: 0, scale: 1.4 }, { autoAlpha: 1, scale: 1, duration: 0.1, ease: 'back.out(2)' }, 10.3);
    // 10.6 – 11 · collapse into a pin → the next act starts from this exact frame
    tl.to(q('.cs-hero'), { autoAlpha: 0, scale: 0.4, duration: 0.25, ease: 'power3.in' }, 10.62);
    tl.to(q('.cs-left, .cs-right, .cs-dots'), { autoAlpha: 0, duration: 0.2 }, 10.62);
    verified.forEach((c) => c.id !== hero.id && tl.to(boxes.get(c.id)!, { autoAlpha: 0, duration: 0.15 }, 10.65));
    tl.to(boxes.get(hero.id)!, { autoAlpha: 0, duration: 0.1 }, 10.75);
    tl.to(q('.cs-pin'), { autoAlpha: 1, duration: 0.1 }, 10.75);
    tl.to(q('.cs-box .calipers'), { autoAlpha: 0, duration: 0.1 }, 10.75);
  }, 10.4);

  const pct = (x: number, y: number) => ({ left: `${(x / 1024) * 100}%`, top: `${((y - FILTER_OFF) / WIN) * 100}%` });
  const classes = Object.keys(CLASSES) as ClassKey[];

  return (
    <div ref={ref} style={spacer('console')}>
    <section className="act-layer act-console">
      {/* left: mission + ping log + counters */}
      <aside className="cs-left panel absolute left-[4.5vw] top-[13vh] flex h-[70vh] w-[calc(50%-35vh*1024/1100-4.5vw-28px)] flex-col overflow-hidden">
        <div className="panel-title"><span className="hud-label text-white/85">Mission {MISSION.id}</span><span className="hud-label flex items-center gap-1.5 text-[#10B981]"><i className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />live</span></div>
        <div className="flex flex-col gap-2 px-3 py-3">
          <span className="hud-label text-white/45">{MISSION.area} · AUV-07</span>
          <span className="chip self-start">{MISSION.file} → {MISSION.pings.toLocaleString('en-IN')} pings</span>
        </div>
        <div className="mono grid grid-cols-[1.1fr_1.2fr_1.2fr_.6fr] gap-x-2 border-y border-white/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/35">
          <span>time</span><span>lat</span><span>lon</span><span>alt</span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="log-rows mono px-3 text-[10.5px] text-white/65">
            {log.map((r, i) => (
              <div key={i} className="grid h-[22px] grid-cols-[1.1fr_1.2fr_1.2fr_.6fr] items-center gap-x-2 tnum"><span className="text-white/40">{r.t}</span><span>{r.lat}</span><span>{r.lon}</span><span className="text-[#38BDF8]">{r.alt}</span></div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[44px] h-[22px] border-y border-[#FFB703]/30 bg-[#FFB703]/[0.06]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#080C14] to-transparent" />
        </div>
        <div className="grid grid-cols-3 border-t border-white/[0.06]">
          {[['Candidates', 'n-cand', 'text-[#38BDF8]'], ['Rejected', 'n-rej', 'text-[#F43F5E]'], ['Verified', 'n-ver', 'text-[#10B981]']].map(([l, c, col]) => (
            <div key={c} className="flex flex-col gap-1 px-3 py-3"><span className="hud-label !text-[9.5px] text-white/40">{l}</span><span className={`${c} ${col} display tnum text-3xl`}>00</span></div>
          ))}
        </div>
      </aside>

      {/* centre: the swath */}
      <div className="cs-box swath-box">
        <canvas ref={rawC} className="absolute inset-0 h-full w-full" />
        <canvas ref={cleanC} className="cs-clean absolute inset-0 h-full w-full" />
        <div className="cs-scan absolute inset-y-0 w-px bg-[#38BDF8] shadow-[0_0_18px_4px_rgba(56,189,248,.6)]" />
        <svg className="cs-grid absolute inset-0 h-full w-full" viewBox="0 0 1024 1100" preserveAspectRatio="none">
          {[384, 640].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="1100" stroke="rgba(255,255,255,.35)" strokeDasharray="8 8" vectorEffect="non-scaling-stroke" />)}
          {[320, 640, 960].map((y) => <line key={y} x1="0" y1={y} x2="1024" y2={y} stroke="rgba(255,255,255,.35)" strokeDasharray="8 8" vectorEffect="non-scaling-stroke" />)}
        </svg>
        <svg ref={svg} className="absolute inset-0 h-full w-full overflow-hidden" viewBox={`0 0 1024 ${WIN}`} preserveAspectRatio="none">
          {cands.map((c) => (
            <g key={c.id} className={`bx bx-${c.id}`}>
              <g className="bx-in">
                <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke={CYAN} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                <text x={c.x} y={c.y - 7} fill="#E2E8F0" fontSize="19" fontFamily="JetBrains Mono" style={{ paintOrder: 'stroke' }} stroke="rgba(0,0,0,.75)" strokeWidth="4">
                  {CLASSES[c.cls].short} {c.conf.toFixed(2)}
                </text>
              </g>
            </g>
          ))}
        </svg>
        <div className="cs-scanline pointer-events-none absolute inset-x-0 h-0.5 bg-[#FFB703] opacity-0 shadow-[0_0_22px_5px_rgba(255,183,3,.55)]" />
        <div className="cs-veil absolute inset-0 bg-[#05070B]/75" />
        <span className="cs-ready hud-label invisible absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-[#10B981] opacity-0">Clean swath · ready for inference</span>
        <div className="cs-pin absolute h-0 w-0" style={pct(hero.x + hero.w / 2, hero.y + hero.h / 2)}>
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[#FFB703] shadow-[0_0_20px_#FFB703]" />
          <span className="absolute -left-6 -top-6 h-12 w-12 animate-ping rounded-full border border-[#FFB703]/70" />
        </div>
        <div className="calipers" style={{ ['--c' as string]: 'rgba(255,255,255,0.35)' }} />
      </div>

      {/* right: stage detail */}
      <aside className="cs-right panel absolute right-[7vw] top-[13vh] flex h-[70vh] w-[calc(50%-35vh*1024/1100-7vw-28px)] flex-col">
        <div className="panel-title"><span className="cs-stage hud-label text-[#FFB703]">01 · Ingest</span><span className="hud-label text-white/35">SONARX</span></div>
        <div className="relative flex-1">
          <div className="cs-card cs-card-ingest absolute inset-0 flex flex-col gap-3 p-4">
            <p className="text-sm leading-relaxed text-white/70">Raw side-scan swath + GPS / ping-log metadata, decoded from the AUV’s recorder.</p>
            {[['Heading', '315.0°'], ['Altitude', `${ALT_M} m`], ['Speed', '3.2 kt'], ['Frequency', '900 kHz'], ['Swath', '120 m'], ['Pings', MISSION.pings.toLocaleString('en-IN')]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/[0.05] pb-2"><span className="hud-label text-white/45">{k}</span><span className="mono text-sm text-white/85">{v}</span></div>
            ))}
          </div>
          <div className="cs-card cs-card-pre absolute inset-0 flex flex-col gap-3 p-4">
            {['Lee speckle filter', 'TVG gain normalisation', 'Slant-range correction', 'Dropout interpolation'].map((t) => (
              <div key={t} className="chk flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#10B981]/15 text-[#10B981]"><Check size={12} /></span><span className="text-sm text-white/80">{t}</span></div>
            ))}
            <div className="mt-auto flex items-end justify-between border-t border-white/[0.06] pt-4">
              <span className="hud-label text-white/45">Signal-to-noise</span>
              <span className="display tnum text-5xl text-[#38BDF8]"><span className="snr">+0.0</span><span className="text-xl text-white/50"> dB</span></span>
            </div>
          </div>
          <div className="cs-card cs-card-det absolute inset-0 flex flex-col gap-3 p-4">
            <div className="display text-3xl">{MODEL.name}</div>
            {[MODEL.params, MODEL.tile, MODEL.runtime, `${MODEL.cpuMs} ms CPU · ${MODEL.gpuMs} ms GPU`].map((t) => (
              <span key={t} className="chip self-start !text-white/80">{t}</span>
            ))}
            <div className="mt-auto flex items-end justify-between border-t border-white/[0.06] pt-4">
              <span className="hud-label text-white/45">Compute on this swath</span>
              <span className="display tnum text-5xl text-[#FFB703]"><span className="inf-ms">0</span><span className="text-xl text-white/50"> ms</span></span>
            </div>
          </div>
          <div className="cs-card cs-card-filter absolute inset-0 flex flex-col gap-4 p-4">
            <p className="text-sm leading-relaxed text-white/70">Anything standing off the seabed must cast a dark shadow <b className="text-white">away from nadir</b>, as long as its height implies.</p>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-center"><span className="mono text-lg text-white">L = h·G / (H − h)</span></div>
            <div className="flex items-center gap-2 text-sm"><i className="h-2 w-5 rounded bg-[#10B981]" /> shadow void present → keep</div>
            <div className="flex items-center gap-2 text-sm"><i className="h-2 w-5 rounded bg-[#F43F5E]" /> no void → natural clutter</div>
            <div className="mt-auto border-t border-white/[0.06] pt-4"><span className="display text-4xl text-[#10B981]">up to 92%</span><p className="hud-label mt-1 text-white/45">natural false alarms suppressed</p></div>
          </div>
          <div className="cs-card cs-card-cls absolute inset-0 flex flex-col gap-4 p-4">
            {classes.map((k) => (
              <div key={k} className={`cls-${k} flex flex-col gap-1.5`}>
                <div className="flex items-center gap-2"><span className="cls-dot h-2.5 w-2.5 rounded-full" style={{ background: CLASSES[k].color, boxShadow: `0 0 10px ${CLASSES[k].color}` }} /><span className="text-sm text-white/85">{CLASSES[k].label}</span><span className="cls-n display tnum ml-auto text-2xl" style={{ color: CLASSES[k].color }}>00</span></div>
                <div className="h-1 rounded bg-white/10"><div className="cls-bar h-full origin-left rounded" style={{ background: CLASSES[k].color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* filter stage: magnified crops + the formula with real numbers */}
      <Crop sw={sw} c={hero} title="Candidate · net?" />
      <Crop sw={sw} c={rock} title="Candidate · rock?" />
      <div className="cs-formula panel absolute inset-x-0 top-[66vh] mx-auto w-[64vh] translate-y-3 px-4 py-3 text-center">
        <span className="mono text-sm text-white/80">#07: L = {HERO.estimatedHeight} · {GROUND_M.toFixed(1)} / ({ALT_M} − {HERO.estimatedHeight}) = <b className="text-[#FFB703]">{EXPECTED_SHADOW_M.toFixed(2)} m</b> expected · <b className="text-[#10B981]">{HERO.shadowLength} m</b> measured ✓</span>
      </div>

      {/* classify flights */}
      <div className="cs-dots pointer-events-none absolute inset-0">
        {verified.map((c) => <i key={c.id} className={`dot-${c.id} absolute left-0 top-0 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full`} style={{ background: CLASSES[c.cls].color, boxShadow: `0 0 12px ${CLASSES[c.cls].color}` }} />)}
      </div>

      {/* hero card */}
      <div className="cs-hero absolute inset-x-0 top-[14vh] mx-auto w-[min(1000px,72vw)]">
        <ElectricBorder color={AMBER} speed={0.7} chaos={0.12} borderRadius={14}>
          <div className="grid grid-cols-[auto_1fr] gap-6 rounded-[14px] bg-[#070B12]/95 p-6">
            <div className="flex flex-col gap-3">
              <div className="relative h-[30vh] w-[30vh] overflow-hidden rounded-lg border border-white/10">
                <canvas ref={heroC} className="h-full w-full" />
                <div className="calipers" style={{ ['--c' as string]: AMBER, inset: '14%' }} />
              </div>
              <span className="hud-label text-white/45">{HERO.lat.toFixed(4)}° N · {HERO.lon.toFixed(4)}° E</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div><span className="hud-label text-[#FFB703]">Target {HERO.id}</span><h3 className="display mt-1 text-4xl">Ghost net (ALDFG)</h3></div>
                <span className="hero-risk hud-label rounded bg-[#F43F5E]/15 px-2.5 py-1.5 text-[#F43F5E] shadow-[0_0_20px_rgba(244,63,94,.35)]">● {HERO.risk}</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-6">
                <svg viewBox="0 0 110 110" className="h-[15vh] w-[15vh]">
                  <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                  <circle className="gauge-arc" cx="55" cy="55" r="46" fill="none" stroke={AMBER} strokeWidth="8" strokeLinecap="round" strokeDasharray="289" strokeDashoffset="289" transform="rotate(-90 55 55)" />
                  <text className="gauge-txt" x="55" y="58" textAnchor="middle" fill="#fff" fontSize="22" fontFamily="Space Grotesk" fontWeight="600">0.0</text>
                  <text x="55" y="74" textAnchor="middle" fill="rgba(255,255,255,.45)" fontSize="8" fontFamily="JetBrains Mono">% CONF</text>
                </svg>
                <div className="flex flex-col gap-2">
                  {EVIDENCE.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-2">
                      <span className="hud-label !text-[10px] text-white/50">{k}</span>
                      <div className="h-1.5 rounded bg-white/10"><div className="ev-bar h-full origin-left rounded bg-[#FFB703]" style={{ width: `${v}%` }} /></div>
                      <span className="mono tnum text-xs text-white/70">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 border-t border-white/[0.06] pt-4">
                {[['Length', `${HERO.length} m`], ['Width', `${HERO.width} m`], ['Relief', `${HERO.estimatedHeight} m`], ['Shadow', `${HERO.shadowLength} m`], ['Depth', `${HERO.depth} m`]].map(([k, v]) => (
                  <div key={k} className="flex flex-col"><span className="hud-label !text-[9.5px] text-white/40">{k}</span><span className="display text-xl">{v}</span></div>
                ))}
              </div>
              <span className="hud-label text-white/40">CI {(HERO.confidenceInterval[0] * 100).toFixed(1)}–{(HERO.confidenceInterval[1] * 100).toFixed(1)}% · human review queued</span>
            </div>
          </div>
        </ElectricBorder>
      </div>
    </section>
    </div>
  );
}
