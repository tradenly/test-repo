
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user and verify admin status
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, fullName, username, role, password } = await req.json()

    // Create user with admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username: username
      }
    })

    if (createError) {
      console.error('User creation error:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = newUser.user.id

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        username: username
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create initial credits
    const { error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .insert({
        user_id: userId,
        balance: 10
      })

    if (creditsError) {
      console.error('Credits creation error:', creditsError)
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role || 'user'
      })

    if (roleError) {
      console.error('Role assignment error:', roleError)
    }

    // Generate referral code
    const { data: referralCode } = await supabaseAdmin.rpc('generate_referral_code')
    
    if (referralCode) {
      const { error: referralError } = await supabaseAdmin
        .from('user_referrals')
        .insert({
          user_id: userId,
          referral_code: referralCode
        })

      if (referralError) {
        console.error('Referral creation error:', referralError)
      }
    }

    // Record welcome credit transaction
    const { error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'bonus',
        amount: 10,
        description: 'Welcome bonus for admin-created user',
        status: 'completed',
        completed_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: userId,
        email: email,
        full_name: fullName,
        username: username
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in admin-create-user function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
