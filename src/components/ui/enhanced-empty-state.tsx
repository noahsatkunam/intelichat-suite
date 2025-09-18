import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  FileText, 
  Search, 
  Users, 
  Settings, 
  Database,
  Zap,
  AlertCircle,
  BookOpen,
  BarChart,
  Upload,
  Plus,
  ArrowRight,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react';

interface ActionStep {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  action?: () => void;
  shortcut?: string;
}

interface EnhancedEmptyStateProps {
  variant?: 'chat' | 'search' | 'documents' | 'users' | 'settings' | 'data' | 'error' | 'knowledge' | 'analytics';
  title?: string;
  description?: string;
  illustration?: React.ComponentType<any>;
  actions?: ActionStep[];
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  showQuickStart?: boolean;
  className?: string;
}

const variantConfig = {
  chat: {
    icon: MessageSquare,
    title: 'Start your first conversation',
    description: 'Welcome to Zyria! Ask me anything about your business, get help with tasks, or explore your knowledge base.',
    illustration: MessageSquare,
    actions: [
      {
        icon: Target,
        title: 'Ask a question',
        description: 'Type your question in the message box below',
        shortcut: 'Click the input field'
      },
      {
        icon: BookOpen,
        title: 'Enable knowledge base',
        description: 'Toggle on to get answers from your documents',
        shortcut: 'Toggle switch above'
      },
      {
        icon: Upload,
        title: 'Upload documents',
        description: 'Add your company docs for better responses',
        shortcut: 'Ctrl+U'
      }
    ]
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'We couldn\'t find anything matching your search. Try different keywords or check your filters.',
    illustration: Search,
    actions: [
      {
        icon: Lightbulb,
        title: 'Try different keywords',
        description: 'Use synonyms or broader terms'
      },
      {
        icon: Settings,
        title: 'Adjust filters',
        description: 'Remove or modify your search filters'
      },
      {
        icon: BookOpen,
        title: 'Browse all content',
        description: 'Explore available documents and conversations'
      }
    ]
  },
  documents: {
    icon: FileText,
    title: 'Build your knowledge base',
    description: 'Upload documents to enhance your AI assistant with company-specific information and get more accurate responses.',
    illustration: BookOpen,
    actions: [
      {
        icon: Upload,
        title: 'Upload your first document',
        description: 'PDF, Word, or text files work great',
        shortcut: 'Ctrl+U'
      },
      {
        icon: Zap,
        title: 'Try the demo',
        description: 'See how it works with sample documents',
        shortcut: 'Demo mode'
      },
      {
        icon: Target,
        title: 'Connect integrations',
        description: 'Sync with Google Drive, SharePoint, etc.'
      }
    ]
  },
  users: {
    icon: Users,
    title: 'Invite your team',
    description: 'Collaborate with colleagues and manage access to your enterprise AI platform.',
    illustration: Users,
    actions: [
      {
        icon: Plus,
        title: 'Invite team members',
        description: 'Send invitations via email'
      },
      {
        icon: Settings,
        title: 'Set up roles',
        description: 'Configure permissions and access levels'
      },
      {
        icon: Upload,
        title: 'Bulk import',
        description: 'Upload a CSV file with user details'
      }
    ]
  },
  analytics: {
    icon: BarChart,
    title: 'Analytics will appear here',
    description: 'Start using Zyria to generate conversation data, and insights will be displayed on this dashboard.',
    illustration: BarChart,
    actions: [
      {
        icon: MessageSquare,
        title: 'Start conversations',
        description: 'Begin chatting to generate data'
      },
      {
        icon: Users,
        title: 'Invite team members',
        description: 'More users create more insights'
      },
      {
        icon: Zap,
        title: 'Try demo mode',
        description: 'See sample analytics data'
      }
    ]
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an error while loading this content. Here are some steps to resolve the issue.',
    illustration: AlertCircle,
    actions: [
      {
        icon: ArrowRight,
        title: 'Refresh the page',
        description: 'Sometimes a simple refresh fixes the issue'
      },
      {
        icon: Settings,
        title: 'Check your connection',
        description: 'Ensure you have a stable internet connection'
      },
      {
        icon: MessageSquare,
        title: 'Contact support',
        description: 'Get help from our technical team'
      }
    ]
  }
};

export function EnhancedEmptyState({
  variant = 'chat',
  title,
  description,
  illustration,
  actions,
  onPrimaryAction,
  primaryActionLabel,
  showQuickStart = true,
  className
}: EnhancedEmptyStateProps) {
  const config = variantConfig[variant];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActions = actions || config.actions || [];
  const Illustration = illustration || config.illustration;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 space-y-8 animate-fade-in min-h-[400px]",
      className
    )}>
      {/* Illustration */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-surface border border-chat-border flex items-center justify-center animate-fade-in-scale">
          <Illustration className="w-12 h-12 text-muted-foreground" />
        </div>
        
        {variant !== 'error' && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-bounce-subtle">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-2xl font-semibold text-foreground font-display">
          {finalTitle}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {finalDescription}
        </p>
      </div>
      
      {/* Primary Action */}
      {onPrimaryAction && (
        <Button 
          onClick={onPrimaryAction}
          size="lg"
          className="interactive-element btn-primary gap-2"
        >
          <Plus className="w-5 h-5" />
          {primaryActionLabel || 'Get Started'}
        </Button>
      )}
      
      {/* Quick Start Actions */}
      {showQuickStart && finalActions.length > 0 && (
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Quick Start</h4>
            </div>
            
            <div className="space-y-4">
              {finalActions.map((action, index) => {
                const ActionIcon = action.icon;
                
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={action.action}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ActionIcon className="w-4 h-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h5 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                    
                    {action.shortcut && (
                      <Badge variant="secondary" className="text-xs">
                        {action.shortcut}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        {variant === 'chat' && (
          <p>💡 Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> for quick actions anytime</p>
        )}
        {variant === 'documents' && (
          <p>💡 Supported formats: PDF, DOCX, TXT, MD, and more</p>
        )}
        {variant === 'search' && (
          <p>💡 Try using quotes for exact phrases or wildcards for broader searches</p>
        )}
      </div>
    </div>
  );
}

// Specialized empty state components
export const ChatEmptyState = (props: Omit<EnhancedEmptyStateProps, 'variant'>) => (
  <EnhancedEmptyState {...props} variant="chat" />
);

export const SearchEmptyState = (props: Omit<EnhancedEmptyStateProps, 'variant'>) => (
  <EnhancedEmptyState {...props} variant="search" />
);

export const DocumentsEmptyState = (props: Omit<EnhancedEmptyStateProps, 'variant'>) => (
  <EnhancedEmptyState {...props} variant="documents" />
);

export const ErrorEmptyState = (props: Omit<EnhancedEmptyStateProps, 'variant'>) => (
  <EnhancedEmptyState {...props} variant="error" />
);

export const AnalyticsEmptyState = (props: Omit<EnhancedEmptyStateProps, 'variant'>) => (
  <EnhancedEmptyState {...props} variant="analytics" />
);