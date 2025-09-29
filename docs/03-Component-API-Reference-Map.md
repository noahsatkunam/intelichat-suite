# Component & API Reference Map

## Document Purpose
Quick reference guide for components, API endpoints, and database schema with tech spec page references.

---

## A. Component Catalog

### Chat Components (`src/components/chat/`)

#### ChatInterface.tsx
**File Path**: `src/components/chat/ChatInterface.tsx`  
**Tech Spec Pages**: 13-14, 47-50  
**Lines of Code**: ~558 lines  
**Status**: ✅ Fully Implemented

**Purpose/Responsibility**:
- Main orchestrator for chat functionality
- Manages message state, conversation history, and real-time updates
- Handles user input, AI streaming responses, and attachment uploads
- Integrates with knowledge base and provides search capabilities

**Key Props/Interface**:
```typescript
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  reactions?: { emoji: string; users: string[] }[];
  replies?: Message[];
  replyTo?: string;
  status?: 'sending' | 'sent' | 'error';
  sources?: DocumentSource[];
  attachments?: File[];
}
```

**Key State Management**:
- `messages` - Array of all messages in current conversation
- `currentConversation` - Active conversation metadata
- `isTyping` - AI response generation indicator
- `uploadedFiles` - Attached files awaiting send
- `replyingTo` - Message being replied to
- `searchQuery` - Current search filter

**Key Dependencies**:
- `useAuth()` - Authentication context
- `useToastNotifications()` - User feedback
- `useKeyboardShortcuts()` - Keyboard navigation
- `conversationService` - API calls
- React Query for data fetching

**Related Components**:
- MessageList
- MessageInput
- MessageBubble
- TypingIndicator
- FileUpload
- MessageSearch
- KnowledgeBaseToggle
- RelatedDocuments

**Integration Points**:
- Supabase Edge Function: `ai-chat`
- Real-time subscriptions for new messages
- Knowledge base search overlay
- File upload to Supabase Storage

**CRITICAL NOTE**: This file is identified as monolithic (558 lines) and could benefit from decomposition into smaller, focused components.

---

#### MessageBubble.tsx
**File Path**: `src/components/chat/MessageBubble.tsx`  
**Purpose**: Individual message display with reactions and replies  
**Props**:
```typescript
interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
}
```

---

#### MessageInput.tsx
**File Path**: `src/components/chat/MessageInput.tsx`  
**Purpose**: Text input with attachment support and send functionality  
**Props**:
```typescript
interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  isLoading: boolean;
  placeholder?: string;
}
```

---

#### MessageList.tsx
**File Path**: `src/components/chat/MessageList.tsx`  
**Purpose**: Scrollable container for message history  
**Features**:
- Auto-scroll to bottom on new messages
- Virtual scrolling for performance
- Loading indicators
- Empty state handling

---

#### CodeBlock.tsx
**File Path**: `src/components/chat/CodeBlock.tsx`  
**Purpose**: Syntax-highlighted code rendering in messages  
**Dependencies**: `react-syntax-highlighter`

---

#### AttachmentPreview.tsx
**File Path**: `src/components/chat/AttachmentPreview.tsx`  
**Purpose**: Display preview of attached files before sending

---

#### FileUpload.tsx
**File Path**: `src/components/chat/FileUpload.tsx`  
**Purpose**: Drag-and-drop file upload interface  
**Max File Size**: 10MB per file

---

#### MessageSearch.tsx
**File Path**: `src/components/chat/MessageSearch.tsx`  
**Purpose**: Search through conversation history  
**Features**: Full-text search, filtering

---

#### TypingIndicator.tsx
**File Path**: `src/components/chat/TypingIndicator.tsx`  
**Purpose**: Visual indicator when AI is generating response

---

#### ChatHeader.tsx
**File Path**: `src/components/chat/ChatHeader.tsx`  
**Purpose**: Chat interface header with conversation info

---

#### ReplyPreview.tsx
**File Path**: `src/components/chat/ReplyPreview.tsx`  
**Purpose**: Show message being replied to

