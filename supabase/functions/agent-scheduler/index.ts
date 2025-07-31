import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

async function activateAgentSchedule(agentSignupId: string, supabase: any) {
  console.log(`Activating schedule for agent signup: ${agentSignupId}`);
  
  // Get the agent signup
  const { data: signup, error: signupError } = await supabase
    .from('ai_agent_signups')
    .select('*')
    .eq('id', agentSignupId)
    .single();

  if (signupError || !signup) {
    throw new Error(`Agent signup not found: ${signupError?.message}`);
  }

  // Check if schedule already exists
  const { data: existingSchedule } = await supabase
    .from('ai_agent_schedules')
    .select('id')
    .eq('agent_signup_id', agentSignupId)
    .single();

  if (existingSchedule) {
    // Update existing schedule
    const { error: updateError } = await supabase
      .from('ai_agent_schedules')
      .update({
        is_active: true,
        posting_probability: signup.posting_probability,
        timeline_reply_probability: signup.timeline_reply_probability,
        updated_at: new Date().toISOString()
      })
      .eq('agent_signup_id', agentSignupId);

    if (updateError) {
      throw new Error(`Failed to update schedule: ${updateError.message}`);
    }

    console.log(`Updated existing schedule for agent ${agentSignupId}`);
    return existingSchedule.id;
  }

  // Create new schedule
  const { data: newSchedule, error: createError } = await supabase
    .from('ai_agent_schedules')
    .insert({
      agent_signup_id: agentSignupId,
      user_id: signup.user_id,
      posting_frequency_hours: Math.max(1, 24 / Math.max(signup.posting_probability, 1)),
      posting_probability: signup.posting_probability,
      timeline_reply_probability: signup.timeline_reply_probability,
      is_active: true,
      active_hours_start: '09:00:00',
      active_hours_end: '17:00:00',
      timezone: 'UTC',
      days_of_week: [1, 2, 3, 4, 5], // Monday to Friday
      keywords: ['$PPEE', 'Tropical Fattys', 'crypto', 'gaming'],
      reply_keywords: ['$PPEE', 'PPEE']
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create schedule: ${createError.message}`);
  }

  console.log(`Created new schedule for agent ${agentSignupId}`);
  return newSchedule.id;
}

async function deactivateAgentSchedule(agentSignupId: string, supabase: any) {
  console.log(`Deactivating schedule for agent signup: ${agentSignupId}`);
  
  const { error } = await supabase
    .from('ai_agent_schedules')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('agent_signup_id', agentSignupId);

  if (error) {
    throw new Error(`Failed to deactivate schedule: ${error.message}`);
  }

  console.log(`Deactivated schedule for agent ${agentSignupId}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === 'POST') {
      const { action, agentSignupId } = await req.json();
      
      if (!agentSignupId) {
        throw new Error('agentSignupId is required');
      }

      let result;
      switch (action) {
        case 'activate':
          result = await activateAgentSchedule(agentSignupId, supabase);
          break;
        case 'deactivate':
          await deactivateAgentSchedule(agentSignupId, supabase);
          result = { success: true };
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ status: 'Agent Scheduler active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Agent Scheduler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});