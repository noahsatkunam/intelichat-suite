// Zyria Platform - Realistic Mock Data for Demonstrations

import { Message } from '@/components/chat/ChatInterface';

// Sample Chat Scenarios
export const mockChatScenarios = {
  customerService: [
    {
      id: 'cs-1',
      content: 'Hi! I need help with setting up my account permissions for our new team members.',
      sender: 'user' as const,
      timestamp: new Date(Date.now() - 300000),
      status: 'sent' as const,
    },
    {
      id: 'cs-2',
      content: 'I\'d be happy to help you set up account permissions! Based on your company\'s security policy documentation, I can guide you through the role-based access control system.\n\nHere are the available permission levels:\n- **Admin**: Full system access and user management\n- **Manager**: Department-level access with limited admin functions\n- **User**: Standard access with read/write permissions\n- **Viewer**: Read-only access to assigned resources\n\nWould you like me to walk you through setting up specific roles for your team?',
      sender: 'bot' as const,
      timestamp: new Date(Date.now() - 280000),
      status: 'sent' as const,
      sources: [
        {
          title: 'Enterprise Security Policy v2.1',
          url: '#security-policy',
          snippet: 'Role-based access control (RBAC) implementation guidelines for enterprise accounts...',
          confidence: 'high' as const,
          type: 'PDF',
          isKnowledgeBase: true,
        },
        {
          title: 'User Management Best Practices',
          url: '#user-management',
          snippet: 'Step-by-step guide for configuring user permissions and organizational hierarchy...',
          confidence: 'high' as const,
          type: 'DOCX',
          isKnowledgeBase: true,
        }
      ]
    }
  ],

  technicalSupport: [
    {
      id: 'ts-1',
      content: 'Our API integration is returning 429 errors intermittently. Can you help debug this?',
      sender: 'user' as const,
      timestamp: new Date(Date.now() - 180000),
      status: 'sent' as const,
    },
    {
      id: 'ts-2',
      content: 'A 429 error indicates rate limiting is being triggered. Let me analyze this based on your API documentation and current configuration.\n\n**Likely causes:**\n1. **Rate limit exceeded**: Your current plan allows 1000 requests/minute\n2. **Burst limits**: Individual IP addresses are limited to 100 requests/10 seconds\n3. **Concurrent connections**: Maximum 50 simultaneous connections\n\n**Recommended solutions:**\n```javascript\n// Implement exponential backoff\nconst retryRequest = async (url, options, retries = 3) => {\n  try {\n    const response = await fetch(url, options);\n    if (response.status === 429 && retries > 0) {\n      const delay = Math.pow(2, 3 - retries) * 1000;\n      await new Promise(resolve => setTimeout(resolve, delay));\n      return retryRequest(url, options, retries - 1);\n    }\n    return response;\n  } catch (error) {\n    throw error;\n  }\n};\n```\n\nWould you like me to review your current API usage patterns?',
      sender: 'bot' as const,
      timestamp: new Date(Date.now() - 120000),
      status: 'sent' as const,
      sources: [
        {
          title: 'API Rate Limiting Guide',
          url: '#api-limits',
          snippet: 'Comprehensive guide to API rate limits, error handling, and optimization strategies...',
          confidence: 'high' as const,
          type: 'PDF',
          isKnowledgeBase: true,
        }
      ]
    }
  ],

  sales: [
    {
      id: 's-1',
      content: 'What are the key differentiators between our Enterprise and Professional plans?',
      sender: 'user' as const,
      timestamp: new Date(Date.now() - 240000),
      status: 'sent' as const,
    },
    {
      id: 's-2',
      content: 'Great question! Here\'s a detailed comparison of our Enterprise vs Professional plans:\n\n**🏢 Enterprise Plan ($299/month)**\n- Unlimited users and conversations\n- Advanced knowledge base (100GB storage)\n- Custom AI model training\n- Single Sign-On (SSO) integration\n- 24/7 dedicated support\n- Advanced analytics & reporting\n- Multi-tenant architecture\n- Custom branding & white-labeling\n- API access & webhooks\n- Compliance certifications (SOC 2, ISO 27001)\n\n**💼 Professional Plan ($99/month)**\n- Up to 50 users\n- Standard knowledge base (10GB storage)\n- Pre-trained AI models\n- Email support\n- Basic analytics\n- Standard integrations\n\n**Key Enterprise advantages:**\n✅ **Scalability**: No user limits\n✅ **Customization**: Brand it as your own\n✅ **Security**: Enterprise-grade compliance\n✅ **Support**: Dedicated account manager\n\nWould you like me to schedule a demo to show these features in action?',
      sender: 'bot' as const,
      timestamp: new Date(Date.now() - 180000),
      status: 'sent' as const,
      sources: [
        {
          title: 'Zyria Pricing & Features Guide',
          url: '#pricing',
          snippet: 'Complete breakdown of feature sets and pricing tiers for all Zyria plans...',
          confidence: 'high' as const,
          type: 'PDF',
          isKnowledgeBase: true,
        }
      ]
    }
  ]
};

