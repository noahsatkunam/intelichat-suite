import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Settings, Users, Bot, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
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
  is_active: boolean;
}

interface ProviderModel {
  id: string;
  provider_type: string;
  model_name: string;
  display_name: string;
  description: string | null;
  max_context_length: number | null;
  supports_vision: boolean;
  supports_function_calling: boolean;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface Document {
  id: string;
  filename: string;
  status: string;
}

const chatbotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  system_prompt: z.string().min(10, 'System prompt must be at least 10 characters').max(5000, 'System prompt too long'),
  primary_ai_provider_id: z.string().min(1, 'Primary provider is required'),
  fallback_ai_provider_id: z.string().optional(),
  model_name: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(32000),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(0).max(2),
  presence_penalty: z.number().min(0).max(2),
  is_active: z.boolean(),
  tenant_ids: z.array(z.string()).min(1, 'Select at least one tenant'),
  document_ids: z.array(z.string()).optional()
});

export default function ChatbotManagement() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [availableModels, setAvailableModels] = useState<ProviderModel[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      name: '',
      description: '',
      system_prompt: '',
      primary_ai_provider_id: '',
      fallback_ai_provider_id: '',
      model_name: '',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      is_active: true,
      tenant_ids: [],
      document_ids: []
    }
  });

  const selectedProviderType = providers.find(p => p.id === form.watch('primary_ai_provider_id'))?.type;
  const modelsForProvider = availableModels.filter(m => m.provider_type === selectedProviderType);

  useEffect(() => {
    fetchChatbots();
    fetchProviders();
    fetchProviderModels();
    fetchTenants();
    fetchDocuments();
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
        .select('id, name, type, is_active')
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

  const fetchProviderModels = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_models')
        .select('*')
        .eq('is_deprecated', false)
        .order('provider_type', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      setAvailableModels(data || []);
    } catch (error: any) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, subdomain')
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, filename, status')
        .eq('status', 'processed')
        .order('filename');

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateChatbot = () => {
    form.reset({
      name: '',
      description: '',
      system_prompt: '',
      primary_ai_provider_id: '',
      fallback_ai_provider_id: '',
      model_name: '',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      is_active: true,
      tenant_ids: [],
      document_ids: []
    });
    setDialogMode('create');
    setSelectedChatbot(null);
    setTestMessage('');
    setTestResponse('');
    setIsDialogOpen(true);
  };

  const handleEditChatbot = async (chatbot: Chatbot) => {
    // Fetch tenant assignments
    const { data: tenantAssignments } = await supabase
      .from('chatbot_tenants')
      .select('tenant_id')
      .eq('chatbot_id', chatbot.id);

    // Fetch knowledge base assignments
    const { data: knowledgeAssignments } = await supabase
      .from('chatbot_knowledge')
      .select('document_id')
      .eq('chatbot_id', chatbot.id);

    form.reset({
      name: chatbot.name,
      description: chatbot.description || '',
      system_prompt: chatbot.system_prompt || '',
      primary_ai_provider_id: chatbot.primary_ai_provider_id || '',
      fallback_ai_provider_id: chatbot.fallback_ai_provider_id || '',
      model_name: chatbot.model_name || '',
      temperature: chatbot.temperature || 0.7,
      max_tokens: chatbot.max_tokens || 1000,
      top_p: chatbot.top_p || 1.0,
      frequency_penalty: chatbot.frequency_penalty || 0.0,
      presence_penalty: chatbot.presence_penalty || 0.0,
      is_active: chatbot.is_active,
      tenant_ids: tenantAssignments?.map(t => t.tenant_id) || [],
      document_ids: knowledgeAssignments?.map(k => k.document_id) || []
    });
    setDialogMode('edit');
    setSelectedChatbot(chatbot);
    setTestMessage('');
    setTestResponse('');
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof chatbotSchema>) => {
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
        system_prompt: data.system_prompt,
        primary_ai_provider_id: data.primary_ai_provider_id,
        fallback_ai_provider_id: data.fallback_ai_provider_id || null,
        model_name: data.model_name,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
        top_p: data.top_p,
        frequency_penalty: data.frequency_penalty,
        presence_penalty: data.presence_penalty,
        is_active: data.is_active,
        tenant_id: profile?.tenant_id
      };

      let chatbotId: string;

      if (dialogMode === 'create') {
        const { data: newChatbot, error } = await supabase
          .from('chatbots')
          .insert([chatbotData])
          .select()
          .single();
        
        if (error) throw error;
        chatbotId = newChatbot.id;
        
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
        chatbotId = selectedChatbot!.id;
        
        // Delete existing tenant and knowledge assignments
        await supabase.from('chatbot_tenants').delete().eq('chatbot_id', chatbotId);
        await supabase.from('chatbot_knowledge').delete().eq('chatbot_id', chatbotId);
        
        toast({
          title: "Success",
          description: "Chatbot updated successfully"
        });
      }

      // Add tenant assignments
      if (data.tenant_ids.length > 0) {
        const tenantAssignments = data.tenant_ids.map(tenantId => ({
          chatbot_id: chatbotId,
          tenant_id: tenantId
        }));
        
        const { error: tenantError } = await supabase
          .from('chatbot_tenants')
          .insert(tenantAssignments);
        
        if (tenantError) throw tenantError;
      }

      // Add knowledge base assignments
      if (data.document_ids && data.document_ids.length > 0) {
        const knowledgeAssignments = data.document_ids.map(documentId => ({
          chatbot_id: chatbotId,
          document_id: documentId
        }));
        
        const { error: knowledgeError } = await supabase
          .from('chatbot_knowledge')
          .insert(knowledgeAssignments);
        
        if (knowledgeError) throw knowledgeError;
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
              <p className="text-muted-foreground">Create and manage AI-powered chatbots with custom models and parameters</p>
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
                        {chatbot.ai_providers.name}
                      </span>
                    </div>
                  )}
                  {chatbot.model_name && (
                    <div className="text-sm text-muted-foreground">
                      Model: {chatbot.model_name}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Temp: {chatbot.temperature} | Tokens: {chatbot.max_tokens}</div>
                  </div>
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
              Create your first AI-powered chatbot. Choose from your configured API keys and select specific models.
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create Chatbot' : 'Edit Chatbot'}
            </DialogTitle>
            <DialogDescription>
              Configure your chatbot with specific AI models and parameters.
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

              {/* Provider and Model Selection */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold">AI Provider & Model</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_ai_provider_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary API Key</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('model_name', ''); // Reset model when provider changes
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select API key" />
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
                    name="model_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProviderType}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedProviderType ? "Select model" : "Select provider first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelsForProvider.map((model) => (
                              <SelectItem key={model.id} value={model.model_name}>
                                <div className="space-y-1">
                                  <div className="font-medium">{model.display_name}</div>
                                  {model.description && (
                                    <div className="text-xs text-muted-foreground">{model.description}</div>
                                  )}
                                  <div className="text-xs text-muted-foreground flex gap-2">
                                    {model.max_context_length && <span>{model.max_context_length.toLocaleString()} tokens</span>}
                                    {model.supports_vision && <span>Vision</span>}
                                    {model.supports_function_calling && <span>Functions</span>}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Available models for the selected provider
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fallback_ai_provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback Provider (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fallback API key" />
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
                        Used when primary provider fails (will use default model)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tenant Access Control */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Tenant Access</h3>
                </div>
                <FormField
                  control={form.control}
                  name="tenant_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Select Tenants</FormLabel>
                      <FormDescription>
                        Choose which tenants can access this chatbot
                      </FormDescription>
                      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                        {tenants.map((tenant) => (
                          <FormField
                            key={tenant.id}
                            control={form.control}
                            name="tenant_ids"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tenant.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tenant.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, tenant.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tenant.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex-1">
                                    <FormLabel className="font-normal cursor-pointer">
                                      {tenant.name}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                      {tenant.subdomain}
                                    </p>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Knowledge Base */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Knowledge Base</h3>
                </div>
                <FormField
                  control={form.control}
                  name="document_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Select Documents (Optional)</FormLabel>
                      <FormDescription>
                        Add documents to enhance the chatbot's knowledge
                      </FormDescription>
                      {documents.length === 0 ? (
                        <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                          No processed documents available. Upload documents in the Knowledge Base section first.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                          {documents.map((document) => (
                            <FormField
                              key={document.id}
                              control={form.control}
                              name="document_ids"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={document.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(document.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), document.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== document.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer flex-1">
                                      {document.filename}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Model Parameters */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold">Model Parameters</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Controls randomness (0 = focused, 2 = creative)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="max_tokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Tokens</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={32000}
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum response length
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="top_p"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top P: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.05}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Nucleus sampling (0.1 = focused, 1.0 = diverse)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="frequency_penalty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency Penalty: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Reduce repetition (0 = none, 2 = maximum)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="presence_penalty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presence Penalty: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Encourage new topics (0 = none, 2 = maximum)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Test Section */}
              {dialogMode === 'edit' && selectedChatbot && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Test Chatbot</h3>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Test Message</FormLabel>
                    <Textarea
                      placeholder="Enter a test message to see how the chatbot responds..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!testMessage.trim()) {
                        toast({
                          title: "Error",
                          description: "Please enter a test message",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      setIsTesting(true);
                      setTestResponse('');
                      
                      try {
                        const { data, error } = await supabase.functions.invoke('ai-chat', {
                          body: {
                            chatbot_id: selectedChatbot.id,
                            message: testMessage,
                            conversation_id: null
                          }
                        });

                        if (error) throw error;

                        setTestResponse(data.response || 'No response received');
                        
                        toast({
                          title: "Success",
                          description: `Response generated via ${data.provider_name || 'AI Provider'}`
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || 'Failed to get response',
                          variant: "destructive"
                        });
                      } finally {
                        setIsTesting(false);
                      }
                    }}
                    disabled={isTesting || !testMessage.trim()}
                    className="w-full"
                  >
                    {isTesting ? 'Generating Response...' : 'Test Chatbot'}
                  </Button>
                  
                  {testResponse && (
                    <div className="space-y-2">
                      <FormLabel>Response</FormLabel>
                      <div className="p-3 rounded-lg bg-background border whitespace-pre-wrap">
                        {testResponse}
                      </div>
                    </div>
                  )}
                </div>
              )}

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