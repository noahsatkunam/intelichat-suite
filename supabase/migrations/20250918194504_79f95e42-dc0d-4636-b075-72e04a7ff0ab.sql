-- Update handle_new_user function to work with invitation system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    invitation_record record;
    default_tenant_id uuid;
BEGIN
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
        -- User was not invited - this should not happen in invite-only system
        -- But handle gracefully by creating a basic user profile
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