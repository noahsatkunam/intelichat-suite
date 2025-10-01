import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AnalyticsMetric {
  id: string;
  tenant_id: string;
  metric_type: string;
  value: number;
  timestamp: string;
  metadata?: any;
}

export interface AnalyticsData {
  totalMessages: number;
  totalConversations: number;
  totalDocuments: number;
  activeUsers: number;
  messagesTrend: Array<{ date: string; count: number }>;
  conversationsTrend: Array<{ date: string; count: number }>;
}

class AnalyticsService {
  async trackMetric(metricType: string, value: number, metadata?: any): Promise<void> {
    try {
      // Get user's profile to get tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single();

      if (!profile?.tenant_id) return;

      await supabase
        .from('analytics')
        .insert({
          tenant_id: profile.tenant_id,
          metric_type: metricType,
          value,
          metadata: metadata || {},
        });
    } catch (error) {
      console.error('Error tracking metric:', error);
    }
  }

  async getAnalyticsData(filters?: { tenantId?: string; userId?: string }): Promise<AnalyticsData> {
    try {
      // Get user's profile to check role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.getEmptyAnalytics();

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      // Determine which tenant to query
      let targetTenantId: string | null = null;
      let targetUserId: string | null = null;

      if (profile?.role === 'global_admin') {
        // Global admin can filter by tenant and user
        targetTenantId = filters?.tenantId || null;
        targetUserId = filters?.userId || null;
      } else {
        // Regular users only see their tenant
        targetTenantId = profile?.tenant_id || null;
        targetUserId = user.id;
      }

      // Build queries based on filters
      let messagesQuery = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true });

      let conversationsQuery = supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true });

      let documentsQuery = supabase
        .from('documents')
        .select('id', { count: 'exact', head: true });

      // Apply filters
      if (targetTenantId) {
        conversationsQuery = conversationsQuery.eq('tenant_id', targetTenantId);
        documentsQuery = documentsQuery.eq('tenant_id', targetTenantId);
      }

      if (targetUserId) {
        messagesQuery = messagesQuery.eq('user_id', targetUserId);
      }

      // Get total counts
      const [messagesCount, conversationsCount, documentsCount] = await Promise.all([
        messagesQuery,
        conversationsQuery,
        documentsQuery,
      ]);

      // Get trend data for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let messagesTrendQuery = supabase
        .from('messages')
        .select('timestamp')
        .gte('timestamp', sevenDaysAgo);

      let conversationsTrendQuery = supabase
        .from('conversations')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      if (targetUserId) {
        messagesTrendQuery = messagesTrendQuery.eq('user_id', targetUserId);
      }

      if (targetTenantId) {
        conversationsTrendQuery = conversationsTrendQuery.eq('tenant_id', targetTenantId);
      }

      const [messagesTrend, conversationsTrend] = await Promise.all([
        messagesTrendQuery,
        conversationsTrendQuery,
      ]);

      // Get active users count
      let activeUsersQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (targetTenantId) {
        activeUsersQuery = activeUsersQuery.eq('tenant_id', targetTenantId);
      }

      const activeUsersCount = await activeUsersQuery;

      // Process trend data
      const processTrendData = (data: any[], dateField: string) => {
        const counts: { [key: string]: number } = {};
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          counts[date] = 0;
        }

        data.forEach(item => {
          const date = new Date(item[dateField]).toISOString().split('T')[0];
          if (counts.hasOwnProperty(date)) {
            counts[date]++;
          }
        });

        return Object.entries(counts).map(([date, count]) => ({ date, count }));
      };

      return {
        totalMessages: messagesCount.count || 0,
        totalConversations: conversationsCount.count || 0,
        totalDocuments: documentsCount.count || 0,
        activeUsers: activeUsersCount.count || 0,
        messagesTrend: processTrendData(messagesTrend.data || [], 'timestamp'),
        conversationsTrend: processTrendData(conversationsTrend.data || [], 'created_at'),
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
      return this.getEmptyAnalytics();
    }
  }

  private getEmptyAnalytics(): AnalyticsData {
    const emptyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return { date, count: 0 };
    });

    return {
      totalMessages: 0,
      totalConversations: 0,
      totalDocuments: 0,
      activeUsers: 0,
      messagesTrend: emptyTrend,
      conversationsTrend: emptyTrend,
    };
  }

  // Real-time subscription for analytics updates
  subscribeToAnalytics(callback: (metric: AnalyticsMetric) => void) {
    return supabase
      .channel('analytics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          callback(payload.new as AnalyticsMetric);
        }
      )
      .subscribe();
  }
}

export const analyticsService = new AnalyticsService();