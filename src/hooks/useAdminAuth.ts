
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useUnifiedAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['adminRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useAdminAuth: No user ID, returning false');
        return false;
      }
      
      console.log('useAdminAuth: Checking admin role for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.log('useAdminAuth: Error checking admin role:', error);
        return false;
      }
      
      console.log('useAdminAuth: Query result:', data);
      const hasAdminRole = !!data;
      console.log('useAdminAuth: Has admin role:', hasAdminRole);
      
      return hasAdminRole;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  console.log('useAdminAuth: Current state - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user:', !!user);

  return {
    isAdmin: !!isAdmin,
    isLoading,
    user,
  };
};
