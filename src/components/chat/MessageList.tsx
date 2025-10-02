import React from 'react';
import { Bot, User, Paperclip, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{ name: string; url: string; size: number }>;
  citations?: Array<{ title: string; url?: string }>;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
        <p className="text-muted-foreground max-w-md">
          Send a message to begin chatting with your AI assistant
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <Avatar className="w-8 h-8 mt-1 bg-primary/10">
              <AvatarFallback>
                <Bot className="w-4 h-4 text-primary" />
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={`w-fit max-w-[80%] ${
              message.role === 'user' ? 'items-end ml-auto' : 'items-start'
            }`}
          >
            <Card
              className={`p-4 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] animate-scale-in ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap break-words m-0">{message.content}</p>
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded bg-background/50 hover:bg-background/80 transition-colors text-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="flex-1 truncate">{attachment.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}

              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold mb-2 opacity-70">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.citations.map((citation, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="gap-1 text-xs"
                      >
                        {citation.url ? (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline"
                          >
                            {citation.title}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          citation.title
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <p className="text-xs text-muted-foreground mt-1 px-1">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {message.role === 'user' && (
            <Avatar className="w-8 h-8 mt-1 bg-primary">
              <AvatarFallback>
                <User className="w-4 h-4 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isLoading && <TypingIndicator />}
    </div>
  );
};
