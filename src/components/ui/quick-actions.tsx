import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Settings, 
  BarChart, 
  Users,
  Upload,
  Plus,
  History,
  BookOpen,
  Zap
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: string;
  keywords: string[];
  shortcut?: string;
}

export function QuickActionsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    // Navigation
    {
      id: 'chat',
      title: 'Go to Chat',
      description: 'Start or continue conversations',
      icon: MessageSquare,
      action: () => navigate('/'),
      category: 'Navigation',
      keywords: ['chat', 'conversation', 'talk', 'message'],
      shortcut: 'Ctrl+1'
    },
    {
      id: 'history',
      title: 'Chat History',
      description: 'View past conversations',
      icon: History,
      action: () => navigate('/history'),
      category: 'Navigation',
      keywords: ['history', 'past', 'previous', 'conversations'],
      shortcut: 'Ctrl+2'
    },
    {
      id: 'knowledge',
      title: 'Knowledge Base',
      description: 'Manage documents and knowledge',
      icon: BookOpen,
      action: () => navigate('/knowledge'),
      category: 'Navigation',
      keywords: ['knowledge', 'documents', 'files', 'kb'],
      shortcut: 'Ctrl+3'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View usage and performance metrics',
      icon: BarChart,
      action: () => navigate('/analytics'),
      category: 'Navigation',
      keywords: ['analytics', 'metrics', 'stats', 'data'],
      shortcut: 'Ctrl+4'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      action: () => navigate('/settings'),
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'config', 'options'],
      shortcut: 'Ctrl+5'
    },

    // Actions
    {
      id: 'new-chat',
      title: 'New Chat',
      description: 'Start a fresh conversation',
      icon: Plus,
      action: () => {
        navigate('/');
        document.dispatchEvent(new CustomEvent('new-chat'));
      },
      category: 'Actions',
      keywords: ['new', 'chat', 'start', 'fresh', 'conversation'],
      shortcut: 'Ctrl+N'
    },
    {
      id: 'upload',
      title: 'Upload Document',
      description: 'Add files to knowledge base',
      icon: Upload,
      action: () => {
        document.dispatchEvent(new CustomEvent('upload-document'));
      },
      category: 'Actions',
      keywords: ['upload', 'file', 'document', 'add', 'knowledge'],
      shortcut: 'Ctrl+U'
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Search conversations and documents',
      icon: Search,
      action: () => {
        document.dispatchEvent(new CustomEvent('focus-search'));
      },
      category: 'Actions',
      keywords: ['search', 'find', 'look', 'query'],
      shortcut: 'Ctrl+F'
    },

    // Admin
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage team members and permissions',
      icon: Users,
      action: () => navigate('/admin/users'),
      category: 'Admin',
      keywords: ['users', 'team', 'members', 'admin', 'permissions']
    },
    {
      id: 'workflows',
      title: 'Workflows',
      description: 'Manage automation and workflows',
      icon: Zap,
      action: () => navigate('/admin/workflows'),
      category: 'Admin',
      keywords: ['workflows', 'automation', 'admin', 'trigger']
    }
  ];

  // Filter actions based on query
  const filteredActions = query
    ? quickActions.filter(action => 
        action.title.toLowerCase().includes(query.toLowerCase()) ||
        action.description.toLowerCase().includes(query.toLowerCase()) ||
        action.keywords.some(keyword => keyword.includes(query.toLowerCase()))
      )
    : quickActions;

  // Group actions by category
  const groupedActions = filteredActions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = [];
    }
    groups[action.category].push(action);
    return groups;
  }, {} as Record<string, QuickAction[]>);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredActions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredActions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredActions[selectedIndex]) {
            filteredActions[selectedIndex].action();
            handleClose();
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions]);

  // Listen for show quick actions event
  useEffect(() => {
    const handleShowQuickActions = () => {
      setIsOpen(true);
      setQuery('');
      setSelectedIndex(0);
    };

    document.addEventListener('show-quick-actions', handleShowQuickActions);
    return () => document.removeEventListener('show-quick-actions', handleShowQuickActions);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const handleActionClick = (action: QuickAction) => {
    action.action();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="pl-10 border-none shadow-none focus:ring-0"
              autoFocus
            />
          </div>
        </div>

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category} className="mb-4">
              <div className="px-3 py-2">
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              </div>
              
              <div className="space-y-1">
                {actions.map((action, index) => {
                  const globalIndex = filteredActions.indexOf(action);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = action.icon;
                  
                  return (
                    <Button
                      key={action.id}
                      variant="ghost"
                      onClick={() => handleActionClick(action)}
                      className={`
                        w-full justify-start gap-3 h-auto p-3 text-left
                        ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}
                      `}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {action.description}
                        </div>
                      </div>
                      {action.shortcut && (
                        <Badge variant="outline" className="text-xs">
                          {action.shortcut}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredActions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No commands found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <span>Press Ctrl+K to open anytime</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}