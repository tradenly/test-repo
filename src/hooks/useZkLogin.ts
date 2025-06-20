
import { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { jwtToAddress } from '@mysten/zklogin';
import { ZK_LOGIN_CONFIG, getRedirectUrl } from '@/config/zkLogin';

interface ZkLoginState {
  isInitialized: boolean;
  isLoading: boolean;
  userAddress: string | null;
  ephemeralKeyPair: Ed25519Keypair | null;
  maxEpoch: number | null;
  randomness: string | null;
  error: string | null;
}

const STORAGE_KEY = 'zklogin_state';

export const useZkLogin = () => {
  const [state, setState] = useState<ZkLoginState>({
    isInitialized: false,
    isLoading: false,
    userAddress: null,
    ephemeralKeyPair: null,
    maxEpoch: null,
    randomness: null,
    error: null,
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    const loadStoredState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          
          // Reconstruct the Ed25519Keypair from stored data
          let ephemeralKeyPair = null;
          if (parsed.ephemeralKeyPair) {
            ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
              new Uint8Array(parsed.ephemeralKeyPair.secretKey)
            );
          }
          
          setState(prev => ({
            ...prev,
            ...parsed,
            ephemeralKeyPair,
            isInitialized: true,
          }));
        } else {
          setState(prev => ({ ...prev, isInitialized: true }));
        }
      } catch (error) {
        console.error('Failed to load ZK Login state:', error);
        setState(prev => ({ ...prev, error: 'Failed to load saved state', isInitialized: true }));
      }
    };

    loadStoredState();
  }, []);

  // Save state to localStorage (excluding sensitive data)
  const saveState = useCallback((newState: Partial<ZkLoginState>) => {
    try {
      const stateToSave = {
        userAddress: newState.userAddress,
        maxEpoch: newState.maxEpoch,
        randomness: newState.randomness,
        ephemeralKeyPair: newState.ephemeralKeyPair ? {
          secretKey: Array.from(newState.ephemeralKeyPair.getSecretKey())
        } : null,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save ZK Login state:', error);
    }
  }, []);

  // Start the ZK Login flow - generates ephemeral key and redirects to Google
  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Step 1: Generate randomness and ephemeral key pair (from SUI docs)
      const randomness = generateRandomness();
      const ephemeralKeyPair = Ed25519Keypair.generate();
      
      // Step 2: Get current epoch and calculate max epoch
      // In production, you'd fetch this from SUI network
      const currentEpoch = Math.floor(Date.now() / 1000 / 86400); // Simplified
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      // Step 3: Generate nonce
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

      // Step 4: Save state before redirect
      const newState = {
        ephemeralKeyPair,
        maxEpoch,
        randomness,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState(newState);

      // Step 5: Redirect to Google OAuth (following Google OAuth 2.0 docs)
      const redirectUrl = getRedirectUrl();
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      googleAuthUrl.searchParams.append('client_id', ZK_LOGIN_CONFIG.CLIENT_ID);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUrl);
      googleAuthUrl.searchParams.append('response_type', 'id_token');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('nonce', nonce);
      
      window.location.href = googleAuthUrl.toString();
      
    } catch (error) {
      console.error('Failed to start ZK Login:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to start login' 
      }));
    }
  }, [saveState]);

  // Handle the OAuth callback with JWT
  const handleOAuthCallback = useCallback(async (idToken: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get stored state
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No stored ZK Login state found');
      }

      const { randomness, maxEpoch } = JSON.parse(stored);
      
      // Generate SUI address from JWT (following SUI SDK docs)
      const userAddress = jwtToAddress(idToken, randomness);
      
      const newState = {
        userAddress,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState({ ...JSON.parse(stored), ...newState });
      
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete login' 
      }));
    }
  }, [saveState]);

  // Clear all ZK Login state
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isInitialized: true,
      isLoading: false,
      userAddress: null,
      ephemeralKeyPair: null,
      maxEpoch: null,
      randomness: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startZkLogin,
    handleOAuthCallback,
    logout,
  };
};
