
import { useState, useEffect, useCallback } from 'react';
import { useEnokiFlow } from '@mysten/enoki/react';
import { Transaction } from '@mysten/sui/transactions';
import { ZK_LOGIN_CONFIG, getRedirectUrl } from '@/config/zkLogin';

interface EnokiAuthState {
  isInitialized: boolean;
  isLoading: boolean;
  userAddress: string | null;
  error: string | null;
  isAuthenticated: boolean;
}

// Type assertion helpers for accessing Enoki flow properties
type EnokiFlowWithAddress = {
  getAddress?: () => Promise<string>;
  address?: string;
  user?: { address: string };
  sponsorAndExecuteTransactionBlock?: (params: any) => Promise<any>;
  signAndExecuteTransactionBlock?: (params: any) => Promise<any>;
  executeTransactionBlock?: (params: any) => Promise<any>;
  logout?: () => Promise<void>;
};

export const useEnokiAuth = () => {
  const [state, setState] = useState<EnokiAuthState>({
    isInitialized: false,
    isLoading: false,
    userAddress: null,
    error: null,
    isAuthenticated: false,
  });

  const enokiFlow = useEnokiFlow();
  const enokiFlowExtended = enokiFlow as typeof enokiFlow & EnokiFlowWithAddress;

  // Initialize from Enoki state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Check if user is already authenticated with Enoki
        // Try different ways to access the address based on Enoki API
        let address: string | null = null;
        
        if (typeof enokiFlowExtended.getAddress === 'function') {
          address = await enokiFlowExtended.getAddress();
        } else if (enokiFlowExtended.address) {
          address = enokiFlowExtended.address;
        } else if (enokiFlowExtended.user?.address) {
          address = enokiFlowExtended.user.address;
        }
        
        if (address) {
          console.log('Enoki authenticated with address:', address);
          setState({
            isInitialized: true,
            isLoading: false,
            userAddress: address,
            error: null,
            isAuthenticated: true,
          });
        } else {
          console.log('No Enoki authentication found');
          setState({
            isInitialized: true,
            isLoading: false,
            userAddress: null,
            error: null,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize Enoki auth:', error);
        setState({
          isInitialized: true,
          isLoading: false,
          userAddress: null,
          error: error instanceof Error ? error.message : 'Failed to initialize',
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, [enokiFlowExtended]);

  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Starting Enoki ZK Login flow...');
      
      // Use Enoki's createAuthorizationURL with required parameters
      const authUrl = await enokiFlow.createAuthorizationURL({
        provider: 'google',
        clientId: ZK_LOGIN_CONFIG.CLIENT_ID,
        redirectUrl: getRedirectUrl(),
        network: 'mainnet',
        extraParams: {
          prompt: 'select_account',
        },
      });
      
      console.log('Redirecting to Enoki Google OAuth:', authUrl);
      window.location.assign(authUrl);
      
    } catch (error) {
      console.error('Failed to start Enoki ZK Login:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to start login' 
      }));
    }
  }, [enokiFlow]);

  const handleOAuthCallback = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Handling Enoki OAuth callback...');
      
      // Get authorization from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get('code');
      
      if (!authorizationCode) {
        throw new Error('No authorization code found in callback');
      }
      
      // Complete the OAuth flow with Enoki
      await enokiFlow.handleAuthCallback(authorizationCode);
      
      // Get the authenticated address - try multiple methods
      let address: string | null = null;
      
      if (typeof enokiFlowExtended.getAddress === 'function') {
        address = await enokiFlowExtended.getAddress();
      } else if (enokiFlowExtended.address) {
        address = enokiFlowExtended.address;
      } else if (enokiFlowExtended.user?.address) {
        address = enokiFlowExtended.user.address;
      }
      
      if (!address) {
        throw new Error('Failed to get address after authentication');
      }
      
      console.log('Enoki authentication completed with address:', address);
      
      setState({
        isInitialized: true,
        isLoading: false,
        userAddress: address,
        error: null,
        isAuthenticated: true,
      });
      
    } catch (error) {
      console.error('Failed to handle Enoki OAuth callback:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Failed to complete login' 
      }));
    }
  }, [enokiFlow, enokiFlowExtended]);

  const executeTransaction = useCallback(async (transaction: Transaction) => {
    try {
      console.log('Executing transaction with Enoki...');
      
      if (!state.isAuthenticated || !state.userAddress) {
        throw new Error('User must be authenticated to execute transactions');
      }
      
      // Set sender on the transaction
      transaction.setSender(state.userAddress);
      
      // Try different Enoki transaction execution methods
      let result;
      
      if (typeof enokiFlowExtended.sponsorAndExecuteTransactionBlock === 'function') {
        result = await enokiFlowExtended.sponsorAndExecuteTransactionBlock({
          transactionBlock: transaction,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        });
      } else if (typeof enokiFlowExtended.signAndExecuteTransactionBlock === 'function') {
        result = await enokiFlowExtended.signAndExecuteTransactionBlock({
          transactionBlock: transaction,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        });
      } else if (typeof enokiFlowExtended.executeTransactionBlock === 'function') {
        result = await enokiFlowExtended.executeTransactionBlock({
          transactionBlock: transaction,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        });
      } else {
        throw new Error('No transaction execution method available on Enoki flow');
      }
      
      console.log('Transaction executed successfully:', result.digest);
      
      return {
        success: true,
        result: {
          digest: result.digest,
          effects: result.effects,
          events: result.events,
          objectChanges: result.objectChanges,
        },
      };
      
    } catch (error) {
      console.error('Failed to execute transaction with Enoki:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }, [enokiFlowExtended, state.isAuthenticated, state.userAddress]);

  const isReadyForTransactions = useCallback(() => {
    return state.isAuthenticated && !!state.userAddress;
  }, [state.isAuthenticated, state.userAddress]);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out from Enoki...');
      
      // Use Enoki's logout method if available
      if (typeof enokiFlowExtended.logout === 'function') {
        await enokiFlowExtended.logout();
      }
      
      setState({
        isInitialized: true,
        isLoading: false,
        userAddress: null,
        error: null,
        isAuthenticated: false,
      });
      
      console.log('Enoki logout completed');
      
    } catch (error) {
      console.error('Failed to logout from Enoki:', error);
      // Even if logout fails, clear local state
      setState({
        isInitialized: true,
        isLoading: false,
        userAddress: null,
        error: null,
        isAuthenticated: false,
      });
    }
  }, [enokiFlowExtended]);

  return {
    ...state,
    startZkLogin,
    handleOAuthCallback,
    executeTransaction,
    isReadyForTransactions,
    logout,
  };
};
