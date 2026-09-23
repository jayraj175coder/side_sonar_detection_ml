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

/**
 * Circular emblem mark: Sonar Crosshairs + 3D Gold X + Ocean Waves & Swath Roadway
 */
export const SonarxLogoIcon: React.FC<{ size?: number; animated?: boolean; className?: string }> = ({
  size = 32,
  animated = true,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 select-none inline-flex items-center justify-center ${className}`}
    >
      <img
        src="/sonarx-logo-icon-round.png"
        alt="SONAR X"
        width={size}
        height={size}
        className="w-full h-full object-contain rounded-full drop-shadow-[0_0_8px_rgba(255,183,3,0.35)] transition-transform duration-200 hover:scale-105"
      />
      {animated && (
        <span
          className="absolute inset-0 rounded-full border border-[#FFB703]/30 animate-ping pointer-events-none"
          style={{ animationDuration: '3.5s', animationIterationCount: 'infinite' }}
        />
      )}
    </div>
  );
};

/**
 * Full official SONAR X brand logo:
 * Circular Sonar Crosshair Emblem + SONAR X™ wordmark + MoES Subsea Intelligence + SIH 26057 badge
 */
export const SonarxLogo: React.FC<SonarxLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
  onClick,
}) => {
  const pixelHeights = {
    xs: 22,
    sm: 32,
    md: 38,
    lg: 46,
    xl: 56,
  };

  const currentHeight = typeof size === 'number' ? size : pixelHeights[size] || 38;

  if (!showText) {
    return (
      <div onClick={onClick} className={onClick ? 'cursor-pointer group' : ''}>
        <SonarxLogoIcon size={currentHeight} animated={animated} className={className} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      title="SONAR X // MoES Subsea Intelligence (SIH 26057)"
    >
      <img
        src="/sonarx-logo-transparent.png"
        alt="SONAR X — MoES Subsea Intelligence (SIH 26057)"
        style={{ height: `${currentHeight}px`, width: 'auto' }}
        className="object-contain max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-[1.02]"
      />
    </div>
  );
};

export default SonarxLogo;
