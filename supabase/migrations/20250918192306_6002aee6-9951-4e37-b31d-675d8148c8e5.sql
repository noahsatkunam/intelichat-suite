-- Create user invitations table for invite-only system
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  tenant_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_invitations
CREATE POLICY "Admins can manage all invitations"
ON public.user_invitations
FOR ALL
USING (has_role('admin'::app_role));

CREATE POLICY "Moderators can manage tenant invitations"
ON public.user_invitations
FOR ALL
USING (has_role('moderator'::app_role) AND tenant_id = get_user_tenant_id());

CREATE POLICY "Public can view valid invitations by token"
ON public.user_invitations
FOR SELECT
USING (status = 'pending' AND expires_at > now());

-- Create trigger for updated_at
CREATE TRIGGER update_user_invitations_updated_at
BEFORE UPDATE ON public.user_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_user_invitations_token ON public.user_invitations (token);
CREATE INDEX idx_user_invitations_email ON public.user_invitations (email);
CREATE INDEX idx_user_invitations_tenant_id ON public.user_invitations (tenant_id);
CREATE INDEX idx_user_invitations_status ON public.user_invitations (status);

-- Update profiles table to track invitation acceptance
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP WITH TIME ZONE;