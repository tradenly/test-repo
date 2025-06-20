
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enoki public API key for Mainnet
const ENOKI_API_KEY = 'enoki_public_39cb997c8013b5ddbf2b2463748a8ba0d8c6bf83983e1359f5f9e8459e6dfcf9';
const ENOKI_API_BASE_URL = 'https://api.enoki.mystenlabs.com';

interface SaltRequest {
  jwt: string;
}

interface ProofRequest {
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
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`ZK Login Proof Function called with path: ${path}`);

    if (path.endsWith('/salt')) {
      // Handle salt retrieval
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { 
          status: 405, 
          headers: corsHeaders 
        });
      }

      const { jwt }: SaltRequest = await req.json();
      
      if (!jwt) {
        return new Response('JWT is required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      console.log('Requesting salt from Enoki for JWT...');

      const saltResponse = await fetch(`${ENOKI_API_BASE_URL}/v1/zklogin/salt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENOKI_API_KEY}`,
        },
        body: JSON.stringify({ jwt }),
      });

      if (!saltResponse.ok) {
        const errorText = await saltResponse.text();
        console.error('Enoki salt request failed:', errorText);
        return new Response(`Failed to get salt: ${errorText}`, { 
          status: saltResponse.status, 
          headers: corsHeaders 
        });
      }

      const saltData = await saltResponse.json();
      console.log('Salt retrieved successfully from Enoki');

      return new Response(JSON.stringify(saltData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (path.endsWith('/proof')) {
      // Handle ZK proof generation
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { 
          status: 405, 
          headers: corsHeaders 
        });
      }

      const proofRequest: ProofRequest = await req.json();
      
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
      return new Response('Not found', { 
        status: 404, 
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
