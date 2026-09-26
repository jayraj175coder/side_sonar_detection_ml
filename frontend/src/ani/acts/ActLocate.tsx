import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap, useAct, drive, spacer } from '../scroll';
import { playSfx } from '../Hud';
import { pixelToLatLon, FILTER_OFF, WIN, SW, SH, PX_PER_M, type Cand, type Swath } from '../swath';
import { GEO_H, GEO_W, LAND_PATH, project } from '../geo';
import { ALT_M, CLASSES, GROUND_M, HERO, MISSION, MODEL, SECTORS, SLANT_M, TRACKLINES } from '../story';

const AMBER = '#FFB703';
const K = 9.05e-4; // map units per metre (geo.ts: 1° lat = 100 units)
const pad2 = (n: number) => String(n).padStart(2, '0');
const [IN_X, IN_Y] = project(19.5, 80.2); // framing centre for all of India
const sid = (c: Cand) => `SX-T${pad2(c.id)}`;
const severity = (c: Cand) =>
  c.id === 7 ? 'CRITICAL' : c.kind === 'net' || c.kind === 'pipe' ? 'HIGH' : c.kind === 'anomaly' || c.conf >= 0.7 ? 'MEDIUM' : 'LOW';
const CITY: Record<string, string> = { 'SEC-MUM': 'Mumbai', 'SEC-GOA': 'Goa', 'SEC-KOC': 'Kochi', 'SEC-GOM': 'Gulf of Mannar', 'SEC-CHE': 'Chennai', 'SEC-VZG': 'Visakhapatnam', 'SEC-PBL': 'Port Blair', 'SEC-LAK': 'Lakshadweep' };

// JSON lines with light syntax colouring (field names follow backend/app/schemas/detection.py)
type Tok = [string, string?];
function reportLines(verified: Cand[]): Tok[][] {
  const hero = verified.find((c) => c.id === 7)!;
  const rest = verified.filter((c) => c !== hero).sort((a, b) => b.conf - a.conf);
  const k = (s: string): Tok => [`"${s}"`, 'text-[#93C5FD]'];
  const str = (s: string): Tok => [`"${s}"`, 'text-[#FCD34D]'];
  const num = (n: number | boolean): Tok => [String(n), 'text-[#6EE7B7]'];
  const p = (s: string): Tok => [s, 'text-white/40'];
  const ind = (n: number): Tok => ['  '.repeat(n)];
  const line = (n: number, ...t: Tok[]) => [ind(n), ...t];
  const count = (key: Cand['kind']) => verified.filter((c) => c.kind === key).length;
  return [
    [p('{')],
    line(1, k('scan_id'), p(': '), str(`${MISSION.id}-L02`), p(',')),
    line(1, k('filename'), p(': '), str(MISSION.file), p(',')),
    line(1, k('model_name'), p(': '), str(`${MODEL.name}-SIH-Marine-Debris-V2`), p(',')),
    line(1, k('inference_ms'), p(': '), num(MODEL.cpuMs), p(',')),
    line(1, k('total_detections'), p(': '), num(verified.length), p(',')),
    line(1, k('false_positives_suppressed'), p(': '), num(20), p(',')),
    line(1, k('ghost_net_count'), p(': '), num(count('net')), p(', '), k('pipeline_count'), p(': '), num(count('pipe')), p(',')),
    line(1, k('detections'), p(': [')),
    line(2, p('{')),
    line(3, k('id'), p(': '), str(sid(hero)), p(', '), k('type'), p(': '), str(hero.cls), p(',')),
    line(3, k('confidence'), p(': '), num(hero.conf), p(', '), k('confidence_tier'), p(': '), str('HIGH'), p(',')),
    line(3, k('bbox'), p(': { '), k('x1'), p(': '), num(hero.x), p(', '), k('y1'), p(': '), num(hero.y), p(', '), k('x2'), p(': '), num(hero.x + hero.w), p(', '), k('y2'), p(': '), num(hero.y + hero.h), p(' },')),
    line(3, k('noise_filter_passed'), p(': '), num(true), p(',')),
    line(3, k('location'), p(': { '), k('latitude'), p(': '), num(HERO.lat), p(', '), k('longitude'), p(': '), num(HERO.lon), p(', '), k('heading'), p(': '), num(315), p(' },')),
    line(3, k('size_m'), p(': { '), k('length'), p(': '), num(HERO.length), p(', '), k('width'), p(': '), num(HERO.width), p(' },')),
    line(3, k('severity'), p(': '), [`"CRITICAL"`, 'text-[#FDA4AF]']),
    line(2, p('},')),
    ...rest.slice(0, 4).map((c) => line(2, p('{ '), k('id'), p(': '), str(sid(c)), p(', '), k('type'), p(': '), str(c.cls), p(', '), k('confidence'), p(': '), num(+c.conf.toFixed(3)), p(', '), k('latitude'), p(': '), num(+c.lat.toFixed(5)), p(' },'))),
    line(2, [`// … ${rest.length - 4} more`, 'text-white/30']),
    line(1, p(']')),
    [p('}')],
  ];
}

