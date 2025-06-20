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
          
          // Fix: Properly reconstruct the Ed25519Keypair from stored private key bytes
          let ephemeralKeyPair = null;
          if (parsed.ephemeralPrivateKey) {
            // Convert the stored array back to Uint8Array and create keypair
            const privateKeyBytes = new Uint8Array(parsed.ephemeralPrivateKey);
            ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          }
          
          setState(prev => ({
            ...prev,
            userAddress: parsed.userAddress || null,
            maxEpoch: parsed.maxEpoch || null,
            randomness: parsed.randomness || null,
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

  // Fix: Improved state persistence
  const saveState = useCallback((newState: Partial<ZkLoginState>) => {
    try {
      const stateToSave = {
        userAddress: newState.userAddress,
        maxEpoch: newState.maxEpoch,
        randomness: newState.randomness,
        // Fix: Store only the private key bytes, not the full keypair object
        ephemeralPrivateKey: newState.ephemeralKeyPair ? 
          Array.from(newState.ephemeralKeyPair.getSecretKey()) : null,
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

      console.log('Starting ZK Login flow...');

      // Step 1: Generate randomness and ephemeral key pair
      const randomness = generateRandomness();
      const ephemeralKeyPair = Ed25519Keypair.generate();
      
      console.log('Generated ephemeral keypair and randomness');
      
      // Step 2: Get current epoch from SUI network and calculate max epoch
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      console.log(`Current epoch: ${currentEpoch}, Max epoch: ${maxEpoch}`);
      
      // Step 3: Generate nonce
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

      console.log('Generated nonce:', nonce);

      // Step 4: Save state before redirect
      const newState = {
        ephemeralKeyPair,
        maxEpoch,
        randomness,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState(newState);

      // Step 5: Build Google OAuth URL and redirect
      const redirectUrl = getRedirectUrl();
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      googleAuthUrl.searchParams.append('client_id', ZK_LOGIN_CONFIG.CLIENT_ID);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUrl);
      googleAuthUrl.searchParams.append('response_type', 'id_token');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('nonce', nonce);
      
      console.log('Redirecting to Google OAuth:', googleAuthUrl.toString());
      
      // Fix: Use window.location.assign for proper redirect (not iframe)
      window.location.assign(googleAuthUrl.toString());
      
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

      console.log('Handling OAuth callback with JWT...');

      // Get stored state
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No stored ZK Login state found');
      }

      const { randomness, maxEpoch, ephemeralPrivateKey } = JSON.parse(stored);
      
      if (!randomness || !maxEpoch || !ephemeralPrivateKey) {
        throw new Error('Incomplete ZK Login state found');
      }

      console.log('Found stored state, starting proof generation...');

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
        new Uint8Array(ephemeralPrivateKey)
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

      // Step 4: Generate SUI address from JWT
      const userAddress = jwtToAddress(idToken, salt);
      
      const newState = {
        userAddress,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      // Fix: Only pass valid ZkLoginState properties
      saveState({ randomness, maxEpoch, ...newState, ephemeralKeyPair });
      
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
