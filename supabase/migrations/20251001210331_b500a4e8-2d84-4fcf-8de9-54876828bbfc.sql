-- Create junction table for chatbot-tenant many-to-many relationship
CREATE TABLE IF NOT EXISTS public.chatbot_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chatbot_id, tenant_id)
);

-- Enable RLS
ALTER TABLE public.chatbot_tenants ENABLE ROW LEVEL SECURITY;

-- Global admins can manage all chatbot tenant assignments
CREATE POLICY "Global admins can manage all chatbot tenants"
  ON public.chatbot_tenants
  FOR ALL
  USING (is_global_admin());

-- Tenant admins can view their tenant's chatbot assignments
CREATE POLICY "Tenant admins can view their chatbot tenants"
  ON public.chatbot_tenants
  FOR SELECT
  USING (
    has_role('tenant_admin'::app_role) 
    AND tenant_id = get_user_tenant_id()
  );

-- Create junction table for chatbot-document many-to-many relationship (knowledge base)
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chatbot_id, document_id)
);

-- Enable RLS
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

-- Global admins can manage all chatbot knowledge
CREATE POLICY "Global admins can manage all chatbot knowledge"
  ON public.chatbot_knowledge
  FOR ALL
  USING (is_global_admin());

-- Tenant admins can manage their chatbot knowledge
CREATE POLICY "Tenant admins can manage their chatbot knowledge"
  ON public.chatbot_knowledge
  FOR ALL
  USING (
    has_role('tenant_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_knowledge.chatbot_id
      AND chatbots.tenant_id = get_user_tenant_id()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_tenants_chatbot_id ON public.chatbot_tenants(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_tenants_tenant_id ON public.chatbot_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_chatbot_id ON public.chatbot_knowledge(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_document_id ON public.chatbot_knowledge(document_id);