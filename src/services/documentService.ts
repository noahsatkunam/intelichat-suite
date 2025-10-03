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
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast.error('You must be logged in to upload documents');
        return null;
      }

      // Try to get user's profile with tenant_id
      let profile = await supabase
        .from('profiles')
        .select('tenant_id, id, email')
        .eq('id', user.id)
        .maybeSingle();

      // If profile not found by ID, try by email as fallback
      if (!profile.data && user.email) {
        console.warn(`Profile not found by ID ${user.id}, trying by email ${user.email}`);
        profile = await supabase
          .from('profiles')
          .select('tenant_id, id, email')
          .eq('email', user.email)
          .maybeSingle();
      }

      if (!profile.data?.tenant_id) {
        console.error('Profile lookup failed:', { userId: user.id, email: user.email, profile: profile.data });
        toast.error('Unable to find user profile. Please refresh the page or contact support.');
        return null;
      }

      // Upload file to storage with proper folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.data.tenant_id}/${user.id}/${fileName}`;

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
          tenant_id: profile.data.tenant_id,
          filename: file.name,
          file_url: publicUrl,
          status: 'pending',
          uploaded_by: user.id,
          content: `Uploaded via document service - ${file.name}`
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