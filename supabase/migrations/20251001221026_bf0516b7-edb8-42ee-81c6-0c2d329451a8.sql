-- Add global admin RLS for documents and storage objects to fix insert errors for admins

-- Documents table: allow global admins to manage everything
DROP POLICY IF EXISTS "Global admins can manage all documents" ON public.documents;
CREATE POLICY "Global admins can manage all documents"
ON public.documents
FOR ALL
TO authenticated
USING (public.is_global_admin())
WITH CHECK (public.is_global_admin());

-- Storage policies: allow global admins to fully manage 'documents' bucket
DROP POLICY IF EXISTS "Admins can select all in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can insert all in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete all in documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update all in documents bucket" ON storage.objects;

CREATE POLICY "Admins can select all in documents bucket"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND public.is_global_admin());

CREATE POLICY "Admins can insert all in documents bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND public.is_global_admin());

CREATE POLICY "Admins can delete all in documents bucket"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND public.is_global_admin());

CREATE POLICY "Admins can update all in documents bucket"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND public.is_global_admin())
WITH CHECK (bucket_id = 'documents' AND public.is_global_admin());