export default function ActLocate({ sw }: { sw: Swath }) {
  const verified = useMemo(() => sw.cands.filter((c) => c.real), [sw]);
  const lines = useMemo(() => reportLines(verified), [verified]);
  const svg = useRef<SVGSVGElement>(null);
  const cam = useRef({ z: 0, rot: 45 });

  // the console's final frame, as an image placed at the swath's true footprint and heading
  const swathImg = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = SW; c.height = WIN;
    c.getContext('2d')!.drawImage(sw.clean, 0, FILTER_OFF, SW, WIN, 0, 0, SW, WIN);
    return c.toDataURL('image/jpeg', 0.88);
  }, [sw]);
  const fullImg = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = SW / 2; c.height = SH / 2;
    c.getContext('2d')!.drawImage(sw.clean, 0, 0, SW, SH, 0, 0, SW / 2, SH / 2);
    return c.toDataURL('image/jpeg', 0.8);
  }, [sw]);
  const top = pixelToLatLon(SW / 2, SH / 2);
  const [fx, fy] = project(top.lat, top.lon);
  const fullH = (SH / PX_PER_M) * K;
  const mid = pixelToLatLon(SW / 2, FILTER_OFF + WIN / 2);
  const [mx, my] = project(mid.lat, mid.lon);
  const imgW = (SW / PX_PER_M) * K, imgH = (WIN / PX_PER_M) * K;
  const [hx, hy] = project(HERO.lat, HERO.lon);
  const pins = verified.map((c) => ({ c, xy: project(c.lat, c.lon) }));
  const track = pixelToLatLon(SW / 2, sw.hero.y + sw.hero.h / 2);

  // camera: z 0 → 1 is a log zoom from the swath to all of India; rot swings the swath to north-up
  const applyCamera = () => {
    const el = svg.current;
    if (!el) return;
    const W = window.innerWidth, H = window.innerHeight;
    const upp0 = imgH / (0.7 * H), upp1 = 2500 / (0.82 * H);
    const { z, rot } = cam.current;
    const upp = upp0 * Math.pow(upp1 / upp0, z);
    const w = (upp - upp0) / (upp1 - upp0);
    const cx = mx + (IN_X - mx) * w, cy = my + (IN_Y - my) * w;
    const sy = 0.48 * H * (1 - w) + 0.5 * H * w; // the swath box sat at 48 % height
    el.setAttribute('viewBox', `${cx - (W / 2) * upp} ${cy - sy * upp} ${W * upp} ${H * upp}`);
    el.querySelector('.world')!.setAttribute('transform', `rotate(${rot} ${mx} ${my})`);
    el.querySelectorAll<SVGCircleElement>('[data-r]').forEach((n) => n.setAttribute('r', String(Number(n.dataset.r) * upp)));
    el.querySelectorAll<SVGTextElement>('[data-fs]').forEach((n) => {
      n.setAttribute('font-size', String(Number(n.dataset.fs) * upp));
      if (n.dataset.dx) n.setAttribute('x', String(Number(n.dataset.x0) + Number(n.dataset.dx) * upp));
    });
    const fine = el.querySelector<SVGGElement>('.grid-fine')!, coarse = el.querySelector<SVGGElement>('.grid-coarse')!, zoomed = el.querySelectorAll<SVGGElement>('.far');
    fine.style.opacity = String(1 - Math.min(1, z / 0.25));
    coarse.style.opacity = String(Math.min(1, Math.max(0, (z - 0.45) / 0.3)));
    zoomed.forEach((g) => (g.style.opacity = String(Math.min(1, Math.max(0, (z - 0.55) / 0.3)))));
  };
  useLayoutEffect(() => {
    applyCamera();
    window.addEventListener('resize', applyCamera);
    return () => window.removeEventListener('resize', applyCamera);
  }, []);

  const ref = useAct('locate', (tl, root) => {
    const q = gsap.utils.selector(root);
    gsap.set(q('.lc-geo, .lc-coord, .lc-report, .lc-csv, .lc-chip, .lc-card'), { autoAlpha: 0 });
    gsap.set(q('.lc-geo path.draw'), { drawSVG: '0%' });
    gsap.set(q('.pin:not(.pin-hero)'), { autoAlpha: 0 });
    tl.to(q('.lc-full'), { opacity: 0.85, duration: 0.2 }, 1.65);
    gsap.set(q('.track'), { drawSVG: '0%' });
    gsap.set(q('.lc-line'), { clipPath: 'inset(0 100% 0 0)' });
    const move = (z: number, rot: number) => { cam.current.z = z; cam.current.rot = rot; applyCamera(); };

    // 0 – 0.8 · the swath swings to its true heading
    drive(tl, 0, 0.8, (p) => move(0.06 * p, 45 * (1 - p)), 'power2.inOut');
    // 0.8 – 1.6 · slant range → ground range → coordinates
    tl.to(q('.lc-geo'), { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power3.out' }, 0.8);
    tl.to(q('.lc-geo path.draw'), { drawSVG: '100%', stagger: 0.08, duration: 0.25 }, 0.9);
    // 1.6 – 2.2 · the fix, then every target lands
    tl.to(q('.lc-coord'), { autoAlpha: 1, duration: 0.1 }, 1.6);
    tl.to(q('.lc-coord-v'), { scrambleText: { text: `${HERO.lat.toFixed(4)}° N · ${HERO.lon.toFixed(4)}° E`, chars: '0123456789.', speed: 0.6 }, duration: 0.3 }, 1.6);
    tl.to(q('.lc-geo'), { autoAlpha: 0, duration: 0.15 }, 1.9);
    q('.pin:not(.pin-hero)').forEach((el: Element, i: number) => {
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 1.7 + i * 0.025);
      tl.call(() => playSfx('ping', 90, 1.3), [], 1.7 + i * 0.025);
    });
    // 2.2 – 3.0 · zoom out to the whole coastline
    tl.to(q('.lc-coord'), { autoAlpha: 0, duration: 0.1 }, 2.2);
    drive(tl, 2.2, 0.8, (p) => move(0.06 + 0.94 * p, 0), 'power2.inOut');
    tl.to(q('.track'), { drawSVG: '100%', stagger: 0.05, duration: 0.3 }, 2.65);
    // 3.0 – 4.4 · the report
    tl.to(q('.lc-map'), { xPercent: -22, autoAlpha: 0.45, duration: 0.35, ease: 'power3.inOut' }, 3.0);
    tl.fromTo(q('.lc-report'), { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' }, 3.05);
    const lineEls = q('.lc-line');
    tl.to(lineEls, { clipPath: 'inset(0 0% 0 0)', stagger: 1 / lineEls.length, duration: 0.9 / lineEls.length }, 3.4);
    drive(tl, 3.4, 1.0, (p) => p > 0 && p < 1 && playSfx('tick', 55));
    // 4.4 – 5.0 · also as CSV, exportable; top priorities stack up
    tl.to(q('.lc-json'), { scaleX: 0, duration: 0.12, ease: 'power2.in' }, 4.4);
    tl.fromTo(q('.lc-csv'), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: 'power2.out' }, 4.52);
    tl.fromTo(q('.lc-chip'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.1, ease: 'back.out(2)' }, 4.6);
    tl.fromTo(q('.lc-card'), { autoAlpha: 0, y: 80 }, { autoAlpha: (i: number) => 1 - i * 0.2, y: 0, stagger: 0.08, duration: 0.2, ease: 'power3.out' }, 4.6);
  }, 4.9);

  const topCards = [sw.hero, ...verified.filter((c) => c.id !== 7).sort((a, b) => b.conf - a.conf).slice(0, 2)];
  const csvRows = verified.slice().sort((a, b) => (a.id === 7 ? -1 : b.id === 7 ? 1 : b.conf - a.conf)).slice(0, 7);

  return (
    <div ref={ref} style={spacer('locate')}>
      <section className="act-layer act-locate bg-[#05070B]">
        <svg ref={svg} className="lc-map absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" style={{ maskImage: 'radial-gradient(ellipse 75% 80% at 50% 50%, #000 60%, transparent 100%)' }}>
          <g className="world">
            <g className="grid-coarse" opacity="0">
              {Array.from({ length: 9 }, (_, i) => 64 + i * 4).map((lon) => { const [x] = project(0, lon); return <line key={lon} x1={x} y1="0" x2={x} y2={GEO_H} stroke="rgba(255,255,255,.06)" vectorEffect="non-scaling-stroke" />; })}
              {Array.from({ length: 8 }, (_, i) => 2 + i * 4).map((lat) => { const [, y] = project(lat, 60); return <line key={lat} x1="0" y1={y} x2={GEO_W} y2={y} stroke="rgba(255,255,255,.06)" vectorEffect="non-scaling-stroke" />; })}
            </g>
            <path d={LAND_PATH} fill="rgba(56,189,248,0.06)" stroke="rgba(186,230,253,0.55)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            <g className="grid-fine">
              {Array.from({ length: 41 }, (_, i) => i - 20).map((i) => (
                <g key={i}>
                  <line x1={mx + i * 0.05} y1={my - 1} x2={mx + i * 0.05} y2={my + 1} stroke="rgba(56,189,248,.12)" vectorEffect="non-scaling-stroke" />
                  <line x1={mx - 1} y1={my + i * 0.05} x2={mx + 1} y2={my + i * 0.05} stroke="rgba(56,189,248,.12)" vectorEffect="non-scaling-stroke" />
                </g>
              ))}
            </g>
            {TRACKLINES.map((t) => (
              <path key={t.id} className="track far" d={'M' + t.path.map(([la, lo]) => project(la, lo).join(' ')).join(' L')} stroke={t.color} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
            ))}
            <g className="far">
              {SECTORS.map((s) => {
                const [x, y] = project(s.lat, s.lon);
                const c = s.status === 'HIGH ALERT' ? '#F43F5E' : s.status === 'ACTIVE SURVEY' ? AMBER : '#10B981';
                return (
                  <g key={s.id}>
                    <circle cx={x} cy={y} data-r="4" fill={c} />
                    <circle cx={x} cy={y} data-r="10" fill="none" stroke={c} strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
                    <text x={x} y={y} data-x0={x} data-dx="14" data-fs="11" dominantBaseline="middle" fill="rgba(255,255,255,.7)" fontFamily="JetBrains Mono" letterSpacing="1">{s.id === 'SEC-MUM' ? '' : CITY[s.id]}</text>
                  </g>
                );
              })}
            </g>
            <image className="lc-full" href={fullImg} x={fx - imgW / 2} y={fy - fullH / 2} width={imgW} height={fullH} preserveAspectRatio="none" transform={`rotate(-45 ${fx} ${fy})`} opacity="0" />
            <image href={swathImg} x={mx - imgW / 2} y={my - imgH / 2} width={imgW} height={imgH} preserveAspectRatio="none" transform={`rotate(-45 ${mx} ${my})`} />
            {pins.map(({ c, xy: [x, y] }) => (
              <g key={c.id} className={`pin ${c.id === 7 ? 'pin-hero' : ''}`}>
                <circle cx={x} cy={y} data-r={c.id === 7 ? 7 : 4.5} fill={c.id === 7 ? AMBER : CLASSES[c.cls].color} stroke="#05070B" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            <circle className="lc-ring" cx={hx} cy={hy} r={HERO.uncertaintyRadiusM! * K} fill="rgba(255,183,3,0.08)" stroke={AMBER} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <circle className="far" cx={hx} cy={hy} data-r="16" fill="none" stroke={AMBER} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <text className="far" x={hx} y={hy} data-x0={hx} data-dx="22" data-fs="12" dominantBaseline="middle" fill={AMBER} fontFamily="JetBrains Mono" letterSpacing="1">SX-014 · Mumbai</text>
          </g>
        </svg>

        {/* slant range → ground range */}
        <div className="lc-geo panel absolute left-[6vw] top-[16vh] w-[26vw] -translate-x-6 p-4">
          <span className="hud-label text-[#FFB703]">Slant range → ground range</span>
          <svg viewBox="0 0 300 170" className="mt-3 w-full">
            <path d="M10 140 H290" stroke="rgba(186,230,253,.45)" fill="none" />
            <circle cx="40" cy="30" r="7" fill="#0A0F18" stroke="#E2E8F0" />
            <path className="draw" d="M40 37 V140" stroke="#94A3B8" strokeDasharray="4 4" fill="none" />
            <path className="draw" d="M40 30 L250 140" stroke={AMBER} strokeWidth="1.5" fill="none" />
            <path className="draw" d="M40 152 H250" stroke="#10B981" strokeWidth="1.5" fill="none" />
            <rect x="238" y="128" width="24" height="12" fill="rgba(255,183,3,.3)" stroke={AMBER} />
            <text x="150" y="76" fill={AMBER} fontSize="12" fontFamily="JetBrains Mono">R = {SLANT_M} m</text>
            <text x="46" y="92" fill="#94A3B8" fontSize="12" fontFamily="JetBrains Mono">H = {ALT_M} m</text>
            <text x="120" y="167" fill="#10B981" fontSize="12" fontFamily="JetBrains Mono">G = √(R² − H²) = {GROUND_M.toFixed(1)} m</text>
          </svg>
          <div className="mt-3 flex flex-col gap-1 border-t border-white/[0.06] pt-3">
            <span className="hud-label text-white/40">Ping-log fix · heading 315.0°</span>
            <span className="mono text-xs text-white/75">{track.lat.toFixed(5)}° N · {track.lon.toFixed(5)}° E</span>
            <span className="mono text-xs text-white/45">+ {GROUND_M.toFixed(1)} m to port → target</span>
          </div>
        </div>

        <div className="lc-coord absolute bottom-[22vh] left-[6vw]">
          <span className="hud-label text-white/50">Target {HERO.id} · WGS-84</span>
          <p className="lc-coord-v display tnum mt-2 text-[clamp(28px,3.4vw,60px)] text-white">00.0000° N · 00.0000° E</p>
          <span className="hud-label text-[#FFB703]">± {HERO.uncertaintyRadiusM} m · depth {HERO.depth} m</span>
        </div>

        {/* report */}
        <div className="lc-report panel absolute right-[7vw] top-[12vh] flex h-[70vh] w-[40vw] flex-col overflow-hidden">
          <div className="panel-title">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#F43F5E]/70" /><i className="h-2.5 w-2.5 rounded-full bg-[#FFB703]/70" /><i className="h-2.5 w-2.5 rounded-full bg-[#10B981]/70" /><span className="hud-label ml-2 text-white/60">{MISSION.id.toLowerCase()}_report</span></span>
            <span className="flex gap-1.5">{['JSON', 'CSV', 'GeoJSON', 'KML'].map((f) => <span key={f} className="lc-chip chip !text-[9.5px] !text-[#FFB703]">{f}</span>)}</span>
          </div>
          <div className="relative flex-1">
            <pre className="lc-json mono absolute inset-0 origin-center overflow-hidden p-4 text-[12px] leading-[1.6]">
              {lines.map((toks, i) => (
                <div key={i} className="lc-line whitespace-pre">
                  {toks.map(([t, cls], j) => <span key={j} className={cls}>{t}</span>)}
                </div>
              ))}
            </pre>
            <div className="lc-csv mono absolute inset-0 origin-center overflow-hidden p-4 text-[11.5px]">
              <div className="grid grid-cols-[5.5rem_1fr_4rem_5.5rem_5.5rem_4.5rem] gap-x-3 border-b border-white/10 pb-2 uppercase tracking-wider text-white/40">
                <span>id</span><span>type</span><span>conf</span><span>lat</span><span>lon</span><span>sev</span>
              </div>
              {csvRows.map((c) => (
                <div key={c.id} className="grid grid-cols-[5.5rem_1fr_4rem_5.5rem_5.5rem_4.5rem] gap-x-3 border-b border-white/[0.04] py-2 text-white/80 tnum">
                  <span className="text-[#FFB703]">{sid(c)}</span><span className="truncate">{c.cls}</span><span>{c.conf.toFixed(3)}</span><span>{c.lat.toFixed(5)}</span><span>{c.lon.toFixed(5)}</span>
                  <span className={severity(c) === 'CRITICAL' ? 'text-[#F43F5E]' : severity(c) === 'HIGH' ? 'text-[#FFB703]' : 'text-white/60'}>{severity(c)}</span>
                </div>
              ))}
              <p className="mt-3 text-white/35">sx014_report.csv · {verified.length} rows · downloadable from the dashboard</p>
            </div>
          </div>
        </div>

        {/* priority stack */}
        <div className="absolute bottom-[14vh] left-[6vw] w-[30vw]">
          {topCards.map((c, i) => (
            <div key={c.id} className="lc-card panel absolute left-0 right-0 flex items-center gap-4 px-4 py-3" style={{ bottom: i * 26, transform: `scale(${1 - i * 0.05})`, zIndex: 3 - i }}>
              <span className="display text-2xl" style={{ color: c.id === 7 ? AMBER : CLASSES[c.cls].color }}>{sid(c)}</span>
              <span className="flex-1 text-sm text-white/80">{CLASSES[c.cls].label}</span>
              <span className="hud-label" style={{ color: severity(c) === 'CRITICAL' ? '#F43F5E' : AMBER }}>{severity(c)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
