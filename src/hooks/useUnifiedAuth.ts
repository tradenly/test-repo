
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEnokiAuth } from './useEnokiAuth';

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
  const { userAddress, isInitialized, logout: enokiLogout, isAuthenticated } = useEnokiAuth();

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

        // If no Supabase session, check Enoki authentication
        if (isInitialized && userAddress && isAuthenticated) {
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
        } else if (userAddress && isAuthenticated) {
          // Fall back to Enoki if available
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
  }, [userAddress, isInitialized, isAuthenticated]);

  // Update when Enoki auth state changes
  useEffect(() => {
    if (isInitialized && !unifiedUser?.supabaseUser) {
      if (userAddress && isAuthenticated) {
        console.log('Enoki authenticated - setting unified user');
        setUnifiedUser({
          id: userAddress,
          walletAddress: userAddress,
          authType: 'zklogin',
        });
      } else if (unifiedUser?.authType === 'zklogin') {
        console.log('Enoki cleared - clearing unified user');
        setUnifiedUser(null);
      }
    }
  }, [userAddress, isAuthenticated, isInitialized, unifiedUser?.supabaseUser, unifiedUser?.authType]);

  const logout = async () => {
    try {
      console.log('UnifiedAuth logout called for user type:', unifiedUser?.authType);
      
      // Logout from Supabase if authenticated there
      if (unifiedUser?.authType === 'supabase') {
        console.log('Logging out from Supabase...');
        await supabase.auth.signOut();
      }
      
      // Logout from Enoki if authenticated there
      if (unifiedUser?.authType === 'zklogin') {
        console.log('Logging out from Enoki...');
        await enokiLogout();
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
