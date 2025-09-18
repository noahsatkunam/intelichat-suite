-- Update RLS policies for ai_providers to handle the new hierarchy
DROP POLICY IF EXISTS "Admins can manage AI providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Only admins can view AI providers" ON public.ai_providers;

-- Global admins can manage all AI providers
CREATE POLICY "Global admins can manage all AI providers" 
ON public.ai_providers FOR ALL 
USING (is_global_admin());

-- Tenant admins can manage AI providers for their tenant or global ones
CREATE POLICY "Tenant admins can manage AI providers" 
ON public.ai_providers FOR ALL 
USING (
    has_role('tenant_admin'::app_role) 
    AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
);