import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { MessageSearch } from './MessageSearch';
import { ReplyPreview } from './ReplyPreview';
import { RelatedDocuments } from '@/components/knowledge/RelatedDocuments';
import { KnowledgeSearchOverlay } from '@/components/knowledge/KnowledgeSearchOverlay';
import { DocumentUpload } from '@/components/knowledge/DocumentUpload';
import { KnowledgeBaseToggle } from '@/components/knowledge/KnowledgeBaseToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { OnboardingTour, useOnboarding } from '@/components/onboarding/OnboardingTour';
import { QuickActionsModal } from '@/components/ui/quick-actions';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/ui/keyboard-shortcuts-help';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { conversationService, type Message as DBMessage } from '@/services/conversationService';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Search, Upload, BookOpen, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  reactions?: string[];
  replies?: Message[];
  replyTo?: string;
  status?: 'sending' | 'sent' | 'error';
  sources?: {
    title: string;
    url: string;
    snippet: string;
    confidence?: 'high' | 'medium' | 'low';
    type?: string;
    isKnowledgeBase?: boolean;
  }[];
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
}

export function ChatInterface() {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showRelatedDocs, setShowRelatedDocs] = useState(true);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { notifyMessageSent, notifyMessageError, notifyFileUploaded } = useToastNotifications();
  
  // UX Enhancement Hooks
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const { shortcuts, showHelp, setShowHelp, getShortcutDisplay } = useKeyboardShortcuts();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const markMessagesAsRead = useCallback(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      setLastSeenMessageId(latestMessage.id);
      setUnreadCount(0);
    }
  }, [messages]);

  // Convert DB message to UI message format
  const convertDbMessageToUiMessage = (dbMessage: DBMessage): Message => ({
    id: dbMessage.id,
    content: dbMessage.content,
    sender: dbMessage.role === 'user' ? 'user' : 'bot',
    timestamp: new Date(dbMessage.timestamp),
    status: 'sent',
    replyTo: dbMessage.metadata?.replyTo,
    reactions: dbMessage.metadata?.reactions || [],
    sources: dbMessage.metadata?.sources || []
  });

  // Load conversation messages
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      const dbMessages = await conversationService.getMessages(conversationId);
      const uiMessages = dbMessages.map(convertDbMessageToUiMessage);
      setMessages(uiMessages);
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new conversation
  const createNewConversation = async () => {
    try {
      const conversation = await conversationService.createConversation('New Chat');
      if (conversation) {
        setCurrentConversation(conversation.id);
        setMessages([]);
        return conversation.id;
      }
    } catch (error) {
      toast.error('Failed to create conversation');
    }
    return null;
  };

  // Real-time message subscription
  useEffect(() => {
    if (!currentConversation) return;

    const subscription = conversationService.subscribeToMessages(
      currentConversation,
      (newMessage) => {
        const uiMessage = convertDbMessageToUiMessage(newMessage);
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === uiMessage.id)) return prev;
          return [...prev, uiMessage];
        });
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
    
    if (messages.length > 0 && lastSeenMessageId) {
      const lastSeenIndex = messages.findIndex(m => m.id === lastSeenMessageId);
      if (lastSeenIndex !== -1) {
        const newMessages = messages.slice(lastSeenIndex + 1);
        setUnreadCount(newMessages.filter(m => m.sender === 'bot').length);
      }
    }
  }, [messages, lastSeenMessageId, scrollToBottom]);

  // Mark messages as read when user scrolls to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markMessagesAsRead();
        }
      },
      { threshold: 0.1 }
    );

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }

    return () => observer.disconnect();
  }, [markMessagesAsRead]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!user) return;

    // Validate attachments - 10MB limit per file
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error('File too large', {
            description: `${file.name} exceeds 10MB limit`
          });
          return;
        }
      }
      
      if (attachments.length > 10) {
        toast.error('Too many files', {
          description: 'Maximum 10 files per message'
        });
        return;
      }
    }

    // Create conversation if it doesn't exist
    let conversationId = currentConversation;
    if (!conversationId) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
    }

    // Create optimistic user message
    const tempUserId = `temp-user-${Date.now()}`;
    const userMessage: Message = {
      id: tempUserId,
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyingTo?.id,
      attachments: attachments?.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    // Create optimistic bot message for streaming
    const tempBotId = `temp-bot-${Date.now()}`;
    const botMessage: Message = {
      id: tempBotId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setReplyingTo(null);
    setIsTyping(true);

    try {
      // Send user message to database
      const dbUserMessage = await conversationService.sendMessage(
        conversationId,
        content,
        'user'
      );

      if (dbUserMessage) {
        // Replace temp user message with real one
        setMessages(prev => prev.map(msg =>
          msg.id === tempUserId ? convertDbMessageToUiMessage(dbUserMessage) : msg
        ));

        // Track analytics
        await analyticsService.trackMetric('message_sent', 1);
        notifyMessageSent();

        // Notify about file uploads
        if (attachments && attachments.length > 0) {
          attachments.forEach(file => notifyFileUploaded(file.name));
        }

        // Stream AI response with <100ms initial latency
        let streamedContent = '';
        let botMetadata: any = null;

        const streamStartTime = Date.now();
        let firstChunkReceived = false;

        try {
          const response = await fetch(
            'https://onvnvlnxmilotkxkfddu.supabase.co/functions/v1/ai-chat-stream',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                chatbot_id: null,
                message: content,
                conversation_id: conversationId,
                user_id: user?.id,
                use_knowledge_base: useKnowledgeBase
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (!firstChunkReceived && data.type === 'content') {
                      const latency = Date.now() - streamStartTime;
                      console.log(`[ChatInterface] First chunk latency: ${latency}ms`);
                      firstChunkReceived = true;
                    }

                    switch (data.type) {
                      case 'metadata':
                        botMetadata = {
                          provider: data.provider,
                          model: data.model,
                          sources: data.sources || []
                        };
                        break;

                      case 'content':
                        if (data.content) {
                          streamedContent += data.content;
                          // Update bot message with streaming content
                          setMessages(prev => prev.map(msg =>
                            msg.id === tempBotId
                              ? { ...msg, content: streamedContent, status: 'sending' }
                              : msg
                          ));
                        }
                        break;

                      case 'failover':
                        toast.info('Switching providers', {
                          description: data.message || 'Trying backup...'
                        });
                        break;

                      case 'error':
                        throw new Error(data.content || 'AI error');

                      case 'done':
                        // Update with final message including sources
                        setMessages(prev => prev.map(msg =>
                          msg.id === tempBotId
                            ? {
                                ...msg,
                                content: streamedContent,
                                status: 'sent',
                                sources: botMetadata?.sources || []
                              }
                            : msg
                        ));
                        setIsTyping(false);
                        break;
                    }
                  } catch (parseError) {
                    console.error('[ChatInterface] Parse error:', parseError);
                  }
                }
              }
            }
          }
        } catch (streamError) {
          console.error('[ChatInterface] Streaming error:', streamError);
          
          // Fallback error message
          const errorResponse = await conversationService.sendMessage(
            conversationId,
            'I apologize, but I encountered an issue. Please try again.',
            'assistant'
          );

          if (errorResponse) {
            setMessages(prev => prev.map(msg =>
              msg.id === tempBotId ? convertDbMessageToUiMessage(errorResponse) : msg
            ));
          }
          
          setIsTyping(false);
          notifyMessageError();
        }
      }
    } catch (error) {
      console.error('[ChatInterface] Send message error:', error);
      
      // Mark user message as error
      setMessages(prev => prev.filter(msg => msg.id !== tempBotId).map(msg =>
        msg.id === tempUserId ? { ...msg, status: 'error' } : msg
      ));
      
      setIsTyping(false);
      notifyMessageError();
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const hasReaction = reactions.includes(reaction);
        return {
          ...msg,
          reactions: hasReaction 
            ? reactions.filter(r => r !== reaction)
            : [...reactions, reaction]
        };
      }
      return msg;
    }));
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowNewMessageIndicator(!isAtBottom && unreadCount > 0);
      
      if (isAtBottom) {
        markMessagesAsRead();
      }
    }
  }, [unreadCount, markMessagesAsRead]);

  const handleClearChat = async () => {
    if (currentConversation) {
      await conversationService.deleteConversation(currentConversation);
    }
    setMessages([]);
    setCurrentConversation(null);
    setUnreadCount(0);
    setLastSeenMessageId(null);
    setShowClearConfirm(false);
  };

  const handleNewChat = async () => {
    const newConversationId = await createNewConversation();
    if (newConversationId) {
      setMessages([]);
      setReplyingTo(null);
      setSearchQuery('');
      setUnreadCount(0);
      setLastSeenMessageId(null);
    }
  };

  const filteredMessages = messages.filter(msg =>
    searchQuery === '' || 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LoadingOverlay isLoading={isLoading}>
      <div className="flex h-full bg-chat-background">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatHeader />
          
          <MessageSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultsCount={filteredMessages.length}
          />
          
          {/* Enhanced Knowledge Base Controls */}
          <div className="px-4 py-3 bg-chat-header border-b border-chat-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <KnowledgeBaseToggle
                  useKnowledgeBase={useKnowledgeBase}
                  onToggle={setUseKnowledgeBase}
                  className="flex-shrink-0"
                />
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-accent interactive-element"
                    onClick={() => setShowKnowledgeSearch(true)}
                  >
                    <Search className="w-4 h-4" />
                    Search KB
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-accent interactive-element"
                    onClick={() => setShowDocumentUpload(true)}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-accent interactive-element"
                    onClick={() => setShowRelatedDocs(!showRelatedDocs)}
                  >
                    <BookOpen className="w-4 h-4" />
                    Related Docs
                  </Button>
                </div>
              </div>
              
              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-accent interactive-element"
                  onClick={handleNewChat}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  New Chat
                </Button>
                
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-accent interactive-element"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    Clear
                  </Button>
                )}
                
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="unread-pulse bg-primary text-primary-foreground">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
            </div>
          </div>
        
        <div className="flex-1 overflow-hidden relative">
          {filteredMessages.length === 0 && !searchQuery ? (
            <EnhancedEmptyState
              variant="chat"
              onPrimaryAction={handleNewChat}
              className="h-full"
            />
          ) : (
            <div 
              ref={chatContainerRef}
              className="h-full overflow-y-auto chat-scroll"
              onScroll={handleScroll}
            >
              <MessageList 
                messages={filteredMessages} 
                onReaction={handleReaction}
                onReply={handleReply}
                replyingTo={replyingTo}
              />
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Enhanced new message indicator */}
          {showNewMessageIndicator && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 shadow-large bg-primary text-primary-foreground hover:bg-primary-dark animate-bounce-subtle interactive-element"
              onClick={() => {
                scrollToBottom();
                markMessagesAsRead();
              }}
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Reply preview */}
        {replyingTo && (
          <ReplyPreview 
            replyingTo={replyingTo}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        <MessageInput 
          onSendMessage={handleSendMessage}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
        />
        </div>

        {/* Side Panel for Related Documents */}
        {showRelatedDocs && (
          <div className="w-80 border-l border-chat-border bg-knowledge-panel">
            <RelatedDocuments 
              documents={[]}
              onDocumentSelect={(doc) => console.log('Selected document:', doc)}
            />
          </div>
        )}
      </div>

      {/* Modals and Overlays */}
      {showFileUpload && (
        <FileUpload 
          onClose={() => setShowFileUpload(false)}
          onUpload={(files) => {
            console.log('Files uploaded:', files);
            setShowFileUpload(false);
          }}
        />
      )}

      {showKnowledgeSearch && (
        <KnowledgeSearchOverlay 
          isOpen={showKnowledgeSearch}
          onClose={() => setShowKnowledgeSearch(false)}
          onSelectDocument={(doc) => console.log('Selected document:', doc)}
        />
      )}

      {showDocumentUpload && (
        <DocumentUpload 
          isOpen={showDocumentUpload}
          onClose={() => setShowDocumentUpload(false)} 
        />
      )}

      {showClearConfirm && (
        <ConfirmationModal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearChat}
          title="Clear Chat"
          description="Are you sure you want to clear this chat? This action cannot be undone."
          confirmText="Clear Chat"
          cancelText="Cancel"
        />
      )}

      {showOnboarding && (
        <OnboardingTour
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}

      <QuickActionsModal />

      {showHelp && (
        <KeyboardShortcutsHelp
          isOpen={showHelp}
          shortcuts={shortcuts}
          onClose={() => setShowHelp(false)}
          getShortcutDisplay={getShortcutDisplay}
        />
      )}
    </LoadingOverlay>
  );
}