// Mock Knowledge Base Documents
export const mockKnowledgeBase = [
  {
    id: 'kb-1',
    title: 'Enterprise Security Policy v2.1',
    type: 'PDF',
    size: '2.4 MB',
    uploadDate: '2024-03-15',
    lastModified: '2024-03-20',
    status: 'processed',
    confidence: 'high',
    tags: ['security', 'policy', 'compliance'],
    summary: 'Comprehensive security framework including data protection, access controls, and incident response procedures.',
    pageCount: 45,
    language: 'en',
    category: 'Security & Compliance'
  },
  {
    id: 'kb-2',
    title: 'API Integration Guide',
    type: 'DOCX',
    size: '1.8 MB',
    uploadDate: '2024-03-18',
    lastModified: '2024-03-18',
    status: 'processed',
    confidence: 'high',
    tags: ['api', 'integration', 'development'],
    summary: 'Step-by-step guide for integrating with Zyria APIs, including authentication, rate limiting, and best practices.',
    pageCount: 28,
    language: 'en',
    category: 'Technical Documentation'
  },
  {
    id: 'kb-3',
    title: 'Customer Onboarding Playbook',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '2024-03-10',
    lastModified: '2024-03-22',
    status: 'processed',
    confidence: 'high',
    tags: ['onboarding', 'customer success', 'training'],
    summary: 'Complete playbook for customer onboarding, training materials, and success metrics.',
    pageCount: 67,
    language: 'en',
    category: 'Customer Success'
  },
  {
    id: 'kb-4',
    title: 'Compliance Requirements Matrix',
    type: 'XLSX',
    size: '856 KB',
    uploadDate: '2024-03-12',
    lastModified: '2024-03-19',
    status: 'processed',
    confidence: 'medium',
    tags: ['compliance', 'regulations', 'matrix'],
    summary: 'Detailed matrix of compliance requirements across different industries and regions.',
    pageCount: 12,
    language: 'en',
    category: 'Legal & Compliance'
  },
  {
    id: 'kb-5',
    title: 'Product Feature Roadmap 2024',
    type: 'PDF',
    size: '1.5 MB',
    uploadDate: '2024-03-08',
    lastModified: '2024-03-21',
    status: 'processing',
    confidence: 'high',
    tags: ['roadmap', 'features', 'planning'],
    summary: 'Strategic roadmap outlining planned features and improvements for 2024.',
    pageCount: 23,
    language: 'en',
    category: 'Product Strategy'
  }
];

// Mock User Profiles
export const mockUsers = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    role: 'Enterprise Admin',
    avatar: '/placeholder.svg',
    department: 'IT Operations',
    location: 'San Francisco, CA',
    joinDate: '2024-01-15',
    lastActive: new Date(Date.now() - 120000),
    status: 'active',
    permissions: ['admin', 'user_management', 'tenant_settings'],
    conversationCount: 247,
    documentsShared: 45
  },
  {
    id: 'user-2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@techcorp.com',
    role: 'Team Lead',
    avatar: '/placeholder.svg',
    department: 'Customer Success',
    location: 'Austin, TX',
    joinDate: '2024-02-03',
    lastActive: new Date(Date.now() - 300000),
    status: 'active',
    permissions: ['manager', 'team_access'],
    conversationCount: 189,
    documentsShared: 23
  },
  {
    id: 'user-3',
    name: 'Emily Watson',
    email: 'emily.watson@techcorp.com',
    role: 'Developer',
    avatar: '/placeholder.svg',
    department: 'Engineering',
    location: 'Boston, MA',
    joinDate: '2024-02-20',
    lastActive: new Date(Date.now() - 1800000),
    status: 'away',
    permissions: ['user', 'api_access'],
    conversationCount: 156,
    documentsShared: 67
  }
];

