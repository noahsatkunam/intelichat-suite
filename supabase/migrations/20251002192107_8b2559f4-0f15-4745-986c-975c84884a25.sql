-- Fix global admin profiles to have NULL tenant_id
UPDATE profiles
SET tenant_id = NULL,
    updated_at = now()
WHERE role = 'global_admin'
  AND tenant_id IS NOT NULL;

-- Add explicit RLS policy for global admins to create conversations
CREATE POLICY "Global admins can create any conversation"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'global_admin'
  )
);