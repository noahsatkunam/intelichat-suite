import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MessageSquarePlus,
  History,
  BookOpen,
  BarChart3,
  Settings,
  Users,
  Building2,
  Workflow,
  Key,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  LogOut,
  FolderOpen,
  Clock,
  Brain,
  Bot,
  Mail,
  LayoutDashboard
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { conversationService } from '@/services/conversationService';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, variant: 'primary' as const },
  { title: 'New Chat', url: '/chat', icon: MessageSquarePlus },
  { title: 'Chat History', url: '/history', icon: History },
  { title: 'Knowledge Base', url: '/knowledge', icon: BookOpen },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const adminNavItems = [
  { title: 'AI Providers', url: '/admin/ai-providers', icon: Brain },
  { title: 'Chatbot Management', url: '/admin/chatbot-management', icon: Bot },
  { title: 'User Invitations', url: '/admin/invitations', icon: Mail },
  { title: 'Tenant Management', url: '/admin/tenants', icon: Building2 },
  { title: 'User Management', url: '/admin/users', icon: Users },
  { title: 'Workflow Automation', url: '/admin/workflows', icon: Workflow },
  { title: 'API Settings', url: '/admin/api', icon: Key },
];

const recentChats = [
  { id: '1', title: 'Enterprise AI Integration', timestamp: '2 hours ago', unread: true },
  { id: '2', title: 'Database Migration Query', timestamp: '1 day ago', unread: false },
  { id: '3', title: 'Security Best Practices', timestamp: '2 days ago', unread: false },
  { id: '4', title: 'API Documentation Review', timestamp: '3 days ago', unread: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentChats, setShowRecentChats] = useState(true);
  const [recentConversations, setRecentConversations] = useState([]);
  
  const isCollapsed = state === 'collapsed';
  const isActive = (path: string) => location.pathname === path;

  // Load recent conversations
  useEffect(() => {
    const loadConversations = async () => {
      const conversations = await conversationService.getConversations();
      setRecentConversations(conversations.slice(0, 4)); // Show only latest 4
    };
    loadConversations();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (email: string) => {
    return email?.split('@')[0]?.substring(0, 2).toUpperCase() || 'U';
  };
  
  const getNavClassName = (path: string, variant?: 'primary') => {
    const baseClasses = "w-full justify-start transition-all duration-200 hover:bg-accent hover:text-accent-foreground";
    const activeClasses = "bg-accent text-accent-foreground font-medium";
    const primaryClasses = variant === 'primary' 
      ? "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:bg-gradient-primary" 
      : "";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : ''} ${primaryClasses}`;
  };

  if (isCollapsed) {
    return (
      <Sidebar className="w-16 border-r border-sidebar-border bg-sidebar" collapsible="icon">
        <div className="p-2">
          <SidebarTrigger className="w-12 h-12 p-0 mx-auto flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors" />
        </div>
        
        <SidebarContent className="px-2">
          {/* Collapsed Logo */}
          <div className="flex justify-center py-4">
            <div className="p-2 rounded-lg bg-gradient-surface border border-sidebar-border shadow-soft hover:shadow-medium transition-all duration-300">
              <ZyriaLogo size="sm" showText={false} />
            </div>
          </div>
          
          {/* Main Navigation - Icons Only */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-12 h-12 p-0 mx-auto">
                      <NavLink to={item.url} className={getNavClassName(item.url, item.variant)}>
                        <item.icon className="w-5 h-5" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="w-80 border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <SidebarContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-surface rounded-lg border border-sidebar-border shadow-soft">
          <ZyriaLogo size="md" showText={true} variant="default" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SidebarTrigger className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors" />
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url, item.variant)}>
                      <item.icon className="w-5 h-5 mr-3" />
                       <span className="font-medium">{item.title}</span>
                       {item.title === 'Chat History' && recentConversations.length > 0 && (
                         <Badge variant="secondary" className="ml-auto text-xs">
                           {recentConversations.length}
                         </Badge>
                       )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 bg-sidebar-border" />

        {/* Recent Conversations */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between text-sidebar-foreground">
            <span className="font-medium">Recent Conversations</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-sidebar-accent"
              onClick={() => setShowRecentChats(!showRecentChats)}
            >
              {showRecentChats ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          </SidebarGroupLabel>
          
          {showRecentChats && (
            <SidebarGroupContent>
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-sidebar-accent border-sidebar-border focus:border-sidebar-ring"
                />
              </div>

              {/* Chat List */}
              <SidebarMenu className="space-y-1">
                {recentConversations
                  .filter(conversation => 
                    searchQuery === '' || 
                    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={`/chat/${conversation.id}`} 
                          className="flex items-start gap-3 p-3 hover:bg-sidebar-accent rounded-lg transition-colors group"
                        >
                          <FolderOpen className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-sidebar-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-sidebar-foreground truncate">
                              {conversation.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{new Date(conversation.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                {recentConversations.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">Start a new chat to get started</p>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <Separator className="my-4 bg-sidebar-border" />

        {/* Administration */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground font-medium">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile */}
        <div className="mt-auto pt-4">
          <Separator className="mb-4 bg-sidebar-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 hover:bg-sidebar-accent transition-colors"
              >
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
                    {getUserInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm text-sidebar-foreground">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border shadow-large">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}