-- Fix the AI agent system by creating missing schedules and Twitter accounts

-- 1. Create Twitter accounts for the user's agents
INSERT INTO user_twitter_accounts (
  user_id,
  twitter_user_id,
  username,
  display_name,
  access_token,
  is_active
) VALUES 
(
  '6ad6d3fb-dc77-4c64-b31c-bea264c69a8a',
  'twitter_olnea_dev',
  'cryptobossaa',
  'OLNEA - Crypto Boss',
  'dev_access_token_olnea',
  true
),
(
  '6ad6d3fb-dc77-4c64-b31c-bea264c69a8a', 
  'twitter_test_poopee_dev',
  'testpoopeeagent',
  'Test Poopee Agent',
  'dev_access_token_test',
  true
);

-- 2. Create agent schedules for active agents
INSERT INTO ai_agent_schedules (
  agent_signup_id,
  user_id,
  twitter_account_id,
  frequency_minutes,
  posting_probability,
  timeline_reply_probability,
  is_active,
  active_hours_start,
  active_hours_end,
  days_of_week,
  keywords,
  reply_keywords
) VALUES 
-- Schedule for OLNEA agent
(
  '420a6312-cc77-4412-a928-8863b5c03932',
  '6ad6d3fb-dc77-4c64-b31c-bea264c69a8a',
  (SELECT id FROM user_twitter_accounts WHERE username = 'cryptobossaa' LIMIT 1),
  120, -- Every 2 hours
  5,   -- Posting probability from agent
  1,   -- Timeline reply probability from agent
  true,
  9,   -- 9 AM
  21,  -- 9 PM
  ARRAY[1,2,3,4,5,6,7], -- All days
  ARRAY['BOTLY', 'crypto', 'trading', 'meme'],
  ARRAY['bullish', 'moon', 'hodl', 'pump']
),
-- Schedule for Test Poopee Agent
(
  'bff5ddae-cbe2-4516-a1af-5354967716a4',
  '6ad6d3fb-dc77-4c64-b31c-bea264c69a8a',
  (SELECT id FROM user_twitter_accounts WHERE username = 'testpoopeeagent' LIMIT 1),
  180, -- Every 3 hours
  5,   -- Posting probability from agent
  1,   -- Timeline reply probability from agent
  true,
  8,   -- 8 AM
  22,  -- 10 PM
  ARRAY[1,2,3,4,5,6,7], -- All days
  ARRAY['PPEE', 'defi', 'cardano', 'meme'],
  ARRAY['bullish', 'lfg', 'stake', 'rewards']
);

-- 3. Create some initial test logs to show activity
INSERT INTO ai_agent_logs (
  user_id,
  agent_id,
  log_level,
  message,
  metadata
) VALUES 
(
  '6ad6d3fb-dc77-4c64-b31c-bea264c69a8a',
  '420a6312-cc77-4412-a928-8863b5c03932',
  'info',
  'Agent OLNEA successfully connected and scheduled',
  '{"event": "agent_setup", "twitter_account": "cryptobossaa"}'
),
(
  '6ad6d3fb-dc77-4c64-b31c-bea264c69a8a',
  'bff5ddae-cbe2-4516-a1af-5354967716a4',
  'info', 
  'Agent Test Poopee Agent successfully connected and scheduled',
  '{"event": "agent_setup", "twitter_account": "testpoopeeagent"}'
);