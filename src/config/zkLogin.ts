
import { SuiClient } from '@mysten/sui/client';

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
  
  // SUI network configuration - Updated to Mainnet
  SUI_NETWORK: "mainnet" as const,
  
  // Mysten Labs Mainnet RPC endpoint
  SUI_RPC_URL: "https://fullnode.mainnet.sui.io:443",
  
  // Max epoch for ZK proofs (from SUI docs - typically current epoch + 2)
  DEFAULT_MAX_EPOCH_GAP: 2,
  
  // OpenID configuration for Google
  OPENID_PROVIDER_URL: "https://accounts.google.com",
  
  // JWT audience (your app's client ID)
  JWT_AUD: "821258811515-c3mtuebmirhtn0t0f7gm9oqe9prhjqqs.apps.googleusercontent.com",
  
  // Enoki configuration
  ENOKI_API_KEY: "enoki_public_39cb997c8013b5ddbf2b2463748a8ba0d8c6bf83983e1359f5f9e8459e6dfcf9"
};

// Helper to get the correct redirect URL based on environment
export const getRedirectUrl = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('poopee.art')) {
    return ZK_LOGIN_CONFIG.REDIRECT_URLS.PRODUCTION;
  }
  
  return ZK_LOGIN_CONFIG.REDIRECT_URLS.PREVIEW;
};

// SUI Client instance for mainnet
export const suiClient = new SuiClient({
  url: ZK_LOGIN_CONFIG.SUI_RPC_URL,
});

// Helper to get current epoch from SUI network
export const getCurrentEpoch = async (): Promise<number> => {
  try {
    const systemState = await suiClient.getLatestSuiSystemState();
    return parseInt(systemState.epoch);
  } catch (error) {
    console.error('Failed to fetch current epoch:', error);
    // Fallback to a reasonable default
    return Math.floor(Date.now() / 1000 / 86400); // Simplified epoch calculation as fallback
  }
};
