import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import step components
import GeneralInformation from './steps/GeneralInformation';
import TeamSetup from './steps/TeamSetup';
import { BrandingCustomization } from './steps/BrandingCustomization';

export interface TenantFormData {
  // General Information
  name: string;
  subdomain: string;
  organizationUrl: string;
  description: string;
  maxUsers: number;
  unlimitedUsers: boolean;
  organizationName: string;
  organizationSize: string;
  industry: string;
  primaryUseCase: string;
  
  // Initial Configuration
  defaultAiModel: string;
  knowledgeBaseEnabled: boolean;
  workflowAutomationEnabled: boolean;
  realtimeChatEnabled: boolean;
  monthlyMessageLimit: number;
  storageLimit: number;
  concurrentUsers: number;
  apiRateLimit: number;
  
  // Admin Setup
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  welcomeMessage: string;
  passwordComplexity: boolean;
  twoFactorRequired: boolean;
  sessionTimeout: string;
  
  manualUsers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    roles?: string[];
    status?: 'valid' | 'error' | 'duplicate' | 'existing' | 'invited';
    errorMessage?: string;
    statusMessage?: string;
  }>;
  csvUsers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    roles?: string[];
    status: 'valid' | 'error' | 'duplicate' | 'existing' | 'invited';
    errorMessage?: string;
    statusMessage?: string;
    error?: string;
  }>;
  teamMembers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    roles?: string[];
    status?: 'valid' | 'error' | 'duplicate' | 'existing' | 'invited';
    errorMessage?: string;
    statusMessage?: string;
  }>;
  
  // Branding & Customization
  logo?: File;
  logoUrl?: string;
  logoFile?: File;
  primaryColor: string;
  secondaryColor: string;
  primaryBrandColor: string;
  secondaryBrandColor: string;
  customDomain: string;
  whiteLabel: boolean;
  whiteLabelEnabled: boolean;
  customFont: string;
  chatWidgetPosition: string;
  sslAutoProvisioning: boolean;
  
  // Final Review
  launchMode: string;
  sendWelcomeEmails: boolean;
  requirePasswordReset: boolean;
  customInvitationMessage: string;
}

interface TenantCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  tenant?: any;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'General Information', subtitle: 'Configure basic tenant organization settings', component: GeneralInformation },
  { id: 2, title: 'User Management', subtitle: 'Set up your team and invite users', component: TeamSetup },
  { id: 3, title: 'Branding & Customization', subtitle: 'Customize your tenant\'s appearance for white-label deployment', component: BrandingCustomization }
];

