import React, { useState } from 'react';
import { User, ExternalLink, Reply, MoreHorizontal, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Message } from './ChatInterface';
import { SourceCitation } from './SourceCitation';
import { AttachmentPreview } from './AttachmentPreview';
import { MessageContent } from './MessageContent';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, reaction: string) => void;
  onReply: (message: Message) => void;
  isReplying?: boolean;
}

const reactionEmojis = ['👍', '👎', '❤️', '😊', '🎉', '🤔'];

export function MessageBubble({ message, onReaction, onReply, isReplying }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.sender === 'user';
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-success opacity-60" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group ${isReplying ? 'bg-accent/30 -m-2 p-2 rounded-lg' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isUser 
          ? 'bg-gradient-primary shadow-glow' 
          : 'bg-chat-surface border border-chat-border shadow-soft hover:shadow-medium'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <ZyriaLogo size="sm" />
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
        {/* Sender Name and Timestamp */}
        <div 
          className={`flex items-center gap-2 text-xs text-muted-foreground cursor-pointer ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          onMouseEnter={() => setShowTimestamp(true)}
          onMouseLeave={() => setShowTimestamp(false)}
        >
          <span className="font-medium">
            {isUser ? 'You' : 'Zyria'}
          </span>
          {showTimestamp && (
            <span className="animate-fade-in">
              {message.timestamp.toLocaleString([], { 
                month: 'short',
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
          {message.status && getStatusIcon()}
        </div>

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-medium transition-all duration-200 hover:shadow-large ${
            message.status === 'error' 
              ? 'border border-destructive bg-destructive/10'
              : isUser
              ? 'bg-message-user text-message-user-foreground'
              : 'bg-message-bot text-message-bot-foreground border border-chat-border'
          }`}
        >
          <MessageContent 
            content={message.content}
            className="text-sm font-medium"
          />
          
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
          <div className="mt-2 space-y-2 w-full">
            {message.sources.map((source, index) => (
              <SourceCitation key={index} source={source} />
            ))}
          </div>
        )}

        {/* Reactions and Actions */}
        {(message.reactions?.length || !isUser) && (
          <div className="flex items-center gap-2 mt-1">
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

            {/* Message Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              {/* Add Reaction */}
              {!isUser && (
                <Popover open={showReactions} onOpenChange={setShowReactions}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-accent transition-smooth"
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

              {/* Reply Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-accent transition-smooth"
                onClick={() => onReply(message)}
              >
                <Reply className="w-3 h-3" />
              </Button>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-accent transition-smooth"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isUser ? 'end' : 'start'} className="bg-popover border-border shadow-large">
                  <DropdownMenuItem>Copy message</DropdownMenuItem>
                  <DropdownMenuItem>Quote message</DropdownMenuItem>
                  {isUser && <DropdownMenuItem className="text-destructive">Delete message</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
