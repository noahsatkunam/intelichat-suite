-- Fix email address exposure in profiles table
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;

-- Create a more secure policy that excludes email addresses for regular users
CREATE POLICY "Users can view basic profiles in their tenant" 
ON public.profiles 
FOR SELECT 
USING (
  tenant_id = get_user_tenant_id() 
  AND (
    -- Users can always see their own full profile
    id = auth.uid() 
    OR 
    -- Admins can see all profiles in their tenant
    has_role('admin'::app_role)
    OR
    -- Moderators can see all profiles in their tenant  
    has_role('moderator'::app_role)
  )
);

-- Create a function to get safe profile data without emails for regular users
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
RETURNS TABLE(
  id uuid,
  name text,
  avatar_url text,
  role app_role,
  tenant_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_profiles() TO authenticated;

-- Fix chatbot usage tracking security
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert usage records" ON public.chatbot_usage;

-- Create a more restrictive policy that only allows service role inserts
CREATE POLICY "Only service role can insert usage records" 
ON public.chatbot_usage 
FOR INSERT 
WITH CHECK (
  -- This will only work when called from edge functions with service role
  current_setting('role') = 'service_role'
);

-- Keep the existing select policy for users to view their own usage
-- (already exists: "Users can view their own usage")

-- Add audit logging trigger for sensitive operations on profiles
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile updates (excluding password-related changes)
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.ai_provider_audit_log (
      action,
      user_id,
      details
    ) VALUES (
      'profile_updated',
      auth.uid(),
      jsonb_build_object(
        'updated_profile_id', NEW.id,
        'changed_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each_text(to_jsonb(NEW))
          WHERE key NOT IN ('updated_at', 'email') -- Don't log sensitive data
            AND to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
        )
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile audit logging
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();