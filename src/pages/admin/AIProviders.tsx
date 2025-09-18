import React, { useState, useEffect } from 'react';
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
    fields: ['organization_id'] 
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic Claude', 
    description: 'Claude models for advanced reasoning and analysis',
    fields: [] 
  },
  { 
    value: 'google', 
    label: 'Google Gemini', 
    description: 'Gemini models for multimodal AI capabilities',
    fields: ['project_id'] 
  },
  { 
    value: 'mistral', 
    label: 'Mistral AI', 
    description: 'Open-source models for various AI tasks',
    fields: [] 
  },
  { 
    value: 'custom', 
    label: 'Custom OpenAI-Compatible', 
    description: 'Custom API endpoints with OpenAI-compatible interface',
    fields: ['base_url', 'custom_headers'] 
  },
  { 
    value: 'ollama', 
    label: 'Ollama (Local)', 
    description: 'Self-hosted local AI models',
    fields: ['base_url'] 
  }
];

export default function AIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
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
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
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

  const handleCreateProvider = () => {
    form.reset();
    setDialogMode('create');
    setSelectedProvider(null);
    setShowApiKey(false);
    setIsDialogOpen(true);
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
    setDialogMode('edit');
    setSelectedProvider(provider);
    setShowApiKey(false);
    setIsDialogOpen(true);
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

      if (dialogMode === 'create') {
        const { error } = await supabase
          .from('ai_providers')
          .insert([providerData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "API key created successfully"
        });
      } else {
        const { error } = await supabase
          .from('ai_providers')
          .update(providerData)
          .eq('id', selectedProvider?.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "API key updated successfully"
        });
      }

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
              <h1 className="text-2xl font-display font-bold text-foreground">API Key Management</h1>
              <p className="text-muted-foreground">Manage API keys for AI providers. Models are selected when creating chatbots.</p>
            </div>
            <Button onClick={handleCreateProvider} className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Add API Key
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProviderLogo provider={provider.type} size="lg" />
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription className="capitalize">{provider.type}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.is_healthy ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <Badge variant={provider.is_active ? "default" : "secondary"}>
                      {provider.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{provider.description || providerTypes.find(t => t.value === provider.type)?.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${provider.api_key_encrypted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {provider.api_key_encrypted ? '🔑 API Key Configured' : '⚠️ No API Key'}
                    </span>
                  </div>
                  {provider.base_url && (
                    <p className="font-mono text-xs">API: {provider.base_url}</p>
                  )}
                  {provider.last_health_check && (
                    <p>Last checked: {new Date(provider.last_health_check).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHealthCheck(provider.id)}
                    className="flex-1"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProvider(provider)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No API Keys Configured</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Add your first API key to start using AI providers. Each key can be used by multiple chatbots.
            </p>
            <Button onClick={handleCreateProvider} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First API Key
            </Button>
          </div>
        )}
      </div>

      {/* Provider Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <ProviderLogo provider={form.watch('type')} size="lg" />
              <div>
                <DialogTitle>
                  {dialogMode === 'create' ? 'Add API Key' : 'Edit API Key'}
                </DialogTitle>
                <DialogDescription>
                  Configure your API key and provider-specific settings. Models will be selected when creating chatbots.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input placeholder="OpenAI Production Key" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this API key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          placeholder={dialogMode === 'edit' ? "Current API key (leave unchanged or enter new key)" : "Enter API key"} 
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
                      {dialogMode === 'edit' 
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
                {form.watch('type') === 'openai' && (
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
                
                {form.watch('type') === 'google' && (
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
                
                {(form.watch('type') === 'custom' || form.watch('type') === 'ollama') && (
                  <FormField
                    control={form.control}
                    name="base_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch('type') === 'ollama' ? 'Ollama URL' : 'API Base URL'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={
                              form.watch('type') === 'ollama' 
                                ? "http://localhost:11434" 
                                : "https://api.custom-provider.com/v1"
                            } 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch('type') === 'ollama' 
                            ? 'URL of your Ollama instance'
                            : 'Base URL for your custom API endpoint'
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch('type') === 'custom' && (
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
                  {dialogMode === 'create' ? 'Create API Key' : 'Update API Key'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}