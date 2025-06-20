
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useZkLogin } from './useZkLogin';

export interface UnifiedUser {
  id: string;
  email?: string;
  walletAddress?: string;
  authType: 'supabase' | 'zklogin';
  supabaseUser?: User;
}

export const useUnifiedAuth = () => {
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { userAddress, isInitialized, logout: zkLogout, hasValidJWT } = useZkLogin();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase auth first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUnifiedUser({
            id: session.user.id,
            email: session.user.email,
            authType: 'supabase',
            supabaseUser: session.user,
          });
          setLoading(false);
          return;
        }

        // If no Supabase session, check ZK Login
        if (isInitialized && userAddress && hasValidJWT) {
          setUnifiedUser({
            id: userAddress,
            walletAddress: userAddress,
            authType: 'zklogin',
          });
          setLoading(false);
          return;
        }

        // No auth found
        setUnifiedUser(null);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUnifiedUser(null);
        setLoading(false);
      }
    };

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase auth state changed:', event, !!session);
        if (session?.user) {
          setUnifiedUser({
            id: session.user.id,
            email: session.user.email,
            authType: 'supabase',
            supabaseUser: session.user,
          });
        } else if (userAddress && hasValidJWT) {
          // Fall back to ZK Login if available
          setUnifiedUser({
            id: userAddress,
            walletAddress: userAddress,
            authType: 'zklogin',
          });
        } else {
          setUnifiedUser(null);
        }
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, [userAddress, isInitialized, hasValidJWT]);

  // Update when ZK Login state changes (simplified)
  useEffect(() => {
    if (isInitialized && !unifiedUser?.supabaseUser) {
      if (userAddress && hasValidJWT) {
        console.log('ZK Login authenticated - setting unified user');
        setUnifiedUser({
          id: userAddress,
          walletAddress: userAddress,
          authType: 'zklogin',
        });
      } else if (unifiedUser?.authType === 'zklogin') {
        console.log('ZK Login cleared - clearing unified user');
        setUnifiedUser(null);
      }
    }
  }, [userAddress, hasValidJWT, isInitialized, unifiedUser?.supabaseUser, unifiedUser?.authType]);

  const logout = async () => {
    try {
      console.log('UnifiedAuth logout called for user type:', unifiedUser?.authType);
      
      // Logout from Supabase if authenticated there
      if (unifiedUser?.authType === 'supabase') {
        console.log('Logging out from Supabase...');
        await supabase.auth.signOut();
      }
      
      // Logout from ZK Login if authenticated there
      if (unifiedUser?.authType === 'zklogin') {
        console.log('Logging out from ZK Login...');
        zkLogout();
      }
      
      // Clear unified user state
      setUnifiedUser(null);
      console.log('UnifiedAuth logout completed');
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user: unifiedUser,
    loading,
    logout,
    isAuthenticated: !!unifiedUser,
  };
};
