
// ZK Login configuration following SUI documentation
// https://docs.sui.io/guides/developer/cryptography/zklogin-integration

export const ZK_LOGIN_CONFIG = {
  // Google OAuth configuration
  CLIENT_ID: "821258811515-c3mtuebmirhtn0t0f7gm9oqe9prhjqqs.apps.googleusercontent.com",
  
  // Redirect URLs for different environments
  REDIRECT_URLS: {
    PREVIEW: "https://preview--poopee-toiletverse-vibes.lovable.app/auth/callback",
    PRODUCTION: "https://poopee.art/auth/callback"
  },
  
  // SUI network configuration
  SUI_NETWORK: "testnet" as const,
  
  // Max epoch for ZK proofs (from SUI docs - typically current epoch + 2)
  DEFAULT_MAX_EPOCH_GAP: 2,
  
  // OpenID configuration for Google
  OPENID_PROVIDER_URL: "https://accounts.google.com",
  
  // JWT audience (your app's client ID)
  JWT_AUD: "821258811515-c3mtuebmirhtn0t0f7gm9oqe9prhjqqs.apps.googleusercontent.com"
};

// Helper to get the correct redirect URL based on environment
export const getRedirectUrl = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('poopee.art')) {
    return ZK_LOGIN_CONFIG.REDIRECT_URLS.PRODUCTION;
  }
  
  return ZK_LOGIN_CONFIG.REDIRECT_URLS.PREVIEW;
};
