import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SourceCitationProps {
  source: {
    title: string;
    url: string;
    snippet: string;
  };
}

export function SourceCitation({ source }: SourceCitationProps) {
  return (
    <div className="bg-accent/50 border border-chat-border rounded-lg p-3 text-xs group hover:bg-accent/70 transition-colors">
      <div className="flex items-start gap-2">
        <FileText className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-foreground truncate">{source.title}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open(source.url, '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-muted-foreground leading-relaxed line-clamp-2">{source.snippet}</p>
        </div>
      </div>
    </div>
  );
}