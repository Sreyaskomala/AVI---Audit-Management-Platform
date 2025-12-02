import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Stylized Aviation Wing Icon */}
    <path d="M15 45 C 15 45, 35 10, 75 10 L 90 10 L 55 45 Z" fill="#2563eb" />
    <path d="M30 45 C 30 45, 45 25, 70 25 L 80 25 L 60 45 Z" fill="#60a5fa" />
    <circle cx="85" cy="15" r="2" fill="#ef4444" opacity="0.8" />
    
    {/* Brand Text */}
    <text x="90" y="40" fontFamily="sans-serif" fontWeight="800" fontSize="36" fill="currentColor" letterSpacing="-1">
      AVI
    </text>
    <text x="92" y="52" fontFamily="sans-serif" fontWeight="500" fontSize="10" fill="currentColor" letterSpacing="1.5" opacity="0.7">
      PLATFORM
    </text>
  </svg>
);
