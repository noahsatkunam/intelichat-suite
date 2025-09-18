import React, { useState, useRef, useEffect } from 'react';
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
import { ChevronDown, Search, Upload, BookOpen } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate message sending with potential failure
    try {
      // Update message status to sent
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, 500);

      // Simulate bot response
      setTimeout(() => {
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
              snippet: 'Based on your query, here are the most relevant resources...'
            }
          ]
        };

        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      // Handle error state
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
      ));
      setIsTyping(false);
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

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowNewMessageIndicator(!isAtBottom && messages.length > 0);
    }
  };

  const filteredMessages = messages.filter(msg =>
    searchQuery === '' || 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        
        <MessageSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={filteredMessages.length}
        />
        
        {/* Knowledge Base Controls */}
        <div className="px-4 py-3 bg-chat-header border-b border-chat-border">
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
                className="gap-2 hover:bg-accent"
                onClick={() => setShowKnowledgeSearch(true)}
              >
                <Search className="w-4 h-4" />
                Search KB
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-accent"
                onClick={() => setShowDocumentUpload(true)}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-accent"
                  onClick={() => setShowRelatedDocs(!showRelatedDocs)}
                >
                  <BookOpen className="w-4 h-4" />
                  Related Docs
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
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

          {/* New message indicator */}
          {showNewMessageIndicator && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 shadow-large bg-primary text-primary-foreground hover:bg-primary-dark animate-slide-up"
              onClick={() => scrollToBottom()}
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              New messages
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
    </div>
  );
}