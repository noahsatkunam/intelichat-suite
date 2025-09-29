# Integration & Dependency Map

## Critical Integration Points

### 1. Authentication → All Features
- **Connection**: JWT tokens in all API requests
- **Impact**: Breaking auth breaks entire platform
- **Safe Changes**: UI only, not token logic

### 2. Multi-Tenant → All Data Access
- **Connection**: tenant_id in all queries
- **Impact**: Changes affect data isolation
- **Safe Changes**: Branding only, not RLS policies

### 3. Chat → AI Providers
- **Connection**: Edge function orchestration
- **Impact**: Provider changes affect chat
- **Safe Changes**: UI updates, not provider logic

### 4. Knowledge Base → Chat
- **Connection**: RAG integration via edge function
- **Impact**: Document changes affect AI responses
- **Safe Changes**: Upload UI, not embedding logic

## Safe vs. Risky Changes

### ✅ Safe to Modify
- Component UI and styling
- Form validation messages
- Toast notifications
- Loading states
- Empty states
- Button text and icons

### ⚠️ Requires Careful Changes
- API service functions
- Database queries
- RLS policies
- Authentication flows
- Edge function logic

### ❌ Never Change Without Testing
- Supabase client configuration
- JWT token handling
- RLS policy definitions
- Database migrations
- Multi-tenant isolation logic

## Common Integration Mistakes

1. **Breaking RLS**: Removing tenant_id from queries
2. **Auth Loops**: Calling auth checks inside auth context
3. **Missing Await**: Not awaiting async Supabase calls
4. **Stale Data**: Not invalidating React Query cache
5. **Token Exposure**: Logging sensitive auth data

## References
- **Tech Spec**: Pages 28-31 (Integration Points and Dependencies)
