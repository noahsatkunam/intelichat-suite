import React, { useState, useRef } from 'react';
import { Users, Upload, Download, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { TenantFormData } from '../TenantCreationWizard';

interface TeamSetupProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const ROLES = ['Admin', 'Manager', 'Agent', 'Viewer'];
const ROLE_COLORS = {
  Admin: 'bg-red-100 text-red-700 hover:bg-red-200',
  Manager: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  Agent: 'bg-green-100 text-green-700 hover:bg-green-200',
  Viewer: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
};

type TeamMember = TenantFormData['teamMembers'][0];

export function TeamSetup({ data, onDataChange }: TeamSetupProps) {
  const [newMember, setNewMember] = useState<Omit<TeamMember, 'status'>>({
    firstName: '',
    lastName: '',
    email: '',
    roles: ['Agent']
  });
  const [csvProcessing, setCsvProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkDuplicateEmail = (email: string, excludeIndex?: number): boolean => {
    return data.teamMembers.some((member, index) => 
      member.email.toLowerCase() === email.toLowerCase() && index !== excludeIndex
    );
  };

  const addTeamMember = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(newMember.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    if (checkDuplicateEmail(newMember.email)) {
      toast({
        title: "Duplicate Email",
        description: "This email address is already in the team.",
        variant: "destructive"
      });
      return;
    }

    const member: TeamMember = {
      ...newMember,
      status: 'valid'
    };

    onDataChange({
      teamMembers: [...data.teamMembers, member]
    });

    setNewMember({
      firstName: '',
      lastName: '',
      email: '',
      roles: ['Agent']
    });
  };

  const removeTeamMember = (index: number) => {
    const updatedMembers = data.teamMembers.filter((_, i) => i !== index);
    onDataChange({ teamMembers: updatedMembers });
  };

  const toggleRole = (memberIndex: number, role: string) => {
    const updatedMembers = [...data.teamMembers];
    const member = updatedMembers[memberIndex];
    
    if (member.roles.includes(role)) {
      member.roles = member.roles.filter(r => r !== role);
    } else {
      member.roles = [...member.roles, role];
    }

    // Ensure at least one role is selected
    if (member.roles.length === 0) {
      member.roles = ['Viewer'];
    }

    onDataChange({ teamMembers: updatedMembers });
  };

  const setBulkRole = (role: string) => {
    const updatedMembers = data.teamMembers.map(member => ({
      ...member,
      roles: [role]
    }));
    onDataChange({ teamMembers: updatedMembers });
  };

  const downloadTemplate = () => {
    const csvContent = `First Name,Last Name,Email,Role
John,Smith,j.smith@company.com,Agent
Jane,Doe,jane.doe@company.com,Manager
Bob,Wilson,bob.wilson@company.com,Admin`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-members-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "CSV file must be less than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setCsvProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['first name', 'last name', 'email'];
      
      const hasRequiredHeaders = requiredHeaders.every(header => 
        headers.some(h => h.includes(header.replace(' ', '')))
      );

      if (!hasRequiredHeaders) {
        throw new Error('CSV must contain columns: First Name, Last Name, Email, Role (optional)');
      }

      const members: TeamMember[] = [];
      const errors: string[] = [];

      lines.slice(1).forEach((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const lineNumber = index + 2;

        if (values.length < 3) {
          errors.push(`Line ${lineNumber}: Missing required fields`);
          return;
        }

        const firstName = values[0];
        const lastName = values[1];
        const email = values[2];
        const role = values[3] || 'Agent';

        let status: TeamMember['status'] = 'valid';
        let errorMessage = '';

        if (!firstName || !lastName || !email) {
          status = 'error';
          errorMessage = 'Missing required fields';
        } else if (!validateEmail(email)) {
          status = 'error';
          errorMessage = 'Invalid email format';
        } else if (members.some(m => m.email.toLowerCase() === email.toLowerCase()) || 
                   checkDuplicateEmail(email)) {
          status = 'duplicate';
          errorMessage = 'Duplicate email address';
        }

        members.push({
          firstName,
          lastName,
          email,
          roles: [ROLES.includes(role) ? role : 'Agent'],
          status,
          errorMessage
        });
      });

      if (errors.length > 0) {
        toast({
          title: "CSV Processing Errors",
          description: `${errors.length} errors found. Please check the file format.`,
          variant: "destructive"
        });
      }

      onDataChange({ teamMembers: [...data.teamMembers, ...members] });
      
      toast({
        title: "CSV Uploaded",
        description: `Processed ${members.length} team members from CSV.`,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process CSV file.",
        variant: "destructive"
      });
    } finally {
      setCsvProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validMembers = data.teamMembers.filter(m => m.status === 'valid');
  const errorMembers = data.teamMembers.filter(m => m.status === 'error');
  const duplicateMembers = data.teamMembers.filter(m => m.status === 'duplicate');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Team Setup & User Invitations</h2>
        <p className="text-muted-foreground text-lg">Add team members and configure their roles</p>
        <Badge variant="secondary">Optional Step</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Manual Addition & CSV Upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Individual Users
              </CardTitle>
              <CardDescription>
                Manually add team members one by one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    placeholder="John"
                    value={newMember.firstName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    placeholder="Smith"
                    value={newMember.lastName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="john.smith@company.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <Badge
                      key={role}
                      variant={newMember.roles.includes(role) ? "default" : "outline"}
                      className={`cursor-pointer ${newMember.roles.includes(role) ? ROLE_COLORS[role as keyof typeof ROLE_COLORS] : ''}`}
                      onClick={() => {
                        if (newMember.roles.includes(role)) {
                          setNewMember(prev => ({
                            ...prev,
                            roles: prev.roles.filter(r => r !== role)
                          }));
                        } else {
                          setNewMember(prev => ({
                            ...prev,
                            roles: [...prev.roles, role]
                          }));
                        }
                      }}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={addTeamMember} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                CSV Mass Upload
              </CardTitle>
              <CardDescription>
                Upload multiple team members at once using CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="outline" onClick={downloadTemplate} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  or
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {csvProcessing ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm">Processing CSV file...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload CSV File</p>
                        <p className="text-xs text-muted-foreground">Max 5MB, up to 1000 users</p>
                      </div>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Team Members List & Bulk Actions */}
        <div className="space-y-6">
          {data.teamMembers.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Members ({data.teamMembers.length})
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Review and manage team member roles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary Stats */}
                  <div className="flex gap-4 text-sm">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {validMembers.length} Valid
                    </Badge>
                    {errorMembers.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        {errorMembers.length} Errors
                      </Badge>
                    )}
                    {duplicateMembers.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                        {duplicateMembers.length} Duplicates
                      </Badge>
                    )}
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">Set all to:</span>
                    {ROLES.map((role) => (
                      <Button
                        key={role}
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkRole(role)}
                        className="text-xs"
                      >
                        {role}
                      </Button>
                    ))}
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data.teamMembers.map((member, index) => (
                      <div key={index} className={`p-3 border rounded-lg ${
                        member.status === 'error' ? 'border-red-200 bg-red-50' :
                        member.status === 'duplicate' ? 'border-yellow-200 bg-yellow-50' :
                        'border-border'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {member.firstName} {member.lastName}
                              </span>
                              {member.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              {member.status === 'duplicate' && (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              )}
                              {member.status === 'valid' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                            {member.errorMessage && (
                              <div className="text-xs text-red-600 mt-1">
                                {member.errorMessage}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {ROLES.map((role) => (
                            <Badge
                              key={role}
                              variant={member.roles.includes(role) ? "default" : "outline"}
                              className={`cursor-pointer text-xs ${
                                member.roles.includes(role) ? ROLE_COLORS[role as keyof typeof ROLE_COLORS] : ''
                              }`}
                              onClick={() => toggleRole(index, role)}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Invitation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Send Welcome Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Send invitation emails immediately after tenant creation
                      </p>
                    </div>
                    <Switch
                      checked={data.sendWelcomeEmails}
                      onCheckedChange={(checked) => onDataChange({ sendWelcomeEmails: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Require Password Reset</Label>
                      <p className="text-sm text-muted-foreground">
                        Users must set password on first login
                      </p>
                    </div>
                    <Switch
                      checked={data.requirePasswordReset}
                      onCheckedChange={(checked) => onDataChange({ requirePasswordReset: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Invitation Message</Label>
                    <Textarea
                      placeholder="You've been invited to join our organization's AI platform..."
                      value={data.customInvitationMessage}
                      onChange={(e) => onDataChange({ customInvitationMessage: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {data.teamMembers.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Team Members Added</h3>
                <p className="text-muted-foreground">
                  Add team members manually or upload a CSV file to get started.
                  You can also skip this step and add users later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}