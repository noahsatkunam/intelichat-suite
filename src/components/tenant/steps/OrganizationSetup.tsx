import React, { useState, useEffect } from 'react';
import { Building2, Globe, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TenantFormData } from '../TenantCreationWizard';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationSetupProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Real Estate',
  'Non-Profit',
  'Government',
  'Other'
];

const ORGANIZATION_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '200+ employees'
];

const USE_CASES = [
  'Customer Support',
  'Internal Knowledge Base',
  'Sales Assistant',
  'HR & Onboarding',
  'Custom Implementation'
];

const TEMPLATES = {
  'Customer Support': {
    title: 'Customer Support Template',
    description: 'Pre-configured for handling customer inquiries with knowledge base integration',
    features: ['FAQ Integration', 'Ticket Routing', 'Sentiment Analysis']
  },
  'Internal Knowledge Base': {
    title: 'Knowledge Management Template',
    description: 'Optimized for internal documentation and employee self-service',
    features: ['Document Search', 'Access Controls', 'Usage Analytics']
  },
  'Sales Assistant': {
    title: 'Sales Support Template',
    description: 'Designed to assist with lead qualification and product information',
    features: ['Lead Scoring', 'Product Catalog', 'CRM Integration']
  }
};

export function OrganizationSetup({ data, onDataChange }: OrganizationSetupProps) {
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [subdomainMessage, setSubdomainMessage] = useState('');

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus('idle');
      setSubdomainMessage('Subdomain must be at least 3 characters');
      return;
    }

    setSubdomainStatus('checking');
    
    try {
      const { data: existing } = await supabase
        .from('tenants')
        .select('subdomain')
        .eq('subdomain', subdomain)
        .maybeSingle();

      if (existing) {
        setSubdomainStatus('unavailable');
        setSubdomainMessage('This subdomain is already taken');
      } else {
        setSubdomainStatus('available');
        setSubdomainMessage('Subdomain is available');
      }
    } catch (error) {
      setSubdomainStatus('idle');
      setSubdomainMessage('Failed to check availability');
    }
  };

  useEffect(() => {
    if (data.subdomain) {
      const timeoutId = setTimeout(() => {
        checkSubdomainAvailability(data.subdomain);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [data.subdomain]);

  const handleOrganizationNameChange = (value: string) => {
    onDataChange({ organizationName: value });
    
    // Auto-generate subdomain if it hasn't been manually edited
    if (!data.subdomain || data.subdomain === generateSubdomain(data.organizationName)) {
      const newSubdomain = generateSubdomain(value);
      onDataChange({ subdomain: newSubdomain });
    }
  };

  const selectedTemplate = data.primaryUseCase && TEMPLATES[data.primaryUseCase as keyof typeof TEMPLATES];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Organization Setup</h2>
        <p className="text-muted-foreground text-lg">Let's start with the basics about your organization</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-base font-semibold">
                Organization Name *
              </Label>
              <Input
                id="organizationName"
                placeholder="Acme Corporation"
                value={data.organizationName}
                onChange={(e) => handleOrganizationNameChange(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain" className="text-base font-semibold">
                Subdomain *
              </Label>
              <div className="relative">
                <Input
                  id="subdomain"
                  placeholder="acme-corp"
                  value={data.subdomain}
                  onChange={(e) => onDataChange({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="text-lg pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {subdomainStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {subdomainStatus === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {subdomainStatus === 'unavailable' && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${
                  subdomainStatus === 'available' ? 'text-green-600' :
                  subdomainStatus === 'unavailable' ? 'text-red-600' :
                  'text-muted-foreground'
                }`}>
                  {subdomainMessage || 'Your organization will be accessible at this URL'}
                </span>
              </div>
              {data.subdomain && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Preview: <span className="font-mono">{data.subdomain}.zyria.com</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Industry *</Label>
              <Select value={data.industry} onValueChange={(value) => onDataChange({ industry: value })}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Organization Size</Label>
              <Select value={data.organizationSize} onValueChange={(value) => onDataChange({ organizationSize: value })}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Select organization size" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Primary Use Case</Label>
              <Select value={data.primaryUseCase} onValueChange={(value) => onDataChange({ primaryUseCase: value })}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="What will you primarily use Zyria for?" />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((useCase) => (
                    <SelectItem key={useCase} value={useCase}>
                      {useCase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview & Templates */}
        <div className="space-y-6">
          {/* URL Preview */}
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Your Organization URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-2xl font-mono font-bold text-primary mb-2">
                  {data.subdomain || 'your-org'}.zyria.com
                </div>
                <div className="text-sm text-muted-foreground">
                  This will be your organization's dedicated portal
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Suggestion */}
          {selectedTemplate && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">
                  Recommended Template
                </CardTitle>
                <CardDescription>
                  Based on your selected use case
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">{selectedTemplate.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {data.organizationName ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                  <span className={data.organizationName ? 'text-green-600' : 'text-muted-foreground'}>
                    Organization name
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {data.subdomain && subdomainStatus === 'available' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                  <span className={data.subdomain && subdomainStatus === 'available' ? 'text-green-600' : 'text-muted-foreground'}>
                    Subdomain available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {data.industry ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                  <span className={data.industry ? 'text-green-600' : 'text-muted-foreground'}>
                    Industry selected
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}