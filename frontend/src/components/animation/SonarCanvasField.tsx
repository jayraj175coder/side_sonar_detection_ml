import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TargetPoint {
  id: string;
  name: string;
  type: string;
  confidence: number;
  lat: string;
  lon: string;
  status: 'VERIFIED' | 'REVIEW' | 'INFRASTRUCTURE' | 'HIGH RISK';
  color: string;
  angle: number; // in radians
  distanceRatio: number; // 0 to 1 of radius
  lastPingTime: number; // timestamp
  opacity: number;
  highlightIntensity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
}

interface SonarCanvasFieldProps {
  className?: string;
  interactive?: boolean;
  onTargetClick?: (targetId: string) => void;
  showOpeningSequence?: boolean;
  onOpeningComplete?: () => void;
}

export const SonarCanvasField: React.FC<SonarCanvasFieldProps> = ({
  className = '',
  interactive = true,
  onTargetClick,
  showOpeningSequence = false,
  onOpeningComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredTarget, setHoveredTarget] = useState<TargetPoint | null>(null);
  const [openingPhase, setOpeningPhase] = useState<number>(showOpeningSequence ? 0 : 4);
  const [isOpeningFinished, setIsOpeningFinished] = useState<boolean>(!showOpeningSequence);

  // Targets definition aligned with MoES problem statement
  const targetsRef = useRef<TargetPoint[]>([
    {
      id: 'SX-T07',
      name: 'Ghost Net (ALDFG)',
      type: 'SYNTHETIC NYLON GILLNET',
      confidence: 94.7,
      lat: '18.5204° N',
      lon: '73.8567° E',
      status: 'VERIFIED',
      color: '#00D4AA',
      angle: 0.65, // ~37 degrees
      distanceRatio: 0.60,
      lastPingTime: 0,
      opacity: 0.25,
      highlightIntensity: 0,
    },
    {
      id: 'SX-T14',
      name: 'Lost Trawl Gear',
      type: 'METALLIC TRAWL DOOR & CABLE',
      confidence: 91.2,
      lat: '18.5188° N',
      lon: '73.8612° E',
      status: 'REVIEW',
      color: '#F59E0B',
      angle: 2.45, // ~140 degrees
      distanceRatio: 0.74,
      lastPingTime: 0,
      opacity: 0.25,
      highlightIntensity: 0,
    },
    {
      id: 'SX-T03',
      name: 'Pipeline Free-Span',
      type: 'SUBSEA HYDROCARBON CONDUIT',
      confidence: 88.9,
      lat: '18.5240° N',
      lon: '73.8510° E',
      status: 'INFRASTRUCTURE',
      color: '#38BDF8',
      angle: 3.85, // ~220 degrees
      distanceRatio: 0.46,
      lastPingTime: 0,
      opacity: 0.25,
      highlightIntensity: 0,
    },
    {
      id: 'SX-T09',
      name: 'Seafloor Anomaly',
      type: 'ACOUSTIC CONTACT (HIGH RELIEF)',
      confidence: 76.4,
      lat: '18.5152° N',
      lon: '73.8690° E',
      status: 'HIGH RISK',
      color: '#EF4444',
      angle: 5.42, // ~310 degrees
      distanceRatio: 0.68,
      lastPingTime: 0,
      opacity: 0.25,
      highlightIntensity: 0,
    },
  ]);

  const mousePosRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: 0,
    y: 0,
    isHovering: false,
  });

  const particlesRef = useRef<Particle[]>([]);
  const pingWavesRef = useRef<Array<{ r: number; maxR: number; alpha: number; speed: number }>>([]);
  const animFrameIdRef = useRef<number>(0);
  const sweepAngleRef = useRef<number>(0);
  const lastWaveTimeRef = useRef<number>(0);
  const introStartTimeRef = useRef<number>(Date.now());

  // Initialize particles
  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const count = window.innerWidth < 768 ? 24 : 48;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.35 + 0.1,
        baseAlpha: Math.random() * 0.35 + 0.1,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Handle opening sequence transition
  useEffect(() => {
    if (!showOpeningSequence) {
      setIsOpeningFinished(true);
      return;
    }

    introStartTimeRef.current = Date.now();
    const timers = [
      setTimeout(() => setOpeningPhase(1), 500),  // Ping pulse
      setTimeout(() => setOpeningPhase(2), 1200), // Sonar field appears
      setTimeout(() => setOpeningPhase(3), 1900), // Hero ghost net target detected
      setTimeout(() => {
        setOpeningPhase(4);
        setIsOpeningFinished(true);
        onOpeningComplete?.();
      }, 2600), // Full interactive mode
    ];

    return () => timers.forEach(clearTimeout);
  }, [showOpeningSequence, onOpeningComplete]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (particlesRef.current.length === 0) {
        initParticles(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.44;

      // ── 1. DRAW SUBTLE POLAR GRID & CONCENTRIC RANGE RINGS ──
      const ringAlpha = isOpeningFinished ? 0.14 : Math.min(0.14, openingPhase * 0.04);

      if (ringAlpha > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(0, 212, 170, ${ringAlpha})`;
        ctx.lineWidth = 1;

        // Faint radial spoke lines (every 45 degrees)
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
          ctx.stroke();
        }

        // Concentric range rings (25m, 50m, 75m, 100m scale)
        const rings = [0.25, 0.5, 0.75, 1.0];
        const ringLabels = ['25 m', '50 m', '75 m', '100 m'];

        rings.forEach((ratio, idx) => {
          const r = maxRadius * ratio;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Distance labels along cardinal axis
          ctx.fillStyle = `rgba(74, 128, 144, ${ringAlpha * 2.2})`;
          ctx.font = '8px monospace';
          ctx.fillText(ringLabels[idx], cx + r + 3, cy - 3);
        });

        // Outer degree markings
        for (let deg = 0; deg < 360; deg += 30) {
          const rad = (deg * Math.PI) / 180;
          const outerR = maxRadius + 5;
          const tickR = maxRadius + (deg % 90 === 0 ? 10 : 6);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * outerR, cy + Math.sin(rad) * outerR);
          ctx.lineTo(cx + Math.cos(rad) * tickR, cy + Math.sin(rad) * tickR);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── 2. ACOUSTIC EXPANDING PING WAVES ──
      if (now - lastWaveTimeRef.current > 4200 && isOpeningFinished) {
        lastWaveTimeRef.current = now;
        pingWavesRef.current.push({
          r: 10,
          maxR: maxRadius * 1.1,
          alpha: 0.35,
          speed: maxRadius / 2.6,
        });
      }

      // Render ping waves
      ctx.save();
      for (let i = pingWavesRef.current.length - 1; i >= 0; i--) {
        const wave = pingWavesRef.current[i];
        wave.r += wave.speed * dt;
        wave.alpha = Math.max(0, 0.35 * (1 - wave.r / wave.maxR));

        if (wave.alpha <= 0.01 || wave.r >= wave.maxR) {
          pingWavesRef.current.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(0, 212, 170, ${wave.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, wave.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ── 3. ROTATING SONAR SWEEP BEAM ──
      if (!prefersReducedMotion && isOpeningFinished) {
        sweepAngleRef.current = (sweepAngleRef.current + dt * 0.45) % (Math.PI * 2);
      } else {
        sweepAngleRef.current = 0.65; // Fixed direction
      }

      const currentSweepAngle = sweepAngleRef.current;

      if (isOpeningFinished) {
        ctx.save();
        // Draw trailing arc gradient
        const trailAngle = Math.PI / 3.5; // ~50 degrees tail
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
        gradient.addColorStop(0, 'rgba(0, 212, 170, 0.08)');
        gradient.addColorStop(0.7, 'rgba(0, 212, 170, 0.04)');
        gradient.addColorStop(1, 'rgba(0, 212, 170, 0.0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxRadius, currentSweepAngle - trailAngle, currentSweepAngle, false);
        ctx.closePath();
        ctx.fill();

        // Main sweep leading line
        ctx.strokeStyle = 'rgba(0, 212, 170, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(currentSweepAngle) * maxRadius,
          cy + Math.sin(currentSweepAngle) * maxRadius
        );
        ctx.stroke();
        ctx.restore();
      }

      // ── 4. FLOATING ACOUSTIC DATA PARTICLES ──
      const mouse = mousePosRef.current;
      ctx.save();
      particlesRef.current.forEach((p) => {
        // Move particle gently
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Proximity to cursor interaction
        let finalAlpha = p.baseAlpha;
        if (mouse.isHovering) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            finalAlpha = Math.min(0.85, p.baseAlpha + (1 - dist / 90) * 0.6);
            if (!prefersReducedMotion) {
              p.x += (dx / dist) * 0.4;
              p.y += (dy / dist) * 0.4;
            }
          }
        }

        ctx.fillStyle = `rgba(0, 212, 170, ${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // ── 5. ACOUSTIC TARGETS & HIT DETECTION ──
      let activeHovered: TargetPoint | null = null;

      targetsRef.current.forEach((target) => {
        const tx = cx + Math.cos(target.angle) * (maxRadius * target.distanceRatio);
        const ty = cy + Math.sin(target.angle) * (maxRadius * target.distanceRatio);

        // Sweep hit check
        const angleDiff = Math.abs(
          Math.atan2(Math.sin(currentSweepAngle - target.angle), Math.cos(currentSweepAngle - target.angle))
        );

        if (angleDiff < 0.08 && isOpeningFinished) {
          target.highlightIntensity = 1.0;
          target.lastPingTime = now;
        } else {
          // Smooth decay
          target.highlightIntensity = Math.max(0, target.highlightIntensity - dt * 0.7);
        }

        // Mouse hover check
        let isDirectlyHovered = false;
        if (mouse.isHovering) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          if (Math.sqrt(dx * dx + dy * dy) < 28) {
            isDirectlyHovered = true;
            activeHovered = target;
          }
        }

        // In opening sequence phase 3, spotlight Ghost Net
        if (openingPhase === 3 && target.id === 'SX-T07') {
          target.highlightIntensity = 1.0;
        }

        const effectiveHighlight = Math.max(target.highlightIntensity, isDirectlyHovered ? 1.0 : 0);
        const baseTargetAlpha = isOpeningFinished ? 0.35 : openingPhase >= 2 ? 0.35 : 0;
        const targetAlpha = Math.min(1.0, baseTargetAlpha + effectiveHighlight * 0.65);

        if (targetAlpha <= 0.05) return;

        ctx.save();

        // Expanding echo ripple on sweep hit
        if (effectiveHighlight > 0.05) {
          const pingAge = (1.0 - effectiveHighlight) * 22;
          ctx.strokeStyle = target.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(tx, ty, 6 + pingAge, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Target core point & halo
        ctx.fillStyle = target.color;
        ctx.shadowColor = target.color;
        ctx.shadowBlur = effectiveHighlight > 0.3 ? 12 : 4;

        ctx.beginPath();
        ctx.arc(tx, ty, effectiveHighlight > 0.3 ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bounding diamond crosshair on detection
        if (effectiveHighlight > 0.25 || isDirectlyHovered) {
          ctx.strokeStyle = target.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.strokeRect(tx - 9, ty - 9, 18, 18);

          // Technical HUD telemetry card
          const hudW = 160;
          const hudH = 46;
          let hudX = tx + 14;
          let hudY = ty - 23;

          // Keep HUD within canvas boundary
          if (hudX + hudW > width - 10) hudX = tx - hudW - 14;
          if (hudY < 10) hudY = 10;

          // HUD Background Box
          ctx.fillStyle = 'rgba(3, 11, 20, 0.92)';
          ctx.fillRect(hudX, hudY, hudW, hudH);
          ctx.strokeStyle = target.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(hudX, hudY, hudW, hudH);

          // Line 1: Target name
          ctx.fillStyle = '#E0F7F4';
          ctx.font = 'bold 9.5px monospace';
          ctx.fillText(target.name.toUpperCase(), hudX + 8, hudY + 14);

          // Line 2: Confidence + Status
          ctx.fillStyle = target.color;
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${target.confidence}% · ${target.status}`, hudX + 8, hudY + 27);

          // Line 3: Geotag Coordinates
          ctx.fillStyle = '#7C98A6';
          ctx.font = '8px monospace';
          ctx.fillText(`${target.lat}, ${target.lon}`, hudX + 8, hudY + 39);
        }

        ctx.restore();
      });

      setHoveredTarget(activeHovered);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [initParticles, isOpeningFinished, openingPhase]);

  // Mouse handlers for interactive responsiveness
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovering: true,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current.isHovering = false;
  };

  const handleCanvasClick = () => {
    if (hoveredTarget && onTargetClick) {
      onTargetClick(hoveredTarget.id);
    }
  };

  const handleSkipIntro = () => {
    setOpeningPhase(4);
    setIsOpeningFinished(true);
    onOpeningComplete?.();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
      className={`relative w-full h-full overflow-hidden select-none pointer-events-auto ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Skip opening button if active */}
      {showOpeningSequence && !isOpeningFinished && (
        <button
          onClick={handleSkipIntro}
          className="absolute top-4 right-4 z-30 px-2.5 py-1 bg-[#082830] border border-[#00D4AA]/40 text-[#00D4AA] text-[9px] font-mono font-bold rounded-xs hover:bg-[#00D4AA] hover:text-[#030B14] transition-all cursor-pointer"
        >
          SKIP INTRO [ESC]
        </button>
      )}
    </div>
  );
};
