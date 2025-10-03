import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { profileService } from './profileService';

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

  /**
   * Upload a document to storage and create a database record
   * @param file - The file to upload
   * @param tenantId - Optional tenant ID (required for global_admin users)
   */
  async uploadDocument(file: File, tenantId?: string): Promise<Document | null> {
    try {
      // Get user profile
      const profile = await profileService.getCurrentUserProfile();
      
      if (!profile) {
        console.error('Unable to retrieve user profile');
        toast.error('Authentication required. Please log in and try again.');
        return null;
      }

      // Determine tenant_id for the upload
      let effectiveTenantId = profile.tenant_id;
      
      // For global_admin users, tenant_id must be provided explicitly
      if (profile.role === 'global_admin') {
        if (!tenantId) {
          console.error('Global admin must provide tenant_id for document upload');
          toast.error('Please select a tenant context for this upload.');
          return null;
        }
        effectiveTenantId = tenantId;
      }

      if (!effectiveTenantId) {
        console.error('No tenant context available for upload');
        toast.error('Unable to determine tenant context. Please contact support.');
        return null;
      }

      // Upload file to storage with proper folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${effectiveTenantId}/${profile.id}/${fileName}`;

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
          tenant_id: effectiveTenantId,
          filename: file.name,
          file_url: publicUrl,
          status: 'pending',
          uploaded_by: profile.id,
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