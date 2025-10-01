-- Step 2: Drop all functions that depend on app_role
DROP FUNCTION IF EXISTS public.get_safe_profiles();
DROP FUNCTION IF EXISTS public.get_public_profiles();

-- Step 3: Remove defaults before dropping enum
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.user_invitations ALTER COLUMN role DROP DEFAULT;

-- Step 4: Convert columns and recreate enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE text;
ALTER TABLE public.user_invitations ALTER COLUMN role TYPE text;

DROP TYPE IF EXISTS public.app_role CASCADE;

CREATE TYPE public.app_role AS ENUM ('global_admin', 'tenant_admin', 'user');

ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE app_role USING role::app_role,
  ALTER COLUMN role SET DEFAULT 'user'::app_role;

ALTER TABLE public.user_invitations 
  ALTER COLUMN role TYPE app_role USING role::app_role,
  ALTER COLUMN role SET DEFAULT 'user'::app_role;

-- Step 5: Recreate all functions with new enum
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'global_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_safe_profiles()
RETURNS TABLE(id uuid, name text, avatar_url text, role app_role, tenant_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.role,
    p.tenant_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.tenant_id = get_user_tenant_id();
$$;

CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE(id uuid, name text, avatar_url text, role app_role, tenant_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.role,
    p.tenant_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.tenant_id = get_user_tenant_id()
    AND p.id != auth.uid();
$$;