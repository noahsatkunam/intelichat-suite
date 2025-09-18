import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { demoService } from '@/services/demoService';
import { Play, Square, Sparkles, RotateCcw } from 'lucide-react';

interface DemoToggleProps {
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  currentScenario?: string | null;
  onResetDemo?: () => void;
}

export function DemoToggle({ 
  isDemoMode, 
  onToggleDemoMode, 
  currentScenario, 
  onResetDemo 
}: DemoToggleProps) {
  const scenarioNames = {
    'customer-service': 'Customer Service',
    'technical-support': 'Technical Support',
    'sales-enablement': 'Sales Enablement',
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-gradient-surface border border-chat-border rounded-lg shadow-soft">
      <div className="flex items-center space-x-2">
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={onToggleDemoMode}
          className="data-[state=checked]:bg-primary"
        />
        <Label htmlFor="demo-mode" className="text-sm font-medium">
          Demo Mode
        </Label>
      </div>

      {isDemoMode && (
        <>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-soft" />
            <Badge variant="secondary" className="text-xs font-medium">
              {currentScenario 
                ? scenarioNames[currentScenario as keyof typeof scenarioNames] || 'Demo Active'
                : 'Demo Active'
              }
            </Badge>
          </div>

          {onResetDemo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetDemo}
              className="gap-2 hover:bg-accent interactive-element"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          )}
        </>
      )}

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleDemoMode(!isDemoMode)}
          className={`gap-2 interactive-element ${
            isDemoMode ? 'text-destructive hover:bg-destructive/10' : 'text-success hover:bg-success/10'
          }`}
        >
          {isDemoMode ? (
            <>
              <Square className="w-3 h-3" />
              Stop Demo
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Start Demo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}