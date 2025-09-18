import React from 'react';
import { Building2, Plus, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TenantManagement() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Tenant Management</h1>
              <p className="text-muted-foreground">Manage organization accounts and tenant configurations</p>
            </div>
            <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Add Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Tenant Management</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Configure and manage multiple organization accounts, including tenant-specific settings, 
            branding, and access controls.
          </p>
        </div>
      </div>
    </div>
  );
}