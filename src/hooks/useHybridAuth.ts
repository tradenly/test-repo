
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    console.log('Hybrid auth initializing...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        // Extract ZK Login address from user metadata
        const zkLoginAddress = session?.user?.user_metadata?.zklogin_address || null;
        
        setAuthState({
          user: session?.user ?? null,
          session,
          zkLoginAddress,
          isLoading: false,
          isAuthenticated: !!session?.user,
        });
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      
      const zkLoginAddress = session?.user?.user_metadata?.zklogin_address || null;
      
      setAuthState({
        user: session?.user ?? null,
        session,
        zkLoginAddress,
        isLoading: false,
        isAuthenticated: !!session?.user,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log('Hybrid auth state:', {
    hasUser: !!authState.user,
    hasZkAddress: !!authState.zkLoginAddress,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading
  });

  return authState;
};
