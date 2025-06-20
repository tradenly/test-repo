
import { useState, useEffect, useCallback } from 'react';
import { useEnokiFlow } from '@mysten/enoki/react';
import { Transaction } from '@mysten/sui/transactions';

interface EnokiAuthState {
  isInitialized: boolean;
  isLoading: boolean;
  userAddress: string | null;
  error: string | null;
  isAuthenticated: boolean;
}

export const useEnokiAuth = () => {
  const [state, setState] = useState<EnokiAuthState>({
    isInitialized: false,
    isLoading: false,
    userAddress: null,
    error: null,
    isAuthenticated: false,
  });

  const enokiFlow = useEnokiFlow();

  // Initialize from Enoki state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Check if user is already authenticated with Enoki
        const address = await enokiFlow.getAddress();
        
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
  }, [enokiFlow]);

  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Starting Enoki ZK Login flow...');
      
      // Use Enoki's createAuthorizationURL for Google OAuth
      const authUrl = await enokiFlow.createAuthorizationURL({
        provider: 'google',
        network: 'mainnet',
        extraParams: {
          prompt: 'select_account', // Force account selection
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
      await enokiFlow.handleAuthCallback({
        authorizationCode,
      });
      
      // Get the authenticated address
      const address = await enokiFlow.getAddress();
      
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
  }, [enokiFlow]);

  const executeTransaction = useCallback(async (transaction: Transaction) => {
    try {
      console.log('Executing transaction with Enoki...');
      
      if (!state.isAuthenticated || !state.userAddress) {
        throw new Error('User must be authenticated to execute transactions');
      }
      
      // Set sender on the transaction
      transaction.setSender(state.userAddress);
      
      // Use Enoki's executeTransactionBlock method
      const result = await enokiFlow.executeTransactionBlock({
        transactionBlock: transaction,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });
      
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
  }, [enokiFlow, state.isAuthenticated, state.userAddress]);

  const isReadyForTransactions = useCallback(() => {
    return state.isAuthenticated && !!state.userAddress;
  }, [state.isAuthenticated, state.userAddress]);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out from Enoki...');
      
      // Use Enoki's logout method
      await enokiFlow.logout();
      
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
  }, [enokiFlow]);

  return {
    ...state,
    startZkLogin,
    handleOAuthCallback,
    executeTransaction,
    isReadyForTransactions,
    logout,
  };
};
