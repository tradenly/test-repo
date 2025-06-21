
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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Immediately check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          console.log('UnifiedAuth: Found existing session, setting user immediately');
          setUnifiedUser({
            id: session.user.id,
            email: session.user.email,
            authType: 'supabase',
            supabaseUser: session.user,
          });
        } else if (mounted) {
          console.log('UnifiedAuth: No existing session found');
          setUnifiedUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('UnifiedAuth: Session check failed:', error);
        if (mounted) {
          setUnifiedUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('UnifiedAuth: Auth state changed:', event, !!session);
        if (mounted) {
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
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
