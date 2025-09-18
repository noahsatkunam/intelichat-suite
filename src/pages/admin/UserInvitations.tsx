import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Mail, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Invitation {
  id: string;
  email: string;
  role: 'global_admin' | 'tenant_admin' | 'user' | 'admin' | 'moderator'; // Include legacy roles for backward compatibility
  status: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
  token: string;
}

const UserInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  
  // Invite form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'global_admin' | 'tenant_admin' | 'user'>('user');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast.error('Error fetching invitations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSending(true);
      
      // Generate secure token
      const token = crypto.randomUUID() + '-' + Date.now();
      
      // Create invitation record
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          token,
          invited_by: user.id,
          tenant_id: (await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()).data?.tenant_id
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          token,
          role,
          inviterName: user.email
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        toast.warning('Invitation created but email failed to send. You can resend it later.');
      } else {
        toast.success('Invitation sent successfully!');
      }

      // Reset form and refresh list
      setEmail('');
      setRole('user');
      setInviteOpen(false);
      fetchInvitations();

    } catch (error: any) {
      toast.error('Error sending invitation: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      // Check if invitation is still valid
      if (invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()) {
        toast.error('Cannot resend expired or used invitation');
        return;
      }

      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: invitation.email,
          token: invitation.token,
          role: invitation.role,
          inviterName: user?.email
        }
      });

      if (error) throw error;
      toast.success('Invitation resent successfully!');
    } catch (error: any) {
      toast.error('Error resending invitation: ' + error.message);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
      
      toast.success('Invitation cancelled');
      fetchInvitations();
    } catch (error: any) {
      toast.error('Error cancelling invitation: ' + error.message);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'pending' && isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary">Accepted</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'destructive',
      moderator: 'default',
      user: 'secondary'
    } as const;
    
    return <Badge variant={colors[role as keyof typeof colors] || 'outline'}>{role}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Invitations</h1>
          <p className="text-muted-foreground">Invite and manage user access to your organization</p>
        </div>
        
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization. The user will receive a secure link to create their account.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={sendInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: 'global_admin' | 'tenant_admin' | 'user') => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                        <SelectItem value="global_admin">Global Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitation History</CardTitle>
          <CardDescription>
            View and manage all user invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No invitations yet</h3>
              <p className="text-muted-foreground mb-4">Start by inviting users to your organization</p>
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status, invitation.expires_at)}</TableCell>
                    <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invitation.status === 'pending' && new Date(invitation.expires_at) > new Date() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendInvitation(invitation)}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {invitation.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will cancel the invitation for {invitation.email}. They will no longer be able to use this invitation link.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => cancelInvitation(invitation.id)}>
                                  Yes, Cancel Invitation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInvitations;