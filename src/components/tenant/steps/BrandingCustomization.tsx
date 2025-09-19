import React, { useRef } from 'react';
import { Palette, Upload, Globe, Eye, Monitor } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TenantFormData } from '../TenantCreationWizard';

interface BrandingCustomizationProps {
  data: TenantFormData;
  onDataChange: (data: Partial<TenantFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Arial',
  'Helvetica'
];

const CHAT_POSITIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'custom', label: 'Custom Position' }
];

export function BrandingCustomization({ data, onDataChange }: BrandingCustomizationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      onDataChange({ logoFile: file });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Branding & Customization</h2>
        <p className="text-muted-foreground text-lg">Make the platform your own with custom branding</p>
        <Badge variant="secondary" className="mt-2">Optional Step</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Branding Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Organization Logo
              </CardTitle>
              <CardDescription>
                Upload your organization's logo (PNG, JPG, SVG - Max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {data.logoFile ? (
                    <div className="space-y-3">
                      <div className="w-20 h-20 mx-auto bg-muted rounded-lg flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(data.logoFile)}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      </div>
                      <p className="text-sm font-medium">{data.logoFile.name}</p>
                      <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                        Change Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload your logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or SVG up to 5MB</p>
                      </div>
                      <Button variant="outline" onClick={triggerFileUpload}>
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>
                Choose colors that match your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={data.primaryBrandColor}
                      onChange={(e) => onDataChange({ primaryBrandColor: e.target.value })}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={data.primaryBrandColor}
                      onChange={(e) => onDataChange({ primaryBrandColor: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={data.secondaryBrandColor}
                      onChange={(e) => onDataChange({ secondaryBrandColor: e.target.value })}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={data.secondaryBrandColor}
                      onChange={(e) => onDataChange({ secondaryBrandColor: e.target.value })}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography & Layout</CardTitle>
              <CardDescription>
                Customize the visual appearance of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={data.customFont} onValueChange={(value) => onDataChange({ customFont: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chat Widget Position</Label>
                <Select value={data.chatWidgetPosition} onValueChange={(value) => onDataChange({ chatWidgetPosition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAT_POSITIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Domain & Advanced Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>
                Use your own domain instead of *.zyria.com
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                <Input
                  id="customDomain"
                  placeholder="chat.yourcompany.com"
                  value={data.customDomain}
                  onChange={(e) => onDataChange({ customDomain: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  You'll need to configure DNS records after tenant creation
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SSL Auto-Provisioning</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically provision SSL certificates
                  </p>
                </div>
                <Switch
                  checked={data.sslAutoProvisioning}
                  onCheckedChange={(checked) => onDataChange({ sslAutoProvisioning: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>White Label Options</CardTitle>
              <CardDescription>
                Remove Zyria branding for a fully custom experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable White Label</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove "Powered by Zyria" branding
                  </p>
                </div>
                <Switch
                  checked={data.whiteLabelEnabled}
                  onCheckedChange={(checked) => onDataChange({ whiteLabelEnabled: checked })}
                />
              </div>
              {data.whiteLabelEnabled && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    White label options may require additional licensing fees
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg border-2"
                  style={{ 
                    borderColor: data.primaryBrandColor,
                    fontFamily: data.customFont 
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {data.logoFile && (
                      <img
                        src={URL.createObjectURL(data.logoFile)}
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-semibold" style={{ color: data.primaryBrandColor }}>
                        {data.organizationName || 'Your Organization'}
                      </div>
                      <div className="text-xs" style={{ color: data.secondaryBrandColor }}>
                        AI Assistant
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div 
                      className="inline-block px-3 py-2 rounded-lg text-white mb-2"
                      style={{ backgroundColor: data.primaryBrandColor }}
                    >
                      Hello! How can I help you today?
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-center text-muted-foreground">
                  Preview of your branded chat interface
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}