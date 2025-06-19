
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Users } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type SocialPlatform = Database["public"]["Enums"]["social_platform"];

interface SocialSectionProps {
  user: User;
}

interface AddSocialForm {
  platform: SocialPlatform;
  username: string;
  profile_url: string;
}

export const SocialSection = ({ user }: SocialSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<AddSocialForm>({
    platform: "twitter",
    username: "",
    profile_url: "",
  });

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
      setShowAddForm(false);
      setFormData({
        platform: "twitter",
        username: "",
        profile_url: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return;
    }
    addSocialMutation.mutate(formData);
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "twitter":
        return "🐦";
      case "discord":
        return "💬";
      case "telegram":
        return "📱";
      case "instagram":
        return "📷";
      case "youtube":
        return "📺";
      default:
        return "🔗";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Social Accounts</h1>
          <p className="text-gray-400">Link your social media accounts</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add Social Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: SocialPlatform) =>
                    setFormData({ ...formData, platform: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="@username"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300">Profile URL (Optional)</Label>
                <Input
                  value={formData.profile_url}
                  onChange={(e) =>
                    setFormData({ ...formData, profile_url: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={addSocialMutation.isPending}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  {addSocialMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isLoading ? (
          <Card className="bg-gray-800/40 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-400 text-center">Loading social accounts...</p>
            </CardContent>
          </Card>
        ) : socialAccounts && socialAccounts.length > 0 ? (
          socialAccounts.map((account) => (
            <Card key={account.id} className="bg-gray-800/40 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium capitalize">
                        {account.platform}
                      </h3>
                      <p className="text-gray-400">{account.username}</p>
                      {account.profile_url && (
                        <a
                          href={account.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          View Profile
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSocialMutation.mutate(account.id)}
                    disabled={deleteSocialMutation.isPending}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800/40 border-gray-700">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No social accounts linked</h3>
              <p className="text-gray-400 mb-4">
                Connect your social media accounts to enhance your profile
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
