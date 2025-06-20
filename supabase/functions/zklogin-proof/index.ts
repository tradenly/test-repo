
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
      const { jwt }: SaltRequest = requestBody;
      
      if (!jwt) {
        return new Response('JWT is required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      console.log('Requesting salt from Enoki API...');

      // Use the official Enoki API endpoint
      const enokiResponse = await fetch(`${ENOKI_API_BASE_URL}/v1/zklogin/salt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENOKI_API_KEY}`,
        },
        body: JSON.stringify({ token: jwt }),
      });

      if (!enokiResponse.ok) {
        const errorText = await enokiResponse.text();
        console.error('Enoki salt request failed:', errorText);
        return new Response(`Salt request failed: ${errorText}`, { 
          status: enokiResponse.status, 
          headers: corsHeaders 
        });
      }

      const enokiData = await enokiResponse.json();
      console.log('Salt retrieved successfully from Enoki');

      return new Response(JSON.stringify({ 
        salt: enokiData.salt,
        source: 'enoki'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'proof') {
      const proofRequest: ProofRequest = requestBody;
      
      console.log('Requesting ZK proof from Enoki API...');

      // Use the official Enoki API endpoint for proof generation
      const enokiResponse = await fetch(`${ENOKI_API_BASE_URL}/v1/zklogin/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENOKI_API_KEY}`,
        },
        body: JSON.stringify({
          jwt: proofRequest.jwt,
          ephemeralPublicKey: proofRequest.ephemeralPublicKey,
          maxEpoch: proofRequest.maxEpoch,
          jwtRandomness: proofRequest.jwtRandomness,
          salt: proofRequest.salt,
          keyClaimName: proofRequest.keyClaimName,
        }),
      });

      if (!enokiResponse.ok) {
        const errorText = await enokiResponse.text();
        console.error('Enoki proof request failed:', errorText);
        return new Response(`Proof request failed: ${errorText}`, { 
          status: enokiResponse.status, 
          headers: corsHeaders 
        });
      }

      const enokiData = await enokiResponse.json();
      console.log('ZK proof generated successfully from Enoki');

      return new Response(JSON.stringify(enokiData), {
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
