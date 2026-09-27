import { gsap, SplitText, useAct, spacer } from '../scroll';
import { STEPS, TEAM } from '../story';

export default function ActReveal() {
  const ref = useAct('reveal', (tl, root) => {
    const q = gsap.utils.selector(root);
    const word = SplitText.create(q('.rv-word'), { type: 'chars' });
    gsap.set(q('.rv-ring'), { scale: 0.5, autoAlpha: 0 });
    gsap.set(q('.rv-emblem'), { scale: 0.6, autoAlpha: 0 });
    gsap.set(word.chars, { yPercent: 110, autoAlpha: 0, filter: 'blur(10px)' });
    gsap.set(q('.rv-sub, .rv-pill, .rv-team'), { autoAlpha: 0, y: 12 });
    gsap.set(q('.rv-card'), { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 });
    gsap.set(q('.rv-chip'), { autoAlpha: 0, y: 24 });
    gsap.set(q('.rv-line'), { drawSVG: '0%' });
    gsap.set(q('.rv-packet'), { left: '0%', autoAlpha: 0 });
    gsap.set(q('.rv-end-ring'), { scale: 0, autoAlpha: 1 });

    // 0 – 0.8 · the mark
    tl.to(q('.rv-ring'), { keyframes: { scale: [0.5, 1.6, 2.6], autoAlpha: [0, 0.9, 0] }, stagger: 0.12, duration: 0.55, ease: 'power1.out' }, 0);
    tl.to(q('.rv-emblem'), { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'expo.out' }, 0.05);
    tl.to(word.chars, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', stagger: 0.04, duration: 0.35, ease: 'expo.out' }, 0.2);
    tl.to(q('.rv-sub'), { autoAlpha: 1, y: 0, duration: 0.25 }, 0.55);
    // 0.8 – 1.8 · the problem statement
    tl.to(q('.rv-brand'), { yPercent: -62, scale: 0.55, duration: 0.3, ease: 'power3.inOut' }, 0.8);
    tl.to(q('.rv-card'), { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'power3.out' }, 0.9);
    tl.to(q('.kw'), { backgroundSize: '100% 100%', stagger: 0.18, duration: 0.2 }, 1.2);
    tl.to(q('.rv-pill'), { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.15, ease: 'back.out(1.6)' }, 1.45);
    // 1.8 – 2.6 · the pipeline in four words + the team
    tl.to(q('.rv-chip'), { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.2, ease: 'back.out(1.6)' }, 1.8);
    tl.to(q('.rv-line'), { drawSVG: '100%', duration: 0.35 }, 1.9);
    tl.to(q('.rv-packet'), { autoAlpha: 1, duration: 0.05 }, 1.95);
    tl.to(q('.rv-packet'), { left: '100%', duration: 0.5, ease: 'power1.inOut' }, 1.95);
    tl.to(q('.rv-packet'), { autoAlpha: 0, duration: 0.05 }, 2.45);
    tl.to(q('.rv-team'), { autoAlpha: 1, y: 0, duration: 0.1 }, 2.1);
    tl.to(q('.rv-team'), { scrambleText: { text: `TEAM ${TEAM.name}  ·  SIH ${TEAM.ps}  ·  ID ${TEAM.id}`, chars: 'upperCase', speed: 0.6 }, duration: 0.35 }, 2.1);
    // 2.6 – 3.4 · everything else falls away; the chips dock into the HUD
    tl.to(q('.rv-brand, .rv-card, .rv-team, .rv-connector'), { autoAlpha: 0, y: -20, duration: 0.25 }, 2.6);
    const chips = q('.rv-chip');
    const dock = (i: number, axis: 'x' | 'y' | 's') => {
      const hud = document.querySelectorAll<HTMLElement>('#hud-steps [data-step]')[i];
      if (!hud) return 0;
      const h = hud.getBoundingClientRect(), c = chips[i].getBoundingClientRect(), s = root.getBoundingClientRect();
      const cx = c.left - s.left - (gsap.getProperty(chips[i], 'x') as number), cy = c.top - s.top - (gsap.getProperty(chips[i], 'y') as number);
      const k = h.width / (c.width / (gsap.getProperty(chips[i], 'scale') as number));
      if (axis === 's') return k;
      return axis === 'x' ? h.left + h.width / 2 - (cx + c.width / 2) : h.top + h.height / 2 - (cy + c.height / 2);
    };
    chips.forEach((chip, i) => {
      tl.to(chip, { x: () => dock(i, 'x'), y: () => dock(i, 'y'), scale: () => dock(i, 's'), duration: 0.55, ease: 'power3.inOut' }, 2.7 + i * 0.04);
    });
    tl.to(chips, { autoAlpha: 0, duration: 0.08 }, 3.3);
    // 3.4 – 4.0 · ping into the console
    tl.to(q('.rv-end-ring'), { keyframes: { scale: [0, 0.6, 1], autoAlpha: [1, 0.8, 0] }, duration: 0.5, ease: 'power2.out' }, 3.4);
  }, 2.3);

  return (
    <div ref={ref} style={spacer('reveal')}>
    <section className="act-layer act-reveal bg-[#05070B]">
      <div className="rv-brand absolute inset-x-0 top-[22vh] flex flex-col items-center">
        <div className="relative h-[18vh] w-[18vh]">
          {[0, 1, 2].map((i) => <span key={i} className="rv-ring absolute inset-0 rounded-full border border-[#FFB703]/60" />)}
          <img src="/sonarx-logo-icon-round.png" alt="" className="rv-emblem absolute inset-0 rounded-full shadow-[0_0_60px_rgba(255,183,3,0.35)]" />
        </div>
        <h1 className="rv-word display mt-6 overflow-hidden text-[clamp(64px,11vw,200px)] leading-[0.9] tracking-[-0.05em]">SONARX</h1>
        <p className="rv-sub hud-label mt-4 !text-[13px] text-white/60">AI-assisted side-scan sonar interpretation</p>
      </div>

      <div className="rv-card panel invisible absolute inset-x-0 top-[38vh] mx-auto w-[min(880px,70vw)] p-7">
        <div className="mb-4 flex items-center justify-between">
          <span className="hud-label text-[#FFB703]">Problem statement · {TEAM.ps}</span>
          <span className="hud-label text-white/35">SIH 2026</span>
        </div>
        <p className="text-[clamp(20px,1.9vw,32px)] leading-snug text-white/90" style={{ fontFamily: 'Space Grotesk' }}>
          Detect{' '}
          <span className="kw" style={{ backgroundImage: 'linear-gradient(rgba(255,183,3,.28),rgba(255,183,3,.28))' }}>man-made debris</span>{' '}
          in{' '}
          <span className="kw" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,.28),rgba(56,189,248,.28))' }}>side-scan sonar</span>{' '}
          imagery, separate it from the natural seabed, and report its{' '}
          <span className="kw" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,.3),rgba(16,185,129,.3))' }}>exact location</span>.
        </p>
        <div className="mt-5 flex gap-2">
          <span className="rv-pill chip">MoES · NIOT</span>
          <span className="rv-pill chip !border-[#38BDF8]/40 !text-[#38BDF8]">Software</span>
          <span className="rv-pill chip !border-[#FFB703]/40 !text-[#FFB703]">Disaster management</span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[74vh] mx-auto w-[min(880px,70vw)]">
        <div className="rv-connector absolute inset-x-8 top-1/2 h-px">
          <svg className="absolute inset-0 h-px w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 1">
            <line className="rv-line" x1="0" y1="0.5" x2="100" y2="0.5" stroke="rgba(255,183,3,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="rv-packet absolute -top-[3px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[#FFB703] shadow-[0_0_12px_#FFB703]" />
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => (
            <span key={s} className="rv-chip mono rounded-full border border-white/15 bg-[#0A0F18] px-5 py-2.5 text-[13px] uppercase tracking-[0.14em] text-white/85">
              <b className="mr-2 text-[#FFB703]">0{i + 1}</b>{s}
            </span>
          ))}
        </div>
      </div>
      <p className="rv-team hud-label absolute inset-x-0 top-[84vh] text-center text-white/50">&nbsp;</p>

      <span className="rv-end-ring pointer-events-none absolute left-[calc(50%-90vmax)] top-[calc(50%-90vmax)] h-[180vmax] w-[180vmax] rounded-full border-2 border-[#FFB703]/70" />
    </section>
    </div>
  );
}
