import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  reactions?: string[];
  replies?: Message[];
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
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    sender: 'bot',
    timestamp: new Date(Date.now() - 10000),
    sources: [
      {
        title: 'Enterprise AI Guidelines',
        url: '#',
        snippet: 'Best practices for AI-powered customer support...'
      }
    ]
  },
  {
    id: '2',
    content: 'Can you help me understand your knowledge base capabilities?',
    sender: 'user',
    timestamp: new Date(Date.now() - 5000),
  },
  {
    id: '3',
    content: 'Absolutely! I have access to comprehensive documentation, product guides, and troubleshooting resources. I can provide answers backed by verified sources and even suggest relevant documents for deeper reading.',
    sender: 'bot',
    timestamp: new Date(),
    reactions: ['👍', '💡'],
    sources: [
      {
        title: 'Knowledge Base Overview',
        url: '#',
        snippet: 'Our AI assistant leverages a curated knowledge base...'
      },
      {
        title: 'Source Attribution System',
        url: '#',
        snippet: 'Every response includes verified source citations...'
      }
    ]
  }
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      attachments: attachments?.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thank you for your message! I\'m processing your request and will provide a detailed response with relevant sources.',
        sender: 'bot',
        timestamp: new Date(),
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

  return (
    <div className="flex flex-col h-screen bg-chat-background">
      <ChatHeader />
      
      <div className="flex-1 overflow-hidden relative">
        <MessageList 
          messages={messages} 
          onReaction={handleReaction}
        />
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showFileUpload && (
        <FileUpload 
          onClose={() => setShowFileUpload(false)}
          onUpload={(files) => {
            // Handle file upload
            setShowFileUpload(false);
          }}
        />
      )}

      <MessageInput 
        onSendMessage={handleSendMessage}
        onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
      />
    </div>
  );
}