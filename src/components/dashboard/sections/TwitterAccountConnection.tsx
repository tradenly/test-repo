import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Twitter, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';

interface TwitterAccount {
  id: string;
  twitter_user_id: string;
  username: string;
  display_name: string;
  is_active: boolean;
  token_expires_at: string | null;
}

interface TwitterAccountConnectionProps {
  user: UnifiedUser;
  onAccountsChange?: (accounts: TwitterAccount[]) => void;
}

export const TwitterAccountConnection = ({ user, onAccountsChange }: TwitterAccountConnectionProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<TwitterAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form fields for manual connection (fallback)
  const [username, setUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  useEffect(() => {
    loadTwitterAccounts();
  }, [user.id]);

  const loadTwitterAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_twitter_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      onAccountsChange?.(data || []);
    } catch (error) {
      console.error('Error loading Twitter accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Twitter accounts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTwitterAccount = async () => {
    if (!username || !accessToken) {
      toast({
        title: 'Missing Information',
        description: 'Please provide username and access token',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .insert({
          user_id: user.id,
          twitter_user_id: username, // Using username as ID for now
          username,
          display_name: username,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Twitter account connected successfully',
      });

      // Reset form
      setUsername('');
      setAccessToken('');
      setRefreshToken('');
      setShowAddForm(false);
      
      // Reload accounts
      loadTwitterAccounts();
    } catch (error) {
      console.error('Error adding Twitter account:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect Twitter account',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeTwitterAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Twitter account disconnected',
      });

      loadTwitterAccounts();
    } catch (error) {
      console.error('Error removing Twitter account:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Twitter account',
        variant: 'destructive',
      });
    }
  };

  const toggleAccountStatus = async (accountId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .update({ is_active: newStatus })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Account ${newStatus ? 'activated' : 'deactivated'}`,
      });

      loadTwitterAccounts();
    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Twitter accounts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5" />
          Twitter Account Management
        </CardTitle>
        <CardDescription>
          Connect your Twitter accounts to enable AI agent posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Twitter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Twitter Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect a Twitter account to enable your AI agents to post
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect Twitter Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Connected Accounts</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>

            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Twitter className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">@{account.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.display_name}
                    </div>
                  </div>
                  <Badge variant={account.is_active ? 'default' : 'secondary'}>
                    {account.is_active ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAccountStatus(account.id, !account.is_active)}
                  >
                    {account.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTwitterAccount(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connect Twitter Account</CardTitle>
              <CardDescription>
                Enter your Twitter account credentials to connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Twitter Username</Label>
                <Input
                  id="username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Your Twitter access token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refresh-token">Refresh Token (Optional)</Label>
                <Input
                  id="refresh-token"
                  type="password"
                  placeholder="Your Twitter refresh token"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addTwitterAccount}
                  disabled={isAdding}
                  className="flex-1"
                >
                  {isAdding ? 'Connecting...' : 'Connect Account'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};