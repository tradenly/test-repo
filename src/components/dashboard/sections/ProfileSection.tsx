
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface ProfileSectionProps {
  user: UnifiedUser;
}

interface ProfileForm {
  username: string;
  full_name: string;
  email: string;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    username: "",
    full_name: "",
    email: user.email || "",
  });

  // Only fetch profile if user has Supabase auth
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return null;
      }
      
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
    enabled: user.authType === 'supabase',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Omit<ProfileForm, "email">) => {
      if (user.authType !== 'supabase') {
        throw new Error('Profile updates only available for email users');
      }
      
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
      if (user.authType !== 'supabase' || !user.supabaseUser) {
        throw new Error('Email updates only available for email users');
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

  if (isLoading && user.authType === 'supabase') {
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

      {/* Account Info Card */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Authentication Type</Label>
            <p className="text-white mt-1 capitalize">
              {user.authType === 'zklogin' ? 'ZK Login (Wallet)' : 'Email/Password'}
            </p>
          </div>
          
          {user.email && (
            <div>
              <Label className="text-gray-300">Email</Label>
              <p className="text-white mt-1">{user.email}</p>
            </div>
          )}
          
          {user.walletAddress && (
            <div>
              <Label className="text-gray-300">Wallet Address</Label>
              <p className="text-white mt-1 font-mono text-sm break-all">{user.walletAddress}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Management - Only for Supabase users */}
      {user.authType === 'supabase' && (
        <>
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

          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Current Email</Label>
                <p className="text-white mt-1">{user.email}</p>
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
        </>
      )}

      {/* ZK Login users get simplified profile */}
      {user.authType === 'zklogin' && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">ZK Login Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              You're logged in with ZK Login using your wallet. Profile management for ZK Login users will be available soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
