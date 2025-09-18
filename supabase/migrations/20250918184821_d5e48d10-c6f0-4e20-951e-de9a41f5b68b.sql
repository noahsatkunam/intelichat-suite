-- Fix AI providers security issue by restricting access to sensitive data
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view active AI providers in their tenant" ON public.ai_providers;

-- Create a more restrictive policy that only allows users to see basic info
-- Regular users can only see name, type, and is_active status - no sensitive config or API keys
CREATE POLICY "Users can view basic AI provider info in their tenant" 
ON public.ai_providers 
FOR SELECT 
USING (
  (is_active = true) 
  AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  AND (
    -- Only return basic columns for non-admin users
    CASE 
      WHEN has_role('admin'::app_role) THEN true
      ELSE false  -- This will be handled by application layer to filter sensitive columns
    END = true
  )
);

-- Create a function to get safe AI provider info for regular users
CREATE OR REPLACE FUNCTION public.get_safe_ai_providers()
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  is_active boolean,
  tenant_id uuid
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ai_providers.id,
    ai_providers.name,
    ai_providers.type,
    ai_providers.is_active,
    ai_providers.tenant_id
  FROM public.ai_providers 
  WHERE (is_active = true) 
    AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL);
$$;

-- Update the policy to be more restrictive - only admins can access full data
DROP POLICY IF EXISTS "Users can view basic AI provider info in their tenant" ON public.ai_providers;

CREATE POLICY "Only admins can view AI providers" 
ON public.ai_providers 
FOR SELECT 
USING (has_role('admin'::app_role));

-- Grant execute permission on the safe function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_ai_providers() TO authenticated;