
-- Create table for tool requests
CREATE TABLE public.tool_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for messages in the conversation
CREATE TABLE public.tool_request_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_request_id UUID REFERENCES public.tool_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  is_admin_message BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to both tables
ALTER TABLE public.tool_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_request_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for tool_requests
CREATE POLICY "Users can create their own tool requests" 
  ON public.tool_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tool requests" 
  ON public.tool_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool requests" 
  ON public.tool_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tool requests" 
  ON public.tool_requests 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all tool requests" 
  ON public.tool_requests 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for tool_request_messages
CREATE POLICY "Users can create messages for their own requests" 
  ON public.tool_request_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tool_requests 
      WHERE id = tool_request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages for their own requests" 
  ON public.tool_request_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tool_requests 
      WHERE id = tool_request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create messages for any request" 
  ON public.tool_request_messages 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all messages" 
  ON public.tool_request_messages 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_tool_requests_updated_at
  BEFORE UPDATE ON public.tool_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
