import React, { useEffect, useRef } from 'react';

/**
 * AmbientOceanBackdrop
 * 
 * Inspired by atmospheric deep-sea mist and the oceanic cloud aesthetic:
 * - GPU-accelerated 60fps HTML5 canvas rendering organic, volumetric sea clouds
 * - Undulating horizontal oceanic thermocline fog banks that drift and billow
 * - Interactive mouse wake / current disturbance (waves part gently around cursor)
 * - Deep oceanic abyssal palette (#001118 -> #00242f -> #054554)
 * - Fine hydrographic bathymetry grid and floating bioluminescent marine spores
 */
export const AmbientOceanBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for interactive water wake
    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle high-DPI resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ── 1. Volumetric Ocean Cloud / Mist Clusters ──
    interface SeaCloud {
      baseX: number;       // relative 0..1
      baseY: number;       // relative 0..1
      radiusX: number;     // horizontal radius
      radiusY: number;     // vertical radius
      driftSpeedX: number; // horizontal speed
      driftSpeedY: number; // vertical speed
      driftAmpX: number;   // horizontal amplitude
      driftAmpY: number;   // vertical amplitude
      phaseX: number;
      phaseY: number;
      baseAlpha: number;
      pulseSpeed: number;
      colorInner: string;  // highlight mist
      colorOuter: string;  // deep ocean plume
    }

    const clouds: SeaCloud[] = [
      // Upper atmospheric ocean mist
      {
        baseX: 0.25,
        baseY: 0.2,
        radiusX: 520,
        radiusY: 260,
        driftSpeedX: 0.0004,
        driftSpeedY: 0.0003,
        driftAmpX: 90,
        driftAmpY: 45,
        phaseX: 0.2,
        phaseY: 1.1,
        baseAlpha: 0.35,
        pulseSpeed: 0.0006,
        colorInner: 'rgba(5, 69, 84, 0.45)', // teal mist
        colorOuter: 'rgba(0, 36, 47, 0.1)',
      },
      {
        baseX: 0.75,
        baseY: 0.25,
        radiusX: 580,
        radiusY: 280,
        driftSpeedX: -0.00035,
        driftSpeedY: 0.00025,
        driftAmpX: 110,
        driftAmpY: 50,
        phaseX: 2.4,
        phaseY: 0.7,
        baseAlpha: 0.38,
        pulseSpeed: 0.0005,
        colorInner: 'rgba(8, 82, 98, 0.4)',
        colorOuter: 'rgba(0, 41, 53, 0.12)',
      },
      // Middle dense oceanic rolling fog bank (The primary cloud bank seen in EchoRAG)
      {
        baseX: 0.15,
        baseY: 0.55,
        radiusX: 680,
        radiusY: 340,
        driftSpeedX: 0.0003,
        driftSpeedY: -0.0002,
        driftAmpX: 130,
        driftAmpY: 60,
        phaseX: 1.5,
        phaseY: 3.2,
        baseAlpha: 0.48,
        pulseSpeed: 0.0004,
        colorInner: 'rgba(11, 98, 117, 0.5)',
        colorOuter: 'rgba(0, 36, 47, 0.15)',
      },
      {
        baseX: 0.5,
        baseY: 0.5,
        radiusX: 740,
        radiusY: 380,
        driftSpeedX: -0.00025,
        driftSpeedY: 0.00035,
        driftAmpX: 140,
        driftAmpY: 70,
        phaseX: 3.8,
        phaseY: 1.9,
        baseAlpha: 0.52,
        pulseSpeed: 0.00035,
        colorInner: 'rgba(14, 112, 133, 0.45)',
        colorOuter: 'rgba(0, 42, 54, 0.18)',
      },
      {
        baseX: 0.85,
        baseY: 0.6,
        radiusX: 650,
        radiusY: 320,
        driftSpeedX: 0.00032,
        driftSpeedY: -0.00028,
        driftAmpX: 120,
        driftAmpY: 55,
        phaseX: 5.1,
        phaseY: 4.4,
        baseAlpha: 0.46,
        pulseSpeed: 0.00045,
        colorInner: 'rgba(9, 88, 105, 0.48)',
        colorOuter: 'rgba(0, 38, 50, 0.14)',
      },
      // Lower deep-sea abyssal cloud billows
      {
        baseX: 0.3,
        baseY: 0.85,
        radiusX: 820,
        radiusY: 400,
        driftSpeedX: -0.0002,
        driftSpeedY: -0.00015,
        driftAmpX: 150,
        driftAmpY: 65,
        phaseX: 0.8,
        phaseY: 2.7,
        baseAlpha: 0.42,
        pulseSpeed: 0.0003,
        colorInner: 'rgba(6, 75, 91, 0.4)',
        colorOuter: 'rgba(0, 26, 35, 0.15)',
      },
      {
        baseX: 0.72,
        baseY: 0.82,
        radiusX: 790,
        radiusY: 390,
        driftSpeedX: 0.00028,
        driftSpeedY: 0.0002,
        driftAmpX: 135,
        driftAmpY: 60,
        phaseX: 4.2,
        phaseY: 1.3,
        baseAlpha: 0.44,
        pulseSpeed: 0.00038,
        colorInner: 'rgba(8, 85, 102, 0.42)',
        colorOuter: 'rgba(0, 30, 40, 0.16)',
      },
      // Subtle amber sonar acoustic warmth in deep center (sonar beacon echo)
      {
        baseX: 0.55,
        baseY: 0.45,
        radiusX: 460,
        radiusY: 230,
        driftSpeedX: 0.00018,
        driftSpeedY: -0.0002,
        driftAmpX: 80,
        driftAmpY: 40,
        phaseX: 2.1,
        phaseY: 5.0,
        baseAlpha: 0.08,
        pulseSpeed: 0.0007,
        colorInner: 'rgba(255, 183, 3, 0.18)', // subtle phosphor warmth
        colorOuter: 'rgba(255, 183, 3, 0)',
      },
    ];

    // ── 2. Floating Bioluminescent Marine Snow Spores ──
    const SPORE_COUNT = 32;
    const spores = Array.from({ length: SPORE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      speedY: -(Math.random() * 0.25 + 0.08), // gently float upwards
      speedX: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.45 + 0.15,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      isAmber: Math.random() > 0.8, // 20% amber sonar spores, 80% cyan/teal
    }));

    // ── 3. Smooth Harmonic Animation Loop ──
    let time = 0;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (isVisible) {
        time += 1;

        // Smooth mouse lerp
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;

        // 1. Base Abyssal Marine Gradient (From user's screenshot #00131b to #00242f)
        const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
        baseGrad.addColorStop(0, '#001017');     // dark abyssal ceiling
        baseGrad.addColorStop(0.35, '#001c25');  // ocean mist horizon
        baseGrad.addColorStop(0.65, '#002530');  // rich oceanic teal body
        baseGrad.addColorStop(1, '#00141c');     // deep subsea floor
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Render Volumetric Moving Ocean Clouds
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        clouds.forEach((cloud) => {
          // Harmonic wave drift
          const offsetX = Math.sin(time * cloud.driftSpeedX + cloud.phaseX) * cloud.driftAmpX;
          const offsetY = Math.cos(time * cloud.driftSpeedY + cloud.phaseY) * cloud.driftAmpY;

          // Interactive mouse wake push
          const cx = cloud.baseX * width + offsetX;
          const cy = cloud.baseY * height + offsetY;

          const dx = cx - mouseX;
          const dy = cy - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let pushX = 0;
          let pushY = 0;
          if (dist < 450 && dist > 0) {
            const force = (1 - dist / 450) * 35;
            pushX = (dx / dist) * force;
            pushY = (dy / dist) * force;
          }

          const finalX = cx + pushX;
          const finalY = cy + pushY;

          // Alpha breathing
          const currentAlpha =
            cloud.baseAlpha + Math.sin(time * cloud.pulseSpeed + cloud.phaseX) * 0.08;

          ctx.save();
          ctx.translate(finalX, finalY);

          // Horizontal elongation for sea fog
          ctx.scale(1, cloud.radiusY / cloud.radiusX);

          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radiusX);
          grad.addColorStop(0, cloud.colorInner);
          grad.addColorStop(0.55, cloud.colorOuter);
          grad.addColorStop(1, 'rgba(0, 19, 27, 0)');

          ctx.fillStyle = grad;
          ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

          ctx.beginPath();
          ctx.arc(0, 0, cloud.radiusX, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        ctx.restore();

        // 3. Subsea Thermocline Current Waves (Undulating horizontal current lines)
        ctx.save();
        ctx.strokeStyle = 'rgba(14, 112, 133, 0.07)';
        ctx.lineWidth = 1.5;

        for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
          const waveY = height * (0.35 + waveIndex * 0.22);
          const waveSpeed = 0.0012 + waveIndex * 0.0006;
          const waveAmp = 22 + waveIndex * 8;
          const waveFreq = 0.0018 + waveIndex * 0.0008;

          ctx.beginPath();
          for (let x = 0; x <= width; x += 20) {
            const y =
              waveY +
              Math.sin(x * waveFreq + time * waveSpeed) * waveAmp +
              Math.cos(x * 0.001 + time * 0.0008) * 12;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // 4. Bioluminescent Marine Snow / Deep Spores
        ctx.save();
        spores.forEach((spore) => {
          spore.y += spore.speedY;
          spore.x += spore.speedX + Math.sin(time * 0.002 + spore.pulse) * 0.15;
          spore.pulse += spore.pulseSpeed;

          // Wrap around edges
          if (spore.y < -10) spore.y = height + 10;
          if (spore.x < -10) spore.x = width + 10;
          if (spore.x > width + 10) spore.x = -10;

          const currentAlpha = spore.alpha * (0.6 + Math.sin(spore.pulse) * 0.4);

          ctx.beginPath();
          ctx.arc(spore.x, spore.y, spore.size, 0, Math.PI * 2);
          if (spore.isAmber) {
            ctx.fillStyle = `rgba(255, 183, 3, ${currentAlpha * 0.8})`;
            ctx.shadowColor = '#FFB703';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha})`;
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = 3;
          }
          ctx.fill();
        });
        ctx.restore();

        // 5. Cinematic Vignette (Dark edges focusing attention on the center)
        const vignette = ctx.createRadialGradient(
          width * 0.5,
          height * 0.5,
          Math.min(width, height) * 0.35,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.75
        );
        vignette.addColorStop(0, 'rgba(0, 11, 16, 0)');
        vignette.addColorStop(0.7, 'rgba(0, 11, 16, 0.35)');
        vignette.addColorStop(1, 'rgba(0, 9, 14, 0.82)');

        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ── 1. The Living Oceanic Cloud & Current Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ willChange: 'transform' }}
      />

      {/* ── 2. Subtle SVG Volumetric Noise Film (Adds fine mist texture like screenshot) ── */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── 3. Subsea Hydrographic Survey Depth Grid (Very faint 2% opacity) ── */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── 4. Tactical Amber Phosphor Sonar Pulse Warmth (Top right) ── */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#FFB703]/[0.025] blur-[160px] pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  );
};
