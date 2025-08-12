
import { createHmac } from "node:crypto";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWITTER_API_KEY = Deno.env.get("TWITTER_API_KEY")?.trim();
const TWITTER_API_SECRET = Deno.env.get("TWITTER_API_SECRET")?.trim();
const TWITTER_ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  console.log("🔍 Validating Twitter v1.1 credentials...");
  console.log("API_KEY exists:", !!TWITTER_API_KEY);
  console.log("API_SECRET exists:", !!TWITTER_API_SECRET);
  console.log("ACCESS_TOKEN exists:", !!TWITTER_ACCESS_TOKEN);
  console.log("ACCESS_TOKEN_SECRET exists:", !!TWITTER_ACCESS_TOKEN_SECRET);
  
  if (!TWITTER_API_KEY) {
    throw new Error("Missing TWITTER_API_KEY environment variable");
  }
  if (!TWITTER_API_SECRET) {
    throw new Error("Missing TWITTER_API_SECRET environment variable");
  }
  if (!TWITTER_ACCESS_TOKEN) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN environment variable");
  }
  if (!TWITTER_ACCESS_TOKEN_SECRET) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET environment variable");
  }
  console.log("✅ Twitter v1.1 credentials validated");
}

// Fixed OAuth 1.0a signature generation for Twitter v1.1 API
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters alphabetically and encode them
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  const signingKey = [
    encodeURIComponent(consumerSecret),
    encodeURIComponent(tokenSecret)
  ].join('&');

  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("📝 OAuth 1.0a signature details:");
  console.log("Method:", method);
  console.log("URL:", url);
  console.log("Sorted params:", sortedParams);
  console.log("Signature base string:", signatureBaseString);
  console.log("Signing key:", signingKey.substring(0, 20) + "...");
  console.log("Generated signature:", signature);

  return signature;
}

function generateOAuthHeader(method: string, url: string, additionalParams: Record<string, string> = {}): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY!,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: TWITTER_ACCESS_TOKEN!,
    oauth_version: "1.0",
    ...additionalParams // Include any additional parameters for signature
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    TWITTER_API_SECRET!,
    TWITTER_ACCESS_TOKEN_SECRET!
  );

  // Only include OAuth parameters in the header (not additional params)
  const headerParams = {
    oauth_consumer_key: TWITTER_API_KEY!,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: TWITTER_ACCESS_TOKEN!,
    oauth_version: "1.0",
    oauth_signature: signature,
  };

  const entries = Object.entries(headerParams).sort(([a], [b]) => a.localeCompare(b));

  return "OAuth " + entries
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

async function sendTweetV1(tweetText: string): Promise<any> {
  const url = "https://api.twitter.com/1.1/statuses/update.json";
  const method = "POST";
  
  // Include the status parameter in signature calculation
  const postParams = { status: tweetText };
  const oauthHeader = generateOAuthHeader(method, url, postParams);

  console.log("🐦 Sending tweet via v1.1 API:");
  console.log("Tweet text:", tweetText.substring(0, 100) + (tweetText.length > 100 ? "..." : ""));
  console.log("OAuth header:", oauthHeader.substring(0, 100) + "...");

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `status=${encodeURIComponent(tweetText)}`,
  });

  const responseText = await response.text();
  console.log("📥 Twitter v1.1 API Response Status:", response.status);
  console.log("📥 Twitter v1.1 API Response:", responseText.substring(0, 200) + "...");

  if (!response.ok) {
    console.error("❌ Twitter v1.1 API Error:", responseText);
    throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
  }

  return JSON.parse(responseText);
}

async function generateAIContent(prompt: string, agentPersonality: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🤖 Generating AI content with prompt:', prompt.substring(0, 50) + "...");

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI agent with this personality: ${agentPersonality}. Generate engaging Twitter content that matches this personality. Keep tweets under 280 characters. Be authentic and engaging.`
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
    console.error("❌ OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  console.log("✅ Generated AI content:", content);
  return content;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const { action, text, userId, agentId, prompt } = await req.json();
      console.log(`🎯 Processing action: ${action} for user: ${userId}`);

      if (action === 'test-tweet-v1') {
        // Validate required parameters
        if (!text || !userId) {
          throw new Error('Missing required parameters: text, userId');
        }

        // Verify user exists and has permission
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          console.error("❌ User verification failed:", userError);
          throw new Error('User not found or unauthorized');
        }

        console.log(`✅ User ${userId} verified, sending test tweet`);

        // Send tweet using Twitter v1.1 API with our app credentials
        const result = await sendTweetV1(text);
        
        console.log(`🎉 Test tweet sent successfully for user ${userId}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          data: result,
          tweetId: result.id_str,
          message: 'Tweet sent successfully via Twitter v1.1 API'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'generate-and-post-v1') {
        if (!userId || !agentId || !prompt) {
          throw new Error('Missing required parameters: userId, agentId, prompt');
        }

        // Get agent data for personality
        const { data: agentData, error: agentError } = await supabase
          .from('ai_agent_signups')
          .select('personality, description, bio, response_style, adjectives, tone')
          .eq('id', agentId)
          .eq('user_id', userId)
          .single();

        if (agentError || !agentData) {
          console.error("❌ Agent verification failed:", agentError);
          throw new Error('Agent not found or not authorized');
        }

        console.log(`✅ Agent ${agentId} verified for user ${userId}`);

        // Build personality string
        const personalityParts = [
          agentData.personality,
          agentData.description,
          agentData.bio,
          agentData.response_style,
          agentData.adjectives,
          agentData.tone
        ].filter(Boolean);
        
        const agentPersonality = personalityParts.join(' | ');

        // Generate content
        const generatedContent = await generateAIContent(prompt, agentPersonality);

        // Post the tweet
        const result = await sendTweetV1(generatedContent);

        console.log(`🎉 AI-generated tweet posted successfully for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          data: result,
          tweetId: result.id_str,
          generatedContent,
          message: 'AI tweet generated and posted successfully via Twitter v1.1 API'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unknown action: ${action}`);
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'Twitter v1.1 Integration service is running',
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
    console.error('💥 Twitter v1.1 Integration error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
