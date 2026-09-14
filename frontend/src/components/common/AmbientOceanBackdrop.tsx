import React from 'react';

export const AmbientOceanBackdrop: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Subtle Hydrographic Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00D4AA 1px, transparent 1px),
            linear-gradient(to bottom, #00D4AA 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 2. Primary Bioluminescent Teal Orb (Top-Right) */}
      <div
        className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-[#00D4AA]/15 blur-[120px] animate-ambient-drift-1"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 3. Deep Subsea Cyan Orb (Bottom-Left) */}
      <div
        className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full bg-[#06B6D4]/12 blur-[130px] animate-ambient-drift-2"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 4. Warning Amber Threat Accent (Mid-Right - Representing Anthropogenic Debris) */}
      <div
        className="absolute top-1/2 -right-48 w-[450px] h-[450px] rounded-full bg-[#F59E0B]/8 blur-[140px] animate-ambient-drift-1"
        style={{ animationDelay: '4s', willChange: 'transform, opacity' }}
      />

      {/* 5. Deep Abyssal Purple Accent (Center-Left - Seafloor Anomaly) */}
      <div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#A855F7]/6 blur-[150px] animate-ambient-drift-2"
        style={{ animationDelay: '6s', willChange: 'transform, opacity' }}
      />
    </div>
  );
};
