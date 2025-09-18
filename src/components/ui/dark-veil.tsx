import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DarkVeilProps {
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
  preventBodyScroll?: boolean;
  zIndex?: number;
  blurBackground?: boolean;
}

export function DarkVeil({ 
  isVisible, 
  onClose, 
  className, 
  children, 
  preventBodyScroll = true,
  zIndex = 50,
  blurBackground = true 
}: DarkVeilProps) {
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preventBodyScroll) {
      if (isVisible) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isVisible, preventBodyScroll]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  const handleVeilClick = (event: React.MouseEvent) => {
    if (event.target === veilRef.current && onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={veilRef}
      className={cn(
        "fixed inset-0 bg-black/80 transition-opacity duration-300 ease-in-out",
        blurBackground && "backdrop-blur-sm",
        "animate-fade-in",
        className
      )}
      style={{ zIndex }}
      onClick={handleVeilClick}
      role="dialog"
      aria-modal="true"
    >
      {children && (
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default DarkVeil;