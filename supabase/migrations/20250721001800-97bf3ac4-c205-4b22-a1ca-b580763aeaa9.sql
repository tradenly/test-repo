
-- First, let's add the foreign key relationship between contact_messages and profiles
-- This will enable PostgREST to properly join the tables

ALTER TABLE public.contact_messages 
ADD CONSTRAINT contact_messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_message_replies_contact_message_id ON public.contact_message_replies(contact_message_id);

-- Update the triggers to ensure they work with the new relationship
-- Make sure contact message notifications are created properly
CREATE OR REPLACE FUNCTION public.create_contact_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS contact_message_notification_trigger ON public.contact_messages;
CREATE TRIGGER contact_message_notification_trigger
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.create_contact_message_notification();

-- Update the contact reply notification function
CREATE OR REPLACE FUNCTION public.create_contact_reply_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Make sure the reply trigger exists
DROP TRIGGER IF EXISTS contact_reply_notification_trigger ON public.contact_message_replies;
CREATE TRIGGER contact_reply_notification_trigger
  AFTER INSERT ON public.contact_message_replies
  FOR EACH ROW EXECUTE FUNCTION public.create_contact_reply_notification();
