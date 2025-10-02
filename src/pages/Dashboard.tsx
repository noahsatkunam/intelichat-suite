import React from 'react';
import { MessageSquarePlus, Brain, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConversationOverview } from '@/components/dashboard/ConversationOverview';
import { TaskManagement } from '@/components/dashboard/TaskManagement';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleStartNewChat = () => {
    // In a real app, this would create a new conversation and navigate to it
    navigate('/chat'); // This would go to the chat interface
  };

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground mt-1">
                Your AI-powered workspace is ready. What would you like to accomplish today?
              </p>
            </div>
            <Button 
              onClick={handleStartNewChat}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
            >
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Start New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 overflow-y-auto h-[calc(100vh-140px)] chat-scroll">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Dashboard Widgets */}
          <DashboardWidgets />
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column - Conversations Overview */}
            <div className="space-y-6">
              <ConversationOverview />
              
              {/* Additional Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => navigate('/analytics')}
                  className="p-6 rounded-lg border bg-gradient-surface hover:shadow-medium transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] cursor-pointer group"
                >
                  <TrendingUp className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    View detailed insights and performance metrics
                  </p>
                </div>
                
                <div 
                  onClick={() => navigate('/admin/users')}
                  className="p-6 rounded-lg border bg-gradient-surface hover:shadow-medium transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] cursor-pointer group"
                >
                  <Users className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-foreground mb-2">Team Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage users, roles, and permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Task Management */}
            <div className="space-y-6">
              <TaskManagement />
              
              {/* AI Insights Card */}
              <div className="relative p-6 rounded-lg border bg-gradient-surface transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
                <Badge className="absolute top-4 right-4 z-10 text-xs bg-primary/80">
                  Coming Soon
                </Badge>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">AI Insights</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on your recent conversations, here are some intelligent recommendations:
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 rounded border bg-card/50">
                        <p className="text-sm text-foreground font-medium">
                          🎯 Focus Area: Enterprise Integration
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Multiple clients have asked about scalable AI solutions. Consider creating a standard integration guide.
                        </p>
                      </div>
                      <div className="p-3 rounded border bg-card/50">
                        <p className="text-sm text-foreground font-medium">
                          📊 Trending Topic: Database Migration
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Database-related queries increased by 40% this week. Performance optimization might be valuable.
                        </p>
                      </div>
                      <div className="p-3 rounded border bg-card/50">
                        <p className="text-sm text-foreground font-medium">
                          🔒 Emerging Need: Security Compliance
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          GDPR and SOC2 questions are becoming more frequent. Consider updating compliance resources.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-muted/20 backdrop-blur-[2px] rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}