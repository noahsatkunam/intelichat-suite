-- Add deleted_at column to conversations table
ALTER TABLE public.conversations
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to messages table  
ALTER TABLE public.messages
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for better query performance on deleted_at
CREATE INDEX idx_conversations_deleted_at ON public.conversations(deleted_at);
CREATE INDEX idx_messages_deleted_at ON public.messages(deleted_at);

-- Update RLS policies for conversations to exclude soft-deleted items
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (
  (user_id = auth.uid()) 
  AND ((tenant_id = get_user_tenant_id()) OR is_global_admin())
  AND deleted_at IS NULL
);

-- Update RLS policies for messages to exclude soft-deleted items
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- Add policy for global admins to view all conversations including deleted
CREATE POLICY "Global admins can view all conversations including deleted"
ON public.conversations
FOR SELECT
USING (is_global_admin());

-- Comment to explain soft delete approach
COMMENT ON COLUMN public.conversations.deleted_at IS 'Soft delete timestamp - when set, conversation is hidden from user but retained for analytics';
COMMENT ON COLUMN public.messages.deleted_at IS 'Soft delete timestamp - when set, message is hidden from user but retained for analytics';