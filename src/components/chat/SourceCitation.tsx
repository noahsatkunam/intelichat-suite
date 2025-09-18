import React, { useState } from 'react';
import { ExternalLink, FileText, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DocumentPreview } from '@/components/knowledge/DocumentPreview';

interface SourceCitationProps {
  source: {
    title: string;
    url: string;
    snippet: string;
    confidence?: 'high' | 'medium' | 'low';
    type?: string;
    isKnowledgeBase?: boolean;
  };
}

export function SourceCitation({ source }: SourceCitationProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'low': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
  };

  const getSourceIcon = () => {
    if (source.isKnowledgeBase) {
      return <BookOpen className="w-3 h-3" />;
    }
    return <FileText className="w-3 h-3" />;
  };

  const mockDocument = {
    id: '1',
    title: source.title,
    type: source.type || 'PDF',
    content: source.snippet,
    confidence: source.confidence || 'high',
    lastModified: '2024-01-15',
    size: '2.4 MB',
    relevance: 95,
    author: 'Enterprise Security Team',
    tags: ['Security', 'Enterprise', 'Guidelines']
  };

  return (
    <TooltipProvider>
      <div className={`border rounded-lg p-3 text-xs group hover:shadow-medium transition-all duration-200 ${
        source.isKnowledgeBase 
          ? getConfidenceColor(source.confidence)
          : 'bg-accent/50 border-chat-border hover:bg-accent/70'
      }`}>
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            {getSourceIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">
                {source.title}
              </span>
              
              {source.isKnowledgeBase && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Knowledge Base
                </Badge>
              )}
              
              {source.confidence && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${getConfidenceColor(source.confidence)}`}
                >
                  {source.confidence}
                </Badge>
              )}
            </div>
            
            <p className="leading-relaxed line-clamp-2 mb-2">
              {source.snippet}
            </p>
            
            <div className="flex items-center gap-1">
              {source.isKnowledgeBase ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setShowPreview(true)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View document preview</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open full document</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Source
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open external source</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>

      <DocumentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        document={showPreview ? mockDocument : null}
      />
    </TooltipProvider>
  );
}