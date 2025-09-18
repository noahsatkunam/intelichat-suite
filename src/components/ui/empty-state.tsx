import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Search, 
  Users, 
  Settings, 
  Database,
  Zap,
  AlertCircle,
  BookOpen 
} from 'lucide-react';

interface EmptyStateProps {
  variant?: 'chat' | 'search' | 'documents' | 'users' | 'settings' | 'data' | 'error' | 'knowledge';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const variantConfig = {
  chat: {
    icon: MessageSquare,
    title: 'Start a new conversation',
    description: 'Ask Zyria anything. I can help you with enterprise questions, access your knowledge base, and provide detailed insights.',
    actionLabel: 'Start chatting',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or explore different keywords to find what you\'re looking for.',
    actionLabel: 'Clear search',
  },
  documents: {
    icon: FileText,
    title: 'No documents yet',
    description: 'Upload your first document to start building your knowledge base and enhance AI responses.',
    actionLabel: 'Upload document',
  },
  users: {
    icon: Users,
    title: 'No users found',
    description: 'Invite team members to collaborate and manage access to your enterprise AI platform.',
    actionLabel: 'Invite users',
  },
  settings: {
    icon: Settings,
    title: 'Configure your settings',
    description: 'Customize your Zyria experience with personalized preferences and configurations.',
    actionLabel: 'Configure now',
  },
  data: {
    icon: Database,
    title: 'No data available',
    description: 'There\'s no data to display at the moment. Check back later or refresh the page.',
    actionLabel: 'Refresh',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an error while loading this content. Please try again or contact support if the issue persists.',
    actionLabel: 'Try again',
  },
  knowledge: {
    icon: BookOpen,
    title: 'Build your knowledge base',
    description: 'Upload documents, create knowledge articles, and enhance your AI assistant with domain-specific information.',
    actionLabel: 'Add knowledge',
  },
};

export function EmptyState({
  variant = 'chat',
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionLabel = actionLabel || config.actionLabel;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 space-y-6 animate-fade-in",
      className
    )}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-surface border border-chat-border">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground font-display">
          {finalTitle}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {finalDescription}
        </p>
      </div>
      
      {onAction && (
        <Button 
          onClick={onAction}
          className="interactive-element btn-primary"
        >
          <Zap className="w-4 h-4 mr-2" />
          {finalActionLabel}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty state components
export const ChatEmptyState = (props: Omit<EmptyStateProps, 'variant'>) => (
  <EmptyState {...props} variant="chat" />
);

export const SearchEmptyState = (props: Omit<EmptyStateProps, 'variant'>) => (
  <EmptyState {...props} variant="search" />
);

export const DocumentsEmptyState = (props: Omit<EmptyStateProps, 'variant'>) => (
  <EmptyState {...props} variant="documents" />
);

export const ErrorEmptyState = (props: Omit<EmptyStateProps, 'variant'>) => (
  <EmptyState {...props} variant="error" />
);