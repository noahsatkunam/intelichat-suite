-- Update app_role enum to include global_admin and tenant_admin
-- Add new enum values
ALTER TYPE public.app_role ADD VALUE 'global_admin';
ALTER TYPE public.app_role ADD VALUE 'tenant_admin';

-- Update existing 'admin' roles to 'tenant_admin' 
UPDATE public.profiles SET role = 'tenant_admin' WHERE role = 'admin';

-- Update existing 'moderator' roles to 'tenant_admin'
UPDATE public.profiles SET role = 'tenant_admin' WHERE role = 'moderator';

-- Make noah.satkunam@northstar-tg.com a global admin
UPDATE public.profiles 
SET role = 'global_admin', tenant_id = NULL
WHERE email = 'noah.satkunam@northstar-tg.com';