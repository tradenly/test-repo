
-- Give ccatalyst81@gmail.com 100 credits for testing
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 100
FROM auth.users 
WHERE email = 'ccatalyst81@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  balance = user_credits.balance + 100,
  updated_at = now();

-- Also add a transaction record for this credit grant
INSERT INTO public.credit_transactions (user_id, transaction_type, amount, description, status, completed_at)
SELECT id, 'bonus', 100, 'Testing credits granted by admin', 'completed', now()
FROM auth.users 
WHERE email = 'ccatalyst81@gmail.com';
