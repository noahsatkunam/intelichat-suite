-- Update handle_new_user function to include department from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    invitation_record record;
    default_tenant_id uuid;
BEGIN
    -- Check if this is a global admin email
    IF NEW.email IN ('noah.satkunam@northstar-tg.com', 'ken.satkunam@northstar-tg.com') THEN
        INSERT INTO public.profiles (id, email, name, role, tenant_id, department)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', 
                CASE 
                    WHEN NEW.email = 'noah.satkunam@northstar-tg.com' THEN NEW.email
                    WHEN NEW.email = 'ken.satkunam@northstar-tg.com' THEN 'Ken Satkunam'
                    ELSE NEW.email
                END
            ),
            'global_admin'::app_role,
            NULL,  -- Global admins don't belong to a specific tenant
            COALESCE(NEW.raw_user_meta_data->>'department', 'N/A')
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
        INSERT INTO public.profiles (id, email, name, role, tenant_id, invited_by, invitation_accepted_at, department)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            invitation_record.role,
            invitation_record.tenant_id,
            invitation_record.invited_by,
            now(),
            COALESCE(NEW.raw_user_meta_data->>'department', (invitation_record.metadata->>'department')::text, 'N/A')
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
        
        INSERT INTO public.profiles (id, email, name, role, tenant_id, department)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            'user'::app_role,
            default_tenant_id,
            COALESCE(NEW.raw_user_meta_data->>'department', 'N/A')
        );
    END IF;
    
    RETURN NEW;
END;
$function$;