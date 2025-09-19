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
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TenantFormData } from '../TenantCreationWizard';

interface UserManagementProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
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
  onPrevious
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddUser = () => {
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

    // Check for duplicate emails
    const allEmails = [...data.manualUsers, ...data.csvUsers].map(u => u.email.toLowerCase());
    if (allEmails.includes(newUser.email.toLowerCase())) {
      toast({
        title: "Duplicate Email",
        description: "This email address is already added",
        variant: "destructive"
      });
      return;
    }

    onDataChange({
      manualUsers: [...data.manualUsers, { ...newUser }]
    });

    setNewUser({ firstName: '', lastName: '', email: '', role: 'user' });
    setShowAddUserForm(false);

    toast({
      title: "User Added",
      description: `${newUser.firstName} ${newUser.lastName} has been added`
    });
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    reader.onload = (e) => {
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
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const columns = line.split(',').map(col => col.trim());
          
          if (columns.length < 4) {
            errors.push(`Row ${i + 1}: Insufficient columns`);
            continue;
          }

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
            // status remains 'valid'
          }

          users.push({
            firstName,
            lastName,
            email,
            role: ROLES.find(r => r.value === role)?.value || 'user',
            status,
            error
          });
        }

        onDataChange({ csvUsers: users });
        
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);

        const validCount = users.filter(u => u.status === 'valid').length;
        const errorCount = users.filter(u => u.status === 'error').length;

        toast({
          title: "CSV Processed",
          description: `${validCount} valid users, ${errorCount} errors found`,
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
            >
              <Plus className="w-4 h-4 mr-2" />
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
                <Button onClick={handleAddUser} size="sm">
                  <Check className="w-4 h-4 mr-1" />
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
                  <span>Uploading...</span>
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
                            {user.status === 'valid' ? (
                              <Badge className="bg-green-100 text-green-700">Valid</Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 text-xs">{user.error}</span>
                              </div>
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
      {totalUsers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              {ROLES.map(role => {
                const count = allUsers.filter(u => u.role === role.value).length;
                return (
                  <div key={role.value} className="text-center p-4 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{role.label}s</div>
                  </div>
                );
              })}
            </div>
            
            {totalUsers > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ {totalUsers} users will receive invitation emails after tenant creation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}