-- Add is_global flag to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false;

-- Set Northstar Technology Group as the global tenant
UPDATE public.tenants 
SET is_global = true 
WHERE id = 'e86569fd-0789-4819-9904-00250da53159';

-- Create a function to get the global tenant ID
CREATE OR REPLACE FUNCTION public.get_global_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.tenants WHERE is_global = true LIMIT 1;
$$;

-- Create a function to get tenant ID for a user (returns global tenant for global admins)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id_or_global()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'global_admin' 
    THEN (SELECT id FROM public.tenants WHERE is_global = true LIMIT 1)
    ELSE (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  END;
$$;