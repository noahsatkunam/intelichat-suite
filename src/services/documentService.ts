import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Document {
  id: string;
  tenant_id: string;
  filename: string;
  content?: string;
  file_url?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

class DocumentService {
  async getDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Document[];
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      return [];
    }
  }

  async uploadDocument(file: File): Promise<Document | null> {
    try {
      // Get user's profile to get tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single();

      if (!profile?.tenant_id) {
        throw new Error('User profile not found');
      }

      // Upload file to storage (you'll need to create a bucket first)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.tenant_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          tenant_id: profile.tenant_id,
          filename: file.name,
          file_url: publicUrl,
          status: 'pending',
          uploaded_by: (await supabase.auth.getUser()).data.user?.id!,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Document uploaded successfully');
      return data as Document;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Document deleted');
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      return false;
    }
  }

  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`filename.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Document[];
    } catch (error) {
      console.error('Error searching documents:', error);
      toast.error('Failed to search documents');
      return [];
    }
  }
}

export const documentService = new DocumentService();