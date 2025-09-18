import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Database, 
  MessageSquare, 
  Search, 
  BarChart3, 
  Users, 
  Workflow
} from 'lucide-react';
import { apiService } from '@/services/apiService';

export function FeatureFlagToggle() {
  const [flags, setFlags] = useState(apiService.getFeatureFlags());

  const handleToggle = (flag: string, enabled: boolean) => {
    console.log(`Feature flag ${flag} is managed by environment configuration`);
    // In the new system, feature flags are managed by environment config
    // Show a message or redirect to settings instead
  };

  useEffect(() => {
    // Update flags when API service changes
    setFlags(apiService.getFeatureFlags());
  }, []);

  const featureConfigs = [
    {
      key: 'useMockData',
      title: 'Mock Data Mode',
      description: 'Use simulated data instead of real API calls',
      icon: Database,
      color: 'text-blue-500'
    }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <CardTitle>Development Settings</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure development and testing options
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {featureConfigs.map((config) => {
          const Icon = config.icon;
          const isEnabled = flags.useMockData;
          
          return (
            <div 
              key={config.key} 
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
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
                  {isEnabled ? 'Mock Data' : 'Real API'}
                </Badge>
                
                <Switch
                  id={config.key}
                  checked={isEnabled}
                  onCheckedChange={(enabled) => handleToggle(config.key, enabled)}
                  disabled={true}
                />
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Environment Configuration
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                Feature flags are now managed through environment configuration. 
                Current environment: <strong>{flags.environment}</strong>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}