-- Update the ai_providers type constraint to include new provider types
ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_type_check;

-- Add the updated constraint with all provider types
ALTER TABLE ai_providers ADD CONSTRAINT ai_providers_type_check 
CHECK (type IN ('openai', 'anthropic', 'google', 'mistral', 'meta', 'xai', 'custom', 'ollama'));