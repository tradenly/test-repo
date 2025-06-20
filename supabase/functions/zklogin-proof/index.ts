
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enoki public API key for Mainnet
const ENOKI_API_KEY = 'enoki_public_39cb997c8013b5ddbf2b2463748a8ba0d8c6bf83983e1359f5f9e8459e6dfcf9';
const ENOKI_API_BASE_URL = 'https://api.enoki.mystenlabs.com';

interface SaltRequest {
  action: 'salt';
  jwt: string;
}

interface ProofRequest {
  action: 'proof';
  jwt: string;
  ephemeralPublicKey: string;
  maxEpoch: number;
  jwtRandomness: string;
  salt: string;
  keyClaimName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const requestBody = await req.json();
    const { action } = requestBody;

    console.log(`ZK Login Proof Function called with action: ${action}`);

    if (action === 'salt') {
      // Handle salt retrieval
      const { jwt }: SaltRequest = requestBody;
      
      if (!jwt) {
        return new Response('JWT is required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      console.log('Requesting salt from Enoki for JWT...');

      // Updated endpoint - using the correct Enoki salt endpoint
      const saltResponse = await fetch(`${ENOKI_API_BASE_URL}/v1/zklogin/salt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENOKI_API_KEY}`,
        },
        body: JSON.stringify({ token: jwt }),
      });

      if (!saltResponse.ok) {
        const errorText = await saltResponse.text();
        console.error('Enoki salt request failed:', errorText);
        
        // Try alternative endpoint if the first one fails
        console.log('Trying alternative salt endpoint...');
        const altSaltResponse = await fetch('https://salt.api.mystenlabs.com/get_salt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: jwt }),
        });

        if (!altSaltResponse.ok) {
          const altErrorText = await altSaltResponse.text();
          console.error('Alternative salt endpoint also failed:', altErrorText);
          return new Response(`Failed to get salt: ${errorText}`, { 
            status: saltResponse.status, 
            headers: corsHeaders 
          });
        }

        const altSaltData = await altSaltResponse.json();
        console.log('Salt retrieved successfully from alternative endpoint');
        return new Response(JSON.stringify({ salt: altSaltData.user_salt }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const saltData = await saltResponse.json();
      console.log('Salt retrieved successfully from Enoki');

      return new Response(JSON.stringify({ salt: saltData.salt || saltData.user_salt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'proof') {
      // Handle ZK proof generation
      const proofRequest: ProofRequest = requestBody;
      
      const { jwt, ephemeralPublicKey, maxEpoch, jwtRandomness, salt, keyClaimName } = proofRequest;

      if (!jwt || !ephemeralPublicKey || !maxEpoch || !jwtRandomness || !salt) {
        return new Response('Missing required parameters', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      console.log('Requesting ZK proof from Enoki...');

      const proofResponse = await fetch(`${ENOKI_API_BASE_URL}/v1/zklogin/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENOKI_API_KEY}`,
        },
        body: JSON.stringify({
          jwt,
          ephemeralPublicKey,
          maxEpoch,
          jwtRandomness,
          salt,
          keyClaimName: keyClaimName || 'sub',
        }),
      });

      if (!proofResponse.ok) {
        const errorText = await proofResponse.text();
        console.error('Enoki proof request failed:', errorText);
        return new Response(`Failed to generate proof: ${errorText}`, { 
          status: proofResponse.status, 
          headers: corsHeaders 
        });
      }

      const proofData = await proofResponse.json();
      console.log('ZK proof generated successfully from Enoki');

      return new Response(JSON.stringify(proofData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response('Invalid action', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('Error in zklogin-proof function:', error);
    return new Response(`Internal server error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
