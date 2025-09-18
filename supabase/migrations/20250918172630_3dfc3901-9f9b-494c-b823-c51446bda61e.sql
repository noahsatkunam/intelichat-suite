-- Fix search path security issues in functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search path for update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;