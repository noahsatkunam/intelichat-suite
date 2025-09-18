import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/apiService';
import { Settings, Database, MessageSquare, FileText, BarChart, Users, Zap } from 'lucide-react';

interface FeatureFlagToggleProps {
  onFlagsChange?: () => void;
}

const featureFlagConfig = [
  {
    key: 'useMockAuth' as const,
    title: 'Mock Authentication',
    description: 'Use mock login/logout instead of real authentication',
    icon: Settings,
    color: 'text-blue-500'
  },
  {
    key: 'useMockChat' as const,
    title: 'Mock Chat',
    description: 'Use demo chat responses instead of real AI integration',
    icon: MessageSquare,
    color: 'text-green-500'
  },
  {
    key: 'useMockKnowledge' as const,
    title: 'Mock Knowledge Base',
    description: 'Use sample documents instead of real document processing',
    icon: FileText,
    color: 'text-purple-500'
  },
  {
    key: 'useMockAnalytics' as const,
    title: 'Mock Analytics',
    description: 'Use simulated metrics instead of real usage data',
    icon: BarChart,
    color: 'text-orange-500'
  },
  {
    key: 'useMockUsers' as const,
    title: 'Mock Users',
    description: 'Use sample user data instead of real user management',
    icon: Users,
    color: 'text-pink-500'
  },
  {
    key: 'useMockWorkflows' as const,
    title: 'Mock Workflows',
    description: 'Use simulated workflow execution instead of real automation',
    icon: Zap,
    color: 'text-yellow-500'
  }
];

export function FeatureFlagToggle({ onFlagsChange }: FeatureFlagToggleProps) {
  const [flags, setFlags] = React.useState(apiService.getFeatureFlags());

  const handleToggle = (flagKey: keyof typeof flags, enabled: boolean) => {
    apiService.setFeatureFlag(flagKey, enabled);
    setFlags(apiService.getFeatureFlags());
    onFlagsChange?.();
  };

  const enabledCount = Object.values(flags).filter(Boolean).length;
  const totalCount = Object.keys(flags).length;

  return (
    <Card className="interactive-element">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Source Configuration
            </CardTitle>
            <CardDescription>
              Toggle between mock data and real API endpoints for development
            </CardDescription>
          </div>
          
          <Badge variant="secondary" className="text-sm">
            {enabledCount}/{totalCount} Mock
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {featureFlagConfig.map((config) => {
          const Icon = config.icon;
          const isEnabled = flags[config.key];
          
          return (
            <div
              key={config.key}
              className="flex items-center justify-between p-3 rounded-lg border border-muted bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div>
                  <Label htmlFor={config.key} className="font-medium cursor-pointer">
                    {config.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isEnabled ? "secondary" : "outline"} 
                  className="text-xs"
                >
                  {isEnabled ? 'Mock' : 'Real API'}
                </Badge>
                
                <Switch
                  id={config.key}
                  checked={isEnabled}
                  onCheckedChange={(enabled) => handleToggle(config.key, enabled)}
                />
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Development Mode Active
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                Mock data ensures the UI works perfectly while you develop. 
                When ready, simply toggle flags to connect to your real APIs.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}