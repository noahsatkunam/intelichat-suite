import React, { useState } from 'react';
import { Activity, Search, Filter, Download, User, Shield, Database, Settings, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Mock audit log data
const mockAuditLogs = [
  {
    id: 1,
    timestamp: '2024-01-15 14:32:45',
    user: 'john.smith@company.com',
    action: 'User Login',
    category: 'Authentication',
    resource: 'Dashboard',
    ip: '192.168.1.100',
    userAgent: 'Chrome 120.0.0.0',
    status: 'Success',
    details: 'Successful login from new device'
  },
  {
    id: 2,
    timestamp: '2024-01-15 14:30:12',
    user: 'sarah.j@company.com',
    action: 'User Created',
    category: 'User Management',
    resource: 'User: mike.davis@company.com',
    ip: '192.168.1.101',
    userAgent: 'Chrome 120.0.0.0',
    status: 'Success',
    details: 'New user account created with Manager role'
  },
  {
    id: 3,
    timestamp: '2024-01-15 14:28:33',
    user: 'admin@company.com',
    action: 'Permission Modified',
    category: 'Security',
    resource: 'Role: Manager',
    ip: '192.168.1.102',
    userAgent: 'Firefox 121.0.0.0',
    status: 'Success',
    details: 'Added database write permissions to Manager role'
  },
  {
    id: 4,
    timestamp: '2024-01-15 14:25:19',
    user: 'lisa.w@company.com',
    action: 'Data Export',
    category: 'Data Access',
    resource: 'User Report',
    ip: '192.168.1.103',
    userAgent: 'Safari 17.2.1',
    status: 'Success',
    details: 'Exported user data to CSV format'
  },
  {
    id: 5,
    timestamp: '2024-01-15 14:20:45',
    user: 'unknown',
    action: 'Failed Login',
    category: 'Authentication',
    resource: 'Dashboard',
    ip: '203.0.113.195',
    userAgent: 'Unknown',
    status: 'Failed',
    details: 'Multiple failed login attempts detected'
  },
  {
    id: 6,
    timestamp: '2024-01-15 14:15:22',
    user: 'robert.brown@company.com',
    action: 'Settings Changed',
    category: 'Configuration',
    resource: 'System Settings',
    ip: '192.168.1.104',
    userAgent: 'Chrome 120.0.0.0',
    status: 'Success',
    details: 'Updated notification preferences'
  }
];

const categories = ['All Categories', 'Authentication', 'User Management', 'Security', 'Data Access', 'Configuration'];
const statuses = ['All Status', 'Success', 'Failed', 'Warning'];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || log.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || log.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getActionIcon = (category: string) => {
    switch (category) {
      case 'Authentication': return <User className="w-4 h-4" />;
      case 'User Management': return <User className="w-4 h-4" />;
      case 'Security': return <Shield className="w-4 h-4" />;
      case 'Data Access': return <Database className="w-4 h-4" />;
      case 'Configuration': return <Settings className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Failed': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'Warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Authentication': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'User Management': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'Security': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'Data Access': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Configuration': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Audit Logs</h1>
              <p className="text-muted-foreground">Monitor user activities, security events, and system changes</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <Clock className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Logs
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{mockAuditLogs.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{mockAuditLogs.filter(l => l.status === 'Success').length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed Events</p>
                    <p className="text-2xl font-bold text-red-600">{mockAuditLogs.filter(l => l.status === 'Failed').length}</p>
                  </div>
                  <User className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{new Set(mockAuditLogs.map(l => l.user)).size}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.category)}
                        <span>{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(log.category)}>
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-48 truncate">
                      {log.resource}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                    <TableCell className="text-muted-foreground max-w-64 truncate">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}