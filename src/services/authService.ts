// Authentication service with token management and automatic refresh
import { config } from '@/config/environment';
import { AuthResponse, LoginRequest, RegisterRequest, TokenRefreshRequest, TokenRefreshResponse, User } from '@/types/api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

class AuthService {
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<string> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadTokensFromStorage();
    this.setupAutoRefresh();
  }

  // Token Management
  private loadTokensFromStorage(): void {
    try {
      const storedTokens = localStorage.getItem('zyria_auth_tokens');
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens);
        if (this.isValidTokenData(parsed)) {
          this.tokens = parsed;
        } else {
          this.clearTokens();
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    try {
      localStorage.setItem('zyria_auth_tokens', JSON.stringify(tokens));
      this.tokens = tokens;
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem('zyria_auth_tokens');
    localStorage.removeItem('zyria_current_user');
    this.tokens = null;
    this.clearRefreshTimer();
  }

  private isValidTokenData(data: any): data is AuthTokens {
    return data && 
           typeof data.accessToken === 'string' && 
           typeof data.refreshToken === 'string' && 
           typeof data.expiresAt === 'string' &&
           new Date(data.expiresAt) > new Date();
  }

  // Auto-refresh logic
  private setupAutoRefresh(): void {
    if (!this.tokens) return;

    const expiresAt = new Date(this.tokens.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const refreshThreshold = config.TOKEN_REFRESH_THRESHOLD * 60 * 1000; // Convert to ms

    if (timeUntilExpiry <= refreshThreshold) {
      // Token expires soon, refresh immediately
      this.refreshToken();
    } else {
      // Schedule refresh before expiry
      const refreshTime = timeUntilExpiry - refreshThreshold;
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/${config.API_VERSION}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens and user info
      this.saveTokensToStorage({
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
        expiresAt: authResponse.expiresAt,
      });

      // Save user info
      localStorage.setItem('zyria_current_user', JSON.stringify(authResponse.user));
      
      // Setup auto-refresh
      this.setupAutoRefresh();

      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/${config.API_VERSION}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens and user info
      this.saveTokensToStorage({
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
        expiresAt: authResponse.expiresAt,
      });

      localStorage.setItem('zyria_current_user', JSON.stringify(authResponse.user));
      
      // Setup auto-refresh
      this.setupAutoRefresh();

      return authResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.tokens) {
        // Attempt to notify server of logout
        await fetch(`${config.API_BASE_URL}/api/${config.API_VERSION}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/${config.API_VERSION}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.tokens!.refreshToken }),
      });

      if (!response.ok) {
        // If refresh fails, clear tokens and redirect to login
        this.clearTokens();
        throw new Error('Token refresh failed');
      }

      const refreshResponse: TokenRefreshResponse = await response.json();
      
      // Update stored tokens
      const updatedTokens: AuthTokens = {
        ...this.tokens!,
        accessToken: refreshResponse.token,
        expiresAt: refreshResponse.expiresAt,
      };
      
      this.saveTokensToStorage(updatedTokens);
      
      // Setup next auto-refresh
      this.setupAutoRefresh();

      return refreshResponse.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.tokens !== null && new Date(this.tokens.expiresAt) > new Date();
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('zyria_current_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Check if token needs refresh soon
  needsRefresh(): boolean {
    if (!this.tokens) return false;
    
    const expiresAt = new Date(this.tokens.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const refreshThreshold = config.TOKEN_REFRESH_THRESHOLD * 60 * 1000;
    
    return timeUntilExpiry <= refreshThreshold;
  }

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Mock login for development
  async mockLogin(email: string = 'admin@zyria.com'): Promise<AuthResponse> {
    if (!config.ENABLE_MOCK_DATA) {
      throw new Error('Mock login only available in development mode');
    }

    const mockAuthResponse: AuthResponse = {
      user: {
        id: '1',
        email,
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        role: 'admin',
        status: 'active',
        permissions: ['read', 'write', 'delete', 'admin'],
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            inApp: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['read', 'write', 'delete', 'admin'],
    };

    // Store mock tokens
    this.saveTokensToStorage({
      accessToken: mockAuthResponse.token,
      refreshToken: mockAuthResponse.refreshToken,
      expiresAt: mockAuthResponse.expiresAt,
    });

    localStorage.setItem('zyria_current_user', JSON.stringify(mockAuthResponse.user));
    
    return mockAuthResponse;
  }
}

export const authService = new AuthService();
export default authService;