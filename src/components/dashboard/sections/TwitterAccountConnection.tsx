
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Twitter, Plus, Trash2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';

interface TwitterAccount {
  id: string;
  twitter_user_id: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  is_active: boolean;
  token_expires_at: string | null;
  connection_status: string;
  created_at: string;
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
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    loadTwitterAccounts();
  }, [user.id]);

  const loadTwitterAccounts = async () => {
    try {
      console.log(`📱 Loading Twitter accounts for user: ${user.id}`);
      setIsLoading(true);
      setConnectionError(null);

      const { data, error } = await supabase
        .from('user_twitter_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading Twitter accounts:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} Twitter accounts`);
      setAccounts(data || []);
      onAccountsChange?.(data || []);
    } catch (error: any) {
      console.error('❌ Error loading Twitter accounts:', error);
      setConnectionError('Failed to load Twitter accounts');
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
    if (!user.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log(`🔗 Starting Twitter connection for user: ${user.id}`);

      // Get authorization URL from our OAuth function
      const { data, error } = await supabase.functions.invoke('twitter-oauth', {
        body: {
          action: 'get-auth-url',
          userId: user.id,
        },
      });

      if (error) {
        console.error('❌ Failed to get auth URL:', error);
        throw new Error(error.message || 'Failed to get authorization URL');
      }

      if (!data?.success || !data?.authUrl) {
        console.error('❌ Invalid response from auth URL endpoint:', data);
        throw new Error('Invalid response from authorization service');
      }

      console.log(`🚀 Opening OAuth popup for user: ${user.id}`);

      // Open OAuth popup with better window options
      const popup = window.open(
        data.authUrl,
        'twitter-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes'
      );

      if (!popup) {
        throw new Error('Failed to open popup window. Please check your popup blocker settings.');
      }

      let messageReceived = false;

      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        console.log('📨 Received message:', event.data);

        if (event.data.type === 'TWITTER_AUTH_SUCCESS' && event.data.code && event.data.state) {
          if (messageReceived) return; // Prevent duplicate handling
          messageReceived = true;

          popup?.close();
          
          try {
            console.log(`🔄 Exchanging code for tokens...`);

            // Exchange code for tokens
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('twitter-oauth', {
              body: {
                action: 'exchange-code',
                userId: user.id,
                code: event.data.code,
                state: event.data.state,
              },
            });

            if (tokenError) {
              console.error('❌ Token exchange failed:', tokenError);
              throw new Error(tokenError.message || 'Failed to exchange authorization code');
            }

            if (!tokenData?.success) {
              console.error('❌ Token exchange unsuccessful:', tokenData);
              throw new Error(tokenData?.error || 'Authorization failed');
            }

            console.log(`🎉 Twitter connection successful!`);

            toast({
              title: 'Success',
              description: `Twitter account @${tokenData.username} connected successfully!`,
            });

            // Reload accounts to show the new connection
            await loadTwitterAccounts();

          } catch (exchangeError: any) {
            console.error('❌ Error during token exchange:', exchangeError);
            setConnectionError(exchangeError.message);
            toast({
              title: 'Connection Failed',
              description: exchangeError.message || 'Failed to complete Twitter connection',
              variant: 'destructive',
            });
          } finally {
            setIsConnecting(false);
            window.removeEventListener('message', handleMessage);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without completing OAuth
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          
          if (!messageReceived) {
            console.log('🚪 Popup closed without completing OAuth');
            setIsConnecting(false);
            setConnectionError('Authorization was cancelled');
          }
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!messageReceived && !popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          setConnectionError('Authorization timed out');
        }
      }, 5 * 60 * 1000);

    } catch (error: any) {
      console.error('❌ Error connecting Twitter account:', error);
      setConnectionError(error.message);
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to connect Twitter account',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const removeTwitterAccount = async (accountId: string) => {
    try {
      console.log(`🗑️ Removing Twitter account: ${accountId}`);

      const { error } = await supabase
        .from('user_twitter_connections')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Twitter account disconnected',
      });

      await loadTwitterAccounts();
    } catch (error: any) {
      console.error('❌ Error removing Twitter account:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Twitter account',
        variant: 'destructive',
      });
    }
  };

  const toggleAccountStatus = async (accountId: string, newStatus: boolean) => {
    try {
      console.log(`⚡ Toggling account status: ${accountId} -> ${newStatus}`);

      const { error } = await supabase
        .from('user_twitter_connections')
        .update({ is_active: newStatus })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Account ${newStatus ? 'activated' : 'deactivated'}`,
      });

      await loadTwitterAccounts();
    } catch (error: any) {
      console.error('❌ Error updating account status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (account: TwitterAccount) => {
    const isExpired = account.token_expires_at && new Date(account.token_expires_at) < new Date();
    
    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    
    if (account.connection_status !== 'active') {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {account.connection_status}
        </Badge>
      );
    }
    
    if (account.is_active) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading Twitter accounts...</span>
          </div>
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
        {connectionError && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Connection Error</span>
            </div>
            <p className="text-red-700 mt-1">{connectionError}</p>
          </div>
        )}

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
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Connect Twitter Account
                </>
              )}
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
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Account
                  </>
                )}
              </Button>
            </div>

            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {account.profile_image_url ? (
                    <img 
                      src={account.profile_image_url} 
                      alt={`${account.username} profile`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <Twitter className="h-10 w-10 text-blue-500 p-2 border rounded-full" />
                  )}
                  <div>
                    <div className="font-medium">@{account.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.display_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Connected {new Date(account.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {getStatusBadge(account)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAccountStatus(account.id, !account.is_active)}
                    disabled={account.connection_status !== 'active'}
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

        <div className="text-xs text-muted-foreground">
          <p>🔒 Your Twitter credentials are securely stored and encrypted.</p>
          <p>📝 Connected accounts can be used by AI agents to post on your behalf.</p>
        </div>
      </CardContent>
    </Card>
  );
};
