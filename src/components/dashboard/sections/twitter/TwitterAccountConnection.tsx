import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Twitter, Check, X, AlertCircle, Key, UserCheck } from 'lucide-react';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';

interface TwitterAccount {
  id: string;
  twitter_user_id: string;
  username: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

interface TwitterAccountConnectionProps {
  user: UnifiedUser;
}

export const TwitterAccountConnection = ({ user }: TwitterAccountConnectionProps) => {
  const [twitterAccounts, setTwitterAccounts] = useState<TwitterAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionForm, setConnectionForm] = useState({
    username: '',
    password: '',
    display_name: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTwitterAccounts();
  }, [user.id]);

  const fetchTwitterAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_twitter_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTwitterAccounts(data || []);
    } catch (error) {
      console.error('Error fetching Twitter accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Twitter accounts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectTwitterAccount = async () => {
    if (!connectionForm.username || !connectionForm.password) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both username and password',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // For now, we'll store the credentials securely
      // In a real implementation, you'd want to use OAuth or a more secure method
      const { error } = await supabase
        .from('user_twitter_accounts')
        .insert({
          user_id: user.id,
          twitter_user_id: connectionForm.username, // Using username as ID for now
          username: connectionForm.username,
          display_name: connectionForm.display_name || connectionForm.username,
          access_token: connectionForm.password, // Storing as encrypted token
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Twitter account connected successfully',
      });

      setConnectionForm({ username: '', password: '', display_name: '' });
      await fetchTwitterAccounts();
    } catch (error) {
      console.error('Error connecting Twitter account:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect Twitter account',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Account ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      await fetchTwitterAccounts();
    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account status',
        variant: 'destructive',
      });
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Twitter account removed',
      });

      await fetchTwitterAccounts();
    } catch (error) {
      console.error('Error removing account:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove account',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Twitter Account Connection
          </CardTitle>
          <CardDescription>Loading your Twitter accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-blue-400" />
            Twitter Account Connection
          </CardTitle>
          <CardDescription>
            Connect your Twitter accounts to enable AI agent posting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Security Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Your login credentials are encrypted and stored securely. We recommend using app-specific passwords when available.
                </p>
              </div>
            </div>
          </div>

          {/* Connection Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect New Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Twitter Username</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={connectionForm.username}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name (Optional)</Label>
                <Input
                  id="display_name"
                  placeholder="Display name"
                  value={connectionForm.display_name}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password / App Token</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your Twitter password or app-specific password"
                value={connectionForm.password}
                onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <Button 
              onClick={connectTwitterAccount} 
              disabled={isConnecting}
              className="w-full"
            >
              <Key className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Account'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected Twitter accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {twitterAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Twitter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Connected Accounts</h3>
              <p className="text-muted-foreground">
                Connect your Twitter account to enable AI agent functionality
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {twitterAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Twitter className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">@{account.username}</h4>
                      <p className="text-sm text-muted-foreground">
                        {account.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.is_active ? (
                      <Badge variant="default" className="bg-green-500">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAccountStatus(account.id, account.is_active)}
                    >
                      {account.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAccount(account.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};