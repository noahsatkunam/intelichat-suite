# Zyria Enterprise AI Platform - Technical Specification

## Project Overview
A comprehensive multi-tenant enterprise AI platform built with React, TypeScript, and Supabase. The platform provides AI-powered chat interfaces, knowledge base management, user administration, and analytics capabilities.

## Tech Stack

### Frontend
- **Framework**: React 18.3.1 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives + custom shadcn/ui components
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM v6.30.1
- **Theme**: next-themes with custom dark/light mode support

### Backend & Services
- **Backend**: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- **Authentication**: Supabase Auth with custom user profiles
- **Database**: PostgreSQL with Row Level Security (RLS)
- **API**: RESTful APIs via Supabase + custom Edge Functions
- **File Storage**: Supabase Storage

### Key Dependencies
- `@supabase/supabase-js`: ^2.57.4
- `@tanstack/react-query`: ^5.83.0
- `react-hook-form`: ^7.61.1
- `zod`: ^3.25.76
- `lucide-react`: ^0.462.0
- `sonner`: ^1.7.4 (toast notifications)
- `recharts`: ^2.15.4 (analytics charts)

## Architecture Overview

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── chat/            # Chat interface components
│   ├── dashboard/       # Dashboard widgets
│   ├── knowledge/       # Knowledge base components
│   ├── layout/          # Layout components (AppLayout, AppSidebar)
│   ├── tenant/          # Multi-tenant setup components
│   ├── theme/           # Theme provider and toggle
│   └── ui/              # Base UI components (shadcn/ui)
├── contexts/            # React contexts (AuthContext, ThemeProvider)
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   └── admin/           # Admin-specific pages
├── services/            # API service layer
├── types/               # TypeScript type definitions
└── integrations/        # External service integrations
    └── supabase/        # Supabase client and types
```

### Key Features
1. **Multi-tenant Architecture**: Tenant-based isolation and management
2. **AI Chat Interface**: Multiple AI provider support with streaming
3. **Knowledge Base**: Document upload, search, and RAG capabilities
4. **User Management**: Role-based access control, invitations
5. **Analytics Dashboard**: Usage analytics and reporting
6. **Admin Panel**: Comprehensive system administration
7. **Real-time Features**: Live chat, notifications
8. **Responsive Design**: Mobile-first responsive UI

## Database Schema

### Core Tables
- `profiles`: Extended user profiles
- `tenants`: Multi-tenant organization data
- `conversations`: Chat conversations
- `messages`: Individual chat messages
- `documents`: Knowledge base documents
- `user_invitations`: User invitation system
- `analytics_events`: Event tracking

### Authentication
- Uses Supabase Auth with custom profile extension
- Row Level Security (RLS) policies for data isolation
- Role-based permissions (admin, user, etc.)

## Current State & Issues

### ✅ Working Features
- Authentication system with user profiles
- Multi-tenant setup and management
- Chat interface with AI integration
- Knowledge base document management
- Admin panel with user management
- Responsive design system
- Theme switching (dark/light)

### ⚠️ Areas Requiring Attention
1. **Security**: RLS policies need comprehensive review
2. **Performance**: Large component files could be optimized
3. **Error Handling**: Need comprehensive error boundaries
4. **Testing**: No test suite currently implemented
5. **Documentation**: API documentation incomplete

### 🔧 Technical Debt
- Some components are monolithic and could be split
- API service layer could be more modular
- Type definitions could be more strict
- Missing input validation in some forms

## Development Environment

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or yarn package manager
- Supabase CLI (for local development)

### Environment Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access at: `http://localhost:8080`

### Supabase Configuration
- Project ID: `onvnvlnxmilotkxkfddu`
- Edge Functions: 6 functions deployed
- Database: PostgreSQL with RLS enabled
- Storage: Configured for file uploads

## Deployment
- Build command: `npm run build`
- Output directory: `dist/`
- Deployment target: Static hosting (Vercel, Netlify, etc.)

## Performance Considerations
- Lazy loading implemented for routes
- Image optimization needed
- Bundle size optimization opportunities
- Database query optimization required

## Security Considerations
- RLS policies implemented but need audit
- Input validation required for all forms
- XSS protection via React defaults
- CSRF protection needed for sensitive operations
- Rate limiting not implemented

## Future Roadmap
1. Implement comprehensive testing suite
2. Add real-time collaboration features
3. Enhance AI provider integrations
4. Implement advanced analytics
5. Add mobile app support
6. Improve accessibility compliance

---
*Last updated: 2025-01-21*