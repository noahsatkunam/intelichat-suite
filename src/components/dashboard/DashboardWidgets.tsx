import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  MessageSquare,
  Clock,
  Brain,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: React.ReactNode;
}

function MetricCard({ title, value, description, trend, icon }: MetricCardProps) {
  return (
    <Card className="hover:shadow-soft transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`w-3 h-3 mr-1 ${
              trend.direction === 'up' ? 'text-success' : 'text-destructive'
            }`} />
            <span className={`text-xs ${
              trend.direction === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {trend.value > 0 ? '+' : ''}{trend.value}% from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SystemNotificationProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
}

function SystemNotification({ title, message, type, timestamp }: SystemNotificationProps) {
  const getTypeConfig = (type: SystemNotificationProps['type']) => {
    switch (type) {
      case 'success':
        return { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
      case 'warning':
        return { color: 'text-warning', bg: 'bg-warning/10', icon: AlertCircle };
      case 'error':
        return { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertCircle };
      default:
        return { color: 'text-primary', bg: 'bg-primary/10', icon: Activity };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg border ${config.bg} hover:shadow-soft transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)]`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
          <p className="text-xs text-muted-foreground mt-2">{timestamp}</p>
        </div>
      </div>
    </div>
  );
}

interface DashboardWidgetsProps {
  className?: string;
}

export function DashboardWidgets({ className }: DashboardWidgetsProps) {
  const [activeConversations, setActiveConversations] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch active conversations count
      const { count: convCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch completed tasks this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('updated_at', weekAgo.toISOString());

      setActiveConversations(convCount || 0);
      setCompletedTasks(taskCount || 0);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const notifications: SystemNotificationProps[] = [
    {
      title: 'New AI Provider Available',
      message: 'Claude-3.5 Sonnet has been added to your available models',
      type: 'success',
      timestamp: '10 minutes ago'
    },
    {
      title: 'API Rate Limit Warning',
      message: 'Approaching 80% of your monthly OpenAI quota',
      type: 'warning',
      timestamp: '2 hours ago'
    },
    {
      title: 'System Maintenance Scheduled',
      message: 'Brief maintenance window scheduled for tonight at 2 AM UTC',
      type: 'info',
      timestamp: '1 day ago'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Conversations"
          value={loading ? '...' : activeConversations}
          description="Ongoing AI interactions"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        
        <MetricCard
          title="Completed Tasks"
          value={loading ? '...' : completedTasks}
          description="Tasks finished this week"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        
        <div className="relative">
          <Badge className="absolute top-2 right-2 z-10 text-xs bg-primary/80">
            Coming Soon
          </Badge>
          <MetricCard
            title="AI Responses"
            value="1.2s"
            description="Average response time"
            icon={<Brain className="w-4 h-4" />}
          />
          <div className="absolute inset-0 bg-muted/20 backdrop-blur-[2px] rounded-lg" />
        </div>
        
        <div className="relative">
          <Badge className="absolute top-2 right-2 z-10 text-xs bg-primary/80">
            Coming Soon
          </Badge>
          <MetricCard
            title="Active Users"
            value={8}
            description="Team members online"
            icon={<Users className="w-4 h-4" />}
          />
          <div className="absolute inset-0 bg-muted/20 backdrop-blur-[2px] rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="relative">
          <Badge className="absolute top-4 right-4 z-10 text-xs bg-primary/80">
            Coming Soon
          </Badge>
          <Card className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">System Status</CardTitle>
              <CardDescription>Current performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Health</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Model Availability</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <Activity className="w-3 h-3 mr-1" />
                    All Online
                  </Badge>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Usage</span>
                  <span className="text-muted-foreground">65% used</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Quota</span>
                  <span className="text-muted-foreground">78% consumed</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <div className="absolute inset-0 bg-muted/20 backdrop-blur-[2px] rounded-lg" />
        </div>

        {/* System Notifications */}
        <div className="relative">
          <Badge className="absolute top-4 right-4 z-10 text-xs bg-primary/80">
            Coming Soon
          </Badge>
          <Card className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">System Notifications</CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto chat-scroll">
                {notifications.map((notification, index) => (
                  <SystemNotification key={index} {...notification} />
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="absolute inset-0 bg-muted/20 backdrop-blur-[2px] rounded-lg" />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => navigate('/chat')}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] group text-left"
            >
              <MessageSquare className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">New Chat</p>
              <p className="text-xs text-muted-foreground">Start conversation</p>
            </button>
            
            <button 
              onClick={() => navigate('/admin/ai-providers')}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] group text-left"
            >
              <Brain className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">AI Models</p>
              <p className="text-xs text-muted-foreground">Manage providers</p>
            </button>
            
            <button 
              onClick={() => navigate('/admin/users')}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] group text-left"
            >
              <Users className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Team</p>
              <p className="text-xs text-muted-foreground">Manage users</p>
            </button>
            
            <button 
              onClick={() => navigate('/analytics')}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05)] group text-left"
            >
              <Activity className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-muted-foreground">View reports</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}