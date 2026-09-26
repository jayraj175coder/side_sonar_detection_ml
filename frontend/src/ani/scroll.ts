import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';
import { ACTS, type ActId } from './story';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin);
export { gsap, ScrollTrigger, SplitText };

export const reducedMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Imperative bridge: acts report (act, t in screens, direction); the HUD turns that into captions, sounds, gauges.
export const bus = {
  update: (_act: number, _t: number, _dir: number) => {},
  actStarts: [] as ScrollTrigger[],
};

let lenis: Lenis | null = null;
export function startSmoothScroll() {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  if (reducedMotion) return () => {};
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop(); else lenis?.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
export function scrollToY(y: number, duration = 1.6) {
  if (lenis) lenis.scrollTo(y, { duration });
  else window.scrollTo({ top: y });
}

/**
 * Acts are fixed full-screen layers ("the stage"); each is driven by an invisible spacer in the scroll flow.
 * One scrubbed master timeline per act, duration = the act's length in screens, so `tl.to(x, {...}, 2.5)`
 * means "2.5 screens into the act". Only one layer is visible at a time, so cuts between acts are frame-exact.
 */
export const spacer = (id: ActId) => ({ height: reducedMotion ? 'auto' : `${ACTS.find((a) => a.id === id)!.screens * 100}vh` });

export function useAct(id: ActId, build: (tl: gsap.core.Timeline, layer: HTMLElement) => void, poster?: number) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current!;
    const layer = root.firstElementChild as HTMLElement;
    const idx = ACTS.findIndex((a) => a.id === id);
    const screens = ACTS[idx].screens;
    const last = idx === ACTS.length - 1;
    const show = (on: boolean) => gsap.set(layer, { autoAlpha: on ? 1 : 0 });
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 0.3 },
        paused: reducedMotion,
        scrollTrigger: reducedMotion
          ? undefined
          : {
              trigger: root,
              start: 'top top',
              end: () => '+=' + window.innerHeight * screens,
              scrub: true,
              invalidateOnRefresh: true,
              onEnter: () => show(true),
              onEnterBack: () => show(true),
              onLeave: (self) => (last ? bus.update(idx, screens, self.direction) : show(false)),
              onLeaveBack: () => idx > 0 && show(false),
              onUpdate: (self) => (self.isActive || (last && self.progress === 1)) && bus.update(idx, self.progress * screens, self.direction),
              onToggle: (self) => self.isActive && bus.update(idx, self.progress * screens, self.direction),
            },
      });
      build(tl, layer);
      tl.set({}, {}, screens); // pad so timeline time == screens
      if (reducedMotion) tl.progress((poster ?? screens * 0.98) / screens);
      else {
        show(idx === 0);
        bus.actStarts[idx] = tl.scrollTrigger!;
      }
    }, root);
    return () => ctx.revert();
  }, []);
  return ref;
}

// Handy: a proxy tween whose onUpdate gets eased 0..1 progress (for canvas and computed layouts).
export function drive(tl: gsap.core.Timeline, at: number, duration: number, fn: (p: number) => void, ease = 'none') {
  const o = { p: 0 };
  tl.to(o, { p: 1, duration, ease, onUpdate: () => fn(o.p) }, at);
}
