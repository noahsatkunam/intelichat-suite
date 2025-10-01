-- Fix conversations RLS policy to allow users to create conversations
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;

-- Recreate with proper check
CREATE POLICY "Users can create own conversations" 
ON conversations 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR tenant_id IS NULL
  )
);