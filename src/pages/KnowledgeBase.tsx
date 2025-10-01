import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, FileText, Video, Link2, Download, Plus, Filter, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DocumentUpload } from '@/components/knowledge/DocumentUpload';
import { useToast } from '@/hooks/use-toast';

const categories = ['All', 'Technical', 'Business', 'Compliance', 'Integration', 'Best Practices'];

interface KnowledgeBaseProps {
  className?: string;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link';
  category: string;
  tags: string[];
  lastUpdated: string;
  url?: string;
  filename?: string;
  tenant_id?: string;
  tenant_name?: string;
}

export default function KnowledgeBase({ className }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTab, setSelectedTab] = useState<'all' | 'document' | 'video' | 'link'>('all');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<KnowledgeDocument | null>(null);
  const [editTenantDialogOpen, setEditTenantDialogOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<KnowledgeDocument | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    loadTenants();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          tenants:tenant_id (
            name
          )
        `)
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase documents to match our interface
      const transformedDocs: KnowledgeDocument[] = (data || []).map(doc => ({
        id: doc.id,
        title: doc.filename,
        description: doc.content?.substring(0, 150) || 'No description available',
        type: 'document' as const,
        category: 'Technical',
        tags: ['Document'],
        lastUpdated: new Date(doc.updated_at || doc.created_at).toLocaleDateString(),
        url: doc.file_url || undefined,
        filename: doc.filename,
        tenant_id: doc.tenant_id,
        tenant_name: doc.tenants?.name || undefined,
      }));

      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'link': return Link2;
      default: return FileText;
    }
  };

  const handleDownload = async (doc: KnowledgeDocument) => {
    try {
      if (!doc.url) {
        toast({
          title: "Error",
          description: "Document URL not found",
          variant: "destructive"
        });
        return;
      }

      // Extract file path from the URL
      const urlParts = doc.url.split('/documents/');
      if (urlParts.length < 2) {
        toast({
          title: "Error",
          description: "Invalid document URL",
          variant: "destructive"
        });
        return;
      }

      const filePath = urlParts[1];

      // Download from Supabase storage
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (doc: KnowledgeDocument) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleEditTenantClick = (doc: KnowledgeDocument) => {
    setDocumentToEdit(doc);
    setSelectedTenantId(doc.tenant_id || '');
    setEditTenantDialogOpen(true);
  };

  const handleTenantUpdate = async () => {
    if (!documentToEdit) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ tenant_id: selectedTenantId || null })
        .eq('id', documentToEdit.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document tenant updated successfully"
      });

      // Reload documents
      loadDocuments();
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update document tenant",
        variant: "destructive"
      });
    } finally {
      setEditTenantDialogOpen(false);
      setDocumentToEdit(null);
      setSelectedTenantId('');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      // Extract file path from URL if it exists
      if (documentToDelete.url) {
        const urlParts = documentToDelete.url.split('/documents/');
        if (urlParts.length >= 2) {
          const filePath = urlParts[1];
          
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath]);

          if (storageError) {
            console.error('Storage deletion error:', storageError);
          }
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully"
      });

      // Reload documents
      loadDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesType = selectedTab === 'all' || doc.type === selectedTab;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className={`flex flex-col h-full bg-background ${className || ''}`}>
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Knowledge Base
              </h1>
              <p className="text-muted-foreground">Access documentation, guides, and resources</p>
            </div>
            <Button 
              className="gap-2 bg-gradient-primary hover:shadow-glow"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </Button>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="link">Links</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const Icon = getIcon(doc.type);
                  return (
                    <Card key={doc.id} className="hover:shadow-medium transition-all duration-200 group cursor-pointer border-border bg-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(doc);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mt-2">
                          {doc.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {doc.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {doc.tenant_name ? (
                            <Badge 
                              variant="default" 
                              className="text-xs cursor-pointer hover:opacity-80"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTenantClick(doc);
                              }}
                            >
                              {doc.tenant_name}
                              <Edit className="w-3 h-3 ml-1" />
                            </Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTenantClick(doc);
                              }}
                            >
                              Add Tenant
                              <Plus className="w-3 h-3 ml-1" />
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                          {doc.tags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Updated {doc.lastUpdated}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:text-primary"
                          >
                            Access →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No documents found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms or filters.' : 'Upload documents to build your knowledge base.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Document Dialog */}
      <DocumentUpload 
        isOpen={isUploadOpen} 
        onClose={() => {
          setIsUploadOpen(false);
          loadDocuments(); // Reload documents after upload
        }} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone and will permanently remove the document from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editTenantDialogOpen} onOpenChange={setEditTenantDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document Tenant</DialogTitle>
            <DialogDescription>
              Assign or change the tenant tag for "{documentToEdit?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-select">Tenant</Label>
              <Select 
                value={selectedTenantId} 
                onValueChange={setSelectedTenantId}
              >
                <SelectTrigger id="tenant-select">
                  <SelectValue placeholder="Select a tenant or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Tenant (Unassigned)</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Documents can be tagged with a tenant for organization purposes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditTenantDialogOpen(false);
                setDocumentToEdit(null);
                setSelectedTenantId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleTenantUpdate}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
