
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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

    return () => subscription.unsubscribe();
  }, [zkAddress]);

  return authState;
};
