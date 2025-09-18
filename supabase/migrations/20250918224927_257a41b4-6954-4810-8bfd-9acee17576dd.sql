-- Fix RLS policies and create proper admin hierarchy
-- Update the app_role enum to include global_admin
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('global_admin', 'tenant_admin', 'user');

-- Recreate the role column with the new enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Update existing has_role function
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = required_role
  );
$function$;

-- Create function to check if user is global admin
CREATE OR REPLACE FUNCTION public.is_global_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'global_admin'
  );
$function$;

-- Update the get_user_tenant_id function to handle global admins
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'global_admin' THEN NULL
    ELSE (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  END;
$function$;

-- Make noah.satkunam@northstar-tg.com a global admin
-- First, let's update his profile if it exists
UPDATE public.profiles 
SET role = 'global_admin', tenant_id = NULL
WHERE email = 'noah.satkunam@northstar-tg.com';

-- If the profile doesn't exist, we'll create it when he signs up via the trigger
-- Update the handle_new_user function to handle global admin assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
    invitation_record record;
    default_tenant_id uuid;
BEGIN
    -- Check if this is the global admin email
    IF NEW.email = 'noah.satkunam@northstar-tg.com' THEN
        INSERT INTO public.profiles (id, email, name, role, tenant_id)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            'global_admin'::app_role,
            NULL  -- Global admins don't belong to a specific tenant
        );
        RETURN NEW;
    END IF;

    -- Check if this user was invited
    SELECT * INTO invitation_record 
    FROM public.user_invitations 
    WHERE email = NEW.email 
      AND status = 'pending' 
      AND expires_at > now()
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
        -- User was invited - create profile with invitation details
        INSERT INTO public.profiles (id, email, name, role, tenant_id, invited_by, invitation_accepted_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            invitation_record.role,
            invitation_record.tenant_id,
            invitation_record.invited_by,
            now()
        );
        
        -- Mark invitation as accepted
        UPDATE public.user_invitations 
        SET status = 'accepted', 
            accepted_at = now(),
            updated_at = now()
        WHERE id = invitation_record.id;
    ELSE
        -- User was not invited - create basic user profile
        SELECT id INTO default_tenant_id 
        FROM public.tenants 
        WHERE name = 'Personal' 
        LIMIT 1;
        
        IF NOT FOUND THEN
            -- Create a default tenant if none exists
            INSERT INTO public.tenants (name, subdomain)
            VALUES ('Personal', 'personal-' || NEW.id::text)
            RETURNING id INTO default_tenant_id;
        END IF;
        
        INSERT INTO public.profiles (id, email, name, role, tenant_id)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            'user'::app_role,
            default_tenant_id
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update RLS policies for ai_providers to handle the new hierarchy
DROP POLICY IF EXISTS "Admins can manage AI providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Only admins can view AI providers" ON public.ai_providers;

-- Global admins can manage all AI providers
CREATE POLICY "Global admins can manage all AI providers" 
ON public.ai_providers FOR ALL 
USING (is_global_admin());

-- Tenant admins can manage AI providers for their tenant
CREATE POLICY "Tenant admins can manage tenant AI providers" 
ON public.ai_providers FOR ALL 
USING (
    has_role('tenant_admin'::app_role) 
    AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
);

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view basic profiles in their tenant" ON public.profiles;

-- Global admins can manage all profiles
CREATE POLICY "Global admins can manage all profiles" 
ON public.profiles FOR ALL 
USING (is_global_admin());

-- Tenant admins can manage profiles in their tenant
CREATE POLICY "Tenant admins can manage tenant profiles" 
ON public.profiles FOR ALL 
USING (
    has_role('tenant_admin'::app_role) 
    AND tenant_id = get_user_tenant_id()
);

-- Users can view their own profile and basic info of others in their tenant
CREATE POLICY "Users can view profiles in their tenant" 
ON public.profiles FOR SELECT 
USING (
    id = auth.uid() 
    OR is_global_admin()
    OR (has_role('tenant_admin'::app_role) AND tenant_id = get_user_tenant_id())
    OR tenant_id = get_user_tenant_id()
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid());

-- Update tenants RLS policies
DROP POLICY IF EXISTS "Admins can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

-- Global admins can manage all tenants
CREATE POLICY "Global admins can manage all tenants" 
ON public.tenants FOR ALL 
USING (is_global_admin());

-- Tenant admins and users can view their own tenant
CREATE POLICY "Users can view their own tenant" 
ON public.tenants FOR SELECT 
USING (
    is_global_admin() 
    OR id = get_user_tenant_id()
);

-- Update chatbots RLS policies to handle new hierarchy
DROP POLICY IF EXISTS "Admins can manage all chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Moderators can manage tenant chatbots" ON public.chatbots;

-- Global admins can manage all chatbots
CREATE POLICY "Global admins can manage all chatbots" 
ON public.chatbots FOR ALL 
USING (is_global_admin());

-- Tenant admins can manage chatbots in their tenant
CREATE POLICY "Tenant admins can manage tenant chatbots" 
ON public.chatbots FOR ALL 
USING (
    has_role('tenant_admin'::app_role) 
    AND tenant_id = get_user_tenant_id()
);

-- Update user_invitations RLS policies
DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Moderators can manage tenant invitations" ON public.user_invitations;

-- Global admins can manage all invitations  
CREATE POLICY "Global admins can manage all invitations" 
ON public.user_invitations FOR ALL 
USING (is_global_admin());

-- Tenant admins can manage invitations for their tenant
CREATE POLICY "Tenant admins can manage tenant invitations" 
ON public.user_invitations FOR ALL 
USING (
    has_role('tenant_admin'::app_role) 
    AND tenant_id = get_user_tenant_id()
);