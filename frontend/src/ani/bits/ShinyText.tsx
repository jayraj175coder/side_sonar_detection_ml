import React from 'react';

// React Bits ShinyText, ported from motion/react to a CSS keyframe (no extra dependency).
interface ShinyTextProps {
  text: string;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120
}) => (
  <span
    className={`inline-block ${className}`}
    style={{
      backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animation: `shiny-text ${speed}s linear infinite`
    }}
  >
    {text}
  </span>
);

export default ShinyText;
