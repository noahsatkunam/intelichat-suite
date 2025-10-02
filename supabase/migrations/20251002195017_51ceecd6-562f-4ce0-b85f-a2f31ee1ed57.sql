-- Update RLS to allow global admins to view their conversations for realtime
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND (
    tenant_id = get_user_tenant_id() OR
    is_global_admin()
  )
);