-- Add capability and modality metadata columns to provider_models
ALTER TABLE public.provider_models 
ADD COLUMN IF NOT EXISTS capability_tier text CHECK (capability_tier IN ('flagship', 'standard', 'fast', 'lightweight')),
ADD COLUMN IF NOT EXISTS modality text CHECK (modality IN ('text', 'vision', 'multimodal'));

-- Add index for faster lookups during model matching
CREATE INDEX IF NOT EXISTS idx_provider_models_capability 
ON public.provider_models(provider_type, capability_tier, modality) 
WHERE is_deprecated = false;

-- Add auto_map_fallback_model column to chatbots table
ALTER TABLE public.chatbots
ADD COLUMN IF NOT EXISTS auto_map_fallback_model boolean DEFAULT true;

-- Add comment explaining the feature
COMMENT ON COLUMN public.chatbots.auto_map_fallback_model IS 'When true, automatically selects closest matching model on fallback provider based on capability tier and modality. When false, requires exact model match.';