import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { CheckCircle, XCircle, Loader2, Globe, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TenantFormData } from '../TenantCreationWizard';

interface GeneralInformationProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function GeneralInformation({
  data,
  onDataChange,
  onNext,
  onPrevious
}: GeneralInformationProps) {
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [subdomainMessage, setSubdomainMessage] = useState('');

  // Auto-generate subdomain from name
  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus('idle');
      setSubdomainMessage('');
      return;
    }

    setSubdomainStatus('checking');
    try {
      const { data: existingTenant, error } = await supabase
        .from('tenants')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingTenant) {
        setSubdomainStatus('taken');
        setSubdomainMessage('This subdomain is already taken');
      } else {
        setSubdomainStatus('available');
        setSubdomainMessage('Subdomain is available');
      }
    } catch (error) {
      setSubdomainStatus('idle');
      setSubdomainMessage('Error checking availability');
    }
  };

  // Debounced subdomain check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.subdomain) {
        checkSubdomainAvailability(data.subdomain);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [data.subdomain]);

  const handleNameChange = (name: string) => {
    onDataChange({ name });
    
    // Auto-generate subdomain if it hasn't been manually edited
    if (!data.subdomain || data.subdomain === generateSubdomain(data.name)) {
      const newSubdomain = generateSubdomain(name);
      onDataChange({ subdomain: newSubdomain });
    }
  };

  const handleSubdomainChange = (subdomain: string) => {
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onDataChange({ subdomain: cleanSubdomain });
  };

  const isFormValid = data.name && data.subdomain && data.description && subdomainStatus === 'available';

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Panel - Form Fields */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Corporation"
                maxLength={50}
                className="text-lg"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Organization or company name</span>
                <span>{data.name.length}/50</span>
              </div>
            </div>

            {/* Subdomain */}
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain *</Label>
              <div className="relative">
                <Input
                  id="subdomain"
                  value={data.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="acme-corp"
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {subdomainStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {subdomainStatus === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {subdomainStatus === 'taken' && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              {subdomainMessage && (
                <p className={`text-xs ${subdomainStatus === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                  {subdomainMessage}
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                Your tenant will be accessible at: <span className="font-mono bg-secondary px-1 rounded">https://{data.subdomain || 'your-subdomain'}.zyria.com</span>
              </div>
            </div>

            {/* Organization URL */}
            <div className="space-y-2">
              <Label htmlFor="organizationUrl">Organization URL <span className="text-muted-foreground">(Optional)</span></Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="organizationUrl"
                  value={data.organizationUrl}
                  onChange={(e) => onDataChange({ organizationUrl: e.target.value })}
                  placeholder="https://www.yourcompany.com"
                  className="pl-10"
                  type="url"
                />
              </div>
              <p className="text-xs text-muted-foreground">Your company's website or main URL</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description & Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => onDataChange({ description: e.target.value })}
                placeholder="Describe your organization and how you'll use Zyria..."
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Brief description of your organization</span>
                <span>{data.description.length}/500</span>
              </div>
            </div>

            {/* Max Users */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>User Limits</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="unlimited-users" className="text-sm font-normal">Unlimited</Label>
                  <Switch
                    id="unlimited-users"
                    checked={data.unlimitedUsers}
                    onCheckedChange={(checked) => onDataChange({ unlimitedUsers: checked })}
                  />
                </div>
              </div>
              
              {!data.unlimitedUsers && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Max Users</span>
                    <span className="text-sm font-medium">{data.maxUsers.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[data.maxUsers]}
                    onValueChange={([value]) => onDataChange({ maxUsers: value })}
                    max={1000}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave unlimited for enterprise plans
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Preview & Progress */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-secondary/50 rounded-lg border-2 border-dashed">
                <h3 className="font-semibold text-lg">{data.name || 'Tenant Name'}</h3>
                <p className="text-sm text-muted-foreground">
                  {data.subdomain ? `${data.subdomain}.zyria.com` : 'your-subdomain.zyria.com'}
                </p>
                {data.organizationUrl && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {data.organizationUrl}
                  </p>
                )}
              </div>
              
              {data.description && (
                <div className="p-3 bg-accent/50 rounded">
                  <p className="text-sm">{data.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {data.name ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                <span className={`text-sm ${data.name ? 'text-foreground' : 'text-muted-foreground'}`}>Tenant name provided</span>
              </div>
              <div className="flex items-center gap-2">
                {subdomainStatus === 'available' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                <span className={`text-sm ${subdomainStatus === 'available' ? 'text-foreground' : 'text-muted-foreground'}`}>Subdomain available</span>
              </div>
              <div className="flex items-center gap-2">
                {data.description ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                <span className={`text-sm ${data.description ? 'text-foreground' : 'text-muted-foreground'}`}>Description added</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-foreground">User limits configured</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-primary/10 rounded">
              <p className="text-sm text-primary">
                {isFormValid ? '✓ Ready to proceed to user management' : 'Complete required fields to continue'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}