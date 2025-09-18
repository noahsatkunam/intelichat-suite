import React from 'react';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockAnalytics = {
  overview: {
    totalConversations: 2847,
    activeUsers: 156,
    averageResponseTime: 1.2,
    satisfactionScore: 94.8,
    trends: {
      conversations: 12.5,
      users: 8.3,
      responseTime: -15.2,
      satisfaction: 2.1
    }
  },
  usage: [
    { name: 'Knowledge Base Queries', count: 1245, percentage: 43.8, color: 'bg-blue-500' },
    { name: 'Technical Support', count: 892, percentage: 31.3, color: 'bg-green-500' },
    { name: 'General Inquiries', count: 456, percentage: 16.0, color: 'bg-purple-500' },
    { name: 'API Documentation', count: 254, percentage: 8.9, color: 'bg-orange-500' },
  ],
  topicsToday: [
    { topic: 'Database Integration', mentions: 23, trend: 'up' },
    { topic: 'Security Compliance', mentions: 18, trend: 'up' },
    { topic: 'Performance Issues', mentions: 15, trend: 'down' },
    { topic: 'API Rate Limits', mentions: 12, trend: 'up' },
    { topic: 'User Management', mentions: 9, trend: 'stable' },
  ]
};

export default function Analytics() {
  const { overview, usage, topicsToday } = mockAnalytics;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTrend = (value: number) => {
    const isPositive = value > 0;
    return {
      value: Math.abs(value),
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? TrendingUp : TrendingDown
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Monitor usage, performance, and user engagement</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="7d">
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Conversations
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {overview.totalConversations.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{overview.trends.conversations}% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {overview.activeUsers}
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{overview.trends.users}% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Response Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {overview.averageResponseTime}s
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {Math.abs(overview.trends.responseTime)}% faster
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Satisfaction Score
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {overview.satisfactionScore}%
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{overview.trends.satisfaction}% from last period
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Query Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usage.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {item.percentage}% of total
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Trending Topics Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topicsToday.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div className="flex items-center gap-3">
                          {getTrendIcon(topic.trend)}
                          <span className="font-medium text-foreground">{topic.topic}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {topic.mentions} mentions
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Usage Analytics</h3>
              <p className="text-muted-foreground">
                Detailed usage analytics and user behavior insights will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Performance Metrics</h3>
              <p className="text-muted-foreground">
                System performance metrics and optimization recommendations will be shown here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}