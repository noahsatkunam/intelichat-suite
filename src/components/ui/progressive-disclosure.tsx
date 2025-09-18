import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Settings, Zap, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressiveDisclosureProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  level?: 'basic' | 'advanced' | 'expert';
  badge?: string;
  className?: string;
}

export function ProgressiveDisclosure({
  title,
  description,
  children,
  defaultOpen = false,
  level = 'basic',
  badge,
  className
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const levelConfig = {
    basic: {
      icon: Eye,
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      badgeVariant: 'secondary' as const
    },
    advanced: {
      icon: Settings,
      color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      badgeVariant: 'outline' as const
    },
    expert: {
      icon: Zap,
      color: 'bg-red-500/10 text-red-700 dark:text-red-300',
      badgeVariant: 'destructive' as const
    }
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("transition-all duration-200", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={cn("p-2 rounded-lg", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {title}
                    {badge && (
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {badge}
                      </Badge>
                    )}
                  </CardTitle>
                  
                  {description && (
                    <CardDescription className="text-sm mt-1">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {level}
                </Badge>
                
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border-t border-border pt-4">
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Specialized components for different use cases
export function AdvancedSettings({ children, ...props }: Omit<ProgressiveDisclosureProps, 'level'>) {
  return (
    <ProgressiveDisclosure
      level="advanced"
      badge="Advanced"
      {...props}
    >
      {children}
    </ProgressiveDisclosure>
  );
}

export function ExpertOptions({ children, ...props }: Omit<ProgressiveDisclosureProps, 'level'>) {
  return (
    <ProgressiveDisclosure
      level="expert"
      badge="Expert"
      {...props}
    >
      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h4 className="font-medium text-destructive">Expert Settings</h4>
            <p className="text-sm text-destructive/80 mt-1">
              These settings are for advanced users only. Incorrect configuration may affect system performance.
            </p>
          </div>
        </div>
      </div>
      {children}
    </ProgressiveDisclosure>
  );
}

// Progressive Disclosure Group - for managing multiple related disclosures
interface ProgressiveDisclosureGroupProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

export function ProgressiveDisclosureGroup({ 
  children, 
  allowMultiple = false, 
  className 
}: ProgressiveDisclosureGroupProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleToggle = (itemId: string) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems(prev => 
        prev.includes(itemId) ? [] : [itemId]
      );
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}

// Usage examples and patterns
export function DisclosureExample() {
  return (
    <div className="space-y-4">
      <ProgressiveDisclosure
        title="Basic Configuration"
        description="Essential settings to get started"
        level="basic"
        defaultOpen={true}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Configure the basic settings for your application.
          </p>
          {/* Basic settings content */}
        </div>
      </ProgressiveDisclosure>

      <AdvancedSettings
        title="Performance Optimization"
        description="Fine-tune performance settings"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Advanced performance tuning options for power users.
          </p>
          {/* Advanced settings content */}
        </div>
      </AdvancedSettings>

      <ExpertOptions
        title="System Internals"
        description="Low-level system configuration"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Direct access to system internals and debugging options.
          </p>
          {/* Expert settings content */}
        </div>
      </ExpertOptions>
    </div>
  );
}