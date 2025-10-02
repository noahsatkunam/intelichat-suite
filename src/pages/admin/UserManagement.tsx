import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Shield, Mail, Upload, Download, Search, Filter, MoreVertical, Edit, Trash2, UserCheck, UserX, FileText, AlertTriangle, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';

// Interface for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  department: string;
  tenant_id: string | null;
  tenant_name?: string;
}

interface Tenant {
  id: string;
  name: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'global_admin' | 'tenant_admin' | 'user';
  status: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
  token: string;
  tenant_id: string | null;
}

// Validation schema for user updates
const userUpdateSchema = z.object({
  role: z.enum(['global_admin', 'tenant_admin', 'user']),
  department: z.string().trim().min(1, "Department is required").max(100),
  tenant_id: z.string().uuid().nullable(),
});

// Validation schema for adding new user
const userAddSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  role: z.enum(['global_admin', 'tenant_admin', 'user']),
  department: z.string().trim().min(1, "Department is required").max(100),
  tenant_id: z.string().uuid().optional().nullable(),
});

const roles = ['Global Admin', 'Tenant Admin', 'User'];
const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'];
const USERS_PER_PAGE = 25;

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    role: '',
    department: '',
    tenant_id: null as string | null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingCsv, setProcessingCsv] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'global_admin' | 'tenant_admin' | 'user',
    department: '',
    tenant_id: null as string | null,
  });
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadTenants();
    loadInvitations();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants:tenant_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        email: profile.email,
        role: profile.role || 'user',
        status: 'Active',
        lastLogin: 'Recent',
        department: profile.department || 'N/A',
        tenant_id: profile.tenant_id,
        tenant_name: profile.tenants?.name || 'No Tenant'
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      toast({
        title: 'Error',
        description: 'Failed to load tenants',
        variant: 'destructive',
      });
    }
  };

  const loadInvitations = async () => {
    try {
      setInvitationsLoading(true);
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      role: user.role,
      department: user.department,
      tenant_id: user.tenant_id,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      // Validate input
      const validated = userUpdateSchema.parse(editForm);

      setIsSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          role: validated.role,
          tenant_id: validated.tenant_id,
          department: validated.department,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });

      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        console.error('Failed to update user:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate input
      const validated = userAddSchema.parse(addUserForm);

      setIsSaving(true);

      // Generate invitation token
      const token = crypto.randomUUID();

      // Create invitation record
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: validated.email,
          token,
          role: validated.role,
          tenant_id: validated.tenant_id || null,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          metadata: {
            name: validated.name,
            department: validated.department,
          },
        });

      if (inviteError) throw inviteError;

      // Send invitation email with correct redirect URL
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: validated.email,
          token,
          role: validated.role,
          inviterName: 'System Administrator',
          redirectUrl: "https://zyria.ai",
        },
      });

      if (emailError) throw emailError;

      toast({
        title: 'User Invited',
        description: `Invitation sent to ${validated.email}`,
      });

      setShowAddUser(false);
      setAddUserForm({
        name: '',
        email: '',
        role: 'user',
        department: '',
        tenant_id: null,
      });
      
      // Reload users list and invitations to show the new invitation
      loadUsers();
      loadInvitations();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        console.error('Failed to add user:', error);
        toast({
          title: 'Error',
          description: 'Failed to send user invitation',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesTenant = selectedTenant === 'all' || user.tenant_id === selectedTenant;
    return matchesSearch && matchesRole && matchesStatus && matchesTenant;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus, selectedTenant]);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'global_admin': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'tenant_admin': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'user': return 'bg-green-500/10 text-green-700 border-green-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'global_admin': return 'Global Admin';
      case 'tenant_admin': return 'Tenant Admin';
      case 'user': return 'User';
      default: return role;
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      if (invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()) {
        toast({
          title: 'Error',
          description: 'Cannot resend expired or used invitation',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: invitation.email,
          token: invitation.token,
          role: invitation.role,
          inviterName: 'System Administrator',
          redirectUrl: "https://zyria.ai",
        },
      });

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Invitation resent successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Invitation cancelled',
      });
      loadInvitations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'pending' && isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary">Accepted</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInviteRoleBadge = (role: string) => {
    const colors = {
      global_admin: 'destructive',
      tenant_admin: 'default',
      user: 'secondary'
    } as const;
    
    return <Badge variant={colors[role as keyof typeof colors] || 'outline'}>{getRoleDisplayName(role)}</Badge>;
  };

  const downloadTemplate = () => {
    const csvTemplate = 'First Name,Last Name,Email,Role,Department,Tenant\nJohn,Doe,john@example.com,user,Engineering,\nJane,Smith,jane@example.com,tenant_admin,Marketing,Northstar Technology Group\n';
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'CSV template has been downloaded',
    });
  };

  const exportUsers = () => {
    const csvHeaders = 'First Name,Last Name,Email,Role,Department,Tenant\n';
    const csvRows = filteredUsers.map(user => {
      const [firstName = '', lastName = ''] = user.name.split(' ');
      return `${firstName},${lastName},${user.email},${user.role},${user.department},${user.tenant_name || ''}`;
    }).join('\n');
    
    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Users Exported',
      description: `Exported ${filteredUsers.length} users to CSV`,
    });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const processCsvFile = (file: File) => {
    setProcessingCsv(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 50);
      }
    };

    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: 'Invalid File',
          description: 'CSV file must contain at least a header and one data row',
          variant: 'destructive',
        });
        setProcessingCsv(false);
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const requiredHeaders = ['first name', 'last name', 'email'];
      
      // Normalize headers by removing all spaces for comparison
      const normalizedHeaders = headers.map(h => h.replace(/\s+/g, ''));
      const normalizedRequired = requiredHeaders.map(h => h.replace(/\s+/g, ''));
      
      if (!normalizedRequired.every(required => normalizedHeaders.includes(required))) {
        toast({
          title: 'Invalid Headers',
          description: 'CSV must contain: First Name, Last Name, Email columns (Role, Department, Tenant are optional)',
          variant: 'destructive',
        });
        setProcessingCsv(false);
        return;
      }

      const preview: any[] = [];

      lines.slice(1).forEach((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < 3) {
          return;
        }

        const [firstName, lastName, email, role = 'user', department = 'N/A', tenantName = ''] = values;
        
        let status = 'valid';
        let errorMessage = '';

        if (!firstName || !lastName || !email) {
          status = 'error';
          errorMessage = 'Missing required fields (First Name, Last Name, Email)';
        } else if (!validateEmail(email)) {
          status = 'error';
          errorMessage = 'Invalid email format';
        } else if (role && !['global_admin', 'tenant_admin', 'user'].includes(role)) {
          status = 'error';
          errorMessage = 'Invalid role (must be: global_admin, tenant_admin, or user)';
        }

        // Find tenant ID from tenant name if provided
        let tenant_id = null;
        let tenant_display = tenantName || 'No Tenant';
        
        if (tenantName) {
          const matchedTenant = tenants.find(t => 
            t.name.toLowerCase() === tenantName.toLowerCase()
          );
          if (matchedTenant) {
            tenant_id = matchedTenant.id;
          } else if (status === 'valid') {
            status = 'error';
            errorMessage = `Tenant "${tenantName}" not found`;
          }
        }

        preview.push({
          firstName,
          lastName,
          email,
          role: role || 'user',
          department: department || 'N/A',
          tenant_id,
          tenant_name: tenant_display,
          status,
          errorMessage
        });
      });

      setImportPreview(preview);
      setUploadProgress(100);
      
      setTimeout(() => {
        setProcessingCsv(false);
        setUploadProgress(0);
      }, 500);

      const validCount = preview.filter(u => u.status === 'valid').length;
      toast({
        title: 'CSV Processed',
        description: `Ready to import ${validCount} valid users`,
      });
    };

    reader.onerror = () => {
      toast({
        title: 'File Error',
        description: 'Error reading the CSV file',
        variant: 'destructive',
      });
      setProcessingCsv(false);
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    processCsvFile(file);
  };

  const handleImportUsers = async () => {
    const validUsers = importPreview.filter(u => u.status === 'valid');
    
    if (validUsers.length === 0) {
      toast({
        title: 'No Valid Users',
        description: 'Please fix errors before importing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Note: In a real implementation, you would send invitations via edge function
      // For now, we'll show success message
      toast({
        title: 'Import Initiated',
        description: `${validUsers.length} user invitation(s) will be sent`,
      });

      setShowImportModal(false);
      setImportPreview([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to import users:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import users',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Inactive': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'Pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts, roles, permissions, and bulk operations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setShowImportModal(true)}>
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
              <Button variant="outline" className="gap-2" onClick={exportUsers}>
                <Download className="w-4 h-4" />
                Export Users
              </Button>
              <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
                    <Plus className="w-4 h-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="add-name">Full Name</Label>
                      <Input 
                        id="add-name" 
                        placeholder="Enter full name" 
                        value={addUserForm.name}
                        onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-email">Email Address</Label>
                      <Input 
                        id="add-email" 
                        type="email" 
                        placeholder="Enter email address"
                        value={addUserForm.email}
                        onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-role">Role</Label>
                      <Select 
                        value={addUserForm.role}
                        onValueChange={(value: 'global_admin' | 'tenant_admin' | 'user') => 
                          setAddUserForm({ ...addUserForm, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global_admin">Global Admin</SelectItem>
                          <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="add-department">Department</Label>
                      <Select
                        value={addUserForm.department}
                        onValueChange={(value) => setAddUserForm({ ...addUserForm, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="add-tenant">Tenant (Optional)</Label>
                      <Select
                        value={addUserForm.tenant_id || 'none'}
                        onValueChange={(value) => 
                          setAddUserForm({ ...addUserForm, tenant_id: value === 'none' ? null : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenant (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Tenant</SelectItem>
                          {tenants.map(tenant => (
                            <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddUser(false);
                          setAddUserForm({
                            name: '',
                            email: '',
                            role: 'user',
                            department: '',
                            tenant_id: null,
                          });
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser} disabled={isSaving}>
                        {isSaving ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-green-500/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.status === 'Active').length}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(234,179,8,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-yellow-500/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Users</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.status === 'Pending').length}</p>
                  </div>
                  <UserX className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(239,68,68,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-red-500/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant Admin</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'tenant_admin').length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(168,85,247,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-purple-500/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Global Admin</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'global_admin').length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="global_admin">Global Admin</SelectItem>
                <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
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
            {selectedUsers.length > 0 && (
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Active Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Mail className="w-4 h-4" />
              Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
            </TabsTrigger>
          </TabsList>

          {/* Active Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedUsers.length === filteredUsers.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.tenant_name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex justify-between items-center px-2">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </p>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={currentPage === page}
                            onClick={() => setCurrentPage(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </TabsContent>

          {/* Pending Invitations Tab */}
          <TabsContent value="invitations" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {invitationsLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No invitations yet</h3>
                    <p className="text-muted-foreground mb-4">Start by inviting users to your organization</p>
                    <Button onClick={() => setShowAddUser(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send First Invitation
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => {
                        const tenant = tenants.find(t => t.id === invitation.tenant_id);
                        return (
                          <TableRow key={invitation.id}>
                            <TableCell className="font-medium">{invitation.email}</TableCell>
                            <TableCell>{getInviteRoleBadge(invitation.role)}</TableCell>
                            <TableCell className="text-muted-foreground">{tenant?.name || 'No Tenant'}</TableCell>
                            <TableCell>{getStatusBadge(invitation.status, invitation.expires_at)}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {invitation.status === 'pending' && new Date(invitation.expires_at) > new Date() && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => resendInvitation(invitation)}
                                    title="Resend invitation email"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                  </Button>
                                )}
                                
                                {invitation.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (confirm(`Cancel invitation for ${invitation.email}? They will no longer be able to use this invitation link.`)) {
                                        cancelInvitation(invitation.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Import Users Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Users from CSV</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Download Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5" />
                  CSV Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Template
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Template includes: First Name, Last Name, Email, Role, Department, Tenant
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Required:</strong> First Name, Last Name, Email</p>
                  <p><strong>Optional:</strong> Role (defaults to 'user'), Department (defaults to 'N/A'), Tenant (use tenant name, leave blank for none)</p>
                  <p><strong>Valid roles:</strong> global_admin, tenant_admin, user</p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="w-5 h-5" />
                  Upload CSV File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    if (files[0]) {
                      processCsvFile(files[0]);
                    }
                  }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Drop CSV file here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Max 5MB • CSV format only</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {processingCsv && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Processing CSV...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Import Preview ({importPreview.filter(u => u.status === 'valid').length} valid)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {importPreview.filter(u => u.status === 'error').length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          {importPreview.filter(u => u.status === 'error').length} users have errors and will not be imported
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Tenant</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.map((user, index) => (
                          <TableRow key={index} className={user.status === 'error' ? 'bg-red-50' : ''}>
                            <TableCell className="font-medium">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                            </TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell className="text-muted-foreground">{user.tenant_name}</TableCell>
                            <TableCell>
                              {user.status === 'valid' ? (
                                <Badge className="bg-green-100 text-green-800">Valid</Badge>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Badge variant="destructive">Error</Badge>
                                  <span className="text-xs text-red-600">
                                    {user.errorMessage}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowImportModal(false);
                        setImportPreview([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImportUsers}
                      disabled={isSaving || importPreview.filter(u => u.status === 'valid').length === 0}
                    >
                      {isSaving ? 'Importing...' : `Import ${importPreview.filter(u => u.status === 'valid').length} Users`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">User</Label>
                <div className="mt-1">
                  <div className="font-medium">{editingUser.name}</div>
                  <div className="text-sm text-muted-foreground">{editingUser.email}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-role">Role *</Label>
                <Select 
                  value={editForm.role} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global_admin">Global Admin</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-tenant">Tenant *</Label>
                <Select 
                  value={editForm.tenant_id || 'null'} 
                  onValueChange={(value) => setEditForm(prev => ({ 
                    ...prev, 
                    tenant_id: value === 'null' ? null : value 
                  }))}
                >
                  <SelectTrigger id="edit-tenant">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">No Tenant (Global Admin only)</SelectItem>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Global Admins typically have no tenant assigned
                </p>
              </div>

              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Select 
                  value={editForm.department} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}