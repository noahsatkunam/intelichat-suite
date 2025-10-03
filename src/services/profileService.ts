import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'global_admin' | 'tenant_admin' | 'user';
  tenant_id: string | null;
  avatar_url: string | null;
}

class ProfileService {
  /**
   * Get the current authenticated user's profile
   * Tries to fetch by user ID first, then falls back to email
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return null;
      }

      // Try to get profile by user ID
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, role, tenant_id, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      // If not found by ID, try by email as fallback
      if (!profile && user.email) {
        console.warn(`Profile not found by ID ${user.id}, trying by email ${user.email}`);
        const fallbackQuery = await supabase
          .from('profiles')
          .select('id, email, name, role, tenant_id, avatar_url')
          .eq('email', user.email)
          .maybeSingle();
        
        profile = fallbackQuery.data;
        profileError = fallbackQuery.error;
      }

      if (profileError) {
        console.error('Profile query error:', profileError);
        return null;
      }

      if (!profile) {
        console.error('Profile not found for user:', { userId: user.id, email: user.email });
        return null;
      }

      return profile as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check if the current user is a global admin
   */
  async isGlobalAdmin(): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    return profile?.role === 'global_admin';
  }

  /**
   * Get the user's tenant ID, or null if global admin
   */
  async getUserTenantId(): Promise<string | null> {
    const profile = await this.getCurrentUserProfile();
    return profile?.tenant_id || null;
  }
}

export const profileService = new ProfileService();