---

#### SourceCitation.tsx
**File Path**: `src/components/chat/SourceCitation.tsx`  
**Purpose**: Display document sources cited by AI

---

### Knowledge Base Components (`src/components/knowledge/`)

#### DocumentUpload.tsx
**File Path**: `src/components/knowledge/DocumentUpload.tsx`  
**Tech Spec Pages**: 13-14, 25-27  
**Purpose**: Document upload interface with drag-and-drop

**Supported Formats**: PDF, DOCX, TXT, MD (up to 10MB)

**Flow**:
1. User selects/drops file
2. Frontend validates file type and size
3. Upload to Supabase Storage bucket `documents`
4. Trigger processing pipeline
5. Generate vector embeddings
6. Store in database for RAG

**Related Components**:
- DocumentPreview
- KnowledgeBaseToggle

---

#### DocumentPreview.tsx
**File Path**: `src/components/knowledge/DocumentPreview.tsx`  
**Purpose**: Preview document content and metadata

---

#### KnowledgeBaseToggle.tsx
**File Path**: `src/components/knowledge/KnowledgeBaseToggle.tsx`  
**Purpose**: Toggle knowledge base integration in chat

---

#### KnowledgeSearchOverlay.tsx
**File Path**: `src/components/knowledge/KnowledgeSearchOverlay.tsx`  
**Purpose**: Search through knowledge base documents

---

#### RelatedDocuments.tsx
**File Path**: `src/components/knowledge/RelatedDocuments.tsx`  
**Purpose**: Show documents related to current conversation

---

### Authentication Components (`src/components/auth/`)

#### ProtectedRoute.tsx
**File Path**: `src/components/auth/ProtectedRoute.tsx`  
**Tech Spec Pages**: 14-15  
**Purpose**: Route guard for authenticated users

**Implementation**:
```typescript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};
```

---

### Layout Components (`src/components/layout/`)

#### AppLayout.tsx
**File Path**: `src/components/layout/AppLayout.tsx`  
**Purpose**: Main application layout wrapper  
**Features**:
- Responsive sidebar
- Header with user menu
- Main content area
- Footer

---

#### AppSidebar.tsx
**File Path**: `src/components/layout/AppSidebar.tsx`  
**Purpose**: Navigation sidebar with collapsible menu  
**Navigation Items**:
- Dashboard
- Chat Interface
- Chat History
- Knowledge Base
- Analytics
- Settings
- Admin Panel (role-based)

---

### Admin Components (`src/pages/admin/`)

#### AIProviders.tsx
**File Path**: `src/pages/admin/AIProviders.tsx`  
**Tech Spec Pages**: 16-17  
**Purpose**: Manage AI provider configurations

**Features**:
- Add/edit/delete providers
- Test connections
- View health status
- Configure credentials
- Set fallback providers

---

#### UserManagement.tsx
**File Path**: `src/pages/admin/UserManagement.tsx`  
**Tech Spec Pages**: 17-18  
**Purpose**: Manage tenant users

**Features**:
- View all users
- Edit user roles
- Deactivate users
- View user activity

---

#### TenantManagement.tsx
**File Path**: `src/pages/admin/TenantManagement.tsx`  
**Tech Spec Pages**: 15-16  
**Purpose**: Manage tenants (global admins only)

---

#### ChatbotManagement.tsx
**File Path**: `src/pages/admin/ChatbotManagement.tsx`  
**Tech Spec Pages**: 20-21  
**Purpose**: Configure chatbot personalities

---

#### SystemMonitoring.tsx
**File Path**: `src/pages/admin/SystemMonitoring.tsx`  
**Tech Spec Pages**: 19  
**Purpose**: Monitor system health and status

---

#### AuditLogs.tsx
**File Path**: `src/pages/admin/AuditLogs.tsx`  
**Tech Spec Pages**: 21-22  
**Purpose**: View audit logs and compliance reports

---

### Dashboard Components (`src/components/dashboard/`)

#### DashboardWidgets.tsx
**File Path**: `src/components/dashboard/DashboardWidgets.tsx`  
**Purpose**: Reusable dashboard widget components

