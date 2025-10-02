import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-4 justify-start">
      <Avatar className="w-8 h-8 mt-1 bg-primary/10">
        <AvatarFallback>
          <Bot className="w-4 h-4 text-primary" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 max-w-[80%] items-start">
        <Card className="p-4 bg-card">
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
