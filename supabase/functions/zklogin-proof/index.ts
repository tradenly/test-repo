
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enoki public API key for Mainnet
const ENOKI_API_KEY = 'enoki_public_39cb997c8013b5ddbf2b2463748a8ba0d8c6bf83983e1359f5f9e8459e6dfcf9';
const ENOKI_API_BASE_URL = 'https://api.enoki.mystenlabs.com';

// Your Google OAuth Client ID that needs to be whitelisted
const GOOGLE_CLIENT_ID = '821258811515-c3mtuebmirhtn0t0f7gm9oqe9prhjqqs.apps.googleusercontent.com';

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

// Temporary mock salt generator for testing (deterministic based on JWT sub claim)
function generateMockSalt(jwt: string): string {
  try {
    // Decode JWT to get the 'sub' claim
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const sub = payload.sub;
    
    // Generate a deterministic 32-byte salt based on the sub claim
    // This is just for testing - in production, use Enoki's salt
    const encoder = new TextEncoder();
    const data = encoder.encode(`mock_salt_${sub}_${GOOGLE_CLIENT_ID}`);
    
    // Simple hash function to create 32 bytes
    let hash = '';
    for (let i = 0; i < 32; i++) {
      const byte = data[i % data.length] ^ (i * 7);
      hash += byte.toString(16).padStart(2, '0');
    }
    
    return hash;
  } catch (error) {
    console.error('Error generating mock salt:', error);
    // Fallback salt for testing
    return '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  }
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

      console.log('Requesting salt from Enoki for JWT...');
      console.log('Google Client ID:', GOOGLE_CLIENT_ID);

      // Try the official Mysten Labs salt endpoint first
      try {
        console.log('Trying Mysten Labs salt endpoint...');
        const saltResponse = await fetch('https://salt.api.mystenlabs.com/get_salt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: jwt }),
        });

        if (saltResponse.ok) {
          const saltData = await saltResponse.json();
          console.log('Salt retrieved successfully from Mysten Labs');
          return new Response(JSON.stringify({ 
            salt: saltData.user_salt || saltData.salt,
            source: 'mysten_labs'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await saltResponse.text();
          console.error('Mysten Labs salt request failed:', errorText);
          
          // Check if it's a client ID whitelist issue
          if (errorText.includes('Invalid Client ID') || errorText.includes('client_id')) {
            console.log('Client ID not whitelisted - using mock salt for testing');
            
            const mockSalt = generateMockSalt(jwt);
            
            return new Response(JSON.stringify({ 
              salt: mockSalt,
              source: 'mock',
              warning: `Client ID ${GOOGLE_CLIENT_ID} is not whitelisted with Enoki. Using mock salt for testing. Please contact Mysten Labs to whitelist your client ID for production use.`,
              whitelisting_info: {
                client_id: GOOGLE_CLIENT_ID,
                contact: 'Visit https://docs.enoki.mystenlabs.com/ for whitelisting process',
                production_note: 'This mock salt should NOT be used in production'
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.error('Error contacting Mysten Labs:', error);
      }

      // Try Enoki API as backup
      try {
        console.log('Trying Enoki API...');
        const enokiResponse = await fetch(`${ENOKI_API_BASE_URL}/v1/zklogin/salt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENOKI_API_KEY}`,
          },
          body: JSON.stringify({ token: jwt }),
        });

        if (enokiResponse.ok) {
          const enokiData = await enokiResponse.json();
          console.log('Salt retrieved successfully from Enoki');
          return new Response(JSON.stringify({ 
            salt: enokiData.salt || enokiData.user_salt,
            source: 'enoki'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await enokiResponse.text();
          console.error('Enoki salt request failed:', errorText);
        }
      } catch (error) {
        console.error('Error contacting Enoki:', error);
      }

      // If all else fails, use mock salt with clear warning
      console.log('All salt services failed - falling back to mock salt');
      const mockSalt = generateMockSalt(jwt);
      
      return new Response(JSON.stringify({ 
        salt: mockSalt,
        source: 'mock_fallback',
        error: 'All salt services failed',
        warning: `Using mock salt for testing only. Client ID ${GOOGLE_CLIENT_ID} needs to be whitelisted.`,
        whitelisting_info: {
          client_id: GOOGLE_CLIENT_ID,
          contact: 'Visit https://docs.enoki.mystenlabs.com/ for whitelisting process',
          production_note: 'This mock salt should NOT be used in production'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'proof') {
      // For proof generation, we'll skip Enoki for now since client ID is not whitelisted
      const proofRequest: ProofRequest = requestBody;
      
      return new Response(JSON.stringify({
        error: 'ZK proof generation temporarily disabled',
        reason: `Client ID ${GOOGLE_CLIENT_ID} is not whitelisted with Enoki`,
        mock_proof: true,
        whitelisting_info: {
          client_id: GOOGLE_CLIENT_ID,
          contact: 'Visit https://docs.enoki.mystenlabs.com/ for whitelisting process',
          note: 'Once whitelisted, proof generation will work normally'
        }
      }), {
        status: 200, // Return 200 but with error info
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
