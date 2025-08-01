-- Create Twitter account first, then schedule
-- Step 1: Create Twitter account for the test agent user
INSERT INTO user_twitter_accounts (
  user_id,
  twitter_user_id,
  username,
  display_name,
  access_token,
  refresh_token,
  is_active
)
SELECT 
  s.user_id,
  'test_user_id_123',
  'test_ppee_bot',
  'PPEE Test Bot',
  '1649590691876548609-KBFQiahMPWyu1ejnyb7e0lG3iGQOUh',
  '0PebAxdRzMgIWC8lCPwC3wJfpvDRP2cu7kSiBWPap95tU',
  true
FROM ai_agent_signups s
WHERE s.agent_name = 'PPEE Bot Test Agent'
AND NOT EXISTS (
  SELECT 1 FROM user_twitter_accounts ta WHERE ta.user_id = s.user_id
)
LIMIT 1;

-- Step 2: Now create the schedule using the Twitter account
INSERT INTO ai_agent_schedules (
  agent_signup_id,
  user_id,
  agent_id,
  twitter_account_id,
  frequency_minutes,
  active_hours_start,
  active_hours_end,
  days_of_week,
  keywords,
  reply_keywords,
  is_active
)
SELECT 
  s.id as agent_signup_id,
  s.user_id,
  s.id as agent_id,
  ta.id as twitter_account_id,
  144 as frequency_minutes, -- Every 2.4 hours (10% of day)
  9 as active_hours_start,
  17 as active_hours_end,
  ARRAY[1, 2, 3, 4, 5] as days_of_week,
  ARRAY['$PPEE', 'Tropical Fattys', 'crypto', 'gaming'] as keywords,
  ARRAY['$PPEE', 'PPEE'] as reply_keywords,
  true as is_active
FROM ai_agent_signups s
JOIN user_twitter_accounts ta ON s.user_id = ta.user_id
WHERE s.agent_name = 'PPEE Bot Test Agent'
AND s.status = 'approved'
AND s.active = true
AND ta.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM ai_agent_schedules sch WHERE sch.agent_signup_id = s.id
);

-- Final verification
SELECT 
  s.agent_name,
  s.status,
  s.active as signup_active,
  ta.username as twitter_username,
  ta.is_active as twitter_active,
  sch.frequency_minutes,
  sch.is_active as schedule_active
FROM ai_agent_signups s
LEFT JOIN user_twitter_accounts ta ON s.user_id = ta.user_id
LEFT JOIN ai_agent_schedules sch ON s.id = sch.agent_signup_id
WHERE s.agent_name = 'PPEE Bot Test Agent';