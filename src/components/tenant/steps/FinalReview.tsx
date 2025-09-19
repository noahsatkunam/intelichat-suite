import React from 'react';
import { CheckCircle, Building2, User, Settings, Palette, Users, Rocket, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TenantFormData } from '../TenantCreationWizard';

interface FinalReviewProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const formatStorage = (gb: number) => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)}TB`;
  return `${gb}GB`;
};

export function FinalReview({ data, onDataChange }: FinalReviewProps) {
  const validTeamMembers = data.teamMembers.filter(m => m.status === 'valid');
  const estimatedCost = calculateEstimatedCost(data);
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Final Review & Launch</h2>
        <p className="text-muted-foreground text-lg">Review your configuration and choose how to launch your tenant</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Configuration Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organization Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{data.organizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subdomain:</span>
                <span className="font-mono text-sm">{data.subdomain}.zyria.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Industry:</span>
                <span>{data.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Use Case:</span>
                <span>{data.primaryUseCase}</span>
              </div>
              {data.customDomain && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Custom Domain:</span>
                  <span className="font-mono text-sm">{data.customDomain}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Administrator Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{data.adminFirstName} {data.adminLastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span>{data.adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge className="bg-red-100 text-red-700">Super Admin</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AI Model:</span>
                <span>{data.defaultAiModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Features:</span>
                <div className="flex flex-wrap gap-1">
                  {data.knowledgeBaseEnabled && <Badge variant="outline" className="text-xs">Knowledge Base</Badge>}
                  {data.workflowAutomationEnabled && <Badge variant="outline" className="text-xs">Workflows</Badge>}
                  {data.realtimeChatEnabled && <Badge variant="outline" className="text-xs">Real-time Chat</Badge>}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Message Limit:</span>
                  <span>{formatNumber(data.monthlyMessageLimit)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span>{formatStorage(data.storageLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Concurrent Users:</span>
                  <span>{formatNumber(data.concurrentUsers)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(data.logoFile || data.primaryBrandColor !== '#3b82f6') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.logoFile && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Logo:</span>
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(data.logoFile)}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Brand Colors:</span>
                  <div className="flex gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: data.primaryBrandColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: data.secondaryBrandColor }}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Font:</span>
                  <span className="text-sm" style={{ fontFamily: data.customFont }}>{data.customFont}</span>
                </div>
                {data.whiteLabelEnabled && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">White Label:</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {validTeamMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {validTeamMembers.length} team members will be invited
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['Admin', 'Manager', 'Agent', 'Viewer'].map(role => {
                      const count = validTeamMembers.filter(m => m.roles.includes(role)).length;
                      return count > 0 ? (
                        <Badge key={role} variant="outline" className="text-xs">
                          {count} {role}{count > 1 ? 's' : ''}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Launch Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Launch Options
              </CardTitle>
              <CardDescription>
                Choose how you want to launch your new tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={data.launchMode} 
                onValueChange={(value: any) => onDataChange({ launchMode: value })}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="draft" id="draft" className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="draft" className="text-base font-medium cursor-pointer">
                      Create Tenant (Draft Mode)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Create the tenant but keep it in draft mode. Not accessible to end users yet.
                      Good for testing and configuration.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">Safe</Badge>
                      <Badge variant="secondary" className="text-xs">Testing</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="launch" id="launch" className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="launch" className="text-base font-medium cursor-pointer">
                      Create & Launch Tenant
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Create the tenant and make it immediately available to users.
                      Team invitations will be sent if configured.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">Immediate</Badge>
                      <Badge variant="secondary" className="text-xs">Production</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="test" id="test" className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="test" className="text-base font-medium cursor-pointer">
                      Create & Send Test Invitation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Launch the tenant but only send a test invitation to the administrator.
                      Other team invitations are held until you're ready.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">Gradual</Badge>
                      <Badge variant="secondary" className="text-xs">Controlled</Badge>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Estimated Usage & Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Monthly Messages:</span>
                <span>{formatNumber(data.monthlyMessageLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <span>{formatStorage(data.storageLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Team Members:</span>
                <span>{validTeamMembers.length + 1}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Estimated Monthly Cost:</span>
                <span>${estimatedCost}/month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                * Estimate based on standard pricing. Actual costs may vary.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post-Creation Resources</CardTitle>
              <CardDescription>
                What happens after tenant creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Auto-generated setup documentation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span>Quick start guide for your use case</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Optional onboarding call scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Rocket className="w-4 h-4 text-muted-foreground" />
                <span>Direct access to admin dashboard</span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              🎉 You're all set! Your tenant will be ready in approximately 2-3 minutes after creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateEstimatedCost(data: TenantFormData): number {
  let baseCost = 49; // Base tenant cost
  
  // Add costs based on usage limits
  if (data.monthlyMessageLimit > 10000) baseCost += 20;
  if (data.monthlyMessageLimit > 50000) baseCost += 30;
  
  if (data.storageLimit > 10) baseCost += 10;
  if (data.storageLimit > 100) baseCost += 20;
  
  if (data.concurrentUsers > 100) baseCost += 15;
  if (data.concurrentUsers > 1000) baseCost += 25;
  
  // Add costs for features
  if (data.knowledgeBaseEnabled) baseCost += 15;
  if (data.workflowAutomationEnabled) baseCost += 25;
  if (data.whiteLabelEnabled) baseCost += 30;
  
  // Team member costs
  const teamMemberCost = data.teamMembers.filter(m => m.status === 'valid').length * 5;
  
  return baseCost + teamMemberCost;
}