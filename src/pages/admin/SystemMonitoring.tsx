import React, { useState } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Cpu, HardDrive, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock system monitoring data
const systemMetrics = {
  overview: {
    uptime: '99.97%',
    responseTime: '127ms',
    throughput: '2,847 req/min',
    errorRate: '0.03%',
    activeUsers: 156,
    totalRequests: 1245789
  },
  services: [
    { name: 'API Gateway', status: 'healthy', uptime: '99.99%', responseTime: '45ms', cpu: 23, memory: 67 },
    { name: 'Database', status: 'healthy', uptime: '99.95%', responseTime: '12ms', cpu: 45, memory: 78 },
    { name: 'Cache Layer', status: 'healthy', uptime: '99.98%', responseTime: '3ms', cpu: 12, memory: 34 },
    { name: 'Search Service', status: 'warning', uptime: '99.85%', responseTime: '234ms', cpu: 78, memory: 89 },
    { name: 'File Storage', status: 'healthy', uptime: '100%', responseTime: '67ms', cpu: 34, memory: 45 },
    { name: 'Message Queue', status: 'healthy', uptime: '99.97%', responseTime: '8ms', cpu: 19, memory: 23 }
  ],
  alerts: [
    { id: 1, severity: 'warning', service: 'Search Service', message: 'High response time detected', timestamp: '2 min ago', status: 'active' },
    { id: 2, severity: 'info', service: 'API Gateway', message: 'Scheduled maintenance completed', timestamp: '15 min ago', status: 'resolved' },
    { id: 3, severity: 'critical', service: 'Database', message: 'Connection pool exhausted', timestamp: '1 hour ago', status: 'resolved' }
  ],
  performance: {
    cpu: { current: 34, trend: 'up' },
    memory: { current: 67, trend: 'stable' },
    disk: { current: 45, trend: 'down' },
    network: { current: 78, trend: 'up' }
  }
};

export default function SystemMonitoring() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedService, setSelectedService] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value > 80) return 'text-red-600';
    if (value > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">System Monitoring</h1>
              <p className="text-muted-foreground">Monitor system health, performance metrics, and service status</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <Clock className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">Last 5m</SelectItem>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Activity className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="text-xl font-bold text-green-600">{systemMetrics.overview.uptime}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-xl font-bold">{systemMetrics.overview.responseTime}</p>
                  </div>
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Throughput</p>
                    <p className="text-xl font-bold">{systemMetrics.overview.throughput}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <p className="text-xl font-bold text-green-600">{systemMetrics.overview.errorRate}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-xl font-bold">{systemMetrics.overview.activeUsers}</p>
                  </div>
                  <Activity className="w-6 h-6 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-xl font-bold">{systemMetrics.overview.totalRequests.toLocaleString()}</p>
                  </div>
                  <Server className="w-6 h-6 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-4">
              {systemMetrics.services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">Response: {service.responseTime}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>CPU Usage</span>
                          <span className={getPerformanceColor(service.cpu)}>{service.cpu}%</span>
                        </div>
                        <Progress value={service.cpu} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Memory Usage</span>
                          <span className={getPerformanceColor(service.memory)}>{service.memory}%</span>
                        </div>
                        <Progress value={service.memory} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(systemMetrics.performance.cpu.trend)}
                        <span className={`text-sm font-bold ${getPerformanceColor(systemMetrics.performance.cpu.current)}`}>
                          {systemMetrics.performance.cpu.current}%
                        </span>
                      </div>
                    </div>
                    <Progress value={systemMetrics.performance.cpu.current} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(systemMetrics.performance.memory.trend)}
                        <span className={`text-sm font-bold ${getPerformanceColor(systemMetrics.performance.memory.current)}`}>
                          {systemMetrics.performance.memory.current}%
                        </span>
                      </div>
                    </div>
                    <Progress value={systemMetrics.performance.memory.current} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(systemMetrics.performance.disk.trend)}
                        <span className={`text-sm font-bold ${getPerformanceColor(systemMetrics.performance.disk.current)}`}>
                          {systemMetrics.performance.disk.current}%
                        </span>
                      </div>
                    </div>
                    <Progress value={systemMetrics.performance.disk.current} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Network I/O</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(systemMetrics.performance.network.trend)}
                        <span className={`text-sm font-bold ${getPerformanceColor(systemMetrics.performance.network.current)}`}>
                          {systemMetrics.performance.network.current}%
                        </span>
                      </div>
                    </div>
                    <Progress value={systemMetrics.performance.network.current} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Connections</span>
                    <span className="font-semibold">47/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Query Response Time</span>
                    <span className="font-semibold">12ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                    <span className="font-semibold text-green-600">94.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Slow Queries</span>
                    <span className="font-semibold">3/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Database Size</span>
                    <span className="font-semibold">2.4 GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              {systemMetrics.alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium text-foreground">{alert.service}</span>
                        </div>
                        <span className="text-muted-foreground">{alert.message}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                        <Badge variant={alert.status === 'resolved' ? 'secondary' : 'destructive'}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}