import React, { useEffect, useRef } from 'react';

interface HolographicGlobeProps {
  size?: number;
  className?: string;
}

export const HolographicGlobe: React.FC<HolographicGlobeProps> = ({
  size = 280,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    const radius = size * 0.42;
    const centerX = size / 2;
    const centerY = size / 2;

    // Generate procedural 3D landmass & ocean point cloud on sphere surface
    const points: { lat: number; lon: number; isLand: boolean }[] = [];
    const numPoints = 260;

    for (let i = 0; i < numPoints; i++) {
      const lat = (Math.acos(2 * Math.random() - 1) - Math.PI / 2);
      const lon = Math.random() * Math.PI * 2;
      // Rough landmass clustering (Atlantic, Pacific, Americas, Eurasia, Arctic)
      const isLand =
        Math.sin(lat * 3) * Math.cos(lon * 2) > 0.1 ||
        (lat > 0.2 && lat < 1.1 && lon > 1.0 && lon < 3.2);

      points.push({ lat, lon, isLand });
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      rotation += 0.008;

      // 1. Ambient Outer Halo Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.6,
        centerX,
        centerY,
        radius * 1.25
      );
      glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      glowGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Sphere Silhouette
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(7, 13, 29, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Rotating Latitude & Longitude Wireframe Rings
      const numLatRings = 5;
      for (let i = 1; i <= numLatRings; i++) {
        const phi = (Math.PI / (numLatRings + 1)) * i - Math.PI / 2;
        const ringRadius = radius * Math.cos(phi);
        const ringY = centerY + radius * Math.sin(phi);

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          ringY,
          ringRadius,
          ringRadius * 0.35,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 4. Rotating Longitude Meridians
      const numMeridians = 6;
      for (let m = 0; m < numMeridians; m++) {
        const theta = rotation + (Math.PI / numMeridians) * m;
        const scaleX = Math.cos(theta);

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(radius * scaleX),
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = scaleX >= 0 ? 'rgba(6, 182, 212, 0.22)' : 'rgba(6, 182, 212, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 5. Projected Rotating Landmass & Ocean Surface Nodes
      points.forEach((pt) => {
        const currentLon = pt.lon + rotation;
        const x3d = radius * Math.cos(pt.lat) * Math.sin(currentLon);
        const y3d = radius * Math.sin(pt.lat);
        const z3d = radius * Math.cos(pt.lat) * Math.cos(currentLon);

        // Only draw nodes on front-facing hemisphere for 3D depth
        if (z3d > 0) {
          const x2d = centerX + x3d;
          const y2d = centerY + y3d * 0.95;
          const depthAlpha = (z3d / radius) * 0.85 + 0.15;

          ctx.beginPath();
          const nodeRadius = pt.isLand ? 2.0 : 1.2;
          ctx.arc(x2d, y2d, nodeRadius, 0, Math.PI * 2);

          if (pt.isLand) {
            ctx.fillStyle = `rgba(34, 211, 238, ${depthAlpha.toFixed(2)})`;
            ctx.shadowColor = '#06B6D4';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = `rgba(14, 116, 144, ${(depthAlpha * 0.6).toFixed(2)})`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      // 6. Orbital Satellite / Sonar Track Wave
      const orbitAngle = rotation * 1.5;
      const orbX = centerX + (radius * 1.2) * Math.cos(orbitAngle);
      const orbY = centerY + (radius * 0.5) * Math.sin(orbitAngle);
      const isFront = Math.sin(orbitAngle) > -0.2;

      if (isFront) {
        ctx.beginPath();
        ctx.arc(orbX, orbY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#F43F5E';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Orbital trail
        ctx.beginPath();
        ctx.arc(orbX, orbY, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.25)]"
      />
    </div>
  );
};
