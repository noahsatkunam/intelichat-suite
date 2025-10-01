-- Add fallback_model_name column to chatbots table
ALTER TABLE public.chatbots 
ADD COLUMN fallback_model_name text;

COMMENT ON COLUMN public.chatbots.fallback_model_name IS 'Model to use when falling back to the backup AI provider';