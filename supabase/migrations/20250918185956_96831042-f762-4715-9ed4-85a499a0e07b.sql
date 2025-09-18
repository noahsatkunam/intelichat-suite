-- Fix function search path security issues
-- Update existing functions to have proper search_path settings

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Create a default tenant for new users (or assign to existing one)
    INSERT INTO public.profiles (id, email, name, tenant_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        -- For now, create a personal tenant for each user
        (SELECT id FROM public.tenants WHERE name = 'Personal' LIMIT 1)
    );
    
    -- If no default tenant exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.tenants (name, subdomain)
        VALUES ('Personal', 'personal-' || NEW.id::text);
        
        UPDATE public.profiles 
        SET tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'personal-' || NEW.id::text)
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_safe_ai_providers()
RETURNS TABLE(id uuid, name text, type text, is_active boolean, tenant_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;