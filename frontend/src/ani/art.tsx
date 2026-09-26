// Line-art for the story. Everything is stroked so DrawSVG can "draw" it on scroll.
import type { SVGProps } from 'react';

export function AuvSide(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 260 70" fill="none" {...props}>
      <path d="M26 35 L6 14 L16 14 L44 29" stroke="#94A3B8" strokeWidth="1.5" fill="rgba(148,163,184,0.08)" />
      <path d="M26 35 L6 56 L16 56 L44 41" stroke="#94A3B8" strokeWidth="1.5" fill="rgba(148,163,184,0.08)" />
      <path d="M4 26 V44" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 35 C22 23 42 19 72 19 H198 C226 19 248 26 255 35 C248 44 226 51 198 51 H72 C42 51 22 47 22 35 Z" stroke="#E2E8F0" strokeWidth="1.6" fill="rgba(10,15,24,0.9)" />
      <path d="M204 20 C214 26 214 44 204 50" stroke="#FFB703" strokeWidth="3" opacity="0.9" />
      <path d="M80 27 H186" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <rect x="112" y="51" width="56" height="5" rx="2" stroke="#38BDF8" strokeWidth="1.2" fill="rgba(56,189,248,0.15)" />
      <circle cx="246" cy="35" r="2.6" fill="#FFB703" className="auv-light" />
      <text x="92" y="41" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="JetBrains Mono" letterSpacing="1.5">SONARX · AUV-07</text>
    </svg>
  );
}

export function AuvTop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 200" fill="none" {...props}>
      <path d="M30 4 C44 4 48 22 48 40 V160 C48 176 40 188 30 196 C20 188 12 176 12 160 V40 C12 22 16 4 30 4 Z" stroke="#E2E8F0" strokeWidth="1.6" fill="rgba(10,15,24,0.9)" />
      <path d="M12 70 H4 V130 H12 M48 70 H56 V130 H48" stroke="#38BDF8" strokeWidth="1.4" />
      <path d="M16 20 C22 14 38 14 44 20" stroke="#FFB703" strokeWidth="3" />
      <circle cx="30" cy="10" r="2.5" fill="#FFB703" className="auv-light" />
    </svg>
  );
}

export function Turtle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 180" fill="none" stroke="#BAE6FD" strokeWidth="1.6" strokeLinejoin="round" {...props}>
      <path className="draw" d="M100 6 C112 6 118 18 116 30 C114 38 108 42 100 42 C92 42 86 38 84 30 C82 18 88 6 100 6 Z" />
      <path className="draw" d="M64 66 C40 40 16 36 4 50 C22 60 42 76 58 92" />
      <path className="draw" d="M136 66 C160 40 184 36 196 50 C178 60 158 76 142 92" />
      <path className="draw" d="M70 138 C58 152 54 164 58 172 C70 166 78 156 84 146" />
      <path className="draw" d="M130 138 C142 152 146 164 142 172 C130 166 122 156 116 146" />
      <path className="draw" d="M100 40 C140 40 152 72 152 96 C152 128 130 156 100 158 C70 156 48 128 48 96 C48 72 60 40 100 40 Z" fill="rgba(56,189,248,0.06)" />
      <path className="draw" d="M100 62 L118 76 L114 100 L100 110 L86 100 L82 76 Z M100 110 V150 M82 76 L60 70 M118 76 L140 70 M86 100 L58 116 M114 100 L142 116 M100 62 V42" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

// A draped net: warped grid of strands + floats along the head-rope + a few torn loose ends.
export function GhostNet(props: SVGProps<SVGSVGElement>) {
  const cols = 13, rows = 9, W = 520, H = 340;
  const pt = (i: number, j: number) => {
    const u = i / (cols - 1), v = j / (rows - 1);
    const x = 30 + u * (W - 60) + Math.sin(v * 3 + u * 5) * 14;
    const y = 30 + v * (H - 80) + Math.sin(u * 6.2) * 26 * v + v * v * 30 * Math.sin(u * 2.4 + 1);
    return [x, y] as const;
  };
  const lines: string[] = [];
  for (let j = 0; j < rows; j++) lines.push('M' + Array.from({ length: cols }, (_, i) => pt(i, j).join(' ')).join(' L'));
  for (let i = 0; i < cols; i++) lines.push('M' + Array.from({ length: rows }, (_, j) => pt(i, j).join(' ')).join(' L'));
  const loose = [
    `M${pt(12, 8).join(' ')} C 500 330 470 350 440 356`,
    `M${pt(0, 8).join(' ')} C 20 330 44 352 70 356`,
    `M${pt(6, 8).join(' ')} C 270 320 250 346 262 358`,
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} fill="none" {...props}>
      {lines.map((d, k) => <path key={k} className="draw" d={d} stroke="rgba(186,230,253,0.55)" strokeWidth="1.1" />)}
      {loose.map((d, k) => <path key={'l' + k} className="draw" d={d} stroke="rgba(186,230,253,0.4)" strokeWidth="1" />)}
      {Array.from({ length: cols }, (_, i) => {
        const [x, y] = pt(i, 0);
        return i % 2 === 0 ? <circle key={'f' + i} className="float" cx={x} cy={y - 4} r="5" fill="rgba(255,183,3,0.75)" /> : null;
      })}
    </svg>
  );
}
