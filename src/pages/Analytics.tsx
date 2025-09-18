import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Download,
  FileText
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { analyticsService, type AnalyticsData } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';

export default function Analytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time analytics updates
  useEffect(() => {
    const subscription = analyticsService.subscribeToAnalytics(() => {
      loadAnalytics(); // Refresh data when new analytics come in
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleExportData = () => {
    // Export analytics data as CSV
    if (!analyticsData) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Messages', analyticsData.totalMessages],
      ['Total Conversations', analyticsData.totalConversations],
      ['Total Documents', analyticsData.totalDocuments],
      ['Active Users', analyticsData.activeUsers],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'analytics-data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Analytics Data</h2>
          <p className="text-muted-foreground">Start using the platform to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Analytics & Insights</h1>
              <p className="text-muted-foreground">Monitor your AI assistant's performance and usage patterns</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalMessages.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Messages exchanged
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalConversations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <Activity className="inline h-3 w-3 mr-1" />
                    Total conversations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalDocuments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Documents indexed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <Users className="inline h-3 w-3 mr-1" />
                    Currently active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trends */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">Messages over the last 7 days</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.messagesTrend.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${Math.max((day.count / Math.max(...analyticsData.messagesTrend.map(d => d.count))) * 100, 5)}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{day.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversation Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">New conversations over the last 7 days</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.conversationsTrend.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.max((day.count / Math.max(...analyticsData.conversationsTrend.map(d => d.count))) * 100, 5)}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{day.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">Detailed conversation metrics and patterns</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Conversation Analytics</h3>
                  <p className="text-muted-foreground">
                    Detailed conversation analytics will be available as you use the platform more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">Document usage and search patterns</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Knowledge Base Analytics</h3>
                  <p className="text-muted-foreground">
                    Upload documents to see detailed knowledge base analytics and usage patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">System performance and response times</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                  <p className="text-muted-foreground">
                    Performance metrics will be available as the system processes more requests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}