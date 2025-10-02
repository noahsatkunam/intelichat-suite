-- Populate missing capability_tier and modality for Mistral models
UPDATE provider_models 
SET 
  capability_tier = CASE 
    WHEN model_name LIKE '%large%' THEN 'flagship'
    WHEN model_name LIKE '%medium%' THEN 'standard'
    WHEN model_name LIKE '%small%' THEN 'fast'
    WHEN model_name LIKE '%tiny%' THEN 'lightweight'
    ELSE 'standard'
  END,
  modality = 'text',
  updated_at = now()
WHERE provider_type = 'mistral' 
  AND capability_tier IS NULL;

-- Update the deprecated gemini-pro-vision fallback to a current model
UPDATE chatbots 
SET 
  fallback_model_name = 'gemini-1.5-flash-8b',
  updated_at = now()
WHERE id = '311ba8ff-86b9-41e1-9de2-399058fe9301'
  AND fallback_model_name = 'gemini-pro-vision';

-- Add audit log entry for the manual update
INSERT INTO ai_provider_audit_log (action, details)
VALUES (
  'manual_model_update',
  jsonb_build_object(
    'timestamp', now(),
    'action', 'Updated deprecated gemini-pro-vision to gemini-1.5-flash-8b',
    'chatbot_id', '311ba8ff-86b9-41e1-9de2-399058fe9301',
    'mistral_models_updated', 3
  )
);