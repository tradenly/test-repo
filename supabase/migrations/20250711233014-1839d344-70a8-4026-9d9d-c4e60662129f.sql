
-- Update the blockchain_type enum to replace bitcoin with solana
ALTER TYPE blockchain_type RENAME TO blockchain_type_old;

CREATE TYPE blockchain_type AS ENUM ('cardano', 'sui', 'ethereum', 'solana');

-- Update all tables that use this enum type
ALTER TABLE user_wallets 
  ALTER COLUMN blockchain TYPE blockchain_type 
  USING blockchain::text::blockchain_type;

ALTER TABLE token_balances 
  ALTER COLUMN blockchain TYPE blockchain_type 
  USING blockchain::text::blockchain_type;

ALTER TABLE nft_holdings 
  ALTER COLUMN blockchain TYPE blockchain_type 
  USING blockchain::text::blockchain_type;

ALTER TABLE wallet_verifications 
  ALTER COLUMN blockchain TYPE blockchain_type 
  USING blockchain::text::blockchain_type;

-- Drop the old enum type
DROP TYPE blockchain_type_old;
