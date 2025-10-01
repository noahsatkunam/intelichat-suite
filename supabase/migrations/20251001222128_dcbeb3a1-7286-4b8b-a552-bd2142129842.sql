-- Add avatar_url column to chatbots table
ALTER TABLE public.chatbots 
ADD COLUMN avatar_url TEXT;

COMMENT ON COLUMN public.chatbots.avatar_url IS 'URL to the chatbot avatar image stored in storage';

-- Create storage bucket for chatbot avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chatbot-avatars', 'chatbot-avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Storage policies for chatbot avatars bucket
DROP POLICY IF EXISTS "Anyone can view chatbot avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chatbot avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins and tenant admins can delete chatbot avatars" ON storage.objects;

-- Allow anyone to view chatbot avatars (public access)
CREATE POLICY "Anyone can view chatbot avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'chatbot-avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload chatbot avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chatbot-avatars');

-- Allow admins and tenant admins to delete avatars
CREATE POLICY "Admins and tenant admins can delete chatbot avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chatbot-avatars' 
  AND (
    public.is_global_admin() 
    OR public.has_role('tenant_admin'::app_role)
  )
);