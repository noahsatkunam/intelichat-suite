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
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

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
    // Delete messages first (due to foreign key)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) throw messagesError;

    // Then delete conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  },

  async fetchConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },
};
