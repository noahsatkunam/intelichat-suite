import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';

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

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  getShortcutDisplay: (shortcut: KeyboardShortcut) => string;
}

export function KeyboardShortcutsHelp({ 
  isOpen, 
  onClose, 
  shortcuts, 
  getShortcutDisplay 
}: KeyboardShortcutsHelpProps) {
  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>⌨️</span>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Badge variant="outline">{category}</Badge>
              </h3>
              
              <div className="grid gap-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm">{shortcut.description}</span>
                    <Kbd>{getShortcutDisplay(shortcut)}</Kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Press <Kbd>Ctrl + /</Kbd> anytime to open this help
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}