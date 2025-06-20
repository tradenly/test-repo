
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedUser {
  id: string;
  email?: string;
  authType: 'supabase';
  supabaseUser?: User;
}

export const useUnifiedAuth = () => {
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUnifiedUser({
            id: session.user.id,
            email: session.user.email,
            authType: 'supabase',
            supabaseUser: session.user,
          });
        } else {
          setUnifiedUser(null);
        }
        
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
        } else {
          setUnifiedUser(null);
        }
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log('UnifiedAuth logout called');
      await supabase.auth.signOut();
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
