
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reference_id UUID NULL, -- Can reference tool_requests, etc.
  reference_type TEXT NULL -- 'tool_request', etc.
);

-- Add Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications for any user" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to create notification when admin replies to tool request
CREATE OR REPLACE FUNCTION public.create_tool_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the message is from an admin
  IF NEW.is_admin_message = true THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      reference_id,
      reference_type
    )
    SELECT 
      tr.user_id,
      'Admin Reply to Your Tool Request',
      'An admin has replied to your tool request: ' || tr.subject,
      'tool_request_reply',
      tr.id,
      'tool_request'
    FROM public.tool_requests tr
    WHERE tr.id = NEW.tool_request_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tool request notifications  
CREATE TRIGGER create_tool_request_notification_trigger
  AFTER INSERT ON public.tool_request_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_tool_request_notification();

-- Add updated_at trigger for notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
