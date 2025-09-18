-- Restructure AI providers to focus on API key management
-- Remove model-specific fields and add provider-specific configuration fields

-- First, let's update the ai_providers table structure
ALTER TABLE public.ai_providers 
DROP COLUMN IF EXISTS config CASCADE;

-- Add specific configuration fields for different provider types
ALTER TABLE public.ai_providers 
ADD COLUMN base_url TEXT,
ADD COLUMN organization_id TEXT,
ADD COLUMN project_id TEXT,
ADD COLUMN custom_headers JSONB DEFAULT '{}',
ADD COLUMN description TEXT;

-- Update the chatbots table to store model-specific configuration
ALTER TABLE public.chatbots 
ADD COLUMN temperature DECIMAL(3,2) DEFAULT 0.7,
ADD COLUMN max_tokens INTEGER DEFAULT 1000,
ADD COLUMN top_p DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN presence_penalty DECIMAL(3,2) DEFAULT 0.0;

-- Add constraints for valid parameter ranges
ALTER TABLE public.chatbots 
ADD CONSTRAINT temperature_range CHECK (temperature >= 0 AND temperature <= 2),
ADD CONSTRAINT top_p_range CHECK (top_p >= 0 AND top_p <= 1),
ADD CONSTRAINT frequency_penalty_range CHECK (frequency_penalty >= -2 AND frequency_penalty <= 2),
ADD CONSTRAINT presence_penalty_range CHECK (presence_penalty >= -2 AND presence_penalty <= 2),
ADD CONSTRAINT max_tokens_positive CHECK (max_tokens > 0);

-- Create a table to store available models per provider type
CREATE TABLE IF NOT EXISTS public.provider_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type TEXT NOT NULL,
  model_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  max_context_length INTEGER,
  supports_vision BOOLEAN DEFAULT false,
  supports_function_calling BOOLEAN DEFAULT false,
  cost_per_1k_input_tokens DECIMAL(10,6),
  cost_per_1k_output_tokens DECIMAL(10,6),
  is_deprecated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_type, model_name)
);

-- Enable RLS on provider_models
ALTER TABLE public.provider_models ENABLE ROW LEVEL SECURITY;

-- Create policy for provider_models (readable by all authenticated users)
CREATE POLICY "Provider models are viewable by authenticated users" 
ON public.provider_models FOR SELECT 
USING (auth.role() = 'authenticated');

-- Insert default models for each provider type
INSERT INTO public.provider_models (provider_type, model_name, display_name, description, max_context_length, supports_vision, supports_function_calling) VALUES
  -- OpenAI models
  ('openai', 'gpt-4o', 'GPT-4o', 'Most advanced GPT-4 model with vision capabilities', 128000, true, true),
  ('openai', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast and cost-effective GPT-4 model', 128000, true, true),
  ('openai', 'gpt-4-turbo', 'GPT-4 Turbo', 'Advanced GPT-4 model with large context window', 128000, true, true),
  ('openai', 'gpt-4', 'GPT-4', 'Standard GPT-4 model', 8192, false, true),
  ('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient GPT-3.5 model', 16384, false, true),
  
  -- Anthropic models  
  ('anthropic', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Most capable Claude model', 200000, true, false),
  ('anthropic', 'claude-3-sonnet-20240229', 'Claude 3 Sonnet', 'Balanced Claude model', 200000, true, false),
  ('anthropic', 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'Fastest Claude model', 200000, true, false),
  ('anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Enhanced Claude model', 200000, true, false),
  
  -- Google models
  ('google', 'gemini-pro', 'Gemini Pro', 'Advanced Google language model', 32768, false, true),
  ('google', 'gemini-pro-vision', 'Gemini Pro Vision', 'Google model with vision capabilities', 32768, true, true),
  ('google', 'gemini-ultra', 'Gemini Ultra', 'Most capable Google model', 32768, true, true),
  
  -- Mistral models
  ('mistral', 'mistral-large-latest', 'Mistral Large', 'Most capable Mistral model', 32768, false, true),
  ('mistral', 'mistral-medium-latest', 'Mistral Medium', 'Balanced Mistral model', 32768, false, true),
  ('mistral', 'mistral-small-latest', 'Mistral Small', 'Fast Mistral model', 32768, false, true);

-- Create trigger for updated_at on provider_models
CREATE TRIGGER update_provider_models_updated_at
    BEFORE UPDATE ON public.provider_models
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add usage tracking for providers
CREATE TABLE IF NOT EXISTS public.provider_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- Enable RLS on provider_usage_stats
ALTER TABLE public.provider_usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for provider_usage_stats
CREATE POLICY "Users can view usage stats for their tenant providers" 
ON public.provider_usage_stats FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ai_providers 
  WHERE ai_providers.id = provider_usage_stats.provider_id 
  AND (ai_providers.tenant_id = get_user_tenant_id() OR ai_providers.tenant_id IS NULL)
));

-- Create trigger for updated_at on provider_usage_stats
CREATE TRIGGER update_provider_usage_stats_updated_at
    BEFORE UPDATE ON public.provider_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();