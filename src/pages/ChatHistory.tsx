import React, { useState } from 'react';
import { Search, Filter, Calendar, Folder, MessageSquare, Clock, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockChatHistory = [
  {
    id: '1',
    title: 'Enterprise AI Integration Strategy',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    messageCount: 45,
    category: 'Strategy',
    starred: true,
    participants: ['John Doe', 'Zyria'],
    lastMessage: 'Thank you for the comprehensive analysis of our AI integration roadmap.',
  },
  {
    id: '2',
    title: 'Database Migration Troubleshooting',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    messageCount: 23,
    category: 'Technical',
    starred: false,
    participants: ['John Doe', 'Zyria'],
    lastMessage: 'The migration script should handle the schema changes automatically.',
  },
  {
    id: '3',
    title: 'Security Compliance Review',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    messageCount: 67,
    category: 'Compliance',
    starred: true,
    participants: ['John Doe', 'Zyria'],
    lastMessage: 'All security protocols are now aligned with SOC 2 Type II requirements.',
  },
  {
    id: '4',
    title: 'API Documentation Standards',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    messageCount: 34,
    category: 'Documentation',
    starred: false,
    participants: ['John Doe', 'Zyria'],
    lastMessage: 'The OpenAPI specification has been updated with the new endpoints.',
  },
  {
    id: '5',
    title: 'Performance Optimization Guide',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    messageCount: 56,
    category: 'Performance',
    starred: false,
    participants: ['John Doe', 'Zyria'],
    lastMessage: 'Implementing these changes should improve response times by 40%.',
  },
];

export default function ChatHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const categories = ['all', 'Strategy', 'Technical', 'Compliance', 'Documentation', 'Performance'];
  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const filteredChats = mockChatHistory.filter(chat => {
    const matchesSearch = searchQuery === '' || 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || chat.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return '1 day ago';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Chat History</h1>
              <p className="text-muted-foreground">Browse and search through your conversation history</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Folder className="w-4 h-4" />
              Create Folder
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search conversations, messages, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>
                      {timeframe.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No conversations found</h3>
            <p className="text-muted-foreground max-w-sm">
              {searchQuery ? 'Try adjusting your search terms or filters.' : 'Start a new conversation to see it appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredChats.map((chat) => (
              <Card 
                key={chat.id} 
                className="hover:shadow-medium transition-all duration-200 cursor-pointer group border-border bg-card"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {chat.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {chat.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          <span>{chat.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${chat.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Star className={`w-4 h-4 ${chat.starred ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {chat.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(chat.timestamp)}</span>
                    </div>
                    <span>with {chat.participants.join(', ')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}