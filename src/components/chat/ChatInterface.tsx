import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { MessageSearch } from './MessageSearch';
import { ReplyPreview } from './ReplyPreview';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

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
        snippet: 'Comprehensive guide to enterprise AI best practices and implementation strategies...'
      }
    ]
  },
  {
    id: '2',
    content: 'Can you help me understand how your knowledge integration works with `inline code` examples?',
    sender: 'user',
    timestamp: new Date(Date.now() - 5000),
    status: 'sent'
  },
  {
    id: '3',
    content: 'Absolutely! Zyria integrates with your enterprise knowledge base through advanced semantic search and retrieval. I provide real-time access to documentation, policies, and procedures with full source attribution. Every response includes verified citations so you can trust the information and explore deeper when needed.',
    sender: 'bot',
    timestamp: new Date(),
    status: 'sent',
    reactions: ['👍', '💡'],
    sources: [
      {
        title: 'Knowledge Integration Architecture',
        url: '#',
        snippet: 'Technical overview of Zyria semantic search and retrieval system for enterprise data...'
      },
      {
        title: 'Source Attribution Framework',
        url: '#',
        snippet: 'How Zyria ensures accurate citations and maintains data provenance across all responses...'
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
    <div className="flex flex-col h-screen bg-chat-background">
      <ChatHeader />
      
      <MessageSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultsCount={filteredMessages.length}
      />
      
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

      {showFileUpload && (
        <FileUpload 
          onClose={() => setShowFileUpload(false)}
          onUpload={(files) => {
            handleSendMessage("", files);
            setShowFileUpload(false);
          }}
        />
      )}

      <MessageInput 
        onSendMessage={handleSendMessage}
        onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}