
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
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Missing Twitter OAuth credentials");
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
    
    if (req.method === 'POST') {
      const { action, userId, code, state } = await req.json();
      
      console.log(`🎯 Processing OAuth action: ${action} for user: ${userId}`);

      if (action === 'get-auth-url') {
        if (!userId) {
          throw new Error('User ID is required');
        }

        const state_param = `${userId}_${Math.random().toString(36).slice(2)}`;
        const redirect_uri = `${supabaseUrl}/functions/v1/twitter-oauth`;
        
        // Generate PKCE parameters
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        const code_verifier = btoa(String.fromCharCode(...randomBytes))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code_verifier));
        const code_challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        console.log(`🔐 Generated PKCE for user ${userId}`);

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

        // Twitter OAuth 2.0 scopes - requesting comprehensive permissions
        const scope = encodeURIComponent('tweet.read tweet.write users.read follows.read follows.write offline.access');
        const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}&state=${state_param}&code_challenge=${code_challenge}&code_challenge_method=S256`;

        console.log(`🚀 Generated auth URL for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true,
          authUrl, 
          state: state_param 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'exchange-code') {
        if (!userId || !code || !state) {
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
          throw new Error('Invalid or expired OAuth state');
        }

        console.log(`✅ OAuth state validated for user ${userId}`);

        const redirect_uri = oauthState.redirect_uri;
        
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri,
            code_verifier: oauthState.code_verifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("❌ Token exchange failed:", errorText);
          throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log(`✅ Token exchange successful for user ${userId}`);

        // Mark OAuth state as used
        await supabase
          .from('oauth_states')
          .update({ used_at: new Date().toISOString() })
          .eq('id', oauthState.id);
        
        // Get Twitter user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error("❌ Failed to get user info:", errorText);
          throw new Error(`Failed to get user info: ${errorText}`);
        }

        const userData = await userResponse.json();
        console.log(`✅ Retrieved Twitter user data for ${userData.data.username}`);
        
        // Store Twitter connection
        const { error: insertError } = await supabase
          .from('user_twitter_connections')
          .insert({
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
            scope: 'tweet.read tweet.write users.read follows.read follows.write offline.access'
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
          profile_image_url: userData.data.profile_image_url
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

      console.log(`🔗 OAuth callback received - code: ${!!code}, state: ${state}, error: ${error}`);

      if (error) {
        console.error(`❌ OAuth error: ${error}`);
        return new Response(`
          <html>
            <head><title>Twitter Authorization Failed</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
              <h1 style="color: #e74c3c;">Authorization Failed</h1>
              <p style="color: #7f8c8d; margin: 20px 0;">Error: ${error}</p>
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
        console.log(`✅ OAuth callback successful - forwarding to frontend`);
        return new Response(`
          <html>
            <head><title>Twitter Authorization Successful</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
              <h1 style="color: #27ae60;">Authorization Successful!</h1>
              <p style="color: #7f8c8d; margin: 20px 0;">Connecting your Twitter account...</p>
              <div style="margin: 20px 0;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
              <script>
                try {
                  if (window.opener) {
                    console.log('Sending message to parent window');
                    window.opener.postMessage({
                      type: 'TWITTER_AUTH_SUCCESS',
                      code: '${code}',
                      state: '${state}'
                    }, '*');
                  }
                } catch (e) {
                  console.error('Failed to send message to parent:', e);
                }
                
                setTimeout(() => {
                  window.close();
                }, 2000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

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
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
