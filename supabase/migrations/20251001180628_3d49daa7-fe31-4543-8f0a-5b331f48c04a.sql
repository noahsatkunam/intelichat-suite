-- Create tasks table for task management
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('follow-up', 'action-item', 'reminder', 'insight')),
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id());

CREATE POLICY "Users can create their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id());

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_tasks_user_tenant ON public.tasks(user_id, tenant_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date) WHERE completed = false;