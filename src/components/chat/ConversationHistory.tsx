import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { conversationService, Conversation } from '@/services/conversationService';
import { MessageSquare, Search, MoreVertical, Pencil, Trash2, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ConversationHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  currentConversationId?: string | null;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  onNewChat,
  currentConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
    const cleanup = subscribeToConversations();
    return cleanup;
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const tenantId = profile.role === 'global_admin' ? null : profile.tenant_id;
      const data = await conversationService.fetchUserConversations(user.id, tenantId);
      setConversations(data);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Subscribe to INSERT events for new conversations
      const insertChannel = supabase
        .channel('conversations-inserts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log('New conversation detected:', payload);
            // Fetch the full conversation with chatbot info
            const { data: newConv } = await supabase
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
              .eq('id', payload.new.id)
              .single();

            if (newConv) {
              // Prepend the new conversation to the list
              setConversations(prev => [{
                ...newConv,
                chatbot: newConv.chatbots,
              }, ...prev]);
            }
          }
        )
        .subscribe();

      // Subscribe to UPDATE events for title changes
      const updateChannel = supabase
        .channel('conversations-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Conversation updated:', payload);
            setConversations(prev =>
              prev.map(conv =>
                conv.id === payload.new.id
                  ? { ...conv, title: payload.new.title, updated_at: payload.new.updated_at }
                  : conv
              )
            );
          }
        )
        .subscribe();

      // Subscribe to DELETE events for conversation removal
      const deleteChannel = supabase
        .channel('conversations-deletes')
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Conversation deleted:', payload);
            setConversations(prev =>
              prev.filter(conv => conv.id !== payload.old.id)
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(insertChannel);
        supabase.removeChannel(updateChannel);
        supabase.removeChannel(deleteChannel);
      };
    };

    let cleanupFn: (() => void) | undefined;
    setupSubscription().then(cleanup => {
      if (cleanup) cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
    };
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query) ||
        conv.last_message?.content.toLowerCase().includes(query)
    );
    setFilteredConversations(filtered);
  };

  const handleDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await conversationService.deleteConversation(conversationToDelete);
      toast({
        title: 'Success',
        description: 'Conversation deleted',
      });
      fetchConversations();
      if (currentConversationId === conversationToDelete) {
        onNewChat();
      }
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </h2>
          <Button onClick={onNewChat} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
                  currentConversationId === conv.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                {conv.chatbot ? (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={conv.chatbot.avatar_url || ''} alt={conv.chatbot.name} />
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="w-4 h-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{conv.title}</h3>
                      {conv.chatbot && (
                        <p className="text-xs text-muted-foreground">{conv.chatbot.name}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conv.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {truncateText(conv.last_message.content, 60)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
