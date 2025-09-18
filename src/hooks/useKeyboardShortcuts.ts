import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  category: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: '1',
      ctrlKey: true,
      description: 'Go to Chat',
      action: () => navigate('/'),
      category: 'Navigation'
    },
    {
      key: '2',
      ctrlKey: true,
      description: 'Go to Chat History',
      action: () => navigate('/history'),
      category: 'Navigation'
    },
    {
      key: '3',
      ctrlKey: true,
      description: 'Go to Knowledge Base',
      action: () => navigate('/knowledge'),
      category: 'Navigation'
    },
    {
      key: '4',
      ctrlKey: true,
      description: 'Go to Analytics',
      action: () => navigate('/analytics'),
      category: 'Navigation'
    },
    {
      key: '5',
      ctrlKey: true,
      description: 'Go to Settings',
      action: () => navigate('/settings'),
      category: 'Navigation'
    },

    // Quick Actions
    {
      key: 'k',
      ctrlKey: true,
      description: 'Quick Actions Menu',
      action: () => {
        // Trigger quick actions modal
        document.dispatchEvent(new CustomEvent('show-quick-actions'));
      },
      category: 'Quick Actions'
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'New Chat',
      action: () => {
        document.dispatchEvent(new CustomEvent('new-chat'));
      },
      category: 'Quick Actions'
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Search',
      action: () => {
        document.dispatchEvent(new CustomEvent('focus-search'));
      },
      category: 'Quick Actions'
    },
    {
      key: 'u',
      ctrlKey: true,
      description: 'Upload Document',
      action: () => {
        document.dispatchEvent(new CustomEvent('upload-document'));
      },
      category: 'Quick Actions'
    },

    // Help & Utilities
    {
      key: '/',
      ctrlKey: true,
      description: 'Show Keyboard Shortcuts',
      action: () => setShowHelp(true),
      category: 'Help'
    },
    {
      key: 'Escape',
      description: 'Close Modals/Cancel',
      action: () => {
        document.dispatchEvent(new CustomEvent('escape-pressed'));
      },
      category: 'Help'
    },

    // Chat Specific
    {
      key: 'Enter',
      ctrlKey: true,
      description: 'Send Message (in chat)',
      action: () => {
        document.dispatchEvent(new CustomEvent('send-message'));
      },
      category: 'Chat'
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Reply to Message',
      action: () => {
        document.dispatchEvent(new CustomEvent('reply-message'));
      },
      category: 'Chat'
    }
  ];

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true') {
      // Allow some shortcuts even in inputs
      if (!(event.key === 'Escape' || 
           (event.ctrlKey && event.key === '/') ||
           (event.ctrlKey && event.key === 'k'))) {
        return;
      }
    }

    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      return keyMatches && ctrlMatches && shiftMatches && altMatches;
    });

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.action();
    }
  }, [shortcuts]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutDisplay = (shortcut: KeyboardShortcut) => {
    const keys = [];
    
    if (shortcut.ctrlKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.altKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      keys.push('⇧');
    }
    
    keys.push(shortcut.key.toUpperCase());
    
    return keys.join(' + ');
  };

  return {
    shortcuts,
    showHelp,
    setShowHelp,
    getShortcutDisplay
  };
}