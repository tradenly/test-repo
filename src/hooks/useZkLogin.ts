
import { useCallback } from 'react';
import { useEnokiFlow } from '@mysten/enoki/react';

export const useZkLogin = () => {
  const enokiFlow = useEnokiFlow();

  const startZkLogin = useCallback(async () => {
    try {
      console.log('Starting ZK Login with Enoki Flow...');
      
      // Use Enoki's built-in Google OAuth flow
      const authUrl = await enokiFlow.createAuthorizationURL({
        provider: 'google',
        clientId: '821258811515-c3mtuebmirhtn0t0f7gm9oqe9prhjqqs.apps.googleusercontent.com',
        redirectUrl: `${window.location.origin}/auth/callback`,
        extraParams: {
          scope: 'openid email profile',
        }
      });

      console.log('Redirecting to Enoki auth URL:', authUrl);
      window.location.assign(authUrl);
      
    } catch (error) {
      console.error('Failed to start ZK Login with Enoki:', error);
      throw error;
    }
  }, [enokiFlow]);

  const handleOAuthCallback = useCallback(async (authorizationCode: string) => {
    try {
      console.log('Handling OAuth callback with Enoki...');
      
      // Use Enoki's built-in callback handling
      const result = await enokiFlow.handleAuthCallback({
        authorizationCode,
      });

      console.log('Enoki auth completed successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Failed to handle OAuth callback with Enoki:', error);
      throw error;
    }
  }, [enokiFlow]);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out with Enoki...');
      await enokiFlow.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [enokiFlow]);

  return {
    // Return Enoki flow state directly
    isInitialized: true,
    isLoading: enokiFlow.loading,
    userAddress: enokiFlow.address,
    error: null,
    
    // Our methods
    startZkLogin,
    handleOAuthCallback,
    logout,
    
    // Expose Enoki flow for advanced usage
    enokiFlow,
  };
};
