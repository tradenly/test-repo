
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useToolRequests = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitToolRequest = async (subject: string, message: string) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('tool_requests')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your tool request has been submitted. We'll get back to you soon!",
      });

      return true;
    } catch (error) {
      console.error('Error submitting tool request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitToolRequest,
    submitting
  };
};
