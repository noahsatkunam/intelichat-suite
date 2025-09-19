import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Download, 
  Upload, 
  X, 
  Edit2, 
  Check, 
  AlertTriangle,
  Users,
  FileText,
  UserPlus,
  Mail,
  UserCheck,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TenantFormData } from '../TenantCreationWizard';

interface UserManagementProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  editingTenantId?: string;
}

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { value: 'moderator', label: 'Manager', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'user', label: 'Agent', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
];

export default function UserManagement({
  data,
  onDataChange,
  onNext,
  onPrevious,
  editingTenantId
}: UserManagementProps) {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [isProcessingUsers, setIsProcessingUsers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check if users already exist in the system
  const checkExistingUsers = async (emails: string[]) => {
    try {
      const { data: existingProfiles, error } = await supabase
        .from('profiles')
        .select('email')
        .in('email', emails.map(email => email.toLowerCase()));

      if (error) throw error;

      return existingProfiles?.map(p => p.email.toLowerCase()) || [];
    } catch (error: any) {
      console.error('Error checking existing users:', error);
      return [];
    }
  };

  // Create invitation and send email
  const createInvitationAndSendEmail = async (user: any, tenantId: string) => {
    try {
      // Generate invitation token
      const token = crypto.randomUUID();
      
      // Create invitation record
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: user.email.toLowerCase(),
          role: user.role,
          tenant_id: tenantId,
          token,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          metadata: {
            firstName: user.firstName,
            lastName: user.lastName
          }
        });

      if (inviteError) throw inviteError;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: user.email,
          token,
          role: user.role,
          inviterName: 'Tenant Administrator'
        }
      });

      if (emailError) throw emailError;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (user: any) => {
    const statusConfig = {
      valid: { icon: Check, color: 'bg-green-100 text-green-700', label: 'Ready' },
      existing: { icon: UserCheck, color: 'bg-blue-100 text-blue-700', label: 'Existing User' },
      invited: { icon: Mail, color: 'bg-purple-100 text-purple-700', label: 'Invited' },
      error: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'Error' },
      duplicate: { icon: AlertTriangle, color: 'bg-orange-100 text-orange-700', label: 'Duplicate' }
    };

    const config = statusConfig[user.status || 'valid'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all user fields",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate emails in current list
    const allEmails = [...data.manualUsers, ...data.csvUsers].map(u => u.email.toLowerCase());
    if (allEmails.includes(newUser.email.toLowerCase())) {
      toast({
        title: "Duplicate Email",
        description: "This email address is already added",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingUsers(true);

    try {
      // Check if user already exists
      const existingUsers = await checkExistingUsers([newUser.email]);
      const userExists = existingUsers.includes(newUser.email.toLowerCase());

      let status: 'valid' | 'existing' | 'invited' | 'error' = 'valid';
      let statusMessage = '';

      if (userExists) {
        status = 'existing';
        statusMessage = 'User already exists in system';
      } else if (editingTenantId) {
        // If we're editing a tenant, create invitation
        const result = await createInvitationAndSendEmail(newUser, editingTenantId);
        if (result.success) {
          status = 'invited';
          statusMessage = 'Invitation sent successfully';
        } else {
          status = 'error';
          statusMessage = result.error || 'Failed to send invitation';
        }
      }

      const userWithStatus = {
        ...newUser,
        status,
        statusMessage
      };

      onDataChange({
        manualUsers: [...data.manualUsers, userWithStatus]
      });

      setNewUser({ firstName: '', lastName: '', email: '', role: 'user' });
      setShowAddUserForm(false);

      const messages = {
        existing: `${newUser.firstName} ${newUser.lastName} already exists in the system`,
        invited: `Invitation sent to ${newUser.firstName} ${newUser.lastName}`,
        valid: `${newUser.firstName} ${newUser.lastName} has been added`,
        error: `Failed to process ${newUser.firstName} ${newUser.lastName}: ${statusMessage}`
      };

      toast({
        title: status === 'error' ? "Error" : "Success",
        description: messages[status],
        variant: status === 'error' ? "destructive" : "default"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process user: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessingUsers(false);
    }
  };

  const handleRemoveUser = (index: number, type: 'manual' | 'csv') => {
    if (type === 'manual') {
      const updatedUsers = data.manualUsers.filter((_, i) => i !== index);
      onDataChange({ manualUsers: updatedUsers });
    } else {
      const updatedUsers = data.csvUsers.filter((_, i) => i !== index);
      onDataChange({ csvUsers: updatedUsers });
    }
  };

  const handleRoleChange = (index: number, role: string, type: 'manual' | 'csv') => {
    if (type === 'manual') {
      const updatedUsers = [...data.manualUsers];
      updatedUsers[index] = { ...updatedUsers[index], role };
      onDataChange({ manualUsers: updatedUsers });
    } else {
      const updatedUsers = [...data.csvUsers];
      updatedUsers[index] = { ...updatedUsers[index], role };
      onDataChange({ csvUsers: updatedUsers });
    }
  };

  const setBulkRole = (role: string) => {
    const updatedCsvUsers = data.csvUsers.map(user => ({ ...user, role }));
    onDataChange({ csvUsers: updatedCsvUsers });
    
    toast({
      title: "Bulk Role Update",
      description: `Set all CSV users to ${ROLES.find(r => r.value === role)?.label}`
    });
  };

  const downloadTemplate = () => {
    const csvContent = `First Name,Last Name,Email,Role
John,Smith,john.smith@company.com,user
Jane,Doe,jane.doe@company.com,moderator
Mike,Johnson,mike.j@company.com,admin`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your device"
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Format",
        description: "Please upload a CSV file only",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "File size must be under 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };

    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Validate headers
        const requiredHeaders = ['first name', 'last name', 'email', 'role'];
        const headerMap = requiredHeaders.map(header => {
          const index = headers.findIndex(h => h.includes(header.replace(' ', '')));
          return index;
        });

        if (headerMap.includes(-1)) {
          throw new Error('CSV must contain columns: First Name, Last Name, Email, Role');
        }

        const users = [];
        const emails = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const columns = line.split(',').map(col => col.trim());
          
          if (columns.length < 4) continue;

          const firstName = columns[headerMap[0]]?.replace(/"/g, '') || '';
          const lastName = columns[headerMap[1]]?.replace(/"/g, '') || '';
          const email = columns[headerMap[2]]?.replace(/"/g, '') || '';
          const role = columns[headerMap[3]]?.replace(/"/g, '').toLowerCase() || 'user';

          // Validate data
          let status: 'valid' | 'error' = 'valid';
          let error = '';

          if (!firstName || !lastName || !email) {
            status = 'error';
            error = 'Missing required fields';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            status = 'error';
            error = 'Invalid email format';
          } else if (!ROLES.find(r => r.value === role)) {
            // Default to 'user' if role is invalid
          }

          users.push({
            firstName,
            lastName,
            email,
            role: ROLES.find(r => r.value === role)?.value || 'user',
            status,
            error
          });

          if (status === 'valid') {
            emails.push(email);
          }
        }

        // Check which users already exist
        if (emails.length > 0) {
          setUploadProgress(50);
          const existingEmails = await checkExistingUsers(emails);
          
          // Update user statuses and send invitations if editing a tenant
          for (let user of users) {
            if (user.status === 'valid') {
              if (existingEmails.includes(user.email.toLowerCase())) {
                user.status = 'existing';
                user.statusMessage = 'User already exists in system';
              } else if (editingTenantId) {
                try {
                  const result = await createInvitationAndSendEmail(user, editingTenantId);
                  if (result.success) {
                    user.status = 'invited';
                    user.statusMessage = 'Invitation sent successfully';
                  } else {
                    user.status = 'error';
                    user.statusMessage = result.error || 'Failed to send invitation';
                  }
                } catch (error: any) {
                  user.status = 'error';
                  user.statusMessage = 'Failed to send invitation';
                }
              }
            }
          }
        }

        onDataChange({ csvUsers: users });
        
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);

        const validCount = users.filter(u => u.status === 'valid').length;
        const existingCount = users.filter(u => u.status === 'existing').length;
        const invitedCount = users.filter(u => u.status === 'invited').length;
        const errorCount = users.filter(u => u.status === 'error').length;

        toast({
          title: "CSV Processed",
          description: `${validCount} valid, ${existingCount} existing, ${invitedCount} invited, ${errorCount} errors`,
          variant: errorCount > 0 ? "destructive" : "default"
        });

      } catch (error: any) {
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          title: "Upload Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
  };

  const allUsers = [...data.manualUsers, ...data.csvUsers.filter(u => u.status === 'valid')];
  const totalUsers = allUsers.length;
  const errorCount = data.csvUsers.filter(u => u.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Manual User Addition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Users Manually
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showAddUserForm ? (
            <Button
              onClick={() => setShowAddUserForm(true)}
              variant="outline"
              className="w-full border-dashed border-2 h-12"
              disabled={isProcessingUsers}
            >
              {isProcessingUsers ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add User
            </Button>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <Input
                placeholder="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
              />
              <Input
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
              <div className="flex gap-2">
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 md:col-span-4 flex gap-2">
                <Button onClick={handleAddUser} size="sm" disabled={isProcessingUsers}>
                  {isProcessingUsers ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  Add User
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowAddUserForm(false);
                    setNewUser({ firstName: '', lastName: '', email: '', role: 'user' });
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {data.manualUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Added Users ({data.manualUsers.length})</h4>
              <div className="space-y-2">
                {data.manualUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                      <span className="text-muted-foreground">{user.email}</span>
                      <Badge className={ROLES.find(r => r.value === user.role)?.color}>
                        {ROLES.find(r => r.value === user.role)?.label}
                      </Badge>
                      {user.status && getStatusBadge(user)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(index, 'manual')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CSV Bulk Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download CSV Template
            </Button>
            <div className="text-sm text-muted-foreground">
              <p>Template includes: First Name, Last Name, Email, Role</p>
              <p>Max file size: 5MB | Up to 1000 users</p>
            </div>
          </div>

          {/* Upload Interface */}
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                if (files[0]) {
                  const event = { target: { files } } as any;
                  handleFileUpload(event);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Drop CSV file here or click to browse</h3>
                <p className="text-muted-foreground">CSV files only, max 5MB</p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing users...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>

          {/* CSV Data Review */}
          {data.csvUsers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  CSV Data Review ({data.csvUsers.length} users found, {errorCount} errors)
                </h4>
                <div className="flex gap-2">
                  {ROLES.map(role => (
                    <Button
                      key={role.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkRole(role.value)}
                      className="text-xs"
                    >
                      Set all to {role.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.csvUsers.map((user, index) => (
                        <TableRow key={index} className={user.status === 'error' ? 'bg-red-50' : ''}>
                          <TableCell>{user.firstName} {user.lastName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {ROLES.map(role => (
                                <button
                                  key={role.value}
                                  onClick={() => handleRoleChange(index, role.value, 'csv')}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    user.role === role.value ? role.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {role.label}
                                </button>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user)}
                            {user.error && (
                              <p className="text-xs text-red-600 mt-1">{user.error}</p>
                            )}
                            {user.statusMessage && (
                              <p className="text-xs text-muted-foreground mt-1">{user.statusMessage}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveUser(index, 'csv')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {[...data.manualUsers, ...data.csvUsers].filter(u => u.status === 'invited').length}
              </div>
              <div className="text-sm text-muted-foreground">Invitations Sent</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {[...data.manualUsers, ...data.csvUsers].filter(u => u.status === 'existing').length}
              </div>
              <div className="text-sm text-muted-foreground">Existing Users</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}