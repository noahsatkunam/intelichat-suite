-- Add new enum values for app_role
ALTER TYPE public.app_role ADD VALUE 'global_admin';
ALTER TYPE public.app_role ADD VALUE 'tenant_admin';