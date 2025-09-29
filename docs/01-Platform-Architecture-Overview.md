# Platform Architecture Overview

## Document Purpose
This document provides a comprehensive technical overview of the Zyria Enterprise AI Platform architecture, enabling effective collaboration between developers, AI assistants, and strategic planning tools.

---

## A. Technology Stack

### Frontend Technologies

#### Core Framework & Build Tools
- **React 18.3.1** - Primary UI framework with concurrent rendering
- **TypeScript 5.8.3** - Type-safe development across 195+ files
  - Configuration: Relaxed strict mode (noImplicitAny: false, strictNullChecks: false)
  - Path aliases configured for clean imports (@/ prefix)
- **Vite 5.4.19** - Build tool with Hot Module Replacement (HMR)
  - Plugin: @vitejs/plugin-react-swc for faster compilation
  - Development server on port 8080

#### Styling & UI Components
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
  - PostCSS processing with Autoprefixer 10.4.21
  - Custom design system in index.css and tailwind.config.ts
- **Radix UI** - Accessible component primitives (28+ packages)
- **shadcn/ui** - Pre-built component library built on Radix UI
- **next-themes 0.3.0** - Dark/light theme management

#### State Management & Data Fetching
- **React Query (@tanstack/react-query) 5.83.0** - Server state management
  - Caching strategies for API responses
  - Real-time data synchronization
- **React Context** - Global state (Auth, Theme)
- **useState/useReducer** - Local component state

#### Form Handling & Validation
- **React Hook Form 7.61.1** - Performance-optimized forms
- **Zod 3.25.76** - Runtime type validation and schema definition
- **@hookform/resolvers 3.10.0** - Zod integration

#### Routing
- **React Router DOM 6.30.1** - Client-side routing
  - Protected routes with authentication guards
  - Role-based access control

#### UI Enhancement Libraries
- **Lucide React 0.462.0** - Icon system (1000+ icons)
- **Sonner 1.7.4** - Toast notification system
- **cmdk 1.1.1** - Command palette interface
- **React Syntax Highlighter 15.6.6** - Code block rendering
- **Recharts 2.15.4** - Analytics charts and data visualization
- **Three.js 0.160.1** + **React Three Fiber 8.18.0** - 3D graphics
- **date-fns 3.6.0** - Date manipulation and formatting

#### Development Tools
- **ESLint 9.32.0** - Code quality enforcement
- **TypeScript ESLint 8.38.0** - TypeScript-specific linting
- **lovable-tagger 1.1.9** - Development-only component identification

### Backend Technologies

#### Database & Backend Platform
- **Supabase** - Managed backend platform
  - **PostgreSQL 15+** - Primary database
  - **Supabase Auth** - JWT-based authentication
  - **Supabase Storage** - File storage with RLS policies
  - **Supabase Client 2.57.4** - JavaScript client library

#### Database Extensions
- **uuid-ossp** - UUID generation for primary keys
- **pg_cron** - Scheduled job execution (daily health checks)
- **net.http** - HTTP request capabilities from database

#### Serverless Functions
- **Supabase Edge Functions** - 6 Deno-based serverless functions
  - Runtime: Deno with std@0.168.0 and std@0.190.0
  - Language: TypeScript
  - Functions:
    1. ai-chat - AI provider orchestration
    2. ai-chat-test - Provider testing
    3. ai-provider-health-check - Health monitoring
    4. ai-providers-daily-check - Scheduled health checks
    5. send-invitation - User invitation emails
    6. send-password-reset - Password reset emails

### Third-Party Services

#### AI Provider Ecosystem (Multi-Provider Support)
- **OpenAI** - GPT-4, GPT-3.5 models
- **Anthropic** - Claude models
- **Google** - Gemini models (multimodal)
- **Mistral** - European AI provider
- **Meta** - Llama models via API
- **xAI** - Grok models
- **Ollama** - Local model deployment
- **Custom Endpoints** - Proprietary model support

#### Communication Services
- **Resend API 2.0.0** - Transactional email delivery
  - Password resets
  - User invitations
  - Edge function integration

#### Content Delivery
- **Google Fonts** - Inter, Manrope, Lexend font families
- **npm Registry** - Package distribution
- **esm.sh CDN** - Module distribution for Edge Functions

---

