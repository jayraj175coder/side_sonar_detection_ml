import React from 'react';

/**
 * AmbientOceanBackdrop
 * 
 * High-performance, GPU-accelerated atmospheric background.
 * Uses pure CSS radial gradients and hardware-accelerated transforms
 * to render a subtle hydrographic subsea depth feel without taxing CPU/memory.
 */
export const AmbientOceanBackdrop: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Subtle Pitch-Black Hydrographic Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* 2. Very Subtle Acoustic Amber Phosphor Warmth (Top-Right) */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#FFB703]/[0.035] blur-[150px] animate-ambient-drift-1"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 3. Deep Obsidian Slate Vignette (Bottom-Left) */}
      <div
        className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full bg-[#334155]/[0.05] blur-[160px] animate-ambient-drift-2"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 4. Subtle Central Acoustic Radar Echo */}
      <div
        className="absolute top-1/2 -right-48 w-[450px] h-[450px] rounded-full bg-[#F59E0B]/[0.025] blur-[140px] animate-ambient-drift-1"
        style={{ animationDelay: '4s', willChange: 'transform, opacity' }}
      />
    </div>
  );
};
