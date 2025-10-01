import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, User, Shield, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load profile data including avatar
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data && !error) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setAvatarUrl(data.avatar_url);
      }
    };
    
    loadProfile();
  }, [user]);

  const getUserInitials = (email: string) => {
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  const handleDisplayNameSave = async () => {
    if (!user || !firstName.trim()) {
      toast({
        title: "Error",
        description: "First name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSavingName(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          name: fullName // Keep name column synced for backward compatibility
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Name updated successfully",
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // Upload to Supabase storage with user folder for RLS
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache busting parameter
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: cacheBustedUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setAvatarUrl(cacheBustedUrl);

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your Zyria platform preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Preferences */}
        <Card className="interactive-element">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              User Preferences
            </CardTitle>
            <CardDescription>
              Manage your account settings and personal preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Profile Picture</h4>
                <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {getUserInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" disabled={isUploading} asChild>
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Change'}
                    </span>
                  </Button>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Display Name</h4>
                <p className="text-sm text-muted-foreground">This name will be visible across the platform</p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleDisplayNameSave}
                  disabled={isSavingName}
                  size="sm"
                  className="w-full"
                >
                  {isSavingName ? 'Saving...' : 'Save Name'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="interactive-element">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Security settings and privacy controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">
                Setup 2FA
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Export</h4>
                <p className="text-sm text-muted-foreground">Download your conversation history</p>
              </div>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card className="interactive-element">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            About Zyria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <h4 className="font-semibold text-lg">Version</h4>
              <p className="text-muted-foreground">1.0.0-demo</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg">Build</h4>
              <p className="text-muted-foreground">Enterprise Demo</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg">Environment</h4>
              <Badge variant="secondary">Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}