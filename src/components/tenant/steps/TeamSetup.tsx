import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, Plus, X, UserPlus, Users, FileText, Check, AlertTriangle } from 'lucide-react';
import { TenantFormData } from '../TenantCreationWizard';
import { useToast } from '@/hooks/use-toast';

interface TeamSetupProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ROLES = ['admin', 'moderator', 'user', 'viewer'];

export default function TeamSetup({ data, onDataChange }: TeamSetupProps) {
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingCsv, setProcessingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addMember = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(newMember.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const existingEmails = data.teamMembers.map(m => m.email.toLowerCase());
    if (existingEmails.includes(newMember.email.toLowerCase())) {
      toast({
        title: "Duplicate Email",
        description: "This email is already added",
        variant: "destructive"
      });
      return;
    }

    const member = {
      ...newMember,
      status: 'valid' as const
    };

    onDataChange({
      teamMembers: [...data.teamMembers, member]
    });

    setNewMember({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user'
    });

    setShowAddForm(false);
    
    toast({
      title: "Member Added",
      description: `${newMember.firstName} ${newMember.lastName} has been added to the team`
    });
  };

  const removeMember = (index: number) => {
    const updated = data.teamMembers.filter((_, i) => i !== index);
    onDataChange({ teamMembers: updated });
  };

  const updateMemberRole = (index: number, role: string) => {
    const updated = [...data.teamMembers];
    updated[index] = { ...updated[index], role };
    onDataChange({ teamMembers: updated });
  };

  const downloadTemplate = () => {
    const csvTemplate = 'First Name,Last Name,Email,Role\nJohn,Doe,john@example.com,user\nJane,Smith,jane@example.com,admin\n';
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded"
    });
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
          title: "Invalid File",
          description: "CSV file must contain at least a header and one data row",
          variant: "destructive"
        });
        setProcessingCsv(false);
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const requiredHeaders = ['first name', 'last name', 'email', 'role'];
      
      if (!requiredHeaders.every(header => headers.some(h => h.includes(header.replace(' ', ''))))) {
        toast({
          title: "Invalid Headers",
          description: "CSV must contain: First Name, Last Name, Email, Role columns",
          variant: "destructive"
        });
        setProcessingCsv(false);
        return;
      }

      const members: any[] = [];
      const errors: string[] = [];

      lines.slice(1).forEach((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < 4) {
          errors.push(`Row ${index + 2}: Insufficient columns`);
          return;
        }

        const [firstName, lastName, email, role] = values;
        
        let status = 'valid';
        let errorMessage = '';

        if (!firstName || !lastName || !email) {
          status = 'error';
          errorMessage = 'Missing required fields';
        } else if (!validateEmail(email)) {
          status = 'error';
          errorMessage = 'Invalid email format';
        } else if (members.some(m => m.email.toLowerCase() === email.toLowerCase()) || 
                   data.teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
          status = 'duplicate';
          errorMessage = 'Duplicate email address';
        }

        members.push({
          firstName,
          lastName,
          email,
          role: ROLES.includes(role) ? role : 'user',
          status,
          errorMessage
        });
      });

      if (errors.length > 0) {
        toast({
          title: "Processing Errors",
          description: `${errors.length} rows had errors. Check the data table.`,
          variant: "destructive"
        });
      }

      onDataChange({ teamMembers: [...data.teamMembers, ...members.filter(m => m.status === 'valid')] });
      setUploadProgress(100);
      
      setTimeout(() => {
        setProcessingCsv(false);
        setUploadProgress(0);
      }, 1000);

      toast({
        title: "CSV Processed",
        description: `Added ${members.filter(m => m.status === 'valid').length} team members`,
      });
    };

    reader.onerror = () => {
      toast({
        title: "File Error",
        description: "Error reading the CSV file",
        variant: "destructive"
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
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    processCsvFile(file);
  };

  const setAllRoles = (role: string) => {
    const updated = data.teamMembers.map(member => ({ ...member, role }));
    onDataChange({ teamMembers: updated });
    
    toast({
      title: "Roles Updated",
      description: `Set all members to ${role} role`
    });
  };

  const validMembers = data.teamMembers.filter(m => m.status !== 'error' && m.status !== 'duplicate');
  const errorCount = data.teamMembers.filter(m => m.status === 'error' || m.status === 'duplicate').length;

  return (
    <div className="space-y-6">
      {/* Add Team Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="w-full border-dashed border-2 h-12 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Team Member
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={newMember.firstName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={newMember.lastName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                />
              </div>
              
              <div>
                <Label>Role</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={addMember} className="gap-2">
                  <Check className="w-4 h-4" />
                  Add Member
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMember({ firstName: '', lastName: '', email: '', role: 'user' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            CSV Bulk Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <span className="text-sm text-muted-foreground">
              Template includes: First Name, Last Name, Email, Role
            </span>
          </div>

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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing CSV...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members List */}
      {data.teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members ({validMembers.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setAllRoles('admin')}>
                  Set All Admin
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAllRoles('user')}>
                  Set All User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errorCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      {errorCount} members have errors and will not be added
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
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
                    {data.teamMembers.map((member, index) => (
                      <TableRow key={index} className={member.status === 'error' || member.status === 'duplicate' ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Select 
                            value={member.role} 
                            onValueChange={(value) => updateMemberRole(index, value)}
                            disabled={member.status === 'error' || member.status === 'duplicate'}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {member.status === 'valid' ? (
                            <Badge className="bg-green-100 text-green-800">Valid</Badge>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Badge variant="destructive">Error</Badge>
                              <span className="text-xs text-red-600">
                                {member.errorMessage}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(index)}
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
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Send Welcome Emails</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send invitation emails to team members
              </p>
            </div>
            <Switch
              checked={data.sendWelcomeEmails}
              onCheckedChange={(checked) => onDataChange({ sendWelcomeEmails: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Require Password Reset</Label>
              <p className="text-sm text-muted-foreground">
                Force users to set new password on first login
              </p>
            </div>
            <Switch
              checked={data.requirePasswordReset}
              onCheckedChange={(checked) => onDataChange({ requirePasswordReset: checked })}
            />
          </div>

          <div>
            <Label>Custom Invitation Message</Label>
            <Textarea
              value={data.customInvitationMessage}
              onChange={(e) => onDataChange({ customInvitationMessage: e.target.value })}
              placeholder="Welcome to our team! You've been invited to join our Zyria workspace..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {validMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{validMembers.length}</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validMembers.filter(m => m.role === 'admin').length}
                </div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {validMembers.filter(m => m.role === 'moderator').length}
                </div>
                <div className="text-sm text-muted-foreground">Moderators</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validMembers.filter(m => m.role === 'user').length}
                </div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
            </div>

            {data.sendWelcomeEmails && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✓ {validMembers.length} invitation emails will be sent after tenant creation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}