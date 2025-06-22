
-- Create the credit_cashout_requests table
CREATE TABLE public.credit_cashout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_credits NUMERIC NOT NULL,
  amount_crypto NUMERIC NOT NULL,
  previous_balance NUMERIC NOT NULL,
  new_balance NUMERIC NOT NULL,
  selected_wallet_id UUID NOT NULL REFERENCES public.user_wallets(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  transaction_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.credit_cashout_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own cashout requests
CREATE POLICY "Users can view their own cashout requests" 
  ON public.credit_cashout_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own cashout requests
CREATE POLICY "Users can create their own cashout requests" 
  ON public.credit_cashout_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all cashout requests
CREATE POLICY "Admins can view all cashout requests" 
  ON public.credit_cashout_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update cashout requests
CREATE POLICY "Admins can update cashout requests" 
  ON public.credit_cashout_requests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_credit_cashout_requests_updated_at 
  BEFORE UPDATE ON public.credit_cashout_requests 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_credit_cashout_requests_user_id ON public.credit_cashout_requests(user_id);
CREATE INDEX idx_credit_cashout_requests_status ON public.credit_cashout_requests(status);
CREATE INDEX idx_credit_cashout_requests_requested_at ON public.credit_cashout_requests(requested_at DESC);
