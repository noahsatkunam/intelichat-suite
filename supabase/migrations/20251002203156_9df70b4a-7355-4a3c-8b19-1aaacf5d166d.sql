-- Add RLS policy for global admins to view all conversations
CREATE POLICY "Global admins can view all conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'global_admin'
  )
);