import React from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from './ChatInterface';

interface MessageListProps {
  messages: Message[];
  onReaction: (messageId: string, reaction: string) => void;
}

export function MessageList({ messages, onReaction }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
      {messages.map((message) => (
        <div key={message.id} className="animate-fade-in group">
          <MessageBubble
            message={message}
            onReaction={onReaction}
          />
        </div>
      ))}
    </div>
  );
}