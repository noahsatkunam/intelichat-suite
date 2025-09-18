import React from 'react';
import { Users, Plus, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserManagement() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
            </div>
            <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Manage user accounts, assign roles and permissions, and configure user access levels 
            across the platform.
          </p>
        </div>
      </div>
    </div>
  );
}