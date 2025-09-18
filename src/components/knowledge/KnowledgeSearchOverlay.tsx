import React, { useState } from 'react';
import { Search, Filter, Calendar, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KnowledgeSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (document: any) => void;
}

const mockDocuments = [
  {
    id: '1',
    title: 'Enterprise Security Guidelines',
    type: 'PDF',
    content: 'Comprehensive security policies for enterprise environments...',
    confidence: 'high',
    lastModified: '2024-01-15',
    size: '2.4 MB',
    relevance: 95
  },
  {
    id: '2',
    title: 'API Integration Standards',
    type: 'DOCX',
    content: 'Best practices for API integration and authentication...',
    confidence: 'high',
    lastModified: '2024-01-12',
    size: '1.8 MB',
    relevance: 88
  },
  {
    id: '3',
    title: 'Database Migration Procedures',
    type: 'PDF',
    content: 'Step-by-step database migration and backup procedures...',
    confidence: 'medium',
    lastModified: '2024-01-10',
    size: '3.1 MB',
    relevance: 76
  }
];

export function KnowledgeSearchOverlay({ isOpen, onClose, onSelectDocument }: KnowledgeSearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSearching(false);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || doc.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-popover border-border shadow-large">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5" />
            Knowledge Base Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Controls */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents, policies, procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Word</SelectItem>
                <SelectItem value="pptx">PowerPoint</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-primary hover:shadow-glow"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          <Separator />

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {isSearching ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Searching knowledge base...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No documents found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card 
                  key={doc.id}
                  className="cursor-pointer hover:shadow-medium transition-all duration-200 border-border bg-card group"
                  onClick={() => onSelectDocument(doc)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {doc.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          <Badge className={`text-xs ${getConfidenceColor(doc.confidence)}`}>
                            {doc.confidence} confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doc.relevance}% relevance
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{doc.size}</div>
                        <div>{doc.lastModified}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}