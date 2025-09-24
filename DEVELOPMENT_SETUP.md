# Development Environment Setup Guide

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher (recommended: 20.x)
- **Package Manager**: npm (comes with Node.js) or yarn
- **Git**: For version control
- **Code Editor**: VS Code recommended with these extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

### Optional Tools
- **Supabase CLI**: For local database development
- **Docker**: For containerized development (if preferred)

## Initial Setup

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd zyria-platform

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Environment Configuration
The project uses Supabase for backend services. The configuration is already set up in:
- `src/integrations/supabase/client.ts` - Contains the Supabase client configuration
- Project ID: `onvnvlnxmilotkxkfddu`

No additional environment variables are required for basic development.

### 3. Start Development Server
```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:8080`

## Project Structure Overview

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat interface components
│   ├── dashboard/      # Dashboard widgets
│   ├── knowledge/      # Knowledge base components
│   ├── layout/         # Layout components
│   ├── tenant/         # Multi-tenant setup
│   └── theme/          # Theme management
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   └── admin/          # Admin panel pages
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── integrations/       # External service integrations
└── lib/                # Utility functions
```

## Key Files to Understand

### Configuration Files
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

### Core Application Files
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root component with routing
- `src/index.css` - Global styles and design system
- `src/contexts/AuthContext.tsx` - Authentication context

### Important Components
- `src/components/layout/AppLayout.tsx` - Main application layout
- `src/components/layout/AppSidebar.tsx` - Navigation sidebar
- `src/pages/Index.tsx` - Main chat interface

## Development Workflow

### Running the Application
```bash
# Development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Code Quality Tools
```bash
# Run ESLint
npm run lint

# Format code with Prettier (if configured)
npm run format
```

## Database Development

### Using Supabase Dashboard
1. Visit [Supabase Dashboard](https://supabase.com/dashboard/project/onvnvlnxmilotkxkfddu)
2. Use the SQL Editor for database queries
3. Monitor real-time database activity
4. View and manage Edge Functions

### Key Database Tables
- `profiles` - Extended user profiles
- `tenants` - Multi-tenant organization data
- `conversations` - Chat conversations
- `messages` - Individual chat messages
- `documents` - Knowledge base documents
- `user_invitations` - User invitation system

## Common Development Tasks

### Adding New Components
1. Create component in appropriate `src/components/` subdirectory
2. Follow the existing naming convention (PascalCase)
3. Use TypeScript interfaces for props
4. Export from component index if applicable

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Wrap with `ProtectedRoute` if authentication required
4. Include in `AppLayout` for sidebar navigation

### Adding New API Endpoints
1. Create or modify Edge Functions in `supabase/functions/`
2. Update API service in `src/services/`
3. Add TypeScript types in `src/types/api.ts`
4. Update React Query hooks if needed

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the design system defined in `src/index.css`
- Use semantic color tokens (e.g., `text-foreground`, `bg-background`)
- Avoid hard-coded colors - use CSS custom properties

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 8080 (macOS/Linux)
lsof -ti:8080 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

**TypeScript errors:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

**Build failures:**
```bash
# Clear all caches and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

**Supabase connection issues:**
- Check network connectivity
- Verify Supabase project status
- Check browser console for detailed errors

### Development Tools

**React Developer Tools:**
- Install browser extension for component debugging
- Useful for inspecting component state and props

**Supabase Dashboard:**
- Monitor database queries and performance
- View Edge Function logs
- Test API endpoints

## Testing Guidelines

### Manual Testing Checklist
- [ ] Authentication flow (login/logout)
- [ ] Theme switching (dark/light mode)
- [ ] Responsive design on different screen sizes
- [ ] Chat interface functionality
- [ ] Navigation between pages
- [ ] Error handling scenarios

### Browser Compatibility
- Chrome/Chromium (primary development browser)
- Firefox
- Safari (macOS)
- Edge

## Performance Tips

### Development Performance
- Use React Developer Tools Profiler
- Monitor bundle size with `npm run build`
- Check for unnecessary re-renders
- Optimize images and assets

### Production Considerations
- Enable production optimizations in build
- Monitor Core Web Vitals
- Test on slower network connections
- Verify mobile performance

## Getting Help

### Resources
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### Common Commands Reference
```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript checking

# Package Management
npm install <package>      # Add dependency
npm uninstall <package>    # Remove dependency
npm update                 # Update dependencies
```

---
*Development setup guide - Last updated: 2025-01-21*