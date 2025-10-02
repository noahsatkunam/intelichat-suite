import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Paperclip, X, ChevronRight, Settings, BookOpen, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageList } from './MessageList';
import { ChatSettingsPanel } from './ChatSettingsPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{ name: string; url: string; size: number }>;
  citations?: Array<{ title: string; url?: string }>;
}

interface ConversationInterfaceProps {
  chatbotId: string;
  chatbotName: string;
  onBack: () => void;
  existingConversationId?: string | null;
  existingMessages?: any[];
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  chatbotId,
  chatbotName,
  onBack,
  existingConversationId,
  existingMessages,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(existingConversationId || null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (existingConversationId && existingMessages) {
      // Load existing conversation
      setConversationId(existingConversationId);
      const formattedMessages: Message[] = existingMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        attachments: msg.metadata?.attachments,
        citations: msg.metadata?.citations,
      }));
      setMessages(formattedMessages);
    } else if (!existingConversationId) {
      // Clear state when starting a new conversation
      setConversationId(null);
      setMessages([]);
      setInputMessage('');
      setAttachments([]);
      setIsLoading(false);
    }
    // Don't create conversation on mount - wait for first message
    checkUserRole();
  }, [chatbotId, existingConversationId, existingMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const isAdmin = () => {
    return userRole === 'global_admin' || userRole === 'tenant_admin';
  };

  const createConversationWithMessage = async (userMessage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      // Allow null tenant_id for global admins, but require it for other users
      if (!profile) return null;
      if (profile.role !== 'global_admin' && !profile.tenant_id) return null;

      // Pre-generate an ID so we don't need to SELECT (which can be blocked by RLS)
      const newConversationId = (window.crypto && 'randomUUID' in window.crypto)
        ? window.crypto.randomUUID()
        : `${user.id}-${Date.now()}`;

      // Use first 50 chars of user message as title
      const initialTitle = userMessage.length > 50 
        ? userMessage.substring(0, 50) + '...' 
        : userMessage;

      // Create a new conversation (no .select() to avoid SELECT RLS on return)
      const { error } = await supabase
        .from('conversations')
        .insert({
          id: newConversationId,
          user_id: user.id,
          tenant_id: profile.tenant_id ?? null, // Can be null for global admins
          chatbot_id: chatbotId,
          title: initialTitle,
        });

      if (error) throw error;
      return newConversationId;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  };

  const generateConversationTitle = async (conversationId: string, messageHistory: Message[]) => {
    try {
      // Generate a better title after 3+ messages
      if (messageHistory.length < 3) return;

      const conversationText = messageHistory
        .slice(0, 5) // Use first 5 messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('generate-title', {
        body: { conversation: conversationText }
      });

      if (error) throw error;

      if (data?.title) {
        await supabase
          .from('conversations')
          .update({ 
            title: data.title,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Error generating title:', error);
      // Don't show toast - this is a background operation
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<Array<{ name: string; url: string; size: number }>> => {
    if (attachments.length === 0) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const uploadedFiles = [];

    for (const file of attachments) {
      const fileName = `${conversationId}/${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      uploadedFiles.push({
        name: file.name,
        url: publicUrl,
        size: file.size
      });
    }

    return uploadedFiles;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    try {
      setIsLoading(true);

      // Create conversation on first message if it doesn't exist
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        activeConversationId = await createConversationWithMessage(inputMessage);
        if (!activeConversationId) {
          toast({
            title: "Error",
            description: "Failed to create conversation",
            variant: "destructive"
          });
          return;
        }
        setConversationId(activeConversationId);
      }

      // Upload attachments first
      const uploadedFiles = await uploadAttachments();

      // Create user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: inputMessage,
        timestamp: new Date(),
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setAttachments([]);

      // Save user message to database
      await supabase.from('messages').insert({
        conversation_id: activeConversationId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'user',
        content: inputMessage,
        metadata: uploadedFiles.length > 0 ? { attachments: uploadedFiles } : {}
      });

      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          chatbot_id: chatbotId,
          message: inputMessage,
          conversation_id: activeConversationId,
          attachments: uploadedFiles
        }
      });

      if (error) throw error;

      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
        citations: data.citations || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from('messages').insert({
        conversation_id: activeConversationId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'assistant',
        content: data.response,
        metadata: { citations: data.citations || [] }
      });

      // Generate better title after a few messages
      const updatedMessages = [...messages, userMessage, assistantMessage];
      if (updatedMessages.length >= 3 && updatedMessages.length <= 6) {
        generateConversationTitle(activeConversationId, updatedMessages);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 flex-shrink-0 bg-card/30 backdrop-blur-sm rounded-br-2xl">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{chatbotName}</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            {isPanelOpen ? 'Hide' : 'Show'} Settings
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-6">
          <Card className="border-2 shadow-lg">
            <CardContent className="p-4">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="secondary" className="gap-2 pr-1">
                      <span className="max-w-[200px] truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="*/*"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  rows={1}
                  className="resize-none min-h-[40px] max-h-[200px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
                  className="gap-2 bg-gradient-primary hover:shadow-glow"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Panel */}
      {isPanelOpen && (
        <ChatSettingsPanel
          chatbotId={chatbotId}
          isAdmin={isAdmin()}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
};
