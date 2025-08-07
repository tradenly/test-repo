import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, Trash2, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TwitterConnection {
  id: string;
  twitter_user_id: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  is_active: boolean;
  connection_status: string;
  created_at: string;
  last_used_at?: string;
  rate_limit_remaining: number;
}

interface TwitterConnectionManagerProps {
  userId: string;
  onConnectionChange?: () => void;
}

export const TwitterConnectionManager: React.FC<TwitterConnectionManagerProps> = ({
  userId,
  onConnectionChange
}) => {
  const [connections, setConnections] = useState<TwitterConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('twitter-oauth-v2', {
        body: { action: 'check-connection', userId }
      });

      if (error) throw error;

      setConnections(data.connections || []);
    } catch (error: any) {
      console.error('Error loading connections:', error);
      toast({
        title: "Error",
        description: "Failed to load Twitter connections.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const connectTwitter = async () => {
    try {
      setIsConnecting(true);
      
      // Start OAuth flow
      const { data, error } = await supabase.functions.invoke('twitter-oauth-v2', {
        body: { action: 'start-auth', userId }
      });

      if (error) throw error;

      // Open popup for OAuth
      const popup = window.open(
        data.authUrl,
        'twitter-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open popup. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
          toast({
            title: "Connected!",
            description: `Successfully connected @${event.data.username}`
          });
          loadConnections();
          onConnectionChange?.();
          popup.close();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect Twitter account.",
            variant: "destructive"
          });
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Clean up if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error connecting Twitter:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start Twitter connection.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectTwitter = async (connectionId: string, username: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('twitter-oauth-v2', {
        body: { action: 'disconnect', userId, connectionId }
      });

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: `Disconnected @${username}`
      });

      loadConnections();
      onConnectionChange?.();
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Twitter account.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (connection: TwitterConnection) => {
    if (!connection.is_active) {
      return <Badge variant="secondary">Disconnected</Badge>;
    }
    if (connection.connection_status === 'active') {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Connected</Badge>;
    }
    return <Badge variant="destructive">Error</Badge>;
  };

  const getRateLimitBadge = (remaining: number) => {
    if (remaining > 200) {
      return <Badge variant="default" className="bg-green-500">Good</Badge>;
    }
    if (remaining > 50) {
      return <Badge variant="secondary" className="bg-yellow-500">Limited</Badge>;
    }
    return <Badge variant="destructive">Low</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Twitter Connections</CardTitle>
          <CardDescription>Loading your Twitter connections...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Twitter Connections
        </CardTitle>
        <CardDescription>
          Connect your Twitter accounts to enable AI agent posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connections.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No Twitter accounts connected. Connect an account to enable AI agent posting.
            </AlertDescription>
          </Alert>
        )}

        {connections.map((connection) => (
          <div key={connection.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {connection.profile_image_url && (
                  <img
                    src={connection.profile_image_url}
                    alt={`@${connection.username}`}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <h4 className="font-medium">{connection.display_name}</h4>
                  <p className="text-sm text-muted-foreground">@{connection.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(connection)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectTwitter(connection.id, connection.username)}
                  disabled={!connection.is_active}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Rate Limit:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getRateLimitBadge(connection.rate_limit_remaining)}
                  <span>{connection.rate_limit_remaining}/300</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Connected:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(connection.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {connection.last_used_at && (
              <div className="text-sm">
                <span className="text-muted-foreground">Last used:</span>
                <span className="ml-2">{new Date(connection.last_used_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button
            onClick={connectTwitter}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Twitter Account
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will open a secure Twitter authorization page
          </p>
        </div>
      </CardContent>
    </Card>
  );
};