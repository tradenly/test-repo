
-- Create table for tracking credit payment orders
CREATE TABLE public.credit_payment_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  blockchain TEXT NOT NULL CHECK (blockchain IN ('solana', 'ethereum', 'sui')),
  usdc_amount NUMERIC NOT NULL CHECK (usdc_amount >= 5),
  credit_amount INTEGER NOT NULL CHECK (credit_amount > 0),
  payment_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  transaction_hash TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create table for blockchain transaction monitoring
CREATE TABLE public.blockchain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_order_id UUID REFERENCES public.credit_payment_orders(id) ON DELETE CASCADE,
  blockchain TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  block_number BIGINT,
  confirmations INTEGER DEFAULT 0,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(blockchain, transaction_hash)
);

-- Add indexes for performance
CREATE INDEX idx_credit_payment_orders_user_id ON public.credit_payment_orders(user_id);
CREATE INDEX idx_credit_payment_orders_status ON public.credit_payment_orders(status);
CREATE INDEX idx_credit_payment_orders_created_at ON public.credit_payment_orders(created_at);
CREATE INDEX idx_blockchain_transactions_payment_order_id ON public.blockchain_transactions(payment_order_id);
CREATE INDEX idx_blockchain_transactions_blockchain ON public.blockchain_transactions(blockchain);
CREATE INDEX idx_blockchain_transactions_from_address ON public.blockchain_transactions(from_address);

-- Enable RLS
ALTER TABLE public.credit_payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_payment_orders
CREATE POLICY "Users can view their own payment orders" 
  ON public.credit_payment_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment orders" 
  ON public.credit_payment_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment orders" 
  ON public.credit_payment_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admin policies for payment orders
CREATE POLICY "Admins can view all payment orders" 
  ON public.credit_payment_orders 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all payment orders" 
  ON public.credit_payment_orders 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for blockchain_transactions (admin only)
CREATE POLICY "Admins can manage blockchain transactions" 
  ON public.blockchain_transactions 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_credit_payment_orders_updated_at
  BEFORE UPDATE ON public.credit_payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to process confirmed payments
CREATE OR REPLACE FUNCTION public.process_confirmed_payment(
  payment_order_id UUID,
  transaction_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_record public.credit_payment_orders%ROWTYPE;
  current_balance NUMERIC;
BEGIN
  -- Get the payment order
  SELECT * INTO order_record
  FROM public.credit_payment_orders
  WHERE id = payment_order_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the payment order status
  UPDATE public.credit_payment_orders
  SET 
    status = 'confirmed',
    transaction_hash = process_confirmed_payment.transaction_hash,
    confirmed_at = now(),
    updated_at = now()
  WHERE id = payment_order_id;
  
  -- Get current user balance
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = order_record.user_id;
  
  -- Update or insert user credits
  IF current_balance IS NOT NULL THEN
    UPDATE public.user_credits
    SET 
      balance = balance + order_record.credit_amount,
      updated_at = now()
    WHERE user_id = order_record.user_id;
  ELSE
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (order_record.user_id, order_record.credit_amount);
  END IF;
  
  -- Record the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    status,
    completed_at,
    reference_id
  ) VALUES (
    order_record.user_id,
    'purchase',
    order_record.credit_amount,
    'USDC payment confirmed - ' || order_record.blockchain || ' - ' || process_confirmed_payment.transaction_hash,
    'completed',
    now(),
    payment_order_id
  );
  
  RETURN TRUE;
END;
$$;
