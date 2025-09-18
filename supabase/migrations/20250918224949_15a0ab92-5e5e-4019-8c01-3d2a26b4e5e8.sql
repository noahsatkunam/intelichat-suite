-- Fix RLS policies and create proper admin hierarchy - Part 1
-- Update the app_role enum to include global_admin
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('global_admin', 'tenant_admin', 'user');

-- Recreate the role column with the new enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;