import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bot, Clock, MessageSquare, Filter, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { conversationService } from '@/services/conversationService';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  chatbot_id: string;
  user_id: string;
  chatbots?: {
    name: string;
    avatar_url: string | null;
  };
  profiles?: {
    name: string;
    email: string;
    tenant_id: string | null;
  };
}

interface Chatbot {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Tenant {
  id: string;
  name: string;
}

export default function RecentConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatbot, setSelectedChatbot] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const isGlobalAdmin = userProfile?.role === 'global_admin';

  useEffect(() => {
    fetchRecentConversations();
    fetchChatbots();
    if (isGlobalAdmin) {
      fetchUsers();
      fetchTenants();
    }
  }, [isGlobalAdmin]);

  useEffect(() => {
    let filtered = conversations;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(conversation =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.chatbots?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isGlobalAdmin && conversation.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (isGlobalAdmin && conversation.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by chatbot
    if (selectedChatbot !== 'all') {
      filtered = filtered.filter(conversation => conversation.chatbot_id === selectedChatbot);
    }

    // Filter by user (global admin only)
    if (isGlobalAdmin && selectedUser !== 'all') {
      filtered = filtered.filter(conversation => conversation.user_id === selectedUser);
    }

    // Filter by tenant (global admin only)
    if (isGlobalAdmin && selectedTenant !== 'all') {
      filtered = filtered.filter(conversation => conversation.profiles?.tenant_id === selectedTenant);
    }

    setFilteredConversations(filtered);
  }, [searchQuery, conversations, selectedChatbot, selectedUser, selectedTenant, isGlobalAdmin]);

  const fetchRecentConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('conversations')
        .select(`
          id,
          title,
          updated_at,
          chatbot_id,
          user_id,
          chatbots:chatbot_id (
            name,
            avatar_url
          )
        `)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      // If not global admin, filter by current user
      if (!isGlobalAdmin) {
        query = query.eq('user_id', user.id).limit(50);
      } else {
        query = query.limit(200);
      }

      const { data: conversationsData, error } = await query;

      if (error) throw error;

      // If global admin, fetch profile data separately
      if (isGlobalAdmin && conversationsData && conversationsData.length > 0) {
        const userIds = [...new Set(conversationsData.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email, tenant_id')
          .in('id', userIds);

        // Map profiles to conversations
        const conversationsWithProfiles = conversationsData.map(conv => ({
          ...conv,
          profiles: profilesData?.find(p => p.id === conv.user_id)
        }));

        setConversations(conversationsWithProfiles as any);
        setFilteredConversations(conversationsWithProfiles as any);
      } else {
        setConversations(conversationsData || []);
        setFilteredConversations(conversationsData || []);
      }
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setChatbots(data || []);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    navigate('/chat', { 
      state: { 
        conversationId: conversation.id, 
        chatbotId: conversation.chatbot_id 
      } 
    });
  };

  const handleRenameClick = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    setNewTitle(conversation.title);
    setRenameDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    setDeleteDialogOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!selectedConversation || !newTitle.trim()) return;

    try {
      await conversationService.updateConversationTitle(selectedConversation.id, newTitle.trim());
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, title: newTitle.trim() } 
            : conv
        )
      );
      
      toast.success('Conversation renamed successfully');
      setRenameDialogOpen(false);
      setSelectedConversation(null);
      setNewTitle('');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConversation) return;

    try {
      await conversationService.deleteConversation(selectedConversation.id);
      
      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      
      toast.success('Conversation deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Recent Conversations</h1>
              <p className="text-muted-foreground">
                {isGlobalAdmin ? 'View all conversations across the platform' : 'View and continue your chat history'}
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredConversations.length} / {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Search and Filters */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
              <SelectTrigger>
                <SelectValue placeholder="All Chatbots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chatbots</SelectItem>
                {chatbots.map((chatbot) => (
                  <SelectItem key={chatbot.id} value={chatbot.id}>
                    {chatbot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isGlobalAdmin && (
              <>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tenants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tenants</SelectItem>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No conversations match your search criteria. Try adjusting your search terms.
                </p>
              </>
            ) : (
              <>
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Conversations Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Start a new chat to begin your conversation history
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20"
                onClick={() => handleConversationClick(conversation)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {conversation.chatbots?.avatar_url ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.chatbots.avatar_url} alt="Chatbot" />
                          <AvatarFallback>
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">
                          {conversation.title}
                        </CardTitle>
                        {conversation.chatbots?.name && (
                          <CardDescription className="text-xs truncate">
                            {conversation.chatbots.name}
                          </CardDescription>
                        )}
                        {isGlobalAdmin && conversation.profiles && (
                          <CardDescription className="text-xs truncate">
                            {conversation.profiles.name || conversation.profiles.email}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-card z-50">
                        <DropdownMenuItem 
                          onClick={(e) => handleRenameClick(e, conversation)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteClick(e, conversation)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeAgo(conversation.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new title for this conversation
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Conversation title"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedConversation?.title}"? This action cannot be undone and will permanently delete all messages in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
