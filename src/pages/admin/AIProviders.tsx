import React, { useState, useEffect } from 'react';
import { Brain, Plus, Settings, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  config: any;
  is_active: boolean;
  is_healthy: boolean;
  last_health_check: string | null;
  created_at: string;
}

const providerTypes = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'anthropic', label: 'Anthropic Claude', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
  { value: 'google', label: 'Google Gemini', models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'] },
  { value: 'mistral', label: 'Mistral AI', models: ['mistral-large', 'mistral-medium', 'mistral-small'] },
  { value: 'custom', label: 'Custom OpenAI-Compatible', models: [] },
  { value: 'ollama', label: 'Ollama (Local)', models: [] }
];

export default function AIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      type: 'openai',
      api_key: '',
      config: {
        model: '',
        max_tokens: 1000,
        temperature: 0.7,
        endpoint_url: '',
        organization_id: '',
        project_id: ''
      },
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
    setIsDialogOpen(true);
  };

  const handleEditProvider = (provider: AIProvider) => {
    form.reset({
      name: provider.name,
      type: provider.type,
      api_key: '',
      config: provider.config,
      is_active: provider.is_active
    });
    setDialogMode('edit');
    setSelectedProvider(provider);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const providerData = {
        name: data.name,
        type: data.type,
        config: data.config,
        is_active: data.is_active,
        ...(data.api_key && { api_key_encrypted: data.api_key })
      };

      if (dialogMode === 'create') {
        const { error } = await supabase
          .from('ai_providers')
          .insert([providerData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "AI provider created successfully"
        });
      } else {
        const { error } = await supabase
          .from('ai_providers')
          .update(providerData)
          .eq('id', selectedProvider?.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "AI provider updated successfully"
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
        description: "AI provider deleted successfully"
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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">AI Providers</h1>
              <p className="text-muted-foreground">Manage AI providers and model configurations</p>
            </div>
            <Button onClick={handleCreateProvider} className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Add Provider
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
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getProviderIcon(provider.type)}</span>
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
                <div className="text-sm text-muted-foreground">
                  <p>Model: {provider.config?.model || 'Not configured'}</p>
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
            <h3 className="text-lg font-semibold text-foreground mb-2">No AI Providers</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Get started by adding your first AI provider. Configure OpenAI, Anthropic, or other providers.
            </p>
            <Button onClick={handleCreateProvider} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Provider
            </Button>
          </div>
        )}
      </div>

      {/* Provider Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Add AI Provider' : 'Edit AI Provider'}
            </DialogTitle>
            <DialogDescription>
              Configure your AI provider settings and API credentials.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My OpenAI Provider" {...field} />
                      </FormControl>
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
                name="api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={dialogMode === 'edit' ? "Leave blank to keep existing key" : "Enter API key"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your API key will be encrypted and stored securely.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="config.model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Model</FormLabel>
                        <FormControl>
                          <Input placeholder="gpt-4o" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="config.max_tokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="config.temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              max="2" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  {form.watch('type') === 'custom' && (
                    <FormField
                      control={form.control}
                      name="config.endpoint_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Endpoint URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.custom-provider.com/v1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('type') === 'openai' && (
                    <FormField
                      control={form.control}
                      name="config.organization_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization ID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="org-..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('type') === 'google' && (
                    <FormField
                      control={form.control}
                      name="config.project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project ID</FormLabel>
                          <FormControl>
                            <Input placeholder="your-project-id" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>
              </Tabs>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Provider</FormLabel>
                      <FormDescription>
                        Enable this provider for use in chatbots
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
                  {dialogMode === 'create' ? 'Create Provider' : 'Update Provider'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}