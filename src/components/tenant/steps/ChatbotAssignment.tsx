import React, { useState, useEffect } from 'react';
import { Search, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  is_active: boolean;
}

interface ChatbotAssignmentProps {
  data: any;
  onDataChange: (data: any) => void;
  editingTenantId?: string;
}

export default function ChatbotAssignment({ data, onDataChange, editingTenantId }: ChatbotAssignmentProps) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (editingTenantId) {
      fetchAssignedChatbots();
    }
  }, [editingTenantId]);

  const fetchChatbots = async () => {
    try {
      const { data: chatbotsData, error } = await supabase
        .from('chatbots')
        .select('id, name, description, avatar_url, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setChatbots(chatbotsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load chatbots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedChatbots = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from('chatbot_tenants')
        .select('chatbot_id')
        .eq('tenant_id', editingTenantId);

      if (error) throw error;
      
      const assignedIds = assignments?.map(a => a.chatbot_id) || [];
      onDataChange({ chatbot_ids: assignedIds });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load assigned chatbots",
        variant: "destructive"
      });
    }
  };

  const filteredChatbots = chatbots.filter(chatbot =>
    chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chatbot.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleChatbot = (chatbotId: string) => {
    const currentIds = data.chatbot_ids || [];
    const newIds = currentIds.includes(chatbotId)
      ? currentIds.filter((id: string) => id !== chatbotId)
      : [...currentIds, chatbotId];
    
    onDataChange({ chatbot_ids: newIds });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading chatbots...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Assign Chatbots</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select which chatbots users in this tenant can access
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chatbots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredChatbots.map((chatbot) => {
          const isSelected = (data.chatbot_ids || []).includes(chatbot.id);
          
          return (
            <Card 
              key={chatbot.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => handleToggleChatbot(chatbot.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleChatbot(chatbot.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chatbot.avatar_url || ''} />
                    <AvatarFallback>
                      <Bot className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-medium cursor-pointer">
                        {chatbot.name}
                      </Label>
                      {chatbot.is_active && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                    {chatbot.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {chatbot.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredChatbots.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No chatbots match your search' : 'No chatbots available'}
            </p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {(data.chatbot_ids || []).length} chatbot(s) selected
      </div>
    </div>
  );
}
