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
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  chatbot_id: string;
  chatbots?: {
    name: string;
    avatar_url: string | null;
  };
}

interface ConversationOverviewProps {
  className?: string;
}

export function ConversationOverview({ className }: ConversationOverviewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          updated_at,
          chatbot_id,
          chatbots:chatbot_id (
            name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversations(data || []);
      setFilteredConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.chatbots?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const handleContinueChat = (conversationId: string, chatbotId: string) => {
    navigate('/chat', { state: { conversationId, chatbotId } });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversation = (conversation: Conversation) => (
    <div 
      key={conversation.id}
      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] group cursor-pointer"
      onClick={() => handleContinueChat(conversation.id, conversation.chatbot_id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {conversation.chatbots?.avatar_url ? (
            <Avatar className="w-10 h-10 mt-1">
              <AvatarImage src={conversation.chatbots.avatar_url} alt="Chatbot" />
              <AvatarFallback>
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
              <Bot className="w-5 h-5 text-primary" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {conversation.title}
            </h4>
            
            {conversation.chatbots?.name && (
              <p className="text-sm text-muted-foreground mt-1">
                {conversation.chatbots.name}
              </p>
            )}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Clock className="w-3 h-3" />
              {getTimeAgo(conversation.updated_at)}
            </div>
          </div>
        </div>
        
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity mt-3" />
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
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-surface rounded-lg border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {conversations.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Conversations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {conversations.length > 0 ? conversations[0].title.length : 0}
            </p>
            <p className="text-xs text-muted-foreground">Recent Activity</p>
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
            onClick={() => navigate('/chat')}
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
