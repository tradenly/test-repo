
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idToken, userAddress, ephemeralKeyPair, maxEpoch, randomness } = await req.json();

    if (!idToken || !userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Decode the JWT to extract user information
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    console.log('Processing ZK Login for user:', email);

    // Check if user already exists
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId;
    
    if (existingUser?.user) {
      // User exists, update their metadata with ZK Login info
      userId = existingUser.user.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            ...existingUser.user.user_metadata,
            zklogin_address: userAddress,
            zklogin_max_epoch: maxEpoch,
            zklogin_randomness: randomness,
            zklogin_enabled: true,
            full_name: name,
            avatar_url: picture,
          }
        }
      );
      
      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        throw updateError;
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          username: email.split('@')[0],
          avatar_url: picture,
          zklogin_address: userAddress,
          zklogin_max_epoch: maxEpoch,
          zklogin_randomness: randomness,
          zklogin_enabled: true,
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
      
      userId = newUser.user?.id;
    }

    // Generate a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      throw sessionError;
    }

    // Store ZK Login wallet in user_wallets table
    const { error: walletError } = await supabase
      .from('user_wallets')
      .upsert({
        user_id: userId,
        blockchain: 'sui',
        wallet_address: userAddress,
        wallet_name: 'ZK Login Wallet',
        is_primary: true,
      }, {
        onConflict: 'user_id,wallet_address'
      });

    if (walletError) {
      console.log('Wallet insertion warning:', walletError);
      // Don't fail the auth process if wallet insertion fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        session_url: sessionData.properties?.action_link,
        user_id: userId,
        message: 'ZK Login authentication successful'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('ZK Login bridge error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
