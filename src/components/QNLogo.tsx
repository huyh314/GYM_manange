'use client';

import React from 'react';

interface QNLogoProps {
  className?: string;
  color?: string;
}

export const QNLogo: React.FC<QNLogoProps> = ({ className = "w-16 h-16", color = "currentColor" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Defined Gradients */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8E8E8" />
          <stop offset="50%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#A0A0A0" />
        </linearGradient>
      </defs>

      {/* The Q Circle */}
      <path 
        d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C59.5 90 68.2 86.7 75 81.2L85 91.2V71.2L65 71.2L70.5 76.7C65.1 82.3 57.9 85.7 50 85.7C30.3 85.7 14.3 69.7 14.3 50C14.3 30.3 30.3 14.3 50 14.3C69.7 14.3 85.7 30.3 85.7 50C85.7 53.6 85.2 57.2 84.1 60.5L88.2 62C89.4 58.1 90 54.1 90 50C90 27.9 72.1 10 50 10Z" 
        fill={color === "gold" ? "url(#goldGradient)" : color === "silver" ? "url(#silverGradient)" : color} 
      />
      
      {/* The N inside the Q */}
      <path 
        d="M40 35V65H45V45L55 65H60V35H55V55L45 35H40Z" 
        fill={color === "gold" ? "url(#goldGradient)" : color === "silver" ? "url(#silverGradient)" : color}
      />
    </svg>
  );
};
