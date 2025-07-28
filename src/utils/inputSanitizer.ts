/**
 * Input sanitization utilities for security
 */

// Basic HTML sanitization - removes potentially dangerous characters
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Email validation and sanitization
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Username sanitization - alphanumeric, underscore, hyphen only
export const sanitizeUsername = (username: string): string => {
  return username
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase()
    .trim();
};

// Name sanitization - letters, spaces, basic punctuation
export const sanitizeName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z\s\-']/g, '')
    .trim();
};

// General text sanitization
export const sanitizeText = (text: string): string => {
  return sanitizeHTML(text);
};

// Password validation (client-side basic check)
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting state
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};