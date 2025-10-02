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
  messagesByTenant?: Array<{ tenantId: string; tenantName: string; messageCount: number; conversationCount: number }>;
}

export interface ChatbotAnalytics {
  chatbotId: string;
  chatbotName: string;
  totalMessages: number;
  totalConversations: number;
  averageResponseTime: number;
  successRate: number;
  totalTokens: number;
  totalRequests: number;
  failedRequests: number;
}

export interface ChatbotAnalyticsData {
  chatbots: ChatbotAnalytics[];
  totalMessages: number;
  averageResponseTime: number;
  overallSuccessRate: number;
  totalTokensUsed: number;
  messagesTrend: Array<{ date: string; count: number }>;
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

  async getAnalyticsData(filters?: { tenantId?: string; userId?: string; period?: string }): Promise<AnalyticsData> {
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
      let conversationsQuery = supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true });

      let documentsQuery = supabase
        .from('documents')
        .select('id', { count: 'exact', head: true });

      // Apply tenant filter to conversations and documents
      if (targetTenantId) {
        conversationsQuery = conversationsQuery.eq('tenant_id', targetTenantId);
        documentsQuery = documentsQuery.eq('tenant_id', targetTenantId);
      }

      // Get conversation IDs for tenant filtering messages
      let conversationIdsForMessages: string[] = [];
      if (targetTenantId) {
        const { data: tenantConversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('tenant_id', targetTenantId);
        conversationIdsForMessages = tenantConversations?.map(c => c.id) || [];
      }

      // Build messages query with tenant and user filters
      let messagesQuery = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true });

      if (targetTenantId && conversationIdsForMessages.length > 0) {
        messagesQuery = messagesQuery.in('conversation_id', conversationIdsForMessages);
      } else if (targetTenantId && conversationIdsForMessages.length === 0) {
        // No conversations for this tenant, so no messages either
        messagesQuery = messagesQuery.eq('conversation_id', '00000000-0000-0000-0000-000000000000');
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

      // Get trend data based on selected period
      const periodDays = filters?.period === '1day' ? 1 : filters?.period === '30days' ? 30 : filters?.period === '90days' ? 90 : 7;
      const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

      let messagesTrendQuery = supabase
        .from('messages')
        .select('timestamp')
        .gte('timestamp', periodStart);

      let conversationsTrendQuery = supabase
        .from('conversations')
        .select('created_at')
        .gte('created_at', periodStart);

      // Apply tenant filter to messages trend through conversations
      if (targetTenantId && conversationIdsForMessages.length > 0) {
        messagesTrendQuery = messagesTrendQuery.in('conversation_id', conversationIdsForMessages);
      } else if (targetTenantId && conversationIdsForMessages.length === 0) {
        // No conversations for this tenant
        messagesTrendQuery = messagesTrendQuery.eq('conversation_id', '00000000-0000-0000-0000-000000000000');
      }

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
        
        for (let i = periodDays - 1; i >= 0; i--) {
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

      // Get per-tenant breakdown if global admin viewing all tenants
      let messagesByTenant: Array<{ tenantId: string; tenantName: string; messageCount: number; conversationCount: number }> | undefined;
      
      if (profile?.role === 'global_admin' && !targetTenantId) {
        // Get all tenants
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id, name');

        if (tenants && tenants.length > 0) {
          messagesByTenant = await Promise.all(
            tenants.map(async (tenant) => {
              // Get conversations for this tenant
              const { data: tenantConversations } = await supabase
                .from('conversations')
                .select('id')
                .eq('tenant_id', tenant.id)
                .gte('created_at', periodStart);

              const conversationIds = tenantConversations?.map(c => c.id) || [];
              
              // Get message count for this tenant
              let messageCount = 0;
              if (conversationIds.length > 0) {
                const { count } = await supabase
                  .from('messages')
                  .select('id', { count: 'exact', head: true })
                  .in('conversation_id', conversationIds)
                  .gte('timestamp', periodStart);
                messageCount = count || 0;
              }

              return {
                tenantId: tenant.id,
                tenantName: tenant.name,
                messageCount,
                conversationCount: conversationIds.length
              };
            })
          );

          // Sort by message count descending
          messagesByTenant.sort((a, b) => b.messageCount - a.messageCount);
        }
      }

      return {
        totalMessages: messagesCount.count || 0,
        totalConversations: conversationsCount.count || 0,
        totalDocuments: documentsCount.count || 0,
        activeUsers: activeUsersCount.count || 0,
        messagesTrend: processTrendData(messagesTrend.data || [], 'timestamp'),
        conversationsTrend: processTrendData(conversationsTrend.data || [], 'created_at'),
        messagesByTenant,
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

  async getChatbotAnalytics(filters?: { tenantId?: string; userId?: string; period?: string }): Promise<ChatbotAnalyticsData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.getEmptyChatbotAnalytics();

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      let targetTenantId: string | null = null;
      let targetUserId: string | null = null;

      if (profile?.role === 'global_admin') {
        targetTenantId = filters?.tenantId || null;
        targetUserId = filters?.userId || null;
      } else {
        targetTenantId = profile?.tenant_id || null;
        targetUserId = filters?.userId || user.id;
      }

      const periodDays = filters?.period === '1day' ? 1 : filters?.period === '30days' ? 30 : filters?.period === '90days' ? 90 : 7;
      const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

      // Build chatbot usage query
      let usageQuery = supabase
        .from('chatbot_usage')
        .select('chatbot_id, model_used, response_time_ms, tokens_used, success, timestamp')
        .gte('timestamp', periodStart);

      if (targetUserId) {
        usageQuery = usageQuery.eq('user_id', targetUserId);
      }

      const { data: usageData } = await usageQuery;

      // Get chatbots with tenant filter
      let chatbotsQuery = supabase
        .from('chatbots')
        .select('id, name, tenant_id');

      if (targetTenantId) {
        chatbotsQuery = chatbotsQuery.eq('tenant_id', targetTenantId);
      }

      const { data: chatbots } = await chatbotsQuery;

      // Get conversations count per chatbot
      let conversationsQuery = supabase
        .from('conversations')
        .select('chatbot_id, created_at')
        .gte('created_at', periodStart);

      if (targetTenantId) {
        conversationsQuery = conversationsQuery.eq('tenant_id', targetTenantId);
      }

      if (targetUserId) {
        conversationsQuery = conversationsQuery.eq('user_id', targetUserId);
      }

      const { data: conversations } = await conversationsQuery;

      // Process chatbot analytics
      const chatbotMap = new Map<string, ChatbotAnalytics>();
      
      chatbots?.forEach(chatbot => {
        chatbotMap.set(chatbot.id, {
          chatbotId: chatbot.id,
          chatbotName: chatbot.name,
          totalMessages: 0,
          totalConversations: 0,
          averageResponseTime: 0,
          successRate: 0,
          totalTokens: 0,
          totalRequests: 0,
          failedRequests: 0,
        });
      });

      // Aggregate usage data
      let totalResponseTime = 0;
      let totalMessages = 0;
      let totalTokens = 0;
      let totalSuccessful = 0;
      let totalRequests = usageData?.length || 0;

      usageData?.forEach(usage => {
        if (usage.chatbot_id && chatbotMap.has(usage.chatbot_id)) {
          const chatbot = chatbotMap.get(usage.chatbot_id)!;
          chatbot.totalRequests++;
          chatbot.totalTokens += usage.tokens_used || 0;
          
          if (usage.success) {
            totalSuccessful++;
            totalMessages++;
            chatbot.totalMessages++;
          } else {
            chatbot.failedRequests++;
          }
          
          if (usage.response_time_ms) {
            totalResponseTime += usage.response_time_ms;
            chatbot.averageResponseTime = 
              (chatbot.averageResponseTime * (chatbot.totalMessages - 1) + usage.response_time_ms) / chatbot.totalMessages;
          }
        }
        
        totalTokens += usage.tokens_used || 0;
      });

      // Add conversation counts
      conversations?.forEach(conv => {
        if (conv.chatbot_id && chatbotMap.has(conv.chatbot_id)) {
          chatbotMap.get(conv.chatbot_id)!.totalConversations++;
        }
      });

      // Calculate success rates
      chatbotMap.forEach(chatbot => {
        if (chatbot.totalRequests > 0) {
          chatbot.successRate = ((chatbot.totalRequests - chatbot.failedRequests) / chatbot.totalRequests) * 100;
        }
      });

      // Process trend data
      const processTrendData = (data: any[]) => {
        const counts: { [key: string]: number } = {};
        
        for (let i = periodDays - 1; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          counts[date] = 0;
        }

        data?.forEach(item => {
          const date = new Date(item.timestamp).toISOString().split('T')[0];
          if (counts.hasOwnProperty(date) && item.success) {
            counts[date]++;
          }
        });

        return Object.entries(counts).map(([date, count]) => ({ date, count }));
      };

      return {
        chatbots: Array.from(chatbotMap.values()).sort((a, b) => b.totalMessages - a.totalMessages),
        totalMessages,
        averageResponseTime: totalMessages > 0 ? totalResponseTime / totalMessages : 0,
        overallSuccessRate: totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0,
        totalTokensUsed: totalTokens,
        messagesTrend: processTrendData(usageData || []),
      };
    } catch (error) {
      console.error('Error fetching chatbot analytics:', error);
      toast.error('Failed to load chatbot analytics');
      return this.getEmptyChatbotAnalytics();
    }
  }

  private getEmptyChatbotAnalytics(): ChatbotAnalyticsData {
    const emptyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return { date, count: 0 };
    });

    return {
      chatbots: [],
      totalMessages: 0,
      averageResponseTime: 0,
      overallSuccessRate: 0,
      totalTokensUsed: 0,
      messagesTrend: emptyTrend,
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