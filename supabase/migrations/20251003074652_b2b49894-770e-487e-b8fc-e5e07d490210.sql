-- Add token configuration columns for fallback model and auto-settings
ALTER TABLE public.chatbots
ADD COLUMN IF NOT EXISTS fallback_max_tokens integer DEFAULT 1000,
ADD COLUMN IF NOT EXISTS auto_max_tokens boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_fallback_max_tokens boolean DEFAULT false;

COMMENT ON COLUMN public.chatbots.fallback_max_tokens IS 'Maximum tokens for fallback model responses';
COMMENT ON COLUMN public.chatbots.auto_max_tokens IS 'Whether to automatically use model maximum for primary model';
COMMENT ON COLUMN public.chatbots.auto_fallback_max_tokens IS 'Whether to automatically use model maximum for fallback model';