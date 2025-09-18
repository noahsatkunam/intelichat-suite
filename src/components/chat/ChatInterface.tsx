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
import { ChatEmptyState } from '@/components/ui/empty-state';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { ChevronDown, Search, Upload, BookOpen, MessageSquarePlus } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  reactions?: string[];
  replies?: Message[];
  replyTo?: string; // ID of message being replied to
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

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I am Zyria, your enterprise AI assistant. I can help you with complex queries, access our knowledge base, and provide detailed information with source citations. How can I assist you today?\n\nHere is an example of code syntax highlighting:\n\n```javascript\nfunction greetUser(name) {\n  return `Hello, ${name}! Welcome to Zyria.`;\n}\n\nconsole.log(greetUser("Enterprise User"));\n```',
    sender: 'bot',
    timestamp: new Date(Date.now() - 10000),
    status: 'sent',
    sources: [
      {
        title: 'Zyria Enterprise Guidelines',
        url: '#',
        snippet: 'Comprehensive guide to enterprise AI best practices and implementation strategies...',
        confidence: 'high',
        type: 'PDF',
        isKnowledgeBase: true
      }
    ]
  },
  {
    id: '2',
    content: 'Can you help me understand our security compliance requirements for the new project?',
    sender: 'user',
    timestamp: new Date(Date.now() - 5000),
    status: 'sent'
  },
  {
    id: '3',
    content: 'Based on your enterprise documentation, I can provide comprehensive information about your security compliance requirements. Your organization follows SOC 2 Type II standards with additional ISO 27001 controls.\n\nKey requirements include:\n- Multi-factor authentication for all systems\n- Data encryption in transit and at rest\n- Regular security audits and penetration testing\n- Incident response procedures\n\nI have found several relevant documents that provide detailed implementation guidance.',
    sender: 'bot',
    timestamp: new Date(),
    status: 'sent',
    reactions: ['👍', '💡'],
    sources: [
      {
        title: 'Enterprise Security Policy',
        url: '#',
        snippet: 'Complete security policy framework including SOC 2 Type II compliance requirements and implementation guidelines...',
        confidence: 'high',
        type: 'PDF',
        isKnowledgeBase: true
      },
      {
        title: 'ISO 27001 Implementation Guide',
        url: '#',
        snippet: 'Step-by-step implementation guide for ISO 27001 information security management system controls...',
        confidence: 'high',
        type: 'DOCX',
        isKnowledgeBase: true
      }
    ]
  }
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
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

  useEffect(() => {
    scrollToBottom();
    
    // Update unread count when new messages arrive
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
    const newMessage: Message = {
      id: Date.now().toString(),
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

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setIsTyping(true);

    // Simulate message sending with enhanced feedback
    try {
      // Show sending feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update message status to sent
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
      
      notifyMessageSent();

      // Notify about file uploads
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => notifyFileUploaded(file.name));
      }

      // Simulate bot response with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: replyingTo 
          ? `Regarding your message "${replyingTo.content.substring(0, 50)}..." - I understand your question and here's my detailed response with relevant sources.`
          : "Thank you for your message! I'm processing your request and will provide a detailed response with relevant sources.",
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
        replyTo: replyingTo?.id,
        sources: [
          {
            title: 'Related Documentation',
            url: '#',
            snippet: 'Based on your query, here are the most relevant resources...',
            confidence: 'high' as const,
            type: 'PDF'
          }
        ]
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
    } catch (error) {
      // Enhanced error handling
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
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
      
      // Auto-mark as read when scrolled to bottom
      if (isAtBottom) {
        markMessagesAsRead();
      }
    }
  }, [unreadCount, markMessagesAsRead]);

  const handleClearChat = () => {
    setMessages([]);
    setUnreadCount(0);
    setLastSeenMessageId(null);
    setShowClearConfirm(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setReplyingTo(null);
    setSearchQuery('');
    setUnreadCount(0);
    setLastSeenMessageId(null);
  };

  const filteredMessages = messages.filter(msg =>
    searchQuery === '' || 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LoadingOverlay isLoading={isLoading}>
      <div className="flex h-screen bg-chat-background">
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
            <ChatEmptyState
              onAction={handleNewChat}
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
          onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {/* Related Documents Sidebar */}
      {showRelatedDocs && (
        <div className="w-80 border-l border-chat-border bg-chat-surface">
          <div className="h-full overflow-hidden">
            <RelatedDocuments 
              documents={[]}
              onDocumentSelect={(doc) => {
                // Handle document selection
                console.log('Selected document:', doc);
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showFileUpload && (
        <FileUpload 
          onClose={() => setShowFileUpload(false)}
          onUpload={(files) => {
            handleSendMessage("", files);
            setShowFileUpload(false);
          }}
        />
      )}

      <KnowledgeSearchOverlay
        isOpen={showKnowledgeSearch}
        onClose={() => setShowKnowledgeSearch(false)}
        onSelectDocument={(doc) => {
          // Handle document selection for insertion
          setShowKnowledgeSearch(false);
        }}
      />

      <DocumentUpload
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearChat}
        title="Clear chat history"
        description="Are you sure you want to clear all messages? This action cannot be undone."
        confirmText="Clear All"
        variant="destructive"
      />
      </div>
    </LoadingOverlay>
  );
}