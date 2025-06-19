
-- Create enum for blockchain types
CREATE TYPE public.blockchain_type AS ENUM ('cardano', 'sui', 'ethereum', 'bitcoin');

-- Create enum for social platform types  
CREATE TYPE public.social_platform AS ENUM ('twitter', 'discord', 'telegram', 'instagram', 'youtube');

-- Create enum for stake status
CREATE TYPE public.stake_status AS ENUM ('active', 'pending', 'completed', 'cancelled');

-- Create user_wallets table for managing multiple wallet addresses
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blockchain blockchain_type NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, blockchain, wallet_address)
);

-- Create user_social_accounts table for linking social media
CREATE TABLE public.user_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform social_platform NOT NULL,
  username TEXT NOT NULL,
  profile_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, platform)
);

-- Create staking_pools table for available staking options
CREATE TABLE public.staking_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  token_symbol TEXT NOT NULL,
  apy_percentage DECIMAL(5,2) NOT NULL,
  min_stake_amount DECIMAL(20,8) DEFAULT 0,
  lock_period_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stakes table for tracking staking positions
CREATE TABLE public.user_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pool_id UUID REFERENCES public.staking_pools(id) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status stake_status DEFAULT 'pending',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staking_rewards table for tracking earned rewards
CREATE TABLE public.staking_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stake_id UUID REFERENCES public.user_stakes(id) ON DELETE CASCADE NOT NULL,
  reward_amount DECIMAL(20,8) NOT NULL,
  reward_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed BOOLEAN DEFAULT false,
  claim_date TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

-- Create nft_holdings table for tracking NFT ownership
CREATE TABLE public.nft_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nft_id TEXT NOT NULL,
  collection_name TEXT NOT NULL,
  token_name TEXT,
  image_url TEXT,
  blockchain blockchain_type NOT NULL,
  is_staked BOOLEAN DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, nft_id, blockchain)
);

-- Create token_balances table for tracking token holdings
CREATE TABLE public.token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_symbol TEXT NOT NULL,
  blockchain blockchain_type NOT NULL,
  balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, token_symbol, blockchain)
);

-- Insert default staking pools
INSERT INTO public.staking_pools (name, description, token_symbol, apy_percentage, min_stake_amount, lock_period_days) VALUES
('POOPEE Flexible Pool', 'Stake POOPEE tokens with no lock period', 'POOPEE', 12.50, 1000, 0),
('POOPEE 30-Day Lock', 'Higher rewards for 30-day commitment', 'POOPEE', 18.75, 5000, 30),
('POOPEE 90-Day Lock', 'Maximum rewards for 90-day commitment', 'POOPEE', 25.00, 10000, 90),
('NFT Staking Pool', 'Stake your POOPEE NFTs for exclusive rewards', 'NFT', 15.00, 1, 0);

-- Enable RLS on all new tables
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_wallets
CREATE POLICY "Users can view their own wallets" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallets" ON public.user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallets" ON public.user_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallets" ON public.user_wallets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_social_accounts
CREATE POLICY "Users can view their own social accounts" ON public.user_social_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own social accounts" ON public.user_social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own social accounts" ON public.user_social_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own social accounts" ON public.user_social_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for staking_pools (public read access)
CREATE POLICY "Anyone can view active staking pools" ON public.staking_pools FOR SELECT USING (is_active = true);

-- RLS Policies for user_stakes
CREATE POLICY "Users can view their own stakes" ON public.user_stakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stakes" ON public.user_stakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stakes" ON public.user_stakes FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for staking_rewards
CREATE POLICY "Users can view their own rewards" ON public.staking_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rewards" ON public.staking_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rewards" ON public.staking_rewards FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for nft_holdings
CREATE POLICY "Users can view their own NFTs" ON public.nft_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own NFTs" ON public.nft_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own NFTs" ON public.nft_holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own NFTs" ON public.nft_holdings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for token_balances
CREATE POLICY "Users can view their own token balances" ON public.token_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own token balances" ON public.token_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own token balances" ON public.token_balances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own token balances" ON public.token_balances FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_stakes_updated_at BEFORE UPDATE ON public.user_stakes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
