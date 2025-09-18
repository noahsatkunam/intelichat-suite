-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create tenants table
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    branding_config JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role app_role DEFAULT 'user',
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE public.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = required_role
  );
$$;

-- RLS Policies for tenants
CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (id = public.get_user_tenant_id());

CREATE POLICY "Admins can manage tenants" ON public.tenants
    FOR ALL USING (public.has_role('admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
    FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.has_role('admin'));

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (user_id = auth.uid() AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can create own conversations" ON public.conversations
    FOR INSERT WITH CHECK (user_id = auth.uid() AND tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations" ON public.conversations
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their tenant" ON public.documents
    FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can create documents in their tenant" ON public.documents
    FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id() AND uploaded_by = auth.uid());

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (uploaded_by = auth.uid());

-- RLS Policies for analytics
CREATE POLICY "Users can view analytics in their tenant" ON public.analytics
    FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "System can insert analytics" ON public.analytics
    FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Create indexes for performance
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_documents_tenant_id ON public.documents(tenant_id);
CREATE INDEX idx_analytics_tenant_id ON public.analytics(tenant_id);
CREATE INDEX idx_analytics_timestamp ON public.analytics(timestamp);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a default tenant for new users (or assign to existing one)
    INSERT INTO public.profiles (id, email, name, tenant_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        -- For now, create a personal tenant for each user
        (SELECT id FROM public.tenants WHERE name = 'Personal' LIMIT 1)
    );
    
    -- If no default tenant exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.tenants (name, subdomain)
        VALUES ('Personal', 'personal-' || NEW.id::text);
        
        UPDATE public.profiles 
        SET tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'personal-' || NEW.id::text)
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for live updates
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.analytics REPLICA IDENTITY FULL;

-- Add tables to realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics;
COMMIT;