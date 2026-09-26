import { Leaf, Users, IndianRupee, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { gsap, useAct, spacer, scrollToY } from '../scroll';
import { LAND_PATH, project } from '../geo';
import { AUDIENCES, IMPACT, SECTORS, TEAM } from '../story';
import { GhostNet, Turtle } from '../art';
import SpotlightCard from '../bits/SpotlightCard';
import ShinyText from '../bits/ShinyText';

const ICONS = [Leaf, Users, IndianRupee, ShieldCheck];
const [x0, y0] = project(24.5, 66);
const [x1, y1] = project(5.5, 94);
const VIEW = `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;

export default function ActImpact() {
  const ref = useAct('impact', (tl, root) => {
    const q = gsap.utils.selector(root);
    const bgSurface = document.getElementById('ani-bg-surface');
    const rays = document.getElementById('ani-rays');
    gsap.set(q('.im-map'), { autoAlpha: 0, scale: 1.08 });
    gsap.set(q('.im-card'), { autoAlpha: 0, y: 60 });
    gsap.set(q('.im-aud'), { autoAlpha: 0, y: 16 });
    gsap.set(q('.im-rise'), { autoAlpha: 0, yPercent: 60 });
    gsap.set(q('.im-net .draw'), { drawSVG: '100%' });
    gsap.set(q('.im-end, .im-end > *'), { autoAlpha: 0 });

    // 0 – 1.2 · India's coastline, the impact
    tl.to(q('.im-map'), { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0);
    tl.to(q('.im-card'), { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.3, ease: 'power3.out' }, 0.3);
    // 1.2 – 2.0 · who it is for
    tl.to(q('.im-aud'), { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.2 }, 1.25);
    // 2.0 – 3.0 · ascent: the net lets go, the turtle swims free, the light comes back
    tl.to(q('.im-map, .im-card, .im-aud'), { autoAlpha: 0, y: -40, duration: 0.3 }, 2.0);
    tl.to(q('.im-rise'), { autoAlpha: 1, yPercent: 0, duration: 0.25 }, 2.0);
    tl.to(q('.im-net .draw'), { drawSVG: '50% 50%', stagger: 0.01, duration: 0.3 }, 2.15);
    tl.to(q('.im-net .float'), { autoAlpha: 0, y: -40, stagger: 0.02, duration: 0.25 }, 2.15);
    tl.to(q('.im-turtle'), { yPercent: -240, xPercent: 30, rotation: 12, duration: 0.9, ease: 'power1.in' }, 2.1);
    if (bgSurface) tl.to(bgSurface, { autoAlpha: 1, duration: 0.8 }, 2.2);
    if (rays) tl.to(rays, { autoAlpha: 1, duration: 0.6 }, 2.4);
    tl.to(q('.im-rise'), { autoAlpha: 0, duration: 0.15 }, 2.85);
    // 3.0 – 4.0 · end card at the surface
    tl.to(q('.im-end'), { autoAlpha: 1, duration: 0.01 }, 3.0);
    tl.fromTo(q('.im-end > *'), { y: 30, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.3, ease: 'expo.out' }, 3.0);
  }, 3.9);

  return (
    <div ref={ref} style={spacer('impact')}>
      <section className="act-layer act-impact">
        <svg className="im-map absolute inset-0 h-full w-full" viewBox={VIEW} preserveAspectRatio="xMidYMid meet" style={{ maskImage: 'radial-gradient(ellipse 70% 75% at 50% 45%, #000 55%, transparent 100%)' }}>
          <path d={LAND_PATH} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="7" vectorEffect="non-scaling-stroke" />
          <path d={LAND_PATH} fill="rgba(56,189,248,0.07)" stroke="rgba(186,230,253,0.75)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          {SECTORS.map((s) => {
            const [x, y] = project(s.lat, s.lon);
            const c = s.status === 'HIGH ALERT' ? '#F43F5E' : s.status === 'ACTIVE SURVEY' ? '#FFB703' : '#10B981';
            return (
              <g key={s.id}>
                <circle className="impact-pulse" cx={x} cy={y} r="22" fill="none" stroke={c} strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ animationDelay: `${(s.lat % 3) * 0.6}s` }} />
                <circle cx={x} cy={y} r="9" fill={c} />
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-x-[7vw] top-[55vh] grid grid-cols-4 gap-4">
          {IMPACT.map((m, i) => {
            const I = ICONS[i];
            return (
              <div key={m.title} className="im-card cursor-target">
                <SpotlightCard className="!rounded-xl !border-white/10 !bg-[#0A0F18]/85 !p-5 backdrop-blur" spotlightColor="rgba(255, 183, 3, 0.18)">
                  <I size={20} style={{ color: m.color }} />
                  <h4 className="display mt-3 text-xl">{m.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{m.body}</p>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 top-[80vh] flex justify-center gap-3">
          {AUDIENCES.map((a) => <span key={a} className="im-aud chip !px-4 !py-2 !text-[11px] !text-white/80">{a}</span>)}
        </div>

        {/* the ascent */}
        <div className="im-rise pointer-events-none absolute inset-0">
          <div className="im-net absolute left-[30vw] top-[40vh] w-[40vw] opacity-60"><GhostNet className="w-full" /></div>
          <div className="im-turtle absolute left-[44vw] top-[50vh] w-[12vw]"><Turtle className="w-full" /></div>
        </div>

        {/* end card */}
        <div className="im-end absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
          <img src="/ani/sonarx-banner.png" alt="SONARX — MoES Subsea Intelligence · SIH 26057" className="h-[15vh] w-auto drop-shadow-[0_6px_30px_rgba(0,0,0,.45)]" />
          <h2 className="display max-w-[70vw] text-[clamp(34px,4.6vw,84px)]">From sonar noise to verified marine intelligence.</h2>
          <p className="hud-label text-white/60">Team {TEAM.name} · Team ID {TEAM.id} · SIH 2026 · PS {TEAM.ps} · MoES / NIOT</p>
          <div className="pointer-events-auto flex gap-3">
            <a href="/" className="cursor-target btn-primary">Open the live dashboard <ArrowRight size={16} /></a>
            <button className="cursor-target panel-btn !px-4 !py-2.5 flex items-center gap-2" onClick={() => scrollToY(0, 3.2)}><RotateCcw size={14} /> Replay</button>
          </div>
          <ShinyText text="See beneath the surface." className="hud-label !text-[12px]" color="#64748B" shineColor="#FFB703" speed={3} />
        </div>
      </section>
    </div>
  );
}
