import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Settings, Users, Bot, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  primary_ai_provider_id: string | null;
  fallback_ai_provider_id: string | null;
  model_name: string | null;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  ai_providers?: any;
  fallback_providers?: any;
}

interface AIProvider {
  id: string;
  name: string;
  type: string;
  config: any;
  is_active: boolean;
}

export default function ChatbotManagement() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      system_prompt: '',
      primary_ai_provider_id: '',
      fallback_ai_provider_id: '',
      model_name: '',
      is_active: true
    }
  });

  useEffect(() => {
    fetchChatbots();
    fetchProviders();
  }, []);

  const fetchChatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select(`
          *,
          ai_providers:primary_ai_provider_id(name, type),
          fallback_providers:fallback_ai_provider_id(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatbots(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('id, name, type, config, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateChatbot = () => {
    form.reset();
    setDialogMode('create');
    setSelectedChatbot(null);
    setIsDialogOpen(true);
  };

  const handleEditChatbot = (chatbot: Chatbot) => {
    form.reset({
      name: chatbot.name,
      description: chatbot.description || '',
      system_prompt: chatbot.system_prompt || '',
      primary_ai_provider_id: chatbot.primary_ai_provider_id || '',
      fallback_ai_provider_id: chatbot.fallback_ai_provider_id || '',
      model_name: chatbot.model_name || '',
      is_active: chatbot.is_active
    });
    setDialogMode('edit');
    setSelectedChatbot(chatbot);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      // Get current user's tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const chatbotData = {
        name: data.name,
        description: data.description || null,
        system_prompt: data.system_prompt || null,
        primary_ai_provider_id: data.primary_ai_provider_id || null,
        fallback_ai_provider_id: data.fallback_ai_provider_id || null,
        model_name: data.model_name || null,
        is_active: data.is_active,
        tenant_id: profile?.tenant_id
      };

      if (dialogMode === 'create') {
        const { error } = await supabase
          .from('chatbots')
          .insert([chatbotData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Chatbot created successfully"
        });
      } else {
        const { error } = await supabase
          .from('chatbots')
          .update(chatbotData)
          .eq('id', selectedChatbot?.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Chatbot updated successfully"
        });
      }

      setIsDialogOpen(false);
      fetchChatbots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteChatbot = async (chatbotId: string) => {
    try {
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', chatbotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chatbot deleted successfully"
      });
      
      fetchChatbots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'mistral': return '🌬️';
      case 'ollama': return '🦙';
      default: return '⚙️';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Chatbot Management</h1>
              <p className="text-muted-foreground">Create and manage AI-powered chatbots</p>
            </div>
            <Button onClick={handleCreateChatbot} className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Create Chatbot
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {chatbot.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={chatbot.is_active ? "default" : "secondary"}>
                    {chatbot.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {chatbot.ai_providers && !chatbot.ai_providers.error && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>{getProviderIcon(chatbot.ai_providers.type)}</span>
                      <span className="text-muted-foreground">
                        Powered by {chatbot.ai_providers.name}
                      </span>
                    </div>
                  )}
                  {chatbot.model_name && (
                    <div className="text-sm text-muted-foreground">
                      Model: {chatbot.model_name}
                    </div>
                  )}
                  {chatbot.fallback_providers && !chatbot.fallback_providers.error && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getProviderIcon(chatbot.fallback_providers.type)}</span>
                      <span>Fallback: {chatbot.fallback_providers.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditChatbot(chatbot)}
                    className="flex-1"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteChatbot(chatbot.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {chatbots.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Chatbots</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first AI-powered chatbot with custom prompts and provider selection.
            </p>
            <Button onClick={handleCreateChatbot} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Chatbot
            </Button>
          </div>
        )}
      </div>

      {/* Chatbot Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create Chatbot' : 'Edit Chatbot'}
            </DialogTitle>
            <DialogDescription>
              Configure your chatbot with AI provider selection and custom prompts.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chatbot Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer Support Bot" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A helpful chatbot for customer support inquiries..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="You are a helpful customer support assistant. Always be polite and professional..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This prompt will define the chatbot's personality and behavior.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primary_ai_provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary AI Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center gap-2">
                                <span>{getProviderIcon(provider.type)}</span>
                                {provider.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fallback_ai_provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fallback" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center gap-2">
                                <span>{getProviderIcon(provider.type)}</span>
                                {provider.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Used when primary provider fails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="model_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Override (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="gpt-4o, claude-3-opus-20240229, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Override the provider's default model
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Chatbot</FormLabel>
                      <FormDescription>
                        Enable this chatbot for users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {dialogMode === 'create' ? 'Create Chatbot' : 'Update Chatbot'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}