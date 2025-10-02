import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bot, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

export default function RecentConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentConversations();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conversation =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.chatbots?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const fetchRecentConversations = async () => {
    try {
      setLoading(true);
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
        .limit(50);

      if (error) throw error;
      setConversations(data || []);
      setFilteredConversations(data || []);
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    navigate('/chat', { 
      state: { 
        conversationId: conversation.id, 
        chatbotId: conversation.chatbot_id 
      } 
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Recent Conversations</h1>
              <p className="text-muted-foreground">View and continue your chat history</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No conversations match your search criteria. Try adjusting your search terms.
                </p>
              </>
            ) : (
              <>
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Conversations Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Start a new chat to begin your conversation history
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20"
                onClick={() => handleConversationClick(conversation)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {conversation.chatbots?.avatar_url ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.chatbots.avatar_url} alt="Chatbot" />
                          <AvatarFallback>
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">
                          {conversation.title}
                        </CardTitle>
                        {conversation.chatbots?.name && (
                          <CardDescription className="text-xs truncate">
                            {conversation.chatbots.name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeAgo(conversation.updated_at)}</span>
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
