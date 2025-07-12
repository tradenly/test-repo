
-- Update the credit_payment_orders table to allow cardano blockchain
ALTER TABLE public.credit_payment_orders 
DROP CONSTRAINT credit_payment_orders_blockchain_check;

-- Add new constraint that includes cardano
ALTER TABLE public.credit_payment_orders 
ADD CONSTRAINT credit_payment_orders_blockchain_check 
CHECK (blockchain IN ('solana', 'ethereum', 'sui', 'cardano'));
