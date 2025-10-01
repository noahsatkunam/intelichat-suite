import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { ZyriaLogo } from '@/components/branding/ZyriaLogo';
import WebGLBackground from '@/components/ui/WebGLBackground';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage = () => {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Sign in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4 relative">
      {/* WebGL Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <WebGLBackground />
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-border/50 relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <ZyriaLogo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sign in to your Zyria account
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                  autoComplete="current-password"
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <Separator className="my-6" />
          
          <div className="space-y-4 text-center">
            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-2">
                Account Access by Invitation Only
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Zyria accounts are created through secure invitations from your organization administrator.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong>Existing users:</strong> Contact your administrator for account access
                </p>
                <p>
                  <strong>New organizations:</strong> Contact Zyria sales for enterprise setup
                </p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>
                Need help? Contact{' '}
                <Link 
                  to="/contact" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  support@zyria.com
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;