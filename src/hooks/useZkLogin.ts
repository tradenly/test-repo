import { useState, useEffect, useCallback, useRef } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { jwtToAddress } from '@mysten/zklogin';
import { ZK_LOGIN_CONFIG, getRedirectUrl, getCurrentEpoch, suiClient } from '@/config/zkLogin';
import { Transaction } from '@mysten/sui/transactions';

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
const SESSION_KEYPAIR_KEY = 'session_ephemeral_keypair';

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

  // Save ephemeral keypair for session
  const saveEphemeralKeyPair = useCallback((keypair: Ed25519Keypair) => {
    try {
      const keyData = {
        privateKey: Array.from(keypair.getSecretKey().slice(0, 32)),
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEYPAIR_KEY, JSON.stringify(keyData));
      console.log('Saved ephemeral keypair for session');
    } catch (error) {
      console.error('Failed to save ephemeral keypair:', error);
    }
  }, []);

  // Restore ephemeral keypair from session
  const restoreEphemeralKeyPair = useCallback((): Ed25519Keypair | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEYPAIR_KEY);
      if (!stored) return null;

      const keyData = JSON.parse(stored);
      
      // Check if keypair is not too old (1 hour max)
      if (Date.now() - keyData.timestamp > 3600000) {
        localStorage.removeItem(SESSION_KEYPAIR_KEY);
        return null;
      }

      const privateKeyArray = new Uint8Array(keyData.privateKey);
      const keypair = Ed25519Keypair.fromSecretKey(privateKeyArray);
      console.log('Restored ephemeral keypair from session');
      return keypair;
    } catch (error) {
      console.error('Failed to restore ephemeral keypair:', error);
      localStorage.removeItem(SESSION_KEYPAIR_KEY);
      return null;
    }
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (isLoggingOut.current || state.isInitialized) return;

    const loadStoredState = () => {
      try {
        console.log('Loading stored ZK Login state...');
        const jwtToken = localStorage.getItem(CURRENT_JWT_KEY);
        
        if (jwtToken) {
          const googleUserId = extractGoogleUserId(jwtToken);
          
          if (googleUserId) {
            // Get consistent randomness for this Google user
            const randomness = getOrCreateRandomness(googleUserId);
            
            // Derive consistent address using the same randomness
            const salt = BigInt(randomness);
            const userAddress = jwtToAddress(jwtToken, salt);
            
            // Try to restore ephemeral keypair
            const ephemeralKeyPair = restoreEphemeralKeyPair();
            
            console.log('Loaded consistent state for Google user:', googleUserId);
            console.log('Derived address:', userAddress);
            
            setState(prev => ({
              ...prev,
              userAddress,
              randomness,
              googleUserId,
              ephemeralKeyPair,
              hasValidJWT: true,
              isInitialized: true,
            }));
          } else {
            setState(prev => ({ ...prev, hasValidJWT: true, isInitialized: true }));
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
  }, [extractGoogleUserId, getOrCreateRandomness, restoreEphemeralKeyPair]);

  const startZkLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Starting ZK Login flow...');

      // Generate ephemeral keypair for this session
      const ephemeralKeyPair = Ed25519Keypair.generate();
      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;
      
      console.log(`Current epoch: ${currentEpoch}, Max epoch: ${maxEpoch}`);
      
      // Save the ephemeral keypair for later restoration
      saveEphemeralKeyPair(ephemeralKeyPair);
      
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
      
      // Use a temporary randomness for nonce generation
      // The actual randomness will be determined by the Google user ID in the callback
      const tempRandomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, tempRandomness);

      console.log('Generated nonce for Google OAuth');

      // Store session data
      setState(prev => ({ 
        ...prev, 
        ephemeralKeyPair,
        maxEpoch,
        isLoading: false,
      }));

      // Build Google OAuth URL with proper parameters for account selection
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
  }, [saveEphemeralKeyPair]);

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

      // Get or create CONSISTENT randomness for this Google user
      const consistentRandomness = getOrCreateRandomness(googleUserId);

      // Restore the ephemeral keypair from session
      let ephemeralKeyPair = restoreEphemeralKeyPair();
      
      // If no keypair found, generate a new one
      if (!ephemeralKeyPair) {
        console.log('No stored keypair found, generating new one');
        ephemeralKeyPair = Ed25519Keypair.generate();
        saveEphemeralKeyPair(ephemeralKeyPair);
      }

      const currentEpoch = await getCurrentEpoch();
      const maxEpoch = currentEpoch + ZK_LOGIN_CONFIG.DEFAULT_MAX_EPOCH_GAP;

      // Use consistent randomness for address derivation - THIS IS THE KEY FIX
      const salt = BigInt(consistentRandomness);
      const userAddress = jwtToAddress(idToken, salt);
      
      console.log('Derived CONSISTENT address:', userAddress);
      console.log('Using consistent randomness:', consistentRandomness);

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
  }, [extractGoogleUserId, getOrCreateRandomness, restoreEphemeralKeyPair, saveEphemeralKeyPair]);

  const executeTransaction = useCallback(async (transaction: Transaction) => {
    try {
      console.log('Executing ZK Login transaction...');
      
      if (!state.userAddress || !state.ephemeralKeyPair || !state.randomness) {
        throw new Error('ZK Login authentication required for transactions');
      }

      if (!state.hasValidJWT) {
        throw new Error('ZK Login session expired. Please log in again with Google.');
      }

      const jwtToken = localStorage.getItem(CURRENT_JWT_KEY);
      if (!jwtToken) {
        throw new Error('ZK Login session not found. Please complete Google authentication.');
      }

      console.log('Preparing transaction for ZK Login execution...');
      
      // Build the transaction properly
      transaction.setSender(state.userAddress);
      
      // Get transaction bytes for signing
      const transactionBytes = await transaction.build({ client: suiClient });
      console.log('Transaction built successfully');
      
      // For now, let's use a simpler approach and call the Sui RPC directly
      // This is a temporary fix until we can properly implement ZK proof generation
      console.log('Attempting to execute transaction with ZK Login...');
      
      // Since ZK Login proof generation is complex and requires specific setup,
      // let's try a different approach using the Sui client's built-in ZK Login support
      try {
        // Create a new transaction object with proper ZK Login setup
        const zkTxBytes = await transaction.build({ 
          client: suiClient,
          onlyTransactionKind: false 
        });
        
        // For now, return a more descriptive error to help debug
        console.log('Transaction prepared for ZK Login execution');
        console.log('Transaction bytes length:', zkTxBytes.length);
        console.log('User address:', state.userAddress);
        console.log('Has ephemeral keypair:', !!state.ephemeralKeyPair);
        console.log('Has randomness:', !!state.randomness);
        
        // Temporary: Return detailed info for debugging
        return {
          success: false,
          error: 'ZK Login proof generation needs to be properly implemented. Transaction was prepared but not executed.',
          debug: {
            userAddress: state.userAddress,
            hasEphemeralKey: !!state.ephemeralKeyPair,
            hasRandomness: !!state.randomness,
            hasJWT: !!jwtToken,
            transactionBytesLength: zkTxBytes.length
          }
        };
        
      } catch (buildError) {
        console.error('Transaction build error:', buildError);
        throw new Error(`Failed to build transaction: ${buildError instanceof Error ? buildError.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Failed to execute ZK Login transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }, [state.userAddress, state.ephemeralKeyPair, state.randomness, state.hasValidJWT]);

  const isReadyForTransactions = useCallback(() => {
    return !!(state.userAddress && state.ephemeralKeyPair && state.hasValidJWT && state.randomness);
  }, [state.userAddress, state.ephemeralKeyPair, state.hasValidJWT, state.randomness]);

  const logout = useCallback(() => {
    console.log('Logging out ZK Login user...');
    
    // Set logout flag to prevent re-initialization
    isLoggingOut.current = true;
    
    // Get current Google user ID before clearing state
    const currentGoogleUserId = state.googleUserId;
    
    // Clear JWT token and session keypair
    localStorage.removeItem(CURRENT_JWT_KEY);
    localStorage.removeItem(SESSION_KEYPAIR_KEY);
    console.log('Cleared JWT token and session keypair');
    
    // Note: We DON'T clear the user-specific randomness as that should persist
    // This ensures the same wallet address is generated when logging back in
    
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
      console.log('ZK Login logout completed - session data cleared');
    }, 100);
    
  }, [state.googleUserId]);

  return {
    ...state,
    startZkLogin,
    handleOAuthCallback,
    executeTransaction,
    isReadyForTransactions,
    logout,
  };
};
