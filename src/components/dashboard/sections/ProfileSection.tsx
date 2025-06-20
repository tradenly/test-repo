import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Copy } from "lucide-react";
import { useHybridAuth } from "@/hooks/useHybridAuth";

interface ProfileSectionProps {
  user: User;
}

interface ProfileForm {
  username: string;
  full_name: string;
  email: string;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { zkLoginAddress } = useHybridAuth();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    username: "",
    full_name: "",
    email: user?.email || "",
  });

  const isZkLoginUser = !!zkLoginAddress;
  const zkLoginMetadata = user?.user_metadata;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    });
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
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
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Omit<ProfileForm, "email">) => {
      if (!user?.id) throw new Error("No user ID");
      
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
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
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
    if (newEmail && newEmail !== user?.email) {
      setIsUpdatingEmail(true);
      updateEmailMutation.mutate(newEmail);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      {/* ZK Login Info Card */}
      {isZkLoginUser && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              ZK Login Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-blue-600 text-white">
                SUI Wallet Connected
              </Badge>
            </div>
            
            <div>
              <Label className="text-gray-300">SUI Address</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={zkLoginAddress}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(zkLoginAddress)}
                  className="border-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {zkLoginMetadata?.zklogin_max_epoch && (
              <div>
                <Label className="text-gray-300">Max Epoch</Label>
                <Input
                  value={zkLoginMetadata.zklogin_max_epoch}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personal Information Card */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label className="text-gray-300">Username</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Choose a username"
              />
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-gray-700 hover:bg-gray-600"
            >
              {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Settings Card */}
      {!isZkLoginUser && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Email Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Current Email</Label>
              <p className="text-white mt-1">{user?.email}</p>
            </div>
            
            <div>
              <Label className="text-gray-300">New Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter new email address"
              />
            </div>

            <Button
              onClick={handleEmailUpdate}
              disabled={isUpdatingEmail || updateEmailMutation.isPending}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              {isUpdatingEmail || updateEmailMutation.isPending ? "Updating..." : "Update Email"}
            </Button>
            
            <p className="text-sm text-gray-400">
              You'll need to confirm the new email address before the change takes effect.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
