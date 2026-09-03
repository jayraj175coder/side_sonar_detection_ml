import React from 'react';

interface DetectionPulseProps {
  color?: string;
  size?: number;
  className?: string;
}

export const DetectionPulse: React.FC<DetectionPulseProps> = ({
  color = '#00D4AA',
  size = 16,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: color,
        }}
      />
    </div>
  );
};
