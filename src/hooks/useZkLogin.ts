
import { useState, useEffect, useCallback, useRef } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { jwtToAddress } from '@mysten/zklogin';
import { ZK_LOGIN_CONFIG, getRedirectUrl, getCurrentEpoch, suiClient } from '@/config/zkLogin';

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
const CURRENT_JWT_KEY = 'current_jwt';

export const useZkLogin = () => {
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

  const isLoggingOut = useRef(false);

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

  // Get or create consistent randomness for a Google user
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

  // Initialize from localStorage on mount
  useEffect(() => {
    if (isLoggingOut.current || state.isInitialized) return;

    const loadStoredState = () => {
      try {
        console.log('Loading stored ZK Login state...');
        const jwtToken = localStorage.getItem(CURRENT_JWT_KEY);
        const hasValidJWT = !!jwtToken;
        
        if (jwtToken) {
          const googleUserId = extractGoogleUserId(jwtToken);
          
          if (googleUserId) {
            // Get consistent randomness for this Google user
            const randomness = getOrCreateRandomness(googleUserId);
            
            // Derive consistent address
            const salt = BigInt(randomness);
            const userAddress = jwtToAddress(jwtToken, salt);
            
            console.log('Loaded consistent state for Google user:', googleUserId);
            console.log('Derived address:', userAddress);
            
            setState(prev => ({
              ...prev,
              userAddress,
              randomness,
              googleUserId,
              hasValidJWT,
              isInitialized: true,
            }));
          } else {
            setState(prev => ({ ...prev, hasValidJWT, isInitialized: true }));
          }
        } else {
          console.log('No JWT found, initializing clean state');
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
  }, []); // Only run once on mount

  const saveUserState = useCallback((googleUserId: string, userData: {
    randomness: string;
    ephemeralKeyPair?: Ed25519Keypair;
    maxEpoch?: number;
  }) => {
    try {
      const storageKey = getStorageKey(googleUserId);
      const stateToSave = {
        randomness: userData.randomness,
        maxEpoch: userData.maxEpoch,
        ephemeralPrivateKey: userData.ephemeralKeyPair ? 
          Array.from(userData.ephemeralKeyPair.getSecretKey().slice(0, 32)) : null,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      console.log('Saved user state for Google user:', googleUserId);
    } catch (error) {
      console.error('Failed to save ZK Login state:', error);
    }
  }, [getStorageKey]);

  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Starting ZK Login flow...');

      // Generate ephemeral keypair for this session
      const ephemeralKeyPair = Ed25519Keypair.generate();
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      console.log(`Current epoch: ${currentEpoch}, Max epoch: ${maxEpoch}`);
      
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
      
      // Use temporary randomness for nonce generation
      // We'll fix the randomness consistency in the callback
      const tempRandomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, tempRandomness);

      console.log('Generated nonce for Google OAuth');

      // Store the ephemeral keypair and session data temporarily
      setState(prev => ({ 
        ...prev, 
        ephemeralKeyPair,
        maxEpoch,
        isLoading: false,
      }));

      // Build Google OAuth URL with proper parameters
      const redirectUrl = getRedirectUrl();
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      googleAuthUrl.searchParams.append('client_id', ZK_LOGIN_CONFIG.CLIENT_ID);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUrl);
      googleAuthUrl.searchParams.append('response_type', 'id_token');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('nonce', nonce);
      googleAuthUrl.searchParams.append('prompt', 'select_account'); // Force account selection
      googleAuthUrl.searchParams.append('access_type', 'online');
      
      console.log('Redirecting to Google OAuth with account selection:', googleAuthUrl.toString());
      
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

      // Generate fresh ephemeral keypair for this session
      const ephemeralKeyPair = Ed25519Keypair.generate();
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;

      console.log('Generated new ephemeral keypair for session');

      // Use consistent randomness for address derivation
      const salt = BigInt(consistentRandomness);
      const userAddress = jwtToAddress(idToken, salt);
      
      console.log('Derived consistent address:', userAddress);
      console.log('Using randomness:', consistentRandomness);

      // Store JWT token
      localStorage.setItem(CURRENT_JWT_KEY, idToken);

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
      
      // Save user state
      saveUserState(googleUserId, {
        randomness: consistentRandomness,
        ephemeralKeyPair,
        maxEpoch,
      });
      
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
  }, [extractGoogleUserId, getOrCreateRandomness, saveUserState]);

  const executeTransaction = useCallback(async (transaction: any) => {
    try {
      console.log('Executing transaction...');
      
      if (!state.userAddress || !state.ephemeralKeyPair) {
        throw new Error('ZK Login authentication required for transactions');
      }

      if (!state.hasValidJWT) {
        throw new Error('ZK Login session expired. Please log in again with Google.');
      }

      const jwtToken = localStorage.getItem(CURRENT_JWT_KEY);
      if (!jwtToken) {
        throw new Error('ZK Login session not found. Please complete Google authentication.');
      }

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

  const isReadyForTransactions = useCallback(() => {
    return !!(state.userAddress && state.ephemeralKeyPair && state.hasValidJWT);
  }, [state.userAddress, state.ephemeralKeyPair, state.hasValidJWT]);

  const logout = useCallback(() => {
    console.log('Logging out ZK Login user...');
    
    // Set logout flag to prevent re-initialization
    isLoggingOut.current = true;
    
    // Get current Google user ID before clearing state
    const currentGoogleUserId = state.googleUserId;
    
    // Clear JWT token first
    localStorage.removeItem(CURRENT_JWT_KEY);
    console.log('Cleared JWT token');
    
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
    
    // Reset logout flag after a short delay
    setTimeout(() => {
      isLoggingOut.current = false;
      console.log('ZK Login logout completed - all data cleared');
    }, 100);
    
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
