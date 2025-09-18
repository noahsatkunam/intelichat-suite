import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Settings, AlertCircle, CheckCircle, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import ProviderLogo from '@/components/ai/ProviderLogo';
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

interface AIProvider {
  id: string;
  name: string;
  type: string;
  description: string | null;
  base_url: string | null;
  organization_id: string | null;
  project_id: string | null;
  custom_headers: any;
  is_active: boolean;
  is_healthy: boolean;
  last_health_check: string | null;
  created_at: string;
  api_key_encrypted: string | null;
}

const providerTypes = [
  { 
    value: 'openai', 
    label: 'OpenAI', 
    description: 'GPT models for chat, completion, and embeddings',
    fields: ['organization_id'],
    icon: 'openai'
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic Claude', 
    description: 'Claude models for advanced reasoning and analysis',
    fields: [],
    icon: 'anthropic'
  },
  { 
    value: 'google', 
    label: 'Google Gemini', 
    description: 'Gemini models for multimodal AI capabilities',
    fields: ['project_id'],
    icon: 'google'
  },
  { 
    value: 'mistral', 
    label: 'Mistral AI', 
    description: 'Open-source models for various AI tasks',
    fields: [],
    icon: 'mistral'
  },
  { 
    value: 'meta', 
    label: 'Meta Llama', 
    description: 'Meta\'s Llama models for various AI tasks',
    fields: [],
    icon: 'meta'
  },
  { 
    value: 'xai', 
    label: 'xAI Grok', 
    description: 'xAI\'s Grok models for real-time understanding',
    fields: [],
    icon: 'xai'
  },
  { 
    value: 'custom', 
    label: 'Custom OpenAI-Compatible', 
    description: 'Custom API endpoints with OpenAI-compatible interface',
    fields: ['base_url', 'custom_headers'],
    icon: 'custom'
  },
  { 
    value: 'ollama', 
    label: 'Ollama (Local)', 
    description: 'Self-hosted local AI models',
    fields: ['base_url'],
    icon: 'ollama'
  }
];

