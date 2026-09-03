import React from 'react';

interface AcousticWaveProps {
  className?: string;
  active?: boolean;
}

export const AcousticWave: React.FC<AcousticWaveProps> = ({
  className = '',
  active = true,
}) => {
  if (!active) return null;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute w-24 h-24 rounded-full border border-[#00D4AA]/30 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
      <div className="absolute w-48 h-48 rounded-full border border-[#00D4AA]/20 animate-ping opacity-40" style={{ animationDuration: '4.5s', animationDelay: '1s' }} />
      <div className="absolute w-72 h-72 rounded-full border border-[#00D4AA]/10 animate-ping opacity-20" style={{ animationDuration: '6s', animationDelay: '2s' }} />
    </div>
  );
};
