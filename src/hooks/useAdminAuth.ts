
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useUnifiedAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['adminRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.log('No admin role found for user');
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  return {
    isAdmin: !!isAdmin,
    isLoading,
    user,
  };
};
