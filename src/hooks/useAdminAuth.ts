import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { logger } from '@/utils/logger';

export const useAdminAuth = () => {
  const { user, isAuthenticated, loading: authLoading } = useUnifiedAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      logger.log('🔍 useAdminAuth: Checking admin status for user:', user?.id);
      
      if (!user?.id || !isAuthenticated) {
        logger.log('❌ useAdminAuth: No user or not authenticated');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        logger.log('🔎 useAdminAuth: Querying admin role for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          logger.error('❌ useAdminAuth: Database error:', error);
          setIsAdmin(false);
        } else {
          const hasAdminRole = !!data;
          logger.log('✅ useAdminAuth: Admin check result:', hasAdminRole);
          setIsAdmin(hasAdminRole);
        }
      } catch (error) {
        logger.error('💥 useAdminAuth: Exception:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Only check if auth is not loading
    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user?.id, isAuthenticated, authLoading]);

  // Keep loading true while auth is loading
  const finalLoading = authLoading || isLoading;

  logger.log(`📋 useAdminAuth: Final state - isAdmin: ${isAdmin}, isLoading: ${finalLoading}, user exists: ${!!user}`);

  return {
    isAdmin,
    isLoading: finalLoading,
    user,
  };
};
