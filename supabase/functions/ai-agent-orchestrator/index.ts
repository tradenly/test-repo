import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// OpenAI configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_BASE = "https://api.openai.com/v1";

// Supabase configuration
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface AgentSignup {
  id: string;
  user_id: string;
  agent_name: string;
  personality: string;
  bio: string;
  response_style: string;
  tone: string;
  social_username: string;
  social_password: string;
  posting_probability: number;
  timeline_reply_probability: number;
  status: string;
  active: boolean;
}

interface AgentSchedule {
  id: string;
  agent_id: string;
  twitter_account_id: string;
  frequency_minutes: number;
  active_hours_start: number;
  active_hours_end: number;
  days_of_week: number[];
  keywords: string[];
  reply_keywords: string[];
  is_active: boolean;
}

async function generateAIContent(prompt: string, agentPersonality: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI agent with the following personality: ${agentPersonality}. Generate content that matches this personality. Keep responses under 280 characters for Twitter posts. Be engaging and authentic to the personality described.`
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
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function isWithinActiveHours(schedule: AgentSchedule): Promise<boolean> {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Convert to Monday = 1, Sunday = 7 format
  const dayOfWeek = currentDay === 0 ? 7 : currentDay;
  
  // Check if current day is in active days
  if (!schedule.days_of_week.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if current hour is within active hours
  return currentHour >= schedule.active_hours_start && currentHour <= schedule.active_hours_end;
}

async function shouldGenerateContent(probability: number): Promise<boolean> {
  return Math.random() * 100 < probability;
}

async function processAgentSchedules(supabase: any) {
  console.log('Processing agent schedules...');
  
  // Get all active agent schedules
  const { data: schedules, error: schedulesError } = await supabase
    .from('ai_agent_schedules')
    .select(`
      *,
      ai_agent_signups!inner(*)
    `)
    .eq('is_active', true)
    .eq('ai_agent_signups.active', true)
    .eq('ai_agent_signups.status', 'approved');

  if (schedulesError) {
    console.error('Error fetching schedules:', schedulesError);
    return;
  }

  console.log(`Found ${schedules?.length || 0} active schedules`);

  for (const schedule of schedules || []) {
    try {
      // Check if within active hours
      if (!(await isWithinActiveHours(schedule))) {
        console.log(`Schedule ${schedule.id} outside active hours`);
        continue;
      }

      const agent = schedule.ai_agent_signups;
      
      // Check if should generate content based on probability
      if (!(await shouldGenerateContent(agent.posting_probability))) {
        console.log(`Skipping content generation for agent ${agent.id} based on probability`);
        continue;
      }

      // Check if last post was within frequency window
      const { data: lastTask } = await supabase
        .from('ai_agent_tasks')
        .select('created_at')
        .eq('agent_id', agent.id)
        .eq('task_type', 'post')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastTask) {
        const lastPostTime = new Date(lastTask.created_at);
        const now = new Date();
        const timeDiff = (now.getTime() - lastPostTime.getTime()) / (1000 * 60); // minutes
        
        if (timeDiff < schedule.frequency_minutes) {
          console.log(`Too soon for next post for agent ${agent.id}`);
          continue;
        }
      }

      // Generate content
      const prompt = `Generate a tweet about $PPEE token, Tropical Fattys, or crypto gaming. Make it ${agent.tone} and ${agent.response_style}. ${agent.bio ? `Context: ${agent.bio}` : ''}`;
      const content = await generateAIContent(prompt, agent.personality);
      
      if (!content) {
        console.log(`No content generated for agent ${agent.id}`);
        continue;
      }

      // Get Twitter account for this agent
      const { data: twitterAccount } = await supabase
        .from('user_twitter_accounts')
        .select('id')
        .eq('user_id', agent.user_id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!twitterAccount) {
        console.log(`No active Twitter account for user ${agent.user_id}`);
        continue;
      }

      // Create task
      const { error: taskError } = await supabase
        .from('ai_agent_tasks')
        .insert({
          user_id: agent.user_id,
          agent_id: agent.id,
          twitter_account_id: twitterAccount.id,
          task_type: 'post',
          content: { text: content },
          status: 'pending'
        });

      if (taskError) {
        console.error(`Error creating task for agent ${agent.id}:`, taskError);
        continue;
      }

      console.log(`Created post task for agent ${agent.id}: "${content}"`);

      // Log the activity
      await supabase
        .from('ai_agent_logs')
        .insert({
          user_id: agent.user_id,
          agent_id: agent.id,
          log_level: 'info',
          message: `Generated new post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
        });

    } catch (error) {
      console.error(`Error processing schedule ${schedule.id}:`, error);
      
      // Log the error
      await supabase
        .from('ai_agent_logs')
        .insert({
          user_id: schedule.ai_agent_signups.user_id,
          agent_id: schedule.agent_id,
          log_level: 'error',
          message: `Error in orchestrator: ${error.message}`
        });
    }
  }
}

async function processPendingTasks(supabase: any) {
  console.log('Processing pending tasks...');
  
  // Get pending tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('ai_agent_tasks')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10);

  if (tasksError) {
    console.error('Error fetching pending tasks:', tasksError);
    return;
  }

  console.log(`Found ${tasks?.length || 0} pending tasks`);

  for (const task of tasks || []) {
    try {
      // Update task status to processing
      await supabase
        .from('ai_agent_tasks')
        .update({ status: 'processing' })
        .eq('id', task.id);

      // Call Twitter integration function
      const response = await fetch(`${supabaseUrl}/functions/v1/twitter-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          taskId: task.id,
          taskType: task.task_type,
          content: task.content,
          twitterAccountId: task.twitter_account_id
        }),
      });

      if (!response.ok) {
        throw new Error(`Twitter integration failed: ${response.status}`);
      }

      console.log(`Successfully processed task ${task.id}`);

    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
      
      // Update task status to failed
      await supabase
        .from('ai_agent_tasks')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', task.id);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const { action } = await req.json();
      
      switch (action) {
        case 'process_schedules':
          await processAgentSchedules(supabase);
          break;
        case 'process_tasks':
          await processPendingTasks(supabase);
          break;
        case 'full_cycle':
          await processAgentSchedules(supabase);
          await processPendingTasks(supabase);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Health check endpoint
      return new Response(JSON.stringify({ status: 'AI Agent Orchestrator active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Agent Orchestrator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});