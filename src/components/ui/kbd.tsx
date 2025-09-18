import React from 'react';
import { cn } from '@/lib/utils';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn(
      "inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium",
      "bg-muted border border-border rounded",
      "shadow-sm",
      className
    )}>
      {children}
    </kbd>
  );
}