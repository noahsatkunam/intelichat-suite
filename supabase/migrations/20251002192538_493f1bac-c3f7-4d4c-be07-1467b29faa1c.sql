-- Allow global admins to create conversations without a tenant by permitting NULL tenant_id
ALTER TABLE public.conversations
  ALTER COLUMN tenant_id DROP NOT NULL;