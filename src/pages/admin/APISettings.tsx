import React from 'react';
import { Key, Plus, Code, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APISettings() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">API Settings</h1>
              <p className="text-muted-foreground">Manage API keys, webhooks, and integration settings</p>
            </div>
            <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Generate API Key
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">API Settings</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Configure API access, manage authentication keys, set up webhooks, and monitor 
            API usage across your integrations.
          </p>
        </div>
      </div>
    </div>
  );
}