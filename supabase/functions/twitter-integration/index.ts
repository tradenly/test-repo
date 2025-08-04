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
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

// Use our app's Twitter credentials (properly configured)
const API_KEY = Deno.env.get("TWITTER_API_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_API_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    throw new Error("Missing Twitter API credentials in environment variables");
  }
  if (!openaiApiKey) {
    console.warn("OpenAI API key not configured - AI generation will be disabled");
  }
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("Signature Base String:", signatureBaseString);
  console.log("Signing Key:", signingKey);
  console.log("Generated Signature:", signature);

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function sendTweet(tweetText: string, userAccessToken: string): Promise<any> {
  const url = "https://api.x.com/2/tweets";
  const params = { text: tweetText };

  // Use the user's access token for OAuth 2.0
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();
  console.log("Response Body:", responseText);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

async function generateTweetContent(prompt: string, agentPersonality: string): Promise<string> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an AI agent with this personality: ${agentPersonality}. Generate a tweet that matches this personality. Keep it under 280 characters and make it engaging.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const { action, tweetText, userId, twitterAccountId, agentId, prompt } = await req.json();
      
      console.log(`Processing action: ${action}`);

      if (action === 'test-tweet') {
        // Test tweet functionality - uses our app's credentials
        if (!tweetText || !userId || !twitterAccountId) {
          throw new Error('Missing required parameters: tweetText, userId, twitterAccountId');
        }

        // Verify the user owns this Twitter account and get their access token
        const { data: accountData, error: accountError } = await supabase
          .from('user_twitter_accounts')
          .select('username, access_token')
          .eq('id', twitterAccountId)
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (accountError || !accountData) {
          throw new Error('Twitter account not found or inactive');
        }

        if (!accountData.access_token) {
          throw new Error('Twitter account not properly connected. Please reconnect your account using OAuth.');
        }

        // Post the tweet using the user's access token
        const result = await sendTweet(tweetText, accountData.access_token);
        
        console.log(`Tweet posted successfully for @${accountData.username}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          tweetId: result.data?.id,
          message: `Tweet posted successfully for @${accountData.username}!`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'generate-and-post') {
        // Generate AI content and post
        if (!userId || !agentId || !twitterAccountId || !prompt) {
          throw new Error('Missing required parameters: userId, agentId, twitterAccountId, prompt');
        }

        // Get agent personality
        const { data: agentData, error: agentError } = await supabase
          .from('ai_agent_signups')
          .select('personality, agent_name')
          .eq('id', agentId)
          .eq('user_id', userId)
          .single();

        if (agentError || !agentData) {
          throw new Error('Agent not found');
        }

        // Verify Twitter account and get access token
        const { data: accountData, error: accountError } = await supabase
          .from('user_twitter_accounts')
          .select('username, access_token')
          .eq('id', twitterAccountId)
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (accountError || !accountData) {
          throw new Error('Twitter account not found or inactive');
        }

        if (!accountData.access_token) {
          throw new Error('Twitter account not properly connected. Please reconnect your account using OAuth.');
        }

        // Generate tweet content
        const generatedContent = await generateTweetContent(prompt, agentData.personality || agentData.agent_name);
        
        // Post the tweet using the user's access token
        const result = await sendTweet(generatedContent, accountData.access_token);
        
        console.log(`AI-generated tweet posted successfully for @${accountData.username}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          tweetId: result.data?.id,
          content: generatedContent,
          message: `AI-generated tweet posted successfully for @${accountData.username}!`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unknown action: ${action}`);
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'Twitter Integration Service active',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Twitter Integration error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});