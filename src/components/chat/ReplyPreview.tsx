import React from 'react';
import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from './ChatInterface';

interface ReplyPreviewProps {
  replyingTo: Message;
  onCancel: () => void;
}

export function ReplyPreview({ replyingTo, onCancel }: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-accent/50 border-l-4 border-primary">
      <Reply className="w-4 h-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">
          Replying to {replyingTo.sender === 'user' ? 'You' : 'Zyria'}
        </p>
        <p className="text-sm text-foreground truncate">
          {replyingTo.content.length > 60 
            ? `${replyingTo.content.substring(0, 60)}...` 
            : replyingTo.content
          }
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-destructive/20"
        onClick={onCancel}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}