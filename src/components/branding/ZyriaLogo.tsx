import React from 'react';

interface ZyriaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'compact' | 'full';
}

export function ZyriaLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  variant = 'default' 
}: ZyriaLogoProps) {
  const sizeConfig = {
    xs: { 
      icon: 'w-4 h-4', 
      text: 'text-sm', 
      gap: 'gap-1.5',
      container: 'w-auto h-4'
    },
    sm: { 
      icon: 'w-6 h-6', 
      text: 'text-base', 
      gap: 'gap-2',
      container: 'w-auto h-6'
    },
    md: { 
      icon: 'w-8 h-8', 
      text: 'text-lg', 
      gap: 'gap-2.5',
      container: 'w-auto h-8'
    },
    lg: { 
      icon: 'w-12 h-12', 
      text: 'text-2xl', 
      gap: 'gap-3',
      container: 'w-auto h-12'
    },
    xl: { 
      icon: 'w-16 h-16', 
      text: 'text-3xl', 
      gap: 'gap-4',
      container: 'w-auto h-16'
    }
  };

  const config = sizeConfig[size];
  const shouldShowText = showText && variant !== 'compact';

  return (
    <div className={`${config.container} ${shouldShowText ? `flex items-center ${config.gap}` : ''} ${className}`}>
      {/* Logo Icon */}
      <div className={`${config.icon} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Enhanced Gradient Definitions */}
          <defs>
            <linearGradient
              id="zyria-primary-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="hsl(234, 89%, 74%)" />
              <stop offset="50%" stopColor="hsl(252, 90%, 70%)" />
              <stop offset="100%" stopColor="hsl(270, 91%, 65%)" />
            </linearGradient>
            
            <linearGradient
              id="zyria-accent-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="hsl(270, 91%, 65%)" />
              <stop offset="100%" stopColor="hsl(234, 89%, 74%)" />
            </linearGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="subtle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="hsl(234, 89%, 74%)" floodOpacity="0.25"/>
            </filter>
          </defs>
          
          {/* Background Circle - subtle foundation */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="url(#zyria-primary-gradient)"
            opacity="0.08"
            className="dark:opacity-0.12"
          />
          
          {/* Main Z Symbol - more refined and geometric */}
          <path
            d="M12 10C12 9.44772 12.4477 9 13 9H27C27.5523 9 28 9.44772 28 10V12C28 12.3314 27.8379 12.6414 27.5547 12.8321C27.2715 13.0229 26.9049 13.0229 26.6217 12.8321L15.8787 6.12132C15.4882 5.73079 14.8551 5.73079 14.4645 6.12132L13.0503 7.53553C12.6598 7.92606 12.6598 8.55922 13.0503 8.94975L23.1716 19.0711H13C12.4477 19.0711 12 19.5188 12 20.0711V22.0711C12 22.6234 12.4477 23.0711 13 23.0711H27C27.5523 23.0711 28 22.6234 28 22.0711V20.0711C28 19.7397 27.8379 19.4297 27.5547 19.239C27.2715 19.0482 26.9049 19.0482 26.6217 19.239L15.8787 25.9497C15.4882 26.3403 14.8551 26.3403 14.4645 25.9497L13.0503 24.5355C12.6598 24.145 12.6598 23.5118 13.0503 23.1213L23.1716 13H13C12.4477 13 12 12.5523 12 12V10Z"
            fill="url(#zyria-primary-gradient)"
            filter="url(#subtle-shadow)"
            className="transition-all duration-300"
          />

          {/* Refined Z Design - Modern Geometric Approach */}
          <g className="transition-all duration-300">
            {/* Top horizontal line */}
            <rect
              x="11"
              y="11"
              width="18"
              height="3"
              rx="1.5"
              fill="url(#zyria-primary-gradient)"
              filter="url(#subtle-shadow)"
            />
            
            {/* Diagonal line */}
            <path
              d="M27.5 14.5L13.5 28.5C13.1134 28.8866 12.4866 28.8866 12.1 28.5L11.4 27.8C11.0134 27.4134 11.0134 26.7866 11.4 26.4L25.4 12.4C25.7866 12.0134 26.4134 12.0134 26.8 12.4L27.5 13.1C27.8866 13.4866 27.8866 14.1134 27.5 14.5Z"
              fill="url(#zyria-primary-gradient)"
              filter="url(#subtle-shadow)"
            />
            
            {/* Bottom horizontal line */}
            <rect
              x="11"
              y="26"
              width="18"
              height="3"
              rx="1.5"
              fill="url(#zyria-primary-gradient)"
              filter="url(#subtle-shadow)"
            />
          </g>

          {/* AI Communication Dots - representing conversation/intelligence */}
          <g className="opacity-70">
            {/* Conversation bubble suggestion */}
            <circle
              cx="31"
              cy="12"
              r="1.5"
              fill="url(#zyria-accent-gradient)"
              className="animate-pulse-soft"
            />
            <circle
              cx="34"
              cy="10"
              r="1"
              fill="url(#zyria-accent-gradient)"
              className="animate-pulse-soft"
              style={{ animationDelay: '0.5s' }}
            />
            <circle
              cx="36"
              cy="13"
              r="0.8"
              fill="url(#zyria-accent-gradient)"
              className="animate-pulse-soft"
              style={{ animationDelay: '1s' }}
            />
          </g>

          {/* Neural network connection lines - subtle AI suggestion */}
          <g className="opacity-30 stroke-current" stroke="url(#zyria-primary-gradient)" strokeWidth="0.5">
            <path d="M8 8L12 12M32 8L28 12M8 32L12 28M32 32L28 28" className="animate-pulse-soft" />
          </g>
        </svg>
      </div>

      {/* Logo Text */}
      {shouldShowText && (
        <div className="flex-shrink-0">
          <span 
            className={`
              font-brand font-semibold tracking-tight
              ${config.text}
              text-gradient
              select-none
              transition-all duration-300
            `}
            style={{
              letterSpacing: size === 'xs' ? '0.02em' : 
                           size === 'sm' ? '0.01em' : 
                           size === 'md' ? '-0.01em' :
                           size === 'lg' ? '-0.02em' : 
                           '-0.03em'
            }}
          >
            Zyria
          </span>
          
          {variant === 'full' && (
            <div className={`
              font-sans font-medium text-muted-foreground
              ${size === 'xl' ? 'text-sm mt-1' : 
                size === 'lg' ? 'text-xs mt-0.5' : 
                'text-xs'}
            `}>
              Enterprise AI Platform
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized logo variants for common use cases
export function ZyriaLogoCompact({ size = 'md', className = '' }: Pick<ZyriaLogoProps, 'size' | 'className'>) {
  return (
    <ZyriaLogo 
      size={size} 
      className={className}
      showText={false}
      variant="compact"
    />
  );
}

export function ZyriaLogoFull({ size = 'lg', className = '' }: Pick<ZyriaLogoProps, 'size' | 'className'>) {
  return (
    <ZyriaLogo 
      size={size} 
      className={className}
      showText={true}
      variant="full"
    />
  );
}