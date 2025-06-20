
import { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { jwtToAddress } from '@mysten/zklogin';
import { ZK_LOGIN_CONFIG, getRedirectUrl, getCurrentEpoch } from '@/config/zkLogin';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Step 2: Get current epoch from SUI network and calculate max epoch
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      console.log(`Current epoch: ${currentEpoch}, Max epoch: ${maxEpoch}`);
      
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

      const { randomness, maxEpoch, ephemeralKeyPair: storedEphemeralKey } = JSON.parse(stored);
      
      if (!randomness || !maxEpoch || !storedEphemeralKey) {
        throw new Error('Incomplete ZK Login state found');
      }

      console.log('Starting ZK Login proof generation...');

      // Step 1: Get salt from Enoki via edge function
      console.log('Requesting salt from Enoki...');
      const saltResponse = await supabase.functions.invoke('zklogin-proof/salt', {
        body: { jwt: idToken }
      });

      if (saltResponse.error) {
        throw new Error(`Salt request failed: ${saltResponse.error.message}`);
      }

      const { salt } = saltResponse.data;
      console.log('Salt received from Enoki');

      // Step 2: Reconstruct ephemeral keypair
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
        new Uint8Array(storedEphemeralKey.secretKey)
      );
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();

      // Step 3: Generate ZK proof via Enoki edge function
      console.log('Requesting ZK proof from Enoki...');
      const proofResponse = await supabase.functions.invoke('zklogin-proof/proof', {
        body: {
          jwt: idToken,
          ephemeralPublicKey: ephemeralPublicKey.toSuiBytes(),
          maxEpoch,
          jwtRandomness: randomness,
          salt,
          keyClaimName: 'sub'
        }
      });

      if (proofResponse.error) {
        throw new Error(`Proof generation failed: ${proofResponse.error.message}`);
      }

      console.log('ZK proof received from Enoki');

      // Step 4: Generate SUI address from JWT (following SUI SDK docs)
      const userAddress = jwtToAddress(idToken, salt);
      
      const newState = {
        userAddress,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState({ ...JSON.parse(stored), ...newState });
      
      console.log('ZK Login completed successfully, user address:', userAddress);
      
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
