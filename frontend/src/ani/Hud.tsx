import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, bus, scrollToY } from './scroll';
import { ACTS, BEATS, MISSION, STEPS, TEAM, type Sfx } from './story';
import { sonarAudio } from '../utils/sonarAudio';

// ── sound ────────────────────────────────────────────────────────────
let soundOn = false;
let depthNow = 0;
const soundListeners = new Set<(on: boolean) => void>();
export function setSound(on: boolean) {
  soundOn = on;
  sonarAudio.isMuted = !on;
  if (on) { sonarAudio.startAmbient(); sonarAudio.setAmbientDepth(depthNow); } else sonarAudio.stopAmbient();
  soundListeners.forEach((l) => l(on));
}
const lastPlayed: Partial<Record<Sfx, number>> = {};
export function playSfx(kind: Sfx, minGapMs = 120, pitch = 1) {
  if (!soundOn) return;
  const now = performance.now();
  if (now - (lastPlayed[kind] ?? 0) < minGapMs) return;
  lastPlayed[kind] = now;
  ({
    ping: () => sonarAudio.playSonarPing(pitch),
    lock: () => sonarAudio.playLockBeep(),
    depth: () => sonarAudio.playDepthPulse(),
    target: () => sonarAudio.playTargetBeep(),
    alarm: () => sonarAudio.playEmergencyAlertAlarm(),
    whoosh: () => sonarAudio.playWhoosh(),
    thud: () => sonarAudio.playThud(),
    tick: () => sonarAudio.playTick(),
  })[kind]();
}

// ── derived HUD state from (act, t) ──────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));
function depthAt(act: number, t: number): number | null {
  if (act === 0) return t < 2.2 ? (t < 2 ? null : 0) : t < 3 ? lerp(0, 40, (t - 2.2) / 0.8) : lerp(40, 43.1, (t - 3) / 5);
  if (act === 2) return 43.1;
  if (act === 5 && t >= 2 && t < 3.3) return lerp(43.1, 0, (t - 2) / 1);
  return null;
}
function stepAt(act: number, t: number): number | null {
  if (act === 1) return t >= 3.3 ? 0 : null;
  if (act === 2) return t < 6 ? 0 : 1;
  if (act === 3) return t < 3 ? 2 : 3;
  return null;
}
const fmtClock = (ms: number) => {
  const d = new Date(ms);
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getUTCMonth()];
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())} ${mon} ${d.getUTCFullYear()} · ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
};

const TOTAL = ACTS.reduce((s, a) => s + a.screens, 0);

