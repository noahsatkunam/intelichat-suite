import React, { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, Heart, Smile, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Message } from './ChatInterface';
import { SourceCitation } from './SourceCitation';
import { AttachmentPreview } from './AttachmentPreview';

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
}

const reactionEmojis = ['👍', '👎', '❤️', '😊', '🎉', '🤔'];

export function MessageBubble({ message, onReaction }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary shadow-glow' : 'bg-muted'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-soft transition-transform hover:scale-[1.02] ${
            isUser
              ? 'bg-message-user text-message-user-foreground ml-8'
              : 'bg-message-bot text-message-bot-foreground mr-8 border border-chat-border'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
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
          <div className="mt-2 space-y-1 w-full">
            {message.sources.map((source, index) => (
              <SourceCitation key={index} source={source} />
            ))}
          </div>
        )}

        {/* Reactions and Actions */}
        <div className="flex items-center gap-2 mt-2">
          {/* Existing Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center gap-1">
              {message.reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs bg-accent hover:bg-accent/80 border-chat-border"
                  onClick={() => onReaction(message.id, reaction)}
                >
                  {reaction}
                </Button>
              ))}
            </div>
          )}

          {/* Add Reaction */}
          {!isUser && (
            <Popover open={showReactions} onOpenChange={setShowReactions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Smile className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-popover border-border shadow-medium">
                <div className="flex gap-1">
                  {reactionEmojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-base hover:bg-accent"
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

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
}
