import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")?.trim();

function validateEnvironmentVariables() {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
}

// Generate AI content using OpenAI
async function generateAIContent(prompt: string, agentPersonality: string): Promise<string> {
  const systemPrompt = `You are an AI agent with this personality: ${agentPersonality}

Key guidelines:
- Keep tweets under 280 characters
- Be engaging and authentic to the personality
- Do not use hashtags unless they're natural to the personality
- Do not use quotes around your response
- Generate only the tweet content, nothing else`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Post tweet using user's Twitter connection
async function postTweet(connectionId: string, content: string, supabase: any): Promise<any> {
  // Get user's Twitter connection
  const { data: connection, error: connectionError } = await supabase
    .from('user_twitter_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('is_active', true)
    .single();

  if (connectionError || !connection) {
    throw new Error('Twitter connection not found or inactive');
  }

  // Check if token is expired and needs refresh
  if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
    if (!connection.refresh_token) {
      throw new Error('Twitter token expired and no refresh token available');
    }
    
    // Refresh the token
    // Note: Twitter API v2 token refresh implementation would go here
    // For now, we'll assume the token is valid
  }

  // Check rate limits
  if (connection.rate_limit_remaining <= 0 && 
      connection.rate_limit_reset && 
      new Date(connection.rate_limit_reset) > new Date()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const startTime = Date.now();
  
  try {
    // Post tweet using Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      }),
    });

    const responseData = await response.json();
    const executionTime = Date.now() - startTime;

    // Update rate limit info if available
    const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
    const rateLimitReset = response.headers.get('x-rate-limit-reset');
    
    if (rateLimitRemaining) {
      await supabase
        .from('user_twitter_connections')
        .update({
          rate_limit_remaining: parseInt(rateLimitRemaining),
          rate_limit_reset: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : null,
          last_used_at: new Date().toISOString()
        })
        .eq('id', connectionId);
    }

    // Log API call
    await supabase
      .from('twitter_api_logs')
      .insert({
        user_id: connection.user_id,
        twitter_connection_id: connectionId,
        endpoint: '/2/tweets',
        method: 'POST',
        request_data: { text: content },
        response_data: responseData,
        status_code: response.status,
        execution_time_ms: executionTime,
        rate_limit_remaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : null
      });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error: any) {
    // Log failed API call
    await supabase
      .from('twitter_api_logs')
      .insert({
        user_id: connection.user_id,
        twitter_connection_id: connectionId,
        endpoint: '/2/tweets',
        method: 'POST',
        request_data: { text: content },
        status_code: 500,
        error_message: error.message,
        execution_time_ms: Date.now() - startTime
      });

    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, userId, connectionId, content, agentId, prompt } = await req.json();

    console.log(`Processing Twitter API action: ${action}`);

    // Verify user authentication
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (action === 'test-tweet') {
      if (!connectionId || !content) {
        throw new Error('Connection ID and content are required for test tweet');
      }

      const result = await postTweet(connectionId, content, supabase);
      
      // Record the post in agent_posts table
      await supabase
        .from('agent_posts')
        .insert({
          user_id: userId,
          agent_signup_id: agentId || null,
          twitter_connection_id: connectionId,
          content: content,
          twitter_post_id: result.data?.id,
          post_type: 'test',
          status: 'posted',
          posted_at: new Date().toISOString()
        });

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Test tweet posted successfully!',
        tweetId: result.data?.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-and-post') {
      if (!connectionId || !prompt || !agentId) {
        throw new Error('Connection ID, prompt, and agent ID are required');
      }

      // Get agent personality
      const { data: agent, error: agentError } = await supabase
        .from('ai_agent_signups')
        .select('personality, agent_name')
        .eq('id', agentId)
        .eq('user_id', userId)
        .single();

      if (agentError || !agent) {
        throw new Error('AI agent not found');
      }

      // Generate content using AI
      const generatedContent = await generateAIContent(prompt, agent.personality || 'friendly and engaging');
      
      // Post the generated content
      const result = await postTweet(connectionId, generatedContent, supabase);
      
      // Record the post in agent_posts table
      await supabase
        .from('agent_posts')
        .insert({
          user_id: userId,
          agent_signup_id: agentId,
          twitter_connection_id: connectionId,
          content: generatedContent,
          twitter_post_id: result.data?.id,
          post_type: 'agent_generated',
          status: 'posted',
          posted_at: new Date().toISOString(),
          metadata: { prompt, agentName: agent.agent_name }
        });

      return new Response(JSON.stringify({ 
        success: true,
        content: generatedContent,
        tweetId: result.data?.id,
        message: 'AI generated tweet posted successfully!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-posts') {
      // Get user's posts
      const { data: posts, error: postsError } = await supabase
        .from('agent_posts')
        .select(`
          *,
          ai_agent_signups(agent_name),
          user_twitter_connections(username)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      return new Response(JSON.stringify({ 
        success: true,
        posts: posts || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: any) {
    console.error("Twitter API error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});