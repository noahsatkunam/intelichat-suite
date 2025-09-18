-- Create AI providers table
CREATE TABLE public.ai_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('openai', 'anthropic', 'google', 'mistral', 'custom', 'ollama')),
  config JSONB NOT NULL DEFAULT '{}',
  api_key_encrypted TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_healthy BOOLEAN NOT NULL DEFAULT true,
  last_health_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES public.tenants(id)
);

-- Create chatbots table
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  primary_ai_provider_id UUID REFERENCES public.ai_providers(id),
  fallback_ai_provider_id UUID REFERENCES public.ai_providers(id),
  model_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create AI provider audit log
CREATE TABLE public.ai_provider_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.ai_providers(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot usage tracking
CREATE TABLE public.chatbot_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID REFERENCES public.chatbots(id),
  user_id UUID REFERENCES auth.users(id),
  ai_provider_id UUID REFERENCES public.ai_providers(id),
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_providers
CREATE POLICY "Admins can manage AI providers" 
ON public.ai_providers 
FOR ALL 
USING (has_role('admin'::app_role));

CREATE POLICY "Users can view active AI providers in their tenant" 
ON public.ai_providers 
FOR SELECT 
USING (is_active = true AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL));

-- RLS Policies for chatbots
CREATE POLICY "Admins can manage all chatbots" 
ON public.chatbots 
FOR ALL 
USING (has_role('admin'::app_role));

CREATE POLICY "Tenant users can view their chatbots" 
ON public.chatbots 
FOR SELECT 
USING (tenant_id = get_user_tenant_id() AND is_active = true);

CREATE POLICY "Moderators can manage tenant chatbots" 
ON public.chatbots 
FOR ALL 
USING (has_role('moderator'::app_role) AND tenant_id = get_user_tenant_id());

-- RLS Policies for audit log
CREATE POLICY "Admins can view all audit logs" 
ON public.ai_provider_audit_log 
FOR SELECT 
USING (has_role('admin'::app_role));

-- RLS Policies for usage tracking
CREATE POLICY "Users can view their own usage" 
ON public.chatbot_usage 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert usage records" 
ON public.chatbot_usage 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_ai_providers_tenant_active ON public.ai_providers(tenant_id, is_active);
CREATE INDEX idx_chatbots_tenant_active ON public.chatbots(tenant_id, is_active);
CREATE INDEX idx_chatbot_usage_chatbot_timestamp ON public.chatbot_usage(chatbot_id, timestamp);
CREATE INDEX idx_ai_provider_audit_provider_timestamp ON public.ai_provider_audit_log(provider_id, timestamp);

-- Create updated_at triggers
CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default OpenAI provider for fallback
INSERT INTO public.ai_providers (name, type, config, is_active, tenant_id) 
VALUES (
  'OpenAI GPT-4o (Default)', 
  'openai', 
  '{"model": "gpt-4o", "max_tokens": 1000, "temperature": 0.7}',
  true,
  NULL
);