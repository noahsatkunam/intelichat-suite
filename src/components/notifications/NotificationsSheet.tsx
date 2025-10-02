import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Activity, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SystemNotificationProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
}

function SystemNotification({ title, message, type, timestamp }: SystemNotificationProps) {
  const getTypeConfig = (type: SystemNotificationProps['type']) => {
    switch (type) {
      case 'success':
        return { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2, label: 'Success' };
      case 'warning':
        return { color: 'text-warning', bg: 'bg-warning/10', icon: AlertCircle, label: 'Warning' };
      case 'error':
        return { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertCircle, label: 'Error' };
      default:
        return { color: 'text-primary', bg: 'bg-primary/10', icon: Activity, label: 'Info' };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bg} hover:shadow-soft transition-all duration-300 animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{message}</p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
      </div>
    </div>
  );
}

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const notifications: SystemNotificationProps[] = [
    {
      title: 'New AI Provider Available',
      message: 'Claude-3.5 Sonnet has been added to your available models',
      type: 'success',
      timestamp: '10 minutes ago'
    },
    {
      title: 'API Rate Limit Warning',
      message: 'Approaching 80% of your monthly OpenAI quota',
      type: 'warning',
      timestamp: '2 hours ago'
    },
    {
      title: 'System Maintenance Scheduled',
      message: 'Brief maintenance window scheduled for tonight at 2 AM UTC',
      type: 'info',
      timestamp: '1 day ago'
    },
    {
      title: 'Team Member Added',
      message: 'New user "Sarah Johnson" has been invited to your workspace',
      type: 'success',
      timestamp: '3 hours ago'
    },
    {
      title: 'Storage Update',
      message: 'You have used 65% of your storage quota',
      type: 'info',
      timestamp: '5 hours ago'
    },
    {
      title: 'Knowledge Base Updated',
      message: '5 new documents have been processed and indexed',
      type: 'success',
      timestamp: '1 day ago'
    }
  ];

  const unreadCount = notifications.filter((_, i) => i < 3).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>
          <SheetDescription>
            Stay updated with system alerts and important updates
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Recent Notifications</h3>
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all as read
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <SystemNotification key={index} {...notification} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
