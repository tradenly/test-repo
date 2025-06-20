
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('useAdminAuth: Starting admin check, user:', user?.id, 'isAuthenticated:', isAuthenticated);
      
      if (!user?.id || !isAuthenticated) {
        console.log('useAdminAuth: No user or not authenticated, setting isAdmin to false');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('useAdminAuth: Querying user_roles for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.log('useAdminAuth: Database error:', error);
          setIsAdmin(false);
        } else {
          const hasAdminRole = !!data;
          console.log('useAdminAuth: Query result:', data, 'hasAdminRole:', hasAdminRole);
          setIsAdmin(hasAdminRole);
        }
      } catch (error) {
        console.error('useAdminAuth: Exception during admin check:', error);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    // Reset loading state when user changes
    setIsLoading(true);
    checkAdminStatus();
  }, [user?.id, isAuthenticated]);

  console.log('useAdminAuth: Current state - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user exists:', !!user);

  return {
    isAdmin: isAdmin === true,
    isLoading,
    user,
  };
};
