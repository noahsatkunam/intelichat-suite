import React, { useState } from 'react';
import { Bot, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Message } from './ChatInterface';
import { SourceCitation } from './SourceCitation';
import { AttachmentPreview } from './AttachmentPreview';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
}

const reactionEmojis = ['👍', '👎', '❤️', '😊', '🎉', '🤔'];

export function MessageBubble({ message, onReaction }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-primary shadow-glow' 
          : 'bg-chat-surface border border-chat-border shadow-soft'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <ZyriaLogo size="sm" />
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        <div className={`text-xs text-muted-foreground mb-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'You' : 'Zyria'} • {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-medium transition-all duration-200 hover:shadow-large ${
            isUser
              ? 'bg-message-user text-message-user-foreground'
              : 'bg-message-bot text-message-bot-foreground border border-chat-border'
          }`}
        >
          <p className="text-sm leading-relaxed font-medium">{message.content}</p>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment, index) => (
                <AttachmentPreview key={index} attachment={attachment} />
              ))}
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2 w-full">
            {message.sources.map((source, index) => (
              <SourceCitation key={index} source={source} />
            ))}
          </div>
        )}

        {/* Reactions and Actions */}
        {(message.reactions?.length || !isUser) && (
          <div className="flex items-center gap-2 mt-2">
            {/* Existing Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex items-center gap-1">
                {message.reactions.map((reaction, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2 text-xs bg-accent/60 hover:bg-accent border-0 shadow-soft transition-smooth"
                    onClick={() => onReaction(message.id, reaction)}
                  >
                    {reaction}
                  </Button>
                ))}
              </div>
            )}

            {/* Add Reaction for bot messages */}
            {!isUser && (
              <Popover open={showReactions} onOpenChange={setShowReactions}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent"
                  >
                    <span className="text-sm">😊</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-popover border-border shadow-large">
                  <div className="flex gap-1">
                    {reactionEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-base hover:bg-accent transition-smooth"
                        onClick={() => {
                          onReaction(message.id, emoji);
                          setShowReactions(false);
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
