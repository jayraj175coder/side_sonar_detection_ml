import { useEffect, useRef } from 'react';
import { Fish, Shell, Fan } from 'lucide-react';
import { gsap, SplitText, useAct, drive, spacer } from '../scroll';
import { drawRows, fitCanvas, FILTER_OFF, WIN, type Swath } from '../swath';
import { AuvSide, AuvTop, GhostNet, Turtle } from '../art';
import { MISSION } from '../story';
import ShinyText from '../bits/ShinyText';

const T_START = FILTER_OFF + 1400; // first ping of the Act I waterfall (newest-on-top, grows toward FILTER_OFF)

export default function ActDive({ sw }: { sw: Swath }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wf = useRef({ T: T_START });

  const paint = () => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    drawRows(ctx, sw.raw, wf.current.T, WIN, T_START);
    if (wf.current.T > FILTER_OFF) { // newest ping line
      ctx.fillStyle = 'rgba(255,214,120,0.9)';
      ctx.fillRect(0, 0, c.width, Math.max(2, c.height / 400));
    }
  };
  useEffect(() => {
    const onResize = () => { fitCanvas(canvas.current!); paint(); };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const hero = sw.hero, rock = sw.rock;
  const pct = (x: number, y: number) => ({ left: `${(x / 1024) * 100}%`, top: `${((y - FILTER_OFF) / WIN) * 100}%` });

  const ref = useAct('dive', (tl, root) => {
    const q = gsap.utils.selector(root);
    const bgSurface = document.getElementById('ani-bg-surface');
    const rays = document.getElementById('ani-rays');
    const h1 = SplitText.create(q('.dive-h1'), { type: 'words' });
    const h2 = SplitText.create(q('.dive-h2'), { type: 'words' });

    gsap.set([q('.dive-h1'), q('.dive-h2'), q('.dive-chips > *'), q('.dive-scene'), q('.dive-telemetry > *'), q('.dive-wf'), q('.dive-top'), q('.dive-challenge'), q('.dive-wecan'), q('.dive-count')], { autoAlpha: 0 });
    gsap.set(q('.dive-h1'), { autoAlpha: 1 });
    gsap.set(h1.words, { autoAlpha: 0, yPercent: 60, filter: 'blur(12px)' });
    gsap.set(q('.dive-h2'), { autoAlpha: 1 });
    gsap.set(h2.words, { autoAlpha: 0, y: 30 });
    gsap.set(q('.dive-net'), { xPercent: 40, autoAlpha: 0 });
    gsap.set(q('.dive-net .draw'), { drawSVG: '0%' });
    gsap.set(q('.dive-turtle .draw'), { drawSVG: '0%' });
    gsap.set(q('.auv-side-wrap'), { xPercent: -160 });
    gsap.set(q('.auv-x'), { autoAlpha: 0 });
    gsap.set(q('.fan'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.ping-ring'), { attr: { r: 0 }, autoAlpha: 1 });
    gsap.set(q('.lbl-line'), { drawSVG: '0%' });
    gsap.set(q('.lbl-text, .lesson-text, .lesson-shadow, .lesson-dims'), { autoAlpha: 0 });
    gsap.set(q('.lesson-ray'), { drawSVG: '0%' });
    gsap.set(q('.callout-line'), { drawSVG: '0%' });
    gsap.set(q('.callout-text, .callout-dot'), { autoAlpha: 0 });
    gsap.set(q('.reticle'), { autoAlpha: 0, scale: 3 });
    gsap.set(q('.dive-wipe'), { clipPath: 'circle(0% at 50% 50%)' });

    // 0 – 1.2 · surface, headline, the net
    tl.to(q('.dive-prompt'), { autoAlpha: 0, y: -20, duration: 0.25 }, 0.05);
    tl.to(h1.words, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.45, ease: 'expo.out' }, 0.3);
    tl.to(q('.dive-net'), { xPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 0.35);
    tl.to(q('.dive-net .draw'), { drawSVG: '100%', stagger: 0.02, duration: 0.5 }, 0.4);
    tl.to(q('.dive-turtle .draw'), { drawSVG: '100%', stagger: 0.04, duration: 0.4 }, 0.7);
    tl.to(q('.dive-turtle'), { rotation: -8, y: 10, duration: 1.8, ease: 'sine.inOut' }, 0.6);
    // 1.2 – 2.2 · why it matters
    tl.to(q('.dive-h1'), { autoAlpha: 0, y: -40, filter: 'blur(8px)', duration: 0.3 }, 1.2);
    tl.to(q('.dive-chips > *'), { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.25, ease: 'back.out(1.6)' }, 1.3);
    tl.to(q('.dive-chips > *'), { autoAlpha: 0, y: -10, stagger: 0.05, duration: 0.2 }, 2.05);
    // 2.2 – 3.0 · the dive
    tl.to(q('.dive-surface'), { yPercent: -120, duration: 0.8, ease: 'power2.in' }, 2.2);
    if (bgSurface) tl.to(bgSurface, { autoAlpha: 0, duration: 0.8 }, 2.2);
    if (rays) tl.to(rays, { autoAlpha: 0, duration: 0.6 }, 2.2);
    tl.to(q('.dive-net'), { scale: 0.7, yPercent: -30, autoAlpha: 0, filter: 'blur(6px)', duration: 0.8 }, 2.2);
    tl.to(h2.words, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.3, ease: 'expo.out' }, 2.3);
    tl.to(q('.dive-h2'), { autoAlpha: 0, filter: 'blur(8px)', duration: 0.25 }, 2.85);
    // 3.0 – 3.6 · listen instead: the AUV glides in
    tl.set(q('.dive-scene'), { autoAlpha: 1 }, 3.0);
    tl.to(q('.auv-side-wrap'), { xPercent: 0, duration: 0.55, ease: 'power2.out' }, 3.0);
    // 3.6 – 4.2 · first ping (view swings to the cross-section)
    tl.to(q('.auv-side-wrap'), { autoAlpha: 0, scale: 0.6, duration: 0.12 }, 3.55);
    tl.to(q('.auv-x'), { autoAlpha: 1, duration: 0.12 }, 3.6);
    tl.to(q('.ping-ring'), { attr: { r: 900 }, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'power1.out' }, 3.62);
    tl.to(q('.fan'), { scaleY: 1, duration: 0.3, ease: 'power2.out' }, 3.65);
    tl.to(q('.lbl-line'), { drawSVG: '100%', stagger: 0.05, duration: 0.15 }, 3.8);
    tl.to(q('.lbl-text'), { autoAlpha: 1, stagger: 0.05, duration: 0.12 }, 3.85);
    tl.to(q('.dive-telemetry > *'), { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.15 }, 3.9);
    // 4.2 – 5.0 · the shadow lesson
    tl.to(q('.fan'), { autoAlpha: 0.35, duration: 0.2 }, 4.2);
    tl.to(q('.lesson-ray'), { drawSVG: '100%', duration: 0.25 }, 4.25);
    tl.to(q('.lesson-shadow'), { autoAlpha: 1, duration: 0.2 }, 4.45);
    tl.to(q('.lesson-dims'), { autoAlpha: 1, stagger: 0.06, duration: 0.15 }, 4.55);
    tl.to(q('.lesson-text'), { autoAlpha: 1, duration: 0.15 }, 4.6);
    // 5.0 – 5.6 · the view flattens into a waterfall
    tl.to(q('.dive-telemetry > *'), { autoAlpha: 0, duration: 0.15 }, 5.0);
    tl.to(q('.dive-scene'), { rotationX: 72, yPercent: 18, autoAlpha: 0, duration: 0.5, ease: 'power2.in', transformPerspective: 1200, transformOrigin: '50% 60%' }, 5.0);
    tl.to(q('.dive-top'), { autoAlpha: 1, duration: 0.25 }, 5.3);
    tl.to(q('.dive-wf'), { autoAlpha: 1, duration: 0.25 }, 5.35);
    tl.to(q('.dive-count'), { autoAlpha: 1, duration: 0.2 }, 5.5);
    // 5.6 – 6.5 · ping by ping
    drive(tl, 5.6, 0.9, (p) => {
      wf.current.T = T_START - p * (T_START - FILTER_OFF);
      paint();
      const pings = Math.round(p * MISSION.pings);
      const cnt = root.querySelector('.dive-count b');
      if (cnt) cnt.textContent = `${pings.toLocaleString('en-IN')} PINGS · ${Math.round(p * 384)} M OF TRACK`;
    }, 'power1.inOut');
    // 6.5 – 7.0 · what the eye has to fight
    tl.to(q('.callout-dot'), { autoAlpha: 1, stagger: 0.08, duration: 0.08 }, 6.5);
    tl.to(q('.callout-line'), { drawSVG: '100%', stagger: 0.08, duration: 0.12 }, 6.52);
    tl.to(q('.callout-text'), { autoAlpha: 1, stagger: 0.08, duration: 0.1 }, 6.58);
    // 7.0 – 7.6 · the challenge (a held breath)
    tl.to(q('.callout-dot, .callout-line, .callout-text, .dive-count'), { autoAlpha: 0, duration: 0.12 }, 7.0);
    tl.to(q('.dive-challenge'), { autoAlpha: 1, x: 0, duration: 0.2, ease: 'expo.out' }, 7.05);
    // 7.6 – 8.0 · "We can."
    tl.to(q('.reticle'), { autoAlpha: 1, scale: 1, duration: 0.1, ease: 'expo.out' }, 7.6);
    tl.to(q('.dive-challenge'), { autoAlpha: 0.25, duration: 0.1 }, 7.6);
    tl.to(q('.dive-wecan'), { autoAlpha: 1, x: 0, duration: 0.12, ease: 'expo.out' }, 7.62);
    const heroAt = () => { // section-relative, so a refresh while scrolled elsewhere stays correct
      const r = root.querySelector('.reticle')!.getBoundingClientRect(), s = root.getBoundingClientRect();
      return `${r.left - s.left + r.width / 2}px ${r.top - s.top + r.height / 2}px`;
    };
    tl.fromTo(q('.dive-wipe'), { clipPath: () => `circle(0% at ${heroAt()})` }, { clipPath: () => `circle(150% at ${heroAt()})`, duration: 0.22, ease: 'power2.in' }, 7.77);
  }, 7.4);

  const callouts: { x: number; y: number; label: string; side: -1 | 1 }[] = [
    { x: 150, y: FILTER_OFF + 150, label: 'Speckle noise', side: -1 },
    { x: sw.ripples.x, y: sw.ripples.y, label: 'Sand ripples', side: sw.ripples.x < 512 ? -1 : 1 },
    { x: rock.x + rock.w / 2, y: rock.y + rock.h / 2, label: 'Rock outcrop', side: 1 },
    { x: 880, y: 2300, label: 'Dropout · heave', side: 1 },
  ];

  return (
    <div ref={ref} style={spacer('dive')}>
    <section className="act-layer act-dive">
      {/* surface: waves at the top of the screen, lifted away on the dive */}
      <div className="dive-surface pointer-events-none absolute inset-x-0 top-0 h-[34vh]">
        <svg className="absolute bottom-0 h-16 w-full" viewBox="0 0 1600 60" preserveAspectRatio="none">
          <path d="M0 30 Q100 12 200 30 T400 30 T600 30 T800 30 T1000 30 T1200 30 T1400 30 T1600 30 V60 H0 Z" fill="rgba(56,189,248,0.10)" stroke="rgba(186,230,253,0.55)" strokeWidth="1.5" style={{ animation: 'ani-bob 4s ease-in-out infinite' }} />
        </svg>
      </div>

      <div className="dive-prompt absolute inset-x-0 bottom-28 flex flex-col items-center gap-3">
        <ShinyText text="Scroll to dive" className="display text-2xl tracking-tight" color="#94A3B8" shineColor="#ffffff" speed={2.4} />
        <svg width="18" height="28" viewBox="0 0 18 28" style={{ animation: 'ani-bob 1.6s ease-in-out infinite' }}>
          <rect x="1" y="1" width="16" height="26" rx="8" fill="none" stroke="rgba(255,255,255,0.4)" />
          <circle cx="9" cy="9" r="2" fill="#FFB703" />
        </svg>
      </div>

      <h1 className="dive-h1 display absolute left-[7vw] top-[34vh] max-w-[46vw] text-[clamp(44px,6.6vw,120px)]">
        Ghost nets don’t stop fishing.
      </h1>
      <div className="dive-net pointer-events-none absolute right-[5vw] top-[22vh] w-[40vw]">
        <GhostNet className="w-full" />
        <div className="dive-turtle absolute left-[38%] top-[34%] w-[24%]"><Turtle className="w-full" /></div>
      </div>

      <div className="dive-chips absolute left-[7vw] top-[64vh] flex gap-3">
        {[[Fish, 'Traps marine life'], [Shell, 'Smothers reefs'], [Fan, 'Fouls propellers']].map(([Icon, t]) => {
          const I = Icon as typeof Fish;
          return (
            <span key={t as string} className="panel flex translate-y-3 items-center gap-2 px-3 py-2">
              <I size={16} className="text-[#38BDF8]" /> <span className="hud-label text-white/80">{t as string}</span>
            </span>
          );
        })}
      </div>

      <h2 className="dive-h2 display absolute inset-x-0 top-[40vh] text-center text-[clamp(36px,5vw,88px)]">
        Finding them is the hard part.
      </h2>

      {/* cross-section: AUV, beams, seabed, the shadow lesson */}
      <svg className="dive-scene absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fanG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0.04" />
          </linearGradient>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#F43F5E" strokeWidth="2" opacity="0.7" />
          </pattern>
        </defs>
        <path className="fan" d="M800 330 L90 770 L700 770 Z" fill="url(#fanG)" />
        <path className="fan" d="M800 330 L1510 770 L900 770 Z" fill="url(#fanG)" />
        {[0, 1, 2].map((i) => <circle key={i} className="ping-ring" cx="800" cy="330" r="0" fill="none" stroke="#38BDF8" strokeWidth="1.5" />)}
        <path d="M0 770 C200 760 320 780 520 768 S900 776 1100 770 S1400 762 1600 772" stroke="rgba(186,230,253,0.5)" strokeWidth="1.5" fill="none" />
        <path d="M0 770 C200 760 320 780 520 768 S900 776 1100 770 S1400 762 1600 772 V900 H0 Z" fill="rgba(56,189,248,0.05)" />
        <line x1="800" y1="352" x2="800" y2="770" stroke="rgba(255,255,255,0.35)" strokeDasharray="4 6" />
        {/* the object on the seabed + its shadow */}
        <path d="M1118 771 C1118 700 1182 700 1182 771 Z" fill="rgba(255,183,3,0.25)" stroke="#FFB703" strokeWidth="1.5" />
        <path className="lesson-ray" d="M800 330 L1160 716 L1214 774" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="6 5" fill="none" />
        <path className="lesson-shadow" d="M1182 740 L1211 771 L1182 771 Z" fill="url(#hatch)" />
        <g className="lesson-dims" opacity="0">
          <line x1="760" y1="330" x2="760" y2="770" stroke="#94A3B8" /><text x="742" y="560" fill="#94A3B8" fontSize="18" fontFamily="JetBrains Mono" textAnchor="end">H</text>
        </g>
        <g className="lesson-dims" opacity="0">
          <line x1="800" y1="800" x2="1150" y2="800" stroke="#94A3B8" /><text x="975" y="826" fill="#94A3B8" fontSize="18" fontFamily="JetBrains Mono" textAnchor="middle">G</text>
        </g>
        <g className="lesson-dims" opacity="0">
          <line x1="1100" y1="718" x2="1100" y2="770" stroke="#FFB703" /><text x="1090" y="742" fill="#FFB703" fontSize="18" fontFamily="JetBrains Mono" textAnchor="end">h</text>
          <line x1="1182" y1="800" x2="1211" y2="800" stroke="#F43F5E" /><text x="1197" y="826" fill="#F43F5E" fontSize="18" fontFamily="JetBrains Mono" textAnchor="middle">L</text>
        </g>
        <g className="lesson-text">
          <text x="1240" y="700" fill="#F43F5E" fontSize="16" fontFamily="JetBrains Mono" letterSpacing="2">ACOUSTIC SHADOW</text>
          <text x="1240" y="728" fill="rgba(255,255,255,0.7)" fontSize="18" fontFamily="JetBrains Mono">L = h·G / (H − h)</text>
        </g>
        {/* labels */}
        {[
          ['M420 690 L420 640', 420, 626, 'PORT SWATH'],
          ['M1180 690 L1180 640', 1180, 626, 'STARBOARD SWATH'],
          ['M800 560 L860 560', 868, 565, 'NADIR'],
        ].map(([d, x, y, t]) => (
          <g key={t as string}>
            <path className="lbl-line" d={d as string} stroke="rgba(255,255,255,0.5)" />
            <text className="lbl-text" x={x as number} y={y as number} fill="#E2E8F0" fontSize="15" fontFamily="JetBrains Mono" letterSpacing="2.5" textAnchor={t === 'NADIR' ? 'start' : 'middle'}>{t as string}</text>
          </g>
        ))}
        {/* AUV: side view glides in, then the view swings to the cross-section */}
        <foreignObject x="560" y="290" width="480" height="90">
          <div className="auv-side-wrap"><AuvSide width="100%" /></div>
        </foreignObject>
        <g className="auv-x">
          <circle cx="800" cy="330" r="22" fill="rgba(10,15,24,0.95)" stroke="#E2E8F0" strokeWidth="1.6" />
          <path d="M800 308 V292 M800 352 V368 M778 330 H760 M822 330 H840" stroke="#94A3B8" strokeWidth="1.6" />
          <rect x="770" y="340" width="6" height="10" fill="#38BDF8" /><rect x="824" y="340" width="6" height="10" fill="#38BDF8" />
          <circle cx="800" cy="330" r="3" fill="#FFB703" />
        </g>
      </svg>

      <div className="dive-telemetry absolute right-[7vw] top-[16vh] flex flex-col gap-2">
        {MISSION.telemetry.map(([k, v]) => (
          <span key={k} className="panel flex translate-y-2 items-center justify-between gap-6 px-3 py-1.5">
            <span className="hud-label text-white/45">{k}</span><span className="mono text-sm text-[#38BDF8]">{v}</span>
          </span>
        ))}
      </div>

      {/* waterfall */}
      <div className="dive-top absolute left-1/2 top-[7.5vh] w-[2.2vh] -translate-x-1/2"><AuvTop width="100%" /></div>
      <div className="dive-wf swath-box">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <div className="calipers" style={{ ['--c' as string]: 'rgba(255,255,255,0.35)' }} />
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 ${FILTER_OFF} 1024 ${WIN}`} preserveAspectRatio="none">
          {callouts.map((c) => {
            const lx = c.side < 0 ? -60 : 1084;
            return (
              <g key={c.label}>
                <circle className="callout-dot" cx={c.x} cy={c.y} r="16" fill="none" stroke="#38BDF8" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                <path className="callout-line" d={`M${c.x + c.side * 16} ${c.y} L${lx} ${c.y}`} stroke="#38BDF8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>
        {callouts.map((c) => (
          <span key={c.label} className="callout-text hud-label absolute whitespace-nowrap text-[#38BDF8]"
            style={{ top: pct(c.x, c.y).top, [c.side < 0 ? 'right' : 'left']: 'calc(100% + 72px)', transform: 'translateY(-50%)' }}>
            {c.label}
          </span>
        ))}
        <div className="reticle absolute" style={{ ...pct(hero.x, hero.y), width: `${(hero.w / 1024) * 100}%`, height: `${(hero.h / WIN) * 100}%` }}>
          <div className="calipers" style={{ ['--c' as string]: '#FFB703', inset: '-6px' }} />
          <div className="absolute inset-0 border border-[#FFB703]/70 shadow-[0_0_24px_rgba(255,183,3,0.45)]" />
          <span className="hud-label absolute -top-5 left-0 text-[#FFB703]">#07 · ghost net</span>
        </div>
      </div>
      <div className="dive-count hud-label absolute left-1/2 top-[88vh] -translate-x-1/2 text-white/50"><b className="font-normal tnum">0 PINGS</b></div>

      <p className="dive-challenge display absolute left-[7vw] top-[36vh] w-[calc(50%-35vh*1024/1100-7vw-32px)] -translate-x-4 text-[clamp(22px,2.3vw,44px)]">
        Somewhere in here is a ghost net. <span className="text-white/45">Can you find it?</span>
      </p>
      <p className="dive-wecan display absolute right-[9vw] top-[42vh] translate-x-4 text-[clamp(40px,5vw,96px)] text-[#FFB703]">We can.</p>

      <div className="dive-wipe pointer-events-none absolute inset-0 bg-[#05070B]" />
    </section>
    </div>
  );
}
