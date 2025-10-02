import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Users, 
  ArrowRight, 
  Search,
  Filter,
  Archive,
  Share2,
  MoreHorizontal,
  Bot,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  participants: number;
  unreadCount: number;
  status: 'active' | 'archived' | 'pending';
  aiProvider?: string;
  messageCount: number;
}

// Mock conversations removed - using live data from Supabase

interface ConversationOverviewProps {
  className?: string;
}

export function ConversationOverview({ className }: ConversationOverviewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder - will be rebuilt
    setIsLoading(false);
    setConversations([]);
  }, []);

  useEffect(() => {
    let filtered = conversations;
    
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter);
    }
    
    setFilteredConversations(filtered);
  }, [conversations, searchQuery, statusFilter]);

  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleContinueChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleArchiveChat = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, status: 'archived' as const } : conv
    ));
  };

  const renderConversation = (conversation: Conversation) => (
    <div 
      key={conversation.id}
      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {conversation.title}
            </h4>
            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {conversation.lastMessage}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {conversation.timestamp}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {conversation.participants} participant{conversation.participants !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {conversation.messageCount} messages
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={`text-xs ${getStatusColor(conversation.status)}`}>
              {conversation.status}
            </Badge>
            {conversation.aiProvider && (
              <Badge variant="secondary" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                {conversation.aiProvider}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleContinueChat(conversation.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleContinueChat(conversation.id)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Continue Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchiveChat(conversation.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`${className} transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Recent Conversations</CardTitle>
        <CardDescription>
          Your latest AI-powered conversations and quick actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'archived'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className="h-9 text-xs"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-surface rounded-lg border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {conversations.filter(c => c.status === 'active').length}
            </p>
            <p className="text-xs text-muted-foreground">Active Chats</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Unread</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {conversations.reduce((sum, c) => sum + c.messageCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Messages</p>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="space-y-2 max-h-96 overflow-y-auto chat-scroll">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-sm">Loading conversations...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(renderConversation)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations found</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-primary hover:shadow-glow"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start New Conversation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
