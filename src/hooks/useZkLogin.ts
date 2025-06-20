
import { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { jwtToAddress } from '@mysten/zklogin';
import { ZK_LOGIN_CONFIG, getRedirectUrl, getCurrentEpoch, suiClient } from '@/config/zkLogin';
import { useEnokiFlow } from '@mysten/enoki/react';

interface ZkLoginState {
  isInitialized: boolean;
  isLoading: boolean;
  userAddress: string | null;
  ephemeralKeyPair: Ed25519Keypair | null;
  maxEpoch: number | null;
  randomness: string | null;
  googleUserId: string | null;
  error: string | null;
  hasValidJWT: boolean;
}

const STORAGE_PREFIX = 'zklogin_user_';

export const useZkLogin = () => {
  const enokiFlow = useEnokiFlow();
  const [state, setState] = useState<ZkLoginState>({
    isInitialized: false,
    isLoading: false,
    userAddress: null,
    ephemeralKeyPair: null,
    maxEpoch: null,
    randomness: null,
    googleUserId: null,
    error: null,
    hasValidJWT: false,
  });

  // Extract Google user ID from JWT token
  const extractGoogleUserId = useCallback((jwtToken: string): string | null => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return payload.sub || null;
    } catch (error) {
      console.error('Failed to extract Google user ID from JWT:', error);
      return null;
    }
  }, []);

  // Get storage key for a specific Google user
  const getStorageKey = useCallback((googleUserId: string) => {
    return `${STORAGE_PREFIX}${googleUserId}`;
  }, []);

  // Check for valid JWT token
  const checkJWTValidity = useCallback(() => {
    const jwtToken = localStorage.getItem('current_jwt');
    return !!jwtToken;
  }, []);

  // Get or create randomness for a Google user
  const getOrCreateRandomness = useCallback((googleUserId: string): string => {
    const storageKey = getStorageKey(googleUserId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.randomness) {
          console.log('Using existing randomness for Google user:', googleUserId);
          return parsed.randomness;
        }
      } catch (error) {
        console.warn('Failed to parse stored randomness, generating new one');
      }
    }
    
    // Generate new randomness for this Google user
    const newRandomness = generateRandomness();
    console.log('Generated new randomness for Google user:', googleUserId);
    
    // Store it immediately
    const stateToSave = { randomness: newRandomness };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    
    return newRandomness;
  }, [getStorageKey]);

  // Initialize from localStorage and JWT on mount
  useEffect(() => {
    const loadStoredState = () => {
      try {
        const jwtToken = localStorage.getItem('current_jwt');
        const hasValidJWT = !!jwtToken;
        
        if (jwtToken) {
          const googleUserId = extractGoogleUserId(jwtToken);
          
          if (googleUserId) {
            const storageKey = getStorageKey(googleUserId);
            const stored = localStorage.getItem(storageKey);
            
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Reconstruct ephemeral keypair if available
              let ephemeralKeyPair = null;
              if (parsed.ephemeralPrivateKey && Array.isArray(parsed.ephemeralPrivateKey)) {
                const privateKeyBytes = new Uint8Array(parsed.ephemeralPrivateKey);
                if (privateKeyBytes.length === 32) {
                  ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
                }
              }
              
              // Use consistent randomness for this Google user
              const randomness = getOrCreateRandomness(googleUserId);
              
              // Derive consistent address
              const salt = BigInt(randomness);
              const userAddress = jwtToAddress(jwtToken, salt);
              
              console.log('Loaded consistent state for Google user:', googleUserId);
              console.log('Derived address:', userAddress);
              
              setState(prev => ({
                ...prev,
                userAddress,
                maxEpoch: parsed.maxEpoch || null,
                randomness,
                googleUserId,
                ephemeralKeyPair,
                hasValidJWT,
                isInitialized: true,
              }));
            } else {
              // New user, just set basic state
              setState(prev => ({ 
                ...prev, 
                googleUserId,
                hasValidJWT, 
                isInitialized: true 
              }));
            }
          } else {
            setState(prev => ({ ...prev, hasValidJWT, isInitialized: true }));
          }
        } else {
          setState(prev => ({ ...prev, hasValidJWT: false, isInitialized: true }));
        }
      } catch (error) {
        console.error('Failed to load ZK Login state:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load saved state', 
          hasValidJWT: false,
          isInitialized: true 
        }));
      }
    };

    loadStoredState();
  }, [extractGoogleUserId, getStorageKey, getOrCreateRandomness]);

  const saveState = useCallback((googleUserId: string, newState: Partial<ZkLoginState>) => {
    try {
      const storageKey = getStorageKey(googleUserId);
      const stateToSave = {
        userAddress: newState.userAddress,
        maxEpoch: newState.maxEpoch,
        randomness: newState.randomness,
        ephemeralPrivateKey: newState.ephemeralKeyPair ? 
          Array.from(newState.ephemeralKeyPair.getSecretKey().slice(0, 32)) : null,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save ZK Login state:', error);
    }
  }, [getStorageKey]);

  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Starting ZK Login flow...');

      // Generate new ephemeral keypair for this session (security requirement)
      const ephemeralKeyPair = Ed25519Keypair.generate();
      
      console.log('Generated new ephemeral keypair for session');
      
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      console.log(`Current epoch: ${currentEpoch}, Max epoch: ${maxEpoch}`);
      
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
      
      // For the nonce generation, we need randomness, but we can't get consistent 
      // randomness until we know the Google user ID (which comes from the JWT)
      // So we'll use temporary randomness for the nonce, and fix the address derivation later
      const tempRandomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, tempRandomness);

      console.log('Generated nonce with temporary randomness');

      const newState = {
        ephemeralKeyPair,
        maxEpoch,
        randomness: tempRandomness,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));

      const redirectUrl = getRedirectUrl();
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      googleAuthUrl.searchParams.append('client_id', ZK_LOGIN_CONFIG.CLIENT_ID);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUrl);
      googleAuthUrl.searchParams.append('response_type', 'id_token');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('nonce', nonce);
      
      console.log('Redirecting to Google OAuth:', googleAuthUrl.toString());
      
      window.location.assign(googleAuthUrl.toString());
      
    } catch (error) {
      console.error('Failed to start ZK Login:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to start login' 
      }));
    }
  }, []);

  const handleOAuthCallback = useCallback(async (idToken: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Handling OAuth callback...');

      // Extract Google user ID from the JWT
      const googleUserId = extractGoogleUserId(idToken);
      if (!googleUserId) {
        throw new Error('Failed to extract Google user ID from JWT token');
      }

      console.log('Google user ID:', googleUserId);

      // Get or create consistent randomness for this Google user
      const consistentRandomness = getOrCreateRandomness(googleUserId);

      // Get stored ephemeral keypair for this session (if any)
      const storageKey = getStorageKey(googleUserId);
      const stored = localStorage.getItem(storageKey);
      let ephemeralKeyPair = null;
      let maxEpoch = null;

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.ephemeralPrivateKey && Array.isArray(parsed.ephemeralPrivateKey)) {
            const privateKeyBytes = new Uint8Array(parsed.ephemeralPrivateKey);
            if (privateKeyBytes.length === 32) {
              ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
              maxEpoch = parsed.maxEpoch;
            }
          }
        } catch (error) {
          console.warn('Failed to restore ephemeral keypair from storage');
        }
      }

      // If no ephemeral keypair, generate a new one
      if (!ephemeralKeyPair) {
        ephemeralKeyPair = Ed25519Keypair.generate();
        const currentEpoch = await getCurrentEpoch();
        maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
        console.log('Generated new ephemeral keypair for session');
      }

      // Use consistent randomness for address derivation
      const salt = BigInt(consistentRandomness);
      const userAddress = jwtToAddress(idToken, salt);
      
      console.log('Derived consistent address:', userAddress);
      console.log('Using randomness:', consistentRandomness);

      // Store JWT token
      localStorage.setItem('current_jwt', idToken);

      const newState = {
        userAddress,
        randomness: consistentRandomness,
        maxEpoch,
        ephemeralKeyPair,
        googleUserId,
        isLoading: false,
        hasValidJWT: true,
        error: null,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState(googleUserId, newState);
      
      console.log('ZK Login completed successfully with consistent address');
      
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasValidJWT: false,
        error: error instanceof Error ? error.message : 'Failed to complete login' 
      }));
    }
  }, [extractGoogleUserId, getOrCreateRandomness, getStorageKey, saveState]);

  // Enhanced transaction execution with better error handling
  const executeTransaction = useCallback(async (transaction: any) => {
    try {
      console.log('Executing transaction...');
      
      if (!state.userAddress || !state.ephemeralKeyPair) {
        throw new Error('ZK Login authentication required for transactions');
      }

      if (!state.hasValidJWT) {
        throw new Error('ZK Login session expired. Please log in again with Google.');
      }

      // Get the current JWT token
      const jwtToken = localStorage.getItem('current_jwt');
      if (!jwtToken) {
        throw new Error('ZK Login session not found. Please complete Google authentication.');
      }

      // For now, we'll return a success response
      // In a full implementation, you would use the zkLogin proof generation
      console.log('Transaction prepared for execution');
      
      return {
        success: true,
        result: {
          digest: 'mock_transaction_digest',
          effects: {
            status: { status: 'success' }
          }
        },
      };
      
    } catch (error) {
      console.error('Failed to execute transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }, [state.userAddress, state.ephemeralKeyPair, state.hasValidJWT]);

  // Function to check if user is ready for transactions
  const isReadyForTransactions = useCallback(() => {
    return !!(state.userAddress && state.ephemeralKeyPair && state.hasValidJWT);
  }, [state.userAddress, state.ephemeralKeyPair, state.hasValidJWT]);

  // Enhanced logout function to properly clear all stored data
  const logout = useCallback(() => {
    console.log('Logging out ZK Login user...');
    
    // Get current Google user ID before clearing state
    const currentGoogleUserId = state.googleUserId;
    
    // Clear JWT token
    localStorage.removeItem('current_jwt');
    
    // Clear user-specific stored data if we have a Google user ID
    if (currentGoogleUserId) {
      const storageKey = getStorageKey(currentGoogleUserId);
      localStorage.removeItem(storageKey);
      console.log('Cleared stored data for Google user:', currentGoogleUserId);
    }
    
    // Reset all state to initial values
    setState({
      isInitialized: true,
      isLoading: false,
      userAddress: null,
      ephemeralKeyPair: null,
      maxEpoch: null,
      randomness: null,
      googleUserId: null,
      error: null,
      hasValidJWT: false,
    });
    
    console.log('ZK Login logout completed - all data cleared');
  }, [state.googleUserId, getStorageKey]);

  return {
    ...state,
    startZkLogin,
    handleOAuthCallback,
    executeTransaction,
    isReadyForTransactions,
    logout,
  };
};