export default function Hud() {
  const [on, setOn] = useState(soundOn);
  const root = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const gauge = useRef<HTMLDivElement>(null);
  const gaugeMark = useRef<HTMLDivElement>(null);
  const gaugeText = useRef<HTMLSpanElement>(null);
  const steps = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    soundListeners.add(setOn);
    const ctx = gsap.context(() => {
      let capText = '\u0000', act = -1, step: number | null = -1, split: SplitText | null = null;
      const lastT: number[] = ACTS.map(() => 0);

      const showCaption = (text: string) => {
        const el = caption.current!;
        gsap.killTweensOf(el.children);
        split?.revert();
        el.textContent = text;
        if (!text) return;
        split = SplitText.create(el, { type: 'words' });
        gsap.from(split.words, { opacity: 0, y: 8, filter: 'blur(6px)', duration: 0.45, stagger: 0.025, ease: 'expo.out' });
      };

      bus.update = (a, t, dir) => {
        // captions: last beat with text at or before t
        const beats = BEATS[ACTS[a].id];
        let cap = '';
        for (const b of beats) if (b.text !== undefined && b.at <= t + 1e-6) cap = b.text;
        if (cap !== capText) { capText = cap; showCaption(cap); }
        // one-shot sounds, forward only
        if (dir > 0 && a === act) for (const b of beats) if (b.sfx && b.at > lastT[a] && b.at <= t) playSfx(b.sfx, 60);
        lastT[a] = t;
        // act rail
        if (a !== act) {
          act = a;
          root.current!.querySelectorAll<HTMLElement>('[data-rail]').forEach((el, i) => el.classList.toggle('is-on', i === a));
        }
        // depth gauge + ambient filter
        const d = depthAt(a, t);
        gsap.to(gauge.current, { autoAlpha: d === null ? 0 : 1, duration: 0.4, overwrite: 'auto' });
        if (d !== null) {
          gaugeText.current!.textContent = d.toFixed(1);
          gsap.set(gaugeMark.current, { yPercent: 0, top: `${(d / 50) * 100}%` });
        }
        depthNow = d === null ? (a === 5 && t >= 3.3 ? 0 : a === 0 ? 0 : 1) : d / 43.1;
        if (soundOn) sonarAudio.setAmbientDepth(depthNow);
        // docked pipeline steps
        const s = stepAt(a, t);
        if (s !== step) {
          step = s;
          gsap.to(steps.current, { autoAlpha: s === null ? 0 : 1, duration: 0.3, overwrite: 'auto' });
          steps.current!.querySelectorAll<HTMLElement>('[data-step]').forEach((el, i) => {
            el.classList.toggle('is-on', i === s);
            el.classList.toggle('is-done', s !== null && i < s);
          });
        }
      };

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          bar.current!.style.transform = `scaleX(${self.progress})`;
          clock.current!.textContent = fmtClock(MISSION.clockStart + self.progress * 3_600_000);
        },
      });
      clock.current!.textContent = fmtClock(MISSION.clockStart);
    }, root);
    return () => {
      soundListeners.delete(setOn);
      bus.update = () => {};
      ctx.revert();
    };
  }, []);

  let acc = 0;
  return (
    <div ref={root} className="ani-hud pointer-events-none fixed inset-0 z-40 select-none">
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex h-11 items-center justify-between border-b border-white/[0.07] bg-[#05070B]/40 px-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/sonarx-logo-icon-round.png" alt="" className="h-6 w-6 rounded-full" />
          <span className="hud-label text-white/70">{TEAM.event}</span>
          <span className="hud-label text-white/30">PS {TEAM.ps}</span>
        </div>
        <div ref={steps} id="hud-steps" className="invisible absolute left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0">
          {STEPS.map((s, i) => (
            <span key={s} data-step className="hud-step">
              <b>0{i + 1}</b> {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span ref={clock} className="hud-label tabular-nums text-white/60" />
          <button
            className="cursor-target pointer-events-auto hud-label flex items-center gap-2 rounded border border-white/10 px-2.5 py-1 text-white/70 transition hover:border-[#FFB703]/60 hover:text-white"
            onClick={() => setSound(!on)}
            aria-pressed={on}
          >
            <span className={`hud-eq ${on ? 'is-on' : ''}`}><i /><i /><i /></span>
            SOUND {on ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* act rail */}
      <nav className="absolute left-5 top-1/2 flex -translate-y-1/2 flex-col gap-3" aria-label="Chapters">
        {ACTS.map((a, i) => (
          <button key={a.id} data-rail className="hud-rail cursor-target pointer-events-auto" onClick={() => bus.actStarts[i] && scrollToY(bus.actStarts[i].start + 2)}>
            <i />
            <span className="hud-label">{String(i + 1).padStart(2, '0')} · {a.label}</span>
          </button>
        ))}
      </nav>

      {/* depth gauge */}
      <div ref={gauge} className="invisible absolute right-6 top-1/2 flex h-[42vh] -translate-y-1/2 items-stretch gap-2 opacity-0">
        <div className="flex flex-col justify-between text-right">
          {[0, 10, 20, 30, 40, 50].map((m) => <span key={m} className="hud-label text-white/25">{m}</span>)}
        </div>
        <div className="relative w-px bg-white/15">
          <div ref={gaugeMark} className="absolute -left-[5px] h-px w-[11px] bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]">
            <span className="hud-label absolute left-4 -top-2 whitespace-nowrap text-[#38BDF8]">
              <span ref={gaugeText}>0.0</span> m
            </span>
          </div>
        </div>
      </div>

      {/* caption (voice-over) */}
      <div className="absolute inset-x-0 bottom-12 flex justify-center px-24">
        <div className="flex max-w-[860px] items-baseline gap-3">
          <span className="hud-label shrink-0 text-[#FFB703]/80">SONARX //</span>
          <p ref={caption} className="ani-caption" aria-live="polite" />
        </div>
      </div>

      {/* progress scrubber with act markers */}
      <div className="absolute inset-x-24 bottom-6 h-px bg-white/10">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-[#38BDF8] to-[#FFB703]" style={{ transform: 'scaleX(0)' }} />
        {ACTS.map((a) => {
          const left = (acc / TOTAL) * 100;
          acc += a.screens;
          return <span key={a.id} className="absolute -top-[3px] h-[7px] w-px bg-white/30" style={{ left: `${left}%` }} />;
        })}
      </div>
    </div>
  );
}
