import React, { useState, useEffect } from 'react';
import { Building2, Plus, Settings, Users, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      subdomain: '',
      description: '',
      is_active: true,
      max_users: 50,
      max_chatbots: 10
    }
  });

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

      // Get chatbot counts for each tenant  
      const { data: chatbotCounts } = await supabase
        .from('chatbots')
        .select('tenant_id');

      const tenantsWithCounts = tenantsData?.map(tenant => ({
        ...tenant,
        user_count: userCounts?.filter(u => u.tenant_id === tenant.id).length || 0,
        chatbot_count: chatbotCounts?.filter(c => c.tenant_id === tenant.id).length || 0
      })) || [];

      setTenants(tenantsWithCounts);
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

  const handleCreateTenant = () => {
    form.reset({
      name: '',
      subdomain: '',
      description: '',
      is_active: true,
      max_users: 50,
      max_chatbots: 10
    });
    setDialogMode('create');
    setSelectedTenant(null);
    setIsDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    form.reset({
      name: tenant.name,
      subdomain: tenant.subdomain,
      description: tenant.settings?.description || '',
      is_active: tenant.settings?.is_active !== false,
      max_users: tenant.settings?.max_users || 50,
      max_chatbots: tenant.settings?.max_chatbots || 10
    });
    setDialogMode('edit');
    setSelectedTenant(tenant);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const tenantData = {
        name: data.name,
        subdomain: data.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        settings: {
          description: data.description,
          is_active: data.is_active,
          max_users: data.max_users,
          max_chatbots: data.max_chatbots
        }
      };

      if (dialogMode === 'create') {
        const { error } = await supabase
          .from('tenants')
          .insert([tenantData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tenant created successfully"
        });
      } else {
        const { error } = await supabase
          .from('tenants')
          .update(tenantData)
          .eq('id', selectedTenant?.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tenant updated successfully"
        });
      }

      setIsDialogOpen(false);
      fetchTenants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="relative">
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

      {/* Tenant Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create Tenant' : 'Edit Tenant'}
            </DialogTitle>
            <DialogDescription>
              Configure tenant organization settings and limits.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl>
                        <Input placeholder="acme-corp" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for tenant identification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description of the tenant organization..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="max_users"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Users</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of users allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="max_chatbots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Chatbots</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of chatbots allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Tenant</FormLabel>
                      <FormDescription>
                        Enable this tenant for active use
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {dialogMode === 'create' ? 'Create Tenant' : 'Update Tenant'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}