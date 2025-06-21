
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

type SocialPlatform = Database["public"]["Enums"]["social_platform"];

interface AddSocialForm {
  platform: SocialPlatform;
  username: string;
  profile_url: string;
}

export const useSocialOperations = (user: UnifiedUser) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialAccounts, isLoading } = useQuery({
    queryKey: ["userSocialAccounts", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addSocialMutation = useMutation({
    mutationFn: async (socialData: AddSocialForm) => {
      const { error } = await supabase
        .from("user_social_accounts")
        .insert({
          user_id: user.id,
          platform: socialData.platform,
          username: socialData.username,
          profile_url: socialData.profile_url,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSocialAccounts", user.id] });
      toast({
        title: "Social account added",
        description: "Your social account has been successfully linked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add social account. Please try again.",
        variant: "destructive",
      });
      console.error("Add social account error:", error);
    },
  });

  const deleteSocialMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from("user_social_accounts")
        .delete()
        .eq("id", accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSocialAccounts", user.id] });
      toast({
        title: "Social account removed",
        description: "Your social account has been successfully unlinked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove social account. Please try again.",
        variant: "destructive",
      });
      console.error("Delete social account error:", error);
    },
  });

  return {
    socialAccounts,
    isLoading,
    addSocialMutation,
    deleteSocialMutation,
  };
};

export type { AddSocialForm, SocialPlatform };
