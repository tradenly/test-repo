
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
          
          let ephemeralKeyPair = null;
          if (parsed.ephemeralPrivateKey && Array.isArray(parsed.ephemeralPrivateKey)) {
            const privateKeyBytes = new Uint8Array(parsed.ephemeralPrivateKey);
            if (privateKeyBytes.length === 32) {
              ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
            } else {
              console.warn('Invalid ephemeral key length, clearing stored state');
              localStorage.removeItem(STORAGE_KEY);
            }
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
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, error: 'Failed to load saved state', isInitialized: true }));
      }
    };

    loadStoredState();
  }, []);

  const saveState = useCallback((newState: Partial<ZkLoginState>) => {
    try {
      const stateToSave = {
        userAddress: newState.userAddress,
        maxEpoch: newState.maxEpoch,
        randomness: newState.randomness,
        ephemeralPrivateKey: newState.ephemeralKeyPair ? 
          Array.from(newState.ephemeralKeyPair.getSecretKey().slice(0, 32)) : null,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save ZK Login state:', error);
    }
  }, []);

  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Starting ZK Login flow...');

      const randomness = generateRandomness();
      const ephemeralKeyPair = Ed25519Keypair.generate();
      
      console.log('Generated ephemeral keypair and randomness');
      
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      console.log(`Current epoch: ${currentEpoch}, Max epoch: ${maxEpoch}`);
      
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

      console.log('Generated nonce:', nonce);

      const newState = {
        ephemeralKeyPair,
        maxEpoch,
        randomness,
        isLoading: false,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState(newState);

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
  }, [saveState]);

  const handleOAuthCallback = useCallback(async (idToken: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Handling OAuth callback with JWT...');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No stored ZK Login state found');
      }

      const { randomness, maxEpoch, ephemeralPrivateKey } = JSON.parse(stored);
      
      if (!randomness || !maxEpoch || !ephemeralPrivateKey) {
        throw new Error('Incomplete ZK Login state found');
      }

      console.log('Found stored state, requesting salt from Enoki...');

      // Get salt from Enoki via edge function
      const saltResponse = await supabase.functions.invoke('zklogin-proof', {
        body: { action: 'salt', jwt: idToken }
      });

      if (saltResponse.error) {
        throw new Error(`Salt request failed: ${saltResponse.error.message}`);
      }

      const { salt } = saltResponse.data;
      console.log('Salt received from Enoki');

      // Reconstruct ephemeral keypair
      const privateKeyBytes = new Uint8Array(ephemeralPrivateKey);
      if (privateKeyBytes.length !== 32) {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length}, expected 32`);
      }

      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

      // Generate SUI address from JWT and salt
      const userAddress = jwtToAddress(idToken, salt);
      
      const newState = {
        userAddress,
        isLoading: false,
        ephemeralKeyPair,
        error: null,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState({ randomness, maxEpoch, ...newState });
      
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
