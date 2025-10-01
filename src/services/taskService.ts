import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'follow-up' | 'action-item' | 'reminder' | 'insight';
  due_date?: string;
  completed: boolean;
  ai_generated: boolean;
  source?: string;
  created_at: string;
  updated_at: string;
}

class TaskService {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return (data || []) as Task[];
  }

  async createTask(task: Omit<Task, 'id' | 'user_id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) throw new Error('User tenant not found');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        user_id: user.id,
        tenant_id: profile.tenant_id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return data as Task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
      return false;
    }

    return true;
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  }

  async toggleTask(id: string, completed: boolean): Promise<boolean> {
    return this.updateTask(id, { completed });
  }

  subscribeToTasks(callback: (task: Task) => void) {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        callback(payload.new as Task);
      })
      .subscribe();
  }
}

export const taskService = new TaskService();
