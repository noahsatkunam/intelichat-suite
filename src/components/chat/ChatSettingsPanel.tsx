import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Settings, BookOpen, Plus, Trash2, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ProviderLogo from '@/components/ai/ProviderLogo';

interface ChatSettingsPanelProps {
  chatbotId: string;
  isAdmin: boolean;
  onClose: () => void;
}

interface Provider {
  id: string;
  name: string;
  type: string;
}

interface ProviderModel {
  id: string;
  model_name: string;
  display_name: string;
  provider_type: string;
}

interface KnowledgeDocument {
  id: string;
  filename: string;
  is_enabled: boolean;
  join_id: string; // ID of the chatbot_knowledge record
}

export const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  chatbotId,
  isAdmin,
  onClose,
}) => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [isSystemOpen, setIsSystemOpen] = useState(true);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadChatbotSettings();
    if (isAdmin) {
      loadProviders();
      loadModels();
    }
    loadKnowledgeBase();
  }, [chatbotId, isAdmin]);

  const loadChatbotSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('system_prompt, primary_ai_provider_id, model_name')
        .eq('id', chatbotId)
        .single();

      if (error) throw error;

      if (data) {
        setSystemPrompt(data.system_prompt || '');
        setSelectedProviderId(data.primary_ai_provider_id || '');
        setSelectedModel(data.model_name || '');
      }
    } catch (error: any) {
      console.error('Error loading chatbot settings:', error);
    }
  };

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('id, name, type')
        .eq('is_active', true)
        .eq('is_healthy', true);

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      console.error('Error loading providers:', error);
    }
  };

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_models')
        .select('id, model_name, display_name, provider_type')
        .eq('is_deprecated', false);

      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      console.error('Error loading models:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_knowledge')
        .select(`
          id,
          document_id,
          is_enabled,
          documents:document_id (
            id,
            filename
          )
        `)
        .eq('chatbot_id', chatbotId);

      if (error) throw error;

      const docs = (data || [])
        .map((item: any) => ({
          id: item.documents?.id,
          filename: item.documents?.filename,
          is_enabled: item.is_enabled,
          join_id: item.id,
        }))
        .filter((doc: any) => doc.id && doc.filename);

      setKnowledgeDocuments(docs);
    } catch (error: any) {
      console.error('Error loading knowledge base:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!isAdmin) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('chatbots')
        .update({
          system_prompt: systemPrompt,
          primary_ai_provider_id: selectedProviderId || null,
          model_name: selectedModel || null,
        })
        .eq('id', chatbotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDocument = async (joinId: string, currentState: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('chatbot_knowledge')
        .update({ is_enabled: !currentState })
        .eq('id', joinId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Document ${!currentState ? 'enabled' : 'disabled'}`,
      });

      loadKnowledgeBase();
    } catch (error: any) {
      console.error('Error toggling document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update document status",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('chatbot_knowledge')
        .delete()
        .eq('chatbot_id', chatbotId)
        .eq('document_id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document removed from knowledge base",
      });

      loadKnowledgeBase();
    } catch (error: any) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  const availableModels = selectedProvider
    ? models.filter(m => m.provider_type === selectedProvider.type)
    : [];

  return (
    <div className="w-96 border-l bg-card/30 backdrop-blur-sm flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between flex-shrink-0 rounded-bl-2xl bg-card/50">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Settings</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {/* Provider & Model Selection */}
        {isAdmin && (
          <Card className="border-2 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">AI Provider & Model</CardTitle>
              <CardDescription>
                Configure which AI provider and model to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <ProviderLogo provider={provider.type} size="sm" />
                          {provider.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={!selectedProviderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.model_name}>
                        {model.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* System Instructions */}
        <Collapsible open={isSystemOpen} onOpenChange={setIsSystemOpen}>
          <Card className="border-2 shadow-md">
            <CollapsibleTrigger className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">System Instructions</CardTitle>
                    {!isAdmin && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <Badge variant="secondary">{isSystemOpen ? 'Hide' : 'Show'}</Badge>
                </div>
                <CardDescription>
                  {isAdmin
                    ? 'Configure the AI assistant\'s behavior and personality'
                    : 'View the AI assistant\'s instructions (admin only)'}
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {isAdmin ? (
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter system instructions..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="p-4 rounded bg-muted text-sm">
                    <p className="text-muted-foreground italic">
                      System instructions are only visible to administrators
                    </p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Knowledge Base */}
        <Collapsible open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
          <Card className="border-2 shadow-md">
            <CollapsibleTrigger className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <CardTitle className="text-base">Knowledge Base</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {knowledgeDocuments.length} {isKnowledgeOpen ? '' : 'docs'}
                  </Badge>
                </div>
                <CardDescription>
                  {isAdmin
                    ? 'Manage documents and sources for this chatbot'
                    : 'View available knowledge sources'}
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {knowledgeDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No documents in knowledge base
                  </div>
                ) : (
                  <TooltipProvider>
                    <div className="space-y-2">
                      {knowledgeDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-3 rounded border transition-colors ${
                            doc.is_enabled
                              ? 'bg-card border-border'
                              : 'bg-muted/30 border-muted opacity-60'
                          }`}
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm truncate font-medium">{doc.filename}</span>
                              <Badge variant={doc.is_enabled ? 'default' : 'secondary'} className="text-xs">
                                {doc.is_enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            {!doc.is_enabled && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Will not be used for knowledge retrieval
                              </p>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Switch
                                      checked={doc.is_enabled}
                                      onCheckedChange={() => handleToggleDocument(doc.join_id, doc.is_enabled)}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {doc.is_enabled
                                      ? 'Disable to exclude from AI responses'
                                      : 'Enable to include in AI responses'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                onClick={() => handleRemoveDocument(doc.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                )}

                {isAdmin && (
                  <>
                    <Separator className="my-3" />
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Plus className="w-4 h-4" />
                      Add Documents
                    </Button>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
};
