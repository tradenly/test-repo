
-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_message_replies table
CREATE TABLE public.contact_message_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_message_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
CREATE POLICY "Users can view their own contact messages" 
  ON public.contact_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact messages" 
  ON public.contact_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact messages" 
  ON public.contact_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact messages" 
  ON public.contact_messages 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all contact messages" 
  ON public.contact_messages 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for contact_message_replies  
CREATE POLICY "Users can view replies to their own messages" 
  ON public.contact_message_replies 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.contact_messages 
    WHERE id = contact_message_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create replies to their own messages" 
  ON public.contact_message_replies 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contact_messages 
    WHERE id = contact_message_id AND user_id = auth.uid()
  ) AND sender_id = auth.uid());

CREATE POLICY "Admins can view all message replies" 
  ON public.contact_message_replies 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create replies to any message" 
  ON public.contact_message_replies 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND sender_id = auth.uid());

-- Add updated_at trigger for contact_messages
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification trigger for new contact messages
CREATE OR REPLACE FUNCTION public.create_contact_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify admins of new contact message
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    reference_id,
    reference_type
  )
  SELECT 
    ur.user_id,
    'New Contact Message',
    'New message from user: ' || NEW.subject,
    'contact_message',
    NEW.id,
    'contact_message'
  FROM public.user_roles ur
  WHERE ur.role = 'admin'::app_role;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER contact_message_notification_trigger
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_contact_message_notification();

-- Create notification trigger for admin replies
CREATE OR REPLACE FUNCTION public.create_contact_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create notification if the reply is from an admin
  IF NEW.is_admin_reply = true THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      reference_id,
      reference_type
    )
    SELECT 
      cm.user_id,
      'Admin Reply to Your Message',
      'An admin has replied to your message: ' || cm.subject,
      'contact_reply',
      cm.id,
      'contact_message'
    FROM public.contact_messages cm
    WHERE cm.id = NEW.contact_message_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER contact_reply_notification_trigger
  AFTER INSERT ON public.contact_message_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_contact_reply_notification();
