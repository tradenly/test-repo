
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useZkLogin } from './useZkLogin';

interface HybridAuthState {
  user: User | null;
  session: Session | null;
  zkLoginAddress: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useHybridAuth = () => {
  const [authState, setAuthState] = useState<HybridAuthState>({
    user: null,
    session: null,
    zkLoginAddress: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const { userAddress: zkAddress } = useZkLogin();

  useEffect(() => {
    console.log('Hybrid auth initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      const zkLoginAddress = session?.user?.user_metadata?.zklogin_address || zkAddress;
      
      setAuthState({
        user: session?.user ?? null,
        session,
        zkLoginAddress,
        isLoading: false,
        isAuthenticated: !!session?.user || !!zkAddress,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        const zkLoginAddress = session?.user?.user_metadata?.zklogin_address || zkAddress;
        
        setAuthState({
          user: session?.user ?? null,
          session,
          zkLoginAddress,
          isLoading: false,
          isAuthenticated: !!session?.user || !!zkAddress,
        });
      }
    );

    // Listen for ZK Login success events
    const handleZkLoginSuccess = (event: CustomEvent) => {
      console.log('ZK Login success event received:', event.detail);
      const { userAddress } = event.detail;
      
      setAuthState(prev => ({
        ...prev,
        zkLoginAddress: userAddress,
        isAuthenticated: true,
        isLoading: false,
      }));
    };

    window.addEventListener('zklogin-success', handleZkLoginSuccess as EventListener);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('zklogin-success', handleZkLoginSuccess as EventListener);
    };
  }, [zkAddress]);

  // Additional effect to handle ZK address changes
  useEffect(() => {
    if (zkAddress && !authState.user) {
      console.log('ZK Address detected without Supabase user, updating auth state');
      setAuthState(prev => ({
        ...prev,
        zkLoginAddress: zkAddress,
        isAuthenticated: true,
        isLoading: false,
      }));
    }
  }, [zkAddress, authState.user]);

  console.log('Hybrid auth state:', {
    hasUser: !!authState.user,
    hasZkAddress: !!authState.zkLoginAddress,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading
  });

  return authState;
};
