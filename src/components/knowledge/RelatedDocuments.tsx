import React from 'react';
import { FileText, ExternalLink, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Document {
  id: string;
  title: string;
  type: string;
  relevance: number;
  lastAccessed?: string;
  snippet: string;
}

interface RelatedDocumentsProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
}

export function RelatedDocuments({ documents = [], onDocumentSelect }: RelatedDocumentsProps) {
  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    if (relevance >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
    if (relevance >= 70) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <Card className="border-border bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="w-4 h-4" />
          Related Documents
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group p-3 rounded-lg border border-chat-border hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                onClick={() => onDocumentSelect(doc)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(doc.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {doc.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                      <Badge className={`text-xs ${getRelevanceColor(doc.relevance)}`}>
                        {doc.relevance}% match
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {doc.snippet}
                    </p>
                    
                    {doc.lastAccessed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Last viewed {doc.lastAccessed}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {documents.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No related documents found</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-3 pt-3 border-t border-chat-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs hover:bg-accent"
            onClick={() => {/* Open knowledge base */}}
          >
            Browse all documents
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}