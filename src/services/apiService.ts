// Zyria Production API Client - Enhanced service with environment config and auth management
import { config, buildApiUrl, logApiCall } from '@/config/environment';
import { ApiResponse, ApiError } from '@/types/api';
import { supabase } from '@/integrations/supabase/client';

// API Error Classes
export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiAuthError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'ApiAuthError';
  }
}

export class ApiValidationError extends Error {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

export class ApiServerError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiServerError';
  }
}

// Request/Response Interceptor Types
interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onError?: (error: any) => any;
}

interface ResponseInterceptor {
  onResponse?: (response: any) => any;
  onError?: (error: any) => any;
}

interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Enhanced API Service Class
class ApiService {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private retryDelays = [1000, 2000, 4000]; // Progressive delays

  constructor() {
    this.setupDefaultInterceptors();
  }

  // Interceptor Management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private setupDefaultInterceptors(): void {
    // Default request interceptor for authentication
    this.addRequestInterceptor({
      onRequest: async (config) => {
        // Add authentication headers using Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            ...config.headers,
          };
        } else {
          config.headers = {
            'Content-Type': 'application/json',
            ...config.headers,
          };
        }

        return config;
      },
    });

    // Default response interceptor for error handling
    this.addResponseInterceptor({
      onResponse: (response) => {
        logApiCall(response.method || 'GET', response.url, response.data);
        return response;
      },
      onError: async (error) => {
        // Handle 401 errors
        if (error.status === 401) {
          throw new ApiAuthError('Session expired. Please log in again.');
        }
        throw error;
      },
    });
  }

  // Core HTTP Methods
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildUrlWithParams(endpoint, params);
    return this.makeRequest('GET', url);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest('POST', endpoint, data);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest('PUT', endpoint, data);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest('PATCH', endpoint, data);
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest('DELETE', endpoint);
  }

  // Enhanced request method with retry logic and error handling
  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint);
    
    let requestConfig: RequestConfig = {
      url,
      method: method.toUpperCase(),
      timeout: config.REQUEST_TIMEOUT,
      retries: config.MAX_RETRY_ATTEMPTS,
      retryDelay: config.RETRY_DELAY,
    };

    if (data) {
      requestConfig.body = data;
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        try {
          requestConfig = await interceptor.onRequest(requestConfig);
        } catch (error) {
          if (interceptor.onError) {
            interceptor.onError(error);
          }
          throw error;
        }
      }
    }

    try {
      // Log API call
      logApiCall(method, url, data);

      // Make the actual request
      const response = await this.fetchWithRetry(requestConfig, retryCount);
      
      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onResponse) {
          processedResponse = await interceptor.onResponse(processedResponse);
        }
      }

      return processedResponse;
    } catch (error) {
      // Apply error interceptors
      let processedError = error;
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onError) {
          try {
            processedError = await interceptor.onError(processedError);
          } catch (interceptorError) {
            processedError = interceptorError;
          }
        }
      }

      // Retry logic for certain types of errors
      if (this.shouldRetry(processedError, retryCount)) {
        const delay = this.retryDelays[retryCount] || config.RETRY_DELAY;
        await this.delay(delay);
        return this.makeRequest(method, endpoint, data, retryCount + 1);
      }

      throw this.transformError(processedError);
    }
  }

  // Fetch with timeout and retry capabilities
  private async fetchWithRetry(requestConfig: RequestConfig, retryCount: number): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);

    try {
      const fetchOptions: RequestInit = {
        method: requestConfig.method,
        headers: requestConfig.headers,
        signal: controller.signal,
      };

      if (requestConfig.body && requestConfig.method !== 'GET') {
        fetchOptions.body = typeof requestConfig.body === 'string' 
          ? requestConfig.body 
          : JSON.stringify(requestConfig.body);
      }

      const response = await fetch(requestConfig.url, fetchOptions);
      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.text();
        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
        } catch {
          parsedError = { message: errorData || response.statusText };
        }

        throw {
          status: response.status,
          statusText: response.statusText,
          data: parsedError,
          config: requestConfig,
        };
      }

      // Parse response
      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: requestConfig,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          status: 408,
          config: requestConfig,
        };
      }
      
      throw error;
    }
  }

  // Error handling utilities
  private shouldRetry(error: any, retryCount: number): boolean {
    if (retryCount >= config.MAX_RETRY_ATTEMPTS) {
      return false;
    }

    // Retry on network errors or 5xx server errors
    return (
      !error.status || // Network error
      error.status >= 500 || // Server error
      error.status === 408 || // Timeout
      error.status === 429 // Rate limit
    );
  }

  private transformError(error: any): Error {
    if (error.status === 401) {
      return new ApiAuthError(error.data?.message || 'Authentication required');
    }
    
    if (error.status === 422) {
      return new ApiValidationError(
        error.data?.message || 'Validation failed',
        error.data?.errors || {}
      );
    }
    
    if (error.status >= 500) {
      return new ApiServerError(
        error.data?.message || 'Server error occurred',
        error.status
      );
    }
    
    if (!error.status) {
      return new NetworkError('Network connection failed');
    }
    
    return new Error(error.data?.message || error.message || 'An error occurred');
  }

  // Utility methods
  private buildUrlWithParams(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    
    const url = new URL(buildApiUrl(endpoint));
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.pathname + url.search;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Connection status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Authentication methods for compatibility
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  // Chat API methods (compatibility layer)
  async getConversations(userId?: string): Promise<any[]> {
    if (config.ENABLE_MOCK_DATA) {
      // Mock implementation
      return [
        {
          id: 'conv-1',
          title: 'Enterprise Security Discussion',
          lastMessage: 'Thank you for the security policy clarification...',
          timestamp: new Date(Date.now() - 3600000),
          messageCount: 12,
        },
        {
          id: 'conv-2',
          title: 'API Integration Help',
          lastMessage: 'The rate limiting issue should be resolved now...',
          timestamp: new Date(Date.now() - 7200000),
          messageCount: 8,
        }
      ];
    }
    return (this.get('/chat/conversations', { userId }) as Promise<any>).then(response => 
      response.data || response
    );
  }

  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<any> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(800);
      return {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
        attachments: attachments?.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        }))
      };
    }
    return this.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      attachments: attachments?.map(f => ({ name: f.name, type: f.type }))
    });
  }

  async generateAIResponse(conversationId: string, userMessage: string): Promise<any> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(1500);
      return {
        id: (Date.now() + 1).toString(),
        content: "I understand your question. Let me provide you with a comprehensive response based on the information available...",
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        sources: [
          {
            title: 'Enterprise Documentation',
            url: '#mock-source',
            snippet: 'Relevant information from your knowledge base...',
            confidence: 'high',
            type: 'PDF'
          }
        ]
      };
    }
    return this.post(`/chat/conversations/${conversationId}/ai-response`, {
      message: userMessage
    });
  }

  // Knowledge Base API methods
  async searchKnowledge(query: string, filters?: any): Promise<any[]> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(600);
      return [
        {
          id: '1',
          title: 'Security Best Practices',
          content: 'This document outlines enterprise security practices...',
          type: 'PDF',
          relevanceScore: 0.95,
        },
        {
          id: '2',
          title: 'API Integration Guide',
          content: 'Learn how to integrate with our enterprise APIs...',
          type: 'Documentation',
          relevanceScore: 0.87,
        }
      ];
    }
    return (this.get('/knowledge/search', { query, ...filters }) as Promise<any>).then(response => 
      response.data || response
    );
  }

  async getDocuments(filters?: any): Promise<any[]> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(400);
      return [
        {
          id: '1',
          title: 'Enterprise Security Policy',
          type: 'PDF',
          uploadedAt: new Date(Date.now() - 86400000),
          size: '2.4 MB',
        },
        {
          id: '2',
          title: 'API Documentation',
          type: 'Documentation',
          uploadedAt: new Date(Date.now() - 172800000),
          size: '1.8 MB',
        }
      ];
    }
    return (this.get('/knowledge/documents', filters) as Promise<any>).then(response => 
      response.data || response
    );
  }

  async uploadDocument(file: File, metadata?: any): Promise<any> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(2000);
      return {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploaded',
        uploadedAt: new Date(),
      };
    }
    const formData = new FormData();
    formData.append('document', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return this.post('/knowledge/documents', formData);
  }

  // Analytics API methods
  async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(700);
      return {
        overview: {
          totalConversations: 2847,
          activeUsers: 156,
          averageResponseTime: 1.2,
          satisfactionScore: 94.8,
        },
        usage: [
          { name: 'Knowledge Base Queries', count: 1245, percentage: 43.8 },
          { name: 'Technical Support', count: 892, percentage: 31.3 },
          { name: 'General Inquiries', count: 456, percentage: 16.0 },
        ]
      };
    }
    return this.get('/analytics', { startDate, endDate });
  }

  // User Management API methods
  async getUsers(): Promise<any[]> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(500);
      return [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'Admin',
          status: 'Active',
          lastLogin: '2024-01-15 14:30',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          role: 'Manager',
          status: 'Active',
          lastLogin: '2024-01-15 09:15',
        }
      ];
    }
    return (this.get('/users') as Promise<any>).then(response => 
      response.data || response
    );
  }

  async inviteUser(email: string, role: string): Promise<any> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(1000);
      return {
        id: `user-${Date.now()}`,
        email,
        role,
        status: 'invited',
        invitedAt: new Date()
      };
    }
    return this.post('/users/invite', { email, role });
  }

  // Workflow API methods
  async getWorkflows(): Promise<any[]> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(400);
      return [
        {
          id: 'workflow-1',
          name: 'User Onboarding',
          status: 'active',
          triggers: 2,
          lastRun: new Date(Date.now() - 3600000),
        },
        {
          id: 'workflow-2',
          name: 'Document Processing',
          status: 'active',
          triggers: 15,
          lastRun: new Date(Date.now() - 1800000),
        }
      ];
    }
    return (this.get('/workflows') as Promise<any>).then(response => 
      response.data || response
    );
  }

  async triggerWorkflow(workflowId: string, data?: any): Promise<any> {
    if (config.ENABLE_MOCK_DATA) {
      await this.delay(1200);
      return {
        id: `run-${Date.now()}`,
        workflowId,
        status: 'running',
        startedAt: new Date(),
        data,
      };
    }
    return this.post(`/workflows/${workflowId}/trigger`, data);
  }

  // Simple compatibility method for existing components
  setFeatureFlag(flag: string, enabled: boolean): void {
    // Feature flags are now handled by environment configuration
    console.log(`Feature flag ${flag} is managed by environment config`);
  }

  // Mock data methods (for development) 
  async mockLogin(email: string = 'admin@zyria.com'): Promise<any> {
    if (!config.ENABLE_MOCK_DATA) {
      return this.login({ email, password: 'demo' });
    }
    // Mock login for development
    return {
      user: { id: '1', email, name: 'Demo User' },
      token: 'mock-token'
    };
  }

  // Feature flag management
  getFeatureFlags() {
    return {
      useMockData: config.ENABLE_MOCK_DATA,
      environment: config.ENVIRONMENT,
      debug: config.DEBUG_API_CALLS,
    };
  }
}

export const apiService = new ApiService();