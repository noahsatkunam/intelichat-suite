-- Create junction table for documents and tenants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.document_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, tenant_id)
);

-- Enable RLS
ALTER TABLE public.document_tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_tenants
CREATE POLICY "Users can view document tenants in their tenant"
  ON public.document_tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = document_tenants.document_id
      AND documents.tenant_id = get_user_tenant_id()
    )
    OR is_global_admin()
  );

CREATE POLICY "Global admins can manage all document tenants"
  ON public.document_tenants
  FOR ALL
  USING (is_global_admin());

CREATE POLICY "Tenant admins can manage their document tenants"
  ON public.document_tenants
  FOR ALL
  USING (
    has_role('tenant_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = document_tenants.document_id
      AND documents.tenant_id = get_user_tenant_id()
    )
  );

-- Migrate existing data from documents.tenant_id to junction table
INSERT INTO public.document_tenants (document_id, tenant_id)
SELECT id, tenant_id
FROM public.documents
WHERE tenant_id IS NOT NULL
ON CONFLICT (document_id, tenant_id) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_document_tenants_document_id ON public.document_tenants(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tenants_tenant_id ON public.document_tenants(tenant_id);