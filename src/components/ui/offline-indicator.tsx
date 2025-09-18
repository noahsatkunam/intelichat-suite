import React from 'react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

// Component for displaying offline status
export function OfflineIndicator() {
  const { isOffline, queueSize } = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-orange-100 border border-orange-200 text-orange-800 px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-sm font-medium">
          You are offline
          {queueSize > 0 && ` (${queueSize} requests queued)`}
        </span>
      </div>
    </div>
  );
}