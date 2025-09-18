import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'muted';
  className?: string;
}

const sizeConfig = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const variantConfig = {
  default: 'border-foreground border-t-transparent',
  primary: 'border-primary border-t-transparent',
  muted: 'border-muted-foreground border-t-transparent',
};

export function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeConfig[size],
        variantConfig[variant],
        className
      )}
    />
  );
}

// Professional loading dots for typing indicators
export function TypingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1 items-center", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-dots"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

// Enhanced progress bar with indeterminate state
export function ProgressBar({ 
  value, 
  max = 100, 
  className,
  indeterminate = false 
}: { 
  value?: number;
  max?: number;
  className?: string;
  indeterminate?: boolean;
}) {
  return (
    <div className={cn("w-full bg-muted rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-gradient-primary transition-all duration-300",
          indeterminate && "animate-progress w-1/3"
        )}
        style={
          !indeterminate 
            ? { width: `${((value || 0) / max) * 100}%` }
            : undefined
        }
      />
    </div>
  );
}

// Professional loading overlay
export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}