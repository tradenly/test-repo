import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

async function testOpenAIConnection() {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return { status: 'error', message: 'OpenAI API key not configured' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    });

    if (!response.ok) {
      return { status: 'error', message: `OpenAI API error: ${response.status}` };
    }

    return { status: 'success', message: 'OpenAI API connection successful' };
  } catch (error) {
    return { status: 'error', message: `OpenAI connection failed: ${error.message}` };
  }
}

async function testTwitterConnection() {
  const twitterApiKey = Deno.env.get('TWITTER_API_KEY');
  const twitterApiSecret = Deno.env.get('TWITTER_API_SECRET');
  const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
  
  if (!twitterApiKey || !twitterApiSecret || !twitterBearerToken) {
    return { status: 'error', message: 'Twitter API credentials not fully configured' };
  }

  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${twitterBearerToken}`,
      },
    });

    if (!response.ok) {
      return { status: 'error', message: `Twitter API error: ${response.status}` };
    }

    const data = await response.json();
    return { 
      status: 'success', 
      message: 'Twitter API connection successful',
      data: { username: data.data?.username }
    };
  } catch (error) {
    return { status: 'error', message: `Twitter connection failed: ${error.message}` };
  }
}

async function testDatabaseConnection(supabase: any) {
  try {
    const { count, error } = await supabase
      .from('ai_agent_signups')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { status: 'error', message: `Database error: ${error.message}` };
    }

    return { status: 'success', message: 'Database connection successful' };
  } catch (error) {
    return { status: 'error', message: `Database connection failed: ${error.message}` };
  }
}

async function getSystemStatus(supabase: any) {
  const openaiStatus = await testOpenAIConnection();
  const twitterStatus = await testTwitterConnection();
  const databaseStatus = await testDatabaseConnection(supabase);

  // Get agent counts
  const { data: signups } = await supabase
    .from('ai_agent_signups')
    .select('status')
    .eq('active', true);

  const { count: schedulesCount } = await supabase
    .from('ai_agent_schedules')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: tasks } = await supabase
    .from('ai_agent_tasks')
    .select('status')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const signupCounts = signups?.reduce((acc: any, signup: any) => {
    acc[signup.status] = (acc[signup.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const taskCounts = tasks?.reduce((acc: any, task: any) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return {
    connections: {
      openai: openaiStatus,
      twitter: twitterStatus,
      database: databaseStatus
    },
    stats: {
      signups: signupCounts,
      activeSchedules: schedulesCount || 0,
      tasksLast24h: taskCounts
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const { action } = await req.json();
      
      let result;
      switch (action) {
        case 'test_openai':
          result = await testOpenAIConnection();
          break;
        case 'test_twitter':
          result = await testTwitterConnection();
          break;
        case 'test_database':
          result = await testDatabaseConnection(supabase);
          break;
        case 'system_status':
          result = await getSystemStatus(supabase);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const result = await getSystemStatus(supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test Connections error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});