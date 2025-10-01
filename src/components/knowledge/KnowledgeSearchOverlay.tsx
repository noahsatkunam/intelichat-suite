import React, { useState, useEffect } from 'react';
import { documentService } from '@/services/documentService';
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

interface SearchDocument {
  id: string;
  title: string;
  type: string;
  confidence: number;
  relevance: string;
  size: string;
  lastModified: string;
  content: string;
}

export function KnowledgeSearchOverlay({ isOpen, onClose, onSelectDocument }: KnowledgeSearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await documentService.getDocuments();
      
      // Transform to match expected format
      const transformedDocs: SearchDocument[] = docs.map(doc => ({
        id: doc.id,
        title: doc.filename,
        type: 'PDF',
        confidence: 95,
        relevance: 'High',
        size: 'N/A',
        lastModified: new Date(doc.updated_at || doc.created_at).toLocaleDateString(),
        content: doc.content?.substring(0, 200) || 'No content available',
      }));
      
      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await documentService.searchDocuments(searchQuery);
      
      const transformedResults: SearchDocument[] = results.map(doc => ({
        id: doc.id,
        title: doc.filename,
        type: 'PDF',
        confidence: 95,
        relevance: 'High',
        size: 'N/A',
        lastModified: new Date(doc.updated_at || doc.created_at).toLocaleDateString(),
        content: doc.content?.substring(0, 200) || 'No content available',
      }));
      
      setDocuments(transformedResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  // Filter documents based on type
  const filteredDocuments = documents.filter(doc => {
    if (selectedType !== 'all' && doc.type !== selectedType) return false;
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Search Knowledge Base</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Controls */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching || isLoading}>
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <Separator />

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isSearching || isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Searching knowledge base...</p>
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-foreground font-medium">No documents found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search terms</p>
                </div>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="cursor-pointer hover:shadow-medium transition-all border-border hover:border-primary"
                  onClick={() => onSelectDocument(doc)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                          <h4 className="font-medium text-foreground truncate">{doc.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {doc.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getConfidenceColor(doc.confidence)}`}>
                            {doc.confidence}% match
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doc.size}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {doc.lastModified}
                          </span>
                        </div>
                      </div>
                    </div>
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
