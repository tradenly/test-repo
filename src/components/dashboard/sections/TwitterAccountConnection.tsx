import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Twitter, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface TwitterAccount {
  id: string;
  username: string;
  display_name?: string;
  is_active: boolean;
  created_at: string;
}

export const TwitterAccountConnection = () => {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<TwitterAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: ''
  });

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_twitter_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching Twitter accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Twitter accounts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user || !formData.username || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Check if account already exists
      const existingAccount = accounts.find(
        acc => acc.username.toLowerCase() === formData.username.toLowerCase()
      );

      if (existingAccount) {
        toast({
          title: 'Error',
          description: 'This Twitter account is already connected',
          variant: 'destructive',
        });
        return;
      }

      // Create Twitter account entry
      const { data, error } = await supabase
        .from('user_twitter_accounts')
        .insert({
          user_id: user.id,
          twitter_user_id: `twitter_${formData.username}_${Date.now()}`, // Placeholder
          username: formData.username,
          display_name: formData.displayName || formData.username,
          access_token: 'placeholder_token', // In real implementation, this would come from OAuth
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [data, ...prev]);
      setFormData({ username: '', password: '', displayName: '' });

      toast({
        title: 'Success',
        description: 'Twitter account connected successfully',
      });
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

  const handleDisconnect = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      toast({
        title: 'Success',
        description: 'Twitter account disconnected successfully',
      });
    } catch (error) {
      console.error('Error disconnecting Twitter account:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Twitter account',
        variant: 'destructive',
      });
    }
  };

  const toggleAccountStatus = async (accountId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_twitter_accounts')
        .update({ is_active: !isActive })
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, is_active: !isActive } : acc
      ));

      toast({
        title: 'Success',
        description: `Account ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
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
    <div className="space-y-6">
      {/* Connect New Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-blue-500" />
            Connect Twitter Account
          </CardTitle>
          <CardDescription>
            Connect your Twitter account to enable AI agent posting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="@username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Display Name (optional)"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !formData.username || !formData.password}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Account'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <strong>Note:</strong> This is a simplified connection flow for demo purposes. 
            In production, this would use Twitter's OAuth 2.0 flow for secure authentication.
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Twitter Accounts ({accounts.length})</CardTitle>
          <CardDescription>
            Manage your connected Twitter accounts for AI agent posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Twitter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Twitter accounts connected yet.</p>
              <p className="text-sm">Connect an account above to enable AI agent posting.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">@{account.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.display_name || account.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Connected {new Date(account.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={account.is_active ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {account.is_active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAccountStatus(account.id, account.is_active)}
                    >
                      {account.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Important Notes:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Connected accounts will be used by your AI agents for posting</li>
          <li>You can activate/deactivate accounts without disconnecting them</li>
          <li>Only active accounts will be available for agent scheduling</li>
          <li>Make sure your Twitter accounts have proper posting permissions</li>
        </ul>
      </div>
    </div>
  );
};