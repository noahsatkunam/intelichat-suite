import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProviderLogo from '@/components/ai/ProviderLogo';
import { providerModels } from '@/data/providerModels';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIProvider {
  id: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
}

export default function AIModelTest() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (providerId) {
      fetchProvider();
    }
  }, [providerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProvider = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error) throw error;
      
      setProvider(data);
      
      // Get available models for this provider by running a health check
      try {
        const { data: healthData, error: healthError } = await supabase.functions.invoke('ai-provider-health-check', {
          body: { provider_id: providerId }
        });

        if (healthError) {
          console.error('Health check failed:', healthError);
          // Fall back to default models from providerModels
          const fallbackModels = providerModels[data.type as keyof typeof providerModels] || [];
          setAvailableModels(fallbackModels.map(m => m.id));
          if (fallbackModels.length > 0) {
            setSelectedModel(fallbackModels[0].id);
          }
        } else {
          // Use available models from health check
          const models = healthData.available_models || [];
          if (models.length > 0) {
            setAvailableModels(models);
            setSelectedModel(models[0]);
          } else {
            // Fall back to default models if no models returned
            const fallbackModels = providerModels[data.type as keyof typeof providerModels] || [];
            setAvailableModels(fallbackModels.map(m => m.id));
            if (fallbackModels.length > 0) {
              setSelectedModel(fallbackModels[0].id);
            }
          }
        }
      } catch (healthError) {
        console.error('Health check error:', healthError);
        // Fall back to default models
        const fallbackModels = providerModels[data.type as keyof typeof providerModels] || [];
        setAvailableModels(fallbackModels.map(m => m.id));
        if (fallbackModels.length > 0) {
          setSelectedModel(fallbackModels[0].id);
        }
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      navigate('/admin/ai-providers');
    } finally {
      setIsLoadingProvider(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedModel || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-test', {
        body: {
          provider_id: providerId,
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. Keep your responses concise and helpful.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage.content
            }
          ]
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to get response from AI',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (isLoadingProvider) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Provider not found</p>
      </div>
    );
  }

  const staticModels = providerModels[provider.type as keyof typeof providerModels] || [];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin/ai-providers')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Providers
              </Button>
              <div className="flex items-center gap-3">
                <ProviderLogo provider={provider.type} size="lg" />
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    Test {provider.name}
                  </h1>
                  <p className="text-muted-foreground">
                    Chat with the AI model to test functionality
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={provider.is_active ? "default" : "secondary"}>
                {provider.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" onClick={clearMessages} disabled={messages.length === 0}>
                Clear Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Model:</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((modelId) => {
                // Try to find model details from static data first
                const modelDetails = staticModels.find(m => m.id === modelId);
                return (
                  <SelectItem key={modelId} value={modelId}>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{modelDetails?.name || modelId}</span>
                      {modelDetails?.description && (
                        <span className="text-xs text-muted-foreground">{modelDetails.description}</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>Start a conversation</CardTitle>
                <CardDescription>
                  Send a message to test the {provider.name} AI provider with the selected model.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <Card className={`max-w-2xl ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 opacity-70`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading || !selectedModel}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !inputMessage.trim() || !selectedModel}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}