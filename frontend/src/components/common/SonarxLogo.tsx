import React from 'react';

interface SonarxLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  subtitle?: string;
  badge?: string;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SonarxLogoIcon: React.FC<{ size?: number; animated?: boolean; className?: string }> = ({
  size = 32,
  animated = true,
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Obsidian Glass Gradient */}
        <linearGradient id="sx-chassis-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="50%" stopColor="#080C14" />
          <stop offset="100%" stopColor="#04060A" />
        </linearGradient>

        {/* Chassis Border Gradient with Amber Highlight */}
        <linearGradient id="sx-chassis-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB703" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#334155" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFB703" stopOpacity="0.2" />
        </linearGradient>

        {/* Sonar Gold Primary Blade Gradient */}
        <linearGradient id="sx-gold-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4B8" />
          <stop offset="40%" stopColor="#FFB703" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Crisp Titanium Secondary Blade Gradient */}
        <linearGradient id="sx-white-blade" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        {/* Radial Sonar Acoustic Bloom */}
        <radialGradient id="sx-ambient-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB703" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#FFB703" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFB703" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Chassis: Aerodynamic Hex-Squircle Tile */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="15"
        fill="url(#sx-chassis-grad)"
        stroke="url(#sx-chassis-border)"
        strokeWidth="1.5"
      />

      {/* Ambient Acoustic Bloom */}
      <circle cx="32" cy="32" r="24" fill="url(#sx-ambient-bloom)" />

      {/* 1. Side-Scan Sonar Port (Left) Radiating Acoustic Wavefronts */}
      <g className={animated ? 'animate-pulse' : ''} style={{ animationDuration: '3s' }}>
        <path
          d="M 21 21 A 15.5 15.5 0 0 0 21 43"
          fill="none"
          stroke="#FFB703"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M 15 16 A 23 23 0 0 0 15 48"
          fill="none"
          stroke="#FFB703"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <path
          d="M 9 11 A 31 31 0 0 0 9 53"
          fill="none"
          stroke="#FFB703"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.25"
          strokeDasharray="2 3"
        />
      </g>

      {/* 2. Side-Scan Sonar Starboard (Right) Radiating Acoustic Wavefronts */}
      <g className={animated ? 'animate-pulse' : ''} style={{ animationDuration: '3s', animationDelay: '0.15s' }}>
        <path
          d="M 43 21 A 15.5 15.5 0 0 1 43 43"
          fill="none"
          stroke="#FFB703"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M 49 16 A 23 23 0 0 1 49 48"
          fill="none"
          stroke="#FFB703"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <path
          d="M 55 11 A 31 31 0 0 1 55 53"
          fill="none"
          stroke="#FFB703"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.25"
          strokeDasharray="2 3"
        />
      </g>

      {/* 3. The Iconic "X" Transducer Fins */}
      {/* Primary Gold Blade (Top-Left to Bottom-Right) */}
      <path
        d="M 18 14 L 26 14 L 46 50 L 38 50 Z"
        fill="url(#sx-gold-blade)"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
      />

      {/* Secondary Titanium Cross Blade with engineered negative space gap */}
      {/* Upper-Right Wing */}
      <path
        d="M 46 14 L 38 14 L 33 23 L 37 27 Z"
        fill="url(#sx-white-blade)"
      />
      {/* Lower-Left Wing */}
      <path
        d="M 27 37 L 31 41 L 26 50 L 18 50 Z"
        fill="url(#sx-white-blade)"
      />

      {/* 4. Center Transducer Aperture Node (Hydrophone Ping Core) */}
      <circle
        cx="32"
        cy="32"
        r="4.5"
        fill="#FFB703"
        stroke="#06090F"
        strokeWidth="1.8"
        className={animated ? 'animate-ping' : ''}
        style={{ transformOrigin: '32px 32px', animationDuration: '2.5s' }}
      />
      <circle
        cx="32"
        cy="32"
        r="3.5"
        fill="#FFB703"
        stroke="#06090F"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="32" r="1.5" fill="#FFFFFF" />

      {/* 5. Calibrated Micro Crosshairs at Orthogonal Poles */}
      <line x1="32" y1="4" x2="32" y2="7" stroke="#FFB703" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="32" y1="57" x2="32" y2="60" stroke="#FFB703" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  );
};

export const SonarxLogo: React.FC<SonarxLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'MoES Subsea Intelligence',
  badge = 'SIH 26057',
  animated = true,
  className = '',
  onClick,
}) => {
  const pixelSizes = {
    xs: 20,
    sm: 26,
    md: 32,
    lg: 40,
    xl: 52,
  };

  const currentSize = typeof size === 'number' ? size : pixelSizes[size] || 32;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* The Iconic Vector Mark */}
      <div className="relative transition-transform duration-200 group-hover:scale-105">
        <SonarxLogoIcon size={currentSize} animated={animated} />
      </div>

      {/* Custom High-Precision Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[14px] font-extrabold tracking-[0.14em] text-white group-hover:text-slate-100 font-sans">
              SONAR
            </span>
            <span className="text-[14px] font-black tracking-[0.08em] text-[#FFB703] drop-shadow-[0_0_10px_rgba(255,183,3,0.4)] font-sans">
              X
            </span>
            {badge && (
              <span className="ml-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/25 tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[9.5px] font-mono font-medium text-slate-400 tracking-wide mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SonarxLogo;