## B. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           React SPA (Single Page Application)              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │   Chat   │  │Knowledge │  │  Admin   │  │Analytics │  │ │
│  │  │Interface │  │   Base   │  │  Panel   │  │Dashboard │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Platform                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Edge Functions Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │ AI Chat  │  │  Health  │  │  Email   │  │   Test   │  │ │
│  │  │          │  │  Check   │  │ Service  │  │          │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database (15+)                     │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │         Row Level Security (RLS) Policies            │ │ │
│  │  │  • Tenant Isolation   • Role-Based Access Control   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │  │Profiles  │  │Tenants   │  │Messages  │  │Documents │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Supabase Storage                         │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  documents bucket (tenant-isolated, RLS protected)   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External AI Providers                          │
│    OpenAI │ Anthropic │ Google │ Mistral │ Meta │ xAI │ Ollama  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components & Relationships

#### 1. Frontend Layer (React SPA)
**Purpose**: User interface and user experience
**Technology**: React 18.3.1 + TypeScript + Vite
**Key Responsibilities**:
- Render UI components and manage client state
- Handle user interactions and form submissions
- Manage WebSocket connections for real-time updates
- Implement responsive design and theme management
- Client-side routing and navigation

**Integration Points**:
- Supabase Client for database queries
- Edge Functions for AI operations
- Supabase Auth for authentication
- Supabase Storage for file uploads

#### 2. Edge Functions Layer (Serverless Backend)
**Purpose**: Serverless compute for business logic
**Technology**: Deno + TypeScript
**Key Responsibilities**:
- AI provider orchestration and failover
- External API integrations (email, AI)
- Complex business logic
- Secure credential management
- Health monitoring and maintenance

**Integration Points**:
- PostgreSQL for data operations
- External AI providers
- Email service (Resend)
- Frontend via HTTP/HTTPS

#### 3. Database Layer (PostgreSQL)
**Purpose**: Data persistence and security
**Technology**: PostgreSQL 15+ with RLS
**Key Responsibilities**:
- Store all application data
- Enforce tenant isolation via RLS
- Manage user authentication
- Execute scheduled jobs (pg_cron)
- Real-time change notifications

**Security Model**:
- Row Level Security on all tables
- Tenant isolation via tenant_id
- Role-based access control
- Audit logging for compliance

#### 4. Storage Layer
**Purpose**: File and document management
**Technology**: Supabase Storage
**Key Responsibilities**:
- Store uploaded documents
- Tenant-isolated storage buckets
- File access control via RLS
- Document processing pipeline

### Data Flow Patterns

#### Authentication Flow
```
User Login → Supabase Auth → JWT Token Generation → 
Profile Lookup → Tenant Context Loading → RLS Policy Application → 
Session Persistence → Access Granted
```

#### Chat Message Flow
```
User Input → Chat Component → Edge Function (ai-chat) → 
AI Provider Selection → API Call with Failover → 
Streaming Response → Real-time UI Update → 
Message Persistence → Audit Logging
```

#### Knowledge Base Flow
```
Document Upload → Supabase Storage → Processing Trigger → 
Text Extraction → Vector Embedding Generation → 
Database Storage → Search Index Update → 
RAG-Enabled Queries
```

---

## C. Project Structure

### Root Directory Organization
```
zyria-platform/
├── src/                    # Frontend source code
├── supabase/              # Backend configuration
├── public/                # Static assets
├── docs/                  # Project documentation
├── .env                   # Environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── vite.config.ts        # Vite build configuration
└── README.md             # Project overview
```

