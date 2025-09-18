import React from 'react';
import { BookOpen, Globe, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KnowledgeBaseToggleProps {
  useKnowledgeBase: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function KnowledgeBaseToggle({ useKnowledgeBase, onToggle, className = '' }: KnowledgeBaseToggleProps) {
  return (
    <TooltipProvider>
      <div className={`flex items-center gap-3 p-3 rounded-lg border border-chat-border bg-chat-surface ${className}`}>
        <div className="flex items-center gap-2">
          {useKnowledgeBase ? (
            <BookOpen className="w-4 h-4 text-primary" />
          ) : (
            <Globe className="w-4 h-4 text-muted-foreground" />
          )}
          
          <Label htmlFor="knowledge-base-toggle" className="text-sm font-medium cursor-pointer">
            Knowledge Base
          </Label>
          
          <Tooltip>
            <TooltipTrigger>
              <Switch
                id="knowledge-base-toggle"
                checked={useKnowledgeBase}
                onCheckedChange={onToggle}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{useKnowledgeBase ? 'Disable' : 'Enable'} knowledge base integration</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="ml-auto">
          <Badge 
            variant={useKnowledgeBase ? "default" : "secondary"}
            className={`text-xs ${useKnowledgeBase ? 'bg-primary text-primary-foreground' : ''}`}
          >
            {useKnowledgeBase ? (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Enterprise Docs
              </>
            ) : (
              'General Knowledge'
            )}
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
}