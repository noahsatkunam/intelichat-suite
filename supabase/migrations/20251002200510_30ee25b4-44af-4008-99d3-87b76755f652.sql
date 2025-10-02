-- Add is_enabled column to chatbot_knowledge table
ALTER TABLE public.chatbot_knowledge 
ADD COLUMN is_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_chatbot_knowledge_updated_at
  BEFORE UPDATE ON public.chatbot_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policy for admins to update chatbot_knowledge
CREATE POLICY "Global admins can update all chatbot knowledge"
ON public.chatbot_knowledge
FOR UPDATE
TO authenticated
USING (is_global_admin())
WITH CHECK (is_global_admin());

CREATE POLICY "Tenant admins can update their chatbot knowledge"
ON public.chatbot_knowledge
FOR UPDATE
TO authenticated
USING (
  has_role('tenant_admin'::app_role) AND 
  EXISTS (
    SELECT 1 FROM chatbots 
    WHERE chatbots.id = chatbot_knowledge.chatbot_id 
    AND chatbots.tenant_id = get_user_tenant_id()
  )
)
WITH CHECK (
  has_role('tenant_admin'::app_role) AND 
  EXISTS (
    SELECT 1 FROM chatbots 
    WHERE chatbots.id = chatbot_knowledge.chatbot_id 
    AND chatbots.tenant_id = get_user_tenant_id()
  )
);

-- Add audit logging function for document toggles
CREATE OR REPLACE FUNCTION public.audit_chatbot_knowledge_toggle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.is_enabled IS DISTINCT FROM NEW.is_enabled THEN
    INSERT INTO public.ai_provider_audit_log (
      action,
      user_id,
      details
    ) VALUES (
      'document_toggled',
      auth.uid(),
      jsonb_build_object(
        'chatbot_id', NEW.chatbot_id,
        'document_id', NEW.document_id,
        'is_enabled', NEW.is_enabled,
        'previous_state', OLD.is_enabled
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
CREATE TRIGGER audit_chatbot_knowledge_changes
  AFTER UPDATE ON public.chatbot_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_chatbot_knowledge_toggle();