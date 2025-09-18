import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const InviteAcceptPage = () => {
  const { token } = useParams<{ token: string }>();
  const { user, acceptInvitation } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setInviteError('Invalid invitation link');
        setInviteLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          setInviteError('Invalid or expired invitation');
        } else {
          setInvitation(data);
          setName(data.email.split('@')[0]); // Default name from email
        }
      } catch (error) {
        setInviteError('Error validating invitation');
      } finally {
        setInviteLoading(false);
      }
    };

    validateInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!token) return;

    setLoading(true);

    try {
      const { error } = await acceptInvitation(token, password, name);
      if (!error) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground mt-4">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ZyriaLogo size="lg" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              Invalid Invitation
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {inviteError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                This invitation may have expired or already been used.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <ZyriaLogo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Complete Your Account
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              You've been invited to join Zyria
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {invitation && (
            <div className="mb-6 p-3 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> {invitation.email}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Role:</strong> {invitation.role}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Choose a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to Zyria's Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptPage;