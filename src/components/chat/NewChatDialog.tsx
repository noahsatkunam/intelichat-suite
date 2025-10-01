import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Settings2, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { providerModels } from '@/data/providerModels';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (conversationId: string, settings: ChatSettings) => void;
}

export interface ChatSettings {
  chatbotId?: string;
  providerId?: string;
  providerName?: string;
  modelId?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

interface Chatbot {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  primary_ai_provider_id: string;
  model_name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

const providerOptions = [
  { id: 'openai', name: 'OpenAI', logo: '🤖' },
  { id: 'anthropic', name: 'Anthropic', logo: '🧠' },
  { id: 'google', name: 'Google', logo: '🔍' },
  { id: 'mistral', name: 'Mistral AI', logo: '🌪️' },
  { id: 'meta', name: 'Meta', logo: '🦙' },
  { id: 'xai', name: 'xAI', logo: '✨' },
  { id: 'ollama', name: 'Ollama', logo: '🦫' }
];

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const [step, setStep] = useState<'select-type' | 'blank-config' | 'select-chatbot'>('select-type');
  const [title, setTitle] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && step === 'select-chatbot') {
      fetchChatbots();
    }
  }, [open, step]);

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setStep('select-type');
      setTitle('');
      setSelectedProvider('openai');
      setSelectedModel('gpt-4o-mini');
      setTemperature(0.7);
      setMaxTokens(2000);
      setTopP(1);
      setFrequencyPenalty(0);
      setPresencePenalty(0);
      setSelectedChatbot(null);
    }
  }, [open]);

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      
      // Get user's tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) return;

      // Get chatbots for this tenant
      const { data: tenantChatbots } = await supabase
        .from('chatbot_tenants')
        .select('chatbot_id')
        .eq('tenant_id', profile.tenant_id);

      const chatbotIds = tenantChatbots?.map(ct => ct.chatbot_id) || [];

      if (chatbotIds.length === 0) {
        setChatbots([]);
        return;
      }

      // Get chatbot details
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .in('id', chatbotIds)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setChatbots(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load chatbots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) {
        toast({
          title: "Error",
          description: "User tenant not found",
          variant: "destructive"
        });
        return;
      }

      // Create conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          title: title || (selectedChatbot ? selectedChatbot.name : 'New Chat'),
          user_id: user.id,
          tenant_id: profile.tenant_id
        })
        .select()
        .single();

      if (error) throw error;

      // Build settings object
      const settings: ChatSettings = selectedChatbot ? {
        chatbotId: selectedChatbot.id,
        providerId: selectedChatbot.primary_ai_provider_id,
        modelId: selectedChatbot.model_name,
        temperature: selectedChatbot.temperature,
        maxTokens: selectedChatbot.max_tokens,
        topP: selectedChatbot.top_p,
        frequencyPenalty: selectedChatbot.frequency_penalty,
        presencePenalty: selectedChatbot.presence_penalty,
        systemPrompt: selectedChatbot.system_prompt
      } : {
        providerId: selectedProvider,
        providerName: providerOptions.find(p => p.id === selectedProvider)?.name,
        modelId: selectedModel,
        modelName: providerModels[selectedProvider as keyof typeof providerModels]?.find(m => m.id === selectedModel)?.name,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty
      };

      onChatCreated(conversation.id, settings);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSelectType = () => (
    <div className="space-y-6 py-6">
      <div className="grid gap-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary group"
          onClick={() => setStep('blank-config')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Settings2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Blank Chatbot</CardTitle>
                <CardDescription>Configure your own AI provider and model</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start from scratch and customize the AI provider, model, temperature, and other parameters for your conversation.
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary group"
          onClick={() => setStep('select-chatbot')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Existing Chatbot</CardTitle>
                <CardDescription>Choose from preconfigured chatbots</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Select from chatbots configured for your tenant with preset system prompts, providers, and models.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Conversation Title (Optional)</Label>
        <Input
          id="title"
          placeholder="E.g., Product Research Chat"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );

  const renderBlankConfig = () => {
    const availableModels = providerModels[selectedProvider as keyof typeof providerModels] || [];
    
    return (
      <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="title">Conversation Title (Optional)</Label>
          <Input
            id="title"
            placeholder="E.g., Product Research Chat"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Configuration
          </h3>

          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={selectedProvider} onValueChange={(val) => {
              setSelectedProvider(val);
              const models = providerModels[val as keyof typeof providerModels];
              if (models && models.length > 0) {
                setSelectedModel(models[0].id);
              }
            }}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <span className="flex items-center gap-2">
                      <span>{provider.logo}</span>
                      {provider.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <h4 className="text-sm font-medium">Hyperparameters</h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature}</span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[temperature]}
                onValueChange={(val) => setTemperature(val[0])}
              />
              <p className="text-xs text-muted-foreground">
                Controls randomness. Lower is more focused and deterministic.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <span className="text-sm text-muted-foreground">{maxTokens}</span>
              </div>
              <Slider
                id="maxTokens"
                min={100}
                max={4000}
                step={100}
                value={[maxTokens]}
                onValueChange={(val) => setMaxTokens(val[0])}
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of the generated response.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topP">Top P</Label>
                <span className="text-sm text-muted-foreground">{topP}</span>
              </div>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.05}
                value={[topP]}
                onValueChange={(val) => setTopP(val[0])}
              />
              <p className="text-xs text-muted-foreground">
                Controls diversity via nucleus sampling.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                <span className="text-sm text-muted-foreground">{frequencyPenalty}</span>
              </div>
              <Slider
                id="frequencyPenalty"
                min={0}
                max={2}
                step={0.1}
                value={[frequencyPenalty]}
                onValueChange={(val) => setFrequencyPenalty(val[0])}
              />
              <p className="text-xs text-muted-foreground">
                Reduces repetition of token sequences.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="presencePenalty">Presence Penalty</Label>
                <span className="text-sm text-muted-foreground">{presencePenalty}</span>
              </div>
              <Slider
                id="presencePenalty"
                min={0}
                max={2}
                step={0.1}
                value={[presencePenalty]}
                onValueChange={(val) => setPresencePenalty(val[0])}
              />
              <p className="text-xs text-muted-foreground">
                Encourages talking about new topics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setStep('select-type')} className="flex-1">
            Back
          </Button>
          <Button onClick={handleCreateChat} disabled={loading} className="flex-1">
            Start Chat
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSelectChatbot = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Conversation Title (Optional)</Label>
        <Input
          id="title"
          placeholder="E.g., Product Research Chat"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <Separator />

      <div className="space-y-4 max-h-[50vh] overflow-y-auto">
        <h3 className="text-sm font-semibold">Select a Chatbot</h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading chatbots...</div>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No chatbots available for your tenant</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep('blank-config')}
              className="mt-4"
            >
              Configure Blank Chatbot Instead
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {chatbots.map((chatbot) => (
              <Card
                key={chatbot.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedChatbot?.id === chatbot.id ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedChatbot(chatbot)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chatbot.avatar_url || ''} />
                      <AvatarFallback>
                        <Bot className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{chatbot.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {chatbot.model_name}
                        </Badge>
                      </div>
                      {chatbot.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {chatbot.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Temp: {chatbot.temperature}</span>
                        <span>•</span>
                        <span>Max: {chatbot.max_tokens}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setStep('select-type')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleCreateChat} 
          disabled={loading || !selectedChatbot}
          className="flex-1"
        >
          Start Chat with {selectedChatbot?.name || 'Chatbot'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            New Chat
          </DialogTitle>
          <DialogDescription>
            {step === 'select-type' && 'Choose how you want to start your conversation'}
            {step === 'blank-config' && 'Configure your AI provider and model settings'}
            {step === 'select-chatbot' && 'Select a preconfigured chatbot from your tenant'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select-type' && renderSelectType()}
        {step === 'blank-config' && renderBlankConfig()}
        {step === 'select-chatbot' && renderSelectChatbot()}
      </DialogContent>
    </Dialog>
  );
}
