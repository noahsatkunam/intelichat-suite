// Zyria API Service - Centralized client for frontend-only mock data management
// This service provides a consistent API interface that can later be easily
// switched to real backend endpoints when ready.

import { Message } from '@/components/chat/ChatInterface';
import { mockChatScenarios, mockKnowledgeBase, mockAnalytics, mockUsers, mockWorkflows } from '@/data/mockData';
import { demoService } from './demoService';

// Configuration
const API_CONFIG = {
  baseURL: '/api', // Will be configurable when real backend is connected
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Feature flags for mock vs real data
const FEATURE_FLAGS = {
  useMockAuth: true,
  useMockChat: true,
  useMockKnowledge: true,
  useMockAnalytics: true,
  useMockUsers: true,
  useMockWorkflows: true,
};

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    // Initialize mock auth token for demo purposes
    this.authToken = 'mock-jwt-token-demo';
  }

  // Authentication methods (currently mock)
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    if (FEATURE_FLAGS.useMockAuth) {
      // Simulate API delay
      await this.delay(1000);
      
      // Mock authentication
      const mockUser = {
        id: 'user-1',
        email,
        name: 'Demo User',
        role: 'admin',
        avatar: '/placeholder.svg',
      };
      
      const token = 'mock-jwt-token-' + Date.now();
      this.authToken = token;
      
      // Store in localStorage for persistence
      localStorage.setItem('zyria-auth-token', token);
      localStorage.setItem('zyria-user', JSON.stringify(mockUser));
      
      return { user: mockUser, token };
    }
    
    // Real API call would go here when backend is connected
    throw new Error('Real authentication not yet configured');
  }

  async logout(): Promise<void> {
    this.authToken = null;
    localStorage.removeItem('zyria-auth-token');
    localStorage.removeItem('zyria-user');
  }

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('zyria-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.authToken || !!localStorage.getItem('zyria-auth-token');
  }

  // Chat API methods
  async getConversations(userId?: string): Promise<any[]> {
    if (FEATURE_FLAGS.useMockChat) {
      await this.delay(500);
      
      // Return mock conversation history
      return [
        {
          id: 'conv-1',
          title: 'Enterprise Security Discussion',
          lastMessage: 'Thank you for the security policy clarification...',
          timestamp: new Date(Date.now() - 3600000),
          messageCount: 12,
          participants: ['user-1', 'zyria-ai']
        },
        {
          id: 'conv-2', 
          title: 'API Integration Help',
          lastMessage: 'The rate limiting issue should be resolved now...',
          timestamp: new Date(Date.now() - 7200000),
          messageCount: 8,
          participants: ['user-1', 'zyria-ai']
        }
      ];
    }
    
    // Real API: GET /api/chat/conversations
    return this.makeRequest('GET', '/chat/conversations', null, { userId });
  }

  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<Message> {
    if (FEATURE_FLAGS.useMockChat) {
      await this.delay(800);
      
      // Create user message
      const userMessage: Message = {
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
      
      return userMessage;
    }
    
    // Real API: POST /api/chat/messages
    return this.makeRequest('POST', `/chat/conversations/${conversationId}/messages`, {
      content,
      attachments: attachments?.map(f => ({ name: f.name, type: f.type }))
    });
  }

  async generateAIResponse(conversationId: string, userMessage: string): Promise<Message> {
    if (FEATURE_FLAGS.useMockChat) {
      // Use demo service for realistic responses
      if (demoService.isDemoModeEnabled()) {
        return demoService.generateDemoResponse(userMessage);
      }
      
      // Default mock response
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
    
    // Real API: POST /api/chat/ai-response
    return this.makeRequest('POST', `/chat/conversations/${conversationId}/ai-response`, {
      message: userMessage
    });
  }

  // Knowledge Base API methods
  async searchKnowledge(query: string, filters?: any): Promise<any[]> {
    if (FEATURE_FLAGS.useMockKnowledge) {
      await this.delay(600);
      return demoService.simulateKnowledgeSearch(query);
    }
    
    // Real API: GET /api/knowledge/search
    return this.makeRequest('GET', '/knowledge/search', null, { query, ...filters });
  }

  async uploadDocument(file: File, metadata?: any): Promise<any> {
    if (FEATURE_FLAGS.useMockKnowledge) {
      // Simulate file upload with progress
      return demoService.simulateDocumentProcessing(file.name);
    }
    
    // Real API: POST /api/knowledge/documents
    const formData = new FormData();
    formData.append('document', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    return this.makeRequest('POST', '/knowledge/documents', formData);
  }

  async getDocuments(filters?: any): Promise<any[]> {
    if (FEATURE_FLAGS.useMockKnowledge) {
      await this.delay(400);
      return mockKnowledgeBase;
    }
    
    // Real API: GET /api/knowledge/documents  
    return this.makeRequest('GET', '/knowledge/documents', null, filters);
  }

  // Analytics API methods
  async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
    if (FEATURE_FLAGS.useMockAnalytics) {
      await this.delay(700);
      return {
        ...mockAnalytics,
        realtime: demoService.generateRealtimeMetrics()
      };
    }
    
    // Real API: GET /api/analytics
    return this.makeRequest('GET', '/analytics', null, { startDate, endDate });
  }

  // User Management API methods  
  async getUsers(): Promise<any[]> {
    if (FEATURE_FLAGS.useMockUsers) {
      await this.delay(500);
      return mockUsers;
    }
    
    // Real API: GET /api/users
    return this.makeRequest('GET', '/users');
  }

  async inviteUser(email: string, role: string): Promise<any> {
    if (FEATURE_FLAGS.useMockUsers) {
      await this.delay(1000);
      return {
        id: `user-${Date.now()}`,
        email,
        role,
        status: 'invited',
        invitedAt: new Date()
      };
    }
    
    // Real API: POST /api/users/invite
    return this.makeRequest('POST', '/users/invite', { email, role });
  }

  // Workflow API methods
  async getWorkflows(): Promise<any[]> {
    if (FEATURE_FLAGS.useMockWorkflows) {
      await this.delay(400);
      return mockWorkflows;
    }
    
    // Real API: GET /api/workflows
    return this.makeRequest('GET', '/workflows');
  }

  async triggerWorkflow(workflowId: string, data?: any): Promise<any> {
    if (FEATURE_FLAGS.useMockWorkflows) {
      return demoService.simulateWorkflowExecution(workflowId);
    }
    
    // Real API: POST /api/workflows/trigger
    return this.makeRequest('POST', `/workflows/${workflowId}/trigger`, data);
  }

  // Core HTTP methods (ready for real API integration)
  private async makeRequest(
    method: string, 
    endpoint: string, 
    data?: any, 
    params?: any
  ): Promise<any> {
    const url = new URL(endpoint, this.baseURL);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      }
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // Remove content-type header for FormData (browser will set it)
        delete (config.headers as any)['Content-Type'];
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    try {
      const response = await this.fetchWithRetry(url.toString(), config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private async fetchWithRetry(url: string, config: RequestInit, attempt = 1): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      if (attempt < API_CONFIG.retryAttempts) {
        await this.delay(API_CONFIG.retryDelay * attempt);
        return this.fetchWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Feature flag management (for easy switching to real APIs)
  setFeatureFlag(flag: keyof typeof FEATURE_FLAGS, enabled: boolean): void {
    FEATURE_FLAGS[flag] = enabled;
  }

  getFeatureFlags(): typeof FEATURE_FLAGS {
    return { ...FEATURE_FLAGS };
  }
}

// Export singleton instance
export const apiService = new ApiService();