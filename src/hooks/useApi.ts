// React hooks for API operations with proper loading states and error handling

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { useToastNotifications } from './useToastNotifications';

// Generic API hook for any async operation
export function useApi<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showError } = useToastNotifications();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction();
      setData(result);
      
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      } else {
        showError('Operation failed', error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  };
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await apiService.getCurrentUser();
        const authStatus = await apiService.isAuthenticated();
        setUser(currentUser);
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await apiService.login({ email, password });
      setUser(result.user);
      setIsAuthenticated(true);
      showSuccess('Welcome back!', `Logged in as ${result.user?.email || email}`);
      return result;
    } catch (error) {
      showError('Login failed', 'Please check your credentials and try again');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setIsAuthenticated(false);
      showSuccess('Logged out', 'You have been successfully logged out');
    } catch (error) {
      showError('Logout failed', 'Please try again');
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout
  };
}

// Chat hooks
export function useConversations(userId?: string) {
  return useApi(
    () => apiService.getConversations(userId),
    [userId],
    { immediate: true }
  );
}

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const { notifyMessageSent, notifyMessageError } = useToastNotifications();

  const sendMessage = async (conversationId: string, content: string, attachments?: File[]) => {
    try {
      setLoading(true);
      
      // Send user message
      const userMessage = await apiService.sendMessage(conversationId, content, attachments);
      
      // Generate AI response  
      const aiResponse = await apiService.generateAIResponse(conversationId, content);
      
      notifyMessageSent();
      return { userMessage, aiResponse };
    } catch (error) {
      notifyMessageError();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading
  };
}

// Knowledge Base hooks
export function useKnowledgeSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (query: string, filters?: any) => {
    try {
      setLoading(true);
      const results = await apiService.searchKnowledge(query, filters);
      setResults(results);
      return results;
    } catch (error) {
      console.error('Knowledge search failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    search
  };
}

export function useDocuments(filters?: any) {
  return useApi(
    () => apiService.getDocuments(filters),
    [filters],
    { immediate: true }
  );
}

export function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { notifyFileUploaded, notifyFileUploadError, notifyDocumentProcessed } = useToastNotifications();

  const uploadDocument = async (file: File, metadata?: any) => {
    try {
      setUploading(true);
      setProgress(0);

      // Simulate upload progress for demo
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 200);

      const result = await apiService.uploadDocument(file, metadata);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      notifyFileUploaded(file.name);
      
      // Simulate processing completion
      setTimeout(() => {
        notifyDocumentProcessed(file.name);
      }, 1500);
      
      return result;
    } catch (error) {
      notifyFileUploadError(file.name);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return {
    uploadDocument,
    uploading,
    progress
  };
}

// Analytics hooks
export function useAnalytics(startDate?: string, endDate?: string) {
  return useApi(
    () => apiService.getAnalytics(startDate, endDate),
    [startDate, endDate],
    { immediate: true }
  );
}

// User Management hooks
export function useUsers() {
  return useApi(
    () => apiService.getUsers(),
    [],
    { immediate: true }
  );
}

export function useUserInvitation() {
  const [loading, setLoading] = useState(false);
  const { notifyUserInvited, showError } = useToastNotifications();

  const inviteUser = async (email: string, role: string) => {
    try {
      setLoading(true);
      const result = await apiService.inviteUser(email, role);
      notifyUserInvited(email);
      return result;
    } catch (error) {
      showError('Invitation failed', `Failed to invite ${email}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteUser,
    loading
  };
}

// Workflow hooks
export function useWorkflows() {
  return useApi(
    () => apiService.getWorkflows(),
    [],
    { immediate: true }
  );
}

export function useWorkflowTrigger() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  const triggerWorkflow = async (workflowId: string, data?: any) => {
    try {
      setLoading(true);
      const result = await apiService.triggerWorkflow(workflowId, data);
      showSuccess('Workflow triggered', 'Workflow execution started successfully');
      return result;
    } catch (error) {
      showError('Workflow failed', 'Failed to trigger workflow');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    triggerWorkflow,
    loading
  };
}

// Generic mutation hook for create/update/delete operations
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: TVariables): Promise<TData> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      options.onSuccess?.(result, variables);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error, variables);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error
  };
}