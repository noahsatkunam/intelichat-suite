-- Migration to simplify roles to just: global_admin, tenant_admin, user

-- Step 1: Drop all dependent policies first
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view basic profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Moderators can manage tenant chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.ai_provider_audit_log;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Moderators can manage tenant invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Tenant admins can manage AI providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Tenant admins can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Global admins can manage all AI providers" ON public.ai_providers;
DROP POLICY IF EXISTS "Global admins can manage all tenants" ON public.tenants;