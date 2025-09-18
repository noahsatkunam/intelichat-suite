import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
}

export function MessageSearch({ searchQuery, onSearchChange, resultsCount }: MessageSearchProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-chat-border bg-chat-header">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9 h-9 bg-background border-input focus:border-ring transition-smooth"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      {searchQuery && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultsCount} result{resultsCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}