### Frontend Structure (`src/`)
```
src/
├── components/           # Reusable UI components
│   ├── ai/              # AI-specific components
│   ├── auth/            # Authentication components
│   ├── branding/        # Branding components
│   ├── chat/            # Chat interface components
│   ├── dashboard/       # Dashboard widgets
│   ├── knowledge/       # Knowledge base components
│   ├── layout/          # Layout components
│   ├── onboarding/      # Onboarding tour
│   ├── tenant/          # Multi-tenant components
│   ├── theme/           # Theme management
│   └── ui/              # Base UI components (shadcn/ui)
│
├── pages/               # Page-level components
│   ├── admin/           # Admin panel pages
│   │   ├── AIModelTest.tsx
│   │   ├── AIProviders.tsx
│   │   ├── APISettings.tsx
│   │   ├── AuditLogs.tsx
│   │   ├── ChatbotManagement.tsx
│   │   ├── SystemMonitoring.tsx
│   │   ├── TenantManagement.tsx
│   │   ├── UserInvitations.tsx
│   │   ├── UserManagement.tsx
│   │   └── WorkflowAutomation.tsx
│   ├── About.tsx
│   ├── Analytics.tsx
│   ├── AuthPage.tsx
│   ├── ChatHistory.tsx
│   ├── ContactPage.tsx
│   ├── Dashboard.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── HomePage.tsx
│   ├── Index.tsx
│   ├── InviteAcceptPage.tsx
│   ├── KnowledgeBase.tsx
│   ├── NotFound.tsx
│   ├── PrivacyPolicy.tsx
│   ├── Settings.tsx
│   └── SignUpPage.tsx
│
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeProvider.tsx # Theme state
│
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useApi.ts
│   ├── useApiWithLoading.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useOfflineStatus.ts
│   └── useToastNotifications.ts
│
├── services/            # API service layer
│   ├── analyticsService.ts
│   ├── apiService.ts
│   ├── conversationService.ts
│   └── documentService.ts
│
├── integrations/        # External service integrations
│   └── supabase/
│       ├── client.ts    # Supabase client instance
│       └── types.ts     # Auto-generated database types
│
├── types/               # TypeScript type definitions
│   └── api.ts          # API interface definitions
│
├── lib/                 # Utility functions
│   └── utils.ts        # Common utilities
│
├── data/                # Static data and configurations
│   └── providerModels.ts
│
├── config/              # Application configuration
│   └── environment.ts
│
├── assets/              # Images and static assets
│   ├── gemini-logo.png
│   └── mistral-logo.png
│
├── App.tsx              # Root component
├── App.css              # Global styles
├── main.tsx             # Application entry point
├── index.css            # Tailwind directives & design system
└── vite-env.d.ts        # Vite type definitions
```

### Backend Structure (`supabase/`)
```
supabase/
├── functions/           # Edge Functions (Deno)
│   ├── ai-chat/
│   │   └── index.ts    # AI chat orchestration
│   ├── ai-chat-test/
│   │   └── index.ts    # AI provider testing
│   ├── ai-provider-health-check/
│   │   └── index.ts    # Health monitoring
│   ├── ai-providers-daily-check/
│   │   └── index.ts    # Scheduled health checks
│   ├── send-invitation/
│   │   └── index.ts    # User invitation emails
│   └── send-password-reset/
│       └── index.ts    # Password reset emails
│
├── migrations/          # Database migrations (24+ files)
│   ├── 20250918172537_*.sql  # Core schema
│   ├── 20250918192306_*.sql  # User invitations
│   └── [...more migrations]
│
└── config.toml          # Supabase configuration
```

### Naming Conventions

#### Files
- **Components**: PascalCase (e.g., `ChatInterface.tsx`, `MessageBubble.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useApi.ts`, `useToast.ts`)
- **Services**: camelCase with `Service` suffix (e.g., `apiService.ts`)
- **Types**: PascalCase (e.g., `api.ts` containing type interfaces)
- **Utilities**: camelCase (e.g., `utils.ts`)

#### Code
- **Components**: PascalCase (e.g., `<ChatInterface />`)
- **Functions**: camelCase (e.g., `handleSendMessage()`)
- **Variables**: camelCase (e.g., `conversationId`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SUPABASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `Message`, `ApiResponse<T>`)
- **Enums**: PascalCase (e.g., `UserRole`, `MessageStatus`)

#### Database
- **Tables**: snake_case (e.g., `ai_providers`, `user_invitations`)
- **Columns**: snake_case (e.g., `created_at`, `tenant_id`)
- **Functions**: snake_case (e.g., `get_user_tenant_id()`)
- **Policies**: Descriptive names (e.g., "Users can view own conversations")

### Module Organization

#### Component Architecture
- **Atomic Design Pattern** (loosely followed)
  - Atoms: Base UI components (`Button`, `Input`, `Badge`)
  - Molecules: Combined components (`MessageBubble`, `FileUpload`)
  - Organisms: Feature components (`ChatInterface`, `DocumentUpload`)
  - Templates: Layout components (`AppLayout`, `AppSidebar`)
  - Pages: Route-level components (`Dashboard`, `ChatHistory`)

#### Service Layer Pattern
- Services act as intermediaries between components and APIs
- Centralized API calls with error handling
- Reusable business logic
- Type-safe responses using TypeScript

---

## D. Key Design Patterns

### 1. Component Patterns

#### Functional Components with Hooks
**Pattern**: All components use functional components with React Hooks
```typescript
const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    // Component logic
  }, [dependencies]);
  
  return <div>...</div>;
};
```

