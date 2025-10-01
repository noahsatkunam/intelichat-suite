// Environment configuration for different deployment stages
export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_VERSION: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ENABLE_MOCK_DATA: boolean;
  REQUEST_TIMEOUT: number;
  MAX_RETRY_ATTEMPTS: number;
  RETRY_DELAY: number;
  TOKEN_REFRESH_THRESHOLD: number; // minutes before expiry
  OFFLINE_RETRY_DELAY: number;
  DEBUG_API_CALLS: boolean;
}

// Default configuration - Mock data disabled for production use
const defaultConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://api.zyria.com',
  API_VERSION: 'v1',
  ENVIRONMENT: 'development',
  ENABLE_MOCK_DATA: false, // Always use live data from Supabase
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  TOKEN_REFRESH_THRESHOLD: 5, // 5 minutes
  OFFLINE_RETRY_DELAY: 5000, // 5 seconds
  DEBUG_API_CALLS: true,
};

// Environment-specific overrides - All environments use live data
const environmentConfigs: Record<string, Partial<EnvironmentConfig>> = {
  development: {
    API_BASE_URL: 'http://localhost:3001',
    ENABLE_MOCK_DATA: false, // Use live Supabase data in development
    DEBUG_API_CALLS: true,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.zyria.com',
    ENABLE_MOCK_DATA: false,
    DEBUG_API_CALLS: true,
  },
  production: {
    API_BASE_URL: 'https://api.zyria.com',
    ENABLE_MOCK_DATA: false,
    DEBUG_API_CALLS: false,
  },
};

// Get current environment from various sources
const getCurrentEnvironment = (): string => {
  // Check URL-based environment detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    }
    if (hostname.includes('staging')) {
      return 'staging';
    }
  }
  
  // Default to development for safety
  return 'development';
};

// Create final configuration by merging defaults with environment-specific settings
const currentEnv = getCurrentEnvironment();
const envOverrides = environmentConfigs[currentEnv] || {};

export const config: EnvironmentConfig = {
  ...defaultConfig,
  ...envOverrides,
  ENVIRONMENT: currentEnv as EnvironmentConfig['ENVIRONMENT'],
};

// Utility functions
export const isProduction = () => config.ENVIRONMENT === 'production';
export const isDevelopment = () => config.ENVIRONMENT === 'development';
export const isStaging = () => config.ENVIRONMENT === 'staging';
export const shouldUseMockData = () => config.ENABLE_MOCK_DATA;

// API URL builders
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = config.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const version = config.API_VERSION;
  return `${baseUrl}/api/${version}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const buildWebSocketUrl = (endpoint: string): string => {
  const baseUrl = config.API_BASE_URL.replace(/^https?/, 'ws').replace(/\/$/, '');
  return `${baseUrl}/ws${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Debug logging
export const logApiCall = (method: string, url: string, data?: any) => {
  if (config.DEBUG_API_CALLS) {
    console.group(`🌐 API ${method.toUpperCase()}: ${url}`);
    if (data) {
      console.log('📤 Request Data:', data);
    }
    console.log('⚙️ Environment:', config.ENVIRONMENT);
    console.log('🔧 Mock Data:', config.ENABLE_MOCK_DATA ? 'Enabled' : 'Disabled');
    console.groupEnd();
  }
};

export default config;