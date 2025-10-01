-- Recreate RLS policies with simplified three-role system

-- Profiles table policies
CREATE POLICY "Global admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (is_global_admin());

CREATE POLICY "Tenant admins can manage profiles in their tenant" 
ON public.profiles 
FOR ALL 
USING (
  has_role('tenant_admin'::app_role) AND tenant_id = get_user_tenant_id()
);

CREATE POLICY "Users can view profiles in their tenant" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  is_global_admin() OR 
  (has_role('tenant_admin'::app_role) AND tenant_id = get_user_tenant_id())
);

-- Chatbots table policies
CREATE POLICY "Global admins can manage all chatbots" 
ON public.chatbots 
FOR ALL 
USING (is_global_admin());

CREATE POLICY "Tenant admins can manage their chatbots" 
ON public.chatbots 
FOR ALL 
USING (
  has_role('tenant_admin'::app_role) AND tenant_id = get_user_tenant_id()
);

-- User invitations table policies
CREATE POLICY "Global admins can manage all invitations" 
ON public.user_invitations 
FOR ALL 
USING (is_global_admin());

CREATE POLICY "Tenant admins can manage tenant invitations" 
ON public.user_invitations 
FOR ALL 
USING (
  has_role('tenant_admin'::app_role) AND tenant_id = get_user_tenant_id()
);

-- Tenants table policies
CREATE POLICY "Global admins can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (is_global_admin());

CREATE POLICY "Tenant admins can manage their tenant" 
ON public.tenants 
FOR ALL 
USING (
  has_role('tenant_admin'::app_role) AND id = get_user_tenant_id()
);

-- AI Providers table policies
CREATE POLICY "Global admins can manage all AI providers" 
ON public.ai_providers 
FOR ALL 
USING (is_global_admin());

CREATE POLICY "Tenant admins can manage their AI providers" 
ON public.ai_providers 
FOR ALL 
USING (
  has_role('tenant_admin'::app_role) AND 
  ((tenant_id = get_user_tenant_id()) OR (tenant_id IS NULL))
);

-- Audit log table policy
CREATE POLICY "Tenant admins can view tenant audit logs" 
ON public.ai_provider_audit_log 
FOR SELECT 
USING (
  is_global_admin() OR 
  (has_role('tenant_admin'::app_role) AND EXISTS (
    SELECT 1 FROM ai_providers 
    WHERE ai_providers.id = ai_provider_audit_log.provider_id 
    AND ai_providers.tenant_id = get_user_tenant_id()
  ))
);