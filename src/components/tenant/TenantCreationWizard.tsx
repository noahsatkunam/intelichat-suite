import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { OrganizationSetup } from './steps/OrganizationSetup';
import { AdminSetup } from './steps/AdminSetup';
import { InitialConfiguration } from './steps/InitialConfiguration';
import { BrandingCustomization } from './steps/BrandingCustomization';
import { TeamSetup } from './steps/TeamSetup';
import { FinalReview } from './steps/FinalReview';

export interface TenantFormData {
  // Step 1: Organization Setup
  organizationName: string;
  subdomain: string;
  industry: string;
  organizationSize: string;
  primaryUseCase: string;
  
  // Step 2: Administrator Setup
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  welcomeMessage: string;
  passwordComplexity: boolean;
  twoFactorRequired: boolean;
  sessionTimeout: string;
  
  // Step 3: Initial Configuration
  defaultAiModel: string;
  knowledgeBaseEnabled: boolean;
  workflowAutomationEnabled: boolean;
  realtimeChatEnabled: boolean;
  monthlyMessageLimit: number;
  storageLimit: number;
  concurrentUsers: number;
  apiRateLimit: number;
  
  // Step 4: Branding & Customization
  logoFile: File | null;
  primaryBrandColor: string;
  secondaryBrandColor: string;
  customFont: string;
  chatWidgetPosition: string;
  customDomain: string;
  sslAutoProvisioning: boolean;
  whiteLabelEnabled: boolean;
  
  // Step 5: Team Setup
  teamMembers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    status: 'valid' | 'error' | 'duplicate';
    errorMessage?: string;
  }>;
  sendWelcomeEmails: boolean;
  customInvitationMessage: string;
  requirePasswordReset: boolean;
  
  // Step 6: Final Review
  launchMode: 'draft' | 'launch' | 'test';
}

interface TenantCreationWizardProps {
  onComplete: (data: TenantFormData) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Organization Setup', component: OrganizationSetup },
  { id: 2, title: 'Administrator Setup', component: AdminSetup },
  { id: 3, title: 'Initial Configuration', component: InitialConfiguration },
  { id: 4, title: 'Branding & Customization', component: BrandingCustomization },
  { id: 5, title: 'Team Setup', component: TeamSetup },
  { id: 6, title: 'Final Review & Launch', component: FinalReview },
];

export function TenantCreationWizard({ onComplete, onCancel }: TenantCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantFormData>({
    // Initialize with default values
    organizationName: '',
    subdomain: '',
    industry: '',
    organizationSize: '',
    primaryUseCase: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    welcomeMessage: 'Welcome to our AI-powered platform! We\'re excited to have you on board.',
    passwordComplexity: true,
    twoFactorRequired: false,
    sessionTimeout: '1hour',
    defaultAiModel: 'gpt-4',
    knowledgeBaseEnabled: true,
    workflowAutomationEnabled: false,
    realtimeChatEnabled: true,
    monthlyMessageLimit: 10000,
    storageLimit: 10,
    concurrentUsers: 100,
    apiRateLimit: 1000,
    logoFile: null,
    primaryBrandColor: '#3b82f6',
    secondaryBrandColor: '#64748b',
    customFont: 'Inter',
    chatWidgetPosition: 'bottom-right',
    customDomain: '',
    sslAutoProvisioning: true,
    whiteLabelEnabled: false,
    teamMembers: [],
    sendWelcomeEmails: true,
    customInvitationMessage: 'You\'ve been invited to join our organization\'s AI platform. Click the link below to get started.',
    requirePasswordReset: true,
    launchMode: 'launch',
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const { toast } = useToast();

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  const saveDraft = () => {
    localStorage.setItem('tenant-creation-draft', JSON.stringify({
      formData,
      currentStep,
      completedSteps,
      timestamp: Date.now()
    }));
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 2000);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('tenant-creation-draft');
    if (draft) {
      try {
        const { formData: draftData, currentStep: draftStep, completedSteps: draftCompleted } = JSON.parse(draft);
        setFormData(draftData);
        setCurrentStep(draftStep);
        setCompletedSteps(draftCompleted);
        toast({
          title: "Draft Restored",
          description: "Your previous progress has been restored."
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  };

  const updateFormData = (stepData: Partial<TenantFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.organizationName && formData.subdomain && formData.industry);
      case 2:
        return !!(formData.adminFirstName && formData.adminLastName && formData.adminEmail);
      case 3:
        return !!(formData.defaultAiModel);
      case 4:
        return true; // Optional step
      case 5:
        return true; // Optional step
      case 6:
        return !!(formData.launchMode);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  const handleComplete = () => {
    if (validateStep(6)) {
      localStorage.removeItem('tenant-creation-draft');
      onComplete(formData);
    }
  };

  const progressPercentage = ((completedSteps.length + (validateStep(currentStep) ? 1 : 0)) / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Progress */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Create New Tenant</h1>
              <p className="text-muted-foreground">Set up a new organization in 5-15 minutes</p>
            </div>
            <div className="flex items-center gap-4">
              {isDraftSaved && (
                <Badge variant="secondary" className="gap-1">
                  <Save className="w-3 h-3" />
                  Draft Saved
                </Badge>
              )}
              <Button variant="outline" onClick={saveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-border bg-card/30 backdrop-blur-sm p-4">
          <nav className="space-y-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary-foreground text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <CurrentStepComponent
                  data={formData}
                  onDataChange={updateFormData}
                  onNext={handleNext}
                  onPrevious={currentStep > 1 ? handlePrevious : undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}
                <span className="text-xs">•</span>
                <span>Estimated {Math.max(0, (STEPS.length - currentStep) * 2)} minutes remaining</span>
              </div>

              {currentStep === STEPS.length ? (
                <Button onClick={handleComplete} className="gap-2 bg-gradient-primary hover:shadow-glow">
                  Complete Setup
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}