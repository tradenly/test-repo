
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface ProfileForm {
  username: string;
  full_name: string;
  email: string;
}

export const useProfileData = (user: UnifiedUser) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    username: "",
    full_name: "",
    email: user.email || "",
  });

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        return null;
      }
      
      if (data) {
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
          email: user.email || "",
        });
      }
      
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Omit<ProfileForm, "email">) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: data.username,
          full_name: data.full_name,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user.supabaseUser) {
        throw new Error('Email updates require Supabase authentication');
      }
      
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Email update initiated",
        description: "Please check your new email for confirmation.",
      });
      setIsUpdatingEmail(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
      console.error("Email update error:", error);
      setIsUpdatingEmail(false);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      username: formData.username,
      full_name: formData.full_name,
    });
  };

  const handleEmailUpdate = () => {
    const newEmail = formData.email;
    if (newEmail && newEmail !== user.email) {
      setIsUpdatingEmail(true);
      updateEmailMutation.mutate(newEmail);
    }
  };

  return {
    profile,
    isLoading,
    formData,
    setFormData,
    handleProfileSubmit,
    handleEmailUpdate,
    isUpdatingEmail,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingEmailMutation: updateEmailMutation.isPending,
  };
};
