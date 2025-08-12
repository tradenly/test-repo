
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
        
        // Use the correct redirect URI
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

        // Store OAuth state
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

        // Build authorization URL
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

        return new Response(JSON.stringify({ 
          success: true,
          authUrl, 
          state: state_param,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'check-status') {
        if (!userId || !state) {
          throw new Error('Missing required parameters: userId and state');
        }

        // Check for recent connection
        const { data: connection, error } = await supabase
          .from('user_twitter_connections')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !connection) {
          return new Response(JSON.stringify({ 
            success: false,
            completed: false
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if connection was created recently (within last 5 minutes)
        const connectionTime = new Date(connection.created_at);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (connectionTime > fiveMinutesAgo) {
          return new Response(JSON.stringify({ 
            success: true,
            completed: true,
            username: connection.username,
            display_name: connection.display_name
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: false,
          completed: false
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
        error_description: error_description
      });

      if (error) {
        console.error(`❌ OAuth error: ${error} - ${error_description}`);
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Authorization Failed</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #1a1a1a; color: white; }
                .error { color: #e74c3c; }
              </style>
            </head>
            <body>
              <h1 class="error">Authorization Failed</h1>
              <p>Error: ${error}</p>
              <p>Description: ${error_description || 'No additional details'}</p>
              <script>
                setTimeout(() => { window.close(); }, 3000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (!code || !state) {
        console.error(`❌ Missing required callback parameters`);
        return new Response('Missing authorization code or state', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      console.log(`✅ OAuth callback successful - processing token exchange`);
      
      // Extract user ID from state
      const userId = state.split('_')[0];
      
      try {
        // Validate stored OAuth state
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
        
        console.log(`🔄 Exchanging code with redirect_uri: ${redirect_uri}`);
        
        // Create proper Basic Auth header for Twitter OAuth 2.0
        const basicAuth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
        
        // Exchange authorization code for access token using PKCE
        const tokenBody = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
          code_verifier: oauthState.code_verifier,
        });

        console.log(`📤 Token request with Basic Auth`);
        console.log(`📤 Request body:`, tokenBody.toString());

        // Use proper Basic Authentication for Twitter OAuth 2.0
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: tokenBody.toString(),
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
        
        // Get Twitter user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username,id', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        const userResponseText = await userResponse.text();
        console.log(`📥 User info response status: ${userResponse.status}`);

        if (!userResponse.ok) {
          console.error("❌ Failed to get user info:", userResponseText);
          throw new Error(`Failed to get user info: ${userResponseText}`);
        }

        const userData = JSON.parse(userResponseText);
        console.log(`✅ Retrieved Twitter user data for ${userData.data.username}`);
        
        // Store Twitter connection
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

        // Return success page that automatically closes
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Success!</title>
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
                .checkmark {
                  font-size: 48px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="checkmark">✅</div>
                <h1>Success!</h1>
                <p>Your Twitter account <strong>@${userData.data.username}</strong> has been connected successfully!</p>
                <p style="opacity: 0.8; font-size: 14px;">This window will close automatically...</p>
              </div>
              
              <script>
                console.log('🎉 Twitter OAuth completed successfully');
                // Close the window immediately
                setTimeout(() => {
                  try {
                    window.close();
                  } catch (e) {
                    console.log('Could not close window automatically');
                  }
                }, 1500);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });

      } catch (exchangeError: any) {
        console.error('❌ Error during token exchange:', exchangeError);
        
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Connection Failed</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #1a1a1a; color: white; }
                .error { color: #e74c3c; }
              </style>
            </head>
            <body>
              <h1 class="error">Connection Failed</h1>
              <p>Error: ${exchangeError.message}</p>
              <p>Please close this window and try again.</p>
              <script>
                setTimeout(() => { window.close(); }, 3000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("💥 Twitter OAuth error:", error);
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
