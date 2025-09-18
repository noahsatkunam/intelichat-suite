-- Fix foreign key constraint to allow cascading deletes
ALTER TABLE public.ai_provider_audit_log 
DROP CONSTRAINT IF EXISTS ai_provider_audit_log_provider_id_fkey;

-- Add the constraint back with CASCADE DELETE
ALTER TABLE public.ai_provider_audit_log 
ADD CONSTRAINT ai_provider_audit_log_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id) ON DELETE CASCADE;