---

#### ConversationOverview.tsx
**File Path**: `src/components/dashboard/ConversationOverview.tsx`  
**Purpose**: Summary of recent conversations

---

#### TaskManagement.tsx
**File Path**: `src/components/dashboard/TaskManagement.tsx`  
**Purpose**: Task tracking widget

---

### UI Components (`src/components/ui/`)

#### Core shadcn/ui Components
**File Path**: `src/components/ui/`  
**Count**: 60+ components  
**Source**: shadcn/ui library (Radix UI + Tailwind)

**Key Components**:
- `button.tsx` - Button with variants
- `input.tsx` - Text input
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `toast.tsx` - Toast notifications
- `table.tsx` - Data tables
- `form.tsx` - Form components
- `card.tsx` - Card containers
- `sidebar.tsx` - Sidebar component
- `sheet.tsx` - Side sheets
- `tabs.tsx` - Tab navigation
- `select.tsx` - Select dropdowns
- `calendar.tsx` - Date picker
- `checkbox.tsx` - Checkboxes
- `radio-group.tsx` - Radio buttons
- `switch.tsx` - Toggle switches
- `slider.tsx` - Range sliders
- `progress.tsx` - Progress bars
- `badge.tsx` - Status badges
- `alert.tsx` - Alert messages
- `skeleton.tsx` - Loading skeletons

#### Custom UI Components
- `loading-spinner.tsx` - Custom loading spinner
- `loading-skeleton.tsx` - Skeleton loaders
- `dark-veil.tsx` - Dark overlay
- `empty-state.tsx` - Empty state displays
- `error-boundary.tsx` - Error catching component
- `offline-indicator.tsx` - Offline status indicator
- `confirmation-modal.tsx` - Confirmation dialogs
- `data-export.tsx` - CSV export component
- `quick-actions.tsx` - Quick action menu
- `keyboard-shortcuts-help.tsx` - Keyboard shortcuts modal

---

### Tenant Components (`src/components/tenant/`)

#### TenantCreationWizard.tsx
**File Path**: `src/components/tenant/TenantCreationWizard.tsx`  
**Tech Spec Pages**: 15-16  
**Purpose**: Multi-step tenant creation workflow

**Steps** (in `src/components/tenant/steps/`):
1. `InitialConfiguration.tsx` - Basic setup
2. `GeneralInformation.tsx` - Tenant details
3. `OrganizationSetup.tsx` - Organization info
4. `AdminSetup.tsx` - Admin user setup
5. `TeamSetup.tsx` - Team configuration
6. `UserManagement.tsx` - User management
7. `BrandingCustomization.tsx` - Branding setup
8. `FinalReview.tsx` - Review and confirm

---

### Branding Components (`src/components/branding/`)

#### ZyriaLogo.tsx
**File Path**: `src/components/branding/ZyriaLogo.tsx`  
**Purpose**: Platform logo component

---

### AI Components (`src/components/ai/`)

#### ProviderLogo.tsx
**File Path**: `src/components/ai/ProviderLogo.tsx`  
**Purpose**: Display logos for AI providers

**Supported Providers**:
- OpenAI
- Anthropic
- Google (Gemini)
- Mistral
- Custom providers

---

### Theme Components (`src/components/theme/`)

#### ThemeProvider.tsx
**File Path**: `src/components/theme/ThemeProvider.tsx`  
**Purpose**: Provide theme context (light/dark mode)  
**Library**: `next-themes`

---

#### ThemeToggle.tsx
**File Path**: `src/components/theme/ThemeToggle.tsx`  
**Purpose**: Toggle button for theme switching

---

### Onboarding Components (`src/components/onboarding/`)

#### OnboardingTour.tsx
**File Path**: `src/components/onboarding/OnboardingTour.tsx`  
**Purpose**: Guided tour for new users

---

## B. API Endpoint Catalog

### Edge Functions (Supabase)

