// Zyria Demo Service - Realistic Simulations and Mock Responses

import { mockChatScenarios, demoScenarios, mockKnowledgeBase, mockAnalytics } from '@/data/mockData';
import { Message } from '@/components/chat/ChatInterface';

class DemoService {
  private isDemoMode = false;
  private currentScenario: string | null = null;
  private demoProgress: Record<string, number> = {};

  // Demo Mode Management
  toggleDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
    if (!enabled) {
      this.currentScenario = null;
      this.demoProgress = {};
    }
  }

  isDemoModeEnabled(): boolean {
    return this.isDemoMode;
  }

  // Scenario Management
  setCurrentScenario(scenarioId: string) {
    this.currentScenario = scenarioId;
    this.demoProgress[scenarioId] = 0;
  }

  getCurrentScenario(): string | null {
    return this.currentScenario;
  }

  getScenarioMessages(scenarioId: string): Message[] {
    const scenario = demoScenarios[scenarioId as keyof typeof demoScenarios];
    return scenario ? scenario.messages : [];
  }

  // Realistic AI Response Generation
  async generateDemoResponse(userMessage: string, scenario?: string): Promise<Message> {
    // Simulate realistic processing delay
    await this.simulateProcessingDelay();

    const responses = this.getDemoResponses(scenario || this.currentScenario);
    const response = this.selectBestResponse(userMessage, responses);

    return {
      id: Date.now().toString(),
      content: response.content,
      sender: 'bot',
      timestamp: new Date(),
      status: 'sent',
      sources: response.sources || [],
    };
  }

  private async simulateProcessingDelay(): Promise<void> {
    // Realistic typing/processing delays
    const baseDelay = 1000;
    const variableDelay = Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, baseDelay + variableDelay));
  }

  private getDemoResponses(scenario: string | null) {
    const responses = {
      'customer-service': [
        {
          content: `I'd be happy to help with your account setup! Based on your organization's security policies, I'll guide you through the role-based permissions system.

**Available User Roles:**
- **Administrator**: Full platform access and user management
- **Manager**: Department-level access with team oversight
- **Analyst**: Read/write access to assigned projects
- **Viewer**: Read-only access to shared resources

Would you like me to walk you through setting up specific permissions for your team members?`,
          sources: [
            {
              title: 'User Management Guide',
              url: '#user-guide',
              snippet: 'Complete guide to user roles and permission management...',
              confidence: 'high' as const,
              type: 'PDF',
              isKnowledgeBase: true,
            }
          ]
        },
        {
          content: `I can help you troubleshoot that login issue. Let me check the common solutions from our knowledge base:

**Quick Troubleshooting Steps:**
1. **Clear browser cache and cookies**
2. **Try incognito/private browsing mode**
3. **Check if your account is locked** (after 5 failed attempts)
4. **Verify your email format** (must match registration)

If these don't work, I can escalate to our technical team. Which step would you like to try first?`,
          sources: [
            {
              title: 'Login Troubleshooting Guide',
              url: '#login-help',
              snippet: 'Step-by-step solutions for common login and authentication issues...',
              confidence: 'high' as const,
              type: 'DOCX',
              isKnowledgeBase: true,
            }
          ]
        }
      ],
      'technical-support': [
        {
          content: `I can help you with that API integration issue. Based on your error description, this looks like a rate limiting problem.

**Common API Error Solutions:**

\`\`\`javascript
// Implement exponential backoff for 429 errors
const apiCall = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      const waitTime = Math.pow(2, 3 - retries) * 1000;
      console.log(\`Rate limited. Waiting \${waitTime}ms before retry...\`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return apiCall(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
\`\`\`

**Rate Limits:**
- Standard: 1000 requests/hour
- Burst: 100 requests/minute
- Concurrent: 10 connections

Would you like me to review your current API usage patterns?`,
          sources: [
            {
              title: 'API Rate Limiting Documentation',
              url: '#api-limits',
              snippet: 'Complete guide to API rate limits, error handling, and optimization strategies...',
              confidence: 'high' as const,
              type: 'PDF',
              isKnowledgeBase: true,
            }
          ]
        }
      ],
      'sales-enablement': [
        {
          content: `Great question about our enterprise features! Here's a comprehensive comparison that should help:

**🏢 Enterprise vs Professional Plans**

**Enterprise ($299/month):**
✅ **Unlimited users** (vs 50 user limit)
✅ **Advanced knowledge base** (100GB vs 10GB)
✅ **Custom AI model training**
✅ **Single Sign-On (SSO) integration**
✅ **24/7 dedicated support** (vs email only)
✅ **Advanced analytics & reporting**
✅ **Multi-tenant architecture**
✅ **Custom branding & white-labeling**
✅ **Full API access & webhooks**
✅ **Compliance certifications** (SOC 2, ISO 27001)

**Key ROI Drivers:**
- **87% faster customer response time**
- **43% reduction in support tickets**
- **$50K+ annual savings** on support staff

Would you like me to schedule a personalized demo to show these features in action?`,
          sources: [
            {
              title: 'Enterprise Feature Comparison',
              url: '#enterprise-features',
              snippet: 'Detailed breakdown of enterprise features and ROI calculations...',
              confidence: 'high' as const,
              type: 'PDF',
              isKnowledgeBase: true,
            }
          ]
        }
      ]
    };

    return responses[scenario as keyof typeof responses] || responses['customer-service'];
  }

  private selectBestResponse(userMessage: string, responses: any[]): any {
    // Simple keyword matching for demo purposes
    const message = userMessage.toLowerCase();
    
    if (message.includes('api') || message.includes('integration') || message.includes('code')) {
      return responses.find(r => r.content.includes('API')) || responses[0];
    }
    
    if (message.includes('price') || message.includes('plan') || message.includes('enterprise')) {
      return responses.find(r => r.content.includes('Enterprise')) || responses[0];
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Document Processing Simulation
  async simulateDocumentProcessing(fileName: string): Promise<{
    progress: number;
    status: string;
    stage: string;
  }> {
    const stages = [
      'Uploading document...',
      'Extracting text content...',
      'Processing with OCR...',
      'Analyzing document structure...',
      'Creating embeddings...',
      'Indexing for search...',
      'Processing complete!'
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      const progress = ((i + 1) / stages.length) * 100;
      const status = i < stages.length - 1 ? 'processing' : 'completed';
      
      // Return intermediate progress
      if (i === Math.floor(stages.length / 2)) {
        return {
          progress,
          status,
          stage: stages[i]
        };
      }
    }

    return {
      progress: 100,
      status: 'completed',
      stage: 'Processing complete!'
    };
  }

  // Analytics Simulation
  generateRealtimeMetrics() {
    const base = mockAnalytics.overview;
    const variance = 0.05; // 5% variance
    
    return {
      activeUsers: Math.floor(23 + Math.random() * 10),
      avgResponseTime: (parseFloat(base.avgResponseTime) + (Math.random() - 0.5) * variance).toFixed(1) + 's',
      conversationsToday: Math.floor(67 + Math.random() * 20),
      knowledgeBaseQueries: Math.floor(145 + Math.random() * 30),
      userSatisfaction: (base.userSatisfaction + (Math.random() - 0.5) * 0.2).toFixed(1),
    };
  }

  // Search Results Simulation
  simulateKnowledgeSearch(query: string) {
    const relevantDocs = mockKnowledgeBase.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.summary.toLowerCase().includes(query.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    // Add some realistic scoring
    return relevantDocs.map(doc => ({
      ...doc,
      relevanceScore: 0.85 + Math.random() * 0.15,
      matchedSections: Math.floor(1 + Math.random() * 5)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Workflow Simulation
  async simulateWorkflowExecution(workflowId: string) {
    const steps = [
      'Initializing workflow...',
      'Validating conditions...',
      'Executing actions...',
      'Updating records...',
      'Sending notifications...',
      'Workflow completed successfully!'
    ];

    const results = [];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      results.push({
        step: i + 1,
        total: steps.length,
        message: steps[i],
        timestamp: new Date(),
        success: Math.random() > 0.1 // 90% success rate
      });
    }

    return results;
  }
}

export const demoService = new DemoService();