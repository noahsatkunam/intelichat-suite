-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Create RLS policies for document bucket
CREATE POLICY "Users can view documents in their tenant" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND tenant_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can upload documents to their tenant" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[2] AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND tenant_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);