#### ai-chat
**Endpoint**: `POST /functions/v1/ai-chat`  
**Tech Spec Pages**: 13-14, 46-47  
**File**: `supabase/functions/ai-chat/index.ts`  
**Authentication**: Required (JWT token)

**Purpose**: Orchestrate AI chat completions with multi-provider support

**Request Schema**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  conversationId?: string;
  knowledgeBaseEnabled?: boolean;
  chatbotId?: string;
}
```

**Response Schema**:
```typescript
// Streaming response (SSE)
data: {
  choices: [{
    delta: {
      content: string;
    }
  }]
}
// Final message
data: [DONE]
```

**Flow**:
1. Receive message array
2. Check for active AI provider
3. Query knowledge base if enabled
4. Send to AI provider with context
5. Stream response back to client
6. Handle failover if provider fails
7. Save conversation to database

**Related Endpoints**: `ai-chat-test`, `ai-provider-health-check`

---

#### ai-chat-test
**Endpoint**: `POST /functions/v1/ai-chat-test`  
**File**: `supabase/functions/ai-chat-test/index.ts`  
**Authentication**: Required (Admin role)

**Purpose**: Test AI provider connections

**Request Schema**:
```typescript
{
  providerId: string;
  testMessage: string;
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  response?: string;
  error?: string;
  responseTime: number;
}
```

---

#### ai-provider-health-check
**Endpoint**: `POST /functions/v1/ai-provider-health-check`  
**Tech Spec Pages**: 19  
**File**: `supabase/functions/ai-provider-health-check/index.ts`  
**Authentication**: Required (Service role)

**Purpose**: Check health of AI providers

**Request Schema**:
```typescript
{
  providerId?: string; // Optional, checks all if omitted
}
```

**Response Schema**:
```typescript
{
  providerId: string;
  isHealthy: boolean;
  responseTime: number;
  lastChecked: string;
  error?: string;
}[]
```

---

#### ai-providers-daily-check
**Endpoint**: Scheduled (pg_cron)  
**File**: `supabase/functions/ai-providers-daily-check/index.ts`  
**Schedule**: Daily at midnight

**Purpose**: Automated daily health checks for all providers

**Trigger**: pg_cron scheduled job

---

#### send-invitation
**Endpoint**: `POST /functions/v1/send-invitation`  
**Tech Spec Pages**: 17-18  
**File**: `supabase/functions/send-invitation/index.ts`  
**Authentication**: Required (Admin/Moderator role)

**Purpose**: Send user invitation emails

**Request Schema**:
```typescript
{
  email: string;
  role: 'admin' | 'moderator' | 'user';
  tenantId: string;
  invitedBy: string;
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  invitationId: string;
  token: string;
  expiresAt: string;
}
```

**Flow**:
1. Validate admin/moderator role
2. Generate secure token (UUID)
3. Create invitation record in database
4. Send email via Resend API
5. Return invitation details

---

#### send-password-reset
**Endpoint**: `POST /functions/v1/send-password-reset`  
**File**: `supabase/functions/send-password-reset/index.ts`  
**Authentication**: Public

**Purpose**: Send password reset emails

**Request Schema**:
```typescript
{
  email: string;
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

### Database API (via Supabase Client)

#### Conversations API
**Base Path**: `supabase.from('conversations')`

**GET /conversations**
- Purpose: Fetch user's conversations
- RLS: Filtered by `user_id = auth.uid()` and `tenant_id`
- Returns: `Conversation[]`

**POST /conversations**
- Purpose: Create new conversation
- RLS: `user_id` must match authenticated user
- Payload: `{ title: string, user_id: uuid, tenant_id: uuid }`

**PUT /conversations/:id**
- Purpose: Update conversation title
- RLS: Must own conversation

**DELETE /conversations/:id**
- Purpose: Delete conversation
- RLS: Must own conversation

---

#### Messages API
**Base Path**: `supabase.from('messages')`

**GET /messages?conversation_id=:id**
- Purpose: Fetch messages for conversation
- RLS: Must be conversation owner
- Returns: `Message[]`

**POST /messages**
- Purpose: Create new message
- RLS: Must own conversation
- Payload: `{ conversation_id: uuid, content: string, role: string, user_id: uuid }`

---

#### Documents API
**Base Path**: `supabase.from('documents')`

**GET /documents**
- Purpose: Fetch tenant documents
- RLS: Filtered by `tenant_id`
- Returns: `Document[]`

**POST /documents**
- Purpose: Create document record
- RLS: `tenant_id` must match user's tenant
- Payload: `{ filename: string, file_url: string, uploaded_by: uuid, tenant_id: uuid }`

**PUT /documents/:id**
- Purpose: Update document
- RLS: Must be uploader

**DELETE /documents/:id**
- Purpose: Delete document
- RLS: Must be uploader

---

#### Profiles API
**Base Path**: `supabase.from('profiles')`

**GET /profiles**
- Purpose: Fetch user profiles
- RLS: Can view own profile or profiles in same tenant (for admins/moderators)
- Returns: `Profile[]`

**PUT /profiles/:id**
- Purpose: Update profile
- RLS: Can only update own profile
- Payload: `{ name?: string, avatar_url?: string }`

---

#### AI Providers API
**Base Path**: `supabase.from('ai_providers')`

**GET /ai_providers**
- Purpose: Fetch AI providers
- RLS: Filtered by tenant or public providers
- Function: `get_safe_ai_providers()` (security definer)
- Returns: `AIProvider[]`

**POST /ai_providers**
- Purpose: Create AI provider
- RLS: Requires admin/tenant_admin role
- Payload: `{ name: string, type: string, api_key_encrypted: string, tenant_id: uuid }`

**PUT /ai_providers/:id**
- Purpose: Update provider
- RLS: Requires admin/tenant_admin role

**DELETE /ai_providers/:id**
- Purpose: Delete provider
- RLS: Requires admin/tenant_admin role

---

## C. Database Schema Summary

### Core Tables

#### profiles
**Purpose**: Extended user profiles  
**RLS**: Yes - users can view own profile, admins can view all

**Key Columns**:
- `id` (uuid, PK) - Matches auth.users.id
- `email` (text, required)
- `name` (text)
- `avatar_url` (text)
- `role` (app_role enum) - global_admin, tenant_admin, moderator, user
- `tenant_id` (uuid, FK to tenants)
- `invited_by` (uuid)
- `invitation_accepted_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign key to `tenants` table
- One-to-many with `conversations`
- One-to-many with `messages`
- One-to-many with `documents`

**Indexes**: `id`, `email`, `tenant_id`

---

#### tenants
**Purpose**: Multi-tenant organization data  
**RLS**: Yes - users can view own tenant, admins can view all

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, required)
- `subdomain` (text, unique, required)
- `branding_config` (jsonb) - Logo, colors, styling
- `settings` (jsonb) - Tenant-specific settings
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- One-to-many with all major tables via `tenant_id`

---

#### conversations
**Purpose**: Chat conversation metadata  
**RLS**: Yes - users can only view own conversations

**Key Columns**:
- `id` (uuid, PK)
- `title` (text, required)
- `user_id` (uuid, FK, required)
- `tenant_id` (uuid, FK, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign key to `profiles` (user_id)
- Foreign key to `tenants`
- One-to-many with `messages`

**Indexes**: `user_id`, `tenant_id`, `created_at`

---

#### messages
**Purpose**: Individual chat messages  
**RLS**: Yes - users can only view messages in their conversations

**Key Columns**:
- `id` (uuid, PK)
- `conversation_id` (uuid, FK, required)
- `user_id` (uuid, FK, required)
- `role` (text, required) - 'user' or 'assistant'
- `content` (text, required)
- `timestamp` (timestamp)
- `metadata` (jsonb) - Sources, attachments, etc.

**Relationships**:
- Foreign key to `conversations`
- Foreign key to `profiles` (user_id)

**Indexes**: `conversation_id`, `timestamp`

---

#### documents
**Purpose**: Knowledge base documents  
**RLS**: Yes - filtered by tenant_id

**Key Columns**:
- `id` (uuid, PK)
- `filename` (text, required)
- `file_url` (text) - Supabase Storage URL
- `content` (text) - Extracted text
- `status` (text) - pending, processing, completed, failed
- `uploaded_by` (uuid, FK)
- `tenant_id` (uuid, FK, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign key to `tenants`
- Foreign key to `profiles` (uploaded_by)

**Indexes**: `tenant_id`, `status`, `created_at`

---

#### ai_providers
**Purpose**: AI provider configurations  
**RLS**: Yes - filtered by tenant or public

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, required)
- `type` (text, required) - openai, anthropic, google, etc.
- `base_url` (text)
- `api_key_encrypted` (text) - Encrypted API key
- `custom_headers` (jsonb)
- `is_active` (boolean, default true)
- `is_healthy` (boolean, default true)
- `last_health_check` (timestamp)
- `tenant_id` (uuid, FK) - NULL for global providers
- `created_by` (uuid, FK)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign key to `tenants` (nullable for global providers)
- One-to-many with `chatbots`

---

#### chatbots
**Purpose**: Chatbot personality configurations  
**RLS**: Yes - filtered by tenant_id

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, required)
- `description` (text)
- `system_prompt` (text) - Custom personality
- `model_name` (text)
- `temperature` (numeric, default 0.7)
- `max_tokens` (integer, default 1000)
- `top_p` (numeric, default 1.0)
- `frequency_penalty` (numeric, default 0.0)
- `presence_penalty` (numeric, default 0.0)
- `primary_ai_provider_id` (uuid, FK)
- `fallback_ai_provider_id` (uuid, FK)
- `is_active` (boolean, default true)
- `tenant_id` (uuid, FK, required)
- `created_by` (uuid, FK)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign keys to `ai_providers` (primary and fallback)
- Foreign key to `tenants`

---

#### user_invitations
**Purpose**: User invitation system  
**RLS**: Yes - admins and moderators can manage

**Key Columns**:
- `id` (uuid, PK)
- `email` (text, required)
- `token` (text, unique, required)
- `role` (app_role enum, required)
- `status` (text, default 'pending') - pending, accepted, expired
- `tenant_id` (uuid, FK, required)
- `invited_by` (uuid, FK, required)
- `expires_at` (timestamp, default now() + 7 days)
- `accepted_at` (timestamp)
- `metadata` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign key to `tenants`
- Foreign key to `profiles` (invited_by)

**Indexes**: `token`, `email`, `tenant_id`, `status`

---

#### analytics
**Purpose**: Event tracking and metrics  
**RLS**: Yes - filtered by tenant_id

**Key Columns**:
- `id` (uuid, PK)
- `tenant_id` (uuid, FK, required)
- `metric_type` (text, required) - conversation_created, message_sent, etc.
- `value` (numeric, required)
- `metadata` (jsonb)
- `timestamp` (timestamp, default now())

**Relationships**:
- Foreign key to `tenants`

**Indexes**: `tenant_id`, `metric_type`, `timestamp`

---

#### ai_provider_audit_log
**Purpose**: Audit trail for provider changes  
**RLS**: Yes - admins only

**Key Columns**:
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `provider_id` (uuid, FK)
- `action` (text, required)
- `details` (jsonb)
- `timestamp` (timestamp, default now())

**Relationships**:
- Foreign key to `profiles` (user_id)
- Foreign key to `ai_providers`

---

#### chatbot_usage
**Purpose**: Chatbot usage tracking  
**RLS**: Yes - users can view own usage

**Key Columns**:
- `id` (uuid, PK)
- `chatbot_id` (uuid, FK)
- `user_id` (uuid, FK)
- `ai_provider_id` (uuid, FK)
- `model_used` (text)
- `tokens_used` (integer, default 0)
- `response_time_ms` (integer)
- `success` (boolean, default true)
- `error_message` (text)
- `timestamp` (timestamp, default now())

**Relationships**:
- Foreign keys to `chatbots`, `profiles`, `ai_providers`

---

#### provider_models
**Purpose**: Available models for AI providers  
**RLS**: Yes - viewable by authenticated users

**Key Columns**:
- `id` (uuid, PK)
- `provider_type` (text, required) - openai, anthropic, etc.
- `model_name` (text, required)
- `display_name` (text, required)
- `description` (text)
- `max_context_length` (integer)
- `supports_vision` (boolean, default false)
- `supports_function_calling` (boolean, default false)
- `cost_per_1k_input_tokens` (numeric)
- `cost_per_1k_output_tokens` (numeric)
- `is_deprecated` (boolean, default false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

#### provider_usage_stats
**Purpose**: Provider usage statistics  
**RLS**: Yes - viewable by tenant users

**Key Columns**:
- `id` (uuid, PK)
- `provider_id` (uuid, FK)
- `date` (date, default CURRENT_DATE)
- `total_requests` (integer, default 0)
- `successful_requests` (integer, default 0)
- `failed_requests` (integer, default 0)
- `total_tokens` (integer, default 0)
- `total_cost` (numeric, default 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Foreign key to `ai_providers`

---

### Database Functions

#### get_user_tenant_id()
**Returns**: `uuid | null`  
**Purpose**: Get current user's tenant ID  
**Type**: Security definer function (stable)  
**Usage**: Used in RLS policies for tenant isolation

**Logic**:
```sql
SELECT CASE 
  WHEN role = 'global_admin' THEN NULL
  ELSE tenant_id
END FROM profiles WHERE id = auth.uid();
```

---

#### has_role(required_role app_role)
**Returns**: `boolean`  
**Purpose**: Check if current user has specified role  
**Type**: Security definer function (stable)  
**Usage**: Used in RLS policies for role-based access

**Logic**:
```sql
SELECT EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = required_role
);
```

---

#### is_global_admin()
**Returns**: `boolean`  
**Purpose**: Check if current user is global admin  
**Type**: Security definer function (stable)  
**Usage**: Used in RLS policies for admin access

---

#### get_safe_ai_providers()
**Returns**: Table of AI providers  
**Purpose**: Return providers visible to current user  
**Type**: Security definer function (stable)  
**Usage**: Safe provider listing with tenant filtering

---

#### get_safe_profiles()
**Returns**: Table of user profiles  
**Purpose**: Return profiles visible to current user  
**Type**: Security definer function (stable)

---

#### get_public_profiles()
**Returns**: Table of user profiles (excluding own)  
**Purpose**: Return other users' profiles in same tenant  
**Type**: Security definer function (stable)

---

#### handle_new_user()
**Returns**: Trigger function  
**Purpose**: Auto-create profile on user signup  
**Type**: Trigger on auth.users table

**Logic**:
1. Check if email is global admin
2. If yes, create global admin profile
3. If no, check for pending invitation
4. Create profile based on invitation or default role

---

#### update_updated_at_column()
**Returns**: Trigger function  
**Purpose**: Auto-update `updated_at` timestamp  
**Type**: Trigger on multiple tables

---

#### audit_profile_changes()
**Returns**: Trigger function  
**Purpose**: Log profile updates to audit log  
**Type**: Trigger on profiles table

---

### Storage Buckets

#### documents
**Purpose**: Store uploaded knowledge base documents  
**Public**: No (private bucket)  
**RLS**: Yes - tenant-isolated access  
**Max File Size**: 10MB (enforced by application)

**Policies**:
- Users can upload to their tenant folder
- Users can view documents in their tenant
- Users can update their own documents
- Users can delete their own documents

**Folder Structure**:
```
documents/
  ├── {tenant_id}/
  │   ├── {document_id}.pdf
  │   ├── {document_id}.docx
  │   └── ...
```

---

## References

- **Tech Spec**: Complete spec PDF (pages 1-50+)
- **Component Files**: `src/components/`, `src/pages/`
- **API Files**: `supabase/functions/`
- **Database Schema**: `supabase/migrations/`
- **Type Definitions**: `src/types/api.ts`, `src/integrations/supabase/types.ts`
