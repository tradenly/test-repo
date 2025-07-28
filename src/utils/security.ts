/**
 * Security middleware and utilities
 */

// Content Security Policy headers
export const getCSPHeaders = () => ({
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://csdrraabfbrzteezkqkm.supabase.co wss://csdrraabfbrzteezkqkm.supabase.co;
    frame-src 'self' https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
});

// Simple CSRF token generation and validation
const CSRF_TOKEN_KEY = 'csrf_token';

export const generateCSRFToken = (): string => {
  const token = crypto.getRandomValues(new Uint8Array(32))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  
  return token;
};

export const validateCSRFToken = (token: string): boolean => {
  if (typeof window === 'undefined') return true; // Skip validation on server
  
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  return storedToken === token;
};

// Session security helpers
export const secureSessionData = (data: any) => {
  // Remove sensitive fields from session data before storing
  const { access_token, refresh_token, ...safeData } = data;
  return safeData;
};

// Admin access validation
export const validateAdminAccess = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    return !error && !!data;
  } catch {
    return false;
  }
};

// Input length limits for security
export const INPUT_LIMITS = {
  EMAIL: 320, // RFC 5321 limit
  PASSWORD: 128, // Reasonable upper limit
  USERNAME: 50,
  NAME: 100,
  TEXT_AREA: 5000,
  SUBJECT: 200,
} as const;

// Validate input lengths
export const validateInputLength = (input: string, limit: number): boolean => {
  return input.length <= limit;
};

// Rate limiting storage (in-memory for client-side)
const rateLimitStorage = new Map<string, { attempts: number; lastAttempt: number }>();

export const isRateLimited = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitStorage.get(key);
  
  if (!record || now - record.lastAttempt > windowMs) {
    rateLimitStorage.set(key, { attempts: 1, lastAttempt: now });
    return false;
  }
  
  if (record.attempts >= maxAttempts) {
    return true;
  }
  
  record.attempts++;
  record.lastAttempt = now;
  return false;
};