-- Update chatbot to use an existing Google model
UPDATE chatbots 
SET 
  fallback_model_name = 'gemini-2.5-flash',
  updated_at = now()
WHERE id = '311ba8ff-86b9-41e1-9de2-399058fe9301';