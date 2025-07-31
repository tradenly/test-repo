-- Phase 2: Fix Database Relationships & Data Flow
-- Add foreign key relationship between ai_agent_schedules and ai_agent_signups
ALTER TABLE ai_agent_schedules 
ADD COLUMN IF NOT EXISTS agent_signup_id UUID REFERENCES ai_agent_signups(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_agent_schedules_agent_signup_id ON ai_agent_schedules(agent_signup_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_schedules_active ON ai_agent_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_status ON ai_agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_created_at ON ai_agent_logs(created_at);

-- Function to create default schedule when agent is approved
CREATE OR REPLACE FUNCTION create_agent_schedule_from_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create schedule if status changed to 'approved' and agent is active
  IF NEW.status = 'approved' AND NEW.active = true AND OLD.status != 'approved' THEN
    INSERT INTO ai_agent_schedules (
      agent_signup_id,
      user_id,
      posting_frequency_hours,
      posting_probability,
      timeline_reply_probability,
      is_active,
      active_hours_start,
      active_hours_end,
      timezone
    ) VALUES (
      NEW.id,
      NEW.user_id,
      COALESCE(24 / GREATEST(NEW.posting_probability, 1), 24), -- Convert probability to frequency
      NEW.posting_probability,
      NEW.timeline_reply_probability,
      true,
      '09:00:00',
      '17:00:00',
      'UTC'
    )
    ON CONFLICT (agent_signup_id) DO UPDATE SET
      is_active = EXCLUDED.is_active,
      posting_probability = EXCLUDED.posting_probability,
      timeline_reply_probability = EXCLUDED.timeline_reply_probability;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic schedule creation
DROP TRIGGER IF EXISTS create_schedule_on_approval ON ai_agent_signups;
CREATE TRIGGER create_schedule_on_approval
  AFTER UPDATE ON ai_agent_signups
  FOR EACH ROW
  EXECUTE FUNCTION create_agent_schedule_from_signup();