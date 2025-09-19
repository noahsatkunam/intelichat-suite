import React from 'react';
import { Bot, Database, Workflow, MessageCircle, Gauge, HardDrive, Users, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TenantFormData } from '../TenantCreationWizard';

interface InitialConfigurationProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const AI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable, higher cost', badge: 'Recommended' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Faster responses, good balance', badge: 'Popular' },
  { value: 'claude-sonnet', label: 'Claude Sonnet', description: 'Excellent reasoning, privacy-focused', badge: 'Enterprise' },
  { value: 'claude-haiku', label: 'Claude Haiku', description: 'Fast and cost-effective', badge: null },
  { value: 'custom', label: 'Custom Model', description: 'Use your own AI model', badge: 'Advanced' },
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const formatStorage = (gb: number) => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)}TB`;
  return `${gb}GB`;
};

export function InitialConfiguration({ data, onDataChange }: InitialConfigurationProps) {
  const selectedModel = AI_MODELS.find(model => model.value === data.defaultAiModel);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Initial Configuration</h2>
        <p className="text-muted-foreground text-lg">Set up your platform capabilities and usage limits</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Platform Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Model Selection
              </CardTitle>
              <CardDescription>
                Choose the default AI model for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={data.defaultAiModel} onValueChange={(value) => onDataChange({ defaultAiModel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <span>{model.label}</span>
                        {model.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {model.badge}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel && (
                <p className="text-sm text-muted-foreground">
                  {selectedModel.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>
                Enable or disable core platform capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Knowledge Base
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable document upload and RAG capabilities
                  </p>
                </div>
                <Switch
                  checked={data.knowledgeBaseEnabled}
                  onCheckedChange={(checked) => onDataChange({ knowledgeBaseEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Workflow Automation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable n8n integration for automated workflows
                  </p>
                </div>
                <Switch
                  checked={data.workflowAutomationEnabled}
                  onCheckedChange={(checked) => onDataChange({ workflowAutomationEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Real-time Chat
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable WebSocket-based real-time messaging
                  </p>
                </div>
                <Switch
                  checked={data.realtimeChatEnabled}
                  onCheckedChange={(checked) => onDataChange({ realtimeChatEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Usage Limits */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>
                Set enterprise controls and resource limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Monthly Message Limit
                  </Label>
                  <Badge variant="outline">{formatNumber(data.monthlyMessageLimit)}</Badge>
                </div>
                <Slider
                  value={[data.monthlyMessageLimit]}
                  onValueChange={([value]) => onDataChange({ monthlyMessageLimit: value })}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1K</span>
                  <span>50K</span>
                  <span>100K+</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Storage Limit
                  </Label>
                  <Badge variant="outline">{formatStorage(data.storageLimit)}</Badge>
                </div>
                <Slider
                  value={[data.storageLimit]}
                  onValueChange={([value]) => onDataChange({ storageLimit: value })}
                  max={1000}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1GB</span>
                  <span>500GB</span>
                  <span>1TB</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Concurrent Users
                  </Label>
                  <Badge variant="outline">{formatNumber(data.concurrentUsers)}</Badge>
                </div>
                <Slider
                  value={[data.concurrentUsers]}
                  onValueChange={([value]) => onDataChange({ concurrentUsers: value })}
                  max={10000}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>5K</span>
                  <span>10K</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    API Rate Limit
                  </Label>
                  <Badge variant="outline">{formatNumber(data.apiRateLimit)}/min</Badge>
                </div>
                <Slider
                  value={[data.apiRateLimit]}
                  onValueChange={([value]) => onDataChange({ apiRateLimit: value })}
                  max={10000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100/min</span>
                  <span>5K/min</span>
                  <span>10K/min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Model
                  </span>
                  <Badge variant="secondary">{selectedModel?.label}</Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="font-medium">Enabled Features:</span>
                  <div className="flex flex-wrap gap-1">
                    {data.knowledgeBaseEnabled && (
                      <Badge variant="outline" className="text-xs">Knowledge Base</Badge>
                    )}
                    {data.workflowAutomationEnabled && (
                      <Badge variant="outline" className="text-xs">Workflows</Badge>
                    )}
                    {data.realtimeChatEnabled && (
                      <Badge variant="outline" className="text-xs">Real-time Chat</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Resource Limits:</span>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• {formatNumber(data.monthlyMessageLimit)} messages/month</div>
                    <div>• {formatStorage(data.storageLimit)} storage</div>
                    <div>• {formatNumber(data.concurrentUsers)} concurrent users</div>
                    <div>• {formatNumber(data.apiRateLimit)} API requests/min</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}