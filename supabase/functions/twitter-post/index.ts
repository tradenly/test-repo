import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

// Simple Twitter posting using OAuth 2.0 Bearer Token
async function postTweetWithOAuth2(accessToken: string, tweetText: string): Promise<any> {
  console.log(`Attempting to post tweet: "${tweetText.substring(0, 50)}..."`);
  
  const response = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: tweetText
    }),
  });

  const responseText = await response.text();
  console.log(`Twitter API response status: ${response.status}`);
  console.log(`Twitter API response: ${responseText}`);

  if (!response.ok) {
    throw new Error(`Twitter API error (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
}

// Generate AI content using OpenAI
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const { action, tweetText, userId, agentId, twitterOAuthId, generateContent, prompt, agentPersonality } = await req.json();
      
      console.log(`Processing action: ${action}`);

      if (action === 'test-tweet') {
        // Test tweet functionality
        if (!tweetText || !userId || !twitterOAuthId) {
          throw new Error('Missing required parameters: tweetText, userId, twitterOAuthId');
        }

        // Get the user's Twitter OAuth token
        const { data: oauthData, error: oauthError } = await supabase
          .from('user_twitter_oauth')
          .select('access_token, username')
          .eq('id', twitterOAuthId)
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (oauthError || !oauthData) {
          throw new Error('Twitter account not found or inactive');
        }

        // Post the tweet
        const result = await postTweetWithOAuth2(oauthData.access_token, tweetText);
        
        console.log(`Tweet posted successfully for @${oauthData.username}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          tweetId: result.data?.id,
          message: 'Tweet posted successfully!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'generate-and-post') {
        // Generate content and post
        if (!userId || !agentId || !twitterOAuthId || !prompt) {
          throw new Error('Missing required parameters: userId, agentId, twitterOAuthId, prompt');
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

        // Get Twitter OAuth token
        const { data: oauthData, error: oauthError } = await supabase
          .from('user_twitter_oauth')
          .select('access_token, username')
          .eq('id', twitterOAuthId)
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (oauthError || !oauthData) {
          throw new Error('Twitter account not found or inactive');
        }

        // Generate tweet content
        const generatedContent = await generateTweetContent(prompt, agentData.personality || agentData.agent_name);
        
        // Post the tweet
        const result = await postTweetWithOAuth2(oauthData.access_token, generatedContent);
        
        // Record the post
        await supabase
          .from('agent_posts')
          .insert({
            user_id: userId,
            agent_id: agentId,
            twitter_oauth_id: twitterOAuthId,
            content: generatedContent,
            status: 'posted',
            twitter_post_id: result.data?.id,
            posted_at: new Date().toISOString()
          });

        console.log(`AI-generated tweet posted successfully for @${oauthData.username}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          tweetId: result.data?.id,
          content: generatedContent,
          message: 'AI-generated tweet posted successfully!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unknown action: ${action}`);
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'Twitter Post Service active',
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
    console.error("Twitter Post Service error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});