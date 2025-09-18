// Enhanced API hook with loading states, error handling, and offline support
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/services/apiService';
import { ApiResponse } from '@/types/api';

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  abort: () => void;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    initialData = null,
    immediate = false,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<any[]>([]);
  const retryCountRef = useRef(0);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setSuccess(false);
    retryCountRef.current = 0;
  }, [initialData]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    if (!enabled) return null;

    // Abort any existing request
    abort();

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Store arguments for retry functionality
    lastArgsRef.current = args;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiCall(...args);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const responseData = response.data || response;
      setData(responseData);
      setSuccess(true);
      retryCountRef.current = 0;
      
      if (onSuccess) {
        onSuccess(responseData);
      }
      
      return responseData;
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      setSuccess(false);
      
      if (onError) {
        onError(error);
      }
      
      // Auto-retry logic
      if (retryCountRef.current < retryAttempts && shouldRetry(error)) {
        retryCountRef.current++;
        setTimeout(() => {
          if (enabled) {
            execute(...args);
          }
        }, retryDelay * retryCountRef.current);
      }
      
      return null;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiCall, enabled, retryAttempts, retryDelay, onSuccess, onError, abort]);

  const retry = useCallback((): Promise<T | null> => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  // Immediate execution on mount
  useEffect(() => {
    if (immediate && enabled) {
      execute();
    }
    
    // Cleanup on unmount
    return () => {
      abort();
    };
  }, [immediate, enabled]); // Don't include execute to avoid re-runs

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    data,
    loading,
    error,
    success,
    execute,
    retry,
    reset,
    abort,
  };
}

// Helper function to determine if an error should trigger a retry
function shouldRetry(error: Error): boolean {
  // Don't retry on authentication errors or validation errors
  if (error.name === 'ApiAuthError' || error.name === 'ApiValidationError') {
    return false;
  }
  
  // Retry on network errors and server errors
  return error.name === 'NetworkError' || error.name === 'ApiServerError';
}

// Specialized hooks for common use cases
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await operation();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Operation failed');
      setState(prev => ({ ...prev, loading: false, error: err }));
      throw err;
    }
  }, dependencies);

  return {
    ...state,
    execute,
  };
}

// Hook for API calls that need pagination
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number, ...args: any[]) => Promise<ApiResponse<{ items: T[]; pagination: any }>>,
  options: UseApiOptions<{ items: T[]; pagination: any }> & {
    initialPage?: number;
    pageSize?: number;
  } = {}
) {
  const { initialPage = 1, pageSize = 20, ...apiOptions } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const {
    data,
    loading,
    error,
    success,
    execute,
    retry,
    reset: apiReset,
    abort,
  } = useApi(
    (page: number, limit: number, ...args: any[]) => apiCall(page, limit, ...args),
    apiOptions
  );

  const loadPage = useCallback((page: number, ...args: any[]) => {
    setCurrentPage(page);
    return execute(page, pageSize, ...args);
  }, [execute, pageSize]);

  const nextPage = useCallback((...args: any[]) => {
    const nextPageNum = currentPage + 1;
    return loadPage(nextPageNum, ...args);
  }, [currentPage, loadPage]);

  const previousPage = useCallback((...args: any[]) => {
    const prevPageNum = Math.max(1, currentPage - 1);
    return loadPage(prevPageNum, ...args);
  }, [currentPage, loadPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    apiReset();
  }, [initialPage, apiReset]);

  return {
    data,
    loading,
    error,
    success,
    currentPage,
    items: data?.items || [],
    pagination: data?.pagination,
    loadPage,
    nextPage,
    previousPage,
    retry,
    reset,
    abort,
  };
}

// Hook for real-time updates
export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 5000,
  options: UseApiOptions<T> = {}
) {
  const { enabled = true, ...apiOptions } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    data,
    loading,
    error,
    success,
    execute,
    retry,
    reset,
    abort,
  } = useApi(apiCall, { ...apiOptions, immediate: enabled });

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (enabled && !loading) {
        execute();
      }
    }, interval);
  }, [enabled, loading, execute, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    success,
    execute,
    retry,
    reset,
    abort,
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null,
  };
}