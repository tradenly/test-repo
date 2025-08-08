import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// App's Twitter credentials for OAuth flow
const CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")?.trim();
const CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing Twitter OAuth credentials in environment variables");
  }
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
      
      console.log(`Processing OAuth action: ${action}`);

      if (action === 'get-auth-url') {
        const state_param = Math.random().toString(36).slice(2);
        const redirect_uri = 'https://csdrraabfbrzteezkqkm.supabase.co/functions/v1/twitter-oauth';
        // PKCE S256 code verifier/challenge
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        const code_verifier = btoa(String.fromCharCode(...randomBytes))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code_verifier));
        const code_challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // Persist state for validation
        const { error: stateError } = await supabase
          .from('oauth_states')
          .insert({
            user_id: userId,
            state_token: state_param,
            code_verifier,
            code_challenge,
            redirect_uri,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          });
        if (stateError) throw stateError;

        const scope = encodeURIComponent('tweet.read tweet.write users.read offline.access');
        const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}&state=${state_param}&code_challenge=${code_challenge}&code_challenge_method=S256`;

        return new Response(JSON.stringify({ authUrl, state: state_param }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'exchange-code') {
        if (!state) throw new Error('Missing state');
        // Validate and fetch stored OAuth state
        const { data: oauthState, error: stateErr } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('user_id', userId)
          .eq('state_token', state)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();
        if (stateErr || !oauthState) throw new Error('Invalid or expired OAuth state');

        const redirect_uri = oauthState.redirect_uri || 'https://csdrraabfbrzteezkqkm.supabase.co/functions/v1/twitter-oauth';
        
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
          throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();

        // Mark state as used
        await supabase
          .from('oauth_states')
          .update({ used_at: new Date().toISOString() })
          .eq('id', oauthState.id);
        
        // Get user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userData = await userResponse.json();
        
        const { error } = await supabase
          .from('user_twitter_connections')
          .insert({
            user_id: userId,
            twitter_user_id: userData.data.id,
            username: userData.data.username,
            display_name: userData.data.name,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
            is_active: true,
          });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true,
          username: userData.data.username,
          display_name: userData.data.name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userData = await userResponse.json();
        
        // Store in database
        const { error } = await supabase
          .from('user_twitter_connections')
          .insert({
            user_id: userId,
            twitter_user_id: userData.data.id,
            username: userData.data.username,
            display_name: userData.data.name,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: tokenData.expires_in ? 
              new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
            is_active: true,
          });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true,
          username: userData.data.username,
          display_name: userData.data.name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unknown action: ${action}`);
    }

    // Handle OAuth callback
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(`
          <html>
            <body>
              <h1>Authorization Failed</h1>
              <p>Error: ${error}</p>
              <script>window.close();</script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (code) {
        return new Response(`
          <html>
            <body>
              <h1>Authorization Successful!</h1>
              <p>You can close this window and return to the app.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_SUCCESS',
                    code: '${code}'
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

      return new Response('Missing authorization code', { status: 400 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Twitter OAuth error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});