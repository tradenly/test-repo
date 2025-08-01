-- Create sample test agent for testing the system
-- First, ensure we have at least one approved agent signup to work with

INSERT INTO ai_agent_signups (
  id,
  user_id,
  agent_name,
  email,
  platform,
  cardano_wallet_address,
  bio,
  personality,
  response_style,
  tone,
  posting_probability,
  timeline_reply_probability,
  status,
  active,
  verified,
  ppee_tokens_verified
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Use the first available user
  'PPEE Bot Test Agent',
  'test@example.com',
  'Twitter',
  'addr1q9v2k2q8qv2k2q8qv2k2q8qv2k2q8qv2k2q8qv2k2q8qv2k2q8qv2k2q8qv2k2q8',
  'A test AI agent for the PPEE ecosystem focused on crypto gaming and community engagement.',
  'Enthusiastic, friendly, and knowledgeable about crypto gaming. Always excited about $PPEE and Tropical Fattys.',
  'Casual but informative',
  'Upbeat and engaging',
  10, -- 10% probability of posting
  5,  -- 5% probability of replying
  'approved',
  true,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Get system status for debugging
SELECT 
  'ai_agent_signups' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE active = true) as active_count
FROM ai_agent_signups
UNION ALL
SELECT 
  'ai_agent_schedules' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as approved_count,
  0 as active_count
FROM ai_agent_schedules
UNION ALL
SELECT 
  'ai_agent_tasks' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'pending') as approved_count,
  COUNT(*) FILTER (WHERE status = 'completed') as active_count
FROM ai_agent_tasks;