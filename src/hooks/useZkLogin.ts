import { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { jwtToAddress } from '@mysten/zklogin';
import { ZK_LOGIN_CONFIG, getRedirectUrl, getCurrentEpoch } from '@/config/zkLogin';
import { useEnokiFlow } from '@mysten/enoki/react';

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
  const enokiFlow = useEnokiFlow();
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

      console.log('Starting ZK Login flow with Enoki SDK...');

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

      console.log('Handling OAuth callback with Enoki...');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No stored ZK Login state found');
      }

      const { randomness, maxEpoch, ephemeralPrivateKey } = JSON.parse(stored);
      
      if (!randomness || !maxEpoch || !ephemeralPrivateKey) {
        throw new Error('Incomplete ZK Login state found');
      }

      console.log('Found stored state, deriving address...');

      // Reconstruct ephemeral keypair
      const privateKeyBytes = new Uint8Array(ephemeralPrivateKey);
      if (privateKeyBytes.length !== 32) {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length}, expected 32`);
      }

      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

      // Use standard zkLogin address derivation
      const salt = BigInt(randomness);
      const userAddress = jwtToAddress(idToken, salt);
      
      console.log('Generated user address:', userAddress);

      // Store JWT token for Enoki to use
      localStorage.setItem('current_jwt', idToken);
      console.log('Stored JWT token for Enoki');

      const newState = {
        userAddress,
        isLoading: false,
        ephemeralKeyPair,
        error: null,
      };
      
      setState(prev => ({ ...prev, ...newState }));
      saveState({ randomness, maxEpoch, ...newState });
      
      console.log('ZK Login completed successfully');
      
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete login' 
      }));
    }
  }, [saveState]);

  // Execute transactions using Enoki
  const executeTransaction = useCallback(async (transaction: any) => {
    try {
      console.log('Executing transaction with Enoki...');
      
      if (!state.userAddress) {
        throw new Error('User not authenticated');
      }

      // Use Enoki's sponsorAndExecuteTransaction method
      const result = await enokiFlow.sponsorAndExecuteTransaction({
        transaction,
        network: 'mainnet',
      });
      
      console.log('Transaction executed successfully:', result);
      
      return {
        success: true,
        result,
      };
      
    } catch (error) {
      console.error('Failed to execute transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }, [enokiFlow, state.userAddress]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('current_jwt');
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
    executeTransaction,
    logout,
  };
};
