-- Fix tenants table RLS policies to use correct roles

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

-- Create updated policies with correct role checks
CREATE POLICY "Global admins can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (is_global_admin());

CREATE POLICY "Tenant admins can manage tenants" 
ON public.tenants 
FOR ALL 
USING (has_role('tenant_admin'::app_role) OR has_role('moderator'::app_role));

CREATE POLICY "Users can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (id = get_user_tenant_id());