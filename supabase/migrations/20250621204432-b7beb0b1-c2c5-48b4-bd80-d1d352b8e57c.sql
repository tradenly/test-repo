
-- Create table to track wallet verifications and prevent duplicate claims
CREATE TABLE public.wallet_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  blockchain blockchain_type NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('nft', 'memecoin', 'both')),
  nft_count INTEGER DEFAULT 0,
  memecoin_count NUMERIC DEFAULT 0,
  credits_awarded NUMERIC NOT NULL DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent duplicate verifications for same wallet and type
  UNIQUE(user_id, wallet_address, verification_type)
);

-- Enable RLS for wallet_verifications
ALTER TABLE public.wallet_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallet_verifications
CREATE POLICY "Users can view their own verifications" 
  ON public.wallet_verifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications" 
  ON public.wallet_verifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update credit_transactions to support new verification transaction types
-- The existing transaction_type column should already support these as it's text type
-- But let's ensure the valid types are documented in a comment
COMMENT ON COLUMN public.credit_transactions.transaction_type IS 
'Valid types: purchase, earned, spent, cashout, bonus, refund, nft_verification, memecoin_verification';
