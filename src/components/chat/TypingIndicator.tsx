import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  chatbotAvatar?: string | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ chatbotAvatar = null }) => {
  return (
    <div className="flex gap-4 justify-start">
      <Avatar className="w-8 h-8 mt-1 bg-primary/10">
        {chatbotAvatar ? (
          <AvatarImage src={chatbotAvatar} alt="Chatbot" />
        ) : null}
        <AvatarFallback>
          <Bot className="w-4 h-4 text-primary" />
        </AvatarFallback>
      </Avatar>

      <div className="items-start">
        <Card className="p-3 bg-card w-fit">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
