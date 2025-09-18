import React from 'react';
import { Settings, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-chat-border bg-chat-header shadow-soft backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-medium backdrop-blur-sm">
              <ZyriaLogo size="sm" className="text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-chat-header"></div>
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-foreground">Zyria</h1>
            <p className="text-sm text-muted-foreground">Enterprise AI Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0 hover:bg-accent transition-smooth">
          <Settings className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 px-0 hover:bg-accent transition-smooth">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border shadow-large">
            <DropdownMenuItem>Export Chat</DropdownMenuItem>
            <DropdownMenuItem>Clear History</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}