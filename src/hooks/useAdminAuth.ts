import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 useAdminAuth: Starting admin check, user:', user?.id, 'isAuthenticated:', isAuthenticated);
      
      // Keep loading until we have a definitive answer
      setIsLoading(true);
      
      if (!user?.id || !isAuthenticated) {
        console.log('❌ useAdminAuth: No user or not authenticated, setting isAdmin to false');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔎 useAdminAuth: Querying user_roles for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        console.log('📊 useAdminAuth: Database query completed');
        console.log('📊 Raw data:', data);
        console.log('📊 Error:', error);

        if (error) {
          console.error('❌ useAdminAuth: Database error:', error);
          setIsAdmin(false);
        } else {
          const hasAdminRole = !!data;
          console.log('✅ useAdminAuth: Admin check result - hasAdminRole:', hasAdminRole);
          setIsAdmin(hasAdminRole);
        }
      } catch (error) {
        console.error('💥 useAdminAuth: Exception during admin check:', error);
        setIsAdmin(false);
      } finally {
        // Only set loading to false AFTER we have a definitive answer
        console.log('🏁 useAdminAuth: Admin check complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id, isAuthenticated]);

  console.log('📋 useAdminAuth: Current state - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user exists:', !!user);

  return {
    isAdmin,
    isLoading,
    user,
  };
};
