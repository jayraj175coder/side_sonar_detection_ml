import React, { useEffect, useRef, useState } from 'react';

interface PingWave {
  id: number;
  x: number;
  y: number;
}

export const TacticalSonarCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pings, setPings] = useState<PingWave[]>([]);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number>(0);
  const pingCounter = useRef(0);

  useEffect(() => {
    // Disable on touch / mobile devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, .panel-btn');
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Spawn an acoustic sonar ripple ping
      const newPing: PingWave = {
        id: ++pingCounter.current,
        x: e.clientX,
        y: e.clientY,
      };

      setPings((prev) => [...prev.slice(-4), newPing]);

      // Remove after animation completes
      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== newPing.id));
      }, 700);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth Lerp loop for the trailing sonar ring
    const render = () => {
      // Lerp ring towards mouse
      const ease = 0.22;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  // Don't render on server or if not visible
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* 1. Acoustic Ripple Pings spawned on click */}
      {pings.map((ping) => (
        <div
          key={ping.id}
          className="absolute rounded-full border border-[#FFB703] animate-ping-wave pointer-events-none"
          style={{
            left: `${ping.x}px`,
            top: `${ping.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* 2. Trailing Tactical Sonar Reticle Ring */}
      <div
        ref={ringRef}
        className={`absolute rounded-full pointer-events-none transition-all duration-200 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-11 h-11 border border-[#FFB703] bg-[#FFB703]/[0.08] shadow-[0_0_16px_rgba(255,183,3,0.35)] scale-110'
            : 'w-7 h-7 border border-[#FFB703]/40 bg-transparent shadow-[0_0_8px_rgba(255,183,3,0.15)] scale-100'
        }`}
      >
        {/* Orthogonal Reticle Caliper Ticks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-[#FFB703] opacity-60" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-[#FFB703] opacity-60" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-[#FFB703] opacity-60" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-[#FFB703] opacity-60" />

        {/* Hover Target Lock Caliper Brackets */}
        {isHovered && (
          <div className="absolute inset-0 rounded-full border border-dashed border-[#FFB703]/50 animate-spin" style={{ animationDuration: '6s' }} />
        )}
      </div>

      {/* 3. Center Precision Emitter Dot */}
      <div
        ref={dotRef}
        className={`absolute rounded-full pointer-events-none transition-transform duration-100 ${
          isHovered
            ? 'w-2 h-2 bg-[#FFB703] shadow-[0_0_8px_#FFB703] scale-125'
            : 'w-1.5 h-1.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] scale-100'
        }`}
      />
    </div>
  );
};

export default TacticalSonarCursor;
