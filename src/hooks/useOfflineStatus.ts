// Hook for detecting offline status and managing offline functionality
import { useState, useEffect, useCallback } from 'react';

interface OfflineQueueItem {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

interface UseOfflineStatusResult {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  queueSize: number;
  addToQueue: (method: string, url: string, data?: any) => string;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
  getQueuedItems: () => OfflineQueueItem[];
}

const OFFLINE_QUEUE_KEY = 'zyria_offline_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_COUNT = 3;

export function useOfflineStatus(): UseOfflineStatusResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (savedQueue) {
        const parsedQueue = JSON.parse(savedQueue);
        setQueue(Array.isArray(parsedQueue) ? parsedQueue : []);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, [queue]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Process queued requests when coming back online
        processQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Add item to offline queue
  const addToQueue = useCallback((method: string, url: string, data?: any): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: OfflineQueueItem = {
      id,
      method,
      url,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue(prevQueue => {
      const newQueue = [...prevQueue, item];
      
      // Limit queue size
      if (newQueue.length > MAX_QUEUE_SIZE) {
        // Remove oldest items
        return newQueue.slice(-MAX_QUEUE_SIZE);
      }
      
      return newQueue;
    });

    return id;
  }, []);

  // Remove item from queue
  const removeFromQueue = useCallback((id: string) => {
    setQueue(prevQueue => prevQueue.filter(item => item.id !== id));
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }, []);

  // Process all queued requests
  const processQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0) {
      return;
    }

    const itemsToProcess = [...queue];
    const successfulItems: string[] = [];
    const failedItems: OfflineQueueItem[] = [];

    for (const item of itemsToProcess) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: item.data ? JSON.stringify(item.data) : undefined,
        });

        if (response.ok) {
          successfulItems.push(item.id);
          console.log(`✅ Successfully processed queued request: ${item.method} ${item.url}`);
        } else {
          throw new Error(`Request failed with status: ${response.status}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to process queued request: ${item.method} ${item.url}`, error);
        
        // Increment retry count
        const updatedItem = {
          ...item,
          retryCount: item.retryCount + 1,
        };

        // Only keep items that haven't exceeded max retry count
        if (updatedItem.retryCount < MAX_RETRY_COUNT) {
          failedItems.push(updatedItem);
        } else {
          console.warn(`🚫 Dropping queued request after ${MAX_RETRY_COUNT} attempts: ${item.method} ${item.url}`);
        }
      }
    }

    // Update queue: remove successful items, keep failed items for retry
    setQueue(failedItems);

    if (successfulItems.length > 0) {
      console.log(`🎉 Processed ${successfulItems.length} queued requests successfully`);
    }

    if (failedItems.length > 0) {
      console.log(`⏳ ${failedItems.length} requests remain in queue for retry`);
    }
  }, [isOnline, queue]);

  // Get all queued items
  const getQueuedItems = useCallback(() => {
    return [...queue];
  }, [queue]);

  // Reset wasOffline flag when component unmounts or when explicitly cleared
  useEffect(() => {
    return () => {
      setWasOffline(false);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    queueSize: queue.length,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
    getQueuedItems,
  };
}

// Hook for handling offline-aware API calls
export function useOfflineAwareApi() {
  const offlineStatus = useOfflineStatus();

  const makeOfflineAwareRequest = useCallback(async (
    method: string,
    url: string,
    data?: any,
    options: {
      queueWhenOffline?: boolean;
      showOfflineMessage?: boolean;
    } = {}
  ) => {
    const { queueWhenOffline = true, showOfflineMessage = true } = options;

    if (!offlineStatus.isOnline) {
      if (queueWhenOffline) {
        const queueId = offlineStatus.addToQueue(method, url, data);
        
        if (showOfflineMessage) {
          console.log(`📱 Request queued for when online: ${method} ${url}`);
        }
        
        return {
          success: false,
          queued: true,
          queueId,
          message: 'Request queued - will be processed when online',
        };
      } else {
        throw new Error('No internet connection available');
      }
    }

    // Make the actual request when online
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        queued: false,
      };
    } catch (error) {
      // If request fails and we're offline, queue it
      if (!navigator.onLine && queueWhenOffline) {
        const queueId = offlineStatus.addToQueue(method, url, data);
        return {
          success: false,
          queued: true,
          queueId,
          message: 'Request failed - queued for retry when online',
        };
      }
      
      throw error;
    }
  }, [offlineStatus]);

  return {
    ...offlineStatus,
    makeOfflineAwareRequest,
  };
}