export function TenantCreationWizard({ open, onOpenChange, mode, tenant, onComplete }: TenantCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    subdomain: '',
    organizationUrl: '',
    description: '',
    maxUsers: 50,
    unlimitedUsers: true,
    organizationName: '',
    organizationSize: '',
    industry: '',
    primaryUseCase: '',
    defaultAiModel: 'gpt-4',
    knowledgeBaseEnabled: false,
    workflowAutomationEnabled: false,
    realtimeChatEnabled: true,
    monthlyMessageLimit: 1000,
    storageLimit: 100,
    concurrentUsers: 50,
    apiRateLimit: 100,
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    welcomeMessage: '',
    passwordComplexity: false,
    twoFactorRequired: false,
    sessionTimeout: '30',
    manualUsers: [],
    csvUsers: [],
    teamMembers: [],
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
    primaryBrandColor: '#3b82f6',
    secondaryBrandColor: '#6366f1',
    customDomain: '',
    whiteLabel: false,
    whiteLabelEnabled: false,
    customFont: 'Inter',
    chatWidgetPosition: 'bottom-right',
    sslAutoProvisioning: true,
    launchMode: 'launch',
    sendWelcomeEmails: true,
    requirePasswordReset: true,
    customInvitationMessage: ''
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  // Reset wizard state and populate data when opening
  useEffect(() => {
    if (open) {
      // Always start on step 1 when opening
      setCurrentStep(1);
      setCompletedSteps([]);
      
      // If editing, populate form data from tenant
      if (mode === 'edit' && tenant) {
        setFormData({
          name: tenant.name || '',
          subdomain: tenant.subdomain || '',
          organizationUrl: tenant.settings?.organizationUrl || '',
          description: tenant.settings?.description || '',
          maxUsers: tenant.settings?.max_users || 50,
          unlimitedUsers: !tenant.settings?.max_users,
          industry: tenant.settings?.industry || '',
          organizationName: tenant.settings?.organizationName || tenant.name || '',
          organizationSize: tenant.settings?.organizationSize || '',
          primaryUseCase: tenant.settings?.primaryUseCase || '',
          defaultAiModel: tenant.settings?.defaultAiModel || 'gpt-4',
          knowledgeBaseEnabled: tenant.settings?.knowledgeBaseEnabled || false,
          workflowAutomationEnabled: tenant.settings?.workflowAutomationEnabled || false,
          realtimeChatEnabled: tenant.settings?.realtimeChatEnabled !== false,
          monthlyMessageLimit: tenant.settings?.monthlyMessageLimit || 1000,
          storageLimit: tenant.settings?.storageLimit || 100,
          concurrentUsers: tenant.settings?.concurrentUsers || 50,
          apiRateLimit: tenant.settings?.apiRateLimit || 100,
          adminFirstName: tenant.settings?.adminFirstName || '',
          adminLastName: tenant.settings?.adminLastName || '',
          adminEmail: tenant.settings?.adminEmail || '',
          adminPhone: tenant.settings?.adminPhone || '',
          welcomeMessage: tenant.settings?.welcomeMessage || '',
          passwordComplexity: tenant.settings?.passwordComplexity || false,
          twoFactorRequired: tenant.settings?.twoFactorRequired || false,
          sessionTimeout: tenant.settings?.sessionTimeout || '30',
          manualUsers: [],
          csvUsers: [],
          teamMembers: tenant.settings?.teamMembers || [],
          primaryColor: tenant.branding_config?.primaryColor || '#3b82f6',
          secondaryColor: tenant.branding_config?.secondaryColor || '#6366f1',
          primaryBrandColor: tenant.branding_config?.primaryColor || '#3b82f6',
          secondaryBrandColor: tenant.branding_config?.secondaryColor || '#6366f1',
          logoUrl: tenant.branding_config?.logoUrl || '',
          customDomain: tenant.settings?.customDomain || '',
          whiteLabel: tenant.settings?.whiteLabel || false,
          whiteLabelEnabled: tenant.settings?.whiteLabel || false,
          customFont: tenant.branding_config?.customFont || 'Inter',
          chatWidgetPosition: tenant.branding_config?.chatWidgetPosition || 'bottom-right',
          sslAutoProvisioning: tenant.settings?.sslAutoProvisioning !== false,
          launchMode: 'launch',
          sendWelcomeEmails: true,
          requirePasswordReset: true,
          customInvitationMessage: ''
        });
      } else if (mode === 'create') {
        // Reset to default values for create mode
        setFormData({
          name: '',
          subdomain: '',
          organizationUrl: '',
          description: '',
          maxUsers: 50,
          unlimitedUsers: true,
          organizationName: '',
          organizationSize: '',
          industry: '',
          primaryUseCase: '',
          defaultAiModel: 'gpt-4',
          knowledgeBaseEnabled: false,
          workflowAutomationEnabled: false,
          realtimeChatEnabled: true,
          monthlyMessageLimit: 1000,
          storageLimit: 100,
          concurrentUsers: 50,
          apiRateLimit: 100,
          adminFirstName: '',
          adminLastName: '',
          adminEmail: '',
          adminPhone: '',
          welcomeMessage: '',
          passwordComplexity: false,
          twoFactorRequired: false,
          sessionTimeout: '30',
          manualUsers: [],
          csvUsers: [],
          teamMembers: [],
          primaryColor: '#3b82f6',
          secondaryColor: '#6366f1',
          primaryBrandColor: '#3b82f6',
          secondaryBrandColor: '#6366f1',
          customDomain: '',
          whiteLabel: false,
          whiteLabelEnabled: false,
          customFont: 'Inter',
          chatWidgetPosition: 'bottom-right',
          sslAutoProvisioning: true,
          launchMode: 'launch',
          sendWelcomeEmails: true,
          requirePasswordReset: true,
          customInvitationMessage: ''
        });
      }
    }
  }, [open, mode, tenant]);

  const updateFormData = (newData: Partial<TenantFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1: return !!(formData.name && formData.subdomain && formData.description);
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    try {
      const tenantData = {
        name: formData.name,
        subdomain: formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        settings: {
          description: formData.description,
          organizationUrl: formData.organizationUrl,
          industry: formData.industry,
          max_users: formData.unlimitedUsers ? null : formData.maxUsers,
          customDomain: formData.customDomain,
          whiteLabel: formData.whiteLabel,
          is_active: true
        },
        branding_config: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          logoUrl: formData.logoUrl
        }
      };

      if (mode === 'create') {
        await supabase.from('tenants').insert([tenantData]);
        toast({ title: "Success", description: "Tenant created successfully" });
      } else {
        await supabase.from('tenants').update(tenantData).eq('id', tenant?.id);
        toast({ title: "Success", description: "Tenant updated successfully" });
      }

      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-[90vh]">
          <div className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-display">
                {mode === 'create' ? 'Create Advanced Tenant' : 'Edit Tenant Configuration'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{currentStepData?.title}</h2>
              <p className="text-muted-foreground">{currentStepData?.subtitle}</p>
            </div>

            {CurrentStepComponent && (
              <CurrentStepComponent
                data={formData}
                onDataChange={updateFormData}
                onNext={handleNext}
                onPrevious={handlePrevious}
                editingTenantId={mode === 'edit' ? tenant?.id : undefined}
              />
            )}
          </div>

          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                {currentStep === STEPS.length ? (
                  <Button onClick={handleComplete} className="gap-2 bg-gradient-primary">
                    <Check className="w-4 h-4" />
                    {mode === 'create' ? 'Create Tenant' : 'Update Tenant'}
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-2">
                    Next: {STEPS[currentStep]?.title}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}