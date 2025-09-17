import React from 'react';

interface BackgroundProps {
  mouseX: number;
  mouseY: number;
}

export const Background = ({ mouseX, mouseY }: BackgroundProps) => {
  // マウスの動きに応じて、少しだけ逆方向に動かすことで奥行きを表現
  const transformStyle1 = {
    transform: `translateX(${mouseX * -0.01}px) translateY(${mouseY * -0.01}px)`,
    transition: 'transform 0.5s ease-out'
  };
    const transformStyle2 = {
    transform: `translateX(${mouseX * -0.02}px) translateY(${mouseY * -0.02}px)`,
    transition: 'transform 0.5s ease-out'
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg width="100%" height="100%" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(0, 173, 238, 0.8)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(216, 107, 255, 0.8)' }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="20" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <g style={transformStyle1}>
          <path
            d="M -100,1024 Q 400,800 720,600 T 1540,100"
            stroke="url(#glowGradient)" strokeWidth="3" fill="none" filter="url(#glow)" opacity="0.4"
          />
        </g>
        <g style={transformStyle2}>
          <path
            d="M -100,950 Q 300,900 650,700 T 1540,300"
            stroke="url(#glowGradient)" strokeWidth="2" fill="none" filter="url(#glow)" opacity="0.3"
          />
        </g>
        
      </svg>
    </div>
  );
};