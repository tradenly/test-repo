import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Twitter API configuration
const TWITTER_API_BASE = "https://api.twitter.com/2";
const TWITTER_API_KEY = Deno.env.get("TWITTER_API_KEY");
const TWITTER_API_SECRET = Deno.env.get("TWITTER_API_SECRET");
const TWITTER_BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN");
const TWITTER_ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN");
const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");

// Supabase configuration
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface TwitterTaskPayload {
  taskId: string;
  taskType: 'post' | 'reply' | 'like' | 'retweet';
  content: {
    text?: string;
    reply_to_id?: string;
    tweet_id?: string;
  };
  twitterAccountId: string;
}

// OAuth 1.0a signature generation for Twitter API
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKey);
  const data = encoder.encode(signatureBaseString);
  
  return btoa(String.fromCharCode(...new Uint8Array(
    crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, data)
    ).then(signature => new Uint8Array(signature))
  )));
}

function generateOAuthHeader(method: string, url: string, accessToken: string, accessTokenSecret: string): string {
  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY!,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    TWITTER_API_SECRET!,
    accessTokenSecret
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return "OAuth " + Object.entries(signedOAuthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

async function executeTwitterTask(payload: TwitterTaskPayload, supabase: any) {
  console.log(`Executing Twitter task: ${payload.taskType} for task ${payload.taskId}`);
  
  try {
    // Get Twitter account details
    const { data: twitterAccount, error: accountError } = await supabase
      .from('user_twitter_accounts')
      .select('*')
      .eq('id', payload.twitterAccountId)
      .single();

    if (accountError || !twitterAccount) {
      throw new Error(`Twitter account not found: ${accountError?.message}`);
    }

    let result;
    
    switch (payload.taskType) {
      case 'post':
        result = await postTweet(payload.content.text!, twitterAccount.access_token, twitterAccount.refresh_token);
        break;
      case 'reply':
        result = await replyToTweet(payload.content.text!, payload.content.reply_to_id!, twitterAccount.access_token, twitterAccount.refresh_token);
        break;
      case 'like':
        result = await likeTweet(payload.content.tweet_id!, twitterAccount.access_token, twitterAccount.refresh_token);
        break;
      case 'retweet':
        result = await retweetTweet(payload.content.tweet_id!, twitterAccount.access_token, twitterAccount.refresh_token);
        break;
      default:
        throw new Error(`Unknown task type: ${payload.taskType}`);
    }

    // Update task status to completed
    await supabase
      .from('ai_agent_tasks')
      .update({
        status: 'completed',
        executed_at: new Date().toISOString(),
        twitter_response: result
      })
      .eq('id', payload.taskId);

    console.log(`Task ${payload.taskId} completed successfully`);
    return { success: true, result };

  } catch (error) {
    console.error(`Task ${payload.taskId} failed:`, error);
    
    // Update task status to failed
    await supabase
      .from('ai_agent_tasks')
      .update({
        status: 'failed',
        executed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', payload.taskId);

    throw error;
  }
}

async function postTweet(text: string, accessToken: string, accessTokenSecret: string) {
  const url = `${TWITTER_API_BASE}/tweets`;
  const method = "POST";
  
  const oauthHeader = generateOAuthHeader(method, url, accessToken, accessTokenSecret);
  
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

async function replyToTweet(text: string, replyToId: string, accessToken: string, accessTokenSecret: string) {
  const url = `${TWITTER_API_BASE}/tweets`;
  const method = "POST";
  
  const oauthHeader = generateOAuthHeader(method, url, accessToken, accessTokenSecret);
  
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reply: {
        in_reply_to_tweet_id: replyToId
      }
    }),
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

async function likeTweet(tweetId: string, accessToken: string, accessTokenSecret: string) {
  const url = `${TWITTER_API_BASE}/users/${accessToken}/likes`;
  const method = "POST";
  
  const oauthHeader = generateOAuthHeader(method, url, accessToken, accessTokenSecret);
  
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tweet_id: tweetId }),
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

async function retweetTweet(tweetId: string, accessToken: string, accessTokenSecret: string) {
  const url = `${TWITTER_API_BASE}/users/${accessToken}/retweets`;
  const method = "POST";
  
  const oauthHeader = generateOAuthHeader(method, url, accessToken, accessTokenSecret);
  
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tweet_id: tweetId }),
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
      throw new Error('Missing Twitter API credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const payload: TwitterTaskPayload = await req.json();
      const result = await executeTwitterTask(payload, supabase);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Health check endpoint
      return new Response(JSON.stringify({ status: 'Twitter integration active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Twitter integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});