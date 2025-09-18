import React from 'react';
import { User, Bell, Shield, Palette, Globe, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and platform settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="text-center py-12">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Profile Settings</h3>
              <p className="text-muted-foreground">
                User profile management and preferences will be configured here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Notification Settings</h3>
              <p className="text-muted-foreground">
                Configure notification preferences and alert settings.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Security Settings</h3>
              <p className="text-muted-foreground">
                Manage security settings, passwords, and authentication methods.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}