import React from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from './ChatInterface';

interface MessageListProps {
  messages: Message[];
  onReaction: (messageId: string, reaction: string) => void;
  onReply: (message: Message) => void;
  replyingTo: Message | null;
}

export function MessageList({ messages, onReaction, onReply, replyingTo }: MessageListProps) {
  const findMessageById = (id: string): Message | undefined => {
    return messages.find(msg => msg.id === id);
  };

  return (
    <div className="p-4 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="animate-fade-in group">
          {/* Show reply context */}
          {message.replyTo && (
            <div className="mb-2 ml-12 opacity-60">
              <ReplyContext originalMessage={findMessageById(message.replyTo)} />
            </div>
          )}
          
          <MessageBubble
            message={message}
            onReaction={onReaction}
            onReply={onReply}
            isReplying={replyingTo?.id === message.id}
          />
        </div>
      ))}
    </div>
  );
}

function ReplyContext({ originalMessage }: { originalMessage?: Message }) {
  if (!originalMessage) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-chat-border pl-3">
      <span className="font-medium">
        {originalMessage.sender === 'user' ? 'You' : 'Zyria'}
      </span>
      <span className="truncate max-w-xs">
        {originalMessage.content.length > 60 
          ? `${originalMessage.content.substring(0, 60)}...`
          : originalMessage.content
        }
      </span>
    </div>
  );
}