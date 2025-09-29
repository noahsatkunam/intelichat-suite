# Code Patterns & Examples

## Document Purpose
Reference guide for common coding patterns used throughout the Zyria platform with real examples from the codebase.

---

## 1. Component Creation Pattern

**Pattern Name**: Functional Component with TypeScript
**Tech Spec Pages**: 35-37
**When to Use**: All new React components

```typescript
// Pattern
import React from 'react';

interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction?: () => void;
}

export const MyComponent = ({ prop1, prop2, onAction }: ComponentProps) => {
  const [state, setState] = React.useState<string>('');
  
  return (
    <div className="component-wrapper">
      {/* Component JSX */}
    </div>
  );
};
```

**Key Points**:
- Use functional components with hooks
- Define TypeScript interfaces for props
- Export as named export
- Use semantic HTML and Tailwind classes

---

## 2. API Service Pattern

**Pattern Name**: Service Layer with Error Handling
**Tech Spec Pages**: 32-34
**When to Use**: All API interactions

```typescript
// src/services/exampleService.ts
import { supabase } from '@/integrations/supabase/client';

export const exampleService = {
  async getData(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return { data: null, error };
    }
  }
};
```

---

## 3. Authentication Check Pattern

**Pattern Name**: Protected Route with Loading State
**Tech Spec Pages**: 14-15
**When to Use**: Routes requiring authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};
```

---

## 4. Form Handling Pattern

**Pattern Name**: React Hook Form with Zod Validation
**Tech Spec Pages**: 38
**When to Use**: All forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', name: '' }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle submission
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
};
```

---

## 5. Real-time Subscription Pattern

**Pattern Name**: Supabase Real-time Channel
**When to Use**: Live data updates

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

---

## 6. Toast Notification Pattern

**Pattern Name**: User Feedback with Sonner
**When to Use**: Success/error feedback

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success",
  description: "Operation completed successfully",
});

// Error variant
toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong",
});
```

---

## References
- **Complete Patterns**: See actual component files in `src/components/`
- **Tech Spec**: Pages 35-46 (Technology Stack and Patterns)
