import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  variant?: 'message' | 'chat' | 'sidebar' | 'dashboard' | 'document' | 'custom';
  count?: number;
  className?: string;
}

const MessageSkeleton = () => (
  <div className="space-y-4 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 animate-fade-in">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

const ChatSkeletonComponent = () => (
  <div className="space-y-6 p-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''} animate-fade-in`}>
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex-1 max-w-xs space-y-2">
          <div className={`p-3 rounded-2xl ${i % 2 === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SidebarSkeletonComponent = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-32 mb-6" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3 animate-fade-in">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
);

const DashboardSkeletonComponent = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3 animate-fade-in">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded animate-fade-in">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DocumentSkeleton = () => (
  <div className="space-y-4 p-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-start gap-3 p-3 border rounded-lg animate-fade-in">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export function LoadingSkeleton({ variant = 'custom', count = 1, className }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'message':
        return <MessageSkeleton />;
      case 'chat':
        return <ChatSkeletonComponent />;
      case 'sidebar':
        return <SidebarSkeletonComponent />;
      case 'dashboard':
        return <DashboardSkeletonComponent />;
      case 'document':
        return <DocumentSkeleton />;
      default:
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {renderSkeleton()}
    </div>
  );
}

// Specific skeleton components for reuse
export const MessageListSkeleton = () => <LoadingSkeleton variant="message" />;
export const ChatSkeleton = () => <LoadingSkeleton variant="chat" />;
export const SidebarSkeleton = () => <LoadingSkeleton variant="sidebar" />;
export const DashboardSkeleton = () => <LoadingSkeleton variant="dashboard" />;
export const DocumentListSkeleton = () => <LoadingSkeleton variant="document" />;