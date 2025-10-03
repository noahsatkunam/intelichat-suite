import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tenant_id: string | null;
  chatbot_id: string | null;
  chatbot?: {
    name: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    timestamp: string;
  };
}

export const conversationService = {
  async fetchUserConversations(userId: string, tenantId: string | null): Promise<Conversation[]> {
    const query = supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        user_id,
        tenant_id,
        chatbot_id,
        chatbots:chatbot_id (
          name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    // Only filter by tenant_id if it's not null (for non-global admins)
    if (tenantId !== null) {
      query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Fetch last message for each conversation
    const conversationsWithMessages = await Promise.all(
      (data || []).map(async (conv: any) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('content, timestamp')
          .eq('conversation_id', conv.id)
          .is('deleted_at', null)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle() to handle 0 rows gracefully

        return {
          ...conv,
          chatbot: conv.chatbots,
          last_message: messages
            ? {
                content: messages.content,
                timestamp: messages.timestamp,
              }
            : undefined,
        };
      })
    );

    return conversationsWithMessages;
  },

  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw error;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    // Soft delete: Set deleted_at timestamp for messages
    const { error: messagesError } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .is('deleted_at', null);

    if (messagesError) throw messagesError;

    // Soft delete: Set deleted_at timestamp for conversation
    const { error } = await supabase
      .from('conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw error;
  },

  async fetchConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },
};
