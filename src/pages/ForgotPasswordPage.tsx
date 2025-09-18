import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ForgotPasswordPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send password reset email",
          variant: "destructive",
        });
        return;
      }

      // Send notification email via our edge function
      try {
        const response = await supabase.functions.invoke('send-password-reset', {
          body: { 
            email,
            redirectTo: `${window.location.origin}/auth?reset=true`
          }
        });

        if (response.error) {
          console.error('Notification email error:', response.error);
          // Don't fail the whole process if notification fails
        }
      } catch (notificationError) {
        console.error('Failed to send notification email:', notificationError);
        // Continue anyway since the main reset was successful
      }

      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "Please check your email for password reset instructions",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <ZyriaLogo size="lg" />
            </div>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                We've sent password reset instructions to {email}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Password Reset Email Sent
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your inbox and follow the instructions to reset your password. 
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Send Another Email
              </Button>
              
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
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
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;