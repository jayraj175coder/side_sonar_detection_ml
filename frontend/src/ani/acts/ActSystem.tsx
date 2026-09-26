import { useEffect, useRef } from 'react';
import { Upload, ScanSearch, Map as MapIcon, Gauge, FileDown, UserCheck, Cpu, WifiOff, Database, Wrench } from 'lucide-react';
import { gsap, ScrollTrigger, useAct, spacer } from '../scroll';
import { CLASS_AP, DASH_PANELS, DATASETS, METRICS, TOOLS } from '../story';

const ICONS = [Upload, ScanSearch, MapIcon, Gauge, FileDown, UserCheck];
const DESC = ['Drop a raw sonar log', 'Detections drawn in real time', 'Geotagged targets', '0–100 % score per target', 'Structured anomaly report', 'Analyst confirms or rejects'];
// exploded layout, in % of the stage: [left, top] of each panel, left column then right column
const SLOTS: [number, number][] = [[4, 20], [4, 42], [4, 64], [78, 20], [78, 42], [78, 64]];
// frame (monitor) rectangle after the explode, in %: x, y, w, h
const FRAME = { x: 25, y: 20, w: 50, h: 56 };

export default function ActSystem() {
  const frame = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fit = () => {
      const f = frame.current, i = iframe.current;
      if (f && i) i.style.transform = `scale(${f.clientWidth / 1440})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(frame.current!);
    return () => ro.disconnect();
  }, []);

  const ref = useAct('system', (tl, root) => {
    const q = gsap.utils.selector(root);
    // load the live dashboard one screen before this act starts
    ScrollTrigger.create({ trigger: root.parentElement, start: 'top bottom', once: true, onEnter: () => { if (iframe.current && !iframe.current.src) iframe.current.src = '/'; } });
    // the dashboard is a whole app: only let it render while this act is on screen
    ScrollTrigger.create({ trigger: root.parentElement, start: 'top bottom', end: 'bottom top', onToggle: (self) => { if (iframe.current) iframe.current.style.display = self.isActive ? '' : 'none'; } });

    gsap.set(q('.sy-frame'), { autoAlpha: 0, yPercent: 30, rotationX: 20, transformPerspective: 1400, scale: 1.25 });
    gsap.set(q('.sy-panel'), { autoAlpha: 0, scale: 0.6 });
    gsap.set(q('.sy-link'), { drawSVG: '0%' });
    gsap.set(q('.sy-title, .sy-metric, .sy-ap, .sy-note, .sy-col, .sy-col li, .sy-center-note'), { autoAlpha: 0 });
    gsap.set(q('.sy-bar'), { scaleX: 0 });
    gsap.set(q('.sy-flow'), { autoAlpha: 0 });

    // 0 – 0.6 · the dashboard rises
    tl.to(q('.sy-frame'), { autoAlpha: 1, yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out' }, 0);
    // 0.6 – 2.2 · the investigation overview explodes out of it
    tl.to(q('.sy-frame'), { scale: 1, duration: 0.4, ease: 'power3.inOut' }, 0.6);
    tl.to(q('.sy-title'), { autoAlpha: 1, duration: 0.2 }, 0.7);
    q('.sy-panel').forEach((el: Element, i: number) => {
      const [l, t] = SLOTS[i];
      tl.fromTo(el, { left: '42%', top: '40%' }, { left: `${l}%`, top: `${t}%`, autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.3)' }, 0.85 + i * 0.07);
    });
    tl.to(q('.sy-link'), { drawSVG: '100%', stagger: 0.06, duration: 0.25 }, 1.3);
    // 2.2 – 3.8 · proof
    tl.to(q('.sy-panel, .sy-link, .sy-title'), { autoAlpha: 0, duration: 0.2 }, 2.2);
    tl.to(q('.sy-frame'), { autoAlpha: 0, scale: 0.9, duration: 0.2 }, 2.2);
    tl.fromTo(q('.sy-metric'), { y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.2, ease: 'power3.out' }, 2.3);
    q('.sy-num').forEach((el: Element, i: number) => {
      const m = METRICS[i], o = { v: 0 };
      tl.to(o, { v: m.value, duration: 0.5, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toLocaleString('en-IN', { minimumFractionDigits: m.decimals, maximumFractionDigits: m.decimals }); } }, 2.35 + i * 0.06);
    });
    tl.to(q('.sy-ap'), { autoAlpha: 1, duration: 0.15 }, 2.8);
    tl.to(q('.sy-bar'), { scaleX: 1, stagger: 0.06, duration: 0.3 }, 2.85);
    tl.to(q('.sy-note'), { autoAlpha: 1, stagger: 0.08, duration: 0.15 }, 3.1);
    // 3.8 – 6.0 · open data in, open-source stack underneath
    tl.to(q('.sy-metric, .sy-ap, .sy-note'), { autoAlpha: 0, y: -20, duration: 0.2 }, 3.8);
    tl.to(q('.sy-frame'), { autoAlpha: 1, scale: 0.6, duration: 0.35, ease: 'power3.out' }, 3.85);
    tl.to(q('.sy-col'), { autoAlpha: 1, duration: 0.1 }, 3.95);
    tl.fromTo(q('.sy-col li'), { x: (i: number, el: Element) => (el.closest('.sy-left') ? -30 : 30) }, { autoAlpha: 1, x: 0, stagger: 0.04, duration: 0.15 }, 4.0);
    tl.to(q('.sy-flow'), { autoAlpha: 1, duration: 0.2 }, 4.5);
    tl.to(q('.sy-center-note'), { autoAlpha: 1, duration: 0.2 }, 4.7);
  }, 1.8);

  return (
    <div ref={ref} style={spacer('system')}>
      <section className="act-layer act-system bg-[#05070B]">
        <p className="sy-title hud-label absolute inset-x-0 top-[10vh] text-center text-white/60">SONARX · investigation overview</p>

        {/* connectors (explode) */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {SLOTS.map(([l, t], i) => {
            const left = i < 3, y = t + 5;
            const x1 = left ? l + 18 : l, x2 = left ? FRAME.x : FRAME.x + FRAME.w;
            return <path key={i} className="sy-link" d={`M${x1} ${y} C ${(x1 + x2) / 2} ${y}, ${(x1 + x2) / 2} ${FRAME.y + 10 + i % 3 * 16}, ${x2} ${FRAME.y + 10 + i % 3 * 16}`} stroke="rgba(255,183,3,.55)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>

        {/* the live dashboard */}
        <div ref={frame} className="sy-frame panel absolute overflow-hidden !rounded-xl" style={{ left: `${FRAME.x}%`, top: `${FRAME.y}%`, width: `${FRAME.w}%`, height: `${FRAME.h}%` }}>
          <div className="flex h-7 items-center gap-1.5 border-b border-white/[0.07] bg-[#0A0F18] px-3">
            <i className="h-2 w-2 rounded-full bg-white/20" /><i className="h-2 w-2 rounded-full bg-white/20" /><i className="h-2 w-2 rounded-full bg-white/20" />
            <span className="hud-label ml-3 !text-[9.5px] text-white/40">SONARX dashboard · live</span>
          </div>
          <div className="relative h-[calc(100%-28px)] overflow-hidden bg-[#05070B]">
            <iframe ref={iframe} title="SONARX dashboard" tabIndex={-1} className="pointer-events-none absolute left-0 top-0 origin-top-left border-0" style={{ width: 1440, height: 900 }} />
          </div>
        </div>

        {DASH_PANELS.map((t, i) => {
          const I = ICONS[i];
          return (
            <div key={t} className="sy-panel panel cursor-target absolute w-[18%] p-3">
              <div className="flex items-center gap-2"><I size={16} className="text-[#FFB703]" /><span className="hud-label text-white/85">{t}</span></div>
              <p className="mt-1.5 text-xs text-white/50">{DESC[i]}</p>
            </div>
          );
        })}

        {/* proof */}
        <div className="absolute inset-x-[12vw] top-[15vh] grid grid-cols-3 gap-4">
          {METRICS.map((m) => (
            <div key={m.label} className="sy-metric panel flex flex-col gap-1 p-5">
              <span className="hud-label text-white/45">{m.label}</span>
              <span className="display tnum text-[clamp(34px,4vw,64px)] text-white"><span className="sy-num">0</span><span className="text-[0.45em] text-white/45">{m.suffix}</span></span>
            </div>
          ))}
        </div>
        <div className="sy-ap absolute inset-x-[12vw] top-[57vh] grid grid-cols-2 gap-x-10 gap-y-3">
          {CLASS_AP.map((c) => (
            <div key={c.label} className="grid grid-cols-[11rem_1fr_3.5rem] items-center gap-3">
              <span className="text-sm text-white/70">{c.label}</span>
              <div className="h-1.5 rounded bg-white/10"><div className="sy-bar h-full origin-left rounded bg-gradient-to-r from-[#38BDF8] to-[#FFB703]" style={{ width: `${c.ap}%` }} /></div>
              <span className="mono tnum text-xs text-white/70">{c.ap}%</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-[12vw] top-[70vh] flex items-center gap-3">
          <span className="sy-note hud-label text-white/40">AP@50 per class · 700 held-out test tiles</span>
          <span className="sy-note chip ml-auto flex items-center gap-1.5 !text-[#10B981]"><Cpu size={12} /> ONNX Runtime</span>
          <span className="sy-note chip flex items-center gap-1.5 !text-[#10B981]"><WifiOff size={12} /> Offline</span>
          <span className="sy-note chip !text-[#10B981]">No GPU needed</span>
        </div>

        {/* open data ↔ open-source stack */}
        <svg className="sy-flow pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {DATASETS.map((_, i) => <path key={'d' + i} d={`M24 ${24 + i * 11} C 31 ${24 + i * 11}, 30 48, 35 48`} stroke="rgba(56,189,248,.5)" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" className="sy-dash" />)}
          {TOOLS.slice(0, 5).map((_, i) => <path key={'t' + i} d={`M65 48 C 70 48, 69 ${24 + i * 11}, 76 ${24 + i * 11}`} stroke="rgba(255,183,3,.5)" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" className="sy-dash" />)}
        </svg>
        <div className="sy-col sy-left absolute left-[6vw] top-[18vh] w-[18vw]">
          <p className="hud-label mb-3 flex items-center gap-2 text-[#38BDF8]"><Database size={13} /> Open sonar data</p>
          <ul className="flex flex-col gap-[3.3vh]">{DATASETS.map((d) => <li key={d} className="panel px-3 py-2 text-sm text-white/80">{d}</li>)}</ul>
        </div>
        <div className="sy-col sy-right absolute right-[6vw] top-[18vh] w-[18vw]">
          <p className="hud-label mb-3 flex items-center gap-2 text-[#FFB703]"><Wrench size={13} /> Open-source stack</p>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-[1.2vh]">{TOOLS.map((t) => <li key={t} className="panel px-3 py-2 text-sm text-white/80">{t}</li>)}</ul>
        </div>
        <p className="sy-center-note hud-label absolute inset-x-0 top-[78vh] text-center text-white/45">Free &amp; open data · open-source tools · runs on a laptop or onboard the vehicle</p>
      </section>
    </div>
  );
}