export default function AIProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Record<string, AIProvider>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      type: 'openai',
      description: '',
      api_key: '',
      base_url: '',
      organization_id: '',
      project_id: '',
      custom_headers: '{}',
      is_active: true
    }
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      // Get all existing providers
      const { data: existingProviders, error } = await supabase
        .from('ai_providers')
        .select('*');

      if (error) throw error;

      // Create a map of existing providers by type
      const providerMap: Record<string, AIProvider> = {};
      existingProviders?.forEach(provider => {
        providerMap[provider.type] = provider;
      });

      // Create missing providers for each type
      const missingProviders = providerTypes.filter(type => !providerMap[type.value]);
      
      if (missingProviders.length > 0) {
        const newProviders = missingProviders.map(type => ({
          name: type.label,
          type: type.value,
          description: type.description,
          is_active: false,
          is_healthy: false
        }));

        const { data: createdProviders, error: createError } = await supabase
          .from('ai_providers')
          .insert(newProviders)
          .select('*');

        if (createError) throw createError;

        // Add created providers to the map
        createdProviders?.forEach(provider => {
          providerMap[provider.type] = provider;
        });
      }

      setProviders(providerMap);
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

  const handleEditProvider = (provider: AIProvider) => {
    form.reset({
      name: provider.name,
      type: provider.type,
      description: provider.description || '',
      api_key: provider.api_key_encrypted || '',
      base_url: provider.base_url || '',
      organization_id: provider.organization_id || '',
      project_id: provider.project_id || '',
      custom_headers: provider.custom_headers ? JSON.stringify(provider.custom_headers, null, 2) : '{}',
      is_active: provider.is_active
    });
    setSelectedProvider(provider);
    setShowApiKey(false);
    setIsDialogOpen(true);
  };

  const toggleProvider = async (provider: AIProvider) => {
    try {
      const { error } = await supabase
        .from('ai_providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${provider.name} ${provider.is_active ? 'disabled' : 'enabled'}`,
      });
      
      fetchProviders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Parse custom headers if provided
      let customHeaders = {};
      if (data.custom_headers) {
        try {
          customHeaders = JSON.parse(data.custom_headers);
        } catch (e) {
          toast({
            title: "Error",
            description: "Invalid JSON format for custom headers",
            variant: "destructive"
          });
          return;
        }
      }

      const providerData = {
        name: data.name,
        type: data.type,
        description: data.description || null,
        base_url: data.base_url || null,
        organization_id: data.organization_id || null,
        project_id: data.project_id || null,
        custom_headers: customHeaders,
        is_active: data.is_active,
        ...(data.api_key && data.api_key.trim() !== '' && { api_key_encrypted: data.api_key })
      };

        const { error } = await supabase
          .from('ai_providers')
          .update(providerData)
          .eq('id', selectedProvider?.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Provider updated successfully"
        });

      setIsDialogOpen(false);
      fetchProviders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      const { error } = await supabase
        .from('ai_providers')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully"
      });
      
      fetchProviders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleHealthCheck = async (providerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-provider-health-check', {
        body: { provider_id: providerId }
      });

      if (error) throw error;

      toast({
        title: "Health Check",
        description: data.healthy ? "Provider is healthy" : "Provider health check failed",
        variant: data.healthy ? "default" : "destructive"
      });
      
      fetchProviders();
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
              <h1 className="text-2xl font-display font-bold text-foreground">AI Provider Configuration</h1>
              <p className="text-muted-foreground">Configure API keys and settings for AI providers. Models are selected when creating chatbots.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 max-w-4xl mx-auto">
          {providerTypes.map((providerType) => {
            const provider = providers[providerType.value];
            const isConfigured = provider?.api_key_encrypted;
            
            return (
              <Card key={providerType.value} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ProviderLogo provider={providerType.value} size="lg" />
                      <div>
                        <CardTitle className="text-xl">{providerType.label}</CardTitle>
                        <CardDescription>{providerType.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {provider?.is_healthy ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${isConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isConfigured ? '🔑 Configured' : '⚠️ Not Configured'}
                        </span>
                      </div>
                      <Switch
                        checked={provider?.is_active || false}
                        onCheckedChange={() => provider && toggleProvider(provider)}
                        disabled={!isConfigured}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => provider && handleEditProvider(provider)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {isConfigured ? 'Edit Configuration' : 'Configure'}
                    </Button>
                    {isConfigured && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/ai-providers/test/${provider.id}`)}
                        className="flex-1"
                        disabled={!provider?.is_active}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                    )}
                  </div>
                  {provider?.last_health_check && (
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(provider.last_health_check).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <ProviderLogo provider={selectedProvider?.type || 'custom'} size="lg" />
              <div>
                <DialogTitle>
                  Configure {selectedProvider?.name}
                </DialogTitle>
                <DialogDescription>
                  Set up your API key and provider-specific settings. Models will be selected when creating chatbots.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      This is the standard name for this AI provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Production OpenAI key for customer chatbots..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showApiKey ? "text" : "password"} 
                          placeholder={selectedProvider?.api_key_encrypted ? "Current API key (leave unchanged or enter new key)" : "Enter API key"} 
                          {...field} 
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {selectedProvider?.api_key_encrypted 
                        ? "Your API key is saved and secure. You can view it using the eye icon or replace it with a new key."
                        : "Your API key will be encrypted and stored securely."
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Provider-specific fields */}
              <div className="space-y-4">
                {selectedProvider?.type === 'openai' && (
                  <FormField
                    control={form.control}
                    name="organization_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="org-..." {...field} />
                        </FormControl>
                        <FormDescription>
                          For OpenAI organization accounts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedProvider?.type === 'google' && (
                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project ID</FormLabel>
                        <FormControl>
                          <Input placeholder="your-google-project-id" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Google Cloud project ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {(selectedProvider?.type === 'custom' || selectedProvider?.type === 'ollama') && (
                  <FormField
                    control={form.control}
                    name="base_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {selectedProvider?.type === 'ollama' ? 'Ollama URL' : 'API Base URL'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={
                              selectedProvider?.type === 'ollama' 
                                ? "http://localhost:11434" 
                                : "https://api.custom-provider.com/v1"
                            } 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {selectedProvider?.type === 'ollama' 
                            ? 'URL of your Ollama instance'
                            : 'Base URL for your custom API endpoint'
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedProvider?.type === 'custom' && (
                  <FormField
                    control={form.control}
                    name="custom_headers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Headers (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{"X-Custom-Header": "value"}'
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Additional headers in JSON format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Provider</FormLabel>
                      <FormDescription>
                        Enable this API key for use in chatbots
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
                  Update Configuration
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}