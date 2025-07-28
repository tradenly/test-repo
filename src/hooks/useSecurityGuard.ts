import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './useAdminAuth';
import { validateAdminAccess, generateCSRFToken } from '@/utils/security';
import { logger } from '@/utils/logger';

export interface SecurityHookResult {
  isSecure: boolean;
  csrfToken: string;
  isLoading: boolean;
  hasAccess: boolean;
}

export const useSecurityGuard = (requireAdmin: boolean = false): SecurityHookResult => {
  const { isAdmin, isLoading: adminLoading, user } = useAdminAuth();
  const [isSecure, setIsSecure] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeSecurity = async () => {
      // Generate CSRF token
      const token = generateCSRFToken();
      setCsrfToken(token);

      // Check admin access if required
      if (requireAdmin) {
        if (!adminLoading) {
          if (!user) {
            logger.log('Security: No user found, redirecting to auth');
            navigate('/auth');
            return;
          }

          if (!isAdmin) {
            logger.log('Security: User is not admin, redirecting to dashboard');
            navigate('/dashboard');
            return;
          }

          // Double-check admin access server-side
          const hasServerAccess = await validateAdminAccess(user.id);
          if (!hasServerAccess) {
            logger.error('Security: Server-side admin validation failed');
            navigate('/dashboard');
            return;
          }

          setHasAccess(true);
        }
      } else {
        setHasAccess(true);
      }

      setIsSecure(true);
    };

    initializeSecurity();
  }, [requireAdmin, isAdmin, adminLoading, user, navigate]);

  return {
    isSecure,
    csrfToken,
    isLoading: adminLoading || !isSecure,
    hasAccess,
  };
};