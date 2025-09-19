import React from 'react';
import { User, Shield, Clock, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TenantFormData } from '../TenantCreationWizard';

interface AdminSetupProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const SESSION_TIMEOUTS = [
  { value: '15min', label: '15 minutes' },
  { value: '30min', label: '30 minutes' },
  { value: '1hour', label: '1 hour' },
  { value: '4hours', label: '4 hours' },
  { value: '8hours', label: '8 hours' },
];

export function AdminSetup({ data, onDataChange }: AdminSetupProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Administrator Setup</h2>
        <p className="text-muted-foreground text-lg">Configure the primary administrator and security settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Admin Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Primary Administrator
              </CardTitle>
              <CardDescription>
                This person will have full administrative access to your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">First Name *</Label>
                  <Input
                    id="adminFirstName"
                    placeholder="John"
                    value={data.adminFirstName}
                    onChange={(e) => onDataChange({ adminFirstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Last Name *</Label>
                  <Input
                    id="adminLastName"
                    placeholder="Smith"
                    value={data.adminLastName}
                    onChange={(e) => onDataChange({ adminLastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="john.smith@company.com"
                  value={data.adminEmail}
                  onChange={(e) => onDataChange({ adminEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  This email will be used for login and system notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone Number</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={data.adminPhone}
                  onChange={(e) => onDataChange({ adminPhone: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - Used for account recovery and notifications
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
              <CardDescription>
                Customize the welcome message for new users joining your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Welcome to our AI-powered platform! We're excited to have you on board."
                value={data.welcomeMessage}
                onChange={(e) => onDataChange({ welcomeMessage: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                This message will be displayed to users when they first log in
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Security Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Preferences
              </CardTitle>
              <CardDescription>
                Configure security requirements for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Password Complexity</Label>
                  <p className="text-sm text-muted-foreground">
                    Require strong passwords (8+ chars, numbers, symbols)
                  </p>
                </div>
                <Switch
                  checked={data.passwordComplexity}
                  onCheckedChange={(checked) => onDataChange({ passwordComplexity: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all users in the organization
                  </p>
                </div>
                <Switch
                  checked={data.twoFactorRequired}
                  onCheckedChange={(checked) => onDataChange({ twoFactorRequired: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Session Timeout</Label>
                <Select value={data.sessionTimeout} onValueChange={(value) => onDataChange({ sessionTimeout: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TIMEOUTS.map((timeout) => (
                      <SelectItem key={timeout.value} value={timeout.value}>
                        {timeout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Preview */}
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Administrator Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {data.adminFirstName && data.adminLastName ? (
                        `${data.adminFirstName} ${data.adminLastName}`
                      ) : (
                        'Administrator Name'
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.adminEmail || 'admin@example.com'}
                    </div>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                  Super Admin
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Full access to all organization settings and data
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Security Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Password Requirements: {data.passwordComplexity ? 'Strong' : 'Standard'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Two-Factor Auth: {data.twoFactorRequired ? 'Required' : 'Optional'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Session Timeout: {SESSION_TIMEOUTS.find(t => t.value === data.sessionTimeout)?.label || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}