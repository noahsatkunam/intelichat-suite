-- Add chatbot_id to conversations to track which chatbot the conversation is with
ALTER TABLE public.conversations
  ADD COLUMN chatbot_id uuid REFERENCES public.chatbots(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_conversations_chatbot_id ON public.conversations(chatbot_id);