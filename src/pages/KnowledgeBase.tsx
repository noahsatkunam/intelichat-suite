import React, { useState } from 'react';
import { Search, BookOpen, FileText, Video, Link2, Download, Plus, Filter } from 'lucide-react';
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

const mockDocuments = [
  {
    id: '1',
    title: 'Enterprise AI Implementation Guide',
    description: 'Comprehensive guide for implementing AI solutions in enterprise environments',
    type: 'document',
    category: 'Implementation',
    lastUpdated: '2024-01-15',
    size: '2.4 MB',
    views: 1247,
    tags: ['AI', 'Enterprise', 'Implementation', 'Best Practices']
  },
  {
    id: '2',
    title: 'Security Compliance Framework',
    description: 'SOC 2 Type II compliance requirements and implementation strategies',
    type: 'document',
    category: 'Security',
    lastUpdated: '2024-01-12',
    size: '1.8 MB',
    views: 892,
    tags: ['Security', 'Compliance', 'SOC 2', 'Framework']
  },
  {
    id: '3',
    title: 'API Integration Tutorial',
    description: 'Step-by-step video tutorial for integrating with Zyria APIs',
    type: 'video',
    category: 'Development',
    lastUpdated: '2024-01-10',
    size: '45 min',
    views: 634,
    tags: ['API', 'Integration', 'Tutorial', 'Development']
  },
  {
    id: '4',
    title: 'Performance Optimization Handbook',
    description: 'Advanced techniques for optimizing system performance and scalability',
    type: 'document',
    category: 'Performance',
    lastUpdated: '2024-01-08',
    size: '3.1 MB',
    views: 445,
    tags: ['Performance', 'Optimization', 'Scalability']
  },
  {
    id: '5',
    title: 'Database Schema Documentation',
    description: 'Complete database schema reference with entity relationships',
    type: 'link',
    category: 'Development',
    lastUpdated: '2024-01-05',
    size: 'External',
    views: 323,
    tags: ['Database', 'Schema', 'Documentation', 'Reference']
  }
];

const categories = ['All', 'Implementation', 'Security', 'Development', 'Performance'];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTab, setSelectedTab] = useState('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'link':
        return <Link2 className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesType = selectedTab === 'all' || doc.type === selectedTab;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Knowledge Base</h1>
              <p className="text-muted-foreground">Access documentation, tutorials, and resources</p>
            </div>
            <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents, videos, tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="document" className="text-sm">Documents</TabsTrigger>
              <TabsTrigger value="video" className="text-sm">Videos</TabsTrigger>
              <TabsTrigger value="link" className="text-sm">Links</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab} className="flex-1 overflow-y-auto p-6 pt-4">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search terms or filters.' : 'No resources available in this category.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="hover:shadow-medium transition-all duration-200 cursor-pointer group border-border bg-card"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {getIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {doc.title}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {doc.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {doc.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Updated {doc.lastUpdated}</span>
                        <span>{doc.views} views</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          <span className="text-xs">Access</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}