// Mock Analytics Data
export const mockAnalytics = {
  overview: {
    totalConversations: 1247,
    totalUsers: 89,
    documentsProcessed: 234,
    avgResponseTime: '1.2s',
    userSatisfaction: 4.7,
    knowledgeBaseAccuracy: 94
  },
  conversationTrends: [
    { date: '2024-03-01', conversations: 45, users: 23 },
    { date: '2024-03-02', conversations: 52, users: 28 },
    { date: '2024-03-03', conversations: 38, users: 19 },
    { date: '2024-03-04', conversations: 67, users: 34 },
    { date: '2024-03-05', conversations: 73, users: 41 },
    { date: '2024-03-06', conversations: 56, users: 29 },
    { date: '2024-03-07', conversations: 48, users: 25 },
  ],
  topQueries: [
    { query: 'API integration help', count: 89, category: 'Technical' },
    { query: 'Security policy questions', count: 67, category: 'Security' },
    { query: 'User management', count: 54, category: 'Administration' },
    { query: 'Billing inquiries', count: 43, category: 'Support' },
    { query: 'Feature requests', count: 38, category: 'Product' },
  ],
  departmentUsage: [
    { department: 'Engineering', usage: 35, color: '#8B5CF6' },
    { department: 'Customer Success', usage: 28, color: '#06B6D4' },
    { department: 'Sales', usage: 18, color: '#10B981' },
    { department: 'HR', usage: 12, color: '#F59E0B' },
    { department: 'Legal', usage: 7, color: '#EF4444' },
  ]
};

// Mock Workflow Automations
export const mockWorkflows = [
  {
    id: 'wf-1',
    name: 'New User Onboarding',
    description: 'Automatically guide new users through setup and training',
    status: 'active',
    trigger: 'User Registration',
    actions: ['Send Welcome Email', 'Create Training Playlist', 'Assign Buddy'],
    executions: 23,
    successRate: 96,
    lastRun: new Date(Date.now() - 3600000),
    category: 'User Management'
  },
  {
    id: 'wf-2',
    name: 'Document Processing Pipeline',
    description: 'Process uploaded documents and update knowledge base',
    status: 'active',
    trigger: 'Document Upload',
    actions: ['OCR Processing', 'Content Extraction', 'Index Creation'],
    executions: 156,
    successRate: 89,
    lastRun: new Date(Date.now() - 1800000),
    category: 'Knowledge Management'
  },
  {
    id: 'wf-3',
    name: 'Escalation Management',
    description: 'Automatically escalate complex queries to human agents',
    status: 'active',
    trigger: 'Low Confidence Response',
    actions: ['Create Ticket', 'Notify Agent', 'Set Priority'],
    executions: 45,
    successRate: 94,
    lastRun: new Date(Date.now() - 7200000),
    category: 'Support'
  }
];

// Demo Scenarios Configuration
export const demoScenarios = {
  'customer-service': {
    title: 'Customer Service Excellence',
    description: 'See how Zyria handles customer inquiries with context from your knowledge base',
    messages: mockChatScenarios.customerService,
    features: ['Knowledge Base Integration', 'Source Citations', 'Multi-step Guidance']
  },
  'technical-support': {
    title: 'Technical Support Assistant',
    description: 'Technical problem-solving with code examples and documentation references',
    messages: mockChatScenarios.technicalSupport,
    features: ['Code Generation', 'API Documentation', 'Error Analysis']
  },
  'sales-enablement': {
    title: 'Sales Enablement',
    description: 'Sales team support with product information and competitive analysis',
    messages: mockChatScenarios.sales,
    features: ['Product Knowledge', 'Competitive Intelligence', 'Sales Collateral']
  }
};

// Welcome Screen Content
export const welcomeContent = {
  hero: {
    title: 'Welcome to Zyria',
    subtitle: 'Enterprise AI Assistant Platform',
    description: 'Transform your organization with intelligent conversations powered by your own knowledge base.',
  },
  features: [
    {
      title: 'Intelligent Knowledge Base',
      description: 'Upload and process documents to create a powerful knowledge foundation.',
      icon: 'BookOpen'
    },
    {
      title: 'Enterprise Security',
      description: 'SOC 2 Type II compliant with advanced security controls.',
      icon: 'Shield'
    },
    {
      title: 'Multi-Tenant Architecture',
      description: 'Separate environments for different teams and departments.',
      icon: 'Building'
    },
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into usage patterns and performance.',
      icon: 'BarChart'
    }
  ],
  useCases: [
    {
      title: 'Customer Support',
      description: 'Provide instant, accurate responses to customer inquiries.',
      metrics: '67% faster resolution time'
    },
    {
      title: 'Internal Help Desk',
      description: 'Empower employees with self-service IT and HR support.',
      metrics: '43% reduction in tickets'
    },
    {
      title: 'Sales Enablement',
      description: 'Equip sales teams with instant access to product information.',
      metrics: '28% increase in close rate'
    }
  ]
};