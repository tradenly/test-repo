import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// OAuth 2.0 credentials for Twitter API v2
const CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")?.trim();
const CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")?.trim();

function validateEnvironmentVariables() {
  console.log("🔍 Validating environment variables...");
  console.log("CLIENT_ID exists:", !!CLIENT_ID);
  console.log("CLIENT_SECRET exists:", !!CLIENT_SECRET);
  console.log("SUPABASE_URL:", supabaseUrl);
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Missing Twitter OAuth credentials");
    console.error("CLIENT_ID:", CLIENT_ID ? "EXISTS" : "MISSING");
    console.error("CLIENT_SECRET:", CLIENT_SECRET ? "EXISTS" : "MISSING");
    throw new Error("Missing Twitter OAuth credentials in environment variables");
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials");
    throw new Error("Missing Supabase credentials");
  }
  console.log("✅ Environment variables validated");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    console.log(`📝 Processing request: ${req.method} ${url.pathname}`);
    console.log(`🌐 Full URL: ${req.url}`);
    
    if (req.method === 'POST') {
      const { action, userId, code, state } = await req.json();
      
      console.log(`🎯 Processing OAuth action: ${action} for user: ${userId}`);

      if (action === 'get-auth-url') {
        if (!userId) {
          throw new Error('User ID is required');
        }

        const state_param = `${userId}_${Math.random().toString(36).slice(2)}`;
        
        // CRITICAL: Use the EXACT URL that Twitter expects
        // This MUST match your Twitter app's callback URL configuration
        const redirect_uri = `${supabaseUrl}/functions/v1/twitter-oauth`;
        
        console.log(`🔗 Using redirect URI: ${redirect_uri}`);
        
        // Generate PKCE parameters
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        const code_verifier = btoa(String.fromCharCode(...randomBytes))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code_verifier));
        const code_challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        console.log(`🔐 Generated PKCE for user ${userId}`);
        console.log(`📋 Code verifier length: ${code_verifier.length}`);
        console.log(`📋 Code challenge length: ${code_challenge.length}`);

        // Store OAuth state with extended expiration
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        const { error: stateError } = await supabase
          .from('oauth_states')
          .insert({
            user_id: userId,
            state_token: state_param,
            code_verifier,
            code_challenge,
            redirect_uri,
            expires_at: expiresAt.toISOString()
          });

        if (stateError) {
          console.error("❌ Failed to store OAuth state:", stateError);
          throw stateError;
        }

        console.log(`✅ OAuth state stored for user ${userId}`);

        // Twitter OAuth 2.0 scopes - using minimal required scopes first
        const scope = encodeURIComponent('tweet.read tweet.write users.read offline.access');
        
        // Build authorization URL with all required parameters
        const authParams = new URLSearchParams({
          response_type: 'code',
          client_id: CLIENT_ID!,
          redirect_uri: redirect_uri,
          scope: 'tweet.read tweet.write users.read offline.access',
          state: state_param,
          code_challenge: code_challenge,
          code_challenge_method: 'S256'
        });
        
        const authUrl = `https://twitter.com/i/oauth2/authorize?${authParams.toString()}`;

        console.log(`🚀 Generated auth URL for user ${userId}`);
        console.log(`📋 Auth URL: ${authUrl}`);

        return new Response(JSON.stringify({ 
          success: true,
          authUrl, 
          state: state_param,
          redirect_uri // Include for debugging
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'exchange-code') {
        if (!userId || !code || !state) {
          console.error("❌ Missing required parameters:", { userId: !!userId, code: !!code, state: !!state });
          throw new Error('Missing required parameters: userId, code, and state');
        }

        console.log(`🔄 Exchanging code for user ${userId} with state ${state}`);

        // Validate and fetch stored OAuth state
        const { data: oauthState, error: stateErr } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('user_id', userId)
          .eq('state_token', state)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (stateErr || !oauthState) {
          console.error("❌ Invalid OAuth state:", stateErr);
          console.error("❌ State lookup failed for:", { userId, state });
          throw new Error('Invalid or expired OAuth state');
        }

        console.log(`✅ OAuth state validated for user ${userId}`);

        const redirect_uri = oauthState.redirect_uri;
        
        console.log(`🔄 Exchanging code with redirect_uri: ${redirect_uri}`);
        
        // Exchange authorization code for access token using PKCE
        const tokenParams = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
          code_verifier: oauthState.code_verifier,
          client_id: CLIENT_ID!, // CRITICAL: Include client_id for PKCE
        });

        console.log(`📤 Token request params:`, {
          grant_type: 'authorization_code',
          redirect_uri: redirect_uri,
          code_verifier_length: oauthState.code_verifier.length,
          client_id: 'present'
        });

        // Use PKCE flow without Basic Authorization header
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        const tokenResponseText = await tokenResponse.text();
        console.log(`📥 Token response status: ${tokenResponse.status}`);
        console.log(`📥 Token response body: ${tokenResponseText}`);

        if (!tokenResponse.ok) {
          console.error("❌ Token exchange failed:", tokenResponseText);
          throw new Error(`Token exchange failed: ${tokenResponseText}`);
        }

        const tokenData = JSON.parse(tokenResponseText);
        console.log(`✅ Token exchange successful for user ${userId}`);

        // Mark OAuth state as used
        await supabase
          .from('oauth_states')
          .update({ used_at: new Date().toISOString() })
          .eq('id', oauthState.id);
        
        // Get Twitter user info with expanded fields
        const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username,id', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        const userResponseText = await userResponse.text();
        console.log(`📥 User info response status: ${userResponse.status}`);
        console.log(`📥 User info response body: ${userResponseText}`);

        if (!userResponse.ok) {
          console.error("❌ Failed to get user info:", userResponseText);
          throw new Error(`Failed to get user info: ${userResponseText}`);
        }

        const userData = JSON.parse(userResponseText);
        console.log(`✅ Retrieved Twitter user data for ${userData.data.username}`);
        
        // Store Twitter connection with proper error handling
        const connectionData = {
          user_id: userId,
          twitter_user_id: userData.data.id,
          username: userData.data.username,
          display_name: userData.data.name,
          profile_image_url: userData.data.profile_image_url,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: tokenData.expires_in ? 
            new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          is_active: true,
          connection_status: 'active',
          scope: 'tweet.read tweet.write users.read offline.access'
        };

        console.log(`💾 Storing connection data for user ${userId}`);

        const { error: insertError } = await supabase
          .from('user_twitter_connections')
          .upsert(connectionData, {
            onConflict: 'user_id,twitter_user_id',
            ignoreDuplicates: false
          });

        if (insertError) {
          console.error("❌ Failed to store Twitter connection:", insertError);
          throw insertError;
        }

        console.log(`🎉 Twitter connection stored successfully for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true,
          username: userData.data.username,
          display_name: userData.data.name,
          profile_image_url: userData.data.profile_image_url,
          twitter_user_id: userData.data.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unknown action: ${action}`);
    }

    // Handle OAuth callback from Twitter
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const error_description = url.searchParams.get('error_description');

      console.log(`🔗 OAuth callback received`);
      console.log(`📋 Callback params:`, { 
        code: !!code, 
        state: state, 
        error: error,
        error_description: error_description,
        full_url: req.url
      });

      if (error) {
        console.error(`❌ OAuth error: ${error} - ${error_description}`);
        return new Response(`
          <html>
            <head><title>Twitter Authorization Failed</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #1a1a1a; color: white;">
              <h1 style="color: #e74c3c;">Authorization Failed</h1>
              <p style="color: #7f8c8d; margin: 20px 0;">Error: ${error}</p>
              <p style="color: #95a5a6;">Description: ${error_description || 'No additional details'}</p>
              <p style="color: #95a5a6;">You can close this window and try again.</p>
              <script>
                setTimeout(() => {
                  window.close();
                }, 3000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (code && state) {
        console.log(`✅ OAuth callback successful - preparing to communicate with parent window`);
        
        // NEW APPROACH: Use a more reliable communication method
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Twitter Authorization Complete</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%);
                  color: white;
                  margin: 0;
                  padding: 40px 20px;
                  text-align: center;
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                }
                .container {
                  max-width: 400px;
                  background: rgba(255, 255, 255, 0.1);
                  padding: 30px;
                  border-radius: 15px;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .spinner {
                  width: 40px;
                  height: 40px;
                  border: 4px solid rgba(255, 255, 255, 0.3);
                  border-top: 4px solid white;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin: 20px auto;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                .status {
                  margin-top: 20px;
                  font-size: 14px;
                  opacity: 0.8;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🎉 Authorization Successful!</h1>
                <p>Connecting your Twitter account...</p>
                <div class="spinner"></div>
                <div class="status" id="status">Communicating with main application...</div>
              </div>
              
              <script>
                console.log('🚀 Twitter OAuth callback page loaded');
                
                const authData = {
                  type: 'TWITTER_AUTH_SUCCESS',
                  code: '${code}',
                  state: '${state}',
                  timestamp: Date.now()
                };
                
                console.log('📤 Auth data to send:', authData);
                
                let messagesSent = 0;
                let isClosing = false;
                
                function updateStatus(message) {
                  const statusEl = document.getElementById('status');
                  if (statusEl) {
                    statusEl.textContent = message;
                  }
                }
                
                function sendMessageToParent() {
                  try {
                    // Method 1: Try window.opener (most common)
                    if (window.opener && !window.opener.closed) {
                      console.log('✅ Sending message via window.opener');
                      window.opener.postMessage(authData, '*');
                      messagesSent++;
                      updateStatus('Message sent via opener (' + messagesSent + ')');
                      return true;
                    }
                    
                    // Method 2: Try parent window
                    if (window.parent && window.parent !== window) {
                      console.log('✅ Sending message via window.parent');
                      window.parent.postMessage(authData, '*');
                      messagesSent++;
                      updateStatus('Message sent via parent (' + messagesSent + ')');
                      return true;
                    }
                    
                    // Method 3: Try top window
                    if (window.top && window.top !== window) {
                      console.log('✅ Sending message via window.top');
                      window.top.postMessage(authData, '*');
                      messagesSent++;
                      updateStatus('Message sent via top (' + messagesSent + ')');
                      return true;
                    }
                    
                    console.error('❌ No valid parent window found');
                    updateStatus('No parent window found');
                    return false;
                  } catch (e) {
                    console.error('❌ Error sending message:', e);
                    updateStatus('Error: ' + e.message);
                    return false;
                  }
                }
                
                function attemptClose() {
                  if (isClosing) return;
                  isClosing = true;
                  
                  updateStatus('Closing window...');
                  
                  try {
                    window.close();
                  } catch (e) {
                    console.error('Failed to close window:', e);
                    updateStatus('Please close this window manually');
                  }
                }
                
                // Send messages immediately and repeatedly
                function sendMessages() {
                  const success = sendMessageToParent();
                  
                  if (success && messagesSent >= 3) {
                    // After sending 3 messages successfully, wait a bit then close
                    setTimeout(() => {
                      updateStatus('Connection complete! Closing...');
                      setTimeout(attemptClose, 1000);
                    }, 2000);
                  } else if (messagesSent < 10) {
                    // Keep trying for up to 10 attempts
                    setTimeout(sendMessages, 500);
                  } else {
                    // Give up after 10 attempts
                    updateStatus('Unable to communicate with main app. Please close this window.');
                    setTimeout(attemptClose, 3000);
                  }
                }
                
                // Start sending messages immediately when page loads
                sendMessages();
                
                // Also send when page becomes visible (in case it was backgrounded)
                document.addEventListener('visibilitychange', () => {
                  if (!document.hidden && messagesSent < 10) {
                    sendMessages();
                  }
                });
                
                // Fallback: always close after 30 seconds maximum
                setTimeout(() => {
                  if (!isClosing) {
                    updateStatus('Timeout reached. Closing window.');
                    attemptClose();
                  }
                }, 30000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      console.error(`❌ Missing required callback parameters - code: ${!!code}, state: ${!!state}`);
      return new Response('Missing authorization code or state', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("💥 Twitter OAuth error:", error);
    console.error("💥 Error stack:", error.stack);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
