import React from 'react';

interface ZyriaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ZyriaLogo({ className = '', size = 'md' }: ZyriaLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient
            id="zyria-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="hsl(234, 89%, 74%)" />
            <stop offset="100%" stopColor="hsl(270, 91%, 65%)" />
          </linearGradient>
        </defs>
        
        {/* Modern Z Symbol */}
        <path
          d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V10C26 10.5523 25.5523 11 25 11H12.4142L25.7071 24.2929C26.0976 24.6834 26.0976 25.3166 25.7071 25.7071L24.2929 27.1213C23.9024 27.5118 23.2692 27.5118 22.8787 27.1213L7 11.2426V24C7 25.1046 6.10457 26 5 26H8C6.89543 26 6 25.1046 6 24V8Z"
          fill="url(#zyria-gradient)"
        />
        
        {/* Accent Dot */}
        <circle
          cx="24"
          cy="24"
          r="3"
          fill="url(#zyria-gradient)"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}