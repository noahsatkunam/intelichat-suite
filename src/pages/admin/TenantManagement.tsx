import React, { useState, useEffect } from 'react';
import { Building2, Plus, Settings, Users, Trash2, Edit, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TenantCreationWizard } from '@/components/tenant/TenantCreationWizard';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: any;
  branding_config: any;
  created_at: string;
  updated_at: string;
  user_count?: number;
  chatbot_count?: number;
}

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      // Fetch tenants with user and chatbot counts
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;

      // Get user counts for each tenant
      const { data: userCounts } = await supabase
        .from('profiles')
        .select('tenant_id')
        .not('tenant_id', 'is', null);

      // Get chatbot counts for each tenant using the junction table
      const { data: chatbotAssignments } = await supabase
        .from('chatbot_tenants')
        .select('tenant_id, chatbot_id');

      const tenantsWithCounts = tenantsData?.map(tenant => ({
        ...tenant,
        user_count: userCounts?.filter(u => u.tenant_id === tenant.id).length || 0,
        chatbot_count: chatbotAssignments?.filter(c => c.tenant_id === tenant.id).length || 0
      })) || [];

      setTenants(tenantsWithCounts);
      setFilteredTenants(tenantsWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter tenants based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTenants(tenants);
    } else {
      const filtered = tenants.filter((tenant) =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.settings?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.settings?.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTenants(filtered);
    }
  }, [searchQuery, tenants]);

  const handleCreateTenant = () => {
    setWizardMode('create');
    setSelectedTenant(null);
    setIsWizardOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setWizardMode('edit');
    setSelectedTenant(tenant);
    setIsWizardOpen(true);
  };

  const handleWizardComplete = () => {
    fetchTenants();
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant deleted successfully"
      });
      
      fetchTenants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Tenant Management</h1>
              <p className="text-muted-foreground">Manage tenant organizations and their settings</p>
            </div>
            <Button onClick={handleCreateTenant} className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Create Tenant
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants by name, subdomain, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTenants.length} of {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
            {searchQuery && (
              <span className="ml-1">
                for "<span className="font-medium">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border-t-2 border-t-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <CardDescription>{tenant.subdomain}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={tenant.settings?.is_active !== false ? "default" : "secondary"}>
                    {tenant.settings?.is_active !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {tenant.settings?.description && (
                    <p className="text-sm text-muted-foreground">
                      {tenant.settings.description}
                    </p>
                  )}
                  {tenant.settings?.industry && (
                    <p className="text-xs text-muted-foreground capitalize">
                      Industry: {tenant.settings.industry.replace('-', ' ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{tenant.user_count || 0} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      <span>{tenant.chatbot_count || 0} chatbots</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(tenant.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTenant(tenant)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTenant(tenant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTenants.length === 0 && tenants.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              No tenants match your search criteria. Try adjusting your search terms.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="gap-2"
            >
              Clear Search
            </Button>
          </div>
        )}

        {tenants.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Tenants</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first tenant organization to get started with multi-tenant management.
            </p>
            <Button onClick={handleCreateTenant} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Tenant
            </Button>
          </div>
        )}
      </div>

      {/* Tenant Creation Wizard */}
      <TenantCreationWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        mode={wizardMode}
        tenant={selectedTenant}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}