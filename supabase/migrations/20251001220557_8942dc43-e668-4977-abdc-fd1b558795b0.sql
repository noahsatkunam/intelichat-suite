-- Ensure documents bucket exists and is not public (for security)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents to their tenant folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents in their tenant" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Storage policies for documents bucket
-- Allow users to upload documents to their tenant folder
CREATE POLICY "Users can upload documents to their tenant folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT tenant_id::text 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Allow users to view documents in their tenant
CREATE POLICY "Users can view documents in their tenant"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT tenant_id::text 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Allow users to delete their own uploaded documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Update documents table comment
COMMENT ON COLUMN documents.status IS 'Document processing status: pending, processed, failed';