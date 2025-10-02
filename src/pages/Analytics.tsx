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
import { analyticsService, type AnalyticsData, type ChatbotAnalyticsData } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Analytics() {
  const { user, userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chatbotAnalytics, setChatbotAnalytics] = useState<ChatbotAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChatbotAnalytics, setLoadingChatbotAnalytics] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [chatbotFilterUser, setChatbotFilterUser] = useState<string>('all');
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isGlobalAdmin = userProfile?.role === 'global_admin';
  const isTenantAdmin = userProfile?.role === 'tenant_admin';

  useEffect(() => {
    loadAnalytics();
    if (isGlobalAdmin) {
      loadTenants();
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTenant, selectedUser, selectedPeriod]);

  useEffect(() => {
    if (selectedTenant && selectedTenant !== 'all') {
      loadUsers(selectedTenant);
    } else {
      setUsers([]);
      setSelectedUser('all');
      setChatbotFilterUser('all');
    }
  }, [selectedTenant]);

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const loadUsers = async (tenantId: string) => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('tenant_id', tenantId)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const filters: { tenantId?: string; userId?: string; period?: string } = {};
      
      if (selectedTenant !== 'all') {
        filters.tenantId = selectedTenant;
      }
      
      if (selectedUser !== 'all') {
        filters.userId = selectedUser;
      }

      filters.period = selectedPeriod;

      const data = await analyticsService.getAnalyticsData(filters);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatbotAnalytics = async () => {
    try {
      setLoadingChatbotAnalytics(true);
      const filters: { tenantId?: string; userId?: string; period?: string } = {};
      
      if (selectedTenant !== 'all') {
        filters.tenantId = selectedTenant;
      }
      
      if (chatbotFilterUser !== 'all') {
        filters.userId = chatbotFilterUser;
      }

      filters.period = selectedPeriod;

      const data = await analyticsService.getChatbotAnalytics(filters);
      setChatbotAnalytics(data);
    } catch (error) {
      console.error('Failed to load chatbot analytics:', error);
    } finally {
      setLoadingChatbotAnalytics(false);
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
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Analytics Data</h2>
          <p className="text-muted-foreground">Start using the platform to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Analytics & Insights</h1>
              <p className="text-muted-foreground">
                {isGlobalAdmin 
                  ? selectedTenant === 'all' 
                    ? 'Platform-wide analytics across all tenants'
                    : selectedUser === 'all'
                      ? `Analytics for ${tenants.find(t => t.id === selectedTenant)?.name || 'selected tenant'}`
                      : `Analytics for ${users.find(u => u.id === selectedUser)?.name || 'selected user'}`
                  : 'Monitor your AI assistant\'s performance and usage patterns'
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isGlobalAdmin && (
                <>
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Tenants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tenants</SelectItem>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTenant !== 'all' && (
                    <Select value={selectedUser} onValueChange={setSelectedUser} disabled={loadingUsers}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={loadingUsers ? "Loading users..." : "All Users"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">Last 1 day</SelectItem>
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
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={(value) => {
          if (value === 'conversations' && !chatbotAnalytics) {
            loadChatbotAnalytics();
          }
        }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">Chatbot Analytics</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20">
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

              <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-blue-500/40">
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

              <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-purple-500/40">
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

              <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-green-500/40">
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
              <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Message Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Messages over the {selectedPeriod === '1day' ? 'last day' : selectedPeriod === '7days' ? 'last 7 days' : selectedPeriod === '30days' ? 'last 30 days' : 'last 90 days'}
                  </p>
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

              <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-green-500/40">
                <CardHeader>
                  <CardTitle className="text-lg">Conversation Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    New conversations over the {selectedPeriod === '1day' ? 'last day' : selectedPeriod === '7days' ? 'last 7 days' : selectedPeriod === '30days' ? 'last 30 days' : 'last 90 days'}
                  </p>
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
            {/* Chatbot Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Chatbot Performance</h2>
                <p className="text-sm text-muted-foreground">Analyze chatbot usage and performance metrics</p>
              </div>
              {(isGlobalAdmin || isTenantAdmin) && (
                <Select value={chatbotFilterUser} onValueChange={(value) => {
                  setChatbotFilterUser(value);
                  loadChatbotAnalytics();
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loadingChatbotAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : !chatbotAnalytics || chatbotAnalytics.chatbots.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Chatbot Data</h3>
                  <p className="text-muted-foreground">
                    Start using your chatbots to see performance analytics
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Overall Metrics */}
                <div className="grid gap-6 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{chatbotAnalytics.totalMessages.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Across all chatbots</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(chatbotAnalytics.averageResponseTime)}ms</div>
                      <p className="text-xs text-muted-foreground">Average latency</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{chatbotAnalytics.overallSuccessRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Successful requests</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{chatbotAnalytics.totalTokensUsed.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total consumption</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Message Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Message Volume Trend</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Successful messages over {selectedPeriod === '1day' ? 'the last day' : selectedPeriod === '7days' ? 'the last 7 days' : selectedPeriod === '30days' ? 'the last 30 days' : 'the last 90 days'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chatbotAnalytics.messagesTrend.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.max((day.count / Math.max(...chatbotAnalytics.messagesTrend.map(d => d.count), 1)) * 100, 5)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{day.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Per Chatbot Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Chatbot Performance Breakdown</CardTitle>
                    <p className="text-sm text-muted-foreground">Individual chatbot metrics</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {chatbotAnalytics.chatbots.map((chatbot) => (
                        <div key={chatbot.chatbotId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{chatbot.chatbotName}</h3>
                            <Badge variant={chatbot.successRate >= 95 ? 'default' : chatbot.successRate >= 90 ? 'secondary' : 'destructive'}>
                              {chatbot.successRate.toFixed(1)}% Success
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Messages</p>
                              <p className="text-xl font-bold">{chatbot.totalMessages}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Conversations</p>
                              <p className="text-xl font-bold">{chatbot.totalConversations}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Avg Response</p>
                              <p className="text-xl font-bold">{Math.round(chatbot.averageResponseTime)}ms</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Tokens</p>
                              <p className="text-xl font-bold">{chatbot.totalTokens.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Failed</p>
                              <p className="text-xl font-bold text-destructive">{chatbot.failedRequests}</p>
                            </div>
                          </div>

                          {chatbot.totalMessages > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Performance</span>
                                <span className="font-medium">{chatbot.successRate.toFixed(1)}%</span>
                              </div>
                              <Progress value={chatbot.successRate} className="h-2" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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