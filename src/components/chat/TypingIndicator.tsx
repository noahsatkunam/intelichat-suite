import React from 'react';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-4 p-4 animate-fade-in">
      <div className="w-9 h-9 rounded-xl bg-gradient-surface border border-chat-border shadow-soft flex items-center justify-center backdrop-blur-sm">
        <ZyriaLogo size="xs" showText={false} />
      </div>
      
      <div className="bg-message-bot border border-chat-border rounded-2xl px-4 py-3 shadow-medium">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}