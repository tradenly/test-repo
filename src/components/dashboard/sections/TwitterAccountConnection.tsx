import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadTwitterAccounts();
  }, [user.id]);

  const loadTwitterAccounts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_twitter_connections')
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

  const connectTwitterAccount = async () => {
    setIsConnecting(true);
    try {
      // Get authorization URL from our OAuth function
      const { data, error } = await supabase.functions.invoke('twitter-oauth', {
        body: {
          action: 'get-auth-url',
          userId: user.id,
        },
      });

      if (error) throw error;

      // Open OAuth popup
      const popup = window.open(
        data.authUrl,
        'twitter-oauth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'TWITTER_AUTH_SUCCESS' && event.data.code) {
          popup?.close();
          
          // Exchange code for tokens
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('twitter-oauth', {
            body: {
              action: 'exchange-code',
              userId: user.id,
              code: event.data.code,
            },
          });

          if (tokenError) throw tokenError;

          toast({
            title: 'Success',
            description: `Twitter account @${tokenData.username} connected successfully!`,
          });

          loadTwitterAccounts();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without completing OAuth
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      }, 1000);

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

  const removeTwitterAccount = async (accountId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('user_twitter_connections')
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
      const { error } = await (supabase as any)
        .from('user_twitter_connections')
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
          Connect your Twitter accounts to enable AI agent posting (OAuth 2.0)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Twitter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Twitter Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Twitter account to enable AI agent posting
            </p>
            <Button 
              onClick={connectTwitterAccount} 
              disabled={isConnecting}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Twitter Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Connected Accounts</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={connectTwitterAccount}
                disabled={isConnecting}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Add Account'}
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
      </CardContent>
    </Card>
  );
};