#### Compound Component Pattern
**Used in**: Chat interface, sidebar, forms
```typescript
<Sidebar>
  <SidebarHeader />
  <SidebarContent>
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem />
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

#### Controlled Components
**Pattern**: Form inputs managed by React state
```typescript
<Input
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>
```

### 2. API Patterns

#### Service Layer Abstraction
**Pattern**: All API calls go through dedicated service modules

**File**: `src/services/conversationService.ts`
```typescript
export const conversationService = {
  async getConversations(tenantId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return data;
  }
};
```

#### RESTful-Style API Endpoints
**Pattern**: Edge Functions follow REST conventions
- GET: Retrieve data
- POST: Create new records
- PUT/PATCH: Update existing records
- DELETE: Remove records

#### Error Handling Pattern
```typescript
try {
  const result = await apiCall();
  return { data: result, error: null };
} catch (error) {
  console.error('Operation failed:', error);
  return { data: null, error: error.message };
}
```

### 3. State Management Patterns

#### Context + Hooks for Global State
**Pattern**: React Context for auth and theme
```typescript
// AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, session }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage
const { user, session } = useAuth();
```

#### React Query for Server State
**Pattern**: Cache and synchronize server data
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['conversations', tenantId],
  queryFn: () => conversationService.getConversations(tenantId)
});
```

#### Local State for Component State
**Pattern**: useState for component-specific state
```typescript
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
```

### 4. Authentication Pattern

#### JWT Token-Based Authentication
```
1. User submits credentials
2. Supabase Auth validates and returns JWT tokens
3. Tokens stored in localStorage via Supabase client
4. Tokens automatically included in API requests
5. Protected routes check authentication status
6. Automatic token refresh on expiration
```

**Implementation**: `src/contexts/AuthContext.tsx`

### 5. Data Fetching Patterns

#### Real-time Subscriptions
**Pattern**: WebSocket subscriptions for live updates
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('messages')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages' },
      (payload) => handleNewMessage(payload.new)
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

#### Optimistic Updates
**Pattern**: Update UI before server confirmation
```typescript
const handleSendMessage = async (content: string) => {
  // Immediately add message to UI
  setMessages(prev => [...prev, optimisticMessage]);
  
  try {
    // Send to server
    await conversationService.sendMessage(content);
  } catch (error) {
    // Rollback on error
    setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
  }
};
```

### 6. Security Patterns

#### Row Level Security (RLS)
**Pattern**: Database-level tenant isolation
```sql
CREATE POLICY "Users can view own conversations"
ON conversations
FOR SELECT
USING (tenant_id = get_user_tenant_id() AND user_id = auth.uid());
```

#### Protected Routes
**Pattern**: Route guards check authentication
```typescript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

#### Secure Credential Storage
**Pattern**: Encrypt sensitive data at rest
- API keys encrypted in database
- JWT tokens in httpOnly cookies (via Supabase)
- Sensitive environment variables not committed to repo

### 7. Error Handling Patterns

#### Error Boundaries
**Pattern**: Catch React component errors
```typescript
<ErrorBoundary>
  <ChatInterface />
</ErrorBoundary>
```

#### Toast Notifications
**Pattern**: User-friendly error messages
```typescript
const { toast } = useToast();

toast({
  variant: "destructive",
  title: "Error",
  description: "Failed to send message. Please try again."
});
```

### 8. Performance Patterns

#### Code Splitting
**Pattern**: Lazy load routes and heavy components
```typescript
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
```

#### React Query Caching
**Pattern**: Automatic caching and background refetching
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});
```

---

## Key Architectural Decisions

### Why Multi-Tenant Architecture?
- **Requirement**: Complete data isolation between organizations
- **Solution**: tenant_id foreign key + RLS policies on all tables
- **Benefit**: Security, scalability, single codebase for all tenants

### Why Edge Functions?
- **Requirement**: Secure AI provider integration with credentials
- **Solution**: Serverless functions with environment variable secrets
- **Benefit**: No client-side credential exposure, automatic scaling

### Why React Query?
- **Requirement**: Real-time data synchronization and caching
- **Solution**: Intelligent caching with automatic background refetching
- **Benefit**: Reduced API calls, improved UX, simplified state management

### Why TypeScript with Relaxed Mode?
- **Requirement**: Type safety without hindering rapid development
- **Solution**: TypeScript with noImplicitAny: false
- **Benefit**: Gradual type adoption, faster iteration

---

## References

- **Tech Spec**: Pages 1-50 (System Overview, Technology Stack)
- **ARCHITECTURE.md**: System architecture documentation
- **TECH_SPEC.md**: Technical specification overview
- **package.json**: Complete dependency manifest
- **src/integrations/supabase/types.ts**: Auto-generated database schema types
