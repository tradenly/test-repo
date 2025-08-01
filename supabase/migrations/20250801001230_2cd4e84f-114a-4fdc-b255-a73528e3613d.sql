-- FIX: Use the correct column names and create the missing schedule
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
  s.id as agent_id, -- Use signup id as agent_id for now
  ta.id as twitter_account_id,
  GREATEST(60, (24 * 60) / GREATEST(s.posting_probability, 1)) as frequency_minutes, -- Convert to minutes
  9 as active_hours_start,
  17 as active_hours_end,
  ARRAY[1, 2, 3, 4, 5] as days_of_week,
  ARRAY['$PPEE', 'Tropical Fattys', 'crypto', 'gaming'] as keywords,
  ARRAY['$PPEE', 'PPEE'] as reply_keywords,
  true as is_active
FROM ai_agent_signups s
CROSS JOIN user_twitter_accounts ta
WHERE s.agent_name = 'PPEE Bot Test Agent'
AND s.status = 'approved'
AND s.active = true
AND ta.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM ai_agent_schedules sch WHERE sch.agent_signup_id = s.id
);

-- Also create a test Twitter account if it doesn't exist
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

-- Verify the complete setup
SELECT 
  'Complete System Check' as check_type,
  COUNT(DISTINCT s.id) as approved_signups,
  COUNT(DISTINCT sch.id) as active_schedules,
  COUNT(DISTINCT ta.id) as twitter_accounts
FROM ai_agent_signups s
LEFT JOIN ai_agent_schedules sch ON s.id = sch.agent_signup_id AND sch.is_active = true
LEFT JOIN user_twitter_accounts ta ON s.user_id = ta.user_id AND ta.is_active = true
WHERE s.status = 'approved' AND s.active = true;