import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Sparkles, Bot, Zap, Brain, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import ProviderLogo from '@/components/ai/ProviderLogo';
import { ConversationInterface } from '@/components/chat/ConversationInterface';
import { ConversationHistory } from '@/components/chat/ConversationHistory';
import { conversationService } from '@/services/conversationService';

interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  model_name: string | null;
  ai_providers?: {
    name: string;
    type: string;
  };
}

export default function Chat() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [newChatCounter, setNewChatCounter] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableChatbots();
  }, []);

  const fetchAvailableChatbots = async () => {
    try {
      setLoading(true);
      
      // Get current user's tenant and role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to access chat",
          variant: "destructive"
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Error",
          description: "User profile not found",
          variant: "destructive"
        });
        return;
      }

      // Global admins can see all chatbots
      if (profile.role === 'global_admin') {
        const { data: chatbotData, error: chatbotError } = await supabase
          .from('chatbots')
          .select(`
            id,
            name,
            description,
            avatar_url,
            is_active,
            model_name,
            ai_providers!primary_ai_provider_id(name, type)
          `)
          .eq('is_active', true)
          .order('name');

        if (chatbotError) throw chatbotError;
        setChatbots((chatbotData || []) as Chatbot[]);
        return;
      }

      // Regular users see chatbots assigned to their tenant
      if (!profile.tenant_id) {
        toast({
          title: "Error",
          description: "User profile not found",
          variant: "destructive"
        });
        return;
      }

      // Fetch chatbots assigned to this tenant
      const { data: assignments, error: assignmentError } = await supabase
        .from('chatbot_tenants')
        .select('chatbot_id')
        .eq('tenant_id', profile.tenant_id);

      if (assignmentError) throw assignmentError;

      if (!assignments || assignments.length === 0) {
        setChatbots([]);
        return;
      }

      const chatbotIds = assignments.map(a => a.chatbot_id);

      // Fetch chatbot details
      const { data: chatbotData, error: chatbotError } = await supabase
        .from('chatbots')
        .select(`
          id,
          name,
          description,
          avatar_url,
          is_active,
          model_name,
          ai_providers!primary_ai_provider_id(name, type)
        `)
        .in('id', chatbotIds)
        .eq('is_active', true)
        .order('name');

      if (chatbotError) throw chatbotError;

      setChatbots((chatbotData || []) as Chatbot[]);
    } catch (error: any) {
      console.error('Failed to fetch chatbots:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load chatbots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChatbot = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setSelectedConversationId(null);
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const messages = await conversationService.fetchConversationMessages(conversationId);
      
      // Fetch the conversation to get chatbot info
      const { data: conversation } = await supabase
        .from('conversations')
        .select('chatbot_id, chatbots:chatbot_id(id, name, description, avatar_url, is_active, model_name)')
        .eq('id', conversationId)
        .single();
      
      setConversationMessages(messages);
      setSelectedConversationId(conversationId);
      
      // Keep the chatbot selected if we have one
      if (conversation?.chatbots) {
        setSelectedChatbot(conversation.chatbots as any);
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    }
  };

  const handleNewChat = () => {
    setSelectedChatbot(null);
    setSelectedConversationId(null);
    setConversationMessages([]);
    setNewChatCounter(prev => prev + 1);
  };

  const handleNewChatSameChatbot = () => {
    // Reset conversation but keep the selected chatbot
    setSelectedConversationId(null);
    setConversationMessages([]);
    setNewChatCounter(prev => prev + 1);
    // Force a re-render by creating a new chatbot reference
    if (selectedChatbot) {
      setSelectedChatbot({ ...selectedChatbot });
    }
  };

  const handleCustomAI = () => {
    // TODO: Navigate to custom AI configuration
    console.log('Custom AI selected');
  };

  if (selectedChatbot) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r bg-card/30">
          <ConversationHistory
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChatSameChatbot}
            currentConversationId={selectedConversationId}
          />
        </div>
        <div className="flex-1">
          <ConversationInterface
            key={selectedConversationId || `new-${newChatCounter}`} // Force re-render on conversation change or new chat
            chatbotId={selectedChatbot.id}
            chatbotName={selectedChatbot.name}
            onBack={handleNewChat}
            existingConversationId={selectedConversationId}
            existingMessages={conversationMessages}
          />
        </div>
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r bg-card/30">
          <ConversationHistory
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            currentConversationId={selectedConversationId}
          />
        </div>
        <div className="flex-1">
          <ConversationInterface
            key={selectedConversationId || `new-${newChatCounter}`}
            chatbotId={selectedChatbot?.id || ''}
            chatbotName="Conversation"
            onBack={handleNewChat}
            existingConversationId={selectedConversationId}
            existingMessages={conversationMessages}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6 shadow-glow">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            Start a Conversation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose an AI assistant tailored to your needs, or create a custom conversation
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading available assistants...</span>
            </div>
          </div>
        )}

        {/* Chatbots Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Custom AI Option */}
            <Card 
              onClick={handleCustomAI}
              className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-2 border-primary/30 cursor-pointer group bg-gradient-to-br from-primary/5 to-transparent"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-gradient-primary shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="default" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Custom
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  Custom AI Assistant
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  Configure your own AI assistant with custom settings, providers, and models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            {/* Available Chatbots */}
            {chatbots.map((chatbot) => (
              <Card 
                key={chatbot.id}
                onClick={() => handleSelectChatbot(chatbot)}
                className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20 cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={chatbot.avatar_url || ''} alt={chatbot.name} />
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="w-6 h-6 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    {chatbot.ai_providers && (
                      <ProviderLogo provider={chatbot.ai_providers.type} size="sm" />
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {chatbot.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {chatbot.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chatbot.model_name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Brain className="w-3 h-3" />
                        <span>{chatbot.model_name}</span>
                      </div>
                    )}
                    {chatbot.ai_providers && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        <span>{chatbot.ai_providers.name}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all pt-2">
                      Start Chat
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && chatbots.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Chatbots Available
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Your tenant doesn't have any chatbots configured yet. Contact your administrator or create a custom AI assistant.
            </p>
            <Button onClick={handleCustomAI} className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Sparkles className="w-4 h-4" />
              Create Custom Assistant
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-12 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-sm text-muted-foreground">
            Your conversations are secure and private
          </p>
        </div>
      </div>
    </div>
  );
}
