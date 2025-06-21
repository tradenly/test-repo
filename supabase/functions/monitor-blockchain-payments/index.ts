
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentOrder {
  id: string;
  user_id: string;
  wallet_address: string;
  blockchain: string;
  usdc_amount: number;
  credit_amount: number;
  payment_address: string;
  status: string;
  created_at: string;
  expires_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting blockchain payment monitoring...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending payment orders that haven't expired
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('credit_payment_orders')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (ordersError) {
      console.error('❌ Error fetching pending orders:', ordersError);
      throw ordersError;
    }

    console.log(`📋 Found ${pendingOrders?.length || 0} pending payment orders`);

    if (!pendingOrders || pendingOrders.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending orders to process',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;

    // Process orders by blockchain
    for (const order of pendingOrders as PaymentOrder[]) {
      try {
        console.log(`🔍 Checking order ${order.id} on ${order.blockchain}`);
        
        let transactionFound = false;
        let transactionHash = '';
        let blockNumber = 0;
        let actualAmount = 0;

        if (order.blockchain === 'solana') {
          const result = await checkSolanaTransaction(order);
          transactionFound = result.found;
          transactionHash = result.hash;
          blockNumber = result.slot;
          actualAmount = result.amount;
        } else if (order.blockchain === 'ethereum') {
          const result = await checkEthereumTransaction(order);
          transactionFound = result.found;
          transactionHash = result.hash;
          blockNumber = result.blockNumber;
          actualAmount = result.amount;
        } else if (order.blockchain === 'sui') {
          const result = await checkSuiTransaction(order);
          transactionFound = result.found;
          transactionHash = result.hash;
          blockNumber = result.checkpoint;
          actualAmount = result.amount;
        }

        if (transactionFound && actualAmount >= order.usdc_amount) {
          console.log(`✅ Transaction found for order ${order.id}: ${transactionHash}`);
          
          // Record the blockchain transaction
          const { error: txError } = await supabase
            .from('blockchain_transactions')
            .insert({
              payment_order_id: order.id,
              blockchain: order.blockchain,
              transaction_hash: transactionHash,
              from_address: order.wallet_address,
              to_address: order.payment_address,
              amount: actualAmount,
              block_number: blockNumber,
              confirmations: 1,
              confirmed_at: new Date().toISOString()
            });

          if (txError) {
            console.error('❌ Error recording transaction:', txError);
            continue;
          }

          // Process the confirmed payment
          const { data: processed, error: processError } = await supabase
            .rpc('process_confirmed_payment', {
              payment_order_id: order.id,
              transaction_hash: transactionHash
            });

          if (processError) {
            console.error('❌ Error processing payment:', processError);
            continue;
          }

          if (processed) {
            console.log(`💰 Credits automatically assigned for order ${order.id}`);
            processedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error);
      }
    }

    // Expire old orders
    const { error: expireError } = await supabase
      .from('credit_payment_orders')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (expireError) {
      console.error('❌ Error expiring old orders:', expireError);
    }

    console.log(`✅ Monitoring complete. Processed ${processedCount} payments.`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedCount,
      total_pending: pendingOrders.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in blockchain monitoring:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkSolanaTransaction(order: PaymentOrder) {
  try {
    // Mock implementation - in production you'd use Solana RPC
    console.log(`🔍 Checking Solana for payment to ${order.payment_address} from ${order.wallet_address}`);
    
    // For now, return mock data - replace with actual Solana RPC calls
    const mockFound = Math.random() < 0.1; // 10% chance for demo
    
    return {
      found: mockFound,
      hash: mockFound ? `solana_tx_${Date.now()}` : '',
      slot: mockFound ? Math.floor(Math.random() * 1000000) : 0,
      amount: mockFound ? order.usdc_amount : 0
    };
  } catch (error) {
    console.error('❌ Solana check error:', error);
    return { found: false, hash: '', slot: 0, amount: 0 };
  }
}

async function checkEthereumTransaction(order: PaymentOrder) {
  try {
    // Mock implementation - in production you'd use Ethereum RPC or Alchemy
    console.log(`🔍 Checking Ethereum for payment to ${order.payment_address} from ${order.wallet_address}`);
    
    const mockFound = Math.random() < 0.1; // 10% chance for demo
    
    return {
      found: mockFound,
      hash: mockFound ? `eth_tx_${Date.now()}` : '',
      blockNumber: mockFound ? Math.floor(Math.random() * 1000000) : 0,
      amount: mockFound ? order.usdc_amount : 0
    };
  } catch (error) {
    console.error('❌ Ethereum check error:', error);
    return { found: false, hash: '', blockNumber: 0, amount: 0 };
  }
}

async function checkSuiTransaction(order: PaymentOrder) {
  try {
    // Mock implementation - in production you'd use SUI RPC
    console.log(`🔍 Checking SUI for payment to ${order.payment_address} from ${order.wallet_address}`);
    
    const mockFound = Math.random() < 0.1; // 10% chance for demo
    
    return {
      found: mockFound,
      hash: mockFound ? `sui_tx_${Date.now()}` : '',
      checkpoint: mockFound ? Math.floor(Math.random() * 1000000) : 0,
      amount: mockFound ? order.usdc_amount : 0
    };
  } catch (error) {
    console.error('❌ SUI check error:', error);
    return { found: false, hash: '', checkpoint: 0, amount: 0 };
  }
}
