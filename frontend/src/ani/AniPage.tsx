import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './ani.css';
import { gsap, ScrollTrigger, startSmoothScroll, setScrollLocked } from './scroll';
import { getSwath, type Swath } from './swath';
import Hud, { setSound } from './Hud';
import LightRays from './bits/LightRays';
import Noise from './bits/Noise';
import TargetCursor from './bits/TargetCursor';
import ActDive from './acts/ActDive';
import ActReveal from './acts/ActReveal';
import ActConsole from './acts/ActConsole';
import ActLocate from './acts/ActLocate';
import ActSystem from './acts/ActSystem';
import ActImpact from './acts/ActImpact';

function Preloader({ progress, ready, onEnter }: { progress: number; ready: boolean; onEnter: (sound: boolean) => void }) {
  return (
    <div className="ani-preloader fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-[#05070B]">
      <div className="relative h-28 w-28">
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute inset-0 rounded-full border border-[#FFB703]/40" style={{ animation: `pre-ping 2.4s ${i * 0.8}s cubic-bezier(.1,.8,.3,1) infinite` }} />
        ))}
        <img src="/sonarx-logo-icon-round.png" alt="SONARX" className="absolute inset-4 rounded-full" />
      </div>
      <div className="flex w-[280px] flex-col items-center gap-3">
        <span className="hud-label text-white/60">{ready ? 'Sonar array online' : 'Initializing sonar array'}</span>
        <div className="h-px w-full bg-white/10">
          <div className="h-full bg-[#FFB703] shadow-[0_0_10px_#FFB703]" style={{ width: `${Math.round(progress * 100)}%`, transition: 'width .2s' }} />
        </div>
        <span className="hud-label tnum text-white/35">Generating swath · {Math.round(progress * 100)}%</span>
      </div>
      <div className={`flex gap-3 transition-opacity duration-500 ${ready ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <button className="cursor-target btn-primary" onClick={() => onEnter(true)}>Dive with sound</button>
        <button className="cursor-target panel-btn !px-4 !py-2.5" onClick={() => onEnter(false)}>Dive silently</button>
      </div>
      <p className="hud-label absolute bottom-8 text-white/25">SIH 2026 · PS 26057 · Team Dead Braincells · best with headphones</p>
    </div>
  );
}

export default function AniPage() {
  const [sw, setSw] = useState<Swath | null>(null);
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState(false);
  const pre = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'SONARX — See beneath the surface';
    getSwath(setProgress).then(setSw);
    const stop = startSmoothScroll();
    setScrollLocked(true);
    return stop;
  }, []);

  // after every act has built its ScrollTrigger (children's layout effects run first)
  useLayoutEffect(() => {
    if (!sw) return;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, [sw]);

  const enter = (sound: boolean) => {
    setSound(sound);
    setScrollLocked(false);
    gsap.to(pre.current, { autoAlpha: 0, duration: 0.8, ease: 'power2.out', onComplete: () => setEntered(true) });
  };

  const snow = useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({ left: `${(i * 37) % 100}%`, size: 1 + (i % 3), dur: 14 + (i % 7) * 3, delay: -((i * 1.7) % 20) })),
    [],
  );

  return (
    <div className="ani-root">
      {/* fixed backdrop: abyss, surface light (faded by the acts), rays, marine snow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#05070B]" />
        <div id="ani-bg-surface" className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0E4A66 0%,#0A3550 28%,#062033 62%,#05070B 100%)' }} />
        <div id="ani-rays" className="absolute inset-0 mix-blend-screen">
          <LightRays raysOrigin="top-center" raysColor="#bae6fd" raysSpeed={0.6} lightSpread={0.9} rayLength={1.7} followMouse mouseInfluence={0.05} noiseAmount={0.08} distortion={0.04} />
        </div>
        <div className="ani-snow absolute inset-0">
          {snow.map((s, i) => (
            <i key={i} style={{ left: s.left, width: s.size, height: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }} />
          ))}
        </div>
      </div>

      <main className="relative z-10">
        {sw && (
          <>
            <ActDive sw={sw} />
            <ActReveal />
            <ActConsole sw={sw} />
            <ActLocate sw={sw} />
            <ActSystem />
            <ActImpact />
            <div className="h-screen" /> {/* lets the last act play to its final frame */}
          </>
        )}
      </main>

      <Hud />
      <div className="pointer-events-none fixed inset-0 z-[45] opacity-60 mix-blend-overlay"><Noise patternSize={256} patternAlpha={14} patternRefreshInterval={3} /></div>
      <TargetCursor spinDuration={3} cursorColor="rgba(255,255,255,0.9)" cursorColorOnTarget="#FFB703" />
      {!entered && <div ref={pre}><Preloader progress={progress} ready={!!sw} onEnter={enter} /></div>}
    </div>
  );
}
