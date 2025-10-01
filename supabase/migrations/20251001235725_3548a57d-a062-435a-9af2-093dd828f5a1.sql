-- Fix conversations table RLS policy for INSERT
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    tenant_id IN (
      SELECT tenant_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
    OR tenant_id IS NULL
  )
);