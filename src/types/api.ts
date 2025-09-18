// Comprehensive TypeScript interfaces for API contracts

// Base API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
  permissions: string[];
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  token: string;
  expiresAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  department?: string;
  permissions: string[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Chat Types
export interface Conversation {
  id: string;
  title: string;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  sender: MessageSender;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'code' | 'system';
export type MessageSender = 'user' | 'assistant' | 'system';

export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  model?: string;
  temperature?: number;
  sources?: DocumentSource[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// Knowledge Base Types
export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  status: DocumentStatus;
  userId: string;
  tags: string[];
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
  indexedAt?: string;
}

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'url';
export type DocumentStatus = 'processing' | 'indexed' | 'failed' | 'archived';

export interface DocumentMetadata {
  size: number;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  author?: string;
  source?: string;
}

export interface DocumentSource {
  documentId: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  pageNumber?: number;
}

export interface SearchRequest {
  query: string;
  filters?: {
    documentTypes?: DocumentType[];
    tags?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  pagination?: {
    page: number;
    limit: number;
  };
  includeContent?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  processingTime: number;
  suggestions?: string[];
}

export interface SearchResult {
  document: Document;
  relevanceScore: number;
  highlights: string[];
  matchCount: number;
}

// Analytics Types
export interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  metrics: AnalyticsMetric[];
  timeRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  data: AnalyticsDataPoint[];
}

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

// Admin Types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: TenantStatus;
  plan: TenantPlan;
  settings: TenantSettings;
  usage: TenantUsage;
  createdAt: string;
  updatedAt: string;
}

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired';
export type TenantPlan = 'free' | 'pro' | 'enterprise';

export interface TenantSettings {
  maxUsers: number;
  maxDocuments: number;
  maxStorage: number; // in bytes
  features: string[];
  customization: {
    logo?: string;
    colors?: Record<string, string>;
    branding?: Record<string, string>;
  };
}

export interface TenantUsage {
  users: number;
  documents: number;
  storage: number; // in bytes
  apiCalls: number;
  lastUpdated: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  stack?: string; // Only in development
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Request/Response Wrapper Types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
  source: string;
}

// File Upload Types
export interface FileUploadRequest {
  file: File;
  type: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  metadata?: Record<string, any>;
}

// System Status Types
export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceStatus[];
  lastChecked: string;
  version: string;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  details?: Record<string, any>;
}