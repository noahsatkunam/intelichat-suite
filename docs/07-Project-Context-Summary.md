# Project Context Summary - Quick Reference

## What Is This Project?

**Zyria Enterprise AI Platform** - Multi-tenant SaaS for AI-powered chat with knowledge base integration.

## Core Purpose

Enable organizations to deploy branded AI assistants with document knowledge capabilities, supporting multiple AI providers with automatic failover.

## Tech Stack (Key Technologies)

**Frontend**: React 18.3.1 + TypeScript 5.8.3 + Vite 5.4.19 + Tailwind CSS 3.4.17  
**Backend**: Supabase (PostgreSQL 15+ + Edge Functions)  
**UI Library**: Radix UI + shadcn/ui  
**State**: React Query 5.83.0 + React Context  
**AI Providers**: OpenAI, Anthropic, Google, Mistral, Meta, xAI, Ollama

## Architecture Type

**Multi-tenant SaaS** with complete data isolation via Row Level Security (RLS)

## Current State

✅ **Fully Functional** - All 12 core features implemented  
⚠️ **Critical Gaps**: No automated tests, limited security features, incomplete accessibility

## Top 10 Features

1. **AI Chat** - Multi-provider chat with streaming responses
2. **Authentication** - JWT-based with role-based access control
3. **Multi-Tenancy** - Complete data isolation per organization
4. **Knowledge Base** - Document upload with RAG integration
5. **AI Providers** - Centralized provider management with health monitoring
6. **Analytics** - Real-time usage metrics and reporting
7. **User Invitations** - Token-based onboarding system
8. **Chatbot Config** - Customizable AI personalities
9. **Conversation History** - Persistent chat with search
10. **Audit Logging** - Comprehensive compliance tracking

## Key File Locations

- **Main Chat**: `src/components/chat/ChatInterface.tsx` (558 lines)
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **API Services**: `src/services/`
- **Edge Functions**: `supabase/functions/`
- **Database Migrations**: `supabase/migrations/` (24+ files)
- **UI Components**: `src/components/ui/` (60+ shadcn components)

## External Services

- **Supabase**: Database, auth, storage, edge functions
- **AI APIs**: OpenAI, Anthropic, Google, Mistral, Meta, xAI, Ollama
- **Email**: Resend API for transactional emails
- **Fonts**: Google Fonts (Inter, Manrope, Lexend)

## Development Approach

- **Rapid Iteration**: TypeScript relaxed mode for speed
- **Component-Based**: Functional components with hooks
- **Service Layer**: Centralized API calls
- **Real-time**: WebSocket subscriptions for live updates
- **Security-First**: RLS on all tables, JWT auth

## Common Tasks

1. **Add UI Component**: Use shadcn/ui or create in `src/components/`
2. **New API Call**: Add to appropriate service in `src/services/`
3. **Database Change**: Create migration in `supabase/migrations/`
4. **New Feature**: Follow existing patterns in similar features
5. **Fix Bug**: Check console logs, network requests, RLS policies

## Important Notes

- **Global Admins**: noah.satkunam@northstar-tg.com, ken.satkunam@northstar-tg.com
- **Tenant Isolation**: CRITICAL - all data must have tenant_id
- **RLS Required**: Every table must have RLS policies
- **No Tests**: Critical gap - manual testing only
- **Monolithic Components**: ChatInterface.tsx needs refactoring (558 lines)

## Project Health Score

- **Security**: 7/10 (RLS strong, but missing rate limiting, CSRF protection)
- **Architecture**: 8/10 (Clean separation, but some monolithic components)
- **Performance**: 7/10 (Good for current scale, optimization needed)
- **Testing**: 2/10 (No automated tests - critical gap)
- **Documentation**: 8/10 (Good technical docs, needs API docs)

## Quick Stats

- **Total Files**: 195+ TypeScript files
- **Lines of Code**: ~38,000
- **Edge Functions**: 6 Deno-based serverless functions
- **Database Tables**: 12 core tables
- **UI Components**: 60+ reusable components
- **Migrations**: 24+ database migrations

## Getting Started (5-Minute Brief)

1. **What it does**: Multi-tenant AI chat platform with document knowledge
2. **How it works**: React frontend → Supabase backend → Multiple AI providers
3. **Key feature**: Complete tenant data isolation via PostgreSQL RLS
4. **Main files**: ChatInterface.tsx (chat), AuthContext.tsx (auth), Edge Functions (AI)
5. **Critical pattern**: All data access must respect tenant_id for security

## References

- **Full Architecture**: docs/01-Platform-Architecture-Overview.md
- **All Features**: docs/02-Complete-Feature-Inventory.md
- **Components & APIs**: docs/03-Component-API-Reference-Map.md
- **Code Patterns**: docs/04-Code-Patterns-Examples.md
- **Tech Spec**: 309-page PDF (covers everything in detail)
