import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash, randomBytes } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")?.trim();
const CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing Twitter OAuth credentials in environment variables");
  }
}

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

// Generate secure state token
function generateState() {
  return randomBytes(32).toString('base64url');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const { action, userId, code, state } = await req.json();
      
      console.log(`Processing OAuth v2 action: ${action}`);

      if (action === 'start-auth') {
        // Generate PKCE and state
        const { codeVerifier, codeChallenge } = generatePKCE();
        const stateToken = generateState();
        const redirectUri = `${new URL(req.url).origin}/functions/v1/twitter-oauth-v2/callback`;
        
        // Store OAuth state in database
        const { error: stateError } = await supabase
          .from('oauth_states')
          .insert({
            user_id: userId,
            state_token: stateToken,
            code_verifier: codeVerifier,
            code_challenge: codeChallenge,
            redirect_uri: redirectUri,
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
          });

        if (stateError) {
          console.error('Error storing OAuth state:', stateError);
          throw new Error('Failed to initialize OAuth flow');
        }

        // Generate authorization URL
        const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', CLIENT_ID!);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');

        return new Response(JSON.stringify({ 
          authUrl: authUrl.toString(),
          state: stateToken
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'check-connection') {
        // Check if user has any active Twitter connections
        const { data: connections, error } = await supabase
          .from('user_twitter_connections')
          .select('id, username, display_name, is_active, created_at')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) throw error;

        return new Response(JSON.stringify({ 
          connections: connections || [],
          hasConnection: (connections?.length || 0) > 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'disconnect') {
        const { connectionId } = await req.json();
        
        // Deactivate the connection
        const { error } = await supabase
          .from('user_twitter_connections')
          .update({ is_active: false, connection_status: 'disconnected' })
          .eq('id', connectionId)
          .eq('user_id', userId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unknown action: ${action}`);
    }

    // Handle OAuth callback
    if (req.method === 'GET' && req.url.includes('/callback')) {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        return new Response(`
          <html>
            <body>
              <h1>Authorization Failed</h1>
              <p>Error: ${error}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_ERROR',
                    error: '${error}'
                  }, '*');
                }
                window.close();
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (!code || !state) {
        return new Response('Missing authorization code or state', { status: 400 });
      }

      try {
        // Retrieve and validate OAuth state
        const { data: oauthState, error: stateError } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state_token', state)
          .eq('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (stateError || !oauthState) {
          throw new Error('Invalid or expired OAuth state');
        }

        // Mark state as used
        await supabase
          .from('oauth_states')
          .update({ used_at: new Date().toISOString() })
          .eq('id', oauthState.id);

        // Exchange code for tokens
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: oauthState.redirect_uri,
            code_verifier: oauthState.code_verifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange failed:', errorText);
          throw new Error('Failed to exchange code for tokens');
        }

        const tokenData = await tokenResponse.json();
        
        // Get user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userData = await userResponse.json();
        
        // Store connection in database
        const expiresAt = tokenData.expires_in ? 
          new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null;

        const { error: insertError } = await supabase
          .from('user_twitter_connections')
          .upsert({
            user_id: oauthState.user_id,
            twitter_user_id: userData.data.id,
            username: userData.data.username,
            display_name: userData.data.name,
            profile_image_url: userData.data.profile_image_url,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: expiresAt,
            scope: 'tweet.read tweet.write users.read offline.access',
            is_active: true,
            connection_status: 'active',
            rate_limit_remaining: 300
          }, {
            onConflict: 'user_id,twitter_user_id'
          });

        if (insertError) {
          console.error('Error storing connection:', insertError);
          throw insertError;
        }

        // Log successful connection
        await supabase
          .from('twitter_api_logs')
          .insert({
            user_id: oauthState.user_id,
            endpoint: '/oauth2/authorize',
            method: 'GET',
            request_data: { action: 'oauth_callback' },
            response_data: { success: true, username: userData.data.username },
            status_code: 200,
            execution_time_ms: 0
          });

        return new Response(`
          <html>
            <body>
              <h1>Authorization Successful!</h1>
              <p>Connected Twitter account: @${userData.data.username}</p>
              <p>You can close this window and return to the app.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_SUCCESS',
                    username: '${userData.data.username}',
                    displayName: '${userData.data.name}'
                  }, '*');
                }
                window.close();
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (error: any) {
        console.error('Callback processing error:', error);
        return new Response(`
          <html>
            <body>
              <h1>Authorization Failed</h1>
              <p>Error: ${error.message}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_ERROR',
                    error: '${error.message}'
                  }, '*');
                }
                window.close();
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
    console.error("Twitter OAuth v2 error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});