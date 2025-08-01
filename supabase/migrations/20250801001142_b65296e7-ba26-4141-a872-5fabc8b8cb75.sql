-- FIX 1: Ensure the OpenAI API key is properly accessible
-- Store it in system_settings for UI display but ensure edge functions can access it
UPDATE system_settings 
SET setting_value = '["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"]'::jsonb
WHERE setting_key = 'ai_openai_api_key';

-- FIX 2: Manually create the missing schedule for our test agent
INSERT INTO ai_agent_schedules (
  agent_signup_id,
  user_id,
  posting_frequency_hours,
  posting_probability,
  timeline_reply_probability,
  is_active,
  active_hours_start,
  active_hours_end,
  timezone,
  days_of_week,
  keywords,
  reply_keywords
)
SELECT 
  s.id,
  s.user_id,
  COALESCE(24 / GREATEST(s.posting_probability, 1), 24),
  s.posting_probability,
  s.timeline_reply_probability,
  true,
  '09:00:00',
  '17:00:00',
  'UTC',
  ARRAY[1, 2, 3, 4, 5],
  ARRAY['$PPEE', 'Tropical Fattys', 'crypto', 'gaming'],
  ARRAY['$PPEE', 'PPEE']
FROM ai_agent_signups s
WHERE s.agent_name = 'PPEE Bot Test Agent'
AND NOT EXISTS (
  SELECT 1 FROM ai_agent_schedules sch WHERE sch.agent_signup_id = s.id
);

-- FIX 3: Create a test Twitter account connection
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
  -- Using the actual Twitter tokens provided earlier
  '1649590691876548609-KBFQiahMPWyu1ejnyb7e0lG3iGQOUh',
  '0PebAxdRzMgIWC8lCPwC3wJfpvDRP2cu7kSiBWPap95tU',
  true
FROM ai_agent_signups s
WHERE s.agent_name = 'PPEE Bot Test Agent'
AND NOT EXISTS (
  SELECT 1 FROM user_twitter_accounts ta WHERE ta.user_id = s.user_id
)
LIMIT 1;

-- Verify the fixes
SELECT 
  'After Fix - Schedules' as check_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM ai_agent_schedules
UNION ALL
SELECT 
  'After Fix - Twitter Accounts' as check_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM user_twitter_accounts;